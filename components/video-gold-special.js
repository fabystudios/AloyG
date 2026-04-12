/**
 * <video-gold-special> — Web Component — Variante "Special"
 *
 * ATRIBUTOS:
 *   titulo         — texto del título principal
 *   video-desktop  — URL de YouTube (youtu.be/... o youtube.com/watch?v=...)
 *   video-mobile   — URL del archivo mp4 vertical
 *   ancho-desktop  — ancho en desktop. Default: "80vw"
 *   badge          — texto de la píldora inferior.       Default: "Special"
 *   etiqueta       — texto del badge superior centrado.  Default: "Special Edition"
 *   logo           — URL de un PNG flotante en la esquina superior derecha
 *
 * USO:
 *   <script src="video-gold-special.js"></script>
 *   <video-gold-special
 *     titulo="Gran Estreno"
 *     video-desktop="https://youtu.be/dQw4w9WgXcQ"
 *     video-mobile="./vertical.mp4"
 *     ancho-desktop="860px"
 *     badge="Exclusivo"
 *     etiqueta="Edición Limitada"
 *     logo="./mi-logo.png">
 *   </video-gold-special>
 */

/* ── Helpers ────────────────────────────────────────────────────────────── */

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /[?&]v=([^&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches;
}

/* ── Template ───────────────────────────────────────────────────────────── */

const _tplSpecial = document.createElement('template');
_tplSpecial.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Raleway:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host { display: block; width: 100%; }

  /* ── Outer: borde animado + glow exterior ── */
  .outer-wrap {
    margin-left: auto;
    margin-right: auto;
    width: var(--card-width, min(260px, 95vw));
    border-radius: 24px;
    padding: 3px;
    background: linear-gradient(135deg,
      #f5d06b 0%, #c9a227 25%, #fff5c0 50%, #c9a227 75%, #f5d06b 100%);
    background-size: 300% 300%;
    animation: borderFlow 4s linear infinite, cardEntrance 0.8s cubic-bezier(0.22,1,0.36,1) both;
    box-shadow:
      0 0 0 1px rgba(197,162,39,0.3),
      0 0 30px rgba(197,162,39,0.45),
      0 0 70px rgba(197,162,39,0.2),
      0 0 120px rgba(197,162,39,0.08);
    transition: box-shadow 0.4s ease;
  }

  .outer-wrap:hover {
    box-shadow:
      0 0 0 1px rgba(245,208,107,0.6),
      0 0 50px rgba(197,162,39,0.7),
      0 0 100px rgba(197,162,39,0.35),
      0 0 160px rgba(197,162,39,0.15);
  }

  @keyframes borderFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(35px) scale(0.93); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Card interior ── */
  .card {
    position: relative;
    border-radius: 22px;
    overflow: hidden;
    background: rgba(10, 6, 22, 0.72);
    backdrop-filter: blur(28px) saturate(1.6);
    -webkit-backdrop-filter: blur(28px) saturate(1.6);
    transition: transform 0.35s ease;
  }

  .outer-wrap:hover .card { transform: scale(1.005); }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 22px;
    background: linear-gradient(135deg,
      rgba(245,208,107,0.15) 0%,
      transparent 35%,
      transparent 65%,
      rgba(197,162,39,0.08) 100%);
    pointer-events: none;
    z-index: 3;
  }

  /* ── Esquinas ── */
  .gold-corner {
    position: absolute;
    width: 56px; height: 56px;
    pointer-events: none;
    z-index: 5;
  }
  .gc-tl { top: 0; left: 0; }
  .gc-tr { top: 0; right: 0; transform: scaleX(-1); }
  .gc-bl { bottom: 0; left: 0; transform: scaleY(-1); }
  .gc-br { bottom: 0; right: 0; transform: scale(-1,-1); }

  /* ── Badge superior centrado (etiqueta) ── */
  .badge-wrap {
    position: absolute;
    top: var(--badge-top, auto);
    bottom: var(--badge-bottom, auto);
    left: 50%;
    transform: translateX(-50%);
    z-index: 8;
    white-space: nowrap;
  }

  .badge-top {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(10,6,22,0.75);
    border: 1.5px solid rgba(245,208,107,0.7);
    border-radius: 30px;
    padding: 5px 16px;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #f5d06b;
    text-shadow: 0 0 12px rgba(197,162,39,0.8);
    backdrop-filter: blur(8px);
    box-shadow: 0 0 16px rgba(197,162,39,0.3), inset 0 1px 0 rgba(255,245,192,0.2);
  }

  .badge-star {
    font-size: 11px;
    animation: starPulse 3s ease-in-out infinite;
    display: inline-block;
    color: #fff5c0;
  }
  @keyframes starPulse {
    0%,100% { transform: scale(1) rotate(0deg); opacity: 1; }
    50%      { transform: scale(1.4) rotate(180deg); opacity: 0.7; }
  }

  /* ── Logo flotante ── */
  .logo-wrap {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 9;
    width: 88px;
    opacity: 1;
    transition: opacity 1.2s ease;
  }

  .logo-wrap.logo-oculto {
    opacity: 0;
    pointer-events: none;
  }

  .logo-img {
    display: block;
    width: 100%;
    height: auto;          /* respeta el ratio original de la imagen */
    object-fit: contain;
    border-radius: 0;      /* sin recorte: la imagen flota libre */
    /* Halo luminoso multicapa */
    filter:
      drop-shadow(0 0 8px rgba(255,255,255,0.6))
      drop-shadow(0 0 18px rgba(197,162,39,0.85))
      drop-shadow(0 0 40px rgba(197,162,39,0.45))
      drop-shadow(0 0 70px rgba(197,162,39,0.2));
    animation:
      logoFloat   5s ease-in-out infinite,
      logoEntrance 1s cubic-bezier(0.22,1,0.36,1) both 0.4s;
    transition: filter 0.4s ease;
  }

  .outer-wrap:hover .logo-img {
    filter:
      drop-shadow(0 0 12px rgba(255,255,255,0.9))
      drop-shadow(0 0 28px rgba(245,208,107,1))
      drop-shadow(0 0 60px rgba(197,162,39,0.7))
      drop-shadow(0 0 100px rgba(197,162,39,0.35));
  }

  /* Flotación suave con leve balanceo */
  @keyframes logoFloat {
    0%   { transform: translateY(0px)   rotate(0deg)    scale(1); }
    25%  { transform: translateY(-7px)  rotate(1deg)    scale(1.01); }
    50%  { transform: translateY(-12px) rotate(0deg)    scale(1.02); }
    75%  { transform: translateY(-6px)  rotate(-1deg)   scale(1.01); }
    100% { transform: translateY(0px)   rotate(0deg)    scale(1); }
  }

  @keyframes logoEntrance {
    from { opacity: 0; transform: translateY(-24px) scale(0.75); }
    to   { opacity: 1; transform: translateY(0)      scale(1); }
  }

  /* Sin anillo — el halo de drop-shadow ya es suficiente para esta imagen */
  .logo-ring { display: none; }

  /* ── Área de video ── */
  .video-wrap {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .video-wrap.landscape { aspect-ratio: 16 / 9; }
  .video-wrap.portrait  { aspect-ratio: 9 / 16; }

  iframe, video {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
    transition: transform 0.5s ease;
  }

  .outer-wrap:hover .video-wrap.portrait video { transform: scale(1.03); }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0) 45%,
      rgba(6,3,18,0.65) 72%,
      rgba(6,3,18,0.93) 100%
    );
    z-index: 2;
    pointer-events: none;
  }

  /* ── Botón play/pause ── */
  .play-btn {
    position: absolute;
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 2.5px solid rgba(245,208,107,0.9);
    background: rgba(10,6,22,0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition:
      top 0.4s cubic-bezier(0.22,1,0.36,1),
      left 0.4s cubic-bezier(0.22,1,0.36,1),
      bottom 0.4s cubic-bezier(0.22,1,0.36,1),
      right 0.4s cubic-bezier(0.22,1,0.36,1),
      transform 0.4s cubic-bezier(0.22,1,0.36,1),
      width 0.4s cubic-bezier(0.22,1,0.36,1),
      height 0.4s cubic-bezier(0.22,1,0.36,1),
      background 0.25s, border-color 0.25s, box-shadow 0.25s;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 22px rgba(197,162,39,0.35), inset 0 1px 0 rgba(255,245,192,0.3);
    animation: pulsePlay 2.5s ease-in-out infinite;
  }

  .play-btn.is-playing {
    top: auto; left: auto;
    bottom: 1.2rem; right: 1.3rem;
    transform: none;
    width: 34px; height: 34px;
    animation: none;
    box-shadow: 0 0 10px rgba(197,162,39,0.25);
  }

  .play-btn:not(.is-playing):hover {
    transform: translate(-50%,-50%) scale(1.12);
    background: rgba(197,162,39,0.25);
    border-color: #f5d06b;
    box-shadow: 0 0 50px rgba(197,162,39,0.7), 0 0 90px rgba(197,162,39,0.25);
    animation: none;
  }

  .play-btn.is-playing:hover {
    transform: scale(1.15);
    background: rgba(197,162,39,0.22);
  }

  @keyframes pulsePlay {
    0%,100% { box-shadow: 0 0 22px rgba(197,162,39,0.35), inset 0 1px 0 rgba(255,245,192,0.3); }
    50%      { box-shadow: 0 0 40px rgba(197,162,39,0.65), 0 0 70px rgba(197,162,39,0.2); }
  }

  .play-icon {
    width: 0; height: 0;
    border-style: solid;
    border-width: 11px 0 11px 20px;
    border-color: transparent transparent transparent rgba(245,208,107,0.95);
    margin-left: 5px;
    filter: drop-shadow(0 0 5px rgba(245,208,107,0.8));
  }

  .pause-icon { display: flex; gap: 3px; }
  .pause-bar {
    width: 3px; height: 13px;
    background: rgba(245,208,107,0.95);
    border-radius: 2px;
    filter: drop-shadow(0 0 3px rgba(245,208,107,0.7));
  }

  /* ── Info inferior ── */
  .info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 1rem 1.3rem 1.1rem;
    z-index: 5;
  }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .badge-bottom {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(197,162,39,0.18);
    border: 1px solid rgba(245,208,107,0.45);
    border-radius: 20px;
    padding: 3px 10px;
    font-family: 'Raleway', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(245,208,107,0.9);
  }

  .badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(245,208,107,0.9);
    animation: dotPulse 1.5s ease-in-out infinite;
  }
  @keyframes dotPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:0.4; transform:scale(0.6); }
  }

  .titulo {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f5d06b;
    letter-spacing: 0.05em;
    line-height: 1.3;
    text-shadow: 0 0 24px rgba(197,162,39,0.6), 0 1px 0 rgba(0,0,0,0.9);
    flex: 1;
  }

  .gold-line {
    height: 1px;
    margin: 0.5rem 0 0.45rem;
    background: linear-gradient(to right, rgba(197,162,39,1), rgba(245,208,107,0.5), transparent);
  }

  .meta-time {
    font-family: 'Raleway', sans-serif;
    font-size: 11px;
    font-weight: 300;
    color: rgba(197,162,39,0.65);
    letter-spacing: 1px;
  }

  /* ── Shimmer sweep ── */
  .shimmer-bar {
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(105deg,
      transparent 30%, rgba(245,208,107,0.09) 50%, transparent 70%);
    pointer-events: none;
    z-index: 6;
    animation: shimmerMove 5s ease-in-out infinite 1.5s;
  }
  @keyframes shimmerMove {
    0%  { left: -60%; }
    50% { left: 120%; }
    100%{ left: 120%; }
  }

  /* ── Partículas ── */
  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
    overflow: hidden;
  }
  .particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(245,208,107,0.8);
    animation: floatUp var(--dur,6s) ease-in-out infinite var(--delay,0s);
    opacity: 0;
  }
  @keyframes floatUp {
    0%   { opacity:0; transform: translateY(0) scale(0.5); }
    20%  { opacity:0.8; }
    80%  { opacity:0.3; }
    100% { opacity:0; transform: translateY(-80px) scale(1.5); }
  }
</style>

<div class="outer-wrap">
  <div class="card">
    <div class="shimmer-bar"></div>
    <div class="particles" id="particles"></div>

    <!-- Badge superior (etiqueta) -->
    <div class="badge-wrap" id="badgeWrap">
      <div class="badge-top" id="badgeTop">
        <span class="badge-star">✦</span>
        <span id="etiquetaEl">Special Edition</span>
        <span class="badge-star">✦</span>
      </div>
    </div>

    <!-- Logo flotante esquina superior derecha -->
    <div class="logo-wrap" id="logoWrap" style="display:none">
      <div class="logo-ring"></div>
      <img class="logo-img" id="logoImg" src="" alt="logo" />
    </div>

    <!-- Esquinas decorativas -->
    <svg class="gold-corner gc-tl" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg-grad-tl" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fff5c0"/>
          <stop offset="50%" stop-color="#f5d06b"/>
          <stop offset="100%" stop-color="rgba(197,162,39,0.2)"/>
        </linearGradient>
      </defs>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="rgba(245,208,107,0.25)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="url(#sg-grad-tl)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="#f5d06b" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>
    <svg class="gold-corner gc-tr" viewBox="0 0 56 56" fill="none">
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="rgba(245,208,107,0.25)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="#f5d06b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="#f5d06b" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>
    <svg class="gold-corner gc-bl" viewBox="0 0 56 56" fill="none">
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="rgba(245,208,107,0.25)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="#f5d06b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="#f5d06b" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>
    <svg class="gold-corner gc-br" viewBox="0 0 56 56" fill="none">
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="rgba(245,208,107,0.25)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="#f5d06b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="#f5d06b" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>

    <!-- Contenedor de video -->
    <div class="video-wrap" id="videoWrap"></div>

    <!-- Info inferior -->
    <div class="info">
      <div class="info-row">
        <div class="badge-bottom">
          <span class="badge-dot"></span>
          <span id="badgeEl">Special</span>
        </div>
        <span class="meta-time" id="timeEl"></span>
      </div>
      <div class="gold-line"></div>
      <div class="titulo" id="titleEl">Título</div>
    </div>
  </div>
</div>
`;

/* ── Clase ──────────────────────────────────────────────────────────────── */

class VideoGoldSpecial extends HTMLElement {
  static get observedAttributes() {
    return ['titulo', 'video-desktop', 'video-mobile', 'ancho-desktop', 'badge', 'etiqueta', 'logo', 'logo-duracion'];
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(_tplSpecial.content.cloneNode(true));

    this._titleEl   = this._shadow.getElementById('titleEl');
    this._timeEl    = this._shadow.getElementById('timeEl');
    this._badgeEl   = this._shadow.getElementById('badgeEl');
    this._etiquetaEl= this._shadow.getElementById('etiquetaEl');
    this._logoWrap  = this._shadow.getElementById('logoWrap');
    this._logoImg   = this._shadow.getElementById('logoImg');
    this._videoWrap = this._shadow.getElementById('videoWrap');
    this._outer     = this._shadow.querySelector('.outer-wrap');
    this._playing   = false;

    this._applyStatic();
    this._render();
    this._spawnParticles();

    this._mq = window.matchMedia('(max-width: 768px)');
    this._mqHandler = () => this._render();
    this._mq.addEventListener('change', this._mqHandler);
  }

  disconnectedCallback() {
    this._mq && this._mq.removeEventListener('change', this._mqHandler);
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._shadow) return;
    if (name === 'titulo')   { this._titleEl.textContent = val || 'Sin título'; return; }
    if (name === 'badge')    { this._badgeEl.textContent = val || 'Special'; return; }
    if (name === 'etiqueta') { this._etiquetaEl.textContent = val || 'Special Edition'; return; }
    if (name === 'logo')     { this._applyLogo(val); return; }
    this._render();
  }

  /* Aplica los atributos que no dependen del breakpoint */
  _applyStatic() {
    this._titleEl.textContent    = this.getAttribute('titulo')   || 'Sin título';
    this._badgeEl.textContent    = this.getAttribute('badge')    || 'Special';
    this._etiquetaEl.textContent = this.getAttribute('etiqueta') || 'Special Edition';
    this._applyLogo(this.getAttribute('logo'));
  }

  _applyLogo(url) {
    if (url) {
      this._logoImg.src = url;
      this._logoWrap.style.display = 'block';
    } else {
      this._logoWrap.style.display = 'none';
    }
  }

  _render() {
    const videoDesktop = this.getAttribute('video-desktop') || '';
    const videoMobile  = this.getAttribute('video-mobile')  || '';
    const anchoDesktop = this.getAttribute('ancho-desktop') || '80vw';
    const mobile = isMobile();

    if (mobile) {
      this._outer.style.setProperty('--card-width', 'min(260px, 95vw)');
      this._outer.style.setProperty('--badge-top', '14px');
      this._outer.style.setProperty('--badge-bottom', 'auto');
      this._videoWrap.className = 'video-wrap portrait';
      this._videoWrap.innerHTML = `
        <video id="vid" src="${videoMobile}" loop playsinline></video>
        <div class="overlay"></div>
        <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
          <span class="play-icon" id="playIcon"></span>
        </button>
      `;
      this._timeEl.textContent = '0:00';
      this._bindVideo();
    } else {
      this._outer.style.setProperty('--card-width', anchoDesktop);
      this._outer.style.setProperty('--badge-top', 'auto');
      this._outer.style.setProperty('--badge-bottom', '72px');
      const ytId = extractYouTubeId(videoDesktop);
      const embedSrc = ytId
        ? `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&color=white`
        : '';
      this._videoWrap.className = 'video-wrap landscape';
      this._videoWrap.innerHTML = embedSrc
        ? `<iframe src="${embedSrc}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
           <div class="overlay"></div>`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(245,208,107,0.5);font-family:'Raleway',sans-serif;font-size:13px;letter-spacing:2px;">
             Sin video de YouTube configurado
           </div>`;
      this._timeEl.textContent = '';
    }
  }

  _bindVideo() {
    const vid  = this._shadow.getElementById('vid');
    const btn  = this._shadow.getElementById('playBtn');
    const icon = this._shadow.getElementById('playIcon');
    if (!vid || !btn) return;

    const duracion = parseFloat(this.getAttribute('logo-duracion') ?? '4') * 1000;
    let logoTimer = null;

    const ocultarLogo = () => {
      this._logoWrap.classList.add('logo-oculto');
    };

    const mostrarLogo = () => {
      clearTimeout(logoTimer);
      this._logoWrap.classList.remove('logo-oculto');
    };

    const arrancarTimer = () => {
      clearTimeout(logoTimer);
      logoTimer = setTimeout(ocultarLogo, duracion);
    };

    btn.addEventListener('click', () => {
      if (this._playing) {
        vid.pause();
        this._playing = false;
        btn.classList.remove('is-playing');
        icon.className = 'play-icon';
        icon.innerHTML = '';
        btn.style.animation = '';
        /* Al pausar: restaurar logo y cancelar el timer */
        mostrarLogo();
      } else {
        vid.play().catch(() => {});
        this._playing = true;
        btn.classList.add('is-playing');
        icon.className = 'pause-icon';
        icon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
        btn.style.animation = 'none';
        /* Al reproducir: arrancar el contador para ocultar el logo */
        arrancarTimer();
      }
    });

    vid.addEventListener('timeupdate', () => {
      const t = vid.currentTime || 0;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      this._timeEl.textContent = `${m}:${s}`;
    });

    vid.addEventListener('ended', () => {
      this._playing = false;
      btn.classList.remove('is-playing');
      icon.className = 'play-icon';
      icon.innerHTML = '';
      btn.style.animation = '';
      /* Al terminar: restaurar logo */
      mostrarLogo();
    });
  }

  _spawnParticles() {
    const container = this._shadow.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: ${Math.random() * 40}%;
        --dur: ${4 + Math.random() * 5}s;
        --delay: -${Math.random() * 6}s;
        width: ${1 + Math.random() * 2}px;
        height: ${1 + Math.random() * 2}px;
      `;
      container.appendChild(p);
    }
  }
}

customElements.define('video-gold-special', VideoGoldSpecial);
