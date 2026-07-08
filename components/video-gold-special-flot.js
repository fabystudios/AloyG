/**
 * <video-gold-special-flot> — Variante con paneles flotantes, temas y fondo personalizable
 *
 * Basado 100% en video-gold-special.js (original). Agrega:
 *   flotante1   — PNG izquierdo (burbujas animadas canvas)
 *   flotante2   — PNG derecho  (burbujas animadas canvas)
 *   tema        — "dorado" (default) | "celeste" | "rojo" | "verde" | "violeta"
 *   fondo       — color CSS para el interior de la card, ej: "rgba(10,20,40,0.85)"
 */

/* ── Helpers ── */
function extractYouTubeIdF(url) {
  if (!url) return null;
  const patterns = [/youtu\.be\/([^?&#]+)/,/[?&]v=([^&#]+)/,/youtube\.com\/embed\/([^?&#]+)/,/youtube\.com\/shorts\/([^?&#]+)/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}
function isMobileF() { return window.matchMedia('(max-width: 768px)').matches; }

/* ── Temas: mapas de colores ── */
const TEMAS = {
  dorado:  { c1:'#f5d06b', c2:'#c9a227', c3:'#fff5c0', ca:'rgba(197,162,39,', cb:'rgba(245,208,107,', cc:'rgba(255,245,192,', bg:'rgba(10,6,22,', },
  celeste: { c1:'#6bd4f5', c2:'#2799c9', c3:'#c0f0ff', ca:'rgba(39,153,201,',  cb:'rgba(107,212,245,',cc:'rgba(192,240,255,',bg:'rgba(4,18,28,',  },
  rojo:    { c1:'#f56b6b', c2:'#c92727', c3:'#ffc0c0', ca:'rgba(201,39,39,',   cb:'rgba(245,107,107,',cc:'rgba(255,192,192,',bg:'rgba(22,4,4,',   },
  verde:   { c1:'#6bf5a0', c2:'#27c960', c3:'#c0ffd8', ca:'rgba(39,201,96,',   cb:'rgba(107,245,160,',cc:'rgba(192,255,216,',bg:'rgba(4,22,10,',  },
  violeta: { c1:'#c46bf5', c2:'#7b27c9', c3:'#ecc0ff', ca:'rgba(123,39,201,',  cb:'rgba(196,107,245,',cc:'rgba(236,192,255,',bg:'rgba(12,4,22,',  },
};

/* ── Template ── */
const _tplSpecialFlot = document.createElement('template');
_tplSpecialFlot.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Raleway:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host { display: block; width: 100%; }

  /* ── Outer: borde animado + glow exterior — colores via JS vars inline ── */
  .outer-wrap {
    margin-left: auto;
    margin-right: auto;
    width: var(--card-width, min(260px, 95vw));
    border-radius: 24px;
    padding: 3px;
    background: var(--t-border-grad);
    background-size: 300% 300%;
    animation: borderFlow 4s linear infinite, cardEntrance 0.8s cubic-bezier(0.22,1,0.36,1) both;
    box-shadow: var(--t-shadow);
    transition: box-shadow 0.4s ease;
  }
  .outer-wrap:hover { box-shadow: var(--t-shadow-hover); }

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
    background: var(--t-card-bg);
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
    background: var(--t-refl);
    pointer-events: none;
    z-index: 3;
  }

  /* ── Esquinas ── */
  .gold-corner { position: absolute; width: 56px; height: 56px; pointer-events: none; z-index: 5; }
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
    background: var(--t-badge-bg);
    border: 1.5px solid var(--t-c-border);
    border-radius: 30px;
    padding: 5px 16px;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--t-c1);
    text-shadow: 0 0 12px var(--t-glow);
    backdrop-filter: blur(8px);
    box-shadow: 0 0 16px var(--t-glow2), inset 0 1px 0 var(--t-shine);
  }
  .badge-star {
    font-size: 11px;
    animation: starPulse 3s ease-in-out infinite;
    display: inline-block;
    color: var(--t-c3);
  }
  @keyframes starPulse {
    0%,100% { transform: scale(1) rotate(0deg); opacity: 1; }
    50%      { transform: scale(1.4) rotate(180deg); opacity: 0.7; }
  }

  /* ── Logo flotante ── */
  .logo-wrap {
    position: absolute;
    top: 12px; right: 12px;
    z-index: 9;
    width: 88px;
    opacity: 1;
    transition: opacity 1.2s ease;
  }
  .logo-wrap.logo-oculto { opacity: 0; pointer-events: none; }
  .logo-img {
    display: block;
    width: 100%; height: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 18px var(--t-glow)) drop-shadow(0 0 40px var(--t-glow2)) drop-shadow(0 0 70px var(--t-glow3));
    animation: logoFloat 5s ease-in-out infinite, logoEntrance 1s cubic-bezier(0.22,1,0.36,1) both 0.4s;
    transition: filter 0.4s ease;
  }
  .outer-wrap:hover .logo-img {
    filter: drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 28px var(--t-c-border)) drop-shadow(0 0 60px var(--t-glow)) drop-shadow(0 0 100px var(--t-glow2));
  }
  @keyframes logoFloat {
    0%   { transform: translateY(0px)   rotate(0deg)  scale(1); }
    25%  { transform: translateY(-7px)  rotate(1deg)  scale(1.01); }
    50%  { transform: translateY(-12px) rotate(0deg)  scale(1.02); }
    75%  { transform: translateY(-6px)  rotate(-1deg) scale(1.01); }
    100% { transform: translateY(0px)   rotate(0deg)  scale(1); }
  }
  @keyframes logoEntrance {
    from { opacity: 0; transform: translateY(-24px) scale(0.75); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .logo-ring { display: none; }

  /* ── Área de video ── */
  .video-wrap { position: relative; width: 100%; overflow: hidden; }
  .video-wrap.landscape { aspect-ratio: 16 / 9; }
  .video-wrap.portrait  { aspect-ratio: 9 / 16; }
  iframe, video { display: block; width: 100%; height: 100%; border: none; transition: transform 0.5s ease; }
  .outer-wrap:hover .video-wrap.portrait video { transform: scale(1.03); }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(6,3,18,0.65) 72%, rgba(6,3,18,0.93) 100%);
    z-index: 2;
    pointer-events: none;
  }

  /* ── Botón play/pause ── */
  .play-btn {
    position: absolute;
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 2.5px solid var(--t-c1);
    background: var(--t-btn-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: top .4s cubic-bezier(.22,1,.36,1), left .4s cubic-bezier(.22,1,.36,1),
      bottom .4s cubic-bezier(.22,1,.36,1), right .4s cubic-bezier(.22,1,.36,1),
      transform .4s cubic-bezier(.22,1,.36,1), width .4s cubic-bezier(.22,1,.36,1),
      height .4s cubic-bezier(.22,1,.36,1), background .25s, border-color .25s, box-shadow .25s;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 22px var(--t-glow2), inset 0 1px 0 var(--t-shine);
    animation: pulsePlay 2.5s ease-in-out infinite;
  }
  .play-btn.is-playing { top:auto; left:auto; bottom:1.2rem; right:1.3rem; transform:none; width:34px; height:34px; animation:none; box-shadow:0 0 10px var(--t-glow3); }
  .play-btn:not(.is-playing):hover { transform:translate(-50%,-50%) scale(1.12); background:var(--t-glow3); border-color:var(--t-c1); box-shadow:0 0 50px var(--t-glow), 0 0 90px var(--t-glow3); animation:none; }
  .play-btn.is-playing:hover { transform:scale(1.15); background:var(--t-glow3); }
  @keyframes pulsePlay {
    0%,100% { box-shadow: 0 0 22px var(--t-glow2), inset 0 1px 0 var(--t-shine); }
    50%      { box-shadow: 0 0 40px var(--t-glow),  0 0 70px var(--t-glow3); }
  }
  .play-icon { width:0; height:0; border-style:solid; border-width:11px 0 11px 20px; border-color:transparent transparent transparent var(--t-c1); margin-left:5px; filter:drop-shadow(0 0 5px var(--t-c1)); }
  .pause-icon { display:flex; gap:3px; }
  .pause-bar { width:3px; height:13px; background:var(--t-c1); border-radius:2px; filter:drop-shadow(0 0 3px var(--t-c1)); }

  /* ── Info inferior ── */
  .info { position:absolute; bottom:0; left:0; right:0; padding:1rem 1.3rem 1.1rem; z-index:5; }
  .info-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .badge-bottom {
    display:inline-flex; align-items:center; gap:5px;
    background:var(--t-glow3); border:1px solid var(--t-c-border);
    border-radius:20px; padding:3px 10px;
    font-family:'Raleway',sans-serif; font-size:10px; font-weight:500;
    letter-spacing:2px; text-transform:uppercase; color:var(--t-c1);
  }
  .badge-dot { width:5px; height:5px; border-radius:50%; background:var(--t-c1); animation:dotPulse 1.5s ease-in-out infinite; }
  @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.6);} }
  .titulo { font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; color:var(--t-c1); letter-spacing:.05em; line-height:1.3; text-shadow:0 0 24px var(--t-glow), 0 1px 0 rgba(0,0,0,.9); flex:1; }
  .gold-line { height:1px; margin:.5rem 0 .45rem; background:linear-gradient(to right, var(--t-c2), var(--t-c1), transparent); }
  .meta-time { font-family:'Raleway',sans-serif; font-size:11px; font-weight:300; color:var(--t-glow); letter-spacing:1px; }

  /* ── Shimmer ── */
  .shimmer-bar {
    position:absolute; top:0; left:-100%; width:60%; height:100%;
    background:linear-gradient(105deg, transparent 30%, var(--t-shimmer) 50%, transparent 70%);
    pointer-events:none; z-index:6;
    animation:shimmerMove 5s ease-in-out infinite 1.5s;
  }
  @keyframes shimmerMove { 0%{left:-60%;}50%{left:120%;}100%{left:120%;} }

  /* ── Partículas ── */
  .particles { position:absolute; inset:0; pointer-events:none; z-index:4; overflow:hidden; }
  .particle { position:absolute; border-radius:50%; background:var(--t-c1); animation:floatUp var(--dur,6s) ease-in-out infinite var(--delay,0s); opacity:0; }
  @keyframes floatUp { 0%{opacity:0;transform:translateY(0) scale(.5);}20%{opacity:.8;}80%{opacity:.3;}100%{opacity:0;transform:translateY(-80px) scale(1.5);} }

  /* ══ MODO FLOTANTES ══════════════════════════════════
     Layout: flex row. Video portrait en el centro (ancho fijo),
     paneles laterales rellenan el resto.
     El alto de la card lo dicta el video via aspect-ratio.
     ════════════════════════════════════════════════════ */
  .card.has-flotantes {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  /* Video: ancho Y alto fijos — aspect-ratio no funciona solo en flex item */
  .card.has-flotantes .video-wrap {
    flex: 0 0 var(--vid-w, 260px);
    width:  var(--vid-w, 260px);
    height: var(--vid-h, 463px); /* 260 * 16/9 ≈ 463 */
    z-index: 2;
  }

  /* Paneles laterales */
  .panel-flot {
    flex: 1 1 0;
    position: relative;
    overflow: hidden;
    min-width: 0;
    background: var(--t-card-bg);
  }
  .panel-flot canvas {
    position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  }
  /* Fundido hacia el video */
  .panel-flot::after {
    content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2;
  }
  .panel-flot.pf-izq::after { background: linear-gradient(to left,  var(--t-card-bg) 0%, transparent 60%); }
  .panel-flot.pf-der::after { background: linear-gradient(to right, var(--t-card-bg) 0%, transparent 60%); }

  /* Los absolutos (badge, logo, shimmer, etc.) ya usan position:absolute
     con left/right/top/bottom referidos a la card — siguen funcionando igual */
  .card.has-flotantes .badge-wrap  { z-index: 10; }
  .card.has-flotantes .logo-wrap   { z-index: 11; }
  .card.has-flotantes .info        { z-index: 6;  }
  .card.has-flotantes .shimmer-bar { z-index: 6;  }
  .card.has-flotantes .gold-corner { z-index: 5;  }
</style>

<div class="outer-wrap">
  <div class="card">
    <div class="shimmer-bar"></div>
    <div class="particles" id="particles"></div>

    <div class="badge-wrap" id="badgeWrap">
      <div class="badge-top" id="badgeTop">
        <span class="badge-star">✦</span>
        <span id="etiquetaEl">Special Edition</span>
        <span class="badge-star">✦</span>
      </div>
    </div>

    <div class="logo-wrap" id="logoWrap" style="display:none">
      <div class="logo-ring"></div>
      <img class="logo-img" id="logoImg" src="" alt="logo" />
    </div>

    <!-- Esquinas -->
    <svg class="gold-corner gc-tl" viewBox="0 0 56 56" fill="none">
      <defs><linearGradient id="sg-gf-tl" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="var(--t-c3)"/>
        <stop offset="50%" stop-color="var(--t-c1)"/>
        <stop offset="100%" stop-color="var(--t-glow3)"/>
      </linearGradient></defs>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-glow2)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="url(#sg-gf-tl)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="var(--t-c1)" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>
    <svg class="gold-corner gc-tr" viewBox="0 0 56 56" fill="none">
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-glow2)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-c1)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="var(--t-c1)" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>
    <svg class="gold-corner gc-bl" viewBox="0 0 56 56" fill="none">
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-glow2)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-c1)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="var(--t-c1)" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>
    <svg class="gold-corner gc-br" viewBox="0 0 56 56" fill="none">
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-glow2)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M3 30 L3 6 Q3 3 6 3 L30 3" stroke="var(--t-c1)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="0" y="0" width="6" height="6" rx="1" fill="var(--t-c1)" transform="rotate(45 3 3)" opacity="0.9"/>
    </svg>

    <!-- Paneles flotantes laterales (ocultos por defecto) -->
    <div class="panel-flot pf-izq" id="panelIzq" style="display:none">
      <canvas id="canvasIzq"></canvas>
    </div>

    <!-- Video -->
    <div class="video-wrap" id="videoWrap"></div>

    <div class="panel-flot pf-der" id="panelDer" style="display:none">
      <canvas id="canvasDer"></canvas>
    </div>

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

/* ── Clase ── */
class VideoGoldSpecialFlot extends HTMLElement {
  static get observedAttributes() {
    return ['titulo','video-desktop','video-mobile','ancho-desktop','badge','etiqueta',
            'logo','logo-duracion','poster-mobile','poster-desktop',
            'flotante1','flotante2','tema','fondo'];
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(_tplSpecialFlot.content.cloneNode(true));

    this._titleEl    = this._shadow.getElementById('titleEl');
    this._timeEl     = this._shadow.getElementById('timeEl');
    this._badgeEl    = this._shadow.getElementById('badgeEl');
    this._etiquetaEl = this._shadow.getElementById('etiquetaEl');
    this._logoWrap   = this._shadow.getElementById('logoWrap');
    this._logoImg    = this._shadow.getElementById('logoImg');
    this._videoWrap  = this._shadow.getElementById('videoWrap');
    this._outer      = this._shadow.querySelector('.outer-wrap');
    this._card       = this._shadow.querySelector('.card');
    this._panelIzq   = this._shadow.getElementById('panelIzq');
    this._panelDer   = this._shadow.getElementById('panelDer');
    this._canvasIzq  = this._shadow.getElementById('canvasIzq');
    this._canvasDer  = this._shadow.getElementById('canvasDer');
    this._playing    = false;

    this._applyTema(this.getAttribute('tema'));
    this._applyFondo(this.getAttribute('fondo'));
    this._applyStatic();
    this._render();
    this._spawnParticles();

    this._mq = window.matchMedia('(max-width: 768px)');
    this._mqHandler = () => this._render();
    this._mq.addEventListener('change', this._mqHandler);
  }

  disconnectedCallback() {
    this._mq && this._mq.removeEventListener('change', this._mqHandler);
    this._stopBubbles(this._canvasIzq);
    this._stopBubbles(this._canvasDer);
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._shadow) return;
    if (name === 'titulo')   { this._titleEl.textContent    = val || 'Sin título';       return; }
    if (name === 'badge')    { this._badgeEl.textContent    = val || 'Special';          return; }
    if (name === 'etiqueta') { this._etiquetaEl.textContent = val || 'Special Edition';  return; }
    if (name === 'logo')     { this._applyLogo(val);  return; }
    if (name === 'tema')     { this._applyTema(val);  return; }
    if (name === 'fondo')    { this._applyFondo(val); return; }
    this._render();
  }

  /* ── Tema: inyecta CSS variables en el outer-wrap ── */
  _applyTema(nombre) {
    const t = TEMAS[nombre] || TEMAS.dorado;
    const ow = this._outer || this._shadow && this._shadow.querySelector('.outer-wrap');
    if (!ow) return;
    const s = ow.style;
    // Colores base
    s.setProperty('--t-c1',       t.c1);
    s.setProperty('--t-c2',       t.c2);
    s.setProperty('--t-c3',       t.c3);
    // Glow vars (construidos desde prefijos)
    s.setProperty('--t-glow',     t.ca  + '0.65)');
    s.setProperty('--t-glow2',    t.ca  + '0.35)');
    s.setProperty('--t-glow3',    t.ca  + '0.18)');
    s.setProperty('--t-shine',    t.cc  + '0.25)');
    s.setProperty('--t-c-border', t.cb  + '0.7)');
    s.setProperty('--t-shimmer',  t.cb  + '0.09)');
    // Fondo de la card (solo si no hay override de `fondo`)
    if (!this.getAttribute('fondo')) {
      s.setProperty('--t-card-bg', t.bg + '0.72)');
      s.setProperty('--t-btn-bg',  t.bg + '0.6)');
      s.setProperty('--t-badge-bg',t.bg + '0.75)');
    }
    s.setProperty('--t-refl', `linear-gradient(135deg, ${t.cb}0.15) 0%, transparent 35%, transparent 65%, ${t.ca}0.08) 100%)`);
    // Borde animado exterior
    s.setProperty('--t-border-grad', `linear-gradient(135deg, ${t.c1} 0%, ${t.c2} 25%, ${t.c3} 50%, ${t.c2} 75%, ${t.c1} 100%)`);
    s.setProperty('--t-shadow',      `0 0 0 1px ${t.ca}0.3), 0 0 30px ${t.ca}0.45), 0 0 70px ${t.ca}0.2), 0 0 120px ${t.ca}0.08)`);
    s.setProperty('--t-shadow-hover',`0 0 0 1px ${t.cb}0.6), 0 0 50px ${t.ca}0.7), 0 0 100px ${t.ca}0.35), 0 0 160px ${t.ca}0.15)`);
    // Guardar referencia del tema para los canvas
    this._temaActual = t;
  }

  /* ── Fondo personalizado ── */
  _applyFondo(color) {
    const ow = this._outer || this._shadow && this._shadow.querySelector('.outer-wrap');
    if (!ow) return;
    if (color) {
      ow.style.setProperty('--t-card-bg',  color);
      ow.style.setProperty('--t-btn-bg',   color);
      ow.style.setProperty('--t-badge-bg', color);
    } else {
      // Restaurar desde el tema actual
      const t = TEMAS[this.getAttribute('tema')] || TEMAS.dorado;
      ow.style.setProperty('--t-card-bg',  t.bg + '0.72)');
      ow.style.setProperty('--t-btn-bg',   t.bg + '0.6)');
      ow.style.setProperty('--t-badge-bg', t.bg + '0.75)');
    }
  }

  _applyStatic() {
    this._titleEl.textContent    = this.getAttribute('titulo')   || 'Sin título';
    this._badgeEl.textContent    = this.getAttribute('badge')    || 'Special';
    this._etiquetaEl.textContent = this.getAttribute('etiqueta') || 'Special Edition';
    this._applyLogo(this.getAttribute('logo'));
  }

  _applyLogo(url) {
    if (url) { this._logoImg.src = url; this._logoWrap.style.display = 'block'; }
    else      { this._logoWrap.style.display = 'none'; }
  }

  /* ── _render: idéntico al original, más el bloque de flotantes ── */
  _render() {
    const videoDesktop     = this.getAttribute('video-desktop')  || '';
    const videoMobile      = this.getAttribute('video-mobile')   || '';
    const anchoDesktop     = this.getAttribute('ancho-desktop')  || '80vw';
    const posterMobileAttr = this.getAttribute('poster-mobile');
    const posterDesktopAttr= this.getAttribute('poster-desktop');
    const flotante1        = this.getAttribute('flotante1') || '';
    const flotante2        = this.getAttribute('flotante2') || '';
    const hasFlotantes     = !!(flotante1 || flotante2);
    const mobile           = isMobileF();

    const ytId         = extractYouTubeIdF(videoDesktop);
    const ytThumb      = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '';
    const isYouTube    = !!ytId;
    const isMp4Desktop = !isYouTube && !!videoDesktop;

    /* ── Paneles flotantes ── */
    if (hasFlotantes) {
      this._card.classList.add('has-flotantes');
      if (flotante1) { this._panelIzq.style.display = ''; this._startBubbles(this._canvasIzq, flotante1); }
      else           { this._panelIzq.style.display = 'none'; this._stopBubbles(this._canvasIzq); }
      if (flotante2) { this._panelDer.style.display = ''; this._startBubbles(this._canvasDer, flotante2); }
      else           { this._panelDer.style.display = 'none'; this._stopBubbles(this._canvasDer); }
    } else {
      this._card.classList.remove('has-flotantes');
      this._panelIzq.style.display = 'none';
      this._panelDer.style.display = 'none';
      this._stopBubbles(this._canvasIzq);
      this._stopBubbles(this._canvasDer);
    }

    if (mobile) {
      /* ─ MOBILE ─ */
      if (hasFlotantes) {
        // Mismo ancho que el original mobile: min(260px, 95vw)
        // Alto = ancho * 16/9 — seteado explícito porque aspect-ratio no funciona solo en flex
        const vidW = Math.min(260, Math.round(window.innerWidth * 0.95));
        const vidH = Math.round(vidW * 16 / 9);
        this._outer.style.setProperty('--card-width', '95vw');
        this._card.style.setProperty('--vid-w', vidW + 'px');
        this._card.style.setProperty('--vid-h', vidH + 'px');
      } else {
        this._outer.style.setProperty('--card-width', 'min(260px, 95vw)');
        this._card.style.removeProperty('--vid-w');
        this._card.style.removeProperty('--vid-h');
      }
      this._outer.style.setProperty('--badge-top',    '14px');
      this._outer.style.setProperty('--badge-bottom', 'auto');
      this._videoWrap.className = 'video-wrap portrait';

      if (videoMobile) {
        let poster = posterMobileAttr || ytThumb || '';
        this._videoWrap.innerHTML = `
          <video id="vid" data-src="${videoMobile}" ${poster ? `poster="${poster}"` : ''} loop playsinline></video>
          <div class="overlay"></div>
          <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
            <span class="play-icon" id="playIcon"></span>
          </button>`;
        this._timeEl.textContent = '0:00';
        this._setupLazyVideo(true);
      } else {
        this._videoWrap.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(245,208,107,0.5);font-family:'Raleway',sans-serif;font-size:13px;letter-spacing:2px;">Sin video mobile configurado</div>`;
        this._timeEl.textContent = '';
      }

    } else {
      /* ─ DESKTOP ─ */
      if (hasFlotantes) {
        /* Con flotantes en desktop:
           El video portrait usa ancho = anchoDesktop × 0.38 (o mínimo 200px).
           La card ocupa anchoDesktop completo; los paneles flanquean el video. */
        this._outer.style.setProperty('--card-width', anchoDesktop);
        requestAnimationFrame(() => {
          const cardW = this._outer.getBoundingClientRect().width;
          const vidW  = Math.max(200, Math.round(cardW * 0.38));
          const vidH  = Math.round(vidW * 16 / 9);
          this._card.style.setProperty('--vid-w', vidW + 'px');
          this._card.style.setProperty('--vid-h', vidH + 'px');
        });
        this._outer.style.setProperty('--badge-top',    '14px');
        this._outer.style.setProperty('--badge-bottom', 'auto');
        this._videoWrap.className = 'video-wrap portrait';
        const videoSrc = isMp4Desktop ? videoDesktop : videoMobile;
        if (videoSrc) {
          let poster = posterDesktopAttr || posterMobileAttr || ytThumb || '';
          this._videoWrap.innerHTML = `
            <video id="vid" data-src="${videoSrc}" ${poster ? `poster="${poster}"` : ''} loop playsinline></video>
            <div class="overlay"></div>
            <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
              <span class="play-icon" id="playIcon"></span>
            </button>`;
          this._timeEl.textContent = '0:00';
          this._setupLazyVideo(false);
        } else {
          this._videoWrap.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(245,208,107,0.5);font-family:'Raleway',sans-serif;font-size:13px;letter-spacing:2px;">Sin video configurado</div>`;
          this._timeEl.textContent = '';
        }

      } else {
        /* Sin flotantes: idéntico al original */
        this._outer.style.setProperty('--card-width', anchoDesktop);
        this._outer.style.removeProperty('--vid-w');
        this._card.style.removeProperty('--vid-w');
        this._card.style.removeProperty('--vid-h');
        this._outer.style.setProperty('--badge-top',    'auto');
        this._outer.style.setProperty('--badge-bottom', '72px');
        this._videoWrap.className = 'video-wrap landscape';

        if (isYouTube) {
          const embedSrc = `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&color=white`;
          this._videoWrap.innerHTML = `
            <iframe src="${embedSrc}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
            <div class="overlay"></div>`;
          this._timeEl.textContent = '';
        } else if (isMp4Desktop) {
          let poster = posterDesktopAttr || ytThumb || '';
          this._videoWrap.innerHTML = `
            <video id="vid" data-src="${videoDesktop}" ${poster ? `poster="${poster}"` : ''} loop playsinline></video>
            <div class="overlay"></div>
            <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
              <span class="play-icon" id="playIcon"></span>
            </button>`;
          this._timeEl.textContent = '0:00';
          this._setupLazyVideo(false);
        } else if (posterDesktopAttr) {
          this._videoWrap.innerHTML = `<img src="${posterDesktopAttr}" style="width:100%;height:100%;object-fit:cover;display:block;" alt=""/><div class="overlay"></div>`;
          this._timeEl.textContent = '';
        } else {
          this._videoWrap.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(245,208,107,0.5);font-family:'Raleway',sans-serif;font-size:13px;letter-spacing:2px;">Sin video configurado</div>`;
          this._timeEl.textContent = '';
        }
      }
    }
  }

  _setupLazyVideo(isMobileCtx) {
    const vid = this._shadow.getElementById('vid');
    if (!vid) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !vid.src) {
            vid.src = vid.dataset.src; vid.load();
            this._bindVideo(isMobileCtx); observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      observer.observe(vid);
    } else {
      vid.src = vid.dataset.src; vid.load(); this._bindVideo(isMobileCtx);
    }
  }

  _bindVideo(isMobileCtx) {
    const vid  = this._shadow.getElementById('vid');
    const btn  = this._shadow.getElementById('playBtn');
    const icon = this._shadow.getElementById('playIcon');
    if (!vid || !btn) return;

    const duracion = parseFloat(this.getAttribute('logo-duracion') ?? '4') * 1000;
    let logoTimer  = null;
    const ocultarLogo = () => this._logoWrap.classList.add('logo-oculto');
    const mostrarLogo = () => { clearTimeout(logoTimer); this._logoWrap.classList.remove('logo-oculto'); };
    const arrancarTimer = () => { clearTimeout(logoTimer); logoTimer = setTimeout(ocultarLogo, duracion); };

    btn.addEventListener('click', () => {
      if (this._playing) {
        vid.pause(); this._playing = false;
        btn.classList.remove('is-playing');
        icon.className = 'play-icon'; icon.innerHTML = '';
        btn.style.animation = '';
        if (isMobileCtx) mostrarLogo();
      } else {
        vid.play().catch(() => {}); this._playing = true;
        btn.classList.add('is-playing');
        icon.className = 'pause-icon';
        icon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
        btn.style.animation = 'none';
        if (isMobileCtx) arrancarTimer();
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
      icon.className = 'play-icon'; icon.innerHTML = '';
      btn.style.animation = '';
      if (isMobileCtx) mostrarLogo();
    });
  }

  _spawnParticles() {
    const container = this._shadow.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `left:${Math.random()*100}%;bottom:${Math.random()*40}%;--dur:${4+Math.random()*5}s;--delay:-${Math.random()*6}s;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;`;
      container.appendChild(p);
    }
  }

  /* ── Motor de burbujas canvas ── */
  _stopBubbles(canvas) {
    if (!canvas) return;
    if (canvas._rafId) cancelAnimationFrame(canvas._rafId);
    canvas._rafId = null;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  _startBubbles(canvas, imgSrc) {
    if (!canvas) return;
    this._stopBubbles(canvas);

    const img = new Image();
    img.src = imgSrc;

    const waitAndLaunch = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) { requestAnimationFrame(waitAndLaunch); return; }
      canvas.width  = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      this._runBubbles(canvas, img);
    };

    if (img.complete) { waitAndLaunch(); }
    else { img.onload = waitAndLaunch; img.onerror = waitAndLaunch; }
  }

  _runBubbles(canvas, img) {
    const W = canvas.width, H = canvas.height;
    const t = this._temaActual || TEMAS.dorado;
    const orb1 = t.cc + '0.9)';
    const orb2 = t.cb + '0.7)';
    const orb3 = t.ca + '0.4)';
    const halo = t.cb + '0.35)';

    const count = Math.max(8, Math.floor(W * H / 3000));
    const bubbles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * H,
      r: 8 + Math.random() * 28,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.3 + Math.random() * 0.7),
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.01 + Math.random() * 0.02,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      maxAlpha: 0.25 + Math.random() * 0.55,
      alpha: 0,
      useImg: img.src && Math.random() > 0.4,
    }));

    const ctx = canvas.getContext('2d');
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      bubbles.forEach(b => {
        b.x += b.vx + Math.sin(b.phase) * 0.4;
        b.y += b.vy;
        b.phase += b.phaseSpeed;
        b.rot   += b.rotSpeed;
        if (b.y + b.r < 0)  { b.y = H + b.r; b.x = Math.random() * W; }
        if (b.x - b.r > W)   b.x = -b.r;
        if (b.x + b.r < 0)   b.x = W + b.r;
        b.alpha = Math.min(b.maxAlpha, (1 - b.y / H) * b.maxAlpha * 3);

        ctx.save();
        ctx.globalAlpha = Math.max(0, b.alpha);
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);

        if (b.useImg && img.complete && img.naturalWidth > 0) {
          ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.clip();
          ctx.drawImage(img, -b.r, -b.r, b.r * 2, b.r * 2);
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = b.alpha * 0.5;
          ctx.translate(b.x, b.y);
          const gh = ctx.createRadialGradient(0, 0, b.r * 0.7, 0, 0, b.r * 1.4);
          gh.addColorStop(0, halo); gh.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(0, 0, b.r * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = gh; ctx.fill();
        } else {
          const go = ctx.createRadialGradient(-b.r*.3, -b.r*.3, b.r*.05, 0, 0, b.r);
          go.addColorStop(0, orb1); go.addColorStop(0.4, orb2); go.addColorStop(0.8, orb3); go.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2);
          ctx.fillStyle = go; ctx.fill();
          ctx.beginPath(); ctx.arc(-b.r*.28, -b.r*.28, b.r*.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
        }
        ctx.restore();
      });
      canvas._rafId = requestAnimationFrame(tick);
    };
    tick();
  }
}

customElements.define('video-gold-special-flot', VideoGoldSpecialFlot);
