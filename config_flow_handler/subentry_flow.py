"""Subentry flow handler for Intentsity integration.

Allows managing intents as config sub-entries.
"""

from __future__ import annotations

from custom_components.intentsity.coordinator.base import IntentsCoordinator
from homeassistant.config_entries import ConfigSubentryFlow
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.typing import ConfigType


class IntentsityIntentSubentryFlow(ConfigSubentryFlow):
    """ConfigSubentryFlow for managing Intents as sub-entries."""

    def __init__(self, hass: HomeAssistant, coordinator: IntentsCoordinator) -> None:
        """Initialize with hass and coordinator."""
        self.hass = hass
        self.coordinator = coordinator

    async def async_step_user(self, user_input: ConfigType | None = None) -> FlowResult:
        """Show create/edit form for an intent (TODO: implement fields)."""
        # TODO: Implement form for creating/editing an intent
        # Use voluptuous/selector schema for fields
        # On submit, validate and call coordinator.async_create_intent or async_update_intent
        return self.async_show_form(step_id="user", data_schema=None)

    async def async_step_delete(self, user_input: ConfigType | None = None) -> FlowResult:
        """Show deletion menu for a subentry (TODO: implement)."""
        # TODO: Implement deletion logic
        return self.async_show_menu(step_id="delete", menu_options={})

    # Additional steps for advanced editing can be added here
