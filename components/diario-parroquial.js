/**
 * <diario-parroquial>
 *
 * Web component that renders a newspaper-style publication with
 * a real 3-D CSS page-flip animation (front/back faces, perspective).
 *
 * Attributes:
 *   title    — Newspaper name            (default: "DIARIO PARROQUIAL")
 *   subtitle — Secondary header line     (default: "")
 *   edition  — Edition text              (default: today's date in Spanish)
 *   folder   — Base folder for photos    (default: "./actividades/news/")
 *   pages    — JSON array of page defs:
 *              [{ "headline": "…", "desc": "…", "photos": [{"src":"1.jpeg","caption":"…"}, …] }]
 *
 * Photo naming convention:
 *   Single photo on a page:   "2.jpeg"
 *   Multiple on the same page: "1.1.jpeg", "1.2.jpeg"  →  photos: [{src:"1.1.jpeg"},{src:"1.2.jpeg"}]
 */
(function () {
  'use strict';

  /* ── helpers ──────────────────────────────────────────── */
  const esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const TODAY = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  /* ── CSS ──────────────────────────────────────────────── */
  const CSS = `
/* ══════════════════════════════════════════════════════════
   DIARIO PARROQUIAL — newspaper web component styles
══════════════════════════════════════════════════════════ */
.dp-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
}

.dp-outer {
  width: 100%;
  max-width: 480px;
  padding: 2rem 1.25rem 1.75rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
  background: linear-gradient(160deg,#6b6866 0%,#7a7774 55%,#6e6c6a 100%);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow:
    0 12px 45px rgba(0,0,0,0.5),
    0 4px 14px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.15);
}

@media (max-width: 520px) {
  .dp-wrapper { padding: 0; }
  .dp-outer {
    max-width: 100%;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}

.dp-section-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: #f0ece6;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.dp-section-label::before,
.dp-section-label::after {
  content: '';
  display: block;
  flex: 1;
  border-top: 1px solid rgba(255,255,255,0.35);
}

.dp-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* ── 3-D BOOK STAGE ─────────────────────────────────────── */
.dp-book {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4.3;
  perspective: 1800px;
  perspective-origin: 50% 45%;
  filter:
    drop-shadow(0 28px 52px rgba(0,0,0,0.75))
    drop-shadow(0 6px 18px rgba(0,0,0,0.5));
}

/* ── LAYERS ────────────────────────────────────────────── */
.dp-layer {
  position: absolute;
  inset: 0;
}
.dp-layer-back {
  z-index: 1;
  overflow: hidden;
  border-radius: 1px;
}
.dp-layer-front {
  z-index: 2;
  transform-style: preserve-3d;
  /* transform-origin set by JS before each flip */
}

/* ── FACES ─────────────────────────────────────────────── */
.dp-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  border-radius: 1px;
}
.dp-face-back {
  transform: rotateY(180deg);
  /* Paper back – visible only during/after the flip */
  background: #d4c49a;
}
.dp-paper-back {
  width: 100%;
  height: 100%;
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  padding: 14px 10px;
  box-sizing: border-box;
  background: #d4c49a;
  /* Subtle column dividers */
  background-image: repeating-linear-gradient(
    to right,
    transparent 0,
    transparent calc(14.28% - 1px),
    rgba(100,80,40,0.18) calc(14.28% - 1px),
    rgba(100,80,40,0.18) 14.28%
  );
}
.dp-paper-col {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 13px,
    rgba(100,80,40,0.22) 13px,
    rgba(100,80,40,0.22) 14px
  );
  border-radius: 1px;
}
.dp-paper-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(0.9rem, 4vw, 1.4rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(100,80,40,0.22);
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  text-transform: uppercase;
}

/* ── FLIP ANIMATIONS ────────────────────────────────────── */
.dp-layer-front.dp-anim-next {
  animation: dp-fn 0.68s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.dp-layer-front.dp-anim-prev {
  animation: dp-fp 0.68s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes dp-fn {
  0%   { transform: rotateY(0deg);    }
  100% { transform: rotateY(-180deg); }
}
@keyframes dp-fp {
  0%   { transform: rotateY(0deg);   }
  100% { transform: rotateY(180deg); }
}

/* New-page appear animation */
@keyframes dp-appear {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.dp-page-appeared {
  animation: dp-appear 0.22s ease forwards;
}

/* ════════════════════════════════════════════════════════
   NEWSPAPER LAYOUT
════════════════════════════════════════════════════════ */
.dp-newspaper {
  width: 100%;
  height: 100%;
  background: #fcf9ef;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  /* Paper grain via SVG data-URI */
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.045'/%3E%3C/svg%3E"),
    linear-gradient(180deg,#fcf9ef 0%,#f8f4e6 100%);
}

/* ── MASTHEAD ─────────────────────────────────────────── */
.dp-masthead {
  flex-shrink: 0;
  background: linear-gradient(180deg, #9c6030 0%, #7a4420 55%, #522c10 100%);
  color: #fff;
  padding: 0.5rem 0.85rem 0.45rem;
  text-align: center;
  border-bottom: 2px solid #d08040;
}
.dp-mhead-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  color: #ffffff;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
  opacity: 0.75;
}
/* Ornamental hairlines above title */
.dp-mhead-rules-top {
  border: none;
  border-top: 1px solid #c09070;
  margin: 0 0 0.18rem;
}
.dp-mhead-title-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 0.05rem;
  min-height: clamp(38px, 10vw, 58px);
}
.dp-mhead-icon {
  position: absolute;
  left: 0;
  width: clamp(38px, 10vw, 58px);
  height: clamp(38px, 10vw, 58px);
  object-fit: contain;
  flex-shrink: 0;
  filter: brightness(1.15) drop-shadow(0 1px 5px rgba(0,0,0,0.55));
}
.dp-mhead-title {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: clamp(1.1rem, 7vw, 1.9rem);
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.5);
}
.dp-mhead-rule-thick {
  border: none;
  border-top: 3px solid #e8a060;
  margin: 0.14rem 0 0.08rem;
}
.dp-mhead-rule-thin {
  border: none;
  border-top: 1px solid #c09070;
  margin: 0.06rem 0 0.14rem;
}
.dp-mhead-sub {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.69rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0.06rem 0 0.04rem;
  opacity: 0.88;
}

/* ── BODY ─────────────────────────────────────────────── */
.dp-body {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0.65rem 0.2rem;
  gap: 0;
  overflow: hidden;
}

/* Story headline */
.dp-headline {
  flex-shrink: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(0.82rem, 4.2vw, 1.18rem);
  font-weight: 900;
  line-height: 1.12;
  color: #6b3a20;
  text-transform: uppercase;
  text-align: center;
  margin: 0 0 0.28rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #9a5530;
  position: relative;
}

/* ── PHOTO AREA ───────────────────────────────────────── */
.dp-photos {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  background: #111;
  overflow: hidden;
}
.dp-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.32s ease;
  pointer-events: none;
}
.dp-slide.dp-on {
  opacity: 1;
  pointer-events: auto;
}
.dp-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.dp-photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.62);
  color: #eee;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.78rem;
  padding: 0.25rem 0.55rem;
  line-height: 1.4;
}

/* In-photo mini carousel controls */
.dp-inav {
  position: absolute;
  inset: auto 0 0.38rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  z-index: 6;
  pointer-events: none;
}
.dp-inav-btn {
  pointer-events: all;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.68);
  color: #fff;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
  -webkit-tap-highlight-color: transparent;
}
.dp-inav-btn:hover { background: rgba(0,0,0,0.9); }
.dp-inav-count {
  pointer-events: none;
  background: rgba(0,0,0,0.65);
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

/* ── DESCRIPTION ──────────────────────────────────────── */
.dp-desc-rule {
  flex-shrink: 0;
  border: none;
  border-top: 1px solid #c09070;
  margin: 0.28rem 0 0.22rem;
}
.dp-desc {
  flex-shrink: 0;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: clamp(0.82rem, 2.5vw, 0.94rem);
  font-style: italic;
  line-height: 1.35;
  color: #5a3820;
  margin: 0;
  text-align: justify;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  letter-spacing: 0.01em;
}

/* ── PAGE FOOTER ─────────────────────────────────────── */
.dp-np-footer {
  flex-shrink: 0;
  padding: 0.3rem 0.75rem 0.35rem;
  border-top: 2px solid #9a5530;
  background: linear-gradient(180deg, #fdf6e8 0%, #f5ead4 100%);
}
.dp-np-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.75rem;
  font-style: italic;
  color: #7a4820;
  letter-spacing: 0.02em;
}

/* ════════════════════════════════════════════════════════
   NAVIGATION BAR (below book)
════════════════════════════════════════════════════════ */
.dp-nav {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}
.dp-nav-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.4rem;
  /* Red 3-D effect */
  background: linear-gradient(180deg, #e53030 0%, #b71c1c 100%);
  color: #fff;
  border: none;
  border-bottom: 4px solid #7f0000;
  padding: 0.6rem 1.15rem 0.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  text-decoration: none;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  box-shadow:
    0 6px 18px rgba(183,28,28,0.5),
    0 2px 6px rgba(0,0,0,0.35);
  text-shadow: 0 1px 3px rgba(0,0,0,0.45);
  transition: transform 0.1s ease, border-bottom-width 0.1s ease,
              box-shadow 0.1s ease, background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
  user-select: none;
}
.dp-nav-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #ef4040 0%, #c62828 100%);
  box-shadow:
    0 8px 22px rgba(183,28,28,0.6),
    0 3px 8px rgba(0,0,0,0.4);
}
.dp-nav-btn:active:not(:disabled) {
  transform: translateY(3px);
  border-bottom-width: 1px;
  box-shadow:
    0 2px 8px rgba(183,28,28,0.4),
    0 1px 3px rgba(0,0,0,0.3);
}
.dp-nav-btn:disabled {
  background: linear-gradient(180deg, #4a4a4a 0%, #333 100%);
  border-bottom-color: #222;
  box-shadow: none;
  opacity: 0.4;
  cursor: default;
}

.dp-nav-center {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 0;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}
.dp-dots {
  display: flex;
  gap: 0.48rem;
  align-items: center;
}
.dp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3a3632;
  border: 1px solid #4e4a46;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.dp-dot.dp-dot-on {
  background: #e53030;
  border-color: #c62828;
  transform: scale(1.4);
  box-shadow: 0 0 6px rgba(229,48,48,0.7);
}
.dp-page-ind {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: #ddd8d2;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 480px) {
  .dp-container { max-width: 100%; }
  .dp-nav-btn {
    padding: 0.5rem 0.65rem 0.4rem;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }
  .dp-nav-label { font-size: 0.78rem; }
}
/* Prevent inherited blue outlines/underlines — NO color:inherit override */
.dp-outer * {
  outline: none;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.dp-outer a, .dp-outer a:visited, .dp-outer a:hover { color: inherit; }
.dp-nav-btn { color: #fff !important; }
.dp-inav-btn { color: #fff !important; }
.dp-mhead-title { color: #ffffff !important; }
.dp-mhead-sub   { color: #ffffff !important; opacity: 0.88; }
.dp-mhead-meta  { color: #ffffff !important; opacity: 0.75; }
.dp-nav-btn:focus-visible {
  outline: 2px solid #e53030;
  outline-offset: 2px;
}
`;

  /* ══════════════════════════════════════════════════════════
     Web Component class
  ══════════════════════════════════════════════════════════ */
  class DiarioParroquial extends HTMLElement {
    connectedCallback() {
      this._cur  = 0;
      this._busy = false;

      try { this._pages = JSON.parse(this.getAttribute('pages') || '[]'); }
      catch (e) { this._pages = []; }

      this._folder   = (this.getAttribute('folder') || './actividades/news/').replace(/\/$/, '') + '/';
      this._title    = this.getAttribute('title')    || 'DIARIO PARROQUIAL';
      this._subtitle = this.getAttribute('subtitle') || '';
      this._edition  = this.getAttribute('edition')  || TODAY;

      this._build();
    }

    /* ── DOM CONSTRUCTION ───────────────────────────────── */
    _build() {
      const t = esc(this._title);
      this.innerHTML = `
        <style>${CSS}</style>
        <div class="dp-wrapper">
        <section class="dp-outer" aria-label="${t}">
          <div class="dp-section-label">-- Publicaciones --</div>
          <div class="dp-container">

            <!-- ── BOOK ── -->
            <div class="dp-book" role="region" aria-label="Diario parroquial">

              <!-- Back layer: pre-loaded with adjacent page -->
              <div class="dp-layer dp-layer-back"></div>

              <!-- Front layer: animates on flip -->
              <div class="dp-layer dp-layer-front">

                <!-- Front face – current page content -->
                <div class="dp-face dp-face-front"></div>

                <!-- Back face – paper texture shown while flipping -->
                <div class="dp-face dp-face-back">
                  <div class="dp-paper-back">
                    ${Array(7).fill('<div class="dp-paper-col"></div>').join('')}
                    <div class="dp-paper-watermark">${t}</div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ── NAV ── -->
            <nav class="dp-nav" aria-label="Navegar páginas del diario">
              <button class="dp-nav-btn dp-btn-prev" aria-label="Página anterior">
                ◀ <span class="dp-nav-label">Anterior</span>
              </button>
              <div class="dp-nav-center">
                <div class="dp-dots" role="tablist"></div>
                <span class="dp-page-ind"></span>
              </div>
              <button class="dp-nav-btn dp-btn-next" aria-label="Siguiente página">
                <span class="dp-nav-label">Siguiente</span> ▶
              </button>
            </nav>

          </div>
        </section>
        </div>`;

      this._layerBack  = this.querySelector('.dp-layer-back');
      this._layerFront = this.querySelector('.dp-layer-front');
      this._faceFront  = this.querySelector('.dp-face-front');
      this._btnPrev    = this.querySelector('.dp-btn-prev');
      this._btnNext    = this.querySelector('.dp-btn-next');
      this._dotsEl     = this.querySelector('.dp-dots');
      this._indEl      = this.querySelector('.dp-page-ind');

      /* Initial render */
      this._faceFront.innerHTML        = this._pageHTML(0);
      this._layerBack.innerHTML        = this._pages[1] ? this._pageHTML(1) : '';

      /* Events */
      this._btnPrev.addEventListener('click', () => this._navigate(-1));
      this._btnNext.addEventListener('click', () => this._navigate(+1));

      this._updateNav();
      this._bindPhotoNav(this._faceFront);
    }

    /* ── PAGE FLIP ──────────────────────────────────────── */
    _navigate(dir) {
      if (this._busy) return;
      const target = this._cur + dir;
      if (target < 0 || target >= this._pages.length) return;
      this._busy = true;

      const fwd = dir > 0;

      /* Pre-load back layer with the destination page */
      this._layerBack.innerHTML = this._pageHTML(target);

      /* Set flip pivot */
      this._layerFront.style.transformOrigin = fwd ? 'left center' : 'right center';

      /* Remove stale animation classes + force reflow */
      this._layerFront.classList.remove('dp-anim-next', 'dp-anim-prev');
      void this._layerFront.offsetWidth;

      /* Start flip */
      this._layerFront.classList.add(fwd ? 'dp-anim-next' : 'dp-anim-prev');

      this._layerFront.addEventListener('animationend', () => {
        /* Update state */
        this._cur = target;

        /* Reset animation cleanly */
        this._layerFront.classList.remove('dp-anim-next', 'dp-anim-prev');
        this._layerFront.style.transform = '';
        this._layerFront.style.transformOrigin = '';

        /* Swap front face to new page */
        this._faceFront.innerHTML = this._pageHTML(this._cur);

        /* Subtle appear animation */
        this._faceFront.classList.remove('dp-page-appeared');
        void this._faceFront.offsetWidth;
        this._faceFront.classList.add('dp-page-appeared');

        /* Pre-fetch next probable page in back layer */
        const nxt = this._cur + dir;
        this._layerBack.innerHTML = this._pages[nxt] ? this._pageHTML(nxt) : '';

        this._busy = false;
        this._updateNav();
        this._bindPhotoNav(this._faceFront);
      }, { once: true });
    }

    /* ── PAGE TEMPLATE ──────────────────────────────────── */
    _pageHTML(idx) {
      const page = this._pages[idx];
      if (!page) return '';

      const photos  = page.photos || [];
      const multi   = photos.length > 1;
      const pageNum = String(idx + 1).padStart(2, '0');
      const total   = this._pages.length;

      const slidesHTML = photos.map((p, i) => `
        <div class="dp-slide${i === 0 ? ' dp-on' : ''}" data-sli="${i}">
          <img src="${esc(this._folder + p.src)}"
               alt="${esc(page.headline || '')} ${i + 1}"
               class="dp-photo-img"
               loading="lazy"
               onerror="this.style.opacity='.25'">
          ${p.caption ? `<div class="dp-photo-caption">${esc(p.caption)}</div>` : ''}
        </div>`).join('');

      const inavHTML = multi ? `
        <div class="dp-inav">
          <button class="dp-inav-btn" data-inprev aria-label="Foto anterior">‹</button>
          <span class="dp-inav-count">1 / ${photos.length}</span>
          <button class="dp-inav-btn" data-innext aria-label="Siguiente foto">›</button>
        </div>` : '';

      return `
        <article class="dp-newspaper" data-page="${idx}">

          <header class="dp-masthead">
            <div class="dp-mhead-meta">
              <span>N.°&nbsp;${esc(pageNum)}</span>
              <span>${esc(this._edition)}</span>
            </div>
            <hr class="dp-mhead-rules-top">
            <div class="dp-mhead-title-row">
              <img src="./img/extra.png" alt="" class="dp-mhead-icon" aria-hidden="true">
              <h1 class="dp-mhead-title">${esc(this._title)}</h1>
            </div>
            ${this._subtitle ? `<div class="dp-mhead-sub">${esc(this._subtitle)}</div>` : ''}
            <hr class="dp-mhead-rule-thick">
            <hr class="dp-mhead-rule-thin">
          </header>

          <main class="dp-body">
            <h2 class="dp-headline">${esc(page.headline || '')}</h2>

            <div class="dp-photos" data-total="${photos.length}">
              ${slidesHTML}
              ${inavHTML}
            </div>

            ${page.desc ? `<hr class="dp-desc-rule"><p class="dp-desc">${esc(page.desc)}</p>` : ''}
          </main>

          <footer class="dp-np-footer">
            <div class="dp-np-footer-row">
              <span>${esc(this._title)}</span>
              <span>✦&nbsp;&nbsp;✦&nbsp;&nbsp;✦</span>
              <span>Pág. ${idx + 1} / ${total}</span>
            </div>
          </footer>

        </article>`;
    }

    /* ── IN-PAGE PHOTO CAROUSEL ─────────────────────────── */
    _bindPhotoNav(container) {
      const photosDiv = container.querySelector('.dp-photos');
      if (!photosDiv) return;
      const total = +photosDiv.dataset.total;
      if (total <= 1) return;

      const slides  = photosDiv.querySelectorAll('.dp-slide');
      const counter = photosDiv.querySelector('.dp-inav-count');
      let cur = 0;

      const show = n => {
        slides[cur].classList.remove('dp-on');
        cur = ((n % total) + total) % total;
        slides[cur].classList.add('dp-on');
        if (counter) counter.textContent = `${cur + 1} / ${total}`;
      };

      const btnP = photosDiv.querySelector('[data-inprev]');
      const btnN = photosDiv.querySelector('[data-innext]');
      if (btnP) btnP.addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
      if (btnN) btnN.addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });

      /* Touch/swipe inside the photo area */
      let touchX = null;
      photosDiv.addEventListener('touchstart', e => {
        touchX = e.touches[0].clientX;
      }, { passive: true });
      photosDiv.addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 38) show(dx < 0 ? cur + 1 : cur - 1);
      });
    }

    /* ── NAV UPDATE ─────────────────────────────────────── */
    _updateNav() {
      const n = this._pages.length;
      this._btnPrev.disabled = this._cur === 0;
      this._btnNext.disabled = this._cur === n - 1;
      this._indEl.textContent = `${this._cur + 1} / ${n}`;

      this._dotsEl.innerHTML = Array.from({ length: n }, (_, i) => `
        <span class="dp-dot${i === this._cur ? ' dp-dot-on' : ''}"
              role="tab"
              tabindex="0"
              aria-label="Página ${i + 1}"
              aria-selected="${i === this._cur}"
              data-pg="${i}"></span>`).join('');

      this._dotsEl.querySelectorAll('.dp-dot').forEach(dot => {
        const handler = () => {
          const t = +dot.dataset.pg;
          if (t === this._cur || this._busy) return;
          this._navigate(t > this._cur ? 1 : -1);
        };
        dot.addEventListener('click', handler);
        dot.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
        });
      });
    }
  }

  if (!customElements.get('diario-parroquial')) {
    customElements.define('diario-parroquial', DiarioParroquial);
  }
})();
