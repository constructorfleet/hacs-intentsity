"""
Tests for Intentsity DataUpdateCoordinator and data processing.
"""

from datetime import timedelta
from unittest.mock import MagicMock, patch

import pytest

from custom_components.intentsity.const import LOGGER
import custom_components.intentsity.coordinator.base as coordinator_base
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady


@pytest.mark.asyncio
async def test_coordinator_initial_load(hass: HomeAssistant):
    """Test coordinator loads data on first refresh."""
    with patch.object(
        coordinator_base.IntentsityDataUpdateCoordinator, "_async_update_data", return_value={"intents": []}
    ):
        coordinator = coordinator_base.IntentsityDataUpdateCoordinator(
            hass,
            LOGGER,
            name="test_coordinator",
            update_interval=timedelta(seconds=30),
        )
        coordinator.config_entry = MagicMock()  # Mock config_entry
        await coordinator.async_config_entry_first_refresh()
        assert coordinator.data == {"intents": []}


@pytest.mark.asyncio
async def test_coordinator_update_failed(hass: HomeAssistant):
    """Test coordinator handles update failure."""
    with patch.object(
        coordinator_base.IntentsityDataUpdateCoordinator, "_async_update_data", side_effect=Exception("fail")
    ):
        coordinator = coordinator_base.IntentsityDataUpdateCoordinator(
            hass,
            LOGGER,
            name="test_coordinator",
            update_interval=timedelta(seconds=30),
        )
        coordinator.config_entry = MagicMock()  # Mock config_entry
        with pytest.raises(ConfigEntryNotReady):
            await coordinator.async_config_entry_first_refresh()
