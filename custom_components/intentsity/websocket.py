"""WebSocket API for Intentsity.

Provides CRUD commands for intents so the frontend can manage intents
without direct file access. Commands are registered during
`async_setup_entry` in the integration.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.decorators import async_response, websocket_command
from homeassistant.core import HomeAssistant, callback

from .data import validate_intent_payload
from .utils.storage_helpers import get_intentsity_storage

_LOGGER = logging.getLogger(__name__)


class WebSocketError(RuntimeError):
    """Raised when a websocket API operation fails."""


class WebSocketHandler:
    """Compatibility wrapper for registering websocket commands."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the WebSocketHandler."""
        self._hass = hass

    def register(self) -> None:
        """Register websocket commands on the provided Home Assistant instance."""
        async_register_websocket_commands(self._hass)


def _get_entry_for_msg(hass: HomeAssistant, msg: dict[str, Any]):
    """Get the config entry for the given message."""
    entry_id = msg.get("entry_id")
    if not isinstance(entry_id, str):
        return None
    return hass.config_entries.async_get_entry(entry_id)


@websocket_command(
    {
        vol.Required("type"): "intentsity/list_intents",
        vol.Required("entry_id"): str,
    }
)
@async_response
async def websocket_list_intents(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Return list of intents for the given config entry."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry:
        connection.send_error(msg["id"], "no_entry", "No such config entry")
        return

    storage = get_intentsity_storage(entry)
    intents = await storage.async_list_intents()
    connection.send_result(msg["id"], [intent.to_dict() for intent in intents])


@websocket_command(
    {
        vol.Required("type"): "intentsity/create_intent",
        vol.Required("entry_id"): str,
        vol.Required("intent"): dict,
    }
)
@async_response
async def websocket_create_intent(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Create a new intent for the config entry."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry:
        connection.send_error(msg["id"], "no_entry", "No such config entry")
        return
    payload = msg.get("intent")
    if not isinstance(payload, dict):
        connection.send_error(msg["id"], "invalid_payload", "Missing or invalid intent payload")
        return

    storage = get_intentsity_storage(entry)
    try:
        intent = validate_intent_payload(payload)
    except (TypeError, ValueError) as exc:
        connection.send_error(msg["id"], "invalid_payload", str(exc))
        return
    await storage.async_set_intent(intent)
    connection.send_result(msg["id"], intent.to_dict())


@websocket_command(
    {
        vol.Required("type"): "intentsity/update_intent",
        vol.Required("entry_id"): str,
        vol.Required("intent_id"): str,
        vol.Required("intent"): dict,
    }
)
@async_response
async def websocket_update_intent(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Update an existing intent."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry:
        connection.send_error(msg["id"], "no_entry", "No such config entry")
        return
    intent_id = msg.get("intent_id")
    update = msg.get("intent")
    if not isinstance(intent_id, str) or not isinstance(update, dict):
        connection.send_error(msg["id"], "invalid_payload", "Missing intent_id or intent payload")
        return

    storage = get_intentsity_storage(entry)
    update = dict(update)
    update.setdefault("id", intent_id)
    try:
        intent = validate_intent_payload(update)
    except (TypeError, ValueError) as exc:
        connection.send_error(msg["id"], "invalid_payload", str(exc))
        return
    if intent.id != intent_id:
        connection.send_error(msg["id"], "id_mismatch", "intent_id does not match payload id")
        return
    try:
        await storage.async_set_intent(intent)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "update_failed", str(err))
        return
    connection.send_result(msg["id"], intent.to_dict())


@websocket_command(
    {
        vol.Required("type"): "intentsity/delete_intent",
        vol.Required("entry_id"): str,
        vol.Required("intent_id"): str,
    }
)
@async_response
async def websocket_delete_intent(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Delete an intent by id."""
    entry = _get_entry_for_msg(hass, msg)
    if not entry:
        connection.send_error(msg["id"], "no_entry", "No such config entry")
        return
    intent_id = msg.get("intent_id")
    if not isinstance(intent_id, str):
        connection.send_error(msg["id"], "invalid_payload", "Missing intent_id")
        return

    storage = get_intentsity_storage(entry)
    await storage.async_delete_intent(intent_id)
    connection.send_result(msg["id"], {"deleted": intent_id})


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register websocket commands with Home Assistant websocket API.

    Register lightweight synchronous wrappers that schedule the async
    coroutine handlers. The websocket API expects a callable that does not
    return a coroutine (the wrapper will schedule the coroutine and return
    immediately), which keeps the registration compatible with the runtime
    typing in this workspace.
    """

    websocket_api.async_register_command(hass, websocket_list_intents)
    websocket_api.async_register_command(hass, websocket_create_intent)
    websocket_api.async_register_command(hass, websocket_update_intent)
    websocket_api.async_register_command(hass, websocket_delete_intent)
