"""Custom types for intentsity."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.loader import Integration

    from .api import IntentsityApiClient
    from .coordinator import IntentsityDataUpdateCoordinator


type IntentsityConfigEntry = ConfigEntry[IntentsityData]


@dataclass
class IntentsityData:
    """Data for intentsity."""

    client: IntentsityApiClient
    coordinator: IntentsityDataUpdateCoordinator
    integration: Integration
