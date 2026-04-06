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
 *   board       — Fondo del tablero de corcho:
 *                   vacío        → corcho ocre con textura por defecto
 *                   color CSS    → ej: "#2e5a8a" | "darkgreen" | "rgb(80,40,20)"
 *                   URL/ruta     → ej: "./img/madera.jpg" | "https://…/tex.png"
 *   title-color — Color del título principal (default: #000 negro)
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
    const icon       = this.getAttribute('icon')        || 'photo_library';
    const board      = (this.getAttribute('board') || '').trim();
    const titleColor = this.getAttribute('title-color')  || '#000';

    // Determina el estilo de fondo del tablero
    const _isImgUrl = v => /[/\\]/.test(v) || /\.(?:jpe?g|png|gif|webp|svg|avif)$/i.test(v) || /^https?:\/\//i.test(v);

    // El tablero exterior SIEMPRE tiene el corcho por defecto
    const boardBgStyle = "background-color:#c08a45;background-image:url('./actividades/fondo.jpg');background-size:cover;background-position:center;";

    // La tarjeta interior cambia según 'board'
    let innerCardStyle;
    if (!board) {
      // glassmorphism por defecto
      innerCardStyle = 'background:linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.07) 100%);backdrop-filter:blur(16px) saturate(1.6);-webkit-backdrop-filter:blur(16px) saturate(1.6);';
    } else if (_isImgUrl(board)) {
      const safeUrl = board.replace(/'/g, '%27').replace(/\)/g, '%29');
      innerCardStyle = `background-image:url('${safeUrl}');background-size:cover;background-position:center;`;
    } else {
      // color sólido con un overlay oscuro para mantener legibilidad
      innerCardStyle = `background:linear-gradient(135deg,${board}ee 0%,${board}bb 100%);`;
    }

    const rotations = [-1.2, 0.7, -0.5, 1.4, -0.9, 1.1, -1.6, 0.3];

    /* ── Slides ────────────────────────────────────────────── */
    const slidesHTML = Array.from({ length: count }, (_, i) => {
      const rot = rotations[i % rotations.length];
      return `
        <div class="cmc-slide" style="flex:0 0 75%;padding:0 8px;box-sizing:border-box;">
          <div class="cmc-photo-frame" style="background:#f5f0e8;padding:10px 10px 44px 10px;border-radius:3px;
                      box-shadow:0 8px 28px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.9);
                      transform:rotate(${rot}deg);cursor:pointer;" data-cmc-open>
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
      <div style="position:relative;margin:0 16px 14px;display:flex;justify-content:center;">
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
        " class="cmc-paper">
          ${subtitle ? `<div class="cmc-subtitle" style="
            font-family:'Lilita One',Georgia,serif;
            font-size:1.6rem;
            font-weight:400;
            color:#e0069a;
            margin-bottom:9px;
            text-align:center;
            letter-spacing:1px;
            text-transform:uppercase;
            line-height:1.1;
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
      s.textContent = '.cmc-nav-btn{position:relative;overflow:hidden;width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(145deg,#ef5350,#c62828,#8e0000);color:#fff;font-size:2.2rem;line-height:1;box-shadow:0 6px 0 #5a0000,0 10px 22px rgba(183,28,28,0.55),inset 0 2px 0 rgba(255,255,255,0.45),inset 0 -2px 0 rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;padding:0;transform:translateY(0);transition:box-shadow 0.14s ease,transform 0.14s ease,background 0.18s ease;}.cmc-nav-btn::after{content:"";position:absolute;top:4px;left:7px;width:56%;height:36%;background:radial-gradient(ellipse at 35% 35%,rgba(255,255,255,0.62) 0%,rgba(255,255,255,0.18) 45%,transparent 70%);border-radius:50%;pointer-events:none;}.cmc-nav-btn:hover{background:linear-gradient(145deg,#ff6b68,#ef5350,#b71c1c);box-shadow:0 8px 0 #5a0000,0 14px 28px rgba(198,40,40,0.65),inset 0 2px 0 rgba(255,255,255,0.52),inset 0 -2px 0 rgba(0,0,0,0.3);transform:translateY(-3px);}.cmc-nav-btn:active{background:linear-gradient(145deg,#b71c1c,#8e0000);box-shadow:0 2px 0 #5a0000,0 4px 8px rgba(183,28,28,0.4),inset 0 3px 6px rgba(0,0,0,0.28),inset 0 -1px 0 rgba(255,255,255,0.1);transform:translateY(4px);}.cmc-desc{line-height:1.2 !important;}@media(min-width:768px){.cmc-subtitle{font-size:2.0rem !important;line-height:1.05 !important;margin-bottom:5px !important;}.cmc-desc{font-size:1.3rem !important;line-height:1.15 !important;}.cmc-paper{padding:12px 18px 10px !important;}.cmc-main-title{margin-bottom:8px !important;}.cmc-slide{flex:0 0 33.333% !important;}.cmc-wrapper{max-width:1200px !important;}}@media(max-width:767px){.cmc-wrapper{width:95vw !important;max-width:95vw !important;padding:0 !important;}.cmc-photo-frame{padding:4px 4px 28px 4px !important;}.cmc-slide{flex:0 0 88% !important;}.cmc-paper{padding:10px 12px 10px !important;margin:0 6px 10px !important;}.cmc-subtitle{font-size:1.0rem !important;}.cmc-desc{font-size:0.8rem !important;line-height:1.35 !important;}.cmc-main-title{font-size:1.05rem !important;}.cmc-modal-wrap{padding:0 !important;}.cmc-modal-img{max-width:100% !important;max-height:100dvh !important;padding:0 !important;background:transparent !important;border-radius:0 !important;box-shadow:none !important;}}'
      document.head.appendChild(s);
    }
    this.innerHTML = `
      <div class="cmc-wrapper" style="margin:24px auto 30px;max-width:1200px;padding:0 16px;box-sizing:border-box;">

        <!-- Pizarra de corcho -->
        <div style="
          ${boardBgStyle}
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
            ${innerCardStyle}
            border-radius:14px;
            border:1px solid rgba(255,255,255,0.38);
            box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.35);
            padding:20px 10px 18px;
            overflow:visible;
          ">
            <!-- Título principal -->
            <div style="text-align:center;margin-bottom:12px;padding:0 20px;">
              <h3 class="cmc-main-title" style="color:${titleColor};font-size:1.3rem;font-weight:700;margin:0;
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
              <button id="${uid}-prev" class="cmc-nav-btn" aria-label="Anterior">&#8249;</button>
              <div id="${uid}-dots" style="display:flex;gap:9px;align-items:center;">
                ${dotsHTML}
              </div>
              <button id="${uid}-next" class="cmc-nav-btn" aria-label="Siguiente">&#8250;</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal zoom -->
      <style>
        @media(max-width:640px){
          .cmc-modal-wrap{
            align-items:flex-start!important;
            overflow-y:auto!important;
            -webkit-overflow-scrolling:touch;
          }
          .cmc-modal-img{
            max-width:calc(100% - 24px)!important;
            max-height:70vh!important;
            margin:auto!important;
          }
        }
      </style>
      <div id="${uid}-modal" class="cmc-modal-wrap" style="
        display:none;position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,0.88);
        align-items:center;justify-content:center;
        padding:16px;box-sizing:border-box;
        cursor:zoom-out;
      ">
        <!-- Prev modal -->
        <button id="${uid}-modal-prev" aria-label="Anterior" style="
          position:fixed;left:12px;top:50%;transform:translateY(-50%);
          width:46px;height:46px;border-radius:50%;border:none;
          background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);
          color:#fff;font-size:2rem;line-height:1;
          box-shadow:0 2px 12px rgba(0,0,0,0.5);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          padding:0;z-index:1;
        ">&#8249;</button>
        <img id="${uid}-modal-img" class="cmc-modal-img" src="" alt="" style="
          max-width:calc(100% - 120px);max-height:90vh;
          border-radius:4px;
          box-shadow:0 0 60px rgba(0,0,0,0.8);
          background:#f5f0e8;
          padding:10px 10px 32px;
          object-fit:contain;
          transform:scale(0.85);opacity:0;
          transition:transform 0.28s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s ease;
          cursor:default;
        ">
        <!-- Next modal -->
        <button id="${uid}-modal-next" aria-label="Siguiente" style="
          position:fixed;right:12px;top:50%;transform:translateY(-50%);
          width:46px;height:46px;border-radius:50%;border:none;
          background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);
          color:#fff;font-size:2rem;line-height:1;
          box-shadow:0 2px 12px rgba(0,0,0,0.5);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          padding:0;z-index:1;
        ">&#8250;</button>
        <button id="${uid}-modal-close" aria-label="Cerrar" style="
          position:fixed;top:18px;right:18px;
          width:42px;height:42px;border-radius:50%;border:none;
          background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);
          color:#fff;font-size:1.6rem;line-height:1;
          box-shadow:0 2px 12px rgba(0,0,0,0.5);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          padding:0;
        ">&#10005;</button>
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
      const ratio    = window.innerWidth >= 768 ? 0.5 : 0.88;
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

    /* ── Modal zoom ───────────────────────────────────────── */
    const modal      = document.getElementById(uid + '-modal');
    const modalImg   = document.getElementById(uid + '-modal-img');
    const closeBtn   = document.getElementById(uid + '-modal-close');
    const modalPrev  = document.getElementById(uid + '-modal-prev');
    const modalNext  = document.getElementById(uid + '-modal-next');
    let   modalIndex = 0;
    let   _modalOpenAt = 0;   // guard contra ghost-tap

    // Recolecta las fotos del carrusel en orden
    const getImgs = () => Array.from(track.querySelectorAll('img'));

    const showModalImg = (idx, dir) => {
      const imgs = getImgs();
      if (idx < 0 || idx >= imgs.length) return;
      modalIndex = idx;
      const img = imgs[idx];
      // animación de slide
      const outX = dir > 0 ? '-60px' : '60px';
      modalImg.style.transition = 'none';
      modalImg.style.transform  = `translateX(${dir === 0 ? '0' : outX.replace('-','')}) scale(${dir === 0 ? 0.85 : 1})`;
      modalImg.style.opacity    = dir === 0 ? '0' : '0';
      requestAnimationFrame(() => {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalImg.style.transition = 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s ease';
        requestAnimationFrame(() => {
          modalImg.style.transform = 'translateX(0) scale(1)';
          modalImg.style.opacity   = '1';
        });
      });
      modalPrev.style.opacity = idx === 0              ? '0.3' : '1';
      modalNext.style.opacity = idx === imgs.length-1  ? '0.3' : '1';
      // sincroniza el carrusel principal
      current = idx;
      update(true);
    };

    const openModal = (idx) => {
      _modalOpenAt = Date.now();
      modalIndex = idx;
      const imgs = getImgs();
      modalImg.src = imgs[idx].src;
      modalImg.alt = imgs[idx].alt;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      modalImg.style.transition = 'none';
      modalImg.style.transform  = 'scale(0.85)';
      modalImg.style.opacity    = '0';
      modalPrev.style.opacity   = idx === 0             ? '0.3' : '1';
      modalNext.style.opacity   = idx === imgs.length-1 ? '0.3' : '1';
      requestAnimationFrame(() => {
        modalImg.style.transition = 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s ease';
        requestAnimationFrame(() => {
          modalImg.style.transform = 'scale(1)';
          modalImg.style.opacity   = '1';
        });
      });
    };

    const closeModal = () => {
      modalImg.style.transform = 'scale(0.85)';
      modalImg.style.opacity   = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }, 260);
    };

    // clicks en las fotos (distingue drag de tap)
    track.addEventListener('click', e => {
      const card = e.target.closest('[data-cmc-open]');
      if (!card) return;
      if (Math.abs(dragStartX - e.clientX) > 6) return;
      const idx = Array.from(track.querySelectorAll('[data-cmc-open]')).indexOf(card);
      openModal(idx >= 0 ? idx : 0);
    });
    // tap en mobile
    let touchStartX = 0, touchStartY = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = Math.abs(touchStartX - e.changedTouches[0].clientX);
      const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
      if (dx > 12 || dy > 12) return;
      const card = e.target.closest('[data-cmc-open]');
      if (!card) return;
      const idx = Array.from(track.querySelectorAll('[data-cmc-open]')).indexOf(card);
      openModal(idx >= 0 ? idx : 0);
    }, { passive: true });

    // Botones modal
    modalPrev.addEventListener('click', e => { e.stopPropagation(); if (modalIndex > 0) showModalImg(modalIndex - 1, -1); });
    modalNext.addEventListener('click', e => { e.stopPropagation(); if (modalIndex < getImgs().length - 1) showModalImg(modalIndex + 1, 1); });

    // Swipe dentro del modal
    let mSwipeX = 0;
    modal.addEventListener('touchstart', e => { mSwipeX = e.touches[0].clientX; }, { passive: true });
    modal.addEventListener('touchend', e => {
      const d = mSwipeX - e.changedTouches[0].clientX;
      if (Math.abs(d) < 40) return;
      if (d > 0 && modalIndex < getImgs().length - 1) showModalImg(modalIndex + 1,  1);
      if (d < 0 && modalIndex > 0)                    showModalImg(modalIndex - 1, -1);
    }, { passive: true });

    modal.addEventListener('click', e => {
      if (Date.now() - _modalOpenAt < 400) return; // ignorar ghost-tap
      if (e.target === modal) closeModal();
    });
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (modal.style.display !== 'flex') return;
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowRight' && modalIndex < getImgs().length - 1) showModalImg(modalIndex + 1,  1);
      if (e.key === 'ArrowLeft'  && modalIndex > 0)                    showModalImg(modalIndex - 1, -1);
    });

    if (document.readyState === 'complete') {
      update(false);
    } else {
      window.addEventListener('load', () => update(false));
    }
    update(false);
  }
}

customElements.define('cork-mural-carousel', CorkMuralCarousel);
