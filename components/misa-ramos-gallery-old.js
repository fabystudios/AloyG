/**
 * <misa-ramos-gallery>  — v4
 * Shadow DOM · totalmente aislado del CSS de la plataforma.
 *
 * ATRIBUTOS:
 *   base-path      ruta carpeta de fotos        (default: './actividades/ramos/')
 *   mascot-src     imagen mascota               (default: './actividades/photo.png')
 *   particle-src   PNG que flota de fondo       (default: '' → usa estrellitas CSS)
 *   width          ancho del componente en %    (default: '80%')
 *   total          cantidad de fotos            (default: 9)
 *
 * USO:
 *   <script src="misa-ramos-gallery.js"></script>
 *   <misa-ramos-gallery
 *     base-path="./actividades/ramos/"
 *     mascot-src="./actividades/photo.png"
 *     particle-src="./actividades/ramo.png"
 *     width="80%">
 *   </misa-ramos-gallery>
 */
class MisaRamosGallery extends HTMLElement {
  connectedCallback() {
    const basePath    = this.getAttribute('base-path')    || './actividades/ramos/';
    const mascotSrc   = this.getAttribute('mascot-src')   || './actividades/photo.png';
    const particleSrc = this.getAttribute('particle-src') || '';
    const widthVal    = this.getAttribute('width')        || '80%';
    const total       = parseInt(this.getAttribute('total') || '9', 10);
    const captions    = ['Procesión','Bendición','Comunidad','Palmas','Celebración',
                         'Fe','Oración','Ramos','Alegría'];

    const shadow = this.attachShadow({ mode: 'open' });

    // ── Grid items (desktop) ──
    const gridItems = Array.from({ length: total }, (_, i) => `
      <div class="photo-item pi${i+1}" data-idx="${i}">
        <div class="photo-frame">
          <div class="photo-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i]||`Foto ${i+1}`}" loading="lazy"/>
          </div>
          <div class="photo-caption">${captions[i]||`Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    // ── Carousel items (mobile) ──
    const carouselItems = Array.from({ length: total }, (_, i) => `
      <div class="cr-slide" data-idx="${i}">
        <div class="cr-frame">
          <div class="cr-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i]||`Foto ${i+1}`}" loading="lazy"/>
          </div>
          <div class="cr-caption">${captions[i]||`Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    shadow.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── HOST — ancho configurable solo en desktop ── */
  :host {
    display: block;
    width: ${widthVal};
    max-width: 1280px;
    margin: 36px auto;
    font-family: 'Playfair Display', Georgia, serif;
    position: relative;
  }
  /* Mobile: siempre 95%, ignorando el atributo width */
  @media (max-width: 768px) {
    :host { width: 95% !important; }
  }

  /* ══════════════════════════════════════
     CARD — glasmorfismo violeta / dorado
  ══════════════════════════════════════ */
  .ramos-card {
    position: relative;
    border-radius: 32px;
    overflow: hidden;
    /* Fondo base bicolor */
    background:
      linear-gradient(145deg,
        rgba(38, 10, 60, 0.94)  0%,
        rgba(18,  5, 35, 0.97) 40%,
        rgba(28,  8, 48, 0.95) 70%,
        rgba(15,  4, 28, 0.98) 100%
      );
    backdrop-filter: blur(32px) saturate(1.6) brightness(1.05);
    -webkit-backdrop-filter: blur(32px) saturate(1.6) brightness(1.05);

    /* Bordes: degradado violeta→dorado */
    border: 1.5px solid transparent;
    background-clip: padding-box;

    box-shadow:
      /* Sombra exterior profunda */
      0 40px 100px rgba(0,0,0,0.65),
      0 12px 32px  rgba(0,0,0,0.45),
      /* Halo violeta exterior */
      0 0 60px  rgba(140, 60,220,0.18),
      /* Halo dorado exterior */
      0 0 120px rgba(201,168,76,0.10),
      /* Borde luminoso interior top */
      inset 0  1px 0 rgba(201,168,76,0.35),
      /* Borde luminoso interior bottom */
      inset 0 -1px 0 rgba(140, 60,220,0.2),
      /* Brillo lateral izquierdo */
      inset 1px 0 0 rgba(180,100,255,0.12),
      inset -1px 0 0 rgba(201,168,76,0.08);
  }

  /* Pseudo-borde degradado violeta→dorado→violeta */
  .ramos-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 32px;
    padding: 1.5px;
    background: linear-gradient(
      135deg,
      rgba(180,100,255,0.7) 0%,
      rgba(201,168,76,0.9)  35%,
      rgba(240,208,128,1)   50%,
      rgba(201,168,76,0.9)  65%,
      rgba(140, 60,220,0.6) 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 5;
  }

  /* Luz ambiental interior — blob violeta arriba-izq y dorado abajo-der */
  .ramos-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 15%  0%,  rgba(160, 80,255,0.20) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 100%, rgba(201,168, 76,0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 50%  50%, rgba( 80, 20,140,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  /* ── Partículas flotantes (canvas) ── */
  #particleCanvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    border-radius: 32px;
    opacity: 0.55;
  }

  /* ── HEADER ── */
  .card-header {
    position: relative; z-index: 10;
    text-align: center;
    padding: 36px 28px 24px;
    border-bottom: 1px solid rgba(201,168,76,0.18);
  }
  /* Línea superior decorativa arcoíris */
  .card-header::before {
    content: '';
    display: block;
    width: 120px; height: 2px;
    margin: 0 auto 22px;
    background: linear-gradient(90deg,
      rgba(180,100,255,0) 0%,
      rgba(180,100,255,1) 30%,
      rgba(240,208,128,1) 50%,
      rgba(201,168, 76,1) 70%,
      rgba(201,168, 76,0) 100%
    );
    border-radius: 2px;
  }

  /* Mascota — aparece desde abajo con bounce */
  .mascot-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
  }
  .mascot-wrap img {
    width: 84px; height: 84px;
    object-fit: contain;
    object-position: center bottom;
    filter:
      drop-shadow(0 0  18px rgba(180,100,255,0.7))
      drop-shadow(0 0   8px rgba(201,168, 76,0.6))
      drop-shadow(0  6px 14px rgba(0,0,0,0.55));
    animation: mascotEntrance 0.9s cubic-bezier(0.34,1.56,0.64,1) both,
               mascotBob      3.8s 0.9s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes mascotEntrance {
    from { opacity:0; transform: translateY(32px) scale(0.6) rotate(-8deg); }
    to   { opacity:1; transform: translateY(0)    scale(1)   rotate(0deg);  }
  }
  @keyframes mascotBob {
    0%,100% { transform: translateY(0)    rotate( 0deg); }
    25%     { transform: translateY(-6px) rotate(-2deg); }
    75%     { transform: translateY(-3px) rotate( 2deg); }
  }

  .card-eyebrow {
    font-size: 0.70rem; letter-spacing: 0.40em;
    text-transform: uppercase; font-style: italic;
    color: rgba(201,168,76,0.75);
    margin-bottom: 10px;
    animation: fadeUp 0.7s 0.3s ease both;
  }
  .card-title {
    font-size: clamp(1.7rem, 3.8vw, 3rem);
    font-weight: 700; line-height: 1.1;
    color: #fdf6e3;
    text-shadow:
      0 0 40px rgba(180,100,255,0.5),
      0 2px 20px rgba(201,168,76,0.4);
    animation: fadeUp 0.7s 0.45s ease both;
  }
  .card-title em {
    font-style: italic;
    background: linear-gradient(90deg, #f0d080, #e8b8ff, #f0d080);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200%;
    animation: shimmer 4s 1.4s linear infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .card-rule {
    width: 80px; height: 1px;
    background: linear-gradient(90deg,
      transparent, rgba(180,100,255,0.8), rgba(201,168,76,1), rgba(180,100,255,0.8), transparent
    );
    margin: 16px auto 0;
    animation: fadeUp 0.7s 0.6s ease both;
  }

  /* ── BODY ── */
  .card-body { position: relative; z-index: 10; padding: 38px 30px 38px; }

  /* ══════════════════════════════
     DESKTOP — grid exposición
  ══════════════════════════════ */
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 72px;
    gap: 14px;
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
    position: relative; cursor: zoom-in;
    transform: rotate(var(--rot,0deg));
    transition: transform 0.38s cubic-bezier(0.23,1,0.32,1);
    z-index: 1; opacity: 0;
    animation: cardIn 0.65s cubic-bezier(0.23,1,0.32,1) forwards;
  }
  .pi1{animation-delay:.10s} .pi2{animation-delay:.18s} .pi3{animation-delay:.26s}
  .pi4{animation-delay:.34s} .pi5{animation-delay:.42s} .pi6{animation-delay:.50s}
  .pi7{animation-delay:.58s} .pi8{animation-delay:.66s} .pi9{animation-delay:.74s}
  @keyframes cardIn {
    from{opacity:0;transform:translateY(28px) rotate(var(--rot,0deg));}
    to  {opacity:1;transform:translateY(0)    rotate(var(--rot,0deg));}
  }
  .photo-item:hover{transform:rotate(0deg) scale(1.08)!important;z-index:30;}

  /* Marco polaroid beige cálido */
  .photo-frame {
    width:100%; height:100%;
    background: linear-gradient(165deg, #fefaf3 0%, #f8edd8 100%);
    border-radius: 3px;
    padding: 8px 8px 32px;
    box-shadow:
      0 20px 55px rgba(0,0,0,0.80),
      0  5px 18px rgba(0,0,0,0.55),
      0  1px  4px rgba(0,0,0,0.40),
      inset 0 0 0 1px rgba(255,255,255,0.95),
      /* Halo violeta sutil en el marco */
      0 0 0 1px rgba(180,100,255,0.12);
    display:flex; flex-direction:column;
    position:relative; overflow:visible;
  }
  /* Tachuela */
  .photo-frame::before {
    content:''; position:absolute; top:-8px; left:50%;
    transform:translateX(-50%);
    width:15px; height:15px;
    background: radial-gradient(circle at 32% 32%, #fff8c0, #d4a017, #7a5800);
    border-radius:50%;
    box-shadow: 0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.45);
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
  .carousel-wrap { display:none; }
  @media(max-width:640px){
    .photo-grid    { display:none; }
    .carousel-wrap { display:block; }
    .card-body     { padding:22px 0 26px; }
    .card-header   { padding:22px 16px 18px; }
  }

  .carousel-track-outer{
    overflow:hidden;position:relative;
    touch-action:pan-y;cursor:grab;user-select:none;
    padding:22px 0 12px;
  }
  .carousel-track-outer:active{cursor:grabbing;}
  .carousel-track{
    display:flex;
    transition:transform 0.42s cubic-bezier(0.23,1,0.32,1);
    will-change:transform;
  }
  .cr-slide{
    flex:0 0 82%;margin:0 4%;
    opacity:0.5;transition:opacity 0.3s ease;
  }
  .cr-slide.active{opacity:1;}
  .cr-frame{
    background:linear-gradient(165deg,#fefaf3 0%,#f8edd8 100%);
    border-radius:4px;padding:10px 10px 36px;
    box-shadow:
      0 12px 36px rgba(0,0,0,0.65),
      0  4px 14px rgba(0,0,0,0.45),
      inset 0 0 0 1px rgba(255,255,255,0.95);
    position:relative;
    transform:rotate(var(--cr-rot,0deg)) scale(0.96);
    transition:transform 0.38s ease,box-shadow 0.38s ease;
  }
  .cr-slide:nth-child(odd) .cr-frame{--cr-rot:-1.8deg;}
  .cr-slide:nth-child(even).cr-frame{--cr-rot: 1.6deg;}
  .cr-slide.active .cr-frame{
    --cr-rot:0deg;transform:rotate(0deg) scale(1);
    box-shadow:0 24px 64px rgba(0,0,0,0.75),0 6px 20px rgba(0,0,0,0.5),inset 0 0 0 1px rgba(255,255,255,0.97);
  }
  .cr-frame::before{
    content:'';position:absolute;top:-8px;left:50%;
    transform:translateX(-50%);width:15px;height:15px;
    background:radial-gradient(circle at 32% 32%,#fff8c0,#d4a017,#7a5800);
    border-radius:50%;
    box-shadow:0 3px 8px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.45);
    z-index:40;
  }
  .cr-img-wrap{width:100%;padding-top:72%;position:relative;overflow:hidden;border-radius:2px;}
  .cr-img-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
  .cr-caption{text-align:center;padding-top:8px;font-size:0.75rem;color:rgba(80,50,15,0.65);letter-spacing:0.15em;font-style:italic;}

  .cr-dots{display:flex;justify-content:center;gap:7px;margin-top:20px;padding:0 16px;}
  .cr-dot{
    width:7px;height:7px;border-radius:50%;
    background:rgba(180,100,255,0.2);
    border:1px solid rgba(180,100,255,0.45);
    cursor:pointer;transition:background 0.25s,transform 0.25s;flex-shrink:0;
  }
  .cr-dot.active{background:linear-gradient(135deg,#b464ff,#c9a84c);transform:scale(1.45);}

  .cr-nav{display:flex;justify-content:center;gap:16px;margin-top:14px;}
  .cr-btn{
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(180,100,255,0.35);
    color:#e8b8ff;font-size:1.4rem;
    width:44px;height:44px;border-radius:50%;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s,transform 0.15s;padding-bottom:2px;
    -webkit-tap-highlight-color:transparent;
  }
  .cr-btn:active{background:rgba(180,100,255,0.18);transform:scale(0.92);}

  /* ── FOOTER ── */
  .card-footer{
    position:relative;z-index:10;text-align:center;
    padding:14px 0 24px;
    border-top:1px solid rgba(180,100,255,0.15);
    font-size:1.1rem;letter-spacing:0.7em;
    background: linear-gradient(90deg,
      rgba(180,100,255,0) 0%, rgba(180,100,255,0.7) 30%,
      rgba(201,168,76,1) 50%,
      rgba(180,100,255,0.7) 70%, rgba(180,100,255,0) 100%
    );
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
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
    position:relative;
    background:rgba(255,255,255,0.05);
    backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(201,168,76,0.4);border-radius:6px;
    padding:14px 14px 46px;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.85),
      0 0 80px rgba(180,100,255,0.15),
      0 0 40px rgba(201,168,76,0.10),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .lb-frame img{display:block;max-width:84vw;max-height:72vh;object-fit:contain;border-radius:2px;}
  .lb-close{
    position:absolute;top:-16px;right:-16px;
    background:rgba(120,20,180,0.75);border:1px solid rgba(200,100,255,0.5);
    color:#fff;font-size:1rem;width:36px;height:36px;border-radius:50%;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s,transform 0.25s;z-index:50;
  }
  .lb-close:hover{background:rgba(160,20,220,0.95);transform:scale(1.15) rotate(90deg);}
  .lb-counter{font-size:0.78rem;color:rgba(201,168,76,0.55);letter-spacing:0.22em;font-style:italic;}
  .lb-nav{display:flex;align-items:center;gap:18px;}
  .lb-btn{
    background:rgba(255,255,255,0.06);border:1px solid rgba(180,100,255,0.35);
    color:#e8b8ff;font-size:1.5rem;width:46px;height:46px;border-radius:50%;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s,transform 0.2s;padding-bottom:2px;
  }
  .lb-btn:hover{background:rgba(180,100,255,0.2);transform:scale(1.1);}
  .lb-label{font-size:0.92rem;color:rgba(201,168,76,0.8);letter-spacing:0.14em;font-style:italic;min-width:90px;text-align:center;}
</style>

<!-- CARD -->
<div class="ramos-card" id="ramosCard">
  <canvas id="particleCanvas"></canvas>

  <div class="card-header">
    <div class="mascot-wrap">
      <img src="${mascotSrc}" alt="Mascota fotógrafo" id="mascotImg"/>
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

<!-- LIGHTBOX -->
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
       PARTÍCULAS — hojas al viento sobre el canvas
    ══════════════════════════════════════════════ */
    const canvas = shadow.getElementById('particleCanvas');
    const ctx    = canvas.getContext('2d');
    const card   = shadow.getElementById('ramosCard');
    let pImg     = null;
    let particles = [];
    let rafId    = null;

    const PARTICLE_COUNT = 40;
    const DPR = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      canvas.width  = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    function makeParticle() {
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      return {
        x:     Math.random() * w,
        y:    -70 - Math.random() * 280,
        size:  50 + Math.random() * 54,    // 50-104px bien visibles y nítidas
        speedY: 0.38 + Math.random() * 0.70,
        speedX: -0.5 + Math.random() * 1.0,
        rot:   Math.random() * Math.PI * 2,
        rotV:  (-0.009 + Math.random() * 0.018),
        sway:  0.5 + Math.random() * 0.9,
        swayS: 0.006 + Math.random() * 0.010,
        swayT: Math.random() * Math.PI * 2,
        alpha: 0.60 + Math.random() * 0.38,  // 0.60-0.98, bien visibles
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = makeParticle();
        p.y = Math.random() * card.offsetHeight; // distribuir por toda la altura del card
        particles.push(p);
      }
    }

    // Fallback: estrellita de 6 puntas CSS cuando no hay imagen
    function drawStar(x, y, size, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.fillStyle = '#c9a84c';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const r = i % 2 === 0 ? size / 2 : size / 5;
        i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r)
                : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      const lw = card.offsetWidth;
      const lh = card.offsetHeight;
      ctx.clearRect(0, 0, lw, lh);
      particles.forEach(p => {
        // Vaivén sinusoidal
        p.swayT += p.swayS;
        p.x     += p.speedX + Math.sin(p.swayT) * p.sway;
        p.y     += p.speedY;
        p.rot   += p.rotV;

        // Si sale por abajo → reciclar desde arriba
        if (p.y > lh + 60) {
          Object.assign(p, makeParticle());
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;

        if (pImg && pImg.complete && pImg.naturalWidth > 0) {
          ctx.drawImage(pImg, -p.size/2, -p.size/2, p.size, p.size);
        } else {
          // fallback estrellita
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = '#c9a84c';
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

    function startParticles() {
      resizeCanvas();
      initParticles();
      if (rafId) cancelAnimationFrame(rafId);
      animate();
    }

    // Cargar imagen partícula si se pasó por parámetro
    if (particleSrc) {
      pImg = new Image();
      pImg.src = particleSrc;
      pImg.onload = startParticles;
      pImg.onerror = startParticles; // cae al fallback estrellitas
    } else {
      startParticles();
    }

    // Resize observer
    const ro = new ResizeObserver(() => {
      resizeCanvas();
      initParticles();
    });
    ro.observe(card);

    /* ══════════════════════════════
       LIGHTBOX
    ══════════════════════════════ */
    const capts = captions;
    let cur = 0;
    const lb      = shadow.getElementById('lightbox');
    const lbImg   = shadow.getElementById('lbImg');
    const lbLabel = shadow.getElementById('lbLabel');
    const lbCtr   = shadow.getElementById('lbCounter');

    const openLB = idx => {
      cur = idx;
      lbImg.src = `${basePath}${cur+1}.jpg`;
      lbImg.alt = capts[cur]||`Foto ${cur+1}`;
      lbLabel.textContent = capts[cur]||`Foto ${cur+1}`;
      lbCtr.textContent   = `${cur+1} / ${total}`;
      lb.classList.add('active');
    };
    const closeLB = () => lb.classList.remove('active');
    const navLB = dir => {
      cur = (cur+dir+total)%total;
      lbImg.src = `${basePath}${cur+1}.jpg`;
      lbLabel.textContent = capts[cur]||`Foto ${cur+1}`;
      lbCtr.textContent   = `${cur+1} / ${total}`;
    };

    shadow.getElementById('lbClose').addEventListener('click', closeLB);
    shadow.getElementById('lbBackdrop').addEventListener('click', closeLB);
    shadow.getElementById('lbPrev').addEventListener('click', ()=>navLB(-1));
    shadow.getElementById('lbNext').addEventListener('click', ()=>navLB(1));
    shadow.querySelectorAll('.photo-item').forEach(el=>
      el.addEventListener('click',()=>openLB(+el.dataset.idx))
    );
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key==='Escape')     closeLB();
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
    outer.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-tStart;
      if(Math.abs(dx)>40) goTo(crCur+(dx<0?1:-1));
    },{passive:true});

    let mStart=0,dragging=false;
    outer.addEventListener('mousedown',e=>{mStart=e.clientX;dragging=true;});
    outer.addEventListener('mouseup',e=>{
      if(!dragging)return;dragging=false;
      const dx=e.clientX-mStart;
      if(Math.abs(dx)>40)goTo(crCur+(dx<0?1:-1));
    });
    outer.addEventListener('mouseleave',()=>{dragging=false;});
  }
}

customElements.define('misa-ramos-gallery', MisaRamosGallery);
