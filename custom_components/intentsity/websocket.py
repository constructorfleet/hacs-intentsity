from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import (
    DEFAULT_EVENT_LIMIT,
    MAX_EVENT_LIMIT,
    MIN_EVENT_LIMIT,
    SIGNAL_EVENT_RECORDED,
    WS_CMD_LIST_EVENTS,
    WS_CMD_SUBSCRIBE_EVENTS,
)
from .db import fetch_recent_runs
from .models import IntentRunListResponse

_EVENT_LIMIT_SCHEMA = vol.All(
    vol.Coerce(int),
    vol.Range(min=MIN_EVENT_LIMIT, max=MAX_EVENT_LIMIT),
)


def async_register_commands(hass: HomeAssistant) -> None:
    """Register websocket commands for Intentsity."""

    websocket_api.async_register_command(hass, websocket_list_events)
    websocket_api.async_register_command(hass, websocket_subscribe_events)


async def _async_fetch_payload(hass: HomeAssistant, limit: int) -> dict:
    runs = await hass.async_add_executor_job(fetch_recent_runs, hass, limit)
    if isinstance(runs, IntentRunListResponse):
        return runs.model_dump(mode="json")
    return IntentRunListResponse(runs=runs).model_dump(mode="json")


async def _async_send_result(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    request_id: int,
    limit: int,
) -> None:
    payload = await _async_fetch_payload(hass, limit)
    connection.send_result(request_id, payload)


async def _async_send_event(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    request_id: int,
    limit: int,
) -> None:
    payload = await _async_fetch_payload(hass, limit)
    connection.send_message(websocket_api.event_message(request_id, payload))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_CMD_LIST_EVENTS,
        vol.Optional("limit", default=DEFAULT_EVENT_LIMIT): _EVENT_LIMIT_SCHEMA,
    }
)
@callback
def websocket_list_events(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Return a snapshot of recent intent events."""

    limit: int = msg["limit"]
    hass.async_create_task(_async_send_result(hass, connection, msg["id"], limit))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_CMD_SUBSCRIBE_EVENTS,
        vol.Optional("limit", default=DEFAULT_EVENT_LIMIT): _EVENT_LIMIT_SCHEMA,
    }
)
@callback
def websocket_subscribe_events(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Subscribe to live intent event updates."""

    limit: int = msg["limit"]
    request_id: int = msg["id"]

    connection.send_result(request_id)

    async def _push_snapshot() -> None:
        await _async_send_event(hass, connection, request_id, limit)

    @callback
    def _handle_new_event(*_: object) -> None:
        hass.async_create_task(_push_snapshot())

    unsubscribe = async_dispatcher_connect(hass, SIGNAL_EVENT_RECORDED, _handle_new_event)

    connection.subscriptions[request_id] = unsubscribe
    hass.async_create_task(_push_snapshot())
