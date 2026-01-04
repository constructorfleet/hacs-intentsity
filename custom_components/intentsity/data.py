"""Typed data models and helpers for the Intentsity integration."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from datetime import UTC, datetime, timezone
from typing import Any, Literal, Required, TypedDict, cast
from uuid import uuid4

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .utils.string_helpers import slugify_name


class SlotDefinition(TypedDict, total=False):
    """Represents a slot schema definition."""

    required: bool
    type: str


SlotsDict = dict[str, SlotDefinition]


class ListValuePair(TypedDict):
    """Represents a single replacement pair inside a list."""

    in_: Required[str]
    out: Required[str]


class ListValues(TypedDict):
    """Represents a list of explicit in/out value pairs."""

    values: list[ListValuePair]


class ListRange(TypedDict):
    """Represents an inclusive numeric range definition."""

    from_: int
    to: int
    step: int


class ListRangeWrapper(TypedDict):
    """Wraps a numeric range entry."""

    range: ListRange


class ListWildcard(TypedDict):
    """Represents a wildcard list definition."""

    wildcard: Literal[True]


ListVariant = ListValues | ListRangeWrapper | ListWildcard
ListsDict = dict[str, ListVariant]


class RequiresContextSlot(TypedDict):
    """Signals that the context should be derived from a slot value."""

    slot: Literal[True]


RequiresContextValue = str | list[str] | RequiresContextSlot


class RequiresContextDict(TypedDict, total=False):
    """Context requirements for a sentence group."""

    domain: RequiresContextValue
    area: RequiresContextValue
    floor: RequiresContextValue


class SentenceGroupDict(TypedDict, total=False):
    """Serialized shape for a sentence group."""

    sentences: list[str]
    slots: SlotsDict
    expansion_rules: dict[str, str]
    lists: ListsDict
    requires_context: dict[str, Any]
    response: str


class IntentDict(TypedDict):
    """Serialized structure for an intent."""

    id: str
    name: str
    description: str | None
    platforms: list[str]
    script: str
    slots: SlotsDict
    skip_words: list[str]
    expansion_rules: dict[str, str]
    lists: ListsDict
    responses: dict[str, str]
    sentence_groups: list[SentenceGroupDict]
    created_at: str


class IntentsStorageData(TypedDict):
    """Storage wrapper structure."""

    __root__: dict[str, IntentDict]


JSONType = dict[str, Any]


@dataclass
class SentenceGroup:
    """Represents a group of context-aware sentences."""

    sentences: list[str]
    response: str
    slots: SlotsDict = field(default_factory=dict)
    expansion_rules: dict[str, str] = field(default_factory=dict)
    lists: ListsDict = field(default_factory=dict)
    requires_context: RequiresContextDict = field(default_factory=RequiresContextDict)

    def to_dict(self) -> SentenceGroupDict:
        """Return a JSON-serializable representation."""
        return {
            "sentences": list(self.sentences),
            "response": self.response,
            "slots": dict(self.slots),
            "expansion_rules": dict(self.expansion_rules),
            "lists": dict(self.lists),
            "requires_context": dict(self.requires_context),
        }

    @staticmethod
    def from_dict(data: SentenceGroupDict) -> SentenceGroup:
        """Create a SentenceGroup from serialized data."""
        sentences = [str(sentence).strip() for sentence in data.get("sentences", []) if str(sentence).strip()]
        response = slugify_name(str(data.get("response", "")))
        return SentenceGroup(
            sentences=sentences,
            response=response,
            slots=_normalize_slots(data.get("slots")),
            expansion_rules=_normalize_string_mapping(data.get("expansion_rules", {})),
            lists=_normalize_lists(data.get("lists")),
            requires_context=_normalize_requires_context(data.get("requires_context", {})),
        )


@dataclass
class Intent:
    """Represents an intent with sentence groups and metadata."""

    id: str
    name: str
    description: str | None = None
    platforms: list[str] = field(default_factory=list)
    script: str = ""
    slots: SlotsDict = field(default_factory=dict)
    skip_words: list[str] = field(default_factory=list)
    expansion_rules: dict[str, str] = field(default_factory=dict)
    lists: ListsDict = field(default_factory=dict)
    responses: dict[str, str] = field(default_factory=dict)
    sentence_groups: Sequence[SentenceGroup] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(tz=timezone.utc).isoformat())  # noqa: UP017

    def to_dict(self) -> IntentDict:
        """Serialize the intent to a JSON-friendly mapping."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "platforms": list(self.platforms),
            "script": self.script,
            "slots": dict(self.slots),
            "skip_words": list(self.skip_words),
            "expansion_rules": dict(self.expansion_rules),
            "lists": dict(self.lists),
            "responses": dict(self.responses),
            "sentence_groups": [group.to_dict() for group in self.sentence_groups],
            "created_at": self.created_at,
        }

    @staticmethod
    def from_dict(data: IntentDict | dict[str, Any]) -> Intent:
        """Create an Intent from a stored dictionary."""
        responses = _normalize_string_mapping(data.get("responses", {}))
        return Intent(
            id=str(data.get("id") or uuid4()),
            name=str(data.get("name", "")),
            description=data.get("description"),
            platforms=[
                slugify_name(str(platform)) for platform in data.get("platforms", []) if slugify_name(str(platform))
            ],
            script=str(data.get("script", "")),
            slots=_normalize_slots(data.get("slots")),
            skip_words=_normalize_skip_words(data.get("skip_words")),
            expansion_rules=_normalize_string_mapping(data.get("expansion_rules", {})),
            lists=_normalize_lists(data.get("lists")),
            responses=responses,
            sentence_groups=[SentenceGroup.from_dict(group) for group in data.get("sentence_groups", [])],
            created_at=str(data.get("created_at") or datetime.now(tz=UTC).isoformat()),
        )


INTENTS_STORAGE_VERSION = 1
INTENTS_STORAGE_KEY_TEMPLATE = "intentsity.intents_{entry_id}"


class IntentsityStorage(Store[IntentsStorageData]):
    """Persistent storage helper for intents."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        """Initialize the storage helper."""
        super().__init__(
            hass,
            INTENTS_STORAGE_VERSION,
            INTENTS_STORAGE_KEY_TEMPLATE.format(entry_id=entry_id),
        )
        self._cache: IntentsStorageData | None = None

    async def async_load_intents(self) -> dict[str, IntentDict]:
        """Load intents dictionary from storage."""
        if self._cache is not None:
            return self._cache["__root__"]
        data = await self.async_load() or {"__root__": {}}
        if not isinstance(data, dict) or "__root__" not in data:
            data = {"__root__": {}}
        self._cache = cast(IntentsStorageData, data)
        return self._cache["__root__"]

    async def async_save_intents(self, intents: dict[str, IntentDict]) -> None:
        """Persist the provided intents mapping."""
        self._cache = {"__root__": intents.copy()}
        await self.async_save(self._cache)

    async def async_get_intent(self, intent_id: str) -> IntentDict | None:
        """Return a stored intent by identifier."""
        intents = await self.async_load_intents()
        return intents.get(intent_id)

    async def async_set_intent(self, intent: Intent) -> None:
        """Write an intent to storage."""
        intents = await self.async_load_intents()
        intents[intent.id] = intent.to_dict()
        await self.async_save_intents(intents)

    async def async_delete_intent(self, intent_id: str) -> None:
        """Remove an intent from storage."""
        intents = await self.async_load_intents()
        if intent_id in intents:
            intents.pop(intent_id)
            await self.async_save_intents(intents)

    async def async_list_intents(self) -> list[Intent]:
        """Return all stored intents as objects."""
        intents = await self.async_load_intents()
        return [Intent.from_dict(data) for data in intents.values()]


def _normalize_string_mapping(value: Any) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}
    normalized: dict[str, str] = {}
    for raw_key, raw_val in value.items():
        slug = slugify_name(str(raw_key))
        if not slug:
            continue
        text = str(raw_val).strip()
        if text:
            normalized[slug] = text
    return normalized


def _normalize_slots(value: Any) -> SlotsDict:
    if not isinstance(value, dict):
        return {}
    normalized: SlotsDict = {}
    for raw_key, raw_val in value.items():
        slug = slugify_name(str(raw_key))
        if not slug:
            continue
        details = raw_val if isinstance(raw_val, dict) else {}
        normalized[slug] = {
            "required": bool(details.get("required", False)),
            "type": str(details.get("type", "string")),
        }
    return normalized


def _normalize_lists(value: Any) -> ListsDict:
    if not isinstance(value, dict):
        return {}
    normalized: ListsDict = {}
    for raw_key, raw_val in value.items():
        slug = slugify_name(str(raw_key))
        if not slug or not isinstance(raw_val, dict):
            continue
        if raw_val.get("wildcard") is True:
            normalized[slug] = {"wildcard": True}
            continue
        if isinstance(raw_val.get("values"), list):
            pairs: list[ListValuePair] = []
            for pair in raw_val["values"]:
                if isinstance(pair, dict):
                    source = str(pair.get("in_", "")).strip()
                    target = str(pair.get("out", "")).strip()
                    if source:
                        pairs.append({"in_": source, "out": target or source})
            if pairs:
                normalized[slug] = {"values": pairs}
            continue
        if isinstance(raw_val.get("range"), dict):
            try:
                start = int(raw_val["range"].get("from_"))
                end = int(raw_val["range"].get("to"))
                step = int(raw_val["range"].get("step", 1)) or 1
            except (TypeError, ValueError):
                continue
            normalized[slug] = {"range": {"from_": start, "to": end, "step": step}}
    return normalized


def _normalize_requires_context(value: Any) -> RequiresContextDict:
    if not isinstance(value, dict):
        return {}
    normalized: RequiresContextDict = {}
    for key, raw_val in value.items():
        if key not in {"domain", "area", "floor"}:
            continue
        if isinstance(raw_val, dict) and raw_val.get("slot") is True:
            normalized[key] = {"slot": True}
            continue
        if isinstance(raw_val, list):
            entries = [slugify_name(str(item)) for item in raw_val if slugify_name(str(item))]
            if entries:
                normalized[key] = entries
            continue
        slug = slugify_name(str(raw_val))
        if slug:
            normalized[key] = slug
    return normalized


def _normalize_sentence_groups(value: Any, responses: dict[str, str]) -> list[SentenceGroup]:
    if value is None:
        return []
    if not isinstance(value, list):
        raise TypeError("sentence_groups must be a list")
    groups: list[SentenceGroup] = []
    for group in value:
        if not isinstance(group, dict):
            continue
        sentences_raw = group.get("sentences", [])
        sentences = [str(sentence).strip() for sentence in sentences_raw if str(sentence).strip()]
        if not sentences:
            raise ValueError("sentence group requires at least one sentence")
        response_slug = slugify_name(str(group.get("response", "")))
        if response_slug not in responses:
            raise ValueError("sentence group response must reference an existing response")
        groups.append(
            SentenceGroup(
                sentences=sentences,
                response=response_slug,
                slots=_normalize_slots(group.get("slots")),
                expansion_rules=_normalize_string_mapping(group.get("expansion_rules")),
                lists=_normalize_lists(group.get("lists")),
                requires_context=_normalize_requires_context(group.get("requires_context")),
            )
        )
    return groups


def _normalize_skip_words(value: Any) -> list[str]:
    if isinstance(value, list):
        return [slugify_name(str(word)) for word in value if slugify_name(str(word))]
    return []


def _ensure_string_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(entry).strip() for entry in value if str(entry).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def validate_intent_payload(intent_payload: JSONType) -> Intent:
    """Validate and normalize a payload into an Intent instance."""
    if not isinstance(intent_payload, dict):
        raise TypeError("Intent payload must be a mapping")
    name = str(intent_payload.get("name", "")).strip()
    if not name:
        raise ValueError("Intent payload requires a 'name'")
    script = str(intent_payload.get("script", "")).strip()
    if not script:
        raise ValueError("Intent payload requires a script entity id")

    responses = intent_payload.get("responses")
    normalized_responses = _normalize_string_mapping(responses)
    if not normalized_responses:
        raise ValueError("Intent payload requires at least one response")

    sentence_groups = _normalize_sentence_groups(intent_payload.get("sentence_groups", []), normalized_responses)

    return Intent(
        id=str(intent_payload.get("id") or uuid4()),
        name=name,
        description=cast(str | None, intent_payload.get("description")),
        platforms=[slugify_name(platform) for platform in _ensure_string_list(intent_payload.get("platforms"))],
        script=script,
        slots=_normalize_slots(intent_payload.get("slots")),
        skip_words=_normalize_skip_words(intent_payload.get("skip_words")),
        expansion_rules=_normalize_string_mapping(intent_payload.get("expansion_rules")),
        lists=_normalize_lists(intent_payload.get("lists")),
        responses=normalized_responses,
        sentence_groups=sentence_groups,
        created_at=str(intent_payload.get("created_at") or datetime.now(tz=UTC).isoformat()),
    )


@dataclass
class RuntimeData:
    """Holds runtime data for the Intentsity integration."""

    storage: IntentsityStorage


async def async_setup_entry(
    hass: HomeAssistant,
    entry: Any,
) -> bool:
    """Set up the intentsity integration (no credentials, no API)."""
    runtime_data = RuntimeData(storage=IntentsityStorage(hass, entry.entry_id))
    entry.runtime_data = runtime_data
    return True
