from __future__ import annotations

from datetime import datetime, timezone

import pytest

from custom_components.intentsity import websocket
from custom_components.intentsity.const import (
    DEFAULT_EVENT_LIMIT,
    WS_CMD_LIST_CHATS,
    WS_CMD_SAVE_CORRECTED_CHAT,
    WS_CMD_SUBSCRIBE_CHATS,
    WS_CMD_TOMBSTONE,
)
from custom_components.intentsity.models import Chat, ChatListResponse, ChatMessage
from custom_components.intentsity.utils import parse_timestamp


class _Connection:
    def __init__(self) -> None:
        self.results: list[tuple[int, dict | None]] = []
        self.messages: list[dict] = []
        self.subscriptions: dict[int, object] = {}

    def send_result(self, msg_id: int, payload: dict | None = None) -> None:
        self.results.append((msg_id, payload))

    def send_message(self, message: dict) -> None:
        self.messages.append(message)


@pytest.mark.asyncio
async def test_websocket_list_chats(hass, monkeypatch) -> None:
    now = datetime.now(timezone.utc)
    chat = Chat(
        created_at=now,
        conversation_id="conv-1",
        pipeline_run_id="run-1",
        run_timestamp=now,
        messages=[ChatMessage(timestamp=now, sender="user", text="Hi")],
    )

    called: dict[str, object] = {}

    def _fetch_recent_chats(_hass, limit, corrected, start, end):
        called["limit"] = limit
        called["corrected"] = corrected
        called["start"] = start
        called["end"] = end
        return ChatListResponse(chats=[chat])

    monkeypatch.setattr(websocket, "fetch_recent_chats", _fetch_recent_chats)

    conn = _Connection()
    start = "2026-01-01T12:00:00+00:00"
    end = "2026-01-31T12:00:00+00:00"
    websocket.websocket_list_chats(
        hass,
        conn,
        {
            "id": 1,
            "type": WS_CMD_LIST_CHATS,
            "limit": DEFAULT_EVENT_LIMIT,
            "corrected": "uncorrected",
            "start": start,
            "end": end,
        },
    )
    await hass.async_block_till_done()

    assert conn.results
    msg_id, payload = conn.results[0]
    assert msg_id == 1
    assert payload["chats"][0]["conversation_id"] == "conv-1"
    assert payload["chats"][0]["pipeline_run_id"] == "run-1"
    assert parse_timestamp(payload["chats"][0]["run_timestamp"]) == now
    assert called["limit"] == DEFAULT_EVENT_LIMIT
    assert called["corrected"] is False
    assert called["start"] == parse_timestamp(start)
    assert called["end"] == parse_timestamp(end)


@pytest.mark.asyncio
async def test_websocket_subscribe_chats(hass, monkeypatch) -> None:
    called: dict[str, object] = {}

    def _fetch_recent_chats(_hass, limit, corrected, start, end):
        called["limit"] = limit
        called["corrected"] = corrected
        called["start"] = start
        called["end"] = end
        return []

    monkeypatch.setattr(websocket, "fetch_recent_chats", _fetch_recent_chats)

    conn = _Connection()
    start = "2026-01-01T12:00:00+00:00"
    end = "2026-01-31T12:00:00+00:00"
    websocket.websocket_subscribe_chats(
        hass,
        conn,
        {
            "id": 2,
            "type": WS_CMD_SUBSCRIBE_CHATS,
            "limit": DEFAULT_EVENT_LIMIT,
            "corrected": "corrected",
            "start": start,
            "end": end,
        },
    )
    await hass.async_block_till_done()

    assert conn.results == [(2, None)]
    assert 2 in conn.subscriptions
    assert conn.messages
    assert conn.messages[0]["type"] == "event"
    assert called["limit"] == DEFAULT_EVENT_LIMIT
    assert called["corrected"] is True
    assert called["start"] == parse_timestamp(start)
    assert called["end"] == parse_timestamp(end)

    for unsubscribe in list(conn.subscriptions.values()):
        unsubscribe()


@pytest.mark.asyncio
async def test_websocket_save_corrected_chat(hass, monkeypatch) -> None:
    saved: dict[str, object] = {}

    def _upsert_corrected_chat(_hass, conversation_id, pipeline_run_id, messages):
        saved["conversation_id"] = conversation_id
        saved["pipeline_run_id"] = pipeline_run_id
        saved["messages"] = messages

    monkeypatch.setattr(websocket, "upsert_corrected_chat", _upsert_corrected_chat)

    conn = _Connection()
    msg = {
        "id": 3,
        "type": WS_CMD_SAVE_CORRECTED_CHAT,
        "conversation_id": "conv-save",
        "pipeline_run_id": "run-save",
        "messages": [
            {
                "original_message_id": 1,
                "timestamp": "2026-01-01T00:00:00+00:00",
                "sender": "assistant",
                "text": "Fixed",
                "data": {},
            }
        ],
    }

    websocket.websocket_save_corrected_chat(hass, conn, msg)
    await hass.async_block_till_done()

    assert saved["conversation_id"] == "conv-save"
    assert saved["pipeline_run_id"] == "run-save"
    assert len(saved["messages"]) == 1
    assert conn.results == [(3, None)]


@pytest.mark.asyncio
async def test_websocket_tombstone_targets(hass, monkeypatch) -> None:
    called: dict[str, object] = {}

    def _tombstone_targets(_hass, targets):
        called["targets"] = targets

    monkeypatch.setattr(websocket, "tombstone_targets", _tombstone_targets)

    conn = _Connection()
    msg = {
        "id": 4,
        "type": WS_CMD_TOMBSTONE,
        "targets": [
            {"kind": "chat", "conversation_id": "conv-1", "pipeline_run_id": "run-1"},
            {"kind": "message", "message_id": 12},
            {
                "kind": "corrected_chat",
                "conversation_id": "conv-2",
                "pipeline_run_id": "run-2",
            },
            {"kind": "corrected_message", "corrected_message_id": 20},
        ],
    }

    websocket.websocket_tombstone_targets(hass, conn, msg)
    await hass.async_block_till_done()

    assert conn.results == [(4, None)]
    assert called["targets"]
