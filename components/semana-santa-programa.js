/**
 * <semana-santa-programa>
 * Mosaico glassmorphism con modal de zoom para el Programa de Semana Santa.
 * Imágenes: ./actividades/programa/1.png … 8.png
 */
class SemanaSantaPrograma extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || './actividades/programa/';
    const count    = parseInt(this.getAttribute('count') || '8', 10);
    const id       = 'ss-programa-' + Math.random().toString(36).slice(2, 7);

    /* ── Estilos ─────────────────────────────────────────── */
    const style = document.createElement('style');
    style.textContent = `
      /* ─── Wrapper exterior ─── */
      .ss-wrap {
        width: 94%;
        max-width: 1120px;
        margin: 48px auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* ─── Card glassmorphism ─── */
      .ss-card {
        background: linear-gradient(
          145deg,
          rgba(28,5,62,0.88) 0%,
          rgba(60,10,40,0.82) 50%,
          rgba(20,8,55,0.90) 100%
        );
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
        border: 1.5px solid rgba(212,175,55,0.55);
        border-radius: 28px;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.05) inset,
          0 8px 60px rgba(20,5,50,0.85),
          0 0 80px rgba(140,0,60,0.28),
          0 0 0 3px rgba(212,175,55,0.08);
        overflow: hidden;
        padding: 32px 28px 36px;
      }

      /* ─── Header ─── */
      .ss-header {
        text-align: center;
        margin-bottom: 28px;
      }
      .ss-eyebrow {
        font-size: 0.72rem;
        letter-spacing: 4px;
        text-transform: uppercase;
        color: rgba(212,175,55,0.7);
        margin-bottom: 6px;
      }
      .ss-title {
        font-size: clamp(1.5rem, 4vw, 2.4rem);
        font-weight: 800;
        background: linear-gradient(90deg, #d4af37 0%, #fff8e1 45%, #c0392b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 4px;
        letter-spacing: 1px;
        text-shadow: none;
      }
      .ss-subtitle {
        font-size: 0.88rem;
        color: rgba(255,220,180,0.65);
        letter-spacing: 0.5px;
      }
      .ss-divider {
        width: 80px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #d4af37, transparent);
        margin: 10px auto 0;
        border-radius: 2px;
      }

      /* ─── Cross decorativo ─── */
      .ss-cross-row {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .ss-cross-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(212,175,55,0.5);
      }

      /* ─── Mosaico (bento grid 4 cols) ─── */
      .ss-mosaic {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: auto;
        gap: 10px;
      }

      /* Posiciones bento */
      .ss-tile:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; } /* 2×2 grande */
      .ss-tile:nth-child(2) { grid-column: 3;     grid-row: 1; }
      .ss-tile:nth-child(3) { grid-column: 4;     grid-row: 1; }
      .ss-tile:nth-child(4) { grid-column: 3;     grid-row: 2; }
      .ss-tile:nth-child(5) { grid-column: 4;     grid-row: 2; }
      .ss-tile:nth-child(6) { grid-column: 1;     grid-row: 3; }
      .ss-tile:nth-child(7) { grid-column: 2 / 4; grid-row: 3; } /* 2×1 ancho */
      .ss-tile:nth-child(8) { grid-column: 4;     grid-row: 3; }

      /* ─── Cada tile ─── */
      .ss-tile {
        position: relative;
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        min-height: 140px;
        border: 1.5px solid rgba(212,175,55,0.2);
        transition: transform 0.34s cubic-bezier(.22,1,.36,1),
                    box-shadow  0.34s ease,
                    border-color 0.34s ease;
        background: rgba(20,5,40,0.6);
      }
      .ss-tile::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 40%, rgba(10,0,30,0.75) 100%);
        z-index: 1;
        transition: opacity 0.3s;
      }
      .ss-tile:hover {
        transform: translateY(-5px) scale(1.025);
        border-color: rgba(212,175,55,0.7);
        box-shadow:
          0 12px 40px rgba(10,0,30,0.7),
          0 0 25px rgba(212,175,55,0.35),
          0 0 60px rgba(140,0,60,0.25);
        z-index: 2;
      }
      .ss-tile:hover::before {
        opacity: 0.5;
      }
      .ss-tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(.22,1,.36,1);
      }
      .ss-tile:hover img {
        transform: scale(1.08);
      }

      /* Número de slide */
      .ss-tile-num {
        position: absolute;
        bottom: 8px;
        right: 10px;
        z-index: 2;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 1px;
        color: rgba(212,175,55,0.8);
        text-shadow: 0 1px 4px rgba(0,0,0,0.8);
      }

      /* Ícono zoom al hover */
      .ss-tile-zoom {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        z-index: 3;
        transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
        opacity: 0;
        background: rgba(212,175,55,0.18);
        border-radius: 50%;
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(212,175,55,0.6);
        backdrop-filter: blur(4px);
      }
      .ss-tile-zoom i {
        color: #d4af37;
        font-size: 26px;
      }
      .ss-tile:hover .ss-tile-zoom {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }

      /* ─── Pie de la card ─── */
      .ss-footer {
        text-align: center;
        margin-top: 22px;
        font-size: 1.5rem;
        color: rgba(255,200,160,0.5);
        letter-spacing: 1px;
      }
        @media (max-width: 640px) {
          .ss-footer {
            font-size: 0.78rem;
          }
        }

      /* ════════════ MODAL ════════════ */
      .ss-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: radial-gradient(ellipse at center, rgba(20,2,50,0.96) 0%, rgba(0,0,0,0.98) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
        padding: 20px;
      }
      .ss-modal-overlay.open {
        opacity: 1;
        pointer-events: all;
      }

      /* Partículas decorativas */
      .ss-particles {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 99998;
        overflow: hidden;
      }
      .ss-particle {
        position: absolute;
        border-radius: 50%;
        opacity: 0;
        animation: ssParticleFloat 3.5s ease-in-out infinite;
      }
      @keyframes ssParticleFloat {
        0%   { opacity: 0;   transform: translateY(0) scale(0.5); }
        20%  { opacity: 0.6; }
        80%  { opacity: 0.3; }
        100% { opacity: 0;   transform: translateY(-120px) scale(1.4); }
      }

      /* ─── Contenido del modal ─── */
      .ss-modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        transform: scale(0.5) translateY(40px);
        transition: transform 0.5s cubic-bezier(.2,1.3,.5,1), opacity 0.4s ease;
        opacity: 0;
      }
      .ss-modal-overlay.open .ss-modal-content {
        transform: scale(1) translateY(0);
        opacity: 1;
      }

      /* Frame de la imagen */
      .ss-modal-frame {
        border-radius: 18px;
        overflow: hidden;
        border: 2px solid rgba(212,175,55,0.6);
        box-shadow:
          0 0 0 6px rgba(212,175,55,0.08),
          0 0 80px rgba(140,0,60,0.5),
          0 30px 90px rgba(0,0,0,0.85);
        background: #0a0015;
        position: relative;
      }
      .ss-modal-frame::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 16px;
        box-shadow: 0 0 40px rgba(212,175,55,0.15) inset;
        z-index: 1;
        pointer-events: none;
      }
      .ss-modal-img {
        display: block;
        max-width: min(85vw, 800px);
        max-height: 72vh;
        object-fit: contain;
        border-radius: 16px;
      }

      /* Contador */
      .ss-modal-counter {
        font-size: 0.78rem;
        letter-spacing: 3px;
        color: rgba(212,175,55,0.7);
        text-transform: uppercase;
      }

      /* Controles */
      .ss-modal-controls {
        display: flex;
        gap: 14px;
        align-items: center;
      }
      .ss-modal-btn {
        background: rgba(212,175,55,0.12);
        border: 1.5px solid rgba(212,175,55,0.4);
        color: #d4af37;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
        backdrop-filter: blur(6px);
        font-size: 0;
      }
      .ss-modal-btn:hover {
        background: rgba(212,175,55,0.28);
        transform: scale(1.12);
        box-shadow: 0 0 20px rgba(212,175,55,0.4);
      }
      .ss-modal-btn i { font-size: 22px; }

      /* Botón cerrar */
      .ss-modal-close {
        position: absolute;
        top: -16px;
        right: -16px;
        background: linear-gradient(135deg, #8B0000, #c0392b);
        border: 2px solid rgba(255,255,255,0.15);
        color: #fff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(140,0,0,0.6);
        transition: transform 0.2s, box-shadow 0.2s;
        z-index: 5;
        font-size: 0;
      }
      .ss-modal-close:hover {
        transform: rotate(90deg) scale(1.15);
        box-shadow: 0 6px 28px rgba(200,0,0,0.8);
      }
      .ss-modal-close i { font-size: 20px; }

      /* Responsive */
      @media (max-width: 640px) {
        .ss-mosaic {
          grid-template-columns: repeat(2, 1fr);
        }
        .ss-tile:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 2; }
        .ss-tile:nth-child(2) { grid-column: 1; grid-row: 2; }
        .ss-tile:nth-child(3) { grid-column: 2; grid-row: 2; }
        .ss-tile:nth-child(4) { grid-column: 1; grid-row: 3; }
        .ss-tile:nth-child(5) { grid-column: 2; grid-row: 3; }
        .ss-tile:nth-child(6) { grid-column: 1; grid-row: 4; }
        .ss-tile:nth-child(7) { grid-column: 2; grid-row: 4; }
        .ss-tile:nth-child(8) { grid-column: 1 / 3; grid-row: 5; }
        .ss-tile { min-height: 120px; }
        .ss-card { padding: 20px 14px 24px; }
      }
    `;
    document.head.appendChild(style);

    /* ── Markup HTML ─────────────────────────────────────── */
    this.innerHTML = `
      <div class="ss-wrap" id="${id}">

        <!-- Card glassmorphism -->
        <div class="ss-card">

          <!-- Header -->
          <div class="ss-header">
            <div class="ss-eyebrow">✝ Parroquia San Luis Gonzaga ✝</div>
            <h2 class="ss-title">Semana Santa 2026</h2>
            <p class="ss-subtitle">Programa de celebraciones litúrgicas</p>
            <div class="ss-divider"></div>
          </div>

          <!-- Mosaico -->
          <div class="ss-mosaic" id="${id}-mosaic">
            ${Array.from({length: count}, (_, i) => `
              <div class="ss-tile" data-idx="${i}" title="Ver imagen ${i + 1}">
                <img src="${basePath}${i + 1}.png" alt="Semana Santa - Imagen ${i + 1}" loading="lazy" />
                <div class="ss-tile-zoom"><i class="material-icons">zoom_in</i></div>
                <span class="ss-tile-num">${i + 1} / ${count}</span>
              </div>
            `).join('')}
          </div>

          <!-- Pie -->
          <p class="ss-footer">✦ Toca una imagen para ampliar ✦</p>
        </div>

        <!-- Modal overlay -->
        <div class="ss-modal-overlay" id="${id}-modal" role="dialog" aria-modal="true" aria-label="Programa Semana Santa">
          <!-- Partículas -->
          <div class="ss-particles" id="${id}-particles"></div>

          <div class="ss-modal-content">
            <!-- Cerrar -->
            <button class="ss-modal-close" id="${id}-close" aria-label="Cerrar">
              <i class="material-icons">close</i>
            </button>

            <!-- Imagen -->
            <div class="ss-modal-frame">
              <img class="ss-modal-img" id="${id}-img" src="" alt="" />
            </div>

            <!-- Contador -->
            <div class="ss-modal-counter" id="${id}-counter">1 / ${count}</div>

            <!-- Flechas -->
            <div class="ss-modal-controls">
              <button class="ss-modal-btn" id="${id}-prev" aria-label="Anterior">
                <i class="material-icons">chevron_left</i>
              </button>
              <button class="ss-modal-btn" id="${id}-next" aria-label="Siguiente">
                <i class="material-icons">chevron_right</i>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    /* ── Lógica del modal ────────────────────────────────── */
    const modal   = document.getElementById(`${id}-modal`);
    const imgEl   = document.getElementById(`${id}-img`);
    const counter = document.getElementById(`${id}-counter`);
    const btnPrev = document.getElementById(`${id}-prev`);
    const btnNext = document.getElementById(`${id}-next`);
    const btnClose= document.getElementById(`${id}-close`);
    const particles = document.getElementById(`${id}-particles`);
    const tiles   = document.querySelectorAll(`#${id}-mosaic .ss-tile`);

    let current = 0;

    /* Crear partículas flotantes */
    const COLORS = ['#d4af37','#c0392b','#8B0000','#fff8dc','#7b0d91','#d4af37'];
    for (let p = 0; p < 22; p++) {
      const el = document.createElement('div');
      el.className = 'ss-particle';
      const size = 4 + Math.random() * 10;
      el.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        top:${60 + Math.random() * 40}%;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        opacity:0;
        animation-delay:${Math.random() * 3}s;
        animation-duration:${2.5 + Math.random() * 2}s;
      `;
      particles.appendChild(el);
    }

    function showImage(idx) {
      current = (idx + count) % count;
      imgEl.src = `${basePath}${current + 1}.png`;
      imgEl.alt = `Programa Semana Santa - Imagen ${current + 1}`;
      counter.textContent = `${current + 1} / ${count}`;
    }

    function openModal(idx) {
      showImage(idx);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    /* Clicks en tiles */
    tiles.forEach(tile => {
      tile.addEventListener('click', () => openModal(parseInt(tile.dataset.idx, 10)));
    });

    /* Controles del modal */
    btnPrev.addEventListener('click', () => showImage(current - 1));
    btnNext.addEventListener('click', () => showImage(current + 1));
    btnClose.addEventListener('click', closeModal);

    /* Click en overlay (fuera del contenido) */
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });

    /* Teclado */
    document.addEventListener('keydown', e => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'ArrowLeft')  showImage(current - 1);
      if (e.key === 'ArrowRight') showImage(current + 1);
      if (e.key === 'Escape')     closeModal();
    });
  }
}

customElements.define('semana-santa-programa', SemanaSantaPrograma);
