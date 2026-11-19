/*!
 * <info-glass-frame>
 * Panel de información con el MISMO marco que <video-glass-frame> (bisel 3D + vidrio), pensado
 * para ir debajo de un video y ampliarlo con datos. Neumorfismo + geometría, vanilla JS + Shadow DOM.
 *
 * ── ATRIBUTOS DEL COMPONENTE ────────────────────────────────────────────────
 *  theme         "gold" (default) | "christmas"   (usá el mismo que el video de arriba)
 *  heading       título opcional centrado sobre las tarjetas
 *  alt           texto accesible del grupo (si falta se usa heading)
 *  columns       nº de columnas en pantallas anchas (default: cantidad de ítems, máx. 3)
 *  max-width     ancho máximo (default 860px)  → poné el mismo que el video
 *  breakpoint    px desde los que se considera desktop (default 769)
 *  animate="off" sin animación de entrada
 *  decor="off"   sin decoración (solo marco)
 *  ornaments="off" · lights="off" · snow="off"   (christmas) igual que en video-glass-frame
 *  decor-scale   multiplicador de tamaño de los adornos (0.5 – 2, default 1)
 *  items         alternativa JSON: '[{"label":"Web","value":"x.org","href":"x.org","icon":"globe"}]'
 *
 * ── ATRIBUTOS DE CADA <info-item> ───────────────────────────────────────────
 *  label   título chico (ej. "Postulaciones")
 *  value   dato principal (ej. "hasta el 20 de noviembre"); si falta se usa el texto interno
 *  icon    ícono incluido: calendar · calendar-check · trophy · award · globe · link · clock · pin ·
 *          info · users · ticket · phone · mail · gift · star · heart · cross
 *  img     PNG/SVG/WebP propio (con transparencia) que reemplaza al ícono; respeta su proporción
 *  href    si existe, el valor se muestra como PÍLDORA-BOTÓN que lleva a ese enlace
 *          (acepta "premiopapafrancisco.org", http(s)://, mailto:, tel:, rutas relativas y #ancla)
 *
 * ── EJEMPLO ─────────────────────────────────────────────────────────────────
 *  <video-glass-frame desktop="./video/a.mp4" mobile="./video/b.mp4" theme="gold"></video-glass-frame>
 *
 *  <info-glass-frame theme="gold" heading="Premio Papa Francisco">
 *    <info-item label="Postulaciones"     value="hasta el 20 de noviembre" icon="calendar"></info-item>
 *    <info-item label="Entrega del premio" value="17 de diciembre"          icon="trophy"></info-item>
 *    <info-item label="Web" value="premiopapafrancisco.org" href="https://premiopapafrancisco.org" icon="globe"></info-item>
 *  </info-glass-frame>
 *
 *  Con PNG propio:  <info-item label="Web" href="..." img="./img/web.png"></info-item>
 *
 *  Partes estilizables desde afuera (::part): holder, frame, glass, panel, heading, card, icon, label, value, pill
 */
(() => {
  'use strict';
  const TAG = 'info-glass-frame';
  if (customElements.get(TAG)) return;

  /* ───────────── utilidades ───────────── */
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
<linearGradient id="gIcon" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="24"><stop offset="0" stop-color="#fff6c4"/><stop offset=".5" stop-color="#f0c23e"/><stop offset="1" stop-color="#b9820d"/></linearGradient>
</defs></svg>`;

  /* ───────────── CSS ───────────── */
  const CSS = `
:host{display:block;margin:1.5rem 0;padding:0 14px;width:100%;box-sizing:border-box}
:host([hidden]){display:none}
*,*::before,*::after{box-sizing:border-box}
.cq{container-type:inline-size;width:100%;max-width:var(--max-w,860px);margin:0 auto;--sz:clamp(18px,calc(3.4cqw * var(--ds,1)),38px)}
.pad{padding-top:calc(var(--lift-u,0) * 100cqw)}
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

/* ══════════ PANEL DE INFORMACIÓN (neumorfismo + geometría) ══════════ */
.t-gold{
  --pbg:radial-gradient(120% 95% at 10% 0%,#34469c 0%,#1a265f 46%,#0a1033 100%);
  --cardbg:linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.02) 55%,rgba(0,0,0,.2));
  --cardsh:9px 12px 22px rgba(2,5,24,.55),-7px -7px 16px rgba(135,155,255,.09),inset 1px 1px 1px rgba(255,255,255,.22),inset -1px -2px 3px rgba(0,0,0,.4);
  --cardsh-h:12px 17px 30px rgba(2,5,24,.65),-8px -8px 20px rgba(135,155,255,.14),inset 1px 1px 1px rgba(255,255,255,.3),inset -1px -2px 3px rgba(0,0,0,.4);
  --ring:#e2b93b;--geo:rgba(240,194,62,.15);--grid:rgba(190,205,255,.05);
}
.t-christmas{
  --pbg:radial-gradient(120% 95% at 10% 0%,#1f9455 0%,#0e5f34 46%,#052d19 100%);
  --cardbg:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.02) 55%,rgba(0,0,0,.2));
  --cardsh:9px 12px 22px rgba(1,22,10,.58),-7px -7px 16px rgba(150,255,190,.08),inset 1px 1px 1px rgba(255,255,255,.24),inset -1px -2px 3px rgba(0,30,10,.5);
  --cardsh-h:12px 17px 30px rgba(1,22,10,.68),-8px -8px 20px rgba(150,255,190,.13),inset 1px 1px 1px rgba(255,255,255,.32),inset -1px -2px 3px rgba(0,30,10,.5);
  --ring:#f0c14b;--geo:rgba(240,194,62,.17);--grid:rgba(200,255,220,.05);
}
.panel{position:relative;isolation:isolate;overflow:hidden;border-radius:var(--vr);background:var(--pbg);box-shadow:var(--vshadow);
  padding:clamp(14px,3.2cqw,26px);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.panel::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:26px 26px;
  -webkit-mask-image:radial-gradient(95% 100% at 50% 0%,#000,transparent);mask-image:radial-gradient(95% 100% at 50% 0%,#000,transparent)}
.panel::after{content:"";position:absolute;z-index:-1;pointer-events:none;right:-70px;bottom:-80px;width:260px;height:260px;border-radius:50%;
  background:repeating-radial-gradient(circle,transparent 0 15px,var(--geo) 15px 16px);
  -webkit-mask-image:radial-gradient(circle,#000 25%,transparent 70%);mask-image:radial-gradient(circle,#000 25%,transparent 70%)}
.geo{position:absolute;z-index:-1;pointer-events:none;left:-46px;top:-46px;width:140px;height:140px;rotate:45deg;border:1px solid var(--geo);border-radius:24px;opacity:.7}
.geo::after{content:"";position:absolute;inset:16px;border:1px solid var(--geo);border-radius:14px}

.head{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 0 clamp(12px,2.6cqw,20px)}
.head span{font-weight:800;font-size:clamp(12px,1.9cqw,14.5px);letter-spacing:.26em;text-transform:uppercase;text-align:center;
  background:linear-gradient(180deg,#fff6c4,#f0c23e 55%,#c8921a);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.55))}
.head i{position:relative;flex:1;max-width:140px;height:1px;background:linear-gradient(90deg,transparent,var(--ring))}
.head i::after{content:"";position:absolute;right:-3px;top:-2.5px;width:6px;height:6px;rotate:45deg;background:#f6dd85;box-shadow:0 0 6px rgba(255,214,90,.8)}
.head i:last-child{rotate:180deg}

.grid{list-style:none;margin:0;padding:0;display:grid;gap:clamp(10px,2.2cqw,16px);grid-template-columns:minmax(0,1fr)}
.card{--w:46px;position:relative;display:flex;flex-direction:row;align-items:center;gap:11px;padding:13px 12px;text-align:left;
  border-radius:calc(var(--vr) + 5px);background:var(--cardbg);border:1px solid rgba(255,255,255,.07);box-shadow:var(--cardsh);
  transition:translate .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.card::before{content:"";position:absolute;left:14%;right:14%;top:-1px;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,226,140,.75),transparent)}
.card:hover{translate:0 -3px;box-shadow:var(--cardsh-h)}
.well{position:relative;flex:none;display:grid;place-items:center;width:var(--w);height:var(--w);border-radius:50%;
  background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.13),rgba(0,0,0,.4));
  box-shadow:inset 5px 5px 10px rgba(0,0,0,.55),inset -4px -4px 8px rgba(255,255,255,.09),0 0 0 1.5px var(--ring),0 0 0 4px rgba(255,255,255,.05),0 7px 13px rgba(0,0,0,.35)}
.well::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px solid var(--ring);opacity:0;pointer-events:none;
  animation:halo 3.8s ease-out calc(var(--i,0) * .6s) infinite}
.well svg{width:52%;height:52%;overflow:visible;fill:none;stroke:url(#gIcon);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;
  filter:drop-shadow(0 0 5px rgba(255,214,90,.5)) drop-shadow(0 2px 2px rgba(0,0,0,.5))}
.well img{width:78%;height:78%;object-fit:contain;filter:drop-shadow(0 3px 3px rgba(0,0,0,.45))}
.txt{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;flex:1}
.lbl{font-weight:800;font-size:11px;line-height:1.1;letter-spacing:.17em;text-transform:uppercase;color:#f6dd85;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.val{display:flex;align-items:center;font-weight:700;font-size:clamp(15.5px,4.5cqw,18px);line-height:1.25;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);
  overflow-wrap:anywhere;max-width:100%}

/* navidad: los adornos cuelgan sobre el panel → se reserva espacio arriba */
.xm .panel{padding-top:calc(clamp(14px,3.2cqw,26px) + clamp(30px,5.2cqw,46px))}

/* píldora-botón */
.pill{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:7px;max-width:100%;padding:8px 8px 8px 14px;border-radius:999px;
  text-decoration:none;font-weight:800;font-size:clamp(10.5px,3.1cqw,13px);line-height:1;color:#2b1d00;text-shadow:0 1px 0 rgba(255,255,255,.45);white-space:nowrap;cursor:pointer;
  background:linear-gradient(180deg,#fff3b3 0%,#f3c940 46%,#c9921a 100%);border:1px solid rgba(255,255,255,.6);
  box-shadow:0 7px 15px rgba(0,0,0,.45),0 0 0 3px rgba(240,194,62,.18),inset 0 1px 1px rgba(255,255,255,.85),inset 0 -3px 5px rgba(120,70,0,.5);
  transition:translate .2s,filter .2s,box-shadow .2s,scale .15s}
.pill::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 36%,rgba(255,255,255,.7) 50%,transparent 64%);
  translate:-130% 0;animation:sheen 4.4s ease-in-out 1.4s infinite}
.pill:hover{translate:0 -2px;filter:brightness(1.07);box-shadow:0 11px 20px rgba(0,0,0,.5),0 0 0 4px rgba(240,194,62,.28),inset 0 1px 1px rgba(255,255,255,.9),inset 0 -3px 5px rgba(120,70,0,.5)}
.pill:active{scale:.96;translate:0 0}
.pill:focus-visible{outline:2px solid #fff;outline-offset:3px}
.pill>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis}
.pill .arr{flex:none;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#2a1b00;box-shadow:inset 0 1px 2px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.5)}
.pill .arr svg{width:12px;height:12px;fill:none;stroke:#ffe28a;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:translate .2s}
.pill:hover .arr svg{translate:1.5px -1.5px}

/* pantallas anchas: tarjetas verticales en columnas */
@container (min-width:560px){
  .grid{grid-template-columns:repeat(var(--cols,3),minmax(0,1fr))}
  .pill{font-size:clamp(11.5px,1.45cqw,13px);padding:8px 7px 8px 14px;gap:7px}
  .card{--w:72px;flex-direction:column;justify-content:flex-start;gap:14px;padding:22px 10px 20px;text-align:center}
  .txt{align-items:center;gap:8px;flex:1;width:100%}
  .val{justify-content:center;min-height:2.5em;font-size:clamp(15px,2.15cqw,19px)}
}

/* entrada */
.pre .card{opacity:0}
.show .card{animation:rise .8s cubic-bezier(.2,.75,.25,1) calc(var(--i,0) * 130ms) backwards}
@keyframes rise{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:none}}
@keyframes halo{0%{scale:.92;opacity:.75}70%,100%{scale:1.28;opacity:0}}
@keyframes sheen{0%,55%{translate:-130% 0}100%{translate:130% 0}}
@media (prefers-reduced-motion:reduce){
  .orn,.lights g,.snow i,.spark,.well::after,.pill::after,.show .card{animation:none!important}
  .pre .card{opacity:1}
  .snow{display:none}
  .well::after{display:none}
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

  /* ───────────── iconos de línea (24×24) ───────────── */
  const ICONS = {
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    'calendar-check': '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9.2 15.2 2 2 3.8-3.8"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a1.5 1.5 0 0 0 0 4H8.3M16 6h2.5a1.5 1.5 0 0 1 0 4h-2.8"/><path d="M12 13v4M9.5 17h5M8 20.5h8"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.7 13.6 7.5 21l4.5-2.6 4.5 2.6-1.2-7.4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.1"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M17.5 14c2.4.2 3.9 1.9 3.9 4.5"/>',
    ticket: '<path d="M3.5 7.5h17v3.2a1.8 1.8 0 0 0 0 3.6v3.2h-17v-3.2a1.8 1.8 0 0 0 0-3.6z"/><path d="M14 7.5v9" stroke-dasharray="1.6 2"/>',
    phone: '<path d="M5 4h3.5l1.7 4.2-2.2 1.4a11 11 0 0 0 6.4 6.4l1.4-2.2 4.2 1.7V19a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="m4 8 8 6 8-6"/>',
    gift: '<rect x="3.5" y="9.5" width="17" height="10.5" rx="2"/><path d="M3 9.5h18M12 9.5V20"/><path d="M12 9.5C9 9.5 7.5 8 8 6.5s2.5-1.5 4 3c1.5-4.5 4-4.5 4-3s-1 3-4 3z"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
    cross: '<path d="M12 3v18M6.5 8.5h11"/>'
  };
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>';
  const iconSvg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.info}</svg>`;

  /* enlaces seguros: http(s), mailto, tel, rutas relativas, #ancla; "dominio.org" → https://dominio.org */
  function safeHref(h) {
    h = String(h == null ? '' : h).trim();
    if (!h) return '';
    if (/^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#|\?)/i.test(h)) return h;
    if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return '';      // javascript:, data:, etc. → descartado
    return 'https://' + h;
  }
  const hostOf = (h) => h.replace(/^(https?:\/\/|mailto:|tel:)/i, '').replace(/\/$/, '');


  /* ───────────── componente ───────────── */
  class InfoGlassFrame extends HTMLElement {
    static get observedAttributes() {
      return ['theme', 'heading', 'alt', 'columns', 'max-width', 'breakpoint', 'animate', 'items',
        'decor', 'ornaments', 'lights', 'snow', 'decor-scale'];
    }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._io = null;
      this._mo = null;
      this._mq = null;
      this._bp = null;
      this._shown = false;
      this._renderScheduled = false;
      this._onMq = () => this._schedule();
    }
    connectedCallback() {
      if (typeof MutationObserver !== 'undefined') {
        this._mo = new MutationObserver(() => this._schedule());   // detecta <info-item> agregados / cambiados
        this._mo.observe(this, { childList: true, subtree: true, attributes: true, characterData: true });
      }
      this._schedule();
    }
    disconnectedCallback() {
      if (this._mo) { this._mo.disconnect(); this._mo = null; }
      if (this._mq) { this._mq.removeEventListener('change', this._onMq); this._mq = null; this._bp = null; }
      if (this._io) { this._io.disconnect(); this._io = null; }
    }
    attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this._schedule(); }

    /* API pública */
    get items() { return this._readItems(); }
    replay() { this._shown = false; this._schedule(); }

    _schedule() {
      if (this._renderScheduled) return;
      this._renderScheduled = true;
      Promise.resolve().then(() => { this._renderScheduled = false; if (this.isConnected) this._render(); });
    }

    _readItems() {
      const out = [];
      const push = (o) => {
        const label = String(o.label == null ? '' : o.label).trim();
        const href = safeHref(o.href);
        let value = String(o.value == null ? '' : o.value).trim();
        if (!value && href) value = hostOf(href);
        if (!label && !value) return;
        out.push({ label, value, href, img: String(o.img || '').trim(), icon: String(o.icon || '').trim().toLowerCase() });
      };
      const json = this.getAttribute('items');
      if (json) { try { const a = JSON.parse(json); if (Array.isArray(a)) a.forEach((o) => o && typeof o === 'object' && push(o)); } catch (_) { /* JSON inválido: se ignora */ } }
      Array.from(this.children).forEach((el) => {
        if (el.localName !== 'info-item') return;
        const v = el.getAttribute('value');
        push({ label: el.getAttribute('label'), value: v != null ? v : el.textContent, icon: el.getAttribute('icon'), img: el.getAttribute('img'), href: el.getAttribute('href') });
      });
      return out.slice(0, 12);
    }

    _config() {
      const g = (n, d = '') => { const v = this.getAttribute(n); return v == null ? d : v.trim(); };
      const off = (n) => { const v = g(n).toLowerCase(); return v === 'off' || v === 'false' || v === '0'; };
      const theme = ['gold', 'christmas'].includes(g('theme').toLowerCase()) ? g('theme').toLowerCase() : 'gold';
      let mw = g('max-width', '860px'); if (/^\d+(\.\d+)?$/.test(mw)) mw += 'px';
      const ds = Math.min(2, Math.max(.5, parseFloat(g('decor-scale', '1')) || 1));
      const items = this._readItems();
      const cols = parseInt(g('columns'), 10);
      return {
        theme, mw, ds, items,
        cols: cols > 0 ? Math.min(cols, 6) : Math.min(3, Math.max(1, items.length)),
        bp: parseInt(g('breakpoint'), 10) || 769,
        heading: g('heading'),
        alt: g('alt') || g('heading'),
        animate: !off('animate'),
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

    _card(it, i) {
      const icon = it.icon && ICONS[it.icon] ? it.icon : (it.href ? 'globe' : 'info');
      const art = it.img ? `<img src="${esc(it.img)}" alt="" decoding="async" loading="lazy">` : iconSvg(icon);
      const ext = /^https?:/i.test(it.href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      const aria = esc(it.label ? `${it.label}: ${it.value}` : it.value);
      const val = it.href
        ? `<a class="pill" part="pill" href="${esc(it.href)}"${ext} aria-label="${aria}"><span>${esc(it.value)}</span><span class="arr">${ARROW}</span></a>`
        : esc(it.value);
      return `<li class="card" part="card" style="--i:${i}"><div class="well" part="icon" aria-hidden="true">${art}</div>` +
        `<div class="txt">${it.label ? `<span class="lbl" part="label">${esc(it.label)}</span>` : ''}<span class="val" part="value">${val}</span></div></li>`;
    }

    _render() {
      if (this._io) { this._io.disconnect(); this._io = null; }
      const c = this._c = this._config();
      this._bindMq(c.bp);
      const mobile = !this._mq.matches;
      const e = c.theme === 'christmas' ? christmasDecor(c, mobile) : goldDecor(c);
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      const pre = c.animate && !reduce && !this._shown && typeof IntersectionObserver !== 'undefined';
      const head = c.heading ? `<div class="head" part="heading"><i></i><span>${esc(c.heading)}</span><i></i></div>` : '';
      this.shadowRoot.innerHTML =
        `<style>${CSS}</style>${DEFS}` +
        `<div class="cq t-${c.theme}${pre ? ' pre' : ''}${c.theme === 'christmas' && c.decor && c.ornaments ? ' xm' : ''}" style="--max-w:${esc(c.mw)};--lift-u:${e.liftU};--ds:${c.ds};--cols:${c.cols}">` +
        `<div class="pad"><div class="holder" part="holder">` +
        `<div class="frame" part="frame"><div class="glass" part="glass">` +
        `<div class="panel" part="panel" role="group"${c.alt ? ` aria-label="${esc(c.alt)}"` : ''}><span class="geo" aria-hidden="true"></span>${head}` +
        `<ul class="grid">${c.items.map((it, i) => this._card(it, i)).join('')}</ul></div>${e.snow}</div></div>` +
        `${e.lights}${e.snowcap}${e.top}${e.canes}${e.sparks}` +
        `</div></div></div>`;
      if (pre) this._observe();
    }

    _observe() {
      const root = this.shadowRoot.querySelector('.cq');
      const holder = this.shadowRoot.querySelector('.holder');
      if (!root || !holder) return;
      this._io = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        this._shown = true;
        root.classList.remove('pre'); root.classList.add('show');
        this._io.disconnect(); this._io = null;
      }, { threshold: .2 });
      this._io.observe(holder);
    }
  }

  customElements.define(TAG, InfoGlassFrame);
})();
