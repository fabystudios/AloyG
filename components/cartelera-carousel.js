(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('cartelera-carousel-css')) return;
    const style = document.createElement('style');
    style.id = 'cartelera-carousel-css';
    style.textContent = `
      cartelera-carousel {
        display: block;
      }

      /* ── WRAPPER ── */
      .cc-wrap {
        position: relative;
        background: linear-gradient(
          135deg,
          rgba(8, 4, 28, 0.94) 0%,
          rgba(18, 6, 48, 0.91) 50%,
          rgba(6, 12, 40, 0.94) 100%
        );
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border: 1px solid rgba(150, 100, 255, 0.22);
        border-radius: 28px;
        padding: 2rem 1.75rem 1.5rem;
        margin: 1.5rem 1rem;
        overflow: hidden;
        box-shadow:
          0 32px 72px rgba(0, 0, 0, 0.65),
          0 0 0 1px rgba(255, 255, 255, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.09);
      }

      /* Ambient glow */
      .cc-glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: 28px;
        background:
          radial-gradient(ellipse at 20% 10%, rgba(130, 60, 255, 0.13) 0%, transparent 55%),
          radial-gradient(ellipse at 78% 88%, rgba(60, 100, 255, 0.10) 0%, transparent 55%);
      }

      /* ── HEADER ── */
      .cc-header {
        position: relative;
        z-index: 1;
        text-align: center;
        margin-bottom: 1.8rem;
      }

      .cc-title-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .cc-title-pin {
        font-size: 2.2rem;
        animation: cc-pin-sway 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 14px rgba(200, 140, 255, 0.85));
        display: inline-block;
      }

      @keyframes cc-pin-sway {
        0%, 100% { transform: rotate(-12deg) translateY(0); }
        50%       { transform: rotate(12deg) translateY(-6px); }
      }

      .cc-title-text h2 {
        margin: 0;
        font-size: clamp(1.45rem, 4.5vw, 2.4rem);
        font-weight: 900;
        letter-spacing: -0.5px;
        line-height: 1.1;
        background: linear-gradient(135deg, #e0b4ff 0%, #a5b4fc 50%, #7dd3fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .cc-title-text p {
        margin: 0.35rem 0 0;
        color: rgba(200, 175, 255, 0.5);
        font-size: 0.78rem;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        font-weight: 500;
      }

      .cc-header-divider {
        width: 64px;
        height: 3px;
        background: linear-gradient(90deg, #c084fc, #818cf8, transparent);
        border-radius: 2px;
        margin: 0.9rem auto 0;
      }

      /* ── CAROUSEL AREA ── */
      .cc-carousel-area {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .cc-viewport {
        flex: 1;
        overflow: hidden;
        border-radius: 18px;
      }

      .cc-track {
        display: flex;
        will-change: transform;
        transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .cc-slide {
        flex-shrink: 0;
        padding: 0 6px;
        box-sizing: border-box;
      }

      /* ── CARD ── */
      .cc-card {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        cursor: pointer;
        aspect-ratio: 2 / 3;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.11);
        box-shadow:
          0 10px 36px rgba(0, 0, 0, 0.48),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transition: transform 0.35s ease, box-shadow 0.35s ease;
        outline: none;
      }

      .cc-card:hover,
      .cc-card:focus-visible {
        transform: translateY(-10px) scale(1.025);
        box-shadow:
          0 28px 58px rgba(0, 0, 0, 0.58),
          0 0 44px rgba(140, 80, 255, 0.28),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }

      .cc-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.5s ease;
        user-select: none;
        pointer-events: none;
      }

      .cc-card:hover img,
      .cc-card:focus-visible img {
        transform: scale(1.07);
      }

      .cc-card-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(60, 10, 180, 0.78) 0%,
          rgba(40, 10, 120, 0.32) 38%,
          transparent 65%
        );
        opacity: 0;
        transition: opacity 0.35s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cc-card:hover .cc-card-overlay,
      .cc-card:focus-visible .cc-card-overlay {
        opacity: 1;
      }

      .cc-zoom-icon {
        width: 62px;
        height: 62px;
        background: rgba(255, 255, 255, 0.96);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.38);
        transform: scale(0.65) translateY(12px);
        opacity: 0;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      }

      .cc-zoom-icon svg {
        width: 27px;
        height: 27px;
        color: #7c3aed;
      }

      .cc-card:hover .cc-zoom-icon,
      .cc-card:focus-visible .cc-zoom-icon {
        transform: scale(1) translateY(0);
        opacity: 1;
      }

      .cc-card-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, transparent 100%);
        color: rgba(255, 255, 255, 0.96);
        font-size: 0.82rem;
        font-weight: 700;
        padding: 2rem 0.8rem 0.75rem;
        text-align: center;
        letter-spacing: 0.4px;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      }

      /* ── 3D NAV BUTTONS ── */
      .cc-nav-btn {
        flex-shrink: 0;
        width: 54px;
        height: 54px;
        background: none;
        border: none;
        padding: 3px;
        cursor: pointer;
        border-radius: 50%;
        transition: opacity 0.3s ease;
        outline: none;
      }

      .cc-btn-3d {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(145deg, #8b5cf6, #6d28d9);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 6px 0 #3b0764,
          0 9px 18px rgba(109, 40, 217, 0.55),
          inset 0 1px 0 rgba(255, 255, 255, 0.32),
          inset 0 -1px 0 rgba(0, 0, 0, 0.22);
        transition: box-shadow 0.14s ease, transform 0.14s ease, background 0.2s ease;
      }

      .cc-nav-btn svg {
        width: 22px;
        height: 22px;
        color: white;
        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
        position: relative;
        z-index: 1;
      }

      .cc-nav-btn:hover .cc-btn-3d,
      .cc-nav-btn:focus-visible .cc-btn-3d {
        background: linear-gradient(145deg, #a78bfa, #7c3aed);
        box-shadow:
          0 8px 0 #3b0764,
          0 14px 26px rgba(124, 58, 237, 0.65),
          inset 0 1px 0 rgba(255, 255, 255, 0.38),
          inset 0 -1px 0 rgba(0, 0, 0, 0.22);
        transform: translateY(-3px);
      }

      .cc-nav-btn:active .cc-btn-3d {
        background: linear-gradient(145deg, #6d28d9, #5b21b6);
        box-shadow:
          0 2px 0 #3b0764,
          0 4px 8px rgba(109, 40, 217, 0.4),
          inset 0 3px 6px rgba(0, 0, 0, 0.28),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1);
        transform: translateY(4px);
      }

      /* ── DOTS ── */
      .cc-dots {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 1.3rem;
      }

      .cc-dot {
        width: 7px;
        height: 7px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        padding: 0;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.35s ease;
      }

      .cc-dot.active {
        width: 26px;
        background: linear-gradient(90deg, #c084fc, #818cf8);
        box-shadow: 0 2px 10px rgba(192, 132, 252, 0.55);
      }

      /* ── LIGHTBOX ── */
      .cc-lightbox {
        position: fixed;
        inset: 0;
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cc-lightbox.open {
        opacity: 1;
        pointer-events: auto;
      }

      .cc-lb-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(4, 0, 18, 0.95);
        backdrop-filter: blur(26px);
        -webkit-backdrop-filter: blur(26px);
      }

      .cc-lb-inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 4rem 1rem 3rem;
        box-sizing: border-box;
      }

      .cc-lb-nav-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        max-width: 1200px;
      }

      .cc-lb-img-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 82vw;
        max-height: 76vh;
      }

      .cc-lb-img {
        max-width: 100%;
        max-height: 76vh;
        object-fit: contain;
        border-radius: 16px;
        box-shadow:
          0 40px 100px rgba(0, 0, 0, 0.82),
          0 0 60px rgba(140, 80, 255, 0.14);
        transition: opacity 0.22s ease;
        display: block;
      }

      .cc-lb-img.cc-loading {
        opacity: 0.3;
      }

      .cc-lb-nav-btn {
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: background 0.22s, transform 0.22s, box-shadow 0.22s;
        outline: none;
      }

      .cc-lb-nav-btn:hover,
      .cc-lb-nav-btn:focus-visible {
        background: rgba(140, 80, 255, 0.38);
        border-color: rgba(160, 100, 255, 0.52);
        transform: scale(1.12);
        box-shadow: 0 0 22px rgba(140, 80, 255, 0.32);
      }

      .cc-lb-nav-btn svg {
        width: 22px;
        height: 22px;
      }

      .cc-lb-close {
        position: fixed;
        top: 1.2rem;
        right: 1.2rem;
        z-index: 2;
        width: 50px;
        height: 50px;
        background: rgba(210, 30, 30, 0.88);
        border: 2px solid rgba(255, 100, 100, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        box-shadow: 0 4px 20px rgba(210, 30, 30, 0.55), 0 0 0 4px rgba(210, 30, 30, 0.18);
        transition: background 0.22s, transform 0.25s, border-color 0.22s, box-shadow 0.22s;
        outline: none;
      }

      .cc-lb-close:hover,
      .cc-lb-close:focus-visible {
        background: rgba(230, 50, 50, 1);
        border-color: rgba(255, 130, 130, 0.85);
        box-shadow: 0 6px 28px rgba(220, 40, 40, 0.75), 0 0 0 6px rgba(220, 40, 40, 0.22);
        transform: scale(1.12) rotate(90deg);
      }

      .cc-lb-close svg {
        width: 20px;
        height: 20px;
      }

      .cc-lb-caption {
        margin-top: 1rem;
        color: rgba(255, 255, 255, 0.72);
        font-size: 0.88rem;
        font-weight: 600;
        text-align: center;
        letter-spacing: 0.5px;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(8px);
        padding: 0.35rem 1.2rem;
        border-radius: 20px;
        min-height: 1.5rem;
      }

      /* ── INFO BUTTON (card) ── */
      .cc-card-info {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 4;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: none;
        background: transparent;
        box-shadow:
          0 4px 14px rgba(0, 0, 0, 0.38);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
        outline: none;
        padding: 0;
      }

      .cc-info-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 50%;
        display: block;
        filter: drop-shadow(0 3px 8px rgba(0,0,0,0.45));
        background: linear-gradient(145deg, #fcd34d, #f59e0b);
      }

      .cc-card-info:hover,
      .cc-card-info:focus-visible {
        transform: translateY(-4px) scale(1.12);
        box-shadow:
          0 10px 28px rgba(0, 0, 0, 0.45);
      }

      .cc-card-info:active {
        transform: translateY(3px) scale(0.95);
        box-shadow:
          0 2px 6px rgba(0, 0, 0, 0.3);
      }

      /* ── INFO BUTTON (lightbox) ── */
      .cc-lb-info {
        position: fixed;
        top: 1.2rem;
        left: 1.2rem;
        z-index: 2;
        width: 62px;
        height: 62px;
        background: transparent;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 6px 22px rgba(0,0,0,0.45);
        transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
        outline: none;
        padding: 0;
      }

      .cc-lb-info img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 50%;
        display: block;
        filter: drop-shadow(0 3px 10px rgba(0,0,0,0.5));
      }

      .cc-lb-info:hover,
      .cc-lb-info:focus-visible {
        transform: translateY(-4px) scale(1.12);
        box-shadow: 0 14px 34px rgba(0,0,0,0.55);
      }

      .cc-lb-info:active {
        transform: translateY(3px) scale(0.95);
        box-shadow: 0 2px 8px rgba(0,0,0,0.32);
      }

      .cc-lb-info-hidden {
        display: none !important;
      }

      /* ── MOBILE ── */
      @media (max-width: 768px) {
        .cc-wrap {
          padding: 1.5rem 0.75rem 1.25rem;
          margin: 1rem 0.5rem;
          border-radius: 20px;
        }

        .cc-header {
          margin-bottom: 1.4rem;
        }

        .cc-title-pin {
          font-size: 1.7rem;
        }

        .cc-title-text h2 {
          font-size: 1.45rem;
        }

        /* Cards taller on mobile to show full portrait poster */
        .cc-card {
          aspect-ratio: 9 / 16;
        }

        .cc-nav-btn {
          width: 44px;
          height: 44px;
        }

        .cc-nav-btn svg {
          width: 18px;
          height: 18px;
        }

        /* ── Lightbox mobile: imagen ocupa todo el viewport ── */
        .cc-lb-inner {
          padding: 0;
        }

        .cc-lb-nav-row {
          position: relative;
          width: 100vw;
          height: 100dvh;
          max-width: 100vw;
          gap: 0;
          align-items: stretch;
        }

        .cc-lb-img-wrap {
          position: absolute;
          inset: 0;
          max-width: 100vw;
          max-height: 100dvh;
          width: 100vw;
          height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cc-lb-img {
          width: 100%;
          height: 100%;
          max-width: 100vw;
          max-height: 100dvh;
          object-fit: contain;
          border-radius: 0;
        }

        /* Controles sobre la imagen */
        .cc-lb-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 48px;
          height: 48px;
          background: rgba(0, 0, 0, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          flex-shrink: 0;
        }

        .cc-lb-nav-btn svg {
          width: 20px;
          height: 20px;
        }

        .cc-lb-prev {
          left: 14px;
        }

        .cc-lb-next {
          right: 14px;
        }

        .cc-lb-nav-btn:hover,
        .cc-lb-nav-btn:focus-visible {
          transform: translateY(-50%) scale(1.1);
        }

        /* Caption fijo al fondo */
        .cc-lb-caption {
          position: fixed;
          bottom: 1.4rem;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          z-index: 10;
        }
      }

      /* ── BURBUJAS + CHISPAS al abrir lightbox ── */
      .cc-bubble {
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10001;
        background: radial-gradient(circle at 30% 30%,
          rgba(200, 160, 255, 0.7),
          rgba(100, 80, 220, 0.4) 50%,
          rgba(60, 40, 180, 0.15) 100%);
        box-shadow:
          inset -4px -4px 8px rgba(255,255,255,0.25),
          inset 2px 2px 4px rgba(255,255,255,0.4),
          0 0 12px rgba(150, 100, 255, 0.3);
        animation: ccBubbleRise var(--dur) ease-out forwards;
        will-change: transform, opacity;
      }
      .cc-bubble::after {
        content: '';
        position: absolute;
        top: 18%; left: 22%;
        width: 30%; height: 20%;
        background: rgba(255,255,255,0.55);
        border-radius: 50%;
        transform: rotate(-30deg);
        filter: blur(1px);
      }
      @keyframes ccBubbleRise {
        0%   { transform: translate(0, 0) scale(0.3); opacity: 0; }
        15%  { opacity: 1; transform: translate(var(--dx1), var(--dy1)) scale(1); }
        70%  { opacity: 0.9; transform: translate(var(--dx2), var(--dy2)) scale(var(--s)); }
        85%  { opacity: 1; transform: translate(var(--dx3), var(--dy3)) scale(calc(var(--s) * 1.25)); }
        100% { opacity: 0; transform: translate(var(--dx3), var(--dy3)) scale(0); }
      }

      /* Chispas (sparks) al explotar */
      .cc-spark {
        position: fixed;
        width: 4px; height: 4px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10002;
        animation: ccSparkBurst var(--sdur) ease-out forwards;
        will-change: transform, opacity;
      }
      @keyframes ccSparkBurst {
        0%   { transform: translate(0,0) scale(1); opacity: 1; }
        60%  { opacity: 1; }
        100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
      }

      /* Estrellita flash al pop */
      .cc-pop-star {
        position: fixed;
        pointer-events: none;
        z-index: 10002;
        font-size: 14px;
        animation: ccPopStar 0.5s ease-out forwards;
        will-change: transform, opacity;
      }
      @keyframes ccPopStar {
        0%   { transform: scale(0) rotate(0deg); opacity: 1; }
        50%  { transform: scale(1.4) rotate(180deg); opacity: 1; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
      }

      /* ── Magic Dots: flotan constantemente ── */
      .cc-magic-dot {
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10001;
        animation: ccDotFloat var(--ddur) ease-in-out infinite;
        will-change: transform, opacity;
        filter: blur(0.5px);
      }
      @keyframes ccDotFloat {
        0%   { transform: translate(0, 0) scale(1); opacity: 0; }
        10%  { opacity: var(--dopa); }
        50%  { transform: translate(var(--ddx), var(--ddy)) scale(var(--ds)); opacity: var(--dopa); }
        90%  { opacity: var(--dopa); }
        100% { transform: translate(var(--ddx2), var(--ddy2)) scale(1); opacity: 0; }
      }

      /* Dot twinkle variation */
      .cc-magic-dot.twinkle {
        animation: ccDotTwinkle var(--ddur) ease-in-out infinite;
      }
      @keyframes ccDotTwinkle {
        0%, 100% { opacity: 0.15; transform: scale(0.6); }
        25%      { opacity: var(--dopa); transform: scale(1.3); }
        50%      { opacity: 0.3; transform: scale(0.8); }
        75%      { opacity: var(--dopa); transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════
     WEB COMPONENT
  ══════════════════════════════════════════ */
  class CartelleraCarousel extends HTMLElement {

    connectedCallback() {
      injectStyles();

      this._basePath = this.getAttribute('base-path') || './actividades/cartelera/';
      try {
        this._slides = JSON.parse(this.getAttribute('slides') || '[]');
      } catch (e) {
        this._slides = [];
      }

      this._current = 0;
      this._lbIndex = 0;
      this._lbOpen  = false;

      this.innerHTML = this._buildHTML();
      this._bindEvents();
      this._updateTrack(false);
    }

    /* ── HTML ── */
    _buildHTML() {
      const bp     = this._basePath;
      const slides = this._slides;

      const infoIcon = `<img src="./actividades/info.png" alt="Información" class="cc-info-img" />`;

      const slidesHTML = slides.map((s, i) => `
        <div class="cc-slide" data-i="${i}">
          <div class="cc-card" role="button" tabindex="0"
               aria-label="Ver afiche${s.title ? ': ' + s.title : ''}">
            <img src="${bp}${s.mob}"
                 alt="${s.title || 'Actividad parroquial'}"
                 loading="lazy" />
            <div class="cc-card-overlay">
              <div class="cc-zoom-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8"  x2="11"    y2="14"/>
                  <line x1="8"  y1="11" x2="14"    y2="11"/>
                </svg>
              </div>
            </div>
            ${s.title ? `<div class="cc-card-caption">${s.title}</div>` : ''}
            ${s.anchor ? `<a class="cc-card-info" href="${s.anchor}"
               ${s.anchor.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'}
               aria-label="Más información${s.title ? ' sobre ' + s.title : ''}"
               title="Más información">${infoIcon}</a>` : ''}
          </div>
        </div>
      `).join('');

      const dotsHTML = slides.map((_, i) =>
        `<button class="cc-dot${i === 0 ? ' active' : ''}"
                 aria-label="Afiche ${i + 1}"></button>`
      ).join('');

      const chevronL = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>`;
      const chevronR = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>`;
      const closeIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6"  x2="6"  y2="18"/>
          <line x1="6"  y1="6"  x2="18" y2="18"/>
        </svg>`;
      const infoIcon2 = infoIcon; // already defined above
      const searchIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>`;

      return `
        <div class="cc-wrap">
          <div class="cc-glow"></div>

          <!-- Header -->
          <div class="cc-header">
            <div class="cc-title-row">
              <span class="cc-title-pin" aria-hidden="true">📌</span>
              <div class="cc-title-text">
                <h2>Cartelera de Novedades</h2>
                <p>Actividades y eventos de nuestra comunidad</p>
              </div>
            </div>
            <div class="cc-header-divider"></div>
          </div>

          <!-- Carousel -->
          <div class="cc-carousel-area">
            <button class="cc-nav-btn cc-prev" aria-label="Anterior">
              <div class="cc-btn-3d">${chevronL}</div>
            </button>

            <div class="cc-viewport">
              <div class="cc-track">${slidesHTML}</div>
            </div>

            <button class="cc-nav-btn cc-next" aria-label="Siguiente">
              <div class="cc-btn-3d">${chevronR}</div>
            </button>
          </div>

          <!-- Dots -->
          <div class="cc-dots">${dotsHTML}</div>
        </div>

        <!-- Lightbox -->
        <div class="cc-lightbox" role="dialog" aria-modal="true"
             aria-label="Vista ampliada del afiche">
          <div class="cc-lb-backdrop"></div>

          <button class="cc-lb-close" aria-label="Cerrar">${closeIcon}</button>
          <a class="cc-lb-info cc-lb-info-hidden" href="#" target="_blank"
             rel="noopener noreferrer" aria-label="Más información">${infoIcon}</a>

          <div class="cc-lb-inner">
            <div class="cc-lb-nav-row">
              <button class="cc-lb-nav-btn cc-lb-prev" aria-label="Afiche anterior">
                ${chevronL}
              </button>

              <div class="cc-lb-img-wrap">
                <img class="cc-lb-img" src="" alt="" />
              </div>

              <button class="cc-lb-nav-btn cc-lb-next" aria-label="Afiche siguiente">
                ${chevronR}
              </button>
            </div>

            <div class="cc-lb-caption"></div>
          </div>
        </div>
      `;
    }

    /* ── EVENTS ── */
    _bindEvents() {
      // Carousel navigation
      this.querySelector('.cc-prev').addEventListener('click', () => this.prev());
      this.querySelector('.cc-next').addEventListener('click', () => this.next());

      // Cards
      this.querySelectorAll('.cc-card').forEach((card, i) => {
        card.addEventListener('click', () => this.showLightbox(i));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.showLightbox(i);
          }
        });
      });

      // Info buttons on cards — stop propagation so they don't open the lightbox
      this.querySelectorAll('.cc-card-info').forEach(btn => {
        btn.addEventListener('click', (e) => e.stopPropagation());
      });

      // Dots
      this.querySelectorAll('.cc-dot').forEach((dot, i) => {
        dot.addEventListener('click', () => this.goTo(i));
      });

      // Lightbox controls — close on backdrop OR on any click outside the image
      this.querySelector('.cc-lb-backdrop').addEventListener('click', () => this.closeLightbox());
      this.querySelector('.cc-lb-close').addEventListener('click',    () => this.closeLightbox());
      this.querySelector('.cc-lb-prev').addEventListener('click',     (e) => { e.stopPropagation(); this.lbPrev(); });
      this.querySelector('.cc-lb-next').addEventListener('click',     (e) => { e.stopPropagation(); this.lbNext(); });
      // Clicking the lightbox area outside the image row also closes it
      this.querySelector('.cc-lightbox').addEventListener('click',    () => this.closeLightbox());
      this.querySelector('.cc-lb-nav-row').addEventListener('click',  (e) => e.stopPropagation());
      this.querySelector('.cc-lb-caption').addEventListener('click',  (e) => e.stopPropagation());

      // Keyboard
      this._keyHandler = (e) => {
        if (!this._lbOpen) return;
        if (e.key === 'Escape')     this.closeLightbox();
        if (e.key === 'ArrowLeft')  this.lbPrev();
        if (e.key === 'ArrowRight') this.lbNext();
      };
      document.addEventListener('keydown', this._keyHandler);

      // Swipe on carousel
      let swipeX = 0;
      const vp = this.querySelector('.cc-viewport');
      vp.addEventListener('touchstart', (e) => { swipeX = e.touches[0].clientX; }, { passive: true });
      vp.addEventListener('touchend',   (e) => {
        const d = swipeX - e.changedTouches[0].clientX;
        if (Math.abs(d) > 45) d > 0 ? this.next() : this.prev();
      });

      // Swipe on lightbox
      let lbSwipeX = 0;
      const lbInner = this.querySelector('.cc-lb-inner');
      lbInner.addEventListener('touchstart', (e) => { lbSwipeX = e.touches[0].clientX; }, { passive: true });
      lbInner.addEventListener('touchend',   (e) => {
        const d = lbSwipeX - e.changedTouches[0].clientX;
        if (Math.abs(d) > 45) d > 0 ? this.lbNext() : this.lbPrev();
      });

      // Responsive resize
      window.addEventListener('resize', () => {
        const mi = this._maxIndex();
        if (this._current > mi) this._current = mi;
        this._updateTrack(false);
      });
    }

    /* ── HELPERS ── */
    _isMobile()    { return window.innerWidth <= 768; }
    _visibleCount(){ return this._isMobile() ? 1 : 3; }
    _maxIndex()    { return Math.max(0, this._slides.length - this._visibleCount()); }

    _updateTrack(animate = true) {
      const track = this.querySelector('.cc-track');
      const vc    = this._visibleCount();
      const sw    = 100 / vc;

      this.querySelectorAll('.cc-slide').forEach(s => {
        s.style.width = sw + '%';
      });

      track.style.transition = animate
        ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      track.style.transform = `translateX(-${this._current * sw}%)`;

      // Dots
      this.querySelectorAll('.cc-dot').forEach((d, i) => {
        d.classList.toggle('active', i === this._current);
      });

      // Button states
      const mi   = this._maxIndex();
      const prev = this.querySelector('.cc-prev');
      const next = this.querySelector('.cc-next');
      prev.style.opacity       = this._current === 0  ? '0.3' : '1';
      prev.style.pointerEvents = this._current === 0  ? 'none' : 'auto';
      next.style.opacity       = this._current >= mi  ? '0.3' : '1';
      next.style.pointerEvents = this._current >= mi  ? 'none' : 'auto';
    }

    /* ── CAROUSEL API ── */
    prev()  { if (this._current > 0)             { this._current--; this._updateTrack(); } }
    next()  { if (this._current < this._maxIndex()) { this._current++; this._updateTrack(); } }
    goTo(i) { this._current = Math.min(Math.max(0, i), this._maxIndex()); this._updateTrack(); }

    /* ── LIGHTBOX API ── */
    showLightbox(i) {
      this._lbIndex = i;
      this._lbOpen  = true;
      // Teleport lightbox to body to avoid ancestor transforms/backdrop-filter
      // breaking position:fixed on mobile
      const lb = this.querySelector('.cc-lightbox');
      if (lb && lb.parentElement !== document.body) {
        this._lbPlaceholder = document.createComment('cc-lb-placeholder');
        lb.parentElement.insertBefore(this._lbPlaceholder, lb);
        document.body.appendChild(lb);
        this._lbEl = lb;
      }
      this._renderLightboxSlide();
      this._lb().classList.add('open');
      /* Lock scroll WITHOUT removing scrollbar (prevents calc(-50vw+50%) shift) */
      this._savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this._savedScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
      this._startMagicEffects();
    }

    /* ── Magic Effects: continuous bubbles + dots ── */
    _startMagicEffects() {
      this._stopMagicEffects(); // limpiar si quedó algo
      this._magicEls = [];

      // Spawn magic dots (persistent, float around the lightbox)
      this._spawnMagicDots();

      // Spawn initial burst of bubbles
      this._spawnBubbleWave();

      // Keep spawning bubbles every ~2.5s
      this._bubbleInterval = setInterval(() => {
        if (!this._lbOpen) return;
        this._spawnBubbleWave();
      }, 2500);

      // Refresh magic dots every 6s to keep them alive
      this._dotInterval = setInterval(() => {
        if (!this._lbOpen) return;
        this._spawnMagicDots();
      }, 6000);
    }

    _stopMagicEffects() {
      if (this._bubbleInterval) { clearInterval(this._bubbleInterval); this._bubbleInterval = null; }
      if (this._dotInterval)    { clearInterval(this._dotInterval);    this._dotInterval = null; }
      // Remove all magic elements
      if (this._magicEls) {
        this._magicEls.forEach(el => el.remove());
        this._magicEls = [];
      }
      // Also cleanup any stragglers
      document.querySelectorAll('.cc-bubble, .cc-spark, .cc-pop-star, .cc-magic-dot').forEach(el => el.remove());
    }

    _spawnMagicDots() {
      const count = window.innerWidth < 600 ? 14 : 24;
      const dotColors = [
        '#e0b4ff','#a5b4fc','#7dd3fc','#fbbf24','#f9a8d4',
        '#c4b5fd','#67e8f9','#fde68a','#fbcfe8','#fff'
      ];
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      for (let d = 0; d < count; d++) {
        const dot = document.createElement('div');
        const isTwinkle = Math.random() > 0.5;
        dot.className = 'cc-magic-dot' + (isTwinkle ? ' twinkle' : '');
        const size = 3 + Math.random() * 7;
        const x = Math.random() * vw;
        const y = Math.random() * vh;
        const ddx = (Math.random() - 0.5) * 80;
        const ddy = (Math.random() - 0.5) * 80;
        const ddx2 = (Math.random() - 0.5) * 120;
        const ddy2 = -20 - Math.random() * 60;
        const dur = 3 + Math.random() * 5;
        const delay = Math.random() * 3;
        const opa = 0.3 + Math.random() * 0.6;
        const ds = 0.8 + Math.random() * 0.8;
        const color = dotColors[Math.floor(Math.random() * dotColors.length)];

        dot.style.cssText = `
          left: ${x}px; top: ${y}px;
          width: ${size}px; height: ${size}px;
          background: ${color};
          box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}44;
          --ddx: ${ddx}px; --ddy: ${ddy}px;
          --ddx2: ${ddx2}px; --ddy2: ${ddy2}px;
          --ddur: ${dur}s; --dopa: ${opa}; --ds: ${ds};
          animation-delay: ${delay}s;
        `;
        document.body.appendChild(dot);
        this._magicEls.push(dot);

        // Auto-remove and re-create to keep them fresh
        const lifespan = (delay + dur) * 1000;
        setTimeout(() => {
          dot.remove();
          const idx = this._magicEls.indexOf(dot);
          if (idx > -1) this._magicEls.splice(idx, 1);
        }, lifespan);
      }
    }

    _spawnBubbleWave() {
      const count = window.innerWidth < 600 ? 4 : 7;
      const colors = [
        'rgba(180,140,255,0.55)', 'rgba(100,180,255,0.45)', 'rgba(255,180,220,0.45)',
        'rgba(120,220,255,0.45)', 'rgba(200,160,255,0.55)', 'rgba(255,200,100,0.4)'
      ];
      const sparkColors = ['#e0b4ff','#a5b4fc','#7dd3fc','#fbbf24','#f9a8d4','#fff'];
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      for (let b = 0; b < count; b++) {
        const bubble = document.createElement('div');
        bubble.className = 'cc-bubble';
        const size = 16 + Math.random() * 36;
        const startX = Math.random() * vw;
        const startY = vh * 0.5 + Math.random() * vh * 0.5;
        const dx1 = (Math.random() - 0.5) * 120;
        const dy1 = -60 - Math.random() * 100;
        const dx2 = dx1 + (Math.random() - 0.5) * 80;
        const dy2 = dy1 - 80 - Math.random() * 150;
        const dx3 = dx2 + (Math.random() - 0.5) * 60;
        const dy3 = dy2 - 40 - Math.random() * 80;
        const dur = 1.8 + Math.random() * 2;
        const delay = Math.random() * 1.5;
        const scale = 0.8 + Math.random() * 0.5;

        bubble.style.cssText = `
          left: ${startX}px; top: ${startY}px;
          width: ${size}px; height: ${size}px;
          --dx1: ${dx1}px; --dy1: ${dy1}px;
          --dx2: ${dx2}px; --dy2: ${dy2}px;
          --dx3: ${dx3}px; --dy3: ${dy3}px;
          --dur: ${dur}s; --s: ${scale};
          animation-delay: ${delay}s;
          background: radial-gradient(circle at 30% 30%,
            ${colors[b % colors.length]},
            rgba(60,40,180,0.1) 100%);
        `;
        document.body.appendChild(bubble);
        this._magicEls.push(bubble);

        // Pop → sparks
        const popTime = (delay + dur * 0.85) * 1000;
        setTimeout(() => {
          if (!this._lbOpen) { bubble.remove(); return; }
          const rect = bubble.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          if (cx > 0 && cy > 0) this._spawnSparks(cx, cy, sparkColors, size);
          bubble.remove();
          const idx = this._magicEls.indexOf(bubble);
          if (idx > -1) this._magicEls.splice(idx, 1);
        }, popTime);

        // Safety cleanup
        setTimeout(() => {
          bubble.remove();
          const idx = this._magicEls.indexOf(bubble);
          if (idx > -1) this._magicEls.splice(idx, 1);
        }, (delay + dur + 0.5) * 1000);
      }
    }

    _spawnSparks(cx, cy, sparkColors, bubbleSize) {
      const sparkCount = 5 + Math.floor(Math.random() * 4);
      for (let s = 0; s < sparkCount; s++) {
        const spark = document.createElement('div');
        spark.className = 'cc-spark';
        const angle = (Math.PI * 2 / sparkCount) * s + (Math.random() - 0.5) * 0.5;
        const dist = 18 + Math.random() * (bubbleSize * 1.3);
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        const sdur = 0.3 + Math.random() * 0.4;
        const ssize = 2 + Math.random() * 4;
        const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];

        spark.style.cssText = `
          left: ${cx}px; top: ${cy}px;
          width: ${ssize}px; height: ${ssize}px;
          background: ${color};
          box-shadow: 0 0 6px ${color}, 0 0 10px ${color};
          --sx: ${sx}px; --sy: ${sy}px; --sdur: ${sdur}s;
        `;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), sdur * 1000 + 100);
      }

      // Mini star flash
      const star = document.createElement('div');
      star.className = 'cc-pop-star';
      const symbols = ['✦','✧','⟡','✶'];
      star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      star.style.cssText = `left:${cx-7}px;top:${cy-7}px;color:${sparkColors[Math.floor(Math.random()*sparkColors.length)]};`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 600);
    }

    // Helper: find lightbox element whether it's in this component or teleported to body
    _lb(sel) {
      const lb = this._lbEl || this.querySelector('.cc-lightbox') || document.querySelector('.cc-lightbox');
      return sel ? lb?.querySelector(sel) : lb;
    }

    _renderLightboxSlide() {
      const slide = this._slides[this._lbIndex];
      if (!slide) return;

      // Desktop → desk version; mobile → mob version
      const src = this._basePath + (this._isMobile() ? slide.mob : (slide.desk || slide.mob));

      const img = this._lb('.cc-lb-img');
      img.classList.add('cc-loading');
      img.onload  = () => img.classList.remove('cc-loading');
      img.onerror = () => {
        // fallback: try mob version if desk fails
        if (!this._isMobile() && slide.desk && img.src.indexOf(slide.desk) !== -1) {
          img.src = this._basePath + slide.mob;
        } else {
          img.classList.remove('cc-loading');
        }
      };
      img.src = src;
      img.alt = slide.title || '';

      this._lb('.cc-lb-caption').textContent = slide.title || '';

      // Info button in lightbox
      const lbInfo = this._lb('.cc-lb-info');
      if (lbInfo) {
        if (slide.anchor) {
          lbInfo.href = slide.anchor;
          if (slide.anchor.startsWith('#')) {
            lbInfo.removeAttribute('target');
            lbInfo.removeAttribute('rel');
          } else {
            lbInfo.setAttribute('target', '_blank');
            lbInfo.setAttribute('rel', 'noopener noreferrer');
          }
          lbInfo.classList.remove('cc-lb-info-hidden');
        } else {
          lbInfo.href = '#';
          lbInfo.classList.add('cc-lb-info-hidden');
        }
      }

      const n    = this._slides.length;
      const prev = this._lb('.cc-lb-prev');
      const next = this._lb('.cc-lb-next');
      prev.style.opacity       = this._lbIndex === 0      ? '0.25' : '1';
      prev.style.pointerEvents = this._lbIndex === 0      ? 'none' : 'auto';
      next.style.opacity       = this._lbIndex >= n - 1   ? '0.25' : '1';
      next.style.pointerEvents = this._lbIndex >= n - 1   ? 'none' : 'auto';
    }

    closeLightbox() {
      this._lbOpen = false;
      this._stopMagicEffects();
      const lb = this._lbEl || document.querySelector('.cc-lightbox');
      if (lb) lb.classList.remove('open');
      // Return lightbox to component
      if (lb && this._lbPlaceholder && this._lbPlaceholder.parentElement) {
        this._lbPlaceholder.parentElement.insertBefore(lb, this._lbPlaceholder);
        this._lbPlaceholder.remove();
        this._lbPlaceholder = null;
      }
      this._lbEl = null;
      /* Restore scroll position */
      const scrollY = this._savedScrollY || 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    }

    lbPrev() {
      if (this._lbIndex > 0) { this._lbIndex--; this._renderLightboxSlide(); }
    }

    lbNext() {
      if (this._lbIndex < this._slides.length - 1) { this._lbIndex++; this._renderLightboxSlide(); }
    }

    disconnectedCallback() {
      if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
    }
  }

  customElements.define('cartelera-carousel', CartelleraCarousel);
})();
