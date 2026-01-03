"""Subentry flow implementation for intents.

This module implements a ConfigSubentryFlow to create and manage intent
sub-entries. Each intent is stored via the integration's IntentsCoordinator.

Subentries created here will have their ``unique_id`` set to the intent id so
they can be referenced and reconfigured later.

See: https://developers.home-assistant.io/docs/config_entries_config_flow_handler#subentry-flows
"""

from typing import Any, cast

import voluptuous as vol

from custom_components.intentsity.coordinator.base import IntentsCoordinator
from custom_components.intentsity.data import validate_intent_payload
from homeassistant.config_entries import ConfigSubentryFlow, SubentryFlowResult


class IntentsSubentryFlowHandler(ConfigSubentryFlow):
    """Handle subentry flow for creating and editing intents."""

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Show form to create a new intent or create it on submit."""
        if user_input is not None:
            payload = user_input["intent_payload"]
            intent = validate_intent_payload(payload)

            entry = self._get_entry()
            intents_coord: IntentsCoordinator = entry.runtime_data.intents_coordinator
            created = await intents_coord.async_create_intent(intent.to_dict())

            # The base class stubs do not expose async_create_subentry to the type
            # checker; cast to Any to call the helper method at runtime.
            return cast(Any, self).async_create_subentry(
                title=created.name,
                data={"intent_id": created.id},
                unique_id=created.id,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required("intent_payload"): dict}),
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Modify an existing subentry (intent)."""
        config_entry = self._get_entry()
        config_subentry = self._get_reconfigure_subentry()

        intent_id = config_subentry.data.get("intent_id")
        if not isinstance(intent_id, str):
            return self.async_abort(reason="intent_not_found")

        intents_coord: IntentsCoordinator = config_entry.runtime_data.intents_coordinator
        existing_intent = await intents_coord.async_get_intent(intent_id)
        if existing_intent is None:
            return self.async_abort(reason="intent_not_found")

        if user_input is not None:
            update_payload = user_input["intent_payload"]
            updated = await intents_coord.async_update_intent(existing_intent.id, update_payload)
            return cast(Any, self).async_update_subentry(
                config_subentry, data={"intent_id": updated.id}, title=updated.name
            )

        default = existing_intent.to_dict()
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema({vol.Required("intent_payload", default=default): dict}),
        )


__all__: list[str] = ["IntentsSubentryFlowHandler"]
