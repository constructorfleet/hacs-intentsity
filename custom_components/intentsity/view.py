from __future__ import annotations

from aiohttp import web

from homeassistant.core import HomeAssistant
from homeassistant.helpers.http import HomeAssistantView

from .const import (
    DEFAULT_EVENT_LIMIT,
    MAX_EVENT_LIMIT,
    WS_CMD_LIST_EVENTS,
    WS_CMD_SUBSCRIBE_EVENTS,
)

PANEL_URL_PATH = "intentsity"
PANEL_URL = f"/{PANEL_URL_PATH}"

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
    const DEFAULT_LIMIT = __DEFAULT_LIMIT__;
    const MAX_LIMIT = __MAX_LIMIT__;
    const LIST_COMMAND = '__WS_LIST_CMD__';
    const SUBSCRIBE_COMMAND = '__WS_SUB_CMD__';
    let unsubscribe = null;

    function clampLimit(raw) {
        const value = Number.isFinite(raw) ? raw : DEFAULT_LIMIT;
        return Math.max(1, Math.min(MAX_LIMIT, value || DEFAULT_LIMIT));
    }

    async function getConnection() {
        if (!window.hassConnection) {
            throw new Error('Home Assistant connection unavailable');
        }
        const {conn} = await window.hassConnection;
        return conn;
    }

    function renderEvents(events) {
        const tbody = document.getElementById('intent-table');
        tbody.innerHTML = '';
        events.forEach(event => {
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

    async function requestSnapshot(limit) {
        try {
            const conn = await getConnection();
            const response = await conn.sendMessagePromise({
                type: LIST_COMMAND,
                limit,
            });
            renderEvents(response.events || []);
        } catch (error) {
            console.error(error);
            alert('Failed to load events');
        }
    }

    async function ensureSubscription(limit) {
        const conn = await getConnection();
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        unsubscribe = await conn.subscribeMessage((message) => {
            renderEvents(message.events || []);
        }, {
            type: SUBSCRIBE_COMMAND,
            limit,
        });
    }

    async function loadEvents() {
        const limitInput = document.getElementById('limit');
        const limit = clampLimit(parseInt(limitInput.value, 10));
        limitInput.value = limit;
        await requestSnapshot(limit);
        await ensureSubscription(limit);
    }

    window.onload = loadEvents;
    window.addEventListener('beforeunload', () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    });
    </script>
</body>
</html>
"""

_PANEL_HTML = (
    _PANEL_HTML_TEMPLATE
    .replace("__DEFAULT_LIMIT__", str(DEFAULT_EVENT_LIMIT))
    .replace("__MAX_LIMIT__", str(MAX_EVENT_LIMIT))
    .replace("__WS_LIST_CMD__", WS_CMD_LIST_EVENTS)
    .replace("__WS_SUB_CMD__", WS_CMD_SUBSCRIBE_EVENTS)
)


class IntentPanelView(HomeAssistantView):
    url = PANEL_URL
    name = "assist_intent_logger:panel"
    requires_auth = True

    async def get(self, request):  # type: ignore[override]
        return web.Response(text=_PANEL_HTML, content_type="text/html")
