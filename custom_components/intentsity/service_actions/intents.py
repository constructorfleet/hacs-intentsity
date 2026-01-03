"""Service action handlers for intent CRUD and import/export."""

from __future__ import annotations

from typing import TYPE_CHECKING

from custom_components.intentsity.const import LOGGER
from custom_components.intentsity.data import validate_intent_payload
from homeassistant.core import HomeAssistant, ServiceCall

if TYPE_CHECKING:
    from custom_components.intentsity.data import IntentsityConfigEntry


SERVICE_CREATE_INTENT = "create_intent"
SERVICE_UPDATE_INTENT = "update_intent"
SERVICE_DELETE_INTENT = "delete_intent"
SERVICE_EXPORT_INTENTS = "export_intents"
SERVICE_IMPORT_INTENTS = "import_intents"


async def async_handle_create_intent(hass: HomeAssistant, entry: IntentsityConfigEntry, call: ServiceCall) -> None:
    """Handle creating an intent via service call."""
    payload = call.data.get("payload") or {}
    try:
        intent = await entry.runtime_data.client.async_create_intent(payload)
        LOGGER.info("Created intent %s", intent.get("id"))
    except (ValueError, TypeError) as exc:  # pragma: no cover - validation/logging
        LOGGER.exception("Failed to create intent (validation): %s", exc)


async def async_handle_update_intent(hass: HomeAssistant, entry: IntentsityConfigEntry, call: ServiceCall) -> None:
    """Handle updating an intent via service call."""
    intent_id = call.data.get("intent_id")
    payload = call.data.get("payload") or {}
    if not intent_id:
        LOGGER.warning("update_intent called without intent_id")
        return
    try:
        intent = await entry.runtime_data.client.async_update_intent(intent_id, payload)
        LOGGER.info("Updated intent %s", intent.get("id"))
    except KeyError:
        LOGGER.warning("Intent not found: %s", intent_id)
    except (ValueError, TypeError) as exc:  # pragma: no cover
        LOGGER.exception("Failed to update intent (validation): %s", exc)


async def async_handle_delete_intent(hass: HomeAssistant, entry: IntentsityConfigEntry, call: ServiceCall) -> None:
    """Handle deleting an intent via service call."""
    intent_id = call.data.get("intent_id")
    if not intent_id:
        LOGGER.warning("delete_intent called without intent_id")
        return
    try:
        await entry.runtime_data.client.async_delete_intent(intent_id)
        LOGGER.info("Deleted intent %s", intent_id)
    except KeyError:
        LOGGER.warning("Attempted to delete non-existent intent: %s", intent_id)


async def async_handle_export_intents(hass: HomeAssistant, entry: IntentsityConfigEntry, call: ServiceCall) -> None:
    """Export intents and include them in service response where supported."""
    intents = await entry.runtime_data.client.async_list_intents()
    LOGGER.info("Exported %d intents", len(intents))
    # Home Assistant service calls do not return data to caller, but we log it


async def async_handle_import_intents(hass: HomeAssistant, entry: IntentsityConfigEntry, call: ServiceCall) -> None:
    """Import intents from JSON payload (list of intent dicts)."""
    payload = call.data.get("payload")
    if not payload or not isinstance(payload, list):
        LOGGER.warning("import_intents requires a list payload")
        return
    created = 0
    for item in payload:
        try:
            # Validate structure first
            validate_intent_payload(item)
            await entry.runtime_data.client.async_create_intent(item)
            created += 1
        except (ValueError, TypeError) as exc:
            LOGGER.exception("Failed to import intent (validation): %s - %s", item, exc)
    LOGGER.info("Imported %d intents", created)
