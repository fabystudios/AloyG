/**
 * <magic-header> Web Component
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  PROPS / ATRIBUTOS                                                      │
 * ├────────────────────────┬────────────────────────────────┬──────────────-┤
 * │ Atributo               │ Valores                        │ Default        │
 * ├────────────────────────┼────────────────────────────────┼───────────────┤
 * │ text                   │ string                         │ "AVISOS"       │
 * │ icon-type              │ "material" | "img" | "none"    │ "material"     │
 * │ icon-name              │ nombre Material Icon           │ "campaign"     │
 * │ icon-url               │ URL imagen                     │ ""             │
 * │ suffix-url             │ URL PNG/SVG tras el texto      │ ""             │
 * │ suffix-effect          │ "glow"|"spin"|"pulse"|"none"   │ "none"         │
 * ├────────────────────────┼────────────────────────────────┼───────────────┤
 * │ bg-start               │ color CSS                      │ "#8B5CF6"  ← violeta real
 * │ bg-mid                 │ color CSS (punto medio)        │ "#60A5FA"  ← azul medio
 * │ bg-end                 │ color CSS                      │ "#38BDF8"  ← celeste real
 * │ grad-angle             │ 0–360 (grados)                 │ "90"           │
 * ├────────────────────────┼────────────────────────────────┼───────────────┤
 * │ width-desktop          │ valor CSS (vw, %, px…)         │ "90vw"         │
 * │ width-mobile           │ valor CSS — bajo 768px         │ "95vw"         │
 * │ max-width              │ valor CSS o "none"             │ "none"         │
 * │ margin                 │ valor CSS                      │ "0 auto"   ← centrado
 * │ height                 │ valor CSS                      │ "72px"         │
 * │ border-radius          │ valor CSS                      │ "16px"         │
 * ├────────────────────────┼────────────────────────────────┼───────────────┤
 * │ text-color             │ color CSS                      │ "#ffffff"      │
 * │ glow-color             │ color del resplandor           │ "#ffffff"      │
 * │ glow-spread            │ px de spread del glow          │ "18"           │
 * │ text-shadow            │ preset o "custom"              │ "white-glow"   │
 * │ text-shadow-value      │ CSS completo si ="custom"      │ ""             │
 * │ font-family            │ font-family CSS                │ Roboto         │
 * │ letter-spacing         │ valor CSS                      │ "4px"          │
 * │ font-size              │ valor CSS                      │ "1.7rem"       │
 * │ align                  │ "left"|"center"|"right"        │ "center"       │
 * ├────────────────────────┼────────────────────────────────┼───────────────┤
 * │ effect                 │ "stars"|"bubbles"|             │ "stars"        │
 * │                        │ "confetti"|"snow"|"none"       │                │
 * │ particle-colors        │ colores separados por coma     │ (multicolor)   │
 * │ particle-count         │ número                         │ "28"           │
 * └────────────────────────┴────────────────────────────────┴───────────────┘
 *
 * USO MÍNIMO — réplica exacta de la captura:
 *   <magic-header></magic-header>
 *
 * CON ANCHO EXPLÍCITO:
 *   <magic-header width-desktop="80vw" width-mobile="95vw"></magic-header>
 *   <magic-header width-desktop="1200px" max-width="95%"></magic-header>
 */

(function () {

  /* ─── Material Icons ─── */
  if (!document.querySelector('link[data-magic-icons]')) {
    const l = document.createElement('link');
    l.rel  = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    l.setAttribute('data-magic-icons', '1');
    document.head.appendChild(l);
  }

  /* ─── text-shadow presets ─── */
  const mkGlow = (color, spread) =>
    `0 0 ${spread}px ${color}, 0 0 ${spread * 2}px ${color}, 0 2px 4px rgba(0,0,0,.35)`;

  const SHADOWS = {
    'white-glow':   (g, s) => mkGlow(g || '#fff', s || 18),
    'gold-cyan':    ()     => '0 2px 8px rgba(0,0,0,.65), 0 1px 0 #ffd700, 0 0 24px #00e5ff',
    'neon-green':   ()     => '0 0 8px #39ff14, 0 0 24px #39ff14, 0 2px 4px rgba(0,0,0,.6)',
    'fire':         ()     => '0 0 8px #ff6a00, 0 0 20px #ee0979, 0 2px 4px rgba(0,0,0,.6)',
    'none':         ()     => 'none',
  };

  /* ─── Estilos base ─── */
  if (!document.querySelector('style[data-magic-header]')) {
    const st = document.createElement('style');
    st.setAttribute('data-magic-header', '1');
    st.textContent = `
magic-header { display: block; }

magic-header .mh-outer {
  /* ancho se setea inline; centrado con margin:auto */
  box-sizing: border-box;
}

magic-header .mh-root {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

magic-header canvas.mh-canvas {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 1;
}

magic-header .mh-h2 {
  margin: 0; position: relative; z-index: 2;
  display: flex; align-items: center; gap: 12px;
  font-weight: 900; text-transform: uppercase;
  width: 100%;
}

magic-header .mh-icon-material { font-size: 1.5em; line-height: 1; }
magic-header .mh-icon-img      { width: 1.5em; height: 1.5em; object-fit: contain; }
magic-header .mh-suffix-img    { height: 1.3em; object-fit: contain; margin-left: 4px; }
magic-header .mh-suffix-glow   { filter: drop-shadow(0 0 6px currentColor); }
magic-header .mh-suffix-spin   { animation: mh-spin  3s linear       infinite; }
magic-header .mh-suffix-pulse  { animation: mh-pulse 1.6s ease-in-out infinite; }

@keyframes mh-spin  { to { transform: rotate(360deg); } }
@keyframes mh-pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.6; transform:scale(1.15); } }
    `;
    document.head.appendChild(st);
  }

  /* ═══════════════════════════════════════════════════════════════ */
  class MagicHeader extends HTMLElement {

    static get observedAttributes() {
      return [
        'text','icon-type','icon-name','icon-url',
        'suffix-url','suffix-effect',
        'bg-start','bg-mid','bg-end','grad-angle',
        'width-desktop','width-mobile','max-width','margin',
        'height','border-radius',
        'text-color','glow-color','glow-spread',
        'text-shadow','text-shadow-value',
        'font-family','letter-spacing','font-size','align',
        'effect','particle-colors','particle-count',
      ];
    }

    connectedCallback()    { this._raf = null; this._render(); this._bindResize(); }
    disconnectedCallback() {
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._mq)  this._mq.removeEventListener('change', this._onMQ);
    }
    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _get(k, fb) { return this.hasAttribute(k) ? this.getAttribute(k) : fb; }

    /* ── responsive: escucha breakpoint 768px ── */
    _bindResize() {
      this._mq = window.matchMedia('(max-width: 767px)');
      this._onMQ = () => this._applyWidth();
      this._mq.addEventListener('change', this._onMQ);
    }

    _applyWidth() {
      const isMobile    = window.matchMedia('(max-width: 767px)').matches;
      const wDesktop    = this._get('width-desktop', '90vw');
      const wMobile     = this._get('width-mobile',  '95vw');
      const maxWidth    = this._get('max-width',      'none');
      const margin      = this._get('margin',         '0 auto');
      const outer       = this.querySelector('.mh-outer');
      if (!outer) return;
      outer.style.width    = isMobile ? wMobile : wDesktop;
      outer.style.maxWidth = maxWidth;
      outer.style.margin   = margin;
    }

    _render() {
      if (this._raf) cancelAnimationFrame(this._raf);

      /* ── props ── */
      const text         = this._get('text',           'AVISOS');
      const iconType     = this._get('icon-type',      'material');
      const iconName     = this._get('icon-name',      'campaign');
      const iconUrl      = this._get('icon-url',       '');
      const suffixUrl    = this._get('suffix-url',     '');
      const suffixFx     = this._get('suffix-effect',  'none');

      /* gradiente de 3 paradas: violeta → azul → celeste */
      const bg1          = this._get('bg-start',       '#8B5CF6');
      const bgm          = this._get('bg-mid',         '#60A5FA');
      const bg2          = this._get('bg-end',         '#38BDF8');
      const angle        = this._get('grad-angle',     '90');

      /* forma */
      const height       = this._get('height',         '72px');
      const borderRadius = this._get('border-radius',  '16px');
      const margin       = this._get('margin',         '0 auto');
      const maxWidth     = this._get('max-width',      'none');
      const isMobile     = window.matchMedia('(max-width: 767px)').matches;
      const wDesktop     = this._get('width-desktop',  '90vw');
      const wMobile      = this._get('width-mobile',   '95vw');
      const width        = isMobile ? wMobile : wDesktop;

      /* texto / glow */
      const textColor    = this._get('text-color',     '#ffffff');
      const glowColor    = this._get('glow-color',     '#ffffff');
      const glowSpread   = parseInt(this._get('glow-spread', '18'));
      const shadowKey    = this._get('text-shadow',    'white-glow');
      const shadowCustom = this._get('text-shadow-value', '');
      const fontFamily   = this._get('font-family',    "'Roboto', Arial, sans-serif");
      const letterSpacing= this._get('letter-spacing', '4px');
      const fontSize     = this._get('font-size',      '1.7rem');
      const align        = this._get('align',          'center');

      /* partículas */
      const effect       = this._get('effect',         'stars');
      const pColorsRaw   = this._get('particle-colors',
                             '#fffbe9,#ffd700,#ff80ab,#b388ff,#80d8ff,#ffb300,#ff4081,#fff,#c084fc');
      const pCount       = Math.min(60, Math.max(2, parseInt(this._get('particle-count','28'))));

      /* derivados */
      const pColors    = pColorsRaw.split(',').map(s => s.trim()).filter(Boolean);
      const shadowFn   = SHADOWS[shadowKey] || SHADOWS['white-glow'];
      const textShadow = shadowKey === 'custom'
        ? shadowCustom
        : shadowFn(glowColor, glowSpread);

      /* glow del ícono (filter) */
      const iconGlow   = `drop-shadow(0 0 ${glowSpread * 0.6}px ${glowColor}) drop-shadow(0 0 ${glowSpread * 0.3}px ${glowColor})`;

      const justifyMap = { left:'flex-start', center:'center', right:'flex-end' };
      const justify    = justifyMap[align] || 'center';

      /* ── DOM ── */
      this.innerHTML = '';

      /* outer: controla ancho y centrado */
      const outer = document.createElement('div');
      outer.className = 'mh-outer';
      outer.style.cssText = [
        `width: ${width}`,
        `max-width: ${maxWidth}`,
        `margin: ${margin}`,
        `height: ${height}`,
        `border-radius: ${borderRadius}`,
      ].join('; ');

      /* inner: gradiente + overflow:hidden */
      const root = document.createElement('div');
      root.className = 'mh-root';
      root.style.cssText = [
        `background: linear-gradient(${angle}deg, ${bg1} 0%, ${bgm} 50%, ${bg2} 100%)`,
        `border-radius: ${borderRadius}`,
        `padding: 0 2.5rem`,
      ].join('; ');

      const canvas = document.createElement('canvas');
      canvas.className = 'mh-canvas';
      root.appendChild(canvas);

      const h2 = document.createElement('h2');
      h2.className = 'mh-h2';
      h2.style.cssText = [
        `color: ${textColor}`,
        `font-family: ${fontFamily}`,
        `letter-spacing: ${letterSpacing}`,
        `font-size: ${fontSize}`,
        `text-shadow: ${textShadow}`,
        `justify-content: ${justify}`,
      ].join('; ');

      /* ícono */
      if (iconType === 'material' && iconName) {
        const ic = document.createElement('i');
        ic.className = 'material-icons mh-icon-material';
        ic.style.cssText = `color:${textColor}; filter:${iconGlow};`;
        ic.textContent = iconName;
        h2.appendChild(ic);
      } else if (iconType === 'img' && iconUrl) {
        const img = document.createElement('img');
        img.className = 'mh-icon-img';
        img.style.filter = iconGlow;
        img.src = iconUrl; img.alt = '';
        h2.appendChild(img);
      }

      /* texto */
      const span = document.createElement('span');
      span.textContent = text;
      h2.appendChild(span);

      /* suffix */
      if (suffixUrl) {
        const si = document.createElement('img');
        si.className = 'mh-suffix-img';
        si.src = suffixUrl; si.alt = '';
        if (suffixFx === 'glow')  si.classList.add('mh-suffix-glow');
        if (suffixFx === 'spin')  si.classList.add('mh-suffix-spin');
        if (suffixFx === 'pulse') si.classList.add('mh-suffix-pulse');
        h2.appendChild(si);
      }

      root.appendChild(h2);
      outer.appendChild(root);
      this.appendChild(outer);

      if (effect !== 'none') this._startParticles(canvas, root, effect, pColors, pCount);
    }

    /* ── motor de partículas ── */
    _startParticles(canvas, container, effect, pColors, pCount) {
      const dpr  = window.devicePixelRatio || 1;
      const ctx  = canvas.getContext('2d');
      const rand = (a, b) => Math.random() * (b - a) + a;
      const pick = arr   => arr[Math.floor(Math.random() * arr.length)];
      let W, H;

      const resize = () => {
        W = container.offsetWidth;
        H = container.offsetHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const factories = {
        stars:    () => ({ x:rand(0,W), y:rand(0,H*.95), r:rand(.4,1.5), twinkle:rand(0,Math.PI*2), z:rand(.7,2), color:pick(pColors) }),
        bubbles:  () => ({ x:rand(0,W), y:H+rand(5,15), r:rand(3,9), vy:-rand(.3,.9), vx:rand(-.4,.4), color:pick(pColors) }),
        confetti: () => ({ x:rand(0,W), y:-rand(5,15), r:rand(2,5), vy:rand(.5,2), vx:rand(-1.2,1.2), rot:rand(0,Math.PI*2), rotV:rand(-.12,.12), color:pick(pColors) }),
        snow:     () => ({ x:rand(0,W), y:-rand(5,12), r:rand(1,3.5), vy:rand(.3,.9), vx:rand(-.4,.4), color:'#fff' }),
      };

      const mkP     = factories[effect] || factories.stars;
      let particles = Array.from({ length: pCount }, mkP);
      const sparks  = [];

      const drawers = {
        stars(p) {
          ctx.save();
          ctx.globalAlpha = .6 + .4 * Math.sin(p.twinkle);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI*2);
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10 * p.z;
          ctx.fill(); ctx.restore();
          p.twinkle += .04 + Math.random()*.01;
          if (Math.random() < .01)
            sparks.push({ x:p.x, y:p.y, vx:rand(-2,2), vy:-rand(.4,2.5), alpha:1, r:rand(.6,2), color:pick(pColors) });
        },
        bubbles(p) {
          ctx.save(); ctx.globalAlpha = .5;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          p.y += p.vy; p.x += p.vx;
          if (p.y + p.r < 0) Object.assign(p, factories.bubbles());
        },
        confetti(p) {
          ctx.save(); ctx.globalAlpha = .85;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r); ctx.restore();
          p.y += p.vy; p.x += p.vx; p.rot += p.rotV;
          if (p.y > H+10) Object.assign(p, factories.confetti());
        },
        snow(p) {
          ctx.save(); ctx.globalAlpha = .8;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
          p.y += p.vy; p.x += p.vx;
          if (p.y > H+10) Object.assign(p, factories.snow());
        },
      };

      const draw = drawers[effect] || drawers.stars;

      const loop = () => {
        if (!this.isConnected) { ro.disconnect(); return; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) draw(p);

        if (effect === 'stars') {
          for (let i = sparks.length-1; i >= 0; i--) {
            const s = sparks[i];
            ctx.save(); ctx.globalAlpha = s.alpha;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
            ctx.fillStyle = s.color; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
            ctx.fill(); ctx.restore();
            s.x += s.vx; s.y += s.vy; s.vy += .04;
            s.alpha -= s.r > 1.5 ? .013 : .02;
            if (s.alpha <= 0) sparks.splice(i, 1);
          }
        }
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
  }

  customElements.define('magic-header', MagicHeader);
})();
