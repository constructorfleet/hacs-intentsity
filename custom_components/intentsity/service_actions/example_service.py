"""Example service action handlers for intentsity."""

from __future__ import annotations

from typing import TYPE_CHECKING

from custom_components.intentsity.const import LOGGER
from homeassistant.util import dt as dt_util

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse


async def async_handle_example_action(
    hass: HomeAssistant,
    entry,
    call: ServiceCall,
) -> None:
    """
    Handle the example_action service action call.

    This is a dummy service action that demonstrates how to implement custom service actions.

    Args:
        hass: Home Assistant instance
        entry: Config entry for the integration
        call: Service call data
    """
    LOGGER.info("Example action service called with data: %s", call.data)

    # Example: Do something with the service call data
    action_type = call.data.get("action_type", "default")
    target_value = call.data.get("target_value")

    LOGGER.debug(
        "Processing action type: %s with target value: %s",
        action_type,
        target_value,
    )

    # In a real implementation, you would:
    # - Validate the input
    # - Call API methods via client
    # - Update coordinator data if needed
    # - Handle errors appropriately

    # For now, this is just a dummy that logs the action
    LOGGER.info("Example action completed successfully")


async def async_handle_reload_data(
    hass: HomeAssistant,
    entry,
    call: ServiceCall,
) -> ServiceResponse:
    """
    Handle the reload_data service call with response data.

    This service forces a refresh of the integration data and returns
    diagnostic information about the refresh operation.

    Args:
        hass: Home Assistant instance
        entry: Config entry for the integration
        call: Service call data

    Returns:
        ServiceResponse: Dictionary with refresh status, timestamp, and data summary
    """
    LOGGER.info("Reload data service called")

    # No coordinator to refresh; just log and return success
    LOGGER.info("Reload data service called (noop)")
    return {
        "status": "success",
        "timestamp": dt_util.now().isoformat(),
    }
