"""Service actions package for intentsity."""

from __future__ import annotations

from typing import TYPE_CHECKING

from custom_components.intentsity.const import DOMAIN, LOGGER
from custom_components.intentsity.service_actions.example_service import (
    async_handle_example_action,
    async_handle_reload_data,
)
from custom_components.intentsity.service_actions.intents import (
    SERVICE_CREATE_INTENT,
    SERVICE_DELETE_INTENT,
    SERVICE_EXPORT_INTENTS,
    SERVICE_IMPORT_INTENTS,
    SERVICE_UPDATE_INTENT,
    async_handle_create_intent,
    async_handle_delete_intent,
    async_handle_export_intents,
    async_handle_import_intents,
    async_handle_update_intent,
)
from homeassistant.core import ServiceCall

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

# Service action names - only used within service_actions module
SERVICE_EXAMPLE_ACTION = "example_action"
SERVICE_RELOAD_DATA = "reload_data"


async def async_setup_services(hass: HomeAssistant) -> None:
    """
    Register services for the integration.

    Services are registered at component level (in async_setup) rather than
    per config entry. This is a Silver Quality Scale requirement and ensures:
    - Service validation works correctly
    - Services are available even without config entries
    - Helpful error messages are provided

    Service handlers iterate over all config entries to find the relevant one.
    """

    async def handle_example_action(call: ServiceCall) -> None:
        """Handle the example_action service call."""
        # Find all config entries for this domain
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return

        # Use first entry (or implement logic to select specific entry)
        entry = entries[0]
        await async_handle_example_action(hass, entry, call)

    async def handle_reload_data(call: ServiceCall) -> None:
        """Handle the reload_data service call."""
        # Find all config entries for this domain
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return

        # Reload data for all entries
        for entry in entries:
            await async_handle_reload_data(hass, entry, call)

    # Register services (only once at component level)
    if not hass.services.has_service(DOMAIN, SERVICE_EXAMPLE_ACTION):
        hass.services.async_register(
            DOMAIN,
            SERVICE_EXAMPLE_ACTION,
            handle_example_action,
        )

    if not hass.services.has_service(DOMAIN, SERVICE_RELOAD_DATA):
        hass.services.async_register(
            DOMAIN,
            SERVICE_RELOAD_DATA,
            handle_reload_data,
        )

    # Intent CRUD services
    async def _handle_create_intent(call: ServiceCall) -> None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return
        entry = entries[0]
        await async_handle_create_intent(hass, entry, call)

    async def _handle_update_intent(call: ServiceCall) -> None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return
        entry = entries[0]
        await async_handle_update_intent(hass, entry, call)

    async def _handle_delete_intent(call: ServiceCall) -> None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return
        entry = entries[0]
        await async_handle_delete_intent(hass, entry, call)

    async def _handle_export_intents(call: ServiceCall) -> None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return
        entry = entries[0]
        await async_handle_export_intents(hass, entry, call)

    async def _handle_import_intents(call: ServiceCall) -> None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            LOGGER.warning("No config entries found for %s", DOMAIN)
            return
        entry = entries[0]
        await async_handle_import_intents(hass, entry, call)

    if not hass.services.has_service(DOMAIN, SERVICE_CREATE_INTENT):
        hass.services.async_register(DOMAIN, SERVICE_CREATE_INTENT, _handle_create_intent)

    if not hass.services.has_service(DOMAIN, SERVICE_UPDATE_INTENT):
        hass.services.async_register(DOMAIN, SERVICE_UPDATE_INTENT, _handle_update_intent)

    if not hass.services.has_service(DOMAIN, SERVICE_DELETE_INTENT):
        hass.services.async_register(DOMAIN, SERVICE_DELETE_INTENT, _handle_delete_intent)

    if not hass.services.has_service(DOMAIN, SERVICE_EXPORT_INTENTS):
        hass.services.async_register(DOMAIN, SERVICE_EXPORT_INTENTS, _handle_export_intents)

    if not hass.services.has_service(DOMAIN, SERVICE_IMPORT_INTENTS):
        hass.services.async_register(DOMAIN, SERVICE_IMPORT_INTENTS, _handle_import_intents)

    LOGGER.debug("Services registered for %s", DOMAIN)
