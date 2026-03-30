/**
 * <misa-ramos-gallery>
 * Web Component con Shadow DOM — totalmente aislado del CSS de la plataforma.
 *
 * USO:
 *   <script src="misa-ramos-gallery.js"></script>
 *   <misa-ramos-gallery base-path="./actividades/ramos/"></misa-ramos-gallery>
 *
 * ATRIBUTOS:
 *   base-path   — ruta a la carpeta de fotos     (default: './actividades/ramos/')
 *   mascot-src  — ruta a la imagen mascota        (default: './actividades/photo.png')
 *   total       — cantidad de fotos               (default: 9)
 */
class MisaRamosGallery extends HTMLElement {
  connectedCallback() {
    const basePath  = this.getAttribute('base-path')  || './actividades/ramos/';
    const mascotSrc = this.getAttribute('mascot-src') || './actividades/photo.png';
    const total     = parseInt(this.getAttribute('total') || '9', 10);
    const captions  = [
      'Altar','Bendición','Palmas','Comunidad','Celebración',
      'Alegría','comunidad','oración','Padre'
    ];

    const shadow = this.attachShadow({ mode: 'open' });

    const gridItems = Array.from({ length: total }, (_, i) => `
      <div class="photo-item pi${i+1}" data-idx="${i}">
        <div class="photo-frame">
          <div class="photo-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i] || `Foto ${i+1}`}" loading="lazy" />
          </div>
          <div class="photo-caption">${captions[i] || `Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    const carouselItems = Array.from({ length: total }, (_, i) => `
      <div class="cr-slide" data-idx="${i}">
        <div class="cr-frame">
          <div class="cr-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i] || `Foto ${i+1}`}" loading="lazy" />
          </div>
          <div class="cr-caption">${captions[i] || `Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    shadow.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    width: 80%;
    max-width: 1200px;
    margin: 32px auto;
    font-family: 'Georgia', 'Times New Roman', serif;
  }
  @media (max-width: 768px) { :host { width: 95%; } }

  /* ── CARD ── */
  .ramos-card {
    background: linear-gradient(135deg, rgba(40,15,0,0.92) 0%, rgba(20,6,0,0.96) 50%, rgba(35,12,0,0.93) 100%);
    backdrop-filter: blur(28px) saturate(1.4);
    -webkit-backdrop-filter: blur(28px) saturate(1.4);
    border: 1px solid rgba(201,168,76,0.28);
    border-radius: 28px;
    box-shadow:
      0 32px 80px rgba(0,0,0,0.55),
      0 8px 24px rgba(0,0,0,0.35),
      inset 0 1px 0 rgba(201,168,76,0.18),
      inset 0 -1px 0 rgba(201,168,76,0.08),
      0 0 0 1px rgba(255,255,255,0.04);
    overflow: hidden;
    position: relative;
  }
  .ramos-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 220px;
    background: radial-gradient(ellipse at 50% -20%, rgba(201,168,76,0.14) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── HEADER ── */
  .card-header {
    position: relative; z-index: 2;
    text-align: center;
    padding: 28px 24px 22px;
    border-bottom: 1px solid rgba(201,168,76,0.12);
  }
  .mascot-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }
  .mascot-wrap img {
    width: 72px; height: 72px;
    object-fit: contain;
    object-position: center bottom;
    filter:
      drop-shadow(0 4px 16px rgba(201,168,76,0.45))
      drop-shadow(0 2px 6px rgba(0,0,0,0.6));
    animation: mascotBob 3.2s ease-in-out infinite;
  }
  @keyframes mascotBob {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-5px); }
  }
  .card-eyebrow {
    font-size: 0.72rem; letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(201,168,76,0.7); font-style: italic;
    margin-bottom: 8px;
  }
  .card-title {
    font-size: clamp(1.6rem, 3.5vw, 2.8rem);
    font-weight: 700; color: #fdf6e3;
    line-height: 1.15;
    text-shadow: 0 2px 24px rgba(201,168,76,0.35);
    margin-bottom: 6px;
  }
  .card-title em { color: #f0d080; font-style: italic; }
  .card-rule {
    width: 64px; height: 1px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    margin: 12px auto 0;
  }

  /* ── BODY ── */
  .card-body { position: relative; z-index: 2; padding: 36px 28px 36px; }

  /* ══════════════════════
     DESKTOP — grid
  ══════════════════════ */
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 72px;
    gap: 14px;
    position: relative;
  }
  .pi1  { grid-column:1/5;  grid-row:1/5;   --rot:-2.5deg; }
  .pi2  { grid-column:5/9;  grid-row:1/4;   --rot: 1.8deg; }
  .pi3  { grid-column:9/13; grid-row:1/5;   --rot:-1.2deg; }
  .pi4  { grid-column:1/4;  grid-row:5/9;   --rot: 2.3deg; }
  .pi5  { grid-column:4/9;  grid-row:4/9;   --rot:-1.5deg; }
  .pi6  { grid-column:9/13; grid-row:5/9;   --rot: 2.8deg; }
  .pi7  { grid-column:1/5;  grid-row:9/13;  --rot:-1.9deg; }
  .pi8  { grid-column:5/9;  grid-row:9/13;  --rot: 1.3deg; }
  .pi9  { grid-column:9/13; grid-row:9/13;  --rot:-2.2deg; }

  .photo-item {
    position: relative; cursor: zoom-in;
    transform: rotate(var(--rot, 0deg));
    transition: transform 0.38s cubic-bezier(0.23,1,0.32,1);
    z-index: 1; opacity: 0;
    animation: cardIn 0.65s cubic-bezier(0.23,1,0.32,1) forwards;
  }
  .pi1{animation-delay:.08s} .pi2{animation-delay:.16s} .pi3{animation-delay:.24s}
  .pi4{animation-delay:.32s} .pi5{animation-delay:.40s} .pi6{animation-delay:.48s}
  .pi7{animation-delay:.56s} .pi8{animation-delay:.64s} .pi9{animation-delay:.72s}

  @keyframes cardIn {
    from { opacity:0; transform:translateY(24px) rotate(var(--rot,0deg)); }
    to   { opacity:1; transform:translateY(0)    rotate(var(--rot,0deg)); }
  }
  .photo-item:hover { transform:rotate(0deg) scale(1.07) !important; z-index:30; }

  /* Marco polaroid beige */
  .photo-frame {
    width:100%; height:100%;
    background: linear-gradient(160deg, #fdf8f0 0%, #f5ede0 100%);
    border: 1px solid rgba(180,150,100,0.25);
    border-radius: 3px;
    padding: 8px 8px 30px;
    box-shadow:
      0 16px 48px rgba(0,0,0,0.75),
      0 4px 14px rgba(0,0,0,0.55),
      0 1px 3px rgba(0,0,0,0.4),
      inset 0 0 0 1px rgba(255,255,255,0.9);
    display:flex; flex-direction:column;
    position:relative; overflow:visible;
  }
  .photo-frame::before {
    content:''; position:absolute; top:-7px; left:50%;
    transform:translateX(-50%);
    width:14px; height:14px;
    background: radial-gradient(circle at 35% 35%, #f0d880, #b8860b, #6b4f00);
    border-radius:50%;
    box-shadow:0 2px 6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3);
    z-index:40;
  }
  .photo-img-wrap { flex:1; overflow:hidden; border-radius:2px; }
  .photo-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.45s ease; }
  .photo-item:hover .photo-img-wrap img { transform:scale(1.05); }
  .photo-caption {
    text-align:center; padding-top:5px; font-size:0.62rem;
    color:rgba(100,70,30,0.65); letter-spacing:0.16em; font-style:italic;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }

  /* ══════════════════════
     MOBILE — carrusel
  ══════════════════════ */
  .carousel-wrap { display:none; }

  @media (max-width: 640px) {
    .photo-grid    { display:none; }
    .carousel-wrap { display:block; }
    .card-body     { padding:24px 0 28px; }
    .card-header   { padding:22px 16px 18px; }
  }

  .carousel-track-outer {
    overflow:hidden; position:relative;
    touch-action:pan-y; cursor:grab; user-select:none;
    padding: 20px 0 10px; /* espacio para tachuelas y sombras */
  }
  .carousel-track-outer:active { cursor:grabbing; }

  .carousel-track {
    display:flex;
    transition:transform 0.42s cubic-bezier(0.23,1,0.32,1);
    will-change:transform;
  }

  /* Slide: 82% de ancho, márgenes laterales 9% para ver pico del siguiente */
  .cr-slide {
    flex: 0 0 82%;
    margin: 0 4%;
    transition: opacity 0.3s ease;
    opacity: 0.55;
  }
  .cr-slide.active { opacity: 1; }

  .cr-frame {
    background: linear-gradient(160deg, #fdf8f0 0%, #f5ede0 100%);
    border: 1px solid rgba(180,150,100,0.25);
    border-radius: 4px;
    padding: 10px 10px 36px;
    box-shadow:
      0 12px 36px rgba(0,0,0,0.6),
      0 4px 12px rgba(0,0,0,0.45),
      inset 0 0 0 1px rgba(255,255,255,0.9);
    position:relative;
    transform: rotate(var(--cr-rot, 0deg)) scale(0.96);
    transition: transform 0.38s ease, box-shadow 0.38s ease;
  }
  .cr-slide:nth-child(odd)  .cr-frame { --cr-rot:-1.8deg; }
  .cr-slide:nth-child(even) .cr-frame { --cr-rot: 1.6deg; }
  .cr-slide.active .cr-frame {
    --cr-rot:0deg;
    transform: rotate(0deg) scale(1);
    box-shadow:
      0 22px 60px rgba(0,0,0,0.75),
      0 6px 20px rgba(0,0,0,0.5),
      inset 0 0 0 1px rgba(255,255,255,0.95);
  }
  .cr-frame::before {
    content:''; position:absolute; top:-7px; left:50%;
    transform:translateX(-50%);
    width:14px; height:14px;
    background: radial-gradient(circle at 35% 35%, #f0d880, #b8860b, #6b4f00);
    border-radius:50%;
    box-shadow:0 2px 6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3);
    z-index:40;
  }
  .cr-img-wrap {
    width:100%; padding-top:72%; position:relative;
    overflow:hidden; border-radius:2px;
  }
  .cr-img-wrap img {
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; display:block;
  }
  .cr-caption {
    text-align:center; padding-top:8px; font-size:0.75rem;
    color:rgba(100,70,30,0.65); letter-spacing:0.16em; font-style:italic;
  }

  /* Dots */
  .cr-dots { display:flex; justify-content:center; gap:7px; margin-top:20px; padding:0 16px; }
  .cr-dot {
    width:7px; height:7px; border-radius:50%;
    background:rgba(201,168,76,0.2);
    border:1px solid rgba(201,168,76,0.4);
    cursor:pointer;
    transition:background 0.25s, transform 0.25s;
    flex-shrink:0;
  }
  .cr-dot.active { background:#c9a84c; transform:scale(1.4); }

  /* Botones nav */
  .cr-nav { display:flex; justify-content:center; gap:16px; margin-top:16px; }
  .cr-btn {
    background:rgba(255,255,255,0.07);
    border:1px solid rgba(201,168,76,0.35);
    color:#f0d080; font-size:1.4rem;
    width:44px; height:44px; border-radius:50%;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:background 0.2s, transform 0.15s; padding-bottom:2px;
    -webkit-tap-highlight-color:transparent;
  }
  .cr-btn:active { background:rgba(201,168,76,0.2); transform:scale(0.92); }

  /* ── FOOTER ── */
  .card-footer {
    position:relative; z-index:2; text-align:center;
    padding:14px 0 22px;
    border-top:1px solid rgba(201,168,76,0.10);
    color:rgba(201,168,76,0.3); font-size:1.1rem; letter-spacing:0.6em;
  }

  /* ── LIGHTBOX ── */
  .lb-overlay {
    position:fixed; inset:0; z-index:99999;
    display:flex; align-items:center; justify-content:center;
    opacity:0; pointer-events:none; transition:opacity 0.35s ease;
  }
  .lb-overlay.active { opacity:1; pointer-events:all; }
  .lb-backdrop {
    position:absolute; inset:0;
    background:rgba(5,2,0,0.86);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  }
  .lb-content {
    position:relative; z-index:10;
    display:flex; flex-direction:column; align-items:center; gap:14px;
    transform:scale(0.88); transition:transform 0.38s cubic-bezier(0.23,1,0.32,1);
  }
  .lb-overlay.active .lb-content { transform:scale(1); }
  .lb-frame {
    position:relative;
    background:rgba(255,255,255,0.06);
    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
    border:1px solid rgba(201,168,76,0.38); border-radius:6px;
    padding:14px 14px 46px;
    box-shadow:0 40px 100px rgba(0,0,0,0.8),0 0 80px rgba(201,168,76,0.12),inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .lb-frame img { display:block; max-width:84vw; max-height:72vh; object-fit:contain; border-radius:2px; }
  .lb-close {
    position:absolute; top:-16px; right:-16px;
    background:rgba(160,40,10,0.8); border:1px solid rgba(255,90,50,0.4);
    color:#fff; font-size:1rem; width:36px; height:36px; border-radius:50%;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:background 0.2s,transform 0.25s; z-index:50;
  }
  .lb-close:hover { background:rgba(210,50,10,0.95); transform:scale(1.15) rotate(90deg); }
  .lb-counter { font-size:0.78rem; color:rgba(201,168,76,0.5); letter-spacing:0.22em; font-style:italic; }
  .lb-nav { display:flex; align-items:center; gap:18px; }
  .lb-btn {
    background:rgba(255,255,255,0.07); border:1px solid rgba(201,168,76,0.32);
    color:#f0d080; font-size:1.5rem; width:46px; height:46px; border-radius:50%;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:background 0.2s,transform 0.2s; padding-bottom:2px;
  }
  .lb-btn:hover { background:rgba(201,168,76,0.18); transform:scale(1.1); }
  .lb-label { font-size:0.92rem; color:rgba(201,168,76,0.75); letter-spacing:0.14em; font-style:italic; min-width:90px; text-align:center; }
</style>

<div class="ramos-card">
  <div class="card-header">
    <div class="mascot-wrap">
      <img src="${mascotSrc}" alt="Mascota fotógrafo" />
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
      <img id="lbImg" src="" alt="" />
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

    const capts = captions;
    let cur = 0;

    // ── LIGHTBOX ──
    const lb      = shadow.getElementById('lightbox');
    const lbImg   = shadow.getElementById('lbImg');
    const lbLabel = shadow.getElementById('lbLabel');
    const lbCtr   = shadow.getElementById('lbCounter');

    const openLB = idx => {
      cur = idx;
      lbImg.src = `${basePath}${cur+1}.jpg`;
      lbImg.alt = capts[cur] || `Foto ${cur+1}`;
      lbLabel.textContent = capts[cur] || `Foto ${cur+1}`;
      lbCtr.textContent   = `${cur+1} / ${total}`;
      lb.classList.add('active');
    };
    const closeLB = () => lb.classList.remove('active');
    const navLB = dir => {
      cur = (cur + dir + total) % total;
      lbImg.src = `${basePath}${cur+1}.jpg`;
      lbLabel.textContent = capts[cur] || `Foto ${cur+1}`;
      lbCtr.textContent   = `${cur+1} / ${total}`;
    };

    shadow.getElementById('lbClose').addEventListener('click', closeLB);
    shadow.getElementById('lbBackdrop').addEventListener('click', closeLB);
    shadow.getElementById('lbPrev').addEventListener('click', () => navLB(-1));
    shadow.getElementById('lbNext').addEventListener('click', () => navLB(1));
    shadow.querySelectorAll('.photo-item').forEach(el =>
      el.addEventListener('click', () => openLB(+el.dataset.idx))
    );
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape')     closeLB();
      if (e.key === 'ArrowRight') navLB(1);
      if (e.key === 'ArrowLeft')  navLB(-1);
    });

    // ── CARRUSEL ──
    const track  = shadow.getElementById('crTrack');
    const outer  = shadow.getElementById('crOuter');
    const dotsEl = shadow.getElementById('crDots');
    const slides = shadow.querySelectorAll('.cr-slide');
    let crCur = 0;

    // Crear dots
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'cr-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });

    const goTo = idx => {
      crCur = Math.max(0, Math.min(total - 1, idx));
      // Cada slide es 82% + 8% de márgenes = 90% de avance por paso
      track.style.transform = `translateX(calc(${crCur * -90}%))`;
      slides.forEach((s, i) => s.classList.toggle('active', i === crCur));
      dotsEl.querySelectorAll('.cr-dot').forEach((d, i) =>
        d.classList.toggle('active', i === crCur)
      );
    };

    goTo(0);

    shadow.getElementById('crPrev').addEventListener('click', () => goTo(crCur - 1));
    shadow.getElementById('crNext').addEventListener('click', () => goTo(crCur + 1));

    // Click en slide → lightbox
    slides.forEach(sl =>
      sl.addEventListener('click', () => openLB(+sl.dataset.idx))
    );

    // Touch swipe
    let tStart = 0;
    outer.addEventListener('touchstart', e => { tStart = e.touches[0].clientX; }, { passive: true });
    outer.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - tStart;
      if (Math.abs(dx) > 40) goTo(crCur + (dx < 0 ? 1 : -1));
    }, { passive: true });

    // Mouse drag
    let mStart = 0, dragging = false;
    outer.addEventListener('mousedown',  e => { mStart = e.clientX; dragging = true; });
    outer.addEventListener('mouseup',    e => {
      if (!dragging) return; dragging = false;
      const dx = e.clientX - mStart;
      if (Math.abs(dx) > 40) goTo(crCur + (dx < 0 ? 1 : -1));
    });
    outer.addEventListener('mouseleave', () => { dragging = false; });
  }
}

customElements.define('misa-ramos-gallery', MisaRamosGallery);
