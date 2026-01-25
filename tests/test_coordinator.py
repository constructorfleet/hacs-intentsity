from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pytest
from homeassistant.components.assist_pipeline.pipeline import (
    KEY_ASSIST_PIPELINE,
    Pipeline,
    PipelineEvent,
    PipelineEventType,
    PipelineRunDebug,
)
from homeassistant.components.conversation.chat_log import DATA_CHAT_LOGS, SystemContent

from custom_components.intentsity import db
from custom_components.intentsity.coordinator import (
    IntentsityCoordinator,
    _process_intent_progress,
    _process_intent_start,
    _process_run_start,
)
from custom_components.intentsity.models import Chat
from custom_components.intentsity.utils import parse_timestamp


def _make_pipeline() -> Pipeline:
    return Pipeline(
        conversation_engine="conversation.home_assistant",
        conversation_language="en",
        language="en",
        name="Default",
        stt_engine=None,
        stt_language=None,
        tts_engine=None,
        tts_language=None,
        tts_voice=None,
        wake_word_entity=None,
        wake_word_id=None,
    )


class _ChatLogStub:
    def __init__(self, content) -> None:
        self.content = content


class _SystemContent(SystemContent):
    def as_dict(self) -> dict[str, Any]:
        return {"role": "system", "content": self.content}


def test_process_run_start() -> None:
    now = datetime.now(timezone.utc)
    event = PipelineEvent(
        PipelineEventType.RUN_START,
        {"conversation_id": "conv-1"},
    )
    chat = _process_run_start(event, "run-1", now)
    assert chat is not None
    assert chat.conversation_id == "conv-1"
    assert chat.pipeline_run_id == "run-1"
    assert chat.run_timestamp == parse_timestamp(now)


def test_process_intent_start_appends_message() -> None:
    now = datetime.now(timezone.utc)
    chat = Chat(
        conversation_id="conv-2",
        pipeline_run_id="run-2",
        run_timestamp=now,
        messages=[],
    )
    event = PipelineEvent(
        PipelineEventType.INTENT_START,
        {"conversation_id": "conv-2", "intent_input": "Hello", "meta": "x"},
    )
    updated = _process_intent_start(event, chat)
    assert updated is chat
    assert len(chat.messages) == 1
    assert chat.messages[0].text == "Hello"
    assert chat.messages[0].data == {"conversation_id": "conv-2", "meta": "x"}
    assert chat.messages[0].timestamp == parse_timestamp(event.timestamp)


def test_process_intent_progress_tool_calls_and_content() -> None:
    now = datetime.now(timezone.utc)
    chat = Chat(
        conversation_id="conv-3",
        pipeline_run_id="run-3",
        run_timestamp=now,
        messages=[],
    )
    event = PipelineEvent(
        PipelineEventType.INTENT_PROGRESS,
        {"chat_log_delta": {"tool_calls": [{"name": "foo"}], "role": "tool_calls"}},
    )
    updated = _process_intent_progress(event, chat)
    assert updated is chat
    assert chat.messages[0].sender == "tool_calls"
    assert chat.messages[0].timestamp == parse_timestamp(event.timestamp)

    event = PipelineEvent(
        PipelineEventType.INTENT_PROGRESS,
        {"chat_log_delta": {"tool_result": {"result": "ok"}, "role": "tool_result"}},
    )
    updated = _process_intent_progress(event, chat)
    assert updated is chat
    assert chat.messages[1].text == "ok"
    assert chat.messages[1].sender == "tool_result"
    assert chat.messages[1].timestamp == parse_timestamp(event.timestamp)

    event = PipelineEvent(
        PipelineEventType.INTENT_PROGRESS,
        {"chat_log_delta": {"content": "Hi", "role": "assistant"}},
    )
    updated = _process_intent_progress(event, chat)
    assert updated is not None
    assert chat.messages[-1].text == "Hi"
    assert chat.messages[-1].timestamp == parse_timestamp(event.timestamp)


def test_process_intent_progress_tool_calls_skip_content() -> None:
    now = datetime.now(timezone.utc)
    chat = Chat(
        conversation_id="conv-5",
        pipeline_run_id="run-5",
        run_timestamp=now,
        messages=[],
    )
    event = PipelineEvent(
        PipelineEventType.INTENT_PROGRESS,
        {
            "chat_log_delta": {
                "tool_calls": [{"name": "foo"}],
                "content": "Ignored",
                "role": "tool_calls",
            }
        },
    )
    updated = _process_intent_progress(event, chat)
    assert updated is chat
    assert len(chat.messages) == 1
    assert chat.messages[0].text == ""
    assert chat.messages[0].timestamp == parse_timestamp(event.timestamp)


@pytest.mark.asyncio
async def test_async_update_data_persists_chat(hass, monkeypatch) -> None:
    pipeline = _make_pipeline()
    run_debug = PipelineRunDebug()
    run_debug.events.append(
        PipelineEvent(
            PipelineEventType.RUN_START,
            {"conversation_id": "conv-4"},
        )
    )
    run_debug.events.append(
        PipelineEvent(
            PipelineEventType.INTENT_START,
            {"intent_input": "Ping"},
        )
    )
    run_debug.events.append(
        PipelineEvent(
            PipelineEventType.INTENT_PROGRESS,
            {"chat_log_delta": {"content": "Pong", "role": "assistant"}},
        )
    )
    run_debug.events.append(
        PipelineEvent(
            PipelineEventType.INTENT_END,
            {"response": {"speech": {"plain": {"speech": "Pong"}}}},
        )
    )

    class _PipelineData:
        def __init__(self, run_debug) -> None:
            self.pipeline_debug = {pipeline.id: {"run-1": run_debug}}

    hass.data[KEY_ASSIST_PIPELINE] = _PipelineData(run_debug)
    hass.data[DATA_CHAT_LOGS] = {
        "conv-4": _ChatLogStub([_SystemContent(content="System")])
    }

    monkeypatch.setattr(
        "custom_components.intentsity.coordinator.async_get_pipelines",
        lambda _hass: [pipeline],
    )
    monkeypatch.setattr(
        "custom_components.intentsity.coordinator.async_get_pipeline",
        lambda _hass, _pid: pipeline,
    )

    persisted: dict[str, Any] = {}

    def _upsert_chat(_hass, chat):
        persisted["chat"] = chat
        return chat.conversation_id, chat.pipeline_run_id

    monkeypatch.setattr(db, "upsert_chat", _upsert_chat)
    monkeypatch.setattr(db, "fetch_recent_chats", lambda _hass: [])
    monkeypatch.setattr(db, "count_uncorrected_chats", lambda _hass: 2)

    coordinator = IntentsityCoordinator(hass)
    data = await coordinator._async_update_data()

    assert persisted["chat"].conversation_id == "conv-4"
    assert persisted["chat"].pipeline_run_id == "run-1"
    assert persisted["chat"].run_timestamp == parse_timestamp(run_debug.timestamp)
    assert data["uncorrected_count"] == 2


@pytest.mark.asyncio
async def test_async_update_data_missing_pipeline_data(hass) -> None:
    coordinator = IntentsityCoordinator(hass)
    data = await coordinator._async_update_data()
    assert data == {}
