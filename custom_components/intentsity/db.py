from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Final

from homeassistant.core import HomeAssistant
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine, func, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload


from .const import DB_NAME, DOMAIN
from .models import Chat, ChatMessage, CorrectedChat, CorrectedChatMessage

_CLIENT_KEY: Final = "db_client"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class _DateTimeEncoder(json.JSONEncoder):
    def default(self, o: object) -> object:
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)


def _json_dumps(value: object) -> str:
    return json.dumps(value, cls=_DateTimeEncoder)


class _DBBase(DeclarativeBase):
    pass


# New chat-centric schema
class ChatRow(_DBBase):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    conversation_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    messages: Mapped[list["ChatMessageRow"]] = relationship(
        back_populates="chat",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ChatMessageRow.position, ChatMessageRow.id",
    )
    corrected: Mapped["CorrectedChatRow | None"] = relationship(
        back_populates="original_chat",
        cascade="all, delete-orphan",
        lazy="selectin",
        uselist=False,
    )


class ChatMessageRow(_DBBase):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id", ondelete="CASCADE"))
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    sender: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[str | None] = mapped_column(Text, nullable=True)

    chat: Mapped[ChatRow] = relationship(back_populates="messages")


class CorrectedChatRow(_DBBase):
    __tablename__ = "corrected_chats"
    __table_args__ = (UniqueConstraint("original_chat_id", name="uniq_corrected_original_chat"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    original_chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    messages: Mapped[list["CorrectedChatMessageRow"]] = relationship(
        back_populates="corrected_chat",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="CorrectedChatMessageRow.position",
    )
    original_chat: Mapped[ChatRow] = relationship(back_populates="corrected")


class CorrectedChatMessageRow(_DBBase):
    __tablename__ = "corrected_chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    corrected_chat_id: Mapped[int] = mapped_column(ForeignKey("corrected_chats.id", ondelete="CASCADE"))
    original_message_id: Mapped[int | None] = mapped_column(
        ForeignKey("chat_messages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    sender: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[str | None] = mapped_column(Text, nullable=True)

    corrected_chat: Mapped[CorrectedChatRow] = relationship(back_populates="messages")


def get_db_path(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DB_NAME))


class IntentsityDBClient:
    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._engine: Engine | None = None

    def ensure_initialized(self) -> None:
        engine = self._get_engine()
        _DBBase.metadata.create_all(engine)
        self._ensure_schema(engine)

    def _ensure_schema(self, engine: Engine) -> None:
        with engine.begin() as conn:
            result = conn.execute(text("PRAGMA table_info(chat_messages)"))
            columns = {row[1] for row in result.fetchall()}
            if "position" not in columns:
                conn.execute(
                    text(
                        "ALTER TABLE chat_messages ADD COLUMN position INTEGER NOT NULL DEFAULT 0"
                    )
                )


    # New chat persistence methods
    def insert_chat(self, chat: Chat) -> int:
        engine = self._get_engine()
        with Session(engine) as session:
            chat_row = ChatRow(
                created_at=chat.created_at,
                conversation_id=chat.conversation_id,
            )
            session.add(chat_row)
            session.flush()
            for index, msg in enumerate(chat.messages):
                msg_row = ChatMessageRow(
                    chat_id=chat_row.id,
                    position=msg.position if msg.position is not None else index,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=_json_dumps(msg.data) if msg.data else None,
                )
                session.add(msg_row)
            session.commit()
            return chat_row.id

    def insert_chat_message(self, chat_id: int, message: ChatMessage) -> int:
        engine = self._get_engine()
        with Session(engine) as session:
            position = message.position
            if position is None:
                max_position = session.scalar(
                    select(func.max(ChatMessageRow.position)).where(ChatMessageRow.chat_id == chat_id)
                )
                position = (max_position or 0) + 1
            msg_row = ChatMessageRow(
                chat_id=chat_id,
                position=position,
                timestamp=message.timestamp,
                sender=message.sender,
                text=message.text,
                data=_json_dumps(message.data) if message.data else None,
            )
            session.add(msg_row)
            session.commit()
            return msg_row.id

    def replace_chat_messages(self, chat_id: int, messages: list[ChatMessage]) -> None:
        engine = self._get_engine()
        with Session(engine) as session:
            session.query(ChatMessageRow).filter(ChatMessageRow.chat_id == chat_id).delete()
            for index, msg in enumerate(messages):
                msg_row = ChatMessageRow(
                    chat_id=chat_id,
                    position=msg.position if msg.position is not None else index,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=_json_dumps(msg.data) if msg.data else None,
                )
                session.add(msg_row)
            session.commit()

    def upsert_corrected_chat(self, original_chat_id: int, messages: list[CorrectedChatMessage]) -> int:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = select(CorrectedChatRow).where(CorrectedChatRow.original_chat_id == original_chat_id)
            corrected = session.scalars(stmt).first()
            now = _utcnow()
            if corrected is None:
                corrected = CorrectedChatRow(
                    original_chat_id=original_chat_id,
                    created_at=now,
                    updated_at=now,
                )
                session.add(corrected)
                session.flush()
            else:
                corrected.updated_at = now
                corrected.messages.clear()
                session.flush()

            for index, msg in enumerate(messages):
                msg_row = CorrectedChatMessageRow(
                    corrected_chat_id=corrected.id,
                    original_message_id=msg.original_message_id,
                    position=index,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=_json_dumps(msg.data) if msg.data else None,
                )
                session.add(msg_row)
            session.commit()
            return corrected.id

    def fetch_recent_chats(self, limit: int) -> list[Chat]:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = (
                select(ChatRow)
                .order_by(ChatRow.created_at.desc())
                .limit(limit)
                .options(
                    selectinload(ChatRow.messages),
                    selectinload(ChatRow.corrected).selectinload(CorrectedChatRow.messages),
                )
            )
            rows = session.scalars(stmt).all()
        return [_row_to_chat(row) for row in rows]

    def fetch_latest_chat_by_conversation_id(self, conversation_id: str) -> Chat | None:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = (
                select(ChatRow)
                .where(ChatRow.conversation_id == conversation_id)
                .order_by(ChatRow.created_at.desc())
                .limit(1)
                .options(
                    selectinload(ChatRow.messages),
                    selectinload(ChatRow.corrected).selectinload(CorrectedChatRow.messages),
                )
            )
            row = session.scalars(stmt).first()
        if row is None:
            return None
        return _row_to_chat(row)


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


















def insert_chat(hass: HomeAssistant, chat: Chat) -> int:
    return _get_client(hass).insert_chat(chat)


def insert_chat_message(hass: HomeAssistant, chat_id: int, message: ChatMessage) -> int:
    return _get_client(hass).insert_chat_message(chat_id, message)


def replace_chat_messages(hass: HomeAssistant, chat_id: int, messages: list[ChatMessage]) -> None:
    return _get_client(hass).replace_chat_messages(chat_id, messages)


def fetch_recent_chats(hass: HomeAssistant, limit: int) -> list[Chat]:
    return _get_client(hass).fetch_recent_chats(limit)


def fetch_latest_chat_by_conversation_id(hass: HomeAssistant, conversation_id: str) -> Chat | None:
    return _get_client(hass).fetch_latest_chat_by_conversation_id(conversation_id)


def upsert_corrected_chat(hass: HomeAssistant, original_chat_id: int, messages: list[CorrectedChatMessage]) -> int:
    return _get_client(hass).upsert_corrected_chat(original_chat_id, messages)


def _row_to_chat(row: ChatRow) -> Chat:
    messages = [
        ChatMessage(
            id=msg.id,
            chat_id=msg.chat_id,
            position=msg.position,
            timestamp=msg.timestamp,
            sender=msg.sender,
            text=msg.text,
            data=json.loads(msg.data) if msg.data else {},
        )
        for msg in row.messages
    ]
    corrected = None
    if row.corrected is not None:
        corrected_messages = [
            CorrectedChatMessage(
                id=msg.id,
                corrected_chat_id=msg.corrected_chat_id,
                original_message_id=msg.original_message_id,
                position=msg.position,
                timestamp=msg.timestamp,
                sender=msg.sender,
                text=msg.text,
                data=json.loads(msg.data) if msg.data else {},
            )
            for msg in row.corrected.messages
        ]
        corrected = CorrectedChat(
            id=row.corrected.id,
            original_chat_id=row.corrected.original_chat_id,
            created_at=row.corrected.created_at,
            updated_at=row.corrected.updated_at,
            messages=corrected_messages,
        )
    return Chat(
        id=row.id,
        created_at=row.created_at,
        conversation_id=row.conversation_id,
        messages=messages,
        corrected=corrected,
    )
