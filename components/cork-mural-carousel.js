/**
 * <cork-mural-carousel>
 *
 * Atributos:
 *   title       — Título principal del carrusel  (default: "Mural de Actividades")
 *   subtitle    — Título del papel pinchado       (ej: "Nuevo Mural")
 *   description — Texto descriptivo del papel     (ej: "Nuevo mural en el atrio…")
 *   folder      — Ruta a la carpeta de imágenes   (ej: "./actividades/mural/")
 *   count       — Cantidad de fotos               (default: 4)
 *   ext         — Extensión de las imágenes       (default: "jpeg")
 *   icon        — Material Icon name              (default: "photo_library")
 *
 * Uso:
 *   <cork-mural-carousel
 *     title="Mural de Actividades"
 *     subtitle="Nuevo Mural"
 *     description="Nuevo mural en el atrio del templo…"
 *     folder="./actividades/mural/"
 *     count="4">
 *   </cork-mural-carousel>
 */

class CorkMuralCarousel extends HTMLElement {
  static _instanceCount = 0;

  static _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  connectedCallback() {
    const uid       = 'cmc-' + (++CorkMuralCarousel._instanceCount);
    const title     = this.getAttribute('title')       || 'Mural de Actividades';
    const subtitle  = this.getAttribute('subtitle')    || '';
    const desc      = this.getAttribute('description') || '';
    const folder    = this.getAttribute('folder')      || './actividades/mural/';
    const count     = Math.max(1, parseInt(this.getAttribute('count') || '4', 10));
    const ext       = this.getAttribute('ext')         || 'jpeg';
    const icon      = this.getAttribute('icon')        || 'photo_library';

    const rotations = [-1.2, 0.7, -0.5, 1.4, -0.9, 1.1, -1.6, 0.3];

    /* ── Slides ────────────────────────────────────────────── */
    const slidesHTML = Array.from({ length: count }, (_, i) => {
      const rot = rotations[i % rotations.length];
      return `
        <div class="cmc-slide" style="flex:0 0 75%;padding:0 8px;box-sizing:border-box;">
          <div style="background:#f5f0e8;padding:10px 10px 28px 10px;border-radius:3px;
                      box-shadow:0 8px 28px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.9);
                      transform:rotate(${rot}deg);">
            <img src="${CorkMuralCarousel._esc(folder)}${i + 1}.${CorkMuralCarousel._esc(ext)}"
                 alt="${CorkMuralCarousel._esc(subtitle || 'Foto')} ${i + 1}"
                 loading="lazy"
                 onerror="if(!this.dataset.retry){this.dataset.retry=1;var e=this.src.endsWith('.jpeg')?'.jpg':'.jpeg';this.src=this.src.replace(/\\.jpe?g$/i,e);}"
                 style="width:100%;display:block;aspect-ratio:4/3;object-fit:cover;pointer-events:none;">
          </div>
        </div>`;
    }).join('');

    /* ── Dots ──────────────────────────────────────────────── */
    const dotsHTML = Array.from({ length: count }, () =>
      '<span style="display:block;border-radius:50%;transition:all 0.3s;"></span>'
    ).join('');

    /* ── Papel pinchado ────────────────────────────────────── */
    const paperHTML = (subtitle || desc) ? `
      <div style="position:relative;margin:0 16px 20px;display:flex;justify-content:center;">
        <!-- Tachuela central -->
        <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);
                    width:20px;height:20px;border-radius:50%;
                    background:radial-gradient(circle at 32% 32%,#ff8888,#bb0000);
                    box-shadow:0 3px 9px rgba(0,0,0,0.65),inset 0 1px 3px rgba(255,255,255,0.55);
                    z-index:3;"></div>
        <!-- Papel -->
        <div style="
          background:linear-gradient(170deg,#fffef5 0%,#fef9d7 100%);
          border-radius:2px 2px 4px 4px;
          padding:20px 22px 16px;
          max-width:88%;
          width:100%;
          box-shadow:
            2px 6px 18px rgba(0,0,0,0.38),
            -1px -1px 0 rgba(255,255,255,0.9) inset,
            0 -2px 0 rgba(180,140,60,0.12) inset;
          transform:rotate(-0.7deg);
          position:relative;
          border-top:4px solid rgba(0,0,0,0.06);
        ">
          ${subtitle ? `<div class="cmc-subtitle" style="
            font-family:'Lilita One',Georgia,serif;
            font-size:1.6rem;
            font-weight:400;
            color:#e0069a;
            margin-bottom:9px;
            text-align:center;
            letter-spacing:1px;
            text-transform:uppercase;
            text-shadow:
              1px 1px 0 #ffe000,
              2px 2px 0 #ffd000,
              3px 3px 0 #e6b800,
              4px 4px 6px rgba(0,0,0,0.35);
          ">${CorkMuralCarousel._esc(subtitle)}</div>` : ''}
          ${desc ? `<div class="cmc-desc" style="
            font-size:1.15rem;
            color:#1a3a8a;
            line-height:1.6;
            text-align:center;
            font-family:'Dancing Script',cursive;
          ">${CorkMuralCarousel._esc(desc)}</div>` : ''}
          <!-- Líneas de papel (decorativas) -->
          <div style="
            position:absolute;bottom:7px;left:16px;right:16px;
            height:1px;background:rgba(150,100,50,0.18);
          "></div>
        </div>
      </div>` : '';

    /* ── Render ────────────────────────────────────────────── */
    if (!document.getElementById('cmc-desc-style')) {
      const s = document.createElement('style');
      s.id = 'cmc-desc-style';
      s.textContent = '.cmc-desc{line-height:1.25 !important;}@media(min-width:768px){.cmc-subtitle{font-size:2.4rem !important;}.cmc-desc{font-size:1.55rem !important;line-height:1.3 !important;}.cmc-slide{flex:0 0 50% !important;}}';
      document.head.appendChild(s);
    }
    this.innerHTML = `
      <div style="margin:24px auto 30px;max-width:900px;padding:0 16px;box-sizing:border-box;">

        <!-- Pizarra de corcho -->
        <div style="
          background-color:#c08a45;
          background-image:url('./actividades/fondo.jpg');
          background-size:cover;
          background-position:center;
          border-radius:18px;
          padding:26px 22px 22px;
          box-shadow:0 14px 45px rgba(0,0,0,0.5),
                     inset 0 2px 3px rgba(255,255,255,0.3),
                     inset 0 -2px 3px rgba(0,0,0,0.25);
          border:7px solid #7c4e20;
          position:relative;
        ">
          <!-- Tachuelas esquinas -->
          <div style="position:absolute;top:11px;left:20px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff9999,#cc1111);box-shadow:0 2px 5px rgba(0,0,0,0.5),inset 0 1px 2px rgba(255,255,255,0.4);"></div>
          <div style="position:absolute;top:11px;right:20px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#99c2ff,#1144cc);box-shadow:0 2px 5px rgba(0,0,0,0.5),inset 0 1px 2px rgba(255,255,255,0.4);"></div>
          <div style="position:absolute;bottom:11px;left:20px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#aaff99,#226611);box-shadow:0 2px 5px rgba(0,0,0,0.5),inset 0 1px 2px rgba(255,255,255,0.4);"></div>
          <div style="position:absolute;bottom:11px;right:20px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffdd88,#cc8800);box-shadow:0 2px 5px rgba(0,0,0,0.5),inset 0 1px 2px rgba(255,255,255,0.4);"></div>

          <!-- Tarjeta glassmorphism -->
          <div style="
            background:linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.07) 100%);
            backdrop-filter:blur(16px) saturate(1.6);
            -webkit-backdrop-filter:blur(16px) saturate(1.6);
            border-radius:14px;
            border:1px solid rgba(255,255,255,0.38);
            box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.35);
            padding:20px 10px 18px;
            overflow:visible;
          ">
            <!-- Título principal -->
            <div style="text-align:center;margin-bottom:18px;padding:0 20px;">
              <h3 style="color:#fff;font-size:1.3rem;font-weight:700;margin:0;
                         text-shadow:0 2px 8px rgba(0,0,0,0.6);letter-spacing:0.5px;">
                <i class="material-icons" style="vertical-align:middle;font-size:1.5rem;">${CorkMuralCarousel._esc(icon)}</i>
                &nbsp;${CorkMuralCarousel._esc(title)}
              </h3>
            </div>

            <!-- Papel pinchado (subtítulo + descripción) -->
            ${paperHTML}

            <!-- Carrusel -->
            <div id="${uid}-outer"
                 style="overflow:hidden;position:relative;cursor:grab;user-select:none;-webkit-user-select:none;">
              <div id="${uid}-track" style="display:flex;will-change:transform;align-items:center;">
                ${slidesHTML}
              </div>
            </div>

            <!-- Controles -->
            <div style="display:flex;justify-content:center;align-items:center;gap:14px;margin-top:16px;">
              <button id="${uid}-prev" aria-label="Anterior"
                style="width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
                       background:rgba(255,255,255,0.2);backdrop-filter:blur(6px);
                       -webkit-backdrop-filter:blur(6px);color:#fff;font-size:1.7rem;line-height:1;
                       box-shadow:0 2px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.3);
                       display:flex;align-items:center;justify-content:center;
                       transition:all 0.2s;padding:0;">&#8249;</button>
              <div id="${uid}-dots" style="display:flex;gap:9px;align-items:center;">
                ${dotsHTML}
              </div>
              <button id="${uid}-next" aria-label="Siguiente"
                style="width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
                       background:rgba(255,255,255,0.2);backdrop-filter:blur(6px);
                       -webkit-backdrop-filter:blur(6px);color:#fff;font-size:1.7rem;line-height:1;
                       box-shadow:0 2px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.3);
                       display:flex;align-items:center;justify-content:center;
                       transition:all 0.2s;padding:0;">&#8250;</button>
            </div>
          </div>
        </div>
      </div>`;

    this._initCarousel(uid, count);
  }

  _initCarousel(uid, total) {
    const outer   = document.getElementById(uid + '-outer');
    const track   = document.getElementById(uid + '-track');
    const dots    = document.getElementById(uid + '-dots').children;
    const prevBtn = document.getElementById(uid + '-prev');
    const nextBtn = document.getElementById(uid + '-next');

    let current = 0, dragStartX = 0, isDragging = false;

    const setDots = () => {
      for (let i = 0; i < dots.length; i++) {
        if (i === current) {
          dots[i].style.width      = '12px';
          dots[i].style.height     = '12px';
          dots[i].style.background = 'rgba(255,255,255,0.95)';
          dots[i].style.boxShadow  = '0 0 6px rgba(255,255,255,0.7)';
        } else {
          dots[i].style.width      = '9px';
          dots[i].style.height     = '9px';
          dots[i].style.background = 'rgba(255,255,255,0.38)';
          dots[i].style.boxShadow  = 'none';
        }
      }
    };

    const update = (animate) => {
      track.style.transition = animate
        ? 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)'
        : 'none';
      const w        = outer.offsetWidth;
      const ratio    = window.innerWidth >= 768 ? 0.5 : 0.75;
      const slideW   = w * ratio;
      const offset   = -(current * slideW) + (w - slideW) / 2;
      track.style.transform   = `translateX(${offset}px)`;
      prevBtn.style.opacity   = current === 0           ? '0.35' : '1';
      nextBtn.style.opacity   = current === total - 1   ? '0.35' : '1';
      setDots();
    };

    prevBtn.addEventListener('click', () => { if (current > 0)         { current--; update(true); } });
    nextBtn.addEventListener('click', () => { if (current < total - 1) { current++; update(true); } });

    /* Touch */
    outer.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; }, { passive: true });
    outer.addEventListener('touchend',   e => {
      const d = dragStartX - e.changedTouches[0].clientX;
      if (Math.abs(d) > 40) {
        current = d > 0 ? Math.min(total - 1, current + 1) : Math.max(0, current - 1);
        update(true);
      }
    }, { passive: true });

    /* Mouse drag */
    outer.addEventListener('mousedown', e => { isDragging = true; dragStartX = e.clientX; outer.style.cursor = 'grabbing'; });
    window.addEventListener('mouseup',  e => {
      if (!isDragging) return;
      isDragging = false;
      outer.style.cursor = 'grab';
      const d = dragStartX - e.clientX;
      if (Math.abs(d) > 40) {
        current = d > 0 ? Math.min(total - 1, current + 1) : Math.max(0, current - 1);
        update(true);
      }
    });

    window.addEventListener('resize', () => update(false));

    if (document.readyState === 'complete') {
      update(false);
    } else {
      window.addEventListener('load', () => update(false));
    }
    update(false);
  }
}

customElements.define('cork-mural-carousel', CorkMuralCarousel);
