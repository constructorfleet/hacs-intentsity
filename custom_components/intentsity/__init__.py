from __future__ import annotations

import logging
from random import randint
from typing import Any

import voluptuous as vol

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from . import db, websocket
from .const import (
    COORDINATOR_KEY,
    DATA_API_REGISTERED,
    DATA_DB_INITIALIZED,
    DATA_UNSUBSCRIBE,
    DOMAIN,
)
from .coordinator import IntentsityCoordinator

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        vol.Optional(DOMAIN): vol.Schema({}),
    },
    extra=vol.ALLOW_EXTRA,
)

PLATFORMS = [Platform.SENSOR]


def _intent_output_targets(intent_output: dict[str, Any]) -> dict[str, Any] | None:
    response = intent_output.get("response")
    if not isinstance(response, dict):
        return None
    data = response.get("data")
    if not isinstance(data, dict):
        return None
    targets = data.get("targets") or []
    success = data.get("success") or []
    failed = data.get("failed") or []
    if not (targets or success or failed):
        return None
    return {"targets": targets, "success": success, "failed": failed}


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})
    await _async_initialize(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    await hass.async_add_executor_job(db.dispose_client, hass)
    domain_data = hass.data.pop(DOMAIN, {})
    if DATA_UNSUBSCRIBE in domain_data:
        domain_data[DATA_UNSUBSCRIBE]()
    return True


async def _async_initialize(hass: HomeAssistant) -> None:
    domain_data = hass.data.setdefault(DOMAIN, {})

    if not domain_data.get(DATA_DB_INITIALIZED, False):
        await hass.async_add_executor_job(db.init_db, hass)
        domain_data[DATA_DB_INITIALIZED] = True

    if COORDINATOR_KEY not in domain_data:
        coordinator = IntentsityCoordinator(hass)
        domain_data[COORDINATOR_KEY] = coordinator
        await coordinator.async_config_entry_first_refresh()

    if not domain_data.get(DATA_API_REGISTERED, False):
        websocket.async_register_commands(hass)
        version = randint(0, 999999)
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    "/intentsity_panel.js",
                    hass.config.path("custom_components/intentsity/panel.js"),
                    False,
                ),
            ]
        )
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Intent Review",
            sidebar_icon="mdi:text-box-search",
            frontend_url_path="intentsity",
            config={
                "_panel_custom": {
                    "name": "intentsity-panel",
                    "js_url": f"/intentsity_panel.js?v={version}",
                }
            },
            require_admin=True,
        )
        domain_data[DATA_API_REGISTERED] = True
