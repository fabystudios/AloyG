/**
 * <fb-post-mosaic> Web Component  (vanilla JS + Shadow DOM)
 *
 * Atributos (todos opcionales, retrocompatibles con la versión anterior):
 *   title        — texto del post
 *   author       — nombre del autor / página (default: "Página")
 *   date         — texto de fecha (ej: "Sábado 31 de octubre")
 *   album-url    — enlace al álbum / publicación en Facebook
 *   photos       — JSON string con array de URLs de imágenes: '["a.jpg","b.jpg"]'
 *   description  — texto secundario debajo del mosaico
 *   wallpaper    — fondo con patrón (solo modo standalone). Default "./img/fb-wallpaper.png".
 *                  Usá wallpaper="none" para dejar solo el degradé.
 *   width        — ancho del panel en desktop (solo standalone): "900", "900px", "70%".
 *                  En mobile siempre ocupa el 85% del viewport.
 *
 * También se puede asignar por propiedad:  el.photos = ['a.jpg', 'b.jpg']
 *
 * Modos:
 *   - Standalone (suelto en la página): dibuja su propio panel con degradé + wallpaper.
 *       desktop → 90vw, máx. 1200px   |   mobile (≤768px) → 85vw
 *   - Dentro de <fb-posts-container>: no dibuja panel (usa el del contenedor)
 *       y ocupa el ancho del wrapper que le da el contenedor.
 *
 * Layouts según cantidad de fotos:
 *   1 → 1×1 | 2 → 2×1 | 3 → 1 ancha + 2 | 4 → 2×2
 *   5 → 2 arriba + 3 abajo (como Facebook) | 6 → 2×3 | 7+ → 3×3 (+N en la última)
 *
 * Click en una foto → lightbox (flechas, swipe, Esc, teclado).
 *
 * Variables CSS opcionales (se heredan a través del Shadow DOM):
 *   --fbm-card-max   ancho máximo de la tarjeta en desktop (default 700px)
 */

(function () {
  'use strict';

  if (customElements.get('fb-post-mosaic')) return;

  const MOBILE_MQ = '(max-width: 768px)';

  const FB_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2C7.48 2 3 6.48 3 12c0 4.84 3.44 8.87 8 9.8V15H9v-3h2v-2
             c0-2.21 1.34-3 3-3 .88 0 1.73.08 2 .1v2.3h-1.4c-.96 0-1.1.46-1.1
             1.13V12H17l-.4 3h-2.1v6.93C19.17 21.3 22 17 22 12
             c0-5.52-4.48-10-9-10z"/>
  </svg>`;

  /* ─── Estilos del componente (Shadow DOM) ────────────────────── */
  const STYLES = `
    :host {
      display: block;
      position: relative;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0 auto 20px;
    }

    /* ── Modo standalone: panel propio con degradé + wallpaper ── */
    :host([standalone]) {
      width: var(--fbm-frame-w, 90vw);
      max-width: var(--fbm-frame-w, 1200px);
      /* !important: un reset del sitio (* { margin:0; padding:0 }) no debe pisarlos */
      margin: 0 auto 20px !important;
      padding: 24px 16px !important;
      box-sizing: border-box !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.3);
    }
    @media ${MOBILE_MQ} {
      /* !important: gana aunque el sitio le fije un ancho a la etiqueta */
      :host([standalone]) {
        width: 85vw !important;
        max-width: 85vw !important;
        padding: 14px 10px !important;
      }
    }

    .wallpaper { display: none; }
    :host([standalone]) .wallpaper {
      display: block;
      position: absolute;
      inset: 0;
      background-repeat: repeat;
      background-size: 200px;
      background-position: center;
      opacity: 0.3;
      pointer-events: none;
      z-index: 0;
    }

    /* ── Tarjeta ── */
    .glass-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: var(--fbm-card-max, 700px);
      margin: 0 auto;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    }

    .avatar-ring {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .avatar-ring svg { width: 22px; height: 22px; fill: white; }

    .header-meta { flex: 1; min-width: 0; }
    .header-name { font-size: 14px; font-weight: 600; color: #fff; }
    .header-sub  { font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 1px; }

    .type-pill {
      font-size: 10px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 3px 8px;
      border-radius: 99px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .card-body { padding: 12px 16px 10px; }
    .post-title {
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      line-height: 1.45;
    }
    .post-description {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 6px;
      line-height: 1.4;
    }
    .post-description:empty { display: none; }

    /* ── Mosaico: grilla de 6 columnas; cada layout reparte los spans ── */
    .photo-grid {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 2px;
      border-radius: 12px;
      overflow: hidden;
    }
    .photo-grid:empty { display: none; }

    .photo-cell {
      position: relative;
      display: block;
      grid-column: span 3;
      aspect-ratio: 7 / 4;
      padding: 0;
      margin: 0;
      border: 0;
      overflow: hidden;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.2);
      font: inherit;
    }
    .photo-cell img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.25s ease;
    }
    .photo-cell:hover img { transform: scale(1.05); }
    .photo-cell:focus-visible { outline: 3px solid rgba(255,255,255,0.85); outline-offset: -3px; }
    .photo-cell.broken img { display: none; }

    .g1 .photo-cell { grid-column: span 6; aspect-ratio: 4 / 3; }
    .g2 .photo-cell { aspect-ratio: 5 / 4; }
    .g3 .photo-cell { aspect-ratio: 7 / 4; }
    .g3 .photo-cell:first-child { grid-column: span 6; aspect-ratio: 2.4 / 1; }
    .g4 .photo-cell { aspect-ratio: 7 / 4; }
    .g5 .photo-cell { grid-column: span 2; aspect-ratio: 1 / 1; }
    .g5 .photo-cell:nth-child(-n+2) { grid-column: span 3; aspect-ratio: 6 / 5; }
    .g6 .photo-cell { aspect-ratio: 2.15 / 1; }
    .g9 .photo-cell { grid-column: span 2; aspect-ratio: 1.7 / 1; }

    .more-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 16px 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      margin-top: 2px;
    }

    .fb-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-weight: 500;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 99px;
      transition: background 0.15s;
    }
    .fb-link:hover { background: rgba(255, 255, 255, 0.28); }
    .fb-link:focus-visible { outline: 3px solid rgba(255,255,255,0.85); outline-offset: 2px; }
    .fb-link svg { width: 14px; height: 14px; flex-shrink: 0; }

    .count-pill {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 99px;
      white-space: nowrap;
    }

    /* ── Desktop: tarjeta más grande y tipografía un poco mayor ── */
    @media (min-width: 769px) {
      .card-header  { padding: 16px 20px; }
      .card-body    { padding: 14px 20px 12px; }
      .card-footer  { padding: 12px 20px 16px; }
      .header-name  { font-size: 15px; }
      .header-sub   { font-size: 13px; }
      .post-title   { font-size: 17px; }
      .post-description { font-size: 14px; }
      .fb-link      { font-size: 14px; padding: 7px 14px; }
      .count-pill   { font-size: 12px; }
    }
  `;

  /* ─── Lightbox (vive en <body>, fuera del componente) ─────────── */
  /* Va fuera del host a propósito: si un ancestro tiene transform/overflow
     (como los wrappers animados del contenedor), un position:fixed
     quedaría recortado dentro de la tarjeta. */
  const LIGHTBOX_STYLES = `
    :host { all: initial; }
    [hidden] { display: none !important; }
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(10, 8, 25, 0.92);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: lbIn 0.18s ease both;
      touch-action: pan-y;
    }
    @keyframes lbIn { from { opacity: 0; } to { opacity: 1; } }
    .stage {
      max-width: 92vw;
      max-height: 84vh;
      max-height: 84dvh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      user-select: none;
      -webkit-user-drag: none;
    }
    .btn {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.14);
      color: #fff;
      font-size: 26px;
      line-height: 1;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn:hover { background: rgba(255,255,255,0.3); }
    .btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(255,255,255,0.7); }
    .close { top: max(14px, env(safe-area-inset-top)); right: 14px; }
    .nav   { top: 50%; transform: translateY(-50%); }
    .prev  { left: 14px; }
    .next  { right: 14px; }
    .counter {
      position: absolute;
      bottom: max(16px, env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.85);
      font-size: 13px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 99px;
    }
    @media ${MOBILE_MQ} {
      .nav { width: 38px; height: 38px; font-size: 22px; }
      .prev { left: 8px; }
      .next { right: 8px; }
    }
    @media (prefers-reduced-motion: reduce) { .backdrop { animation: none; } }
  `;

  let closeActiveLightbox = null;

  function openLightbox(photos, start, opener) {
    if (closeActiveLightbox) closeActiveLightbox();

    const n = photos.length;
    let idx = Math.max(0, Math.min(start, n - 1));

    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${LIGHTBOX_STYLES}</style>
      <div class="backdrop" role="dialog" aria-modal="true" aria-label="Galería de fotos">
        <button class="btn close" type="button" aria-label="Cerrar">&times;</button>
        <button class="btn nav prev" type="button" aria-label="Foto anterior">&#8249;</button>
        <img class="stage" alt="" draggable="false">
        <button class="btn nav next" type="button" aria-label="Foto siguiente">&#8250;</button>
        <div class="counter" aria-live="polite"></div>
      </div>`;

    const $ = sel => root.querySelector(sel);
    const backdrop = $('.backdrop');
    const img      = $('.stage');
    const counter  = $('.counter');
    const btnClose = $('.close');
    const btnPrev  = $('.prev');
    const btnNext  = $('.next');

    if (n < 2) {
      btnPrev.hidden = true;
      btnNext.hidden = true;
      counter.hidden = true;
    }

    const show = () => {
      img.src = photos[idx];
      img.alt = `Foto ${idx + 1} de ${n}`;
      counter.textContent = `${idx + 1} / ${n}`;
      if (n > 1) {
        [(idx + 1) % n, (idx - 1 + n) % n].forEach(j => { new Image().src = photos[j]; });
      }
    };
    const go = d => { if (n < 2) return; idx = (idx + d + n) % n; show(); };

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    const onKey = e => {
      if (e.key === 'Escape')           { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft')   { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight')  { e.preventDefault(); go(1); }
      else if (e.key === 'Tab') {
        const items = [btnClose, btnPrev, btnNext].filter(b => !b.hidden);
        const i = items.indexOf(root.activeElement);
        e.preventDefault();
        const next = e.shiftKey
          ? items[(i <= 0 ? items.length : i) - 1]
          : items[(i + 1) % items.length];
        next.focus();
      }
    };

    let tx = 0, ty = 0;
    backdrop.addEventListener('touchstart', e => {
      tx = e.changedTouches[0].clientX;
      ty = e.changedTouches[0].clientY;
    }, { passive: true });
    backdrop.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    }, { passive: true });

    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    btnClose.addEventListener('click', () => close());
    btnPrev.addEventListener('click', () => go(-1));
    btnNext.addEventListener('click', () => go(1));
    document.addEventListener('keydown', onKey, true);

    function close() {
      document.removeEventListener('keydown', onKey, true);
      html.style.overflow = prevOverflow;
      host.remove();
      closeActiveLightbox = null;
      if (opener && opener.isConnected) opener.focus();
    }
    closeActiveLightbox = close;

    document.body.appendChild(host);
    show();
    btnClose.focus();
    return close;
  }

  /* ─── Helpers ────────────────────────────────────────────────── */
  /* Solo http(s) o data:image; devuelve '' si la URL no es segura */
  function safeUrl(u) {
    if (typeof u !== 'string' || !u.trim()) return '';
    try {
      const x = new URL(u.trim(), document.baseURI);
      if (x.protocol === 'http:' || x.protocol === 'https:') return x.href;
      if (x.protocol === 'data:' && /^data:image\//i.test(x.href)) return x.href;
    } catch (e) { /* URL inválida */ }
    return '';
  }

  function layoutFor(n) {
    if (n <= 1) return { gc: 'g1', max: 1 };
    if (n === 2) return { gc: 'g2', max: 2 };
    if (n === 3) return { gc: 'g3', max: 3 };
    if (n === 4) return { gc: 'g4', max: 4 };
    if (n === 5) return { gc: 'g5', max: 5 };
    if (n === 6) return { gc: 'g6', max: 6 };
    return { gc: 'g9', max: 9 };
  }

  /* ─── Web Component ──────────────────────────────────────────── */
  class FbPostMosaic extends HTMLElement {

    static get observedAttributes() {
      return ['title', 'author', 'date', 'album-url', 'description', 'photos', 'wallpaper', 'width'];
    }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>${STYLES}</style>
        <div class="wallpaper"></div>
        <article class="glass-card">
          <div class="card-header">
            <div class="avatar-ring">${FB_ICON}</div>
            <div class="header-meta">
              <div class="header-name"></div>
              <div class="header-sub"></div>
            </div>
            <span class="type-pill">álbum</span>
          </div>
          <div class="card-body">
            <div class="post-title"></div>
            <div class="photo-grid"></div>
            <div class="post-description"></div>
          </div>
          <div class="card-footer">
            <a class="fb-link" target="_blank" rel="noopener noreferrer">${FB_ICON} Ver álbum en Facebook</a>
            <span class="count-pill"></span>
          </div>
        </article>`;

      const $ = sel => root.querySelector(sel);
      this._els = {
        wallpaper: $('.wallpaper'),
        name:      $('.header-name'),
        sub:       $('.header-sub'),
        title:     $('.post-title'),
        grid:      $('.photo-grid'),
        desc:      $('.post-description'),
        link:      $('.fb-link'),
        count:     $('.count-pill'),
      };
      this._photos = [];
      this._renderScheduled = false;

      /* Click en una foto → lightbox (delegación: se registra una sola vez) */
      this._els.grid.addEventListener('click', e => {
        const cell = e.target.closest('.photo-cell');
        if (!cell) return;
        openLightbox(this._photos, Number(cell.dataset.i) || 0, cell);
      });
    }

    connectedCallback() {
      /* Dentro de <fb-posts-container> no dibuja panel propio */
      this.toggleAttribute('standalone', !this.closest('fb-posts-container'));
      this._applyWidth();
      this._schedule();
    }

    disconnectedCallback() {
      if (closeActiveLightbox) closeActiveLightbox();
    }

    attributeChangedCallback(name) {
      if (name === 'width') this._applyWidth();
      this._schedule();
    }

    /* Propiedad cómoda: el.photos = ['a.jpg', ...] */
    get photos() { return this._photos.slice(); }
    set photos(arr) {
      this.setAttribute('photos', JSON.stringify(Array.isArray(arr) ? arr : []));
    }

    /* Debounce de microtask: varios atributos seguidos = un solo render */
    _schedule() {
      if (this._renderScheduled) return;
      this._renderScheduled = true;
      Promise.resolve().then(() => {
        this._renderScheduled = false;
        if (this.isConnected) this._update();
      });
    }

    _applyWidth() {
      const w = this.getAttribute('width');
      if (w) {
        const val = /^\d+(\.\d+)?$/.test(w.trim()) ? w.trim() + 'px' : w.trim();
        this.style.setProperty('--fbm-frame-w', val);
      } else {
        this.style.removeProperty('--fbm-frame-w');
      }
    }

    _update() {
      const els = this._els;
      const title       = this.getAttribute('title') || '';
      const author      = this.getAttribute('author') || 'Página';
      const date        = this.getAttribute('date') || '';
      const albumUrl    = this.getAttribute('album-url') || '';
      const description = this.getAttribute('description') || '';

      /* Wallpaper (solo se ve en modo standalone) */
      const wp = this.hasAttribute('wallpaper')
        ? (this.getAttribute('wallpaper') || '').trim()
        : './img/fb-wallpaper.png';
      els.wallpaper.style.backgroundImage =
        wp && wp.toLowerCase() !== 'none' ? `url(${JSON.stringify(wp)})` : 'none';

      /* Textos (textContent: sin riesgo de inyección HTML) */
      els.name.textContent  = author;
      els.sub.textContent   = date;
      els.title.textContent = title;
      els.desc.textContent  = description;
      els.link.href         = (albumUrl && safeUrl(albumUrl)) || '#';

      /* Fotos */
      let raw = [];
      try { raw = JSON.parse(this.getAttribute('photos') || '[]'); } catch (e) { /* JSON inválido */ }
      const photos = (Array.isArray(raw) ? raw : []).map(safeUrl).filter(Boolean);
      this._photos = photos;

      const n = photos.length;
      const { gc, max } = layoutFor(n);
      const show = Math.min(n, max);

      els.grid.className = 'photo-grid ' + gc;
      els.grid.textContent = '';

      for (let i = 0; i < show; i++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'photo-cell';
        cell.dataset.i = String(i);
        cell.setAttribute('aria-label', `Ver foto ${i + 1} de ${n}`);

        const img = document.createElement('img');
        img.src = photos[i];
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => cell.classList.add('broken'));
        cell.appendChild(img);

        if (i === show - 1 && n > max) {
          const more = document.createElement('div');
          more.className = 'more-overlay';
          more.textContent = `+${n - max}`;
          cell.appendChild(more);
        }
        els.grid.appendChild(cell);
      }

      els.count.textContent = `${n} foto${n !== 1 ? 's' : ''}`;
    }
  }

  customElements.define('fb-post-mosaic', FbPostMosaic);
})();
