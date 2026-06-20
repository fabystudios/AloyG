/**
 * <preparativos-pena> — Web Component encapsulado (Shadow DOM)
 *
 * Card de doble video landscape (16:9) con marco glassmorfista, gran rutilancia
 * dorada, imagen de fondo y una capa de EFECTOS festivos por encima de todo.
 *
 * Pensada originalmente para la "Verbena / Peña Patronal", pero reutilizable
 * para cualquier ocasión litúrgica o festiva gracias a:
 *   · un sistema de TEMAS (paletas)  → atributo `theme`
 *   · un set de EFECTOS combinables   → atributo `effect`
 *
 * Layout:
 *   · Desktop : los dos videos van lado a lado y la card entra en el viewport
 *               sin necesidad de scrollear (aprovecha el ancho de pantalla).
 *   · Mobile  : la card ocupa 95vw y los videos se apilan.
 *
 * Audio:
 *   Los videos arrancan muteados (requisito de autoplay). Cada uno trae un
 *   botón de sonido; al activar uno se silencian los demás (no se pisan).
 *
 * ── Atributos (todos opcionales) ────────────────────────────────────────────
 *   video1 / video2     URLs de los videos.    def: ./video/prep1.mp4 / prep2.mp4
 *   poster1 / poster2   Posters de cada video.
 *   caption1 / caption2 Rótulo sobre cada video.
 *   bg                  Imagen de fondo (desktop).         def: ./img/magicsky.jpg
 *   bg-mobile           Imagen de fondo mobile (9:16).     def: usa `bg`
 *   eyebrow             Línea superior.                    def: "Preparativos"
 *   titulo              Título principal.                  def: "Peña Patronal"
 *   subtitulo           Bajada.
 *   theme               Paleta: patronal | navidad | pascua | mariano |
 *                       adviento | noche | show.           def: patronal
 *   effect              Lista separada por espacios:
 *                         fireworks · confetti · snow · petals · embers   (canvas)
 *                         sparkles · bokeh · hearts · spotlights · discoball (DOM)
 *                         o "none".                        def: "fireworks sparkles"
 *   intensity           low | medium | high.               def: medium
 */

const PP_THEMES = {
  patronal: { fire: ['#f0d79a','#ffd76b','#ffffff','#ff8a4d','#e8b34a','#ff5470'],
              confetti: ['#d9b25a','#f0d79a','#8a1a24','#f5ead0','#e8b34a','#c0392b','#2e8b57'],
              petal: ['#f3c6cf','#e89aa6','#f5ead0'] },
  navidad:  { fire: ['#ff5a5a','#3ddc84','#ffffff','#ffd76b','#e23b3b'],
              confetti: ['#e23b3b','#1f8a4c','#f0d79a','#ffffff','#c0392b','#2e8b57'],
              petal: ['#ffffff','#ffe9b0','#ff6b6b'] },
  pascua:   { fire: ['#ffffff','#ffd76b','#f0d79a','#a0e9ff','#ffd1ec'],
              confetti: ['#f0d79a','#ffffff','#cdb4ff','#ffd1ec','#a0e9ff'],
              petal: ['#ffffff','#fff6c2','#ffe9b0'] },
  mariano:  { fire: ['#ffffff','#a6c8ff','#ffd76b','#dfe9ff'],
              confetti: ['#3b6fe2','#ffffff','#f0d79a','#a0c4ff','#dfe9ff'],
              petal: ['#ffffff','#dfe9ff','#bcd3ff'] },
  adviento: { fire: ['#c9b9ff','#ffd76b','#ffffff','#d4a3ff'],
              confetti: ['#7b4ea8','#c9b9ff','#f0d79a','#ffffff'],
              petal: ['#d4a3ff','#ffffff','#e9d8ff'] },
  noche:    { fire: ['#f0d79a','#ffffff','#a6e3ff','#ff8a4d','#ff5470','#ffd76b'],
              confetti: ['#f0d79a','#ffffff','#a6e3ff','#ff8a4d','#ff5470'],
              petal: ['#ffffff','#a6e3ff','#f0d79a'] },
  show:     { fire: ['#ff3df0','#36e0ff','#ffd76b','#ffffff','#7b5cff','#ff5470'],
              confetti: ['#ff3df0','#36e0ff','#ffd76b','#ffffff','#7b5cff','#ff5470','#3ddc84'],
              petal: ['#ff9ae8','#9fe8ff','#ffe9b0'] },
};

class PreparativosPena extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._raf = 0;
    this._fx = null;          // estado del canvas
    this._io = null;          // IntersectionObserver (pausa fuera de pantalla)
    this._ro = null;          // ResizeObserver del canvas
    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
  }

  static get observedAttributes() {
    return ['video1', 'video2', 'poster1', 'poster2', 'bg', 'bg-mobile',
            'eyebrow', 'titulo', 'subtitulo', 'caption1', 'caption2',
            'theme', 'effect', 'intensity'];
  }

  connectedCallback() { this.render(); }
  disconnectedCallback() { this._stopFx(); }
  attributeChangedCallback() { if (this.shadowRoot.firstChild) this.render(); }

  get video1()    { return this.getAttribute('video1') || './video/prep1.mp4'; }
  get video2()    { return this.getAttribute('video2') || './video/prep2.mp4'; }
  get poster1()   { return this.getAttribute('poster1') || ''; }
  get poster2()   { return this.getAttribute('poster2') || ''; }
  get bg()        { return this.getAttribute('bg') || './img/magicsky.jpg'; }
  get bgMobile()  { return this.getAttribute('bg-mobile') || this.bg; }
  get eyebrow()   { return this.getAttribute('eyebrow') || 'Preparativos'; }
  get titulo()    { return this.getAttribute('titulo') || 'Peña Patronal'; }
  get subtitulo() { return this.getAttribute('subtitulo') || 'Festejo de Nuestro Patrono · San Luis Gonzaga'; }
  get caption1()  { return this.getAttribute('caption1') || ''; }
  get caption2()  { return this.getAttribute('caption2') || ''; }
  get theme()     { const t = (this.getAttribute('theme') || 'patronal').toLowerCase(); return PP_THEMES[t] ? t : 'patronal'; }
  get effects()   { return (this.getAttribute('effect') || 'fireworks sparkles').toLowerCase().split(/\s+/).filter(Boolean); }
  get intensity() { return this.getAttribute('intensity') || 'medium'; }
  get _mult()     { return { low: 0.55, medium: 1, high: 1.8 }[this.intensity] ?? 1; }

  render() {
    this._stopFx();
    const poster1 = this.poster1 ? ` poster="${this.poster1}"` : '';
    const poster2 = this.poster2 ? ` poster="${this.poster2}"` : '';
    const cap1 = this.caption1 ? `<figcaption class="pp-cap">${this.caption1}</figcaption>` : '';
    const cap2 = this.caption2 ? `<figcaption class="pp-cap">${this.caption2}</figcaption>` : '';

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>

      <article class="pp-card pp-theme-${this.theme}"
        style="--bg:url('${this.bg}'); --bg-mobile:url('${this.bgMobile}')"
        aria-label="${this.eyebrow} — ${this.titulo}">
        <div class="pp-bg" aria-hidden="true"></div>
        <div class="pp-vignette" aria-hidden="true"></div>
        <div class="pp-glow" aria-hidden="true"></div>
        <div class="pp-sheen" aria-hidden="true"></div>
        ${this.effects.includes('spotlights') ? this._spotlightsHtml() : ''}

        <div class="pp-lights" aria-hidden="true">${this._bulbs()}</div>
        ${this.effects.includes('discoball') ? this._discoballHtml() : ''}

        <div class="pp-stage">
          <header class="pp-head">
            <p class="pp-eyebrow">${this.eyebrow}</p>
            <h2 class="pp-title">${this.titulo}</h2>
            <p class="pp-sub">${this.subtitulo}</p>
            <span class="pp-rule" aria-hidden="true"></span>
          </header>

          <div class="pp-videos">
            <figure class="pp-vidwrap">
              <video class="pp-video" src="${this.video1}"${poster1}
                muted loop autoplay playsinline preload="metadata"></video>
              <span class="pp-frame" aria-hidden="true"></span>
              <button type="button" class="pp-sound" aria-label="Activar sonido">${this._soundIcon()}</button>
              ${cap1}
            </figure>
            <figure class="pp-vidwrap">
              <video class="pp-video" src="${this.video2}"${poster2}
                muted loop autoplay playsinline preload="metadata"></video>
              <span class="pp-frame" aria-hidden="true"></span>
              <button type="button" class="pp-sound" aria-label="Activar sonido">${this._soundIcon()}</button>
              ${cap2}
            </figure>
          </div>
        </div>

        <div class="pp-overlay" aria-hidden="true">${this._overlaySpans()}</div>
        <canvas class="pp-canvas" aria-hidden="true"></canvas>
      </article>
    `;

    // Autoplay en navegadores estrictos
    const videos = [...this.shadowRoot.querySelectorAll('video')];
    videos.forEach(v => {
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });

    // Botones de sonido: al activar uno, se silencian los demás
    this.shadowRoot.querySelectorAll('.pp-sound').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const turnOn = videos[i].muted;       // estado destino del clickeado
        videos.forEach((other, j) => {
          other.muted = !(turnOn && j === i);
          if (turnOn && j === i) { other.volume = 1; const pl = other.play(); if (pl && pl.catch) pl.catch(() => {}); }
        });
        this._syncSoundButtons(videos);
      });
    });

    this._startFx();
  }

  _syncSoundButtons(videos) {
    this.shadowRoot.querySelectorAll('.pp-sound').forEach((btn, i) => {
      const on = !videos[i].muted;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-label', on ? 'Silenciar' : 'Activar sonido');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.innerHTML = on ? this._soundOnIcon() : this._soundIcon();
    });
  }

  _soundIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9l4 6M20 9l-4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  _soundOnIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  _bulbs() {
    let html = '';
    for (let i = 0; i < 28; i++) html += `<span class="pp-bulb" style="--n:${i}"></span>`;
    return html;
  }

  /* ════════ EFECTOS DOM (sparkles / bokeh / hearts) ════════ */
  _overlaySpans() {
    const fx = this.effects;
    const mult = this._mult;
    const rnd = (a, b) => a + Math.random() * (b - a);
    let html = '';

    if (fx.includes('sparkles')) {
      const n = Math.round(34 * mult);
      for (let i = 0; i < n; i++) {
        html += `<span class="pp-spark" style="left:${rnd(0,100).toFixed(2)}%;top:${rnd(0,100).toFixed(2)}%;`
          + `font-size:${rnd(8,21).toFixed(1)}px;--dur:${rnd(3,8).toFixed(2)}s;--delay:${rnd(0,6).toFixed(2)}s">✦</span>`;
      }
    }
    if (fx.includes('bokeh')) {
      const n = Math.round(14 * mult);
      for (let i = 0; i < n; i++) {
        const s = rnd(10, 42).toFixed(1);
        html += `<span class="pp-bokeh" style="left:${rnd(0,100).toFixed(2)}%;top:${rnd(0,100).toFixed(2)}%;`
          + `width:${s}px;height:${s}px;--dur:${rnd(4,9).toFixed(2)}s;--delay:${rnd(0,7).toFixed(2)}s"></span>`;
      }
    }
    if (fx.includes('hearts')) {
      const n = Math.round(16 * mult);
      for (let i = 0; i < n; i++) {
        html += `<span class="pp-heart" style="left:${rnd(2,98).toFixed(2)}%;font-size:${rnd(12,26).toFixed(1)}px;`
          + `--dur:${rnd(5,10).toFixed(2)}s;--delay:${rnd(0,7).toFixed(2)}s;--drift:${rnd(-40,40).toFixed(0)}px">❤</span>`;
      }
    }
    return html;
  }

  /* ════════ SHOW: reflectores (spotlights) ════════ */
  _spotlightsHtml() {
    // Haces que barren cruzándose, anclados en la base de la card.
    const beams = [
      { pos: 14, dur: 5.6, del: 0,    bc: 'rgba(255,255,255,.32)' },
      { pos: 38, dur: 6.9, del: -1.6, bc: 'rgba(255,210,120,.30)' },
      { pos: 62, dur: 6.1, del: -0.8, bc: 'rgba(120,224,255,.30)' },
      { pos: 86, dur: 5.1, del: -2.3, bc: 'rgba(255,90,210,.30)'  },
    ];
    const spans = beams.map(b =>
      `<span class="pp-beam" style="left:${b.pos}%;--dur:${b.dur}s;--delay:${b.del}s;--bc:${b.bc}"></span>`
    ).join('');
    return `<div class="pp-spotlights" aria-hidden="true">${spans}</div>`;
  }

  /* ════════ SHOW: bola de espejos (discoball) ════════ */
  _discoballHtml() {
    const cols = ['rgba(255,255,255,.95)', 'rgba(255,215,140,.95)', 'rgba(120,224,255,.95)',
                  'rgba(255,90,210,.95)', 'rgba(160,140,255,.95)', 'rgba(61,220,132,.9)'];
    const n = Math.round(28 * this._mult);
    const rnd = (a, b) => a + Math.random() * (b - a);
    let spots = '';
    for (let i = 0; i < n; i++) {
      const s = rnd(3, 8).toFixed(1);
      spots += `<span class="pp-db-spot" style="left:${rnd(2,98).toFixed(2)}%;top:${rnd(2,96).toFixed(2)}%;`
        + `width:${s}px;height:${s}px;--sc:${cols[i % cols.length]};`
        + `--dur:${rnd(1.6,3.6).toFixed(2)}s;--delay:${rnd(0,3).toFixed(2)}s"></span>`;
    }
    return `<div class="pp-db-spots" aria-hidden="true">${spots}</div>
      <div class="pp-discoball" aria-hidden="true">
        <span class="pp-db-cord"></span>
        <span class="pp-db-ball"></span>
      </div>`;
  }

  /* ════════ EFECTOS CANVAS (fireworks / confetti / snow / petals / embers) ════════ */
  _startFx() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fx = this.effects;
    const en = {
      fireworks: fx.includes('fireworks'),
      confetti:  fx.includes('confetti'),
      snow:      fx.includes('snow'),
      petals:    fx.includes('petals'),
      embers:    fx.includes('embers'),
    };
    if (!Object.values(en).some(Boolean)) return;   // nada que dibujar en canvas

    const canvas = this.shadowRoot.querySelector('.pp-canvas');
    const card = this.shadowRoot.querySelector('.pp-card');
    if (!canvas || !card) return;

    const pal = PP_THEMES[this.theme];
    this._fx = {
      canvas, card, ctx: canvas.getContext('2d'),
      w: 0, h: 0, dpr: Math.min(window.devicePixelRatio || 1, 2),
      en, pal, mult: this._mult,
      rockets: [], bursts: [], fall: [], embers: [],
      seeded: false, lastSpawn: 0,
      spawnEvery: 820 / this._mult,
      running: true, visible: true, last: performance.now(),
    };

    this._resizeCanvas();
    this._ro = new ResizeObserver(this._onResize);
    this._ro.observe(card);
    window.addEventListener('resize', this._onResize);

    this._io = new IntersectionObserver((entries) => {
      if (!this._fx) return;
      this._fx.visible = entries[0].isIntersecting;
      if (this._fx.visible && this._fx.running) {
        this._fx.last = performance.now();
        if (!this._raf) this._raf = requestAnimationFrame(this._tick);
      }
    }, { threshold: 0.04 });
    this._io.observe(card);

    this._raf = requestAnimationFrame(this._tick);
  }

  _onResize() { if (this._fx) this._resizeCanvas(); }

  _resizeCanvas() {
    const s = this._fx; if (!s) return;
    const r = s.card.getBoundingClientRect();
    s.w = r.width; s.h = r.height;
    s.canvas.width = Math.round(r.width * s.dpr);
    s.canvas.height = Math.round(r.height * s.dpr);
    s.ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    if (!s.seeded) this._seedFall();
  }

  _seedFall() {
    const s = this._fx; if (!s || !s.w) return;
    s.seeded = true;
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(n)));
    if (s.en.snow)     for (let i = 0, n = clamp(s.w / 16 * s.mult, 8, 90);  i < n; i++) s.fall.push(this._mkFall('snow', true));
    if (s.en.confetti) for (let i = 0, n = clamp(s.w / 26 * s.mult, 6, 70);  i < n; i++) s.fall.push(this._mkFall('confetti', true));
    if (s.en.petals)   for (let i = 0, n = clamp(s.w / 30 * s.mult, 5, 55);  i < n; i++) s.fall.push(this._mkFall('petal', true));
  }

  _mkFall(type, anywhere) {
    const s = this._fx;
    const x = Math.random() * s.w;
    const y = anywhere ? Math.random() * s.h : -20 - Math.random() * 40;
    if (type === 'snow') {
      return { type, x, y, r: 1 + Math.random() * 2.6, vy: 0.4 + Math.random() * 1, vx: (Math.random() - 0.5) * 0.4,
               phase: Math.random() * 6.28, alpha: 0.5 + Math.random() * 0.5 };
    }
    if (type === 'confetti') {
      return { type, x, y, w: 5 + Math.random() * 6, h: 8 + Math.random() * 7,
               vy: 1.4 + Math.random() * 2, vx: (Math.random() - 0.5) * 1.1,
               rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.22, phase: Math.random() * 6.28,
               color: s.pal.confetti[(Math.random() * s.pal.confetti.length) | 0] };
    }
    // petal
    return { type, x, y, size: 5 + Math.random() * 6, vy: 0.8 + Math.random() * 1.4, sway: 0.5 + Math.random() * 1.1,
             rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.05, phase: Math.random() * 6.28,
             color: s.pal.petal[(Math.random() * s.pal.petal.length) | 0] };
  }

  _spawnRocket() {
    const s = this._fx;
    s.rockets.push({
      x: s.w * (0.12 + Math.random() * 0.76), y: s.h + 6,
      vx: (Math.random() - 0.5) * 0.4, vy: -(7.4 + Math.random() * 2.6),
      targetY: s.h * (0.12 + Math.random() * 0.32),
      color: s.pal.fire[(Math.random() * s.pal.fire.length) | 0],
    });
  }

  _explode(x, y, color) {
    const s = this._fx;
    const n = 46 + ((Math.random() * 26) | 0);
    const power = 2.4 + Math.random() * 2.0;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.12;
      const sp = power * (0.45 + Math.random() * 0.85);
      s.bursts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: 0.012 + Math.random() * 0.014,
        color: Math.random() < 0.25 ? '#ffffff' : color, size: 1.4 + Math.random() * 1.6 });
    }
  }

  _spawnEmber() {
    const s = this._fx;
    s.embers.push({ x: Math.random() * s.w, y: s.h + 6,
      vx: (Math.random() - 0.5) * 0.5, vy: -(0.5 + Math.random() * 1.1),
      size: 1 + Math.random() * 1.8, life: 1, decay: 0.004 + Math.random() * 0.006,
      color: ['#ffb86b', '#ff9a4d', '#ffd76b'][(Math.random() * 3) | 0] });
  }

  _tick(now) {
    const s = this._fx;
    if (!s || !s.running || !s.visible) { this._raf = 0; return; }

    const dt = Math.min(2.4, (now - s.last) / 16.67);
    s.last = now;
    const ctx = s.ctx;
    ctx.clearRect(0, 0, s.w, s.h);

    /* ── Caída: confetti / snow / petals (alpha normal) ── */
    if (s.fall.length) {
      ctx.globalCompositeOperation = 'source-over';
      for (const p of s.fall) {
        if (p.type === 'snow') {
          p.phase += 0.02 * dt; p.x += (p.vx + Math.sin(p.phase) * 0.3) * dt; p.y += p.vy * dt;
          if (p.y > s.h + 6) { p.y = -6; p.x = Math.random() * s.w; }
          ctx.globalAlpha = p.alpha; ctx.beginPath(); ctx.fillStyle = '#ffffff';
          ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        } else if (p.type === 'confetti') {
          p.phase += 0.05 * dt; p.x += (p.vx + Math.sin(p.phase) * 0.6) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
          if (p.y > s.h + 14) { p.y = -14; p.x = Math.random() * s.w; }
          ctx.globalAlpha = 1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
        } else { // petal
          p.phase += 0.03 * dt; p.x += Math.sin(p.phase) * p.sway * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
          if (p.y > s.h + 14) { p.y = -14; p.x = Math.random() * s.w; }
          ctx.globalAlpha = 1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, 6.283);
          ctx.fill(); ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    }

    /* ── Brasas (aditivo, suben) ── */
    if (s.en.embers) {
      ctx.globalCompositeOperation = 'lighter';
      const max = Math.max(8, Math.round(s.w / 40 * s.mult));
      if (s.embers.length < max && Math.random() < 0.4) this._spawnEmber();
      for (let i = s.embers.length - 1; i >= 0; i--) {
        const e = s.embers[i];
        e.x += e.vx * dt; e.y += e.vy * dt; e.vy *= 0.995; e.life -= e.decay * dt;
        if (e.life <= 0 || e.y < -10) { s.embers.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, e.life); ctx.beginPath();
        ctx.fillStyle = e.color; ctx.shadowBlur = 9; ctx.shadowColor = e.color;
        ctx.arc(e.x, e.y, e.size, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    /* ── Fuegos artificiales (aditivo) ── */
    if (s.en.fireworks) {
      ctx.globalCompositeOperation = 'lighter';
      if (now - s.lastSpawn > s.spawnEvery) {
        s.lastSpawn = now; this._spawnRocket();
        if (Math.random() < 0.35) this._spawnRocket();
      }
      for (let i = s.rockets.length - 1; i >= 0; i--) {
        const r = s.rockets[i];
        r.x += r.vx * dt; r.y += r.vy * dt; r.vy += 0.12 * dt;
        ctx.beginPath(); ctx.fillStyle = r.color; ctx.shadowBlur = 8; ctx.shadowColor = r.color;
        ctx.arc(r.x, r.y, 2.1, 0, 6.283); ctx.fill();
        if (r.vy >= -0.6 || r.y <= r.targetY) { this._explode(r.x, r.y, r.color); s.rockets.splice(i, 1); }
      }
      for (let i = s.bursts.length - 1; i >= 0; i--) {
        const p = s.bursts[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.045 * dt; p.vx *= 0.985; p.vy *= 0.985;
        p.life -= p.decay * dt;
        if (p.life <= 0) { s.bursts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life); ctx.beginPath();
        ctx.fillStyle = p.color; ctx.shadowBlur = 9; ctx.shadowColor = p.color;
        ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    this._raf = requestAnimationFrame(this._tick);
  }

  _stopFx() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._io) { this._io.disconnect(); this._io = null; }
    window.removeEventListener('resize', this._onResize);
    if (this._fx) { this._fx.running = false; this._fx = null; }
  }

  _styles() {
    return `
      :host {
        --c1: #6e1620;            /* base profunda (degradé) */
        --c2: #4a0e15;
        --oro: #d9b25a;           /* metálico (rutilancia, común a todos los temas) */
        --oro-claro: #f0d79a;
        --crema: #f5ead0;
        --halo: 240,215,154;      /* rgb del halo dorado */
        display: block;
        width: 100%;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── TEMAS: solo cambian la base profunda; el oro queda como rutilancia común ── */
      .pp-theme-navidad  { --c1:#0f5132; --c2:#07351f; }
      .pp-theme-pascua   { --c1:#7a5a2a; --c2:#4a3415; }
      .pp-theme-mariano  { --c1:#14346e; --c2:#0a1c45; }
      .pp-theme-adviento { --c1:#4a2a6e; --c2:#2a1545; }
      .pp-theme-noche    { --c1:#141a2e; --c2:#07091a; }
      .pp-theme-show     { --c1:#241b3a; --c2:#0b0718; }

      .pp-card {
        position: relative;
        width: min(1720px, 96vw);     /* desktop: aprovecha el ancho */
        margin: 1.4rem auto;
        padding: clamp(1rem, 2.2vw, 2rem);
        border-radius: 28px;
        overflow: hidden;
        isolation: isolate;
        border: 1px solid rgba(var(--halo),0.30);
        box-shadow: 0 28px 70px rgba(0,0,0,0.5), 0 8px 22px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.10);
        background: linear-gradient(160deg, var(--c1) 0%, var(--c2) 100%);
      }

      .pp-bg {
        position: absolute; inset: 0; z-index: 0;
        background-image: var(--bg); background-size: cover; background-position: center;
        opacity: 0.55; transform: scale(1.04); filter: saturate(1.05);
      }
      .pp-vignette {
        position: absolute; inset: 0; z-index: 1; pointer-events: none;
        background:
          radial-gradient(120% 90% at 50% 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%),
          linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.46));
      }
      .pp-glow {
        position: absolute; inset: -25%; z-index: 1; pointer-events: none;
        background: radial-gradient(circle at 50% 22%, rgba(var(--halo),0.22), transparent 58%);
        animation: pp-breathe 7s ease-in-out infinite;
      }
      @keyframes pp-breathe { 0%,100%{opacity:.55;transform:scale(1);} 50%{opacity:1;transform:scale(1.07);} }

      .pp-sheen {
        position: absolute; inset: 0; z-index: 2; pointer-events: none; mix-blend-mode: screen;
        background: linear-gradient(115deg, transparent 38%, rgba(255,245,210,0.16) 48%, rgba(255,255,255,0.30) 50%, rgba(255,245,210,0.16) 52%, transparent 62%);
        background-size: 280% 100%;
        animation: pp-sheen 6.5s ease-in-out infinite;
      }
      @keyframes pp-sheen {
        0%{background-position:160% 0;opacity:0;} 18%{opacity:1;}
        55%{background-position:-60% 0;opacity:1;} 70%,100%{background-position:-60% 0;opacity:0;}
      }

      .pp-lights {
        position: absolute; top: 9px; left: -1%; width: 102%; height: 12px; z-index: 6; pointer-events: none;
        display: flex; justify-content: space-between; padding: 0 14px;
      }
      .pp-lights::before {
        content: ''; position: absolute; top: 4px; left: 0; width: 100%; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(var(--halo),0.5) 5%, rgba(var(--halo),0.5) 95%, transparent);
      }
      .pp-bulb {
        width: 8px; height: 8px; border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #fff8e0, #ffcf6b 60%, #e89a2a);
        animation: pp-bulb 1.9s ease-in-out infinite; animation-delay: calc(var(--n) * -0.12s);
      }
      @keyframes pp-bulb {
        0%,100%{opacity:.4;box-shadow:0 0 4px 1px rgba(255,190,90,.5);}
        50%{opacity:1;box-shadow:0 0 11px 3px rgba(255,200,100,.95);}
      }

      /* ── SHOW: reflectores que barren ── */
      .pp-spotlights {
        position: absolute; inset: 0; z-index: 2; pointer-events: none;
        overflow: hidden; mix-blend-mode: screen;
      }
      .pp-beam {
        position: absolute; bottom: -10%;
        width: clamp(70px, 11vw, 150px); height: 155%;
        transform-origin: 50% 100%;
        background: linear-gradient(to top, transparent 0%, var(--bc) 12%, transparent 78%);
        clip-path: polygon(48% 100%, 52% 100%, 100% 0, 0% 0);
        filter: blur(7px); opacity: .9; will-change: transform;
        animation: pp-beam var(--dur) ease-in-out var(--delay) infinite alternate;
      }
      .pp-beam::after {           /* foco/reflector en la base */
        content: ''; position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%);
        width: 14px; height: 14px; border-radius: 50%;
        background: radial-gradient(circle, #fff, var(--bc) 70%, transparent);
        box-shadow: 0 0 14px 4px var(--bc);
      }
      @keyframes pp-beam {
        0%   { transform: translateX(-50%) rotate(-30deg); }
        100% { transform: translateX(-50%) rotate(30deg); }
      }

      /* ── SHOW: bola de espejos giratoria + destellos reflejados ── */
      .pp-db-spots {
        position: absolute; inset: 0; z-index: 5; pointer-events: none;
        overflow: hidden; mix-blend-mode: screen;
        animation: pp-db-orbit 24s linear infinite;
      }
      @keyframes pp-db-orbit { to { transform: rotate(360deg); } }
      .pp-db-spot {
        position: absolute; border-radius: 2px; background: var(--sc);
        box-shadow: 0 0 7px var(--sc); opacity: 0; will-change: opacity, transform;
        animation: pp-db-twinkle var(--dur) var(--delay) ease-in-out infinite;
      }
      @keyframes pp-db-twinkle {
        0%,100% { opacity: 0; transform: scale(.5); }
        45%,55% { opacity: .9; transform: scale(1); }
      }
      .pp-discoball {
        position: absolute; top: 0; left: 50%; transform: translateX(-50%);
        z-index: 6; pointer-events: none; display: flex; flex-direction: column; align-items: center;
      }
      .pp-db-cord { width: 2px; height: 22px; background: linear-gradient(#cbd3e6, #6b7388); opacity: .7; }
      .pp-db-ball {
        width: clamp(46px, 7vw, 70px); aspect-ratio: 1; border-radius: 50%;
        background-image:
          repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 7px, transparent 7px 14px),
          repeating-linear-gradient(90deg, rgba(0,0,0,.26) 0 7px, transparent 7px 14px),
          radial-gradient(circle at 34% 28%, #ffffff 0%, #cfe0ff 28%, #8fa3cf 58%, #475679 84%, #2a3550 100%);
        background-size: 14px 14px, 14px 14px, 100% 100%;
        box-shadow: 0 0 26px rgba(170,200,255,.65), inset -6px -8px 16px rgba(0,0,0,.55), inset 6px 6px 12px rgba(255,255,255,.25);
        animation: pp-db-spin 4.5s linear infinite;
      }
      @keyframes pp-db-spin { to { background-position: 14px 0, 0 0, 0 0; } }

      .pp-stage { position: relative; z-index: 4; }
      .pp-head { text-align: center; margin: 0.4rem auto 1.1rem; max-width: 60ch; }
      .pp-eyebrow {
        font-family: Georgia, "Times New Roman", serif; font-style: italic; color: var(--oro-claro);
        font-size: clamp(1rem, 2.4vw, 1.5rem); line-height: 1; letter-spacing: .02em;
        text-shadow: 0 2px 10px rgba(0,0,0,.5);
      }
      .pp-title {
        font-weight: 900; letter-spacing: .02em; line-height: .98;
        font-size: clamp(1.9rem, 5.2vw, 3.4rem); margin: .15em 0 .12em;
        background: linear-gradient(180deg, #fff7e3, var(--oro-claro) 45%, var(--oro));
        -webkit-background-clip: text; background-clip: text; color: transparent;
        filter: drop-shadow(0 3px 8px rgba(0,0,0,.55));
      }
      .pp-sub {
        color: var(--crema); opacity: .94; font-weight: 600;
        font-size: clamp(.9rem, 2.2vw, 1.18rem); text-shadow: 0 2px 8px rgba(0,0,0,.5);
      }
      .pp-rule {
        display: block; width: clamp(120px, 22%, 280px); height: 2px; margin: .9rem auto 0;
        background: linear-gradient(90deg, transparent, var(--oro) 30%, var(--oro-claro) 50%, var(--oro) 70%, transparent);
        box-shadow: 0 0 12px rgba(var(--halo),.6);
      }

      .pp-videos { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(.8rem, 1.8vw, 1.6rem); align-items: start; }
      .pp-vidwrap {
        position: relative; border-radius: 18px; overflow: hidden;
        background: rgba(245,234,208,0.06);
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        box-shadow: 0 14px 38px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.12);
        transition: transform .35s ease, box-shadow .35s ease;
      }
      .pp-vidwrap:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 30px rgba(var(--halo),.25), 0 20px 50px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.18);
      }
      .pp-video {
        display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: #0d0710;
        max-height: 62vh;   /* en desktop evita tener que scrollear */
      }
      .pp-frame {
        position: absolute; inset: 0; border-radius: 18px; pointer-events: none;
        border: 1.5px solid rgba(var(--halo),.55);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.10), inset 0 0 26px rgba(var(--halo),.18);
      }

      .pp-sound {
        position: absolute; top: 10px; right: 10px; z-index: 3;
        width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
        color: #1f0608; background: linear-gradient(145deg, var(--oro-claro), var(--oro));
        border: 1.5px solid rgba(255,255,255,.55);
        box-shadow: 0 6px 16px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.6);
        transition: transform .2s ease, box-shadow .25s ease, background .25s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .pp-sound svg { width: 22px; height: 22px; display: block; }
      .pp-sound:hover { transform: scale(1.08); }
      .pp-sound:active { transform: scale(.94); }
      .pp-sound.is-on {
        color: #fff; background: linear-gradient(145deg, var(--c1), var(--c2)); border-color: rgba(var(--halo),.7);
        box-shadow: 0 0 16px rgba(var(--halo),.5), 0 6px 16px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2);
      }
      .pp-sound:focus-visible { outline: 2px solid var(--oro-claro); outline-offset: 2px; }

      .pp-cap {
        position: absolute; left: 0; right: 0; bottom: 0; padding: .85rem .9rem .5rem;
        font-size: clamp(.82rem, 1.8vw, 1rem); font-weight: 700; color: #fff; text-align: left;
        text-shadow: 0 2px 6px rgba(0,0,0,.7); background: linear-gradient(180deg, transparent, rgba(0,0,0,.78));
      }

      /* ── Capa de efectos DOM ── */
      .pp-overlay { position: absolute; inset: 0; z-index: 7; pointer-events: none; overflow: hidden; }
      .pp-spark {
        position: absolute; color: var(--oro-claro); text-shadow: 0 0 6px rgba(var(--halo),.95);
        opacity: 0; will-change: transform, opacity; animation: pp-twinkle var(--dur) var(--delay) ease-in-out infinite;
      }
      @keyframes pp-twinkle { 0%,100%{opacity:0;transform:scale(.3);} 45%,60%{opacity:1;transform:scale(1);} }
      .pp-bokeh {
        position: absolute; border-radius: 50%; opacity: 0; filter: blur(1px); will-change: transform, opacity;
        background: radial-gradient(circle at 35% 35%, rgba(var(--halo),.95), rgba(var(--halo),.15) 60%, transparent 72%);
        animation: pp-bokeh var(--dur) var(--delay) ease-in-out infinite;
      }
      @keyframes pp-bokeh { 0%,100%{opacity:0;transform:translateY(12px) scale(.7);} 50%{opacity:.6;transform:translateY(-16px) scale(1);} }
      .pp-heart {
        position: absolute; bottom: -22px; color: #ff5470; opacity: 0;
        text-shadow: 0 0 8px rgba(255,84,112,.6); will-change: transform, opacity;
        animation: pp-floatup var(--dur) var(--delay) linear infinite;
      }
      @keyframes pp-floatup {
        0%{opacity:0;transform:translateY(0) scale(.6);} 12%{opacity:1;}
        100%{opacity:0;transform:translateY(calc(-1 * (var(--rise, 320px)))) translateX(var(--drift)) scale(1);}
      }

      /* ── Canvas (fireworks/confetti/snow/petals/embers) por encima de todo ── */
      .pp-canvas { position: absolute; inset: 0; z-index: 8; pointer-events: none; width: 100%; height: 100%; }

      /* ════════ MOBILE ════════ */
      @media (max-width: 760px) {
        .pp-card { width: 95vw; border-radius: 22px; margin: 1.6rem auto; padding: 1.1rem .9rem 1.2rem; }
        .pp-bg { background-image: var(--bg-mobile); opacity: .6; }   /* fondo 9:16 */
        .pp-videos { grid-template-columns: 1fr; gap: 1rem; }
        .pp-video { max-height: none; }
        .pp-head { margin-bottom: .9rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .pp-glow, .pp-sheen, .pp-bulb, .pp-spark, .pp-bokeh, .pp-heart,
        .pp-beam, .pp-db-spots, .pp-db-spot, .pp-db-ball { animation: none !important; }
        .pp-canvas { display: none; }
      }
    `;
  }
}

customElements.define('preparativos-pena', PreparativosPena);
