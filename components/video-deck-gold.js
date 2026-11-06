/**
 * <video-deck-gold> — Mazo de tarjetas de video (usa <video-card-gold>)
 *
 * Presenta varios <video-card-gold> juntos y, al elegir uno, ese video se despega,
 * se centra y crece sobre un fondo glass (desenfoque + halo dorado) y reproduce.
 * Al terminar el video, o al tocar el fondo / la ✕ / Esc, vuelve a su lugar.
 *
 * Requiere video-card-gold.js (versión con play()/pause() y eventos vcg-*).
 *
 * USO:
 *   <script src="video-card-gold.js"></script>
 *   <script src="video-deck-gold.js"></script>
 *
 *   <video-deck-gold mode="fan">
 *     <video-card-gold titulo="Uno"  video="./1.mp4" poster="./1.jpg"></video-card-gold>
 *     <video-card-gold titulo="Dos"  video="./2.mp4" poster="./2.jpg"></video-card-gold>
 *     <video-card-gold titulo="Tres" video="./3.mp4" poster="./3.jpg"></video-card-gold>
 *   </video-deck-gold>
 *
 * MODOS (atributo `mode`, en minúsculas):
 *   fan       (default) abanico. Se adapta a la cantidad: pocas cartas = más abierto.
 *   stack     pila prolija. Desliza la de arriba hacia un costado para pasarla al fondo;
 *             tócala para abrirla. Muy compacta: ideal para mobile.
 *   carousel  carrusel horizontal con snap: la del centro grande, las de los lados más
 *             chicas. Un toque en una lateral la centra; un toque en la central la abre.
 *   wallet    cascada vertical: la primera completa y de las demás asoma la franja
 *             inferior con su título y badge (como las tarjetas de la billetera).
 *   grid      grilla de columnas (2 por defecto).
 *
 * ATRIBUTOS (todos opcionales):
 *   mode            — fan | stack | carousel | wallet | grid
 *   card-width      — ancho de cada carta. Default: 260px (máx. 60vw en mobile).
 *   expanded-width  — ancho máximo (px) de la carta abierta. Default: 440.
 *   close-on-end    — "false" para que la carta NO vuelva sola al terminar el video.
 *   close-position  — dónde va la ✕ (círculo dorado): top-right (default) | top-left.
 *   spread          — (fan) apertura del abanico. 1 = default, 1.3 más abierto, 0.7 más cerrado.
 *                     Si el abanico no entra en el ancho de su contenedor, se cierra solo.
 *   peek            — (wallet) px visibles de cada carta de atrás. Default: 72.
 *   columns         — (grid) cantidad de columnas, 1 a 4. Default: 2.
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
const MODES = ['fan', 'stack', 'carousel', 'wallet', 'grid'];
const VARS = ['x', 'y', 'r', 's', 'o', 'z'].map(v => '--vdg-' + v);

/* Fondo glass + botón ✕, montados en <body>: no dependen de ningún contenedor de la página
   (transform / overflow / z-index) y quedan siempre por encima. */
const Z_BACKDROP = 2147482990, Z_CARD = 2147482995, Z_CLOSE = 2147483000;
function buildLayer(onClose, pos) {
  const left = pos === 'top-left';
  const side = left ? 'left' : 'right';
  const bd = document.createElement('div');
  bd.style.cssText =
    `position:fixed;inset:0;z-index:${Z_BACKDROP};opacity:0;touch-action:none;transition:opacity .45s ease;` +
    'background:radial-gradient(ellipse at 50% 48%,rgba(197,162,39,.26),transparent 60%),rgba(8,4,20,.68);' +
    '-webkit-backdrop-filter:blur(16px) saturate(1.3);backdrop-filter:blur(16px) saturate(1.3);';
  const x = document.createElement('button');
  x.type = 'button';
  x.setAttribute('aria-label', 'Cerrar');
  x.style.cssText =
    `position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);${side}:calc(env(safe-area-inset-${side},0px) + 12px);` +
    `z-index:${Z_CLOSE};width:44px;height:44px;display:grid;place-items:center;padding:0;border-radius:50%;` +
    'border:2px solid rgba(245,208,107,.85);background:rgba(15,10,30,.55);cursor:pointer;' +
    '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);-webkit-tap-highlight-color:transparent;' +
    'box-shadow:0 0 18px rgba(197,162,39,.3),inset 0 1px 0 rgba(255,245,192,.3);' +
    'opacity:0;transform:scale(.8);transition:opacity .3s ease .15s,transform .3s ease .15s;';
  x.innerHTML = '<svg viewBox="0 0 16 16" width="17" height="17" fill="none" aria-hidden="true" ' +
    'style="filter:drop-shadow(0 0 3px rgba(245,208,107,.7))">' +
    '<path d="M3 3 L13 13 M13 3 L3 13" stroke="#f5d06b" stroke-width="2" stroke-linecap="round"/></svg>';
  bd.addEventListener('click', onClose);
  x.addEventListener('click', onClose);
  document.body.append(bd, x);
  void bd.offsetHeight;                       // registra el estado inicial para que haya transición
  return {
    show() { bd.style.opacity = '1'; x.style.opacity = '1'; x.style.transform = 'none'; },
    hide() {
      bd.style.opacity = '0'; bd.style.pointerEvents = 'none';
      x.style.transition = 'opacity .2s ease'; x.style.opacity = '0'; x.style.pointerEvents = 'none';
    },
    remove() { bd.remove(); x.remove(); }
  };
}

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
  :host([mode="carousel"]) { padding: 0; }
  :host([mode="grid"]) { padding: 12px 0 24px; }

  /* Escenario: reserva el alto de UNA carta (9:16). Las demás se apilan encima. */
  .stage {
    --vdg-cw: min(260px, 60vw);
    position: relative;
    width: var(--vdg-cw);
    aspect-ratio: 9 / 16;
    margin: 0 auto var(--vdg-extra, 0px);
  }

  :host([mode="carousel"]) .stage {
    width: 100%;
    aspect-ratio: auto;
    margin: 0;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 40px calc(50% - var(--vdg-cw) / 2) 48px;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  :host([mode="carousel"]) .stage::-webkit-scrollbar { display: none; }

  :host([mode="grid"]) .stage {
    width: min(100%, calc(var(--cols, 2) * var(--vdg-cw) + (var(--cols, 2) - 1) * 14px + 24px));
    aspect-ratio: auto;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    gap: 14px;
    padding: 0 12px;
  }

  /* ─── Cartas en reposo ───────────────────────────────────────────── */
  ::slotted(video-card-gold) {
    --vcg-w: 100%;
    position: absolute;
    left: 0; top: 0;
    width: 100%;
    z-index: var(--vdg-z, 1);
    transform: translate(var(--vdg-x, 0%), var(--vdg-y, 0%)) rotate(var(--vdg-r, 0deg)) scale(var(--vdg-s, 1));
    translate: 0 0;
    transform-origin: 50% 50%;
    /* leve rebote al abrir; más suave al volver */
    transition: transform 0.62s cubic-bezier(0.22, 1.15, 0.36, 1),
                translate 0.3s ease, rotate 0.3s ease, opacity 0.3s ease;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  :host([mode="stack"]) ::slotted(video-card-gold) {
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
  }
  :host([mode="grid"]) ::slotted(video-card-gold) {
    position: relative;
    transform: none;
    z-index: auto;
  }
  :host([mode="carousel"]) ::slotted(video-card-gold) {
    position: relative;
    width: var(--vdg-cw);
    flex: 0 0 auto;
    scroll-snap-align: center;
    z-index: auto;
    transform: scale(var(--vdg-s, 1));
    opacity: var(--vdg-o, 1);
  }
  /* en el carrusel el tamaño sigue al scroll: sin transición salvo al abrir/cerrar */
  :host([mode="carousel"]:not([data-anim])) ::slotted(video-card-gold) {
    transition: translate 0.3s ease;
  }

  /* Hueco que deja la carta abierta en carrusel y grilla (para que nada se mueva) */
  ::slotted(.vdg-ph) {
    display: block;
    visibility: hidden;
    pointer-events: none;
    width: 100%;
    aspect-ratio: 9 / 16;
  }
  :host([mode="carousel"]) ::slotted(.vdg-ph) {
    width: var(--vdg-cw);
    flex: 0 0 auto;
    scroll-snap-align: center;
  }

  @media (hover: hover) {
    :host(:not([data-open])) ::slotted(video-card-gold:hover) { translate: 0 -10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    ::slotted(video-card-gold) { transition-duration: 0.01ms !important; transition-delay: 0s !important; }
  }
</style>

<div class="stage"><slot></slot></div>
`;

class VideoDeckGold extends HTMLElement {
  static get observedAttributes() {
    return ['card-width', 'expanded-width', 'spread', 'mode', 'peek', 'columns'];
  }

  constructor() {
    super();
    this._cur = null;        // carta abierta
    this._ret = null;        // carta que está volviendo a su lugar
    this._ph = null;         // hueco de la carta abierta (carrusel / grilla)
    this._endT = 0;
    this._raf = 0;
    this._order = [];        // orden de la pila (la primera es la de arriba)
    this._drag = null;
    this._suppress = false;
    this._lastMode = null;
    this._onClick  = this._onClick.bind(this);
    this._onEnded  = this._onEnded.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onDown   = this._onDown.bind(this);
    this._onMove   = this._onMove.bind(this);
    this._onUp     = this._onUp.bind(this);
    this._onKey    = e => { if (e.key === 'Escape') this.close(); };
    this._prevent  = e => e.preventDefault();
  }

  get _mode() {
    const m = (this.getAttribute('mode') || 'fan').trim().toLowerCase();
    return MODES.includes(m) ? m : 'fan';
  }
  get _flow() { const m = this._mode; return m === 'carousel' || m === 'grid'; }

  connectedCallback() {
    if (!this._shadow) {
      this._shadow = this.attachShadow({ mode: 'open' });
      this._shadow.appendChild(_tpl.content.cloneNode(true));
      this._stage = this._shadow.querySelector('.stage');
      this._shadow.querySelector('slot').addEventListener('slotchange', () => this._layout());
      this._stage.addEventListener('scroll', this._onScroll, { passive: true });
    }
    // Captura: con el mazo cerrado, tocar una carta la abre en vez de dar play directo
    this.addEventListener('click', this._onClick, true);
    this.addEventListener('vcg-ended', this._onEnded);
    this.addEventListener('pointerdown', this._onDown);
    this.addEventListener('pointermove', this._onMove);
    this.addEventListener('pointerup', this._onUp);
    this.addEventListener('pointercancel', this._onUp);
    window.addEventListener('resize', this._onResize);
    this._applyWidth();
    this._layout();
    requestAnimationFrame(() => this._layout());
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick, true);
    this.removeEventListener('vcg-ended', this._onEnded);
    this.removeEventListener('pointerdown', this._onDown);
    this.removeEventListener('pointermove', this._onMove);
    this.removeEventListener('pointerup', this._onUp);
    this.removeEventListener('pointercancel', this._onUp);
    window.removeEventListener('resize', this._onResize);
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._close(false);
  }

  attributeChangedCallback(name) {
    if (!this._shadow) return;
    if (name === 'mode') this._close(false);
    if (name === 'card-width') this._applyWidth();
    if (name !== 'expanded-width') this._layout();
    if (this._cur) this._place(this._cur, true);
  }

  /* ─── API pública ──────────────────────────────────────────────────── */
  get isOpen() { return !!this._cur; }
  open(index = 0) { this._open(this._cards()[index]); }
  close() { this._close(true); }

  /* ─── Disposición ──────────────────────────────────────────────────── */
  _cards() {
    return Array.from(this.children).filter(el => el.localName === 'video-card-gold');
  }

  _applyWidth() {
    const w = (this.getAttribute('card-width') || '').trim();
    if (w) this._stage.style.setProperty('--vdg-cw', `min(${w}, 80vw)`);
    else this._stage.style.removeProperty('--vdg-cw');
  }

  _layout() {
    const cards = this._cards();
    const n = cards.length;
    const mode = this._mode;

    // Al cambiar de modo se limpian las variables del modo anterior
    if (this._lastMode !== mode) {
      cards.forEach(c => VARS.forEach(v => c.style.removeProperty(v)));
      this._lastMode = mode;
    }
    this._order = this._order.filter(c => cards.includes(c));
    cards.forEach(c => { if (!this._order.includes(c)) this._order.push(c); });

    const set = (c, o) => { for (const k in o) c.style.setProperty('--vdg-' + k, o[k]); };
    let extra = 0;                                     // alto extra que reserva el mazo

    if (mode === 'fan') {
      const kMax = (n - 1) / 2;
      // El abanico siempre ocupa el mismo ancho total: con pocas cartas se abre más,
      // con muchas se cierra. `spread` lo escala (1 = default).
      let f = Math.max(0, parseFloat(this.getAttribute('spread')) || 1);
      f = this._fitSpread(n, f);                              // se cierra solo si no entra en el ancho disponible
      const step = n > 1 ? Math.min(40, 20 / kMax) * f : 0;   // % del ancho de la carta
      const rot  = n > 1 ? Math.min(12, 6 / kMax) * f : 0;    // grados
      cards.forEach((c, i) => {
        const k = i - kMax;
        const t = kMax ? Math.abs(k) / kMax : 0;
        set(c, {
          x: (k * step).toFixed(2) + '%',
          y: (t * t * 3.6 * f).toFixed(2) + '%',
          r: (k * rot).toFixed(2) + 'deg',
          s: '1',
          // la del centro arriba; las de los costados quedan detrás
          z: String(100 - Math.round(Math.abs(k) * 20) + (k > 0 ? 1 : 0))
        });
      });
    }

    else if (mode === 'stack') {
      const H = this._stage.getBoundingClientRect().width * 16 / 9;
      extra = Math.round(Math.min(n - 1, 4) * 0.028 * H);
      this._order.forEach((c, p) => {
        const d = Math.min(p, 4);                      // más allá de 4 de profundidad no se nota
        const sg = p % 2 ? 1 : -1;
        set(c, {
          x: (p ? sg * d * 1.2 : 0).toFixed(2) + '%',
          y: (d * 2.8).toFixed(2) + '%',
          r: (p ? sg * (0.8 + d * 0.7) : 0).toFixed(2) + 'deg',
          s: (1 - d * 0.025).toFixed(3),
          z: String(n - p)
        });
      });
    }

    else if (mode === 'wallet') {
      const peek = Math.min(160, Math.max(40, parseFloat(this.getAttribute('peek')) || 72));
      extra = Math.max(0, n - 1) * peek;
      cards.forEach((c, i) => set(c, { x: '0%', y: (i * peek) + 'px', r: '0deg', s: '1', z: String(n - i) }));
    }

    else if (mode === 'grid') {
      const cols = Math.min(4, Math.max(1, parseInt(this.getAttribute('columns'), 10) || 2));
      this._stage.style.setProperty('--cols', String(cols));
    }

    this._stage.style.setProperty('--vdg-extra', extra + 'px');
    if (mode === 'carousel') this._updateCarousel();
  }

  /** Abanico: ajusta `spread` para que todo el abanico entre en el ancho disponible
      (el de la columna que lo contiene, nunca más que la pantalla). */
  _fitSpread(n, f0) {
    if (n < 2) return f0;
    const W = this._stage.getBoundingClientRect().width;
    if (!W) return f0;
    const vw = document.documentElement.clientWidth;
    const par = this.parentElement;
    const avail = Math.min(vw, (par && par.clientWidth) || vw) - 6;   // 6px de respiro para el borde dorado
    const H = W * 16 / 9;
    const kMax = (n - 1) / 2;
    const half = f => {                                // distancia del centro al borde del abanico
      const th = Math.min(12, 6 / kMax) * f * kMax * Math.PI / 180;
      const off = kMax * Math.min(40, 20 / kMax) * f / 100 * W;
      return (W / 2) * Math.cos(th) + (H / 2) * Math.sin(th) + off;
    };
    if (half(f0) * 2 <= avail) return f0;
    let lo = 0, hi = f0;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (half(mid) * 2 <= avail) lo = mid; else hi = mid;
    }
    return lo;
  }

  /** Carrusel: la carta más cercana al centro es la más grande y opaca. */
  _updateCarousel() {
    if (this._mode !== 'carousel') return;
    const sr = this._stage.getBoundingClientRect();
    const cx = sr.left + sr.width / 2;
    this._cards().forEach(c => {
      const r = (c === this._cur && this._ph) ? this._ph.getBoundingClientRect() : c.getBoundingClientRect();
      const w = (c.offsetWidth || r.width) + 14;
      const t = Math.min(1, Math.abs(r.left + r.width / 2 - cx) / w);
      c.style.setProperty('--vdg-s', (1 - t * 0.16).toFixed(3));
      c.style.setProperty('--vdg-o', (1 - t * 0.45).toFixed(3));
    });
  }

  _onScroll() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this._updateCarousel(); });
  }

  /* ─── Interacción ──────────────────────────────────────────────────── */
  _onClick(e) {
    if (this._suppress) { e.preventDefault(); e.stopPropagation(); return; }   // click que sigue a un swipe
    const card = e.target && e.target.closest ? e.target.closest('video-card-gold') : null;
    if (!card || card.parentElement !== this) return;
    if (this._cur) return;            // abierta: el click llega al play/pausa de la carta
    e.preventDefault();
    e.stopPropagation();              // no dejar que el botón interno haga toggle

    if (this._mode === 'carousel') {
      // Una lateral primero se centra; la central se abre
      const sr = this._stage.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      const dx = (r.left + r.width / 2) - (sr.left + sr.width / 2);
      if (Math.abs(dx) > 10) { this._stage.scrollBy({ left: dx, behavior: 'smooth' }); return; }
    }
    this._open(card);
  }

  /* Pila: deslizar la carta de arriba la manda al fondo */
  _onDown(e) {
    if (this._mode !== 'stack' || this._cur) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const card = e.target && e.target.closest ? e.target.closest('video-card-gold') : null;
    if (!card || card.parentElement !== this || card !== this._order[0]) return;
    this._drag = { card, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, moved: false };
  }

  _onMove(e) {
    const d = this._drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { this._drag = null; return; }  // era scroll vertical
      if (Math.abs(dx) < 8) return;
      d.moved = true;
      try { d.card.setPointerCapture(e.pointerId); } catch (_) {}
      d.card.style.transition = 'none';
    }
    d.dx = dx;
    d.card.style.translate = `${dx}px 0px`;
    d.card.style.rotate = `${dx / 18}deg`;
  }

  _onUp(e) {
    const d = this._drag;
    if (!d || e.pointerId !== d.id) return;
    this._drag = null;
    if (!d.moved) return;                               // fue un toque: lo resuelve el click
    this._suppress = true;
    setTimeout(() => { this._suppress = false; }, 60);

    const card = d.card;
    const w = card.offsetWidth;
    card.style.transition = '';
    if (e.type !== 'pointercancel' && Math.abs(d.dx) > Math.max(60, w * 0.22)) {
      const sg = d.dx > 0 ? 1 : -1;
      card.style.transition = 'translate .25s ease, rotate .25s ease, opacity .25s ease';
      card.style.translate = `${sg * w * 1.15}px 0px`;
      card.style.rotate = `${sg * 14}deg`;
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.transition = 'none';
        card.style.translate = '';
        card.style.rotate = '';
        card.style.opacity = '';
        if (this._order[0] === card) this._order.push(this._order.shift());
        this._layout();                                 // las demás avanzan; ésta queda al fondo
        void card.offsetHeight;
        card.style.transition = '';
      }, 260);
    } else {
      card.style.translate = '';
      card.style.rotate = '';
    }
  }

  _onEnded(e) {
    if (!this._cur || e.target !== this._cur) return;
    if (this.getAttribute('close-on-end') === 'false') return;
    clearTimeout(this._endT);
    this._endT = setTimeout(() => this._close(true), 700);
  }

  _onResize() {
    this._layout();
    if (this._cur) this._place(this._cur, true);
  }

  /* ─── Abrir / cerrar ───────────────────────────────────────────────── */
  _open(card) {
    if (!card || this._cur === card) return;
    this._finishReturn();
    if (this._cur) this._close(false);

    this._cur = card;
    this.setAttribute('data-anim', '');
    this._place(card, false);
    this.setAttribute('data-open', '');
    this._layer = buildLayer(() => this.close(), this.getAttribute('close-position'));
    this._layer.show();

    document.addEventListener('keydown', this._onKey);
    // Bloquea el scroll de la página mientras hay una carta abierta
    document.addEventListener('wheel', this._prevent, { passive: false });
    document.addEventListener('touchmove', this._prevent, { passive: false });

    if (typeof card.play === 'function') card.play();
    this.dispatchEvent(new CustomEvent('deck-open', {
      bubbles: true, composed: true, detail: { index: this._cards().indexOf(card) }
    }));
  }

  /** Deja la carta en position:fixed sobre el rect dado (su lugar en el mazo). */
  _fix(card, r) {
    const st = card.style;
    st.position = 'fixed';
    st.left = r.left + 'px';
    st.top = r.top + 'px';
    st.width = r.width + 'px';
    st.margin = '0';
    st.zIndex = String(Z_CARD);
    st.translate = 'none';
    st.opacity = '1';
  }

  /** Despega la carta y la lleva al centro, ampliada. */
  _place(card, instant) {
    const st = card.style;
    if (instant) st.transition = 'none';

    let r;
    if (this._flow) {
      if (!this._ph) {
        // Primera vez: medir su caja real (sin transform), dejar un hueco y despegarla
        const cs = getComputedStyle(card);
        const prevT = cs.transform;
        st.transition = 'none';
        st.transform = 'none';
        st.translate = 'none';
        r = card.getBoundingClientRect();
        const ph = document.createElement('div');
        ph.className = 'vdg-ph';
        card.before(ph);
        this._ph = ph;
        this._fix(card, r);
        st.transform = prevT;                          // sigue viéndose igual que en reposo
        void card.offsetHeight;
        if (!instant) st.transition = '';
      } else {
        r = this._ph.getBoundingClientRect();
        this._fix(card, r);
      }
    } else {
      r = this._stage.getBoundingClientRect();         // abanico / pila / wallet: todas nacen en el escenario
      this._fix(card, r);
    }

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
    if (this._layer) this._layer.hide();
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

  /** Recién cuando terminó de volver se la reincorpora al mazo. */
  _finishReturn() {
    const r = this._ret;
    if (!r) return;
    this._ret = null;
    clearTimeout(r.timer);
    r.card.removeEventListener('transitionend', r.onEnd);
    const s = r.card.style;
    ['position', 'left', 'top', 'width', 'margin', 'zIndex', 'transform', 'translate', 'opacity', 'transition']
      .forEach(p => { s[p] = ''; });
    if (this._ph) { this._ph.remove(); this._ph = null; }
    if (this._layer) { this._layer.remove(); this._layer = null; }
    this.removeAttribute('data-anim');
    this._updateCarousel();
  }
}

if (!customElements.get('video-deck-gold')) {
  customElements.define('video-deck-gold', VideoDeckGold);
}
})();