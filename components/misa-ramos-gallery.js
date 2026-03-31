/**
 * <misa-ramos-gallery>  — v5
 * Shadow DOM · totalmente aislado del CSS de la plataforma.
 *
 * ══════════════════════════════════════════════════════════
 *  ATRIBUTOS
 * ══════════════════════════════════════════════════════════
 *  base-path      ruta carpeta de fotos        (default: './actividades/ramos/')
 *  mascot-src     imagen mascota               (default: './actividades/photo.png')
 *  particle-src   PNG que flota de fondo       (default: '' → estrellitas)
 *  width          ancho en desktop             (default: '80%')
 *  total          cantidad de fotos            (default: 9)
 *
 *  ── TEMAS PREDEFINIDOS ──────────────────────────────────
 *  theme          nombre del tema              (ver lista abajo)
 *
 *  Temas disponibles:
 *    violeta-dorado   (default) Semana Santa, Ramos
 *    verde-dorado              Navidad, naturaleza
 *    rojo-dorado               Pascua, Pentecostés
 *    azul-plateado             Adviento, Virgen
 *    blanco-dorado             Primera Comunión, bodas
 *
 *  ── COLORES CUSTOM ──────────────────────────────────────
 *  color1         color primario  (ej: '#7c3aed')
 *  color2         color secundario(ej: '#c9a84c')
 *
 *  Nota: color1/color2 tienen prioridad sobre theme.
 *        Si pasás solo color1, color2 queda como dorado.
 *
 * ══════════════════════════════════════════════════════════
 *  USO RÁPIDO
 * ══════════════════════════════════════════════════════════
 *  <!-- Tema predefinido -->
 *  <misa-ramos-gallery theme="rojo-dorado" width="75%"></misa-ramos-gallery>
 *
 *  <!-- Colores custom -->
 *  <misa-ramos-gallery color1="#0d4f8c" color2="#a8d8ea" width="80%"></misa-ramos-gallery>
 *
 *  <!-- Todos los parámetros -->
 *  <misa-ramos-gallery
 *    base-path="./actividades/ramos/"
 *    mascot-src="./actividades/photo.png"
 *    particle-src="./img/cam.png"
 *    theme="verde-dorado"
 *    width="80%">
 *  </misa-ramos-gallery>
 */

// ─────────────────────────────────────────────────────────
//  TABLA DE TEMAS
//  Cada tema define: bg1/bg2/bg3 (fondo oscuro), c1/c2 (colores), light (texto)
// ─────────────────────────────────────────────────────────
const THEMES = {
  'violeta-dorado': {
    // Fondo: violeta oscuro profundo
    bg1: [38, 10, 60],   bg2: [18, 5, 35],    bg3: [28, 8, 48],
    // Colores primario / secundario
    c1:  [180,100,255],  c2:  [201,168, 76],
    // Color texto título
    titleLight: '#fdf6e3',
    // Shimmer del <em>
    shimmer: ['#f0d080','#e8b8ff','#f0d080'],
  },
  'verde-dorado': {
    bg1: [8,  40, 20],   bg2: [4,  22, 10],   bg3: [6,  32, 16],
    c1:  [72, 199,120],  c2:  [201,168, 76],
    titleLight: '#f0fdf4',
    shimmer: ['#f0d080','#86efac','#f0d080'],
  },
  'rojo-dorado': {
    bg1: [55, 10,  8],   bg2: [30,  4,  4],   bg3: [44,  8,  6],
    c1:  [239, 68, 68],  c2:  [201,168, 76],
    titleLight: '#fff5f5',
    shimmer: ['#f0d080','#fca5a5','#f0d080'],
  },
  'azul-plateado': {
    bg1: [8,  20, 55],   bg2: [4,  10, 30],   bg3: [6,  16, 44],
    c1:  [99, 179,237],  c2:  [203,213,225],
    titleLight: '#f0f8ff',
    shimmer: ['#e2e8f0','#93c5fd','#e2e8f0'],
  },
  'blanco-dorado': {
    bg1: [30, 26, 18],   bg2: [18, 15, 10],   bg3: [24, 20, 14],
    c1:  [245,237,210],  c2:  [201,168, 76],
    titleLight: '#fffdf5',
    shimmer: ['#f0d080','#fdf8e8','#f0d080'],
  },
};

// Convierte [r,g,b] a string css
const rgb  = (c, a=1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
// Hexadecimal → [r,g,b]
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16)] : null;
}
// Mezclar color con negro para crear fondos oscuros
function darken(c, factor=0.15) {
  return [Math.round(c[0]*factor), Math.round(c[1]*factor), Math.round(c[2]*factor)];
}

class MisaRamosGallery extends HTMLElement {
  connectedCallback() {

    // ── Leer atributos ──────────────────────────────────
    const basePath    = this.getAttribute('base-path')    || './actividades/ramos/';
    const mascotSrc   = this.getAttribute('mascot-src')   || './actividades/photo.png';
    const particleSrc = this.getAttribute('particle-src') || '';
    const widthVal    = this.getAttribute('width')        || '80%';
    const total       = parseInt(this.getAttribute('total') || '9', 10);
    const themeName   = this.getAttribute('theme')        || 'violeta-dorado';
    const customC1    = this.getAttribute('color1')       || null;
    const customC2    = this.getAttribute('color2')       || null;
    const captions    = ['Procesión','Bendición','Comunidad','Palmas','Celebración',
                         'Fe','Oración','Ramos','Alegría'];

    // ── Resolver paleta ─────────────────────────────────
    // Prioridad: color1/color2 custom > theme > default violeta-dorado
    let palette = THEMES[themeName] || THEMES['violeta-dorado'];

    if (customC1 || customC2) {
      const c1 = customC1 ? (hexToRgb(customC1) || palette.c1) : palette.c1;
      const c2 = customC2 ? (hexToRgb(customC2) || palette.c2) : palette.c2;
      palette = {
        bg1: darken(c1, 0.18), bg2: darken(c1, 0.09), bg3: darken(c1, 0.14),
        c1, c2,
        titleLight: '#fdf6e3',
        shimmer: [
          `rgb(${c2[0]},${c2[1]},${c2[2]})`,
          `rgb(${c1[0]},${c1[1]},${c1[2]})`,
          `rgb(${c2[0]},${c2[1]},${c2[2]})`,
        ],
      };
    }

    const { bg1, bg2, bg3, c1, c2, titleLight, shimmer } = palette;

    // ── Shadow DOM ──────────────────────────────────────
    const shadow = this.attachShadow({ mode: 'open' });

    const gridItems = Array.from({ length: total }, (_, i) => `
      <div class="photo-item pi${i+1}" data-idx="${i}">
        <div class="photo-frame">
          <div class="photo-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i]||`Foto ${i+1}`}" loading="lazy"/>
          </div>
          <div class="photo-caption">${captions[i]||`Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    const carouselItems = Array.from({ length: total }, (_, i) => `
      <div class="cr-slide" data-idx="${i}">
        <div class="cr-frame">
          <div class="cr-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i]||`Foto ${i+1}`}" loading="lazy"/>
          </div>
          <div class="cr-caption">${captions[i]||`Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    // ── CSS con variables de tema inyectadas ─────────────
    shadow.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :host {
    display: block;
    width: ${widthVal};
    max-width: 1280px;
    margin: 36px auto;
    font-family: 'Playfair Display', Georgia, serif;
    position: relative;
  }
  @media (max-width: 768px) { :host { width: 95% !important; } }

  /* ══════════════════════════════════════
     CARD — glasmorfismo con paleta dinámica
  ══════════════════════════════════════ */
  .ramos-card {
    position: relative;
    border-radius: 32px;
    overflow: hidden;
    background: linear-gradient(145deg,
      ${rgb(bg1,0.94)} 0%,
      ${rgb(bg2,0.97)} 40%,
      ${rgb(bg3,0.95)} 70%,
      ${rgb(bg2,0.98)} 100%
    );
    backdrop-filter: blur(32px) saturate(1.6) brightness(1.05);
    -webkit-backdrop-filter: blur(32px) saturate(1.6) brightness(1.05);
    border: 1.5px solid transparent;
    background-clip: padding-box;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.65),
      0 12px 32px  rgba(0,0,0,0.45),
      0 0 60px  ${rgb(c1,0.18)},
      0 0 120px ${rgb(c2,0.10)},
      inset 0  1px 0 ${rgb(c2,0.35)},
      inset 0 -1px 0 ${rgb(c1,0.20)},
      inset  1px 0 0 ${rgb(c1,0.12)},
      inset -1px 0 0 ${rgb(c2,0.08)};
  }

  /* Borde degradado c1→c2→c1 */
  .ramos-card::before {
    content: '';
    position: absolute; inset: 0;
    border-radius: 32px; padding: 1.5px;
    background: linear-gradient(135deg,
      ${rgb(c1,0.70)}  0%,
      ${rgb(c2,0.90)} 35%,
      ${rgb(c2,1.00)} 50%,
      ${rgb(c2,0.90)} 65%,
      ${rgb(c1,0.60)} 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none; z-index: 5;
  }

  /* Blobs de luz interior */
  .ramos-card::after {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 15%   0%, ${rgb(c1,0.20)} 0%, transparent 55%),
      radial-gradient(ellipse at 85% 100%, ${rgb(c2,0.18)} 0%, transparent 55%),
      radial-gradient(ellipse at 50%  50%, ${rgb(bg1,0.08)} 0%, transparent 70%);
    pointer-events: none; z-index: 1;
  }

  #particleCanvas {
    position:absolute; inset:0; width:100%; height:100%;
    pointer-events:none; z-index:2; border-radius:32px; opacity:0.60;
  }

  /* ── HEADER ── */
  .card-header {
    position:relative; z-index:10; text-align:center;
    padding:36px 28px 24px;
    border-bottom: 1px solid ${rgb(c2,0.18)};
  }
  .card-header::before {
    content:''; display:block; width:120px; height:2px;
    margin:0 auto 22px;
    background: linear-gradient(90deg,
      ${rgb(c1,0)} 0%, ${rgb(c1,1)} 30%,
      ${rgb(c2,1)} 50%, ${rgb(c2,1)} 70%,
      ${rgb(c2,0)} 100%
    );
    border-radius:2px;
  }
  .mascot-wrap { display:flex; justify-content:center; margin-bottom:14px; }
  .mascot-wrap img {
    width:84px; height:84px;
    object-fit:contain; object-position:center bottom;
    filter:
      drop-shadow(0 0 18px ${rgb(c1,0.70)})
      drop-shadow(0 0  8px ${rgb(c2,0.60)})
      drop-shadow(0 6px 14px rgba(0,0,0,0.55));
    animation: mascotEntrance 0.9s cubic-bezier(0.34,1.56,0.64,1) both,
               mascotBob      3.8s 0.9s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes mascotEntrance {
    from { opacity:0; transform:translateY(32px) scale(0.6) rotate(-8deg); }
    to   { opacity:1; transform:translateY(0)    scale(1)   rotate(0deg);  }
  }
  @keyframes mascotBob {
    0%,100% { transform:translateY(0)    rotate( 0deg); }
    25%     { transform:translateY(-6px) rotate(-2deg); }
    75%     { transform:translateY(-3px) rotate( 2deg); }
  }
  .card-eyebrow {
    font-size:0.70rem; letter-spacing:0.40em; text-transform:uppercase;
    font-style:italic; color:${rgb(c2,0.80)}; margin-bottom:10px;
    animation:fadeUp 0.7s 0.3s ease both;
  }
  .card-title {
    font-size:clamp(1.7rem,3.8vw,3rem); font-weight:700; line-height:1.1;
    color:${titleLight};
    text-shadow: 0 0 40px ${rgb(c1,0.50)}, 0 2px 20px ${rgb(c2,0.40)};
    animation:fadeUp 0.7s 0.45s ease both;
  }
  .card-title em {
    font-style:italic;
    background:linear-gradient(90deg,${shimmer[0]},${shimmer[1]},${shimmer[2]});
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; background-size:200%;
    animation:shimmer 4s 1.4s linear infinite;
  }
  @keyframes shimmer {
    0%   { background-position:200% center; }
    100% { background-position:-200% center; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .card-rule {
    width:80px; height:1px;
    background:linear-gradient(90deg,
      transparent,${rgb(c1,0.8)},${rgb(c2,1)},${rgb(c1,0.8)},transparent
    );
    margin:16px auto 0;
    animation:fadeUp 0.7s 0.6s ease both;
  }

  /* ── BODY ── */
  .card-body { position:relative; z-index:10; padding:38px 30px 38px; }

  /* ══════════════════════════════
     DESKTOP — grid exposición
  ══════════════════════════════ */
  .photo-grid {
    display:grid; grid-template-columns:repeat(12,1fr);
    grid-auto-rows:72px; gap:14px;
  }
  .pi1{grid-column:1/5; grid-row:1/5;  --rot:-2.5deg;}
  .pi2{grid-column:5/9; grid-row:1/4;  --rot: 1.8deg;}
  .pi3{grid-column:9/13;grid-row:1/5;  --rot:-1.2deg;}
  .pi4{grid-column:1/4; grid-row:5/9;  --rot: 2.3deg;}
  .pi5{grid-column:4/9; grid-row:4/9;  --rot:-1.5deg;}
  .pi6{grid-column:9/13;grid-row:5/9;  --rot: 2.8deg;}
  .pi7{grid-column:1/5; grid-row:9/13; --rot:-1.9deg;}
  .pi8{grid-column:5/9; grid-row:9/13; --rot: 1.3deg;}
  .pi9{grid-column:9/13;grid-row:9/13; --rot:-2.2deg;}

  .photo-item {
    position:relative; cursor:zoom-in;
    transform:rotate(var(--rot,0deg));
    transition:transform 0.38s cubic-bezier(0.23,1,0.32,1);
    z-index:1; opacity:0;
    animation:cardIn 0.65s cubic-bezier(0.23,1,0.32,1) forwards;
  }
  .pi1{animation-delay:.10s} .pi2{animation-delay:.18s} .pi3{animation-delay:.26s}
  .pi4{animation-delay:.34s} .pi5{animation-delay:.42s} .pi6{animation-delay:.50s}
  .pi7{animation-delay:.58s} .pi8{animation-delay:.66s} .pi9{animation-delay:.74s}
  @keyframes cardIn {
    from{opacity:0;transform:translateY(28px) rotate(var(--rot,0deg));}
    to  {opacity:1;transform:translateY(0)    rotate(var(--rot,0deg));}
  }
  .photo-item:hover{transform:rotate(0deg) scale(1.08)!important;z-index:30;}

  /* Marco polaroid beige */
  .photo-frame {
    width:100%; height:100%;
    background:linear-gradient(165deg,#fefaf3 0%,#f8edd8 100%);
    border-radius:3px; padding:8px 8px 32px;
    box-shadow:
      0 20px 55px rgba(0,0,0,0.80),
      0  5px 18px rgba(0,0,0,0.55),
      0  1px  4px rgba(0,0,0,0.40),
      inset 0 0 0 1px rgba(255,255,255,0.95),
      0 0 0 1px ${rgb(c1,0.10)};
    display:flex; flex-direction:column; position:relative; overflow:visible;
  }
  .photo-frame::before {
    content:''; position:absolute; top:-8px; left:50%; transform:translateX(-50%);
    width:15px; height:15px;
    background:radial-gradient(circle at 32% 32%,#fff8c0,#d4a017,#7a5800);
    border-radius:50%;
    box-shadow:0 3px 8px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.45);
    z-index:50;
  }
  .photo-img-wrap{flex:1;overflow:hidden;border-radius:2px;}
  .photo-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.45s ease;}
  .photo-item:hover .photo-img-wrap img{transform:scale(1.06);}
  .photo-caption{
    text-align:center;padding-top:6px;font-size:0.62rem;
    color:rgba(80,50,15,0.65);letter-spacing:0.16em;font-style:italic;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }

  /* ══════════════════════════════
     MOBILE — carrusel
  ══════════════════════════════ */
  .carousel-wrap{display:none;}
  @media(max-width:640px){
    .photo-grid{display:none;}
    .carousel-wrap{display:block;}
    .card-body{padding:22px 0 26px;}
    .card-header{padding:22px 16px 18px;}
  }
  .carousel-track-outer{
    overflow:hidden;position:relative;
    touch-action:pan-y;cursor:grab;user-select:none;
    padding:22px 0 12px;
  }
  .carousel-track-outer:active{cursor:grabbing;}
  .carousel-track{display:flex;transition:transform 0.42s cubic-bezier(0.23,1,0.32,1);will-change:transform;}
  .cr-slide{flex:0 0 82%;margin:0 4%;opacity:0.5;transition:opacity 0.3s ease;}
  .cr-slide.active{opacity:1;}
  .cr-frame{
    background:linear-gradient(165deg,#fefaf3 0%,#f8edd8 100%);
    border-radius:4px;padding:10px 10px 36px;
    box-shadow:0 12px 36px rgba(0,0,0,0.65),0 4px 14px rgba(0,0,0,0.45),inset 0 0 0 1px rgba(255,255,255,0.95);
    position:relative;
    transform:rotate(var(--cr-rot,0deg)) scale(0.96);
    transition:transform 0.38s ease,box-shadow 0.38s ease;
  }
  .cr-slide:nth-child(odd) .cr-frame{--cr-rot:-1.8deg;}
  .cr-slide:nth-child(even) .cr-frame{--cr-rot:1.6deg;}
  .cr-slide.active .cr-frame{
    --cr-rot:0deg;transform:rotate(0deg) scale(1);
    box-shadow:0 24px 64px rgba(0,0,0,0.75),0 6px 20px rgba(0,0,0,0.5),inset 0 0 0 1px rgba(255,255,255,0.97);
  }
  .cr-frame::before{
    content:'';position:absolute;top:-8px;left:50%;transform:translateX(-50%);
    width:15px;height:15px;
    background:radial-gradient(circle at 32% 32%,#fff8c0,#d4a017,#7a5800);
    border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.45);z-index:40;
  }
  .cr-img-wrap{width:100%;padding-top:72%;position:relative;overflow:hidden;border-radius:2px;}
  .cr-img-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
  .cr-caption{text-align:center;padding-top:8px;font-size:0.75rem;color:rgba(80,50,15,0.65);letter-spacing:0.15em;font-style:italic;}

  .cr-dots{display:flex;justify-content:center;gap:7px;margin-top:20px;padding:0 16px;}
  .cr-dot{
    width:7px;height:7px;border-radius:50%;
    background:${rgb(c1,0.20)};border:1px solid ${rgb(c1,0.45)};
    cursor:pointer;transition:background 0.25s,transform 0.25s;flex-shrink:0;
  }
  .cr-dot.active{background:${rgb(c1,1)};transform:scale(1.45);}

  .cr-nav{display:flex;justify-content:center;gap:16px;margin-top:14px;}
  .cr-btn{
    background:rgba(255,255,255,0.06);border:1px solid ${rgb(c1,0.35)};
    color:${rgb(c1,1)};font-size:1.4rem;width:44px;height:44px;border-radius:50%;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s,transform 0.15s;padding-bottom:2px;
    -webkit-tap-highlight-color:transparent;
  }
  .cr-btn:active{background:${rgb(c1,0.18)};transform:scale(0.92);}

  /* ── FOOTER ── */
  .card-footer{
    position:relative;z-index:10;text-align:center;
    padding:14px 0 24px;
    border-top:1px solid ${rgb(c1,0.15)};
    font-size:1.1rem;letter-spacing:0.7em;
    background:linear-gradient(90deg,
      ${rgb(c1,0)} 0%,${rgb(c1,0.8)} 30%,
      ${rgb(c2,1)} 50%,
      ${rgb(c1,0.8)} 70%,${rgb(c1,0)} 100%
    );
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }

  /* ── LIGHTBOX ── */
  .lb-overlay{
    position:fixed;inset:0;z-index:99999;
    display:flex;align-items:center;justify-content:center;
    opacity:0;pointer-events:none;transition:opacity 0.35s ease;
  }
  .lb-overlay.active{opacity:1;pointer-events:all;}
  .lb-backdrop{
    position:absolute;inset:0;
    background:rgba(8,2,18,0.88);
    backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
  }
  .lb-content{
    position:relative;z-index:10;
    display:flex;flex-direction:column;align-items:center;gap:14px;
    transform:scale(0.86);transition:transform 0.38s cubic-bezier(0.23,1,0.32,1);
  }
  .lb-overlay.active .lb-content{transform:scale(1);}
  .lb-frame{
    position:relative;background:rgba(255,255,255,0.05);
    backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border:1px solid ${rgb(c2,0.40)};border-radius:6px;padding:14px 14px 46px;
    box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 80px ${rgb(c1,0.15)},0 0 40px ${rgb(c2,0.10)},inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .lb-frame img{display:block;max-width:84vw;max-height:72vh;object-fit:contain;border-radius:2px;}
  .lb-close{
    position:absolute;top:-16px;right:-16px;
    background:${rgb(c1,0.70)};border:1px solid ${rgb(c1,0.50)};
    color:#fff;font-size:1rem;width:36px;height:36px;border-radius:50%;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s,transform 0.25s;z-index:50;
  }
  .lb-close:hover{background:${rgb(c1,0.95)};transform:scale(1.15) rotate(90deg);}
  .lb-counter{font-size:0.78rem;color:${rgb(c2,0.55)};letter-spacing:0.22em;font-style:italic;}
  .lb-nav{display:flex;align-items:center;gap:18px;}
  .lb-btn{
    background:rgba(255,255,255,0.06);border:1px solid ${rgb(c1,0.35)};
    color:${rgb(c1,1)};font-size:1.5rem;width:46px;height:46px;border-radius:50%;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s,transform 0.2s;padding-bottom:2px;
  }
  .lb-btn:hover{background:${rgb(c1,0.20)};transform:scale(1.1);}
  .lb-label{font-size:0.92rem;color:${rgb(c2,0.80)};letter-spacing:0.14em;font-style:italic;min-width:90px;text-align:center;}
</style>

<div class="ramos-card" id="ramosCard">
  <canvas id="particleCanvas"></canvas>

  <div class="card-header">
    <div class="mascot-wrap">
      <img src="${mascotSrc}" alt="Mascota" id="mascotImg"/>
    </div>
    <p class="card-eyebrow">✦ Parroquia · Semana Santa ✦</p>
    <h2 class="card-title">Misa de <em>Ramos</em></h2>
    <div class="card-rule"></div>
  </div>

  <div class="card-body">
    <div class="photo-grid" id="photoGrid">${gridItems}</div>
    <div class="carousel-wrap" id="carouselWrap">
      <div class="carousel-track-outer" id="crOuter">
        <div class="carousel-track" id="crTrack">${carouselItems}</div>
      </div>
      <div class="cr-dots" id="crDots"></div>
      <div class="cr-nav">
        <button class="cr-btn" id="crPrev">‹</button>
        <button class="cr-btn" id="crNext">›</button>
      </div>
    </div>
  </div>

  <div class="card-footer">✦ ✦ ✦</div>
</div>

<div class="lb-overlay" id="lightbox">
  <div class="lb-backdrop" id="lbBackdrop"></div>
  <div class="lb-content">
    <div class="lb-frame">
      <button class="lb-close" id="lbClose">✕</button>
      <img id="lbImg" src="" alt=""/>
    </div>
    <div class="lb-counter" id="lbCounter">1 / ${total}</div>
    <div class="lb-nav">
      <button class="lb-btn" id="lbPrev">‹</button>
      <span class="lb-label" id="lbLabel"></span>
      <button class="lb-btn" id="lbNext">›</button>
    </div>
  </div>
</div>
`;

    /* ══════════════════════════════════════════════
       PARTÍCULAS — hojas al viento
    ══════════════════════════════════════════════ */
    const canvas = shadow.getElementById('particleCanvas');
    const ctx    = canvas.getContext('2d');
    const card   = shadow.getElementById('ramosCard');
    let pImg = null, particles = [], rafId = null;
    const PARTICLE_COUNT = 40;
    const DPR = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const w = card.offsetWidth, h = card.offsetHeight;
      canvas.width  = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    function makeParticle() {
      const w = card.offsetWidth, h = card.offsetHeight;
      return {
        x: Math.random() * w, y: -70 - Math.random() * 280,
        size:   50 + Math.random() * 54,
        speedY: 0.38 + Math.random() * 0.70,
        speedX: -0.5 + Math.random() * 1.0,
        rot:    Math.random() * Math.PI * 2,
        rotV:   -0.009 + Math.random() * 0.018,
        sway:   0.5 + Math.random() * 0.9,
        swayS:  0.006 + Math.random() * 0.010,
        swayT:  Math.random() * Math.PI * 2,
        alpha:  0.60 + Math.random() * 0.38,
      };
    }
    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = makeParticle();
        p.y = Math.random() * card.offsetHeight;
        particles.push(p);
      }
    }
    function animate() {
      const lw = card.offsetWidth, lh = card.offsetHeight;
      ctx.clearRect(0, 0, lw, lh);
      particles.forEach(p => {
        p.swayT += p.swayS;
        p.x += p.speedX + Math.sin(p.swayT) * p.sway;
        p.y += p.speedY;
        p.rot += p.rotV;
        if (p.y > lh + 60) Object.assign(p, makeParticle());
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        if (pImg && pImg.complete && pImg.naturalWidth > 0) {
          ctx.drawImage(pImg, -p.size/2, -p.size/2, p.size, p.size);
        } else {
          // Fallback: estrella de 6 puntas con color c1
          ctx.fillStyle = rgb(c2, 1);
          ctx.beginPath();
          const pts = 6, outer = p.size/2, inner = p.size/5;
          for (let i = 0; i < pts*2; i++) {
            const r = i%2===0 ? outer : inner;
            const a = (i*Math.PI)/pts - Math.PI/2;
            i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r)
                  : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      rafId = requestAnimationFrame(animate);
    }
    function startParticles() { resizeCanvas(); initParticles(); if(rafId) cancelAnimationFrame(rafId); animate(); }

    if (particleSrc) {
      pImg = new Image();
      pImg.src = particleSrc;
      pImg.onload  = startParticles;
      pImg.onerror = startParticles;
    } else {
      startParticles();
    }
    new ResizeObserver(() => { resizeCanvas(); initParticles(); }).observe(card);

    /* ══════════════════════════════
       LIGHTBOX
    ══════════════════════════════ */
    const capts = captions;
    let cur = 0;
    const lb      = shadow.getElementById('lightbox');
    const lbImg   = shadow.getElementById('lbImg');
    const lbLabel = shadow.getElementById('lbLabel');
    const lbCtr   = shadow.getElementById('lbCounter');

    const openLB  = idx => { cur=idx; lbImg.src=`${basePath}${cur+1}.jpg`; lbImg.alt=capts[cur]||`Foto ${cur+1}`; lbLabel.textContent=capts[cur]||`Foto ${cur+1}`; lbCtr.textContent=`${cur+1} / ${total}`; lb.classList.add('active'); };
    const closeLB = () => lb.classList.remove('active');
    const navLB   = dir => { cur=(cur+dir+total)%total; lbImg.src=`${basePath}${cur+1}.jpg`; lbLabel.textContent=capts[cur]||`Foto ${cur+1}`; lbCtr.textContent=`${cur+1} / ${total}`; };

    shadow.getElementById('lbClose').addEventListener('click', closeLB);
    shadow.getElementById('lbBackdrop').addEventListener('click', closeLB);
    shadow.getElementById('lbPrev').addEventListener('click', ()=>navLB(-1));
    shadow.getElementById('lbNext').addEventListener('click', ()=>navLB(1));
    shadow.querySelectorAll('.photo-item').forEach(el=>el.addEventListener('click',()=>openLB(+el.dataset.idx)));
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key==='Escape') closeLB();
      if (e.key==='ArrowRight') navLB(1);
      if (e.key==='ArrowLeft')  navLB(-1);
    });

    /* ══════════════════════════════
       CARRUSEL MOBILE
    ══════════════════════════════ */
    const track  = shadow.getElementById('crTrack');
    const outer  = shadow.getElementById('crOuter');
    const dotsEl = shadow.getElementById('crDots');
    const slides = shadow.querySelectorAll('.cr-slide');
    let crCur = 0;

    slides.forEach((_,i) => {
      const d = document.createElement('div');
      d.className = 'cr-dot'+(i===0?' active':'');
      d.addEventListener('click',()=>goTo(i));
      dotsEl.appendChild(d);
    });
    const goTo = idx => {
      crCur = Math.max(0, Math.min(total-1, idx));
      track.style.transform = `translateX(calc(${crCur * -90}%))`;
      slides.forEach((s,i)=>s.classList.toggle('active',i===crCur));
      dotsEl.querySelectorAll('.cr-dot').forEach((d,i)=>d.classList.toggle('active',i===crCur));
    };
    goTo(0);

    shadow.getElementById('crPrev').addEventListener('click',()=>goTo(crCur-1));
    shadow.getElementById('crNext').addEventListener('click',()=>goTo(crCur+1));
    slides.forEach(sl=>sl.addEventListener('click',()=>openLB(+sl.dataset.idx)));

    let tStart=0;
    outer.addEventListener('touchstart',e=>{tStart=e.touches[0].clientX;},{passive:true});
    outer.addEventListener('touchend',  e=>{const dx=e.changedTouches[0].clientX-tStart; if(Math.abs(dx)>40)goTo(crCur+(dx<0?1:-1));},{passive:true});
    let mStart=0,dragging=false;
    outer.addEventListener('mousedown', e=>{mStart=e.clientX;dragging=true;});
    outer.addEventListener('mouseup',   e=>{if(!dragging)return;dragging=false;const dx=e.clientX-mStart;if(Math.abs(dx)>40)goTo(crCur+(dx<0?1:-1));});
    outer.addEventListener('mouseleave',()=>{dragging=false;});
  }
}

customElements.define('misa-ramos-gallery', MisaRamosGallery);
