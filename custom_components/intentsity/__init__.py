from __future__ import annotations

import inspect
from collections.abc import Mapping
from dataclasses import asdict
from typing import Awaitable, Callable

import logging

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
    PipelineRun,
)
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import db, view, websocket
from .const import DOMAIN, SIGNAL_EVENT_RECORDED
from .models import LoggedIntentEvent

_LOGGER = logging.getLogger(__name__)


OriginalProcessEvent = Callable[[PipelineRun, PipelineEvent], Awaitable[None] | None]


_ORIGINAL_PROCESS_EVENT: OriginalProcessEvent | None = None

DATA_DB_INITIALIZED = "db_initialized"
DATA_API_REGISTERED = "api_registered"
LOGGABLE_EVENTS = {
    PipelineEventType.INTENT_START,
    PipelineEventType.INTENT_END,
}


def _resolve_run_id(run: PipelineRun) -> str:
    """Return a stable identifier for a pipeline run."""

    run_id = getattr(run, "id", None) or getattr(run, "run_id", None)
    if run_id is None:
        return "unknown"
    return str(run_id)


def _extract_intent_type(event: PipelineEvent) -> str | None:
    data = event.data
    if isinstance(data, Mapping):
        return data.get("intent_type")
    return getattr(data, "intent_type", None)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    await _async_initialize(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await _async_initialize(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    _restore_pipeline_patch()
    await hass.async_add_executor_job(db.dispose_client, hass)
    hass.data.pop(DOMAIN, None)
    return True


async def _async_initialize(hass: HomeAssistant) -> None:
    domain_data = hass.data.setdefault(DOMAIN, {})

    if not domain_data.get(DATA_DB_INITIALIZED):
        await hass.async_add_executor_job(db.init_db, hass)
        domain_data[DATA_DB_INITIALIZED] = True

    _ensure_pipeline_patched(hass)

    if not domain_data.get(DATA_API_REGISTERED):
        websocket.async_register_commands(hass)
        hass.http.register_view(view.IntentPanelView())
        async_register_built_in_panel(
            hass,
            component_name="iframe",
            sidebar_title="Intent Review",
            sidebar_icon="mdi:text-box-search",
            frontend_url_path=view.PANEL_URL_PATH,
            config={"url": view.PANEL_URL},
            require_admin=True,
        )
        domain_data[DATA_API_REGISTERED] = True


def _ensure_pipeline_patched(hass: HomeAssistant) -> None:
    global _ORIGINAL_PROCESS_EVENT

    if _ORIGINAL_PROCESS_EVENT is not None:
        return

    _ORIGINAL_PROCESS_EVENT = PipelineRun.process_event
    PipelineRun.process_event = _patched_process_event  # type: ignore[assignment]
    _LOGGER.info("[intentsity] PipelineRun.process_event patched")


def _restore_pipeline_patch() -> None:
    import types
    global _ORIGINAL_PROCESS_EVENT

    if _ORIGINAL_PROCESS_EVENT is None:
        return

    # Restore as a method
    PipelineRun.process_event = _ORIGINAL_PROCESS_EVENT  # type: ignore[assignment]
    _ORIGINAL_PROCESS_EVENT = None


async def _patched_process_event(self: PipelineRun, event: PipelineEvent) -> None:
    hass: HomeAssistant = self.hass

    if event.type in LOGGABLE_EVENTS:
        payload = LoggedIntentEvent(
            run_id=_resolve_run_id(self),
            event_type=event.type.value,
            intent_type=_extract_intent_type(event),
            raw_event=asdict(event),
        )

        try:
            await hass.async_add_executor_job(db.insert_event, hass, payload)
            async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED, payload)
        except Exception as err:  # pragma: no cover - defensive logging
            _LOGGER.warning(
                "[intentsity] Failed to record intent event: %s",
                err,
            )

    if _ORIGINAL_PROCESS_EVENT is not None:
        result = _ORIGINAL_PROCESS_EVENT(self, event)
        if inspect.isawaitable(result):
            await result
