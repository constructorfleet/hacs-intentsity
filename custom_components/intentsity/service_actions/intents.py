"""Service action handlers for intent CRUD and import/export."""

from __future__ import annotations

from custom_components.intentsity.const import LOGGER
from custom_components.intentsity.data import validate_intent_payload
from custom_components.intentsity.utils.storage_helpers import get_intentsity_storage
from homeassistant.core import HomeAssistant, ServiceCall

SERVICE_CREATE_INTENT = "create_intent"
SERVICE_UPDATE_INTENT = "update_intent"
SERVICE_DELETE_INTENT = "delete_intent"
SERVICE_EXPORT_INTENTS = "export_intents"
SERVICE_IMPORT_INTENTS = "import_intents"


async def async_handle_create_intent(hass: HomeAssistant, entry, call: ServiceCall) -> None:
    """Handle creating an intent via service call."""
    payload = call.data.get("payload") or {}
    storage = get_intentsity_storage(entry)
    try:
        intent = validate_intent_payload(payload)
        await storage.async_set_intent(intent)
        LOGGER.info("Created intent %s", intent.id)
    except (ValueError, TypeError) as exc:
        LOGGER.exception("Failed to create intent (validation): %s", exc)


async def async_handle_update_intent(hass: HomeAssistant, entry, call: ServiceCall) -> None:
    """Handle updating an intent via service call."""
    intent_id = call.data.get("intent_id")
    payload = call.data.get("payload") or {}
    storage = get_intentsity_storage(entry)
    if not intent_id:
        LOGGER.warning("update_intent called without intent_id")
        return
    try:
        # Validate and overwrite the intent
        intent = validate_intent_payload(payload)
        if intent.id != intent_id:
            LOGGER.warning("Intent ID mismatch: payload.id=%s, call.intent_id=%s", intent.id, intent_id)
            return
        await storage.async_set_intent(intent)
        LOGGER.info("Updated intent %s", intent_id)
    except (ValueError, TypeError) as exc:
        LOGGER.exception("Failed to update intent (validation): %s", exc)


async def async_handle_delete_intent(hass: HomeAssistant, entry, call: ServiceCall) -> None:
    """Handle deleting an intent via service call."""
    intent_id = call.data.get("intent_id")
    storage = get_intentsity_storage(entry)
    if not intent_id:
        LOGGER.warning("delete_intent called without intent_id")
        return
    await storage.async_delete_intent(intent_id)
    LOGGER.info("Deleted intent %s", intent_id)


async def async_handle_export_intents(hass: HomeAssistant, entry, call: ServiceCall) -> None:
    """Export intents and include them in service response where supported."""
    storage = get_intentsity_storage(entry)
    intents = await storage.async_list_intents()
    # For now, just log the export; in the future, could return via websocket or file
    LOGGER.info("Exported %d intents", len(intents))


async def async_handle_import_intents(hass: HomeAssistant, entry, call: ServiceCall) -> None:
    """Import intents from JSON payload (list of intent dicts)."""
    payload = call.data.get("payload")
    storage = get_intentsity_storage(entry)
    if not payload or not isinstance(payload, list):
        LOGGER.warning("import_intents requires a list payload")
        return
    created = 0
    for item in payload:
        try:
            intent = validate_intent_payload(item)
            await storage.async_set_intent(intent)
            created += 1
        except (ValueError, TypeError) as exc:
            LOGGER.exception("Failed to import intent (validation): %s - %s", item, exc)
    LOGGER.info("Imported %d intents", created)
