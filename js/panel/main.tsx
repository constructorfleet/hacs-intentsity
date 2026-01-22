import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const LIST_COMMAND = "intentsity/events/list";
const SUBSCRIBE_COMMAND = "intentsity/events/subscribe";
const SAVE_COMMAND = "intentsity/events/save_review";

type HassSubscription = () => void;
type HassMessageRequest = Record<string, unknown>;

interface HassConnection {
    sendMessagePromise<T>(message: HassMessageRequest): Promise<T>;
    subscribeMessage(
        handler: (message: SubscriptionMessage) => void,
        message: HassMessageRequest,
    ): Promise<HassSubscription>;
}

interface SubscriptionMessage {
    event?: { runs?: IntentRun[]; };
    runs?: IntentRun[];
}

interface IntentStart {
    id: number;
    intent_input?: string;
    device_id?: string;
}

interface IntentProgress {
    timestamp: string;
    chat_log_delta?: Record<string, unknown> | null;
    tts_start_streaming?: boolean | null;
}

interface IntentEnd {
    timestamp: string;
    processed_locally?: boolean | null;
    intent_output?: Record<string, unknown> | null;
}

interface ReviewProgress {
    chat_log_delta?: Record<string, unknown> | null;
    tts_start_streaming?: boolean | null;
}

interface ReviewEnd {
    processed_locally?: boolean | null;
    intent_output?: Record<string, unknown> | null;
}

interface IntentReview {
    intent_start_id?: number | null;
    matched_expectations?: boolean | null;
    expected_progress?: ReviewProgress[] | null;
    expected_end?: ReviewEnd | null;
}

interface IntentRun {
    run_id: string;
    name?: string;
    created_at: string;
    conversation_engine?: string;
    language?: string;
    review?: IntentReview | null;
    intent_starts?: IntentStart[];
    intent_progress?: IntentProgress[];
    intent_ends?: IntentEnd[];
}

interface EditorStep {
    kind: "progress" | "end";
    chatText?: string;
    intentText?: string;
    tts_start_streaming?: boolean | null;
    processed_locally?: boolean | null;
}

type SaveReviewPayload = Array<
    | {
        order_index: number;
        kind: "progress";
        chat_log_delta: Record<string, unknown> | null;
        tts_start_streaming: boolean | null | undefined;
    }
    | {
        order_index: number;
        kind: "end";
        processed_locally: boolean | null | undefined;
        intent_output: Record<string, unknown> | null;
    }
>;

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

const formatJson = (value: Record<string, unknown> | null | undefined): string => {
    if (!value || (typeof value === "object" && !Object.keys(value).length)) {
        return "{\n  \n}";
    }
    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        console.error("Failed to stringify value", error);
        return "{\n  \"raw\": \"unserializable\"\n}";
    }
};

const formatTimestamp = (value: string): string => new Date(value).toLocaleString();

const deriveStepsFromReview = (review: IntentReview | null | undefined): EditorStep[] | null => {
    if (!review?.expected_end) {
        return null;
    }
    const steps: EditorStep[] = [];
    (review.expected_progress ?? []).forEach((item) => {
        steps.push({
            kind: "progress",
            chatText: formatJson(item.chat_log_delta ?? null),
            tts_start_streaming:
                typeof item.tts_start_streaming === "boolean" ? item.tts_start_streaming : null,
        });
    });
    steps.push({
        kind: "end",
        intentText: formatJson(review.expected_end.intent_output ?? null),
        processed_locally:
            typeof review.expected_end.processed_locally === "boolean"
                ? review.expected_end.processed_locally
                : null,
    });
    return steps;
};

const deriveStepsFromRun = (run: IntentRun): EditorStep[] => {
    const steps: EditorStep[] = [];
    (run.intent_progress ?? []).forEach((item) => {
        steps.push({
            kind: "progress",
            chatText: formatJson(item.chat_log_delta ?? null),
            tts_start_streaming:
                typeof item.tts_start_streaming === "boolean" ? item.tts_start_streaming : null,
        });
    });
    const endEvent = (run.intent_ends ?? [])[ 0 ];
    if (endEvent) {
        steps.push({
            kind: "end",
            intentText: formatJson(endEvent.intent_output ?? null),
            processed_locally:
                typeof endEvent.processed_locally === "boolean" ? endEvent.processed_locally : null,
        });
    }
    return steps;
};

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

    .pill.badge-reviewed {
        background: rgba(125, 255, 200, 0.12);
        color: #7dffbf;
    }

    .pill.badge-pending {
        background: rgba(255, 138, 125, 0.15);
        color: var(--danger);
    }
`;

@customElement("intentsity-run-list")
class IntentsityRunList extends LitElement {
    @property({ attribute: false }) runs: IntentRun[] = [];
    @property({ attribute: false }) selectedRunId: string | null = null;
    @property({ attribute: false }) selectedStartId: number | null = null;
    @property({ attribute: false }) onSelectStart?: (runId: string, startId: number) => void;

    static styles = [
        pillStyles,
        buttonStyles,
        css`
            :host {
                display: block;
            }

            .run-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 18px;
            }

            .run-card {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 18px;
                padding: 18px;
                display: flex;
                flex-direction: column;
                gap: 14px;
                box-shadow: 0 26px 46px rgba(3, 5, 16, 0.7);
                animation: fadeIn 0.35s ease;
            }

            .run-header {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .section {
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                padding-top: 12px;
            }

            .section h3 {
                margin: 0 0 6px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--muted);
            }

            .entry {
                margin: 0 0 6px;
                padding: 8px;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .entry:last-child {
                margin-bottom: 0;
            }

            .start-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .start-button {
                padding: 6px 14px;
                border-radius: 999px;
                border: 1px solid rgba(125, 212, 255, 0.4);
                background: transparent;
                color: var(--text);
                font-size: 13px;
                transition: background 0.2s ease;
            }

            .start-button.active {
                background: rgba(125, 212, 255, 0.2);
                color: var(--accent);
            }

            .start-button:disabled {
                opacity: 0.5;
                border-style: dashed;
            }

            .empty-state {
                padding: 24px;
                border: 1px dashed rgba(255, 255, 255, 0.15);
                border-radius: 18px;
                text-align: center;
                color: var(--muted);
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(8px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `,
    ];

    private handleStartClick(runId: string, startId: number): void {
        this.onSelectStart?.(runId, startId);
    }

    private renderSection(
        title: string,
        items: Array<IntentProgress | IntentEnd> | undefined,
        formatter: (item: IntentProgress | IntentEnd) => unknown,
    ) {
        if (!items?.length) {
            return nothing;
        }
        return html`<div class="section">
            <h3>${ title }</h3>
            ${ items.map(
            (item) => html`<div class="entry">
                    <time>${ formatTimestamp(item.timestamp) }</time>
                    ${ formatter(item) }
                </div>`,
        ) }
        </div>`;
    }

    private renderRun(run: IntentRun) {
        const reviewed = Boolean(run.review);
        const reviewLabel = reviewed ? "Reviewed" : "Needs review";
        const reviewClass = reviewed ? "pill badge-reviewed" : "pill badge-pending";
        const startButtons = (run.intent_starts ?? []).map((start, index) => {
            const startId = typeof start.id === "number" ? start.id : null;
            const isActive =
                Boolean(startId) &&
                this.selectedRunId === run.run_id &&
                this.selectedStartId === startId;
            if (!startId) {
                return html`<button class="start-button" type="button" disabled title="Requires database ID">
                    Start ${ index + 1 }
                </button>`;
            }
            return html`<button
                class="start-button ${ isActive ? "active" : "" }"
                type="button"
                @click=${ () => this.handleStartClick(run.run_id, startId) }
            >
                ${ start.intent_input ?? `Start ${ index + 1 }` }
            </button>`;
        });

        const progressSection = this.renderSection("Intent Progress", run.intent_progress, (item) => html`
            ${ "chat_log_delta" in item && item.chat_log_delta
                ? html`<div>Chat Delta:<pre>${ JSON.stringify(item.chat_log_delta, null, 2) }</pre></div>`
                : nothing }
            ${ typeof (item as IntentProgress).tts_start_streaming !== "undefined" &&
                (item as IntentProgress).tts_start_streaming !== null
                ? html`<div>TTS Streaming: ${ (item as IntentProgress).tts_start_streaming }</div>`
                : nothing }
        `);

        const endSection = this.renderSection("Intent Ends", run.intent_ends, (item) => html`
            <div>Processed locally: ${ (item as IntentEnd).processed_locally ?? "n/a" }</div>
            <div>
                Intent Output:
                <pre>${ JSON.stringify((item as IntentEnd).intent_output ?? {}, null, 2) }</pre>
            </div>
        `);

        return html`<article class="run-card">
            <div class="run-header">
                <h2>${ run.name || "Assist Run" }</h2>
                <span class="pill">${ run.run_id.slice(0, 8) } · ${ formatTimestamp(run.created_at) }</span>
                <span class="pill">${ run.conversation_engine || "engine" } · ${ run.language || "lang" }</span>
                <span class="${ reviewClass }">${ reviewLabel }</span>
            </div>
            <div class="section">
                <h3>Intent Starts</h3>
                <div class="start-grid">
                    ${ startButtons.length ? startButtons : html`<span class="pill badge-pending">No starts yet</span>` }
                </div>
            </div>
            ${ progressSection }
            ${ endSection }
        </article>`;
    }

    render() {
        if (!this.runs.length) {
            return html`<div class="empty-state">No Assist runs yet. Check back after an intent pipeline executes.</div>`;
        }
        return html`<div class="run-grid">
            ${ this.runs.map((run) => this.renderRun(run)) }
        </div>`;
    }
}

@customElement("intentsity-editor")
class IntentsityEditor extends LitElement {
    @property({ attribute: false }) run: IntentRun | null = null;
    @property({ attribute: false }) start: IntentStart | null = null;
    @property({ attribute: false }) steps: EditorStep[] = [];
    @property({ attribute: false }) warning = "";
    @property({ attribute: false }) matchedExpectations = true;
    @property({ attribute: false }) isSaving = false;
    @property({ attribute: false }) onJsonInput?: (index: number, field: "chatText" | "intentText", value: string) => void;
    @property({ attribute: false }) onBooleanChange?: (
        index: number,
        field: "tts_start_streaming" | "processed_locally",
        value: "true" | "false" | "unknown",
    ) => void;
    @property({ attribute: false }) onMoveStep?: (index: number, direction: number) => void;
    @property({ attribute: false }) onMatchedToggle?: (value: boolean) => void;
    @property({ attribute: false }) onSave?: () => void;

    static styles = [
        pillStyles,
        buttonStyles,
        css`
            :host {
                display: block;
            }

            .editor-panel {
                background: rgba(3, 5, 16, 0.85);
                border: 1px solid var(--card-border);
                border-radius: 22px;
                padding: 20px;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
                min-height: 460px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .editor-empty {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                color: var(--muted);
                border: 1px dashed rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                padding: 24px;
            }

            .editor-meta {
                display: flex;
                flex-direction: column;
                gap: 6px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 14px;
                padding: 12px 14px;
            }

            .step-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .step-card {
                background: rgba(15, 20, 40, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 14px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .step-card--end {
                border-color: rgba(125, 255, 200, 0.4);
            }

            textarea {
                width: 100%;
                min-height: 120px;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 8px;
                color: var(--text);
                font-family: "JetBrains Mono", "Fira Code", monospace;
            }

            select {
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 999px;
                padding: 4px 10px;
                color: var(--text);
            }

            .step-controls {
                display: flex;
                gap: 8px;
            }

            .ghost-button {
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: transparent;
                color: var(--text);
                padding: 6px 10px;
            }

            .footer-actions {
                margin-top: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
            }

            .switch {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }

            .switch input {
                accent-color: var(--accent);
            }
        `,
    ];

    private renderEmptyState() {
        if (!this.run || !this.start) {
            return html`<div class="editor-empty">
                <h2>Review workspace</h2>
                <p>Select an IntentStart to reorder events and pin the expected response.</p>
            </div>`;
        }
        return html`<div class="editor-empty">
            <h2>${ this.start.intent_input || "Intent start" }</h2>
            <p>${ this.warning || "No reviewable events yet." }</p>
        </div>`;
    }

    private renderStep(step: EditorStep, index: number) {
        const isEnd = step.kind === "end";
        const jsonField = isEnd ? "intentText" : "chatText";
        const jsonLabel = isEnd ? "Intent Output (JSON)" : "Chat Delta (JSON)";
        const selectField = isEnd ? "processed_locally" : "tts_start_streaming";
        const selectLabel = isEnd ? "Processed locally" : "TTS starts streaming";
        const textValue = isEnd ? step.intentText ?? "" : step.chatText ?? "";
        const selectValue = isEnd
            ? step.processed_locally === true
                ? "true"
                : step.processed_locally === false
                    ? "false"
                    : "unknown"
            : step.tts_start_streaming === true
                ? "true"
                : step.tts_start_streaming === false
                    ? "false"
                    : "unknown";
        const canMoveUp = !isEnd && index > 0;
        const canMoveDown = !isEnd && index < this.steps.length - 2;

        return html`<article class="step-card ${ isEnd ? "step-card--end" : "" }">
            <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <strong>${ isEnd ? "Intent End" : `Intent Progress ${ index + 1 }` }</strong>
                ${ isEnd
                ? html`<span class="pill badge-reviewed">END</span>`
                : html`<div class="step-controls">
                          <button
                              class="ghost-button"
                              type="button"
                              ?disabled=${ !canMoveUp }
                              @click=${ () => this.onMoveStep?.(index, -1) }
                          >
                              ↑
                          </button>
                          <button
                              class="ghost-button"
                              type="button"
                              ?disabled=${ !canMoveDown }
                              @click=${ () => this.onMoveStep?.(index, 1) }
                          >
                              ↓
                          </button>
                      </div>`}
            </header>
            <label>
                ${ jsonLabel }
                <textarea
                    .value=${ textValue }
                    @input=${ (event: Event) =>
                this.onJsonInput?.(
                    index,
                    jsonField,
                    (event.currentTarget as HTMLTextAreaElement).value,
                ) }
                ></textarea>
            </label>
            <label>
                ${ selectLabel }
                <select
                    .value=${ selectValue }
                    @change=${ (event: Event) =>
                this.onBooleanChange?.(
                    index,
                    selectField,
                    (event.currentTarget as HTMLSelectElement).value as
                    | "true"
                    | "false"
                    | "unknown",
                ) }
                >
                    <option value="unknown">Unknown</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </label>
        </article>`;
    }

    render() {
        if (!this.steps.length) {
            return html`<aside class="editor-panel">${ this.renderEmptyState() }</aside>`;
        }

        return html`<aside class="editor-panel">
            <div class="editor-meta">
                <strong>${ this.start?.intent_input || "Intent start" }</strong>
                ${ this.run ? html`<span>Run • ${ this.run.run_id.slice(0, 8) }</span>` : nothing }
                ${ this.start?.device_id ? html`<span>Device • ${ this.start.device_id }</span>` : nothing }
            </div>
            <div class="step-list">
                ${ this.steps.map((step, index) => this.renderStep(step, index)) }
            </div>
            <div class="footer-actions">
                <label class="switch">
                    <input
                        type="checkbox"
                        .checked=${ this.matchedExpectations }
                        @change=${ (event: Event) =>
                this.onMatchedToggle?.((event.currentTarget as HTMLInputElement).checked) }
                    />
                    <span>Matched expectations</span>
                </label>
                <button type="button" ?disabled=${ this.isSaving } @click=${ () => this.onSave?.() }>
                    ${ this.isSaving ? "Saving…" : "Save review" }
                </button>
            </div>
        </aside>`;
    }
}

@customElement("intentsity-panel")
class IntentsityPanel extends LitElement {
    @state() private runs: IntentRun[] = [];
    @state() private limit = DEFAULT_LIMIT;
    @state() private selectedRunId: string | null = null;
    @state() private selectedStartId: number | null = null;
    @state() private editorSteps: EditorStep[] = [];
    @state() private editorWarning = "";
    @state() private matchedExpectations = true;
    @state() private isSaving = false;

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
                --danger: #ff8a7d;
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

            * {
                box-sizing: border-box;
            }

            h1 {
                margin: 0 0 8px;
                font-size: 30px;
            }

            p {
                margin: 0 0 24px;
                color: var(--muted);
            }

            .controls {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 12px;
                margin-bottom: 24px;
            }

            label {
                font-weight: 600;
            }

            input[type="number"] {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--card-border);
                color: var(--text);
                padding: 6px 10px;
                border-radius: 8px;
                width: 120px;
            }

            .layout {
                display: grid;
                grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
                gap: 28px;
            }

            @media (max-width: 960px) {
                .layout {
                    grid-template-columns: 1fr;
                }

                intentsity-editor {
                    order: -1;
                }
            }

            @media (max-width: 600px) {
                :host {
                    padding: 20px;
                }

                input[type="number"] {
                    width: 100%;
                }
            }
        `,
    ];

    private readonly subscriptionHandler = (message: SubscriptionMessage): void => {
        const payload = message.event?.runs ?? message.runs ?? [];
        this.updateRuns(payload);
    };

    private readonly handleRefresh = (): void => {
        void this.debug();
        void this.loadRuns();
    };

    private readonly handleLimitChange = (event: Event): void => {
        const input = event.currentTarget as HTMLInputElement;
        this.limit = clampLimit(input.value);
    };

    private readonly handleSelectStart = (runId: string, startId: number): void => {
        this.selectedRunId = runId;
        this.selectedStartId = startId;
        this.editorWarning = "";
        const run = this.getCurrentRun();
        if (!run) {
            this.editorSteps = [];
            return;
        }
        const review =
            run.review && (!run.review.intent_start_id || run.review.intent_start_id === startId)
                ? run.review
                : null;
        const steps = (deriveStepsFromReview(review) ?? deriveStepsFromRun(run)).slice();
        if (!steps.length) {
            this.editorSteps = [];
            this.editorWarning = "This run has not emitted INTENT_END yet.";
        } else {
            this.editorSteps = steps;
        }
        this.matchedExpectations = review ? Boolean(review.matched_expectations) : true;
    };

    private readonly handleJsonInput = (
        index: number,
        field: "chatText" | "intentText",
        value: string,
    ): void => {
        this.editorSteps = this.editorSteps.map((step, idx) =>
            idx === index ? { ...step, [ field ]: value } : step,
        );
    };

    private readonly handleBooleanChange = (
        index: number,
        field: "tts_start_streaming" | "processed_locally",
        value: "true" | "false" | "unknown",
    ): void => {
        const parsed = value === "true" ? true : value === "false" ? false : null;
        this.editorSteps = this.editorSteps.map((step, idx) =>
            idx === index ? { ...step, [ field ]: parsed } : step,
        );
    };

    private readonly handleMoveStep = (index: number, direction: number): void => {
        const target = index + direction;
        if (target < 0 || target >= this.editorSteps.length - 1) {
            return;
        }
        const steps = this.editorSteps.slice();
        const [ item ] = steps.splice(index, 1);
        steps.splice(target, 0, item);
        this.editorSteps = steps;
    };

    private readonly handleMatchedToggle = (value: boolean): void => {
        this.matchedExpectations = value;
    };

    private readonly handleSaveRequest = (): void => {
        void this.saveReview();
    };

    async debug() {
        const conn = await this.getConnection();
        await conn.subscribeMessage(console.dir, {
            type: "conversation/chat_log/subscribe_index"
        });
        await conn.sendMessagePromise({
            type: "conversation/chat_log/subscribe_index"
        });
    }

    protected firstUpdated(): void {
        window.addEventListener("beforeunload", this.teardownSubscription);
        void this.loadRuns();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener("beforeunload", this.teardownSubscription);
        this.teardownSubscription();
    }

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

    private async ensureSubscription(limit: number): Promise<void> {
        const conn = await this.getConnection();
        this.teardownSubscription();
        this.unsubscribe = await conn.subscribeMessage(this.subscriptionHandler, {
            type: SUBSCRIBE_COMMAND,
            limit,
        });
    }

    private async requestSnapshot(limit: number): Promise<void> {
        const conn = await this.getConnection();
        const response = await conn.sendMessagePromise<{ runs?: IntentRun[]; }>({
            type: LIST_COMMAND,
            limit,
        });
        this.updateRuns(response.runs ?? []);
    }

    private updateRuns(runs: IntentRun[]): void {
        this.runs = Array.isArray(runs) ? runs : [];
        if (!this.selectedRunId) {
            return;
        }
        const run = this.getCurrentRun();
        if (!run) {
            this.selectedRunId = null;
            this.selectedStartId = null;
            this.editorSteps = [];
            return;
        }
        if (
            this.selectedStartId !== null &&
            !run.intent_starts?.some((start) => start.id === this.selectedStartId)
        ) {
            this.selectedStartId = null;
            this.editorSteps = [];
        }
    }

    private getCurrentRun(): IntentRun | undefined {
        if (!this.selectedRunId) {
            return undefined;
        }
        return this.runs.find((run) => run.run_id === this.selectedRunId);
    }

    private async loadRuns(): Promise<void> {
        const limit = clampLimit(this.limit);
        this.limit = limit;
        try {
            await this.requestSnapshot(limit);
            await this.ensureSubscription(limit);
        } catch (error) {
            console.error(error);
            alert("Failed to load runs");
        }
    }

    private async saveReview(): Promise<void> {
        if (!this.selectedRunId || !this.selectedStartId) {
            alert("Select an IntentStart to review.");
            return;
        }
        if (!this.editorSteps.length) {
            alert("Nothing to save yet.");
            return;
        }

        const stepsPayload: SaveReviewPayload = [];
        let encounteredEnd = false;
        try {
            this.editorSteps.forEach((step, index) => {
                if (step.kind === "end") {
                    encounteredEnd = true;
                    const trimmed = step.intentText?.trim();
                    stepsPayload.push({
                        order_index: index,
                        kind: "end",
                        processed_locally: step.processed_locally,
                        intent_output: trimmed ? JSON.parse(trimmed) : null,
                    });
                    return;
                }
                const trimmed = step.chatText?.trim();
                stepsPayload.push({
                    order_index: index,
                    kind: "progress",
                    chat_log_delta: trimmed ? JSON.parse(trimmed) : null,
                    tts_start_streaming: step.tts_start_streaming,
                });
            });
        } catch (error) {
            alert("Ensure all JSON fields are valid before saving.");
            return;
        }

        if (!encounteredEnd) {
            alert("The last element must be INTENT_END.");
            return;
        }

        this.isSaving = true;
        try {
            const conn = await this.getConnection();
            await conn.sendMessagePromise({
                type: SAVE_COMMAND,
                run_id: this.selectedRunId,
                intent_start_id: this.selectedStartId,
                matched_expectations: this.matchedExpectations,
                steps: stepsPayload,
            });
        } catch (error) {
            console.error(error);
            alert("Failed to save review");
        } finally {
            this.isSaving = false;
        }
    }

    render() {
        const currentRun = this.getCurrentRun() ?? null;
        const currentStart = currentRun?.intent_starts?.find(
            (start) => start.id === this.selectedStartId,
        ) ?? null;

        return html`<h1>Assist Intent Review</h1>
            <p>
                Track Assist pipeline runs, curate expected responses, and mark conversations as reviewed.
            </p>
            <div class="controls">
                <label for="limit">Rows:</label>
                <input
                    id="limit"
                    type="number"
                    min="1"
                    max="500"
                    .value=${ String(this.limit) }
                    @change=${ this.handleLimitChange }
                />
                <button type="button" @click=${ this.handleRefresh }>Refresh</button>
            </div>
            <div class="layout">
                <section>
                    <intentsity-run-list
                        .runs=${ this.runs }
                        .selectedRunId=${ this.selectedRunId }
                        .selectedStartId=${ this.selectedStartId }
                        .onSelectStart=${ this.handleSelectStart }
                    ></intentsity-run-list>
                </section>
                <intentsity-editor
                    .run=${ currentRun }
                    .start=${ currentStart }
                    .steps=${ this.editorSteps }
                    .warning=${ this.editorWarning }
                    .matchedExpectations=${ this.matchedExpectations }
                    .isSaving=${ this.isSaving }
                    .onJsonInput=${ this.handleJsonInput }
                    .onBooleanChange=${ this.handleBooleanChange }
                    .onMoveStep=${ this.handleMoveStep }
                    .onMatchedToggle=${ this.handleMatchedToggle }
                    .onSave=${ this.handleSaveRequest }
                ></intentsity-editor>
            </div>`;
    }
}
