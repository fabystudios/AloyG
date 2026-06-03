/**
 * <fiesta-patronal> — Web Component encapsulado (Shadow DOM)
 *
 * Tarjeta moderna (neumorfismo + glassmorphism) para las Fiestas Patronales.
 * Recrea la info del flyer con la figura del santo al costado, banderines
 * y un efecto de destellos dorados. Todo el estilo vive dentro del Shadow DOM,
 * por lo que NO interfiere con el resto de la página.
 *
 * Atributos (todos opcionales, traen valores por defecto del flyer):
 *   saint-src        Imagen del santo (cuerpo entero).   def: ./img/aloy.png
 *   saint-side       Lado del santo: "left" | "right".   def: left
 *   effect           Lista separada por espacios: "sparkles" "confetti"
 *                    "embers" | "none".  def: "sparkles confetti"
 *   intensity        "low" | "medium" | "high".          def: medium
 */
class FiestaPatronal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['saint-src', 'saint-top-src', 'cantina-src', 'saint-side', 'effect', 'intensity'];
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.shadowRoot.firstChild) this.render(); }

  get saintSrc()      { return this.getAttribute('saint-src') || './img/aloy.png'; }
  get saintTopSrc()   { return this.getAttribute('saint-top-src') || './img/aloy2.png'; }
  get cantinaSrc()    { return this.getAttribute('cantina-src') || './img/cantina.png'; }
  get saintSide()     { return this.getAttribute('saint-side') === 'right' ? 'right' : 'left'; }
  get effects()       { return (this.getAttribute('effect') || 'sparkles confetti').toLowerCase().split(/\s+/).filter(Boolean); }
  get intensity()     { return this.getAttribute('intensity') || 'medium'; }

  render() {
    const side = this.saintSide;
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>

      <article class="fpat-card fpat-saint-${side}" aria-label="Fiestas Patronales 2026 - San Luis Gonzaga">
        <div class="fpat-glow" aria-hidden="true"></div>

        <div class="fpat-lights" aria-hidden="true">${this._lightBulbs()}</div>
        <div class="fpat-bunting" aria-hidden="true">${this._buntingFlags()}</div>

        <img class="fpat-saint" src="${this.saintSrc}" alt="San Luis Gonzaga" draggable="false">

        <div class="fpat-content">

          <header class="fpat-head">
            <div class="fpat-head-top">
              <img class="fpat-saint-top" src="${this.saintTopSrc}" alt="San Luis Gonzaga" draggable="false">
              <div class="fpat-head-text">
                <p class="fpat-eyebrow">Fiestas</p>
                <h2 class="fpat-title">PATRONALES</h2>
                <p class="fpat-year">2026</p>
              </div>
            </div>
            <p class="fpat-lema">Vivamos juntos una noche de fe,<br>encuentro y fraternidad</p>
            <div class="fpat-pills">
              <p class="fpat-date"><span>Sábado</span> 20/JUN</p>
              <p class="fpat-free">Entrada Libre y Gratuita</p>
            </div>
          </header>

          <div class="fpat-events">
            <div class="fpat-event">
              <span class="fpat-badge" aria-hidden="true">⛪</span>
              <div class="fpat-event-body">
                <h3>Santa Misa</h3>
                <p class="fpat-time fpat-time--big">${this._clockSvg()}<span class="fpat-hour">18:00</span><small>hs</small></p>
              </div>
            </div>
            <div class="fpat-event">
              <span class="fpat-badge" aria-hidden="true">🎸</span>
              <div class="fpat-event-body">
                <h3>Peña Patronal</h3>
                <p class="fpat-sub">★ Bandas en vivo ★</p>
                <p class="fpat-time">${this._clockSvg()} desde las 19:30 <small>hs</small></p>
                <p class="fpat-place">📍 en el Colegio Parroquial</p>
              </div>
            </div>
            <div class="fpat-event fpat-event--cantina">
              <span class="fpat-badge" aria-hidden="true">🍲</span>
              <div class="fpat-event-body">
                <h3>Servicio de Cantina</h3>
                <ul class="fpat-cantina-list">
                  <li><span aria-hidden="true">🍲</span> Guiso de lentejas</li>
                  <li><span aria-hidden="true">🌭</span> Panchos para los chicos</li>
                  <li><span aria-hidden="true">🍷</span> Gaseosas y vino</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="fpat-bottom">
            <div class="fpat-locations">
              <div class="fpat-loc">
                <span aria-hidden="true">📍</span>
                <div><strong>Colegio</strong><br>Calle 52 y 7</div>
              </div>
              <div class="fpat-loc">
                <span aria-hidden="true">📍</span>
                <div><strong>Templo</strong><br>8 entre 52 y 53</div>
              </div>
            </div>

            <footer class="fpat-foot">
              <p class="fpat-invite">¡Los esperamos para compartir esta gran celebración!</p>
              <p class="fpat-saintname">San Luis Gonzaga</p>
              <p class="fpat-town">Villa Elisa</p>
            </footer>

            <img class="fpat-cantina-img" src="${this.cantinaSrc}" alt="Servicio de cantina" draggable="false">
          </div>

        </div>

        <div class="fpat-fx" aria-hidden="true"></div>
      </article>
    `;
    this._spawnFx();
  }

  _buntingFlags() {
    let html = '';
    for (let i = 0; i < 16; i++) {
      html += `<span class="fpat-flag fpat-flag--${i % 2 ? 'oro' : 'bordo'}" style="--n:${i}"></span>`;
    }
    return html;
  }

  _clockSvg() {
    return `<svg class="fpat-clock" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><path d="M12 7.2V12l3.2 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  _lightBulbs() {
    let html = '';
    for (let i = 0; i < 24; i++) {
      html += `<span class="fpat-bulb" style="--n:${i}"></span>`;
    }
    return html;
  }

  _spawnFx() {
    const layer = this.shadowRoot.querySelector('.fpat-fx');
    if (!layer) return;
    const effects = this.effects;
    if (effects.includes('none')) return;
    const mult = { low: 0.5, medium: 1, high: 1.9 }[this.intensity] ?? 1;

    if (effects.includes('sparkles')) this._spawnGlyphs(layer, mult);
    if (effects.includes('embers'))   this._spawnEmbers(layer, mult);
    if (effects.includes('confetti')) this._spawnConfetti(layer, mult);
  }

  _spawnGlyphs(layer, mult) {
    const glyphs = ['✦', '✧', '·', '✦', '✸'];
    const count = Math.round(42 * mult);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'fpat-particle fpat-sparkles';
      p.textContent = glyphs[i % glyphs.length];
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.fontSize = `${8 + Math.random() * 14}px`;
      p.style.setProperty('--dur', `${3 + Math.random() * 5}s`);
      p.style.setProperty('--delay', `${Math.random() * 6}s`);
      layer.appendChild(p);
    }
  }

  _spawnEmbers(layer, mult) {
    const count = Math.round(16 * mult);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'fpat-particle fpat-embers';
      p.textContent = '•';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = '100%';
      p.style.fontSize = `${8 + Math.random() * 12}px`;
      p.style.setProperty('--dur', `${4 + Math.random() * 5}s`);
      p.style.setProperty('--delay', `${Math.random() * 6}s`);
      p.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
      layer.appendChild(p);
    }
  }

  _spawnConfetti(layer, mult) {
    const colors = ['#d9b25a', '#f0d79a', '#8a1a24', '#f5ead0', '#e8b34a', '#c0392b', '#2e8b57'];
    const count = Math.round(20 * mult);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'fpat-particle fpat-confetti';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `-${10 + Math.random() * 30}px`;
      p.style.width = `${5 + Math.random() * 7}px`;
      p.style.height = `${8 + Math.random() * 8}px`;
      p.style.background = colors[i % colors.length];
      p.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
      p.style.setProperty('--dur', `${4 + Math.random() * 5}s`);
      p.style.setProperty('--delay', `${Math.random() * 6}s`);
      p.style.setProperty('--fall', `${600 + Math.random() * 440}px`);
      p.style.setProperty('--drift', `${-70 + Math.random() * 140}px`);
      p.style.setProperty('--spin', `${360 + Math.random() * 720}deg`);
      layer.appendChild(p);
    }
  }

  _styles() {
    return `
      :host {
        --bordo: #6e1620;
        --bordo-2: #4a0e15;
        --oro: #d9b25a;
        --oro-claro: #f0d79a;
        --crema: #f5ead0;
        --crema-2: #ece0c2;
        display: block;
        width: 100%;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .fpat-card {
        position: relative;
        width: 94%;
        max-width: 1260px;
        margin: 1.2rem auto;
        padding: 1.6rem 1.8rem 1.4rem;
        border-radius: 30px;
        overflow: hidden;
        isolation: isolate;
        background:
          radial-gradient(120% 90% at 80% -10%, rgba(217,178,90,0.18), transparent 55%),
          linear-gradient(160deg, var(--bordo) 0%, var(--bordo-2) 100%);
        border: 1px solid rgba(240,215,154,0.22);
        box-shadow:
          0 24px 60px rgba(0,0,0,0.45),
          0 6px 18px rgba(0,0,0,0.25),
          inset 0 1px 0 rgba(255,255,255,0.08);
      }

      /* Resplandor dorado animado de fondo */
      .fpat-glow {
        position: absolute;
        inset: -30%;
        z-index: 0;
        background: radial-gradient(circle at 50% 35%, rgba(217,178,90,0.22), transparent 60%);
        animation: fpat-breathe 7s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes fpat-breathe {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 1;    transform: scale(1.08); }
      }

      /* ── Guirnalda de luces (CSS) ── */
      .fpat-lights {
        position: absolute;
        top: 8px; left: -2%;
        width: 104%;
        height: 12px;
        z-index: 5;
        pointer-events: none;
        display: flex;
        justify-content: space-between;
        padding: 0 14px;
      }
      .fpat-lights::before {
        content: '';
        position: absolute;
        top: 4px; left: 0;
        width: 100%; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(240,215,154,0.55) 5%, rgba(240,215,154,0.55) 95%, transparent);
      }
      .fpat-bulb {
        position: relative;
        width: 9px; height: 9px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #fff8e0, #ffcf6b 60%, #e89a2a);
        animation: fpat-bulb-glow 1.9s ease-in-out infinite;
        animation-delay: calc(var(--n) * -0.13s);
      }
      @keyframes fpat-bulb-glow {
        0%, 100% { opacity: 0.4;  box-shadow: 0 0 4px 1px rgba(255,190,90,0.5); }
        50%      { opacity: 1;    box-shadow: 0 0 11px 3px rgba(255,200,100,0.95); }
      }

      /* ── Banderines (CSS) — cuelgan de la guirnalda ── */
      .fpat-bunting {
        position: absolute;
        top: 18px; left: -2%;
        width: 104%;
        height: 34px;
        z-index: 4;
        pointer-events: none;
        display: flex;
        justify-content: space-between;
        padding: 0 6px;
        filter: drop-shadow(0 4px 5px rgba(0,0,0,0.35));
      }
      .fpat-flag {
        width: 24px;
        height: 30px;
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        transform-origin: top center;
        box-shadow: inset 0 -6px 8px rgba(0,0,0,0.25);
        animation: fpat-flag-sway 3.2s ease-in-out infinite alternate;
        animation-delay: calc(var(--n) * -0.18s);
      }
      .fpat-flag--bordo { background: linear-gradient(160deg, #e64254, #a02030); box-shadow: inset 0 -6px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18); }
      .fpat-flag--oro   { background: linear-gradient(160deg, var(--oro-claro), var(--oro)); }
      @keyframes fpat-flag-sway {
        0%   { transform: rotate(-5deg) translateY(0); }
        100% { transform: rotate(5deg) translateY(2px); }
      }

      /* ── Figura del santo ── */
      .fpat-saint {
        position: absolute;
        top: 0;
        bottom: 0;
        height: 100%;
        width: auto;
        z-index: 1;
        pointer-events: none;
        object-fit: contain;
        filter: drop-shadow(0 14px 30px rgba(0,0,0,0.5));
        animation: fpat-float 6s ease-in-out infinite;
      }
      .fpat-saint-left  .fpat-saint { left: -2%; }
      .fpat-saint-right .fpat-saint { right: -2%; }
      .fpat-saint::selection { background: transparent; }
      @keyframes fpat-float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-12px); }
      }
      /* Halo detrás del santo */
      .fpat-saint-left  .fpat-glow { background: radial-gradient(circle at 22% 55%, rgba(240,215,154,0.28), transparent 45%); }
      .fpat-saint-right .fpat-glow { background: radial-gradient(circle at 78% 55%, rgba(240,215,154,0.28), transparent 45%); }

      /* ── Columna de contenido ── */
      .fpat-content {
        position: relative;
        z-index: 3;
        width: 74%;
        margin-left: auto;
      }
      .fpat-saint-right .fpat-content { margin-left: 0; margin-right: auto; }

      /* Header */
      .fpat-head { text-align: center; margin-bottom: 0.9rem; }
      .fpat-saint-top { display: none; }  /* solo visible en mobile */
      .fpat-eyebrow {
        font-family: Georgia, "Times New Roman", serif;
        font-style: italic;
        color: var(--oro-claro);
        font-size: clamp(1.1rem, 3vw, 1.6rem);
        line-height: 1;
      }
      .fpat-title {
        font-weight: 900;
        letter-spacing: 0.06em;
        font-size: clamp(2rem, 7vw, 3.6rem);
        line-height: 0.95;
        color: #fff;
        text-shadow: 0 2px 0 var(--bordo-2), 0 6px 18px rgba(0,0,0,0.5);
      }
      .fpat-year {
        font-weight: 900;
        font-size: clamp(2.2rem, 8vw, 4rem);
        line-height: 1;
        background: linear-gradient(180deg, var(--oro-claro), var(--oro));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
      }
      .fpat-lema {
        font-family: Georgia, serif;
        font-style: italic;
        color: var(--crema);
        font-size: clamp(0.85rem, 2.4vw, 1.05rem);
        margin: 0.5rem auto 0.7rem;
        opacity: 0.92;
      }
      .fpat-pills {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 0.55rem;
      }
      .fpat-date {
        display: inline-block;
        font-weight: 800;
        font-size: clamp(1.1rem, 3.4vw, 1.5rem);
        color: var(--bordo-2);
        background: linear-gradient(180deg, var(--oro-claro), var(--oro));
        padding: 0.35em 1.4em;
        border-radius: 999px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
      }
      .fpat-date span { font-weight: 600; }
      .fpat-free {
        display: inline-block;
        font-weight: 800;
        font-size: clamp(0.85rem, 2.4vw, 1.05rem);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--oro-claro);
        background: rgba(0,0,0,0.22);
        padding: 0.55em 1.2em;
        border-radius: 999px;
        border: 1.5px solid var(--oro);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
      }

      /* ── Eventos (glass) ── */
      .fpat-events {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.7rem;
        margin-bottom: 0.8rem;
        align-items: stretch;
      }
      .fpat-event {
        display: flex;
        gap: 0.6rem;
        align-items: flex-start;
        padding: 0.85rem 0.9rem;
        border-radius: 18px;
        background: rgba(245,234,208,0.10);
        border: 1px solid rgba(240,215,154,0.25);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
      }
      .fpat-event-body { min-width: 0; flex: 1 1 auto; }
      /* Badge de icono — neumorfismo sobre crema */
      .fpat-badge {
        flex: 0 0 auto;
        width: 48px; height: 48px;
        display: grid; place-items: center;
        font-size: 1.5rem;
        border-radius: 50%;
        background: linear-gradient(145deg, var(--crema), var(--crema-2));
        box-shadow:
          4px 4px 9px rgba(0,0,0,0.45),
          -3px -3px 7px rgba(255,255,255,0.18),
          inset 0 0 0 2px rgba(217,178,90,0.4);
      }
      .fpat-event-body h3 {
        color: #fff;
        font-size: clamp(1rem, 2.8vw, 1.25rem);
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .fpat-sub { color: var(--oro-claro); font-weight: 700; font-size: 0.85rem; }
      .fpat-time { color: var(--crema); font-weight: 700; font-size: 0.98rem; margin-top: 0.15rem; }
      .fpat-time small { font-weight: 600; opacity: 0.8; }
      .fpat-clock { color: var(--oro-claro); flex: 0 0 auto; }
      .fpat-time .fpat-clock { width: 1.05em; height: 1.05em; vertical-align: -0.2em; }
      .fpat-time--big {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.4rem;
      }
      .fpat-time--big .fpat-clock { width: 1.9rem; height: 1.9rem; }
      .fpat-hour {
        font-size: clamp(2rem, 5.5vw, 2.6rem);
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.01em;
        background: linear-gradient(180deg, var(--oro-claro), var(--oro));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45));
      }
      .fpat-time--big small {
        font-size: 0.95rem;
        font-weight: 700;
        align-self: flex-end;
        margin-bottom: 0.45rem;
        color: var(--crema);
      }
      .fpat-place { color: var(--crema); font-size: 0.82rem; opacity: 0.9; margin-top: 0.2rem; }

      /* ── Cantina (lista dentro del evento) ── */
      .fpat-cantina-list {
        list-style: none;
        display: grid;
        gap: 0.25rem;
        margin-top: 0.35rem;
      }
      .fpat-cantina-list li {
        display: flex; align-items: center; gap: 0.45rem;
        color: var(--crema);
        font-weight: 600;
        font-size: 0.82rem;
        line-height: 1.2;
      }
      .fpat-cantina-list li span { font-size: 0.95rem; }

      /* ── Bottom: ubicaciones | footer texto | imagen ── */
      .fpat-bottom {
        display: flex;
        gap: 0.8rem;
        align-items: stretch;
        margin-bottom: 0.6rem;
      }
      .fpat-locations {
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
        width: clamp(150px, 18%, 200px);
        gap: 0.5rem;
        min-width: 0;
      }
      .fpat-loc {
        flex: 1 1 auto;
        display: flex; align-items: center; gap: 0.45rem;
        padding: 0.5rem 0.75rem;
        border-radius: 14px;
        background: rgba(245,234,208,0.08);
        border: 1px solid rgba(240,215,154,0.2);
        color: var(--crema);
        font-size: 0.82rem;
        line-height: 1.2;
      }
      .fpat-loc span { font-size: 1.1rem; }
      .fpat-loc strong { color: var(--oro-claro); }

      /* Imagen de cantina al costado de las ubicaciones */
      .fpat-cantina-img {
        display: block;
        flex: 0 0 auto;
        width: clamp(180px, 22%, 260px);
        height: auto;
        object-fit: cover;
        border-radius: 14px;
        border: 1px solid rgba(240,215,154,0.25);
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
      }

      /* ── Footer (centro del row inferior en desktop) ── */
      .fpat-foot {
        text-align: center;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        padding: 0 0.4rem;
      }
      .fpat-invite {
        font-family: Georgia, serif; font-style: italic;
        color: var(--crema); font-size: 0.95rem;
      }
      .fpat-saintname {
        font-family: Georgia, serif;
        font-weight: 700;
        font-size: clamp(1.3rem, 3vw, 1.9rem);
        line-height: 1.1;
        background: linear-gradient(180deg, var(--oro-claro), var(--oro));
        -webkit-background-clip: text; background-clip: text; color: transparent;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }
      .fpat-town {
        color: var(--oro-claro);
        letter-spacing: 0.35em;
        text-transform: uppercase;
        font-size: 0.8rem;
        font-weight: 700;
      }

      /* ── Capa de efectos ── */
      .fpat-fx { position: absolute; inset: 0; z-index: 5; pointer-events: none; overflow: hidden; }
      .fpat-particle {
        position: absolute;
        will-change: transform, opacity;
        user-select: none;
      }
      .fpat-sparkles {
        color: var(--oro-claro);
        text-shadow: 0 0 6px rgba(240,215,154,0.9);
        animation: fpat-twinkle var(--dur) var(--delay) ease-in-out infinite;
      }
      @keyframes fpat-twinkle {
        0%, 100% { opacity: 0; transform: scale(0.3) translateY(0); }
        45%, 60% { opacity: 1; transform: scale(1) translateY(-6px); }
      }
      .fpat-embers {
        color: #ffb86b;
        text-shadow: 0 0 8px rgba(255,150,60,0.9);
        animation: fpat-rise var(--dur) var(--delay) linear infinite;
      }
      @keyframes fpat-rise {
        0%   { opacity: 0; transform: translateY(0) translateX(0); }
        10%  { opacity: 1; }
        100% { opacity: 0; transform: translateY(-340px) translateX(var(--drift)); }
      }
      .fpat-confetti {
        animation: fpat-confetti var(--dur) var(--delay) linear infinite;
      }
      @keyframes fpat-confetti {
        0%   { opacity: 0; transform: translateY(0) translateX(0) rotate(0deg); }
        8%   { opacity: 1; }
        100% { opacity: 0; transform: translateY(var(--fall)) translateX(var(--drift)) rotate(var(--spin)); }
      }

      /* ════════ RESPONSIVE ════════ */
      @media (max-width: 720px) {
        .fpat-card { width: 95%; padding: 2rem 1.1rem 1.8rem; border-radius: 24px; margin: 2rem auto; }
        .fpat-content { width: 100%; margin: 0; }
        /* Se quita el santo de fondo en mobile */
        .fpat-saint { display: none; }
        /* Imagen del santo (aloy2) arriba, junto al título */
        .fpat-head-top {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          text-align: left;
          margin-bottom: 0.6rem;
        }
        .fpat-saint-top {
          display: block;
          flex: 0 0 auto;
          width: clamp(86px, 27vw, 124px);
          height: auto;
          margin-top: 22px;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5));
          animation: fpat-float 6s ease-in-out infinite;
        }
        .fpat-head-text { flex: 1 1 auto; min-width: 0; text-align: center; }
        .fpat-head-text .fpat-title { font-size: clamp(1.4rem, 7vw, 2.1rem); letter-spacing: 0.01em; }
        .fpat-head-text .fpat-year  { font-size: clamp(1.7rem, 8vw, 2.6rem); }
        .fpat-events { grid-template-columns: 1fr; gap: 0.9rem; }
        .fpat-event { padding: 1rem; gap: 0.75rem; }
        .fpat-time--big { gap: 0.5rem; margin-top: 0.55rem; }
        .fpat-time--big .fpat-clock { width: 2.4rem; height: 2.4rem; }
        .fpat-hour { font-size: clamp(2.4rem, 8vw, 3.4rem); }
        .fpat-cantina-list { gap: 0.45rem; margin-top: 0.5rem; }
        .fpat-cantina-list li { font-size: 0.95rem; }
        .fpat-cantina-list li span { font-size: 1.15rem; }
        .fpat-bottom { flex-direction: column; gap: 0.7rem; }
        .fpat-locations { width: 100%; flex-direction: row; gap: 0.6rem; }
        .fpat-loc { flex: 1 1 0; min-width: 0; padding: 0.7rem 0.8rem; font-size: 0.82rem; line-height: 1.25; }
        .fpat-cantina-img { width: 100%; height: clamp(120px, 38vw, 180px); }
        .fpat-invite { font-size: 0.95rem; margin-bottom: 0.5rem; }
        .fpat-saintname { font-size: clamp(1.4rem, 5vw, 2.2rem); }
      }
      @media (prefers-reduced-motion: reduce) {
        .fpat-glow, .fpat-saint, .fpat-flag, .fpat-bulb, .fpat-particle { animation: none !important; }
      }
    `;
  }
}

customElements.define('fiesta-patronal', FiestaPatronal);
