from __future__ import annotations

import json
import logging
from collections.abc import Mapping
from datetime import datetime, timezone
from random import randint
from typing import Any, Awaitable, Callable

import voluptuous as vol

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
    PipelineRun,
)
from homeassistant.components.conversation.chat_log import async_subscribe_chat_logs
from homeassistant.components.conversation.const import ChatLogEventType
from homeassistant.components.frontend import add_extra_js_url, async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.components.http import StaticPathConfig
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import db, view, websocket
from .const import DOMAIN, SIGNAL_EVENT_RECORDED

_LOGGER = logging.getLogger(__name__)


OriginalProcessEvent = Callable[[PipelineRun, PipelineEvent], Awaitable[None] | None]
import json
from datetime import datetime, date

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return super().default(o)

_ORIGINAL_PROCESS_EVENT: OriginalProcessEvent | None = None

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
    async_subscribe_chat_logs(hass, chat_log_callback)
    await _async_initialize(hass)
    return True



def chat_log_callback(conversation_id: str, event_type: ChatLogEventType, data: dict[str, Any]) -> None:
    # This callback will receive chat log events from Home Assistant's conversation integration
    _LOGGER.info(json.dumps({
        "conversation_id": conversation_id,
        "event_type": event_type,
        "data": data,
    }, cls=DateTimeEncoder))



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



























