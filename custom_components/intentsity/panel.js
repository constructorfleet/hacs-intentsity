function e(e,t,n,i){var s,r=arguments.length,o=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(o=(r<3?s(o):r>3?s(t,n,o):s(t,n))||o);return r>3&&o&&Object.defineProperty(t,n,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,n=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let r=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(n&&void 0===e){const n=void 0!==t&&1===t.length;n&&(e=s.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&s.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const n=1===e.length?e[0]:t.reduce((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new r(n,e,i)},a=n?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,f=g.trustedTypes,m=f?f.emptyScript:"",b=g.reactiveElementPolyfillSupport,x=(e,t)=>e,k={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},y=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:k,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:s}=h(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const r=i?.call(this);s?.call(this,t),this.requestUpdate(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const e=this.properties,t=[...d(e),...p(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(n)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const n of i){const i=document.createElement("style"),s=t.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=n.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(void 0!==i&&!0===n.reflect){const s=(void 0!==n.converter?.toAttribute?n.converter:k).toAttribute(t,n.type);this._$Em=e,null==s?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=n.getPropertyOptions(i),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:k;this._$Em=i;const r=s.fromAttribute(t,e.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(e,t,n,i=!1,s){if(void 0!==e){const r=this.constructor;if(!1===i&&(s=this[e]),n??=r.getPropertyOptions(e),!((n.hasChanged??y)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:s},r){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==s||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,n,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[x("elementProperties")]=new Map,w[x("finalized")]=new Map,b?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");const _=globalThis,$=e=>e,A=_.trustedTypes,T=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+S,O=`<${C}>`,R=document,N=()=>R.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,I=Array.isArray,z="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,P=/>/g,U=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,H=/"/g,j=/^(?:script|style|textarea|title)$/i,B=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),q=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),Z=new WeakMap,G=R.createTreeWalker(R,129);function V(e,t){if(!I(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(t):t}const Y=(e,t)=>{const n=e.length-1,i=[];let s,r=2===t?"<svg>":3===t?"<math>":"",o=M;for(let t=0;t<n;t++){const n=e[t];let a,l,c=-1,h=0;for(;h<n.length&&(o.lastIndex=h,l=o.exec(n),null!==l);)h=o.lastIndex,o===M?"!--"===l[1]?o=L:void 0!==l[1]?o=P:void 0!==l[2]?(j.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=U):void 0!==l[3]&&(o=U):o===U?">"===l[0]?(o=s??M,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?U:'"'===l[3]?H:F):o===H||o===F?o=U:o===L||o===P?o=M:(o=U,s=void 0);const d=o===U&&e[t+1].startsWith("/>")?" ":"";r+=o===M?n+O:c>=0?(i.push(a),n.slice(0,c)+E+n.slice(c)+S+d):n+S+(-2===c?t:d)}return[V(e,r+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class Q{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let s=0,r=0;const o=e.length-1,a=this.parts,[l,c]=Y(e,t);if(this.el=Q.createElement(l,n),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=G.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(E)){const t=c[r++],n=i.getAttribute(e).split(S),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:s,name:o[2],strings:n,ctor:"."===o[1]?te:"?"===o[1]?ne:"@"===o[1]?ie:ee}),i.removeAttribute(e)}else e.startsWith(S)&&(a.push({type:6,index:s}),i.removeAttribute(e));if(j.test(i.tagName)){const e=i.textContent.split(S),t=e.length-1;if(t>0){i.textContent=A?A.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],N()),G.nextNode(),a.push({type:2,index:++s});i.append(e[t],N())}}}else if(8===i.nodeType)if(i.data===C)a.push({type:2,index:s});else{let e=-1;for(;-1!==(e=i.data.indexOf(S,e+1));)a.push({type:7,index:s}),e+=S.length-1}s++}}static createElement(e,t){const n=R.createElement("template");return n.innerHTML=e,n}}function J(e,t,n=e,i){if(t===q)return t;let s=void 0!==i?n._$Co?.[i]:n._$Cl;const r=D(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(e),s._$AT(e,n,i)),void 0!==i?(n._$Co??=[])[i]=s:n._$Cl=s),void 0!==s&&(t=J(e,s._$AS(e,t.values),s,i)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??R).importNode(t,!0);G.currentNode=i;let s=G.nextNode(),r=0,o=0,a=n[0];for(;void 0!==a;){if(r===a.index){let t;2===a.type?t=new K(s,s.nextSibling,this,e):1===a.type?t=new a.ctor(s,a.name,a.strings,this,e):6===a.type&&(t=new se(s,this,e)),this._$AV.push(t),a=n[++o]}r!==a?.index&&(s=G.nextNode(),r++)}return G.currentNode=R,i}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class K{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),D(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>I(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(R.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=Q.createElement(V(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new X(i,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new Q(e)),t}k(e){I(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const s of e)i===t.length?t.push(n=new K(this.O(N()),this.O(N()),this,this.options)):n=t[i],n._$AI(s),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=W}_$AI(e,t=this,n,i){const s=this.strings;let r=!1;if(void 0===s)e=J(this,e,t,0),r=!D(e)||e!==this._$AH&&e!==q,r&&(this._$AH=e);else{const i=e;let o,a;for(e=s[0],o=0;o<s.length-1;o++)a=J(this,i[n+o],t,o),a===q&&(a=this._$AH[o]),r||=!D(a)||a!==this._$AH[o],a===W?e=W:e!==W&&(e+=(a??"")+s[o+1]),this._$AH[o]=a}r&&!i&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class ne extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class ie extends ee{constructor(e,t,n,i,s){super(e,t,n,i,s),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??W)===q)return;const n=this._$AH,i=e===W&&n!==W||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==W&&(n===W||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re=_.litHtmlPolyfillSupport;re?.(Q,K),(_.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;class ae extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,n)=>{const i=n?.renderBefore??t;let s=i._$litPart$;if(void 0===s){const e=n?.renderBefore??null;i._$litPart$=s=new K(t.insertBefore(N(),e),e,void 0,n??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,n)=>{void 0!==n?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},he={attribute:!0,type:String,converter:k,reflect:!1,hasChanged:y},de=(e=he,t,n)=>{const{kind:i,metadata:s}=n;let r=globalThis.litPropertyMetadata.get(s);if(void 0===r&&globalThis.litPropertyMetadata.set(s,r=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),r.set(n.name,e),"accessor"===i){const{name:i}=n;return{set(n){const s=t.get.call(this);t.set.call(this,n),this.requestUpdate(i,s,e,!0,n)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=n;return function(n){const s=this[i];t.call(this,n),this.requestUpdate(i,s,e,!0,n)}}throw Error("Unsupported decorator location: "+i)};function pe(e){return(t,n)=>"object"==typeof n?de(e,t,n):((e,t,n)=>{const i=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),i?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function ue(e){return pe({...e,state:!0,attribute:!1})}function ge(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let fe={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};function me(e){fe=e}const be=/[&<>"']/,xe=new RegExp(be.source,"g"),ke=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,ye=new RegExp(ke.source,"g"),ve={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},we=e=>ve[e];function _e(e,t){if(t){if(be.test(e))return e.replace(xe,we)}else if(ke.test(e))return e.replace(ye,we);return e}const $e=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function Ae(e){return e.replace($e,(e,t)=>"colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):"")}const Te=/(^|[^\[])\^/g;function Ee(e,t){let n="string"==typeof e?e:e.source;t=t||"";const i={replace:(e,t)=>{let s="string"==typeof t?t:t.source;return s=s.replace(Te,"$1"),n=n.replace(e,s),i},getRegex:()=>new RegExp(n,t)};return i}function Se(e){try{e=encodeURI(e).replace(/%25/g,"%")}catch(e){return null}return e}const Ce={exec:()=>null};function Oe(e,t){const n=e.replace(/\|/g,(e,t,n)=>{let i=!1,s=t;for(;--s>=0&&"\\"===n[s];)i=!i;return i?"|":" |"}).split(/ \|/);let i=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push("");for(;i<n.length;i++)n[i]=n[i].trim().replace(/\\\|/g,"|");return n}function Re(e,t,n){const i=e.length;if(0===i)return"";let s=0;for(;s<i;){if(e.charAt(i-s-1)!==t)break;s++}return e.slice(0,i-s)}function Ne(e,t,n,i){const s=t.href,r=t.title?_e(t.title):null,o=e[1].replace(/\\([\[\]])/g,"$1");if("!"!==e[0].charAt(0)){i.state.inLink=!0;const e={type:"link",raw:n,href:s,title:r,text:o,tokens:i.inlineTokens(o)};return i.state.inLink=!1,e}return{type:"image",raw:n,href:s,title:r,text:_e(o)}}class De{options;rules;lexer;constructor(e){this.options=e||fe}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const e=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?e:Re(e,"\n")}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const e=t[0],n=function(e,t){const n=e.match(/^(\s+)(?:```)/);if(null===n)return t;const i=n[1];return t.split("\n").map(e=>{const t=e.match(/^\s+/);if(null===t)return e;const[n]=t;return n.length>=i.length?e.slice(i.length):e}).join("\n")}(e,t[3]||"");return{type:"code",raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:n}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(/#$/.test(e)){const t=Re(e,"#");this.options.pedantic?e=t.trim():t&&!/ $/.test(t)||(e=t.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:t[0]}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let e=t[0].replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,"\n    $1");e=Re(e.replace(/^ *>[ \t]?/gm,""),"\n");const n=this.lexer.state.top;this.lexer.state.top=!0;const i=this.lexer.blockTokens(e);return this.lexer.state.top=n,{type:"blockquote",raw:t[0],tokens:i,text:e}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const i=n.length>1,s={type:"list",raw:"",ordered:i,start:i?+n.slice(0,-1):"",loose:!1,items:[]};n=i?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=i?n:"[*+-]");const r=new RegExp(`^( {0,3}${n})((?:[\t ][^\\n]*)?(?:\\n|$))`);let o="",a="",l=!1;for(;e;){let n=!1;if(!(t=r.exec(e)))break;if(this.rules.block.hr.test(e))break;o=t[0],e=e.substring(o.length);let i=t[2].split("\n",1)[0].replace(/^\t+/,e=>" ".repeat(3*e.length)),c=e.split("\n",1)[0],h=0;this.options.pedantic?(h=2,a=i.trimStart()):(h=t[2].search(/[^ ]/),h=h>4?1:h,a=i.slice(h),h+=t[1].length);let d=!1;if(!i&&/^ *$/.test(c)&&(o+=c+"\n",e=e.substring(c.length+1),n=!0),!n){const t=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`),n=new RegExp(`^ {0,${Math.min(3,h-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),s=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:\`\`\`|~~~)`),r=new RegExp(`^ {0,${Math.min(3,h-1)}}#`);for(;e;){const l=e.split("\n",1)[0];if(c=l,this.options.pedantic&&(c=c.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),s.test(c))break;if(r.test(c))break;if(t.test(c))break;if(n.test(e))break;if(c.search(/[^ ]/)>=h||!c.trim())a+="\n"+c.slice(h);else{if(d)break;if(i.search(/[^ ]/)>=4)break;if(s.test(i))break;if(r.test(i))break;if(n.test(i))break;a+="\n"+c}d||c.trim()||(d=!0),o+=l+"\n",e=e.substring(l.length+1),i=c.slice(h)}}s.loose||(l?s.loose=!0:/\n *\n *$/.test(o)&&(l=!0));let p,u=null;this.options.gfm&&(u=/^\[[ xX]\] /.exec(a),u&&(p="[ ] "!==u[0],a=a.replace(/^\[[ xX]\] +/,""))),s.items.push({type:"list_item",raw:o,task:!!u,checked:p,loose:!1,text:a,tokens:[]}),s.raw+=o}s.items[s.items.length-1].raw=o.trimEnd(),s.items[s.items.length-1].text=a.trimEnd(),s.raw=s.raw.trimEnd();for(let e=0;e<s.items.length;e++)if(this.lexer.state.top=!1,s.items[e].tokens=this.lexer.blockTokens(s.items[e].text,[]),!s.loose){const t=s.items[e].tokens.filter(e=>"space"===e.type),n=t.length>0&&t.some(e=>/\n.*\n/.test(e.raw));s.loose=n}if(s.loose)for(let e=0;e<s.items.length;e++)s.items[e].loose=!0;return s}}html(e){const t=this.rules.block.html.exec(e);if(t){return{type:"html",block:!0,raw:t[0],pre:"pre"===t[1]||"script"===t[1]||"style"===t[1],text:t[0]}}}def(e){const t=this.rules.block.def.exec(e);if(t){const e=t[1].toLowerCase().replace(/\s+/g," "),n=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:e,raw:t[0],href:n,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t)return;if(!/[:|]/.test(t[2]))return;const n=Oe(t[1]),i=t[2].replace(/^\||\| *$/g,"").split("|"),s=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split("\n"):[],r={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===i.length){for(const e of i)/^ *-+: *$/.test(e)?r.align.push("right"):/^ *:-+: *$/.test(e)?r.align.push("center"):/^ *:-+ *$/.test(e)?r.align.push("left"):r.align.push(null);for(const e of n)r.header.push({text:e,tokens:this.lexer.inline(e)});for(const e of s)r.rows.push(Oe(e,r.header.length).map(e=>({text:e,tokens:this.lexer.inline(e)})));return r}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:"="===t[2].charAt(0)?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const e="\n"===t[1].charAt(t[1].length-1)?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:_e(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const e=t[2].trim();if(!this.options.pedantic&&/^</.test(e)){if(!/>$/.test(e))return;const t=Re(e.slice(0,-1),"\\");if((e.length-t.length)%2==0)return}else{const e=function(e,t){if(-1===e.indexOf(t[1]))return-1;let n=0;for(let i=0;i<e.length;i++)if("\\"===e[i])i++;else if(e[i]===t[0])n++;else if(e[i]===t[1]&&(n--,n<0))return i;return-1}(t[2],"()");if(e>-1){const n=(0===t[0].indexOf("!")?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=""}}let n=t[2],i="";if(this.options.pedantic){const e=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);e&&(n=e[1],i=e[3])}else i=t[3]?t[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(n=this.options.pedantic&&!/>$/.test(e)?n.slice(1):n.slice(1,-1)),Ne(t,{href:n?n.replace(this.rules.inline.anyPunctuation,"$1"):n,title:i?i.replace(this.rules.inline.anyPunctuation,"$1"):i},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const e=t[(n[2]||n[1]).replace(/\s+/g," ").toLowerCase()];if(!e){const e=n[0].charAt(0);return{type:"text",raw:e,text:e}}return Ne(n,e,n[0],this.lexer)}}emStrong(e,t,n=""){let i=this.rules.inline.emStrongLDelim.exec(e);if(!i)return;if(i[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(i[1]||i[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const n=[...i[0]].length-1;let s,r,o=n,a=0;const l="*"===i[0][0]?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(l.lastIndex=0,t=t.slice(-1*e.length+n);null!=(i=l.exec(t));){if(s=i[1]||i[2]||i[3]||i[4]||i[5]||i[6],!s)continue;if(r=[...s].length,i[3]||i[4]){o+=r;continue}if((i[5]||i[6])&&n%3&&!((n+r)%3)){a+=r;continue}if(o-=r,o>0)continue;r=Math.min(r,r+o+a);const t=[...i[0]][0].length,l=e.slice(0,n+i.index+t+r);if(Math.min(n,r)%2){const e=l.slice(1,-1);return{type:"em",raw:l,text:e,tokens:this.lexer.inlineTokens(e)}}const c=l.slice(2,-2);return{type:"strong",raw:l,text:c,tokens:this.lexer.inlineTokens(c)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(/\n/g," ");const n=/[^ ]/.test(e),i=/^ /.test(e)&&/ $/.test(e);return n&&i&&(e=e.substring(1,e.length-1)),e=_e(e,!0),{type:"codespan",raw:t[0],text:e}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let e,n;return"@"===t[2]?(e=_e(t[1]),n="mailto:"+e):(e=_e(t[1]),n=e),{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if("@"===t[2])e=_e(t[0]),n="mailto:"+e;else{let i;do{i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??""}while(i!==t[0]);e=_e(t[0]),n="www."===t[1]?"http://"+t[0]:t[0]}return{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let e;return e=this.lexer.state.inRawBlock?t[0]:_e(t[0]),{type:"text",raw:t[0],text:e}}}}const Ie=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,ze=/(?:[*+-]|\d{1,9}[.)])/,Me=Ee(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,ze).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),Le=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Pe=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Ue=Ee(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",Pe).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Fe=Ee(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,ze).getRegex(),He="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",je=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Be=Ee("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",je).replace("tag",He).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),qe=Ee(Le).replace("hr",Ie).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",He).getRegex(),We={blockquote:Ee(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",qe).getRegex(),code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,def:Ue,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,hr:Ie,html:Be,lheading:Me,list:Fe,newline:/^(?: *(?:\n|$))+/,paragraph:qe,table:Ce,text:/^[^\n]+/},Ze=Ee("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Ie).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",He).getRegex(),Ge={...We,table:Ze,paragraph:Ee(Le).replace("hr",Ie).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ze).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",He).getRegex()},Ve={...We,html:Ee("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",je).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Ce,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:Ee(Le).replace("hr",Ie).replace("heading"," *#{1,6} *[^\n]").replace("lheading",Me).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ye=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Qe=/^( {2,}|\\)\n(?!\s*$)/,Je="\\p{P}\\p{S}",Xe=Ee(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Je).getRegex(),Ke=Ee(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Je).getRegex(),et=Ee("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Je).getRegex(),tt=Ee("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Je).getRegex(),nt=Ee(/\\([punct])/,"gu").replace(/punct/g,Je).getRegex(),it=Ee(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),st=Ee(je).replace("(?:--\x3e|$)","--\x3e").getRegex(),rt=Ee("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",st).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ot=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,at=Ee(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",ot).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),lt=Ee(/^!?\[(label)\]\[(ref)\]/).replace("label",ot).replace("ref",Pe).getRegex(),ct=Ee(/^!?\[(ref)\](?:\[\])?/).replace("ref",Pe).getRegex(),ht={_backpedal:Ce,anyPunctuation:nt,autolink:it,blockSkip:/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,br:Qe,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,del:Ce,emStrongLDelim:Ke,emStrongRDelimAst:et,emStrongRDelimUnd:tt,escape:Ye,link:at,nolink:ct,punctuation:Xe,reflink:lt,reflinkSearch:Ee("reflink|nolink(?!\\()","g").replace("reflink",lt).replace("nolink",ct).getRegex(),tag:rt,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,url:Ce},dt={...ht,link:Ee(/^!?\[(label)\]\((.*?)\)/).replace("label",ot).getRegex(),reflink:Ee(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ot).getRegex()},pt={...ht,escape:Ee(Ye).replace("])","~|])").getRegex(),url:Ee(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},ut={...pt,br:Ee(Qe).replace("{2,}","*").getRegex(),text:Ee(pt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},gt={normal:We,gfm:Ge,pedantic:Ve},ft={normal:ht,gfm:pt,breaks:ut,pedantic:dt};class mt{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||fe,this.options.tokenizer=this.options.tokenizer||new De,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:gt.normal,inline:ft.normal};this.options.pedantic?(t.block=gt.pedantic,t.inline=ft.pedantic):this.options.gfm&&(t.block=gt.gfm,this.options.breaks?t.inline=ft.breaks:t.inline=ft.gfm),this.tokenizer.rules=t}static get rules(){return{block:gt,inline:ft}}static lex(e,t){return new mt(t).lex(e)}static lexInline(e,t){return new mt(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,"\n"),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){const t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[]){let n,i,s,r;for(e=this.options.pedantic?e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e.replace(/^( *)(\t+)/gm,(e,t,n)=>t+"    ".repeat(n.length));e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(i=>!!(n=i.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0))))if(n=this.tokenizer.space(e))e=e.substring(n.raw.length),1===n.raw.length&&t.length>0?t[t.length-1].raw+="\n":t.push(n);else if(n=this.tokenizer.code(e))e=e.substring(n.raw.length),i=t[t.length-1],!i||"paragraph"!==i.type&&"text"!==i.type?t.push(n):(i.raw+="\n"+n.raw,i.text+="\n"+n.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text);else if(n=this.tokenizer.fences(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.heading(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.hr(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.blockquote(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.list(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.html(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.def(e))e=e.substring(n.raw.length),i=t[t.length-1],!i||"paragraph"!==i.type&&"text"!==i.type?this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title}):(i.raw+="\n"+n.raw,i.text+="\n"+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text);else if(n=this.tokenizer.table(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.lheading(e))e=e.substring(n.raw.length),t.push(n);else{if(s=e,this.options.extensions&&this.options.extensions.startBlock){let t=1/0;const n=e.slice(1);let i;this.options.extensions.startBlock.forEach(e=>{i=e.call({lexer:this},n),"number"==typeof i&&i>=0&&(t=Math.min(t,i))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(this.state.top&&(n=this.tokenizer.paragraph(s)))i=t[t.length-1],r&&"paragraph"===i.type?(i.raw+="\n"+n.raw,i.text+="\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n),r=s.length!==e.length,e=e.substring(n.raw.length);else if(n=this.tokenizer.text(e))e=e.substring(n.raw.length),i=t[t.length-1],i&&"text"===i.type?(i.raw+="\n"+n.raw,i.text+="\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,i,s,r,o,a,l=e;if(this.tokens.links){const e=Object.keys(this.tokens.links);if(e.length>0)for(;null!=(r=this.tokenizer.rules.inline.reflinkSearch.exec(l));)e.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(l=l.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+l.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;null!=(r=this.tokenizer.rules.inline.blockSkip.exec(l));)l=l.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+l.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;null!=(r=this.tokenizer.rules.inline.anyPunctuation.exec(l));)l=l.slice(0,r.index)+"++"+l.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(o||(a=""),o=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(i=>!!(n=i.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0))))if(n=this.tokenizer.escape(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.tag(e))e=e.substring(n.raw.length),i=t[t.length-1],i&&"text"===n.type&&"text"===i.type?(i.raw+=n.raw,i.text+=n.text):t.push(n);else if(n=this.tokenizer.link(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.reflink(e,this.tokens.links))e=e.substring(n.raw.length),i=t[t.length-1],i&&"text"===n.type&&"text"===i.type?(i.raw+=n.raw,i.text+=n.text):t.push(n);else if(n=this.tokenizer.emStrong(e,l,a))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.codespan(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.br(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.del(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.autolink(e))e=e.substring(n.raw.length),t.push(n);else if(this.state.inLink||!(n=this.tokenizer.url(e))){if(s=e,this.options.extensions&&this.options.extensions.startInline){let t=1/0;const n=e.slice(1);let i;this.options.extensions.startInline.forEach(e=>{i=e.call({lexer:this},n),"number"==typeof i&&i>=0&&(t=Math.min(t,i))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(n=this.tokenizer.inlineText(s))e=e.substring(n.raw.length),"_"!==n.raw.slice(-1)&&(a=n.raw.slice(-1)),o=!0,i=t[t.length-1],i&&"text"===i.type?(i.raw+=n.raw,i.text+=n.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}else e=e.substring(n.raw.length),t.push(n);return t}}class bt{options;constructor(e){this.options=e||fe}code(e,t,n){const i=(t||"").match(/^\S*/)?.[0];return e=e.replace(/\n$/,"")+"\n",i?'<pre><code class="language-'+_e(i)+'">'+(n?e:_e(e,!0))+"</code></pre>\n":"<pre><code>"+(n?e:_e(e,!0))+"</code></pre>\n"}blockquote(e){return`<blockquote>\n${e}</blockquote>\n`}html(e,t){return e}heading(e,t,n){return`<h${t}>${e}</h${t}>\n`}hr(){return"<hr>\n"}list(e,t,n){const i=t?"ol":"ul";return"<"+i+(t&&1!==n?' start="'+n+'"':"")+">\n"+e+"</"+i+">\n"}listitem(e,t,n){return`<li>${e}</li>\n`}checkbox(e){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph(e){return`<p>${e}</p>\n`}table(e,t){return t&&(t=`<tbody>${t}</tbody>`),"<table>\n<thead>\n"+e+"</thead>\n"+t+"</table>\n"}tablerow(e){return`<tr>\n${e}</tr>\n`}tablecell(e,t){const n=t.header?"th":"td";return(t.align?`<${n} align="${t.align}">`:`<${n}>`)+e+`</${n}>\n`}strong(e){return`<strong>${e}</strong>`}em(e){return`<em>${e}</em>`}codespan(e){return`<code>${e}</code>`}br(){return"<br>"}del(e){return`<del>${e}</del>`}link(e,t,n){const i=Se(e);if(null===i)return n;let s='<a href="'+(e=i)+'"';return t&&(s+=' title="'+t+'"'),s+=">"+n+"</a>",s}image(e,t,n){const i=Se(e);if(null===i)return n;let s=`<img src="${e=i}" alt="${n}"`;return t&&(s+=` title="${t}"`),s+=">",s}text(e){return e}}class xt{strong(e){return e}em(e){return e}codespan(e){return e}del(e){return e}html(e){return e}text(e){return e}link(e,t,n){return""+n}image(e,t,n){return""+n}br(){return""}}class kt{options;renderer;textRenderer;constructor(e){this.options=e||fe,this.options.renderer=this.options.renderer||new bt,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new xt}static parse(e,t){return new kt(t).parse(e)}static parseInline(e,t){return new kt(t).parseInline(e)}parse(e,t=!0){let n="";for(let i=0;i<e.length;i++){const s=e[i];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const e=s,t=this.options.extensions.renderers[e.type].call({parser:this},e);if(!1!==t||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(e.type)){n+=t||"";continue}}switch(s.type){case"space":continue;case"hr":n+=this.renderer.hr();continue;case"heading":{const e=s;n+=this.renderer.heading(this.parseInline(e.tokens),e.depth,Ae(this.parseInline(e.tokens,this.textRenderer)));continue}case"code":{const e=s;n+=this.renderer.code(e.text,e.lang,!!e.escaped);continue}case"table":{const e=s;let t="",i="";for(let t=0;t<e.header.length;t++)i+=this.renderer.tablecell(this.parseInline(e.header[t].tokens),{header:!0,align:e.align[t]});t+=this.renderer.tablerow(i);let r="";for(let t=0;t<e.rows.length;t++){const n=e.rows[t];i="";for(let t=0;t<n.length;t++)i+=this.renderer.tablecell(this.parseInline(n[t].tokens),{header:!1,align:e.align[t]});r+=this.renderer.tablerow(i)}n+=this.renderer.table(t,r);continue}case"blockquote":{const e=s,t=this.parse(e.tokens);n+=this.renderer.blockquote(t);continue}case"list":{const e=s,t=e.ordered,i=e.start,r=e.loose;let o="";for(let t=0;t<e.items.length;t++){const n=e.items[t],i=n.checked,s=n.task;let a="";if(n.task){const e=this.renderer.checkbox(!!i);r?n.tokens.length>0&&"paragraph"===n.tokens[0].type?(n.tokens[0].text=e+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&"text"===n.tokens[0].tokens[0].type&&(n.tokens[0].tokens[0].text=e+" "+n.tokens[0].tokens[0].text)):n.tokens.unshift({type:"text",text:e+" "}):a+=e+" "}a+=this.parse(n.tokens,r),o+=this.renderer.listitem(a,s,!!i)}n+=this.renderer.list(o,t,i);continue}case"html":{const e=s;n+=this.renderer.html(e.text,e.block);continue}case"paragraph":{const e=s;n+=this.renderer.paragraph(this.parseInline(e.tokens));continue}case"text":{let r=s,o=r.tokens?this.parseInline(r.tokens):r.text;for(;i+1<e.length&&"text"===e[i+1].type;)r=e[++i],o+="\n"+(r.tokens?this.parseInline(r.tokens):r.text);n+=t?this.renderer.paragraph(o):o;continue}default:{const e='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let i=0;i<e.length;i++){const s=e[i];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const e=this.options.extensions.renderers[s.type].call({parser:this},s);if(!1!==e||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){n+=e||"";continue}}switch(s.type){case"escape":{const e=s;n+=t.text(e.text);break}case"html":{const e=s;n+=t.html(e.text);break}case"link":{const e=s;n+=t.link(e.href,e.title,this.parseInline(e.tokens,t));break}case"image":{const e=s;n+=t.image(e.href,e.title,e.text);break}case"strong":{const e=s;n+=t.strong(this.parseInline(e.tokens,t));break}case"em":{const e=s;n+=t.em(this.parseInline(e.tokens,t));break}case"codespan":{const e=s;n+=t.codespan(e.text);break}case"br":n+=t.br();break;case"del":{const e=s;n+=t.del(this.parseInline(e.tokens,t));break}case"text":{const e=s;n+=t.text(e.text);break}default:{const e='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}}class yt{options;constructor(e){this.options=e||fe}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}const vt=new class{defaults={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};options=this.setOptions;parse=this.#e(mt.lex,kt.parse);parseInline=this.#e(mt.lexInline,kt.parseInline);Parser=kt;Renderer=bt;TextRenderer=xt;Lexer=mt;Tokenizer=De;Hooks=yt;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(const i of e)switch(n=n.concat(t.call(this,i)),i.type){case"table":{const e=i;for(const i of e.header)n=n.concat(this.walkTokens(i.tokens,t));for(const i of e.rows)for(const e of i)n=n.concat(this.walkTokens(e.tokens,t));break}case"list":{const e=i;n=n.concat(this.walkTokens(e.items,t));break}default:{const e=i;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(i=>{const s=e[i].flat(1/0);n=n.concat(this.walkTokens(s,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{const n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw new Error("extension name required");if("renderer"in e){const n=t.renderers[e.name];t.renderers[e.name]=n?function(...t){let i=e.renderer.apply(this,t);return!1===i&&(i=n.apply(this,t)),i}:e.renderer}if("tokenizer"in e){if(!e.level||"block"!==e.level&&"inline"!==e.level)throw new Error("extension level must be 'block' or 'inline'");const n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&("block"===e.level?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:"inline"===e.level&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}"childTokens"in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){const t=this.defaults.renderer||new bt(this.defaults);for(const n in e.renderer){if(!(n in t))throw new Error(`renderer '${n}' does not exist`);if("options"===n)continue;const i=n,s=e.renderer[i],r=t[i];t[i]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=r.apply(t,e)),n||""}}n.renderer=t}if(e.tokenizer){const t=this.defaults.tokenizer||new De(this.defaults);for(const n in e.tokenizer){if(!(n in t))throw new Error(`tokenizer '${n}' does not exist`);if(["options","rules","lexer"].includes(n))continue;const i=n,s=e.tokenizer[i],r=t[i];t[i]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=r.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){const t=this.defaults.hooks||new yt;for(const n in e.hooks){if(!(n in t))throw new Error(`hook '${n}' does not exist`);if("options"===n)continue;const i=n,s=e.hooks[i],r=t[i];yt.passThroughHooks.has(n)?t[i]=e=>{if(this.defaults.async)return Promise.resolve(s.call(t,e)).then(e=>r.call(t,e));const n=s.call(t,e);return r.call(t,n)}:t[i]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=r.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){const t=this.defaults.walkTokens,i=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(i.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return mt.lex(e,t??this.defaults)}parser(e,t){return kt.parse(e,t??this.defaults)}#e(e,t){return(n,i)=>{const s={...i},r={...this.defaults,...s};!0===this.defaults.async&&!1===s.async&&(r.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),r.async=!0);const o=this.#t(!!r.silent,!!r.async);if(null==n)return o(new Error("marked(): input parameter is undefined or null"));if("string"!=typeof n)return o(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(r.hooks&&(r.hooks.options=r),r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(n):n).then(t=>e(t,r)).then(e=>r.hooks?r.hooks.processAllTokens(e):e).then(e=>r.walkTokens?Promise.all(this.walkTokens(e,r.walkTokens)).then(()=>e):e).then(e=>t(e,r)).then(e=>r.hooks?r.hooks.postprocess(e):e).catch(o);try{r.hooks&&(n=r.hooks.preprocess(n));let i=e(n,r);r.hooks&&(i=r.hooks.processAllTokens(i)),r.walkTokens&&this.walkTokens(i,r.walkTokens);let s=t(i,r);return r.hooks&&(s=r.hooks.postprocess(s)),s}catch(e){return o(e)}}}#t(e,t){return n=>{if(n.message+="\nPlease report this to https://github.com/markedjs/marked.",e){const e="<p>An error occurred:</p><pre>"+_e(n.message+"",!0)+"</pre>";return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function wt(e,t){return vt.parse(e,t)}wt.options=wt.setOptions=function(e){return vt.setOptions(e),wt.defaults=vt.defaults,me(wt.defaults),wt},wt.getDefaults=ge,wt.defaults=fe,wt.use=function(...e){return vt.use(...e),wt.defaults=vt.defaults,me(wt.defaults),wt},wt.walkTokens=function(e,t){return vt.walkTokens(e,t)},wt.parseInline=vt.parseInline,wt.Parser=kt,wt.parser=kt.parse,wt.Renderer=bt,wt.TextRenderer=xt,wt.Lexer=mt,wt.lexer=mt.lex,wt.Tokenizer=De,wt.Hooks=yt,wt.parse=wt,wt.options,wt.setOptions,wt.use,wt.walkTokens,wt.parseInline,kt.parse,mt.lex;const{entries:_t,setPrototypeOf:$t,isFrozen:At,getPrototypeOf:Tt,getOwnPropertyDescriptor:Et}=Object;let{freeze:St,seal:Ct,create:Ot}=Object,{apply:Rt,construct:Nt}="undefined"!=typeof Reflect&&Reflect;St||(St=function(e){return e}),Ct||(Ct=function(e){return e}),Rt||(Rt=function(e,t){for(var n=arguments.length,i=new Array(n>2?n-2:0),s=2;s<n;s++)i[s-2]=arguments[s];return e.apply(t,i)}),Nt||(Nt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];return new e(...n)});const Dt=Vt(Array.prototype.forEach),It=Vt(Array.prototype.lastIndexOf),zt=Vt(Array.prototype.pop),Mt=Vt(Array.prototype.push),Lt=Vt(Array.prototype.splice),Pt=Vt(String.prototype.toLowerCase),Ut=Vt(String.prototype.toString),Ft=Vt(String.prototype.match),Ht=Vt(String.prototype.replace),jt=Vt(String.prototype.indexOf),Bt=Vt(String.prototype.trim),qt=Vt(Object.prototype.hasOwnProperty),Wt=Vt(RegExp.prototype.test),Zt=(Gt=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return Nt(Gt,t)});var Gt;function Vt(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,i=new Array(n>1?n-1:0),s=1;s<n;s++)i[s-1]=arguments[s];return Rt(e,t,i)}}function Yt(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Pt;$t&&$t(e,null);let i=t.length;for(;i--;){let s=t[i];if("string"==typeof s){const e=n(s);e!==s&&(At(t)||(t[i]=e),s=e)}e[s]=!0}return e}function Qt(e){for(let t=0;t<e.length;t++){qt(e,t)||(e[t]=null)}return e}function Jt(e){const t=Ot(null);for(const[n,i]of _t(e)){qt(e,n)&&(Array.isArray(i)?t[n]=Qt(i):i&&"object"==typeof i&&i.constructor===Object?t[n]=Jt(i):t[n]=i)}return t}function Xt(e,t){for(;null!==e;){const n=Et(e,t);if(n){if(n.get)return Vt(n.get);if("function"==typeof n.value)return Vt(n.value)}e=Tt(e)}return function(){return null}}const Kt=St(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),en=St(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),tn=St(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),nn=St(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),sn=St(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),rn=St(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),on=St(["#text"]),an=St(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),ln=St(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),cn=St(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),hn=St(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),dn=Ct(/\{\{[\w\W]*|[\w\W]*\}\}/gm),pn=Ct(/<%[\w\W]*|[\w\W]*%>/gm),un=Ct(/\$\{[\w\W]*/gm),gn=Ct(/^data-[\-\w.\u00B7-\uFFFF]+$/),fn=Ct(/^aria-[\-\w]+$/),mn=Ct(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),bn=Ct(/^(?:\w+script|data):/i),xn=Ct(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),kn=Ct(/^html$/i),yn=Ct(/^[a-z][.\w]*(-[.\w]+)+$/i);var vn=Object.freeze({__proto__:null,ARIA_ATTR:fn,ATTR_WHITESPACE:xn,CUSTOM_ELEMENT:yn,DATA_ATTR:gn,DOCTYPE_NAME:kn,ERB_EXPR:pn,IS_ALLOWED_URI:mn,IS_SCRIPT_OR_DATA:bn,MUSTACHE_EXPR:dn,TMPLIT_EXPR:un});const wn=1,_n=3,$n=7,An=8,Tn=9,En=function(){return"undefined"==typeof window?null:window};var Sn=function e(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:En();const n=t=>e(t);if(n.version="3.3.1",n.removed=[],!t||!t.document||t.document.nodeType!==Tn||!t.Element)return n.isSupported=!1,n;let{document:i}=t;const s=i,r=s.currentScript,{DocumentFragment:o,HTMLTemplateElement:a,Node:l,Element:c,NodeFilter:h,NamedNodeMap:d=t.NamedNodeMap||t.MozNamedAttrMap,HTMLFormElement:p,DOMParser:u,trustedTypes:g}=t,f=c.prototype,m=Xt(f,"cloneNode"),b=Xt(f,"remove"),x=Xt(f,"nextSibling"),k=Xt(f,"childNodes"),y=Xt(f,"parentNode");if("function"==typeof a){const e=i.createElement("template");e.content&&e.content.ownerDocument&&(i=e.content.ownerDocument)}let v,w="";const{implementation:_,createNodeIterator:$,createDocumentFragment:A,getElementsByTagName:T}=i,{importNode:E}=s;let S={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};n.isSupported="function"==typeof _t&&"function"==typeof y&&_&&void 0!==_.createHTMLDocument;const{MUSTACHE_EXPR:C,ERB_EXPR:O,TMPLIT_EXPR:R,DATA_ATTR:N,ARIA_ATTR:D,IS_SCRIPT_OR_DATA:I,ATTR_WHITESPACE:z,CUSTOM_ELEMENT:M}=vn;let{IS_ALLOWED_URI:L}=vn,P=null;const U=Yt({},[...Kt,...en,...tn,...sn,...on]);let F=null;const H=Yt({},[...an,...ln,...cn,...hn]);let j=Object.seal(Ot(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),B=null,q=null;const W=Object.seal(Ot(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Z=!0,G=!0,V=!1,Y=!0,Q=!1,J=!0,X=!1,K=!1,ee=!1,te=!1,ne=!1,ie=!1,se=!0,re=!1,oe=!0,ae=!1,le={},ce=null;const he=Yt({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let de=null;const pe=Yt({},["audio","video","img","source","image","track"]);let ue=null;const ge=Yt({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),fe="http://www.w3.org/1998/Math/MathML",me="http://www.w3.org/2000/svg",be="http://www.w3.org/1999/xhtml";let xe=be,ke=!1,ye=null;const ve=Yt({},[fe,me,be],Ut);let we=Yt({},["mi","mo","mn","ms","mtext"]),_e=Yt({},["annotation-xml"]);const $e=Yt({},["title","style","font","a","script"]);let Ae=null;const Te=["application/xhtml+xml","text/html"];let Ee=null,Se=null;const Ce=i.createElement("form"),Oe=function(e){return e instanceof RegExp||e instanceof Function},Re=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(!Se||Se!==e){if(e&&"object"==typeof e||(e={}),e=Jt(e),Ae=-1===Te.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,Ee="application/xhtml+xml"===Ae?Ut:Pt,P=qt(e,"ALLOWED_TAGS")?Yt({},e.ALLOWED_TAGS,Ee):U,F=qt(e,"ALLOWED_ATTR")?Yt({},e.ALLOWED_ATTR,Ee):H,ye=qt(e,"ALLOWED_NAMESPACES")?Yt({},e.ALLOWED_NAMESPACES,Ut):ve,ue=qt(e,"ADD_URI_SAFE_ATTR")?Yt(Jt(ge),e.ADD_URI_SAFE_ATTR,Ee):ge,de=qt(e,"ADD_DATA_URI_TAGS")?Yt(Jt(pe),e.ADD_DATA_URI_TAGS,Ee):pe,ce=qt(e,"FORBID_CONTENTS")?Yt({},e.FORBID_CONTENTS,Ee):he,B=qt(e,"FORBID_TAGS")?Yt({},e.FORBID_TAGS,Ee):Jt({}),q=qt(e,"FORBID_ATTR")?Yt({},e.FORBID_ATTR,Ee):Jt({}),le=!!qt(e,"USE_PROFILES")&&e.USE_PROFILES,Z=!1!==e.ALLOW_ARIA_ATTR,G=!1!==e.ALLOW_DATA_ATTR,V=e.ALLOW_UNKNOWN_PROTOCOLS||!1,Y=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,Q=e.SAFE_FOR_TEMPLATES||!1,J=!1!==e.SAFE_FOR_XML,X=e.WHOLE_DOCUMENT||!1,te=e.RETURN_DOM||!1,ne=e.RETURN_DOM_FRAGMENT||!1,ie=e.RETURN_TRUSTED_TYPE||!1,ee=e.FORCE_BODY||!1,se=!1!==e.SANITIZE_DOM,re=e.SANITIZE_NAMED_PROPS||!1,oe=!1!==e.KEEP_CONTENT,ae=e.IN_PLACE||!1,L=e.ALLOWED_URI_REGEXP||mn,xe=e.NAMESPACE||be,we=e.MATHML_TEXT_INTEGRATION_POINTS||we,_e=e.HTML_INTEGRATION_POINTS||_e,j=e.CUSTOM_ELEMENT_HANDLING||{},e.CUSTOM_ELEMENT_HANDLING&&Oe(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(j.tagNameCheck=e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),e.CUSTOM_ELEMENT_HANDLING&&Oe(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(j.attributeNameCheck=e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),e.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(j.allowCustomizedBuiltInElements=e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Q&&(G=!1),ne&&(te=!0),le&&(P=Yt({},on),F=[],!0===le.html&&(Yt(P,Kt),Yt(F,an)),!0===le.svg&&(Yt(P,en),Yt(F,ln),Yt(F,hn)),!0===le.svgFilters&&(Yt(P,tn),Yt(F,ln),Yt(F,hn)),!0===le.mathMl&&(Yt(P,sn),Yt(F,cn),Yt(F,hn))),e.ADD_TAGS&&("function"==typeof e.ADD_TAGS?W.tagCheck=e.ADD_TAGS:(P===U&&(P=Jt(P)),Yt(P,e.ADD_TAGS,Ee))),e.ADD_ATTR&&("function"==typeof e.ADD_ATTR?W.attributeCheck=e.ADD_ATTR:(F===H&&(F=Jt(F)),Yt(F,e.ADD_ATTR,Ee))),e.ADD_URI_SAFE_ATTR&&Yt(ue,e.ADD_URI_SAFE_ATTR,Ee),e.FORBID_CONTENTS&&(ce===he&&(ce=Jt(ce)),Yt(ce,e.FORBID_CONTENTS,Ee)),e.ADD_FORBID_CONTENTS&&(ce===he&&(ce=Jt(ce)),Yt(ce,e.ADD_FORBID_CONTENTS,Ee)),oe&&(P["#text"]=!0),X&&Yt(P,["html","head","body"]),P.table&&(Yt(P,["tbody"]),delete B.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw Zt('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw Zt('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');v=e.TRUSTED_TYPES_POLICY,w=v.createHTML("")}else void 0===v&&(v=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let n=null;const i="data-tt-policy-suffix";t&&t.hasAttribute(i)&&(n=t.getAttribute(i));const s="dompurify"+(n?"#"+n:"");try{return e.createPolicy(s,{createHTML:e=>e,createScriptURL:e=>e})}catch(e){return console.warn("TrustedTypes policy "+s+" could not be created."),null}}(g,r)),null!==v&&"string"==typeof w&&(w=v.createHTML(""));St&&St(e),Se=e}},Ne=Yt({},[...en,...tn,...nn]),De=Yt({},[...sn,...rn]),Ie=function(e){Mt(n.removed,{element:e});try{y(e).removeChild(e)}catch(t){b(e)}},ze=function(e,t){try{Mt(n.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){Mt(n.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e)if(te||ne)try{Ie(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},Me=function(e){let t=null,n=null;if(ee)e="<remove></remove>"+e;else{const t=Ft(e,/^[\r\n\t ]+/);n=t&&t[0]}"application/xhtml+xml"===Ae&&xe===be&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");const s=v?v.createHTML(e):e;if(xe===be)try{t=(new u).parseFromString(s,Ae)}catch(e){}if(!t||!t.documentElement){t=_.createDocument(xe,"template",null);try{t.documentElement.innerHTML=ke?w:s}catch(e){}}const r=t.body||t.documentElement;return e&&n&&r.insertBefore(i.createTextNode(n),r.childNodes[0]||null),xe===be?T.call(t,X?"html":"body")[0]:X?t.documentElement:r},Le=function(e){return $.call(e.ownerDocument||e,e,h.SHOW_ELEMENT|h.SHOW_COMMENT|h.SHOW_TEXT|h.SHOW_PROCESSING_INSTRUCTION|h.SHOW_CDATA_SECTION,null)},Pe=function(e){return e instanceof p&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof d)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes)},Ue=function(e){return"function"==typeof l&&e instanceof l};function Fe(e,t,i){Dt(e,e=>{e.call(n,t,i,Se)})}const He=function(e){let t=null;if(Fe(S.beforeSanitizeElements,e,null),Pe(e))return Ie(e),!0;const i=Ee(e.nodeName);if(Fe(S.uponSanitizeElement,e,{tagName:i,allowedTags:P}),J&&e.hasChildNodes()&&!Ue(e.firstElementChild)&&Wt(/<[/\w!]/g,e.innerHTML)&&Wt(/<[/\w!]/g,e.textContent))return Ie(e),!0;if(e.nodeType===$n)return Ie(e),!0;if(J&&e.nodeType===An&&Wt(/<[/\w]/g,e.data))return Ie(e),!0;if(!(W.tagCheck instanceof Function&&W.tagCheck(i))&&(!P[i]||B[i])){if(!B[i]&&Be(i)){if(j.tagNameCheck instanceof RegExp&&Wt(j.tagNameCheck,i))return!1;if(j.tagNameCheck instanceof Function&&j.tagNameCheck(i))return!1}if(oe&&!ce[i]){const t=y(e)||e.parentNode,n=k(e)||e.childNodes;if(n&&t){for(let i=n.length-1;i>=0;--i){const s=m(n[i],!0);s.__removalCount=(e.__removalCount||0)+1,t.insertBefore(s,x(e))}}}return Ie(e),!0}return e instanceof c&&!function(e){let t=y(e);t&&t.tagName||(t={namespaceURI:xe,tagName:"template"});const n=Pt(e.tagName),i=Pt(t.tagName);return!!ye[e.namespaceURI]&&(e.namespaceURI===me?t.namespaceURI===be?"svg"===n:t.namespaceURI===fe?"svg"===n&&("annotation-xml"===i||we[i]):Boolean(Ne[n]):e.namespaceURI===fe?t.namespaceURI===be?"math"===n:t.namespaceURI===me?"math"===n&&_e[i]:Boolean(De[n]):e.namespaceURI===be?!(t.namespaceURI===me&&!_e[i])&&!(t.namespaceURI===fe&&!we[i])&&!De[n]&&($e[n]||!Ne[n]):!("application/xhtml+xml"!==Ae||!ye[e.namespaceURI]))}(e)?(Ie(e),!0):"noscript"!==i&&"noembed"!==i&&"noframes"!==i||!Wt(/<\/no(script|embed|frames)/i,e.innerHTML)?(Q&&e.nodeType===_n&&(t=e.textContent,Dt([C,O,R],e=>{t=Ht(t,e," ")}),e.textContent!==t&&(Mt(n.removed,{element:e.cloneNode()}),e.textContent=t)),Fe(S.afterSanitizeElements,e,null),!1):(Ie(e),!0)},je=function(e,t,n){if(se&&("id"===t||"name"===t)&&(n in i||n in Ce))return!1;if(G&&!q[t]&&Wt(N,t));else if(Z&&Wt(D,t));else if(W.attributeCheck instanceof Function&&W.attributeCheck(t,e));else if(!F[t]||q[t]){if(!(Be(e)&&(j.tagNameCheck instanceof RegExp&&Wt(j.tagNameCheck,e)||j.tagNameCheck instanceof Function&&j.tagNameCheck(e))&&(j.attributeNameCheck instanceof RegExp&&Wt(j.attributeNameCheck,t)||j.attributeNameCheck instanceof Function&&j.attributeNameCheck(t,e))||"is"===t&&j.allowCustomizedBuiltInElements&&(j.tagNameCheck instanceof RegExp&&Wt(j.tagNameCheck,n)||j.tagNameCheck instanceof Function&&j.tagNameCheck(n))))return!1}else if(ue[t]);else if(Wt(L,Ht(n,z,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==jt(n,"data:")||!de[e]){if(V&&!Wt(I,Ht(n,z,"")));else if(n)return!1}else;return!0},Be=function(e){return"annotation-xml"!==e&&Ft(e,M)},qe=function(e){Fe(S.beforeSanitizeAttributes,e,null);const{attributes:t}=e;if(!t||Pe(e))return;const i={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:F,forceKeepAttr:void 0};let s=t.length;for(;s--;){const r=t[s],{name:o,namespaceURI:a,value:l}=r,c=Ee(o),h=l;let d="value"===o?h:Bt(h);if(i.attrName=c,i.attrValue=d,i.keepAttr=!0,i.forceKeepAttr=void 0,Fe(S.uponSanitizeAttribute,e,i),d=i.attrValue,!re||"id"!==c&&"name"!==c||(ze(o,e),d="user-content-"+d),J&&Wt(/((--!?|])>)|<\/(style|title|textarea)/i,d)){ze(o,e);continue}if("attributename"===c&&Ft(d,"href")){ze(o,e);continue}if(i.forceKeepAttr)continue;if(!i.keepAttr){ze(o,e);continue}if(!Y&&Wt(/\/>/i,d)){ze(o,e);continue}Q&&Dt([C,O,R],e=>{d=Ht(d,e," ")});const p=Ee(e.nodeName);if(je(p,c,d)){if(v&&"object"==typeof g&&"function"==typeof g.getAttributeType)if(a);else switch(g.getAttributeType(p,c)){case"TrustedHTML":d=v.createHTML(d);break;case"TrustedScriptURL":d=v.createScriptURL(d)}if(d!==h)try{a?e.setAttributeNS(a,o,d):e.setAttribute(o,d),Pe(e)?Ie(e):zt(n.removed)}catch(t){ze(o,e)}}else ze(o,e)}Fe(S.afterSanitizeAttributes,e,null)},We=function e(t){let n=null;const i=Le(t);for(Fe(S.beforeSanitizeShadowDOM,t,null);n=i.nextNode();)Fe(S.uponSanitizeShadowNode,n,null),He(n),qe(n),n.content instanceof o&&e(n.content);Fe(S.afterSanitizeShadowDOM,t,null)};return n.sanitize=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=null,r=null,a=null,c=null;if(ke=!e,ke&&(e="\x3c!--\x3e"),"string"!=typeof e&&!Ue(e)){if("function"!=typeof e.toString)throw Zt("toString is not a function");if("string"!=typeof(e=e.toString()))throw Zt("dirty is not a string, aborting")}if(!n.isSupported)return e;if(K||Re(t),n.removed=[],"string"==typeof e&&(ae=!1),ae){if(e.nodeName){const t=Ee(e.nodeName);if(!P[t]||B[t])throw Zt("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof l)i=Me("\x3c!----\x3e"),r=i.ownerDocument.importNode(e,!0),r.nodeType===wn&&"BODY"===r.nodeName||"HTML"===r.nodeName?i=r:i.appendChild(r);else{if(!te&&!Q&&!X&&-1===e.indexOf("<"))return v&&ie?v.createHTML(e):e;if(i=Me(e),!i)return te?null:ie?w:""}i&&ee&&Ie(i.firstChild);const h=Le(ae?e:i);for(;a=h.nextNode();)He(a),qe(a),a.content instanceof o&&We(a.content);if(ae)return e;if(te){if(ne)for(c=A.call(i.ownerDocument);i.firstChild;)c.appendChild(i.firstChild);else c=i;return(F.shadowroot||F.shadowrootmode)&&(c=E.call(s,c,!0)),c}let d=X?i.outerHTML:i.innerHTML;return X&&P["!doctype"]&&i.ownerDocument&&i.ownerDocument.doctype&&i.ownerDocument.doctype.name&&Wt(kn,i.ownerDocument.doctype.name)&&(d="<!DOCTYPE "+i.ownerDocument.doctype.name+">\n"+d),Q&&Dt([C,O,R],e=>{d=Ht(d,e," ")}),v&&ie?v.createHTML(d):d},n.setConfig=function(){Re(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),K=!0},n.clearConfig=function(){Se=null,K=!1},n.isValidAttribute=function(e,t,n){Se||Re({});const i=Ee(e),s=Ee(t);return je(i,s,n)},n.addHook=function(e,t){"function"==typeof t&&Mt(S[e],t)},n.removeHook=function(e,t){if(void 0!==t){const n=It(S[e],t);return-1===n?void 0:Lt(S[e],n,1)[0]}return zt(S[e])},n.removeHooks=function(e){S[e]=[]},n.removeAllHooks=function(){S={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},n}();const Cn=e=>{return t=e.conversation_id,n=e.pipeline_run_id,`${t}::${n}`;var t,n},On=e=>{const t=e?new Date(e).getTime():NaN;return Number.isNaN(t)?0:t},Rn=e=>{const t=new Map,n=[];return e.forEach(e=>{const i=e.conversation_id;let s=t.get(i);s||(s={conversation_id:i,runs:[],latestTimestamp:0},t.set(i,s),n.push(s)),s.runs.push(e);const r=(e=>{const t=On(e.run_timestamp);return t||On(e.created_at)})(e);r>s.latestTimestamp&&(s.latestTimestamp=r)}),n.map(e=>{return Object.assign(Object.assign({},e),{runs:(t=e.runs,[...t].sort((e,t)=>{const n=On(e.run_timestamp)-On(t.run_timestamp);return 0!==n?n:On(e.created_at)-On(t.created_at)}))});var t}).sort((e,t)=>t.latestTimestamp-e.latestTimestamp)},Nn=e=>new Date(e).toLocaleString();let Dn=class extends ae{get toolResultJson(){var e,t;return JSON.stringify(null!==(t=null===(e=this.message.data)||void 0===e?void 0:e.tool_result)&&void 0!==t?t:{},null,2)}render(){var e,t,n,i;const s="user"===this.message.sender,r=null!==(e=this.message.data)&&void 0!==e?e:{},o=null!==(t=r.role)&&void 0!==t?t:this.message.sender,a=null!==(n=r.created)&&void 0!==n?n:this.message.timestamp,l=r.agent_id,c=r.tool_call_id,h=r.tool_name,d=r.tool_result,p=null!==(i=r.content)&&void 0!==i?i:this.message.text,u=[["Role",o],["Created",a],["Agent",l],["Tool Call",c],["Tool Name",h]].filter(([,e])=>null!=e&&""!==e);return B`
            <ha-card class="message ${s?"user":"assistant"}">
                <span class="sender">${o}</span>
                ${u.length?B`
                          <dl class="meta">
                              ${u.map(([e,t])=>B`
                                      <dt>${e}</dt>
                                      <dd>${"Created"===e?Nn(String(t)):t}</dd>
                                  `)}
                          </dl>
                      `:W}
                ${!d&&p?B`<intentsity-markdown class="text" .content=${String(p)}></intentsity-markdown>`:W}
                ${d?B`<div class="metadata">${this.toolResultJson}</div>`:W}
                ${a?B`<span class="time">${Nn(String(a))}</span>`:W}
            </ha-card>
        `}};Dn.styles=o`
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
    `,e([pe({attribute:!1})],Dn.prototype,"message",void 0),Dn=e([ce("intentsity-chat-message")],Dn);let In=class extends ae{constructor(){super(...arguments),this.content=""}updated(){var e;const t=wt.parse(null!==(e=this.content)&&void 0!==e?e:"",{breaks:!0,async:!1}),n=Sn.sanitize(t,{USE_PROFILES:{html:!0}}),i=this.renderRoot.querySelector(".markdown");i&&(i.innerHTML=n)}render(){return B`<div class="markdown"></div>`}};In.styles=o`
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
    `,e([pe({type:String})],In.prototype,"content",void 0),In=e([ce("intentsity-markdown")],In);let zn=class extends ae{constructor(){super(...arguments),this.chats=[],this.drafts={},this.errors={},this.saving={},this.expanded={},this.conversationExpanded={},this.correctedOverrides={},this.clipboard=null,this.toastMessage=null,this.toastKind="success",this.dialogOpen=!1,this.dialogchatId=null,this.dialogIndex=null,this.dialogField=null,this.dialogValue=""}willUpdate(e){if(!e.has("chats"))return;const t=Object.assign({},this.drafts),n=Object.assign({},this.expanded),i=Object.assign({},this.conversationExpanded),s=new Set;this.chats.forEach((e,i)=>{var r,o;const a=Cn(e);if(s.add(a),t[a])return;const l=(null===(o=null===(r=e.corrected)||void 0===r?void 0:r.messages)||void 0===o?void 0:o.length)?e.corrected.messages:e.messages.map((e,t)=>{var n;return{id:void 0,corrected_chat_id:void 0,original_message_id:e.id,position:t,timestamp:e.timestamp,sender:e.sender,text:e.text,data:null!==(n=e.data)&&void 0!==n?n:{}}});t[a]=l.map(e=>{var t,n;return{original_message_id:null!==(t=e.original_message_id)&&void 0!==t?t:null,timestamp:e.timestamp,sender:e.sender,text:e.text,dataText:(n=e.data,JSON.stringify(null!=n?n:{},null,2))}}),void 0===n[a]&&(n[a]=0===i)});const r=new Set;Rn(this.chats).forEach((e,t)=>{r.add(e.conversation_id),void 0===i[e.conversation_id]&&(i[e.conversation_id]=0===t)}),Object.keys(t).forEach(e=>{s.has(e)||delete t[e]}),Object.keys(n).forEach(e=>{s.has(e)||delete n[e]}),Object.keys(i).forEach(e=>{r.has(e)||delete i[e]}),this.drafts=t,this.expanded=n,this.conversationExpanded=i}getCorrectedAt(e){var t,n;return null!==(t=this.correctedOverrides[Cn(e)])&&void 0!==t?t:null===(n=e.corrected)||void 0===n?void 0:n.updated_at}showToast(e,t){this.toastMessage=e,this.toastKind=t,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this.toastMessage=null},3e3)}focusChat(e){const t=this.renderRoot.querySelector(`ha-card[data-chat-id="${e}"]`);if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});const n=t.querySelector("ha-button");n&&n.focus()}markCorrectedAndAdvance(e){const t=(new Date).toISOString();this.correctedOverrides=Object.assign(Object.assign({},this.correctedOverrides),{[e]:t});const n=this.chats.find(t=>Cn(t)!==e&&!this.getCorrectedAt(t)),i=n?Cn(n):void 0;this.expanded=Object.assign(Object.assign(Object.assign({},this.expanded),{[e]:!1}),i?{[i]:!0}:{}),i&&requestAnimationFrame(()=>this.focusChat(i))}updateDraft(e,t,n){const i=this.drafts[e];if(!i)return;const s=[...i];s[t]=Object.assign(Object.assign({},s[t]),n),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:s})}moveDraft(e,t,n){const i=this.drafts[e];if(!i)return;const s=t+n;if(s<0||s>=i.length)return;const r=[...i],[o]=r.splice(t,1);r.splice(s,0,o),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:r})}addDraft(e){var t;this.insertDraft(e,(null!==(t=this.drafts[e])&&void 0!==t?t:[]).length)}buildEmptyDraft(){return{original_message_id:null,timestamp:(new Date).toISOString(),sender:"assistant",text:"",dataText:"{}"}}insertDraft(e,t){var n;const i=null!==(n=this.drafts[e])&&void 0!==n?n:[],s=Math.max(0,Math.min(t,i.length)),r=[...i];r.splice(s,0,this.buildEmptyDraft()),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:r})}cloneDraftWithTimestamp(e){return{original_message_id:null,timestamp:(new Date).toISOString(),sender:e.sender,text:e.text,dataText:e.dataText}}copyDraft(e,t){var n;const i=null===(n=this.drafts[e])||void 0===n?void 0:n[t];i&&(this.clipboard=this.cloneDraftWithTimestamp(i),this.showToast("Message copied.","success"))}insertClipboard(e,t){var n;if(!this.clipboard)return;const i=null!==(n=this.drafts[e])&&void 0!==n?n:[],s=Math.max(0,Math.min(t,i.length)),r=[...i];r.splice(s,0,this.cloneDraftWithTimestamp(this.clipboard)),this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:r})}removeDraft(e,t){const n=this.drafts[e];if(!n)return;const i=n.filter((e,n)=>n!==t);this.drafts=Object.assign(Object.assign({},this.drafts),{[e]:i})}async handleSave(e){var t,n;const i=null!==(t=this.drafts[e])&&void 0!==t?t:[],s=[];for(let t=0;t<i.length;t+=1){const r=i[t];try{const e=JSON.parse(r.dataText||"{}");s.push({original_message_id:null!==(n=r.original_message_id)&&void 0!==n?n:null,position:t,timestamp:r.timestamp,sender:r.sender,text:r.text,data:e})}catch(n){return void(this.errors=Object.assign(Object.assign({},this.errors),{[e]:`Invalid JSON in message ${t+1}.`}))}}if(this.errors=Object.assign(Object.assign({},this.errors),{[e]:void 0}),!this.onSaveCorrected)return;this.saving=Object.assign(Object.assign({},this.saving),{[e]:!0});const{conversationId:r,pipelineRunId:o}=(e=>{const[t,n]=e.split("::");return{conversationId:t,pipelineRunId:n}})(e);try{await this.onSaveCorrected(r,o,s),this.showToast("Corrected conversation saved.","success"),this.markCorrectedAndAdvance(e)}catch(t){this.errors=Object.assign(Object.assign({},this.errors),{[e]:"Failed to save corrected conversation."}),this.showToast("Failed to save corrected conversation.","error")}finally{this.saving=Object.assign(Object.assign({},this.saving),{[e]:!1})}}toggleExpanded(e){this.expanded=Object.assign(Object.assign({},this.expanded),{[e]:!this.expanded[e]})}getFirstUserSnippet(e){var t;const n=e.find(e=>"user"===e.sender);if(!n){const t=e.length;return`${t} message${1===t?"":"s"}`}const i=null!==(t=n.text)&&void 0!==t?t:"";return i.length<=100?i:`${i.slice(0,100)}…`}openDialog(e,t,n){var i,s;const r=null===(i=this.drafts[e])||void 0===i?void 0:i[t];if(!r)return;const o="data"===n?this.prettyJson(r.dataText||"{}"):null!==(s=r.text)&&void 0!==s?s:"";this.dialogchatId=e,this.dialogIndex=t,this.dialogField=n,this.dialogValue=o,this.dialogOpen=!0}closeDialog(){this.dialogOpen=!1,this.dialogchatId=null,this.dialogIndex=null,this.dialogField=null,this.dialogValue=""}prettyJson(e){try{const t=JSON.parse(e);return JSON.stringify(t,null,2)}catch(t){return e}}saveDialog(){if(null===this.dialogchatId||null===this.dialogIndex||null===this.dialogField)return void this.closeDialog();const e="data"===this.dialogField?this.prettyJson(this.dialogValue):this.dialogValue;"data"===this.dialogField?this.updateDraft(this.dialogchatId,this.dialogIndex,{dataText:e}):this.updateDraft(this.dialogchatId,this.dialogIndex,{text:e}),this.closeDialog()}toggleConversation(e){this.conversationExpanded=Object.assign(Object.assign({},this.conversationExpanded),{[e]:!this.conversationExpanded[e]})}render(){return this.chats.length?B`
            <div class="chat-grid">
                ${Rn(this.chats).map(e=>B`
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
                            ${this.conversationExpanded[e.conversation_id]?e.runs.map(e=>{var t,n;const i=Cn(e),s=null!==(t=this.expanded[i])&&void 0!==t&&t,r=[...e.messages].sort((e,t)=>{var n,i;const s=On(e.timestamp)-On(t.timestamp);return 0!==s?s:(null!==(n=e.id)&&void 0!==n?n:0)-(null!==(i=t.id)&&void 0!==i?i:0)}),o=r.length,a=`${o} message${1===o?"":"s"}`,l=this.getFirstUserSnippet(r),c=this.getCorrectedAt(e),h=Boolean(c);return B`
                                <ha-card class="pipeline-run-card ${h?"corrected-card":""}" data-chat-id=${i}>
                                    <div class="card-content">
                                        <div class="chat-header">
                                            <div class="header-row">
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
                                                        label="Started ${Nn(e.run_timestamp)} · ${a}"
                                                        hasIcon
                                                    >
                                                        <ha-icon slot="icon" icon="mdi:clock-start"></ha-icon>
                                                    </ha-assist-chip>
                                                    ${h?B`
                                                              <ha-assist-chip label="Corrected ${Nn(c)}" hasIcon>
                                                                  <ha-icon slot="icon" icon="mdi:check-circle"></ha-icon>
                                                              </ha-assist-chip>
                                                          `:W}
                                                </ha-chip-set>
                                                ${s?W:B`<div class="preview">${l}</div>`}
                                            </div>
                                            <span class="time">${Nn(e.created_at)}</span>
                                        </div>
                                        ${s?B`
                                              <div class="comparison">
                                                  <section class="panel">
                                                      <h4>Original</h4>
                                                      <div class="messages-list">
                                                          ${r.map(e=>B`
                                                              <intentsity-chat-message .message=${e}></intentsity-chat-message>
                                                          `)}
                                                      </div>
                                                  </section>
                                                  <section class="panel">
                                                      <h4>Corrected</h4>
                                                      ${(null!==(n=this.drafts[i])&&void 0!==n?n:[]).map((e,t)=>B`
                                                          <div class="draft-message">
                                                              <div class="draft-controls">
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
        `:B`
                <div class="empty-state">
                    <h3>No conversations recorded yet.</h3>
                    <p>When you talk to Home Assistant, logs will appear here.</p>
                </div>
            `}};zn.styles=[o`
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
        `],e([pe({attribute:!1})],zn.prototype,"chats",void 0),e([pe({attribute:!1})],zn.prototype,"onSaveCorrected",void 0),e([ue()],zn.prototype,"drafts",void 0),e([ue()],zn.prototype,"errors",void 0),e([ue()],zn.prototype,"saving",void 0),e([ue()],zn.prototype,"expanded",void 0),e([ue()],zn.prototype,"conversationExpanded",void 0),e([ue()],zn.prototype,"correctedOverrides",void 0),e([ue()],zn.prototype,"clipboard",void 0),e([ue()],zn.prototype,"toastMessage",void 0),e([ue()],zn.prototype,"toastKind",void 0),e([ue()],zn.prototype,"dialogOpen",void 0),e([ue()],zn.prototype,"dialogchatId",void 0),e([ue()],zn.prototype,"dialogIndex",void 0),e([ue()],zn.prototype,"dialogField",void 0),e([ue()],zn.prototype,"dialogValue",void 0),zn=e([ce("intentsity-chat-list")],zn);let Mn=class extends ae{constructor(){super(...arguments),this.chats=[],this.limit=100,this.correctedFilter="all",this.startFilter="",this.endFilter="",this.subscriptionHandler=e=>{var t,n,i;this.chats=null!==(i=null!==(n=null===(t=e.event)||void 0===t?void 0:t.chats)&&void 0!==n?n:e.chats)&&void 0!==i?i:[]},this.teardownSubscription=()=>{this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=void 0)}}async getConnection(){return this.connectionPromise||(this.connectionPromise=(async()=>{if(!window.hassConnection)throw new Error("Home Assistant connection unavailable");const{conn:e}=await window.hassConnection;return e})().catch(e=>{throw this.connectionPromise=void 0,e})),this.connectionPromise}async loadChats(){var e;const t=await this.getConnection();this.teardownSubscription();const n=this.toApiFilter(this.startFilter),i=this.toApiFilter(this.endFilter),s=await t.sendMessagePromise({type:"intentsity/chats/list",limit:this.limit,corrected:this.correctedFilter,start:n,end:i});this.chats=null!==(e=s.chats)&&void 0!==e?e:[],this.unsubscribe=await t.subscribeMessage(this.subscriptionHandler,{type:"intentsity/chats/subscribe",limit:this.limit,corrected:this.correctedFilter,start:n,end:i})}async saveCorrected(e,t,n){const i=await this.getConnection();await i.sendMessagePromise({type:"intentsity/chats/corrected/save",conversation_id:e,pipeline_run_id:t,messages:n})}firstUpdated(){this.loadChats()}disconnectedCallback(){super.disconnectedCallback(),this.teardownSubscription()}handleLimitChange(e){const t=e.currentTarget;this.limit=(e=>{const t=Number(e),n=Number.isFinite(t)?t:100;return Math.max(1,Math.min(500,n||100))})(t.value),this.loadChats()}handleCorrectedFilter(e){var t,n;const i=e.detail,s=e.currentTarget,r=null!==(n=null!==(t=null==i?void 0:i.value)&&void 0!==t?t:null==s?void 0:s.value)&&void 0!==n?n:"all";this.correctedFilter=r,this.loadChats()}handleStartFilter(e){const t=e.currentTarget;this.startFilter=t.value,this.loadChats()}handleEndFilter(e){const t=e.currentTarget;this.endFilter=t.value,this.loadChats()}toApiFilter(e){if(!e)return;const t=new Date(e);return Number.isNaN(t.getTime())?void 0:t.toISOString()}render(){return B`
            <ha-card>
                <div class="card-content">
                    <h1>Assist Chat Log</h1>
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
                </div>
            </ha-card>

            <intentsity-chat-list
                .chats=${this.chats}
                .onSaveCorrected=${this.saveCorrected.bind(this)}
            ></intentsity-chat-list>
        `}};Mn.styles=[o`
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
        `],e([ue()],Mn.prototype,"chats",void 0),e([ue()],Mn.prototype,"limit",void 0),e([ue()],Mn.prototype,"correctedFilter",void 0),e([ue()],Mn.prototype,"startFilter",void 0),e([ue()],Mn.prototype,"endFilter",void 0),Mn=e([ce("intentsity-panel")],Mn);
