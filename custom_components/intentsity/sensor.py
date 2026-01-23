from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import COORDINATOR_KEY, DOMAIN
from .coordinator import IntentsityCoordinator


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    coordinator: IntentsityCoordinator = hass.data[DOMAIN][COORDINATOR_KEY]
    async_add_entities([UncorrectedChatsSensor(coordinator)], True)


class UncorrectedChatsSensor(CoordinatorEntity[IntentsityCoordinator], SensorEntity):
    _attr_name = "Uncorrected Assist Chats"
    _attr_unique_id = f"{DOMAIN}_uncorrected_chats"
    _attr_icon = "mdi:message-alert"

    def __init__(self, coordinator: IntentsityCoordinator) -> None:
        super().__init__(coordinator)

    @property
    def native_value(self) -> int:
        return int(self.coordinator.data.get("uncorrected_count", 0))
