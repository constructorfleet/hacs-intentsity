"""Config flow for intentsity.

This module implements the main configuration flow for the integration.

For more information:
https://developers.home-assistant.io/docs/config_entries_config_flow_handler
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from custom_components.intentsity.config_flow_handler.subentry_flow import IntentsSubentryFlowHandler
from custom_components.intentsity.const import DOMAIN
from homeassistant import config_entries

if TYPE_CHECKING:
    from custom_components.intentsity.config_flow_handler.options_flow import IntentsityOptionsFlow


class IntentsityConfigFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """
    Handle a config flow for intentsity.

    This class manages the configuration flow for the integration.

    For more details:
    https://developers.home-assistant.io/docs/config_entries_config_flow_handler
    """

    VERSION = 1

    @classmethod
    def async_get_supported_subentry_types(
        cls,
        config_entry: config_entries.ConfigEntry,
    ) -> dict[str, type[config_entries.ConfigSubentryFlow]]:
        """Return subentries supported by this integration.

        The key 'intent' is used by the UI to create intent subentries.
        """
        return {"intent": IntentsSubentryFlowHandler}

    @staticmethod
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> IntentsityOptionsFlow:
        """
        Get the options flow for this handler.

        Returns:
            The options flow instance for modifying integration options.

        """
        from custom_components.intentsity.config_flow_handler.options_flow import IntentsityOptionsFlow  # noqa: PLC0415

        return IntentsityOptionsFlow()

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Handle a flow initialized by the user. No user input required."""
        await self.async_set_unique_id("intentsity")
        self._abort_if_unique_id_configured()
        return self.async_create_entry(
            title="Intentsity",
            data={},
        )

    # Removed reconfigure step (no credentials to update)

    # Removed reauth and reauth_confirm steps (no credentials to reauthenticate)


__all__ = ["IntentsityConfigFlowHandler"]
