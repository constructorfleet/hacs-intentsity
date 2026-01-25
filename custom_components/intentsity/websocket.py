from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import (
    DEFAULT_EVENT_LIMIT,
    MAX_EVENT_LIMIT,
    MIN_EVENT_LIMIT,
    SIGNAL_EVENT_RECORDED,
    WS_CMD_LIST_CHATS,
    WS_CMD_SAVE_CORRECTED_CHAT,
    WS_CMD_SUBSCRIBE_CHATS,
)
from .db import fetch_recent_chats, upsert_corrected_chat
from .models import ChatListRequest, ChatListResponse, CorrectedChatSaveRequest


_EVENT_LIMIT_SCHEMA = vol.All(
    vol.Coerce(int),
    vol.Range(min=MIN_EVENT_LIMIT, max=MAX_EVENT_LIMIT),
)
_CORRECTED_FILTER_SCHEMA = vol.In(["all", "corrected", "uncorrected"])
_DATE_FILTER_SCHEMA = vol.Any(None, vol.Coerce(str))


def async_register_commands(hass: HomeAssistant) -> None:
    """Register websocket commands for Intentsity (chat-centric)."""
    websocket_api.async_register_command(hass, websocket_list_chats)
    websocket_api.async_register_command(hass, websocket_subscribe_chats)
    websocket_api.async_register_command(hass, websocket_save_corrected_chat)



def _normalize_corrected_filter(value: str) -> bool | None:
    if value == "corrected":
        return True
    if value == "uncorrected":
        return False
    return None


async def _async_fetch_chats_payload(
    hass: HomeAssistant,
    request: ChatListRequest,
) -> dict:
    corrected = _normalize_corrected_filter(request.corrected)
    chats = await hass.async_add_executor_job(
        fetch_recent_chats,
        hass,
        request.limit,
        corrected,
        request.start,
        request.end,
    )
    if isinstance(chats, ChatListResponse):
        return chats.model_dump(mode="json")
    return ChatListResponse(chats=chats).model_dump(mode="json")



async def _async_send_chats_result(
    hass: HomeAssistant,
    connection: websocket_api.connection.ActiveConnection,
    request_id: int,
    request: ChatListRequest,
) -> None:
    payload = await _async_fetch_chats_payload(hass, request)
    connection.send_result(request_id, payload)



async def _async_send_chats_event(
    hass: HomeAssistant,
    connection: websocket_api.connection.ActiveConnection,
    request_id: int,
    request: ChatListRequest,
) -> None:
    payload = await _async_fetch_chats_payload(hass, request)
    connection.send_message(websocket_api.messages.event_message(request_id, payload))


@websocket_api.decorators.websocket_command(
    {
        vol.Required("type"): WS_CMD_LIST_CHATS,
        vol.Optional("limit", default=DEFAULT_EVENT_LIMIT): _EVENT_LIMIT_SCHEMA,
        vol.Optional("corrected", default="all"): _CORRECTED_FILTER_SCHEMA,
        vol.Optional("start"): _DATE_FILTER_SCHEMA,
        vol.Optional("end"): _DATE_FILTER_SCHEMA,
    }
)
@callback
def websocket_list_chats(hass: HomeAssistant, connection: websocket_api.connection.ActiveConnection, msg: dict) -> None:
    """Return a snapshot of recent chats."""
    request = ChatListRequest.model_validate(msg)
    hass.async_create_task(
        _async_send_chats_result(hass, connection, msg["id"], request)
    )



@websocket_api.decorators.websocket_command(
    {
        vol.Required("type"): WS_CMD_SUBSCRIBE_CHATS,
        vol.Optional("limit", default=DEFAULT_EVENT_LIMIT): _EVENT_LIMIT_SCHEMA,
        vol.Optional("corrected", default="all"): _CORRECTED_FILTER_SCHEMA,
        vol.Optional("start"): _DATE_FILTER_SCHEMA,
        vol.Optional("end"): _DATE_FILTER_SCHEMA,
    }
)
@callback
def websocket_subscribe_chats(
    hass: HomeAssistant,
    connection: websocket_api.connection.ActiveConnection,
    msg: dict,
) -> None:
    """Subscribe to live chat event updates."""
    request_id: int = msg["id"]
    connection.send_result(request_id)
    request = ChatListRequest.model_validate(msg)

    async def _push_snapshot() -> None:
        await _async_send_chats_event(hass, connection, request_id, request)

    @callback
    def _handle_new_event(*_: object) -> None:
        hass.async_create_task(_push_snapshot())

    unsubscribe = async_dispatcher_connect(hass, SIGNAL_EVENT_RECORDED, _handle_new_event)
    connection.subscriptions[request_id] = unsubscribe
    hass.async_create_task(_push_snapshot())


@websocket_api.decorators.websocket_command(
    {
        vol.Required("type"): WS_CMD_SAVE_CORRECTED_CHAT,
        vol.Required("conversation_id"): vol.Coerce(str),
        vol.Required("pipeline_run_id"): vol.Coerce(str),
        vol.Required("messages"): list,
    }
)
@callback
def websocket_save_corrected_chat(
    hass: HomeAssistant,
    connection: websocket_api.connection.ActiveConnection,
    msg: dict,
) -> None:
    """Persist corrected chat messages for a given original chat."""
    request = CorrectedChatSaveRequest.model_validate(msg)

    async def _save() -> None:
        await hass.async_add_executor_job(
            upsert_corrected_chat,
            hass,
            request.conversation_id,
            request.pipeline_run_id,
            request.messages,
        )
        async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)
        connection.send_result(msg["id"])

    hass.async_create_task(_save())
