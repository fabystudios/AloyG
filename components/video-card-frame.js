/**
 * <video-card-frame> — Web Component
 * Tarjeta de video enmarcada con una imagen decorativa (marco tipo pergamino
 * dorado por defecto) que se superpone al video. El marco es 100% reemplazable
 * por prop, y el "hueco" donde se ve el video también es configurable por si
 * el nuevo marco tiene proporciones distintas.
 *
 * ATRIBUTOS:
 *   titulo        — texto del título
 *   video         — URL del video (mp4 recomendado)
 *   frame         — URL de la imagen del marco (default: "./frame.png")
 *   badge         — texto del badge superior (default: "Premium")
 *   poster        — imagen poster del video (opcional)
 *   frame-ratio   — proporción ancho/alto de la imagen de marco, ej "695/1266"
 *                   (default calculado para frame.png)
 *   inset-top     — % desde arriba donde empieza el hueco del video (default 20.6)
 *   inset-right   — % desde la derecha (default 16.7)
 *   inset-bottom  — % desde abajo (default 22.75)
 *   inset-left    — % desde la izquierda (default 16.55)
 *
 * USO:
 *   <script src="video-card-frame.js"></script>
 *   <video-card-frame
 *     titulo="Mi Película"
 *     video="./27.mp4"
 *     frame="./frame.png"
 *   ></video-card-frame>
 *
 *   Con un marco distinto (otras proporciones), ajustá los insets:
 *   <video-card-frame
 *     video="./clip.mp4"
 *     frame="./otro-marco.png"
 *     frame-ratio="800/1400"
 *     inset-top="18" inset-right="14" inset-bottom="20" inset-left="14"
 *   ></video-card-frame>
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
    --frame-ratio: 695 / 1266;
    --inset-top: 20.6%;
    --inset-right: 16.7%;
    --inset-bottom: 22.75%;
    --inset-left: 16.55%;
  }

  @media (max-width: 767px) {
    :host([hide-mobile]) {
      display: none !important;
    }
  }

  /* ─── Card shell ─────────────────────────────────────────────────── */
  .card {
    width: min(280px, 92vw);
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

  /* ─── Hueco del video, recortado según los insets del marco ─────── */
  .video-wrap {
    position: absolute;
    top: var(--inset-top);
    right: var(--inset-right);
    bottom: var(--inset-bottom);
    left: var(--inset-left);
    overflow: hidden;
    background: #0f0a1e;
    border-radius: 4px;
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
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 45%,
      rgba(8, 4, 20, 0.55) 78%,
      rgba(8, 4, 20, 0.82) 100%
    );
    z-index: 2;
  }

  /* ─── Marco (imagen), siempre encima, no bloquea clicks ─────────── */
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

  /* ─── Botón Play / Pause ─────────────────────────────────────────── */
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
    transition: top 0.4s cubic-bezier(0.22,1,0.36,1),
                left 0.4s cubic-bezier(0.22,1,0.36,1),
                bottom 0.4s cubic-bezier(0.22,1,0.36,1),
                right 0.4s cubic-bezier(0.22,1,0.36,1),
                transform 0.4s cubic-bezier(0.22,1,0.36,1),
                width 0.4s cubic-bezier(0.22,1,0.36,1),
                background 0.25s ease, border-color 0.25s, box-shadow 0.25s;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 18px rgba(197, 162, 39, 0.3), inset 0 1px 0 rgba(255, 245, 192, 0.3);
    animation: pulsePlay 2.5s ease-in-out infinite;
  }

  .play-btn.is-playing {
    top: auto; left: auto;
    bottom: 6%; right: 6%;
    transform: none;
    width: 9%;
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
    border-width: 8px 0 8px 14px;
    border-color: transparent transparent transparent rgba(245, 208, 107, 0.95);
    margin-left: 3px;
    filter: drop-shadow(0 0 4px rgba(245, 208, 107, 0.7));
  }

  .pause-icon { display: flex; gap: 3px; }
  .pause-bar {
    width: 3px; height: 11px;
    background: rgba(245, 208, 107, 0.95);
    border-radius: 2px;
    filter: drop-shadow(0 0 3px rgba(245, 208, 107, 0.7));
  }

  /* ─── Info (título, badge, meta) dentro del hueco, pie del video ──── */
  .info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.85rem 0.9rem 0.75rem;
    z-index: 5;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(197, 162, 39, 0.18);
    border: 1px solid rgba(245, 208, 107, 0.45);
    border-radius: 20px;
    padding: 2px 8px;
    font-family: 'Raleway', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: rgba(245, 208, 107, 0.9);
    margin-bottom: 0.4rem;
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
    font-size: 0.92rem;
    font-weight: 600;
    color: #f5d06b;
    letter-spacing: 0.03em;
    line-height: 1.25;
    text-shadow: 0 0 20px rgba(197, 162, 39, 0.5), 0 1px 0 rgba(0, 0, 0, 0.8);
  }

  .gold-line {
    height: 1px;
    margin: 0.45rem 0 0.4rem;
    background: linear-gradient(to right, rgba(197, 162, 39, 0.9), rgba(245, 208, 107, 0.4), transparent);
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .meta-time {
    font-family: 'Raleway', sans-serif;
    font-size: 10px;
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
</style>

<div class="card">
  <div class="video-wrap">
    <video id="vid" src="" playsinline></video>
    <div class="overlay"></div>
    <div class="info">
      <div class="badge"><span class="badge-dot"></span><span id="badgeEl">Premium</span></div>
      <div class="titulo" id="titleEl">Título</div>
      <div class="gold-line"></div>
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

  <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
    <span class="play-icon" id="playIcon"></span>
  </button>

  <img class="frame-img" id="frameImg" alt="" />
</div>
`;

class VideoCardFrame extends HTMLElement {
  static get observedAttributes() {
    return [
      'titulo', 'video', 'badge', 'poster', 'frame',
      'frame-ratio', 'inset-top', 'inset-right', 'inset-bottom', 'inset-left'
    ];
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(_tpl.content.cloneNode(true));

    this._card    = this._shadow.querySelector('.card');
    this._vid     = this._shadow.getElementById('vid');
    this._btn     = this._shadow.getElementById('playBtn');
    this._icon    = this._shadow.getElementById('playIcon');
    this._titleEl = this._shadow.getElementById('titleEl');
    this._timeEl  = this._shadow.getElementById('timeEl');
    this._dots    = this._shadow.querySelectorAll('.meta-dot');
    this._frameEl = this._shadow.getElementById('frameImg');
    this._badgeEl = this._shadow.getElementById('badgeEl');
    this._playing = false;

    this._titleEl.textContent = this.getAttribute('titulo') || 'Sin título';
    this._badgeEl.textContent = this.getAttribute('badge') || 'Premium';

    // Marco: por defecto ./frame.png, reemplazable por prop
    this._frameEl.src = this.getAttribute('frame') || './frame.png';

    this._posterSrc = this.getAttribute('poster') || '';
    if (this._posterSrc) this._vid.poster = this._posterSrc;

    // Proporciones e insets configurables (para marcos distintos)
    this._applyGeometry();

    // Lazy loading del video
    this._vid.removeAttribute('src');
    this._vid.setAttribute('data-src', this.getAttribute('video') || '');
    this._setupLazyVideo();

    this._btn.addEventListener('click', () => this._toggle());
    this._vid.addEventListener('timeupdate', () => this._updateTime());
    this._vid.addEventListener('ended', () => this._onEnded());

    this._initDotAnim();
  }

  _applyGeometry() {
    const ratio  = this.getAttribute('frame-ratio');
    const top    = this.getAttribute('inset-top');
    const right  = this.getAttribute('inset-right');
    const bottom = this.getAttribute('inset-bottom');
    const left   = this.getAttribute('inset-left');

    if (ratio)  this._card.style.setProperty('--frame-ratio', ratio.replace(':', '/'));
    if (top)    this._card.style.setProperty('--inset-top', `${top}%`);
    if (right)  this._card.style.setProperty('--inset-right', `${right}%`);
    if (bottom) this._card.style.setProperty('--inset-bottom', `${bottom}%`);
    if (left)   this._card.style.setProperty('--inset-left', `${left}%`);
  }

  _setupLazyVideo() {
    if (!this._vid) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this._vid.src) {
            this._vid.src = this._vid.dataset.src;
            this._vid.load();
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      observer.observe(this._vid);
    } else {
      this._vid.src = this._vid.dataset.src;
      this._vid.load();
    }
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._shadow) return;
    if (name === 'titulo') this._titleEl.textContent = val || 'Sin título';
    if (name === 'video') {
      this._vid.removeAttribute('src');
      this._vid.setAttribute('data-src', val || '');
      this._setupLazyVideo();
    }
    if (name === 'badge')  this._badgeEl.textContent = val || 'Premium';
    if (name === 'poster') { this._posterSrc = val || ''; this._vid.poster = this._posterSrc; }
    if (name === 'frame')  this._frameEl.src = val || './frame.png';
    if (['frame-ratio', 'inset-top', 'inset-right', 'inset-bottom', 'inset-left'].includes(name)) {
      this._applyGeometry();
    }
  }

  _toggle() {
    if (this._playing) {
      this._vid.pause();
      this._playing = false;
      this._btn.classList.remove('is-playing');
      this._icon.className = 'play-icon';
      this._icon.innerHTML = '';
      this._btn.style.animation = '';
      if (this._posterSrc) this._vid.poster = this._posterSrc;
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

  _onEnded() {
    this._playing = false;
    this._btn.classList.remove('is-playing');
    this._icon.className = 'play-icon';
    this._icon.innerHTML = '';
    this._btn.style.animation = '';
    if (this._posterSrc) this._vid.poster = this._posterSrc;
  }

  _initDotAnim() {
    let i = 0;
    this._dotInterval = setInterval(() => {
      if (this._playing) return;
      this._dots.forEach((d, j) => d.classList.toggle('active', j === i));
      i = (i + 1) % 3;
    }, 900);
  }

  disconnectedCallback() {
    clearInterval(this._dotInterval);
  }
}

if (!customElements.get('video-card-frame')) {
  customElements.define('video-card-frame', VideoCardFrame);
}
})();