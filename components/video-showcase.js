/**
 * <video-showcase> — Web Component encapsulado (Shadow DOM) para mostrar
 * video en un "chassis" visualmente premium, con marco perimetral animado
 * tipo marquesina, efectos internos configurables (lluvia, estallido, y
 * los que se agreguen) y un sistema de confetti independiente.
 *
 * Es un Custom Element de plataforma (vanilla, sin dependencias). No usa
 * JSX: las "props" del pedido original se exponen como atributos HTML
 * (kebab-case) y, en espejo, como propiedades JS (camelCase). Ejemplos:
 *
 *   <video-showcase
 *     video-desktop="landscape.mp4"
 *     video-mobile="vertical.mp4"
 *     frame-image="marco.png"
 *     frame-speed="80"
 *     effect-mode="rain"
 *     effect-image="gota.png"
 *     width="900px">
 *   </video-showcase>
 *
 *   el.videoDesktop        // "landscape.mp4"
 *   el.confetti = true     // dispara confetti (equivalente a confetti={true})
 *   el.fireConfetti()      // dispara confetti sin tocar el atributo
 *
 * ATRIBUTOS / PROPIEDADES:
 *   video              (video)            video único para desktop y mobile
 *   video-desktop      (videoDesktop)     video landscape para desktop
 *   video-mobile       (videoMobile)      video vertical para mobile
 *   frame-image        (frameImage)       PNG/SVG para el marco marquesina
 *   frame-speed        (frameSpeed)       velocidad del marco en px/s (default 60)
 *   frame-size         (frameSize)        tamaño del tile del marco en px (default 32)
 *   frame-direction    (frameDirection)   'clockwise' | 'counterclockwise'
 *   effect-image       (effectImage)      PNG para el efecto interno
 *   effect-mode        (effectMode)       'none' | 'rain' | 'burst' | (uno registrado)
 *   effect-intensity   (effectIntensity)  0-100, densidad/velocidad (default 30)
 *   confetti           (confetti)         boolean; false→true dispara una tanda
 *   confetti-config    (confettiConfig)   JSON string, o por JS un objeto:
 *                                         { count, duration, speed, direction, intensity, size, colors }
 *   width              (width)            ancho en desktop, ej. "900px" (default 100%)
 *   breakpoint         (breakpoint)       viewport (px) donde pasa a modo mobile (default 768)
 *   controls           (controls)         boolean; muestra controles nativos del <video>
 *   sound-control      (soundControl)     boolean; muestra un ícono de sonido (esquina
 *                                         inferior derecha) y habilita tocar el video
 *                                         para silenciar/activar el audio
 *   sound-position     (soundPosition)    'right' (default) | 'left' — a qué lado va el
 *                                         ícono de sonido (útil si algo de tu página, ej.
 *                                         un botón "ir arriba" en mobile, tapa ese rincón)
 *   confetti-button    (confettiButton)   boolean; muestra un botón (centrado, abajo)
 *                                         que el usuario final puede tocar para lanzar
 *                                         confetti — usa la confettiConfig actual
 *   confetti-button-label (confettiButtonLabel) texto del botón anterior
 *                                         (default: emoji 🎉)
 *
 * Nota: en mobile el ancho SIEMPRE queda acotado a 95vw, sin importar el
 * valor de `width` (ver CSS: width: min(var(--vs-width), 95vw)).
 *
 * MÉTODOS PÚBLICOS:
 *   el.fireConfetti(overrides?)   dispara confetti una vez
 *   el.play() / el.pause()        controla el <video> interno
 *
 * EXTENDER CON NUEVOS EFECTOS (sin tocar este archivo):
 *   customElements.get('video-showcase').registerEffect('miEfecto', class {
 *     init(engine) {}              // engine expone: count, baseSize, baseSpeed
 *     update(dt, w, h) {}
 *     draw(ctx, image) {}          // image puede ser null: dibujar un fallback
 *   });
 *
 * Shadow DOM en modo 'open': encapsula estilos y marcado (nada se filtra
 * hacia/desde el documento host), pero deja el componente inspeccionable,
 * como la mayoría de las librerías de Web Components serias.
 */
(function () {
  'use strict';

  /* =========================================================
     0. Valores por defecto
     ========================================================= */
  const DEFAULTS = {
    width: '100%',
    breakpoint: 768,
    frameSpeed: 60, // px/s
    frameSize: 32, // px
    frameDirection: 'clockwise',
    effectMode: 'none',
    effectIntensity: 30,
    confettiConfig: {
      count: 150,
      duration: 3000, // ms
      speed: 5,
      direction: 90, // grados; 90 = hacia arriba
      intensity: 1,
      size: 10,
      colors: ['#F4C542', '#E8483C', '#4ECDC4', '#C77DFF', '#95E1D3', '#FF9F1C'],
    },
  };

  // Sprite decorativo por defecto (un pequeño destello) para que el marco
  // se vea bien incluso sin pasar `frame-image`. Es un SVG propio, no un
  // ícono de terceros.
  const DEFAULT_FRAME_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path fill="#F4C542" d="M12 0c.9 4.6 2.4 8 4 9.6 1.6 1.6 5 3.1 8 4-4.6.9-8 2.4-9.6 4' +
    '-1.6 1.6-3.1 5-4 8-.9-4.6-2.4-8-4-9.6C4.8 14.4 1.4 12.9 0 12c4.6-.9 8-2.4 9.6-4' +
    '1.6-1.6 3.1-5 4-8z"/></svg>';
  const DEFAULT_FRAME_SPRITE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(DEFAULT_FRAME_SVG);

  // Iconos del botón de sonido (SVG inline, sin dependencias externas).
  const ICON_SOUND_ON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 5V4L8 9H4z"/>' +
    '<path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a9 9 0 0 1 0 12"/></svg>';
  const ICON_SOUND_OFF =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 5V4L8 9H4z"/>' +
    '<path d="M16 9l6 6"/><path d="M22 9l-6 6"/></svg>';

  /* =========================================================
     1. Registro de efectos internos (extensible)
     ========================================================= */
  const effectsRegistry = new Map();

  class RainEffect {
    init(engine) {
      this.engine = engine;
      this.particles = [];
    }
    _spawn(w) {
      const e = this.engine;
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * 120,
        size: e.baseSize * (0.7 + Math.random() * 0.6),
        speed: e.baseSpeed * (0.6 + Math.random() * 0.8),
        drift: (Math.random() - 0.5) * 24,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2,
        opacity: 0.55 + Math.random() * 0.45,
      };
    }
    update(dt, w, h) {
      const target = this.engine.count;
      while (this.particles.length < target) this.particles.push(this._spawn(w));
      if (this.particles.length > target) this.particles.length = target;
      for (const p of this.particles) {
        p.y += p.speed * dt;
        p.x += p.drift * dt;
        p.rotation += p.spin * dt;
        if (p.y > h + 40) Object.assign(p, this._spawn(w), { y: -20 });
      }
    }
    draw(ctx, image) {
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (image) {
          ctx.drawImage(image, -p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }
  effectsRegistry.set('rain', RainEffect);

  class BurstEffect {
    init(engine) {
      this.engine = engine;
      this.particles = [];
      this.timer = 0.2;
    }
    _burst(x, y) {
      const e = this.engine;
      for (let i = 0; i < e.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = e.baseSpeed * (0.5 + Math.random());
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: e.baseSize * (0.6 + Math.random() * 0.8),
          life: 0,
          maxLife: 0.9 + Math.random() * 0.6,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 4,
        });
      }
    }
    update(dt, w, h) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this._burst(w / 2, h / 2);
        this.timer = 1.4;
      }
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.vy = p.vy * 0.98 + 50 * dt;
        p.rotation += p.spin * dt;
        if (p.life >= p.maxLife) this.particles.splice(i, 1);
      }
    }
    draw(ctx, image) {
      for (const p of this.particles) {
        const t = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (image) {
          ctx.drawImage(image, -p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.fillStyle = 'rgba(255,205,90,0.9)';
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }
  effectsRegistry.set('burst', BurstEffect);

  class EffectsEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.mode = 'none';
      this.image = null;
      this.count = 30;
      this.baseSize = 22;
      this.baseSpeed = 90;
      this.instance = null;
      this.active = false;
      this.w = 0;
      this.h = 0;
    }
    setIntensity(v) {
      const n = Math.max(0, Math.min(100, Number(v) || 0));
      this.count = Math.round(6 + n * 1.4);
      this.baseSize = 14 + n * 0.22;
      this.baseSpeed = 60 + n * 1.6;
    }
    setImage(url) {
      if (!url) {
        this.image = null;
        return;
      }
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.image = img; };
      img.onerror = () => { this.image = null; };
      img.src = url;
    }
    setMode(mode) {
      this.mode = mode || 'none';
      const Ctor = effectsRegistry.get(this.mode);
      if (!Ctor) {
        this.instance = null;
        this.active = false;
        this._clear();
        return;
      }
      this.instance = new Ctor();
      this.instance.init(this);
      this.active = true;
    }
    resize(w, h, dpr) {
      this.w = w;
      this.h = h;
      this.canvas.width = Math.max(1, Math.round(w * dpr));
      this.canvas.height = Math.max(1, Math.round(h * dpr));
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    tick(dt) {
      if (!this.active || !this.instance || !this.w) return;
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.instance.update(dt, this.w, this.h);
      this.instance.draw(this.ctx, this.image);
    }
    _clear() {
      if (this.w) this.ctx.clearRect(0, 0, this.w, this.h);
    }
    stop() {
      this.active = false;
      this.instance = null;
      this._clear();
    }
  }

  /* =========================================================
     2. Sistema de confetti (independiente de los demás efectos)
     ========================================================= */
  class ConfettiSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.active = false;
      this.timeLeft = 0;
      this.w = 0;
      this.h = 0;
      this._pendingFire = null;
    }
    resize(w, h, dpr) {
      this.w = w;
      this.h = h;
      this.canvas.width = Math.max(1, Math.round(w * dpr));
      this.canvas.height = Math.max(1, Math.round(h * dpr));
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this._pendingFire) {
        const cfg = this._pendingFire;
        this._pendingFire = null;
        this._spawn(cfg);
      }
    }
    fire(cfg) {
      // Si todavía no tenemos tamaño (ej. atributo `confetti` presente desde
      // el HTML inicial, antes de connectedCallback), encolamos y disparamos
      // apenas resize() nos dé dimensiones reales — así no se pierde en silencio.
      if (!this.w) {
        this._pendingFire = cfg || {};
        return;
      }
      this._spawn(cfg);
    }
    _spawn(cfg) {
      cfg = cfg || {};
      const count = Math.min(400, Math.max(1, Math.round(Number(cfg.count) || 150)));
      const duration = Math.max(300, Number(cfg.duration) || 3000);
      const speed = Number(cfg.speed) || 5;
      const dirDeg = Number.isFinite(cfg.direction) ? cfg.direction : 90;
      const intensity = Math.min(3, Math.max(0.2, Number(cfg.intensity) || 1));
      const size = Number(cfg.size) || 10;
      const colors = Array.isArray(cfg.colors) && cfg.colors.length ? cfg.colors : DEFAULTS.confettiConfig.colors;
      const rad = (dirDeg * Math.PI) / 180;
      const spread = Math.PI / 2.6;
      for (let i = 0; i < count; i++) {
        const a = rad + (Math.random() - 0.5) * spread;
        const v = speed * (30 + Math.random() * 45) * intensity;
        this.particles.push({
          x: this.w / 2 + (Math.random() - 0.5) * this.w * 0.5,
          y: this.h * 0.92,
          vx: Math.cos(a) * v,
          vy: -Math.sin(a) * v,
          size: size * (0.7 + Math.random() * 0.6),
          color: colors[(Math.random() * colors.length) | 0],
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 6,
          shape: Math.random() < 0.5 ? 'rect' : 'circle',
          life: 0,
        });
      }
      this.active = true;
      this.timeLeft = duration / 1000;
    }
    stop() {
      this.active = false;
      this.particles = [];
      this._clear();
    }
    _clear() {
      if (this.w) this.ctx.clearRect(0, 0, this.w, this.h);
    }
    tick(dt) {
      if (!this.active || !this.w) return;
      this.timeLeft -= dt;
      this.ctx.clearRect(0, 0, this.w, this.h);
      const fadeStart = 0.6;
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life += dt;
        p.vy += 260 * dt;
        p.vx *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        const fade = this.timeLeft < fadeStart ? Math.max(0, this.timeLeft / fadeStart) : 1;
        if (p.y - p.size > this.h || fade <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        this.ctx.save();
        this.ctx.globalAlpha = fade;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        this.ctx.restore();
      }
      if (this.timeLeft <= 0 && this.particles.length === 0) this.active = false;
    }
  }

  /* =========================================================
     3. Marco / marquesina perimetral
     ========================================================= */
  const SIDES = ['top', 'right', 'bottom', 'left'];

  class MarqueeFrame {
    constructor(shadowRoot, host) {
      this.host = host;
      this.strips = {};
      this.tracks = {};
      SIDES.forEach((side) => {
        this.strips[side] = shadowRoot.querySelector('.frame-' + side);
        this.tracks[side] = shadowRoot.querySelector('.frame-' + side + ' .frame-track');
      });
      this.image = DEFAULT_FRAME_SPRITE;
      this.size = DEFAULTS.frameSize;
      this.speed = DEFAULTS.frameSpeed;
      this.direction = DEFAULTS.frameDirection;
      this._applyDirection();
    }
    setImage(url) {
      this.image = url || DEFAULT_FRAME_SPRITE;
      this._rebuildIfConnected();
    }
    setSize(size) {
      this.size = Math.max(8, Number(size) || DEFAULTS.frameSize);
      this.host.style.setProperty('--vs-frame-size', this.size + 'px');
      this._rebuildIfConnected();
    }
    setSpeed(speed) {
      this.speed = Math.max(1, Number(speed) || DEFAULTS.frameSpeed);
      this._retimeIfConnected();
    }
    setDirection(dir) {
      this.direction = dir === 'counterclockwise' ? 'counterclockwise' : 'clockwise';
      this._applyDirection();
    }
    sync() {
      this._rebuildIfConnected();
    }
    _rebuildIfConnected() {
      if (!this.host.isConnected) return;
      SIDES.forEach((side) => this._rebuildSide(side));
      this._retimeIfConnected();
    }
    _rebuildSide(side) {
      const track = this.tracks[side];
      const strip = this.strips[side];
      if (!track || !strip) return;
      const horizontal = side === 'top' || side === 'bottom';
      const length = horizontal ? strip.offsetWidth : strip.offsetHeight;
      const count = Math.max(2, Math.ceil(length / this.size) + 1);
      track.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (let copy = 0; copy < 2; copy++) {
        for (let i = 0; i < count; i++) {
          const img = document.createElement('img');
          img.src = this.image;
          img.alt = '';
          img.draggable = false;
          if (horizontal) {
            img.style.width = this.size + 'px';
            img.style.height = '100%';
          } else {
            img.style.width = '100%';
            img.style.height = this.size + 'px';
          }
          frag.appendChild(img);
        }
      }
      track.appendChild(frag);
    }
    _retimeIfConnected() {
      if (!this.host.isConnected) return;
      SIDES.forEach((side) => {
        const strip = this.strips[side];
        const track = this.tracks[side];
        if (!strip || !track) return;
        const horizontal = side === 'top' || side === 'bottom';
        const length = horizontal ? strip.offsetWidth : strip.offsetHeight;
        track.style.animationDuration = Math.max(0.4, length / this.speed) + 's';
      });
    }
    _applyDirection() {
      // Recorrido base "en sentido horario": arriba →derecha, derecha↓,
      // abajo →izquierda, izquierda ↑. `counterclockwise` invierte las 4 tiras.
      const base = { top: 'reverse', right: 'reverse', bottom: 'normal', left: 'normal' };
      const flip = (v) => (v === 'normal' ? 'reverse' : 'normal');
      const cw = this.direction === 'clockwise';
      SIDES.forEach((side) => {
        const track = this.tracks[side];
        if (track) track.style.animationDirection = cw ? base[side] : flip(base[side]);
      });
    }
  }

  /* =========================================================
     4. Plantilla (HTML + CSS) del Shadow DOM
     ========================================================= */
  const TEMPLATE =
    '<style>' +
    ':host{display:block;box-sizing:border-box;--vs-width:' + DEFAULTS.width + ';' +
    '--vs-frame-size:' + DEFAULTS.frameSize + 'px;--vs-radius:20px;--vs-glow:rgba(244,197,66,.35);' +
    'width:min(var(--vs-width),95vw);margin-inline:auto;}' +
    '*,*::before,*::after{box-sizing:border-box;}' +
    '.showcase{position:relative;width:100%;aspect-ratio:16/9;isolation:isolate;}' +
    '.showcase::before{content:"";position:absolute;inset:-8%;background:radial-gradient(closest-side,var(--vs-glow),transparent 72%);' +
    'filter:blur(28px);z-index:0;pointer-events:none;}' +
    '.frame-border{position:absolute;inset:0;border-radius:var(--vs-radius);pointer-events:none;z-index:1;}' +
    '.frame-strip{position:absolute;overflow:hidden;}' +
    '.frame-top,.frame-bottom{left:0;right:0;height:var(--vs-frame-size);}' +
    '.frame-top{top:0;border-radius:var(--vs-radius) var(--vs-radius) 0 0;}' +
    '.frame-bottom{bottom:0;border-radius:0 0 var(--vs-radius) var(--vs-radius);}' +
    '.frame-left,.frame-right{top:var(--vs-frame-size);bottom:var(--vs-frame-size);width:var(--vs-frame-size);}' +
    '.frame-left{left:0;}.frame-right{right:0;}' +
    '.frame-track{position:absolute;top:0;left:0;display:flex;animation-timing-function:linear;' +
    'animation-iteration-count:infinite;will-change:transform;}' +
    '.frame-top .frame-track,.frame-bottom .frame-track{height:100%;width:max-content;flex-direction:row;animation-name:vs-scroll-x;}' +
    '.frame-left .frame-track,.frame-right .frame-track{width:100%;height:max-content;flex-direction:column;animation-name:vs-scroll-y;}' +
    '.frame-track img{display:block;object-fit:contain;user-select:none;-webkit-user-drag:none;}' +
    '@keyframes vs-scroll-x{to{transform:translateX(-50%);}}' +
    '@keyframes vs-scroll-y{to{transform:translateY(-50%);}}' +
    '.stage{position:absolute;inset:var(--vs-frame-size);border-radius:calc(var(--vs-radius) - 6px);overflow:hidden;' +
    'background:#0a0a0c;box-shadow:0 24px 60px -24px rgba(0,0,0,.65),inset 0 0 0 1px rgba(255,255,255,.06);z-index:2;}' +
    '.stage[data-loading]{background:linear-gradient(110deg,#0a0a0c 30%,#1c1c22 50%,#0a0a0c 70%);' +
    'background-size:200% 100%;animation:vs-shimmer 1.6s ease-in-out infinite;}' +
    '@keyframes vs-shimmer{to{background-position:-200% 0;}}' +
    '.video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:1;background:#000;}' +
    '.fx-canvas,.confetti-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}' +
    '.fx-canvas{z-index:2;}.confetti-canvas{z-index:3;}' +
    '.stage::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:4;' +
    'background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,transparent 22%,transparent 68%,rgba(0,0,0,.4) 100%);}' +
    '::slotted(*){position:relative;z-index:5;}' +
    '.sound-btn{display:none;position:absolute;right:12px;bottom:12px;width:38px;height:38px;' +
    'border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(10,10,12,.55);' +
    'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#f5f1e8;align-items:center;' +
    'justify-content:center;cursor:pointer;z-index:6;padding:0;' +
    'transition:transform .15s ease,border-color .15s ease;}' +
    '.sound-btn:hover{border-color:var(--vs-glow);transform:scale(1.06);}' +
    '.sound-btn:active{transform:scale(.96);}' +
    '.sound-btn svg{width:18px;height:18px;}' +
    ':host([sound-control]) .sound-btn{display:flex;}' +
    ':host([sound-position="left"]) .sound-btn{right:auto;left:12px;}' +
    ':host([sound-control]) .video{cursor:pointer;}' +
    '.confetti-btn{display:none;position:absolute;left:50%;bottom:14px;transform:translateX(-50%);' +
    'align-items:center;gap:6px;padding:10px 18px;border-radius:999px;' +
    'border:1px solid rgba(244,197,66,.55);background:rgba(244,197,66,.16);' +
    'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#F4C542;' +
    'font:600 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;' +
    'cursor:pointer;z-index:6;white-space:nowrap;' +
    'animation:vs-cta-pulse 2.6s ease-in-out infinite;' +
    'transition:transform .15s ease,background .15s ease,border-color .15s ease;}' +
    '.confetti-btn:hover{background:rgba(244,197,66,.28);transform:translateX(-50%) scale(1.05);}' +
    '.confetti-btn:active{transform:translateX(-50%) scale(.96);}' +
    ':host([confetti-button]) .confetti-btn{display:inline-flex;}' +
    '@keyframes vs-cta-pulse{0%,100%{box-shadow:0 0 0 0 rgba(244,197,66,.35);}' +
    '50%{box-shadow:0 0 0 8px rgba(244,197,66,0);}}' +
    '@media (prefers-reduced-motion:reduce){.frame-track{animation-duration:0s!important;}' +
    '.confetti-btn{animation:none!important;}}' +
    '</style>' +
    '<div class="showcase" part="root">' +
    '<div class="frame-border" part="frame" aria-hidden="true">' +
    '<div class="frame-strip frame-top"><div class="frame-track"></div></div>' +
    '<div class="frame-strip frame-right"><div class="frame-track"></div></div>' +
    '<div class="frame-strip frame-bottom"><div class="frame-track"></div></div>' +
    '<div class="frame-strip frame-left"><div class="frame-track"></div></div>' +
    '</div>' +
    '<div class="stage" part="stage">' +
    '<video class="video" part="video" muted autoplay loop playsinline></video>' +
    '<canvas class="fx-canvas" part="fx-canvas"></canvas>' +
    '<canvas class="confetti-canvas" part="confetti-canvas"></canvas>' +
    '<button class="sound-btn" part="sound-btn" type="button" aria-label="Activar sonido"></button>' +
    '<button class="confetti-btn" part="confetti-btn" type="button"></button>' +
    '<slot></slot>' +
    '</div>' +
    '</div>';

  /* =========================================================
     5. Custom Element principal: <video-showcase>
     ========================================================= */
  class VideoShowcase extends HTMLElement {
    static get observedAttributes() {
      return [
        'video', 'video-desktop', 'video-mobile',
        'frame-image', 'frame-speed', 'frame-size', 'frame-direction',
        'effect-image', 'effect-mode', 'effect-intensity',
        'confetti', 'confetti-config',
        'width', 'breakpoint', 'controls', 'confetti-button-label',
      ];
    }

    static registerEffect(name, EffectClass) {
      effectsRegistry.set(name, EffectClass);
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = TEMPLATE;

      this._els = {
        showcase: this.shadowRoot.querySelector('.showcase'),
        stage: this.shadowRoot.querySelector('.stage'),
        video: this.shadowRoot.querySelector('.video'),
        fxCanvas: this.shadowRoot.querySelector('.fx-canvas'),
        confettiCanvas: this.shadowRoot.querySelector('.confetti-canvas'),
        soundBtn: this.shadowRoot.querySelector('.sound-btn'),
        confettiBtn: this.shadowRoot.querySelector('.confetti-btn'),
      };

      this._marquee = new MarqueeFrame(this.shadowRoot, this);
      this._fx = new EffectsEngine(this._els.fxCanvas);
      this._confettiSys = new ConfettiSystem(this._els.confettiCanvas);
      this._confettiConfig = Object.assign({}, DEFAULTS.confettiConfig);

      this._isMobile = false;
      this._visible = true;
      this._connected = false;
      this._activeSrc = undefined;
      this._raf = null;
      this._lastT = 0;
      this._resizeScheduled = false;
      this._mq = null;
      this._soundMuted = true; // preferencia del usuario; persiste entre cambios de fuente

      this._boundLoop = this._loop.bind(this);
      this._onMqChange = () => this._updateVideoSource();
      this._onVideoMeta = () => this._applyAspectFromVideo();
      this._onVideoData = () => this._els.stage.removeAttribute('data-loading');
      this._onSoundBtnClick = () => this._toggleSound();
      this._onVideoTap = () => { if (this.soundControl) this._toggleSound(); };
      this._onConfettiBtnClick = () => this.fireConfetti();
      this._updateConfettiButtonLabel(); // fija el emoji por defecto o el label ya presente
    }

    connectedCallback() {
      if (this._connected) return;
      this._connected = true;

      this._mq = window.matchMedia('(max-width: ' + (this.breakpoint - 1) + 'px)');
      this._mq.addEventListener('change', this._onMqChange);

      this._ro = new ResizeObserver(() => this._scheduleResize());
      this._ro.observe(this._els.showcase);

      this._io = new IntersectionObserver(
        (entries) => {
          this._visible = entries[0] ? entries[0].isIntersecting : true;
          if (this._visible) {
            this._maybePlayVideo();
            this._syncLoop();
          } else {
            this._els.video.pause();
          }
        },
        { threshold: 0.15 }
      );
      this._io.observe(this);

      this._els.video.addEventListener('loadedmetadata', this._onVideoMeta);
      this._els.video.addEventListener('loadeddata', this._onVideoData);
      this._els.video.addEventListener('click', this._onVideoTap);
      this._els.soundBtn.addEventListener('click', this._onSoundBtnClick);
      this._els.confettiBtn.addEventListener('click', this._onConfettiBtnClick);
      this._updateSoundIcon();

      this._marquee.sync();
      this._updateVideoSource();
      this._doResize();
      this._syncLoop();
    }

    disconnectedCallback() {
      this._connected = false;
      if (this._mq) this._mq.removeEventListener('change', this._onMqChange);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;

      const v = this._els.video;
      v.removeEventListener('loadedmetadata', this._onVideoMeta);
      v.removeEventListener('loadeddata', this._onVideoData);
      v.removeEventListener('click', this._onVideoTap);
      this._els.soundBtn.removeEventListener('click', this._onSoundBtnClick);
      this._els.confettiBtn.removeEventListener('click', this._onConfettiBtnClick);
      v.pause();
      v.removeAttribute('src');
      v.load();

      this._fx.stop();
      this._confettiSys.stop();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      switch (name) {
        case 'video':
        case 'video-desktop':
        case 'video-mobile':
          this._updateVideoSource();
          break;
        case 'frame-image':
          this._marquee.setImage(newVal);
          break;
        case 'frame-speed':
          this._marquee.setSpeed(newVal);
          break;
        case 'frame-size':
          this._marquee.setSize(newVal);
          break;
        case 'frame-direction':
          this._marquee.setDirection(newVal);
          break;
        case 'effect-image':
          this._fx.setImage(newVal);
          break;
        case 'effect-mode':
          this._fx.setMode(newVal);
          this._syncLoop();
          break;
        case 'effect-intensity':
          this._fx.setIntensity(newVal);
          break;
        case 'confetti':
          if (newVal !== null && oldVal === null) this.fireConfetti();
          else if (newVal === null && oldVal !== null) this._confettiSys.stop();
          this._syncLoop();
          break;
        case 'confetti-config':
          try {
            Object.assign(this._confettiConfig, JSON.parse(newVal));
          } catch (err) {
            /* JSON inválido: se ignora y se conserva la config anterior */
          }
          break;
        case 'width':
          this.style.setProperty('--vs-width', newVal || DEFAULTS.width);
          break;
        case 'breakpoint':
          if (this._connected && this._mq) {
            this._mq.removeEventListener('change', this._onMqChange);
            this._mq = window.matchMedia('(max-width: ' + (this.breakpoint - 1) + 'px)');
            this._mq.addEventListener('change', this._onMqChange);
            this._updateVideoSource();
          }
          break;
        case 'controls':
          this._els.video.controls = newVal !== null;
          break;
        case 'confetti-button-label':
          this._updateConfettiButtonLabel();
          break;
      }
    }

    fireConfetti(overrides) {
      this._confettiSys.fire(Object.assign({}, this._confettiConfig, overrides || {}));
      this._syncLoop();
    }

    play() {
      return this._els.video.play();
    }
    pause() {
      this._els.video.pause();
    }

    _resolveSrc(isMobile) {
      const d = this.getAttribute('video-desktop');
      const m = this.getAttribute('video-mobile');
      const g = this.getAttribute('video');
      return isMobile ? m || d || g || null : d || m || g || null;
    }

    _updateVideoSource() {
      const isMobile = window.matchMedia('(max-width: ' + (this.breakpoint - 1) + 'px)').matches;
      this._isMobile = isMobile;
      const src = this._resolveSrc(isMobile);
      this._applyDefaultAspect();
      if (src === this._activeSrc) return;
      this._activeSrc = src;
      const v = this._els.video;
      if (!src) {
        v.removeAttribute('src');
        return;
      }
      this._els.stage.setAttribute('data-loading', '');
      v.src = src;
      v.muted = this._soundMuted; // load() puede resetear el estado; reaplicamos la preferencia
      v.load();
      this._maybePlayVideo();
    }

    _applyDefaultAspect() {
      this._els.showcase.style.aspectRatio = this._isMobile ? '9 / 16' : '16 / 9';
    }

    _applyAspectFromVideo() {
      const v = this._els.video;
      if (v.videoWidth && v.videoHeight) {
        this._els.showcase.style.aspectRatio = v.videoWidth + ' / ' + v.videoHeight;
      }
    }

    _maybePlayVideo() {
      const v = this._els.video;
      if (!this._visible || (!v.src && !v.currentSrc)) return;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // El navegador puede bloquear el autoplay con sonido tras un
          // cambio de fuente (breakpoint, nuevo src) si no hay un gesto
          // reciente del usuario. Para no cortar la reproducción, se
          // reintenta silenciado; el ícono reflejará el estado real.
          if (!v.muted) {
            v.muted = true;
            this._updateSoundIcon();
            v.play().catch(() => {});
          }
        });
      }
    }

    _toggleSound() {
      this._soundMuted = !this._soundMuted;
      this._els.video.muted = this._soundMuted;
      if (!this._soundMuted) this._maybePlayVideo(); // un gesto real: reintenta con sonido
      this._updateSoundIcon();
    }

    _updateSoundIcon() {
      const on = !this._els.video.muted;
      this._els.soundBtn.setAttribute('aria-label', on ? 'Silenciar video' : 'Activar sonido');
      this._els.soundBtn.innerHTML = on ? ICON_SOUND_ON : ICON_SOUND_OFF;
    }

    _updateConfettiButtonLabel() {
      const label = this.getAttribute('confetti-button-label');
      if (label) {
        this._els.confettiBtn.textContent = label;
        this._els.confettiBtn.removeAttribute('aria-label'); // el texto visible ya es accesible
      } else {
        this._els.confettiBtn.textContent = '🎉';
        this._els.confettiBtn.setAttribute('aria-label', 'Lanzar confetti');
      }
    }

    _scheduleResize() {
      if (this._resizeScheduled) return;
      this._resizeScheduled = true;
      requestAnimationFrame(() => {
        this._resizeScheduled = false;
        this._doResize();
      });
    }

    _doResize() {
      const rect = this._els.stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (rect.width > 0 && rect.height > 0) {
        this._fx.resize(rect.width, rect.height, dpr);
        this._confettiSys.resize(rect.width, rect.height, dpr);
      }
      this._marquee.sync();
      this._syncLoop();
    }

    _syncLoop() {
      const needed = this._visible && (this._fx.active || this._confettiSys.active);
      if (needed && !this._raf) {
        this._lastT = performance.now();
        this._raf = requestAnimationFrame(this._boundLoop);
      } else if (!needed && this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
    }

    _loop(t) {
      const dt = Math.min(0.05, (t - this._lastT) / 1000);
      this._lastT = t;
      this._fx.tick(dt);
      this._confettiSys.tick(dt);
      const stillNeeded = this._visible && (this._fx.active || this._confettiSys.active);
      this._raf = stillNeeded ? requestAnimationFrame(this._boundLoop) : null;
    }
  }

  /* ---- Propiedades JS reflejadas 1:1 con atributos (camelCase <-> kebab-case) ---- */
  const REFLECTED_ATTRS = {
    video: { attr: 'video', type: 'string' },
    videoDesktop: { attr: 'video-desktop', type: 'string' },
    videoMobile: { attr: 'video-mobile', type: 'string' },
    frameImage: { attr: 'frame-image', type: 'string' },
    frameSpeed: { attr: 'frame-speed', type: 'number', default: DEFAULTS.frameSpeed },
    frameSize: { attr: 'frame-size', type: 'number', default: DEFAULTS.frameSize },
    frameDirection: { attr: 'frame-direction', type: 'string', default: DEFAULTS.frameDirection },
    effectImage: { attr: 'effect-image', type: 'string' },
    effectMode: { attr: 'effect-mode', type: 'string', default: DEFAULTS.effectMode },
    effectIntensity: { attr: 'effect-intensity', type: 'number', default: DEFAULTS.effectIntensity },
    width: { attr: 'width', type: 'string', default: DEFAULTS.width },
    breakpoint: { attr: 'breakpoint', type: 'number', default: DEFAULTS.breakpoint },
    confettiButtonLabel: { attr: 'confetti-button-label', type: 'string' },
    soundPosition: { attr: 'sound-position', type: 'string', default: 'right' },
  };

  Object.keys(REFLECTED_ATTRS).forEach((prop) => {
    const cfg = REFLECTED_ATTRS[prop];
    Object.defineProperty(VideoShowcase.prototype, prop, {
      get() {
        const raw = this.getAttribute(cfg.attr);
        if (raw === null) return cfg.default !== undefined ? cfg.default : null;
        return cfg.type === 'number' ? Number(raw) || cfg.default : raw;
      },
      set(v) {
        if (v === null || v === undefined || v === '') this.removeAttribute(cfg.attr);
        else this.setAttribute(cfg.attr, String(v));
      },
      configurable: true,
    });
  });

  Object.defineProperty(VideoShowcase.prototype, 'confetti', {
    get() { return this.hasAttribute('confetti'); },
    set(v) { this.toggleAttribute('confetti', !!v); },
    configurable: true,
  });

  Object.defineProperty(VideoShowcase.prototype, 'confettiConfig', {
    get() { return Object.assign({}, this._confettiConfig); },
    set(v) { Object.assign(this._confettiConfig, v || {}); },
    configurable: true,
  });

  Object.defineProperty(VideoShowcase.prototype, 'isMobile', {
    get() { return this._isMobile; },
    configurable: true,
  });

  Object.defineProperty(VideoShowcase.prototype, 'soundControl', {
    get() { return this.hasAttribute('sound-control'); },
    set(v) { this.toggleAttribute('sound-control', !!v); },
    configurable: true,
  });

  Object.defineProperty(VideoShowcase.prototype, 'confettiButton', {
    get() { return this.hasAttribute('confetti-button'); },
    set(v) { this.toggleAttribute('confetti-button', !!v); },
    configurable: true,
  });

  if (!customElements.get('video-showcase')) {
    customElements.define('video-showcase', VideoShowcase);
  }
})();
