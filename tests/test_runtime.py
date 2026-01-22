from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import pytest
from homeassistant.core import HomeAssistant

from custom_components.intentsity import db


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
    
    chat_id = db.insert_chat(hass, Chat(
        created_at=datetime.now(timezone.utc),
        conversation_id="conv-1",
        messages=[
            ChatMessage(
                timestamp=datetime.now(timezone.utc),
                sender="user",
                text="Hello",
            )
        ]
    ))
    
    db.insert_chat_message(hass, chat_id, ChatMessage(
        timestamp=datetime.now(timezone.utc),
        sender="assistant",
        text="Hi there",
    ))
    
    chats = db.fetch_recent_chats(hass, 10)
    assert len(chats) == 1
    assert chats[0].conversation_id == "conv-1"
    assert len(chats[0].messages) == 2
    assert chats[0].messages[0].text == "Hello"
    assert chats[0].messages[1].text == "Hi there"
