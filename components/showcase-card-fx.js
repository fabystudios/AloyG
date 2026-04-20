/**
 * <showcase-card> — Web Component v3
 * Ver README.md para documentación completa.
 */

/* ══════════════════════════════════════════════════════════════════
   EFECTOS DE PARTÍCULAS
══════════════════════════════════════════════════════════════════ */

class DustEffect {
  constructor(ctx, intensity) { this.ctx = ctx; this.intensity = intensity; this.p = []; }
  _new(w, h, ry = false) {
    return { x: Math.random()*w, y: ry ? Math.random()*h : h+4,
      r: 0.8+Math.random()*1.8, vy: 0.28+Math.random()*0.5,
      vx: (Math.random()-0.5)*0.25, alpha: 0, t: 0, tMax: 200+Math.random()*250 };
  }
  spawn(w, h) {
    const n = Math.round((w*h/80000)*22*this.intensity);
    this.p = Array.from({length: Math.max(n,6)}, () => this._new(w, h, true));
  }
  tick(w, h) {
    const ctx = this.ctx, mx = 0.75*this.intensity;
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i]; p.t++; p.x += p.vx; p.y -= p.vy;
      const r = p.t/p.tMax;
      if (r < 0.2)       p.alpha = Math.min(p.alpha+0.025, mx);
      else if (r > 0.75) p.alpha = Math.max(p.alpha-0.015, 0);
      if (p.t >= p.tMax || p.y < -6) { this.p[i] = this._new(w, h); continue; }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#f5d06b';
      ctx.shadowColor = 'rgba(245,208,107,0.9)'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
}

class BubblesEffect {
  constructor(ctx, intensity) { this.ctx = ctx; this.intensity = intensity; this.p = []; }
  _new(w, h, ry = false) {
    const r = 6+Math.random()*22;
    return { x: Math.random()*w, y: ry ? Math.random()*h : h+r+4,
      r, vy: 0.18+Math.random()*0.32, vx: (Math.random()-0.5)*0.15,
      alpha: 0, t: 0, tMax: 280+Math.random()*320, hue: 38+Math.random()*18 };
  }
  spawn(w, h) {
    this.p = Array.from({length: Math.max(Math.round(8*this.intensity), 3)}, () => this._new(w, h, true));
  }
  tick(w, h) {
    const ctx = this.ctx, mx = 0.28*this.intensity;
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i]; p.t++; p.x += p.vx; p.y -= p.vy;
      const r = p.t/p.tMax;
      if (r < 0.15)      p.alpha = Math.min(p.alpha+0.012, mx);
      else if (r > 0.75) p.alpha = Math.max(p.alpha-0.008, 0);
      if (p.t >= p.tMax || p.y < -p.r*2) { this.p[i] = this._new(w, h); continue; }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = `hsla(${p.hue},80%,65%,1)`;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = `hsla(${p.hue},80%,65%,0.6)`; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = p.alpha*0.35;
      ctx.fillStyle = `hsla(${p.hue},60%,80%,1)`;
      ctx.beginPath(); ctx.arc(p.x-p.r*0.3, p.y-p.r*0.3, p.r*0.28, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
}

class StarsEffect {
  constructor(ctx, intensity) { this.ctx = ctx; this.intensity = intensity; this.p = []; }
  _new(w, h) {
    return { x: Math.random()*w, y: Math.random()*h*0.85,
      r: 0.6+Math.random()*1.4, alpha: Math.random(),
      speed: 0.008+Math.random()*0.018, phase: Math.random()*Math.PI*2,
      arms: Math.random() < 0.4 };
  }
  spawn(w, h) {
    this.p = Array.from({length: Math.max(Math.round(20*this.intensity), 5)}, () => this._new(w, h));
  }
  tick(w, h) {
    const ctx = this.ctx, mx = 0.9*this.intensity;
    for (const p of this.p) {
      p.phase += p.speed;
      p.alpha = (Math.sin(p.phase)*0.5+0.5)*mx;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#fff8e0';
      ctx.shadowColor = 'rgba(245,230,150,0.95)'; ctx.shadowBlur = 8;
      if (p.arms) {
        ctx.strokeStyle = 'rgba(245,220,120,0.9)'; ctx.lineWidth = 0.7;
        for (let i = 0; i < 4; i++) {
          const angle = (i/4)*Math.PI*2+p.phase*0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x+Math.cos(angle)*p.r*3.5, p.y+Math.sin(angle)*p.r*3.5);
          ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
}

class RainEffect {
  constructor(ctx, intensity) { this.ctx = ctx; this.intensity = intensity; this.p = []; }
  _new(w, h, ry = false) {
    const len = 8+Math.random()*18;
    return { x: Math.random()*(w+60)-30, y: ry ? Math.random()*h : -len,
      len, vx: 0.8+Math.random()*1.2, vy: 2.5+Math.random()*3.5,
      alpha: 0, t: 0, tMax: 80+Math.random()*80 };
  }
  spawn(w, h) {
    this.p = Array.from({length: Math.max(Math.round(14*this.intensity), 4)}, () => this._new(w, h, true));
  }
  tick(w, h) {
    const ctx = this.ctx, mx = 0.55*this.intensity;
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i]; p.t++; p.x += p.vx; p.y += p.vy;
      const r = p.t/p.tMax;
      if (r < 0.2)      p.alpha = Math.min(p.alpha+0.04, mx);
      else if (r > 0.7) p.alpha = Math.max(p.alpha-0.04, 0);
      if (p.t >= p.tMax || p.y > h+10) { this.p[i] = this._new(w, h); continue; }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      const g = ctx.createLinearGradient(p.x, p.y, p.x-p.vx*p.len*0.5, p.y-p.vy*p.len*0.5);
      g.addColorStop(0, 'rgba(245,208,107,1)');
      g.addColorStop(1, 'rgba(245,208,107,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(245,208,107,0.7)'; ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x-p.vx*p.len*0.5, p.y-p.vy*p.len*0.5);
      ctx.stroke();
      ctx.restore();
    }
  }
}

class CometsEffect {
  constructor(ctx, intensity) { this.ctx = ctx; this.intensity = intensity; this.comets = []; this.sparks = []; }
  _newComet(w, h) {
    const fr = Math.random() < 0.5;
    return { x: fr ? w+20 : -20, y: 10+Math.random()*h*0.8,
      vx: fr ? -(3+Math.random()*4) : (3+Math.random()*4),
      vy: (Math.random()-0.5)*1.2, len: 22+Math.random()*30,
      alpha: 0, t: 0, tMax: 60+Math.random()*50, exploded: false };
  }
  _explode(c) {
    const n = Math.round(8+Math.random()*10);
    for (let i = 0; i < n; i++) {
      const angle = (i/n)*Math.PI*2+Math.random()*0.4;
      const speed = 0.8+Math.random()*2.2;
      this.sparks.push({ x: c.x, y: c.y,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        r: 0.7+Math.random()*1.3,
        alpha: 0.9*this.intensity, t: 0, tMax: 30+Math.random()*40 });
    }
  }
  spawn(w, h) {
    this.comets = []; this.sparks = [];
    const n = Math.max(Math.round(3*this.intensity), 1);
    for (let i = 0; i < n; i++) {
      const c = this._newComet(w, h);
      c.t = Math.random()*c.tMax;
      this.comets.push(c);
    }
  }
  tick(w, h) {
    const ctx = this.ctx;
    for (let i = 0; i < this.comets.length; i++) {
      const c = this.comets[i]; c.t++; c.x += c.vx; c.y += c.vy;
      const r = c.t/c.tMax;
      if (r < 0.15)      c.alpha = Math.min(c.alpha+0.08, 0.85*this.intensity);
      else if (r > 0.7)  c.alpha = Math.max(c.alpha-0.06, 0);
      if (c.t >= c.tMax) {
        if (!c.exploded) { c.exploded = true; this._explode(c); }
        this.comets[i] = this._newComet(w, h); continue;
      }
      ctx.save();
      ctx.globalAlpha = c.alpha;
      const tx = c.x-Math.sign(c.vx)*c.len;
      const g = ctx.createLinearGradient(c.x, c.y, tx, c.y-c.vy*c.len*0.3);
      g.addColorStop(0, 'rgba(255,240,180,1)');
      g.addColorStop(0.3, 'rgba(245,208,107,0.7)');
      g.addColorStop(1, 'rgba(197,162,39,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(245,208,107,0.8)'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, c.y-c.vy*c.len*0.3); ctx.stroke();
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = '#fffbe8'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(c.x, c.y, 2.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    for (let i = this.sparks.length-1; i >= 0; i--) {
      const s = this.sparks[i]; s.t++; s.x += s.vx; s.y += s.vy; s.vy += 0.04;
      s.alpha = Math.max(s.alpha-(0.9*this.intensity/s.tMax), 0);
      if (s.t >= s.tMax) { this.sparks.splice(i,1); continue; }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#f5d06b';
      ctx.shadowColor = 'rgba(245,208,107,0.9)'; ctx.shadowBlur = 7;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
}

/* ══════════════════════════════════════════════════════════════════
   MOTOR DE PARTÍCULAS
══════════════════════════════════════════════════════════════════ */
const EFFECT_MAP = { dust: DustEffect, bubbles: BubblesEffect, stars: StarsEffect, rain: RainEffect, comets: CometsEffect };

class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.effects = [];
    this.running = false;
    this._raf = null;
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(canvas.parentElement);
    this._resize();
  }
  _resize() {
    const p = this.canvas.parentElement;
    if (!p) return;
    this.canvas.width  = p.offsetWidth;
    this.canvas.height = p.offsetHeight;
    this._respawn();
  }
  setEffects(names, intensity) {
    this.effects = names
      .map(n => EFFECT_MAP[n.trim()])
      .filter(Boolean)
      .map(Cls => new Cls(this.ctx, Math.max(0, Math.min(1, intensity))));
    this._respawn();
  }
  _respawn() {
    const w = this.canvas.width||600, h = this.canvas.height||300;
    for (const ef of this.effects) ef.spawn(w, h);
  }
  start() { this.running = true; this._tick(); }
  stop()  { this.running = false; if (this._raf) cancelAnimationFrame(this._raf); }
  _tick() {
    if (!this.running) return;
    this._raf = requestAnimationFrame(() => this._tick());
    const w = this.canvas.width, h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    for (const ef of this.effects) ef.tick(w, h);
  }
  destroy() { this.stop(); this._ro.disconnect(); }
}

/* ══════════════════════════════════════════════════════════════════
   TEMPLATE
══════════════════════════════════════════════════════════════════ */
const _scTpl = document.createElement('template');
_scTpl.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; width: 100%; }

  /* ── Wrapper: fondo igual que el original ── */
  .sc-wrap {
    position: relative;
    max-width: 1100px;
    margin: 0 auto 2rem;
    padding: 1.5rem;
    border-radius: 24px;
    overflow: hidden;
    /* El fondo se aplica directo aquí, igual que el original */
    background-color: rgba(15,10,30,0.5);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    /* El blur actúa sobre lo que hay DETRÁS del elemento en el DOM */
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    box-shadow:
      0 0 0 1.5px rgba(197,162,39,0.55),
      0 0 0 3px rgba(197,162,39,0.12),
      0 12px 48px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(245,208,107,0.2),
      inset 0 -1px 0 rgba(197,162,39,0.1);
    transition: box-shadow 0.4s ease;
  }
  .sc-wrap:hover {
    box-shadow:
      0 0 0 1.5px rgba(245,208,107,0.85),
      0 0 0 3px rgba(197,162,39,0.22),
      0 0 36px rgba(197,162,39,0.18),
      0 16px 60px rgba(0,0,0,0.55),
      inset 0 1px 0 rgba(245,208,107,0.35),
      inset 0 -1px 0 rgba(197,162,39,0.12);
  }

  /* ── Overlay opcional encima del fondo (default 0 = invisible) ── */
  .sc-overlay {
    position: absolute; inset: 0;
    background: rgba(8,4,20, var(--sc-ov, 0));
    pointer-events: none; z-index: 1;
    transition: background 0.4s ease;
  }

  /* ── Shimmer sweep ── */
  .sc-shimmer {
    position: absolute; top:0; left:-100%;
    width:60%; height:100%;
    background: linear-gradient(105deg, transparent 30%, rgba(245,208,107,0.06) 50%, transparent 70%);
    pointer-events:none; z-index:6;
    animation: scShimmer 6s ease-in-out infinite 1s;
  }
  @keyframes scShimmer { 0%{left:-60%} 50%{left:120%} 100%{left:120%} }

  /* ── Reflejo glass interno ── */
  .sc-glass {
    position: absolute; inset:0; border-radius:24px;
    background: linear-gradient(135deg,
      rgba(245,208,107,0.1) 0%, transparent 40%,
      transparent 60%, rgba(197,162,39,0.05) 100%);
    pointer-events:none; z-index:3;
  }

  /* ── Canvas partículas ── */
  .sc-canvas { position:absolute; inset:0; pointer-events:none; z-index:5; }

  /* ── Esquinas doradas ── */
  .sc-corner { position:absolute; width:44px; height:44px; z-index:7; pointer-events:none; }
  .sc-corner.tl { top:0; left:0; }
  .sc-corner.tr { top:0; right:0; transform:scaleX(-1); }
  .sc-corner.bl { bottom:0; left:0; transform:scaleY(-1); }
  .sc-corner.br { bottom:0; right:0; transform:scale(-1,-1); }

  /* ── Layout ── */
  .sc-layout {
    display:flex; align-items:center; justify-content:center;
    gap:1.5rem; position:relative; z-index:8;
  }

  /* ── Cover desktop ── */
  .sc-cover {
    flex:1 1 60%; min-width:0; border-radius:16px; overflow:hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(197,162,39,0.25);
  }
  .sc-cover img { display:block; width:100%; height:auto; border-radius:16px; }

  .sc-video { flex:0 0 auto; }

  /* ── Medallón mobile ── */
  .sc-medallon-wrap {
    position:absolute; top:12px; left:12px;
    width:110px; height:110px; z-index:10;
    display:none; align-items:center; justify-content:center;
    animation:scFloat 4s ease-in-out infinite; pointer-events:none;
  }
  @keyframes scFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .sc-medallon-ring {
    position:absolute; inset:-4px; border-radius:50%;
    background:conic-gradient(
      rgba(245,208,107,0.95) 0deg, rgba(197,162,39,0.2) 90deg,
      rgba(245,208,107,0.95) 180deg, rgba(197,162,39,0.15) 270deg,
      rgba(245,208,107,0.95) 360deg);
    animation:scRingSpin 5s linear infinite;
  }
  @keyframes scRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .sc-medallon-img {
    position:relative; width:110px; height:110px;
    border-radius:50%; object-fit:cover;
    border:2.5px solid rgba(245,208,107,0.95);
    animation:scGlow 4s ease-in-out infinite;
    z-index:2; background:#0f0a1e;
  }
  @keyframes scGlow {
    0%,100%{box-shadow:0 0 12px 3px rgba(197,162,39,0.5),0 3px 16px rgba(0,0,0,0.5)}
    50%    {box-shadow:0 0 28px 10px rgba(245,208,107,0.78),0 6px 24px rgba(0,0,0,0.55)}
  }

  /* ── Responsive ── */
  @media (min-width:768px) {
    .sc-layout        { flex-direction:row; }
    .sc-medallon-wrap { display:none !important; }
  }
  @media (max-width:767px) {
    .sc-wrap { width:95vw; max-width:95vw; }
    .sc-layout { flex-direction:row; align-items:center; gap:0.7rem; }
    .sc-cover  { display:none !important; }
    .sc-video  { flex:1 1 100%; max-width:100%; display:flex; align-items:center; justify-content:center; }
    .sc-medallon-wrap { display:flex; }
  }
</style>

<div class="sc-wrap" id="scWrap">
  <div class="sc-overlay" id="scOverlay"></div>
  <div class="sc-shimmer"></div>
  <div class="sc-glass"></div>
  <canvas class="sc-canvas" id="scCanvas"></canvas>

  <svg class="sc-corner tl" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sc-gg" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f5d06b"/>
      <stop offset="100%" stop-color="rgba(197,162,39,0.3)"/>
    </linearGradient></defs>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="url(#sc-gg)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="rgba(245,208,107,0.3)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,0.7)"/>
  </svg>
  <svg class="sc-corner tr" viewBox="0 0 40 40" fill="none">
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,0.6)"/>
  </svg>
  <svg class="sc-corner bl" viewBox="0 0 40 40" fill="none">
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,0.6)"/>
  </svg>
  <svg class="sc-corner br" viewBox="0 0 40 40" fill="none">
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,0.6)"/>
  </svg>

  <div class="sc-medallon-wrap">
    <div class="sc-medallon-ring"></div>
    <img class="sc-medallon-img" id="scMedallonImg" src="" alt="">
  </div>

  <div class="sc-layout">
    <div class="sc-cover"><img id="scCoverImg" src="" alt=""></div>
    <div class="sc-video" id="scVideoSlot"></div>
  </div>
</div>
`;

/* ══════════════════════════════════════════════════════════════════
   WEB COMPONENT
══════════════════════════════════════════════════════════════════ */
const OVERLAY_PRESETS = { light: 0.15, medium: 0.35, dark: 0.58 };

class ShowcaseCard extends HTMLElement {
  static get observedAttributes() {
    return ['bg','cover','medallion','video','titulo','badge',
            'overlay-preset','overlay','effects','intensity'];
  }

  connectedCallback() {
    if (this._init) return;
    this._init = true;
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(_scTpl.content.cloneNode(true));

    this._wrap      = this._shadow.getElementById('scWrap');
    this._overlay   = this._shadow.getElementById('scOverlay');
    this._coverImg  = this._shadow.getElementById('scCoverImg');
    this._medImg    = this._shadow.getElementById('scMedallonImg');
    this._videoSlot = this._shadow.getElementById('scVideoSlot');
    this._canvas    = this._shadow.getElementById('scCanvas');

    this._engine = new ParticleEngine(this._canvas);
    this._applyAll();
    requestAnimationFrame(() => this._engine.start());
  }

  attributeChangedCallback(name, _o, val) {
    if (!this._init) return;
    this._applyAttr(name, val);
  }

  _applyAll() {
    ['bg','cover','medallion','video','titulo','badge',
     'overlay-preset','overlay','effects','intensity']
      .forEach(a => this._applyAttr(a, this.getAttribute(a)));
  }

  _applyAttr(name, val) {
    if (!this._wrap) return;

    if (name === 'bg') {
      /* Igual que el original: background con la imagen directa en el wrapper */
      this._wrap.style.backgroundImage = val
        ? `url('${val}'), rgba(15,10,30,0.5)`
        : '';

    } else if (name === 'cover') {
      if (val) { this._coverImg.src = val; this._coverImg.alt = this.getAttribute('titulo')||''; }

    } else if (name === 'medallion') {
      if (val) this._medImg.src = val;

    } else if (name === 'overlay-preset' || name === 'overlay') {
      /* overlay="0" → sin oscurecimiento. Sin atributo overlay → usa preset o 0 */
      const raw = this.getAttribute('overlay');
      let alpha = 0;
      if (raw !== null && raw !== '') {
        alpha = Math.max(0, Math.min(1, parseFloat(raw)));
      } else {
        const preset = this.getAttribute('overlay-preset');
        alpha = preset ? (OVERLAY_PRESETS[preset] ?? 0) : 0;
      }
      this._overlay.style.setProperty('--sc-ov', alpha);

    } else if (name === 'effects' || name === 'intensity') {
      const names     = (this.getAttribute('effects') || 'dust').split(',');
      const intensity = parseFloat(this.getAttribute('intensity') || '0.6');
      this._engine.setEffects(names, intensity);

    } else if (['video','titulo','badge'].includes(name)) {
      this._rebuildCard();
    }
  }

  _rebuildCard() {
    if (!this._videoSlot) return;
    const ex     = this._videoSlot.querySelector('video-card-gold');
    const video  = this.getAttribute('video')  || '';
    const titulo = this.getAttribute('titulo') || 'Sin título';
    const badge  = this.getAttribute('badge')  || 'Premium';
    if (ex) {
      ex.setAttribute('video', video);
      ex.setAttribute('titulo', titulo);
      ex.setAttribute('badge', badge);
    } else {
      const card = document.createElement('video-card-gold');
      card.setAttribute('video', video);
      card.setAttribute('titulo', titulo);
      card.setAttribute('badge', badge);
      card.style.width = 'auto';
      this._videoSlot.appendChild(card);
    }
  }

  disconnectedCallback() {
    if (this._engine) this._engine.destroy();
  }
}

customElements.define('showcase-card', ShowcaseCard);
