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

_ENGINE_KEY: Final = "engine"


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


def _get_engine(hass: HomeAssistant) -> Engine:
    domain_data = hass.data.setdefault(DOMAIN, {})
    engine: Engine | None = domain_data.get(_ENGINE_KEY)

    if engine is None:
        db_path = get_db_path(hass)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        engine = create_engine(f"sqlite:///{db_path}", future=True)
        domain_data[_ENGINE_KEY] = engine

    return engine


def dispose_engine(hass: HomeAssistant) -> None:
    domain_data = hass.data.get(DOMAIN)
    if not isinstance(domain_data, dict):
        return

    engine: Engine | None = domain_data.pop(_ENGINE_KEY, None)
    if engine is not None:
        engine.dispose()


def init_db(hass: HomeAssistant) -> None:
    engine = _get_engine(hass)
    _DBBase.metadata.create_all(engine)


def insert_event(hass: HomeAssistant, payload: LoggedIntentEvent) -> None:
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


def fetch_recent_events(hass: HomeAssistant, limit: int) -> list[IntentEventRecord]:
    engine = _get_engine(hass)
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