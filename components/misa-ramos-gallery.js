/**
 * <misa-ramos-gallery>
 * Web Component con Shadow DOM — totalmente aislado del CSS de la plataforma.
 *
 * USO:
 *   <script src="misa-ramos-gallery.js"></script>
 *   <misa-ramos-gallery base-path="./actividades/ramos/"></misa-ramos-gallery>
 *
 * ATRIBUTOS:
 *   base-path   — ruta a la carpeta de fotos (default: './actividades/ramos/')
 *   total       — cantidad de fotos (default: 9)
 */
class MisaRamosGallery extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || './actividades/ramos/';
    const total    = parseInt(this.getAttribute('total') || '9', 10);
    const captions = [
      'Altar','Bendición','Palmas','Comunidad','Celebración',
      'Alegría','comunidad','oración','Padre'
    ];

    const shadow = this.attachShadow({ mode: 'open' });

    // ── Generar items del grid ──
    const items = Array.from({ length: total }, (_, i) => `
      <div class="photo-item pi${i+1}" data-idx="${i}">
        <div class="photo-frame">
          <div class="photo-img-wrap">
            <img src="${basePath}${i+1}.jpg" alt="${captions[i] || `Foto ${i+1}`}" loading="lazy" />
          </div>
          <div class="photo-caption">${captions[i] || `Foto ${i+1}`}</div>
        </div>
      </div>`).join('');

    shadow.innerHTML = `
<style>
  /* ── RESET SCOPED ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── CARD CONTENEDOR ── */
  :host {
    display: block;
    width: 80%;
    max-width: 1200px;
    margin: 32px auto;
    font-family: 'Georgia', 'Times New Roman', serif;
  }
  @media (max-width: 768px) {
    :host { width: 95%; }
  }

  /* ── CARD PRINCIPAL (glasmorfismo sobre fondo de la plataforma) ── */
  .ramos-card {
    background:
      linear-gradient(135deg,
        rgba(40, 15, 0, 0.92) 0%,
        rgba(20, 6, 0, 0.96) 50%,
        rgba(35, 12, 0, 0.93) 100%
      );
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

  /* Brillo ambiental interno */
  .ramos-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 220px;
    background: radial-gradient(ellipse at 50% -20%, rgba(201,168,76,0.14) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── HEADER ── */
  .card-header {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 36px 24px 24px;
    border-bottom: 1px solid rgba(201,168,76,0.12);
  }

  .card-eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(201,168,76,0.7);
    font-style: italic;
    margin-bottom: 10px;
  }

  .card-title {
    font-size: clamp(1.6rem, 3.5vw, 2.8rem);
    font-weight: 700;
    color: #fdf6e3;
    line-height: 1.15;
    text-shadow: 0 2px 24px rgba(201,168,76,0.35);
    letter-spacing: 0.01em;
    margin-bottom: 6px;
  }

  .card-title em {
    color: #f0d080;
    font-style: italic;
  }

  .card-rule {
    width: 64px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    margin: 14px auto 0;
  }

  /* ── CUERPO / GALERÍA ── */
  .card-body {
    position: relative;
    z-index: 2;
    padding: 36px 28px 36px;
  }

  /* Grid mosaico asimétrico */
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 72px;
    gap: 14px;
    position: relative;
  }

  /* Posiciones y rotaciones únicas — 9 fotos, composición 3×3 armoniosa */
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
    position: relative;
    cursor: zoom-in;
    transform: rotate(var(--rot, 0deg));
    transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), z-index 0s;
    z-index: 1;
    opacity: 0;
    animation: cardIn 0.65s cubic-bezier(0.23,1,0.32,1) forwards;
  }

  .pi1  { animation-delay:0.08s; }
  .pi2  { animation-delay:0.16s; }
  .pi3  { animation-delay:0.24s; }
  .pi4  { animation-delay:0.32s; }
  .pi5  { animation-delay:0.40s; }
  .pi6  { animation-delay:0.48s; }
  .pi7  { animation-delay:0.56s; }
  .pi8  { animation-delay:0.64s; }
  .pi9  { animation-delay:0.72s; }

  @keyframes cardIn {
    from { opacity:0; transform: translateY(24px) rotate(var(--rot,0deg)); }
    to   { opacity:1; transform: translateY(0)    rotate(var(--rot,0deg)); }
  }

  .photo-item:hover {
    transform: rotate(0deg) scale(1.07) !important;
    z-index: 30;
  }

  /* Marco polaroid — beige cálido contrastado */
  .photo-frame {
    width: 100%;
    height: 100%;
    background: linear-gradient(160deg, #fdf8f0 0%, #f5ede0 100%);
    border: 1px solid rgba(180,150,100,0.25);
    border-radius: 3px;
    padding: 8px 8px 30px;
    box-shadow:
      0 16px 48px rgba(0,0,0,0.75),
      0 4px 14px rgba(0,0,0,0.55),
      0 1px 3px rgba(0,0,0,0.4),
      inset 0 0 0 1px rgba(255,255,255,0.9);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: visible;
  }

  /* Tachuela */
  .photo-frame::before {
    content: '';
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    background: radial-gradient(circle at 35% 35%, #f0d880, #b8860b, #6b4f00);
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3);
    z-index: 40;
  }

  .photo-img-wrap {
    flex: 1;
    overflow: hidden;
    border-radius: 2px;
  }

  .photo-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.45s ease;
  }

  .photo-item:hover .photo-img-wrap img {
    transform: scale(1.05);
  }

  .photo-caption {
    text-align: center;
    padding-top: 5px;
    font-size: 0.62rem;
    color: rgba(100,70,30,0.65);
    letter-spacing: 0.16em;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── FOOTER ── */
  .card-footer {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 14px 0 22px;
    border-top: 1px solid rgba(201,168,76,0.10);
    color: rgba(201,168,76,0.3);
    font-size: 1.1rem;
    letter-spacing: 0.6em;
  }

  /* ── LIGHTBOX (dentro del shadow, sobre todo) ── */
  .lb-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;
  }

  .lb-overlay.active {
    opacity: 1;
    pointer-events: all;
  }

  .lb-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(5,2,0,0.86);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .lb-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    transform: scale(0.88);
    transition: transform 0.38s cubic-bezier(0.23,1,0.32,1);
  }

  .lb-overlay.active .lb-content {
    transform: scale(1);
  }

  .lb-frame {
    position: relative;
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(201,168,76,0.38);
    border-radius: 6px;
    padding: 14px 14px 46px;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.8),
      0 0 80px rgba(201,168,76,0.12),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .lb-frame img {
    display: block;
    max-width: 84vw;
    max-height: 72vh;
    object-fit: contain;
    border-radius: 2px;
  }

  .lb-close {
    position: absolute;
    top: -16px;
    right: -16px;
    background: rgba(160,40,10,0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,90,50,0.4);
    color: #fff;
    font-size: 1rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.25s;
    z-index: 50;
  }
  .lb-close:hover { background: rgba(210,50,10,0.95); transform: scale(1.15) rotate(90deg); }

  .lb-counter {
    font-size: 0.78rem;
    color: rgba(201,168,76,0.5);
    letter-spacing: 0.22em;
    font-style: italic;
  }

  .lb-nav {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .lb-btn {
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(201,168,76,0.32);
    color: #f0d080;
    font-size: 1.5rem;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.2s;
    line-height: 1;
    padding-bottom: 2px;
  }
  .lb-btn:hover { background: rgba(201,168,76,0.18); transform: scale(1.1); }

  .lb-label {
    font-size: 0.92rem;
    color: rgba(201,168,76,0.75);
    letter-spacing: 0.14em;
    font-style: italic;
    min-width: 90px;
    text-align: center;
  }

  /* ── MOBILE ── */
  @media (max-width: 640px) {
    .photo-grid {
      grid-template-columns: repeat(6,1fr);
      grid-auto-rows: 65px;
      gap: 10px;
    }
    .pi1,.pi3,.pi5,.pi7,.pi9  { grid-column-end: span 3 !important; }
    .pi2,.pi4,.pi6,.pi8 { grid-column-end: span 3 !important; }

    .pi1  { grid-column:1/4; grid-row:1/4; }
    .pi2  { grid-column:4/7; grid-row:1/4; }
    .pi3  { grid-column:1/4; grid-row:4/7; }
    .pi4  { grid-column:4/7; grid-row:4/7; }
    .pi5  { grid-column:1/4; grid-row:7/10; }
    .pi6  { grid-column:4/7; grid-row:7/10; }
    .pi7  { grid-column:1/4; grid-row:10/13; }
    .pi8  { grid-column:4/7; grid-row:10/13; }
    .pi9  { grid-column:2/6; grid-row:13/16; }

    .card-body { padding: 24px 14px; }
    .card-header { padding: 26px 16px 18px; }
  }
</style>

<!-- CARD PRINCIPAL -->
<div class="ramos-card">
<div>


  <div class="card-header">
    <p class="card-eyebrow">✦ Parroquia San Luis Gonzaga✦</p>
      <div>
      <h2 class="card-title">Misa de <em>Ramos</em></h2>

      </div>
    <div class="card-rule"></div>
                <img src="./actividades/photo.png" alt="Foto especial" style="max-width:100px; width:40%; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.18);" loading="lazy" data-idx="10" class="extra-photo" />

  </div>
 
  <div class="card-body">
    <div class="photo-grid" id="photoGrid">${items}</div>
  </div>

  <div class="card-footer">✦ ✦ ✦</div>
</div>

<!-- LIGHTBOX -->
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

    // ── LIGHTBOX LOGIC ──
    const capts = captions;
    let cur = 0;

    const lb       = shadow.getElementById('lightbox');
    const lbImg    = shadow.getElementById('lbImg');
    const lbLabel  = shadow.getElementById('lbLabel');
    const lbCtr    = shadow.getElementById('lbCounter');

    const open = idx => {
      cur = idx;
      lbImg.src     = `${basePath}${cur+1}.jpg`;
      lbImg.alt     = capts[cur] || `Foto ${cur+1}`;
      lbLabel.textContent = capts[cur] || `Foto ${cur+1}`;
      lbCtr.textContent   = `${cur+1} / ${total}`;
      lb.classList.add('active');
    };

    const close = () => lb.classList.remove('active');

    const nav = dir => {
      cur = (cur + dir + total) % total;
      lbImg.src   = `${basePath}${cur+1}.jpg`;
      lbLabel.textContent = capts[cur] || `Foto ${cur+1}`;
      lbCtr.textContent   = `${cur+1} / ${total}`;
    };

    shadow.getElementById('lbClose').addEventListener('click', close);
    shadow.getElementById('lbBackdrop').addEventListener('click', close);
    shadow.getElementById('lbPrev').addEventListener('click', () => nav(-1));
    shadow.getElementById('lbNext').addEventListener('click', () => nav(1));

    shadow.querySelectorAll('.photo-item').forEach(el => {
      el.addEventListener('click', () => open(+el.dataset.idx));
    });

    // Keyboard (escucha en document pero solo actúa si el lb está activo)
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape')       close();
      if (e.key === 'ArrowRight')   nav(1);
      if (e.key === 'ArrowLeft')    nav(-1);
    });
  }
}

customElements.define('misa-ramos-gallery', MisaRamosGallery);