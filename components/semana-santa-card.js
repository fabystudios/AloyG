/**
 * <semana-santa-card> — Web Component
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

const SSC_FONTS = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap';

class SemanaSantaCard extends HTMLElement {

  static get observedAttributes() {
    return [
      'desktop-width', 'video-src', 'event-name', 'event-sub',
      'season-label',  'footer-label', 'quote',    'quote-ref',
    ];
  }

  connectedCallback()            { this._injectFonts(); this._render(); }
  attributeChangedCallback()     { if (this.isConnected) this._render(); }

  _attr(name, fallback) { return this.getAttribute(name) || fallback; }

  /* Inyecta la hoja de Google Fonts una sola vez en el documento */
  _injectFonts() {
    if (document.querySelector('link[data-ssc-fonts]')) return;
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = SSC_FONTS;
    link.setAttribute('data-ssc-fonts', '');
    document.head.appendChild(link);
  }

  _render() {
    const dw    = this._attr('desktop-width', '900px');
    const vsrc  = this._attr('video-src',      'video.mp4');
    const ename = this._attr('event-name',     'Jueves Santo');
    const esub  = this._attr('event-sub',      'Triduo Pascual');
    const slbl  = this._attr('season-label',   'Semana Santa · 2026');
    const flbl  = this._attr('footer-label',   'In Cena Domini');
    const qt    = this._attr('quote',          '«Hagan esto en memoria mía.»');
    const qref  = this._attr('quote-ref',      '— Lucas 22, 19');

    this.setAttribute('role',       'article');
    this.setAttribute('aria-label', `${ename} · ${slbl}`);

    this.innerHTML = `
<style>
semana-santa-card { display: block; }

.ssc-host {
  width: ${dw};
  max-width: ${dw};
  margin: 0 auto;
}

/* ── CARD: glassmorphism con borde luminoso ── */
.ssc-card {
  display: grid;
  grid-template-columns: 260px 1fr;
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  background: rgba(16, 10, 3, 0.52);
  backdrop-filter: blur(28px) saturate(170%);
  -webkit-backdrop-filter: blur(28px) saturate(170%);
  border: 1px solid rgba(215, 162, 58, 0.42);
  box-shadow:
    0 0 0 1px rgba(255, 205, 85, 0.07),
    0 0 45px  rgba(200, 138, 28, 0.22),
    0 0 100px rgba(140,  85,  8, 0.14),
    0 36px 100px rgba(0, 0, 0, 0.82),
    inset 0  1.5px 0 rgba(255, 225, 130, 0.24),
    inset 0 -1px   0 rgba(255, 180,  40, 0.10);
}

/* Brillo refractado superior */
.ssc-card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 22px;
  background: linear-gradient(
    158deg,
    rgba(255, 225, 130, 0.11) 0%,
    rgba(255, 185,  65, 0.05) 28%,
    transparent 55%
  );
  pointer-events: none;
  z-index: 10;
}

/* ── PANEL IZQUIERDO: VIDEO ── */
.ssc-video-panel {
  position: relative;
  background: rgba(7, 4, 1, 0.62);
  border-right: 1px solid rgba(215, 162, 58, 0.32);
  box-shadow: inset -10px 0 22px rgba(0,0,0,0.45);
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

.ssc-video-wrap::before,
.ssc-video-wrap::after {
  content: '';
  position: absolute; left: 0; right: 0;
  z-index: 2; pointer-events: none;
}
.ssc-video-wrap::before {
  top: 0; height: 85px;
  background: linear-gradient(to bottom, rgba(10,6,2,0.78), transparent);
}
.ssc-video-wrap::after {
  bottom: 0; height: 115px;
  background: linear-gradient(to top, rgba(10,6,2,0.92), transparent);
}

/* Línea de luz dorada entre paneles */
.ssc-video-glow {
  position: absolute;
  right: -1px; top: 12%; bottom: 12%;
  width: 2px;
  background: linear-gradient(to bottom,
    transparent,
    rgba(215,162,55,0.55) 25%,
    rgba(235,185,70,0.90) 50%,
    rgba(215,162,55,0.55) 75%,
    transparent
  );
  filter: blur(1.5px);
  z-index: 5;
}

/* ── PANEL DERECHO: TEXTO ── */
.ssc-text-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.8rem 3rem 2.8rem 3.2rem;
  overflow: hidden;
}

.ssc-text-panel::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 22% 40%, rgba(115,68,12,0.16) 0%, transparent 58%),
    radial-gradient(ellipse at 82% 78%, rgba(85,48,6,0.12)   0%, transparent 50%);
  pointer-events: none; z-index: 0;
}

.ssc-bg-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}

.ssc-content { position: relative; z-index: 2; }

/* ── TIPOGRAFÍA ── */
.ssc-ornament {
  display: flex; align-items: center;
  gap: 0.7rem; margin-bottom: 1.4rem;
}
.ssc-orn-line {
  flex: 1; height: 1px;
  background: linear-gradient(to right, transparent, rgba(205,158,55,0.52));
}
.ssc-orn-line.r {
  background: linear-gradient(to left, transparent, rgba(205,158,55,0.52));
}

.ssc-eyebrow {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: 0.58rem; letter-spacing: 0.35em;
  text-transform: uppercase; color: rgba(212,168,65,0.55);
  margin-bottom: 0.5rem; display: block;
}

.ssc-title {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: clamp(1.5rem, 2.8vw, 2.1rem);
  font-weight: 600; letter-spacing: 0.07em;
  color: #edd99a; line-height: 1.1;
  margin: 0 0 0.25rem;
  text-shadow:
    0 0 28px rgba(225,172,50,0.42),
    0 0 65px rgba(180,120,18,0.22);
}

.ssc-subtitle {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: 0.63rem; font-weight: 400;
  letter-spacing: 0.24em; text-transform: uppercase;
  color: rgba(202,158,55,0.45); margin: 0 0 1.8rem;
}

.ssc-quote {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: clamp(0.98rem, 1.6vw, 1.17rem);
  font-style: italic; color: rgba(240,222,170,0.88);
  line-height: 1.65; margin: 0 0 0.42rem;
  padding-left: 1.1rem;
  border-left: 2px solid rgba(205,158,55,0.48);
}

.ssc-quote-ref {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.75rem; letter-spacing: 0.1em;
  color: rgba(192,148,52,0.5);
  padding-left: 1.1rem; margin: 0 0 1.75rem;
}

.ssc-sep {
  display: flex; align-items: center;
  gap: 0.55rem; margin-bottom: 1.6rem;
}
.ssc-sep-dot {
  width: 3.5px; height: 3.5px; border-radius: 50%;
  background: rgba(192,148,52,0.5); flex-shrink: 0;
}
.ssc-sep-line { flex: 1; height: 1px; background: rgba(192,148,52,0.18); }

.ssc-pillars { display: flex; flex-direction: column; gap: 0.9rem; }
.ssc-pillar  { display: flex; gap: 0.85rem; align-items: flex-start; }

.ssc-pillar-icon {
  width: 26px; height: 26px;
  flex-shrink: 0; margin-top: 2px; opacity: 0.72;
}

.ssc-pillar-label {
  font-family: 'Cinzel', serif;
  font-size: 0.59rem; letter-spacing: 0.25em;
  text-transform: uppercase; color: rgba(202,158,55,0.58);
  display: block; margin-bottom: 0.12rem;
}

.ssc-pillar-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: clamp(0.82rem, 1.3vw, 0.94rem);
  color: rgba(220,200,150,0.70);
  line-height: 1.52; margin: 0;
}

.ssc-footer {
  margin-top: 1.8rem;
  display: flex; align-items: center; justify-content: space-between;
}

.ssc-year {
  font-family: 'Cinzel', serif; font-size: 0.59rem;
  letter-spacing: 0.28em; color: rgba(182,138,45,0.35);
  text-transform: uppercase;
}

.ssc-candles { display: flex; gap: 0.38rem; align-items: flex-end; }

/* ── KEYFRAMES ── */
@keyframes ssc-flicker1 {
  0%,100% { opacity:.85; transform:scaleY(1)    translateY(0);    }
  25%     { opacity:.68; transform:scaleY(.94)  translateY(1px);  }
  50%     { opacity:.92; transform:scaleY(1.04) translateY(-1px); }
  75%     { opacity:.73; transform:scaleY(.97)  translateY(.5px); }
}
@keyframes ssc-flicker2 {
  0%,100% { opacity:.80; transform:scaleY(1)    translateY(0);     }
  30%     { opacity:.94; transform:scaleY(1.05) translateY(-1.5px);}
  60%     { opacity:.66; transform:scaleY(.93)  translateY(1.5px); }
}
@keyframes ssc-glow {
  0%,100% { opacity:.55; }
  50%     { opacity:.27; }
}
@keyframes ssc-fadeup {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0);    }
}

.ssc-content > * { animation: ssc-fadeup 0.75s ease both; }
.ssc-content > *:nth-child(1) { animation-delay:.10s; }
.ssc-content > *:nth-child(2) { animation-delay:.20s; }
.ssc-content > *:nth-child(3) { animation-delay:.28s; }
.ssc-content > *:nth-child(4) { animation-delay:.35s; }
.ssc-content > *:nth-child(5) { animation-delay:.42s; }
.ssc-content > *:nth-child(6) { animation-delay:.50s; }
.ssc-content > *:nth-child(7) { animation-delay:.56s; }
.ssc-content > *:nth-child(8) { animation-delay:.62s; }
.ssc-content > *:nth-child(9) { animation-delay:.68s; }

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .ssc-host { width: 95% !important; max-width: 95vw !important; }
  .ssc-card { grid-template-columns: 1fr; }
  .ssc-video-panel {
    border-right: none;
    border-bottom: 1px solid rgba(215,162,58,0.30);
    box-shadow: inset 0 -10px 24px rgba(0,0,0,0.45);
  }
  .ssc-video-wrap { max-height: 62vh; }
  .ssc-video-glow {
    right: 15%; left: 15%; bottom: -1px;
    top: unset; width: unset; height: 2px;
    background: linear-gradient(to right, transparent, rgba(215,162,55,0.75) 50%, transparent);
  }
  .ssc-text-panel { padding: 1.8rem 1.6rem 2.2rem; }
  .ssc-title { font-size: 1.5rem; }
}

@media (min-width: 641px) and (max-width: 820px) {
  .ssc-card { grid-template-columns: 195px 1fr; }
  .ssc-text-panel { padding: 2rem 2rem 2rem 2.2rem; }
}
</style>

<div class="ssc-host">
  <div class="ssc-card">

    <!-- ▌ VIDEO ▐ -->
    <div class="ssc-video-panel">
      <div class="ssc-video-wrap">
        <video autoplay muted loop playsinline>
          <source src="${vsrc}" type="video/mp4">
        </video>
      </div>
      <div class="ssc-video-glow"></div>
    </div>

    <!-- ▌ TEXTO ▐ -->
    <div class="ssc-text-panel">

      <!-- Atmósfera: velas + halos SVG -->
      <svg class="ssc-bg-svg" viewBox="0 0 580 462"
           preserveAspectRatio="xMidYMid slice"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="ssc-g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="#c8880a" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#c8880a" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="ssc-g2" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="#e0a030" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#e0a030" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="68"  cy="72"  rx="78"  ry="62" fill="url(#ssc-g1)" style="animation:ssc-glow 3.1s ease-in-out infinite"/>
        <ellipse cx="510" cy="108" rx="88"  ry="72" fill="url(#ssc-g2)" style="animation:ssc-glow 2.7s ease-in-out infinite .6s"/>
        <ellipse cx="286" cy="400" rx="118" ry="74" fill="url(#ssc-g1)" style="animation:ssc-glow 4.2s ease-in-out infinite 1.1s"/>
        <ellipse cx="505" cy="384" rx="72"  ry="54" fill="url(#ssc-g2)" style="animation:ssc-glow 3.5s ease-in-out infinite .3s"/>
        <!-- Vela 1 -->
        <g transform="translate(62,60)">
          <rect x="-5" y="0" width="10" height="36" rx="2" fill="#3a2a10" opacity="0.65"/>
          <ellipse cx="0" cy="0" rx="5" ry="3" fill="#c8880a" opacity="0.55"/>
          <path d="M0 0Q-4 -11 0 -21Q4 -11 0 0" fill="#e8b040" style="transform-origin:0 0;animation:ssc-flicker1 1.8s ease-in-out infinite"/>
          <path d="M0 -4Q-2 -13 0 -19Q2 -13 0 -4" fill="#fff8d0" style="transform-origin:0 -4px;animation:ssc-flicker1 1.8s ease-in-out infinite"/>
        </g>
        <!-- Vela 2 -->
        <g transform="translate(506,96)">
          <rect x="-5" y="0" width="10" height="42" rx="2" fill="#3a2a10" opacity="0.62"/>
          <ellipse cx="0" cy="0" rx="5" ry="3" fill="#c8880a" opacity="0.50"/>
          <path d="M0 0Q-4 -13 0 -23Q4 -13 0 0" fill="#e8b040" style="transform-origin:0 0;animation:ssc-flicker2 2.2s ease-in-out infinite .4s"/>
          <path d="M0 -5Q-2 -15 0 -21Q2 -15 0 -5" fill="#fff8d0" style="transform-origin:0 -5px;animation:ssc-flicker2 2.2s ease-in-out infinite .4s"/>
        </g>
        <!-- Vela 3 -->
        <g transform="translate(496,366)">
          <rect x="-4" y="0" width="8" height="30" rx="2" fill="#3a2a10" opacity="0.58"/>
          <ellipse cx="0" cy="0" rx="4" ry="2.5" fill="#c8880a" opacity="0.48"/>
          <path d="M0 0Q-3 -9 0 -17Q3 -9 0 0" fill="#e8b040" style="transform-origin:0 0;animation:ssc-flicker1 1.5s ease-in-out infinite .9s"/>
          <path d="M0 -3Q-1.5 -10 0 -15Q1.5 -10 0 -3" fill="#fff8d0" style="transform-origin:0 -3px;animation:ssc-flicker1 1.5s ease-in-out infinite .9s"/>
        </g>
        <!-- Partículas -->
        <circle cx="175" cy="145" r="1.8" fill="#e8c060" opacity="0.28"/>
        <circle cx="408" cy="192" r="1.4" fill="#e8c060" opacity="0.22"/>
        <circle cx="92"  cy="292" r="1.2" fill="#fff0b0" opacity="0.18"/>
        <circle cx="458" cy="302" r="1.5" fill="#e8c060" opacity="0.20"/>
        <circle cx="308" cy="82"  r="1.3" fill="#fff0b0" opacity="0.16"/>
        <circle cx="233" cy="412" r="1.6" fill="#e8c060" opacity="0.18"/>
      </svg>

      <div class="ssc-content">

        <div class="ssc-ornament">
          <div class="ssc-orn-line"></div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="0"  x2="8"  y2="16" stroke="rgba(192,148,52,0.68)" stroke-width="1.1"/>
            <line x1="0" y1="6"  x2="16" y2="6"  stroke="rgba(192,148,52,0.68)" stroke-width="1.1"/>
          </svg>
          <div class="ssc-orn-line r"></div>
        </div>

        <span class="ssc-eyebrow">${slbl}</span>
        <h1 class="ssc-title">${ename}</h1>
        <p class="ssc-subtitle">${esub}</p>

        <blockquote class="ssc-quote">${qt}</blockquote>
        <p class="ssc-quote-ref">${qref}</p>

        <div class="ssc-sep">
          <div class="ssc-sep-dot"></div>
          <div class="ssc-sep-line"></div>
          <div class="ssc-sep-dot"></div>
          <div class="ssc-sep-line"></div>
          <div class="ssc-sep-dot"></div>
        </div>

        <div class="ssc-pillars">
          <div class="ssc-pillar">
            <svg class="ssc-pillar-icon" viewBox="0 0 28 28" fill="none">
              <path d="M14 4C14 4 8 9 8 16A6 6 0 0020 16C20 9 14 4 14 4Z" stroke="rgba(200,160,60,0.6)" stroke-width="1.2" fill="rgba(200,130,20,0.08)"/>
              <circle cx="14" cy="16" r="2.5" fill="rgba(200,160,60,0.45)"/>
            </svg>
            <div>
              <span class="ssc-pillar-label">Institución</span>
              <p class="ssc-pillar-body">La Última Cena y el don de la Eucaristía, pan y vino que se vuelven Cuerpo y Sangre.</p>
            </div>
          </div>
          <div class="ssc-pillar">
            <svg class="ssc-pillar-icon" viewBox="0 0 28 28" fill="none">
              <ellipse cx="14" cy="17" rx="8" ry="4.5" stroke="rgba(200,160,60,0.5)" stroke-width="1.2" fill="none"/>
              <path d="M8 17Q14 7 20 17" stroke="rgba(200,160,60,0.55)" stroke-width="1.2" fill="rgba(200,130,20,0.06)"/>
              <path d="M11 12Q14 9 17 12" stroke="rgba(200,160,60,0.4)" stroke-width="1" fill="none"/>
            </svg>
            <div>
              <span class="ssc-pillar-label">Mandato</span>
              <p class="ssc-pillar-body">El lavatorio de los pies: «Ámense los unos a los otros, como yo los he amado.»</p>
            </div>
          </div>
          <div class="ssc-pillar">
            <svg class="ssc-pillar-icon" viewBox="0 0 28 28" fill="none">
              <path d="M5 22Q9 10 14 8Q19 10 23 22" stroke="rgba(200,160,60,0.5)" stroke-width="1.2" fill="rgba(200,130,20,0.06)"/>
              <circle cx="14" cy="8" r="2.2" stroke="rgba(200,160,60,0.55)" stroke-width="1" fill="none"/>
              <line x1="14" y1="22" x2="14" y2="26" stroke="rgba(200,160,60,0.35)" stroke-width="1"/>
            </svg>
            <div>
              <span class="ssc-pillar-label">Getsemaní</span>
              <p class="ssc-pillar-body">La oración en el huerto, la agonía y el sí definitivo a la voluntad del Padre.</p>
            </div>
          </div>
        </div>

        <div class="ssc-footer">
          <span class="ssc-year">${flbl}</span>
          <div class="ssc-candles" aria-hidden="true">
            <svg width="6" height="22" viewBox="0 0 6 22">
              <rect x="1" y="8" width="4" height="14" rx="1" fill="rgba(155,115,38,0.42)"/>
              <ellipse cx="3" cy="8" rx="2.5" ry="1.5" fill="rgba(195,148,38,0.38)"/>
              <path d="M3 8Q1 3 3 0Q5 3 3 8" fill="rgba(220,155,38,0.62)" style="transform-origin:3px 8px;animation:ssc-flicker2 2s ease-in-out infinite"/>
            </svg>
            <svg width="6" height="28" viewBox="0 0 6 28">
              <rect x="1" y="10" width="4" height="18" rx="1" fill="rgba(155,115,38,0.45)"/>
              <ellipse cx="3" cy="10" rx="2.5" ry="1.5" fill="rgba(195,148,38,0.42)"/>
              <path d="M3 10Q1 4 3 0Q5 4 3 10" fill="rgba(220,155,38,0.68)" style="transform-origin:3px 10px;animation:ssc-flicker1 1.7s ease-in-out infinite .3s"/>
            </svg>
            <svg width="6" height="20" viewBox="0 0 6 20">
              <rect x="1" y="7" width="4" height="13" rx="1" fill="rgba(155,115,38,0.40)"/>
              <ellipse cx="3" cy="7" rx="2.5" ry="1.5" fill="rgba(195,148,38,0.35)"/>
              <path d="M3 7Q1 2 3 0Q5 2 3 7" fill="rgba(220,155,38,0.57)" style="transform-origin:3px 7px;animation:ssc-flicker2 2.3s ease-in-out infinite .7s"/>
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
