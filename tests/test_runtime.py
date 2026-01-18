from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Callable, cast

import pytest

from custom_components import intentsity
from custom_components.intentsity import const, db, view, websocket
from custom_components.intentsity.models import IntentStartRecord
from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
    PipelineRun,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send


def _setup_fresh_db(hass: HomeAssistant) -> Path:
    db_path = db.get_db_path(hass)
    db_path.unlink(missing_ok=True)
    db.dispose_client(hass)
    db.init_db(hass)
    return db_path


def _make_pipeline_run(hass: HomeAssistant, run_id: str) -> Any:
    return SimpleNamespace(hass=hass, id=run_id, run_id=run_id)


async def _wait_for(condition: Callable[[], bool], timeout: float = 0.5) -> None:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not condition():
        if loop.time() >= deadline:
            break
        await asyncio.sleep(0)


def test_query_recent_runs_respects_limit(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    now = datetime.now(timezone.utc)

    for idx in range(3):
        run_id = f"run-{idx}"
        db.upsert_pipeline_run(
            hass,
            run_id,
            {
                "created_at": now + timedelta(seconds=idx),
                "name": f"Run {idx}",
            },
        )
        db.insert_intent_start(
            hass,
            IntentStartRecord(
                run_id=run_id,
                intent_input=f"Turn on lights {idx}",
            ),
        )

    response = db.fetch_recent_runs(hass, 2)
    assert len(response.runs) == 2
    assert response.runs[0].run_id == "run-2"
    assert response.runs[1].run_id == "run-1"


@pytest.mark.asyncio
async def test_patched_process_event_persists_intents(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    recorded: list[str] = []

    async def original(self: PipelineRun, event: PipelineEvent) -> None:  # type: ignore[override]
        recorded.append(event.type.value)

    intentsity._ORIGINAL_PROCESS_EVENT = original  # type: ignore[assignment]

    run = _make_pipeline_run(hass, "run-123")
    start_event = PipelineEvent(
        PipelineEventType.INTENT_START,
        {"intent_type": "AssistMedia", "intent_input": "AssistMedia"},
    )
    progress_event = PipelineEvent(
        PipelineEventType.INTENT_PROGRESS,
        {"chat_log_delta": {"role": "assistant", "content": "Working"}},
    )
    end_event = PipelineEvent(
        PipelineEventType.INTENT_END,
        {"processed_locally": False, "intent_output": {"speech": "Done"}},
    )

    try:
        await intentsity._patched_process_event(run, start_event)
        await intentsity._patched_process_event(run, progress_event)
        await intentsity._patched_process_event(run, end_event)
    finally:
        intentsity._ORIGINAL_PROCESS_EVENT = None

    response = await hass.async_add_executor_job(db.fetch_recent_runs, hass, 5)
    assert response.runs
    run_record = response.runs[0]
    assert run_record.intent_starts and run_record.intent_starts[0].intent_input == "AssistMedia"
    assert run_record.intent_progress and run_record.intent_progress[0].chat_log_delta["content"] == "Working"
    assert run_record.intent_ends and run_record.intent_ends[0].intent_output["speech"] == "Done"
    assert recorded == [
        PipelineEventType.INTENT_START.value,
        PipelineEventType.INTENT_PROGRESS.value,
        PipelineEventType.INTENT_END.value,
    ]


@pytest.mark.asyncio
async def test_intent_panel_view_returns_html(hass: HomeAssistant) -> None:
    panel_view = view.IntentPanelView()
    response = await panel_view.get(SimpleNamespace())

    assert response.content_type == "text/html"
    assert response.text is not None
    assert "Assist Intent Review" in response.text
    assert "Normalized Assist pipeline runs" in response.text
    assert "intentsity/events/list" in response.text
    assert "intentsity/events/subscribe" in response.text


class _WsConnectionStub:
    def __init__(self) -> None:
        self.subscriptions: dict[int, Any] = {}
        self.sent_results: list[dict[str, Any]] = []
        self.sent_events: list[dict[str, Any]] = []

    def send_result(self, request_id: int, result: dict | None = None) -> None:
        self.sent_results.append({"id": request_id, "result": result})

    def send_message(self, message: dict[str, Any]) -> None:
        if message.get("type") == "event":
            self.sent_events.append(message)
        else:
            self.sent_results.append(message)


@pytest.mark.asyncio
async def test_websocket_list_events_returns_payload(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    run = _make_pipeline_run(hass, "run-ws-list")
    db.upsert_pipeline_run(
        hass,
        run.run_id,
        {"created_at": datetime.now(timezone.utc), "name": "WS Run"},
    )
    db.insert_intent_start(hass, IntentStartRecord(run_id=run.run_id, intent_input="AssistList"))

    connection = _WsConnectionStub()
    websocket.websocket_list_events(
        hass,
        cast(Any, connection),
        {"id": 1, "type": const.WS_CMD_LIST_EVENTS, "limit": 5},
    )

    await _wait_for(lambda: bool(connection.sent_results))

    assert connection.sent_results[0]["result"]["runs"][0]["run_id"] == "run-ws-list"


@pytest.mark.asyncio
async def test_websocket_subscribe_streams_updates(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    connection = _WsConnectionStub()

    websocket.websocket_subscribe_events(
        hass,
        cast(Any, connection),
        {"id": 5, "type": const.WS_CMD_SUBSCRIBE_EVENTS, "limit": 10},
    )

    await _wait_for(lambda: bool(connection.sent_results))
    assert connection.sent_results[0]["result"] is None

    run = _make_pipeline_run(hass, "run-ws-sub")
    db.upsert_pipeline_run(
        hass,
        run.run_id,
        {"created_at": datetime.now(timezone.utc), "name": "Live"},
    )
    db.insert_intent_start(hass, IntentStartRecord(run_id=run.run_id, intent_input="AssistLive"))
    async_dispatcher_send(hass, const.SIGNAL_EVENT_RECORDED, run.run_id)

    await _wait_for(
        lambda: any(msg["event"].get("runs") for msg in connection.sent_events)
    )

    for message in reversed(connection.sent_events):
        runs = message.get("event", {}).get("runs", [])
        if runs:
            assert runs[0]["run_id"] == "run-ws-sub"
            break
    else:  # pragma: no cover - defensive guard
        pytest.fail("No websocket events contained intent payloads")


@pytest.mark.asyncio
async def test_async_setup_registers_views_once(hass: HomeAssistant) -> None:
    intentsity._ORIGINAL_PROCESS_EVENT = None
    original_process = PipelineRun.process_event

    try:
        assert await intentsity.async_setup(hass, {}) is True
        assert PipelineRun.process_event is intentsity._patched_process_event
        assert len(cast(Any, hass.http).views) == 1
        assert hass.data[intentsity.DOMAIN][intentsity.DATA_API_REGISTERED] is True

        await intentsity.async_setup(hass, {})
        assert len(cast(Any, hass.http).views) == 1
    finally:
        PipelineRun.process_event = original_process
        intentsity._ORIGINAL_PROCESS_EVENT = None


@pytest.mark.asyncio
async def test_async_unload_entry_reverts_patch(hass: HomeAssistant) -> None:
    await intentsity.async_setup(hass, {})
    assert PipelineRun.process_event is intentsity._patched_process_event

    entry = SimpleNamespace(entry_id="test")
    await intentsity.async_unload_entry(hass, entry)  # type: ignore[arg-type]

    assert PipelineRun.process_event is not intentsity._patched_process_event
    assert intentsity._ORIGINAL_PROCESS_EVENT is None
