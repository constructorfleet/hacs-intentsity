from __future__ import annotations

import inspect
import logging
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

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
from .models import IntentEndRecord, IntentProgressRecord, IntentStartRecord

_LOGGER = logging.getLogger(__name__)


OriginalProcessEvent = Callable[[PipelineRun, PipelineEvent], Awaitable[None] | None]


_ORIGINAL_PROCESS_EVENT: OriginalProcessEvent | None = None

DATA_DB_INITIALIZED = "db_initialized"
DATA_API_REGISTERED = "api_registered"
DATA_RUN_CREATED_AT = "run_created_at"
LOGGABLE_EVENTS = {
    PipelineEventType.INTENT_START,
    PipelineEventType.INTENT_END,
    PipelineEventType.INTENT_PROGRESS,
}


def _resolve_run_id(run: PipelineRun) -> str:
    """Return a stable identifier for a pipeline run."""

    run_id = getattr(run, "id", None) or getattr(run, "run_id", None)
    if run_id is None:
        return "unknown"
    return str(run_id)


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
    domain_data = hass.data.setdefault(DOMAIN, {})
    run_id = _resolve_run_id(self)

    if event.type in LOGGABLE_EVENTS:
        created_at = _ensure_run_created_at(domain_data, run_id)
        metadata = _extract_pipeline_metadata(self)
        metadata["created_at"] = created_at

        try:
            await hass.async_add_executor_job(db.upsert_pipeline_run, hass, run_id, metadata)

            if event.type is PipelineEventType.INTENT_START:
                start_record = _intent_start_from_event(run_id, event)
                if start_record is not None:
                    await hass.async_add_executor_job(db.insert_intent_start, hass, start_record)
            elif event.type is PipelineEventType.INTENT_PROGRESS:
                progress_record = _intent_progress_from_event(run_id, event)
                if progress_record is not None:
                    await hass.async_add_executor_job(db.insert_intent_progress, hass, progress_record)
            elif event.type is PipelineEventType.INTENT_END:
                end_record = _intent_end_from_event(run_id, event)
                if end_record is not None:
                    await hass.async_add_executor_job(db.insert_intent_end, hass, end_record)

            async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED, run_id)
        except Exception as err:  # pragma: no cover - defensive logging
            _LOGGER.warning("[intentsity] Failed to record pipeline run data: %s", err)

    if _ORIGINAL_PROCESS_EVENT is not None:
        result = _ORIGINAL_PROCESS_EVENT(self, event)
        if inspect.isawaitable(result):
            await result


def _ensure_run_created_at(domain_data: dict[str, Any], run_id: str) -> datetime:
    created_map: dict[str, datetime] = domain_data.setdefault(DATA_RUN_CREATED_AT, {})
    created_at = created_map.get(run_id)
    if created_at is None:
        created_at = datetime.now(timezone.utc)
        created_map[run_id] = created_at
    return created_at


def _extract_pipeline_metadata(run: PipelineRun) -> dict[str, Any]:
    pipeline = getattr(run, "pipeline", None)
    metadata: dict[str, Any] = {}

    def _maybe_copy(attr: str, source: Any = pipeline) -> None:
        if source is None:
            return
        value = getattr(source, attr, None)
        if value is not None:
            metadata[attr] = value

    _maybe_copy("conversation_engine")
    _maybe_copy("language")
    _maybe_copy("name")
    _maybe_copy("stt_engine")
    _maybe_copy("stt_language")
    _maybe_copy("tts_engine")
    _maybe_copy("tts_language")
    _maybe_copy("tts_voice")
    _maybe_copy("wake_word_entity")
    _maybe_copy("wake_word_id")
    _maybe_copy("prefer_local_intents")

    metadata.setdefault("language", getattr(run, "language", None))
    metadata.setdefault("prefer_local_intents", getattr(pipeline, "prefer_local_intents", None))
    return metadata


def _event_payload(event: PipelineEvent) -> dict[str, Any]:
    data = event.data
    if isinstance(data, Mapping):
        return dict(data)
    if hasattr(data, "__dict__"):
        return dict(vars(data))
    return {}


def _intent_start_from_event(run_id: str, event: PipelineEvent) -> IntentStartRecord | None:
    data = _event_payload(event)
    if not data:
        return None
    return IntentStartRecord(
        run_id=run_id,
        engine=data.get("engine"),
        language=data.get("language"),
        intent_input=data.get("intent_input"),
        conversation_id=data.get("conversation_id"),
        device_id=data.get("device_id"),
        satellite_id=data.get("satellite_id"),
        prefer_local_intents=data.get("prefer_local_intents"),
    )


def _intent_progress_from_event(run_id: str, event: PipelineEvent) -> IntentProgressRecord | None:
    data = _event_payload(event)
    if not data:
        return None
    if not data.get("chat_log_delta") and "tts_start_streaming" not in data:
        return None
    payload = {
        "chat_log_delta": data.get("chat_log_delta"),
        "tts_start_streaming": data.get("tts_start_streaming"),
    }
    return IntentProgressRecord.from_payload(
        run_id=run_id,
        timestamp=datetime.now(timezone.utc),
        payload=payload,
    )


def _intent_end_from_event(run_id: str, event: PipelineEvent) -> IntentEndRecord | None:
    data = _event_payload(event)
    if not data:
        return None
    return IntentEndRecord.from_payload(
        run_id=run_id,
        timestamp=datetime.now(timezone.utc),
        payload=data,
    )
