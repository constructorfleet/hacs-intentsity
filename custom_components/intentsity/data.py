"""Typed data models for the intentsity integration.

This module defines dataclasses used to represent intents, slots,
lists and expansion rules. It also provides simple validators and
helpers to (de)serialize to JSON-friendly dictionaries for storage.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any
from uuid import uuid4

if TYPE_CHECKING:
    from custom_components.intentsity.api.client import IntentsityApiClient
    from custom_components.intentsity.coordinator.base import IntentsCoordinator, IntentsityDataUpdateCoordinator
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.loader import Integration


type IntentsityConfigEntry = ConfigEntry["IntentsityData"]


JSONType = dict[str, Any]


@dataclass
class Slot:
    """Represents a slot (parameter) for an intent.

    Attributes:
        name: Slot name.
        type: Data type for slot (e.g., "string", "number").
        required: Whether the slot is required.
    """

    name: str
    type: str = "string"
    required: bool = False

    def to_dict(self) -> JSONType:
        """Serialize the Slot to a JSON-friendly dict."""
        return {"name": self.name, "type": self.type, "required": self.required}

    @staticmethod
    def from_dict(data: JSONType) -> Slot:
        """Create a Slot from a JSON-like dict."""
        return Slot(
            name=str(data.get("name", "")),
            type=str(data.get("type", "string")),
            required=bool(data.get("required", False)),
        )


@dataclass
class ListDef:
    """Represents a list (enumeration) used by slots or expansions.

    Attributes:
        name: Unique name of the list.
        values: List of possible string values.
    """

    name: str
    values: list[str] = field(default_factory=list)

    def to_dict(self) -> JSONType:
        """Serialize the ListDef to a JSON-friendly dict."""
        return {"name": self.name, "values": list(self.values)}

    @staticmethod
    def from_dict(data: JSONType) -> ListDef:
        """Create a ListDef from a JSON-like dict."""
        return ListDef(name=str(data.get("name", "")), values=[str(v) for v in data.get("values", [])])


@dataclass
class ExpansionRule:
    """Represents an expansion rule for intent training phrases.

    Attributes:
        pattern: Matching pattern or example.
        expansion: Replacement or expansion text.
    """

    pattern: str
    expansion: str

    def to_dict(self) -> JSONType:
        """Serialize the ExpansionRule to a JSON-friendly dict."""
        return {"pattern": self.pattern, "expansion": self.expansion}

    @staticmethod
    def from_dict(data: JSONType) -> ExpansionRule:
        """Create an ExpansionRule from a JSON-like dict."""
        return ExpansionRule(pattern=str(data.get("pattern", "")), expansion=str(data.get("expansion", "")))


@dataclass
class Intent:
    """Represents an intent with slots, lists and expansion rules.

    Attributes:
        id: Unique identifier for the intent (UUID string).
        name: Human readable name.
        description: Optional description.
        slots: List of Slot objects.
        lists: List of ListDef objects.
        expansions: List of ExpansionRule objects.
        created_at: ISO timestamp when created.
    """

    id: str
    name: str
    description: str | None = None
    slots: list[Slot] = field(default_factory=list)
    lists: list[ListDef] = field(default_factory=list)
    expansions: list[ExpansionRule] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(tz=timezone.utc).isoformat())  # noqa: UP017

    def to_dict(self) -> JSONType:
        """Serialize the Intent to a JSON-friendly dict."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "slots": [s.to_dict() for s in self.slots],
            "lists": [list_def.to_dict() for list_def in self.lists],
            "expansions": [e.to_dict() for e in self.expansions],
            "created_at": self.created_at,
        }

    @staticmethod
    def from_dict(data: JSONType) -> Intent:
        """Create an Intent from a JSON-like dict."""
        return Intent(
            id=str(data.get("id") or uuid4()),
            name=str(data.get("name", "")),
            description=data.get("description"),
            slots=[Slot.from_dict(s) for s in data.get("slots", [])],
            lists=[ListDef.from_dict(item) for item in data.get("lists", [])],
            expansions=[ExpansionRule.from_dict(e) for e in data.get("expansions", [])],
            created_at=str(data.get("created_at", datetime.now(tz=timezone.utc).isoformat())),  # noqa: UP017
        )


@dataclass
class IntentsityData:
    """Runtime data container for the integration.

    Fields are populated during async_setup_entry().
    """

    client: IntentsityApiClient
    coordinator: IntentsityDataUpdateCoordinator
    integration: Integration
    intents_coordinator: IntentsCoordinator | None = None


def validate_intent_payload(payload: JSONType) -> Intent:
    """Validate a JSON-like payload and return an Intent object.

    A minimal validation is performed to ensure required fields exist and
    types are correct. Raises ValueError on invalid payloads.
    """
    if not isinstance(payload, dict):
        raise TypeError("Intent payload must be a mapping")
    name = payload.get("name")
    if not name or not isinstance(name, str):
        raise ValueError("Intent payload requires a string 'name' field")
    return Intent.from_dict(payload)
