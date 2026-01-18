from __future__ import annotations

import asyncio
from dataclasses import asdict
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Callable, cast

import pytest

from custom_components import intentsity
from custom_components.intentsity import const, db, view, websocket
from custom_components.intentsity.models import LoggedIntentEvent
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


async def _wait_for(condition: Callable[[], bool], timeout: float = 0.5) -> None:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not condition():
        if loop.time() >= deadline:
            break
        await asyncio.sleep(0)


def test_query_recent_events_respects_limit(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    run = cast(Any, PipelineRun(hass, "run-multi"))  # type: ignore[call-arg]

    for idx in range(3):
        event = cast(
            Any,
            PipelineEvent(
                PipelineEventType.INTENT_START,
                {"intent_type": f"Intent{idx}"},
            ),
        )
        payload = LoggedIntentEvent(
            run_id=run.run_id,
            event_type=event.type.value,
            intent_type=getattr(event.data, "intent_type", None),
            raw_event=asdict(event),
        )
        db.insert_event(hass, payload)

    events = db.fetch_recent_events(hass, 2)
    assert len(events) == 2
    assert events[0].intent_type == "Intent2"
    assert events[1].intent_type == "Intent1"


@pytest.mark.asyncio
async def test_patched_process_event_persists_intents(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    recorded: list[str] = []

    async def original(self: PipelineRun, event: PipelineEvent) -> None:  # type: ignore[override]
        recorded.append(event.type.value)

    intentsity._ORIGINAL_PROCESS_EVENT = original  # type: ignore[assignment]

    run = cast(Any, PipelineRun(hass, "run-123"))  # type: ignore[call-arg]
    start_event = cast(
        Any,
        PipelineEvent(
        PipelineEventType.INTENT_START,
        {"intent_type": "AssistMedia"},
        ),
    )
    end_event = cast(
        Any,
        PipelineEvent(
        PipelineEventType.INTENT_END,
        {"intent_type": "AssistMedia"},
        ),
    )

    try:
        await intentsity._patched_process_event(run, start_event)
        await intentsity._patched_process_event(run, end_event)
    finally:
        intentsity._ORIGINAL_PROCESS_EVENT = None

    events = await hass.async_add_executor_job(db.fetch_recent_events, hass, 10)
    assert [event.event_type for event in events] == [
        PipelineEventType.INTENT_END.value,
        PipelineEventType.INTENT_START.value,
    ]
    assert recorded == [
        PipelineEventType.INTENT_START.value,
        PipelineEventType.INTENT_END.value,
    ]


@pytest.mark.asyncio
async def test_intent_panel_view_returns_html(hass: HomeAssistant) -> None:
    panel_view = view.IntentPanelView()
    response = await panel_view.get(SimpleNamespace())

    assert response.content_type == "text/html"
    assert response.text is not None
    assert "Assist Intent Review" in response.text
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
    run = cast(Any, PipelineRun(hass, "run-ws-list"))  # type: ignore[call-arg]
    event = cast(
        Any,
        PipelineEvent(
        PipelineEventType.INTENT_START,
        {"intent_type": "AssistList"},
        ),
    )
    payload = LoggedIntentEvent(
        run_id=run.run_id,
        event_type=event.type.value,
        intent_type=getattr(event.data, "intent_type", None),
        raw_event=asdict(event),
    )
    db.insert_event(hass, payload)

    connection = _WsConnectionStub()
    websocket.websocket_list_events(
        hass,
        cast(Any, connection),
        {"id": 1, "type": const.WS_CMD_LIST_EVENTS, "limit": 5},
    )

    await _wait_for(lambda: bool(connection.sent_results))

    assert connection.sent_results[0]["result"]["events"][0]["run_id"] == "run-ws-list"


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

    run = cast(Any, PipelineRun(hass, "run-ws-sub"))  # type: ignore[call-arg]
    event = cast(
        Any,
        PipelineEvent(
        PipelineEventType.INTENT_START,
        {"intent_type": "AssistLive"},
        ),
    )
    payload = LoggedIntentEvent(
        run_id=run.run_id,
        event_type=event.type.value,
        intent_type=getattr(event.data, "intent_type", None),
        raw_event=asdict(event),
    )
    db.insert_event(hass, payload)
    async_dispatcher_send(hass, const.SIGNAL_EVENT_RECORDED, payload)

    await _wait_for(lambda: bool(connection.sent_events))

    assert connection.sent_events
    assert connection.sent_events[-1]["event"]["events"][0]["intent_type"] == "AssistLive"


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
