DOMAIN = "intentsity"

DB_NAME = "intentsity.db"

DEFAULT_EVENT_LIMIT = 100
MAX_EVENT_LIMIT = 500

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS intent_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT,
    timestamp TEXT,
    event_type TEXT,
    intent_type TEXT,
    raw_event TEXT
);
"""
