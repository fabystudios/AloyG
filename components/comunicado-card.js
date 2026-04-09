/**
 * <comunicado-card> — Web Component reutilizable
 *
 * Atributos:
 *   imagen            – URL de la imagen principal
 *   imagen-flotante   – URL del PNG flotante (overlay animado)
 *   badge-texto       – Texto del badge circular (arriba-derecha de la foto)
 *   badge-color       – Color de fondo del badge (CSS, default: dorado)
 *   ribbon-texto      – Texto de la barra metálica superior
 *   ribbon-tema       – "gold" | "silver" | "rose" | "bronze" (default "gold")
 *   pildora           – Texto de la píldora en el panel
 *   titulo            – Título principal
 *   subtitulo         – Subtítulo con gradiente
 *   descripcion       – Párrafo descriptivo (acepta HTML)
 *   boton-texto       – Texto del botón CTA
 *   boton-link        – URL destino del botón
 *   boton-estilo      – Estilo inline extra para el botón
 *   color-primario    – Color primario de la paleta (default #2a0d54)
 *   color-secundario  – Color secundario (default #502a63)
 *   color-acento      – Color de acento (default #ffcc00)
 */
class ComunicadoCard extends HTMLElement {
  static get observedAttributes() {
    return [
      'imagen','imagen-flotante',
      'badge-texto','badge-color',
      'ribbon-texto','ribbon-tema',
      'pildora','titulo','subtitulo','descripcion',
      'boton-texto','boton-link','boton-estilo',
      'color-primario','color-secundario','color-acento'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { if (this.shadowRoot) this._render(); }

  _attr(name, fallback = '') { return this.getAttribute(name) || fallback; }

  /* ── Ribbon metallic gradients ── */
  _ribbonGradient() {
    const tema = this._attr('ribbon-tema', 'gold');
    const maps = {
      gold:   'linear-gradient(90deg,#3d1563 0%,#b8740a 20%,#ffdc00 50%,#b8740a 80%,#3d1563 100%)',
      silver: 'linear-gradient(90deg,#23233a 0%,#8e8e9e 20%,#e8e8f0 50%,#8e8e9e 80%,#23233a 100%)',
      rose:   'linear-gradient(90deg,#3d1533 0%,#b87070 20%,#ffd4d4 50%,#b87070 80%,#3d1533 100%)',
      bronze: 'linear-gradient(90deg,#2a1a08 0%,#8b5e2a 20%,#d4a54a 50%,#8b5e2a 80%,#2a1a08 100%)'
    };
    return maps[tema] || maps.gold;
  }

  _ribbonTextColor() {
    const tema = this._attr('ribbon-tema', 'gold');
    const colors = { gold: '#1a0030', silver: '#111', rose: '#3d1533', bronze: '#1a0e00' };
    return colors[tema] || colors.gold;
  }

  _render() {
    const pri   = this._attr('color-primario',   '#2a0d54');
    const sec   = this._attr('color-secundario',  '#502a63');
    const acc   = this._attr('color-acento',      '#ffcc00');
    const accRgb = this._hexToRgb(acc);

    const imagen        = this._attr('imagen');
    const imagenFlot    = this._attr('imagen-flotante');
    const badgeTexto    = this._attr('badge-texto');
    const badgeColor    = this._attr('badge-color', `linear-gradient(135deg, ${acc} 0%, #ff9800 100%)`);
    const ribbonTexto   = this._attr('ribbon-texto');
    const pildora       = this._attr('pildora');
    const titulo        = this._attr('titulo');
    const subtitulo     = this._attr('subtitulo');
    const descripcion   = this._attr('descripcion');
    const botonTexto    = this._attr('boton-texto');
    const botonLink     = this._attr('boton-link', '#');
    const botonEstilo   = this._attr('boton-estilo');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 94%;
          max-width: 1100px;
          margin: 40px auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .cc-card {
          background: linear-gradient(135deg, rgba(${this._hexToRgb(sec)},0.72) 0%, rgba(${this._hexToRgb(pri)},0.82) 100%);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 2px solid rgba(${accRgb},0.65);
          border-radius: 28px;
          box-shadow: 0 8px 60px rgba(${this._hexToRgb(sec)},0.8),
                      0 0 0 1px rgba(255,255,255,0.06) inset,
                      0 0 90px rgba(${accRgb},0.25);
          padding: 0;
          overflow: hidden;
          position: relative;
          animation: ccFadeUp .9s ease-out both;
        }

        @keyframes ccFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* glow orbs */
        .cc-card::before,
        .cc-card::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .cc-card::before {
          width: 340px; height: 340px;
          background: radial-gradient(circle, rgba(${this._hexToRgb(sec)},0.35) 0%, transparent 70%);
          top: -80px; left: -80px;
        }
        .cc-card::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(${accRgb},0.25) 0%, transparent 70%);
          bottom: -60px; right: -60px;
        }

        /* ── Ribbon metálico ── */
        .cc-ribbon {
          text-align: center;
          background: ${this._ribbonGradient()};
          background-size: 300% auto;
          animation: ccRibbonShift 4s linear infinite;
          color: ${this._ribbonTextColor()};
          font-weight: 900;
          font-size: .83rem;
          letter-spacing: 5px;
          text-transform: uppercase;
          padding: 11px 0;
          border-radius: 26px 26px 0 0;
          position: relative;
          z-index: 2;
          text-shadow: 0 1px 0 rgba(255,255,255,0.3);
        }
        @keyframes ccRibbonShift {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }

        /* ── Layout ── */
        .cc-inner {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 0;
          position: relative;
          z-index: 1;
        }

        /* ── Foto ── */
        .cc-foto {
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 0;
          overflow: hidden;
          border-radius: 28px 0 0 28px;
          background: linear-gradient(160deg, rgba(${this._hexToRgb(pri)},0.9) 0%, rgba(${this._hexToRgb(sec)},0.6) 100%);
        }
        .cc-foto-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .cc-foto-wrapper .cc-foto-img {
          width: 100%;
          height: 100%;
          min-height: 360px;
          object-fit: cover;
          object-position: center;
          border-radius: 0 0 0 26px;
          transition: transform .5s ease;
          filter: brightness(1.08) contrast(1.06);
          display: block;
        }
        .cc-foto-wrapper:hover .cc-foto-img { transform: scale(1.04); }

        /* ── Badge (sello) ── */
        .cc-badge-stamp {
          position: absolute;
          top: 14px;
          right: 10px;
          background: ${badgeColor};
          color: #1a0030;
          font-weight: 900;
          text-align: center;
          min-width: 90px;
          min-height: 90px;
          padding: 12px 10px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1.15;
          font-size: .95rem;
          letter-spacing: .5px;
          box-shadow: 0 4px 24px rgba(${accRgb},0.85), 0 0 0 4px rgba(255,255,255,0.4);
          animation: ccStampAppear .7s cubic-bezier(.36,2,.6,1) .4s both, ccStampGlow 2.5s ease-in-out infinite;
          z-index: 5;
          text-transform: uppercase;
        }
        @keyframes ccStampAppear {
          from { transform: scale(0) rotate(-25deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes ccStampGlow {
          0%,100% { box-shadow: 0 4px 24px rgba(${accRgb},0.85), 0 0 0 4px rgba(255,255,255,0.4); }
          50%     { box-shadow: 0 6px 40px rgba(${accRgb},1),   0 0 0 8px rgba(255,255,255,0.6); }
        }

        /* ── Imagen flotante ── */
        .cc-float-img {
          position: absolute;
          bottom: 14px;
          left: 10px;
          width: 120px;
          height: 120px;
          object-fit: contain;
          border-radius: 0 !important;
          filter: drop-shadow(0 6px 22px rgba(${accRgb},1));
          animation: ccFloat 3s ease-in-out infinite;
          z-index: 5;
          pointer-events: none;
        }
        @keyframes ccFloat {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%     { transform: translateY(-10px) rotate(5deg); }
        }

        /* ── Panel textos ── */
        .cc-texts {
          padding: 44px 48px 44px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
        }
        .cc-pildora {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(${accRgb},0.18);
          border: 1px solid rgba(${accRgb},0.5);
          color: #fff;
          font-size: .82rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 50px;
          width: fit-content;
          animation: ccPulse 2.5s ease-in-out infinite;
        }
        @keyframes ccPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(${accRgb},0.4); }
          50%     { box-shadow: 0 0 0 8px rgba(${accRgb},0); }
        }

        .cc-titulo {
          font-size: 2.6rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.15;
          margin: 0;
          text-shadow: 0 2px 24px rgba(${this._hexToRgb(sec)},0.9);
        }
        .cc-titulo .cc-sub {
          background: linear-gradient(90deg, #e0b4ff, ${acc});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cc-descripcion {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.78);
          margin: 0;
          line-height: 1.55;
        }

        /* ── Botón CTA ── */
        .cc-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, ${acc} 0%, #ff9800 100%);
          color: ${pri} !important;
          text-decoration: none;
          padding: 16px 36px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 800;
          width: fit-content;
          border: none;
          box-shadow: 0 6px 28px rgba(${accRgb},0.55), 0 0 0 3px rgba(${accRgb},0.25);
          transition: transform .25s, box-shadow .25s;
          letter-spacing: .5px;
          animation: ccCtaGlow 2.5s ease-in-out infinite;
          cursor: pointer;
        }
        @keyframes ccCtaGlow {
          0%,100% { box-shadow: 0 6px 28px rgba(${accRgb},0.55), 0 0 0 3px rgba(${accRgb},0.25); }
          50%     { box-shadow: 0 8px 36px rgba(${accRgb},0.8),  0 0 0 6px rgba(${accRgb},0.15); }
        }
        .cc-cta:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 14px 40px rgba(${accRgb},0.75), 0 0 0 5px rgba(${accRgb},0.2);
          color: ${pri} !important;
          text-decoration: none;
        }

        /* ── Responsive ── */
        @media (max-width: 800px) {
          .cc-inner { grid-template-columns: 1fr; }
          .cc-foto { border-radius: 0; }
          .cc-foto-wrapper .cc-foto-img { min-height: 260px; border-radius: 0 !important; }
          .cc-badge-stamp { right: 12px; top: 12px; }
          .cc-float-img { left: 10px; bottom: 10px; width: 90px; height: 90px; }
          .cc-ribbon { border-radius: 26px 26px 0 0; font-size: .72rem; letter-spacing: 3px; }
          .cc-texts { padding: 28px 28px 36px; }
          .cc-titulo { font-size: 1.9rem; }
        }
      </style>

      <div class="cc-card">
        ${ribbonTexto ? `<div class="cc-ribbon">${ribbonTexto}</div>` : ''}
        <div class="cc-inner">
          <div class="cc-foto">
            <div class="cc-foto-wrapper">
              ${imagen ? `<img class="cc-foto-img" src="${this._escapeAttr(imagen)}" alt="" />` : ''}
              ${badgeTexto ? `<div class="cc-badge-stamp">${badgeTexto}</div>` : ''}
              ${imagenFlot ? `<img class="cc-float-img" src="${this._escapeAttr(imagenFlot)}" alt="" />` : ''}
            </div>
          </div>
          <div class="cc-texts">
            ${pildora ? `<div class="cc-pildora">${pildora}</div>` : ''}
            ${titulo ? `<h2 class="cc-titulo">${titulo}${subtitulo ? `<br><span class="cc-sub">${subtitulo}</span>` : ''}</h2>` : ''}
            ${descripcion ? `<p class="cc-descripcion">${descripcion}</p>` : ''}
            ${botonTexto ? `<a class="cc-cta" href="${this._escapeAttr(botonLink)}"${botonEstilo ? ` style="${botonEstilo}"` : ''}>${botonTexto}</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _escapeAttr(s) {
    return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  _hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    const n = parseInt(hex, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
}

customElements.define('comunicado-card', ComunicadoCard);
