from __future__ import annotations

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DEFAULT_EVENT_LIMIT, MAX_EVENT_LIMIT
from .db import fetch_recent_events
from .models import IntentEventListResponse

PANEL_URL_PATH = "intentsity"
PANEL_URL = f"/{PANEL_URL_PATH}"
EVENTS_API_PATH = "/api/intentsity/events"

_PANEL_HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\" />
    <title>Intentsity Intent Review</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 24px; background: #f4f6f8; }
        h1 { margin-bottom: 8px; }
        .controls { margin-bottom: 16px; }
        label { margin-right: 8px; }
        table { width: 100%; border-collapse: collapse; background: #fff; }
        th, td { padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: left; }
        th { background: #fafafa; }
        tr:hover { background: #f1f9ff; }
        pre { margin: 0; white-space: pre-wrap; word-break: break-word; }
        button { padding: 6px 12px; }
    </style>
</head>
<body>
    <h1>Assist Intent Review</h1>
    <p>Inspect captured Assist intents for dataset curation.</p>
    <div class=\"controls\">
        <label for=\"limit\">Rows:</label>
        <input id=\"limit\" type=\"number\" min=\"1\" max=\"500\" value=\"100\" />
        <button type=\"button\" onclick=\"loadEvents()\">Refresh</button>
    </div>
    <table>
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Run ID</th>
                <th>Type</th>
                <th>Intent</th>
                <th>Payload</th>
            </tr>
        </thead>
        <tbody id=\"intent-table\"></tbody>
    </table>
    <script>
    async function loadEvents() {
        const limitInput = document.getElementById('limit');
        const limit = Math.max(1, Math.min(500, parseInt(limitInput.value || '100', 10)));
        const response = await fetch('__EVENTS_API_PATH__?limit=' + limit, {credentials: 'same-origin'});
        if (!response.ok) {
            alert('Failed to load events');
            return;
        }
        const data = await response.json();
        const tbody = document.getElementById('intent-table');
        tbody.innerHTML = '';
        data.events.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(event.timestamp).toLocaleString()}</td>
                <td>${event.run_id}</td>
                <td>${event.event_type}</td>
                <td>${event.intent_type || ''}</td>
                <td><pre>${JSON.stringify(event.raw_event, null, 2)}</pre></td>
            `;
            tbody.appendChild(row);
        });
    }
    window.onload = loadEvents;
    </script>
</body>
</html>
"""

_PANEL_HTML = _PANEL_HTML_TEMPLATE.replace("__EVENTS_API_PATH__", EVENTS_API_PATH)


def clamp_limit(raw_limit: str | None) -> int:
    try:
        parsed = int(raw_limit) if raw_limit is not None else DEFAULT_EVENT_LIMIT
    except (TypeError, ValueError):
        return DEFAULT_EVENT_LIMIT
    return max(1, min(MAX_EVENT_LIMIT, parsed))


class IntentEventsView(HomeAssistantView):
    url = EVENTS_API_PATH
    name = "api:assist_intent_logger:events"
    requires_auth = True

    async def get(self, request):  # type: ignore[override]
        hass: HomeAssistant = request.app["hass"]
        limit = clamp_limit(request.query.get("limit"))
        events = await hass.async_add_executor_job(fetch_recent_events, hass, limit)
        payload = IntentEventListResponse(events=events)
        return self.json(payload.model_dump(mode="json"))


class IntentPanelView(HomeAssistantView):
    url = PANEL_URL
    name = "assist_intent_logger:panel"
    requires_auth = True

    async def get(self, request):  # type: ignore[override]
        return web.Response(text=_PANEL_HTML, content_type="text/html")
