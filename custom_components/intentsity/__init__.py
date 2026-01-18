from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Awaitable, Callable

from aiohttp import web
from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
    PipelineRun,
)
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from sqlalchemy import DateTime, Integer, String, Text, create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

from .const import DB_NAME, DEFAULT_EVENT_LIMIT, DOMAIN, MAX_EVENT_LIMIT
from .models import (
    IntentEventListResponse,
    IntentEventRecord,
    LoggedIntentEvent,
    intent_event_from_row,
)

_ORIGINAL_PROCESS_EVENT: (
    Callable[[PipelineRun, PipelineEvent], Awaitable[None]] | None
) = None
LOGGABLE_EVENTS = {
    PipelineEventType.INTENT_START,
    PipelineEventType.INTENT_END,
}

_PANEL_URL_PATH = "intentsity"
_PANEL_URL = f"/{_PANEL_URL_PATH}"
_EVENTS_API_PATH = "/api/intentsity/events"

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

_PANEL_HTML = _PANEL_HTML_TEMPLATE.replace("__EVENTS_API_PATH__", _EVENTS_API_PATH)
_ENGINE_KEY = "engine"


class _DBBase(DeclarativeBase):
    """Base class for ORM models."""


class IntentEventRow(_DBBase):
    __tablename__ = "intent_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    event_type: Mapped[str] = mapped_column(String)
    intent_type: Mapped[str | None] = mapped_column(String, nullable=True)
    raw_event: Mapped[str] = mapped_column(Text)


def _get_db_path(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DB_NAME))


def _get_engine(hass: HomeAssistant) -> Engine:
    domain_data = hass.data.setdefault(DOMAIN, {})
    engine: Engine | None = domain_data.get(_ENGINE_KEY)

    if engine is None:
        db_path = _get_db_path(hass)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        engine = create_engine(f"sqlite:///{db_path}", future=True)
        domain_data[_ENGINE_KEY] = engine

    return engine


def _init_db(hass: HomeAssistant) -> None:
    engine = _get_engine(hass)
    _DBBase.metadata.create_all(engine)


def _record_event(hass: HomeAssistant, run: PipelineRun, event: PipelineEvent) -> None:
    payload = LoggedIntentEvent(
        run_id=run.run_id,
        event_type=event.type.value,
        intent_type=getattr(event.data, "intent_type", None),
        raw_event=event.as_dict(),
    )

    engine = _get_engine(hass)
    with Session(engine) as session:
        session.add(
            IntentEventRow(
                run_id=payload.run_id,
                timestamp=payload.timestamp,
                event_type=payload.event_type,
                intent_type=payload.intent_type,
                raw_event=json.dumps(payload.raw_event, default=str),
            )
        )
        session.commit()


def _query_recent_events(hass: HomeAssistant, limit: int) -> list[IntentEventRecord]:
    engine = _get_engine(hass)
    with Session(engine) as session:
        stmt = (
            select(IntentEventRow)
            .order_by(IntentEventRow.id.desc())
            .limit(limit)
        )
        rows = session.execute(stmt).scalars().all()

    return [
        intent_event_from_row(
            {
                "run_id": row.run_id,
                "timestamp": row.timestamp.isoformat(),
                "event_type": row.event_type,
                "intent_type": row.intent_type,
                "raw_event": row.raw_event,
            }
        )
        for row in rows
    ]


def _clamp_limit(raw_limit: str | None) -> int:
    try:
        parsed = int(raw_limit) if raw_limit is not None else DEFAULT_EVENT_LIMIT
    except (TypeError, ValueError):
        return DEFAULT_EVENT_LIMIT
    return max(1, min(MAX_EVENT_LIMIT, parsed))


async def _patched_process_event(self: PipelineRun, event: PipelineEvent) -> None:
    hass: HomeAssistant = self.hass

    if event.type in LOGGABLE_EVENTS:
        try:
            await hass.async_add_executor_job(_record_event, hass, self, event)
        except Exception as err:  # pragma: no cover - defensive logging
            hass.logger.warning(
                "[assist_intent_logger] Failed to record intent event: %s",
                err,
            )

    assert _ORIGINAL_PROCESS_EVENT is not None
    await _ORIGINAL_PROCESS_EVENT(self, event)


class IntentEventsView(HomeAssistantView):
    url = _EVENTS_API_PATH
    name = "api:assist_intent_logger:events"
    requires_auth = True

    async def get(self, request):  # type: ignore[override]
        hass: HomeAssistant = request.app["hass"]
        limit = _clamp_limit(request.query.get("limit"))
        events = await hass.async_add_executor_job(_query_recent_events, hass, limit)
        payload = IntentEventListResponse(events=events)
        return self.json(payload.model_dump(mode="json"))


class IntentPanelView(HomeAssistantView):
    url = _PANEL_URL
    name = "assist_intent_logger:panel"
    requires_auth = True

    async def get(self, request):  # type: ignore[override]
        return web.Response(text=_PANEL_HTML, content_type="text/html")


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    global _ORIGINAL_PROCESS_EVENT

    domain_data = hass.data.setdefault(DOMAIN, {})

    if _ORIGINAL_PROCESS_EVENT is None:
        await hass.async_add_executor_job(_init_db, hass)
        _ORIGINAL_PROCESS_EVENT = PipelineRun.process_event
        PipelineRun.process_event = _patched_process_event  # type: ignore[assignment]
        hass.logger.info("[assist_intent_logger] PipelineRun.process_event patched")

    if not domain_data.get("api_registered"):
        hass.http.register_view(IntentEventsView())
        hass.http.register_view(IntentPanelView())
        async_register_built_in_panel(
            hass,
            component_name="iframe",
            sidebar_title="Intent Review",
            sidebar_icon="mdi:text-box-search",
            url_path=_PANEL_URL_PATH,
            config={"url": _PANEL_URL},
            require_admin=True,
        )
        domain_data["api_registered"] = True

    return True
