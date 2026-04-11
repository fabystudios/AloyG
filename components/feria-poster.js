/**
 * <feria-poster> — Web Component con Shadow DOM
 *
 * Escena: fondo otoñal → pizarra con afiche pegado → niña al frente.
 *
 * ═══════════════════════════════════════════════════════
 *  ATRIBUTOS
 * ═══════════════════════════════════════════════════════
 *  bg-src            Fondo de la escena (otoñal)
 *  poster-desktop    Imagen del afiche para desktop
 *  poster-mobile     Imagen del afiche para mobile
 *  modal-image       Imagen para el modal de zoom
 *  figure-src        Figura decorativa (niña) desktop
 *  figure-mobile-src Figura decorativa mobile (opcional, usa figure-src)
 *  banderines-src    Banderines decorativos (opcional)
 *  cta-mobile        Texto CTA móvil
 *  cta-desktop       Texto CTA desktop
 *
 * ═══════════════════════════════════════════════════════
 *  EJEMPLO
 * ═══════════════════════════════════════════════════════
 *  <feria-poster
 *    bg-src="./img/feria-autumn.png"
 *    poster-desktop="./actividades/cartelera/feria2_desk.png"
 *    poster-mobile="./actividades/cartelera/feria2_ori.jpg"
 *    modal-image="./feria/feria_modal.jpg"
 *    figure-src="./feria/piloto4.png"
 *    banderines-src="./img/banderines.png">
 *  </feria-poster>
 */

class FeriaPoster extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._modalOpen = false;
    this._modalEl = null;   // vive en document.body
  }

  static get observedAttributes() {
    return [
      'bg-src', 'poster-desktop', 'poster-mobile', 'modal-image',
      'figure-src', 'figure-mobile-src', 'figure-src2', 'banderines-src',
      'cta-mobile', 'cta-desktop', 'board-src',
      'figure-bottom', 'figure-left',
      'figure-mobile-bottom', 'figure-mobile-left',
      'figure2-bottom', 'figure2-right',
      'figure2-mobile-bottom', 'figure2-mobile-right'
    ];
  }

  connectedCallback() {
    this.render();
    this._createModal();
    this._initListeners();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.querySelector('.fp-scene')) {
      this.render();
      this._createModal();
      this._initListeners();
    }
  }

  /* ── Getters ─────────────────────────────────────── */
  get bgSrc()          { return this.getAttribute('bg-src') || ''; }
  get posterDesktop()   { return this.getAttribute('poster-desktop') || ''; }
  get posterMobile()    { return this.getAttribute('poster-mobile') || ''; }
  get modalImage()      { return this.getAttribute('modal-image') || this.posterMobile || this.posterDesktop; }
  get figureSrc()       { return this.getAttribute('figure-src') || ''; }
  get figureMobileSrc() { return this.getAttribute('figure-mobile-src') || this.figureSrc; }
  get banderinesSrc()   { return this.getAttribute('banderines-src') || ''; }
  get boardSrc()         { return this.getAttribute('board-src') || ''; }
  get ctaMobile()       { return this.getAttribute('cta-mobile') || 'tocar sobre el flyer para zoom'; }
  get ctaDesktop()      { return this.getAttribute('cta-desktop') || 'tocar sobre el flyer para zoom'; }
  get figureBottom()       { return this.getAttribute('figure-bottom') || '0px'; }
  get figureLeft()          { return this.getAttribute('figure-left') || '-22%'; }
  get figureMobileBottom() { return this.getAttribute('figure-mobile-bottom') || '0px'; }
  get figureMobileLeft()    { return this.getAttribute('figure-mobile-left') || '-14%'; }
  get figureSrc2()       { return this.getAttribute('figure-src2') || ''; }
  get figure2Bottom()       { return this.getAttribute('figure2-bottom') || '0px'; }
  get figure2Right()         { return this.getAttribute('figure2-right') || '-18%'; }
  get figure2MobileBottom() { return this.getAttribute('figure2-mobile-bottom') || '0px'; }
  get figure2MobileRight()   { return this.getAttribute('figure2-mobile-right') || '-10%'; }

  /* ── Render (Shadow DOM) ─────────────────────────── */
  render() {
    const hasFigure = !!this.figureSrc;
    const hasFigure2 = !!this.figureSrc2;
    const hasBanderines = !!this.banderinesSrc;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --fp-fig-bottom: ${this.figureBottom};
          --fp-fig-left: ${this.figureLeft};
          --fp-fig-mob-bottom: ${this.figureMobileBottom};
          --fp-fig-mob-left: ${this.figureMobileLeft};
          --fp-fig2-bottom: ${this.figure2Bottom};
          --fp-fig2-right: ${this.figure2Right};
          --fp-fig2-mob-bottom: ${this.figure2MobileBottom};
          --fp-fig2-mob-right: ${this.figure2MobileRight};
        }
        ${this._styles()}
      </style>

      <!-- Escena completa -->
      <div class="fp-scene"${this.bgSrc ? ` style="background-image:url('${this.bgSrc}')"` : ''}>

        ${hasBanderines ? `<img class="fp-banderines" src="${this.banderinesSrc}" alt="" aria-hidden="true">` : ''}

        <!-- Contenedor central: pizarra + afiche -->
        <div class="fp-stage">

          <!-- Afiche "pegado" en la pared -->
          <div class="fp-poster-area" role="button" tabindex="0"
               aria-label="Abrir imagen de la feria"
               ${this.boardSrc ? `style="background-image:url('${this.boardSrc}')"` : ''}>
            <div class="fp-tape fp-tape--left"></div>
            <div class="fp-tape fp-tape--right"></div>
            <picture>
              ${this.posterMobile ? `<source media="(max-width: 768px)" srcset="${this.posterMobile}">` : ''}
              <img class="fp-poster-img" src="${this.posterDesktop}" alt="Feria Parroquial" draggable="false">
            </picture>
            <p class="fp-cta fp-cta--mobile">${this.ctaMobile}</p>
            <p class="fp-cta fp-cta--desktop">${this.ctaDesktop}</p>
          </div>
        </div>

        ${hasFigure ? `
        <!-- Niña al frente — fuera de stage para poder desbordar la escena -->
        <img class="fp-figure fp-figure--desktop"
             src="${this.figureSrc}" alt="" aria-hidden="true" draggable="false">
        <img class="fp-figure fp-figure--mobile"
             src="${this.figureMobileSrc}" alt="" aria-hidden="true" draggable="false">
        ` : ''}

        ${hasFigure2 ? `
        <!-- Segunda figura (rubia) — simétrica a la derecha -->
        <img class="fp-figure2 fp-figure2--desktop"
             src="${this.figureSrc2}" alt="" aria-hidden="true" draggable="false">
        <img class="fp-figure2 fp-figure2--mobile"
             src="${this.figureSrc2}" alt="" aria-hidden="true" draggable="false">
        ` : ''}

        <!-- Hojas cayendo -->
        <div class="fp-leaves" aria-hidden="true"></div>
      </div>
    `;

    this._spawnLeaves();
  }

  /* ── Modal (en document.body para evitar problemas de fixed + contain) ── */
  _createModal() {
    if (this._modalEl) this._modalEl.remove();

    const m = document.createElement('div');
    m.className = 'feria-poster-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML = `
      <button class="fpm-close" aria-label="Cerrar">&times;</button>
      <div class="fpm-body">
        <img class="fpm-img" src="${this.modalImage}" alt="Feria Parroquial" draggable="false">
      </div>
    `;
    document.body.appendChild(m);
    this._modalEl = m;

    // Inject modal styles once
    if (!document.getElementById('feria-poster-modal-css')) {
      const s = document.createElement('style');
      s.id = 'feria-poster-modal-css';
      s.textContent = `
        .feria-poster-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 999999;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }
        .feria-poster-modal[open] {
          display: flex;
          animation: fpmFadeIn .25s ease;
        }
        @keyframes fpmFadeIn { from{opacity:0} to{opacity:1} }
        .fpm-close {
          position: fixed;
          top: 16px; right: 20px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          font-size: 2rem;
          width: 48px; height: 48px;
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          transition: background .2s, transform .2s;
          z-index: 2;
        }
        .fpm-close:hover { background:rgba(255,255,255,0.3); transform:scale(1.1); }
        .fpm-body {
          max-width: 90vw; max-height: 88vh;
          animation: fpmZoom .3s cubic-bezier(.22,.68,0,1.2);
        }
        @keyframes fpmZoom { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
        .fpm-img {
          display: block;
          max-width: 100%; max-height: 88vh;
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.45);
          object-fit: contain;
        }
      `;
      document.head.appendChild(s);
    }
  }

  /* ── Estilos (Shadow DOM — totalmente aislados) ──── */
  _styles() {
    return `
      :host {
        display: block;
        --fp-accent: #c97b2a;
        --fp-accent2: #f5d89a;
        overflow: hidden;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ═══ Escena: fondo otoñal cubriendo toda la sección ═══ */
      .fp-scene {
        position: relative;
        width: 90%;
        max-width: 1200px;
        margin: 2rem auto;
        min-height: 520px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #5c3a1a;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        overflow: visible;
        padding: 2.5rem 1rem 3.5rem;
        border-radius: 28px;
        box-shadow:
          0 12px 40px rgba(0,0,0,0.35),
          0 4px 12px rgba(0,0,0,0.15),
          inset 0 1px 0 rgba(255,255,255,0.08);
      }
      /* Clip para que el fondo respete border-radius sin recortar la niña */
      .fp-scene::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: inherit;
        background-size: inherit;
        background-position: inherit;
        background-repeat: inherit;
        z-index: -1;
        overflow: hidden;
      }

      /* Viñeta sutil en bordes para enmarcar */
      .fp-scene::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 28px;
        background: radial-gradient(
          ellipse at center,
          transparent 50%,
          rgba(0,0,0,0.25) 100%
        );
        pointer-events: none;
        z-index: 1;
      }

      /* ═══ Stage: contenedor central (afiche + niña) ═══ */
      .fp-stage {
        position: relative;
        z-index: 2;
        width: 90%;
        max-width: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ═══ Banderines ═══ */
      .fp-banderines {
        position: absolute;
        top: -16px;
        right: -8px;
        width: clamp(140px, 18vw, 240px);
        pointer-events: none;
        z-index: 12;
        filter: drop-shadow(0 6px 14px rgba(0,0,0,0.35));
        animation: fp-sway 3s ease-in-out infinite alternate;
      }
      @keyframes fp-sway {
        0%   { transform: rotate(-4deg) translateY(0); }
        100% { transform: rotate(4deg) translateY(-6px); }
      }

      /* ═══ Afiche pegado en la pared ═══ */
      .fp-poster-area {
        position: relative;
        cursor: pointer;
        border-radius: 6px;
        overflow: visible;
        transition: transform 0.35s cubic-bezier(.22,.68,0,1.2),
                    box-shadow 0.35s ease;
        /* Marco de madera — imagen via inline style, fallback color */
        background-color: #8B6914;
        background-size: cover;
        background-position: center;
        padding: 14px;
        border: 2px solid rgba(90,55,20,0.4);
        box-shadow:
          4px 6px 18px rgba(0,0,0,0.4),
          inset 0 0 8px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.06);
      }
      .fp-poster-area:hover,
      .fp-poster-area:focus-visible {
        transform: scale(1.02) rotate(-0.3deg);
        box-shadow:
          6px 10px 28px rgba(0,0,0,0.45),
          inset 0 0 8px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.1);
        outline: none;
      }

      /* Cinta adhesiva simulada */
      .fp-tape {
        position: absolute;
        width: 50px;
        height: 18px;
        background: rgba(245,216,154,0.7);
        z-index: 5;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        opacity: 0.85;
      }
      .fp-tape--left  { top: -8px; left: 14px; transform: rotate(-12deg); }
      .fp-tape--right { top: -8px; right: 14px; transform: rotate(8deg); }

      .fp-poster-img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 4px;
        object-fit: contain;
      }

      /* ═══ CTA ═══ */
      .fp-cta {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.78rem;
        font-weight: 600;
        color: rgba(255,255,255,0.95);
        text-shadow: 0 1px 6px rgba(0,0,0,0.6);
        text-align: center;
        padding: 5px 16px;
        border-radius: 20px;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(6px);
        white-space: nowrap;
        pointer-events: none;
        animation: fp-blink 1.8s steps(2, start) infinite;
      }
      @keyframes fp-blink {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.15; }
      }
      .fp-cta--desktop { display: none; }
      .fp-cta--mobile  { display: block; }
      @media (min-width: 769px) {
        .fp-cta--desktop { display: block; }
        .fp-cta--mobile  { display: none; }
      }

      /* ═══ Niña decorativa ═══ */
      .fp-figure {
        position: absolute;
        pointer-events: none;
        z-index: 10;
        filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
      }
      .fp-figure--desktop {
        display: none;
        height: clamp(380px, 52vw, 560px);
        width: auto;
        bottom: var(--fp-fig-bottom, 0px);
        left: var(--fp-fig-left, -22%);
        animation: fp-float 3s ease-in-out infinite;
      }
      .fp-figure--mobile {
        display: block;
        height: clamp(843px, 240vw, 1347px);
        width: auto;
        bottom: var(--fp-fig-mob-bottom, 0px);
        left: var(--fp-fig-mob-left, -14%);
        animation: fp-float 3s ease-in-out infinite;
      }
      @media (min-width: 769px) {
        .fp-figure--desktop { display: block; }
        .fp-figure--mobile  { display: none; }
      }
      @media (max-width: 420px) {
        .fp-figure--mobile {
          height: clamp(250px, 75vw, 380px);
        }
      }

      @keyframes fp-float {
        0%, 100% { transform: translateY(0) rotate(-1deg); }
        50%      { transform: translateY(-12px) rotate(1.5deg); }
      }

      /* ═══ Segunda figura (rubia) — simétrica a la derecha ═══ */
      .fp-figure2 {
        position: absolute;
        pointer-events: none;
        z-index: 10;
        filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
      }
      .fp-figure2--desktop {
        display: none;
        height: clamp(420px, 56vw, 620px);
        width: auto;
        bottom: var(--fp-fig2-bottom, 0px);
        right: var(--fp-fig2-right, -18%);
        animation: fp-float2 3.5s ease-in-out infinite;
      }
      .fp-figure2--mobile {
        display: block;
        height: clamp(450px, 120vw, 720px);
        width: auto;
        bottom: var(--fp-fig2-mob-bottom, 0px);
        right: var(--fp-fig2-mob-right, -10%);
        animation: fp-float2 3.5s ease-in-out infinite;
      }
      @media (min-width: 769px) {
        .fp-figure2--desktop { display: block; }
        .fp-figure2--mobile  { display: none; }
      }
      @media (max-width: 420px) {
        .fp-figure2--mobile {
          height: clamp(360px, 98vw, 570px);
        }
      }

      @keyframes fp-float2 {
        0%, 100% { transform: translateY(0) rotate(1deg); }
        50%      { transform: translateY(-14px) rotate(-1.5deg); }
      }

      /* ═══ Hojas cayendo ═══ */
      .fp-leaves {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 3;
      }
      .fp-leaf {
        position: absolute;
        font-size: var(--sz, 18px);
        opacity: 0;
        animation: fp-fall var(--dur) var(--delay) linear infinite;
        top: -30px;
      }
      @keyframes fp-fall {
        0%   { opacity: 0; transform: translateY(0) rotate(0deg) translateX(0); }
        10%  { opacity: 0.85; }
        100% { opacity: 0; transform: translateY(110vh) rotate(360deg) translateX(var(--drift, 40px)); }
      }

      /* ═══ Responsive ═══ */
      @media (max-width: 600px) {
        .fp-scene { width: 95%; min-height: 380px; padding: 2rem 0.5rem 2.5rem; border-radius: 20px; }
        .fp-stage { width: 94%; }
        .fp-poster-area { padding: 4px; }
        .fp-tape { width: 36px; height: 14px; }
        .fp-banderines { width: clamp(100px, 22vw, 150px); top: -10px; right: -4px; }
      }
      @media (min-width: 1200px) {
        .fp-scene { min-height: 620px; }
        .fp-stage { max-width: 650px; }
      }
    `;
  }

  /* ── Hojas decorativas cayendo ───────────────────── */
  _spawnLeaves() {
    const container = this.shadowRoot.querySelector('.fp-leaves');
    if (!container) return;
    const leaves = ['🍂', '🍁', '🍃', '🍂', '🍁'];
    for (let i = 0; i < 10; i++) {
      const l = document.createElement('span');
      l.classList.add('fp-leaf');
      l.textContent = leaves[i % leaves.length];
      l.style.left = `${Math.random() * 100}%`;
      l.style.setProperty('--dur', `${5 + Math.random() * 6}s`);
      l.style.setProperty('--delay', `${Math.random() * 8}s`);
      l.style.setProperty('--sz', `${14 + Math.random() * 14}px`);
      l.style.setProperty('--drift', `${-30 + Math.random() * 60}px`);
      container.appendChild(l);
    }
  }

  /* ── Eventos ─────────────────────────────────────── */
  _initListeners() {
    const poster = this.shadowRoot.querySelector('.fp-poster-area');

    const openModal = () => {
      if (!this._modalEl) return;
      this._modalEl.setAttribute('open', '');
      this._modalOpen = true;
      document.body.style.overflow = 'hidden';
    };
    poster?.addEventListener('click', openModal);
    poster?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });

    const closeModal = () => {
      if (!this._modalEl) return;
      this._modalEl.removeAttribute('open');
      this._modalOpen = false;
      document.body.style.overflow = '';
    };

    if (this._modalEl) {
      const closeBtn = this._modalEl.querySelector('.fpm-close');
      const bodyEl = this._modalEl.querySelector('.fpm-body');
      closeBtn?.addEventListener('click', closeModal);
      this._modalEl.addEventListener('click', (e) => {
        if (!bodyEl.contains(e.target)) closeModal();
      });
    }

    this._escHandler = (e) => {
      if (e.key === 'Escape' && this._modalOpen) closeModal();
    };
    document.addEventListener('keydown', this._escHandler);
  }

  _cleanup() {
    if (this._escHandler) document.removeEventListener('keydown', this._escHandler);
    if (this._modalEl) { this._modalEl.remove(); this._modalEl = null; }
    if (this._modalOpen) document.body.style.overflow = '';
  }
}

customElements.define('feria-poster', FeriaPoster);
