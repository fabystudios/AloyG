/**
 * <semana-santa-card> — Web Component · v2
 * ─────────────────────────────────────────────────────────────────
 * Uso:
 *   <script type="module" src="./components/semana-santa-card.js"></script>
 *
 *   <semana-santa-card
 *     desktop-width="900px"
 *     video-src="./asantos/jueves.mp4"
 *     event-name="Jueves Santo"
 *     event-sub="Triduo Pascual"
 *     season-label="Semana Santa · 2026"
 *     footer-label="In Cena Domini"
 *     quote="«Hagan esto en memoria mía.»"
 *     quote-ref="— Lucas 22, 19"
 *   ></semana-santa-card>
 *
 * Atributos:
 *   desktop-width  → ancho en desktop (cualquier valor CSS: "900px", "80%", "70vw")
 *   video-src      → path del video mp4
 *   event-name     → título principal
 *   event-sub      → subtítulo (ej: "Triduo Pascual")
 *   season-label   → eyebrow superior
 *   footer-label   → texto litúrgico en el pie
 *   quote          → cita bíblica
 *   quote-ref      → referencia de la cita
 * ─────────────────────────────────────────────────────────────────
 */

const SSC_FONTS = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap';

class SemanaSantaCard extends HTMLElement {

  static get observedAttributes() {
    return ['desktop-width','video-src','event-name','event-sub',
            'season-label','footer-label','quote','quote-ref'];
  }

  connectedCallback()        { this._injectFonts(); this._render(); }
  attributeChangedCallback() { if (this.isConnected) this._render(); }

  _attr(name, fallback) { return this.getAttribute(name) || fallback; }

  _injectFonts() {
    if (document.querySelector('link[data-ssc-fonts]')) return;
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = SSC_FONTS;
    link.setAttribute('data-ssc-fonts', '');
    document.head.appendChild(link);
  }

  _render() {
    const dw    = this._attr('desktop-width', '920px');
    const vsrc  = this._attr('video-src',     'video.mp4');
    const ename = this._attr('event-name',    'Jueves Santo');
    const esub  = this._attr('event-sub',     'Triduo Pascual');
    const slbl  = this._attr('season-label',  'Semana Santa · 2026');
    const flbl  = this._attr('footer-label',  'In Cena Domini');
    const qt    = this._attr('quote',         '«Hagan esto en memoria mía.»');
    const qref  = this._attr('quote-ref',     '— Lucas 22, 19');

    this.setAttribute('role',       'article');
    this.setAttribute('aria-label', `${ename} · ${slbl}`);

    this.innerHTML = `
<style>
semana-santa-card { display: block; }

/* ── HOST ── */
.ssc-host {
  width: ${dw};
  max-width: ${dw};
  margin: 0 auto;
}

/* ══════════════════════════════════════════
   CARD SHELL
   Glassmorphism: fondo oscuro semi-opaco +
   backdrop-filter + bordes luminosos dorados
   ══════════════════════════════════════════ */
.ssc-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  border-radius: 20px;
  overflow: hidden;
  position: relative;

  /* Glass oscuro con transparencia controlada */
  background: rgba(8, 5, 2, 0.78);
  backdrop-filter: blur(32px) saturate(180%) brightness(0.9);
  -webkit-backdrop-filter: blur(32px) saturate(180%) brightness(0.9);

  /* Borde luminoso exterior — capas múltiples */
  border: 1px solid rgba(220, 168, 60, 0.50);
  outline: 1px solid rgba(255, 210, 100, 0.08);
  outline-offset: 2px;

  box-shadow:
    /* Aureola dorada exterior */
    0 0 0 1px rgba(255, 200, 70, 0.06),
    0 0 50px  rgba(200, 130, 20, 0.28),
    0 0 120px rgba(150,  90,  8, 0.18),
    /* Profundidad */
    0 40px 120px rgba(0, 0, 0, 0.90),
    /* Reflejos internos del vidrio */
    inset 0  2px 0 rgba(255, 230, 140, 0.28),
    inset 0 -1px 0 rgba(200, 150,  30, 0.12),
    inset 1px 0  0 rgba(255, 220, 100, 0.08),
    inset -1px 0 0 rgba(200, 150,  30, 0.08);
}

/* Capa de reflejo superior del vidrio grueso */
.ssc-card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 20px;
  background: linear-gradient(
    150deg,
    rgba(255, 230, 140, 0.13) 0%,
    rgba(255, 195,  70, 0.06) 22%,
    transparent 45%
  );
  pointer-events: none;
  z-index: 20;
}

/* ══════════════════════════════════════════
   PANEL IZQUIERDO — VIDEO
   ══════════════════════════════════════════ */
.ssc-video-panel {
  position: relative;
  background: #050301;
  border-right: 1px solid rgba(220, 168, 60, 0.38);
}

.ssc-video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  overflow: hidden;
}

.ssc-video-wrap video {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}

/* Fade superior e inferior sobre el video */
.ssc-video-wrap::before,
.ssc-video-wrap::after {
  content: '';
  position: absolute; left: 0; right: 0;
  z-index: 2; pointer-events: none;
}
.ssc-video-wrap::before {
  top: 0; height: 90px;
  background: linear-gradient(to bottom, rgba(5,3,1,0.85), transparent);
}
.ssc-video-wrap::after {
  bottom: 0; height: 130px;
  background: linear-gradient(to top, rgba(5,3,1,0.95), transparent);
}

/* Línea de luz vertical entre paneles */
.ssc-seam {
  position: absolute;
  right: -1px; top: 8%; bottom: 8%;
  width: 2px;
  background: linear-gradient(to bottom,
    transparent 0%,
    rgba(220,168,60,0.45) 20%,
    rgba(255,210,80,1.00) 50%,
    rgba(220,168,60,0.45) 80%,
    transparent 100%
  );
  filter: blur(1px);
  z-index: 5;
}

/* ══════════════════════════════════════════
   PANEL DERECHO — TEXTO
   Panel oscuro profundo con luz de vela
   ══════════════════════════════════════════ */
.ssc-text-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Fondo propio del panel, más oscuro y cálido */
  background:
    radial-gradient(ellipse 80% 60% at 30% 45%, rgba(80, 45, 5, 0.55) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 85% 80%, rgba(55, 28, 2, 0.40) 0%, transparent 65%),
    rgba(10, 6, 1, 0.88);
  padding: 3rem 3.2rem 3rem 3.5rem;
  overflow: hidden;
}

/* SVG de atmósfera detrás del contenido */
.ssc-atm {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}

.ssc-content {
  position: relative;
  z-index: 2;
}

/* ══════════════════════════════════════════
   TIPOGRAFÍA — alto contraste, jerarquía clara
   ══════════════════════════════════════════ */

/* Eyebrow: pequeño, espaciado, dorado tenue */
.ssc-eyebrow {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 0.60rem;
  font-weight: 400;
  letter-spacing: 0.40em;
  text-transform: uppercase;
  color: rgba(210, 162, 55, 0.60);
  margin-bottom: 1.1rem;
}

/* Título: grande, luminoso, con text-shadow de vela */
.ssc-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 3.5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.05;
  color: #f5e4a8;
  margin: 0 0 0.3rem;
  text-shadow:
    0 0  12px rgba(255, 200, 60, 0.55),
    0 0  35px rgba(220, 150, 20, 0.35),
    0 0  80px rgba(180, 100, 10, 0.20),
    0  2px  6px rgba(0, 0, 0, 0.80);
}

/* Subtítulo: finísimo, espaciado */
.ssc-subtitle {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  font-weight: 400;
  letter-spacing: 0.30em;
  text-transform: uppercase;
  color: rgba(195, 145, 45, 0.48);
  margin: 0 0 2.2rem;
}

/* Línea divisoria ornamental */
.ssc-rule {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.8rem;
}
.ssc-rule-line {
  flex: 1; height: 1px;
  background: linear-gradient(to right,
    rgba(200,150,45,0.55),
    rgba(200,150,45,0.15)
  );
}
.ssc-rule-line.rev {
  background: linear-gradient(to left,
    rgba(200,150,45,0.55),
    rgba(200,150,45,0.15)
  );
}
.ssc-rule-diamond {
  width: 6px; height: 6px;
  background: rgba(210,162,55,0.70);
  transform: rotate(45deg);
  flex-shrink: 0;
}

/* Cita bíblica: protagonista, grande, clara */
.ssc-quote-wrap {
  margin-bottom: 2rem;
  padding: 1.4rem 1.5rem;
  background: rgba(255, 200, 60, 0.04);
  border: 1px solid rgba(210, 162, 55, 0.20);
  border-left: 3px solid rgba(210, 162, 55, 0.70);
  border-radius: 0 8px 8px 0;
}

.ssc-quote {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: clamp(1.15rem, 2vw, 1.42rem);
  font-style: italic;
  font-weight: 400;
  color: #f0e0b0;
  line-height: 1.60;
  margin: 0 0 0.55rem;
  /* Sombra para que resalte sobre el fondo */
  text-shadow: 0 1px 8px rgba(0,0,0,0.60);
}

.ssc-quote-ref {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: rgba(200, 152, 48, 0.65);
  margin: 0;
  text-transform: uppercase;
}

/* Pilares: tres momentos del Jueves Santo */
.ssc-pillars {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ssc-pillar {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.9rem 0;
  border-bottom: 1px solid rgba(200, 150, 45, 0.12);
}
.ssc-pillar:last-child { border-bottom: none; }

/* Número romano decorativo */
.ssc-pillar-num {
  font-family: 'Cinzel', serif;
  font-size: 0.70rem;
  font-weight: 700;
  color: rgba(210, 162, 55, 0.50);
  letter-spacing: 0.05em;
  min-width: 22px;
  padding-top: 3px;
  flex-shrink: 0;
  text-align: right;
}

.ssc-pillar-inner { flex: 1; }

.ssc-pillar-label {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(215, 165, 55, 0.80);
  display: block;
  margin-bottom: 0.22rem;
}

.ssc-pillar-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: clamp(0.90rem, 1.4vw, 1.02rem);
  font-weight: 400;
  color: rgba(235, 215, 168, 0.82);
  line-height: 1.55;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,0.50);
}

/* Pie */
.ssc-footer {
  margin-top: 1.6rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(200,150,45,0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ssc-footer-label {
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(180, 132, 38, 0.42);
}

.ssc-candles { display: flex; gap: 5px; align-items: flex-end; }

/* ══════════════════════════════════════════
   ANIMACIONES
   ══════════════════════════════════════════ */
@keyframes ssc-flicker1 {
  0%,100% { opacity:.90; transform:scaleY(1.00) translateY( 0px); }
  20%     { opacity:.72; transform:scaleY(.93)  translateY( 1px); }
  45%     { opacity:.95; transform:scaleY(1.05) translateY(-1px); }
  70%     { opacity:.78; transform:scaleY(.96)  translateY(.5px); }
}
@keyframes ssc-flicker2 {
  0%,100% { opacity:.85; transform:scaleY(1.00) translateY(  0px); }
  30%     { opacity:.96; transform:scaleY(1.06) translateY(-1.5px); }
  65%     { opacity:.68; transform:scaleY(.92)  translateY( 1.5px); }
}
@keyframes ssc-halo {
  0%,100% { opacity:.50; r: 65px; }
  50%     { opacity:.22; r: 70px; }
}
@keyframes ssc-halo2 {
  0%,100% { opacity:.40; }
  50%     { opacity:.18; }
}
@keyframes ssc-fadeup {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0);    }
}

.ssc-content > * { animation: ssc-fadeup 0.80s cubic-bezier(.22,.68,0,1.2) both; }
.ssc-content > *:nth-child(1) { animation-delay:.08s; }
.ssc-content > *:nth-child(2) { animation-delay:.16s; }
.ssc-content > *:nth-child(3) { animation-delay:.24s; }
.ssc-content > *:nth-child(4) { animation-delay:.32s; }
.ssc-content > *:nth-child(5) { animation-delay:.40s; }
.ssc-content > *:nth-child(6) { animation-delay:.48s; }
.ssc-content > *:nth-child(7) { animation-delay:.56s; }

/* ══════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════ */
@media (max-width: 640px) {
  .ssc-host { width: 95% !important; max-width: 95vw !important; }
  .ssc-card { grid-template-columns: 1fr; }
  .ssc-video-panel {
    border-right: none;
    border-bottom: 1px solid rgba(220,168,60,0.35);
  }
  .ssc-video-wrap { max-height: 65vh; }
  .ssc-seam {
    right: 10%; left: 10%;
    top: unset; bottom: -1px;
    width: unset; height: 2px;
    background: linear-gradient(to right,
      transparent, rgba(220,168,60,0.80) 50%, transparent);
  }
  .ssc-text-panel { padding: 2rem 1.6rem 2.4rem; }
  .ssc-title      { font-size: 1.75rem; }
  .ssc-quote      { font-size: 1.1rem; }
}

@media (min-width: 641px) and (max-width: 860px) {
  .ssc-card       { grid-template-columns: 210px 1fr; }
  .ssc-text-panel { padding: 2.2rem 2.2rem 2.2rem 2.4rem; }
  .ssc-title      { font-size: 1.8rem; }
}
</style>

<div class="ssc-host">
  <div class="ssc-card">

    <!-- ▌▌ PANEL VIDEO ▌▌ -->
    <div class="ssc-video-panel">
      <div class="ssc-video-wrap">
        <video autoplay muted loop controls playsinline>
          <source src="${vsrc}" type="video/mp4">
        </video>
      </div>
      <div class="ssc-seam"></div>
    </div>

    <!-- ▌▌ PANEL TEXTO ▌▌ -->
    <div class="ssc-text-panel">

      <!-- SVG atmósfera: halos de vela + llamas -->
      <svg class="ssc-atm" viewBox="0 0 620 500"
           preserveAspectRatio="xMidYMid slice"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="sg-warm" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="#d4820a" stop-opacity="0.30"/>
            <stop offset="100%" stop-color="#d4820a" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="sg-cool" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="#f0a020" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#f0a020" stop-opacity="0"/>
          </radialGradient>
          <filter id="sg-blur"><feGaussianBlur stdDeviation="2"/></filter>
        </defs>

        <!-- Halos de vela -->
        <circle cx="58"  cy="68"  r="65" fill="url(#sg-warm)"
          style="animation:ssc-halo  3.2s ease-in-out infinite"/>
        <circle cx="562" cy="95"  r="75" fill="url(#sg-cool)"
          style="animation:ssc-halo2 2.8s ease-in-out infinite .5s"/>
        <ellipse cx="310" cy="460" rx="130" ry="70" fill="url(#sg-warm)"
          style="animation:ssc-halo2 4.0s ease-in-out infinite 1.2s"/>
        <circle cx="548" cy="430" r="58" fill="url(#sg-cool)"
          style="animation:ssc-halo  3.7s ease-in-out infinite .8s"/>

        <!-- Vela 1 — superior izquierda -->
        <g transform="translate(54,52)" filter="url(#sg-blur)">
          <rect x="-6" y="2" width="12" height="40" rx="2.5" fill="#2e1e08" opacity="0.8"/>
          <ellipse cx="0" cy="2" rx="6" ry="3.5" fill="#b07010" opacity="0.6"/>
        </g>
        <g transform="translate(54,52)">
          <path d="M0 2Q-5 -10 0 -24Q5 -10 0 2" fill="#e8a830"
            style="transform-origin:0 2px;animation:ssc-flicker1 1.9s ease-in-out infinite"/>
          <path d="M0 -3Q-2.5 -14 0 -22Q2.5 -14 0 -3" fill="#fff5c8"
            style="transform-origin:0 -3px;animation:ssc-flicker1 1.9s ease-in-out infinite"/>
        </g>

        <!-- Vela 2 — superior derecha -->
        <g transform="translate(558,78)" filter="url(#sg-blur)">
          <rect x="-6" y="2" width="12" height="46" rx="2.5" fill="#2e1e08" opacity="0.8"/>
          <ellipse cx="0" cy="2" rx="6" ry="3.5" fill="#b07010" opacity="0.6"/>
        </g>
        <g transform="translate(558,78)">
          <path d="M0 2Q-5 -12 0 -26Q5 -12 0 2" fill="#e8a830"
            style="transform-origin:0 2px;animation:ssc-flicker2 2.3s ease-in-out infinite .5s"/>
          <path d="M0 -3Q-2.5 -15 0 -24Q2.5 -15 0 -3" fill="#fff5c8"
            style="transform-origin:0 -3px;animation:ssc-flicker2 2.3s ease-in-out infinite .5s"/>
        </g>

        <!-- Vela 3 — inferior derecha, pequeña -->
        <g transform="translate(542,418)" filter="url(#sg-blur)">
          <rect x="-5" y="2" width="10" height="32" rx="2" fill="#2e1e08" opacity="0.75"/>
          <ellipse cx="0" cy="2" rx="5" ry="3" fill="#b07010" opacity="0.55"/>
        </g>
        <g transform="translate(542,418)">
          <path d="M0 2Q-4 -8 0 -18Q4 -8 0 2" fill="#e8a830"
            style="transform-origin:0 2px;animation:ssc-flicker1 1.5s ease-in-out infinite 1s"/>
          <path d="M0 -2Q-2 -10 0 -16Q2 -10 0 -2" fill="#fff5c8"
            style="transform-origin:0 -2px;animation:ssc-flicker1 1.5s ease-in-out infinite 1s"/>
        </g>

        <!-- Partículas flotantes de polvo de luz -->
        <g opacity="0.35">
          <circle cx="185" cy="155" r="1.5" fill="#f0d060"/>
          <circle cx="420" cy="205" r="1.2" fill="#f0d060"/>
          <circle cx="95"  cy="310" r="1.0" fill="#fff0a0"/>
          <circle cx="470" cy="320" r="1.3" fill="#f0d060"/>
          <circle cx="320" cy="80"  r="1.1" fill="#fff0a0"/>
          <circle cx="245" cy="430" r="1.4" fill="#f0d060"/>
          <circle cx="140" cy="250" r="0.9" fill="#fff0a0"/>
          <circle cx="500" cy="180" r="1.0" fill="#f0d060"/>
        </g>
      </svg>

      <!-- CONTENIDO -->
      <div class="ssc-content">

        <span class="ssc-eyebrow">${slbl}</span>

        <h1 class="ssc-title">${ename}</h1>
        <p class="ssc-subtitle">${esub}</p>

        <!-- Cita en caja destacada -->
        <div class="ssc-quote-wrap">
          <p class="ssc-quote">${qt}</p>
          <p class="ssc-quote-ref">${qref}</p>
        </div>

        <!-- Línea ornamental -->
        <div class="ssc-rule">
          <div class="ssc-rule-line"></div>
          <div class="ssc-rule-diamond"></div>
          <div class="ssc-rule-line rev"></div>
        </div>

        <!-- Tres momentos con número romano -->
        <div class="ssc-pillars">
          <div class="ssc-pillar">
            <span class="ssc-pillar-num">I</span>
            <div class="ssc-pillar-inner">
              <span class="ssc-pillar-label">La Eucaristía</span>
              <p class="ssc-pillar-body">Pan y vino que se vuelven Cuerpo y Sangre en la Última Cena.</p>
            </div>
          </div>
          <div class="ssc-pillar">
            <span class="ssc-pillar-num">II</span>
            <div class="ssc-pillar-inner">
              <span class="ssc-pillar-label">El Mandato</span>
              <p class="ssc-pillar-body">El lavatorio de los pies: «Ámense como yo los he amado.»</p>
            </div>
          </div>
          <div class="ssc-pillar">
            <span class="ssc-pillar-num">III</span>
            <div class="ssc-pillar-inner">
              <span class="ssc-pillar-label">Getsemaní</span>
              <p class="ssc-pillar-body">La agonía en el huerto y el sí definitivo al Padre.</p>
            </div>
          </div>
        </div>

        <!-- Pie -->
        <div class="ssc-footer">
          <span class="ssc-footer-label">${flbl}</span>
          <!-- Tres velitas decorativas -->
          <div class="ssc-candles" aria-hidden="true">
            <svg width="7" height="24" viewBox="0 0 7 24">
              <rect x="1.5" y="9" width="4" height="15" rx="1.2" fill="rgba(140,100,30,0.50)"/>
              <ellipse cx="3.5" cy="9" rx="3" ry="1.8" fill="rgba(185,135,30,0.45)"/>
              <path d="M3.5 9Q1 3.5 3.5 0Q6 3.5 3.5 9" fill="rgba(220,155,35,0.72)"
                style="transform-origin:3.5px 9px;animation:ssc-flicker2 2.1s ease-in-out infinite"/>
            </svg>
            <svg width="7" height="30" viewBox="0 0 7 30">
              <rect x="1.5" y="11" width="4" height="19" rx="1.2" fill="rgba(140,100,30,0.55)"/>
              <ellipse cx="3.5" cy="11" rx="3" ry="1.8" fill="rgba(185,135,30,0.50)"/>
              <path d="M3.5 11Q1 4.5 3.5 0Q6 4.5 3.5 11" fill="rgba(220,155,35,0.80)"
                style="transform-origin:3.5px 11px;animation:ssc-flicker1 1.8s ease-in-out infinite .3s"/>
            </svg>
            <svg width="7" height="22" viewBox="0 0 7 22">
              <rect x="1.5" y="8" width="4" height="14" rx="1.2" fill="rgba(140,100,30,0.45)"/>
              <ellipse cx="3.5" cy="8" rx="3" ry="1.8" fill="rgba(185,135,30,0.40)"/>
              <path d="M3.5 8Q1 3 3.5 0Q6 3 3.5 8" fill="rgba(220,155,35,0.65)"
                style="transform-origin:3.5px 8px;animation:ssc-flicker2 2.5s ease-in-out infinite .7s"/>
            </svg>
          </div>
        </div>

      </div><!-- /ssc-content -->
    </div><!-- /ssc-text-panel -->
  </div><!-- /ssc-card -->
</div><!-- /ssc-host -->
    `;
  }
}

if (!customElements.get('semana-santa-card')) {
  customElements.define('semana-santa-card', SemanaSantaCard);
}
