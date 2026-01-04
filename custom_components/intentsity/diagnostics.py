"""Diagnostics support for intentsity.

Learn more about diagnostics:
https://developers.home-assistant.io/docs/core/integration_diagnostics
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.helpers.redact import async_redact_data

from .utils import get_intentsity_storage

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant


# Fields to redact from diagnostics - CRITICAL for security!
TO_REDACT = {
    CONF_PASSWORD,
    CONF_USERNAME,
    "username",
    "password",
    "api_key",
    "token",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry,
) -> dict[str, Any]:
    """Return diagnostics for a config entry (redacted, stateless, storage-based)."""
    storage = get_intentsity_storage(entry)
    intents = await storage.async_list_intents()
    # Only include summary info for each intent (no slot/list/expansion details)
    intents_summary = [
        {
            "id": intent.id,
            "name": intent.name,
            "description": intent.description,
            "created_at": intent.created_at,
        }
        for intent in intents
    ]
    entry_info = {
        "entry_id": entry.entry_id,
        "version": getattr(entry, "version", None),
        "minor_version": getattr(entry, "minor_version", None),
        "domain": entry.domain,
        "title": entry.title,
        "state": str(getattr(entry, "state", "unknown")),
        "unique_id": getattr(entry, "unique_id", None),
        "disabled_by": (entry.disabled_by.value if getattr(entry, "disabled_by", None) else None),
        "data": async_redact_data(entry.data, TO_REDACT),
        "options": async_redact_data(entry.options, TO_REDACT),
    }
    return {
        "entry": entry_info,
        "intents": intents_summary,
    }
