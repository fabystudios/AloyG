(function () {
  'use strict';

  /* ══════════════════════════════════════════
     TEMAS DE COLOR
     Cada tema define las variables CSS que
     pinta todo el componente (título, acentos,
     glow ambiente, botones 3D).
  ══════════════════════════════════════════ */
  const THEMES = {
    violeta: {
      title: ['#e0b4ff', '#a5b4fc', '#7dd3fc'],
      accent: ['#c084fc', '#818cf8'],
      glow: ['rgba(130,60,255,0.13)', 'rgba(60,100,255,0.10)'],
      border: 'rgba(150,100,255,0.22)',
      btn: ['#8b5cf6', '#6d28d9', '#a78bfa', '#7c3aed', '#6d28d9', '#5b21b6'],
      btnShadow: '#3b0764',
      cardGlow: 'rgba(140,80,255,0.28)'
    },
    dorado: {
      title: ['#fde68a', '#fbbf24', '#f59e0b'],
      accent: ['#fbbf24', '#f59e0b'],
      glow: ['rgba(245,158,11,0.16)', 'rgba(217,119,6,0.10)'],
      border: 'rgba(245,190,80,0.28)',
      btn: ['#fbbf24', '#b45309', '#fcd34d', '#d97706', '#b45309', '#92400e'],
      btnShadow: '#78350f',
      cardGlow: 'rgba(245,158,11,0.30)'
    },
    azul: {
      title: ['#bae6fd', '#7dd3fc', '#38bdf8'],
      accent: ['#38bdf8', '#0ea5e9'],
      glow: ['rgba(14,165,233,0.14)', 'rgba(56,189,248,0.10)'],
      border: 'rgba(80,170,255,0.24)',
      btn: ['#38bdf8', '#0369a1', '#7dd3fc', '#0284c7', '#0369a1', '#075985'],
      btnShadow: '#0c4a6e',
      cardGlow: 'rgba(56,189,248,0.28)'
    },
    rosa: {
      title: ['#fbcfe8', '#f9a8d4', '#f472b6'],
      accent: ['#f472b6', '#ec4899'],
      glow: ['rgba(236,72,153,0.14)', 'rgba(244,114,182,0.10)'],
      border: 'rgba(244,140,190,0.26)',
      btn: ['#f472b6', '#be185d', '#fbcfe8', '#db2777', '#be185d', '#9d174d'],
      btnShadow: '#831843',
      cardGlow: 'rgba(244,114,182,0.28)'
    },
    esmeralda: {
      title: ['#bbf7d0', '#6ee7b7', '#34d399'],
      accent: ['#34d399', '#10b981'],
      glow: ['rgba(16,185,129,0.14)', 'rgba(52,211,153,0.10)'],
      border: 'rgba(70,200,150,0.24)',
      btn: ['#34d399', '#047857', '#6ee7b7', '#059669', '#047857', '#065f46'],
      btnShadow: '#064e3b',
      cardGlow: 'rgba(52,211,153,0.28)'
    },
    sereno: {
      title: ['#ffffff', '#e5e7eb', '#cbd5e1'],
      accent: ['#e5e7eb', '#94a3b8'],
      glow: ['rgba(255,255,255,0.10)', 'rgba(148,163,184,0.10)'],
      border: 'rgba(230,230,240,0.22)',
      btn: ['#f1f5f9', '#64748b', '#ffffff', '#475569', '#64748b', '#334155'],
      btnShadow: '#1e293b',
      cardGlow: 'rgba(226,232,240,0.30)'
    }
  };

  /* ══════════════════════════════════════════
     EFECTOS DE PARTÍCULAS
     Se usan tanto en la aparición inicial del
     carrusel como dentro del visor ampliado.
  ══════════════════════════════════════════ */
  const EFFECTS = {
    estrellas: {
      symbols: ['✦', '✧', '·', '✶', '⊹', '˖'],
      colors: ['#fbbf24', '#fde68a', '#fffbeb', '#f59e0b', '#e0c068', '#fff7cc', '#fff'],
      flashSymbols: null
    },
    corazones: {
      symbols: ['♥', '❤', '♡', '✧'],
      colors: ['#f472b6', '#fb7185', '#fda4af', '#f9a8d4', '#fecdd3'],
      flashSymbols: null
    },
    luz: {
      symbols: ['✦', '✧', '·', '✶', '⊹', '˖'],
      colors: ['#fbbf24', '#fde68a', '#fffbeb', '#f59e0b', '#d4a053', '#fff7cc', '#e0c068', '#fff'],
      flashSymbols: ['✝', '✦', '☩', '✧', '⊹']
    },
    ninguno: null
  };

  function injectStyles() {
    if (document.getElementById('anuncios-carousel-css')) return;
    const style = document.createElement('style');
    style.id = 'anuncios-carousel-css';
    style.textContent = `
      anuncios-carousel { display: block; }

      /* ── WRAPPER ── */
      .ac-wrap {
        position: relative;
        background: linear-gradient(135deg, rgba(8,4,28,0.94) 0%, rgba(18,6,48,0.91) 50%, rgba(6,12,40,0.94) 100%);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border: 1px solid var(--ac-border, rgba(150,100,255,0.22));
        border-radius: 28px;
        padding: 2rem 1.75rem 1.5rem;
        margin: 1.5rem 1rem;
        overflow: hidden;
        box-shadow: 0 32px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.09);
      }

      .ac-glow {
        position: absolute; inset: 0; pointer-events: none; border-radius: 28px;
        background:
          radial-gradient(ellipse at 20% 10%, var(--ac-glow-1, rgba(130,60,255,0.13)) 0%, transparent 55%),
          radial-gradient(ellipse at 78% 88%, var(--ac-glow-2, rgba(60,100,255,0.10)) 0%, transparent 55%);
      }

      /* ── HEADER ── */
      .ac-header { position: relative; z-index: 1; text-align: center; margin-bottom: 1.8rem; }
      .ac-title-row { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
      .ac-title-pin {
        font-size: 2.2rem;
        animation: ac-pin-sway 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 14px rgba(200,140,255,0.85));
        display: inline-block;
      }
      @keyframes ac-pin-sway {
        0%, 100% { transform: rotate(-12deg) translateY(0); }
        50%       { transform: rotate(12deg) translateY(-6px); }
      }
      .ac-title-text h2 {
        margin: 0; font-size: clamp(1.45rem, 4.5vw, 2.4rem); font-weight: 900; letter-spacing: -0.5px; line-height: 1.1;
        background: linear-gradient(135deg, var(--ac-title-1,#e0b4ff) 0%, var(--ac-title-2,#a5b4fc) 50%, var(--ac-title-3,#7dd3fc) 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      }
      .ac-title-text p {
        margin: 0.35rem 0 0; color: rgba(220,220,240,0.55); font-size: 0.78rem; letter-spacing: 1.8px; text-transform: uppercase; font-weight: 500;
      }
      .ac-header-divider {
        width: 64px; height: 3px; border-radius: 2px; margin: 0.9rem auto 0;
        background: linear-gradient(90deg, var(--ac-accent-1,#c084fc), var(--ac-accent-2,#818cf8), transparent);
      }

      /* ── CAROUSEL AREA ── */
      .ac-carousel-area { position: relative; z-index: 1; display: flex; align-items: center; gap: 0.65rem; width: 100%; margin: 0 auto; box-sizing: border-box; }
      .ac-viewport { flex: 1; overflow: hidden; border-radius: 18px; }
      .ac-track { display: flex; will-change: transform; transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
      .ac-slide { flex-shrink: 0; padding: 0 6px; box-sizing: border-box; }

      /* ── CARD ── */
      .ac-card {
        position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; aspect-ratio: 2/3;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.11);
        box-shadow: 0 10px 36px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.1);
        transition: transform 0.35s ease, box-shadow 0.35s ease; outline: none;
      }
      .ac-card:hover, .ac-card:focus-visible {
        transform: translateY(-10px) scale(1.025);
        box-shadow: 0 28px 58px rgba(0,0,0,0.58), 0 0 44px var(--ac-card-glow, rgba(140,80,255,0.28)), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      .ac-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; user-select: none; pointer-events: none; }
      .ac-card:hover img, .ac-card:focus-visible img { transform: scale(1.07); }
      .ac-card-overlay {
        position: absolute; inset: 0; opacity: 0; transition: opacity 0.35s ease; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(to top, rgba(30,10,60,0.78) 0%, rgba(20,10,40,0.32) 38%, transparent 65%);
      }
      .ac-card:hover .ac-card-overlay, .ac-card:focus-visible .ac-card-overlay { opacity: 1; }
      .ac-zoom-icon {
        width: 62px; height: 62px; background: rgba(255,255,255,0.96); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 30px rgba(0,0,0,0.38);
        transform: scale(0.65) translateY(12px); opacity: 0;
        transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
      }
      .ac-zoom-icon svg { width: 27px; height: 27px; color: #6d28d9; }
      .ac-card:hover .ac-zoom-icon, .ac-card:focus-visible .ac-zoom-icon { transform: scale(1) translateY(0); opacity: 1; }
      .ac-card-caption {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%);
        color: rgba(255,255,255,0.96); font-size: 0.82rem; font-weight: 700; padding: 2rem 0.8rem 0.75rem;
        text-align: center; letter-spacing: 0.4px; text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      }

      /* ── NAV 3D ── */
      .ac-nav-btn { flex-shrink: 0; width: 54px; height: 54px; background: none; border: none; padding: 3px; cursor: pointer; border-radius: 50%; transition: opacity 0.3s ease; outline: none; }
      .ac-btn-3d {
        width: 100%; height: 100%; border-radius: 50%;
        background: linear-gradient(145deg, var(--ac-btn-1,#8b5cf6), var(--ac-btn-2,#6d28d9));
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 6px 0 var(--ac-btn-shadow,#3b0764), 0 9px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.22);
        transition: box-shadow 0.14s ease, transform 0.14s ease, background 0.2s ease;
      }
      .ac-nav-btn svg { width: 22px; height: 22px; color: white; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4)); position: relative; z-index: 1; }
      .ac-nav-btn:hover .ac-btn-3d, .ac-nav-btn:focus-visible .ac-btn-3d {
        background: linear-gradient(145deg, var(--ac-btn-3,#a78bfa), var(--ac-btn-4,#7c3aed));
        box-shadow: 0 8px 0 var(--ac-btn-shadow,#3b0764), 0 14px 26px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(0,0,0,0.22);
        transform: translateY(-3px);
      }
      .ac-nav-btn:active .ac-btn-3d {
        background: linear-gradient(145deg, var(--ac-btn-5,#6d28d9), var(--ac-btn-6,#5b21b6));
        box-shadow: 0 2px 0 var(--ac-btn-shadow,#3b0764), 0 4px 8px rgba(0,0,0,0.3), inset 0 3px 6px rgba(0,0,0,0.28), inset 0 -1px 0 rgba(255,255,255,0.1);
        transform: translateY(4px);
      }

      /* ── DOTS ── */
      .ac-dots { position: relative; z-index: 1; display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 1.3rem; }
      .ac-dot { width: 7px; height: 7px; border-radius: 4px; border: none; cursor: pointer; padding: 0; background: rgba(255,255,255,0.2); transition: all 0.35s ease; }
      .ac-dot.active {
        width: 26px;
        background: linear-gradient(90deg, var(--ac-accent-1,#c084fc), var(--ac-accent-2,#818cf8));
        box-shadow: 0 2px 10px var(--ac-card-glow, rgba(192,132,252,0.55));
      }

      /* ── LIGHTBOX ── */
      .ac-lightbox { position: fixed; inset: 0; z-index: 10000; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center; }
      .ac-lightbox.open { opacity: 1; pointer-events: auto; }
      .ac-lb-backdrop { position: absolute; inset: 0; background: rgba(4,0,18,0.95); backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px); }
      .ac-lb-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 4rem 1rem 3rem; box-sizing: border-box; }
      .ac-lb-nav-row { display: flex; align-items: center; justify-content: center; gap: 1rem; width: 100%; max-width: 1200px; }
      .ac-lb-img-wrap { flex: 1; display: flex; align-items: center; justify-content: center; max-width: 82vw; max-height: 76vh; }
      .ac-lb-img { max-width: 100%; max-height: 76vh; object-fit: contain; border-radius: 16px; box-shadow: 0 40px 100px rgba(0,0,0,0.82), 0 0 60px var(--ac-card-glow, rgba(140,80,255,0.14)); transition: opacity 0.22s ease; display: block; }
      .ac-lb-img.ac-loading { opacity: 0.3; }
      .ac-lb-nav-btn {
        flex-shrink: 0; width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white;
        transition: background 0.22s, transform 0.22s, box-shadow 0.22s; outline: none;
      }
      .ac-lb-nav-btn:hover, .ac-lb-nav-btn:focus-visible {
        background: var(--ac-card-glow, rgba(140,80,255,0.38)); border-color: var(--ac-accent-1,rgba(160,100,255,0.52)); transform: scale(1.12);
        box-shadow: 0 0 22px var(--ac-card-glow, rgba(140,80,255,0.32));
      }
      .ac-lb-nav-btn svg { width: 22px; height: 22px; }
      .ac-lb-close {
        position: fixed; top: 1.2rem; right: 1.2rem; z-index: 2; width: 50px; height: 50px; background: rgba(210,30,30,0.88);
        border: 2px solid rgba(255,100,100,0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; cursor: pointer; color: white;
        box-shadow: 0 4px 20px rgba(210,30,30,0.55), 0 0 0 4px rgba(210,30,30,0.18);
        transition: background 0.22s, transform 0.25s, border-color 0.22s, box-shadow 0.22s; outline: none;
      }
      .ac-lb-close:hover, .ac-lb-close:focus-visible {
        background: rgba(230,50,50,1); border-color: rgba(255,130,130,0.85);
        box-shadow: 0 6px 28px rgba(220,40,40,0.75), 0 0 0 6px rgba(220,40,40,0.22); transform: scale(1.12) rotate(90deg);
      }
      .ac-lb-close svg { width: 20px; height: 20px; }
      .ac-lb-caption {
        margin-top: 1rem; color: rgba(255,255,255,0.72); font-size: 0.88rem; font-weight: 600; text-align: center; letter-spacing: 0.5px;
        background: rgba(0,0,0,0.45); backdrop-filter: blur(8px); padding: 0.35rem 1.2rem; border-radius: 20px; min-height: 1.5rem;
      }

      /* ── INFO BUTTON (card) ── */
      .ac-card-info {
        position: absolute; top: 8px; right: 8px; z-index: 4; width: 52px; height: 52px; border-radius: 50%; border: none;
        background: transparent; box-shadow: 0 4px 14px rgba(0,0,0,0.38); display: flex; align-items: center; justify-content: center;
        cursor: pointer; text-decoration: none; transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease; outline: none; padding: 0;
      }
      .ac-info-img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.45)); background: linear-gradient(145deg, #fcd34d, #f59e0b); }
      .ac-card-info:hover, .ac-card-info:focus-visible { transform: translateY(-4px) scale(1.12); box-shadow: 0 10px 28px rgba(0,0,0,0.45); }
      .ac-card-info:active { transform: translateY(3px) scale(0.95); box-shadow: 0 2px 6px rgba(0,0,0,0.3); }

      /* ── INFO BUTTON (lightbox) ── */
      .ac-lb-info {
        position: fixed; top: 1.2rem; left: 1.2rem; z-index: 2; width: 62px; height: 62px; background: transparent; border: none;
        border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none;
        box-shadow: 0 6px 22px rgba(0,0,0,0.45); transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease; outline: none; padding: 0;
      }
      .ac-lb-info img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; filter: drop-shadow(0 3px 10px rgba(0,0,0,0.5)); }
      .ac-lb-info:hover, .ac-lb-info:focus-visible { transform: translateY(-4px) scale(1.12); box-shadow: 0 14px 34px rgba(0,0,0,0.55); }
      .ac-lb-info:active { transform: translateY(3px) scale(0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.32); }
      .ac-lb-info-hidden { display: none !important; }

      /* ── MOBILE ── */
      @media (max-width: 768px) {
        .ac-wrap { padding: 1.5rem 0.75rem 1.25rem; margin: 1rem 0.5rem; border-radius: 20px; }
        .ac-header { margin-bottom: 1.4rem; }
        .ac-title-pin { font-size: 1.7rem; }
        .ac-title-text h2 { font-size: 1.45rem; }
        .ac-card { aspect-ratio: 9/16; }
        .ac-nav-btn { width: 44px; height: 44px; }
        .ac-nav-btn svg { width: 18px; height: 18px; }
        .ac-lb-inner { padding: 0; }
        .ac-lb-nav-row { position: relative; width: 100vw; height: 100dvh; max-width: 100vw; gap: 0; align-items: stretch; }
        .ac-lb-img-wrap { position: absolute; inset: 0; max-width: 100vw; max-height: 100dvh; width: 100vw; height: 100dvh; display: flex; align-items: center; justify-content: center; }
        .ac-lb-img { width: 100%; height: 100%; max-width: 100vw; max-height: 100dvh; object-fit: contain; border-radius: 0; }
        .ac-lb-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 48px; height: 48px; background: rgba(0,0,0,0.52); border: 1px solid rgba(255,255,255,0.28); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); flex-shrink: 0; }
        .ac-lb-nav-btn svg { width: 20px; height: 20px; }
        .ac-lb-prev { left: 14px; }
        .ac-lb-next { right: 14px; }
        .ac-lb-nav-btn:hover, .ac-lb-nav-btn:focus-visible { transform: translateY(-50%) scale(1.1); }
        .ac-lb-caption { position: fixed; bottom: 1.4rem; left: 50%; transform: translateX(-50%); white-space: nowrap; z-index: 10; }
      }

      /* ── PARTÍCULAS MÁGICAS ── */
      .ac-particle {
        position: fixed; border-radius: 50%; pointer-events: none; z-index: 10001;
        animation: acParticleRise var(--dur) ease-out forwards; will-change: transform, opacity;
      }
      @keyframes acParticleRise {
        0%   { transform: translate(0,0) scale(0.2); opacity: 0; }
        12%  { opacity: var(--popa, 0.8); }
        50%  { transform: translate(var(--px1), var(--py1)) scale(1); opacity: var(--popa, 0.7); }
        80%  { transform: translate(var(--px2), var(--py2)) scale(var(--ps)); opacity: 0.35; }
        100% { transform: translate(var(--px3), var(--py3)) scale(0); opacity: 0; }
      }
      .ac-star {
        position: fixed; pointer-events: none; z-index: 10001; will-change: transform, opacity; filter: blur(0.3px);
        animation: acStarTwinkle var(--sdur) ease-in-out infinite;
      }
      @keyframes acStarTwinkle {
        0%, 100% { opacity: 0.1; transform: scale(0.5) rotate(0deg); }
        25%      { opacity: var(--sopa, 0.9); transform: scale(1.2) rotate(45deg); }
        50%      { opacity: 0.3; transform: scale(0.7) rotate(90deg); }
        75%      { opacity: var(--sopa, 0.85); transform: scale(1.1) rotate(135deg); }
      }
      .ac-star.pulse { animation: acStarPulse var(--sdur) ease-in-out infinite; }
      @keyframes acStarPulse {
        0%, 100% { opacity: 0.15; transform: scale(0.6); filter: blur(1px); }
        50%      { opacity: var(--sopa, 0.85); transform: scale(1.3); filter: blur(0px); }
      }
      .ac-flash {
        position: fixed; pointer-events: none; z-index: 10002; font-size: 16px;
        animation: acFlash 0.8s ease-out forwards; will-change: transform, opacity; text-shadow: 0 0 8px rgba(255,200,50,0.8);
      }
      @keyframes acFlash {
        0%   { transform: scale(0) rotate(0deg); opacity: 1; }
        40%  { transform: scale(1.3) rotate(120deg); opacity: 1; }
        100% { transform: scale(0) rotate(300deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════
     WEB COMPONENT
  ══════════════════════════════════════════ */
  class AnunciosCarousel extends HTMLElement {

    static get observedAttributes() {
      return ['tema', 'theme', 'efecto', 'effect', 'titulo', 'title', 'subtitulo', 'subtitle', 'icono', 'icon'];
    }

    connectedCallback() {
      injectStyles();

      this._basePath = this.getAttribute('base-path') || './';
      try { this._slides = JSON.parse(this.getAttribute('slides') || '[]'); }
      catch (e) { this._slides = []; }

      this._visibleDesktop = Math.min(3, Math.max(1, parseInt(this.getAttribute('visible'), 10) || 3));
      this._visibleMobile = Math.max(1, parseInt(this.getAttribute('visible-mobile'), 10) || 1);

      this._current = 0;
      this._lbIndex = 0;
      this._lbOpen = false;
      this._introPlayed = false;

      this._readThemeAndEffect();
      this._applyTheme();

      this.innerHTML = this._buildHTML();
      this._bindEvents();
      this._updateTrack(false);
      this._setupIntroObserver();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal || !this.isConnected) return;
      if (name === 'tema' || name === 'theme') { this._readThemeAndEffect(); this._applyTheme(); }
      if (name === 'efecto' || name === 'effect') { this._readThemeAndEffect(); }
      if (['titulo', 'title', 'subtitulo', 'subtitle', 'icono', 'icon'].includes(name)) {
        this._readThemeAndEffect();
        const h2 = this.querySelector('.ac-title-text h2');
        const p = this.querySelector('.ac-title-text p');
        const pin = this.querySelector('.ac-title-pin');
        if (h2) h2.textContent = this._title;
        if (p) p.textContent = this._subtitle;
        if (pin) pin.textContent = this._icon;
      }
    }

    _readThemeAndEffect() {
      this._title = this.getAttribute('titulo') || this.getAttribute('title') || 'Anuncios';
      this._subtitle = this.getAttribute('subtitulo') || this.getAttribute('subtitle') || '';
      this._icon = this.getAttribute('icono') || this.getAttribute('icon') || '📌';
      this._themeName = this.getAttribute('tema') || this.getAttribute('theme') || 'violeta';
      this._effectName = this.getAttribute('efecto') || this.getAttribute('effect') || 'estrellas';
    }

    /* Cambiar tema o efecto por JS, sin tocar atributos */
    setTheme(name) { if (THEMES[name]) { this._themeName = name; this._applyTheme(); } }
    setEffect(name) { if (name in EFFECTS) { this._effectName = name; } }

    _applyTheme() {
      const t = THEMES[this._themeName] || THEMES.violeta;
      this.style.setProperty('--ac-title-1', t.title[0]);
      this.style.setProperty('--ac-title-2', t.title[1]);
      this.style.setProperty('--ac-title-3', t.title[2]);
      this.style.setProperty('--ac-accent-1', t.accent[0]);
      this.style.setProperty('--ac-accent-2', t.accent[1]);
      this.style.setProperty('--ac-glow-1', t.glow[0]);
      this.style.setProperty('--ac-glow-2', t.glow[1]);
      this.style.setProperty('--ac-border', t.border);
      this.style.setProperty('--ac-btn-1', t.btn[0]);
      this.style.setProperty('--ac-btn-2', t.btn[1]);
      this.style.setProperty('--ac-btn-3', t.btn[2]);
      this.style.setProperty('--ac-btn-4', t.btn[3]);
      this.style.setProperty('--ac-btn-5', t.btn[4]);
      this.style.setProperty('--ac-btn-6', t.btn[5]);
      this.style.setProperty('--ac-btn-shadow', t.btnShadow);
      this.style.setProperty('--ac-card-glow', t.cardGlow);
    }

    /* ── HTML ── */
    _buildHTML() {
      const bp = this._basePath;
      const slides = this._slides;
      const infoIcon = `<img src="${bp}info.png" alt="Información" class="ac-info-img" />`;

      const slidesHTML = slides.map((s, i) => `
        <div class="ac-slide" data-i="${i}">
          <div class="ac-card" role="button" tabindex="0" aria-label="Ver afiche${s.title ? ': ' + s.title : ''}">
            <img src="${bp}${s.mob}" alt="${s.title || 'Anuncio'}" loading="lazy" />
            <div class="ac-card-overlay">
              <div class="ac-zoom-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
            ${s.title ? `<div class="ac-card-caption">${s.title}</div>` : ''}
            ${s.anchor ? `<a class="ac-card-info" href="${s.anchor}"
               ${s.anchor.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'}
               aria-label="Más información${s.title ? ' sobre ' + s.title : ''}" title="Más información">${infoIcon}</a>` : ''}
          </div>
        </div>
      `).join('');

      const dotsHTML = slides.map((_, i) => `<button class="ac-dot${i === 0 ? ' active' : ''}" aria-label="Afiche ${i + 1}"></button>`).join('');

      const chevronL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
      const chevronR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
      const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

      return `
        <div class="ac-wrap">
          <div class="ac-glow"></div>
          <div class="ac-header">
            <div class="ac-title-row">
              <span class="ac-title-pin" aria-hidden="true">${this._icon}</span>
              <div class="ac-title-text">
                <h2>${this._title}</h2>
                ${this._subtitle ? `<p>${this._subtitle}</p>` : ''}
              </div>
            </div>
            <div class="ac-header-divider"></div>
          </div>

          <div class="ac-carousel-area">
            <button class="ac-nav-btn ac-prev" aria-label="Anterior"><div class="ac-btn-3d">${chevronL}</div></button>
            <div class="ac-viewport"><div class="ac-track">${slidesHTML}</div></div>
            <button class="ac-nav-btn ac-next" aria-label="Siguiente"><div class="ac-btn-3d">${chevronR}</div></button>
          </div>

          <div class="ac-dots">${dotsHTML}</div>
        </div>

        <div class="ac-lightbox" role="dialog" aria-modal="true" aria-label="Vista ampliada del afiche">
          <div class="ac-lb-backdrop"></div>
          <button class="ac-lb-close" aria-label="Cerrar">${closeIcon}</button>
          <a class="ac-lb-info ac-lb-info-hidden" href="#" target="_blank" rel="noopener noreferrer" aria-label="Más información">${infoIcon}</a>
          <div class="ac-lb-inner">
            <div class="ac-lb-nav-row">
              <button class="ac-lb-nav-btn ac-lb-prev" aria-label="Afiche anterior">${chevronL}</button>
              <div class="ac-lb-img-wrap"><img class="ac-lb-img" src="" alt="" /></div>
              <button class="ac-lb-nav-btn ac-lb-next" aria-label="Afiche siguiente">${chevronR}</button>
            </div>
            <div class="ac-lb-caption"></div>
          </div>
        </div>
      `;
    }

    /* ── EVENTS ── */
    _bindEvents() {
      this.querySelector('.ac-prev').addEventListener('click', () => this.prev());
      this.querySelector('.ac-next').addEventListener('click', () => this.next());

      this.querySelectorAll('.ac-card').forEach((card, i) => {
        card.addEventListener('click', () => this.showLightbox(i));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.showLightbox(i); }
        });
      });

      this.querySelectorAll('.ac-card-info').forEach(btn => btn.addEventListener('click', (e) => e.stopPropagation()));

      this.querySelectorAll('.ac-dot').forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));

      this.querySelector('.ac-lb-backdrop').addEventListener('click', () => this.closeLightbox());
      this.querySelector('.ac-lb-close').addEventListener('click', () => this.closeLightbox());
      this.querySelector('.ac-lb-prev').addEventListener('click', (e) => { e.stopPropagation(); this.lbPrev(); });
      this.querySelector('.ac-lb-next').addEventListener('click', (e) => { e.stopPropagation(); this.lbNext(); });
      this.querySelector('.ac-lightbox').addEventListener('click', () => this.closeLightbox());
      this.querySelector('.ac-lb-nav-row').addEventListener('click', (e) => e.stopPropagation());
      this.querySelector('.ac-lb-caption').addEventListener('click', (e) => e.stopPropagation());

      this._keyHandler = (e) => {
        if (!this._lbOpen) return;
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.lbPrev();
        if (e.key === 'ArrowRight') this.lbNext();
      };
      document.addEventListener('keydown', this._keyHandler);

      let swipeX = 0;
      const vp = this.querySelector('.ac-viewport');
      vp.addEventListener('touchstart', (e) => { swipeX = e.touches[0].clientX; }, { passive: true });
      vp.addEventListener('touchend', (e) => {
        const d = swipeX - e.changedTouches[0].clientX;
        if (Math.abs(d) > 45) d > 0 ? this.next() : this.prev();
      });

      let lbSwipeX = 0;
      const lbInner = this.querySelector('.ac-lb-inner');
      lbInner.addEventListener('touchstart', (e) => { lbSwipeX = e.touches[0].clientX; }, { passive: true });
      lbInner.addEventListener('touchend', (e) => {
        const d = lbSwipeX - e.changedTouches[0].clientX;
        if (Math.abs(d) > 45) d > 0 ? this.lbNext() : this.lbPrev();
      });

      window.addEventListener('resize', () => {
        const mi = this._maxIndex();
        if (this._current > mi) this._current = mi;
        this._updateTrack(false);
      });
    }

    /* ── HELPERS ── */
    _isMobile() { return window.innerWidth <= 768; }
    _visibleCount() { return this._isMobile() ? this._visibleMobile : this._visibleDesktop; }
    _maxIndex() { return Math.max(0, this._slides.length - this._visibleCount()); }

    /* El ancho de TODO el widget (título incluido, no solo el viewport)
       es proporcional a la cantidad de slides visibles en desktop:
       3 → ancho total, 2 → 2/3 del ancho, 1 → 1/3 del ancho, centrado.
       En mobile siempre ocupa el 100% (deja que la hoja de estilos
       maneje márgenes y padding responsivos como siempre). */
    _applyCarouselWidth() {
      const wrap = this.querySelector('.ac-wrap');
      if (!wrap) return;
      if (this._isMobile() || this._visibleDesktop >= 3) {
        wrap.style.width = '';
        wrap.style.margin = '';
      } else {
        const pct = (this._visibleDesktop / 3) * 100;
        wrap.style.width = pct + '%';
        wrap.style.margin = '1.5rem auto';
      }
    }

    _updateTrack(animate = true) {
      this._applyCarouselWidth();
      const track = this.querySelector('.ac-track');
      const vc = this._visibleCount();
      const sw = 100 / vc;

      this.querySelectorAll('.ac-slide').forEach(s => { s.style.width = sw + '%'; });
      track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
      track.style.transform = `translateX(-${this._current * sw}%)`;

      this.querySelectorAll('.ac-dot').forEach((d, i) => d.classList.toggle('active', i === this._current));

      const mi = this._maxIndex();
      const prev = this.querySelector('.ac-prev');
      const next = this.querySelector('.ac-next');
      prev.style.opacity = this._current === 0 ? '0.3' : '1';
      prev.style.pointerEvents = this._current === 0 ? 'none' : 'auto';
      next.style.opacity = this._current >= mi ? '0.3' : '1';
      next.style.pointerEvents = this._current >= mi ? 'none' : 'auto';
    }

    /* ── CAROUSEL API ── */
    prev() { if (this._current > 0) { this._current--; this._updateTrack(); } }
    next() { if (this._current < this._maxIndex()) { this._current++; this._updateTrack(); } }
    goTo(i) { this._current = Math.min(Math.max(0, i), this._maxIndex()); this._updateTrack(); }

    /* ── LIGHTBOX API ── */
    showLightbox(i) {
      this._lbIndex = i;
      this._lbOpen = true;
      const lb = this.querySelector('.ac-lightbox');
      if (lb && lb.parentElement !== document.body) {
        this._lbPlaceholder = document.createComment('ac-lb-placeholder');
        lb.parentElement.insertBefore(this._lbPlaceholder, lb);
        document.body.appendChild(lb);
        this._lbEl = lb;
      }
      this._renderLightboxSlide();
      this._lb().classList.add('open');
      this._savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this._savedScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
      this._startAmbientEffect();
    }

    closeLightbox() {
      this._lbOpen = false;
      this._stopAmbientEffect();
      const lb = this._lbEl || document.querySelector('.ac-lightbox');
      if (lb) lb.classList.remove('open');
      if (lb && this._lbPlaceholder && this._lbPlaceholder.parentElement) {
        this._lbPlaceholder.parentElement.insertBefore(lb, this._lbPlaceholder);
        this._lbPlaceholder.remove();
        this._lbPlaceholder = null;
      }
      this._lbEl = null;
      const scrollY = this._savedScrollY || 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    }

    lbPrev() { if (this._lbIndex > 0) { this._lbIndex--; this._renderLightboxSlide(); } }
    lbNext() { if (this._lbIndex < this._slides.length - 1) { this._lbIndex++; this._renderLightboxSlide(); } }

    _lb(sel) {
      const lb = this._lbEl || this.querySelector('.ac-lightbox') || document.querySelector('.ac-lightbox');
      return sel ? lb?.querySelector(sel) : lb;
    }

    _renderLightboxSlide() {
      const slide = this._slides[this._lbIndex];
      if (!slide) return;
      const src = this._basePath + (this._isMobile() ? slide.mob : (slide.desk || slide.mob));
      const img = this._lb('.ac-lb-img');
      img.classList.add('ac-loading');
      img.onload = () => img.classList.remove('ac-loading');
      img.onerror = () => {
        if (!this._isMobile() && slide.desk && img.src.indexOf(slide.desk) !== -1) {
          img.src = this._basePath + slide.mob;
        } else { img.classList.remove('ac-loading'); }
      };
      img.src = src;
      img.alt = slide.title || '';
      this._lb('.ac-lb-caption').textContent = slide.title || '';

      const lbInfo = this._lb('.ac-lb-info');
      if (lbInfo) {
        if (slide.anchor) {
          lbInfo.href = slide.anchor;
          if (slide.anchor.startsWith('#')) { lbInfo.removeAttribute('target'); lbInfo.removeAttribute('rel'); }
          else { lbInfo.setAttribute('target', '_blank'); lbInfo.setAttribute('rel', 'noopener noreferrer'); }
          lbInfo.classList.remove('ac-lb-info-hidden');
        } else { lbInfo.href = '#'; lbInfo.classList.add('ac-lb-info-hidden'); }
      }

      const n = this._slides.length;
      const prev = this._lb('.ac-lb-prev');
      const next = this._lb('.ac-lb-next');
      prev.style.opacity = this._lbIndex === 0 ? '0.25' : '1';
      prev.style.pointerEvents = this._lbIndex === 0 ? 'none' : 'auto';
      next.style.opacity = this._lbIndex >= n - 1 ? '0.25' : '1';
      next.style.pointerEvents = this._lbIndex >= n - 1 ? 'none' : 'auto';
    }

    /* ══════════════════════════════════════════
       EFECTOS MÁGICOS
       Usan la config del efecto activo (EFFECTS[this._effectName]).
       Se reutilizan tanto para la aparición inicial (una vez,
       al entrar en pantalla) como para el ambiente del visor
       ampliado (continuo, mientras está abierto).
    ══════════════════════════════════════════ */
    _setupIntroObserver() {
      if (this.getAttribute('intro') === 'false') return;
      const wrap = this.querySelector('.ac-wrap');
      if (!wrap || typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting && !this._introPlayed) {
            this._introPlayed = true;
            this._playIntroBurst();
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      io.observe(wrap);
    }

    _playIntroBurst() {
      const eff = EFFECTS[this._effectName];
      if (!eff) return;
      const rect = this.querySelector('.ac-wrap').getBoundingClientRect();
      // Dos oleadas suaves de partículas subiendo desde el carrusel
      this._spawnParticles(eff, rect, 26, true);
      this._spawnStars(eff, rect, 18, true);
      setTimeout(() => this._spawnParticles(eff, rect, 18, true), 700);
    }

    _startAmbientEffect() {
      this._stopAmbientEffect();
      const eff = EFFECTS[this._effectName];
      if (!eff) return;
      this._magicEls = [];
      const fullRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      this._spawnParticles(eff, fullRect, window.innerWidth < 600 ? 12 : 22, false);
      this._spawnStars(eff, fullRect, window.innerWidth < 600 ? 22 : 40, false);

      this._particleInterval = setInterval(() => {
        if (!this._lbOpen) return;
        this._spawnParticles(eff, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }, window.innerWidth < 600 ? 12 : 22, false);
      }, 1800);

      this._starInterval = setInterval(() => {
        if (!this._lbOpen) return;
        this._spawnStars(eff, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }, window.innerWidth < 600 ? 22 : 40, false);
      }, 3000);
    }

    _stopAmbientEffect() {
      if (this._particleInterval) { clearInterval(this._particleInterval); this._particleInterval = null; }
      if (this._starInterval) { clearInterval(this._starInterval); this._starInterval = null; }
      if (this._magicEls) { this._magicEls.forEach(el => el.remove()); this._magicEls = []; }
      document.querySelectorAll('.ac-particle, .ac-star, .ac-flash').forEach(el => el.remove());
    }

    _spawnParticles(eff, rect, count, isIntro) {
      for (let p = 0; p < count; p++) {
        const particle = document.createElement('div');
        particle.className = 'ac-particle';
        const size = 3 + Math.random() * 8;
        const startX = rect.left + Math.random() * rect.width;
        const startY = rect.top + rect.height * 0.55 + Math.random() * rect.height * 0.45;
        const px1 = (Math.random() - 0.5) * 60;
        const py1 = -40 - Math.random() * 80;
        const px2 = px1 + (Math.random() - 0.5) * 50;
        const py2 = py1 - 60 - Math.random() * 100;
        const px3 = px2 + (Math.random() - 0.5) * 40;
        const py3 = py2 - 30 - Math.random() * 60;
        const dur = 2.5 + Math.random() * 3;
        const delay = Math.random() * (isIntro ? 0.6 : 2);
        const scale = 0.6 + Math.random() * 0.6;
        const opa = 0.5 + Math.random() * 0.4;
        const color = eff.colors[p % eff.colors.length];

        particle.style.cssText = `
          left:${startX}px; top:${startY}px; width:${size}px; height:${size}px;
          background: radial-gradient(circle, ${color}, transparent 70%);
          box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px rgba(255,200,50,0.2);
          --px1:${px1}px; --py1:${py1}px; --px2:${px2}px; --py2:${py2}px; --px3:${px3}px; --py3:${py3}px;
          --dur:${dur}s; --ps:${scale}; --popa:${opa}; animation-delay:${delay}s;
        `;
        document.body.appendChild(particle);
        if (this._magicEls) this._magicEls.push(particle);

        if (eff.flashSymbols && Math.random() > 0.7) {
          const flashTime = (delay + dur * 0.5) * 1000;
          setTimeout(() => {
            if (!isIntro && !this._lbOpen) return;
            const r = particle.getBoundingClientRect();
            if (r.left > 0 && r.top > 0) this._spawnFlash(eff, r.left, r.top);
          }, flashTime);
        }

        setTimeout(() => {
          particle.remove();
          if (this._magicEls) { const idx = this._magicEls.indexOf(particle); if (idx > -1) this._magicEls.splice(idx, 1); }
        }, (delay + dur + 0.5) * 1000);
      }
    }

    _spawnStars(eff, rect, count, isIntro) {
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        const isPulse = Math.random() > 0.5;
        star.className = 'ac-star' + (isPulse ? ' pulse' : '');
        const size = 2 + Math.random() * 5;
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        const dur = 2 + Math.random() * 4;
        const delay = Math.random() * (isIntro ? 1 : 3);
        const opa = 0.4 + Math.random() * 0.5;
        const color = eff.colors[Math.floor(Math.random() * eff.colors.length)];
        const sym = eff.symbols[Math.floor(Math.random() * eff.symbols.length)];

        star.textContent = sym;
        star.style.cssText = `
          left:${x}px; top:${y}px; font-size:${size * 3}px; color:${color};
          text-shadow: 0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}55;
          --sdur:${dur}s; --sopa:${opa}; animation-delay:${delay}s;
        `;
        document.body.appendChild(star);
        if (this._magicEls) this._magicEls.push(star);

        const lifespan = (delay + dur * 2) * 1000;
        setTimeout(() => {
          star.remove();
          if (this._magicEls) { const idx = this._magicEls.indexOf(star); if (idx > -1) this._magicEls.splice(idx, 1); }
        }, lifespan);
      }
    }

    _spawnFlash(eff, cx, cy) {
      const flash = document.createElement('div');
      flash.className = 'ac-flash';
      flash.textContent = eff.flashSymbols[Math.floor(Math.random() * eff.flashSymbols.length)];
      const color = eff.colors[Math.floor(Math.random() * eff.colors.length)];
      flash.style.cssText = `left:${cx - 8}px; top:${cy - 8}px; color:${color};`;
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 900);
    }

    disconnectedCallback() {
      if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
      this._stopAmbientEffect();
    }
  }

  customElements.define('anuncios-carousel', AnunciosCarousel);
})();