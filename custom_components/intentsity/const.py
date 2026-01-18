DOMAIN = "intentsity"

DB_NAME = "intentsity.db"

DEFAULT_EVENT_LIMIT = 100
MAX_EVENT_LIMIT = 500
MIN_EVENT_LIMIT = 1

SIGNAL_EVENT_RECORDED = "intentsity_event_recorded"

WS_CMD_LIST_EVENTS = "intentsity/events/list"
WS_CMD_SUBSCRIBE_EVENTS = "intentsity/events/subscribe"

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
