from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Final

from homeassistant.core import HomeAssistant
from sqlalchemy import (
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
from .models import Chat, ChatMessage

_CLIENT_KEY: Final = "db_client"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


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
        order_by="ChatMessageRow.timestamp",
    )


class ChatMessageRow(_DBBase):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id", ondelete="CASCADE"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    sender: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[str | None] = mapped_column(Text, nullable=True)

    chat: Mapped[ChatRow] = relationship(back_populates="messages")


def get_db_path(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DB_NAME))


class IntentsityDBClient:
    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._engine: Engine | None = None

    def ensure_initialized(self) -> None:
        engine = self._get_engine()
        _DBBase.metadata.create_all(engine)


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
            for msg in chat.messages:
                msg_row = ChatMessageRow(
                    chat_id=chat_row.id,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=json.dumps(msg.data) if msg.data else None,
                )
                session.add(msg_row)
            session.commit()
            return chat_row.id

    def insert_chat_message(self, chat_id: int, message: ChatMessage) -> int:
        engine = self._get_engine()
        with Session(engine) as session:
            msg_row = ChatMessageRow(
                chat_id=chat_id,
                timestamp=message.timestamp,
                sender=message.sender,
                text=message.text,
                data=json.dumps(message.data) if message.data else None,
            )
            session.add(msg_row)
            session.commit()
            return msg_row.id

    def fetch_recent_chats(self, limit: int) -> list[Chat]:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = (
                select(ChatRow)
                .order_by(ChatRow.created_at.desc())
                .limit(limit)
                .options(selectinload(ChatRow.messages))
            )
            rows = session.scalars(stmt).all()
        chats = []
        for row in rows:
            messages = [
                ChatMessage(
                    id=msg.id,
                    chat_id=msg.chat_id,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=json.loads(msg.data) if msg.data else {},
                )
                for msg in row.messages
            ]
            chats.append(
                Chat(
                    id=row.id,
                    created_at=row.created_at,
                    conversation_id=row.conversation_id,
                    messages=messages,
                )
            )
        return chats


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


def fetch_recent_chats(hass: HomeAssistant, limit: int) -> list[Chat]:
    return _get_client(hass).fetch_recent_chats(limit)
