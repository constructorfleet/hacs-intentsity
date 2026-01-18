from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Final

from homeassistant.core import HomeAssistant
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    select,
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload

from .const import DB_NAME, DOMAIN
from .models import (
    ExpectedIntentEndRecord,
    ExpectedIntentProgressRecord,
    IntentEndRecord,
    IntentProgressRecord,
    IntentReviewRecord,
    IntentRunListResponse,
    IntentStartRecord,
    PipelineRunRecord,
)

_CLIENT_KEY: Final = "db_client"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class _DBBase(DeclarativeBase):
    pass


class PipelineRunRow(_DBBase):
    __tablename__ = "pipeline_runs"

    run_id: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    conversation_engine: Mapped[str | None] = mapped_column(String, nullable=True)
    language: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    stt_engine: Mapped[str | None] = mapped_column(String, nullable=True)
    stt_language: Mapped[str | None] = mapped_column(String, nullable=True)
    tts_engine: Mapped[str | None] = mapped_column(String, nullable=True)
    tts_language: Mapped[str | None] = mapped_column(String, nullable=True)
    tts_voice: Mapped[str | None] = mapped_column(String, nullable=True)
    wake_word_entity: Mapped[str | None] = mapped_column(String, nullable=True)
    wake_word_id: Mapped[str | None] = mapped_column(String, nullable=True)
    prefer_local_intents: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    intent_starts: Mapped[list["IntentStartRow"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="IntentStartRow.timestamp",
    )
    intent_progress: Mapped[list["IntentProgressRow"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="IntentProgressRow.timestamp",
    )
    intent_ends: Mapped[list["IntentEndRow"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="IntentEndRow.timestamp",
    )
    review: Mapped["IntentReviewRow | None"] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        lazy="selectin",
        uselist=False,
    )


class IntentStartRow(_DBBase):
    __tablename__ = "intent_starts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("pipeline_runs.run_id", ondelete="CASCADE"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    engine: Mapped[str | None] = mapped_column(String, nullable=True)
    language: Mapped[str | None] = mapped_column(String, nullable=True)
    intent_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    conversation_id: Mapped[str | None] = mapped_column(String, nullable=True)
    device_id: Mapped[str | None] = mapped_column(String, nullable=True)
    satellite_id: Mapped[str | None] = mapped_column(String, nullable=True)
    prefer_local_intents: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    run: Mapped[PipelineRunRow] = relationship(back_populates="intent_starts")


class IntentProgressRow(_DBBase):
    __tablename__ = "intent_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("pipeline_runs.run_id", ondelete="CASCADE"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    chat_log_delta: Mapped[str | None] = mapped_column(Text, nullable=True)
    tts_start_streaming: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    run: Mapped[PipelineRunRow] = relationship(back_populates="intent_progress")


class IntentEndRow(_DBBase):
    __tablename__ = "intent_ends"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("pipeline_runs.run_id", ondelete="CASCADE"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    processed_locally: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    intent_output: Mapped[str | None] = mapped_column(Text, nullable=True)

    run: Mapped[PipelineRunRow] = relationship(back_populates="intent_ends")


class IntentReviewRow(_DBBase):
    __tablename__ = "intent_reviews"

    run_id: Mapped[str] = mapped_column(
        ForeignKey("pipeline_runs.run_id", ondelete="CASCADE"), primary_key=True
    )
    intent_start_id: Mapped[int | None] = mapped_column(
        ForeignKey("intent_starts.id", ondelete="SET NULL"), nullable=True
    )
    matched_expectations: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    run: Mapped[PipelineRunRow] = relationship(back_populates="review")
    expected_progress: Mapped[list["IntentReviewProgressRow"]] = relationship(
        back_populates="review",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="IntentReviewProgressRow.order_index",
    )
    expected_end: Mapped["IntentReviewEndRow | None"] = relationship(
        back_populates="review",
        cascade="all, delete-orphan",
        lazy="selectin",
        uselist=False,
    )


class IntentReviewProgressRow(_DBBase):
    __tablename__ = "intent_review_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    review_run_id: Mapped[str] = mapped_column(
        ForeignKey("intent_reviews.run_id", ondelete="CASCADE")
    )
    order_index: Mapped[int] = mapped_column(Integer)
    chat_log_delta: Mapped[str | None] = mapped_column(Text, nullable=True)
    tts_start_streaming: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    review: Mapped[IntentReviewRow] = relationship(back_populates="expected_progress")


class IntentReviewEndRow(_DBBase):
    __tablename__ = "intent_review_end"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    review_run_id: Mapped[str] = mapped_column(
        ForeignKey("intent_reviews.run_id", ondelete="CASCADE"), unique=True
    )
    order_index: Mapped[int] = mapped_column(Integer)
    processed_locally: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    intent_output: Mapped[str | None] = mapped_column(Text, nullable=True)

    review: Mapped[IntentReviewRow] = relationship(back_populates="expected_end")


def get_db_path(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DB_NAME))


class IntentsityDBClient:
    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._engine: Engine | None = None

    def ensure_initialized(self) -> None:
        engine = self._get_engine()
        _DBBase.metadata.create_all(engine)

    def upsert_pipeline_run(self, run_id: str, metadata: dict[str, Any]) -> None:
        engine = self._get_engine()
        with Session(engine) as session:
            row = session.get(PipelineRunRow, run_id)
            if row is None:
                row = PipelineRunRow(run_id=run_id, created_at=metadata.get("created_at", _utcnow()))
                session.add(row)

            for field in (
                "conversation_engine",
                "language",
                "name",
                "stt_engine",
                "stt_language",
                "tts_engine",
                "tts_language",
                "tts_voice",
                "wake_word_entity",
                "wake_word_id",
                "prefer_local_intents",
            ):
                value = metadata.get(field)
                if value is not None:
                    setattr(row, field, value)

            session.commit()

    def insert_intent_start(self, payload: IntentStartRecord) -> None:
        engine = self._get_engine()
        with Session(engine) as session:
            session.add(
                IntentStartRow(
                    run_id=payload.run_id,
                    timestamp=payload.timestamp,
                    engine=payload.engine,
                    language=payload.language,
                    intent_input=payload.intent_input,
                    conversation_id=payload.conversation_id,
                    device_id=payload.device_id,
                    satellite_id=payload.satellite_id,
                    prefer_local_intents=payload.prefer_local_intents,
                )
            )
            session.commit()

    def insert_intent_progress(self, payload: IntentProgressRecord) -> None:
        engine = self._get_engine()
        with Session(engine) as session:
            session.add(
                IntentProgressRow(
                    run_id=payload.run_id,
                    timestamp=payload.timestamp,
                    chat_log_delta=json.dumps(payload.chat_log_delta) if payload.chat_log_delta is not None else None,
                    tts_start_streaming=payload.tts_start_streaming,
                )
            )
            session.commit()

    def insert_intent_end(self, payload: IntentEndRecord) -> None:
        engine = self._get_engine()
        with Session(engine) as session:
            session.add(
                IntentEndRow(
                    run_id=payload.run_id,
                    timestamp=payload.timestamp,
                    processed_locally=payload.processed_locally,
                    intent_output=json.dumps(payload.intent_output, default=str) if payload.intent_output else None,
                )
            )
            session.commit()

    def fetch_recent_runs(self, limit: int) -> IntentRunListResponse:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = (
                select(PipelineRunRow)
                .order_by(PipelineRunRow.created_at.desc())
                .limit(limit)
                .options(
                    selectinload(PipelineRunRow.intent_starts),
                    selectinload(PipelineRunRow.intent_progress),
                    selectinload(PipelineRunRow.intent_ends),
                    selectinload(PipelineRunRow.review)
                    .selectinload(IntentReviewRow.expected_progress),
                    selectinload(PipelineRunRow.review)
                    .selectinload(IntentReviewRow.expected_end),
                )
            )
            rows = session.scalars(stmt).all()

        runs = [self._row_to_model(row) for row in rows]
        return IntentRunListResponse(runs=runs)

    def save_review(
        self,
        run_id: str,
        intent_start_id: int | None,
        matched_expectations: bool,
        expected_progress: list[ExpectedIntentProgressRecord],
        expected_end: ExpectedIntentEndRecord | None,
    ) -> None:
        engine = self._get_engine()
        with Session(engine) as session:
            pipeline = session.get(PipelineRunRow, run_id)
            if pipeline is None:
                raise ValueError(f"Pipeline run {run_id} does not exist")

            review = session.get(IntentReviewRow, run_id)
            if review is None:
                review = IntentReviewRow(run_id=run_id)
                session.add(review)

            review.intent_start_id = intent_start_id
            review.matched_expectations = matched_expectations
            review.updated_at = datetime.now(timezone.utc)

            review.expected_progress.clear()
            if review.expected_end is not None:
                session.delete(review.expected_end)
                review.expected_end = None
            session.flush()

            for progress in sorted(expected_progress, key=lambda item: item.order_index):
                review.expected_progress.append(
                    IntentReviewProgressRow(
                        order_index=progress.order_index,
                        chat_log_delta=json.dumps(progress.chat_log_delta)
                        if progress.chat_log_delta is not None
                        else None,
                        tts_start_streaming=progress.tts_start_streaming,
                    )
                )

            if expected_end is not None:
                review.expected_end = IntentReviewEndRow(
                    order_index=expected_end.order_index,
                    processed_locally=expected_end.processed_locally,
                    intent_output=json.dumps(expected_end.intent_output)
                    if expected_end.intent_output is not None
                    else None,
                )

            session.commit()

    def dispose(self) -> None:
        if self._engine is not None:
            self._engine.dispose()
            self._engine = None

    def _row_to_model(self, row: PipelineRunRow) -> PipelineRunRecord:
        return PipelineRunRecord(
            run_id=row.run_id,
            created_at=row.created_at,
            conversation_engine=row.conversation_engine,
            language=row.language,
            name=row.name,
            stt_engine=row.stt_engine,
            stt_language=row.stt_language,
            tts_engine=row.tts_engine,
            tts_language=row.tts_language,
            tts_voice=row.tts_voice,
            wake_word_entity=row.wake_word_entity,
            wake_word_id=row.wake_word_id,
            prefer_local_intents=row.prefer_local_intents,
            intent_starts=[
                IntentStartRecord(
                    run_id=row.run_id,
                    id=start.id,
                    timestamp=start.timestamp,
                    engine=start.engine,
                    language=start.language,
                    intent_input=start.intent_input,
                    conversation_id=start.conversation_id,
                    device_id=start.device_id,
                    satellite_id=start.satellite_id,
                    prefer_local_intents=start.prefer_local_intents,
                )
                for start in row.intent_starts
            ],
            intent_progress=[
                IntentProgressRecord(
                    run_id=row.run_id,
                    id=progress.id,
                    timestamp=progress.timestamp,
                    chat_log_delta=json.loads(progress.chat_log_delta)
                    if progress.chat_log_delta
                    else None,
                    tts_start_streaming=progress.tts_start_streaming,
                )
                for progress in row.intent_progress
            ],
            intent_ends=[
                IntentEndRecord(
                    run_id=row.run_id,
                    id=end.id,
                    timestamp=end.timestamp,
                    processed_locally=end.processed_locally,
                    intent_output=json.loads(end.intent_output)
                    if end.intent_output
                    else {},
                )
                for end in row.intent_ends
            ],
            review=self._review_to_model(row.review),
        )

    def _review_to_model(self, review: IntentReviewRow | None) -> IntentReviewRecord | None:
        if review is None:
            return None

        expected_progress = [
            ExpectedIntentProgressRecord(
                order_index=progress.order_index,
                chat_log_delta=json.loads(progress.chat_log_delta)
                if progress.chat_log_delta
                else None,
                tts_start_streaming=progress.tts_start_streaming,
            )
            for progress in review.expected_progress
        ]

        expected_end = None
        if review.expected_end is not None:
            expected_end = ExpectedIntentEndRecord(
                order_index=review.expected_end.order_index,
                processed_locally=review.expected_end.processed_locally,
                intent_output=json.loads(review.expected_end.intent_output)
                if review.expected_end.intent_output
                else None,
            )

        return IntentReviewRecord(
            run_id=review.run_id,
            intent_start_id=review.intent_start_id,
            matched_expectations=review.matched_expectations,
            updated_at=review.updated_at,
            expected_progress=expected_progress,
            expected_end=expected_end,
        )

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


def upsert_pipeline_run(hass: HomeAssistant, run_id: str, metadata: dict[str, Any]) -> None:
    _get_client(hass).upsert_pipeline_run(run_id, metadata)


def insert_intent_start(hass: HomeAssistant, payload: IntentStartRecord) -> None:
    _get_client(hass).insert_intent_start(payload)


def insert_intent_progress(hass: HomeAssistant, payload: IntentProgressRecord) -> None:
    _get_client(hass).insert_intent_progress(payload)


def insert_intent_end(hass: HomeAssistant, payload: IntentEndRecord) -> None:
    _get_client(hass).insert_intent_end(payload)


def fetch_recent_runs(hass: HomeAssistant, limit: int) -> IntentRunListResponse:
    return _get_client(hass).fetch_recent_runs(limit)


def save_review(
    hass: HomeAssistant,
    run_id: str,
    intent_start_id: int | None,
    matched_expectations: bool,
    expected_progress: list[ExpectedIntentProgressRecord],
    expected_end: ExpectedIntentEndRecord | None,
) -> None:
    _get_client(hass).save_review(
        run_id,
        intent_start_id,
        matched_expectations,
        expected_progress,
        expected_end,
    )