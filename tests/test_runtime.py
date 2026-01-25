from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import pytest
from homeassistant.core import HomeAssistant

from custom_components.intentsity import db
from homeassistant.components.assist_pipeline.pipeline import (
    Pipeline,
    PipelineRunDebug,
)


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

    from custom_components.intentsity.models import Chat, ChatMessage

    run_timestamp = datetime.now(timezone.utc)
    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-1",
            pipeline_run_id="run-1",
            run_timestamp=run_timestamp,
            messages=[
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="user",
                    text="Hello",
                )
            ],
        ),
    )

    db.upsert_chat_message(
        hass,
        conversation_id,
        pipeline_run_id,
        ChatMessage(
            timestamp=datetime.now(timezone.utc),
            sender="assistant",
            text="Hi there",
        ),
    )

    chats = db.fetch_recent_chats(hass, 10)
    assert len(chats) == 1
    assert chats[0].conversation_id == "conv-1"
    assert chats[0].pipeline_run_id == "run-1"
    assert chats[0].run_timestamp == run_timestamp
    assert len(chats[0].messages) == 2
    assert chats[0].messages[0].text == "Hello"
    assert chats[0].messages[1].text == "Hi there"


@pytest.mark.asyncio
async def test_fetch_recent_chats_orders_messages_by_timestamp(
    hass: HomeAssistant,
) -> None:
    _setup_fresh_db(hass)

    from custom_components.intentsity.models import Chat, ChatMessage

    base_time = datetime(2026, 1, 1, tzinfo=timezone.utc)
    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=base_time,
            conversation_id="conv-order",
            pipeline_run_id="run-order",
            run_timestamp=base_time,
            messages=[
                ChatMessage(
                    timestamp=base_time.replace(minute=1),
                    sender="assistant",
                    text="Second",
                ),
                ChatMessage(
                    timestamp=base_time.replace(minute=0),
                    sender="user",
                    text="First",
                ),
            ],
        ),
    )

    chats = db.fetch_recent_chats(hass, 1)
    assert chats[0].conversation_id == conversation_id
    assert chats[0].pipeline_run_id == pipeline_run_id
    assert [msg.text for msg in chats[0].messages] == ["First", "Second"]


@pytest.mark.asyncio
async def test_corrected_chat_persists_with_reordered_messages(
    hass: HomeAssistant,
) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import (
        Chat,
        ChatMessage,
        CorrectedChatMessage,
    )

    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-2",
            pipeline_run_id="run-2",
            run_timestamp=datetime.now(timezone.utc),
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

    db.upsert_corrected_chat(
        hass, conversation_id, pipeline_run_id, corrected_messages
    )

    chats = db.fetch_recent_chats(hass, 1)
    assert chats[0].corrected is not None
    assert chats[0].corrected.original_conversation_id == conversation_id
    assert chats[0].corrected.original_pipeline_run_id == pipeline_run_id
    assert chats[0].corrected.conversation_id == conversation_id
    assert chats[0].corrected.pipeline_run_id == pipeline_run_id
    assert [msg.original_message_id for msg in chats[0].corrected.messages] == [
        original_message_ids[1],
        original_message_ids[0],
    ]
    assert chats[0].corrected.messages[0].text == "Second (edited)"


@pytest.mark.asyncio
async def test_corrected_chat_accepts_new_messages_in_between(
    hass: HomeAssistant,
) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import (
        Chat,
        ChatMessage,
        CorrectedChatMessage,
    )

    timestamp = datetime.now(timezone.utc)
    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=timestamp,
            conversation_id="conv-2b",
            pipeline_run_id="run-2b",
            run_timestamp=timestamp,
            messages=[
                ChatMessage(
                    timestamp=timestamp,
                    sender="user",
                    text="First",
                ),
                ChatMessage(
                    timestamp=timestamp,
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
            original_message_id=original_message_ids[0],
            timestamp=timestamp,
            sender="user",
            text="First",
        ),
        CorrectedChatMessage(
            original_message_id=None,
            timestamp=timestamp,
            sender="assistant",
            text="Inserted",
            data={"note": "new"},
        ),
        CorrectedChatMessage(
            original_message_id=original_message_ids[1],
            timestamp=timestamp,
            sender="assistant",
            text="Second",
        ),
    ]

    db.upsert_corrected_chat(
        hass, conversation_id, pipeline_run_id, corrected_messages
    )

    chats = db.fetch_recent_chats(hass, 1)
    corrected = chats[0].corrected
    assert corrected is not None
    assert [msg.original_message_id for msg in corrected.messages] == [
        original_message_ids[0],
        None,
        original_message_ids[1],
    ]
    assert corrected.messages[1].text == "Inserted"
    assert corrected.messages[1].data == {"note": "new"}


@pytest.mark.asyncio
async def test_replace_chat_messages_replaces_rows(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import Chat, ChatMessage

    timestamp = datetime.now(timezone.utc)
    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=timestamp,
            conversation_id="conv-3",
            pipeline_run_id="run-3",
            run_timestamp=timestamp,
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
    db.replace_chat_messages(
        hass, conversation_id, pipeline_run_id, replacement
    )

    chats = db.fetch_recent_chats(hass, 1)
    assert len(chats[0].messages) == 2
    assert chats[0].messages[0].text == "Updated"
    assert chats[0].messages[0].data["note"] == "corrected"


@pytest.mark.asyncio
async def test_count_uncorrected_chats(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import (
        Chat,
        ChatMessage,
        CorrectedChatMessage,
    )

    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-count",
            pipeline_run_id="run-count",
            run_timestamp=datetime.now(timezone.utc),
            messages=[
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="user",
                    text="Hello",
                )
            ],
        ),
    )
    assert db.count_uncorrected_chats(hass) == 1

    original = db.fetch_recent_chats(hass, 1)[0]
    corrected_messages = [
        CorrectedChatMessage(
            original_message_id=original.messages[0].id,
            timestamp=datetime.now(timezone.utc),
            sender="assistant",
            text="Fixed",
        )
    ]
    db.upsert_corrected_chat(
        hass, conversation_id, pipeline_run_id, corrected_messages
    )
    assert db.count_uncorrected_chats(hass) == 0


@pytest.mark.asyncio
async def test_delete_chat_cascades_messages_and_corrected(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import (
        Chat,
        ChatMessage,
        CorrectedChatMessage,
    )

    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-delete",
            pipeline_run_id="run-delete",
            run_timestamp=datetime.now(timezone.utc),
            messages=[
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="user",
                    text="Hello",
                )
            ],
        ),
    )
    original = db.fetch_recent_chats(hass, 1)[0]
    corrected_messages = [
        CorrectedChatMessage(
            original_message_id=original.messages[0].id,
            timestamp=datetime.now(timezone.utc),
            sender="assistant",
            text="Fixed",
        )
    ]
    db.upsert_corrected_chat(
        hass, conversation_id, pipeline_run_id, corrected_messages
    )

    db.delete_chat(hass, conversation_id, pipeline_run_id)

    chats = db.fetch_recent_chats(hass, 10)
    assert not chats


@pytest.mark.asyncio
async def test_delete_corrected_chat_cascades_messages(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    from custom_components.intentsity.models import (
        Chat,
        ChatMessage,
        CorrectedChatMessage,
    )

    conversation_id, pipeline_run_id = db.upsert_chat(
        hass,
        Chat(
            created_at=datetime.now(timezone.utc),
            conversation_id="conv-corrected-delete",
            pipeline_run_id="run-corrected-delete",
            run_timestamp=datetime.now(timezone.utc),
            messages=[
                ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    sender="user",
                    text="Hello",
                )
            ],
        ),
    )
    original = db.fetch_recent_chats(hass, 1)[0]
    corrected_messages = [
        CorrectedChatMessage(
            original_message_id=original.messages[0].id,
            timestamp=datetime.now(timezone.utc),
            sender="assistant",
            text="Fixed",
        )
    ]
    db.upsert_corrected_chat(
        hass, conversation_id, pipeline_run_id, corrected_messages
    )

    db.delete_corrected_chat(hass, conversation_id, pipeline_run_id)

    chats = db.fetch_recent_chats(hass, 1)
    assert chats[0].corrected is None


class _PipelineStoreStub:
    def __init__(self, pipeline: Pipeline) -> None:
        self.data = {pipeline.id: pipeline}

    def async_get_preferred_item(self) -> str:
        return next(iter(self.data))


class _PipelineDataStub:
    def __init__(self, pipeline: Pipeline, run_debug: PipelineRunDebug) -> None:
        self.pipeline_store = _PipelineStoreStub(pipeline)
        self.pipeline_debug = {pipeline.id: {"run-1": run_debug}}
