function e(e,t,n,i){var s,r=arguments.length,o=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(o=(r<3?s(o):r>3?s(t,n,o):s(t,n))||o);return r>3&&o&&Object.defineProperty(t,n,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,n=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let r=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(n&&void 0===e){const n=void 0!==t&&1===t.length;n&&(e=s.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&s.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const n=1===e.length?e[0]:t.reduce((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new r(n,e,i)},a=n?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,g=f.trustedTypes,m=g?g.emptyScript:"",b=f.reactiveElementPolyfillSupport,x=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},k=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:s}=h(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const r=i?.call(this);s?.call(this,t),this.requestUpdate(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const e=this.properties,t=[...d(e),...p(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(n)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const n of i){const i=document.createElement("style"),s=t.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=n.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(void 0!==i&&!0===n.reflect){const s=(void 0!==n.converter?.toAttribute?n.converter:y).toAttribute(t,n.type);this._$Em=e,null==s?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=n.getPropertyOptions(i),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=i;const r=s.fromAttribute(t,e.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(e,t,n,i=!1,s){if(void 0!==e){const r=this.constructor;if(!1===i&&(s=this[e]),n??=r.getPropertyOptions(e),!((n.hasChanged??k)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:s},r){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==s||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,n,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[x("elementProperties")]=new Map,w[x("finalized")]=new Map,b?.({ReactiveElement:w}),(f.reactiveElementVersions??=[]).push("2.1.2");const _=globalThis,$=e=>e,A=_.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,T="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,O="?"+E,C=`<${O}>`,R=document,N=()=>R.createComment(""),I=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,z="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,P=/-->/g,L=/>/g,U=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,j=/"/g,H=/^(?:script|style|textarea|title)$/i,B=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),q=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),Z=new WeakMap,G=R.createTreeWalker(R,129);function Y(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const V=(e,t)=>{const n=e.length-1,i=[];let s,r=2===t?"<svg>":3===t?"<math>":"",o=M;for(let t=0;t<n;t++){const n=e[t];let a,l,c=-1,h=0;for(;h<n.length&&(o.lastIndex=h,l=o.exec(n),null!==l);)h=o.lastIndex,o===M?"!--"===l[1]?o=P:void 0!==l[1]?o=L:void 0!==l[2]?(H.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=U):void 0!==l[3]&&(o=U):o===U?">"===l[0]?(o=s??M,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?U:'"'===l[3]?j:F):o===j||o===F?o=U:o===P||o===L?o=M:(o=U,s=void 0);const d=o===U&&e[t+1].startsWith("/>")?" ":"";r+=o===M?n+C:c>=0?(i.push(a),n.slice(0,c)+T+n.slice(c)+E+d):n+E+(-2===c?t:d)}return[Y(e,r+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class J{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let s=0,r=0;const o=e.length-1,a=this.parts,[l,c]=V(e,t);if(this.el=J.createElement(l,n),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=G.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(T)){const t=c[r++],n=i.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:s,name:o[2],strings:n,ctor:"."===o[1]?te:"?"===o[1]?ne:"@"===o[1]?ie:ee}),i.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:s}),i.removeAttribute(e));if(H.test(i.tagName)){const e=i.textContent.split(E),t=e.length-1;if(t>0){i.textContent=A?A.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],N()),G.nextNode(),a.push({type:2,index:++s});i.append(e[t],N())}}}else if(8===i.nodeType)if(i.data===O)a.push({type:2,index:s});else{let e=-1;for(;-1!==(e=i.data.indexOf(E,e+1));)a.push({type:7,index:s}),e+=E.length-1}s++}}static createElement(e,t){const n=R.createElement("template");return n.innerHTML=e,n}}function Q(e,t,n=e,i){if(t===q)return t;let s=void 0!==i?n._$Co?.[i]:n._$Cl;const r=I(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(e),s._$AT(e,n,i)),void 0!==i?(n._$Co??=[])[i]=s:n._$Cl=s),void 0!==s&&(t=Q(e,s._$AS(e,t.values),s,i)),t}class K{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??R).importNode(t,!0);G.currentNode=i;let s=G.nextNode(),r=0,o=0,a=n[0];for(;void 0!==a;){if(r===a.index){let t;2===a.type?t=new X(s,s.nextSibling,this,e):1===a.type?t=new a.ctor(s,a.name,a.strings,this,e):6===a.type&&(t=new se(s,this,e)),this._$AV.push(t),a=n[++o]}r!==a?.index&&(s=G.nextNode(),r++)}return G.currentNode=R,i}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),I(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(R.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=J.createElement(Y(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new K(i,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new J(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const s of e)i===t.length?t.push(n=new X(this.O(N()),this.O(N()),this,this.options)):n=t[i],n._$AI(s),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=W}_$AI(e,t=this,n,i){const s=this.strings;let r=!1;if(void 0===s)e=Q(this,e,t,0),r=!I(e)||e!==this._$AH&&e!==q,r&&(this._$AH=e);else{const i=e;let o,a;for(e=s[0],o=0;o<s.length-1;o++)a=Q(this,i[n+o],t,o),a===q&&(a=this._$AH[o]),r||=!I(a)||a!==this._$AH[o],a===W?e=W:e!==W&&(e+=(a??"")+s[o+1]),this._$AH[o]=a}r&&!i&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class ne extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class ie extends ee{constructor(e,t,n,i,s){super(e,t,n,i,s),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??W)===q)return;const n=this._$AH,i=e===W&&n!==W||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==W&&(n===W||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const re=_.litHtmlPolyfillSupport;re?.(J,X),(_.litHtmlVersions??=[]).push("3.3.3");const oe=globalThis;class ae extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,n)=>{const i=n?.renderBefore??t;let s=i._$litPart$;if(void 0===s){const e=n?.renderBefore??null;i._$litPart$=s=new X(t.insertBefore(N(),e),e,void 0,n??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,n)=>{void 0!==n?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},he={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:k},de=(e=he,t,n)=>{const{kind:i,metadata:s}=n;let r=globalThis.litPropertyMetadata.get(s);if(void 0===r&&globalThis.litPropertyMetadata.set(s,r=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),r.set(n.name,e),"accessor"===i){const{name:i}=n;return{set(n){const s=t.get.call(this);t.set.call(this,n),this.requestUpdate(i,s,e,!0,n)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=n;return function(n){const s=this[i];t.call(this,n),this.requestUpdate(i,s,e,!0,n)}}throw Error("Unsupported decorator location: "+i)};function pe(e){return(t,n)=>"object"==typeof n?de(e,t,n):((e,t,n)=>{const i=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),i?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function ue(e){return pe({...e,state:!0,attribute:!1})}function fe(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let ge={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};function me(e){ge=e}const be=/[&<>"']/,xe=new RegExp(be.source,"g"),ye=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,ke=new RegExp(ye.source,"g"),ve={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},we=e=>ve[e];function _e(e,t){if(t){if(be.test(e))return e.replace(xe,we)}else if(ye.test(e))return e.replace(ke,we);return e}const $e=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function Ae(e){return e.replace($e,(e,t)=>"colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):"")}const Se=/(^|[^\[])\^/g;function Te(e,t){let n="string"==typeof e?e:e.source;t=t||"";const i={replace:(e,t)=>{let s="string"==typeof t?t:t.source;return s=s.replace(Se,"$1"),n=n.replace(e,s),i},getRegex:()=>new RegExp(n,t)};return i}function Ee(e){try{e=encodeURI(e).replace(/%25/g,"%")}catch(e){return null}return e}const Oe={exec:()=>null};function Ce(e,t){const n=e.replace(/\|/g,(e,t,n)=>{let i=!1,s=t;for(;--s>=0&&"\\"===n[s];)i=!i;return i?"|":" |"}).split(/ \|/);let i=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push("");for(;i<n.length;i++)n[i]=n[i].trim().replace(/\\\|/g,"|");return n}function Re(e,t,n){const i=e.length;if(0===i)return"";let s=0;for(;s<i;){if(e.charAt(i-s-1)!==t)break;s++}return e.slice(0,i-s)}function Ne(e,t,n,i){const s=t.href,r=t.title?_e(t.title):null,o=e[1].replace(/\\([\[\]])/g,"$1");if("!"!==e[0].charAt(0)){i.state.inLink=!0;const e={type:"link",raw:n,href:s,title:r,text:o,tokens:i.inlineTokens(o)};return i.state.inLink=!1,e}return{type:"image",raw:n,href:s,title:r,text:_e(o)}}class Ie{options;rules;lexer;constructor(e){this.options=e||ge}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const e=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?e:Re(e,"\n")}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const e=t[0],n=function(e,t){const n=e.match(/^(\s+)(?:```)/);if(null===n)return t;const i=n[1];return t.split("\n").map(e=>{const t=e.match(/^\s+/);if(null===t)return e;const[n]=t;return n.length>=i.length?e.slice(i.length):e}).join("\n")}(e,t[3]||"");return{type:"code",raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:n}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(/#$/.test(e)){const t=Re(e,"#");this.options.pedantic?e=t.trim():t&&!/ $/.test(t)||(e=t.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:t[0]}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let e=t[0].replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,"\n    $1");e=Re(e.replace(/^ *>[ \t]?/gm,""),"\n");const n=this.lexer.state.top;this.lexer.state.top=!0;const i=this.lexer.blockTokens(e);return this.lexer.state.top=n,{type:"blockquote",raw:t[0],tokens:i,text:e}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const i=n.length>1,s={type:"list",raw:"",ordered:i,start:i?+n.slice(0,-1):"",loose:!1,items:[]};n=i?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=i?n:"[*+-]");const r=new RegExp(`^( {0,3}${n})((?:[\t ][^\\n]*)?(?:\\n|$))`);let o="",a="",l=!1;for(;e;){let n=!1;if(!(t=r.exec(e)))break;if(this.rules.block.hr.test(e))break;o=t[0],e=e.substring(o.length);let i=t[2].split("\n",1)[0].replace(/^\t+/,e=>" ".repeat(3*e.length)),c=e.split("\n",1)[0],h=0;this.options.pedantic?(h=2,a=i.trimStart()):(h=t[2].search(/[^ ]/),h=h>4?1:h,a=i.slice(h),h+=t[1].length);let d=!1;if(!i&&/^ *$/.test(c)&&(o+=c+"\n",e=e.substring(c.length+1),n=!0),!n){const t=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`),n=new RegExp(`^ {0,${Math.min(3,h-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),s=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:\`\`\`|~~~)`),r=new RegExp(`^ {0,${Math.min(3,h-1)}}#`);for(;e;){const l=e.split("\n",1)[0];if(c=l,this.options.pedantic&&(c=c.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),s.test(c))break;if(r.test(c))break;if(t.test(c))break;if(n.test(e))break;if(c.search(/[^ ]/)>=h||!c.trim())a+="\n"+c.slice(h);else{if(d)break;if(i.search(/[^ ]/)>=4)break;if(s.test(i))break;if(r.test(i))break;if(n.test(i))break;a+="\n"+c}d||c.trim()||(d=!0),o+=l+"\n",e=e.substring(l.length+1),i=c.slice(h)}}s.loose||(l?s.loose=!0:/\n *\n *$/.test(o)&&(l=!0));let p,u=null;this.options.gfm&&(u=/^\[[ xX]\] /.exec(a),u&&(p="[ ] "!==u[0],a=a.replace(/^\[[ xX]\] +/,""))),s.items.push({type:"list_item",raw:o,task:!!u,checked:p,loose:!1,text:a,tokens:[]}),s.raw+=o}s.items[s.items.length-1].raw=o.trimEnd(),s.items[s.items.length-1].text=a.trimEnd(),s.raw=s.raw.trimEnd();for(let e=0;e<s.items.length;e++)if(this.lexer.state.top=!1,s.items[e].tokens=this.lexer.blockTokens(s.items[e].text,[]),!s.loose){const t=s.items[e].tokens.filter(e=>"space"===e.type),n=t.length>0&&t.some(e=>/\n.*\n/.test(e.raw));s.loose=n}if(s.loose)for(let e=0;e<s.items.length;e++)s.items[e].loose=!0;return s}}html(e){const t=this.rules.block.html.exec(e);if(t){return{type:"html",block:!0,raw:t[0],pre:"pre"===t[1]||"script"===t[1]||"style"===t[1],text:t[0]}}}def(e){const t=this.rules.block.def.exec(e);if(t){const e=t[1].toLowerCase().replace(/\s+/g," "),n=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:e,raw:t[0],href:n,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t)return;if(!/[:|]/.test(t[2]))return;const n=Ce(t[1]),i=t[2].replace(/^\||\| *$/g,"").split("|"),s=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split("\n"):[],r={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===i.length){for(const e of i)/^ *-+: *$/.test(e)?r.align.push("right"):/^ *:-+: *$/.test(e)?r.align.push("center"):/^ *:-+ *$/.test(e)?r.align.push("left"):r.align.push(null);for(const e of n)r.header.push({text:e,tokens:this.lexer.inline(e)});for(const e of s)r.rows.push(Ce(e,r.header.length).map(e=>({text:e,tokens:this.lexer.inline(e)})));return r}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:"="===t[2].charAt(0)?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const e="\n"===t[1].charAt(t[1].length-1)?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:_e(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const e=t[2].trim();if(!this.options.pedantic&&/^</.test(e)){if(!/>$/.test(e))return;const t=Re(e.slice(0,-1),"\\");if((e.length-t.length)%2==0)return}else{const e=function(e,t){if(-1===e.indexOf(t[1]))return-1;let n=0;for(let i=0;i<e.length;i++)if("\\"===e[i])i++;else if(e[i]===t[0])n++;else if(e[i]===t[1]&&(n--,n<0))return i;return-1}(t[2],"()");if(e>-1){const n=(0===t[0].indexOf("!")?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=""}}let n=t[2],i="";if(this.options.pedantic){const e=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);e&&(n=e[1],i=e[3])}else i=t[3]?t[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(n=this.options.pedantic&&!/>$/.test(e)?n.slice(1):n.slice(1,-1)),Ne(t,{href:n?n.replace(this.rules.inline.anyPunctuation,"$1"):n,title:i?i.replace(this.rules.inline.anyPunctuation,"$1"):i},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const e=t[(n[2]||n[1]).replace(/\s+/g," ").toLowerCase()];if(!e){const e=n[0].charAt(0);return{type:"text",raw:e,text:e}}return Ne(n,e,n[0],this.lexer)}}emStrong(e,t,n=""){let i=this.rules.inline.emStrongLDelim.exec(e);if(!i)return;if(i[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(i[1]||i[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const n=[...i[0]].length-1;let s,r,o=n,a=0;const l="*"===i[0][0]?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(l.lastIndex=0,t=t.slice(-1*e.length+n);null!=(i=l.exec(t));){if(s=i[1]||i[2]||i[3]||i[4]||i[5]||i[6],!s)continue;if(r=[...s].length,i[3]||i[4]){o+=r;continue}if((i[5]||i[6])&&n%3&&!((n+r)%3)){a+=r;continue}if(o-=r,o>0)continue;r=Math.min(r,r+o+a);const t=[...i[0]][0].length,l=e.slice(0,n+i.index+t+r);if(Math.min(n,r)%2){const e=l.slice(1,-1);return{type:"em",raw:l,text:e,tokens:this.lexer.inlineTokens(e)}}const c=l.slice(2,-2);return{type:"strong",raw:l,text:c,tokens:this.lexer.inlineTokens(c)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(/\n/g," ");const n=/[^ ]/.test(e),i=/^ /.test(e)&&/ $/.test(e);return n&&i&&(e=e.substring(1,e.length-1)),e=_e(e,!0),{type:"codespan",raw:t[0],text:e}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let e,n;return"@"===t[2]?(e=_e(t[1]),n="mailto:"+e):(e=_e(t[1]),n=e),{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if("@"===t[2])e=_e(t[0]),n="mailto:"+e;else{let i;do{i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??""}while(i!==t[0]);e=_e(t[0]),n="www."===t[1]?"http://"+t[0]:t[0]}return{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let e;return e=this.lexer.state.inRawBlock?t[0]:_e(t[0]),{type:"text",raw:t[0],text:e}}}}const De=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,ze=/(?:[*+-]|\d{1,9}[.)])/,Me=Te(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,ze).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),Pe=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Le=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Ue=Te(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",Le).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Fe=Te(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,ze).getRegex(),je="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",He=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Be=Te("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",He).replace("tag",je).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),qe=Te(Pe).replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",je).getRegex(),We={blockquote:Te(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",qe).getRegex(),code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,def:Ue,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,hr:De,html:Be,lheading:Me,list:Fe,newline:/^(?: *(?:\n|$))+/,paragraph:qe,table:Oe,text:/^[^\n]+/},Ze=Te("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",je).getRegex(),Ge={...We,table:Ze,paragraph:Te(Pe).replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ze).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",je).getRegex()},Ye={...We,html:Te("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",He).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Oe,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:Te(Pe).replace("hr",De).replace("heading"," *#{1,6} *[^\n]").replace("lheading",Me).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ve=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Je=/^( {2,}|\\)\n(?!\s*$)/,Qe="\\p{P}\\p{S}",Ke=Te(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Qe).getRegex(),Xe=Te(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Qe).getRegex(),et=Te("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Qe).getRegex(),tt=Te("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Qe).getRegex(),nt=Te(/\\([punct])/,"gu").replace(/punct/g,Qe).getRegex(),it=Te(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),st=Te(He).replace("(?:--\x3e|$)","--\x3e").getRegex(),rt=Te("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",st).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ot=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,at=Te(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",ot).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),lt=Te(/^!?\[(label)\]\[(ref)\]/).replace("label",ot).replace("ref",Le).getRegex(),ct=Te(/^!?\[(ref)\](?:\[\])?/).replace("ref",Le).getRegex(),ht={_backpedal:Oe,anyPunctuation:nt,autolink:it,blockSkip:/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,br:Je,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,del:Oe,emStrongLDelim:Xe,emStrongRDelimAst:et,emStrongRDelimUnd:tt,escape:Ve,link:at,nolink:ct,punctuation:Ke,reflink:lt,reflinkSearch:Te("reflink|nolink(?!\\()","g").replace("reflink",lt).replace("nolink",ct).getRegex(),tag:rt,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,url:Oe},dt={...ht,link:Te(/^!?\[(label)\]\((.*?)\)/).replace("label",ot).getRegex(),reflink:Te(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ot).getRegex()},pt={...ht,escape:Te(Ve).replace("])","~|])").getRegex(),url:Te(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},ut={...pt,br:Te(Je).replace("{2,}","*").getRegex(),text:Te(pt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},ft={normal:We,gfm:Ge,pedantic:Ye},gt={normal:ht,gfm:pt,breaks:ut,pedantic:dt};class mt{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||ge,this.options.tokenizer=this.options.tokenizer||new Ie,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:ft.normal,inline:gt.normal};this.options.pedantic?(t.block=ft.pedantic,t.inline=gt.pedantic):this.options.gfm&&(t.block=ft.gfm,this.options.breaks?t.inline=gt.breaks:t.inline=gt.gfm),this.tokenizer.rules=t}static get rules(){return{block:ft,inline:gt}}static lex(e,t){return new mt(t).lex(e)}static lexInline(e,t){return new mt(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,"\n"),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){const t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[]){let n,i,s,r;for(e=this.options.pedantic?e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e.replace(/^( *)(\t+)/gm,(e,t,n)=>t+"    ".repeat(n.length));e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(i=>!!(n=i.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0))))if(n=this.tokenizer.space(e))e=e.substring(n.raw.length),1===n.raw.length&&t.length>0?t[t.length-1].raw+="\n":t.push(n);else if(n=this.tokenizer.code(e))e=e.substring(n.raw.length),i=t[t.length-1],!i||"paragraph"!==i.type&&"text"!==i.type?t.push(n):(i.raw+="\n"+n.raw,i.text+="\n"+n.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text);else if(n=this.tokenizer.fences(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.heading(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.hr(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.blockquote(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.list(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.html(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.def(e))e=e.substring(n.raw.length),i=t[t.length-1],!i||"paragraph"!==i.type&&"text"!==i.type?this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title}):(i.raw+="\n"+n.raw,i.text+="\n"+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text);else if(n=this.tokenizer.table(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.lheading(e))e=e.substring(n.raw.length),t.push(n);else{if(s=e,this.options.extensions&&this.options.extensions.startBlock){let t=1/0;const n=e.slice(1);let i;this.options.extensions.startBlock.forEach(e=>{i=e.call({lexer:this},n),"number"==typeof i&&i>=0&&(t=Math.min(t,i))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(this.state.top&&(n=this.tokenizer.paragraph(s)))i=t[t.length-1],r&&"paragraph"===i.type?(i.raw+="\n"+n.raw,i.text+="\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n),r=s.length!==e.length,e=e.substring(n.raw.length);else if(n=this.tokenizer.text(e))e=e.substring(n.raw.length),i=t[t.length-1],i&&"text"===i.type?(i.raw+="\n"+n.raw,i.text+="\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,i,s,r,o,a,l=e;if(this.tokens.links){const e=Object.keys(this.tokens.links);if(e.length>0)for(;null!=(r=this.tokenizer.rules.inline.reflinkSearch.exec(l));)e.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(l=l.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+l.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;null!=(r=this.tokenizer.rules.inline.blockSkip.exec(l));)l=l.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+l.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;null!=(r=this.tokenizer.rules.inline.anyPunctuation.exec(l));)l=l.slice(0,r.index)+"++"+l.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(o||(a=""),o=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(i=>!!(n=i.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0))))if(n=this.tokenizer.escape(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.tag(e))e=e.substring(n.raw.length),i=t[t.length-1],i&&"text"===n.type&&"text"===i.type?(i.raw+=n.raw,i.text+=n.text):t.push(n);else if(n=this.tokenizer.link(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.reflink(e,this.tokens.links))e=e.substring(n.raw.length),i=t[t.length-1],i&&"text"===n.type&&"text"===i.type?(i.raw+=n.raw,i.text+=n.text):t.push(n);else if(n=this.tokenizer.emStrong(e,l,a))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.codespan(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.br(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.del(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.autolink(e))e=e.substring(n.raw.length),t.push(n);else if(this.state.inLink||!(n=this.tokenizer.url(e))){if(s=e,this.options.extensions&&this.options.extensions.startInline){let t=1/0;const n=e.slice(1);let i;this.options.extensions.startInline.forEach(e=>{i=e.call({lexer:this},n),"number"==typeof i&&i>=0&&(t=Math.min(t,i))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(n=this.tokenizer.inlineText(s))e=e.substring(n.raw.length),"_"!==n.raw.slice(-1)&&(a=n.raw.slice(-1)),o=!0,i=t[t.length-1],i&&"text"===i.type?(i.raw+=n.raw,i.text+=n.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}else e=e.substring(n.raw.length),t.push(n);return t}}class bt{options;constructor(e){this.options=e||ge}code(e,t,n){const i=(t||"").match(/^\S*/)?.[0];return e=e.replace(/\n$/,"")+"\n",i?'<pre><code class="language-'+_e(i)+'">'+(n?e:_e(e,!0))+"</code></pre>\n":"<pre><code>"+(n?e:_e(e,!0))+"</code></pre>\n"}blockquote(e){return`<blockquote>\n${e}</blockquote>\n`}html(e,t){return e}heading(e,t,n){return`<h${t}>${e}</h${t}>\n`}hr(){return"<hr>\n"}list(e,t,n){const i=t?"ol":"ul";return"<"+i+(t&&1!==n?' start="'+n+'"':"")+">\n"+e+"</"+i+">\n"}listitem(e,t,n){return`<li>${e}</li>\n`}checkbox(e){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph(e){return`<p>${e}</p>\n`}table(e,t){return t&&(t=`<tbody>${t}</tbody>`),"<table>\n<thead>\n"+e+"</thead>\n"+t+"</table>\n"}tablerow(e){return`<tr>\n${e}</tr>\n`}tablecell(e,t){const n=t.header?"th":"td";return(t.align?`<${n} align="${t.align}">`:`<${n}>`)+e+`</${n}>\n`}strong(e){return`<strong>${e}</strong>`}em(e){return`<em>${e}</em>`}codespan(e){return`<code>${e}</code>`}br(){return"<br>"}del(e){return`<del>${e}</del>`}link(e,t,n){const i=Ee(e);if(null===i)return n;let s='<a href="'+(e=i)+'"';return t&&(s+=' title="'+t+'"'),s+=">"+n+"</a>",s}image(e,t,n){const i=Ee(e);if(null===i)return n;let s=`<img src="${e=i}" alt="${n}"`;return t&&(s+=` title="${t}"`),s+=">",s}text(e){return e}}class xt{strong(e){return e}em(e){return e}codespan(e){return e}del(e){return e}html(e){return e}text(e){return e}link(e,t,n){return""+n}image(e,t,n){return""+n}br(){return""}}class yt{options;renderer;textRenderer;constructor(e){this.options=e||ge,this.options.renderer=this.options.renderer||new bt,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new xt}static parse(e,t){return new yt(t).parse(e)}static parseInline(e,t){return new yt(t).parseInline(e)}parse(e,t=!0){let n="";for(let i=0;i<e.length;i++){const s=e[i];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const e=s,t=this.options.extensions.renderers[e.type].call({parser:this},e);if(!1!==t||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(e.type)){n+=t||"";continue}}switch(s.type){case"space":continue;case"hr":n+=this.renderer.hr();continue;case"heading":{const e=s;n+=this.renderer.heading(this.parseInline(e.tokens),e.depth,Ae(this.parseInline(e.tokens,this.textRenderer)));continue}case"code":{const e=s;n+=this.renderer.code(e.text,e.lang,!!e.escaped);continue}case"table":{const e=s;let t="",i="";for(let t=0;t<e.header.length;t++)i+=this.renderer.tablecell(this.parseInline(e.header[t].tokens),{header:!0,align:e.align[t]});t+=this.renderer.tablerow(i);let r="";for(let t=0;t<e.rows.length;t++){const n=e.rows[t];i="";for(let t=0;t<n.length;t++)i+=this.renderer.tablecell(this.parseInline(n[t].tokens),{header:!1,align:e.align[t]});r+=this.renderer.tablerow(i)}n+=this.renderer.table(t,r);continue}case"blockquote":{const e=s,t=this.parse(e.tokens);n+=this.renderer.blockquote(t);continue}case"list":{const e=s,t=e.ordered,i=e.start,r=e.loose;let o="";for(let t=0;t<e.items.length;t++){const n=e.items[t],i=n.checked,s=n.task;let a="";if(n.task){const e=this.renderer.checkbox(!!i);r?n.tokens.length>0&&"paragraph"===n.tokens[0].type?(n.tokens[0].text=e+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&"text"===n.tokens[0].tokens[0].type&&(n.tokens[0].tokens[0].text=e+" "+n.tokens[0].tokens[0].text)):n.tokens.unshift({type:"text",text:e+" "}):a+=e+" "}a+=this.parse(n.tokens,r),o+=this.renderer.listitem(a,s,!!i)}n+=this.renderer.list(o,t,i);continue}case"html":{const e=s;n+=this.renderer.html(e.text,e.block);continue}case"paragraph":{const e=s;n+=this.renderer.paragraph(this.parseInline(e.tokens));continue}case"text":{let r=s,o=r.tokens?this.parseInline(r.tokens):r.text;for(;i+1<e.length&&"text"===e[i+1].type;)r=e[++i],o+="\n"+(r.tokens?this.parseInline(r.tokens):r.text);n+=t?this.renderer.paragraph(o):o;continue}default:{const e='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let i=0;i<e.length;i++){const s=e[i];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const e=this.options.extensions.renderers[s.type].call({parser:this},s);if(!1!==e||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){n+=e||"";continue}}switch(s.type){case"escape":{const e=s;n+=t.text(e.text);break}case"html":{const e=s;n+=t.html(e.text);break}case"link":{const e=s;n+=t.link(e.href,e.title,this.parseInline(e.tokens,t));break}case"image":{const e=s;n+=t.image(e.href,e.title,e.text);break}case"strong":{const e=s;n+=t.strong(this.parseInline(e.tokens,t));break}case"em":{const e=s;n+=t.em(this.parseInline(e.tokens,t));break}case"codespan":{const e=s;n+=t.codespan(e.text);break}case"br":n+=t.br();break;case"del":{const e=s;n+=t.del(this.parseInline(e.tokens,t));break}case"text":{const e=s;n+=t.text(e.text);break}default:{const e='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}}class kt{options;constructor(e){this.options=e||ge}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}const vt=new class{defaults={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};options=this.setOptions;parse=this.#e(mt.lex,yt.parse);parseInline=this.#e(mt.lexInline,yt.parseInline);Parser=yt;Renderer=bt;TextRenderer=xt;Lexer=mt;Tokenizer=Ie;Hooks=kt;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(const i of e)switch(n=n.concat(t.call(this,i)),i.type){case"table":{const e=i;for(const i of e.header)n=n.concat(this.walkTokens(i.tokens,t));for(const i of e.rows)for(const e of i)n=n.concat(this.walkTokens(e.tokens,t));break}case"list":{const e=i;n=n.concat(this.walkTokens(e.items,t));break}default:{const e=i;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(i=>{const s=e[i].flat(1/0);n=n.concat(this.walkTokens(s,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{const n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw new Error("extension name required");if("renderer"in e){const n=t.renderers[e.name];t.renderers[e.name]=n?function(...t){let i=e.renderer.apply(this,t);return!1===i&&(i=n.apply(this,t)),i}:e.renderer}if("tokenizer"in e){if(!e.level||"block"!==e.level&&"inline"!==e.level)throw new Error("extension level must be 'block' or 'inline'");const n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&("block"===e.level?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:"inline"===e.level&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}"childTokens"in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){const t=this.defaults.renderer||new bt(this.defaults);for(const n in e.renderer){if(!(n in t))throw new Error(`renderer '${n}' does not exist`);if("options"===n)continue;const i=n,s=e.renderer[i],r=t[i];t[i]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=r.apply(t,e)),n||""}}n.renderer=t}if(e.tokenizer){const t=this.defaults.tokenizer||new Ie(this.defaults);for(const n in e.tokenizer){if(!(n in t))throw new Error(`tokenizer '${n}' does not exist`);if(["options","rules","lexer"].includes(n))continue;const i=n,s=e.tokenizer[i],r=t[i];t[i]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=r.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){const t=this.defaults.hooks||new kt;for(const n in e.hooks){if(!(n in t))throw new Error(`hook '${n}' does not exist`);if("options"===n)continue;const i=n,s=e.hooks[i],r=t[i];kt.passThroughHooks.has(n)?t[i]=e=>{if(this.defaults.async)return Promise.resolve(s.call(t,e)).then(e=>r.call(t,e));const n=s.call(t,e);return r.call(t,n)}:t[i]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=r.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){const t=this.defaults.walkTokens,i=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(i.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return mt.lex(e,t??this.defaults)}parser(e,t){return yt.parse(e,t??this.defaults)}#e(e,t){return(n,i)=>{const s={...i},r={...this.defaults,...s};!0===this.defaults.async&&!1===s.async&&(r.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),r.async=!0);const o=this.#t(!!r.silent,!!r.async);if(null==n)return o(new Error("marked(): input parameter is undefined or null"));if("string"!=typeof n)return o(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(r.hooks&&(r.hooks.options=r),r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(n):n).then(t=>e(t,r)).then(e=>r.hooks?r.hooks.processAllTokens(e):e).then(e=>r.walkTokens?Promise.all(this.walkTokens(e,r.walkTokens)).then(()=>e):e).then(e=>t(e,r)).then(e=>r.hooks?r.hooks.postprocess(e):e).catch(o);try{r.hooks&&(n=r.hooks.preprocess(n));let i=e(n,r);r.hooks&&(i=r.hooks.processAllTokens(i)),r.walkTokens&&this.walkTokens(i,r.walkTokens);let s=t(i,r);return r.hooks&&(s=r.hooks.postprocess(s)),s}catch(e){return o(e)}}}#t(e,t){return n=>{if(n.message+="\nPlease report this to https://github.com/markedjs/marked.",e){const e="<p>An error occurred:</p><pre>"+_e(n.message+"",!0)+"</pre>";return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function wt(e,t){return vt.parse(e,t)}function _t(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=Array(t);n<t;n++)i[n]=e[n];return i}function $t(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var i,s,r,o,a=[],l=!0,c=!1;try{if(r=(n=n.call(e)).next,0===t);else for(;!(l=(i=r.call(n)).done)&&(a.push(i.value),a.length!==t);l=!0);}catch(e){c=!0,s=e}finally{try{if(!l&&null!=n.return&&(o=n.return(),Object(o)!==o))return}finally{if(c)throw s}}return a}}(e,t)||function(e,t){if(e){if("string"==typeof e)return _t(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_t(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}wt.options=wt.setOptions=function(e){return vt.setOptions(e),wt.defaults=vt.defaults,me(wt.defaults),wt},wt.getDefaults=fe,wt.defaults=ge,wt.use=function(...e){return vt.use(...e),wt.defaults=vt.defaults,me(wt.defaults),wt},wt.walkTokens=function(e,t){return vt.walkTokens(e,t)},wt.parseInline=vt.parseInline,wt.Parser=yt,wt.parser=yt.parse,wt.Renderer=bt,wt.TextRenderer=xt,wt.Lexer=mt,wt.lexer=mt.lex,wt.Tokenizer=Ie,wt.Hooks=kt,wt.parse=wt,wt.options,wt.setOptions,wt.use,wt.walkTokens,wt.parseInline,yt.parse,mt.lex;const At=Object.entries,St=Object.setPrototypeOf,Tt=Object.isFrozen,Et=Object.getPrototypeOf,Ot=Object.getOwnPropertyDescriptor;let Ct=Object.freeze,Rt=Object.seal,Nt=Object.create,It="undefined"!=typeof Reflect&&Reflect,Dt=It.apply,zt=It.construct;Ct||(Ct=function(e){return e}),Rt||(Rt=function(e){return e}),Dt||(Dt=function(e,t){for(var n=arguments.length,i=new Array(n>2?n-2:0),s=2;s<n;s++)i[s-2]=arguments[s];return e.apply(t,i)}),zt||(zt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];return new e(...n)});const Mt=sn(Array.prototype.forEach),Pt=sn(Array.prototype.lastIndexOf),Lt=sn(Array.prototype.pop),Ut=sn(Array.prototype.push),Ft=sn(Array.prototype.splice),jt=Array.isArray,Ht=sn(String.prototype.toLowerCase),Bt=sn(String.prototype.toString),qt=sn(String.prototype.match),Wt=sn(String.prototype.replace),Zt=sn(String.prototype.indexOf),Gt=sn(String.prototype.trim),Yt=sn(Number.prototype.toString),Vt=sn(Boolean.prototype.toString),Jt="undefined"==typeof BigInt?null:sn(BigInt.prototype.toString),Qt="undefined"==typeof Symbol?null:sn(Symbol.prototype.toString),Kt=sn(Object.prototype.hasOwnProperty),Xt=sn(Object.prototype.toString),en=sn(RegExp.prototype.test),tn=(nn=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return zt(nn,t)});var nn;function sn(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,i=new Array(n>1?n-1:0),s=1;s<n;s++)i[s-1]=arguments[s];return Dt(e,t,i)}}function rn(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Ht;if(St&&St(e,null),!jt(t))return e;let i=t.length;for(;i--;){let s=t[i];if("string"==typeof s){const e=n(s);e!==s&&(Tt(t)||(t[i]=e),s=e)}e[s]=!0}return e}function on(e){for(let t=0;t<e.length;t++){Kt(e,t)||(e[t]=null)}return e}function an(e){const t=Nt(null);for(const i of At(e)){var n=$t(i,2);const s=n[0],r=n[1];Kt(e,s)&&(jt(r)?t[s]=on(r):r&&"object"==typeof r&&r.constructor===Object?t[s]=an(r):t[s]=r)}return t}function ln(e,t){for(;null!==e;){const n=Ot(e,t);if(n){if(n.get)return sn(n.get);if("function"==typeof n.value)return sn(n.value)}e=Et(e)}return function(){return null}}const cn=Ct(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),hn=Ct(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),dn=Ct(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),pn=Ct(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),un=Ct(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),fn=Ct(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),gn=Ct(["#text"]),mn=Ct(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),bn=Ct(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dominant-baseline","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-orientation","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),xn=Ct(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),yn=Ct(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),kn=Rt(/{{[\w\W]*|^[\w\W]*}}/g),vn=Rt(/<%[\w\W]*|^[\w\W]*%>/g),wn=Rt(/\${[\w\W]*/g),_n=Rt(/^data-[\-\w.\u00B7-\uFFFF]+$/),$n=Rt(/^aria-[\-\w]+$/),An=Rt(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Sn=Rt(/^(?:\w+script|data):/i),Tn=Rt(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),En=Rt(/^html$/i),On=Rt(/^[a-z][.\w]*(-[.\w]+)+$/i),Cn=Rt(/<[/\w!]/g),Rn=Rt(/<[/\w]/g),Nn=Rt(/<\/no(script|embed|frames)/i),In=Rt(/\/>/i),Dn=1,zn=3,Mn=7,Pn=8,Ln=9,Un=11,Fn=function(){return"undefined"==typeof window?null:window},jn=function(e,t,n,i){return Kt(e,t)&&jt(e[t])?rn(i.base?an(i.base):{},e[t],i.transform):n};var Hn=function e(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:Fn();const n=t=>e(t);if(n.version="3.4.12",n.removed=[],!t||!t.document||t.document.nodeType!==Ln||!t.Element)return n.isSupported=!1,n;let i=t.document;const s=i,r=s.currentScript;t.DocumentFragment;const o=t.HTMLTemplateElement,a=t.Node,l=t.Element,c=t.NodeFilter,h=t.NamedNodeMap;void 0===h&&(t.NamedNodeMap||t.MozNamedAttrMap),t.HTMLFormElement;const d=t.DOMParser,p=t.trustedTypes,u=l.prototype,f=ln(u,"cloneNode"),g=ln(u,"remove"),m=ln(u,"nextSibling"),b=ln(u,"childNodes"),x=ln(u,"parentNode"),y=ln(u,"shadowRoot"),k=ln(u,"attributes"),v=a&&a.prototype?ln(a.prototype,"nodeType"):null,w=a&&a.prototype?ln(a.prototype,"nodeName"):null;if("function"==typeof o){const e=i.createElement("template");e.content&&e.content.ownerDocument&&(i=e.content.ownerDocument)}let _,$,A="",S=!1,T=0;const E=function(){if(T>0)throw tn('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},O=function(e){E(),T++;try{return _.createHTML(e)}finally{T--}},C=function(){return S||($=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let n=null;const i="data-tt-policy-suffix";t&&t.hasAttribute(i)&&(n=t.getAttribute(i));const s="dompurify"+(n?"#"+n:"");try{return e.createPolicy(s,{createHTML:e=>e,createScriptURL:e=>e})}catch(e){return console.warn("TrustedTypes policy "+s+" could not be created."),null}}(p,r),S=!0),$},R=i,N=R.implementation,I=R.createNodeIterator,D=R.createDocumentFragment,z=R.getElementsByTagName,M=s.importNode;let P={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};n.isSupported="function"==typeof At&&"function"==typeof x&&N&&void 0!==N.createHTMLDocument;const L=kn,U=vn,F=wn,j=_n,H=$n,B=Sn,q=Tn,W=On;let Z=An,G=null;const Y=rn({},[...cn,...hn,...dn,...un,...gn]);let V=null;const J=rn({},[...mn,...bn,...xn,...yn]);let Q=Object.seal(Nt(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),K=null,X=null;const ee=Object.seal(Nt(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let te=!0,ne=!0,ie=!1,se=!0,re=!1,oe=!0,ae=!1,le=!1,ce=null,he=null,de=!1,pe=!1,ue=!1,fe=!1,ge=!0,me=!1;const be="user-content-";let xe=!0,ye=!1,ke={},ve=null;const we=rn({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let _e=null;const $e=rn({},["audio","video","img","source","image","track"]);let Ae=null;const Se=rn({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Te="http://www.w3.org/1998/Math/MathML",Ee="http://www.w3.org/2000/svg",Oe="http://www.w3.org/1999/xhtml";let Ce=Oe,Re=!1,Ne=null;const Ie=rn({},[Te,Ee,Oe],Bt),De=Ct(["mi","mo","mn","ms","mtext"]);let ze=rn({},De);const Me=Ct(["annotation-xml"]);let Pe=rn({},Me);const Le=rn({},["title","style","font","a","script"]);let Ue=null;const Fe=["application/xhtml+xml","text/html"];let je=null,He=null;const Be=i.createElement("form"),qe=function(e){return e instanceof RegExp||e instanceof Function},We=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(He&&He===e)return;e&&"object"==typeof e||(e={}),e=an(e),Ue=-1===Fe.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,je="application/xhtml+xml"===Ue?Bt:Ht,G=jn(e,"ALLOWED_TAGS",Y,{transform:je}),V=jn(e,"ALLOWED_ATTR",J,{transform:je}),Ne=jn(e,"ALLOWED_NAMESPACES",Ie,{transform:Bt}),Ae=jn(e,"ADD_URI_SAFE_ATTR",Se,{transform:je,base:Se}),_e=jn(e,"ADD_DATA_URI_TAGS",$e,{transform:je,base:$e}),ve=jn(e,"FORBID_CONTENTS",we,{transform:je}),K=jn(e,"FORBID_TAGS",an({}),{transform:je}),X=jn(e,"FORBID_ATTR",an({}),{transform:je}),ke=!!Kt(e,"USE_PROFILES")&&(e.USE_PROFILES&&"object"==typeof e.USE_PROFILES?an(e.USE_PROFILES):e.USE_PROFILES),te=!1!==e.ALLOW_ARIA_ATTR,ne=!1!==e.ALLOW_DATA_ATTR,ie=e.ALLOW_UNKNOWN_PROTOCOLS||!1,se=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,re=e.SAFE_FOR_TEMPLATES||!1,oe=!1!==e.SAFE_FOR_XML,ae=e.WHOLE_DOCUMENT||!1,pe=e.RETURN_DOM||!1,ue=e.RETURN_DOM_FRAGMENT||!1,fe=e.RETURN_TRUSTED_TYPE||!1,de=e.FORCE_BODY||!1,ge=!1!==e.SANITIZE_DOM,me=e.SANITIZE_NAMED_PROPS||!1,xe=!1!==e.KEEP_CONTENT,ye=e.IN_PLACE||!1,Z=function(e){try{return en(e,""),!0}catch(e){return!1}}(e.ALLOWED_URI_REGEXP)?e.ALLOWED_URI_REGEXP:An,Ce="string"==typeof e.NAMESPACE?e.NAMESPACE:Oe,ze=Kt(e,"MATHML_TEXT_INTEGRATION_POINTS")&&e.MATHML_TEXT_INTEGRATION_POINTS&&"object"==typeof e.MATHML_TEXT_INTEGRATION_POINTS?an(e.MATHML_TEXT_INTEGRATION_POINTS):rn({},De),Pe=Kt(e,"HTML_INTEGRATION_POINTS")&&e.HTML_INTEGRATION_POINTS&&"object"==typeof e.HTML_INTEGRATION_POINTS?an(e.HTML_INTEGRATION_POINTS):rn({},Me);const t=Kt(e,"CUSTOM_ELEMENT_HANDLING")&&e.CUSTOM_ELEMENT_HANDLING&&"object"==typeof e.CUSTOM_ELEMENT_HANDLING?an(e.CUSTOM_ELEMENT_HANDLING):Nt(null);if(Q=Nt(null),Kt(t,"tagNameCheck")&&qe(t.tagNameCheck)&&(Q.tagNameCheck=t.tagNameCheck),Kt(t,"attributeNameCheck")&&qe(t.attributeNameCheck)&&(Q.attributeNameCheck=t.attributeNameCheck),Kt(t,"allowCustomizedBuiltInElements")&&"boolean"==typeof t.allowCustomizedBuiltInElements&&(Q.allowCustomizedBuiltInElements=t.allowCustomizedBuiltInElements),Rt(Q),re&&(ne=!1),ue&&(pe=!0),ke&&(G=rn({},gn),V=Nt(null),!0===ke.html&&(rn(G,cn),rn(V,mn)),!0===ke.svg&&(rn(G,hn),rn(V,bn),rn(V,yn)),!0===ke.svgFilters&&(rn(G,dn),rn(V,bn),rn(V,yn)),!0===ke.mathMl&&(rn(G,un),rn(V,xn),rn(V,yn))),ee.tagCheck=null,ee.attributeCheck=null,Kt(e,"ADD_TAGS")&&("function"==typeof e.ADD_TAGS?ee.tagCheck=e.ADD_TAGS:jt(e.ADD_TAGS)&&(G===Y&&(G=an(G)),rn(G,e.ADD_TAGS,je))),Kt(e,"ADD_ATTR")&&("function"==typeof e.ADD_ATTR?ee.attributeCheck=e.ADD_ATTR:jt(e.ADD_ATTR)&&(V===J&&(V=an(V)),rn(V,e.ADD_ATTR,je))),Kt(e,"ADD_URI_SAFE_ATTR")&&jt(e.ADD_URI_SAFE_ATTR)&&rn(Ae,e.ADD_URI_SAFE_ATTR,je),Kt(e,"FORBID_CONTENTS")&&jt(e.FORBID_CONTENTS)&&(ve===we&&(ve=an(ve)),rn(ve,e.FORBID_CONTENTS,je)),Kt(e,"ADD_FORBID_CONTENTS")&&jt(e.ADD_FORBID_CONTENTS)&&(ve===we&&(ve=an(ve)),rn(ve,e.ADD_FORBID_CONTENTS,je)),xe&&(G["#text"]=!0),ae&&rn(G,["html","head","body"]),G.table&&(rn(G,["tbody"]),delete K.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw tn('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw tn('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const t=_;_=e.TRUSTED_TYPES_POLICY;try{A=O("")}catch(e){throw _=t,e}}else null===e.TRUSTED_TYPES_POLICY?(_=void 0,A=""):(void 0===_&&(_=C()),_&&"string"==typeof A&&(A=O("")));Ct&&Ct(e),He=e},Ze=rn({},[...hn,...dn,...pn]),Ge=rn({},[...un,...fn]),Ye=function(e){let t=x(e);t&&t.tagName||(t={namespaceURI:Ce,tagName:"template"});const n=Ht(e.tagName),i=Ht(t.tagName);return!!Ne[e.namespaceURI]&&(e.namespaceURI===Ee?function(e,t,n){return t.namespaceURI===Oe?"svg"===e:t.namespaceURI===Te?"svg"===e&&("annotation-xml"===n||ze[n]):Boolean(Ze[e])}(n,t,i):e.namespaceURI===Te?function(e,t,n){return t.namespaceURI===Oe?"math"===e:t.namespaceURI===Ee?"math"===e&&Pe[n]:Boolean(Ge[e])}(n,t,i):e.namespaceURI===Oe?function(e,t,n){return!(t.namespaceURI===Ee&&!Pe[n])&&!(t.namespaceURI===Te&&!ze[n])&&!Ge[e]&&(Le[e]||!Ze[e])}(n,t,i):!("application/xhtml+xml"!==Ue||!Ne[e.namespaceURI]))},Ve=function(e){Ut(n.removed,{element:e});try{x(e).removeChild(e)}catch(t){if(g(e),!x(e))throw tn("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},Je=function(e){Xe(e);const t=b(e);if(t){const e=[];Mt(t,t=>{Ut(e,t)}),Mt(e,e=>{try{g(e)}catch(e){}})}const n=k(e);if(n)for(let t=n.length-1;t>=0;--t){const i=n[t],s=i&&i.name;if("string"==typeof s)try{e.removeAttribute(s)}catch(e){}}},Qe=function(e,t){try{Ut(n.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){Ut(n.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e)if(pe||ue)try{Ve(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},Ke=function(e){const t=k(e);if(t)for(let n=t.length-1;n>=0;--n){const i=t[n],s=i&&i.name;if("string"==typeof s&&!V[je(s)])try{e.removeAttribute(s)}catch(e){}}},Xe=function(e){const t=[e];for(;t.length>0;){const e=t.pop();(v?v(e):e.nodeType)===Dn&&Ke(e);const n=b(e);if(n)for(let e=n.length-1;e>=0;--e)t.push(n[e])}},et=function(e){let t=null,n=null;if(de)e="<remove></remove>"+e;else{const t=qt(e,/^[\r\n\t ]+/);n=t&&t[0]}"application/xhtml+xml"===Ue&&Ce===Oe&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");const s=_?O(e):e;if(Ce===Oe)try{t=(new d).parseFromString(s,Ue)}catch(e){}if(!t||!t.documentElement){t=N.createDocument(Ce,"template",null);try{t.documentElement.innerHTML=Re?A:s}catch(e){}}const r=t.body||t.documentElement;return e&&n&&r.insertBefore(i.createTextNode(n),r.childNodes[0]||null),Ce===Oe?z.call(t,ae?"html":"body")[0]:ae?t.documentElement:r},tt=function(e){return I.call(e.ownerDocument||e,e,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},nt=function(e){return e=Wt(e,L," "),e=Wt(e,U," "),e=Wt(e,F," ")},it=function(e){var t;e.normalize();const n=I.call(e.ownerDocument||e,e,c.SHOW_TEXT|c.SHOW_COMMENT|c.SHOW_CDATA_SECTION|c.SHOW_PROCESSING_INSTRUCTION,null);let i=n.nextNode();for(;i;)i.data=nt(i.data),i=n.nextNode();const s=null===(t=e.querySelectorAll)||void 0===t?void 0:t.call(e,"template");s&&Mt(s,e=>{rt(e.content)&&it(e.content)})},st=function(e){const t=w?w(e):null;return"string"==typeof t&&("form"===je(t)&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||e.attributes!==k(e)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes||e.nodeType!==v(e)||e.childNodes!==b(e)))},rt=function(e){if(!v||"object"!=typeof e||null===e)return!1;try{return v(e)===Un}catch(e){return!1}},ot=function(e){if(!v||"object"!=typeof e||null===e)return!1;try{return"number"==typeof v(e)}catch(e){return!1}};function at(e,t,i){0!==e.length&&Mt(e,e=>{e.call(n,t,i,He)})}const lt=function(e,t){if(at(P.beforeSanitizeElements,e,null),e!==t&&null===x(e))return!0;if(st(e))return Ve(e),!0;const i=je(w?w(e):e.nodeName);if(at(P.uponSanitizeElement,e,{tagName:i,allowedTags:G}),e!==t&&null===x(e))return!0;if(function(e,t){return!!(oe&&e.hasChildNodes()&&!ot(e.firstElementChild)&&en(Cn,e.textContent)&&en(Cn,e.innerHTML))||!(!oe||e.namespaceURI!==Oe||"style"!==t||!ot(e.firstElementChild))||e.nodeType===Mn||!(!oe||e.nodeType!==Pn||!en(Rn,e.data))}(e,i))return Ve(e),!0;if(K[i]||!(ee.tagCheck instanceof Function&&ee.tagCheck(i))&&!G[i]){const t=function(e,t){if(!K[t]&&dt(t)){if(Q.tagNameCheck instanceof RegExp&&en(Q.tagNameCheck,t))return!1;if(Q.tagNameCheck instanceof Function&&Q.tagNameCheck(t))return!1}if(xe&&!ve[t]){const t=x(e),n=b(e);if(n&&t)for(let i=n.length-1;i>=0;--i){const s=ye?n[i]:f(n[i],!0);t.insertBefore(s,m(e))}}return Ve(e),!0}(e,i);return!1===t&&at(P.afterSanitizeElements,e,null),t}if((v?v(e):e.nodeType)===Dn&&!Ye(e))return Ve(e),!0;if(("noscript"===i||"noembed"===i||"noframes"===i)&&en(Nn,e.innerHTML))return Ve(e),!0;if(re&&e.nodeType===zn){const t=nt(e.textContent);e.textContent!==t&&(Ut(n.removed,{element:e.cloneNode()}),e.textContent=t)}return at(P.afterSanitizeElements,e,null),!1},ct=function(e,t,n){if(X[t])return!1;if(oe&&"patchsrc"===t)return!1;if(oe&&"for"===t&&"label"!==e&&"output"!==e)return!1;if(ge&&("id"===t||"name"===t)&&(n in i||n in Be))return!1;const s=V[t]||ee.attributeCheck instanceof Function&&ee.attributeCheck(t,e);if(ne&&en(j,t));else if(te&&en(H,t));else if(s)if(Ae[t]);else if(en(Z,Wt(n,q,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==Zt(n,"data:")||!_e[e]){if(ie&&!en(B,Wt(n,q,"")));else if(n)return!1}else;else if(!(dt(e)&&(Q.tagNameCheck instanceof RegExp&&en(Q.tagNameCheck,e)||Q.tagNameCheck instanceof Function&&Q.tagNameCheck(e))&&(Q.attributeNameCheck instanceof RegExp&&en(Q.attributeNameCheck,t)||Q.attributeNameCheck instanceof Function&&Q.attributeNameCheck(t,e))||"is"===t&&Q.allowCustomizedBuiltInElements&&(Q.tagNameCheck instanceof RegExp&&en(Q.tagNameCheck,n)||Q.tagNameCheck instanceof Function&&Q.tagNameCheck(n))))return!1;return!0},ht=rn({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),dt=function(e){return!ht[Ht(e)]&&en(W,e)},pt=function(e,t,n,i){if(_&&"object"==typeof p&&"function"==typeof p.getAttributeType&&!n)switch(p.getAttributeType(e,t)){case"TrustedHTML":return O(i);case"TrustedScriptURL":return function(e){E(),T++;try{return _.createScriptURL(e)}finally{T--}}(i)}return i},ut=function(e,t,i,s){try{i?e.setAttributeNS(i,t,s):e.setAttribute(t,s),st(e)?Ve(e):Lt(n.removed)}catch(n){Qe(t,e)}},ft=function(e){at(P.beforeSanitizeAttributes,e,null);const t=e.attributes;if(!t||st(e))return;const n={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:V,forceKeepAttr:void 0};let i=t.length;const s=je(e.nodeName);for(;i--;){const r=t[i],o=r.name,a=r.namespaceURI,l=r.value,c=je(o),h=l;let d="value"===o?h:Gt(h);n.attrName=c,n.attrValue=d,n.keepAttr=!0,n.forceKeepAttr=void 0,at(P.uponSanitizeAttribute,e,n),d=n.attrValue,!me||"id"!==c&&"name"!==c||0===Zt(d,be)||(Qe(o,e),d=be+d),oe&&en(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,d)?Qe(o,e):"attributename"===c&&qt(d,"href")?Qe(o,e):n.forceKeepAttr||(n.keepAttr&&(se||!en(In,d))?(re&&(d=nt(d)),ct(s,c,d)?(d=pt(s,c,a,d),d!==h&&ut(e,o,a,d)):Qe(o,e)):Qe(o,e))}at(P.afterSanitizeAttributes,e,null)},gt=function(e){let t=null;const n=tt(e);for(at(P.beforeSanitizeShadowDOM,e,null);t=n.nextNode();){at(P.uponSanitizeShadowNode,t,null),lt(t,e),ft(t),rt(t.content)&&gt(t.content);if((v?v(t):t.nodeType)===Dn){const e=y(t);rt(e)&&(mt(e),gt(e))}}at(P.afterSanitizeShadowDOM,e,null)},mt=function(e){const t=[{node:e,shadow:null}];for(;t.length>0;){const e=t.pop();if(e.shadow){gt(e.shadow);continue}const n=e.node,i=(v?v(n):n.nodeType)===Dn,s=b(n);if(s)for(let e=s.length-1;e>=0;--e)t.push({node:s[e],shadow:null});if(i){const e=w?w(n):null;if("string"==typeof e&&"template"===je(e)){const e=n.content;rt(e)&&t.push({node:e,shadow:null})}}if(i){const e=y(n);rt(e)&&t.push({node:null,shadow:e},{node:e,shadow:null})}}};return n.sanitize=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=null,r=null,o=null,a=null;if(Re=!e,Re&&(e="\x3c!--\x3e"),"string"!=typeof e&&!ot(e)&&"string"!=typeof(e=function(e){switch(typeof e){case"string":return e;case"number":return Yt(e);case"boolean":return Vt(e);case"bigint":return Jt?Jt(e):"0";case"symbol":return Qt?Qt(e):"Symbol()";case"undefined":default:return Xt(e);case"function":case"object":{if(null===e)return Xt(e);const t=e,n=ln(t,"toString");if("function"==typeof n){const e=n(t);return"string"==typeof e?e:Xt(e)}return Xt(e)}}}(e)))throw tn("dirty is not a string, aborting");if(!n.isSupported)return e;le?(G=ce,V=he):We(t),(P.uponSanitizeElement.length>0||P.uponSanitizeAttribute.length>0)&&(G=an(G)),P.uponSanitizeAttribute.length>0&&(V=an(V)),n.removed=[];const l=ye&&"string"!=typeof e&&ot(e);if(l){!function(e){if(!oe)return;const t=[e];for(;t.length>0;){const e=t.pop(),n=v?v(e):e.nodeType;if(n===Mn||n===Pn&&en(Rn,e.data)){try{g(e)}catch(e){}continue}if(n===Dn){const t=e,n=je(w?w(e):e.nodeName);try{t.hasAttribute&&t.hasAttribute("patchsrc")&&t.removeAttribute("patchsrc"),t.hasAttribute&&t.hasAttribute("for")&&"label"!==n&&"output"!==n&&t.removeAttribute("for")}catch(e){}}const i=b(e);if(i)for(let e=i.length-1;e>=0;--e)t.push(i[e])}}(e);const t=w?w(e):e.nodeName;if("string"==typeof t){const n=je(t);if(!G[n]||K[n])throw Je(e),tn("root node is forbidden and cannot be sanitized in-place")}if(st(e))throw Je(e),tn("root node is clobbered and cannot be sanitized in-place");try{mt(e)}catch(t){throw Je(e),t}}else if(ot(e))i=et("\x3c!----\x3e"),r=i.ownerDocument.importNode(e,!0),r.nodeType===Dn&&"BODY"===r.nodeName||"HTML"===r.nodeName?i=r:i.appendChild(r),mt(r);else{if(!pe&&!re&&!ae&&-1===e.indexOf("<"))return _&&fe?O(e):e;if(i=et(e),!i)return pe?null:fe?A:""}i&&de&&Ve(i.firstChild);const c=l?e:i,h=tt(c);try{for(;o=h.nextNode();)lt(o,c),ft(o),rt(o.content)&&gt(o.content)}catch(t){throw l&&(Je(e),Mt(n.removed,e=>{e.element&&Xe(e.element)})),t}if(l)return Mt(n.removed,e=>{e.element&&Xe(e.element)}),re&&it(e),e;if(pe){if(re&&it(i),ue)for(a=D.call(i.ownerDocument);i.firstChild;)a.appendChild(i.firstChild);else a=i;return(V.shadowroot||V.shadowrootmode)&&(a=M.call(s,a,!0)),a}let d=ae?i.outerHTML:i.innerHTML;return ae&&G["!doctype"]&&i.ownerDocument&&i.ownerDocument.doctype&&i.ownerDocument.doctype.name&&en(En,i.ownerDocument.doctype.name)&&(d="<!DOCTYPE "+i.ownerDocument.doctype.name+">\n"+d),re&&(d=nt(d)),_&&fe?O(d):d},n.setConfig=function(){We(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),le=!0,ce=G,he=V},n.clearConfig=function(){He=null,le=!1,ce=null,he=null,_=$,A=""},n.isValidAttribute=function(e,t,n){He||We({});const i=je(e),s=je(t);return ct(i,s,n)},n.addHook=function(e,t){"function"==typeof t&&Kt(P,e)&&Ut(P[e],t)},n.removeHook=function(e,t){if(Kt(P,e)){if(void 0!==t){const n=Pt(P[e],t);return-1===n?void 0:Ft(P[e],n,1)[0]}return Lt(P[e])}},n.removeHooks=function(e){Kt(P,e)&&(P[e]=[])},n.removeAllHooks=function(){P={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},n}();const Bn=e=>{return t=e.conversation_id,n=e.pipeline_run_id,`${t}::${n}`;var t,n},qn=e=>{const t=e?new Date(e).getTime():NaN;return Number.isNaN(t)?0:t},Wn=e=>{const t=new Map,n=[];return e.forEach(e=>{const i=e.conversation_id;let s=t.get(i);s||(s={conversation_id:i,runs:[],latestTimestamp:0},t.set(i,s),n.push(s)),s.runs.push(e);const r=(e=>{const t=qn(e.run_timestamp);return t||qn(e.created_at)})(e);r>s.latestTimestamp&&(s.latestTimestamp=r)}),n.map(e=>{return Object.assign(Object.assign({},e),{runs:(t=e.runs,[...t].sort((e,t)=>{const n=qn(e.run_timestamp)-qn(t.run_timestamp);return 0!==n?n:qn(e.created_at)-qn(t.created_at)}))});var t}).sort((e,t)=>t.latestTimestamp-e.latestTimestamp)},Zn=e=>new Date(e).toLocaleString();let Gn=class extends ae{get toolResultJson(){var e,t;return JSON.stringify(null!==(t=null===(e=this.message.data)||void 0===e?void 0:e.tool_result)&&void 0!==t?t:{},null,2)}render(){var e,t,n,i;const s="user"===this.message.sender,r=null!==(e=this.message.data)&&void 0!==e?e:{},o=null!==(t=r.role)&&void 0!==t?t:this.message.sender,a=null!==(n=r.created)&&void 0!==n?n:this.message.timestamp,l=r.agent_id,c=r.tool_call_id,h=r.tool_name,d=r.tool_result,p=null!==(i=r.content)&&void 0!==i?i:this.message.text,u=[["Role",o],["Created",a],["Agent",l],["Tool Call",c],["Tool Name",h]].filter(([,e])=>null!=e&&""!==e);return B`
            <ha-card class="message ${s?"user":"assistant"}">
                <span class="sender">${o}</span>
                ${u.length?B`
                          <dl class="meta">
                              ${u.map(([e,t])=>B`
                                      <dt>${e}</dt>
                                      <dd>${"Created"===e?Zn(String(t)):t}</dd>
                                  `)}
                          </dl>
                      `:W}
                ${!d&&p?B`<intentsity-markdown class="text" .content=${String(p)}></intentsity-markdown>`:W}
                ${d?B`<div class="metadata">${this.toolResultJson}</div>`:W}
                ${a?B`<span class="time">${Zn(String(a))}</span>`:W}
            </ha-card>
        `}};Gn.styles=o`
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
    `,e([pe({attribute:!1})],Gn.prototype,"message",void 0),Gn=e([ce("intentsity-chat-message")],Gn);let Yn=class extends ae{constructor(){super(...arguments),this.content=""}updated(){var e;const t=wt.parse(null!==(e=this.content)&&void 0!==e?e:"",{breaks:!0,async:!1}),n=Hn.sanitize(t,{USE_PROFILES:{html:!0}}),i=this.renderRoot.querySelector(".markdown");i&&(i.innerHTML=n)}render(){return B`<div class="markdown"></div>`}};Yn.styles=o`
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
    `,e([pe({type:String})],Yn.prototype,"content",void 0),Yn=e([ce("intentsity-markdown")],Yn);let Vn=class extends ae{constructor(){super(...arguments),this.chats=[],this.drafts={},this.errors={},this.saving={},this.expanded={},this.conversationExpanded={},this.correctedOverrides={},this.clipboard=null,this.selectionMode=!1,this.selectedTargets={},this.toastMessage=null,this.toastKind="success",this.exporting=!1,this.dialogOpen=!1,this.dialogchatId=null,this.dialogIndex=null,this.dialogField=null,this.dialogValue=""}willUpdate(e){if(!e.has("chats"))return;const t=Object.assign({},this.drafts),n=Object.assign({},this.expanded),i=Object.assign({},this.conversationExpanded),s=new Set;this.chats.forEach((e,i)=>{var r,o;const a=Bn(e);if(s.add(a),t[a])return;const l=(null===(o=null===(r=e.corrected)||void 0===r?void 0:r.messages)||void 0===o?void 0:o.length)?e.corrected.messages:e.messages.map((e,t)=>{var n;return{id:void 0,corrected_chat_id:void 0,original_message_id:e.id,position:t,timestamp:e.timestamp,sender:e.sender,text:e.text,data:null!==(n=e.data)&&void 0!==n?n:{}}});t[a]=l.map(e=>{var t,n,i;return{corrected_message_id:null!==(t=e.id)&&void 0!==t?t:null,original_message_id:null!==(n=e.original_message_id)&&void 0!==n?n:null,timestamp:e.timestamp,sender:e.sender,text:e.text,dataText:(i=e.data,JSON.stringify(null!=i?i:{},null,2))}}),void 0===n[a]&&(n[a]=0===i)});const r=new Set;Wn(this.chats).forEach((e,t)=>{r.add(e.conversation_id),void 0===i[e.conversation_id]&&(i[e.conversation_id]=0===t)}),Object.keys(t).forEach(e=>{s.has(e)||delete t[e]}),Object.keys(n).forEach(e=>{s.has(e)||delete n[e]}),Object.keys(i).forEach(e=>{r.has(e)||delete i[e]}),this.drafts=t,this.expanded=n,this.conversationExpanded=i,this.selectionMode&&(this.selectedTargets={})}getCorrectedAt(e){var t,n;return null!==(t=this.correctedOverrides[Bn(e)])&&void 0!==t?t:null===(n=e.corrected)||void 0===n?void 0:n.updated_at}showToast(e,t){this.toastMessage=e,this.toastKind=t,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this.toastMessage=null},3e3)}selectionKey(e){return"chat"===e.kind||"corrected_chat"===e.kind?`${e.kind}:${e.conversation_id}:${e.pipeline_run_id}`:"message"===e.kind?`${e.kind}:${e.message_id}`:`${e.kind}:${e.corrected_message_id}`}toggleSelectionMode(){const e=!this.selectionMode;this.selectionMode=e,e||(this.selectedTargets={})}toggleTarget(e){const t=this.selectionKey(e),n=Object.assign({},this.selectedTargets);n[t]?delete n[t]:n[t]=e,this.selectedTargets=n}isSelected(e){return Boolean(this.selectedTargets[this.selectionKey(e)])}async deleteSelected(){if(!this.onDeleteTargets)return;const e=Object.values(this.selectedTargets);if(e.length)try{await this.onDeleteTargets(e),this.showToast("Selected items deleted.","success"),this.selectedTargets={},this.selectionMode=!1}catch(e){this.showToast("Failed to delete selected items.","error")}}focusChat(e){const t=this.renderRoot.querySelector(`ha-card[data-chat-id="${e}"]`);if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});const n=t.querySelector("ha-button");n&&n.focus()}markCorrectedAndAdvance(e){const t=(new Date).toISOString();this.correctedOverrides=Object.assign(Object.assign({},this.correctedOverrides),{[e]:t});const n=this.chats.find(t=>Bn(t)!==e&&!this.getCorrectedAt(t)),i=n?Bn(n):void 0;this.expanded=Object.assign(Object.assign(Object.assign({},this.expanded),{[e]:!1}),i?{[i]:!0}:{}),i&&requestAnimationFrame(()=>this.focusChat(i))}updateDraft(e,t,n){const i=this.drafts[e];if(!i)return;const s=[...i];s[t]=Object.assign(Object.assign({},s[t]),n),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:s})}moveDraft(e,t,n){const i=this.drafts[e];if(!i)return;const s=t+n;if(s<0||s>=i.length)return;const r=[...i],[o]=r.splice(t,1);r.splice(s,0,o),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:r})}addDraft(e){var t;this.insertDraft(e,(null!==(t=this.drafts[e])&&void 0!==t?t:[]).length)}buildEmptyDraft(){return{corrected_message_id:null,original_message_id:null,timestamp:(new Date).toISOString(),sender:"assistant",text:"",dataText:"{}"}}insertDraft(e,t){var n;const i=null!==(n=this.drafts[e])&&void 0!==n?n:[],s=Math.max(0,Math.min(t,i.length)),r=[...i];r.splice(s,0,this.buildEmptyDraft()),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:r})}cloneDraftWithTimestamp(e){return{corrected_message_id:null,original_message_id:null,timestamp:(new Date).toISOString(),sender:e.sender,text:e.text,dataText:e.dataText}}copyDraft(e,t){var n;const i=null===(n=this.drafts[e])||void 0===n?void 0:n[t];i&&(this.clipboard=this.cloneDraftWithTimestamp(i),this.showToast("Message copied.","success"))}insertClipboard(e,t){var n;if(!this.clipboard)return;const i=null!==(n=this.drafts[e])&&void 0!==n?n:[],s=Math.max(0,Math.min(t,i.length)),r=[...i];r.splice(s,0,this.cloneDraftWithTimestamp(this.clipboard)),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:r})}removeDraft(e,t){const n=this.drafts[e];if(!n)return;const i=n.filter((e,n)=>n!==t);this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:i})}async handleSave(e){var t,n;const i=null!==(t=this.drafts[e])&&void 0!==t?t:[],s=[];for(let t=0;t<i.length;t+=1){const r=i[t];try{const e=JSON.parse(r.dataText||"{}");s.push({original_message_id:null!==(n=r.original_message_id)&&void 0!==n?n:null,position:t,timestamp:r.timestamp,sender:r.sender,text:r.text,data:e})}catch(n){return void(this.errors=Object.assign(Object.assign({},this.errors),{[e]:`Invalid JSON in message ${t+1}.`}))}}if(this.errors=Object.assign(Object.assign({},this.errors),{[e]:void 0}),!this.onSaveCorrected)return;this.saving=Object.assign(Object.assign({},this.saving),{[e]:!0});const{conversationId:r,pipelineRunId:o}=(e=>{const[t,n]=e.split("::");return{conversationId:t,pipelineRunId:n}})(e);try{await this.onSaveCorrected(r,o,s),this.showToast("Corrected conversation saved.","success"),this.markCorrectedAndAdvance(e)}catch(t){this.errors=Object.assign(Object.assign({},this.errors),{[e]:"Failed to save corrected conversation."}),this.showToast("Failed to save corrected conversation.","error")}finally{this.saving=Object.assign(Object.assign({},this.saving),{[e]:!1})}}toggleExpanded(e){this.expanded=Object.assign(Object.assign({},this.expanded),{[e]:!this.expanded[e]})}getFirstUserSnippet(e){var t;const n=e.find(e=>"user"===e.sender);if(!n){const t=e.length;return`${t} message${1===t?"":"s"}`}const i=null!==(t=n.text)&&void 0!==t?t:"";return i.length<=100?i:`${i.slice(0,100)}…`}openDialog(e,t,n){var i,s;const r=null===(i=this.drafts[e])||void 0===i?void 0:i[t];if(!r)return;const o="data"===n?this.prettyJson(r.dataText||"{}"):null!==(s=r.text)&&void 0!==s?s:"";this.dialogchatId=e,this.dialogIndex=t,this.dialogField=n,this.dialogValue=o,this.dialogOpen=!0}closeDialog(){this.dialogOpen=!1,this.dialogchatId=null,this.dialogIndex=null,this.dialogField=null,this.dialogValue=""}prettyJson(e){try{const t=JSON.parse(e);return JSON.stringify(t,null,2)}catch(t){return e}}saveDialog(){if(null===this.dialogchatId||null===this.dialogIndex||null===this.dialogField)return void this.closeDialog();const e="data"===this.dialogField?this.prettyJson(this.dialogValue):this.dialogValue;"data"===this.dialogField?this.updateDraft(this.dialogchatId,this.dialogIndex,{dataText:e}):this.updateDraft(this.dialogchatId,this.dialogIndex,{text:e}),this.closeDialog()}toggleConversation(e){this.conversationExpanded=Object.assign(Object.assign({},this.conversationExpanded),{[e]:!this.conversationExpanded[e]})}buildExportFilename(){return`corrected_chats_${(new Date).toISOString().replace(/[:.]/g,"-")}.training.jsonl`}downloadJsonl(e){const t=new Blob([e],{type:"application/jsonl"}),n=URL.createObjectURL(t),i=document.createElement("a");i.href=n,i.download=this.buildExportFilename(),i.click(),URL.revokeObjectURL(n)}async handleExport(){if(this.onExportCorrected){this.exporting=!0;try{const e=await this.onExportCorrected();if(!e||!e.jsonl)return void this.showToast("No corrected chats to export.","error");this.downloadJsonl(e.jsonl),this.showToast(`Downloaded ${e.count} corrected chat${1===e.count?"":"s"}.`,"success")}catch(e){this.showToast("Failed to export corrected chats.","error")}finally{this.exporting=!1}}}render(){if(!this.chats.length)return B`
                <div class="empty-state">
                    <h3>No conversations recorded yet.</h3>
                    <p>When you talk to Home Assistant, logs will appear here.</p>
                </div>
            `;const e=Object.keys(this.selectedTargets).length;return B`
            <div class="selection-bar">
                <ha-button @click=${this.toggleSelectionMode}>
                    <ha-icon icon=${this.selectionMode?"mdi:close-circle":"mdi:checkbox-marked-outline"}></ha-icon>
                    ${this.selectionMode?"Exit selection":"Select"}
                </ha-button>
                ${this.selectionMode?B`
                    <ha-button
                        @click=${()=>{this.deleteSelected()}}
                        ?disabled=${0===e}
                    >
                        <ha-icon icon="mdi:delete"></ha-icon>
                        Delete selected
                    </ha-button>
                    <span class="selection-count">${e} selected</span>
                `:W}
                <span class="selection-spacer"></span>
                <ha-button @click=${()=>{this.handleExport()}} ?disabled=${this.exporting}>
                    <ha-icon icon="mdi:download"></ha-icon>
                    ${this.exporting?"Exporting...":"Download JSONL"}
                </ha-button>
            </div>
            <div class="chat-grid">
                ${Wn(this.chats).map(e=>B`
                    <ha-card>
                        <section class="conversation-group">
                            <div class="conversation-header">
                                <div class="header-row">
                                    <ha-button
                                        @click=${()=>this.toggleConversation(e.conversation_id)}
                                        aria-labelledby=${`conversation-heading-${e.conversation_id}`}
                                    >
                                        <ha-icon
                                            icon=${this.conversationExpanded[e.conversation_id]?"mdi:chevron-up":"mdi:chevron-down"}
                                        ></ha-icon>
                                        ${this.conversationExpanded[e.conversation_id]?"Collapse":"Expand"}
                                    </ha-button>
                                    <h3 id=${`conversation-heading-${e.conversation_id}`}>Conversation ${e.conversation_id}</h3>
                                </div>
                                <span class="conversation-meta">
                                    ${e.runs.length} run${1===e.runs.length?"":"s"}
                                </span>
                            </div>
                            ${this.conversationExpanded[e.conversation_id]?e.runs.map(e=>{var t,n;const i=Bn(e),s=null!==(t=this.expanded[i])&&void 0!==t&&t,r=[...e.messages].sort((e,t)=>{var n,i;const s=qn(e.timestamp)-qn(t.timestamp);return 0!==s?s:(null!==(n=e.id)&&void 0!==n?n:0)-(null!==(i=t.id)&&void 0!==i?i:0)}),o=r.length,a=`${o} message${1===o?"":"s"}`,l=this.getFirstUserSnippet(r),c=this.getCorrectedAt(e),h=Boolean(c);return B`
                                <ha-card class="pipeline-run-card ${h?"corrected-card":""}" data-chat-id=${i}>
                                    <div class="card-content">
                                        <div class="chat-header">
                                            <div class="header-row">
                                                ${this.selectionMode?B`
                                                    <ha-checkbox
                                                        class="select-checkbox"
                                                        .checked=${this.isSelected({kind:"chat",conversation_id:e.conversation_id,pipeline_run_id:e.pipeline_run_id})}
                                                        @change=${()=>this.toggleTarget({kind:"chat",conversation_id:e.conversation_id,pipeline_run_id:e.pipeline_run_id})}
                                                    ></ha-checkbox>
                                                `:W}
                                                <ha-button @click=${()=>this.toggleExpanded(i)}>
                                                    <ha-icon icon=${s?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon>
                                                    ${s?"Collapse":"Expand"}
                                                </ha-button>
                                                <ha-chip-set class="chip-row">
                                                    <ha-assist-chip
                                                        label="Run ${e.pipeline_run_id}"
                                                        hasIcon
                                                    >
                                                        <ha-icon slot="icon" icon="mdi:timeline"></ha-icon>
                                                    </ha-assist-chip>
                                                    <ha-assist-chip
                                                        label="Started ${Zn(e.run_timestamp)} · ${a}"
                                                        hasIcon
                                                    >
                                                        <ha-icon slot="icon" icon="mdi:clock-start"></ha-icon>
                                                    </ha-assist-chip>
                                                    ${h?B`
                                                              <ha-assist-chip label="Corrected ${Zn(c)}" hasIcon>
                                                                  <ha-icon slot="icon" icon="mdi:check-circle"></ha-icon>
                                                              </ha-assist-chip>
                                                          `:W}
                                                </ha-chip-set>
                                                ${s?W:B`<div class="preview">${l}</div>`}
                                            </div>
                                            <span class="time">${Zn(e.created_at)}</span>
                                        </div>
                                        ${s?B`
                                              <div class="comparison">
                                                  <section class="panel">
                                                      <h4>Original</h4>
                                                      <div class="messages-list">
                                                          ${r.map(e=>B`
                                                              <div class="message-row">
                                                                  ${this.selectionMode?B`
                                                                      <ha-checkbox
                                                                          class="select-checkbox"
                                                                          .checked=${void 0!==e.id&&this.isSelected({kind:"message",message_id:e.id})}
                                                                          @change=${()=>void 0!==e.id&&this.toggleTarget({kind:"message",message_id:e.id})}
                                                                      ></ha-checkbox>
                                                                  `:W}
                                                                  <intentsity-chat-message .message=${e}></intentsity-chat-message>
                                                              </div>
                                                          `)}
                                                      </div>
                                                  </section>
                                                  <section class="panel">
                                                      <h4>
                                                          Corrected
                                                          ${this.selectionMode&&e.corrected?B`
                                                              <ha-checkbox
                                                                  class="select-checkbox"
                                                                  .checked=${this.isSelected({kind:"corrected_chat",conversation_id:e.corrected.conversation_id,pipeline_run_id:e.corrected.pipeline_run_id})}
                                                                  @change=${()=>this.toggleTarget({kind:"corrected_chat",conversation_id:e.corrected.conversation_id,pipeline_run_id:e.corrected.pipeline_run_id})}
                                                              ></ha-checkbox>
                                                          `:W}
                                                      </h4>
                                                      ${(null!==(n=this.drafts[i])&&void 0!==n?n:[]).map((e,t)=>B`
                                                          <div class="draft-message">
                                                              <div class="draft-controls">
                                                                  ${this.selectionMode&&e.corrected_message_id?B`
                                                                      <ha-checkbox
                                                                          class="select-checkbox"
                                                                          .checked=${this.isSelected({kind:"corrected_message",corrected_message_id:e.corrected_message_id})}
                                                                          @change=${()=>this.toggleTarget({kind:"corrected_message",corrected_message_id:e.corrected_message_id})}
                                                                      ></ha-checkbox>
                                                                  `:W}
                                                                  <ha-button @click=${()=>this.insertDraft(i,t)}>
                                                                      <ha-icon icon="mdi:plus-box"></ha-icon>
                                                                      Insert above
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.insertClipboard(i,t)} ?disabled=${!this.clipboard}>
                                                                      <ha-icon icon="mdi:content-paste"></ha-icon>
                                                                      Paste above
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.moveDraft(i,t,-1)}>
                                                                      <ha-icon icon="mdi:arrow-up"></ha-icon>
                                                                      Up
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.moveDraft(i,t,1)}>
                                                                      <ha-icon icon="mdi:arrow-down"></ha-icon>
                                                                      Down
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.insertDraft(i,t+1)}>
                                                                      <ha-icon icon="mdi:plus-box-multiple"></ha-icon>
                                                                      Insert below
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.insertClipboard(i,t+1)} ?disabled=${!this.clipboard}>
                                                                      <ha-icon icon="mdi:content-paste"></ha-icon>
                                                                      Paste below
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.copyDraft(i,t)}>
                                                                      <ha-icon icon="mdi:content-copy"></ha-icon>
                                                                      Copy
                                                                  </ha-button>
                                                                  <ha-button @click=${()=>this.removeDraft(i,t)}>
                                                                      <ha-icon icon="mdi:delete"></ha-icon>
                                                                      Remove
                                                                  </ha-button>
                                                                  ${e.original_message_id?B`
                                                                            <ha-chip-set class="chip-row">
                                                                                <ha-assist-chip label="Original #${e.original_message_id}" hasIcon>
                                                                                    <ha-icon slot="icon" icon="mdi:message-text"></ha-icon>
                                                                                </ha-assist-chip>
                                                                            </ha-chip-set>
                                                                        `:B`
                                                                            <ha-chip-set class="chip-row">
                                                                                <ha-assist-chip label="New message" hasIcon>
                                                                                    <ha-icon slot="icon" icon="mdi:plus"></ha-icon>
                                                                                </ha-assist-chip>
                                                                            </ha-chip-set>
                                                                        `}
                                                              </div>
                                                              <ha-textfield
                                                                  label="Sender"
                                                                  .value=${e.sender}
                                                                  @input=${e=>this.updateDraft(i,t,{sender:e.target.value})}
                                                              ></ha-textfield>
                                                              <div class="field-row">
                                                                  <ha-textfield
                                                                      label="Message"
                                                                      .value=${e.text}
                                                                      @input=${e=>this.updateDraft(i,t,{text:e.target.value})}
                                                                      multiline
                                                                  ></ha-textfield>
                                                                  <ha-button @click=${()=>this.openDialog(i,t,"text")}>
                                                                      <ha-icon icon="mdi:pencil"></ha-icon>
                                                                  </ha-button>
                                                              </div>
                                                              <div class="field-row">
                                                                  <ha-textfield
                                                                      label="Metadata (JSON)"
                                                                      .value=${e.dataText}
                                                                      @input=${e=>this.updateDraft(i,t,{dataText:e.target.value})}
                                                                      multiline
                                                                  ></ha-textfield>
                                                                  <ha-button @click=${()=>this.openDialog(i,t,"data")}>
                                                                      <ha-icon icon="mdi:pencil"></ha-icon>
                                                                  </ha-button>
                                                              </div>
                                                          </div>
                                                      `)}
                                                      <div class="save-row">
                                                          <div class="draft-controls">
                                                              <ha-button @click=${()=>this.addDraft(i)}>
                                                                  <ha-icon icon="mdi:plus-circle"></ha-icon>
                                                                  Add message
                                                              </ha-button>
                                                              <ha-button @click=${()=>{var e;return this.insertClipboard(i,(null!==(e=this.drafts[i])&&void 0!==e?e:[]).length)}} ?disabled=${!this.clipboard}>
                                                                  <ha-icon icon="mdi:content-paste"></ha-icon>
                                                                  Paste at end
                                                              </ha-button>
                                                          </div>
                                                          <ha-button
                                                              @click=${()=>{this.handleSave(i)}}
                                                              ?disabled=${this.saving[i]}
                                                          >
                                                              <ha-icon icon="mdi:content-save"></ha-icon>
                                                              ${this.saving[i]?"Saving...":"Save corrections"}
                                                          </ha-button>
                                                      </div>
                                                      ${this.errors[i]?B`<div class="error">${this.errors[i]}</div>`:W}
                                                  </section>
                                              </div>
                                          `:W}
                                    </div>
                                </ha-card>
                            `}):W}
                        </section>
                    </ha-card>
                `)}
            </div>
            ${this.toastMessage?B`
                      <div class="toast ${this.toastKind}">
                          ${this.toastMessage}
                      </div>
                  `:W}
            <ha-dialog
                .open=${this.dialogOpen}
                @closed=${this.closeDialog}
                heading=${"data"===this.dialogField?"Edit metadata (JSON)":"Edit message"}
            >
                <div class="dialog-body">
                    <textarea
                        class="dialog-textarea"
                        rows="12"
                        .value=${this.dialogValue}
                        @input=${e=>{this.dialogValue=e.target.value}}
                    ></textarea>
                </div>
                <ha-button slot="primaryAction" @click=${this.saveDialog}>Save</ha-button>
                <ha-button slot="secondaryAction" @click=${this.closeDialog}>Cancel</ha-button>
            </ha-dialog>
        `}};Vn.styles=[o`
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
            .message-row {
                display: flex;
                gap: 8px;
                align-items: flex-start;
            }
            .select-checkbox {
                margin-top: 10px;
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
            .selection-bar {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            .selection-spacer {
                flex: 1;
            }
            .selection-count {
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
        `],e([pe({attribute:!1})],Vn.prototype,"chats",void 0),e([pe({attribute:!1})],Vn.prototype,"onSaveCorrected",void 0),e([pe({attribute:!1})],Vn.prototype,"onDeleteTargets",void 0),e([pe({attribute:!1})],Vn.prototype,"onExportCorrected",void 0),e([ue()],Vn.prototype,"drafts",void 0),e([ue()],Vn.prototype,"errors",void 0),e([ue()],Vn.prototype,"saving",void 0),e([ue()],Vn.prototype,"expanded",void 0),e([ue()],Vn.prototype,"conversationExpanded",void 0),e([ue()],Vn.prototype,"correctedOverrides",void 0),e([ue()],Vn.prototype,"clipboard",void 0),e([ue()],Vn.prototype,"selectionMode",void 0),e([ue()],Vn.prototype,"selectedTargets",void 0),e([ue()],Vn.prototype,"toastMessage",void 0),e([ue()],Vn.prototype,"toastKind",void 0),e([ue()],Vn.prototype,"exporting",void 0),e([ue()],Vn.prototype,"dialogOpen",void 0),e([ue()],Vn.prototype,"dialogchatId",void 0),e([ue()],Vn.prototype,"dialogIndex",void 0),e([ue()],Vn.prototype,"dialogField",void 0),e([ue()],Vn.prototype,"dialogValue",void 0),Vn=e([ce("intentsity-chat-list")],Vn);let Jn=class extends ae{constructor(){super(...arguments),this.chats=[],this.total=0,this.limit=100,this.offset=0,this.correctedFilter="all",this.daysFilter="",this.startFilter="",this.endFilter="",this.subscriptionHandler=e=>{var t,n,i,s,r,o;this.chats=null!==(i=null!==(n=null===(t=e.event)||void 0===t?void 0:t.chats)&&void 0!==n?n:e.chats)&&void 0!==i?i:[],this.total=null!==(o=null!==(r=null===(s=e.event)||void 0===s?void 0:s.total)&&void 0!==r?r:e.total)&&void 0!==o?o:this.total},this.teardownSubscription=()=>{this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=void 0)}}async getConnection(){return this.connectionPromise||(this.connectionPromise=(async()=>{if(!window.hassConnection)throw new Error("Home Assistant connection unavailable");const{conn:e}=await window.hassConnection;return e})().catch(e=>{throw this.connectionPromise=void 0,e})),this.connectionPromise}async loadChats(){var e,t;const n=await this.getConnection();this.teardownSubscription();const i=this.getStartFilter(),s=this.toApiFilter(this.endFilter),r=await n.sendMessagePromise({type:"intentsity/chats/list",limit:this.limit,offset:this.offset,corrected:this.correctedFilter,start:i,end:s});this.chats=null!==(e=r.chats)&&void 0!==e?e:[],this.total=null!==(t=r.total)&&void 0!==t?t:0,this.unsubscribe=await n.subscribeMessage(this.subscriptionHandler,{type:"intentsity/chats/subscribe",limit:this.limit,offset:this.offset,corrected:this.correctedFilter,start:i,end:s})}async saveCorrected(e,t,n){const i=await this.getConnection();await i.sendMessagePromise({type:"intentsity/chats/corrected/save",conversation_id:e,pipeline_run_id:t,messages:n})}async deleteTargets(e){const t=await this.getConnection();await t.sendMessagePromise({type:"intentsity/chats/tombstone",targets:e})}async exportCorrectedChats(){const e=await this.getConnection(),t=this.getStartFilter(),n=this.toApiFilter(this.endFilter);return e.sendMessagePromise({type:"intentsity/chats/corrected/export",limit:this.limit,start:t,end:n})}firstUpdated(){this.loadChats()}disconnectedCallback(){super.disconnectedCallback(),this.teardownSubscription()}handleLimitChange(e){const t=e.currentTarget;this.limit=(e=>{const t=Number(e),n=Number.isFinite(t)?t:100;return Math.max(1,Math.min(500,n||100))})(t.value),this.offset=0,this.loadChats()}handleCorrectedFilter(e){var t,n,i;const s=e.detail,r=e.currentTarget,o=null!==(i=null!==(n=null!==(t=null==s?void 0:s.value)&&void 0!==t?t:null==r?void 0:r.value)&&void 0!==n?n:null==r?void 0:r.selected)&&void 0!==i?i:"all";this.correctedFilter=o,this.offset=0,this.loadChats()}handleDaysFilter(e){const t=e.currentTarget,n=Number(t.value);this.daysFilter=Number.isInteger(n)&&n>0?String(Math.min(n,3650)):"",this.startFilter="",this.endFilter="",this.offset=0,this.loadChats()}handleStartFilter(e){const t=e.currentTarget;this.startFilter=t.value,this.daysFilter="",this.offset=0,this.loadChats()}handleEndFilter(e){const t=e.currentTarget;this.endFilter=t.value,this.daysFilter="",this.offset=0,this.loadChats()}toApiFilter(e){if(!e)return;const t=new Date(e);return Number.isNaN(t.getTime())?void 0:t.toISOString()}getStartFilter(){if(this.daysFilter){const e=Number(this.daysFilter);if(Number.isInteger(e)&&e>0)return new Date(Date.now()-864e5*e).toISOString()}return this.toApiFilter(this.startFilter)}get page(){return Math.floor(this.offset/this.limit)+1}get pageCount(){return Math.max(1,Math.ceil(this.total/this.limit))}changePage(e){const t=this.offset+e*this.limit;t<0||t>=this.total||(this.offset=t,this.loadChats())}render(){return B`
            <ha-card>
                <div class="card-content">
                    <div class="brand-header">
                        <img class="brand-logo" src="/intentsity_logo.png" alt="Intentsity" />
                        <h1>Intent Review</h1>
                    </div>
                    <p>Observational log of all Home Assistant Assist conversations.</p>

                    <div class="controls">
                        <div class="control-group">
                            <ha-textfield
                                label="Show last"
                                type="number"
                                .value=${String(this.limit)}
                                @change=${this.handleLimitChange}
                            ></ha-textfield>
                            <ha-textfield
                                label="Last N days"
                                type="number"
                                min="1"
                                max="3650"
                                .value=${this.daysFilter}
                                @change=${this.handleDaysFilter}
                            ></ha-textfield>
                            <ha-textfield
                                label="Start"
                                type="datetime-local"
                                .value=${this.startFilter}
                                @change=${this.handleStartFilter}
                            ></ha-textfield>
                            <ha-textfield
                                label="End"
                                type="datetime-local"
                                .value=${this.endFilter}
                                @change=${this.handleEndFilter}
                            ></ha-textfield>
                            <ha-select
                                label="Status"
                                .value=${this.correctedFilter}
                                @selected=${this.handleCorrectedFilter}
                            >
                                <mwc-list-item value="all">All</mwc-list-item>
                                <mwc-list-item value="corrected">Corrected</mwc-list-item>
                                <mwc-list-item value="uncorrected">Uncorrected</mwc-list-item>
                            </ha-select>
                        </div>
                        <span class="control-spacer"></span>
                        <ha-button @click=${()=>{this.loadChats()}}>
                            <ha-icon icon="mdi:refresh"></ha-icon>
                            Refresh
                        </ha-button>
                    </div>
                    <div class="controls">
                        <span>${this.total} conversations, page ${this.page} of ${this.pageCount}</span>
                        <ha-button
                            ?disabled=${0===this.offset}
                            @click=${()=>this.changePage(-1)}
                        >Previous</ha-button>
                        <ha-button
                            ?disabled=${this.offset+this.limit>=this.total}
                            @click=${()=>this.changePage(1)}
                        >Next</ha-button>
                    </div>
                </div>
            </ha-card>

            <intentsity-chat-list
                .chats=${this.chats}
                .onSaveCorrected=${this.saveCorrected.bind(this)}
                .onDeleteTargets=${this.deleteTargets.bind(this)}
                .onExportCorrected=${this.exportCorrectedChats.bind(this)}
            ></intentsity-chat-list>
        `}};Jn.styles=[o`
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

            .brand-header {
                align-items: center;
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                margin-bottom: 8px;
            }

            .brand-logo {
                height: auto;
                max-width: min(320px, 100%);
            }

            .brand-header h1 {
                margin: 0;
            }

            .controls {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            .control-group {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            .control-spacer {
                flex: 1;
                min-width: 12px;
            }
        `],e([ue()],Jn.prototype,"chats",void 0),e([ue()],Jn.prototype,"total",void 0),e([ue()],Jn.prototype,"limit",void 0),e([ue()],Jn.prototype,"offset",void 0),e([ue()],Jn.prototype,"correctedFilter",void 0),e([ue()],Jn.prototype,"daysFilter",void 0),e([ue()],Jn.prototype,"startFilter",void 0),e([ue()],Jn.prototype,"endFilter",void 0),Jn=e([ce("intentsity-panel")],Jn);
