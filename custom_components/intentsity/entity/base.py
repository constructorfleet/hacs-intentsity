"""
Base entity class for intentsity.

This module provides the base entity class that all integration entities inherit from.
It handles common functionality like device info and unique IDs.

For more information on entities:
https://developers.home-assistant.io/docs/core/entity
https://developers.home-assistant.io/docs/core/entity/index/#common-properties
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from custom_components.intentsity.const import ATTRIBUTION

if TYPE_CHECKING:
    from homeassistant.helpers.entity import EntityDescription


class IntentsityEntity:
    """
    Base entity class for intentsity.

    All entities in this integration inherit from this class, which provides:
    - Device info management
    - Unique ID generation
    - Attribution and naming conventions
    """

    _attr_attribution = ATTRIBUTION
    _attr_has_entity_name = True

    def __init__(self, entity_description: EntityDescription) -> None:
        """
        Initialize the base entity.

        Args:
            entity_description: The entity description defining characteristics.

        """
        self.entity_description = entity_description
        self._attr_unique_id = None
        self._attr_device_info = None
