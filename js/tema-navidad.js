/*! Tema Navidad — adornos en canvas (vanilla JS, sin dependencias)
 *
 *  Qué hace (solo mientras <html> tenga la clase "tema-navidad"):
 *    · Header: polvo de estrellas + bolas, campanas, estrellas y muérdago
 *      colgando de la tira, balanceándose como péndulos.
 *    · Footer: polvo de estrellas + adornos colgando del borde superior.
 *    · Cambia el logo del navbar por el navideño (y lo restaura al desactivar).
 *
 *  Al quitar la clase se elimina todo (canvas, animación y logo): vuelve el estándar.
 *
 *  Opciones (opcionales, ANTES de cargar este script):
 *    <script>window.TEMA_NAVIDAD = { logo: './logos/logo-navidad.png' };</script>
 *
 *  Activación automática por fechas (opcional): agregar al <html>
 *    data-navidad-auto                      → del 8-dic al 6-ene, todos los años
 *    data-navidad-auto="12-08/01-06"        → rango anual MM-DD/MM-DD
 *    data-navidad-auto="2026-12-08/2027-01-06"  → fechas exactas
 *
 *  Cuidado del rendimiento: tope de 2× de resolución, pocas partículas en
 *  pantallas chicas, se dibuja solo lo visible y respeta "reducir movimiento"
 *  (en ese caso dibuja un cuadro estático y no anima).
 */
(function () {
  'use strict';

  var CLS = 'tema-navidad';
  var CFG = window.TEMA_NAVIDAD || {};
  var LOGO = CFG.logo || './logos/logo-navidad.png';
  var HANG = 72;                          // alto extra bajo la tira para los adornos colgantes (px)
  var TAU = Math.PI * 2;

  var root = document.documentElement;
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  var layers = [];
  var active = false, raf = 0, last = 0, T = 0;
  var ro = null, io = null, resizeTimer = 0;

  /* ───────────── utilidades ───────────── */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Aclara (amt > 0) u oscurece (amt < 0) un color #rrggbb
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /* ───────────── capas (una por contenedor) ───────────── */
  function makeLayer(host, kind) {
    var canvas = document.createElement('canvas');
    canvas.className = 'tn-canvas tn-canvas--' + kind;
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    return {
      kind: kind, host: host, canvas: canvas, ctx: canvas.getContext('2d'),
      w: 0, h: 0, barH: 0, dustH: 0, dust: [], items: [], visible: true
    };
  }

  function sizeLayer(L) {
    var w = L.host.clientWidth;
    var hostH = L.host.clientHeight;
    if (!w || !hostH) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var h = hostH + (L.kind === 'header' ? HANG : 0);

    L.w = w; L.h = h;
    L.barH = L.kind === 'header' ? hostH : 0;
    L.dustH = L.kind === 'header' ? hostH + 14 : hostH;

    L.canvas.style.width = w + 'px';
    L.canvas.style.height = h + 'px';
    L.canvas.width = Math.round(w * dpr);
    L.canvas.height = Math.round(h * dpr);
    L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    seed(L);
  }

  /* ───────────── polvo de estrellas ───────────── */
  var DUST_COLORS = ['255,250,235', '255,226,140', '255,205,210', '255,255,255'];

  function newDust(L, anywhere) {
    var sparkle = Math.random() < 0.16;
    return {
      x: rnd(0, L.w),
      y: anywhere ? rnd(0, L.dustH) : -6,
      r: sparkle ? rnd(2.6, 5) : rnd(0.6, 2),
      vy: rnd(3, 11),                     // px/s: cae muy despacio
      vx: rnd(-2, 3),
      sw: rnd(0.4, 1.4),                  // frecuencia del vaivén
      sa: rnd(2, 9),                      // amplitud del vaivén (px)
      ph: rnd(0, TAU),
      tw: rnd(1.2, 3.4),                  // velocidad del titilar
      c: pick(DUST_COLORS),
      sp: sparkle
    };
  }

  function stepDust(L, dt) {
    for (var i = 0; i < L.dust.length; i++) {
      var d = L.dust[i];
      d.y += d.vy * dt;
      d.x += d.vx * dt;
      if (d.y > L.dustH + 6 || d.x < -10 || d.x > L.w + 10) L.dust[i] = newDust(L, false);
    }
  }

  function sparkle(c, x, y, r, a, col) {
    // halo suave
    var g = c.createRadialGradient(x, y, 0, x, y, r * 2.2);
    g.addColorStop(0, 'rgba(' + col + ',' + (a * 0.55).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r * 2.2, 0, TAU); c.fill();
    // estrella de 4 puntas
    var k = r * 1.7, q = r * 0.18;
    c.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
    c.beginPath();
    c.moveTo(x, y - k);
    c.quadraticCurveTo(x + q, y - q, x + k, y);
    c.quadraticCurveTo(x + q, y + q, x, y + k);
    c.quadraticCurveTo(x - q, y + q, x - k, y);
    c.quadraticCurveTo(x - q, y - q, x, y - k);
    c.fill();
  }

  function drawDust(L) {
    var c = L.ctx;
    c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < L.dust.length; i++) {
      var d = L.dust[i];
      var tw = 0.5 + 0.5 * Math.sin(T * d.tw + d.ph);
      var a = (d.sp ? 0.9 : 0.65) * tw;
      if (a < 0.03) continue;
      var x = d.x + Math.sin(T * d.sw + d.ph) * d.sa;
      if (d.sp) {
        sparkle(c, x, d.y, d.r, a, d.c);
      } else {
        c.fillStyle = 'rgba(' + d.c + ',' + a.toFixed(3) + ')';
        c.beginPath(); c.arc(x, d.y, d.r, 0, TAU); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over';
  }

  /* ───────────── adornos ───────────── */
  var BAUBLE_COLORS = ['#d32f2f', '#f2c14e', '#2e7d32', '#e8e1c9', '#b71c1c'];   // rojo, oro, verde, marfil, granate
  var TYPE_CYCLE = ['bauble', 'star', 'bell', 'bauble', 'bell', 'star', 'bauble'];

  function makeItem(x, y0, type, maxLen) {
    var s = type === 'star' ? rnd(9, 12.5) : type === 'bell' ? rnd(8, 10.5) : rnd(8, 11.5);
    var hgt = type === 'bauble' ? s * 2 + 4 : type === 'bell' ? s * 1.5 + 4 : s * 1.95;
    return {
      t: type, x: x, y: y0, s: s,
      len: rnd(6, Math.max(8, maxLen - hgt - 6)),
      col: pick(BAUBLE_COLORS),
      amp: rnd(0.07, 0.16), w: rnd(1.0, 1.7), ph: rnd(0, TAU), tw: rnd(1.5, 3)
    };
  }

  function makeMistletoe(x, y0, dir) {
    return { t: 'mistletoe', x: x, y: y0, s: 1.2, len: 3, col: null, amp: 0.06, w: 1.1, ph: dir > 0 ? 0.6 : 2.4, tw: 1 };
  }

  function buildItems(L) {
    var items = [], i, x, w = L.w;

    if (L.kind === 'header') {
      var y0 = L.barH - 2;
      var mx = clamp(w * 0.035, 26, 70);
      var n = clamp(Math.floor(w / 105), 4, 11);
      for (i = 0; i < n; i++) {
        x = (i + 0.5) / n * w + rnd(-0.25, 0.25) * (w / n);
        if (Math.abs(x - mx) < 48 || Math.abs(x - (w - mx)) < 48) continue;   // no pisar el muérdago
        items.push(makeItem(x, y0, TYPE_CYCLE[i % TYPE_CYCLE.length], HANG - 8));
      }
      items.push(makeMistletoe(mx, y0, 1));
      items.push(makeMistletoe(w - mx, y0, -1));
    } else {
      // Footer: adornos cortos colgando del borde superior, fuera de la zona central del isotipo
      var keep = w < 900 ? 170 : 200;
      var fr = [0.05, 0.12, 0.2, 0.28, 0.72, 0.8, 0.88, 0.95];
      for (i = 0; i < fr.length; i++) {
        x = fr[i] * w;
        if (Math.abs(x - w / 2) < keep || x < 44 || x > w - 44) continue;
        items.push(makeItem(x, 1, TYPE_CYCLE[(i + 1) % TYPE_CYCLE.length], 56));
      }
      items.push(makeMistletoe(Math.min(26, w * 0.05), 1, 1));
      items.push(makeMistletoe(w - Math.min(26, w * 0.05), 1, -1));
    }
    return items;
  }

  function seed(L) {
    var small = L.w < 600;
    var area = L.w * L.dustH;
    var n = Math.round(area / (L.kind === 'header' ? 4200 : 8500) * (small ? 0.7 : 1));
    n = clamp(n, 12, L.kind === 'header' ? 110 : 130);
    L.dust = [];
    for (var i = 0; i < n; i++) L.dust.push(newDust(L, true));
    L.items = buildItems(L);
  }

  /* ───── dibujo de cada adorno (origen = punta del hilo, eje +y hacia abajo) ───── */
  function drawBauble(c, r, col) {
    var cy = 3 + r;
    c.fillStyle = '#d4af37';                              // casquillo dorado
    c.fillRect(-2.2, 0, 4.4, 3.4);
    var g = c.createRadialGradient(-r * 0.35, cy - r * 0.35, r * 0.1, 0, cy, r);
    g.addColorStop(0, shade(col, 0.55));
    g.addColorStop(0.5, col);
    g.addColorStop(1, shade(col, -0.45));
    c.fillStyle = g;
    c.beginPath(); c.arc(0, cy, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,236,170,.75)';              // franja dorada
    c.lineWidth = 1.1;
    c.beginPath(); c.ellipse(0, cy, r * 0.98, r * 0.38, 0, 0.15, Math.PI - 0.15); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)';                 // reflejo
    c.beginPath(); c.ellipse(-r * 0.38, cy - r * 0.4, r * 0.2, r * 0.12, -0.6, 0, TAU); c.fill();
  }

  function drawBell(c, s) {
    c.strokeStyle = '#d4af37'; c.lineWidth = 1.2;         // anilla
    c.beginPath(); c.arc(0, 1.6, 1.6, 0, TAU); c.stroke();
    c.save();
    c.translate(0, 3.2);
    var g = c.createLinearGradient(-s, 0, s, 0);
    g.addColorStop(0, '#8a6a14'); g.addColorStop(0.35, '#f6d77a');
    g.addColorStop(0.62, '#d4af37'); g.addColorStop(1, '#8a6a14');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-s * 0.28, 0);
    c.bezierCurveTo(-s * 0.45, s * 0.1, -s * 0.5, s * 0.7, -s * 0.95, s * 1.05);
    c.lineTo(s * 0.95, s * 1.05);
    c.bezierCurveTo(s * 0.5, s * 0.7, s * 0.45, s * 0.1, s * 0.28, 0);
    c.closePath(); c.fill();
    c.fillStyle = '#9c7a1c';                              // borde inferior
    c.beginPath(); c.ellipse(0, s * 1.05, s * 0.95, s * 0.2, 0, 0, TAU); c.fill();
    c.fillStyle = '#b8902a';                              // badajo
    c.beginPath(); c.arc(0, s * 1.3, s * 0.2, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 0.8;   // brillo
    c.beginPath(); c.moveTo(-s * 0.25, s * 0.2); c.quadraticCurveTo(-s * 0.4, s * 0.6, -s * 0.62, s * 0.9); c.stroke();
    c.fillStyle = '#c62828';                              // moñito
    c.beginPath(); c.moveTo(0, 0.5); c.lineTo(-3.4, -1.6); c.lineTo(-3.4, 2.6); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, 0.5); c.lineTo(3.4, -1.6); c.lineTo(3.4, 2.6); c.closePath(); c.fill();
    c.restore();
  }

  function drawStar(c, R, it) {
    var cy = R, i, a, rad;
    // halo que titila
    var gl = 0.22 + 0.18 * Math.sin(T * it.tw + it.ph);
    c.globalCompositeOperation = 'lighter';
    var hg = c.createRadialGradient(0, cy, 0, 0, cy, R * 2.3);
    hg.addColorStop(0, 'rgba(255,224,130,' + gl.toFixed(3) + ')');
    hg.addColorStop(1, 'rgba(255,224,130,0)');
    c.fillStyle = hg;
    c.beginPath(); c.arc(0, cy, R * 2.3, 0, TAU); c.fill();
    c.globalCompositeOperation = 'source-over';
    // estrella de 5 puntas
    c.beginPath();
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + i * Math.PI / 5;
      rad = (i % 2 === 0) ? R : R * 0.46;
      var px = Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    var g = c.createRadialGradient(0, cy, 0, 0, cy, R);
    g.addColorStop(0, '#fff3b0'); g.addColorStop(0.6, '#f2c14e'); g.addColorStop(1, '#b8902a');
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(120,85,10,.6)'; c.lineWidth = 0.6; c.stroke();
  }

  function leaf(c, x, y, rot, len, wid) {
    c.save();
    c.translate(x, y); c.rotate(rot);
    var g = c.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, '#86c872'); g.addColorStop(1, '#2f7a35');
    c.fillStyle = g;
    c.beginPath(); c.ellipse(0, len / 2, wid, len / 2, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(20,70,30,.5)'; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(0, 1); c.lineTo(0, len - 2); c.stroke();
    c.restore();
  }

  function berry(c, x, y, r) {
    var g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4ddc0');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(120,100,60,.55)';
    c.beginPath(); c.arc(x + r * 0.15, y + r * 0.55, r * 0.22, 0, TAU); c.fill();
  }

  function drawMistletoe(c) {
    c.lineCap = 'round';
    c.strokeStyle = '#4e7a2a'; c.lineWidth = 1.4;         // tallo
    c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(2, 14, 0, 30); c.stroke();
    leaf(c, 0, 5, 0.75, 12, 3.2);   leaf(c, 0, 5, -0.75, 12, 3.2);
    leaf(c, 0, 14, 0.7, 15, 3.8);   leaf(c, 0, 14, -0.7, 15, 3.8);
    leaf(c, 0, 23, 0.8, 12, 3.2);   leaf(c, 0, 23, -0.8, 12, 3.2);
    leaf(c, 0, 29, 0, 10, 3);
    berry(c, -2.8, 27, 2.5); berry(c, 3, 28.5, 2.5); berry(c, 0.2, 31.5, 2.5);   // perlas del muérdago
    // lazo rojo en la parte alta
    c.fillStyle = '#c62828';
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-9, -5, -10, 5, 0, 2); c.fill();
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(9, -5, 10, 5, 0, 2); c.fill();
    c.beginPath(); c.moveTo(-1, 2); c.lineTo(-5, 11); c.lineTo(-2, 9.5); c.lineTo(0, 12); c.lineTo(1, 2); c.fill();
    c.fillStyle = '#8e1414';
    c.beginPath(); c.arc(0, 1, 2, 0, TAU); c.fill();
  }

  // Péndulo: el hilo cuelga del ancla y el adorno se orienta siguiendo el hilo
  function drawItem(c, it) {
    var th = it.amp * Math.sin(T * it.w + it.ph);
    var ex = it.x + Math.sin(th) * it.len;
    var ey = it.y + Math.cos(th) * it.len;

    if (it.t !== 'mistletoe') {
      c.strokeStyle = 'rgba(255,236,170,.75)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(it.x, it.y); c.lineTo(ex, ey); c.stroke();
    }
    c.save();
    c.translate(ex, ey);
    c.rotate(-th);
    if (it.t === 'bauble') drawBauble(c, it.s, it.col);
    else if (it.t === 'bell') drawBell(c, it.s);
    else if (it.t === 'star') drawStar(c, it.s, it);
    else { c.scale(it.s, it.s); drawMistletoe(c); }
    c.restore();
  }

  /* ───────────── render / loop ───────────── */
  function render(L) {
    var c = L.ctx;
    c.clearRect(0, 0, L.w, L.h);
    drawDust(L);
    for (var i = 0; i < L.items.length; i++) drawItem(c, L.items[i]);
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((ts - last) / 1000, 0.1);
    last = ts;
    T += dt;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      if (!L.visible) continue;
      stepDust(L, dt);
      render(L);
    }
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      layers.forEach(sizeLayer);
      if (mqReduce.matches) layers.forEach(render);
    }, 120);
  }

  /* ───────────── logo ───────────── */
  function logoImg() { return document.querySelector('.navbar-brand img.logo'); }

  function swapLogo(on) {
    var img = logoImg();
    if (!img) return;
    if (on) {
      if (!img.hasAttribute('data-logo-original')) img.setAttribute('data-logo-original', img.getAttribute('src'));
      img.addEventListener('error', onLogoError);
      img.src = LOGO;
    } else if (img.hasAttribute('data-logo-original')) {
      img.removeEventListener('error', onLogoError);
      img.src = img.getAttribute('data-logo-original');
      img.removeAttribute('data-logo-original');
    }
  }
  function onLogoError() {                                // si el PNG navideño no existe, vuelve el logo de siempre
    var img = logoImg();
    if (img && img.hasAttribute('data-logo-original')) swapLogo(false);
  }

  /* ───────────── start / stop ───────────── */
  function start() {
    if (active) return;
    active = true;

    var cab = document.querySelector('.cabecera');
    var ft = document.querySelector('footer.footer, .footer');
    if (cab) layers.push(makeLayer(cab, 'header'));
    if (ft) layers.push(makeLayer(ft, 'footer'));
    layers.forEach(sizeLayer);

    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(onResize);
      layers.forEach(function (L) { ro.observe(L.host); });
    } else {
      window.addEventListener('resize', onResize);
    }
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          layers.forEach(function (L) { if (L.host === e.target) L.visible = e.isIntersecting; });
        });
      });
      layers.forEach(function (L) { io.observe(L.host); });
    }

    var pre = new Image(); pre.src = LOGO;                // precarga para evitar parpadeo
    swapLogo(true);

    if (mqReduce.matches) {
      T = 1.2;
      layers.forEach(render);                             // cuadro estático
    } else {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function stop() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimer);
    if (ro) { ro.disconnect(); ro = null; }
    if (io) { io.disconnect(); io = null; }
    window.removeEventListener('resize', onResize);
    layers.forEach(function (L) { if (L.canvas.parentNode) L.canvas.parentNode.removeChild(L.canvas); });
    layers = [];
    swapLogo(false);
  }

  function sync() {
    if (root.classList.contains(CLS)) start(); else stop();
  }

  /* ───────────── activación automática por fechas (opcional) ───────────── */
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function autoByDate() {
    var a = root.getAttribute('data-navidad-auto');
    if (a === null) return;
    var parts = (a || '12-08/01-06').split('/');
    if (parts.length !== 2) return;
    var now = new Date();
    var ymd = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    var md = ymd.slice(5);
    var on;
    if (parts[0].length === 10) {                         // fechas exactas
      on = ymd >= parts[0] && ymd <= parts[1];
    } else if (parts[0] <= parts[1]) {                    // rango anual dentro del mismo año
      on = md >= parts[0] && md <= parts[1];
    } else {                                              // rango anual que cruza fin de año
      on = md >= parts[0] || md <= parts[1];
    }
    root.classList.toggle(CLS, on);
  }

  function init() {
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
    autoByDate();
    setInterval(autoByDate, 3600000);                     // por si la página queda abierta al cambiar de día
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
