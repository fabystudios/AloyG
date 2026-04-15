/**
 * <fb-post-mosaic> Web Component
 * 
 * Atributos:
 *   title      — texto del post
 *   author     — nombre del autor / página
 *   date       — texto de fecha (ej: "Hace 2 días")
 *   album-url  — enlace al álbum en Facebook
 *   photos     — JSON string con array de URLs directas de imágenes
 *   description — (opcional) texto secundario debajo del mosaico
 * 
 * Se inyecta el CSS en el <head> la primera vez que se usa el componente.
 */

(function () {
  'use strict';

  const STYLES = `
    fb-post-mosaic {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      z-index: 1;
      max-width: 560px;
      margin: 0 auto 20px;
    }

    fb-post-mosaic .glass-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4);
    }

    fb-post-mosaic .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    }

    fb-post-mosaic .avatar-ring {
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
    fb-post-mosaic .avatar-ring svg {
      width: 22px;
      height: 22px;
      fill: white;
    }

    fb-post-mosaic .header-meta { flex: 1; }
    fb-post-mosaic .header-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    fb-post-mosaic .header-sub {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 1px;
    }

    fb-post-mosaic .type-pill {
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

    fb-post-mosaic .card-body {
      padding: 12px 16px 10px;
    }
    fb-post-mosaic .post-title {
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      line-height: 1.45;
    }
    fb-post-mosaic .post-description {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 6px;
      line-height: 1.4;
    }

    fb-post-mosaic .photo-grid {
      margin-top: 10px;
      display: grid;
      gap: 2px;
      border-radius: 12px;
      overflow: hidden;
    }
    fb-post-mosaic .g1 { grid-template-columns: 1fr; }
    fb-post-mosaic .g2 { grid-template-columns: 1fr 1fr; }
    fb-post-mosaic .g3 { grid-template-columns: 1fr 1fr; }
    fb-post-mosaic .g4 { grid-template-columns: 1fr 1fr; }
    fb-post-mosaic .g5 { grid-template-columns: 1fr 1fr 1fr; }

    fb-post-mosaic .photo-cell {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.2);
    }
    fb-post-mosaic .photo-cell img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.25s ease;
    }
    fb-post-mosaic .photo-cell:hover img { transform: scale(1.05); }

    fb-post-mosaic .h1 { height: 300px; }
    fb-post-mosaic .h2 { height: 190px; }
    fb-post-mosaic .h5 { height: 140px; }

    fb-post-mosaic .g3 .photo-cell:first-child {
      grid-column: 1 / -1;
      height: 220px;
    }
    fb-post-mosaic .g5 .photo-cell {
      height: 150px;
    }

    fb-post-mosaic .more-overlay {
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
    }

    fb-post-mosaic .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      margin-top: 2px;
    }

    fb-post-mosaic .fb-link {
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
    fb-post-mosaic .fb-link:hover { background: rgba(255, 255, 255, 0.28); }
    fb-post-mosaic .fb-link svg { width: 14px; height: 14px; flex-shrink: 0; }

    fb-post-mosaic .count-pill {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 99px;
    }
  `;

  function injectStyles() {
    if (document.getElementById('fb-post-mosaic-styles')) return;
    const style = document.createElement('style');
    style.id = 'fb-post-mosaic-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  class FbPostMosaic extends HTMLElement {
    connectedCallback() {
      injectStyles();

      const title       = this.getAttribute('title') || '';
      const author      = this.getAttribute('author') || 'Página';
      const date        = this.getAttribute('date') || '';
      const albumUrl    = this.getAttribute('album-url') || '#';
      const description = this.getAttribute('description') || '';
      let photos = [];
      try { photos = JSON.parse(this.getAttribute('photos') || '[]'); } catch (e) {}

      const n    = photos.length;
      const show = Math.min(n, 5);
      const gc   = n === 1 ? 'g1' : n === 2 ? 'g2' : n === 3 ? 'g3' : n === 4 ? 'g4' : 'g5';
      const hc   = n === 1 ? 'h1' : n >= 5 ? 'h5' : 'h2';

      const photosHTML = photos.slice(0, show).map((src, i) => {
        const isLast = (i === show - 1) && n > 5;
        return `<div class="photo-cell ${hc}">
          <img src="${src}" alt="Foto ${i + 1}" loading="lazy">
          ${isLast ? `<div class="more-overlay">+${n - 5}</div>` : ''}
        </div>`;
      }).join('');

      const descHTML = description
        ? `<div class="post-description">${description}</div>`
        : '';

      const FB_ICON = `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2C7.48 2 3 6.48 3 12c0 4.84 3.44 8.87 8 9.8V15H9v-3h2v-2
                 c0-2.21 1.34-3 3-3 .88 0 1.73.08 2 .1v2.3h-1.4c-.96 0-1.1.46-1.1
                 1.13V12H17l-.4 3h-2.1v6.93C19.17 21.3 22 17 22 12
                 c0-5.52-4.48-10-9-10z"/>
      </svg>`;

      this.innerHTML = `
        <div class="glass-card">
          <div class="card-header">
            <div class="avatar-ring">${FB_ICON}</div>
            <div class="header-meta">
              <div class="header-name">${author}</div>
              <div class="header-sub">${date}</div>
            </div>
            <span class="type-pill">álbum</span>
          </div>
          <div class="card-body">
            <div class="post-title">${title}</div>
            <div class="photo-grid ${gc}">${photosHTML}</div>
            ${descHTML}
          </div>
          <div class="card-footer">
            <a class="fb-link" href="${albumUrl}" target="_blank" rel="noopener noreferrer">
              ${FB_ICON} Ver álbum en Facebook
            </a>
            <span class="count-pill">${n} foto${n !== 1 ? 's' : ''}</span>
          </div>
        </div>`;
    }
  }

  if (!customElements.get('fb-post-mosaic')) {
    customElements.define('fb-post-mosaic', FbPostMosaic);
  }
})();
