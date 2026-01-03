"""
Custom integration to integrate intentsity with Home Assistant.

This integration demonstrates best practices for:
- Config flow setup (user, reconfigure, reauth)
- DataUpdateCoordinator pattern for efficient data fetching
- Multiple platform types (sensor, binary_sensor, switch, select, number)
- Service registration and handling
- Device and entity management
- Proper error handling and recovery

For more details about this integration, please refer to:
https://github.com/constructorfleet/hacs-intentsity

For integration development guidelines:
https://developers.home-assistant.io/docs/creating_integration_manifest
"""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path
import traceback
from typing import TYPE_CHECKING, Any, cast

# Import StaticPathConfig from Home Assistant HTTP component
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME, Platform
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv
from homeassistant.loader import async_get_loaded_integration

from .api import IntentsityApiClient
from .const import DOMAIN, LOGGER
from .coordinator import IntentsCoordinator, IntentsityDataUpdateCoordinator
from .data import IntentsityData
from .service_actions import async_setup_services
from .websocket import async_register_websocket_commands

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from .data import IntentsityConfigEntry

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.FAN,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
]

# This integration is configured via config entries only
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
    await async_setup_services(hass)
    # Register websocket API commands (best-effort)
    async_register_websocket_commands(hass)
    # Serve minimal frontend static assets at /api/intentsity/static/
    static_path = Path(__file__).parent / "frontend"
    # Register static path using the async helper when available.
    # Construct a StaticPathConfig and call async_register_static_paths.
    try:
        # Construct a configuration for static paths using the Home Assistant
        # StaticPathConfig dataclass.
        static_item: StaticPathConfig = StaticPathConfig(
            url_path="/api/intentsity/static",
            path=str(static_path),
            cache_headers=False,
        )
        static_config = (static_item,)
        # Use the async helper from hass.http. Do NOT fall back to the removed
        # `register_static_path` API because it no longer exists.
        try:
            cast(Any, hass.http).async_register_static_paths(static_config)
        except (RuntimeError, AttributeError) as err:  # pragma: no cover - log and continue
            LOGGER.debug("Failed to async_register_static_paths: %s", err)
    except (RuntimeError, AttributeError):  # pragma: no cover - best-effort only
        LOGGER.debug("Could not construct/register static frontend path: %s", traceback.format_exc())
    return True


async def async_setup_entry(
    hass: HomeAssistant,
    entry: IntentsityConfigEntry,
) -> bool:
    """
    Set up this integration using UI.

    This is called when a config entry is loaded. It:
    1. Creates the API client with credentials from the config entry
    2. Initializes the DataUpdateCoordinator for data fetching
    3. Performs the first data refresh
    4. Sets up all platforms (sensors, switches, etc.)
    5. Registers services
    6. Sets up reload listener for config changes

    Data flow in this integration:
    1. User enters username/password in config flow (config_flow.py)
    2. Credentials stored in entry.data[CONF_USERNAME/CONF_PASSWORD]
    3. API Client initialized with credentials (api/client.py)
    4. Coordinator fetches data using authenticated client (coordinator/base.py)
    5. Entities access data via self.coordinator.data (sensor/, binary_sensor/, etc.)

    This pattern ensures credentials from setup flow are used throughout
    the integration's lifecycle for API communication.

    Args:
        web_dir = os.path.join(os.path.dirname(__file__), "frontend")
        # Register a static path for the minimal frontend.
        # Wrap in try/except because some test runners mock hass.http differently.
        hass.http.register_static_path(
            "/api/intentsity/static",
            web_dir,
            cache_time=0,
        )
    For more information:
    https://developers.home-assistant.io/docs/config_entries_index/#setting-up-an-entry
    """
    # Initialize client first
    client = IntentsityApiClient(
        username=entry.data[CONF_USERNAME],  # From config flow setup
        password=entry.data[CONF_PASSWORD],  # From config flow setup
        session=async_get_clientsession(hass),
    )

    # Initialize coordinator with config_entry
    coordinator = IntentsityDataUpdateCoordinator(
        hass=hass,
        logger=LOGGER,
        name=DOMAIN,
        config_entry=entry,
        update_interval=timedelta(hours=1),
        always_update=False,  # Only update entities when data actually changes
    )

    # Store runtime data
    entry.runtime_data = IntentsityData(
        client=client,
        integration=async_get_loaded_integration(hass, entry.domain),
        coordinator=coordinator,
    )

    # Create and load intents coordinator (persistent storage)
    intents_coord = IntentsCoordinator(hass)
    await intents_coord.async_load()
    # Attach to runtime data and client for convenient access
    entry.runtime_data.intents_coordinator = intents_coord
    client.intents_coordinator = intents_coord

    # https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
    await coordinator.async_config_entry_first_refresh()

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


# Use the StaticPathConfig dataclass from Home Assistant for runtime registration


async def async_unload_entry(
    hass: HomeAssistant,
    entry: IntentsityConfigEntry,
) -> bool:
    """
    Unload a config entry.

    This is called when the integration is being removed or reloaded.
    It ensures proper cleanup of:
    - All platform entities
    - Registered services
    - Update listeners

    Args:
        hass: The Home Assistant instance.
        entry: The config entry being unloaded.

    Returns:
        True if unload was successful.

    For more information:
    https://developers.home-assistant.io/docs/config_entries_index/#unloading-entries
    """
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(
    hass: HomeAssistant,
    entry: IntentsityConfigEntry,
) -> None:
    """
    Reload config entry.

    This is called when the integration configuration or options have changed.
    It unloads and then reloads the integration with the new configuration.

    Args:
        hass: The Home Assistant instance.
        entry: The config entry being reloaded.

    For more information:
    https://developers.home-assistant.io/docs/config_entries_index/#reloading-entries
    """
    await hass.config_entries.async_reload(entry.entry_id)
