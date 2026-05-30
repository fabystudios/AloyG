/**
 * <section-title> Web Component
 *
 * Encapsula el patrón <section class="section-header"><h2 class="md3-headline">…
 * que se repetía en index.html (Anuncios, RETIROS, MISAS, etc).
 *
 * Hereda los estilos base de .section-header / .md3-headline definidos en
 * style.css (renderiza light-DOM con esas clases), así que el look queda
 * coherente y respeta los media-queries mobile (height/padding/max-width).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  PROPS / ATRIBUTOS                                                      │
 * ├──────────────────┬──────────────────────────────────┬──────────────────-┤
 * │ Atributo         │ Valores                          │ Default            │
 * ├──────────────────┼──────────────────────────────────┼───────────────────┤
 * │ text             │ string                           │ ""                 │
 * │ icon             │ emoji, material-icon o ""        │ ""                 │
 * │ icon-type        │ "auto"|"emoji"|"material"|"fa"   │ "auto"             │
 * │ effect           │ "none"|"stars"|"floating-png"    │ "none"             │
 * │ png-src          │ url (cuando effect="floating-png")│ ""                │
 * │ png-count        │ nº de PNGs flotando              │ "6"                │
 * │ png-size         │ tamaño CSS de los PNGs           │ "48px"             │
 * │ shadow           │ "lg"|""                          │ ""                 │
 * │ extra-style      │ CSS inline extra para el <section>│ ""                │
 * └──────────────────┴──────────────────────────────────┴───────────────────-┘
 *
 * USO:
 *   <section-title id="Anuncios" icon="campaign" icon-type="material"
 *                  text="Avisos" effect="stars"></section-title>
 *
 *   <section-title id="HISTORIA" icon="📜" text="Más Historia"></section-title>
 *
 *   <section-title id="aloy-bg" text="Fiestas Patronales"
 *                  effect="floating-png" png-src="./img/aloy.png"></section-title>
 */

(function () {
  if (customElements.get('section-title')) return;

  /* ───── estilos extra (sólo lo que NO ya hace .section-header) ───── */
  if (!document.querySelector('style[data-section-title]')) {
    const st = document.createElement('style');
    st.setAttribute('data-section-title', '1');
    st.textContent = `
      section-title { display: block; }

      /* canvas + capa de PNGs flotantes: por encima del fondo, debajo del texto */
      section-title .st-fx-layer {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
        border-radius: inherit;
      }
      section-title .st-fx-layer canvas { width: 100%; height: 100%; display: block; }
      section-title .st-fx-layer .st-png {
        position: absolute;
        opacity: 0.85;
        will-change: transform;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
      }

      /* el h2 va por encima de los efectos */
      section-title .md3-headline {
        position: relative;
        z-index: 2;
      }

      /* Restaurar el centrado del .section-header — la regla global del
         "reacomodamiento gral" en index.html lo seteó a display:block, lo que
         dejó el h2 pegado arriba del content-area y producía padding top/bottom
         visualmente asimétrico (más espacio abajo). */
      section-title > section.section-header {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      /* refuerzo mobile: padding/height correctos aunque se pase extra-style.
         Esto contrarresta el problema introducido por el "reacomodamiento gral"
         donde los inline styles del bloque magic-stars (línea 932 original)
         pisaban el padding mobile del CSS base. */
      @media (max-width: 768px) {
        section-title > section.section-header {
          padding: 1rem 1.5rem !important;
          height: 70px !important;
          max-width: 95% !important;
          border-radius: 18px !important;
        }
        section-title > section.section-header .md3-headline {
          font-size: 1.2rem !important;
          letter-spacing: 0.3px !important;
        }
      }

      @keyframes st-png-float {
        0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
        50%  { transform: translate3d(8px, -10px, 0) rotate(6deg); }
        100% { transform: translate3d(0, 0, 0) rotate(0deg); }
      }
    `;
    document.head.appendChild(st);
  }

  class SectionTitle extends HTMLElement {
    static get observedAttributes() {
      return ['text', 'icon', 'icon-type', 'effect', 'png-src',
              'png-count', 'png-size', 'png-width', 'png-height',
              'shadow', 'extra-style', 'id'];
    }

    connectedCallback()    { this._raf = null; this._render(); }
    disconnectedCallback() { if (this._raf) cancelAnimationFrame(this._raf); }
    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _get(k, fb) { return this.hasAttribute(k) ? this.getAttribute(k) : fb; }

    /* decide qué tipo de ícono es si icon-type="auto" */
    _detectIconType(icon) {
      if (!icon) return 'none';
      const t = this._get('icon-type', 'auto');
      if (t !== 'auto') return t;
      // Material Icons son palabras lowercase con _ (campaign, child_care…)
      if (/^[a-z][a-z0-9_]*$/.test(icon)) return 'material';
      // fa- prefijo → fontawesome
      if (/^fa-/.test(icon) || /^fas?\s/.test(icon)) return 'fa';
      // cualquier otra cosa (incluye emojis) → texto plano
      return 'emoji';
    }

    _render() {
      if (this._raf) cancelAnimationFrame(this._raf);

      const text       = this._get('text', '');
      const icon       = this._get('icon', '');
      const iconType   = this._detectIconType(icon);
      const effectRaw  = this._get('effect', 'none');
      const shadow     = this._get('shadow', '');
      const extraStyle = this._get('extra-style', '');
      const idAttr     = this._get('id', '');

      // El atributo effect ahora acepta varios valores separados por espacio,
      // ej: effect="stars floating-png" combina ambos.
      const effects = effectRaw.split(/\s+/).map(s => s.trim()).filter(Boolean);
      const hasEffect = (e) => effects.includes(e);
      const anyEffect = effects.length && !(effects.length === 1 && effects[0] === 'none');

      this.innerHTML = '';

      const section = document.createElement('section');
      section.className = 'section-header' + (shadow === 'lg' ? ' shadow-lg' : '');
      if (idAttr) section.id = idAttr;
      // position:relative para que el fx-layer absoluto se ancle al section
      section.style.cssText = `position: relative; ${extraStyle}`;

      // capa de efectos (canvas o PNGs flotantes)
      let fxLayer = null;
      if (anyEffect) {
        fxLayer = document.createElement('div');
        fxLayer.className = 'st-fx-layer';
        section.appendChild(fxLayer);
      }

      // título
      const h2 = document.createElement('h2');
      h2.className = 'md3-headline';
      h2.style.color = 'white';

      // ícono + texto
      if (icon) {
        if (iconType === 'material') {
          const i = document.createElement('i');
          i.className = 'material-icons align-middle';
          i.style.cssText = 'font-size: 1.4em; vertical-align: middle; margin-right: 0.3em;';
          i.textContent = icon;
          h2.appendChild(i);
        } else if (iconType === 'fa') {
          const i = document.createElement('i');
          i.className = icon.startsWith('fa-') ? `fas ${icon}` : icon;
          i.style.cssText = 'margin-right: 0.4em;';
          h2.appendChild(i);
        } else {
          // emoji o texto plano: lo metemos antes del texto, con un espacio
          h2.appendChild(document.createTextNode(icon + ' '));
        }
      }
      h2.appendChild(document.createTextNode(text));
      section.appendChild(h2);

      this.appendChild(section);

      // arrancar efectos después de que el section está en el DOM (necesita medidas).
      // Si hay varios efectos combinados, todos comparten la misma fxLayer.
      if (hasEffect('stars')) {
        requestAnimationFrame(() => this._startStars(fxLayer, section));
      }
      if (hasEffect('floating-png')) {
        this._startFloatingPng(fxLayer);
      }
    }

    /* ───────── efecto: estrellas mágicas + chispas (línea 932 original) ───────── */
    _startStars(fxLayer, container) {
      const canvas = document.createElement('canvas');
      fxLayer.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      let W = 0, H = 0;

      const resize = () => {
        W = container.offsetWidth;
        H = container.offsetHeight;
        canvas.width  = Math.max(1, W * dpr);
        canvas.height = Math.max(1, H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const COLORS = ['#fffbe9','#ffd700','#00e5ff','#ff80ab','#b388ff','#fff','#ffe082','#80d8ff','#ffb300','#ff4081'];
      const starCount = () => W < 600 ? 14 : W < 900 ? 24 : 36;
      const baseR = () => W < 600 ? 0.5 : 0.8;
      const maxR  = () => W < 600 ? 1.0 : 1.5;
      const zMax  = () => W < 600 ? 1.2 : 1.7;

      const mkStar = () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.7 + 10,
        r: Math.random() * (maxR() - baseR()) + baseR(),
        twinkle: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        z: Math.random() * zMax() + 0.7,
      });

      let stars  = Array.from({ length: starCount() }, mkStar);
      const sparks = [];
      // resetear estrellas en resize
      const reset = () => { stars = Array.from({ length: starCount() }, mkStar); };
      ro.disconnect();
      const ro2 = new ResizeObserver(() => { resize(); reset(); });
      ro2.observe(container);

      const loop = () => {
        if (!this.isConnected) { ro2.disconnect(); return; }
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
          ctx.save();
          ctx.globalAlpha = 0.7 + 0.3 * Math.sin(s.twinkle);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 12 * s.z;
          ctx.fill();
          ctx.restore();
          s.twinkle += 0.04 + Math.random() * 0.01;
          if (Math.random() < 0.01) {
            sparks.push({
              x: s.x, y: s.y,
              vx: (Math.random() - 0.5) * 2.2,
              vy: -Math.random() * 2.2 - 0.5,
              alpha: 1,
              r: Math.random() * 1.5 + 0.7,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const k = sparks[i];
          ctx.save();
          ctx.globalAlpha = k.alpha;
          ctx.beginPath();
          ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2);
          ctx.fillStyle = k.color;
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
          k.x += k.vx; k.y += k.vy; k.vy += 0.045;
          k.alpha -= (k.r > 2 || k.alpha > 1) ? 0.012 : 0.018;
          if (k.alpha <= 0) sparks.splice(i, 1);
        }
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    /* ───────── efecto: PNGs flotando de fondo ─────────
       Tamaño:
         - png-width  → CSS width (height: auto si no se setea)
         - png-height → CSS height (width: auto si no se setea)
         - png-size   → atajo: si no hay width/height, se usa como width
         Si se setea solo uno (width o height) la otra dimensión queda en auto
         para preservar la relación de aspecto del PNG. */
    _startFloatingPng(fxLayer) {
      const src    = this._get('png-src', '');
      if (!src) return;
      const count  = Math.min(20, Math.max(1, parseInt(this._get('png-count', '6'))));
      const pW     = this._get('png-width',  '');
      const pH     = this._get('png-height', '');
      const pSize  = this._get('png-size',   '');
      const widthCss  = pW || (!pH ? (pSize || '48px') : 'auto');
      const heightCss = pH || 'auto';

      for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.className = 'st-png';
        img.src = src;
        img.alt = '';
        img.style.width  = widthCss;
        img.style.height = heightCss;
        img.style.left   = (Math.random() * 90) + '%';
        img.style.top    = (Math.random() * 70 + 5) + '%';
        const dur   = (3 + Math.random() * 4).toFixed(2);
        const delay = (-Math.random() * 4).toFixed(2);
        img.style.animation = `st-png-float ${dur}s ease-in-out ${delay}s infinite`;
        img.style.opacity   = (0.5 + Math.random() * 0.5).toFixed(2);
        fxLayer.appendChild(img);
      }
    }
  }

  customElements.define('section-title', SectionTitle);
})();
