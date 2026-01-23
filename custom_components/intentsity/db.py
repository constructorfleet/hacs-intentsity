from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Final

from homeassistant.core import HomeAssistant
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine, func, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError
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

    conversation_id: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
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
    chat_id: Mapped[str] = mapped_column(ForeignKey("chats.conversation_id", ondelete="CASCADE"))
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    sender: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[str | None] = mapped_column(Text, nullable=True)

    chat: Mapped[ChatRow] = relationship(back_populates="messages")


class CorrectedChatRow(_DBBase):
    __tablename__ = "corrected_chats"
    __table_args__ = (
        UniqueConstraint("original_conversation_id", name="uniq_corrected_original_conversation"),
    )

    conversation_id: Mapped[str] = mapped_column(String, primary_key=True)
    original_conversation_id: Mapped[str] = mapped_column(
        ForeignKey("chats.conversation_id", ondelete="CASCADE"), index=True
    )
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
    corrected_chat_id: Mapped[str] = mapped_column(
        ForeignKey("corrected_chats.conversation_id", ondelete="CASCADE")
    )
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
        def _columns(table_name: str) -> set[str]:
            result = conn.execute(text(f"PRAGMA table_info({table_name})"))
            return {row[1] for row in result.fetchall()}

        def _table_exists(table_name: str) -> bool:
            result = conn.execute(
                text(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=:name"
                ),
                {"name": table_name},
            )
            return result.fetchone() is not None

        with engine.begin() as conn:
            if _table_exists("chat_messages"):
                columns = _columns("chat_messages")
                if "position" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE chat_messages ADD COLUMN position INTEGER NOT NULL DEFAULT 0"
                        )
                    )

            chats_columns = _columns("chats") if _table_exists("chats") else set()
            if "id" in chats_columns:
                conn.execute(text("PRAGMA foreign_keys=OFF"))

                conn.execute(
                    text(
                        """
                        CREATE TABLE chats_new (
                            conversation_id TEXT PRIMARY KEY,
                            created_at DATETIME
                        )
                        """
                    )
                )
                conn.execute(
                    text(
                        """
                        INSERT INTO chats_new (conversation_id, created_at)
                        SELECT COALESCE(conversation_id, 'legacy-' || id), created_at
                        FROM chats
                        """
                    )
                )

                conn.execute(
                    text(
                        """
                        CREATE TABLE chat_messages_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            chat_id TEXT NOT NULL,
                            position INTEGER NOT NULL DEFAULT 0,
                            timestamp DATETIME,
                            sender TEXT NOT NULL,
                            text TEXT NOT NULL,
                            data TEXT,
                            FOREIGN KEY(chat_id) REFERENCES chats_new(conversation_id) ON DELETE CASCADE
                        )
                        """
                    )
                )
                conn.execute(
                    text(
                        """
                        INSERT INTO chat_messages_new (
                            id, chat_id, position, timestamp, sender, text, data
                        )
                        SELECT
                            chat_messages.id,
                            COALESCE(chats.conversation_id, 'legacy-' || chats.id),
                            chat_messages.position,
                            chat_messages.timestamp,
                            chat_messages.sender,
                            chat_messages.text,
                            chat_messages.data
                        FROM chat_messages
                        JOIN chats ON chats.id = chat_messages.chat_id
                        """
                    )
                )

                conn.execute(
                    text(
                        """
                        CREATE TABLE corrected_chats_new (
                            conversation_id TEXT PRIMARY KEY,
                            original_conversation_id TEXT NOT NULL,
                            created_at DATETIME,
                            updated_at DATETIME,
                            UNIQUE(original_conversation_id),
                            FOREIGN KEY(original_conversation_id) REFERENCES chats_new(conversation_id) ON DELETE CASCADE
                        )
                        """
                    )
                )
                if _table_exists("corrected_chats"):
                    conn.execute(
                        text(
                            """
                            INSERT INTO corrected_chats_new (
                                conversation_id, original_conversation_id, created_at, updated_at
                            )
                            SELECT
                                COALESCE(chats.conversation_id, 'legacy-' || chats.id),
                                COALESCE(chats.conversation_id, 'legacy-' || chats.id),
                                corrected_chats.created_at,
                                corrected_chats.updated_at
                            FROM corrected_chats
                            JOIN chats ON chats.id = corrected_chats.original_chat_id
                            """
                        )
                    )

                conn.execute(
                    text(
                        """
                        CREATE TABLE corrected_chat_messages_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            corrected_chat_id TEXT NOT NULL,
                            original_message_id INTEGER,
                            position INTEGER NOT NULL DEFAULT 0,
                            timestamp DATETIME,
                            sender TEXT NOT NULL,
                            text TEXT NOT NULL,
                            data TEXT,
                            FOREIGN KEY(corrected_chat_id) REFERENCES corrected_chats_new(conversation_id) ON DELETE CASCADE,
                            FOREIGN KEY(original_message_id) REFERENCES chat_messages_new(id) ON DELETE SET NULL
                        )
                        """
                    )
                )
                if _table_exists("corrected_chat_messages"):
                    conn.execute(
                        text(
                            """
                            INSERT INTO corrected_chat_messages_new (
                                id,
                                corrected_chat_id,
                                original_message_id,
                                position,
                                timestamp,
                                sender,
                                text,
                                data
                            )
                            SELECT
                                corrected_chat_messages.id,
                                COALESCE(chats.conversation_id, 'legacy-' || chats.id),
                                corrected_chat_messages.original_message_id,
                                corrected_chat_messages.position,
                                corrected_chat_messages.timestamp,
                                corrected_chat_messages.sender,
                                corrected_chat_messages.text,
                                corrected_chat_messages.data
                            FROM corrected_chat_messages
                            JOIN corrected_chats
                                ON corrected_chats.id = corrected_chat_messages.corrected_chat_id
                            JOIN chats
                                ON chats.id = corrected_chats.original_chat_id
                            """
                        )
                    )

                conn.execute(text("DROP TABLE IF EXISTS corrected_chat_messages"))
                conn.execute(text("DROP TABLE IF EXISTS corrected_chats"))
                conn.execute(text("DROP TABLE IF EXISTS chat_messages"))
                conn.execute(text("DROP TABLE IF EXISTS chats"))

                conn.execute(text("ALTER TABLE chats_new RENAME TO chats"))
                conn.execute(text("ALTER TABLE chat_messages_new RENAME TO chat_messages"))
                conn.execute(text("ALTER TABLE corrected_chats_new RENAME TO corrected_chats"))
                conn.execute(text("ALTER TABLE corrected_chat_messages_new RENAME TO corrected_chat_messages"))

                conn.execute(text("PRAGMA foreign_keys=ON"))


    # New chat persistence methods
    def upsert_chat(self, chat: Chat) -> str:
        engine = self._get_engine()
        with Session(engine) as session:
            chat_row = ChatRow(
                created_at=chat.created_at,
                conversation_id=chat.conversation_id,
            )
            for index, msg in enumerate(chat.messages):
                msg_row = ChatMessageRow(
                    id=msg.id,
                    chat_id=chat.conversation_id,
                    position=msg.position if msg.position is not None else index,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=_json_dumps(msg.data) if msg.data else None,
                )
                session.merge(msg_row)
            try:
                session.merge(chat_row)
                session.commit()
            except IntegrityError:
                session.rollback()
                existing = session.get(ChatRow, chat.conversation_id)
                if existing is None:
                    raise
                existing.created_at = chat.created_at
                session.commit()
            return chat.conversation_id

    def upsert_chat_message(self, chat_id: str, message: ChatMessage) -> int:
        engine = self._get_engine()
        with Session(engine) as session:
            position = message.position
            if position is None:
                max_position = session.scalar(
                    select(func.max(ChatMessageRow.position)).where(ChatMessageRow.chat_id == chat_id)
                )
                position = (max_position or 0) + 1
            msg_row = ChatMessageRow(
                id=message.id,
                chat_id=chat_id,
                position=position,
                timestamp=message.timestamp,
                sender=message.sender,
                text=message.text,
                data=_json_dumps(message.data) if message.data else None,
            )
            merged = session.merge(msg_row)
            session.commit()
            return merged.id

    def replace_chat_messages(self, chat_id: str, messages: list[ChatMessage]) -> None:
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

    def upsert_corrected_chat(
        self,
        original_conversation_id: str,
        messages: list[CorrectedChatMessage],
    ) -> str:
        engine = self._get_engine()
        with Session(engine) as session:
            stmt = select(CorrectedChatRow).where(
                CorrectedChatRow.original_conversation_id == original_conversation_id
            )
            corrected = session.scalars(stmt).first()
            now = _utcnow()
            if corrected is None:
                corrected = CorrectedChatRow(
                    conversation_id=original_conversation_id,
                    original_conversation_id=original_conversation_id,
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
                    corrected_chat_id=corrected.conversation_id,
                    original_message_id=msg.original_message_id,
                    position=index,
                    timestamp=msg.timestamp,
                    sender=msg.sender,
                    text=msg.text,
                    data=_json_dumps(msg.data) if msg.data else None,
                )
                session.add(msg_row)
            session.commit()
            return corrected.conversation_id

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


















def upsert_chat(hass: HomeAssistant, chat: Chat) -> str:
    return _get_client(hass).upsert_chat(chat)

def upsert_chat_message(hass: HomeAssistant, chat_id: str, message: ChatMessage) -> int:
    return _get_client(hass).upsert_chat_message(chat_id, message)


def replace_chat_messages(hass: HomeAssistant, chat_id: str, messages: list[ChatMessage]) -> None:
    return _get_client(hass).replace_chat_messages(chat_id, messages)


def fetch_recent_chats(hass: HomeAssistant, limit: int) -> list[Chat]:
    return _get_client(hass).fetch_recent_chats(limit)


def fetch_latest_chat_by_conversation_id(hass: HomeAssistant, conversation_id: str) -> Chat | None:
    return _get_client(hass).fetch_latest_chat_by_conversation_id(conversation_id)


def upsert_corrected_chat(
    hass: HomeAssistant, original_conversation_id: str, messages: list[CorrectedChatMessage]
) -> str:
    return _get_client(hass).upsert_corrected_chat(original_conversation_id, messages)


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
            conversation_id=row.corrected.conversation_id,
            original_conversation_id=row.corrected.original_conversation_id,
            created_at=row.corrected.created_at,
            updated_at=row.corrected.updated_at,
            messages=corrected_messages,
        )
    return Chat(
        conversation_id=row.conversation_id,
        created_at=row.created_at,
        messages=messages,
        corrected=corrected,
    )
