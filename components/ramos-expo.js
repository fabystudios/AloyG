class RamosExpo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const style = `
      :host {
        display: block;
        padding: 2rem 0;
        background: rgba(255,255,255,0.08);
        border-radius: 2rem;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.18);
        margin: 2rem auto;
        max-width: 1100px;
      }
      .expo-title {
        text-align: center;
        font-size: 2.2rem;
        font-weight: bold;
        color: #fff;
        margin-bottom: 1.5rem;
        letter-spacing: 0.04em;
        text-shadow: 0 2px 16px #2e3a4b99;
      }
      .expo-gallery {
        display: flex;
        flex-wrap: wrap;
        gap: 1.2rem;
        justify-content: center;
        align-items: flex-end;
        padding: 1.5rem 0.5rem 2.5rem 0.5rem;
        background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.18) 100%);
        border-radius: 1.5rem;
        box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.18);
        min-height: 320px;
      }
      .expo-photo {
        position: relative;
        border-radius: 1.2rem;
        overflow: hidden;
        box-shadow: 0 2px 16px 0 rgba(0,0,0,0.18);
        cursor: pointer;
        transition: transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s;
        border: 2.5px solid rgba(255,255,255,0.22);
        background: #fff2;
        margin-bottom: -1.5rem;
      }
      .expo-photo:hover {
        z-index: 2;
        transform: scale(1.08) translateY(-10px) rotate(-2deg);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border-color: #fff8;
      }
      .expo-photo img {
        display: block;
        width: 180px;
        height: 240px;
        object-fit: cover;
        border-radius: 1.1rem;
        transition: filter 0.2s;
        filter: brightness(0.98) contrast(1.08) saturate(1.1);
      }
      @media (max-width: 900px) {
        .expo-photo img { width: 120px; height: 160px; }
      }
      @media (max-width: 600px) {
        .expo-title { font-size: 1.3rem; }
        .expo-photo img { width: 90px; height: 120px; }
        .expo-gallery { gap: 0.5rem; }
      }
      .expo-zoom {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(30,34,40,0.88);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s;
      }
      .expo-zoom img {
        max-width: 92vw;
        max-height: 88vh;
        border-radius: 2rem;
        box-shadow: 0 8px 48px 0 #000b;
        background: #fff2;
        border: 3px solid #fff8;
        animation: zoomIn 0.22s;
      }
      .expo-zoom-close {
        position: absolute;
        top: 2.5vw;
        right: 3vw;
        font-size: 2.5rem;
        color: #fff;
        background: rgba(0,0,0,0.18);
        border: none;
        border-radius: 50%;
        width: 2.7em;
        height: 2.7em;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 2px 8px #0006;
        transition: background 0.18s;
      }
      .expo-zoom-close:hover {
        background: #fff3;
        color: #222;
      }
      @keyframes fadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      @keyframes zoomIn {
        from { transform: scale(0.92); opacity: 0.7; } to { transform: scale(1); opacity: 1; }
      }
    `;
    const photos = [
      '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'
    ];
    const base = './actividades/ramos/';
    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="expo-title">Exposición fotográfica · Misa de Ramos</div>
      <div class="expo-gallery">
        ${photos.map((f, i) => `
          <div class="expo-photo" tabindex="0" title="Ver foto ${i+1}">
            <img src="${base}${f}" alt="Foto de Ramos ${i+1}" loading="lazy" />
          </div>
        `).join('')}
      </div>
      <div class="expo-zoom" style="display:none;"><button class="expo-zoom-close" title="Cerrar">×</button><img src="" alt="Zoom" /></div>
    `;
    // Interactividad zoom
    const gallery = this.shadowRoot.querySelector('.expo-gallery');
    const zoom = this.shadowRoot.querySelector('.expo-zoom');
    const zoomImg = zoom.querySelector('img');
    const closeBtn = zoom.querySelector('.expo-zoom-close');
    gallery.querySelectorAll('.expo-photo').forEach((el, idx) => {
      el.addEventListener('click', () => {
        zoomImg.src = base + photos[idx];
        zoom.style.display = 'flex';
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          zoomImg.src = base + photos[idx];
          zoom.style.display = 'flex';
        }
      });
    });
    closeBtn.addEventListener('click', () => {
      zoom.style.display = 'none';
      zoomImg.src = '';
    });
    zoom.addEventListener('click', (e) => {
      if (e.target === zoom) {
        zoom.style.display = 'none';
        zoomImg.src = '';
      }
    });
    window.addEventListener('keydown', (e) => {
      if (zoom.style.display === 'flex' && (e.key === 'Escape' || e.key === 'Esc')) {
        zoom.style.display = 'none';
        zoomImg.src = '';
      }
    });
  }
}
customElements.define('ramos-expo', RamosExpo);
