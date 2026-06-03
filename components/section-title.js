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
 * │  ATRIBUTOS DE CONTENIDO                                                  │
 * ├──────────────────┬──────────────────────────────────┬──────────────────-┤
 * │ text             │ string                           │ ""                 │
 * │ icon             │ emoji, material-icon, fa-…       │ ""                 │
 * │ icon-type        │ auto|emoji|material|fa           │ "auto"             │
 * │ shadow           │ ""|"lg"                          │ ""                 │
 * │ extra-style      │ CSS inline extra para el section │ ""                 │
 * │ id               │ string                           │ ""                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  EFFECT — acepta varios valores separados por espacio                    │
 * │     ej: effect="stars floating-png glow-pulse"                           │
 * │  Valores:                                                               │
 * │    none, stars, bubbles, confetti, snow, rays,                          │
 * │    glow-pulse, aurora, floating-png, floating-svg                       │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  ATRIBUTOS POR EFECTO                                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ floating-png:                                                            │
 * │   png-src       url                                                     │
 * │   png-count     1–20 (default 6)                                        │
 * │   png-width     CSS width                                               │
 * │   png-height    CSS height                                              │
 * │   png-size      atajo: width si no hay png-width/height (default 48px)  │
 * │                                                                         │
 * │ floating-svg:                                                            │
 * │   svg-shape     cross|heart|star|circle|triangle|dove (default cross)   │
 * │   svg-color     color CSS (default #ffd700)                             │
 * │   svg-count     1–20 (default 6)                                        │
 * │   svg-size      tamaño CSS (default 28px)                               │
 * │                                                                         │
 * │ glow-pulse:                                                              │
 * │   glow-color    color CSS (default #ffd700)                             │
 * │                                                                         │
 * │ rays:                                                                    │
 * │   rays-color    color CSS (default #ffd700)                             │
 * │   rays-count    nº de rayos (default 8)                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

(function () {
  if (customElements.get('section-title')) return;

  /* ───── estilos (sólo lo que no aporta .section-header) ───── */
  if (!document.querySelector('style[data-section-title]')) {
    const st = document.createElement('style');
    st.setAttribute('data-section-title', '1');
    st.textContent = `
      /* el host: !important para defender contra reglas externas tipo #nosotros
         que pisan display/padding por especificidad de ID. */
      section-title {
        display: block !important;
        padding: 0 !important;
        background: transparent !important;
      }

      section-title .st-fx-layer {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
        border-radius: inherit;
      }
      section-title .st-fx-layer canvas { width: 100%; height: 100%; display: block; }

      section-title .st-fx-layer .st-png,
      section-title .st-fx-layer .st-svg {
        position: absolute;
        opacity: 0.85;
        will-change: transform;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
      }

      section-title .st-fx-layer .st-glow-pulse {
        position: absolute; inset: 0;
        border-radius: inherit;
        animation: st-glow-pulse 2.4s ease-in-out infinite;
        mix-blend-mode: screen;
        transform-origin: center;
      }

      section-title .st-fx-layer .st-aurora {
        position: absolute; inset: 0;
        border-radius: inherit;
        background-size: 400% 400%;
        animation: st-aurora-shift 14s ease-in-out infinite;
        mix-blend-mode: overlay;
        opacity: 0.85;
      }

      section-title .md3-headline {
        position: relative;
        z-index: 2;
      }

      /* Restaurar centrado del .section-header — el "reacomodamiento gral" lo
         dejó en display:block produciendo padding asimétrico.
         width:100% defiende contra reglas legacy como #nosotros { display:flex; }
         que hacían que el flex container colapsara a content-width. */
      section-title > section.section-header {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
      }

      /* Refuerzo mobile: contrarresta inline styles que pisan el padding base */
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
        /* icon-mobile="off" → oculta el ícono cuando viewport ≤ 768px */
        section-title .st-icon-hide-mobile { display: none !important; }
      }

      @keyframes st-png-float {
        0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
        50%  { transform: translate3d(8px, -10px, 0) rotate(6deg); }
        100% { transform: translate3d(0, 0, 0) rotate(0deg); }
      }

      @keyframes st-glow-pulse {
        0%, 100% { opacity: 0.25; transform: scale(0.94); }
        50%      { opacity: 0.85; transform: scale(1.02); }
      }

      @keyframes st-aurora-shift {
        0%   { background-position:   0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position:   0% 50%; }
      }
    `;
    document.head.appendChild(st);
  }

  /* ───── SVG shapes ───── */
  const SVG_SHAPES = {
    cross:    'M11 2h2v8h8v2h-8v10h-2V12H3v-2h8z',
    heart:    'M12 21s-7-4.5-7-10a4 4 0 017-2.8A4 4 0 0119 11c0 5.5-7 10-7 10z',
    star:     'M12 2l2.5 7.5H22l-6 4.5 2.3 7.5L12 17l-6.3 4.5L8 14l-6-4.5h7.5z',
    circle:   'M12 2a10 10 0 110 20 10 10 0 010-20z',
    triangle: 'M12 2 L22 22 L2 22 Z',
    dove:     'M2 13 C2 8 7 6 11 7 C13 7.5 14 8.5 15 10 L20 7 L18.5 11 L21 14 L17 13.5 C15 17 9 18 5 15 C3.5 14 2.5 13.5 2 13 Z',
  };

  /* ───── paleta común ───── */
  const PARTICLE_COLORS = ['#fffbe9','#ffd700','#00e5ff','#ff80ab','#b388ff','#fff','#ffe082','#80d8ff','#ffb300','#ff4081'];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ───────── lista canónica de efectos ───────── */
  const CANVAS_EFFECTS = ['stars', 'bubbles', 'popping-bubbles', 'confetti', 'snow', 'rays'];
  const DOM_EFFECTS    = ['floating-png', 'floating-svg', 'glow-pulse', 'aurora'];
  const TEXT_EFFECTS   = ['text-glow'];
  const ALL_EFFECTS    = [...CANVAS_EFFECTS, ...DOM_EFFECTS, ...TEXT_EFFECTS];

  class SectionTitle extends HTMLElement {
    static get observedAttributes() {
      return ['text', 'icon', 'icon-type', 'icon-mobile', 'effect',
              'png-src', 'png-count', 'png-size', 'png-width', 'png-height',
              'svg-shape', 'svg-color', 'svg-count', 'svg-size',
              'glow-color', 'rays-color', 'rays-count',
              'text-glow-color', 'text-glow-accent',
              'shadow', 'extra-style', 'id'];
    }

    connectedCallback()    { this._rafs = []; this._ros = []; this._render(); }
    disconnectedCallback() { this._stopAll(); }
    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _stopAll() {
      if (this._rafs) for (const id of this._rafs) cancelAnimationFrame(id);
      if (this._ros)  for (const ro of this._ros)  ro.disconnect();
      this._rafs = []; this._ros = [];
    }

    _get(k, fb) { return this.hasAttribute(k) ? this.getAttribute(k) : fb; }

    _detectIconType(icon) {
      if (!icon) return 'none';
      const t = this._get('icon-type', 'auto');
      if (t !== 'auto') return t;
      if (/^[a-z][a-z0-9_]*$/.test(icon)) return 'material';
      if (/^fa-/.test(icon) || /^fas?\s/.test(icon)) return 'fa';
      return 'emoji';
    }

    _render() {
      this._stopAll();

      const text       = this._get('text', '');
      const icon       = this._get('icon', '');
      const iconType   = this._detectIconType(icon);
      const effectRaw  = this._get('effect', 'none');
      const shadow     = this._get('shadow', '');
      const extraStyle = this._get('extra-style', '');
      const idAttr     = this._get('id', '');

      const effects = effectRaw.split(/\s+/).map(s => s.trim()).filter(Boolean)
                               .filter(e => ALL_EFFECTS.includes(e));
      const hasEffect = (e) => effects.includes(e);
      const anyEffect = effects.length > 0;

      this.innerHTML = '';

      const section = document.createElement('section');
      section.className = 'section-header' + (shadow === 'lg' ? ' shadow-lg' : '');
      if (idAttr) section.id = idAttr;
      section.style.cssText = `position: relative; ${extraStyle}`;

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

      // text-glow: resplandor color sobre el texto + ícono (recupera el look
      // azulado original de AVISOS). Parametrizable via text-glow-color
      // (color principal del halo) y text-glow-accent (línea inferior dorada).
      if (hasEffect('text-glow')) {
        const glowColor  = this._get('text-glow-color',  '#00e5ff');
        const accentColor= this._get('text-glow-accent', '#ffd700');
        const textShadow = `0 2px 8px rgba(0,0,0,0.65),`
                         + ` 0 4px 16px rgba(255,255,255,0.5),`
                         + ` 0 1px 0 ${accentColor},`
                         + ` 0 0 24px ${glowColor}`;
        h2.style.textShadow    = textShadow;
        h2.style.fontWeight    = '700';
        h2.style.letterSpacing = '1.5px';
        h2.dataset.textGlowColor  = glowColor;
        h2.dataset.textGlowAccent = accentColor;
      }

      const iconMobile  = this._get('icon-mobile', 'on');
      const hideOnMobile = iconMobile === 'off';

      if (icon) {
        if (iconType === 'material') {
          const i = document.createElement('i');
          i.className = 'material-icons align-middle';
          if (hideOnMobile) i.classList.add('st-icon-hide-mobile');
          i.style.cssText = 'font-size: 1.4em; vertical-align: middle; margin-right: 0.3em;';
          i.textContent = icon;
          if (hasEffect('text-glow')) {
            i.style.color = '#fff';
            i.style.textShadow = `0 0 12px #fff, 0 0 24px ${h2.dataset.textGlowColor}`;
          }
          h2.appendChild(i);
        } else if (iconType === 'fa') {
          const i = document.createElement('i');
          i.className = icon.startsWith('fa-') ? `fas ${icon}` : icon;
          if (hideOnMobile) i.classList.add('st-icon-hide-mobile');
          i.style.cssText = 'margin-right: 0.4em;';
          if (hasEffect('text-glow')) {
            i.style.color = '#fff';
            i.style.textShadow = `0 0 12px #fff, 0 0 24px ${h2.dataset.textGlowColor}`;
          }
          h2.appendChild(i);
        } else {
          // emoji o texto: envolvemos en span para poder ocultarlo en mobile
          if (hideOnMobile) {
            const sp = document.createElement('span');
            sp.className = 'st-icon-hide-mobile';
            sp.textContent = icon + ' ';
            h2.appendChild(sp);
          } else {
            h2.appendChild(document.createTextNode(icon + ' '));
          }
        }
      }
      h2.appendChild(document.createTextNode(text));
      section.appendChild(h2);

      this.appendChild(section);

      // ── efectos DOM ── (no necesitan medidas)
      if (hasEffect('aurora'))       this._startAurora(fxLayer);
      if (hasEffect('glow-pulse'))   this._startGlowPulse(fxLayer);
      if (hasEffect('floating-png')) this._startFloatingPng(fxLayer);
      if (hasEffect('floating-svg')) this._startFloatingSvg(fxLayer);

      // ── efectos canvas ──
      // Antes usábamos requestAnimationFrame para esperar el primer layout, pero
      // rAF no se dispara en tabs en background ni en algunos contextos
      // headless, lo que dejaba el canvas sin crear. La sección ya está en el
      // DOM por appendChild, así que offsetWidth fuerza el layout sync y
      // podemos arrancar el canvas directo.
      const canvasFx = effects.filter(e => CANVAS_EFFECTS.includes(e));
      if (canvasFx.length) {
        this._startCanvasFx(fxLayer, section, canvasFx);
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       EFECTOS CANVAS (stars, bubbles, confetti, snow, rays)
       Comparten un solo canvas + un solo loop.
       ═══════════════════════════════════════════════════════════════ */
    _startCanvasFx(fxLayer, container, canvasFx) {
      if (!fxLayer) return;
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

      const FACTORIES = {
        stars: () => ({
          type: 'stars',
          x: rand(0, W), y: rand(0, H * 0.7) + 10,
          r: rand(W < 600 ? 0.5 : 0.8, W < 600 ? 1.0 : 1.5),
          twinkle: rand(0, Math.PI * 2),
          color: pick(PARTICLE_COLORS),
          z: rand(0.7, W < 600 ? 1.9 : 2.4),
        }),
        bubbles: () => ({
          type: 'bubbles',
          x: rand(0, W), y: H + rand(5, 30),
          r: rand(3, 9),
          vy: -rand(0.3, 0.9), vx: rand(-0.4, 0.4),
          color: pick(PARTICLE_COLORS),
        }),
        'popping-bubbles': () => ({
          type: 'popping-bubbles',
          x: rand(0, W), y: H + rand(5, 30),
          r: rand(4, 11),
          vy: -rand(0.4, 1.0), vx: rand(-0.4, 0.4),
          color: pick(PARTICLE_COLORS),
          // estado: 0 = subiendo, 1 = explotando, 2 = muerta
          phase: 0,
          popAt: rand(H * 0.15, H * 0.55),   // altura donde explota
          popProgress: 0,
        }),
        confetti: () => ({
          type: 'confetti',
          x: rand(0, W), y: -rand(5, 30),
          r: rand(3, 6),
          vy: rand(0.6, 2), vx: rand(-1.2, 1.2),
          rot: rand(0, Math.PI * 2), rotV: rand(-0.12, 0.12),
          color: pick(PARTICLE_COLORS),
        }),
        snow: () => ({
          type: 'snow',
          x: rand(0, W), y: -rand(5, 30),
          r: rand(1.2, 3.2),
          vy: rand(0.3, 0.9), vx: rand(-0.3, 0.3),
          sway: rand(0, Math.PI * 2),
          color: '#fff',
        }),
      };

      const COUNTS = {
        stars:             () => W < 600 ? 14 : W < 900 ? 24 : 36,
        bubbles:           () => W < 600 ? 8  : 14,
        'popping-bubbles': () => W < 600 ? 6  : 12,
        confetti:          () => W < 600 ? 16 : 28,
        snow:              () => W < 600 ? 12 : 22,
      };

      const sparks = [];

      const DRAWERS = {
        stars: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.7 + 0.3 * Math.sin(p.twinkle);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12 * p.z;
          ctx.fill();
          ctx.restore();
          p.twinkle += 0.04 + Math.random() * 0.01;
          if (Math.random() < 0.01) {
            sparks.push({
              x: p.x, y: p.y,
              vx: (Math.random() - 0.5) * 2.2,
              vy: -Math.random() * 2.2 - 0.5,
              alpha: 1, r: Math.random() * 1.5 + 0.7,
              color: pick(PARTICLE_COLORS),
            });
          }
        },
        bubbles: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
          p.y += p.vy; p.x += p.vx;
          if (p.y + p.r < 0) Object.assign(p, FACTORIES.bubbles());
        },
        'popping-bubbles': (p) => {
          if (p.phase === 0) {
            // Fase 1: subiendo como burbuja normal
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.8;
            ctx.stroke();
            // brillo interior leve
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = p.color;
            ctx.fill();
            // reflejo blanco arriba-izquierda
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.restore();
            p.y += p.vy; p.x += p.vx;
            if (p.y <= p.popAt) p.phase = 1;
            if (p.y + p.r < 0) Object.assign(p, FACTORIES['popping-bubbles']());
          } else if (p.phase === 1) {
            // Fase 2: EXPLOSIÓN — anillo que se expande y pierde alpha + chispas
            p.popProgress += 0.07;
            const expand = 1 + p.popProgress * 2.5;
            const alpha = Math.max(0, 1 - p.popProgress);
            ctx.save();
            ctx.globalAlpha = alpha * 0.9;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * expand, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            // gotitas/sparks radiales en el primer frame del pop
            if (p.popProgress < 0.2) {
              for (let k = 0; k < 6; k++) {
                const a = (k / 6) * Math.PI * 2;
                const d = p.r * (1 + p.popProgress * 4);
                ctx.beginPath();
                ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.fill();
              }
            }
            ctx.restore();
            if (p.popProgress >= 1) {
              // Reset: nueva burbuja desde abajo
              Object.assign(p, FACTORIES['popping-bubbles']());
            }
          }
        },
        confetti: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
          ctx.restore();
          p.y += p.vy; p.x += p.vx; p.rot += p.rotV;
          if (p.y > H + 20) Object.assign(p, FACTORIES.confetti());
        },
        snow: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
          p.sway += 0.02;
          p.y += p.vy; p.x += p.vx + Math.sin(p.sway) * 0.5;
          if (p.y > H + 10) Object.assign(p, FACTORIES.snow());
        },
      };

      const particleFx = canvasFx.filter(e => FACTORIES[e]);
      let particles = [];
      const initParticles = () => {
        particles = [];
        for (const fx of particleFx) {
          const n = COUNTS[fx]();
          for (let i = 0; i < n; i++) particles.push(FACTORIES[fx]());
        }
      };
      initParticles();

      const ro = new ResizeObserver(() => { resize(); initParticles(); });
      ro.observe(container);
      this._ros.push(ro);

      /* ── rays state ── */
      const hasRays = canvasFx.includes('rays');
      const raysColor  = this._get('rays-color', '#ffd700');
      const raysCount  = Math.min(20, Math.max(2, parseInt(this._get('rays-count', '8'))));
      const raysState  = { angle: 0 };

      const drawRays = () => {
        if (!hasRays) return;
        const cx = W * 0.5, cy = H * 0.5;
        const len = Math.hypot(W, H);
        const spread = 0.04;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < raysCount; i++) {
          const a = raysState.angle + (i / raysCount) * Math.PI * 2;
          const x2 = cx + Math.cos(a) * len;
          const y2 = cy + Math.sin(a) * len;
          const grad = ctx.createLinearGradient(cx, cy, x2, y2);
          grad.addColorStop(0, raysColor);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.30;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a - spread) * len, cy + Math.sin(a - spread) * len);
          ctx.lineTo(cx + Math.cos(a + spread) * len, cy + Math.sin(a + spread) * len);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        raysState.angle += 0.0025;
      };

      const drawFrame = () => {
        ctx.clearRect(0, 0, W, H);
        drawRays();
        for (const p of particles) {
          const fn = DRAWERS[p.type];
          if (fn) fn(p);
        }
        // sparks de stars
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
          s.x += s.vx; s.y += s.vy; s.vy += 0.045;
          s.alpha -= (s.r > 2 || s.alpha > 1) ? 0.012 : 0.018;
          if (s.alpha <= 0) sparks.splice(i, 1);
        }
      };
      const loop = () => {
        if (!this.isConnected) { ro.disconnect(); return; }
        drawFrame();
        this._rafs.push(requestAnimationFrame(loop));
      };
      // Paint inicial síncrono para que el canvas no quede en blanco si rAF
      // no dispara enseguida (tabs en background, contexto headless).
      drawFrame();
      this._rafs.push(requestAnimationFrame(loop));
    }

    /* ═══════════════════════════════════════════════════════════════
       EFECTOS DOM
       ═══════════════════════════════════════════════════════════════ */

    /* PNGs flotando */
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

    /* SVGs flotando (formas pre-armadas) */
    _startFloatingSvg(fxLayer) {
      const shape = this._get('svg-shape', 'cross');
      const path  = SVG_SHAPES[shape] || SVG_SHAPES.cross;
      const color = this._get('svg-color', '#ffd700');
      const count = Math.min(20, Math.max(1, parseInt(this._get('svg-count', '6'))));
      const size  = this._get('svg-size', '28px');
      const NS    = 'http://www.w3.org/2000/svg';

      for (let i = 0; i < count; i++) {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.classList.add('st-svg');
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', path);
        p.setAttribute('fill', color);
        svg.appendChild(p);
        svg.style.left = (Math.random() * 90) + '%';
        svg.style.top  = (Math.random() * 70 + 5) + '%';
        const dur   = (3 + Math.random() * 4).toFixed(2);
        const delay = (-Math.random() * 4).toFixed(2);
        svg.style.animation = `st-png-float ${dur}s ease-in-out ${delay}s infinite`;
        svg.style.opacity   = (0.5 + Math.random() * 0.5).toFixed(2);
        fxLayer.appendChild(svg);
      }
    }

    /* Halo pulsante — usamos un radial-gradient ancho con mix-blend-mode: screen
       en lugar de inset box-shadow. Mucho más visible porque ilumina toda la
       superficie del header en vez de solo los bordes. */
    _startGlowPulse(fxLayer) {
      const div = document.createElement('div');
      div.className = 'st-glow-pulse';
      const c = this._get('glow-color', '#ffd700');
      div.style.backgroundImage = `radial-gradient(ellipse at center, ${c} 0%, ${c} 25%, transparent 75%)`;
      fxLayer.appendChild(div);
    }

    /* Aurora: gradiente animado.
       OJO: usar backgroundImage (no background) para no resetear background-size:
       el shorthand "background:" pisa el "background-size: 400% 400%" del CSS
       y deja la capa estática. */
    _startAurora(fxLayer) {
      const div = document.createElement('div');
      div.className = 'st-aurora';
      div.style.backgroundImage = `linear-gradient(120deg,
        rgba(0,229,255,0.45),
        rgba(179,136,255,0.55),
        rgba(255,128,171,0.45),
        rgba(255,215,0,0.45),
        rgba(0,229,255,0.45))`;
      fxLayer.appendChild(div);
    }
  }

  customElements.define('section-title', SectionTitle);
})();
