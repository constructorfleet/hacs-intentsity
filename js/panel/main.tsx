import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const LIST_COMMAND = "intentsity/chats/list";
const SUBSCRIBE_COMMAND = "intentsity/chats/subscribe";

type HassSubscription = () => void;
type HassMessageRequest = Record<string, unknown>;

interface HassConnection {
    sendMessagePromise<T>(message: HassMessageRequest): Promise<T>;
    subscribeMessage(
        handler: (message: SubscriptionMessage) => void,
        message: HassMessageRequest,
    ): Promise<HassSubscription>;
}

interface ChatMessage {
    id?: number;
    chat_id?: number;
    timestamp: string;
    sender: string;
    text: string;
    data: Record<string, any>;
}

interface Chat {
    id?: number;
    created_at: string;
    conversation_id?: string;
    messages: ChatMessage[];
}

interface SubscriptionMessage {
    event?: { chats?: Chat[]; };
    chats?: Chat[];
}

declare global {
    interface Window {
        hassConnection?: Promise<{ conn: HassConnection; }>;
    }
}

const clampLimit = (raw: number | string): number => {
    const parsed = Number(raw);
    const value = Number.isFinite(parsed) ? parsed : DEFAULT_LIMIT;
    return Math.max(1, Math.min(MAX_LIMIT, value || DEFAULT_LIMIT));
};

const formatTimestamp = (value: string): string => new Date(value).toLocaleString();

const buttonStyles = css`
    button {
        padding: 8px 18px;
        border-radius: 999px;
        border: none;
        background: var(--accent);
        color: #041727;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    button:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(125, 212, 255, 0.35);
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const pillStyles = css`
    .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        background: rgba(125, 212, 255, 0.15);
        color: var(--accent);
        font-size: 12px;
        letter-spacing: 0.03em;
    }
`;

@customElement("intentsity-chat-message")
class IntentsityChatMessage extends LitElement {
    @property({ attribute: false }) message!: ChatMessage;

    static styles = css`
        :host {
            display: block;
            margin-bottom: 12px;
        }
        .message {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 12px;
            border-radius: 12px;
            max-width: 80%;
        }
        .user {
            align-self: flex-end;
            background: var(--accent);
            color: #041727;
        }
        .assistant {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text);
        }
        .sender {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
            opacity: 0.7;
        }
        .text {
            font-size: 14px;
            line-height: 1.4;
        }
        .time {
            font-size: 10px;
            opacity: 0.5;
            align-self: flex-end;
        }
    `;

    render() {
        const isUser = this.message.sender === "user";
        return html`
            <div class="message ${isUser ? "user" : "assistant"}">
                <span class="sender">${this.message.sender}</span>
                <div class="text">${this.message.text}</div>
                <span class="time">${formatTimestamp(this.message.timestamp)}</span>
            </div>
        `;
    }
}

@customElement("intentsity-chat-list")
class IntentsityChatList extends LitElement {
    @property({ attribute: false }) chats: Chat[] = [];

    static styles = [
        pillStyles,
        css`
            :host {
                display: block;
            }
            .chat-card {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 18px;
                padding: 18px;
                margin-bottom: 24px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .messages-list {
                display: flex;
                flex-direction: column;
            }
            .empty-state {
                padding: 48px;
                text-align: center;
                color: var(--muted);
                background: rgba(255, 255, 255, 0.02);
                border-radius: 18px;
                border: 1px dashed rgba(255, 255, 255, 0.1);
            }
        `
    ];

    render() {
        if (!this.chats.length) {
            return html`
                <div class="empty-state">
                    <h3>No conversations recorded yet.</h3>
                    <p>When you talk to Home Assistant, logs will appear here.</p>
                </div>
            `;
        }
        return html`
            <div class="chat-grid">
                ${this.chats.map(chat => html`
                    <article class="chat-card">
                        <div class="chat-header">
                            <span class="pill">ID: ${chat.id}</span>
                            <span class="time">${formatTimestamp(chat.created_at)}</span>
                            ${chat.conversation_id ? html`<span class="pill">${chat.conversation_id}</span>` : nothing}
                        </div>
                        <div class="messages-list">
                            ${chat.messages.map(msg => html`
                                <intentsity-chat-message .message=${msg}></intentsity-chat-message>
                            `)}
                        </div>
                    </article>
                `)}
            </div>
        `;
    }
}

@customElement("intentsity-panel")
class IntentsityPanel extends LitElement {
    @state() private chats: Chat[] = [];
    @state() private limit = DEFAULT_LIMIT;

    private unsubscribe?: HassSubscription;
    private connectionPromise?: Promise<HassConnection>;

    static styles = [
        buttonStyles,
        css`
            :host {
                --bg-gradient: radial-gradient(circle at top, #111430, #05060f 55%);
                --card-bg: rgba(9, 12, 25, 0.92);
                --card-border: rgba(125, 212, 255, 0.25);
                --accent: #7dd4ff;
                --text: #f4fbff;
                --muted: #9fb1cc;
                display: block;
                font-family: "Space Grotesk", "Segoe UI", sans-serif;
                margin: 0;
                padding: 32px;
                min-height: 100vh;
                color: var(--text);
                background: var(--bg-gradient);
            }

            h1 {
                margin: 0 0 8px;
                font-size: 30px;
            }

            .controls {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 32px;
            }

            input[type="number"] {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--card-border);
                color: var(--text);
                padding: 6px 10px;
                border-radius: 8px;
                width: 80px;
            }

            label {
                font-weight: 600;
                color: var(--muted);
            }
        `
    ];

    private readonly subscriptionHandler = (message: SubscriptionMessage): void => {
        this.chats = message.event?.chats ?? message.chats ?? [];
    };

    private async getConnection(): Promise<HassConnection> {
        if (!this.connectionPromise) {
            this.connectionPromise = (async () => {
                if (!window.hassConnection) {
                    throw new Error("Home Assistant connection unavailable");
                }
                const { conn } = await window.hassConnection;
                return conn;
            })().catch((error) => {
                this.connectionPromise = undefined;
                throw error;
            });
        }
        return this.connectionPromise;
    }

    private readonly teardownSubscription = (): void => {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    };

    private async loadChats(): Promise<void> {
        const conn = await this.getConnection();
        this.teardownSubscription();
        
        // Initial snapshot
        const response = await conn.sendMessagePromise<{ chats?: Chat[]; }>(({
            type: LIST_COMMAND,
            limit: this.limit,
        } as any));
        this.chats = response.chats ?? [];

        // Live subscription
        this.unsubscribe = await conn.subscribeMessage(this.subscriptionHandler, (({ 
            type: SUBSCRIBE_COMMAND,
            limit: this.limit,
        } as any) as any));
    }

    protected firstUpdated(): void {
        void this.loadChats();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.teardownSubscription();
    }

    private handleLimitChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        this.limit = clampLimit(input.value);
        void this.loadChats();
    }

    render() {
        return html`
            <h1>Assist Chat Log</h1>
            <p>Observational log of all Home Assistant Assist conversations.</p>

            <div class="controls">
                <label for="limit">Show last:</label>
                <input
                    id="limit"
                    type="number"
                    .value=${String(this.limit)}
                    @change=${this.handleLimitChange}
                />
                <button @click=${() => void this.loadChats()}>Refresh</button>
            </div>

            <intentsity-chat-list .chats=${this.chats}></intentsity-chat-list>
        `;
    }
}
