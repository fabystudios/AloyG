/**
 * <video-deck-gold> — Mazo de tarjetas de video (usa <video-card-gold>)
 *
 * Presenta varios <video-card-gold> apilados en abanico, como un mazo de cartas.
 * Al tocar una, se despega del mazo, se centra y crece sobre un fondo glass
 * (desenfoque + halo dorado) y reproduce. Al terminar el video, o al tocar el
 * fondo / la ✕ / Esc, vuelve a su lugar en el mazo.
 *
 * Requiere video-card-gold.js (versión con play()/pause() y eventos vcg-*).
 *
 * USO:
 *   <script src="video-card-gold.js"></script>
 *   <script src="video-deck-gold.js"></script>
 *
 *   <video-deck-gold>
 *     <video-card-gold titulo="Uno"  video="./1.mp4" poster="./1.jpg"></video-card-gold>
 *     <video-card-gold titulo="Dos"  video="./2.mp4" poster="./2.jpg"></video-card-gold>
 *     <video-card-gold titulo="Tres" video="./3.mp4" poster="./3.jpg"></video-card-gold>
 *   </video-deck-gold>
 *
 * ATRIBUTOS (todos opcionales):
 *   card-width      — ancho de cada carta en el mazo. Default: 260px (máx. 60vw en mobile).
 *   expanded-width  — ancho máximo (px) de la carta abierta. Default: 440.
 *   close-on-end    — "false" para que la carta NO vuelva sola al terminar el video.
 *   spread          — apertura del abanico. Default: 1 (se adapta solo a la cantidad de
 *                     cartas: pocas = más abierto). 1.3 = más abierto, 0.7 = más cerrado.
 *
 * API:
 *   deck.open(index) · deck.close() · deck.isOpen
 *   eventos: deck-open, deck-close  (detail.index)
 *
 * RENDIMIENTO:
 *   Pasa `poster` en cada carta: ningún video se descarga hasta que se elige.
 *   Solo la carta abierta reproduce (video-card-gold ya pausa las demás).
 *
 * NOTA: la carta abierta usa position:fixed. Si algún contenedor padre tiene
 * transform / filter / perspective, el navegador lo toma como referencia y la
 * carta quedaría mal centrada; en ese caso mueve el <video-deck-gold> fuera de él.
 */

(() => {
const _tpl = document.createElement('template');
_tpl.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; }

  :host {
    display: block;
    width: 100%;
    /* aire para el abanico, la elevación en hover y las sombras */
    padding: 28px 0 36px;
    /* el abanico nunca genera scroll horizontal; la carta abierta (fixed) no se recorta */
    overflow-x: clip;
  }

  /* Escenario: reserva el alto de UNA carta (9:16). Las demás se apilan encima. */
  .stage {
    position: relative;
    width: min(260px, 60vw);
    aspect-ratio: 9 / 16;
    margin: 0 auto;
  }

  /* ─── Cartas en reposo ───────────────────────────────────────────── */
  ::slotted(video-card-gold) {
    --vcg-w: 100%;
    position: absolute;
    left: 0; top: 0;
    width: 100%;
    z-index: var(--vdg-z, 1);
    transform: translate(var(--vdg-x, 0%), var(--vdg-y, 0%)) rotate(var(--vdg-r, 0deg));
    translate: 0 0;
    transform-origin: 50% 50%;
    /* leve rebote al abrir; más suave al volver */
    transition: transform 0.62s cubic-bezier(0.22, 1.15, 0.36, 1),
                translate 0.3s ease;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) {
    :host(:not([data-open])) ::slotted(video-card-gold:hover) { translate: 0 -10px; }
  }

  /* ─── Fondo glass cuando hay una carta abierta ───────────────────── */
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse at 50% 48%, rgba(197, 162, 39, 0.26), transparent 60%),
      rgba(8, 4, 20, 0.68);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    touch-action: none;
    transition: opacity 0.45s ease;
  }
  :host([data-open]) .backdrop { opacity: 1; pointer-events: auto; }

  /* ─── Botón cerrar (mismo lenguaje que el botón play) ────────────── */
  .close {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 10px);
    right: 12px;
    z-index: 1002;
    width: 40px; height: 40px;
    display: grid; place-items: center;
    border-radius: 50%;
    border: 2px solid rgba(245, 208, 107, 0.85);
    background: rgba(15, 10, 30, 0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 0 18px rgba(197, 162, 39, 0.3), inset 0 1px 0 rgba(255, 245, 192, 0.3);
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
    transition: opacity 0.3s ease, transform 0.3s ease, background 0.25s ease;
  }
  :host([data-open]) .close {
    opacity: 1;
    pointer-events: auto;
    transform: none;
    transition-delay: 0.15s;
  }
  .close:hover { background: rgba(197, 162, 39, 0.22); }
  .close:focus-visible { outline: 2px solid rgba(245, 208, 107, 1); outline-offset: 3px; }
  .close svg { width: 16px; height: 16px; filter: drop-shadow(0 0 3px rgba(245, 208, 107, 0.7)); }

  @media (prefers-reduced-motion: reduce) {
    ::slotted(video-card-gold),
    .backdrop, .close { transition-duration: 0.01ms !important; transition-delay: 0s !important; }
  }
</style>

<div class="stage"><slot></slot></div>
<div class="backdrop"></div>
<button class="close" type="button" aria-label="Cerrar">
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 3 L13 13 M13 3 L3 13" stroke="#f5d06b" stroke-width="2" stroke-linecap="round"/>
  </svg>
</button>
`;

class VideoDeckGold extends HTMLElement {
  static get observedAttributes() { return ['card-width', 'expanded-width', 'spread']; }

  constructor() {
    super();
    this._cur = null;   // carta abierta
    this._ret = null;   // carta que está volviendo a su lugar
    this._endT = 0;
    this._onClick  = this._onClick.bind(this);
    this._onEnded  = this._onEnded.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onKey    = e => { if (e.key === 'Escape') this.close(); };
    this._prevent  = e => e.preventDefault();
  }

  connectedCallback() {
    if (!this._shadow) {
      this._shadow = this.attachShadow({ mode: 'open' });
      this._shadow.appendChild(_tpl.content.cloneNode(true));
      this._stage = this._shadow.querySelector('.stage');
      this._shadow.querySelector('slot').addEventListener('slotchange', () => this._layout());
      this._shadow.querySelector('.backdrop').addEventListener('click', () => this.close());
      this._shadow.querySelector('.close').addEventListener('click', () => this.close());
    }
    // Captura: con el mazo cerrado, tocar una carta la abre en vez de dar play directo
    this.addEventListener('click', this._onClick, true);
    this.addEventListener('vcg-ended', this._onEnded);
    window.addEventListener('resize', this._onResize);
    this._applyWidth();
    this._layout();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick, true);
    this.removeEventListener('vcg-ended', this._onEnded);
    window.removeEventListener('resize', this._onResize);
    this._close(false);
  }

  attributeChangedCallback(name) {
    if (!this._shadow) return;
    if (name === 'card-width') this._applyWidth();
    if (name === 'spread') this._layout();
    if (this._cur) this._place(this._cur, true);
  }

  /* ─── API pública ──────────────────────────────────────────────────── */
  get isOpen() { return !!this._cur; }
  open(index = 0) { this._open(this._cards()[index]); }
  close() { this._close(true); }

  /* ─── Disposición en abanico ───────────────────────────────────────── */
  _cards() {
    return Array.from(this.children).filter(el => el.localName === 'video-card-gold');
  }

  _applyWidth() {
    const w = (this.getAttribute('card-width') || '').trim();
    this._stage.style.width = w ? `min(${w}, 80vw)` : '';
  }

  _layout() {
    const cards = this._cards();
    const n = cards.length;
    const kMax = (n - 1) / 2;
    // Separación y giro se achican solos cuando hay más cartas (el abanico siempre cabe)
    // El abanico siempre ocupa el mismo ancho total: con pocas cartas se abre más,
    // con muchas se cierra. `spread` lo escala (1 = default, 1.3 = más abierto).
    const f = Math.max(0, parseFloat(this.getAttribute('spread')) || 1);
    const step = n > 1 ? Math.min(40, 20 / kMax) * f : 0;   // % del ancho de la carta
    const rot  = n > 1 ? Math.min(12, 6 / kMax) * f : 0;    // grados
    cards.forEach((c, i) => {
      const k = i - kMax;
      c.style.setProperty('--vdg-x', (k * step).toFixed(2) + '%');
      const t = kMax ? Math.abs(k) / kMax : 0;
      c.style.setProperty('--vdg-y', (t * t * 3.6 * f).toFixed(2) + '%');
      c.style.setProperty('--vdg-r', (k * rot).toFixed(2) + 'deg');
      // la del centro arriba; las de los costados quedan detrás
      c.style.setProperty('--vdg-z', String(100 - Math.round(Math.abs(k) * 20) + (k > 0 ? 1 : 0)));
    });
  }

  /* ─── Interacción ──────────────────────────────────────────────────── */
  _onClick(e) {
    const card = e.target && e.target.closest ? e.target.closest('video-card-gold') : null;
    if (!card || card.parentElement !== this) return;
    if (this._cur) return;            // abierta: el click llega al play/pausa de la carta
    e.preventDefault();
    e.stopPropagation();              // no dejar que el botón interno haga toggle
    this._open(card);
  }

  _onEnded(e) {
    if (!this._cur || e.target !== this._cur) return;
    if (this.getAttribute('close-on-end') === 'false') return;
    clearTimeout(this._endT);
    this._endT = setTimeout(() => this._close(true), 700);
  }

  _onResize() { if (this._cur) this._place(this._cur, true); }

  _open(card) {
    if (!card || this._cur === card) return;
    this._finishReturn();
    if (this._cur) this._close(false);

    this._cur = card;
    this._place(card, false);
    this.setAttribute('data-open', '');

    document.addEventListener('keydown', this._onKey);
    // Bloquea el scroll de la página mientras hay una carta abierta
    document.addEventListener('wheel', this._prevent, { passive: false });
    document.addEventListener('touchmove', this._prevent, { passive: false });

    if (typeof card.play === 'function') card.play();
    this.dispatchEvent(new CustomEvent('deck-open', {
      bubbles: true, composed: true, detail: { index: this._cards().indexOf(card) }
    }));
  }

  /** Despega la carta (position:fixed en el mismo lugar) y la lleva al centro, ampliada. */
  _place(card, instant) {
    const r = this._stage.getBoundingClientRect();
    const st = card.style;
    if (instant) st.transition = 'none';

    st.position = 'fixed';
    st.left = r.left + 'px';
    st.top = r.top + 'px';
    st.width = r.width + 'px';
    st.margin = '0';
    st.zIndex = '1001';
    st.translate = 'none';

    const h = card.offsetHeight;                       // fuerza layout con el estado anterior ya registrado
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const maxCss = parseFloat(this.getAttribute('expanded-width')) || 440;
    const maxW = Math.min(vw * 0.94, maxCss);
    const maxH = vh - 112;                             // deja lugar a la ✕ arriba y respiro abajo
    const s = Math.min(maxW / r.width, maxH / h);
    const dx = vw / 2 - (r.left + r.width / 2);
    const dy = vh / 2 - (r.top + h / 2);
    st.transform = `translate(${dx}px, ${dy}px) scale(${s})`;

    if (instant) { void card.offsetHeight; st.transition = ''; }
  }

  _close(animate) {
    const card = this._cur;
    if (!card) return;
    this._cur = null;
    clearTimeout(this._endT);
    if (typeof card.pause === 'function') card.pause();

    this.removeAttribute('data-open');
    document.removeEventListener('keydown', this._onKey);
    document.removeEventListener('wheel', this._prevent);
    document.removeEventListener('touchmove', this._prevent);
    this.dispatchEvent(new CustomEvent('deck-close', {
      bubbles: true, composed: true, detail: { index: this._cards().indexOf(card) }
    }));

    // Quitar los estilos inline hace que la carta vuelva a su transform de reposo (con transición)
    card.style.transform = '';
    card.style.translate = '';
    const onEnd = ev => {
      if (ev.composedPath()[0] === card && ev.propertyName === 'transform') this._finishReturn();
    };
    this._ret = { card, onEnd, timer: setTimeout(() => this._finishReturn(), 900) };
    card.addEventListener('transitionend', onEnd);
    if (!animate) this._finishReturn();
  }

  /** Recién cuando terminó de volver se la reincorpora al mazo (position:absolute). */
  _finishReturn() {
    const r = this._ret;
    if (!r) return;
    this._ret = null;
    clearTimeout(r.timer);
    r.card.removeEventListener('transitionend', r.onEnd);
    const s = r.card.style;
    ['position', 'left', 'top', 'width', 'margin', 'zIndex', 'transform', 'translate']
      .forEach(p => { s[p] = ''; });
  }
}

if (!customElements.get('video-deck-gold')) {
  customElements.define('video-deck-gold', VideoDeckGold);
}
})();
