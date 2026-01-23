from __future__ import annotations

from collections.abc import Callable
import json
import logging
from datetime import datetime, timezone
from random import randint
from typing import Any

import voluptuous as vol

from homeassistant.components.assist_pipeline.pipeline import (
    KEY_ASSIST_PIPELINE,
    PipelineEventType,
    async_get_pipeline,
    async_get_pipelines,
)
from homeassistant.components.conversation.chat_log import DATA_CHAT_LOGS, async_get_chat_log, async_subscribe_chat_logs
from homeassistant.components.conversation.const import ChatLogEventType
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.chat_session import async_get_chat_session
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import db, websocket, models
from .const import DATA_UNSUBSCRIBE, DATA_API_REGISTERED, DATA_DB_INITIALIZED, DOMAIN, SIGNAL_EVENT_RECORDED

_LOGGER = logging.getLogger(__name__)
CONFIG_SCHEMA = vol.Schema(
    {
        vol.Optional(DOMAIN): vol.Schema({}),
    },
    extra=vol.ALLOW_EXTRA,
)

_CONTENT_UPDATED_EVENT = getattr(ChatLogEventType, "CONTENT_UPDATED", None)


def _parse_timestamp(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value)
        except ValueError:
            return datetime.now(timezone.utc)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    return datetime.now(timezone.utc)


def _extract_message_payload(data: dict[str, Any]) -> tuple[str, str, datetime, dict[str, Any]]:
    payload = data.get("content")
    if isinstance(payload, dict):
        message_data = payload
    else:
        payload = data
        message_data = data

    sender = str(payload.get("role") or payload.get("sender") or "unknown")
    text_value = payload.get("content")
    if text_value is None and "tool_result" in payload:
        text_value = payload.get("tool_result")
    text = text_value if isinstance(text_value, str) else str(text_value or "")
    timestamp = _parse_timestamp(payload.get("created") or payload.get("timestamp"))
    return sender, text, timestamp, message_data


def _messages_from_chat_log(chat_log: dict[str, Any]) -> list[Any]:
    from .models import ChatMessage

    content = chat_log.get("content")
    if not isinstance(content, list):
        return []
    messages: list[ChatMessage] = []
    for index, item in enumerate(content):
        if not isinstance(item, dict):
            continue
        sender, text, timestamp, message_data = _extract_message_payload({"content": item})
        if not text.strip():
            continue
        messages.append(
            ChatMessage(
                position=index,
                timestamp=timestamp,
                sender=sender,
                text=text,
                data=message_data,
            )
        )
    return messages


def _intent_output_handles(hass: HomeAssistant) -> dict[str, Callable[[], None]]:
    domain_data = hass.data.setdefault(DOMAIN, {})
    handles = domain_data.get("intent_output_handles")
    if not isinstance(handles, dict):
        handles = {}
        domain_data["intent_output_handles"] = handles
    return handles


def _cancel_intent_output_handle(hass: HomeAssistant, conversation_id: str) -> None:
    handles = _intent_output_handles(hass)
    cancel = handles.pop(conversation_id, None)
    if cancel is not None:
        cancel()


def _schedule_intent_output_capture(
    hass: HomeAssistant,
    conversation_id: str,
) -> None:
    _cancel_intent_output_handle(hass, conversation_id)

    async def _capture(_: datetime) -> None:
        _cancel_intent_output_handle(hass, conversation_id)
        await _capture_intent_output(hass, conversation_id)

    _LOGGER.debug("Scheduling intent output capture for conversation_id=%s", conversation_id)
    handles = _intent_output_handles(hass)
    handles[conversation_id] = async_call_later(hass, 0.5, _capture)


def _extract_chat_log_payload(data: dict[str, Any]) -> dict[str, Any] | None:
    chat_log_payload = data.get("chat_log")
    if isinstance(chat_log_payload, dict):
        return chat_log_payload
    if isinstance(data.get("content"), list):
        return {"content": data["content"]}
    return None


def _intent_output_speech(intent_output: dict[str, Any]) -> str | None:
    response = intent_output.get("response")
    if not isinstance(response, dict):
        return None
    speech = response.get("speech")
    if not isinstance(speech, dict):
        return None
    plain = speech.get("plain")
    if not isinstance(plain, dict):
        return None
    text = plain.get("speech")
    if isinstance(text, str) and text.strip():
        return text
    return None


def _intent_output_targets(intent_output: dict[str, Any]) -> dict[str, Any] | None:
    response = intent_output.get("response")
    if not isinstance(response, dict):
        return None
    data = response.get("data")
    if not isinstance(data, dict):
        return None
    targets = data.get("targets") or []
    success = data.get("success") or []
    failed = data.get("failed") or []
    if not (targets or success or failed):
        return None
    return {"targets": targets, "success": success, "failed": failed}


def _fetch_chat_log_snapshot(hass: HomeAssistant, conversation_id: str) -> dict[str, Any]:
    with (
        async_get_chat_session(hass, conversation_id) as session,
        async_get_chat_log(hass, session) as chat_log,
    ):
        return chat_log.as_dict()


def _find_intent_output(hass: HomeAssistant, conversation_id: str) -> dict[str, Any] | None:
    pipeline_data = hass.data.get(KEY_ASSIST_PIPELINE)
    if pipeline_data is None:
        _LOGGER.debug("No pipeline data found in hass.data")
        return None

    latest_output: dict[str, Any] | None = None
    latest_time: datetime | None = None

    for pipeline in async_get_pipelines(hass):
        try:
            resolved = async_get_pipeline(hass, pipeline.id)
        except Exception:
            _LOGGER.debug("Error resolving pipeline id=%s", pipeline.id)
            continue
        runs = pipeline_data.pipeline_debug.get(resolved.id)
        if not runs:
            continue
        for run_debug in runs.values():
            run_conversation_id: str | None = None
            intent_output: dict[str, Any] | None = None
            intent_time: datetime | None = None
            for event in run_debug.events:
                if event.type == PipelineEventType.RUN_START:
                    data = event.data or {}
                    run_conversation_id = data.get("conversation_id")
                elif event.type == PipelineEventType.INTENT_END:
                    data = event.data or {}
                    if "intent_output" in data:
                        intent_output = data.get("intent_output")
                        intent_time = _parse_timestamp(event.timestamp)
            if run_conversation_id != conversation_id:
                continue
            if intent_output is None:
                continue
            if latest_time is None or (
                intent_time is not None and intent_time > latest_time
            ):
                latest_time = intent_time or datetime.now(timezone.utc)
                latest_output = intent_output
    _LOGGER.debug("Found intent output for conversation_id=%s", conversation_id)
    return latest_output


async def _capture_intent_output(hass: HomeAssistant, conversation_id: str) -> None:
    _LOGGER.debug("Capturing intent output for conversation_id=%s", conversation_id)
    intent_output = _find_intent_output(hass, conversation_id)
    if intent_output is None:
        return

    chat = await hass.async_add_executor_job(
        db.fetch_latest_chat_by_conversation_id,
        hass,
        conversation_id,
    )
    if chat is None or not chat.messages:
        return
    speech_text = _intent_output_speech(intent_output)
    targets_payload = _intent_output_targets(intent_output)

    if speech_text is None and targets_payload is None:
        return

    if targets_payload is not None:
        tool_result = {"tool_result": targets_payload, "intent_output": intent_output}
        tool_text = json.dumps(targets_payload, ensure_ascii=True)
        if tool_text.strip():
            await hass.async_add_executor_job(
                db.upsert_chat_message,
                hass,
                chat.conversation_id,
                models.ChatMessage(
                    sender="tool_result",
                    text=tool_text,
                    data=tool_result,
                ),
            )

    if speech_text is not None:
        await hass.async_add_executor_job(
            db.upsert_chat_message,
            hass,
            chat.conversation_id,
            models.ChatMessage(
                sender="assistant",
                text=speech_text,
                data={"intent_output": intent_output},
            ),
        )

    async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await _async_initialize(hass)
    return True    
    

async def _persist(hass: HomeAssistant, conversation_id: str, event_type: ChatLogEventType, data: dict[str, Any], chat_log_payload: dict[str, Any] | None, update_event: bool) -> None:
    target_chat_id = conversation_id
    existing = await hass.async_add_executor_job(
        db.fetch_latest_chat_by_conversation_id,
        hass,
        conversation_id,
    )
    has_existing = existing is not None

    if event_type == ChatLogEventType.DELETED:
        return
    if update_event or not has_existing:
        snapshot_payload = chat_log_payload
        if snapshot_payload is None:
            snapshot_payload = _fetch_chat_log_snapshot(hass, conversation_id)
        messages = _messages_from_chat_log(snapshot_payload) if snapshot_payload else []
        if not has_existing:
            new_chat = models.Chat(
                created_at=messages[0].timestamp if messages else datetime.now(timezone.utc),
                conversation_id=conversation_id,
                messages=messages,
            )
            await hass.async_add_executor_job(db.upsert_chat, hass, new_chat)
        elif messages:
            await hass.async_add_executor_job(
                db.replace_chat_messages,
                hass,
                target_chat_id,
                messages,
            )
    else:
        sender, text, timestamp, message_data = _extract_message_payload(data)
        if not text.strip():
            return
        message = models.ChatMessage(
            timestamp=timestamp,
            sender=sender,
            text=text,
            data=message_data,
        )
        await hass.async_add_executor_job(
            db.upsert_chat_message,
            hass,
            target_chat_id,
            message,
        )

    async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await hass.async_add_executor_job(db.dispose_client, hass)
    domain_data = hass.data.pop(DOMAIN, {})
    if DATA_UNSUBSCRIBE in domain_data:
        domain_data[DATA_UNSUBSCRIBE]()
    return True


async def _async_initialize(hass: HomeAssistant) -> None:
    domain_data = hass.data.setdefault(DOMAIN, {})

    @callback
    def on_chat_log_event(conversation_id: str, event_type: ChatLogEventType, data: dict[str, Any]) -> None:
        _LOGGER.debug("Chat event: %s %s %s", conversation_id, event_type, data)
        _schedule_intent_output_capture(hass, conversation_id)

        

        handled_events = {
            ChatLogEventType.CONTENT_ADDED,
            ChatLogEventType.UPDATED,
            ChatLogEventType.CREATED,
            ChatLogEventType.DELETED,
            ChatLogEventType.INITIAL_STATE,
        }
        if _CONTENT_UPDATED_EVENT is not None:
            handled_events.add(_CONTENT_UPDATED_EVENT)

        if event_type not in handled_events:
            if event_type == ChatLogEventType.DELETED:
                event_type = ChatLogEventType.UPDATED
                chat_logs = hass.data.get(DATA_CHAT_LOGS, {})
                if conversation_id in chat_logs:
                    data = chat_logs[conversation_id].as_dict()
            else:
                _LOGGER.debug("Skipping event type: %s %s", event_type, data)
                return
        
        chat_log_payload = _extract_chat_log_payload(data) if isinstance(data, dict) else None
        update_event = event_type in {
            ChatLogEventType.UPDATED,
            ChatLogEventType.CREATED,
            ChatLogEventType.INITIAL_STATE,
        } or (_CONTENT_UPDATED_EVENT is not None and event_type == _CONTENT_UPDATED_EVENT)

        hass.async_create_task(_persist(hass, conversation_id, event_type, data, chat_log_payload, update_event))

    if not domain_data.get(DATA_DB_INITIALIZED, False):
        await hass.async_add_executor_job(db.init_db, hass)
        domain_data[DATA_DB_INITIALIZED] = True

    if not domain_data.get(DATA_UNSUBSCRIBE, False):
        unsubscribe = async_subscribe_chat_logs(hass, on_chat_log_event)
        domain_data[DATA_UNSUBSCRIBE] = unsubscribe

    if not domain_data.get(DATA_API_REGISTERED, False):
        websocket.async_register_commands(hass)
        version = randint(0, 999999)
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    "/intentsity_panel.js",
                    hass.config.path("custom_components/intentsity/panel.js"),
                    False,
                ),
            ]
        )
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Intent Review",
            sidebar_icon="mdi:text-box-search",
            frontend_url_path="intentsity",
            config={
                "_panel_custom": {
                    "name": "intentsity-panel",
                    "js_url": f"/intentsity_panel.js?v={version}",
                }
            },
            require_admin=True,
        )
        domain_data[DATA_API_REGISTERED] = True
