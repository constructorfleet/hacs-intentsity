from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Final

from homeassistant.core import HomeAssistant
from sqlalchemy import DateTime, Integer, String, Text, create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

from .const import DB_NAME, DOMAIN
from .models import IntentEventRecord, LoggedIntentEvent, intent_event_from_row

_CLIENT_KEY: Final = "db_client"


class _DBBase(DeclarativeBase):
    """Base declarative model."""


class IntentEventRow(_DBBase):
    __tablename__ = "intent_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    event_type: Mapped[str] = mapped_column(String)
    intent_type: Mapped[str | None] = mapped_column(String, nullable=True)
    raw_event: Mapped[str] = mapped_column(Text)


def get_db_path(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DB_NAME))


class IntentsityDBClient:
    """Encapsulates all database interactions for Intentsity."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._engine: Engine | None = None

    def ensure_initialized(self) -> None:
        engine = self._get_engine()
        _DBBase.metadata.create_all(engine)

    def insert_event(self, payload: LoggedIntentEvent) -> None:
        engine = self._get_engine()
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

    def fetch_recent_events(self, limit: int) -> list[IntentEventRecord]:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = select(IntentEventRow).order_by(IntentEventRow.id.desc()).limit(limit)
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

    def dispose(self) -> None:
        if self._engine is not None:
            self._engine.dispose()
            self._engine = None

    def _get_engine(self) -> Engine:
        if self._engine is None:
            db_path = get_db_path(self._hass)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            self._engine = create_engine(f"sqlite:///{db_path}", future=True)
        return self._engine


def _get_client(hass: HomeAssistant) -> IntentsityDBClient:
    domain_data = hass.data.setdefault(DOMAIN, {})
    client: IntentsityDBClient | None = domain_data.get(_CLIENT_KEY)
    if client is None:
        client = IntentsityDBClient(hass)
        domain_data[_CLIENT_KEY] = client
    return client


def dispose_client(hass: HomeAssistant) -> None:
    domain_data = hass.data.get(DOMAIN)
    if not isinstance(domain_data, dict):
        return

    client: IntentsityDBClient | None = domain_data.pop(_CLIENT_KEY, None)
    if client is not None:
        client.dispose()


def init_db(hass: HomeAssistant) -> None:
    _get_client(hass).ensure_initialized()


def insert_event(hass: HomeAssistant, payload: LoggedIntentEvent) -> None:
    _get_client(hass).insert_event(payload)


def fetch_recent_events(hass: HomeAssistant, limit: int) -> list[IntentEventRecord]:
    return _get_client(hass).fetch_recent_events(limit)