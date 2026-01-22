from __future__ import annotations

import logging
from datetime import datetime, timezone
from random import randint
from typing import Any

import voluptuous as vol

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEventType,
)
from homeassistant.components.conversation.chat_log import async_subscribe_chat_logs
from homeassistant.components.conversation.const import ChatLogEventType
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.components.http import StaticPathConfig
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import db, websocket
from .const import DOMAIN, SIGNAL_EVENT_RECORDED

_LOGGER = logging.getLogger(__name__)


DATA_DB_INITIALIZED = "db_initialized"
DATA_API_REGISTERED = "api_registered"
DATA_RUN_CREATED_AT = "run_created_at"
LOGGABLE_EVENTS = {
    PipelineEventType.INTENT_START,
    PipelineEventType.INTENT_END,
    PipelineEventType.INTENT_PROGRESS,
}

CONFIG_SCHEMA = vol.Schema({
    vol.Optional(DOMAIN): vol.Schema({}),
}, extra=vol.ALLOW_EXTRA,)






async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # Subscribe to chat log events instead of monkey patching pipeline
    async_subscribe_chat_logs(hass, lambda cid, et, data: chat_log_callback(hass, cid, et, data))
    await _async_initialize(hass)
    return True



def chat_log_callback(hass: HomeAssistant, conversation_id: str, event_type: ChatLogEventType, data: dict[str, Any]) -> None:
    # Receive chat log events from Home Assistant's conversation integration
    _LOGGER.info("Chat event: %s %s %s", conversation_id, event_type, data)
    
    # We only care about CONTENT_ADDED for now
    if event_type != ChatLogEventType.CONTENT_ADDED:
        return

    from .models import ChatMessage, Chat
    
    # Prepare message model
    message = ChatMessage(
        timestamp=datetime.now(timezone.utc),
        sender=data.get("sender", "unknown"),
        text=data.get("message", ""),
        data=data,
    )

    # In a real setup, we might want to map conversation_id to an existing Chat record
    # For simplicity, we'll try to find a recent chat with this conversation_id or create a new one
    # But since this is a callback (sync), we need to use a task or executor for DB work
    from . import db
    
    @callback
    def _async_persist():
        # This is a bit complex for a callback. Let's run it in a task.
        async def _persist():
            # In a more robust implementation, we might cache the chat_id for a conversation_id
            # For now, we'll just insert it as a new chat if we don't have a mapping, 
            # or we could just always create a new Chat record if we want strictly message-by-message logs.
            # Actually, the requirement was "one-to-many to ChatMessages".
            # Let's see if we can find a recent chat.
            chats = await hass.async_add_executor_job(db.fetch_recent_chats, hass, 1)
            target_chat_id = None
            if chats and chats[0].conversation_id == conversation_id:
                target_chat_id = chats[0].id
            
            if target_chat_id is None:
                # Create a new Chat record
                new_chat = Chat(
                    created_at=datetime.now(timezone.utc),
                    conversation_id=conversation_id,
                    messages=[message]
                )
                await hass.async_add_executor_job(db.insert_chat, hass, new_chat)
            else:
                # Add to existing Chat record
                await hass.async_add_executor_job(db.insert_chat_message, hass, target_chat_id, message)
            
            async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)

        hass.async_create_task(_persist())

    _async_persist()



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
        await hass.http.async_register_static_paths([
            StaticPathConfig(
                "/intentsity_panel.js",
                hass.config.path("custom_components/intentsity/panel.js"),
                False,
            ),
        ])
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


























