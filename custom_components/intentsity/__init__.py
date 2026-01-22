from __future__ import annotations

from collections.abc import Callable
import logging
from datetime import datetime, timezone
from random import randint
from typing import Any

import voluptuous as vol

from homeassistant.components.conversation.chat_log import (
    DATA_CHAT_LOGS,
    ChatLog,
    async_get_chat_log,
    async_subscribe_chat_logs,
)
from homeassistant.components.conversation.const import ChatLogEventType
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.chat_session import async_get_chat_session
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import db, websocket, models
from .const import DATA_CHAT_MAP, DOMAIN, SIGNAL_EVENT_RECORDED

_LOGGER = logging.getLogger(__name__)


DATA_DB_INITIALIZED = "db_initialized"
DATA_API_REGISTERED = "api_registered"
CONFIG_SCHEMA = vol.Schema({
    vol.Optional(DOMAIN): vol.Schema({}),
}, extra=vol.ALLOW_EXTRA,)

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


def _chat_map(hass: HomeAssistant) -> dict[str, int]:
    domain_data = hass.data.setdefault(DOMAIN, {})
    chat_map = domain_data.get(DATA_CHAT_MAP)
    if not isinstance(chat_map, dict):
        chat_map = {}
        domain_data[DATA_CHAT_MAP] = chat_map
    return chat_map


def _delta_handles(hass: HomeAssistant) -> dict[str, Callable[[], None]]:
    domain_data = hass.data.setdefault(DOMAIN, {})
    handles = domain_data.get("delta_handles")
    if not isinstance(handles, dict):
        handles = {}
        domain_data["delta_handles"] = handles
    return handles


def _delta_listeners(hass: HomeAssistant) -> dict[str, Callable[[ChatLog, dict[str, Any]], None]]:
    domain_data = hass.data.setdefault(DOMAIN, {})
    listeners = domain_data.get("delta_listeners")
    if not isinstance(listeners, dict):
        listeners = {}
        domain_data["delta_listeners"] = listeners
    return listeners


def _delta_originals(hass: HomeAssistant) -> dict[str, Callable[[ChatLog, dict[str, Any]], None]]:
    domain_data = hass.data.setdefault(DOMAIN, {})
    originals = domain_data.get("delta_originals")
    if not isinstance(originals, dict):
        originals = {}
        domain_data["delta_originals"] = originals
    return originals


def _cancel_delta_handle(hass: HomeAssistant, conversation_id: str) -> None:
    handles = _delta_handles(hass)
    cancel = handles.pop(conversation_id, None)
    if cancel is not None:
        cancel()


def _schedule_delta_snapshot(
    hass: HomeAssistant,
    conversation_id: str,
    chat_log: ChatLog,
) -> None:
    _cancel_delta_handle(hass, conversation_id)

    async def _fire_snapshot(_: datetime) -> None:
        _cancel_delta_handle(hass, conversation_id)
        await _persist_snapshot_from_log(hass, conversation_id, chat_log)

    handles = _delta_handles(hass)
    handles[conversation_id] = async_call_later(hass, 0.2, _fire_snapshot)


def _ensure_delta_listener(hass: HomeAssistant, conversation_id: str) -> None:
    chat_logs = hass.data.get(DATA_CHAT_LOGS)
    if not isinstance(chat_logs, dict):
        return
    chat_log = chat_logs.get(conversation_id)
    if chat_log is None:
        return

    listeners = _delta_listeners(hass)
    if conversation_id in listeners:
        return

    existing = getattr(chat_log, "delta_listener", None)

    def _listener(log: ChatLog, delta: dict[str, Any]) -> None:
        if existing is not None:
            existing(log, delta)
        _schedule_delta_snapshot(hass, conversation_id, log)

    listeners[conversation_id] = _listener
    if existing is not None:
        _delta_originals(hass)[conversation_id] = existing
    chat_log.delta_listener = _listener


def _clear_delta_listener(hass: HomeAssistant, conversation_id: str) -> None:
    chat_logs = hass.data.get(DATA_CHAT_LOGS)
    if not isinstance(chat_logs, dict):
        return
    chat_log = chat_logs.get(conversation_id)
    if chat_log is None:
        return

    listeners = _delta_listeners(hass)
    listener = listeners.pop(conversation_id, None)
    if listener is None:
        return

    original = _delta_originals(hass).pop(conversation_id, None)
    if getattr(chat_log, "delta_listener", None) is listener:
        chat_log.delta_listener = original


def _extract_chat_log_payload(data: dict[str, Any]) -> dict[str, Any] | None:
    chat_log_payload = data.get("chat_log")
    if isinstance(chat_log_payload, dict):
        return chat_log_payload
    if isinstance(data.get("content"), list):
        return {"content": data["content"]}
    return None


def _fetch_chat_log_snapshot(hass: HomeAssistant, conversation_id: str) -> dict[str, Any]:
    with (
        async_get_chat_session(hass, conversation_id) as session,
        async_get_chat_log(hass, session) as chat_log,
    ):
        return chat_log.as_dict()


async def _persist_snapshot_from_log(
    hass: HomeAssistant,
    conversation_id: str,
    chat_log: ChatLog,
) -> None:
    chat_map = _chat_map(hass)
    target_chat_id = chat_map.get(conversation_id)
    if target_chat_id is None:
        existing = await hass.async_add_executor_job(
            db.fetch_latest_chat_by_conversation_id,
            hass,
            conversation_id,
        )
        if existing is not None:
            target_chat_id = existing.id
            if target_chat_id is not None:
                chat_map[conversation_id] = target_chat_id

    messages = _messages_from_chat_log(chat_log.as_dict())
    if target_chat_id is None:
        new_chat = models.Chat(
            created_at=messages[0].timestamp if messages else datetime.now(timezone.utc),
            conversation_id=conversation_id,
            messages=messages,
        )
        target_chat_id = await hass.async_add_executor_job(db.insert_chat, hass, new_chat)
        if target_chat_id is not None:
            chat_map[conversation_id] = target_chat_id
    elif messages:
        await hass.async_add_executor_job(
            db.replace_chat_messages,
            hass,
            target_chat_id,
            messages,
        )
    async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # Subscribe to chat log events instead of monkey patching pipeline
    async_subscribe_chat_logs(hass, lambda cid, et, data: chat_log_callback(hass, cid, et, data))
    await _async_initialize(hass)
    return True


@callback
def chat_log_callback(hass: HomeAssistant, conversation_id: str, event_type: ChatLogEventType, data: dict[str, Any]) -> None:
    # Receive chat log events from Home Assistant's conversation integration
    _LOGGER.warning("Chat event: %s %s %s", conversation_id, event_type, data)

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
            _LOGGER.warning(f"Skipping event type: {event_type} {data}")
            return

    from .models import ChatMessage, Chat
    
    chat_log_payload = _extract_chat_log_payload(data) if isinstance(data, dict) else None
    update_event = event_type in {
        ChatLogEventType.UPDATED,
        ChatLogEventType.CREATED,
        ChatLogEventType.INITIAL_STATE,
    } or (_CONTENT_UPDATED_EVENT is not None and event_type == _CONTENT_UPDATED_EVENT)

    if event_type == ChatLogEventType.CREATED:
        _ensure_delta_listener(hass, conversation_id)

    hass.async_create_task(_persist(hass, conversation_id, event_type, data, chat_log_payload, update_event))
    

async def _persist(hass: HomeAssistant, conversation_id: str, event_type: ChatLogEventType, data: dict[str, Any], chat_log_payload: dict[str, Any] | None, update_event: bool) -> None:
    chat_map = _chat_map(hass)
    target_chat_id = chat_map.get(conversation_id)
    if target_chat_id is None:
        existing = await hass.async_add_executor_job(
            db.fetch_latest_chat_by_conversation_id,
            hass,
            conversation_id,
        )
        if existing is not None:
            target_chat_id = existing.id
            if target_chat_id is not None:
                chat_map[conversation_id] = target_chat_id

    if event_type == ChatLogEventType.DELETED:
        chat_map.pop(conversation_id, None)
        _clear_delta_listener(hass, conversation_id)
        _cancel_delta_handle(hass, conversation_id)
        return

    if update_event or target_chat_id is None:
        snapshot_payload = chat_log_payload
        if snapshot_payload is None:
            snapshot_payload = _fetch_chat_log_snapshot(hass, conversation_id)
        messages = _messages_from_chat_log(snapshot_payload) if snapshot_payload else []
        if target_chat_id is None:
            new_chat = models.Chat(
                created_at=messages[0].timestamp if messages else datetime.now(timezone.utc),
                conversation_id=conversation_id,
                messages=messages,
            )
            target_chat_id = await hass.async_add_executor_job(db.insert_chat, hass, new_chat)
            if target_chat_id is not None:
                chat_map[conversation_id] = target_chat_id
        elif messages:
            await hass.async_add_executor_job(
                db.replace_chat_messages,
                hass,
                target_chat_id,
                messages,
            )
    else:
        sender, text, timestamp, message_data = _extract_message_payload(data)
        message = models.ChatMessage(
            timestamp=timestamp,
            sender=sender,
            text=text,
            data=message_data,
        )
        await hass.async_add_executor_job(
            db.insert_chat_message,
            hass,
            target_chat_id,
            message,
        )

    async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await hass.async_add_executor_job(db.dispose_client, hass)
    hass.data.pop(DOMAIN, None)
    return True



async def _async_initialize(hass: HomeAssistant) -> None:
    domain_data = hass.data.setdefault(DOMAIN, {})

    if not domain_data.get(DATA_DB_INITIALIZED, False):
        await hass.async_add_executor_job(db.init_db, hass)
        domain_data[DATA_DB_INITIALIZED] = True

    # No longer patching pipeline events; chat log subscription is used instead

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





