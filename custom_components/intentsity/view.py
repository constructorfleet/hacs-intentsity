from __future__ import annotations

from pathlib import Path

from aiohttp import web

from homeassistant.core import HomeAssistant
from homeassistant.helpers.http import HomeAssistantView

from .const import (
    DEFAULT_EVENT_LIMIT,
    MAX_EVENT_LIMIT,
    WS_CMD_LIST_EVENTS,
    WS_CMD_SAVE_REVIEW,
    WS_CMD_SUBSCRIBE_EVENTS,
)

PANEL_URL_PATH = "intentsity"
PANEL_URL = f"/{PANEL_URL_PATH}.js?3"

# def _load_panel_html() -> str:
#     panel_path = Path(__file__).with_name("panel.html")
#     template = panel_path.read_text(encoding="utf-8")
#     return (
#         template
#         .replace("__DEFAULT_LIMIT__", str(DEFAULT_EVENT_LIMIT))
#         .replace("__MAX_LIMIT__", str(MAX_EVENT_LIMIT))
#         .replace("__WS_LIST_CMD__", WS_CMD_LIST_EVENTS)
#         .replace("__WS_SUB_CMD__", WS_CMD_SUBSCRIBE_EVENTS)
#         .replace("__WS_SAVE_REVIEW__", WS_CMD_SAVE_REVIEW)
#     )


# _PANEL_HTML = _load_panel_html()


# class IntentPanelView(HomeAssistantView):
#     url = PANEL_URL
#     name = "assist_intent_logger:panel"
#     requires_auth = True

#     async def get(self, request):  # type: ignore[override]
#         return web.Response(text=_PANEL_HTML, content_type="text/html")
