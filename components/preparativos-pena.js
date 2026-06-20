/**
 * <preparativos-pena> — Web Component encapsulado (Shadow DOM)
 *
 * Card de "Preparativos" para la Peña / Festejo de Nuestro Patrono.
 * Presenta DOS videos landscape (16:9) dentro de un marco glassmorfista con
 * gran rutilancia dorada, sobre una imagen de fondo, y una capa de FUEGOS
 * ARTIFICIALES (canvas) por encima de todo.
 *
 *  · Desktop : aprovecha el ancho de la pantalla, los dos videos van lado a
 *              lado y la card entra en el viewport sin necesidad de scrollear.
 *  · Mobile  : la card ocupa como máximo 95vw y los videos se apilan.
 *
 * Comparte la paleta (bordo / oro / crema) con <fiesta-patronal>, que es la
 * card que da las precisiones del evento (Peña Patronal · Sáb 20/JUN · 19:30).
 *
 * Atributos (todos opcionales):
 *   video1 / video2   URLs de los videos.   def: ./video/prep1.mp4 / prep2.mp4
 *   poster1 / poster2 Posters opcionales de cada video.
 *   bg                Imagen de fondo (desktop).         def: ./img/magicsky.jpg
 *   bg-mobile         Imagen de fondo para mobile (9:16). def: usa "bg" si no se indica
 *   eyebrow           Línea superior.    def: "Preparativos"
 *   titulo            Título principal.  def: "Peña Patronal"
 *   subtitulo         Bajada.            def: "Festejo de Nuestro Patrono · San Luis Gonzaga"
 *   caption1 / caption2  Rótulo bajo cada video (opcional).
 *   effect            "fireworks sparkles" | "none".     def: "fireworks sparkles"
 *   intensity         "low" | "medium" | "high".         def: medium
 */
class PreparativosPena extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._raf = 0;
    this._fw = null;          // estado de los fuegos artificiales
    this._io = null;          // IntersectionObserver (pausa fuera de pantalla)
    this._ro = null;          // ResizeObserver del canvas
    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
  }

  static get observedAttributes() {
    return ['video1', 'video2', 'poster1', 'poster2', 'bg', 'bg-mobile',
            'eyebrow', 'titulo', 'subtitulo', 'caption1', 'caption2',
            'effect', 'intensity'];
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
  get effects()   { return (this.getAttribute('effect') || 'fireworks sparkles').toLowerCase().split(/\s+/).filter(Boolean); }
  get intensity() { return this.getAttribute('intensity') || 'medium'; }

  render() {
    this._stopFx();
    const poster1 = this.poster1 ? ` poster="${this.poster1}"` : '';
    const poster2 = this.poster2 ? ` poster="${this.poster2}"` : '';
    const cap1 = this.caption1 ? `<figcaption class="pp-cap">${this.caption1}</figcaption>` : '';
    const cap2 = this.caption2 ? `<figcaption class="pp-cap">${this.caption2}</figcaption>` : '';

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>

      <article class="pp-card" style="--bg:url('${this.bg}'); --bg-mobile:url('${this.bgMobile}')" aria-label="Preparativos para la Peña Patronal">
        <div class="pp-bg" aria-hidden="true"></div>
        <div class="pp-vignette" aria-hidden="true"></div>
        <div class="pp-glow" aria-hidden="true"></div>
        <div class="pp-sheen" aria-hidden="true"></div>

        <div class="pp-lights" aria-hidden="true">${this._bulbs()}</div>

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
              ${cap1}
            </figure>
            <figure class="pp-vidwrap">
              <video class="pp-video" src="${this.video2}"${poster2}
                muted loop autoplay playsinline preload="metadata"></video>
              <span class="pp-frame" aria-hidden="true"></span>
              ${cap2}
            </figure>
          </div>
        </div>

        <div class="pp-sparkles" aria-hidden="true">${this._sparkSpans()}</div>
        <canvas class="pp-fireworks" aria-hidden="true"></canvas>
      </article>
    `;

    // Garantiza autoplay en navegadores estrictos
    this.shadowRoot.querySelectorAll('video').forEach(v => {
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });

    this._startFx();
  }

  _bulbs() {
    let html = '';
    for (let i = 0; i < 28; i++) html += `<span class="pp-bulb" style="--n:${i}"></span>`;
    return html;
  }

  _sparkSpans() {
    if (!this.effects.includes('sparkles')) return '';
    const mult = { low: 0.5, medium: 1, high: 1.8 }[this.intensity] ?? 1;
    const count = Math.round(34 * mult);
    let html = '';
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 100).toFixed(2);
      const y = (Math.random() * 100).toFixed(2);
      const s = (8 + Math.random() * 13).toFixed(1);
      const dur = (3 + Math.random() * 5).toFixed(2);
      const del = (Math.random() * 6).toFixed(2);
      html += `<span class="pp-spark" style="left:${x}%;top:${y}%;font-size:${s}px;--dur:${dur}s;--delay:${del}s">✦</span>`;
    }
    return html;
  }

  /* ════════ FUEGOS ARTIFICIALES (canvas) ════════ */
  _startFx() {
    if (!this.effects.includes('fireworks')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = this.shadowRoot.querySelector('.pp-fireworks');
    const card = this.shadowRoot.querySelector('.pp-card');
    if (!canvas || !card) return;
    const ctx = canvas.getContext('2d');

    const mult = { low: 0.55, medium: 1, high: 1.7 }[this.intensity] ?? 1;
    this._fw = {
      canvas, card, ctx,
      w: 0, h: 0, dpr: Math.min(window.devicePixelRatio || 1, 2),
      particles: [], rockets: [],
      lastSpawn: 0,
      spawnEvery: 820 / mult,   // ms entre lanzamientos
      colors: ['#f0d79a', '#ffd76b', '#ffffff', '#ff8a4d', '#e8b34a', '#ff5470', '#a6e3ff'],
      running: true,
      last: performance.now(),
      visible: true,
    };

    this._resizeCanvas();
    this._ro = new ResizeObserver(this._onResize);
    this._ro.observe(card);
    window.addEventListener('resize', this._onResize);

    // Pausa la animación cuando la card no está en pantalla
    this._io = new IntersectionObserver((entries) => {
      if (!this._fw) return;
      this._fw.visible = entries[0].isIntersecting;
      if (this._fw.visible && this._fw.running) {
        this._fw.last = performance.now();
        if (!this._raf) this._raf = requestAnimationFrame(this._tick);
      }
    }, { threshold: 0.05 });
    this._io.observe(card);

    this._raf = requestAnimationFrame(this._tick);
  }

  _onResize() { if (this._fw) this._resizeCanvas(); }

  _resizeCanvas() {
    const fw = this._fw; if (!fw) return;
    const r = fw.card.getBoundingClientRect();
    fw.w = r.width; fw.h = r.height;
    fw.canvas.width = Math.round(r.width * fw.dpr);
    fw.canvas.height = Math.round(r.height * fw.dpr);
    fw.ctx.setTransform(fw.dpr, 0, 0, fw.dpr, 0, 0);
  }

  _spawnRocket() {
    const fw = this._fw;
    const x = fw.w * (0.12 + Math.random() * 0.76);
    const targetY = fw.h * (0.12 + Math.random() * 0.32);
    fw.rockets.push({
      x, y: fw.h + 6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(7.4 + Math.random() * 2.6),
      targetY,
      color: fw.colors[(Math.random() * fw.colors.length) | 0],
    });
  }

  _explode(x, y, color) {
    const fw = this._fw;
    const n = 46 + ((Math.random() * 26) | 0);
    const power = 2.4 + Math.random() * 2.0;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.12;
      const sp = power * (0.45 + Math.random() * 0.85);
      fw.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1, decay: 0.012 + Math.random() * 0.014,
        color: Math.random() < 0.25 ? '#ffffff' : color,
        size: 1.4 + Math.random() * 1.6,
      });
    }
  }

  _tick(now) {
    const fw = this._fw;
    if (!fw || !fw.running) { this._raf = 0; return; }
    if (!fw.visible) { this._raf = 0; return; }   // se reanuda desde el IO

    const dt = Math.min(2.4, (now - fw.last) / 16.67);
    fw.last = now;
    const ctx = fw.ctx;

    // Estela: limpiamos con un velo translúcido para dejar rastro
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, fw.w, fw.h);

    // Lanzamientos
    if (now - fw.lastSpawn > fw.spawnEvery) {
      fw.lastSpawn = now;
      this._spawnRocket();
      if (Math.random() < 0.35) this._spawnRocket();
    }

    ctx.globalCompositeOperation = 'lighter';

    // Cohetes
    for (let i = fw.rockets.length - 1; i >= 0; i--) {
      const r = fw.rockets[i];
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.vy += 0.12 * dt;   // gravedad

      ctx.beginPath();
      ctx.fillStyle = r.color;
      ctx.shadowBlur = 8; ctx.shadowColor = r.color;
      ctx.arc(r.x, r.y, 2.1, 0, Math.PI * 2);
      ctx.fill();

      if (r.vy >= -0.6 || r.y <= r.targetY) {
        this._explode(r.x, r.y, r.color);
        fw.rockets.splice(i, 1);
      }
    }

    // Partículas de explosión
    for (let i = fw.particles.length - 1; i >= 0; i--) {
      const p = fw.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.045 * dt;   // gravedad
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.life -= p.decay * dt;
      if (p.life <= 0) { fw.particles.splice(i, 1); continue; }

      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 9; ctx.shadowColor = p.color;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    this._raf = requestAnimationFrame(this._tick);
  }

  _stopFx() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._io) { this._io.disconnect(); this._io = null; }
    window.removeEventListener('resize', this._onResize);
    if (this._fw) { this._fw.running = false; this._fw = null; }
  }

  _styles() {
    return `
      :host {
        --bordo: #6e1620;
        --bordo-2: #4a0e15;
        --oro: #d9b25a;
        --oro-claro: #f0d79a;
        --crema: #f5ead0;
        display: block;
        width: 100%;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .pp-card {
        position: relative;
        /* Desktop: aprovecha el ancho de pantalla */
        width: min(1720px, 96vw);
        margin: 1.4rem auto;
        padding: clamp(1rem, 2.2vw, 2rem);
        border-radius: 28px;
        overflow: hidden;
        isolation: isolate;
        border: 1px solid rgba(240,215,154,0.30);
        box-shadow:
          0 28px 70px rgba(0,0,0,0.5),
          0 8px 22px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.10);
        background: linear-gradient(160deg, var(--bordo) 0%, var(--bordo-2) 100%);
      }

      /* Imagen de fondo */
      .pp-bg {
        position: absolute; inset: 0; z-index: 0;
        background-image: var(--bg);
        background-size: cover;
        background-position: center;
        opacity: 0.55;
        transform: scale(1.04);
        filter: saturate(1.05);
      }
      .pp-vignette {
        position: absolute; inset: 0; z-index: 1; pointer-events: none;
        background:
          radial-gradient(120% 90% at 50% 0%, rgba(0,0,0,0) 40%, rgba(20,4,8,0.55) 100%),
          linear-gradient(180deg, rgba(74,14,21,0.35), rgba(31,6,10,0.62));
      }
      /* Resplandor dorado respirando */
      .pp-glow {
        position: absolute; inset: -25%; z-index: 1; pointer-events: none;
        background: radial-gradient(circle at 50% 22%, rgba(240,215,154,0.22), transparent 58%);
        animation: pp-breathe 7s ease-in-out infinite;
      }
      @keyframes pp-breathe {
        0%,100% { opacity: .55; transform: scale(1); }
        50%     { opacity: 1;  transform: scale(1.07); }
      }
      /* Barrido de rutilancia (brillo que cruza la card) */
      .pp-sheen {
        position: absolute; inset: 0; z-index: 2; pointer-events: none;
        background: linear-gradient(115deg, transparent 38%, rgba(255,245,210,0.16) 48%, rgba(255,255,255,0.30) 50%, rgba(255,245,210,0.16) 52%, transparent 62%);
        background-size: 280% 100%;
        mix-blend-mode: screen;
        animation: pp-sheen 6.5s ease-in-out infinite;
      }
      @keyframes pp-sheen {
        0%   { background-position: 160% 0; opacity: 0; }
        18%  { opacity: 1; }
        55%  { background-position: -60% 0; opacity: 1; }
        70%,100% { background-position: -60% 0; opacity: 0; }
      }

      /* Guirnalda de luces superior */
      .pp-lights {
        position: absolute; top: 9px; left: -1%; width: 102%; height: 12px;
        z-index: 6; pointer-events: none;
        display: flex; justify-content: space-between; padding: 0 14px;
      }
      .pp-lights::before {
        content: ''; position: absolute; top: 4px; left: 0; width: 100%; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(240,215,154,0.5) 5%, rgba(240,215,154,0.5) 95%, transparent);
      }
      .pp-bulb {
        width: 8px; height: 8px; border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #fff8e0, #ffcf6b 60%, #e89a2a);
        animation: pp-bulb 1.9s ease-in-out infinite;
        animation-delay: calc(var(--n) * -0.12s);
      }
      @keyframes pp-bulb {
        0%,100% { opacity:.4; box-shadow:0 0 4px 1px rgba(255,190,90,.5); }
        50%     { opacity:1; box-shadow:0 0 11px 3px rgba(255,200,100,.95); }
      }

      /* ── Contenido ── */
      .pp-stage { position: relative; z-index: 4; }

      .pp-head { text-align: center; margin: 0.4rem auto 1.1rem; max-width: 60ch; }
      .pp-eyebrow {
        font-family: Georgia, "Times New Roman", serif; font-style: italic;
        color: var(--oro-claro);
        font-size: clamp(1rem, 2.4vw, 1.5rem); line-height: 1;
        letter-spacing: .02em;
        text-shadow: 0 2px 10px rgba(0,0,0,.5);
      }
      .pp-title {
        font-weight: 900; letter-spacing: .02em; line-height: .98;
        font-size: clamp(1.9rem, 5.2vw, 3.4rem);
        margin: .15em 0 .12em;
        background: linear-gradient(180deg, #fff7e3, var(--oro-claro) 45%, var(--oro));
        -webkit-background-clip: text; background-clip: text; color: transparent;
        filter: drop-shadow(0 3px 8px rgba(0,0,0,.55));
      }
      .pp-sub {
        color: var(--crema); opacity: .94;
        font-size: clamp(.9rem, 2.2vw, 1.18rem); font-weight: 600;
        text-shadow: 0 2px 8px rgba(0,0,0,.5);
      }
      .pp-rule {
        display: block; width: clamp(120px, 22%, 280px); height: 2px; margin: .9rem auto 0;
        background: linear-gradient(90deg, transparent, var(--oro) 30%, var(--oro-claro) 50%, var(--oro) 70%, transparent);
        box-shadow: 0 0 12px rgba(240,215,154,.6);
      }

      /* Dos videos lado a lado (desktop) */
      .pp-videos {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: clamp(.8rem, 1.8vw, 1.6rem);
        align-items: start;
      }
      .pp-vidwrap {
        position: relative;
        border-radius: 18px;
        overflow: hidden;
        /* Glassmorfismo del marco */
        background: rgba(245,234,208,0.06);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow:
          0 14px 38px rgba(0,0,0,.5),
          inset 0 1px 0 rgba(255,255,255,.12);
        transition: transform .35s ease, box-shadow .35s ease;
      }
      .pp-vidwrap:hover {
        transform: translateY(-4px);
        box-shadow:
          0 0 30px rgba(240,215,154,.25),
          0 20px 50px rgba(0,0,0,.55),
          inset 0 1px 0 rgba(255,255,255,.18);
      }
      .pp-video {
        display: block; width: 100%; aspect-ratio: 16 / 9;
        object-fit: cover; background: #1a0509;
        /* Limita la altura para que en desktop NO haya que scrollear */
        max-height: 62vh;
      }
      /* Marco dorado interior */
      .pp-frame {
        position: absolute; inset: 0; border-radius: 18px; pointer-events: none;
        border: 1.5px solid rgba(240,215,154,.55);
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.10),
          inset 0 0 26px rgba(240,215,154,.18);
      }
      .pp-cap {
        position: absolute; left: 0; right: 0; bottom: 0;
        padding: .85rem .9rem .5rem;
        font-size: clamp(.82rem, 1.8vw, 1rem); font-weight: 700; color: #fff;
        text-align: left; text-shadow: 0 2px 6px rgba(0,0,0,.7);
        background: linear-gradient(180deg, transparent, rgba(15,4,8,.78));
      }

      /* Destellos */
      .pp-sparkles { position: absolute; inset: 0; z-index: 7; pointer-events: none; overflow: hidden; }
      .pp-spark {
        position: absolute; color: var(--oro-claro);
        text-shadow: 0 0 6px rgba(240,215,154,.95);
        opacity: 0; will-change: transform, opacity;
        animation: pp-twinkle var(--dur) var(--delay) ease-in-out infinite;
      }
      @keyframes pp-twinkle {
        0%,100% { opacity: 0; transform: scale(.3); }
        45%,60% { opacity: 1; transform: scale(1); }
      }

      /* Fuegos artificiales por encima de todo */
      .pp-fireworks {
        position: absolute; inset: 0; z-index: 8; pointer-events: none;
        width: 100%; height: 100%;
      }

      /* ════════ MOBILE ════════ */
      @media (max-width: 760px) {
        .pp-card { width: 95vw; border-radius: 22px; margin: 1.6rem auto; padding: 1.1rem .9rem 1.2rem; }
        /* Fondo vertical 9:16 para mobile */
        .pp-bg { background-image: var(--bg-mobile); opacity: .6; }
        .pp-videos { grid-template-columns: 1fr; gap: 1rem; }
        .pp-video { max-height: none; }
        .pp-head { margin-bottom: .9rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .pp-glow, .pp-sheen, .pp-bulb, .pp-spark { animation: none !important; }
        .pp-fireworks { display: none; }
      }
    `;
  }
}

customElements.define('preparativos-pena', PreparativosPena);
