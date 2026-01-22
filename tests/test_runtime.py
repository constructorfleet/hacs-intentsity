from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import pytest
from homeassistant.core import HomeAssistant

from custom_components.intentsity import chat_log_callback, db
from homeassistant.components.conversation.chat_log import (
    DATA_CHAT_LOGS,
    AssistantContent,
    UserContent,
    async_get_chat_log,
)
from homeassistant.components.conversation.const import ChatLogEventType
from homeassistant.helpers.chat_session import async_get_chat_session


def _setup_fresh_db(hass: HomeAssistant) -> Path:
    db_path = db.get_db_path(hass)
    db_path.unlink(missing_ok=True)
    db.dispose_client(hass)
    db.init_db(hass)
    return db_path


async def _wait_for(condition: Callable[[], bool], timeout: float = 1.0) -> None:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not condition():
        if loop.time() >= deadline:
            break
        await asyncio.sleep(0.01)


@pytest.mark.asyncio
async def test_chat_log_subscription_persists_messages(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    # Simulate a chat log entry
    # Note: Using the event names we found in HASS

    # Let's test the DB logic directly through the helper
    from custom_components.intentsity.models import Chat, ChatMessage

    chat_id = db.insert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-1",
            messages=[
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="user",
                    text="Hello",
                )
            ],
        ),
    )

    db.insert_chat_message(
        hass,
        chat_id,
        ChatMessage(
            timestamp=datetime.now(timezone.utc),
            sender="assistant",
            text="Hi there",
        ),
    )

    chats = db.fetch_recent_chats(hass, 10)
    assert len(chats) == 1
    assert chats[0].conversation_id == "conv-1"
    assert len(chats[0].messages) == 2
    assert chats[0].messages[0].text == "Hello"
    assert chats[0].messages[1].text == "Hi there"


@pytest.mark.asyncio
async def test_corrected_chat_persists_with_reordered_messages(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import Chat, ChatMessage, CorrectedChatMessage

    chat_id = db.insert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-2",
            messages=[
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="user",
                    text="First",
                ),
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="assistant",
                    text="Second",
                ),
            ],
        ),
    )

    original = db.fetch_recent_chats(hass, 1)[0]
    original_message_ids = [msg.id for msg in original.messages]

    corrected_messages = [
        CorrectedChatMessage(
            original_message_id=original_message_ids[1],
            timestamp=datetime.now(timezone.utc),
            sender="assistant",
            text="Second (edited)",
            data={"tool_calls": ["fixed"]},
        ),
        CorrectedChatMessage(
            original_message_id=original_message_ids[0],
            timestamp=datetime.now(timezone.utc),
            sender="user",
            text="First",
        ),
    ]

    db.upsert_corrected_chat(hass, chat_id, corrected_messages)

    chats = db.fetch_recent_chats(hass, 1)
    assert chats[0].corrected is not None
    assert chats[0].corrected.original_chat_id == chat_id
    assert [msg.original_message_id for msg in chats[0].corrected.messages] == [
        original_message_ids[1],
        original_message_ids[0],
    ]
    assert chats[0].corrected.messages[0].text == "Second (edited)"


@pytest.mark.asyncio
async def test_replace_chat_messages_replaces_rows(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import Chat, ChatMessage

    timestamp = datetime.now(timezone.utc)
    chat_id = db.insert_chat(
        hass,
        Chat(
            created_at=timestamp,
            conversation_id="conv-3",
            messages=[
                ChatMessage(
                    timestamp=timestamp,
                    sender="assistant",
                    text="Original",
                )
            ],
        ),
    )

    replacement = [
        ChatMessage(
            timestamp=timestamp,
            sender="assistant",
            text="Updated",
            data={"note": "corrected"},
        ),
        ChatMessage(
            timestamp=timestamp,
            sender="user",
            text="Follow-up",
        ),
    ]
    db.replace_chat_messages(hass, chat_id, replacement)

    chats = db.fetch_recent_chats(hass, 1)
    assert len(chats[0].messages) == 2
    assert chats[0].messages[0].text == "Updated"
    assert chats[0].messages[0].data["note"] == "corrected"


@pytest.mark.asyncio
async def test_chat_log_callback_snapshots_unknown_conversation(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    conversation_id = "conv-snapshot"
    with (
        async_get_chat_session(hass, conversation_id) as session,
        async_get_chat_log(hass, session) as chat_log,
    ):
        chat_log.async_add_user_content(UserContent(content="Hello"))
        chat_log.async_add_assistant_content_without_tools(
            AssistantContent(agent_id="test-agent", content="Hi")
        )

    chat_log_callback(
        hass,
        conversation_id,
        ChatLogEventType.CONTENT_ADDED,
        {"content": {"role": "assistant", "content": "Hi"}},
    )

    def _has_snapshot() -> bool:
        chats = db.fetch_recent_chats(hass, 1)
        return len(chats) == 1 and len(chats[0].messages) >= 2

    await _wait_for(_has_snapshot)
    chats = db.fetch_recent_chats(hass, 1)
    assert chats[0].conversation_id == conversation_id
    texts = [message.text for message in chats[0].messages]
    assert "Hello" in texts
    assert "Hi" in texts


@pytest.mark.asyncio
async def test_delta_listener_snapshots_complete_message(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    conversation_id = "conv-delta"
    with (
        async_get_chat_session(hass, conversation_id) as session,
        async_get_chat_log(hass, session) as chat_log,
    ):
        chat_log.async_add_user_content(UserContent(content="Hello"))

    chat_log_callback(
        hass,
        conversation_id,
        ChatLogEventType.CREATED,
        {"chat_log": chat_log.as_dict()},
    )

    await _wait_for(lambda: len(db.fetch_recent_chats(hass, 1)) == 1)

    chat_logs = hass.data.get(DATA_CHAT_LOGS, {})
    active_log = chat_logs[conversation_id]
    active_log.async_add_assistant_content_without_tools(
        AssistantContent(agent_id="test-agent", content="Streaming done")
    )

    assert active_log.delta_listener is not None
    active_log.delta_listener(active_log, {"role": "assistant", "content": "Streaming done"})

    def _has_update() -> bool:
        chats = db.fetch_recent_chats(hass, 1)
        if not chats:
            return False
        return any(message.text == "Streaming done" for message in chats[0].messages)

    await _wait_for(_has_update, timeout=1.0)
