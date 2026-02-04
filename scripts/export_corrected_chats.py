
# ruff: noqa
# /// script
# dependencies = [
#   "homeassistant==2026.1.3",
#   "pydantic>=2.12.5",
# ]
# ///
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT_PATH = Path(__file__).resolve().parents[1]
if str(ROOT_PATH) not in sys.path:
    sys.path.insert(0, str(ROOT_PATH))


from custom_components.intentsity.export import _normalize_corrected_messages
from custom_components.intentsity.models import CorrectedChatMessage
from custom_components.intentsity.utils import parse_timestamp


def _parse_iso_timestamp(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _default_filename() -> str:
    timestamp = (
        datetime.now(timezone.utc).isoformat().replace(":", "-").replace(".", "-")
    )
    return f"corrected_chats_{timestamp}.training.jsonl"


def _fetch_corrected_runs(
    conn: sqlite3.Connection,
    limit: int | None,
    start: datetime | None,
    end: datetime | None,
) -> list[dict[str, Any]]:
    clauses = [
        "chats.deleted_at IS NULL",
        "corrected_chats.deleted_at IS NULL",
    ]
    params: list[Any] = []
    if start is not None:
        clauses.append("COALESCE(chats.run_timestamp, chats.created_at) >= ?")
        params.append(start.isoformat())
    if end is not None:
        clauses.append("COALESCE(chats.run_timestamp, chats.created_at) <= ?")
        params.append(end.isoformat())
    where_clause = " AND ".join(clauses)
    sql = f"""
        SELECT
            chats.conversation_id,
            chats.pipeline_run_id,
            chats.run_timestamp,
            chats.created_at
        FROM chats
        JOIN corrected_chats
            ON corrected_chats.original_conversation_id = chats.conversation_id
            AND corrected_chats.original_pipeline_run_id = chats.pipeline_run_id
        WHERE {where_clause}
        ORDER BY chats.created_at DESC
    """
    if limit:
        sql += " LIMIT ?"
        params.append(limit)
    cursor = conn.execute(sql, params)
    return [
        {
            "conversation_id": row[0],
            "pipeline_run_id": row[1],
            "run_timestamp": parse_timestamp(row[2]),
            "created_at": parse_timestamp(row[3]),
        }
        for row in cursor.fetchall()
    ]


def _fetch_corrected_messages(
    conn: sqlite3.Connection,
    conversation_id: str,
    pipeline_run_id: str,
) -> list[CorrectedChatMessage]:
    cursor = conn.execute(
        """
        SELECT
            id,
            original_message_id,
            position,
            timestamp,
            sender,
            text,
            data
        FROM corrected_chat_messages
        WHERE corrected_chat_id = ?
          AND corrected_pipeline_run_id = ?
          AND deleted_at IS NULL
        ORDER BY position ASC, timestamp ASC, id ASC
        """,
        (conversation_id, pipeline_run_id),
    )
    messages: list[CorrectedChatMessage] = []
    for row in cursor.fetchall():
        data = json.loads(row[6]) if row[6] else {}
        messages.append(
            CorrectedChatMessage(
                id=row[0],
                original_message_id=row[1],
                position=row[2],
                timestamp=parse_timestamp(row[3]),
                sender=row[4],
                text=row[5],
                data=data,
            )
        )
    return messages


def export_corrected_jsonl(
    db_path: Path,
    output_path: Path,
    limit: int | None,
    start: datetime | None,
    end: datetime | None,
) -> int:
    conn = sqlite3.connect(db_path)
    try:
        runs = _fetch_corrected_runs(conn, limit, start, end)
        grouped: dict[str, list[dict[str, Any]]] = {}
        for run in runs:
            grouped.setdefault(run["conversation_id"], []).append(run)

        lines: list[str] = []
        for conversation_id in sorted(grouped.keys()):
            chat_runs = grouped[conversation_id]
            chat_runs.sort(key=lambda item: (item["run_timestamp"], item["created_at"]))
            combined: list[dict[str, Any]] = []
            for run in chat_runs:
                messages = _fetch_corrected_messages(
                    conn, run["conversation_id"], run["pipeline_run_id"]
                )
                normalized = _normalize_corrected_messages(messages)
                if normalized:
                    combined.extend(normalized)
            if not combined:
                continue
            lines.append(json.dumps({"messages": combined}, ensure_ascii=True))

        output_path.write_text("\n".join(lines), encoding="utf-8")
        return len(lines)
    finally:
        conn.close()


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export corrected chats from intentsity.db as JSONL."
    )
    parser.add_argument(
        "--db",
        type=Path,
        default=Path("intentsity.db"),
        help="Path to intentsity.db",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output JSONL path (defaults to corrected_chats_$datetime.training.jsonl)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Alias for --output",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of corrected runs to include",
    )
    parser.add_argument(
        "--start",
        type=str,
        default=None,
        help="Start timestamp (ISO 8601)",
    )
    parser.add_argument(
        "--end",
        type=str,
        default=None,
        help="End timestamp (ISO 8601)",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    db_path: Path = args.db
    if not db_path.exists():
        raise SystemExit(f"Database not found: {db_path}")
    output_path = args.out or args.output or Path(_default_filename())
    start = _parse_iso_timestamp(args.start)
    end = _parse_iso_timestamp(args.end)
    count = export_corrected_jsonl(
        db_path=db_path,
        output_path=output_path,
        limit=args.limit,
        start=start,
        end=end,
    )
    print(f"Wrote {count} conversations to {output_path}")


if __name__ == "__main__":
    main()
