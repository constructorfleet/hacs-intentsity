const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;let i=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n.set(s,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const n=1===t.length?t[0]:e.reduce((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1],t[0]);return new i(n,t,s)},a=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new i("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:o,defineProperty:d,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,h=globalThis,g=h.trustedTypes,m=g?g.emptyScript:"",f=h.reactiveElementPolyfillSupport,b=(t,e)=>t,_={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},v=(t,e)=>!o(t,e),$={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),h.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),n=this.getPropertyDescriptor(t,s,e);void 0!==n&&d(this.prototype,t,n)}}static getPropertyDescriptor(t,e,s){const{get:n,set:i}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:n,set(e){const r=n?.call(this);i?.call(this,e),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...c(t),...p(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,n)=>{if(e)s.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of n){const n=document.createElement("style"),i=t.litNonce;void 0!==i&&n.setAttribute("nonce",i),n.textContent=e.cssText,s.appendChild(n)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,s);if(void 0!==n&&!0===s.reflect){const i=(void 0!==s.converter?.toAttribute?s.converter:_).toAttribute(e,s.type);this._$Em=t,null==i?this.removeAttribute(n):this.setAttribute(n,i),this._$Em=null}}_$AK(t,e){const s=this.constructor,n=s._$Eh.get(t);if(void 0!==n&&this._$Em!==n){const t=s.getPropertyOptions(n),i="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:_;this._$Em=n;const r=i.fromAttribute(e,t.type);this[n]=r??this._$Ej?.get(n)??r,this._$Em=null}}requestUpdate(t,e,s,n=!1,i){if(void 0!==t){const r=this.constructor;if(!1===n&&(i=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??v)(i,e)||s.useDefault&&s.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:n,wrapped:i},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==i||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===n&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,n=this[e];!0!==t||this._$AL.has(e)||void 0===n||this.C(e,void 0,s,n)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,f?.({ReactiveElement:x}),(h.reactiveElementVersions??=[]).push("2.1.2");const y=globalThis,A=t=>t,w=y.trustedTypes,S=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",I=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+I,T=`<${C}>`,M=document,R=()=>M.createComment(""),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,P="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,U=/>/g,H=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,j=/"/g,B=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),z=Symbol.for("lit-noChange"),J=Symbol.for("lit-nothing"),V=new WeakMap,q=M.createTreeWalker(M,129);function W(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const Y=(t,e)=>{const s=t.length-1,n=[];let i,r=2===e?"<svg>":3===e?"<math>":"",a=O;for(let e=0;e<s;e++){const s=t[e];let o,d,l=-1,c=0;for(;c<s.length&&(a.lastIndex=c,d=a.exec(s),null!==d);)c=a.lastIndex,a===O?"!--"===d[1]?a=L:void 0!==d[1]?a=U:void 0!==d[2]?(B.test(d[2])&&(i=RegExp("</"+d[2],"g")),a=H):void 0!==d[3]&&(a=H):a===H?">"===d[0]?(a=i??O,l=-1):void 0===d[1]?l=-2:(l=a.lastIndex-d[2].length,o=d[1],a=void 0===d[3]?H:'"'===d[3]?j:D):a===j||a===D?a=H:a===L||a===U?a=O:(a=H,i=void 0);const p=a===H&&t[e+1].startsWith("/>")?" ":"";r+=a===O?s+T:l>=0?(n.push(o),s.slice(0,l)+E+s.slice(l)+I+p):s+I+(-2===l?e:p)}return[W(t,r+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),n]};class K{constructor({strings:t,_$litType$:e},s){let n;this.parts=[];let i=0,r=0;const a=t.length-1,o=this.parts,[d,l]=Y(t,e);if(this.el=K.createElement(d,s),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(n=q.nextNode())&&o.length<a;){if(1===n.nodeType){if(n.hasAttributes())for(const t of n.getAttributeNames())if(t.endsWith(E)){const e=l[r++],s=n.getAttribute(t).split(I),a=/([.?@])?(.*)/.exec(e);o.push({type:1,index:i,name:a[2],strings:s,ctor:"."===a[1]?tt:"?"===a[1]?et:"@"===a[1]?st:Q}),n.removeAttribute(t)}else t.startsWith(I)&&(o.push({type:6,index:i}),n.removeAttribute(t));if(B.test(n.tagName)){const t=n.textContent.split(I),e=t.length-1;if(e>0){n.textContent=w?w.emptyScript:"";for(let s=0;s<e;s++)n.append(t[s],R()),q.nextNode(),o.push({type:2,index:++i});n.append(t[e],R())}}}else if(8===n.nodeType)if(n.data===C)o.push({type:2,index:i});else{let t=-1;for(;-1!==(t=n.data.indexOf(I,t+1));)o.push({type:7,index:i}),t+=I.length-1}i++}}static createElement(t,e){const s=M.createElement("template");return s.innerHTML=t,s}}function X(t,e,s=t,n){if(e===z)return e;let i=void 0!==n?s._$Co?.[n]:s._$Cl;const r=k(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),void 0===r?i=void 0:(i=new r(t),i._$AT(t,s,n)),void 0!==n?(s._$Co??=[])[n]=i:s._$Cl=i),void 0!==i&&(e=X(t,i._$AS(t,e.values),i,n)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,n=(t?.creationScope??M).importNode(e,!0);q.currentNode=n;let i=q.nextNode(),r=0,a=0,o=s[0];for(;void 0!==o;){if(r===o.index){let e;2===o.type?e=new G(i,i.nextSibling,this,t):1===o.type?e=new o.ctor(i,o.name,o.strings,this,t):6===o.type&&(e=new nt(i,this,t)),this._$AV.push(e),o=s[++a]}r!==o?.index&&(i=q.nextNode(),r++)}return q.currentNode=M,n}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class G{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,n){this.type=2,this._$AH=J,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),k(t)?t===J||null==t||""===t?(this._$AH!==J&&this._$AR(),this._$AH=J):t!==this._$AH&&t!==z&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==J&&k(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=K.createElement(W(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===n)this._$AH.p(e);else{const t=new Z(n,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new K(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,n=0;for(const i of t)n===e.length?e.push(s=new G(this.O(R()),this.O(R()),this,this.options)):s=e[n],s._$AI(i),n++;n<e.length&&(this._$AR(s&&s._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,n,i){this.type=1,this._$AH=J,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=i,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=J}_$AI(t,e=this,s,n){const i=this.strings;let r=!1;if(void 0===i)t=X(this,t,e,0),r=!k(t)||t!==this._$AH&&t!==z,r&&(this._$AH=t);else{const n=t;let a,o;for(t=i[0],a=0;a<i.length-1;a++)o=X(this,n[s+a],e,a),o===z&&(o=this._$AH[a]),r||=!k(o)||o!==this._$AH[a],o===J?t=J:t!==J&&(t+=(o??"")+i[a+1]),this._$AH[a]=o}r&&!n&&this.j(t)}j(t){t===J?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===J?void 0:t}}class et extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==J)}}class st extends Q{constructor(t,e,s,n,i){super(t,e,s,n,i),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??J)===z)return;const s=this._$AH,n=t===J&&s!==J||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==J&&(s===J||n);n&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const it=y.litHtmlPolyfillSupport;it?.(K,G),(y.litHtmlVersions??=[]).push("3.3.2");const rt=globalThis;class at extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const n=s?.renderBefore??e;let i=n._$litPart$;if(void 0===i){const t=s?.renderBefore??null;n._$litPart$=i=new G(e.insertBefore(R(),t),t,void 0,s??{})}return i._$AI(t),i})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return z}}at._$litElement$=!0,at.finalized=!0,rt.litElementHydrateSupport?.({LitElement:at});const ot=rt.litElementPolyfillSupport;ot?.({LitElement:at}),(rt.litElementVersions??=[]).push("4.2.2");customElements.define("intentsity",class extends at{render(){return F`<h1>Assist Intent Review</h1>
            <p> Track Assist pipeline runs, curate expected responses, and mark conversations as reviewed.</p >
        <div class="controls">
            <label for="limit">Rows:</label>
            <input id="limit" type="number" min="1" max="500" value="100" />
            <button type="button" onclick="loadRuns()">Refresh</button>
        </div>
        <div class="layout">
            <section>
                <section id="run-list" class="run-grid"></section>
            </section>
            <aside id="editor" class="editor-panel">
                <div class="editor-empty">
                    <h2>Review workspace</h2>
                    <p>Select an IntentStart to reorder events and pin the expected response.</p>
                </div>
            </aside>
        </div>
        <script>
            const DEFAULT_LIMIT = 100;
            const MAX_LIMIT = 500;
            const LIST_COMMAND = 'list_events';
            const SUBSCRIBE_COMMAND = 'subscribe_events';
            const SAVE_COMMAND = 'save_review';
            const state = {
                runs: [],
                limit: DEFAULT_LIMIT,
                selectedRunId: null,
                selectedStartId: null,
                editorSteps: [],
                editorWarning: '',
                matchedExpectations: true,
                isSaving: false,
            };

            let unsubscribe = null;

            function clampLimit(raw) {
                const value = Number.isFinite(raw) ? raw : DEFAULT_LIMIT;
                return Math.max(1, Math.min(MAX_LIMIT, value || DEFAULT_LIMIT));
            }

            async function getConnection() {
                if (!window.hassConnection) {
                    throw new Error('Home Assistant connection unavailable');
                }
                const { conn } = await window.hassConnection;
                return conn;
            }

            function formatJson(value) {
                if (!value) {
                    return '{\n  \n}';
                }
                try {
                    return JSON.stringify(value, null, 2);
                } catch (err) {
                    return '{\n  "raw": "unserializable"\n}';
                }
            }

            function updateRuns(runs) {
                state.runs = Array.isArray(runs) ? runs : [];
                renderRunList();
                renderEditor();
            }

            function renderRunList() {
                const container = document.getElementById('run-list');
                container.innerHTML = '';
                state.runs.forEach((run) => {
                    const card = document.createElement('article');
                    card.className = 'run-card';
                    const reviewed = Boolean(run.review);
                    const reviewLabel = reviewed ? 'Reviewed' : 'Needs review';
                    const reviewClass = reviewed ? 'pill badge-reviewed' : 'pill badge-pending';
                    const header = \`
                    <div class="run-header">
                        <h2>\${run.name || 'Assist Run'}</h2>
                        <span class="pill">\${run.run_id.slice(0, 8)} · \${new Date(run.created_at).toLocaleString()}</span>
                        <span class="pill">\${run.conversation_engine || 'engine'} · \${run.language || 'lang'}</span>
                        <span class="\${reviewClass}">\${reviewLabel}</span>
                    </div>
                \`;
                    const startButtons = (run.intent_starts || [])
                        .map((start, idx) => {
                            const startId = typeof start.id === 'number' ? start.id : null;
                            const isActive = state.selectedRunId === run.run_id && state.selectedStartId === startId;
                            if (!startId) {
                                return \`<button type="button" class="start-button" disabled title="Requires database ID">Start \${idx + 1}</button>\`;
                            }
                            const label = start.intent_input || \`Start \${idx + 1}\`;
                            return \`<button type="button" class="start-button\${isActive ? ' active' : ''}" data-run="\${run.run_id}" data-start="\${startId}">\${label}</button>\`;
                        })
                        .join('');

                    const starts = \`
                    <div class="section">
                        <h3>Intent Starts</h3>
                        <div class="start-grid">\${startButtons || '<span class="pill badge-pending">No starts yet</span>'}</div>
                    </div>
                \`;

                    const progress = renderSection('Intent Progress', run.intent_progress || [], (item) => \`
                    \${item.chat_log_delta ? \`<div>Chat Delta:<pre>\${JSON.stringify(item.chat_log_delta, null, 2)}</pre></div>\` : ''}
                    \${typeof item.tts_start_streaming !== 'undefined' && item.tts_start_streaming !== null ? \`<div>TTS Streaming: \${item.tts_start_streaming}</div>\` : ''}
                \`);
                    const ends = renderSection('Intent Ends', run.intent_ends || [], (item) => \`
                    <div>Processed locally: \${item.processed_locally ?? 'n/a'}</div>
                    <div>Intent Output:<pre>\${JSON.stringify(item.intent_output || {}, null, 2)}</pre></div>
                \`);

                    card.innerHTML = header + starts + progress + ends;
                    container.appendChild(card);
                });

                container.querySelectorAll('[data-start]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const runId = button.getAttribute('data-run');
                        const startId = parseInt(button.getAttribute('data-start'), 10);
                        selectStart(runId, startId);
                    });
                });
            }

            function renderSection(title, items, formatter) {
                if (!items || !items.length) {
                    return '';
                }
                const rows = items
                    .map(
                        (item) => \`
                    <div class="entry">
                        <time>\${new Date(item.timestamp).toLocaleString()}</time>
                        \${formatter(item)}
                    </div>\`
                    )
                    .join('');
                return \`<div class="section"><h3>\${title}</h3>\${rows}</div>\`;
            }

            function selectStart(runId, startId) {
                state.selectedRunId = runId;
                state.selectedStartId = startId;
                state.editorWarning = '';
                const run = state.runs.find((candidate) => candidate.run_id === runId);
                if (!run) {
                    return;
                }
                const review = run.review && (!run.review.intent_start_id || run.review.intent_start_id === startId) ? run.review : null;
                const stepsFromReview = deriveStepsFromReview(review);
                const steps = stepsFromReview || deriveStepsFromRun(run);
                if (!steps.length) {
                    state.editorSteps = [];
                    state.editorWarning = 'This run has not emitted INTENT_END yet.';
                } else {
                    state.editorSteps = steps;
                }
                state.matchedExpectations = review ? Boolean(review.matched_expectations) : true;
                renderRunList();
                renderEditor();
            }

            function deriveStepsFromReview(review) {
                if (!review || !review.expected_end) {
                    return null;
                }
                const steps = [];
                (review.expected_progress || []).forEach((item) => {
                    steps.push({
                        kind: 'progress',
                        chatText: formatJson(item.chat_log_delta || {}),
                        tts_start_streaming: typeof item.tts_start_streaming === 'boolean' ? item.tts_start_streaming : null,
                    });
                });
                steps.push({
                    kind: 'end',
                    intentText: formatJson(review.expected_end.intent_output || {}),
                    processed_locally: typeof review.expected_end.processed_locally === 'boolean' ? review.expected_end.processed_locally : null,
                });
                return steps;
            }

            function deriveStepsFromRun(run) {
                const steps = [];
                (run.intent_progress || []).forEach((item) => {
                    steps.push({
                        kind: 'progress',
                        chatText: formatJson(item.chat_log_delta || {}),
                        tts_start_streaming: typeof item.tts_start_streaming === 'boolean' ? item.tts_start_streaming : null,
                    });
                });
                const endEvent = (run.intent_ends || [])[0];
                if (endEvent) {
                    steps.push({
                        kind: 'end',
                        intentText: formatJson(endEvent.intent_output || {}),
                        processed_locally: typeof endEvent.processed_locally === 'boolean' ? endEvent.processed_locally : null,
                    });
                }
                return steps;
            }

            function renderEditor() {
                const editor = document.getElementById('editor');
                const run = state.runs.find((candidate) => candidate.run_id === state.selectedRunId);
                const start = run?.intent_starts?.find((item) => item.id === state.selectedStartId);

                if (!run || !state.selectedStartId) {
                    editor.innerHTML = \`
                    <div class="editor-empty">
                        <h2>Review workspace</h2>
                        <p>Select an IntentStart to reorder events and pin the expected response.</p>
                    </div>
                \`;
                    return;
                }

                if (!state.editorSteps.length) {
                    editor.innerHTML = \`
                    <div class="editor-empty">
                        <h2>\${start?.intent_input || 'Intent start'}</h2>
                        <p>\${state.editorWarning || 'No reviewable events yet.'}</p>
                    </div>
                \`;
                    return;
                }

                const stepsMarkup = state.editorSteps
                    .map((step, index) => renderStepCard(step, index))
                    .join('');

                editor.innerHTML = \`
                <div class="editor-meta">
                    <strong>\${start?.intent_input || 'Intent start'}</strong>
                    <span>Run • \${run.run_id.slice(0, 8)}</span>
                    \${start?.device_id ? \`<span>Device • \${start.device_id}</span>\` : ''}
                </div>
                <div class="step-list">\${stepsMarkup}</div>
                <div class="footer-actions">
                    <label class="switch">
                        <input type="checkbox" id="matched-switch" \${state.matchedExpectations ? 'checked' : ''} />
                        <span>Matched expectations</span>
                    </label>
                    <button id="save-review" type="button" \${state.isSaving ? 'disabled' : ''}>\${state.isSaving ? 'Saving…' : 'Save review'}</button>
                </div>
            \`;

                editor.querySelectorAll('[data-move-step]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const index = parseInt(button.getAttribute('data-index'), 10);
                        const direction = parseInt(button.getAttribute('data-move-step'), 10);
                        moveStep(index, direction);
                    });
                });

                editor.querySelectorAll('[data-json-field]').forEach((area) => {
                    area.addEventListener('input', () => {
                        const index = parseInt(area.getAttribute('data-index'), 10);
                        const field = area.getAttribute('data-json-field');
                        handleJsonInput(index, field, area.value);
                    });
                });

                editor.querySelectorAll('[data-boolean-field]').forEach((select) => {
                    select.addEventListener('change', () => {
                        const index = parseInt(select.getAttribute('data-index'), 10);
                        const field = select.getAttribute('data-boolean-field');
                        handleBooleanChange(index, field, select.value);
                    });
                });

                const matchedSwitch = editor.querySelector('#matched-switch');
                matchedSwitch?.addEventListener('change', () => {
                    state.matchedExpectations = matchedSwitch.checked;
                });

                const saveButton = editor.querySelector('#save-review');
                saveButton?.addEventListener('click', handleSaveReview);
            }

            function renderStepCard(step, index) {
                const isEnd = step.kind === 'end';
                const label = isEnd ? 'Intent End' : \`Intent Progress \${index + 1}\`;
                const jsonField = isEnd ? 'intentText' : 'chatText';
                const jsonLabel = isEnd ? 'Intent Output (JSON)' : 'Chat Delta (JSON)';
                const selectField = isEnd ? 'processed_locally' : 'tts_start_streaming';
                const selectLabel = isEnd ? 'Processed locally' : 'TTS starts streaming';
                const selectValue = step[selectField];
                const canMoveUp = !isEnd && index > 0;
                const canMoveDown = !isEnd && index < state.editorSteps.length - 2;

                return \`
                <article class="step-card\${isEnd ? ' step-card--end' : ''}">
                    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                        <strong>\${label}</strong>
                        \${!isEnd ? \`<div class="step-controls">
                            <button type="button" class="ghost-button" data-move-step="-1" data-index="\${index}" \${canMoveUp ? '' : 'disabled'}>↑</button>
                            <button type="button" class="ghost-button" data-move-step="1" data-index="\${index}" \${canMoveDown ? '' : 'disabled'}>↓</button>
                        </div>\` : '<span class="pill badge-reviewed">END</span>'}
                    </header>
                    <label>
                        \${jsonLabel}
                        <textarea data-json-field="\${jsonField}" data-index="\${index}">\${step[jsonField] || ''}</textarea>
                    </label>
                    <label>
                        \${selectLabel}
                        <select data-boolean-field="\${selectField}" data-index="\${index}">
                            <option value="unknown" \${selectValue === null ? 'selected' : ''}>Unknown</option>
                            <option value="true" \${selectValue === true ? 'selected' : ''}>True</option>
                            <option value="false" \${selectValue === false ? 'selected' : ''}>False</option>
                        </select>
                    </label>
                </article>
            \`;
            }

            function handleJsonInput(index, field, value) {
                state.editorSteps[index][field] = value;
            }

            function handleBooleanChange(index, field, rawValue) {
                if (rawValue === 'true') {
                    state.editorSteps[index][field] = true;
                } else if (rawValue === 'false') {
                    state.editorSteps[index][field] = false;
                } else {
                    state.editorSteps[index][field] = null;
                }
            }

            function moveStep(index, direction) {
                const steps = state.editorSteps.slice();
                const target = index + direction;
                if (target < 0 || target >= steps.length - 1) {
                    return;
                }
                const [item] = steps.splice(index, 1);
                steps.splice(target, 0, item);
                state.editorSteps = steps;
                renderEditor();
            }

            async function handleSaveReview() {
                if (!state.selectedRunId || !state.selectedStartId) {
                    alert('Select an IntentStart to review.');
                    return;
                }
                if (!state.editorSteps.length) {
                    alert('Nothing to save yet.');
                    return;
                }

                const stepsPayload = [];
                let encounteredEnd = false;
                try {
                    state.editorSteps.forEach((step, index) => {
                        if (step.kind === 'end') {
                            encounteredEnd = true;
                            stepsPayload.push({
                                order_index: index,
                                kind: 'end',
                                processed_locally: step.processed_locally,
                                intent_output: step.intentText ? JSON.parse(step.intentText) : null,
                            });
                            return;
                        }
                        stepsPayload.push({
                            order_index: index,
                            kind: 'progress',
                            chat_log_delta: step.chatText ? JSON.parse(step.chatText) : null,
                            tts_start_streaming: step.tts_start_streaming,
                        });
                    });
                } catch (err) {
                    alert('Ensure all JSON fields are valid before saving.');
                    return;
                }

                if (!encounteredEnd) {
                    alert('The last element must be INTENT_END.');
                    return;
                }

                state.isSaving = true;
                renderEditor();

                try {
                    const conn = await getConnection();
                    await conn.sendMessagePromise({
                        type: SAVE_COMMAND,
                        run_id: state.selectedRunId,
                        intent_start_id: state.selectedStartId,
                        matched_expectations: state.matchedExpectations,
                        steps: stepsPayload,
                    });
                } catch (error) {
                    console.error(error);
                    alert('Failed to save review');
                } finally {
                    state.isSaving = false;
                    renderEditor();
                }
            }

            async function requestSnapshot(limit) {
                try {
                    const conn = await getConnection();
                    const response = await conn.sendMessagePromise({ type: LIST_COMMAND, limit });
                    updateRuns(response.runs || []);
                } catch (error) {
                    console.error(error);
                    alert('Failed to load runs');
                }
            }

            async function ensureSubscription(limit) {
                const conn = await getConnection();
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
                }
                unsubscribe = await conn.subscribeMessage((message) => {
                    const payload = message.event?.runs || message.runs || [];
                    updateRuns(payload);
                }, {
                    type: SUBSCRIBE_COMMAND,
                    limit,
                });
            }

            async function loadRuns() {
                const limitInput = document.getElementById('limit');
                const limit = clampLimit(parseInt(limitInput.value, 10));
                limitInput.value = limit;
                state.limit = limit;
                await requestSnapshot(limit);
                await ensureSubscription(limit);
            }

            window.onload = loadRuns;
            window.addEventListener('beforeunload', () => {
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
                }
            });
        </script>`}static get styles(){return r`
        :root {
            --bg-gradient: radial-gradient(circle at top, #111430, #05060f 55%);
            --card-bg: rgba(9, 12, 25, 0.92);
            --card-border: rgba(125, 212, 255, 0.25);
            --accent: #7dd4ff;
            --danger: #ff8a7d;
            --text: #f4fbff;
            --muted: #9fb1cc;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
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

        .layout {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
            gap: 28px;
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

        .editor-panel h2 {
            margin: 0;
            font-size: 20px;
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
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
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

        @media (max-width: 960px) {
            .layout {
                grid-template-columns: 1fr;
            }

            .editor-panel {
                order: -1;
            }
        }

        @media (max-width: 600px) {
            body {
                padding: 20px;
            }

            input[type="number"] {
                width: 100%;
            }
        }
        `}});
