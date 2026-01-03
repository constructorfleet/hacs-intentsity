"""WebSocket API for Intentsity.

Provides CRUD commands for intents so the frontend can manage intents
without direct file access. Commands are registered during
`async_setup_entry` in the integration.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .coordinator.base import IntentsCoordinator


def _get_entry_for_msg(hass: HomeAssistant, msg: dict[str, Any]):
    entry_id = msg.get("entry_id")
    if not isinstance(entry_id, str):
        return None
    return hass.config_entries.async_get_entry(entry_id)


async def websocket_list_intents(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Return list of intents for the given config entry."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry or not entry.runtime_data.intents_coordinator:
        connection.send_error(msg["id"], "no_entry", "No such config entry or intents not available")
        return
    intents_coord: IntentsCoordinator = entry.runtime_data.intents_coordinator
    intents = await intents_coord.async_list_intents()
    connection.send_result(msg["id"], [i.to_dict() for i in intents])


async def websocket_create_intent(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Create a new intent for the config entry."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry or not entry.runtime_data.intents_coordinator:
        connection.send_error(msg["id"], "no_entry", "No such config entry or intents not available")
        return
    payload = msg.get("intent")
    if not isinstance(payload, dict):
        connection.send_error(msg["id"], "invalid_payload", "Missing or invalid intent payload")
        return
    intents_coord: IntentsCoordinator = entry.runtime_data.intents_coordinator
    try:
        intent = await intents_coord.async_create_intent(payload)
    except (ValueError, TypeError) as exc:
        connection.send_error(msg["id"], "invalid_payload", str(exc))
        return
    connection.send_result(msg["id"], intent.to_dict())


async def websocket_update_intent(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Update an existing intent."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry or not entry.runtime_data.intents_coordinator:
        connection.send_error(msg["id"], "no_entry", "No such config entry or intents not available")
        return
    intent_id = msg.get("intent_id")
    update = msg.get("intent")
    if not isinstance(intent_id, str) or not isinstance(update, dict):
        connection.send_error(msg["id"], "invalid_payload", "Missing intent_id or intent payload")
        return
    intents_coord: IntentsCoordinator = entry.runtime_data.intents_coordinator
    try:
        updated = await intents_coord.async_update_intent(intent_id, update)
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Intent not found")
        return
    except (ValueError, TypeError) as exc:
        connection.send_error(msg["id"], "update_failed", str(exc))
        return
    connection.send_result(msg["id"], updated.to_dict())


async def websocket_delete_intent(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Delete an intent by id."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry or not entry.runtime_data.intents_coordinator:
        connection.send_error(msg["id"], "no_entry", "No such config entry or intents not available")
        return
    intent_id = msg.get("intent_id")
    if not isinstance(intent_id, str):
        connection.send_error(msg["id"], "invalid_payload", "Missing intent_id")
        return
    intents_coord: IntentsCoordinator = entry.runtime_data.intents_coordinator
    await intents_coord.async_delete_intent(intent_id)
    connection.send_result(msg["id"], {"deleted": intent_id})


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register websocket commands with Home Assistant websocket API.

    Register lightweight synchronous wrappers that schedule the async
    coroutine handlers. The websocket API expects a callable that does not
    return a coroutine (the wrapper will schedule the coroutine and return
    immediately), which keeps the registration compatible with the runtime
    typing in this workspace.
    """

    def _wrap(coro):
        def _handler(hass_inner, connection, msg):
            hass_inner.async_create_task(coro(hass_inner, connection, msg))

        return _handler

    websocket_api.async_register_command(hass, _wrap(websocket_list_intents))
    websocket_api.async_register_command(hass, _wrap(websocket_create_intent))
    websocket_api.async_register_command(hass, _wrap(websocket_update_intent))
    websocket_api.async_register_command(hass, _wrap(websocket_delete_intent))
