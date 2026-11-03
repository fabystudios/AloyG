/*!
 * <video-glass-frame>
 * Marco glassmorphism + bisel 3D para video o afiche (desktop / mobile), vanilla JS + Shadow DOM.
 *
 * ── ATRIBUTOS ───────────────────────────────────────────────────────────────
 *  desktop           mp4/webm/mov  ó imagen (jpg, png, webp, avif, gif, svg)
 *  mobile            idem. Si falta uno de los dos, se usa el otro para ambos.
 *  poster-desktop    poster del video desktop (opcional)
 *  poster-mobile     poster del video mobile  (opcional)
 *  poster            poster común si no hay uno específico
 *  theme             "gold" (default) | "christmas"
 *  alt               texto accesible
 *  max-width         ancho máximo (default 860px)
 *  breakpoint        px desde los que se considera desktop (default 769)
 *
 *  autoplay="off"    desactiva el autoplay (muestra controles nativos)
 *  loop="off"        desactiva el loop
 *  controls          muestra controles nativos (oculta el botón de sonido propio)
 *  sound-button="off"        oculta el botón de sonido
 *  sound-position    "bottom-center" (default) | "top-right" | "bottom-right" | "top-left"
 *  label-activar     texto del botón con el video en silencio   (default "Activar sonido")
 *  label-silenciar   texto del botón con el sonido activo        (default "Silenciar")
 *
 *  decor="off"       sin decoración (solo marco)
 *  ornaments="off"   (christmas) sin bolas / estrellas / campanas / bastones colgantes
 *  lights="off"      (christmas) sin luces perimetrales
 *  snow="off"        (christmas) sin nieve cayendo sobre el video
 *  decor-scale       multiplicador de tamaño de los adornos (0.5 – 2, default 1)
 *
 * ── EJEMPLO ─────────────────────────────────────────────────────────────────
 *  <video-glass-frame
 *     desktop="./video/secre_desk.mp4" poster-desktop="./img/secre_desk2.png"
 *     mobile="./video/secre_mob.mp4"   poster-mobile="./img/secre_mob2.jpg"
 *     theme="christmas" alt="Secretaría parroquial"></video-glass-frame>
 *
 *  Solo imagen:
 *  <video-glass-frame desktop="./img/a.jpg" mobile="./img/b.jpg"></video-glass-frame>
 */
(() => {
  'use strict';
  const TAG = 'video-glass-frame';
  if (customElements.get(TAG)) return;

  /* ───────────── utilidades ───────────── */
  const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/i;
  const isVideo = (u) => VIDEO_RE.test(u || '');
  const f = (n) => Math.round(n * 100) / 100;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const INSTANCES = new Set();

  /* ───────────── gradientes compartidos (se declaran una sola vez) ───────────── */
  const BALLS = {
    Red: ['#ff7a88', '#d4132f', '#5e0412'],
    Gold: ['#fff6bf', '#e6ae1e', '#7a5200'],
    Blue: ['#b4e6ff', '#2d8fe6', '#0a3472'],
    Green: ['#a8f5bb', '#1fa650', '#073d1b'],
    Silver: ['#ffffff', '#c2ccd9', '#566274']
  };
  const DEFS = `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
${Object.keys(BALLS).map((n) => `<radialGradient id="gBall${n}" cx=".35" cy=".3" r=".78"><stop offset="0" stop-color="${BALLS[n][0]}"/><stop offset=".5" stop-color="${BALLS[n][1]}"/><stop offset="1" stop-color="${BALLS[n][2]}"/></radialGradient>`).join('')}
<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#e3ab1c"/><stop offset="1" stop-color="#8a5f06"/></linearGradient>
<linearGradient id="gGoldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8860b"/><stop offset=".35" stop-color="#fff0a0"/><stop offset=".7" stop-color="#e3ab1c"/><stop offset="1" stop-color="#8a5f06"/></linearGradient>
<linearGradient id="gRibbon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5d70"/><stop offset=".55" stop-color="#d4132f"/><stop offset="1" stop-color="#820a1d"/></linearGradient>
<radialGradient id="gBerry" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff9aa5"/><stop offset=".5" stop-color="#e0182f"/><stop offset="1" stop-color="#7d0716"/></radialGradient>
<linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3bc472"/><stop offset="1" stop-color="#0f5a2d"/></linearGradient>
<linearGradient id="gMLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9ee8c"/><stop offset="1" stop-color="#5f9e2e"/></linearGradient>
<radialGradient id="gPearl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f6f1da"/><stop offset="1" stop-color="#c9c39b"/></radialGradient>
<linearGradient id="gSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcebf9"/></linearGradient>
<pattern id="gStripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="14" height="14" fill="#fffaf2"/><rect width="7" height="14" fill="#d4132f"/></pattern>
</defs></svg>`;

  /* ───────────── CSS ───────────── */
  const CSS = `
:host{display:block;margin:1.5rem 0;padding:0 14px;width:100%;box-sizing:border-box}
:host([hidden]){display:none}
*,*::before,*::after{box-sizing:border-box}
.cq{container-type:inline-size;width:100%;max-width:var(--max-w,860px);margin:0 auto;--sz:clamp(18px,calc(3.4cqw * var(--ds,1)),38px)}
.pad{padding-top:calc(var(--lift-u,0) * 100cqw);padding-bottom:var(--pb,0px)}
.holder{position:relative}

/* ── temas ── */
.t-gold{
  --fpad:6px;--fr:24px;--gr:19px;--vr:13px;
  --fbg:linear-gradient(145deg,#fff1a8 0%,#d4a017 22%,#7a5604 48%,#f6d86b 74%,#b8860b 100%);
  --fshadow:0 14px 32px rgba(0,0,0,.35),0 2px 4px rgba(0,0,0,.3),inset 0 1px 2px rgba(255,255,255,.85),inset 0 -2px 4px rgba(80,50,0,.65);
  --fgloss:linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,0) 35%,rgba(0,0,0,0) 65%,rgba(60,35,0,.35));
  --gborder:1px solid rgba(255,255,255,.4);
  --vshadow:0 0 0 1.5px #d9ac2b,0 0 0 3px rgba(255,255,255,.25),0 6px 14px rgba(0,0,0,.45);
  --btnbg:rgba(20,30,70,.55);--btnborder:#e2b93b;
}
.t-christmas{
  --fpad:12px;--fr:30px;--gr:18px;--vr:12px;
  --fbg:repeating-linear-gradient(135deg,#d4132f 0 11px,#fff8f0 11px 22px);
  --fshadow:0 16px 34px rgba(60,0,10,.42),0 2px 5px rgba(0,0,0,.35),inset 0 2px 3px rgba(255,255,255,.9),inset 0 -3px 6px rgba(90,0,15,.75),inset 3px 0 4px rgba(255,255,255,.4),inset -3px 0 5px rgba(90,0,15,.4);
  --fgloss:linear-gradient(135deg,rgba(255,255,255,.7),rgba(255,255,255,0) 38%,rgba(0,0,0,0) 62%,rgba(70,0,10,.4));
  --gborder:2px solid #f0c14b;
  --vshadow:0 0 0 1.5px #f1c84b,0 0 0 3px rgba(255,255,255,.3),0 6px 14px rgba(0,0,0,.45);
  --btnbg:rgba(10,70,38,.66);--btnborder:#f0c14b;
}

/* ── marco ── */
.frame{position:relative;padding:var(--fpad);border-radius:var(--fr);background:var(--fbg);box-shadow:var(--fshadow)}
.frame::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:var(--fpad);background:var(--fgloss);
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;pointer-events:none}
.glass{position:relative;padding:8px;border-radius:var(--gr);background:rgba(255,255,255,.14);
  -webkit-backdrop-filter:blur(14px) saturate(150%);backdrop-filter:blur(14px) saturate(150%);
  border:var(--gborder);box-shadow:inset 0 2px 5px rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.28)}
.glass::after{content:"";position:absolute;inset:8px;border-radius:var(--vr);pointer-events:none;z-index:1;
  background:linear-gradient(160deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,0) 35%)}
.media{position:relative;line-height:0;min-height:80px}
.media video,.media img{display:block;width:100%;height:auto;border-radius:var(--vr);box-shadow:var(--vshadow)}
.media video{background:#000}

/* ── botón de sonido ── */
.vsound{position:absolute;z-index:6;display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:999px;cursor:pointer;
  font:600 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#fff;white-space:nowrap;
  background:var(--btnbg);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1.5px solid var(--btnborder);
  box-shadow:0 4px 10px rgba(0,0,0,.4),inset 0 1px 2px rgba(255,255,255,.5),inset 0 -2px 3px rgba(0,0,0,.3);
  transition:scale .15s,filter .2s}
.vsound:hover{filter:brightness(1.14)}
.vsound:active{scale:.94}
.vsound:focus-visible{outline:2px solid #fff;outline-offset:2px}
.vsound svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sp-bottom-center{--pb:24px}
.sp-bottom-center .vsound{bottom:-19px;left:50%;translate:-50% 0}
.sp-top-right .vsound{top:calc(var(--fpad) + 18px);right:calc(var(--fpad) + 18px)}
.sp-top-left .vsound{top:calc(var(--fpad) + 18px);left:calc(var(--fpad) + 18px)}
.sp-bottom-right .vsound{bottom:calc(var(--fpad) + 18px);right:calc(var(--fpad) + 18px)}

/* ── tema dorado: destellos ── */
.spark{position:absolute;z-index:5;width:clamp(16px,3.2cqw,28px);pointer-events:none;animation:glint 3.4s ease-in-out infinite;filter:drop-shadow(0 0 4px rgba(255,214,90,.9))}
.spark svg{display:block;width:100%;height:auto}
.s1{top:-9px;left:-7px}.s2{top:22%;right:-9px;animation-delay:.9s}.s3{bottom:-9px;left:14%;animation-delay:1.7s}.s4{bottom:-8px;right:-7px;animation-delay:2.4s}

/* ── tema navideño ── */
.lights{position:absolute;inset:calc(var(--fpad) / 2);z-index:2;pointer-events:none}
.lights svg{display:block;width:100%;height:100%;overflow:visible}
.lights rect{fill:none;stroke-linecap:round}
.lights .wire{stroke:#123d1f;stroke-width:1.6;opacity:.9}
.lights .glow{stroke-width:16px;opacity:.28}
.lights .bulb{stroke-width:8px}
.lights .spec{stroke:#fff;stroke-width:2.4px;opacity:.7;transform:none}
.lights g{animation:twinkle 1.8s ease-in-out infinite}
.lights g:nth-of-type(2){animation-delay:.45s}.lights g:nth-of-type(3){animation-delay:.9s}.lights g:nth-of-type(4){animation-delay:1.35s}
.snowcap{position:absolute;left:26px;right:26px;top:-7px;height:16px;z-index:3;pointer-events:none;filter:drop-shadow(0 2px 1.5px rgba(40,60,90,.35))}
.snowcap svg{display:block;width:100%;height:100%}
.top{position:absolute;left:0;right:0;top:calc(var(--lift-u,0) * -100cqw);z-index:4;pointer-events:none}
.garland{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 4px 4px rgba(0,0,0,.35))}
.orn{position:absolute;width:calc(var(--sz) * var(--k,1));translate:-50% 0;transform-origin:50% 0;
  animation:sway var(--t,4s) ease-in-out var(--d,0s) infinite alternate;filter:drop-shadow(0 3px 3px rgba(0,0,0,.38))}
.orn svg,.cane svg{display:block;width:100%;height:auto;overflow:visible}
.orn.cn{margin-top:calc(var(--sz) * -.3)}
.cane{position:absolute;bottom:-.8cqw;z-index:5;width:clamp(20px,4.6cqw,42px);pointer-events:none;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))}
.cane.l{left:-1.4cqw;rotate:-9deg}
.cane.r{right:-1.4cqw;scale:-1 1;rotate:9deg}
.snow{position:absolute;inset:8px;z-index:2;border-radius:var(--vr);overflow:hidden;pointer-events:none}
.snow i{position:absolute;top:-6%;border-radius:50%;background:#fff;box-shadow:0 0 4px rgba(255,255,255,.85);
  animation-name:fall,drift;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-direction:normal,alternate}

@keyframes sway{from{rotate:calc(var(--a,4deg) * -1)}to{rotate:var(--a,4deg)}}
@keyframes twinkle{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fall{from{top:-6%}to{top:104%}}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(var(--dx,10px))}}
@keyframes glint{0%,100%{transform:scale(.25) rotate(0);opacity:0}45%,55%{transform:scale(1) rotate(45deg);opacity:1}}
@media (prefers-reduced-motion:reduce){
  .orn,.lights g,.snow i,.spark{animation:none!important}
  .snow{display:none}
}`;

  /* ───────────── piezas SVG navideñas ───────────── */
  function cap(len) {
    return `<line x1="20" y1="0" x2="20" y2="${len}" stroke="#e0b84a" stroke-width="1.1"/>` +
      `<rect x="15.2" y="${len}" width="9.6" height="6" rx="1.6" fill="url(#gGold)" stroke="#7a5604" stroke-width=".5"/>`;
  }
  function ornBall(len, col) {
    const cy = len + 23, H = len + 42;
    return `<svg viewBox="0 0 40 ${H}" aria-hidden="true">${cap(len)}` +
      `<circle cx="20" cy="${cy}" r="17" fill="url(#gBall${col})"/>` +
      `<path d="M3.4 ${f(cy + 3)} Q20 ${f(cy + 13)} 36.6 ${f(cy + 3)}" fill="none" stroke="#ffe9a0" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 4" opacity=".95"/>` +
      `<ellipse cx="13.5" cy="${f(cy - 7.5)}" rx="5.2" ry="2.8" fill="#fff" opacity=".62" transform="rotate(-35 13.5 ${f(cy - 7.5)})"/>` +
      `<circle cx="27" cy="${f(cy + 9)}" r="1.7" fill="#fff" opacity=".35"/></svg>`;
  }
  function starPts(cx, cy, R, r) {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R;
      p.push(f(cx + Math.cos(a) * rad) + ',' + f(cy + Math.sin(a) * rad));
    }
    return p.join(' ');
  }
  function ornStar(len) {
    const cy = len + 25, H = len + 46;
    return `<svg viewBox="0 0 40 ${H}" aria-hidden="true">${cap(len)}` +
      `<polygon points="${starPts(20, cy, 18, 8)}" fill="url(#gGold)" stroke="#8a5f06" stroke-width="1" stroke-linejoin="round"/>` +
      `<polygon points="${starPts(20, cy, 10, 4.4)}" fill="#fff7c8" opacity=".55"/></svg>`;
  }
  function ornBell(len) {
    const T = len + 8, H = T + 38;
    return `<svg viewBox="0 0 40 ${H}" aria-hidden="true">${cap(len)}` +
      `<path d="M20 ${T} C11 ${T} 8 ${T + 9} 8 ${T + 17} C8 ${T + 24} 5 ${T + 26} 3 ${T + 29} L37 ${T + 29} C35 ${T + 26} 32 ${T + 24} 32 ${T + 17} C32 ${T + 9} 29 ${T} 20 ${T}Z" fill="url(#gGoldH)" stroke="#7a5604" stroke-width=".8"/>` +
      `<path d="M12 ${T + 8} C10 ${T + 14} 10 ${T + 20} 9.5 ${T + 25}" stroke="#fff" opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
      `<circle cx="20" cy="${T + 32}" r="3.6" fill="url(#gGold)" stroke="#7a5604" stroke-width=".6"/>` +
      `<path d="M20 ${T - 1} c-7 -6 -11 -1 -8 3 c2 2 6 0 8 -3z M20 ${T - 1} c7 -6 11 -1 8 3 c-2 2 -6 0 -8 -3z" fill="url(#gRibbon)" stroke="#7a0a1b" stroke-width=".5"/>` +
      `<circle cx="20" cy="${T}" r="2.4" fill="#b01026"/></svg>`;
  }
  function caneSVG(h) {
    const d = `M12 ${h} V28 A13 13 0 0 1 38 28 V40`;
    return `<svg viewBox="0 0 44 ${h + 4}" aria-hidden="true">` +
      `<path d="${d}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="11" stroke-linecap="round" transform="translate(1.5 2)"/>` +
      `<path d="${d}" fill="none" stroke="#fffaf2" stroke-width="10.5" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="url(#gStripe)" stroke-width="10.5" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.2" stroke-linecap="round" transform="translate(-2.6 0)"/>` +
      `<path d="${d}" fill="none" stroke="rgba(90,0,12,.35)" stroke-width="2" stroke-linecap="round" transform="translate(3 0)"/></svg>`;
  }
  function bow(x, y, s) {
    const st = 'fill="url(#gRibbon)" stroke="#7a0a1b" stroke-width=".8" stroke-linejoin="round"';
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">` +
      `<path d="M-2 2 C-8 14 -12 24 -16 30 L-8 27 L-4 34 C-2 22 0 12 0 4Z" ${st}/>` +
      `<path d="M2 2 C8 14 12 24 16 30 L8 27 L4 34 C2 22 0 12 0 4Z" ${st}/>` +
      `<path d="M0 0 C-10 -14 -26 -10 -24 2 C-22 12 -8 8 0 0Z" ${st}/>` +
      `<path d="M0 0 C10 -14 26 -10 24 2 C22 12 8 8 0 0Z" ${st}/>` +
      `<circle r="4.6" ${st}/>` +
      `<path d="M-18 -2 C-14 -6 -9 -5 -6 -2 M18 -2 C14 -6 9 -5 6 -2" stroke="#ff9aa6" stroke-width="1.2" fill="none" opacity=".75" stroke-linecap="round"/></g>`;
  }
  const LEAF = 'M0 0 C5 -8 11 -4 15 -9 C19 -4 24 -7 28 -2 C33 -4 35 0 40 0 C35 3 33 6 28 5 C24 9 19 6 15 9 C11 4 5 8 0 0Z';
  function holly(x, y, s, rot) {
    const leaf = (a, k) => `<g transform="rotate(${a}) scale(${k})"><path d="${LEAF}" fill="url(#gLeaf)" stroke="#0b3d20" stroke-width=".9" stroke-linejoin="round"/><path d="M3 0 H34" stroke="#8de0a0" stroke-width="1" opacity=".55"/></g>`;
    const berries = [[2, 3], [-3, -3], [4, -4]].map((p) =>
      `<circle cx="${p[0]}" cy="${p[1]}" r="4.2" fill="url(#gBerry)" stroke="#6a0614" stroke-width=".6"/><circle cx="${p[0] - 1.3}" cy="${p[1] - 1.5}" r="1.1" fill="#fff" opacity=".8"/>`).join('');
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})">${leaf(-155, .9)}${leaf(-25, 1)}${leaf(95, .95)}${leaf(-100, .75)}${berries}</g>`;
  }
  function mistletoe(x, y, s) {
    const rad = Math.PI / 180;
    const ends = [[-9, 40, 25], [15, 42, -25], [-28, 26, 60], [27, 25, -60]];
    let leaves = '';
    ends.forEach((e) => {
      [-16, 16].forEach((da) => {
        const a = e[2] + da;
        const cx = e[0] + (-Math.sin(a * rad)) * 9, cy = e[1] + Math.cos(a * rad) * 9;
        leaves += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="4.6" ry="10" transform="rotate(${a} ${f(cx)} ${f(cy)})" fill="url(#gMLeaf)" stroke="#3f7a1c" stroke-width=".8"/>`;
      });
    });
    const pearl = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="4.1" fill="url(#gPearl)" stroke="#a9b98a" stroke-width=".7"/>`;
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">` +
      `<g stroke="#5e7d2c" stroke-width="2" fill="none" stroke-linecap="round"><path d="M0 0 C4 14 2 26 -9 40"/><path d="M0 0 C-3 14 4 28 15 42"/><path d="M0 0 C-12 6 -22 16 -28 26"/><path d="M0 0 C12 6 22 16 27 25"/></g>` +
      `${leaves}${pearl(-4, 18)}${pearl(3, 20)}${pearl(-1, 25)}${pearl(-17, 31)}${pearl(20, 33)}${bow(0, -2, .55)}</g>`;
  }
  function berryCluster(px, py) {
    return [[-4, 2], [3, 3], [0, -3]].map((p) =>
      `<circle cx="${f(px + p[0])}" cy="${f(py + p[1])}" r="3.4" fill="url(#gBerry)" stroke="#6a0614" stroke-width=".5"/><circle cx="${f(px + p[0] - 1)}" cy="${f(py + p[1] - 1.1)}" r=".9" fill="#fff" opacity=".8"/>`).join('');
  }

  /* ───────────── guirnalda de pino ───────────── */
  function garland(G) {
    const r = mulberry32(G.seed);
    const { W, H, y0, depth, anchors } = G;
    const greens = ['#0c4a26', '#146b38', '#1f8a4b', '#2fa65f', '#0a3b1f', '#3cba70'];
    let base = '', needles = '', berries = '', anchorsHtml = '';
    for (let i = 0; i < anchors.length - 1; i++) {
      const x0 = anchors[i], x1 = anchors[i + 1], xm = (x0 + x1) / 2, yc = y0 + 2 * depth, dx = x1 - x0;
      const d = `M${f(x0)} ${y0} Q${f(xm)} ${f(yc)} ${f(x1)} ${y0}`;
      base += `<path d="${d}" fill="none" stroke="#082f18" stroke-width="17" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#12602f" stroke-width="11" stroke-linecap="round"/>`;
      const steps = Math.max(10, Math.round(dx / 5));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, px = x0 + dx * t, py = y0 + 4 * depth * t * (1 - t);
        const dy = 4 * depth * (1 - 2 * t), len = Math.hypot(dx, dy), tx = dx / len, ty = dy / len, nx = -ty, ny = tx;
        for (let k = 0; k < 3; k++) {
          const side = k === 0 ? -1 : k === 1 ? 1 : (r() < .5 ? -1 : 1);
          const ang = (r() - .5) * 1.1, L = 6 + r() * 8;
          const vx = nx * side, vy = ny * side, ca = Math.cos(ang), sa = Math.sin(ang);
          const ux = vx * ca - vy * sa, uy = vx * sa + vy * ca;
          const ex = px + ux * L + tx * (r() - .5) * 7, ey = py + uy * L + ty * (r() - .5) * 7;
          needles += `<path d="M${f(px)} ${f(py)} L${f(ex)} ${f(ey)}" stroke="${greens[(r() * greens.length) | 0]}" stroke-width="${f(1.3 + r() * .9)}" stroke-linecap="round"/>`;
        }
      }
      [.22, .5, .78].forEach((t) => { berries += berryCluster(x0 + dx * t, y0 + 4 * depth * t * (1 - t) + 1); });
    }
    const last = anchors.length - 1, k = G.deco;
    anchors.forEach((x, i) => {
      if (i === 0) anchorsHtml += holly(x + 2, y0 + 2, k, 0);
      else if (i === last) anchorsHtml += mistletoe(x - 2, y0 + 4, k);
      else anchorsHtml += bow(x, y0 + 3, k * 1.05);
    });
    return `<svg class="garland" viewBox="0 0 ${W} ${H}" aria-hidden="true">${base}${needles}${berries}${anchorsHtml}</svg>`;
  }

  function ornaments(G, list) {
    const r = mulberry32(G.seed + 3);
    const { W, H, y0, depth, anchors } = G;
    const swagY = (x) => {
      let i = 0;
      while (i < anchors.length - 2 && x > anchors[i + 1]) i++;
      const t = Math.min(1, Math.max(0, (x - anchors[i]) / (anchors[i + 1] - anchors[i])));
      return y0 + 4 * depth * t * (1 - t) + 4;
    };
    return list.map((o) => {
      const [x, type, col, len] = o;
      const y = swagY(x);
      const svg = type === 'ball' ? ornBall(len, col) : type === 'star' ? ornStar(len) : type === 'bell' ? ornBell(len) : caneSVG(60);
      const k = type === 'ball' ? 1 : type === 'star' ? 1.05 : type === 'bell' ? .95 : .8;
      const a = f(2.5 + r() * 2.8), t = f(3.4 + r() * 2.4), d = f(-r() * 4);
      return `<div class="orn${type === 'cane' ? ' cn' : ''}" style="left:${f(x / W * 100)}%;top:${f(y / H * 100)}%;--k:${k};--a:${a}deg;--t:${t}s;--d:${d}s">${svg}</div>`;
    }).join('');
  }

  function snowCap() {
    const r = mulberry32(11), n = 15, w = 100 / n;
    let d = 'M0 20 L0 10';
    for (let i = 0; i < n; i++) {
      const apex = 3 + r() * 3.5, c = 2 * apex - 10;
      d += ` Q${f(i * w + w / 2)} ${f(c)} ${f((i + 1) * w)} ${f(9.5 + r() * 2)}`;
    }
    d += ' L100 20 Z';
    return `<div class="snowcap"><svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="url(#gSnow)"/></svg></div>`;
  }
  function snowFlakes(n, seed) {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const s = 2 + r() * 4.2, dur = 7 + r() * 9, dx = (r() < .5 ? -1 : 1) * (6 + r() * 14);
      h += `<i style="left:${f(r() * 100)}%;width:${f(s)}px;height:${f(s)}px;opacity:${f(.45 + r() * .5)};animation-duration:${f(dur)}s,${f(2.5 + r() * 3)}s;animation-delay:${f(-r() * dur)}s,${f(-r() * 4)}s;--dx:${f(dx)}px"></i>`;
    }
    return `<div class="snow" aria-hidden="true">${h}</div>`;
  }
  const LIGHT_COLORS = ['#ff3d52', '#ffd34d', '#44e07a', '#4dbbff'];
  function lightsRing(rx) {
    const rect = (cls, extra) => `<rect class="${cls}" x="0" y="0" width="100%" height="100%" rx="${rx}" ry="${rx}" ${extra || ''}/>`;
    return `<div class="lights"><svg aria-hidden="true">${rect('wire')}` +
      LIGHT_COLORS.map((c, i) => {
        const dash = `pathLength="100" stroke-dasharray="0.01 3.99" stroke-dashoffset="${-i}"`;
        return `<g>${rect('glow', `stroke="${c}" ${dash}`)}${rect('bulb', `stroke="${c}" ${dash}`)}${rect('spec', dash)}</g>`;
      }).join('') + `</svg></div>`;
  }

  const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 C12.6 7 17 11.4 24 12 C17 12.6 12.6 17 12 24 C11.4 17 7 12.6 0 12 C7 11.4 11.4 7 12 0Z" fill="url(#gGold)"/><circle cx="12" cy="12" r="2.2" fill="#fff"/></svg>';

  /* ───────────── composición de decoración por tema ───────────── */
  function goldDecor(c) {
    const e = { liftU: 0, snow: '', lights: '', snowcap: '', top: '', canes: '', sparks: '' };
    if (c.decor) e.sparks = [1, 2, 3, 4].map((n) => `<div class="spark s${n}">${SPARK}</div>`).join('');
    return e;
  }
  function christmasDecor(c, mobile) {
    const e = { liftU: 0, snow: '', lights: '', snowcap: '', top: '', canes: '', sparks: '' };
    if (c.snow) e.snow = snowFlakes(mobile ? 16 : 26, 21);
    if (!c.decor) return e;
    const G = mobile
      ? { W: 420, H: 100, lift: 20, depth: 24, anchors: [14, 210, 406], deco: .85, seed: 5 }
      : { W: 860, H: 110, lift: 24, depth: 34, anchors: [24, 294.67, 565.33, 836], deco: 1, seed: 5 };
    G.y0 = G.lift - 8;
    e.liftU = f(G.lift / G.W * 1000) / 1000;
    const list = mobile
      ? [[48, 'ball', 'Red', 8], [96, 'ball', 'Gold', 22], [148, 'star', null, 6], [268, 'bell', null, 6], [316, 'ball', 'Blue', 20], [366, 'cane', null, 0]]
      : [[66, 'ball', 'Red', 10], [118, 'ball', 'Gold', 26], [172, 'star', null, 8], [232, 'ball', 'Blue', 20], [430, 'bell', null, 3],
         [628, 'ball', 'Green', 24], [686, 'cane', null, 0], [742, 'ball', 'Red', 16], [796, 'star', null, 22]];
    e.top = `<div class="top">${garland(G)}${c.ornaments ? ornaments(G, list) : ''}</div>`;
    e.snowcap = snowCap();
    if (c.lights) e.lights = lightsRing(24);
    e.canes = `<div class="cane l">${caneSVG(96)}</div><div class="cane r">${caneSVG(96)}</div>`;
    return e;
  }

  /* ───────────── iconos de sonido ───────────── */
  const ICON_MUTED = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const ICON_ON = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/></svg>';

  /* ───────────── componente ───────────── */
  class VideoGlassFrame extends HTMLElement {
    static get observedAttributes() {
      return ['desktop', 'mobile', 'poster', 'poster-desktop', 'poster-mobile', 'theme', 'alt', 'max-width', 'breakpoint',
        'autoplay', 'loop', 'controls', 'sound-button', 'sound-position', 'label-activar', 'label-silenciar',
        'decor', 'ornaments', 'lights', 'snow', 'decor-scale'];
    }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._video = null;
      this._io = null;
      this._mq = null;
      this._bp = null;
      this._renderScheduled = false;
      this._onMq = () => this._schedule();
    }
    connectedCallback() { INSTANCES.add(this); this._schedule(); }
    disconnectedCallback() {
      INSTANCES.delete(this);
      if (this._mq) { this._mq.removeEventListener('change', this._onMq); this._mq = null; this._bp = null; }
      this._teardown();
    }
    attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this._schedule(); }

    /* API pública */
    get video() { return this._video; }
    play() { if (this._video) return this._video.play(); }
    pause() { if (this._video) this._video.pause(); }
    mute() { this._setMuted(true); }
    unmute() { this._toggleSound(true); }

    _schedule() {
      if (this._renderScheduled) return;
      this._renderScheduled = true;
      Promise.resolve().then(() => { this._renderScheduled = false; if (this.isConnected) this._render(); });
    }

    _config() {
      const g = (n, d = '') => { const v = this.getAttribute(n); return v == null ? d : v.trim(); };
      const off = (n) => { const v = g(n).toLowerCase(); return v === 'off' || v === 'false' || v === '0'; };
      const d = g('desktop'), m = g('mobile');
      const src = { desktop: d || m, mobile: m || d };
      const same = src.desktop === src.mobile;
      const poster = {
        desktop: g('poster-desktop') || g('poster') || (same ? g('poster-mobile') : ''),
        mobile: g('poster-mobile') || g('poster') || (same ? g('poster-desktop') : '')
      };
      const theme = ['gold', 'christmas'].includes(g('theme').toLowerCase()) ? g('theme').toLowerCase() : 'gold';
      const autoplay = !off('autoplay');
      const pos = ['bottom-center', 'top-right', 'top-left', 'bottom-right'].includes(g('sound-position')) ? g('sound-position') : 'bottom-center';
      let mw = g('max-width', '860px'); if (/^\d+(\.\d+)?$/.test(mw)) mw += 'px';
      const ds = Math.min(2, Math.max(.5, parseFloat(g('decor-scale', '1')) || 1));
      return {
        src, poster, theme, autoplay, pos, mw, ds,
        bp: parseInt(g('breakpoint'), 10) || 769,
        loop: !off('loop'),
        controls: this.hasAttribute('controls') || !autoplay,
        soundBtn: !off('sound-button'),
        alt: g('alt'),
        lblOn: g('label-activar', 'Activar sonido'),
        lblOff: g('label-silenciar', 'Silenciar'),
        decor: !off('decor'), ornaments: !off('ornaments'), lights: !off('lights'), snow: !off('snow')
      };
    }

    _bindMq(bp) {
      if (this._mq && this._bp === bp) return;
      if (this._mq) this._mq.removeEventListener('change', this._onMq);
      this._bp = bp;
      this._mq = window.matchMedia(`(min-width:${bp}px)`);
      this._mq.addEventListener('change', this._onMq);
    }

    _render() {
      this._teardown();
      const c = this._c = this._config();
      this._bindMq(c.bp);
      const mobile = !this._mq.matches;
      const src = mobile ? c.src.mobile : c.src.desktop;
      const hasVideo = isVideo(src);
      const e = c.theme === 'christmas' ? christmasDecor(c, mobile) : goldDecor(c);
      const showBtn = hasVideo && c.soundBtn && !c.controls;
      const pos = showBtn ? c.pos : 'none';
      this.shadowRoot.innerHTML =
        `<style>${CSS}</style>${DEFS}` +
        `<div class="cq t-${c.theme} sp-${pos}" style="--max-w:${esc(c.mw)};--lift-u:${e.liftU};--ds:${c.ds}">` +
        `<div class="pad"><div class="holder" part="holder">` +
        `<div class="frame" part="frame"><div class="glass" part="glass"><div class="media" part="media"></div>${e.snow}</div></div>` +
        `${e.lights}${e.snowcap}${e.top}${e.canes}${e.sparks}` +
        (showBtn ? `<button class="vsound" type="button" part="sound"></button>` : '') +
        `</div></div></div>`;
      this._mountMedia(src, mobile ? c.poster.mobile : c.poster.desktop, hasVideo);
      this._wireButton();
      this._observe();
    }

    _mountMedia(src, poster, hasVideo) {
      const slot = this.shadowRoot.querySelector('.media');
      const c = this._c;
      if (!slot || !src) return;
      if (hasVideo) {
        const v = document.createElement('video');
        v.setAttribute('muted', ''); v.muted = true; v.defaultMuted = true;
        v.setAttribute('playsinline', ''); v.playsInline = true;
        v.loop = c.loop;
        if (c.controls) v.controls = true;
        if (c.alt) v.setAttribute('aria-label', c.alt);
        v.preload = poster ? 'none' : 'metadata';
        if (poster) v.poster = poster;
        v.src = src;
        slot.appendChild(v);
        this._video = v;
      } else {
        const img = document.createElement('img');
        img.alt = c.alt; img.decoding = 'async'; img.loading = 'lazy';
        img.src = src;
        slot.appendChild(img);
      }
    }

    _wireButton() {
      const btn = this.shadowRoot.querySelector('.vsound');
      if (!btn || !this._video) return;
      btn.addEventListener('click', () => this._toggleSound());
      this._syncBtn();
    }
    _syncBtn() {
      const btn = this.shadowRoot && this.shadowRoot.querySelector('.vsound');
      const v = this._video, c = this._c;
      if (!btn || !v) return;
      btn.innerHTML = v.muted ? `${ICON_MUTED}<span>${esc(c.lblOn)}</span>` : `${ICON_ON}<span>${esc(c.lblOff)}</span>`;
      btn.setAttribute('aria-label', v.muted ? c.lblOn : c.lblOff);
      btn.setAttribute('aria-pressed', v.muted ? 'false' : 'true');
    }
    _setMuted(m) { if (this._video) { this._video.muted = m; this._syncBtn(); } }
    _toggleSound(forceOn) {
      const v = this._video;
      if (!v) return;
      const wantOn = forceOn === true ? true : v.muted;
      if (wantOn) {
        INSTANCES.forEach((i) => { if (i !== this) i._setMuted(true); });  // suena un solo video a la vez
        v.muted = false; v.volume = 1;
      } else {
        v.muted = true;
      }
      this._syncBtn();
      if (v.paused) v.play().catch(() => {});
    }

    _observe() {
      const v = this._video;
      if (!v || !this._c.autoplay || typeof IntersectionObserver === 'undefined') {
        if (v && this._c.autoplay) { v.preload = 'auto'; v.play().catch(() => {}); }
        return;
      }
      this._io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!this._video) return;
          if (en.isIntersecting) { this._video.preload = 'auto'; this._video.play().catch(() => {}); }
          else this._video.pause();
        });
      }, { threshold: .25 });
      this._io.observe(this.shadowRoot.querySelector('.holder'));
    }

    _teardown() {
      if (this._io) { this._io.disconnect(); this._io = null; }
      const v = this._video;
      if (v) {
        try { v.pause(); } catch (_) { /* noop */ }
        v.removeAttribute('src'); v.removeAttribute('poster');
        try { v.load(); } catch (_) { /* noop */ }   // libera lo descargado
        this._video = null;
      }
    }
  }

  customElements.define(TAG, VideoGlassFrame);
})();
