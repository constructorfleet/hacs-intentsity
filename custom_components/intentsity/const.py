DOMAIN = "intentsity"

DB_NAME = "intentsity.db"
DB_SCHEMA_VERSION = 5

COORDINATOR_KEY = "coordinator"

DEFAULT_EVENT_LIMIT = 100
MAX_EVENT_LIMIT = 500
MIN_EVENT_LIMIT = 1

SIGNAL_EVENT_RECORDED = "intentsity_event_recorded"
DATA_UNSUBSCRIBE = "intentsity_unsubscribe"
DATA_DB_INITIALIZED = "db_initialized"
DATA_API_REGISTERED = "api_registered"

WS_CMD_LIST_CHATS = "intentsity/chats/list"
WS_CMD_SUBSCRIBE_CHATS = "intentsity/chats/subscribe"
WS_CMD_SAVE_CORRECTED_CHAT = "intentsity/chats/corrected/save"
