from __future__ import annotations

from dataclasses import asdict
from typing import Callable

import logging

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
    PipelineRun,
)
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from . import db, view
from .const import DOMAIN
from .models import LoggedIntentEvent

_LOGGER = logging.getLogger(__name__)


_ORIGINAL_PROCESS_EVENT: (
    Callable[[PipelineRun, PipelineEvent], None] | None
) = None

DATA_DB_INITIALIZED = "db_initialized"
DATA_API_REGISTERED = "api_registered"
LOGGABLE_EVENTS = {
    PipelineEventType.INTENT_START,
    PipelineEventType.INTENT_END,
}


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
        hass.http.register_view(view.IntentEventsView())
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


@callback
def _patched_process_event(self: PipelineRun, event: PipelineEvent) -> None:
    hass: HomeAssistant = self.hass

    if event.type in LOGGABLE_EVENTS:
        payload = LoggedIntentEvent(
            run_id=self.id,
            event_type=event.type.value,
            intent_type=getattr(event.data, "intent_type", None),
            raw_event=asdict(event),
        )
        try:
            hass.async_add_executor_job(db.insert_event, hass, payload)
        except Exception as err:  # pragma: no cover - defensive logging
            _LOGGER.warning(
                "[intentsity] Failed to record intent event: %s",
                err,
            )

    if _ORIGINAL_PROCESS_EVENT is not None:
        _ORIGINAL_PROCESS_EVENT(self, event)
