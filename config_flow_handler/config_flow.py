"""Config flow for Intentsity integration.

Exposes supported subentry types for intent management.
"""

from __future__ import annotations

from custom_components.intentsity.config_flow_handler.subentry_flow import IntentsityIntentSubentryFlow
from custom_components.intentsity.coordinator.base import IntentsCoordinator
from homeassistant.config_entries import ConfigFlow
from homeassistant.core import HomeAssistant


class IntentsityConfigFlow(ConfigFlow):
    """Main config flow for Intentsity."""

    VERSION = 1
    MINOR_VERSION = 0

    async def async_get_supported_subentry_types(self, hass: HomeAssistant, entry) -> dict[str, type]:
        """Return subentry type handlers supported by this integration."""
        coordinator: IntentsCoordinator = entry.runtime_data.intents_coordinator
        return {"intent": lambda: IntentsityIntentSubentryFlow(hass, coordinator)}

    # ...existing config flow steps (user, reauth, etc.)...
