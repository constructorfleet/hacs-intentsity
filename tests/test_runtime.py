from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace

import pytest

from custom_components import intentsity
from custom_components.intentsity import const
from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
    PipelineRun,
)
from homeassistant.core import HomeAssistant


def _setup_fresh_db(hass: HomeAssistant) -> Path:
    db_path = intentsity._get_db_path(hass)
    db_path.unlink(missing_ok=True)
    domain_data = hass.data.setdefault(intentsity.DOMAIN, {})
    engine = domain_data.pop("engine", None)
    if engine is not None:
        engine.dispose()
    intentsity._init_db(hass)
    return db_path


def test_clamp_limit_bounds() -> None:
    assert intentsity._clamp_limit("999") == const.MAX_EVENT_LIMIT
    assert intentsity._clamp_limit("0") == 1
    assert intentsity._clamp_limit("not-a-number") == const.DEFAULT_EVENT_LIMIT
    assert intentsity._clamp_limit(None) == const.DEFAULT_EVENT_LIMIT


def test_query_recent_events_respects_limit(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    run = PipelineRun(hass, "run-multi")

    for idx in range(3):
        event = PipelineEvent(
            PipelineEventType.INTENT_START,
            {"intent_type": f"Intent{idx}"},
        )
        intentsity._record_event(hass, run, event)

    events = intentsity._query_recent_events(hass, 2)
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

    run = PipelineRun(hass, "run-123")
    start_event = PipelineEvent(
        PipelineEventType.INTENT_START,
        {"intent_type": "AssistMedia"},
    )
    end_event = PipelineEvent(
        PipelineEventType.INTENT_END,
        {"intent_type": "AssistMedia"},
    )

    try:
        await intentsity._patched_process_event(run, start_event)
        await intentsity._patched_process_event(run, end_event)
    finally:
        intentsity._ORIGINAL_PROCESS_EVENT = None

    events = await hass.async_add_executor_job(intentsity._query_recent_events, hass, 10)
    assert [event.event_type for event in events] == [
        PipelineEventType.INTENT_END.value,
        PipelineEventType.INTENT_START.value,
    ]
    assert recorded == [
        PipelineEventType.INTENT_START.value,
        PipelineEventType.INTENT_END.value,
    ]


@pytest.mark.asyncio
async def test_intent_events_view_serializes_payload(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    run = PipelineRun(hass, "run-view")
    event = PipelineEvent(
        PipelineEventType.INTENT_START,
        {"intent_type": "AssistDebug"},
    )
    intentsity._record_event(hass, run, event)

    view = intentsity.IntentEventsView()
    request = SimpleNamespace(app={"hass": hass}, query={"limit": "1"})
    payload = await view.get(request)

    assert payload["events"][0]["run_id"] == "run-view"
    assert payload["events"][0]["intent_type"] == "AssistDebug"


@pytest.mark.asyncio
async def test_intent_panel_view_returns_html(hass: HomeAssistant) -> None:
    view = intentsity.IntentPanelView()
    response = await view.get(SimpleNamespace())

    assert response.content_type == "text/html"
    assert "Assist Intent Review" in response.text


@pytest.mark.asyncio
async def test_async_setup_registers_views_once(hass: HomeAssistant) -> None:
    intentsity._ORIGINAL_PROCESS_EVENT = None
    original_process = PipelineRun.process_event

    try:
        assert await intentsity.async_setup(hass, {}) is True
        assert PipelineRun.process_event is intentsity._patched_process_event
        assert len(hass.http.views) == 2
        assert hass.data[intentsity.DOMAIN]["api_registered"] is True

        await intentsity.async_setup(hass, {})
        assert len(hass.http.views) == 2
    finally:
        PipelineRun.process_event = original_process
        intentsity._ORIGINAL_PROCESS_EVENT = None
