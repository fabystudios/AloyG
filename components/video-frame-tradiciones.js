/**
 * <video-frame-tradiciones> — Web Component
 * Video enmarcado con el marco "Tradiciones y creencias" (tradi.png).
 * El video se ve por el hueco del marco; el marco va siempre encima.
 *
 * ATRIBUTOS:
 *   video         — URL del video (mp4 recomendado)
 *   titulo        — título (si no se pasa, no se muestra)
 *   fecha         — texto del chip superior, ej "27 de Octubre" (si no se pasa, no se muestra)
 *   poster        — imagen poster del video (opcional)
 *   frame         — URL de la imagen del marco (default: "./tradi.png")
 *   frame-ratio   — ancho/alto del marco (default "1024/1536")
 *   inset-top / inset-right / inset-bottom / inset-left
 *                 — % del hueco del video (defaults ajustados a tradi.png)
 *   hide-mobile   — oculta el componente en pantallas < 768px
 *
 * Si no hay ni `titulo` ni `fecha`, no aparece nada sobre el video
 * (ni chip, ni título, ni línea dorada, ni tiempo/puntos).
 *
 * USO:
 *   <script src="video-frame-tradiciones.js"></script>
 *   <video-frame-tradiciones video="./27.mp4"></video-frame-tradiciones>
 *   <video-frame-tradiciones video="./27.mp4" fecha="27 de Octubre" titulo="El Regreso de las Mascotas"></video-frame-tradiciones>
 */
(() => {
const _tpl = document.createElement('template');
_tpl.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    width: 100%;
    --frame-ratio: 1024 / 1536;
    /* Hueco medido en tradi.png (705x1018 px sobre 1024x1536).
       Se deja ~0.2% de solape bajo el marco para que no queden rendijas. */
    --inset-top: 18%;
    --inset-right: 15.3%;
    --inset-bottom: 15.2%;
    --inset-left: 15.3%;
  }

  @media (max-width: 767px) {
    :host([hide-mobile]) { display: none !important; }
  }

  .card {
    width: min(320px, 92vw);
    margin-left: auto;
    margin-right: auto;
    position: relative;
    aspect-ratio: var(--frame-ratio);
    animation: cardEntrance 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    filter: drop-shadow(0 10px 34px rgba(0, 0, 0, 0.45));
    transition: transform 0.35s ease, filter 0.35s ease;
  }

  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(30px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card:hover {
    transform: translateY(-4px);
    filter: drop-shadow(0 16px 46px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 22px rgba(197, 162, 39, 0.25));
  }

  .video-wrap {
    position: absolute;
    top: var(--inset-top);
    right: var(--inset-right);
    bottom: var(--inset-bottom);
    left: var(--inset-left);
    overflow: hidden;
    background: #0f0a1e;
    z-index: 1;
  }

  video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .card:hover video { transform: scale(1.04); }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      rgba(0,0,0,0) 45%, rgba(8,4,20,0.55) 78%, rgba(8,4,20,0.82) 100%);
    z-index: 2;
    pointer-events: none;
  }

  .frame-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
    z-index: 4;
    user-select: none;
    -webkit-user-drag: none;
  }

  /* ─── Play / Pause ─── */
  .play-btn {
    position: absolute;
    width: 15%; height: auto;
    aspect-ratio: 1;
    max-width: 56px;
    border-radius: 50%;
    border: 2px solid rgba(245, 208, 107, 0.85);
    background: rgba(15, 10, 30, 0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: top .4s cubic-bezier(.22,1,.36,1), left .4s cubic-bezier(.22,1,.36,1),
                bottom .4s cubic-bezier(.22,1,.36,1), right .4s cubic-bezier(.22,1,.36,1),
                transform .4s cubic-bezier(.22,1,.36,1), width .4s cubic-bezier(.22,1,.36,1),
                background .25s ease, border-color .25s, box-shadow .25s;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 18px rgba(197,162,39,.3), inset 0 1px 0 rgba(255,245,192,.3);
    animation: pulsePlay 2.5s ease-in-out infinite;
  }

  .play-btn.is-playing {
    top: auto; left: auto;
    bottom: 17%; right: 17.5%;
    transform: none;
    width: 9%;
    animation: none;
    box-shadow: 0 0 10px rgba(197,162,39,.25);
  }

  @keyframes pulsePlay {
    0%, 100% { box-shadow: 0 0 18px rgba(197,162,39,.3), inset 0 1px 0 rgba(255,245,192,.3); }
    50%      { box-shadow: 0 0 32px rgba(197,162,39,.55), 0 0 60px rgba(197,162,39,.15), inset 0 1px 0 rgba(255,245,192,.4); }
  }

  .play-btn:hover {
    background: rgba(197,162,39,.22);
    border-color: rgba(245,208,107,1);
    box-shadow: 0 0 40px rgba(197,162,39,.6), 0 0 80px rgba(197,162,39,.2);
  }
  .play-btn:not(.is-playing):hover { transform: translate(-50%, -50%) scale(1.12); animation: none; }
  .play-btn.is-playing:hover { transform: scale(1.12); }

  .play-icon {
    width: 0; height: 0;
    border-style: solid;
    border-width: 8px 0 8px 14px;
    border-color: transparent transparent transparent rgba(245,208,107,.95);
    margin-left: 3px;
    filter: drop-shadow(0 0 4px rgba(245,208,107,.7));
  }
  .pause-icon { display: flex; gap: 3px; }
  .pause-bar {
    width: 3px; height: 11px;
    background: rgba(245,208,107,.95);
    border-radius: 2px;
    filter: drop-shadow(0 0 3px rgba(245,208,107,.7));
  }

  /* ─── Info (chip, título, meta): todo opcional ─── */
  .info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.85rem 0.9rem 0.75rem;
    z-index: 5;
  }

  /* Ocultos cuando no hay dato */
  .info[hidden], .overlay[hidden], .badge[hidden],
  .titulo[hidden], .gold-line[hidden], .meta[hidden] { display: none !important; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(197,162,39,.18);
    border: 1px solid rgba(245,208,107,.45);
    border-radius: 20px;
    padding: 2px 8px;
    font-family: 'Raleway', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: rgba(245,208,107,.9);
    margin-bottom: 0.4rem;
  }
  .badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(245,208,107,.9);
    animation: dotPulse 1.5s ease-in-out infinite;
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .4; transform: scale(.6); }
  }

  .titulo {
    font-family: 'Cinzel', serif;
    font-size: 0.92rem;
    font-weight: 600;
    color: #f5d06b;
    letter-spacing: .03em;
    line-height: 1.25;
    text-shadow: 0 0 20px rgba(197,162,39,.5), 0 1px 0 rgba(0,0,0,.8);
  }

  .gold-line {
    height: 1px;
    margin: 0.45rem 0 0.4rem;
    background: linear-gradient(to right, rgba(197,162,39,.9), rgba(245,208,107,.4), transparent);
  }

  .meta { display: flex; align-items: center; justify-content: space-between; }
  .meta-time {
    font-family: 'Raleway', sans-serif;
    font-size: 10px; font-weight: 300;
    color: rgba(197,162,39,.65);
    letter-spacing: 1px;
  }
  .meta-dots { display: flex; gap: 4px; }
  .meta-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: rgba(197,162,39,.45);
    transition: background .3s;
  }
  .meta-dot.active { background: rgba(245,208,107,.9); }
</style>

<div class="card">
  <div class="video-wrap">
    <video id="vid" playsinline></video>
    <div class="overlay" id="overlay" hidden></div>
    <div class="info" id="info" hidden>
      <div class="badge" id="badge" hidden><span class="badge-dot"></span><span id="badgeEl"></span></div>
      <div class="titulo" id="titleEl" hidden></div>
      <div class="gold-line" id="goldLine" hidden></div>
      <div class="meta" id="meta" hidden>
        <span class="meta-time" id="timeEl">0:00</span>
        <div class="meta-dots">
          <div class="meta-dot active"></div>
          <div class="meta-dot"></div>
          <div class="meta-dot"></div>
        </div>
      </div>
    </div>
  </div>

  <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
    <span class="play-icon" id="playIcon"></span>
  </button>

  <img class="frame-img" id="frameImg" alt="" />
</div>
`;

class VideoFrameTradiciones extends HTMLElement {
  static get observedAttributes() {
    return ['titulo', 'fecha', 'video', 'poster', 'frame',
            'frame-ratio', 'inset-top', 'inset-right', 'inset-bottom', 'inset-left'];
  }

  connectedCallback() {
    if (this._ready) return;
    this._ready = true;

    this._shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(_tpl.content.cloneNode(true));

    const $ = id => this._shadow.getElementById(id);
    this._card     = this._shadow.querySelector('.card');
    this._vid      = $('vid');
    this._btn      = $('playBtn');
    this._icon     = $('playIcon');
    this._overlay  = $('overlay');
    this._info     = $('info');
    this._badge    = $('badge');
    this._badgeEl  = $('badgeEl');
    this._titleEl  = $('titleEl');
    this._goldLine = $('goldLine');
    this._meta     = $('meta');
    this._timeEl   = $('timeEl');
    this._frameEl  = $('frameImg');
    this._dots     = this._shadow.querySelectorAll('.meta-dot');
    this._playing  = false;

    this._frameEl.src = this.getAttribute('frame') || './tradi.png';
    this._posterSrc = this.getAttribute('poster') || '';
    if (this._posterSrc) this._vid.poster = this._posterSrc;

    this._applyGeometry();
    this._applyText();

    this._vid.setAttribute('data-src', this.getAttribute('video') || '');
    this._setupLazyVideo();

    this._btn.addEventListener('click', () => this._toggle());
    this._vid.addEventListener('timeupdate', () => this._updateTime());
    this._vid.addEventListener('ended', () => this._resetPlayUI());

    this._initDotAnim();
  }

  disconnectedCallback() {
    clearInterval(this._dotInterval);
    if (this._io) this._io.disconnect();
    this._ready = false;
    if (this._shadow) this._shadow.innerHTML = '';
  }

  /* Muestra/oculta chip, título, línea y meta según los atributos */
  _applyText() {
    const titulo = (this.getAttribute('titulo') || '').trim();
    const fecha  = (this.getAttribute('fecha')  || '').trim();
    const any = !!(titulo || fecha);

    this._badgeEl.textContent = fecha;
    this._titleEl.textContent = titulo;

    this._badge.hidden    = !fecha;
    this._titleEl.hidden  = !titulo;
    this._goldLine.hidden = !any;
    this._meta.hidden     = !any;
    this._info.hidden     = !any;
    this._overlay.hidden  = !any;
  }

  _applyGeometry() {
    const set = (prop, v, suffix = '') => {
      if (v) this._card.style.setProperty(prop, v + suffix);
    };
    const ratio = this.getAttribute('frame-ratio');
    set('--frame-ratio', ratio && ratio.replace(':', '/'));
    set('--inset-top',    this.getAttribute('inset-top'),    '%');
    set('--inset-right',  this.getAttribute('inset-right'),  '%');
    set('--inset-bottom', this.getAttribute('inset-bottom'), '%');
    set('--inset-left',   this.getAttribute('inset-left'),   '%');
  }

  _setupLazyVideo() {
    if (this._io) this._io.disconnect();
    const load = () => {
      const src = this._vid.dataset.src;
      if (src) { this._vid.src = src; this._vid.load(); }
    };
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { load(); this._io.disconnect(); }
      }, { threshold: 0.2 });
      this._io.observe(this._vid);
    } else {
      load();
    }
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._ready) return;
    if (name === 'titulo' || name === 'fecha') this._applyText();
    if (name === 'video') {
      this._vid.removeAttribute('src');
      this._vid.setAttribute('data-src', val || '');
      this._setupLazyVideo();
    }
    if (name === 'poster') { this._posterSrc = val || ''; this._vid.poster = this._posterSrc; }
    if (name === 'frame')  this._frameEl.src = val || './tradi.png';
    if (name.startsWith('inset-') || name === 'frame-ratio') this._applyGeometry();
  }

  _toggle() {
    if (this._playing) {
      this._vid.pause();
      this._resetPlayUI();
    } else {
      this._vid.poster = '';
      this._vid.play().catch(() => {});
      this._playing = true;
      this._btn.classList.add('is-playing');
      this._icon.className = 'pause-icon';
      this._icon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
      this._btn.style.animation = 'none';
    }
  }

  _resetPlayUI() {
    this._playing = false;
    this._btn.classList.remove('is-playing');
    this._icon.className = 'play-icon';
    this._icon.innerHTML = '';
    this._btn.style.animation = '';
    if (this._posterSrc) this._vid.poster = this._posterSrc;
  }

  _updateTime() {
    const t = this._vid.currentTime || 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    this._timeEl.textContent = `${m}:${s}`;
    if (this._vid.duration) {
      const pct = t / this._vid.duration;
      const idx = pct < 0.33 ? 0 : pct < 0.66 ? 1 : 2;
      this._dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  }

  _initDotAnim() {
    let i = 0;
    this._dotInterval = setInterval(() => {
      if (this._playing) return;
      this._dots.forEach((d, j) => d.classList.toggle('active', j === i));
      i = (i + 1) % 3;
    }, 900);
  }
}

if (!customElements.get('video-frame-tradiciones')) {
  customElements.define('video-frame-tradiciones', VideoFrameTradiciones);
}
})();
