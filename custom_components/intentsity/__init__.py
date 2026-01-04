"""
Custom integration to integrate intentsity with Home Assistant.

This integration demonstrates best practices for:
- Config flow setup (user, reconfigure, reauth)
- Service registration and handling


For more details about this integration, please refer to:
https://github.com/constructorfleet/hacs-intentsity

For integration development guidelines:
https://developers.home-assistant.io/docs/creating_integration_manifest
"""

from __future__ import annotations

from pathlib import Path
import traceback
from typing import TYPE_CHECKING, Any

# Import StaticPathConfig from Home Assistant HTTP component
from homeassistant.components.http import StaticPathConfig
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, LOGGER
from .data import IntentsityStorage, RuntimeData  # Import the proper RuntimeData class
from .service_actions import async_setup_services
from .websocket import async_register_websocket_commands

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """
    Set up the integration.

    This is called once at Home Assistant startup to register service actions.
    Service actions must be registered here (not in async_setup_entry) to ensure:
    - Service action validation works correctly
    - Service actions are available even without config entries
    - Helpful error messages are provided

    This is a Silver Quality Scale requirement.

    Args:
        hass: The Home Assistant instance.
        config: The Home Assistant configuration.

    Returns:
        True if setup was successful.

    For more information:
    https://developers.home-assistant.io/docs/dev_101_services
    """
    hass.data.setdefault(DOMAIN, {})
    await async_setup_services(hass)
    async_register_websocket_commands(hass)
    static_path = Path(__file__).parent / "frontend"
    try:
        static_item: StaticPathConfig = StaticPathConfig(
            url_path="/api/intentsity/static",
            path=str(static_path),
            cache_headers=False,
        )
        static_config = (static_item,)
        try:
            await hass.http.async_register_static_paths(static_config)
        except (RuntimeError, AttributeError) as err:
            LOGGER.debug("Failed to async_register_static_paths: %s", err)
    except (RuntimeError, AttributeError):
        LOGGER.debug("Could not construct/register static frontend path: %s", traceback.format_exc())
    return True


async def async_setup_entry(
    hass: HomeAssistant,
    entry: Any,
) -> bool:
    """Set up the intentsity integration (no credentials, no API)."""
    # Attach IntentsityStorage to runtime_data for this entry
    runtime_data = RuntimeData(storage=IntentsityStorage(hass, entry.entry_id))
    entry.runtime_data = runtime_data
    return True


# Use the StaticPathConfig dataclass from Home Assistant for runtime registration


async def async_unload_entry(
    hass: HomeAssistant,
    entry: Any,
) -> bool:
    """Unload a config entry (no platforms)."""
    return True


async def async_reload_entry(
    hass: HomeAssistant,
    entry: Any,
) -> None:
    """Reload config entry (no platforms)."""
    await hass.config_entries.async_reload(entry.entry_id)
