import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { marked } from "marked";
import DOMPurify from "dompurify";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const LIST_COMMAND = "intentsity/chats/list";
const SUBSCRIBE_COMMAND = "intentsity/chats/subscribe";
const SAVE_CORRECTED_COMMAND = "intentsity/chats/corrected/save";

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
    chat_id?: string;
    timestamp: string;
    sender: string;
    text: string;
    data: Record<string, any>;
}

interface CorrectedChatMessage {
    id?: number;
    corrected_chat_id?: string;
    original_message_id?: number | null;
    position: number;
    timestamp: string;
    sender: string;
    text: string;
    data: Record<string, any>;
}

interface CorrectedChat {
    conversation_id: string;
    pipeline_run_id: string;
    original_conversation_id: string;
    original_pipeline_run_id: string;
    created_at: string;
    updated_at: string;
    messages: CorrectedChatMessage[];
}

interface Chat {
    conversation_id: string;
    pipeline_run_id: string;
    run_timestamp: string;
    created_at: string;
    messages: ChatMessage[];
    corrected?: CorrectedChat | null;
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

const buildChatKey = (conversationId: string, pipelineRunId: string): string =>
    `${conversationId}::${pipelineRunId}`;

const parseChatKey = (chatKey: string): { conversationId: string; pipelineRunId: string; } => {
    const [conversationId, pipelineRunId] = chatKey.split("::");
    return { conversationId, pipelineRunId };
};

const getChatKey = (chat: Chat): string => buildChatKey(chat.conversation_id, chat.pipeline_run_id);

type ConversationGroup = {
    conversation_id: string;
    runs: Chat[];
    latestTimestamp: number;
};

const toEpoch = (value: string | undefined): number => {
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortRunsAscending = (runs: Chat[]): Chat[] => (
    [...runs].sort((a, b) => {
        const diff = toEpoch(a.run_timestamp) - toEpoch(b.run_timestamp);
        if (diff !== 0) {
            return diff;
        }
        return toEpoch(a.created_at) - toEpoch(b.created_at);
    })
);

const getChatTimestamp = (chat: Chat): number => {
    const runTimestamp = toEpoch(chat.run_timestamp);
    if (runTimestamp) {
        return runTimestamp;
    }
    return toEpoch(chat.created_at);
};

const groupChatsByConversation = (chats: Chat[]): ConversationGroup[] => {
    const groups = new Map<string, ConversationGroup>();
    const ordered: ConversationGroup[] = [];
    chats.forEach((chat) => {
        const key = chat.conversation_id;
        let group = groups.get(key);
        if (!group) {
            group = { conversation_id: key, runs: [], latestTimestamp: 0 };
            groups.set(key, group);
            ordered.push(group);
        }
        group.runs.push(chat);
        const chatTimestamp = getChatTimestamp(chat);
        if (chatTimestamp > group.latestTimestamp) {
            group.latestTimestamp = chatTimestamp;
        }
    });
    return ordered.map((group) => ({
        ...group,
        runs: sortRunsAscending(group.runs),
    })).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
};

const formatTimestamp = (value: string): string => new Date(value).toLocaleString();
const toJsonText = (value: Record<string, any> | undefined): string =>
    JSON.stringify(value ?? {}, null, 2);

type DraftMessage = {
    original_message_id?: number | null;
    timestamp: string;
    sender: string;
    text: string;
    dataText: string;
};

@customElement("intentsity-chat-message")
class IntentsityChatMessage extends LitElement {
    @property({ attribute: false }) message!: ChatMessage;

    private get toolResultJson(): string {
        return JSON.stringify(this.message.data?.tool_result ?? {}, null, 2);
    }

    static styles = css`
        :host {
            display: block;
            margin-bottom: 12px;
        }
        .message {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 12px 16px;
            border-radius: 8px;
        }
        .user {
            align-self: flex-end;
            background: var(--primary-color);
            color: var(--text-primary-color);
        }
        .assistant {
            align-self: flex-start;
            background: var(--ha-card-background, var(--card-background-color));
            border: 1px solid var(--divider-color);
            color: var(--primary-text-color);
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
        .meta {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 4px 12px;
            margin-top: 8px;
            font-size: 12px;
            color: var(--secondary-text-color);
        }
        .meta dt {
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .meta dd {
            margin: 0;
            color: var(--primary-text-color);
            word-break: break-word;
        }
        .metadata {
            margin-top: 8px;
            border-radius: 6px;
            padding: 8px;
            background: var(--code-editor-background-color, rgba(0, 0, 0, 0.1));
            color: var(--primary-text-color);
            font-family: var(--code-font-family, monospace);
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .time {
            font-size: 10px;
            opacity: 0.5;
            align-self: flex-end;
        }
    `;

    render() {
        const isUser = this.message.sender === "user";
        const metadata = this.message.data ?? {};
        const role = metadata.role ?? this.message.sender;
        const created = metadata.created ?? this.message.timestamp;
        const agentId = metadata.agent_id;
        const toolCallId = metadata.tool_call_id;
        const toolName = metadata.tool_name;
        const toolResult = metadata.tool_result;
        const content = metadata.content ?? this.message.text;
        const metaRows = [
            ["Role", role],
            ["Created", created],
            ["Agent", agentId],
            ["Tool Call", toolCallId],
            ["Tool Name", toolName],
        ].filter(([, value]) => value !== undefined && value !== null && value !== "");
        return html`
            <ha-card class="message ${isUser ? "user" : "assistant"}">
                <span class="sender">${role}</span>
                ${metaRows.length
                    ? html`
                          <dl class="meta">
                              ${metaRows.map(
                                  ([label, value]) => html`
                                      <dt>${label}</dt>
                                      <dd>${label === "Created" ? formatTimestamp(String(value)) : value}</dd>
                                  `,
                              )}
                          </dl>
                      `
                    : nothing}
                ${!toolResult && content
                    ? html`<intentsity-markdown class="text" .content=${String(content)}></intentsity-markdown>`
                    : nothing}
                ${toolResult ? html`<div class="metadata">${this.toolResultJson}</div>` : nothing}
                ${created ? html`<span class="time">${formatTimestamp(String(created))}</span>` : nothing}
            </ha-card>
        `;
    }
}

@customElement("intentsity-markdown")
class IntentsityMarkdown extends LitElement {
    @property({ type: String }) content = "";

    static styles = css`
        :host {
            display: block;
        }
        :host ::slotted(*) {
            margin: 0;
        }
        .markdown {
            line-height: 1.5;
            word-break: break-word;
        }
        .markdown pre {
            white-space: pre-wrap;
            word-break: break-word;
        }
        .markdown code {
            font-family: var(--code-font-family, monospace);
        }
    `;

    protected updated(): void {
        const htmlContent = marked.parse(this.content ?? "", {
            breaks: true,
            async: false,
        }) as string;
        const sanitized = DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } });
        const container = this.renderRoot.querySelector(".markdown");
        if (container) {
            container.innerHTML = sanitized;
        }
    }

    render() {
        return html`<div class="markdown"></div>`;
    }
}

@customElement("intentsity-chat-list")
class IntentsityChatList extends LitElement {
    @property({ attribute: false }) chats: Chat[] = [];
    @property({ attribute: false })
    onSaveCorrected?: (
        conversationId: string,
        pipelineRunId: string,
        messages: CorrectedChatMessage[],
    ) => Promise<void>;
    @state() private drafts: Record<string, DraftMessage[]> = {};
    @state() private errors: Record<string, string | undefined> = {};
    @state() private saving: Record<string, boolean> = {};
    @state() private expanded: Record<string, boolean> = {};
    @state() private conversationExpanded: Record<string, boolean> = {};
    @state() private correctedOverrides: Record<string, string> = {};
    @state() private clipboard: DraftMessage | null = null;
    @state() private toastMessage: string | null = null;
    @state() private toastKind: "success" | "error" = "success";
    @state() private dialogOpen = false;
    @state() private dialogchatId: string | null = null;
    @state() private dialogIndex: number | null = null;
    @state() private dialogField: "text" | "data" | null = null;
    @state() private dialogValue = "";

    static styles = [
        css`
            :host {
                display: block;
            }
            ha-card {
                margin-bottom: 16px;
            }
            .pipeline-run-card {
                margin-left: 0;
                margin-right: 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            }
            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--divider-color);
                flex-wrap: wrap;
            }
            .header-row {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                flex: 1;
                min-width: 220px;
            }
            .messages-list {
                display: flex;
                flex-direction: column;
            }
            .empty-state {
                padding: 32px;
                text-align: center;
                color: var(--secondary-text-color);
                border-radius: 8px;
                border: 1px dashed var(--divider-color);
            }
            .comparison {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
            }
            .panel {
                padding: 12px;
                border-radius: 8px;
                border: 1px solid var(--divider-color);
            }
            .panel h4 {
                margin: 0 0 12px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: var(--secondary-text-color);
            }
            .draft-message {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid var(--divider-color);
                margin-bottom: 12px;
            }
            .draft-controls {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .chip-row {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                align-items: center;
            }
            .preview {
                color: var(--secondary-text-color);
                font-size: 12px;
                line-height: 1.4;
            }
            ha-assist-chip {
                --mdc-chip-container-color: var(--state-icon-color, var(--primary-color));
                --mdc-chip-label-text-color: var(--text-primary-color, #fff);
                --mdc-chip-height: 24px;
            }
            ha-button {
                --mdc-theme-primary: var(--primary-color);
            }
            textarea,
            input[type="text"] {
                background: var(--card-background-color);
                border: 1px solid var(--divider-color);
                color: var(--primary-text-color);
                border-radius: 4px;
                padding: 8px 10px;
                font-family: var(--primary-font-family);
                font-size: 13px;
            }
            textarea {
                min-height: 80px;
                resize: vertical;
            }
            .error {
                color: var(--error-color);
                font-size: 12px;
                margin-top: 8px;
            }
            .save-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-top: 12px;
            }
            .field-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .field-row ha-textfield {
                flex: 1;
            }
            .dialog-body ha-textfield,
            .dialog-body textarea {
                width: 100%;
            }
            .dialog-body .dialog-textarea {
                min-height: 60vh;
                max-height: 60vh;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-family: var(--code-font-family, monospace);
                font-size: 13px;
                resize: vertical;
            }
            ha-dialog {
                --mdc-dialog-min-width: 70vw;
                --mdc-dialog-max-width: 70vw;
                --mdc-dialog-min-height: 70vh;
                --mdc-dialog-max-height: 70vh;
            }
            .dialog-body {
                min-height: 60vh;
            }
            .corrected-card {
                border-left: 4px solid var(--success-color, #2e7d32);
            }
            .conversation-group {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 16px;
            }
            .conversation-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 12px;
                padding: 0 0 16px;
                border-bottom: 1px solid var(--divider-color);
            }
            .conversation-header h3 {
                margin: 0;
                font-size: 20px;
            }
            .conversation-meta {
                font-size: 12px;
                color: var(--secondary-text-color);
            }
            .toast {
                position: fixed;
                right: 24px;
                bottom: 24px;
                padding: 12px 16px;
                border-radius: 8px;
                color: #fff;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
                z-index: 20;
                max-width: 320px;
            }
            .toast.success {
                background: var(--success-color, #2e7d32);
            }
            .toast.error {
                background: var(--error-color, #c62828);
            }
        `
    ];

    protected willUpdate(changed: Map<string, unknown>): void {
        if (!changed.has("chats")) {
            return;
        }
        const updatedDrafts: Record<string, DraftMessage[]> = { ...this.drafts };
        const updatedExpanded: Record<string, boolean> = { ...this.expanded };
        const updatedConversationExpanded: Record<string, boolean> = {
            ...this.conversationExpanded,
        };
        const chatIds = new Set<string>();
        this.chats.forEach((chat, index) => {
            const chatKey = getChatKey(chat);
            chatIds.add(chatKey);
            if (updatedDrafts[chatKey]) {
                return;
            }
            const seedMessages = chat.corrected?.messages?.length
                ? chat.corrected.messages
                : chat.messages.map((msg, index) => ({
                      id: undefined,
                      corrected_chat_id: undefined,
                      original_message_id: msg.id,
                      position: index,
                      timestamp: msg.timestamp,
                      sender: msg.sender,
                      text: msg.text,
                      data: msg.data ?? {},
                  }));

            updatedDrafts[chatKey] = seedMessages.map((msg) => ({
                original_message_id: msg.original_message_id ?? null,
                timestamp: msg.timestamp,
                sender: msg.sender,
                text: msg.text,
                dataText: toJsonText(msg.data),
            }));

            if (updatedExpanded[chatKey] === undefined) {
                updatedExpanded[chatKey] = index === 0;
            }
        });

        const conversationIds = new Set<string>();
        groupChatsByConversation(this.chats).forEach((group, index) => {
            conversationIds.add(group.conversation_id);
            if (updatedConversationExpanded[group.conversation_id] === undefined) {
                updatedConversationExpanded[group.conversation_id] = index === 0;
            }
        });

        Object.keys(updatedDrafts).forEach((key) => {
            if (!chatIds.has(key)) {
                delete updatedDrafts[key];
            }
        });
        Object.keys(updatedExpanded).forEach((key) => {
            if (!chatIds.has(key)) {
                delete updatedExpanded[key];
            }
        });
        Object.keys(updatedConversationExpanded).forEach((key) => {
            if (!conversationIds.has(key)) {
                delete updatedConversationExpanded[key];
            }
        });
        this.drafts = updatedDrafts;
        this.expanded = updatedExpanded;
        this.conversationExpanded = updatedConversationExpanded;
    }

    private getCorrectedAt(chat: Chat): string | undefined {
        return this.correctedOverrides[getChatKey(chat)] ?? chat.corrected?.updated_at;
    }

    private showToast(message: string, kind: "success" | "error") {
        this.toastMessage = message;
        this.toastKind = kind;
        window.clearTimeout((this as any)._toastTimer);
        (this as any)._toastTimer = window.setTimeout(() => {
            this.toastMessage = null;
        }, 3000);
    }

    private focusChat(chatId: string) {
        const card = this.renderRoot.querySelector(`ha-card[data-chat-id="${chatId}"]`) as HTMLElement | null;
        if (!card) {
            return;
        }
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        const button = card.querySelector("ha-button");
        if (button) {
            (button as HTMLElement).focus();
        }
    }

    private markCorrectedAndAdvance(chatId: string) {
        const correctedAt = new Date().toISOString();
        this.correctedOverrides = { ...this.correctedOverrides, [chatId]: correctedAt };
        const nextChat = this.chats.find((chat) => {
            if (getChatKey(chat) === chatId) {
                return false;
            }
            return !this.getCorrectedAt(chat);
        });
        const nextId = nextChat ? getChatKey(nextChat) : undefined;
        this.expanded = {
            ...this.expanded,
            [chatId]: false,
            ...(nextId ? { [nextId]: true } : {}),
        };
        if (nextId) {
            requestAnimationFrame(() => this.focusChat(nextId));
        }
    }

    private updateDraft(chatId: string, index: number, update: Partial<DraftMessage>): void {
        const existing = this.drafts[chatId];
        if (!existing) {
            return;
        }
        const next = [...existing];
        next[index] = { ...next[index], ...update };
        this.drafts = { ...this.drafts, [chatId]: next };
    }

    private moveDraft(chatId: string, index: number, direction: -1 | 1): void {
        const existing = this.drafts[chatId];
        if (!existing) {
            return;
        }
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= existing.length) {
            return;
        }
        const next = [...existing];
        const [item] = next.splice(index, 1);
        next.splice(nextIndex, 0, item);
        this.drafts = { ...this.drafts, [chatId]: next };
    }

    private addDraft(chatId: string): void {
        this.insertDraft(chatId, (this.drafts[chatId] ?? []).length);
    }

    private buildEmptyDraft(): DraftMessage {
        return {
            original_message_id: null,
            timestamp: new Date().toISOString(),
            sender: "assistant",
            text: "",
            dataText: "{}",
        };
    }

    private insertDraft(chatId: string, index: number): void {
        const existing = this.drafts[chatId] ?? [];
        const clamped = Math.max(0, Math.min(index, existing.length));
        const next = [...existing];
        next.splice(clamped, 0, this.buildEmptyDraft());
        this.drafts = { ...this.drafts, [chatId]: next };
    }

    private copyDraft(chatId: string, index: number): void {
        const draft = this.drafts[chatId]?.[index];
        if (!draft) {
            return;
        }
        const copied: DraftMessage = {
            original_message_id: null,
            timestamp: new Date().toISOString(),
            sender: draft.sender,
            text: draft.text,
            dataText: draft.dataText,
        };
        this.clipboard = copied;
        this.showToast("Message copied.", "success");
    }

    private insertClipboard(chatId: string, index: number): void {
        if (!this.clipboard) {
            return;
        }
        const existing = this.drafts[chatId] ?? [];
        const clamped = Math.max(0, Math.min(index, existing.length));
        const next = [...existing];
        next.splice(clamped, 0, { ...this.clipboard, timestamp: new Date().toISOString() });
        this.drafts = { ...this.drafts, [chatId]: next };
    }

    private removeDraft(chatId: string, index: number): void {
        const existing = this.drafts[chatId];
        if (!existing) {
            return;
        }
        const next = existing.filter((_, idx) => idx !== index);
        this.drafts = { ...this.drafts, [chatId]: next };
    }

    private async handleSave(chatId: string): Promise<void> {
        const draft = this.drafts[chatId] ?? [];
        const parsed: CorrectedChatMessage[] = [];
        for (let index = 0; index < draft.length; index += 1) {
            const message = draft[index];
            try {
                const data = JSON.parse(message.dataText || "{}");
                parsed.push({
                    original_message_id: message.original_message_id ?? null,
                    position: index,
                    timestamp: message.timestamp,
                    sender: message.sender,
                    text: message.text,
                    data,
                });
            } catch (error) {
                this.errors = {
                    ...this.errors,
                    [chatId]: `Invalid JSON in message ${index + 1}.`,
                };
                return;
            }
        }
        this.errors = { ...this.errors, [chatId]: undefined };
        if (!this.onSaveCorrected) {
            return;
        }
        this.saving = { ...this.saving, [chatId]: true };
        const { conversationId, pipelineRunId } = parseChatKey(chatId);
        try {
            await this.onSaveCorrected(conversationId, pipelineRunId, parsed);
            this.showToast("Corrected conversation saved.", "success");
            this.markCorrectedAndAdvance(chatId);
        } catch (error) {
            this.errors = { ...this.errors, [chatId]: "Failed to save corrected conversation." };
            this.showToast("Failed to save corrected conversation.", "error");
        } finally {
            this.saving = { ...this.saving, [chatId]: false };
        }
    }

    private toggleExpanded(chatId: string): void {
        this.expanded = { ...this.expanded, [chatId]: !this.expanded[chatId] };
    }

    private getFirstUserSnippet(messages: ChatMessage[]): string {
        const message = messages.find((msg) => msg.sender === "user");
        if (!message) {
            const messageCount = messages.length;
            return `${messageCount} message${messageCount === 1 ? "" : "s"}`;
        }
        const text = message.text ?? "";
        if (text.length <= 100) {
            return text;
        }
        return `${text.slice(0, 100)}…`;
    }

    private openDialog(chatId: string, index: number, field: "text" | "data"): void {
        const draft = this.drafts[chatId]?.[index];
        if (!draft) {
            return;
        }
        const value = field === "data"
            ? this.prettyJson(draft.dataText || "{}")
            : draft.text ?? "";
        this.dialogchatId = chatId;
        this.dialogIndex = index;
        this.dialogField = field;
        this.dialogValue = value;
        this.dialogOpen = true;
    }

    private closeDialog(): void {
        this.dialogOpen = false;
        this.dialogchatId = null;
        this.dialogIndex = null;
        this.dialogField = null;
        this.dialogValue = "";
    }

    private prettyJson(raw: string): string {
        try {
            const parsed = JSON.parse(raw);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            return raw;
        }
    }

    private saveDialog(): void {
        if (
            this.dialogchatId === null ||
            this.dialogIndex === null ||
            this.dialogField === null
        ) {
            this.closeDialog();
            return;
        }
        const value = this.dialogField === "data"
            ? this.prettyJson(this.dialogValue)
            : this.dialogValue;
        if (this.dialogField === "data") {
            this.updateDraft(this.dialogchatId, this.dialogIndex, { dataText: value });
        } else {
            this.updateDraft(this.dialogchatId, this.dialogIndex, { text: value });
        }
        this.closeDialog();
    }

    private toggleConversation(conversationId: string): void {
        this.conversationExpanded = {
            ...this.conversationExpanded,
            [conversationId]: !this.conversationExpanded[conversationId],
        };
    }

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
                ${groupChatsByConversation(this.chats).map((group) => html`
                    <ha-card>
                        <section class="conversation-group">
                            <div class="conversation-header">
                                <div class="header-row">
                                    <ha-button
                                        @click=${() => this.toggleConversation(group.conversation_id)}
                                        aria-labelledby=${`conversation-heading-${group.conversation_id}`}
                                    >
                                        <ha-icon
                                            icon=${this.conversationExpanded[group.conversation_id] ? "mdi:chevron-up" : "mdi:chevron-down"}
                                        ></ha-icon>
                                        ${this.conversationExpanded[group.conversation_id] ? "Collapse" : "Expand"}
                                    </ha-button>
                                    <h3 id=${`conversation-heading-${group.conversation_id}`}>Conversation ${group.conversation_id}</h3>
                                </div>
                                <span class="conversation-meta">
                                    ${group.runs.length} run${group.runs.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            ${this.conversationExpanded[group.conversation_id] ? group.runs.map((chat) => {
                            const chatId = getChatKey(chat);
                            const isExpanded = this.expanded[chatId] ?? false;
                            const orderedMessages = [...chat.messages].sort((a, b) => {
                                const diff = toEpoch(a.timestamp) - toEpoch(b.timestamp);
                                if (diff !== 0) {
                                    return diff;
                                }
                                return (a.id ?? 0) - (b.id ?? 0);
                            });
                            const messageCount = orderedMessages.length;
                            const messageCountLabel = `${messageCount} message${messageCount === 1 ? "" : "s"}`;
                            const preview = this.getFirstUserSnippet(orderedMessages);
                            const correctedAt = this.getCorrectedAt(chat);
                            const isCorrected = Boolean(correctedAt);
                            return html`
                                <ha-card class="pipeline-run-card ${isCorrected ? "corrected-card" : ""}" data-chat-id=${chatId}>
                                    <div class="card-content">
                                        <div class="chat-header">
                                            <div class="header-row">
                                                <ha-button @click=${() => this.toggleExpanded(chatId)}>
                                                    <ha-icon icon=${isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
                                                    ${isExpanded ? "Collapse" : "Expand"}
                                                </ha-button>
                                                <ha-chip-set class="chip-row">
                                                    <ha-assist-chip
                                                        label="Run ${chat.pipeline_run_id}"
                                                        hasIcon
                                                    >
                                                        <ha-icon slot="icon" icon="mdi:timeline"></ha-icon>
                                                    </ha-assist-chip>
                                                    <ha-assist-chip
                                                        label="Started ${formatTimestamp(chat.run_timestamp)} · ${messageCountLabel}"
                                                        hasIcon
                                                    >
                                                        <ha-icon slot="icon" icon="mdi:clock-start"></ha-icon>
                                                    </ha-assist-chip>
                                                    ${isCorrected
                                                        ? html`
                                                              <ha-assist-chip label="Corrected ${formatTimestamp(correctedAt!)}" hasIcon>
                                                                  <ha-icon slot="icon" icon="mdi:check-circle"></ha-icon>
                                                              </ha-assist-chip>
                                                          `
                                                        : nothing}
                                                </ha-chip-set>
                                                ${!isExpanded ? html`<div class="preview">${preview}</div>` : nothing}
                                            </div>
                                            <span class="time">${formatTimestamp(chat.created_at)}</span>
                                        </div>
                                        ${isExpanded
                                            ? html`
                                              <div class="comparison">
                                                  <section class="panel">
                                                      <h4>Original</h4>
                                                      <div class="messages-list">
                                                          ${orderedMessages.map((msg) => html`
                                                              <intentsity-chat-message .message=${msg}></intentsity-chat-message>
                                                          `)}
                                                      </div>
                                                  </section>
                                                  <section class="panel">
                                                      <h4>Corrected</h4>
                                                      ${(this.drafts[chatId] ?? []).map((draft, index) => html`
                                                          <div class="draft-message">
                                                              <div class="draft-controls">
                                                                  <ha-button @click=${() => this.insertDraft(chatId, index)}>
                                                                      <ha-icon icon="mdi:plus-box"></ha-icon>
                                                                      Insert above
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.insertClipboard(chatId, index)} ?disabled=${!this.clipboard}>
                                                                      <ha-icon icon="mdi:content-paste"></ha-icon>
                                                                      Paste above
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.moveDraft(chatId, index, -1)}>
                                                                      <ha-icon icon="mdi:arrow-up"></ha-icon>
                                                                      Up
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.moveDraft(chatId, index, 1)}>
                                                                      <ha-icon icon="mdi:arrow-down"></ha-icon>
                                                                      Down
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.insertDraft(chatId, index + 1)}>
                                                                      <ha-icon icon="mdi:plus-box-multiple"></ha-icon>
                                                                      Insert below
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.insertClipboard(chatId, index + 1)} ?disabled=${!this.clipboard}>
                                                                      <ha-icon icon="mdi:content-paste"></ha-icon>
                                                                      Paste below
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.copyDraft(chatId, index)}>
                                                                      <ha-icon icon="mdi:content-copy"></ha-icon>
                                                                      Copy
                                                                  </ha-button>
                                                                  <ha-button @click=${() => this.removeDraft(chatId, index)}>
                                                                      <ha-icon icon="mdi:delete"></ha-icon>
                                                                      Remove
                                                                  </ha-button>
                                                                  ${draft.original_message_id
                                                                      ? html`
                                                                            <ha-chip-set class="chip-row">
                                                                                <ha-assist-chip label="Original #${draft.original_message_id}" hasIcon>
                                                                                    <ha-icon slot="icon" icon="mdi:message-text"></ha-icon>
                                                                                </ha-assist-chip>
                                                                            </ha-chip-set>
                                                                        `
                                                                      : html`
                                                                            <ha-chip-set class="chip-row">
                                                                                <ha-assist-chip label="New message" hasIcon>
                                                                                    <ha-icon slot="icon" icon="mdi:plus"></ha-icon>
                                                                                </ha-assist-chip>
                                                                            </ha-chip-set>
                                                                        `}
                                                              </div>
                                                              <ha-textfield
                                                                  label="Sender"
                                                                  .value=${draft.sender}
                                                                  @input=${(event: Event) =>
                                                                      this.updateDraft(
                                                                          chatId,
                                                                          index,
                                                                          { sender: (event.target as HTMLInputElement).value },
                                                                      )}
                                                              ></ha-textfield>
                                                              <div class="field-row">
                                                                  <ha-textfield
                                                                      label="Message"
                                                                      .value=${draft.text}
                                                                      @input=${(event: Event) =>
                                                                          this.updateDraft(
                                                                              chatId,
                                                                              index,
                                                                              { text: (event.target as HTMLInputElement).value },
                                                                          )}
                                                                      multiline
                                                                  ></ha-textfield>
                                                                  <ha-button @click=${() => this.openDialog(chatId, index, "text")}>
                                                                      <ha-icon icon="mdi:pencil"></ha-icon>
                                                                  </ha-button>
                                                              </div>
                                                              <div class="field-row">
                                                                  <ha-textfield
                                                                      label="Metadata (JSON)"
                                                                      .value=${draft.dataText}
                                                                      @input=${(event: Event) =>
                                                                          this.updateDraft(
                                                                              chatId,
                                                                              index,
                                                                              { dataText: (event.target as HTMLInputElement).value },
                                                                          )}
                                                                      multiline
                                                                  ></ha-textfield>
                                                                  <ha-button @click=${() => this.openDialog(chatId, index, "data")}>
                                                                      <ha-icon icon="mdi:pencil"></ha-icon>
                                                                  </ha-button>
                                                              </div>
                                                          </div>
                                                      `)}
                                                      <div class="save-row">
                                                          <div class="draft-controls">
                                                              <ha-button @click=${() => this.addDraft(chatId)}>
                                                                  <ha-icon icon="mdi:plus-circle"></ha-icon>
                                                                  Add message
                                                              </ha-button>
                                                              <ha-button @click=${() => this.insertClipboard(chatId, (this.drafts[chatId] ?? []).length)} ?disabled=${!this.clipboard}>
                                                                  <ha-icon icon="mdi:content-paste"></ha-icon>
                                                                  Paste at end
                                                              </ha-button>
                                                          </div>
                                                          <ha-button
                                                              @click=${() => void this.handleSave(chatId)}
                                                              ?disabled=${this.saving[chatId]}
                                                          >
                                                              <ha-icon icon="mdi:content-save"></ha-icon>
                                                              ${this.saving[chatId] ? "Saving..." : "Save corrections"}
                                                          </ha-button>
                                                      </div>
                                                      ${this.errors[chatId] ? html`<div class="error">${this.errors[chatId]}</div>` : nothing}
                                                  </section>
                                              </div>
                                          `
                                            : nothing}
                                    </div>
                                </ha-card>
                            `;
                        }) : nothing}
                        </section>
                    </ha-card>
                `)}
            </div>
            ${this.toastMessage
                ? html`
                      <div class="toast ${this.toastKind}">
                          ${this.toastMessage}
                      </div>
                  `
                : nothing}
            <ha-dialog
                .open=${this.dialogOpen}
                @closed=${this.closeDialog}
                heading=${this.dialogField === "data" ? "Edit metadata (JSON)" : "Edit message"}
            >
                <div class="dialog-body">
                    <textarea
                        class="dialog-textarea"
                        rows="12"
                        .value=${this.dialogValue}
                        @input=${(event: Event) => {
                            this.dialogValue = (event.target as HTMLTextAreaElement).value;
                        }}
                    ></textarea>
                </div>
                <ha-button slot="primaryAction" @click=${this.saveDialog}>Save</ha-button>
                <ha-button slot="secondaryAction" @click=${this.closeDialog}>Cancel</ha-button>
            </ha-dialog>
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
        css`
            :host {
                display: block;
                padding: 16px;
                color: var(--primary-text-color);
                background: var(--lovelace-background, var(--primary-background-color));
            }

            h1 {
                margin: 0 0 8px;
                font-size: 24px;
            }

            .controls {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
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

    private async saveCorrected(
        conversationId: string,
        pipelineRunId: string,
        messages: CorrectedChatMessage[],
    ): Promise<void> {
        const conn = await this.getConnection();
        await conn.sendMessagePromise({
            type: SAVE_CORRECTED_COMMAND,
            conversation_id: conversationId,
            pipeline_run_id: pipelineRunId,
            messages,
        });
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
            <ha-card>
                <div class="card-content">
                    <h1>Assist Chat Log</h1>
                    <p>Observational log of all Home Assistant Assist conversations.</p>

                    <div class="controls">
                        <ha-textfield
                            label="Show last"
                            type="number"
                            .value=${String(this.limit)}
                            @change=${this.handleLimitChange}
                        ></ha-textfield>
                        <ha-button @click=${() => void this.loadChats()}>
                            <ha-icon icon="mdi:refresh"></ha-icon>
                            Refresh
                        </ha-button>
                    </div>
                </div>
            </ha-card>

            <intentsity-chat-list
                .chats=${this.chats}
                .onSaveCorrected=${this.saveCorrected.bind(this)}
            ></intentsity-chat-list>
        `;
    }
}
