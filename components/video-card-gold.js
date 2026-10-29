/**
 * <video-card-gold> — Web Component
 * Glassmorfismo moderno con bordes dorados y efectos premium.
 * Se centra solo y se adapta a cualquier pantalla sin parámetro de modo.
 *
 * ATRIBUTOS:
 *   titulo  — texto del título (si falta, no se muestra)
 *   badge   — texto del badge (si falta, no se muestra)
 *   video   — URL del video (mp4 recomendado)
 *   poster  — imagen de portada. Si se define, el video NO se descarga
 *             hasta que el usuario presiona play.
 *
 * RENDIMIENTO:
 *   - Con poster: cero descarga de video hasta el primer play.
 *   - Sin poster: se carga solo la metadata (primer frame) cuando la tarjeta es visible.
 *   - Un solo video a la vez: al dar play, las demás tarjetas se pausan.
 *   - Al cambiar el atributo `video` se libera lo descargado del anterior.
 *
 * USO (una sola línea, funciona en desktop y mobile):
 *   <script src="video-card-gold.js"></script>
 *   <video-card-gold titulo="Mi Película" video="./mi-video.mp4"></video-card-gold>
 */

(() => {
const _tpl = document.createElement('template');
_tpl.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  [hidden] { display: none !important; }

  /* El host ocupa todo el ancho disponible */
  :host {
    display: block;
    width: 100%;
  }

  /* Ocultar en mobile si tiene atributo hide-mobile */
  @media (max-width: 767px) {
    :host([hide-mobile]) {
      display: none !important;
    }
  }

  /* ─── Card shell ─────────────────────────────────────────────────── */
  .card {
    /* Ancho: máximo 260px pero nunca más del 95% del viewport */
    width: min(260px, 95vw);
    /* Centrado automático sin importar el contenedor */
    margin-left: auto;
    margin-right: auto;

    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(15, 10, 30, 0.55);
    backdrop-filter: blur(22px) saturate(1.4);
    -webkit-backdrop-filter: blur(22px) saturate(1.4);
    box-shadow:
      0 0 0 1.5px rgba(197, 162, 39, 0.6),
      0 0 0 3px rgba(197, 162, 39, 0.12),
      0 8px 40px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(245, 208, 107, 0.25),
      inset 0 -1px 0 rgba(197, 162, 39, 0.1);
    animation: cardEntrance 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: box-shadow 0.35s ease, transform 0.35s ease;
  }

  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(30px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card:hover {
    box-shadow:
      0 0 0 1.5px rgba(245, 208, 107, 0.9),
      0 0 0 3px rgba(197, 162, 39, 0.25),
      0 0 40px rgba(197, 162, 39, 0.2),
      0 16px 60px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(245, 208, 107, 0.4),
      inset 0 -1px 0 rgba(197, 162, 39, 0.15);
    transform: translateY(-4px);
  }

  /* Reflejo glass interno */
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg,
      rgba(245, 208, 107, 0.12) 0%,
      transparent 40%,
      transparent 60%,
      rgba(197, 162, 39, 0.06) 100%);
    pointer-events: none;
    z-index: 3;
  }

  /* ─── Esquinas doradas decorativas ───────────────────────────────── */
  .gold-corner {
    position: absolute;
    width: 40px;
    height: 40px;
    pointer-events: none;
    z-index: 4;
  }
  .gc-tl { top: 0; left: 0; }
  .gc-tr { top: 0; right: 0; transform: scaleX(-1); }
  .gc-bl { bottom: 0; left: 0; transform: scaleY(-1); }
  .gc-br { bottom: 0; right: 0; transform: scale(-1, -1); }

  /* ─── Video ──────────────────────────────────────────────────────── */
  .video-wrap {
    position: relative;
    width: 100%;
    /* Ratio 9:16 nativo — no requiere altura fija */
    aspect-ratio: 9 / 16;
    overflow: hidden;
  }

  video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .card:hover video { transform: scale(1.03); }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 40%,
      rgba(8, 4, 20, 0.7) 75%,
      rgba(8, 4, 20, 0.92) 100%
    );
    z-index: 2;
  }

  /* ─── Botón Play / Pause ─────────────────────────────────────────── */
  .play-btn {
    position: absolute;
    width: 56px; height: 56px;
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
    transition: top 0.4s cubic-bezier(0.22,1,0.36,1),
                left 0.4s cubic-bezier(0.22,1,0.36,1),
                bottom 0.4s cubic-bezier(0.22,1,0.36,1),
                right 0.4s cubic-bezier(0.22,1,0.36,1),
                transform 0.4s cubic-bezier(0.22,1,0.36,1),
                width 0.4s cubic-bezier(0.22,1,0.36,1),
                height 0.4s cubic-bezier(0.22,1,0.36,1),
                background 0.25s ease, border-color 0.25s, box-shadow 0.25s;
    /* Estado inicial: centrado (play) */
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 18px rgba(197, 162, 39, 0.3), inset 0 1px 0 rgba(255, 245, 192, 0.3);
    animation: pulsePlay 2.5s ease-in-out infinite;
  }

  /* Cuando está en modo pausa: esquina inferior derecha, más pequeño */
  .play-btn.is-playing {
    top: auto; left: auto;
    bottom: 1.15rem; right: 1.2rem;
    transform: none;
    width: 32px; height: 32px;
    animation: none;
    box-shadow: 0 0 10px rgba(197, 162, 39, 0.25);
  }

  @keyframes pulsePlay {
    0%, 100% { box-shadow: 0 0 18px rgba(197, 162, 39, 0.3), inset 0 1px 0 rgba(255, 245, 192, 0.3); }
    50%       { box-shadow: 0 0 32px rgba(197, 162, 39, 0.55), 0 0 60px rgba(197, 162, 39, 0.15), inset 0 1px 0 rgba(255, 245, 192, 0.4); }
  }

  .play-btn:hover {
    background: rgba(197, 162, 39, 0.22);
    border-color: rgba(245, 208, 107, 1);
    box-shadow: 0 0 40px rgba(197, 162, 39, 0.6), 0 0 80px rgba(197, 162, 39, 0.2);
  }

  .play-btn:not(.is-playing):hover {
    transform: translate(-50%, -50%) scale(1.12);
    animation: none;
  }

  .play-btn.is-playing:hover {
    transform: scale(1.12);
  }

  .play-icon {
    width: 0; height: 0;
    border-style: solid;
    border-width: 10px 0 10px 18px;
    border-color: transparent transparent transparent rgba(245, 208, 107, 0.95);
    margin-left: 4px;
    filter: drop-shadow(0 0 4px rgba(245, 208, 107, 0.7));
  }

  .pause-icon { display: flex; gap: 3px; }
  .pause-bar {
    width: 3px; height: 12px;
    background: rgba(245, 208, 107, 0.95);
    border-radius: 2px;
    filter: drop-shadow(0 0 3px rgba(245, 208, 107, 0.7));
  }

  /* ─── Info (título, badge, meta) ─────────────────────────────────── */
  .info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 1.1rem 1.2rem;
    z-index: 5;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(197, 162, 39, 0.18);
    border: 1px solid rgba(245, 208, 107, 0.45);
    border-radius: 20px;
    padding: 3px 10px;
    font-family: 'Raleway', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(245, 208, 107, 0.9);
    margin-bottom: 0.5rem;
  }

  .badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(245, 208, 107, 0.9);
    animation: dotPulse 1.5s ease-in-out infinite;
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.6); }
  }

  .titulo {
    font-family: 'Cinzel', serif;
    font-size: 1.05rem;
    font-weight: 600;
    color: #f5d06b;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-shadow: 0 0 20px rgba(197, 162, 39, 0.5), 0 1px 0 rgba(0, 0, 0, 0.8);
  }

  .gold-line {
    height: 1px;
    margin: 0.55rem 0 0.5rem;
    background: linear-gradient(to right, rgba(197, 162, 39, 0.9), rgba(245, 208, 107, 0.4), transparent);
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .meta-time {
    font-family: 'Raleway', sans-serif;
    font-size: 11px;
    font-weight: 300;
    color: rgba(197, 162, 39, 0.65);
    letter-spacing: 1px;
  }

  .meta-dots { display: flex; gap: 4px; }
  .meta-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(197, 162, 39, 0.45);
    transition: background 0.3s;
  }
  .meta-dot.active { background: rgba(245, 208, 107, 0.9); }

  /* ─── Shimmer sweep ──────────────────────────────────────────────── */
  .shimmer-bar {
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(105deg,
      transparent 30%,
      rgba(245, 208, 107, 0.07) 50%,
      transparent 70%);
    pointer-events: none;
    z-index: 6;
    animation: shimmerMove 5s ease-in-out infinite 1s;
  }

  @keyframes shimmerMove {
    0%   { left: -60%; }
    50%  { left: 120%; }
    100% { left: 120%; }
  }
</style>

<div class="card">
  <div class="shimmer-bar"></div>

  <!-- Esquinas decorativas -->
  <svg class="gold-corner gc-tl" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gc-grad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f5d06b"/>
        <stop offset="100%" stop-color="rgba(197,162,39,0.3)"/>
      </linearGradient>
    </defs>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="url(#gc-grad)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="rgba(245,208,107,0.3)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2" fill="rgba(245,208,107,0.7)"/>
  </svg>
  <svg class="gold-corner gc-tr" viewBox="0 0 40 40" fill="none">
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="rgba(245,208,107,0.25)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2" fill="rgba(245,208,107,0.6)"/>
  </svg>
  <svg class="gold-corner gc-bl" viewBox="0 0 40 40" fill="none">
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2" fill="rgba(245,208,107,0.6)"/>
  </svg>
  <svg class="gold-corner gc-br" viewBox="0 0 40 40" fill="none">
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2" fill="rgba(245,208,107,0.6)"/>
  </svg>

  <!-- Video -->
  <div class="video-wrap">
    <video id="vid" playsinline preload="none"></video>
    <div class="overlay"></div>
    <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
      <span class="play-icon" id="playIcon"></span>
    </button>
  </div>

  <!-- Info -->
  <div class="info">
    <div class="badge" id="badgeWrap" hidden><span class="badge-dot"></span><span id="badgeEl"></span></div>
    <div class="titulo" id="titleEl" hidden></div>
    <div class="gold-line" id="lineEl" hidden></div>
    <div class="meta">
      <span class="meta-time" id="timeEl">0:00</span>
      <div class="meta-dots">
        <div class="meta-dot active"></div>
        <div class="meta-dot"></div>
        <div class="meta-dot"></div>
      </div>
    </div>
  </div>
</div>
`;

// Registro de tarjetas para garantizar "un solo video a la vez"
const _instances = new Set();

class VideoCardGold extends HTMLElement {
  static get observedAttributes() { return ['titulo', 'video', 'badge', 'poster']; }

  connectedCallback() {
    if (!this._shadow) {
      this._shadow = this.attachShadow({ mode: 'open' });
      this._shadow.appendChild(_tpl.content.cloneNode(true));

      const $ = id => this._shadow.getElementById(id);
      this._vid       = $('vid');
      this._btn       = $('playBtn');
      this._icon      = $('playIcon');
      this._titleEl   = $('titleEl');
      this._badgeEl   = $('badgeEl');
      this._badgeWrap = $('badgeWrap');
      this._lineEl    = $('lineEl');
      this._timeEl    = $('timeEl');
      this._dots      = this._shadow.querySelectorAll('.meta-dot');
      this._playing   = false;

      this._btn.addEventListener('click', () => this._toggle());
      this._vid.addEventListener('timeupdate', () => this._updateTime());
      this._vid.addEventListener('ended', () => this._onEnded());
      // Recién cuando el video realmente reproduce se quita el poster
      this._vid.addEventListener('playing', () => { this._vid.poster = ''; });
    }

    this._applyTexts();
    this._posterSrc = this.getAttribute('poster') || '';
    this._vid.poster = this._posterSrc;
    this._setupVideo();
    this._initDotAnim();
    _instances.add(this);
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._shadow) return;
    if (name === 'titulo' || name === 'badge') this._applyTexts();
    if (name === 'video') this._setupVideo();
    if (name === 'poster') {
      this._posterSrc = val || '';
      if (!this._playing) this._vid.poster = this._posterSrc;
      // Si todavía no se descargó nada, la política de carga puede cambiar
      if (!this._vid.getAttribute('src')) this._setupVideo();
    }
  }

  /* ─── Título / badge: si no vienen, no se muestra nada ─────────────── */
  _applyTexts() {
    const titulo = (this.getAttribute('titulo') || '').trim();
    const badge  = (this.getAttribute('badge')  || '').trim();
    this._titleEl.textContent = titulo;
    this._titleEl.hidden = !titulo;
    this._badgeEl.textContent = badge;
    this._badgeWrap.hidden = !badge;
    // La línea dorada solo tiene sentido si hay algo arriba
    this._lineEl.hidden = !titulo && !badge;
  }

  /* ─── Carga del video ──────────────────────────────────────────────── */
  _setupVideo() {
    this._releaseVideo();
    this._src = this.getAttribute('video') || '';
    if (!this._src) return;

    // Con poster: no se toca la red hasta que el usuario da play
    if (this._posterSrc) return;

    // Sin poster: cargar solo metadata (primer frame) cuando sea visible
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this._io.disconnect();
          this._io = null;
          this._attachSrc('metadata');
        }
      }, { threshold: 0.2 });
      this._io.observe(this._vid);
    } else {
      this._attachSrc('metadata');
    }
  }

  _attachSrc(preload) {
    if (!this._src || this._vid.getAttribute('src')) return;
    this._vid.preload = preload;
    this._vid.src = this._src;
  }

  /** Libera lo descargado: corta la descarga y vacía el buffer del video. */
  _releaseVideo() {
    if (this._io) { this._io.disconnect(); this._io = null; }
    this._vid.pause();
    if (this._vid.getAttribute('src')) {
      this._vid.removeAttribute('src');
      this._vid.load();
    }
    this._vid.preload = 'none';
    this._timeEl.textContent = '0:00';
    this._setUI(false);
  }

  /* ─── Play / Pausa ─────────────────────────────────────────────────── */
  _toggle() { this._playing ? this._pause() : this._play(); }

  _play() {
    if (!this._src) return;
    // Un solo video a la vez
    _instances.forEach(other => { if (other !== this) other._pause(); });

    this._attachSrc('auto');
    this._setUI(true);
    this._vid.play().catch(err => {
      if (err && err.name === 'AbortError') return;
      this._setUI(false);
    });
  }

  _pause() {
    if (!this._playing) return;
    this._vid.pause();
    this._setUI(false);
  }

  _setUI(playing) {
    this._playing = playing;
    this._btn.classList.toggle('is-playing', playing);
    this._btn.style.animation = playing ? 'none' : '';
    if (playing) {
      this._icon.className = 'pause-icon';
      this._icon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
    } else {
      this._icon.className = 'play-icon';
      this._icon.innerHTML = '';
      if (this._posterSrc) this._vid.poster = this._posterSrc;
    }
  }

  _onEnded() { this._setUI(false); }

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
    clearInterval(this._dotInterval);
    let i = 0;
    this._dotInterval = setInterval(() => {
      if (this._playing) return;
      this._dots.forEach((d, j) => d.classList.toggle('active', j === i));
      i = (i + 1) % 3;
    }, 900);
  }

  disconnectedCallback() {
    clearInterval(this._dotInterval);
    if (this._io) { this._io.disconnect(); this._io = null; }
    this._pause();
    _instances.delete(this);
  }
}

if (!customElements.get('video-card-gold')) {
  customElements.define('video-card-gold', VideoCardGold);
}
})();
