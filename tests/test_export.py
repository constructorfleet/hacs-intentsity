from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest
from homeassistant.core import HomeAssistant

from custom_components.intentsity import db
from custom_components.intentsity.export import generate_corrected_jsonl
from custom_components.intentsity.models import (
    Chat,
    ChatMessage,
    CorrectedChatExportRequest,
    CorrectedChatMessage,
)


def _setup_fresh_db(hass: HomeAssistant) -> Path:
    db_path = db.get_db_path(hass)
    db_path.unlink(missing_ok=True)
    db.dispose_client(hass)
    db.init_db(hass)
    return db_path


@pytest.mark.asyncio
async def test_generate_corrected_jsonl_normalizes_messages(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    now = datetime(2026, 1, 15, tzinfo=timezone.utc)
    db.upsert_chat(
        hass,
        Chat(
            created_at=now,
            conversation_id="conv-export",
            pipeline_run_id="run-export",
            run_timestamp=now,
            messages=[
                ChatMessage(timestamp=now, sender="user", text="Original"),
            ],
        ),
    )

    corrected_messages = [
        CorrectedChatMessage(
            timestamp=now,
            sender="system",
            text="System instructions",
            data={"role": "system", "content": "System instructions"},
        ),
        CorrectedChatMessage(
            timestamp=now,
            sender="assistant",
            text="Turn on the lights",
            data={},
        ),
        CorrectedChatMessage(
            timestamp=now,
            sender="assistant",
            text="",
            data={
                "tool_calls": [
                    {"name": "set_light_state", "arguments": {"room": "living_room", "state": "on"}},
                    {"name": "set_light_state", "arguments": {"room": "kitchen", "state": "on"}, "tool_call_id": "dup"},
                    {"name": "set_light_state", "arguments": {"room": "kitchen", "state": "off"}, "tool_call_id": "dup"},
                ]
            },
        ),
        CorrectedChatMessage(
            timestamp=now,
            sender="tool_result",
            text="",
            data={
                "role": "tool_result",
                "tool_name": "set_light_state",
                "tool_call_id": "mismatch",
                "tool_result": {"success": True},
            },
        ),
        CorrectedChatMessage(
            timestamp=now,
            sender="user",
            text="tool_call should force assistant",
            data={},
        ),
    ]
    db.upsert_corrected_chat(
        hass,
        "conv-export",
        "run-export",
        corrected_messages,
    )
    db.upsert_chat(
        hass,
        Chat(
            created_at=now,
            conversation_id="conv-export",
            pipeline_run_id="run-export-2",
            run_timestamp=now,
            messages=[
                ChatMessage(timestamp=now, sender="user", text="Original follow up"),
            ],
        ),
    )
    db.upsert_corrected_chat(
        hass,
        "conv-export",
        "run-export-2",
        [
            CorrectedChatMessage(
                timestamp=now,
                sender="assistant",
                text="Second run",
                data={},
            )
        ],
    )

    db.upsert_chat(
        hass,
        Chat(
            created_at=now,
            conversation_id="conv-uncorrected",
            pipeline_run_id="run-uncorrected",
            run_timestamp=now,
            messages=[
                ChatMessage(timestamp=now, sender="user", text="Uncorrected"),
            ],
        ),
    )

    payload = generate_corrected_jsonl(
        hass,
        CorrectedChatExportRequest(limit=10, start=None, end=None),
    )
    assert payload["count"] == 1

    lines = payload["jsonl"].splitlines()
    assert len(lines) == 1
    data = json.loads(lines[0])
    messages = data["messages"]

    assert messages[0]["role"] == "system"
    assert messages[1]["role"] == "user"

    tool_calls = messages[2]["tool_calls"]
    tool_call_ids = [call["tool_call_id"] for call in tool_calls]
    assert len(tool_call_ids) == len(set(tool_call_ids))

    assert messages[3]["role"] == "tool"
    assert messages[3]["tool_call_id"] == tool_call_ids[-1]
    assert json.loads(messages[3]["content"]) == {"success": True}

    assert messages[4]["role"] == "assistant"
    assert messages[-1]["content"] == "Second run"
