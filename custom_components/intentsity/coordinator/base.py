"""
Core DataUpdateCoordinator implementation for intentsity.

This module contains the main coordinator class that manages data fetching
and updates for all entities in the integration. It handles refresh cycles,
error handling, and triggers reauthentication when needed.

For more information on coordinators:
https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
"""

# ruff: noqa: I001

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, Any
from uuid import uuid4

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from custom_components.intentsity.api import (
    IntentsityApiClientAuthenticationError,
    IntentsityApiClientError,
)
from custom_components.intentsity.const import LOGGER
from custom_components.intentsity.data import Intent, validate_intent_payload

if TYPE_CHECKING:
    from custom_components.intentsity.data import IntentsityConfigEntry


class IntentsityDataUpdateCoordinator(DataUpdateCoordinator):
    """
    Class to manage fetching data from the API.

    This coordinator handles all data fetching for the integration and distributes
    updates to all entities. It manages:
    - Periodic data updates based on update_interval
    - Error handling and recovery
    - Authentication failure detection and reauthentication triggers
    - Data distribution to all entities
    - Context-based data fetching (only fetch data for active entities)

    For more information:
    https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities

    Attributes:
        config_entry: The config entry for this integration instance.
    """

    config_entry: IntentsityConfigEntry

    async def _async_setup(self) -> None:
        """
        Set up the coordinator.

        This method is called automatically during async_config_entry_first_refresh()
        and is the ideal place for one-time initialization tasks such as:
        - Loading device information
        - Setting up event listeners
        - Initializing caches

        This runs before the first data fetch, ensuring any required setup
        is complete before entities start requesting data.
        """
        # Example: Fetch device info once at startup
        # device_info = await self.config_entry.runtime_data.client.get_device_info()
        # self._device_id = device_info["id"]
        LOGGER.debug("Coordinator setup complete for %s", self.config_entry.entry_id)

    async def _async_update_data(self) -> Any:
        """
        Fetch data from API endpoint.

        This is the only method that should be implemented in a DataUpdateCoordinator.
        It is called automatically based on the update_interval.

        Context-based fetching:
        The coordinator tracks which entities are currently listening via async_contexts().
        This allows optimizing API calls to only fetch data that's actually needed.
        For example, if only sensor entities are enabled, we can skip fetching switch data.

        The API client uses the credentials from config_entry to authenticate:
        - username: from config_entry.data["username"]
        - password: from config_entry.data["password"]

        Expected API response structure (example):
        {
            "userId": 1,      # Used as device identifier
            "id": 1,          # Data record ID
            "title": "...",   # Additional metadata
            "body": "...",    # Additional content
            # In production, would include:
            # "air_quality": {"aqi": 45, "pm25": 12.3},
            # "filter": {"life_remaining": 75, "runtime_hours": 324},
            # "settings": {"fan_speed": "medium", "humidity": 55}
        }

        Returns:
            The data from the API as a dictionary.

        Raises:
            ConfigEntryAuthFailed: If authentication fails, triggers reauthentication.
            UpdateFailed: If data fetching fails for other reasons, optionally with retry_after.
        """
        try:
            # Optional: Get active entity contexts to optimize data fetching
            # listening_contexts = set(self.async_contexts())
            # LOGGER.debug("Active entity contexts: %s", listening_contexts)

            # Fetch data from API
            # In production, you could pass listening_contexts to optimize the API call:
            # return await self.config_entry.runtime_data.client.async_get_data(listening_contexts)
            return await self.config_entry.runtime_data.client.async_get_data()
        except IntentsityApiClientAuthenticationError as exception:
            LOGGER.warning("Authentication error - %s", exception)
            raise ConfigEntryAuthFailed(
                translation_domain="intentsity",
                translation_key="authentication_failed",
            ) from exception
        except IntentsityApiClientError as exception:
            LOGGER.exception("Error communicating with API")
            # If the API provides rate limit information, you can honor it:
            # if hasattr(exception, 'retry_after'):
            #     raise UpdateFailed(retry_after=exception.retry_after) from exception
            raise UpdateFailed(
                translation_domain="intentsity",
                translation_key="update_failed",
            ) from exception


class IntentsCoordinator:
    """Coordinator responsible for managing intents persistence and CRUD operations.

    This class uses Home Assistant's `Store` helper for JSON-backed persistence and
    an asyncio.Lock to guard concurrent modifications.
    """

    STORAGE_VERSION = 1
    STORAGE_KEY = "intentsity_intents"
    STORAGE_FILENAME = "intentsity_intents.json"

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the intents coordinator.

        Args:
            hass: Home Assistant instance.
        """
        self.hass = hass
        self._store = Store(hass, self.STORAGE_VERSION, self.STORAGE_FILENAME)
        self._lock = asyncio.Lock()
        self._intents: dict[str, Intent] = {}

    async def async_load(self) -> None:
        """Load intents from storage into memory."""
        raw = await self._store.async_load()
        if not raw:
            self._intents = {}
            return
        # Expect stored format: {"version": v, "intents": [ ... ]}
        version = raw.get("version")
        data = raw.get("intents", [])
        if version != self.STORAGE_VERSION:
            # For now, a simple compatibility pass-through; migrations would go here
            pass
        intents: dict[str, Intent] = {}
        for item in data:
            try:
                intent = Intent.from_dict(item)
            except (TypeError, ValueError):
                # Skip invalid entries
                continue
            intents[intent.id] = intent
        self._intents = intents

    async def async_save(self) -> None:
        """Persist current intents to storage."""
        async with self._lock:
            payload = {"version": self.STORAGE_VERSION, "intents": [i.to_dict() for i in self._intents.values()]}
            await self._store.async_save(payload)

    async def async_list_intents(self) -> list[Intent]:
        """Return list of stored intents."""
        return list(self._intents.values())

    async def async_get_intent(self, intent_id: str) -> Intent | None:
        """Return an intent by id or None if not found."""
        return self._intents.get(intent_id)

    async def async_create_intent(self, intent_data: dict) -> Intent:
        """Create a new intent from a dict payload and persist it.

        The payload is validated by the data model validators.
        """
        intent = validate_intent_payload(intent_data)
        # Ensure id is present
        if not intent.id:
            intent.id = str(uuid4())
        async with self._lock:
            self._intents[intent.id] = intent
            await self.async_save()
        return intent

    async def async_update_intent(self, intent_id: str, update: dict) -> Intent:
        """Update an existing intent and persist changes."""
        async with self._lock:
            existing = self._intents.get(intent_id)
            if not existing:
                raise KeyError(intent_id)
            # Merge fields conservatively
            merged = {**existing.to_dict(), **update}
            intent = validate_intent_payload(merged)
            intent.id = intent_id
            self._intents[intent_id] = intent
            await self.async_save()
        return intent

    async def async_delete_intent(self, intent_id: str) -> None:
        """Delete an intent by id and persist changes."""
        async with self._lock:
            if intent_id in self._intents:
                del self._intents[intent_id]
                await self.async_save()
