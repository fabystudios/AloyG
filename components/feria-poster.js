/**
 * <feria-poster> — Web Component con Shadow DOM
 *
 * Escena: fondo estacional → pizarra con afiche pegado → figuras al frente.
 *
 * ═══════════════════════════════════════════════════════
 *  ATRIBUTOS DE CONTENIDO
 * ═══════════════════════════════════════════════════════
 *  bg-src              Fondo de la escena
 *  poster-desktop      Imagen del afiche para desktop
 *  poster-mobile       Imagen del afiche para mobile
 *  modal-image         Imagen para el modal de zoom
 *  figure-src          Figura decorativa 1 (izquierda)
 *  figure-src2         Figura decorativa 2 (derecha)
 *  banderines-src      Banderines decorativos (opcional)
 *  board-src           Marco/pizarra del afiche (opcional)
 *  cta-mobile          Texto CTA móvil
 *  cta-desktop         Texto CTA desktop
 *
 * ═══════════════════════════════════════════════════════
 *  ATRIBUTOS DE POSICIÓN DE FIGURAS
 * ═══════════════════════════════════════════════════════
 *  figure-bottom / figure-left
 *  figure-mobile-bottom / figure-mobile-left
 *  figure2-bottom / figure2-right
 *  figure2-mobile-bottom / figure2-mobile-right
 *
 * ═══════════════════════════════════════════════════════
 *  SISTEMA DE EFECTOS CLIMÁTICOS / ESTACIONALES
 * ═══════════════════════════════════════════════════════
 *  effect              Tipo de efecto. Valores posibles:
 *
 *    ── OTOÑO ──────────────────────────────────────────
 *    "autumn-leaves"   Hojas de otoño cayendo con deriva (default)
 *
 *    ── INVIERNO ───────────────────────────────────────
 *    "snow"            Copos de nieve cayendo suavemente
 *    "blizzard"        Tormenta de nieve con viento fuerte
 *
 *    ── LLUVIA ─────────────────────────────────────────
 *    "rain"            Lluvia moderada (cae vertical)
 *    "rain-wind"       Lluvia con viento de izquierda a derecha
 *    "thunderstorm"    Tormenta con rayos y lluvia intensa
 *
 *    ── VIENTO ─────────────────────────────────────────
 *    "wind-ltr"        Viento de izquierda a derecha (hojas voladoras)
 *    "wind-rtl"        Viento de derecha a izquierda
 *    "whirlwind"       Torbellino / remolino de hojas
 *
 *    ── PRIMAVERA ──────────────────────────────────────
 *    "butterflies"     Mariposas volando
 *    "petals"          Pétalos de flor cayendo
 *    "spring"          Mix: mariposas + pétalos
 *
 *    ── VERANO ─────────────────────────────────────────
 *    "fireflies"       Luciérnagas parpadeando (noche de verano)
 *    "sun-rays"        Rayos de sol suaves (destellos)
 *    "bubbles"         Burbujas flotantes
 *
 *    ── FESTIVO ────────────────────────────────────────
 *    "confetti"        Confeti de colores
 *    "stars"           Estrellas / destellos festivos
 *    "bakery"          Panadero/objetos de panadería volando 🥐🥖
 *
 *    ── ESPECIALES ─────────────────────────────────────
 *    "none"            Sin efecto
 *
 *  effect-intensity    Intensidad del efecto: "low" | "medium" | "high"
 *                      (default: "medium")
 *
 *  effect-speed        Velocidad relativa: "slow" | "normal" | "fast"
 *                      (default: "normal")
 *
 * ═══════════════════════════════════════════════════════
 *  EJEMPLO
 * ═══════════════════════════════════════════════════════
 *  <feria-poster
 *    bg-src="./img/feria-autumn.png"
 *    poster-desktop="./feria/poster_desk.png"
 *    poster-mobile="./feria/poster_mob.jpg"
 *    modal-image="./feria/poster_modal.png"
 *    figure-src="./feria/piloto50s.png"
 *    figure-src2="./feria/rubia.png"
 *    banderines-src="./img/banderines.png"
 *    effect="autumn-leaves"
 *    effect-intensity="medium"
 *    effect-speed="normal">
 *  </feria-poster>
 */

/* ═══════════════════════════════════════════════════════════════
   REGISTRO DE EFECTOS
   Cada efecto define:
     particles   → array de emojis/caracteres a usar
     count       → cantidad base de partículas (se multiplica por intensity)
     css         → string con los @keyframes específicos del efecto
     spawn(cfg)  → función que genera y estiliza cada elemento
═══════════════════════════════════════════════════════════════ */
const FX = {

  /* ── OTOÑO: hojas cayendo con deriva ──────────────── */
  'autumn-leaves': {
    particles: ['🍂', '🍁', '🍃', '🍂', '🍁', '🍂'],
    countBase: 10,
    css: `
      @keyframes fx-fall {
        0%   { opacity: 0; transform: translateY(0) rotate(0deg) translateX(0); }
        8%   { opacity: 0.85; }
        100% { opacity: 0; transform: translateY(112vh) rotate(400deg) translateX(var(--drift)); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${Math.random() * 105 - 2}%`;
      el.style.top      = '-30px';
      el.style.fontSize = `${12 + Math.random() * 16}px`;
      el.style.setProperty('--dur',   `${(5 + Math.random() * 6) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 9}s`);
      el.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
      el.style.animation = `fx-fall var(--dur) var(--delay) linear infinite`;
    }
  },

  /* ── NIEVE ────────────────────────────────────────── */
  'snow': {
    particles: ['❄', '❅', '❆', '·', '·', '❄'],
    countBase: 18,
    css: `
      @keyframes fx-snow {
        0%   { opacity: 0; transform: translateY(0) rotate(0deg) translateX(0); }
        10%  { opacity: 0.9; }
        90%  { opacity: 0.7; }
        100% { opacity: 0; transform: translateY(108vh) rotate(180deg) translateX(var(--drift)); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${Math.random() * 105}%`;
      el.style.top      = '-20px';
      el.style.fontSize = `${8 + Math.random() * 12}px`;
      el.style.color    = 'rgba(255,255,255,0.9)';
      el.style.setProperty('--dur',   `${(7 + Math.random() * 8) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 10}s`);
      el.style.setProperty('--drift', `${-20 + Math.random() * 40}px`);
      el.style.animation = `fx-snow var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── TORMENTA DE NIEVE ────────────────────────────── */
  'blizzard': {
    particles: ['❄', '❅', '·', '·', '·', '❆', '·'],
    countBase: 30,
    css: `
      @keyframes fx-blizzard {
        0%   { opacity: 0; transform: translateY(0) translateX(0) rotate(0); }
        5%   { opacity: 1; }
        100% { opacity: 0; transform: translateY(110vh) translateX(var(--drift)) rotate(90deg); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${-10 + Math.random() * 110}%`;
      el.style.top      = `${Math.random() * -20}px`;
      el.style.fontSize = `${5 + Math.random() * 10}px`;
      el.style.color    = 'rgba(220,240,255,0.85)';
      el.style.setProperty('--dur',   `${(2 + Math.random() * 3) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 4}s`);
      el.style.setProperty('--drift', `${60 + Math.random() * 80}px`);
      el.style.animation = `fx-blizzard var(--dur) var(--delay) linear infinite`;
    }
  },

  /* ── LLUVIA VERTICAL ──────────────────────────────── */
  'rain': {
    particles: [],
    countBase: 25,
    css: `
      @keyframes fx-rain {
        0%   { opacity: 0; transform: translateY(-10px) scaleY(0.5); }
        5%   { opacity: 0.7; }
        95%  { opacity: 0.5; }
        100% { opacity: 0; transform: translateY(110vh) scaleY(1); }
      }`,
    spawn(el, cfg) {
      el.textContent = '';
      el.style.left        = `${Math.random() * 100}%`;
      el.style.top         = '-20px';
      el.style.width       = `${1 + Math.random()}px`;
      el.style.height      = `${10 + Math.random() * 15}px`;
      el.style.background  = 'linear-gradient(to bottom, transparent, rgba(180,210,255,0.7))';
      el.style.borderRadius = '2px';
      el.style.setProperty('--dur',   `${(0.6 + Math.random() * 0.5) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 2}s`);
      el.style.animation = `fx-rain var(--dur) var(--delay) linear infinite`;
    }
  },

  /* ── LLUVIA CON VIENTO ────────────────────────────── */
  'rain-wind': {
    particles: [],
    countBase: 30,
    css: `
      @keyframes fx-rainwind {
        0%   { opacity: 0; transform: translate(-10px, -10px) rotate(25deg); }
        5%   { opacity: 0.65; }
        100% { opacity: 0; transform: translate(var(--drift), 110vh) rotate(25deg); }
      }`,
    spawn(el, cfg) {
      el.textContent = '';
      el.style.left        = `${-5 + Math.random() * 105}%`;
      el.style.top         = '-20px';
      el.style.width       = `${1 + Math.random() * 0.5}px`;
      el.style.height      = `${14 + Math.random() * 12}px`;
      el.style.background  = 'linear-gradient(135deg, transparent, rgba(180,210,255,0.65))';
      el.style.borderRadius = '2px';
      el.style.setProperty('--dur',   `${(0.5 + Math.random() * 0.4) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 2}s`);
      el.style.setProperty('--drift', `${60 + Math.random() * 60}px`);
      el.style.animation = `fx-rainwind var(--dur) var(--delay) linear infinite`;
    }
  },

  /* ── TORMENTA ─────────────────────────────────────── */
  'thunderstorm': {
    particles: [],
    countBase: 40,
    css: `
      @keyframes fx-thunder-rain {
        0%   { opacity: 0; transform: translate(0, -10px) rotate(20deg); }
        4%   { opacity: 0.8; }
        100% { opacity: 0; transform: translate(var(--drift), 112vh) rotate(20deg); }
      }
      @keyframes fx-lightning {
        0%, 93%, 96%, 100% { opacity: 0; }
        94%, 95%           { opacity: 0.85; }
      }`,
    spawn(el, cfg, container, i) {
      /* Gotas de lluvia */
      el.textContent = '';
      el.style.left        = `${Math.random() * 108 - 4}%`;
      el.style.top         = '-15px';
      el.style.width       = `${1 + Math.random() * 0.8}px`;
      el.style.height      = `${12 + Math.random() * 14}px`;
      el.style.background  = 'linear-gradient(135deg, transparent, rgba(160,200,255,0.7))';
      el.style.borderRadius = '1px';
      el.style.setProperty('--dur',   `${(0.45 + Math.random() * 0.35) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 1.5}s`);
      el.style.setProperty('--drift', `${40 + Math.random() * 50}px`);
      el.style.animation = `fx-thunder-rain var(--dur) var(--delay) linear infinite`;

      /* Relámpago (una sola vez en índice 0) */
      if (i === 0) {
        const bolt = document.createElement('div');
        bolt.style.cssText = `
          position:absolute; inset:0; pointer-events:none; border-radius:inherit;
          background: linear-gradient(135deg, transparent 30%, rgba(200,220,255,0.25) 50%, transparent 70%);
          animation: fx-lightning ${8 + Math.random() * 6}s ${Math.random() * 4}s linear infinite;
          z-index:20;`;
        container.appendChild(bolt);
      }
    }
  },

  /* ── VIENTO IZQ → DER ─────────────────────────────── */
  'wind-ltr': {
    particles: ['🍃', '🍂', '🍁', '🌿', '🍃'],
    countBase: 12,
    css: `
      @keyframes fx-wind-ltr {
        0%   { opacity: 0; transform: translateX(-120px) translateY(0) rotate(0deg); }
        10%  { opacity: 0.85; }
        90%  { opacity: 0.7; }
        100% { opacity: 0; transform: translateX(calc(100vw + 60px)) translateY(var(--ydrift)) rotate(540deg); }
      }`,
    spawn(el, cfg) {
      el.style.left     = '-5%';
      el.style.top      = `${10 + Math.random() * 80}%`;
      el.style.fontSize = `${14 + Math.random() * 14}px`;
      el.style.setProperty('--dur',   `${(2 + Math.random() * 3) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 5}s`);
      el.style.setProperty('--ydrift', `${-30 + Math.random() * 60}px`);
      el.style.animation = `fx-wind-ltr var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── VIENTO DER → IZQ ─────────────────────────────── */
  'wind-rtl': {
    particles: ['🍃', '🍂', '🍁', '🌿', '🍃'],
    countBase: 12,
    css: `
      @keyframes fx-wind-rtl {
        0%   { opacity: 0; transform: translateX(120px) translateY(0) rotate(0deg); }
        10%  { opacity: 0.85; }
        90%  { opacity: 0.7; }
        100% { opacity: 0; transform: translateX(calc(-100vw - 60px)) translateY(var(--ydrift)) rotate(-540deg); }
      }`,
    spawn(el, cfg) {
      el.style.right    = '-5%';
      el.style.top      = `${10 + Math.random() * 80}%`;
      el.style.fontSize = `${14 + Math.random() * 14}px`;
      el.style.setProperty('--dur',   `${(2 + Math.random() * 3) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 5}s`);
      el.style.setProperty('--ydrift', `${-30 + Math.random() * 60}px`);
      el.style.animation = `fx-wind-rtl var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── TORBELLINO ───────────────────────────────────── */
  'whirlwind': {
    particles: ['🍂', '🍁', '🍃', '🌿', '🍂'],
    countBase: 14,
    css: `
      @keyframes fx-whirl {
        0%   { opacity: 0; transform: rotate(0deg) translateX(var(--radius)) rotate(0deg) scale(0.5); }
        10%  { opacity: 0.9; }
        80%  { opacity: 0.8; }
        100% { opacity: 0; transform: rotate(var(--rotations)) translateX(var(--radius-end)) rotate(calc(-1 * var(--rotations))) scale(1.2) translateY(var(--ydrift)); }
      }`,
    spawn(el, cfg, container, i) {
      const cx = 40 + Math.random() * 20;   /* % centro X del remolino */
      const cy = 40 + Math.random() * 20;   /* % centro Y */
      el.style.position = 'absolute';
      el.style.left     = `${cx}%`;
      el.style.top      = `${cy}%`;
      el.style.fontSize = `${12 + Math.random() * 12}px`;
      el.style.transformOrigin = '0 0';
      el.style.setProperty('--dur',       `${(3 + Math.random() * 4) / cfg.speed}s`);
      el.style.setProperty('--delay',     `${Math.random() * 6}s`);
      el.style.setProperty('--radius',    `${30 + Math.random() * 40}px`);
      el.style.setProperty('--radius-end',`${10 + Math.random() * 20}px`);
      el.style.setProperty('--rotations', `${720 + Math.random() * 720}deg`);
      el.style.setProperty('--ydrift',    `${-50 + Math.random() * 30}px`);
      el.style.animation = `fx-whirl var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── MARIPOSAS ────────────────────────────────────── */
  'butterflies': {
    particles: ['🦋', '🦋', '🦋', '🌸', '🦋'],
    countBase: 8,
    css: `
      @keyframes fx-butterfly {
        0%   { opacity: 0; transform: translate(0, 0) rotate(0deg); }
        5%   { opacity: 0.9; }
        25%  { transform: translate(var(--dx1), var(--dy1)) rotate(15deg); }
        50%  { transform: translate(var(--dx2), var(--dy2)) rotate(-10deg); }
        75%  { transform: translate(var(--dx3), var(--dy3)) rotate(8deg); }
        95%  { opacity: 0.8; }
        100% { opacity: 0; transform: translate(var(--dx4), var(--dy4)) rotate(0deg); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${5 + Math.random() * 85}%`;
      el.style.top      = `${10 + Math.random() * 80}%`;
      el.style.fontSize = `${16 + Math.random() * 14}px`;
      const s = (v) => `${-40 + Math.random() * 80}px`;
      el.style.setProperty('--dur',   `${(5 + Math.random() * 6) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 8}s`);
      el.style.setProperty('--dx1', s()); el.style.setProperty('--dy1', s());
      el.style.setProperty('--dx2', s()); el.style.setProperty('--dy2', s());
      el.style.setProperty('--dx3', s()); el.style.setProperty('--dy3', s());
      el.style.setProperty('--dx4', s()); el.style.setProperty('--dy4', s());
      el.style.animation = `fx-butterfly var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── PÉTALOS ──────────────────────────────────────── */
  'petals': {
    particles: ['🌸', '🌺', '🌼', '🌸', '🌷', '🌸'],
    countBase: 14,
    css: `
      @keyframes fx-petal {
        0%   { opacity: 0; transform: translateY(0) rotate(0deg) translateX(0) scale(0.6); }
        8%   { opacity: 0.8; }
        100% { opacity: 0; transform: translateY(110vh) rotate(600deg) translateX(var(--drift)) scale(1); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${Math.random() * 105}%`;
      el.style.top      = '-20px';
      el.style.fontSize = `${10 + Math.random() * 10}px`;
      el.style.setProperty('--dur',   `${(6 + Math.random() * 6) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 8}s`);
      el.style.setProperty('--drift', `${-50 + Math.random() * 100}px`);
      el.style.animation = `fx-petal var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── PRIMAVERA: mix ───────────────────────────────── */
  'spring': {
    particles: ['🦋', '🌸', '🌺', '🦋', '🌼', '🌸', '🦋', '🌷'],
    countBase: 12,
    css: `
      @keyframes fx-spring {
        0%   { opacity: 0; transform: translateY(0) translateX(0) rotate(0deg) scale(0.5); }
        8%   { opacity: 0.85; }
        50%  { transform: translateY(var(--mid)) translateX(var(--drift)) rotate(200deg) scale(1.1); }
        100% { opacity: 0; transform: translateY(108vh) translateX(var(--drift2)) rotate(480deg) scale(0.8); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${Math.random() * 105}%`;
      el.style.top      = `${-10 + Math.random() * -20}px`;
      el.style.fontSize = `${12 + Math.random() * 14}px`;
      el.style.setProperty('--dur',    `${(5 + Math.random() * 7) / cfg.speed}s`);
      el.style.setProperty('--delay',  `${Math.random() * 9}s`);
      el.style.setProperty('--drift',  `${-60 + Math.random() * 120}px`);
      el.style.setProperty('--drift2', `${-60 + Math.random() * 120}px`);
      el.style.setProperty('--mid',    `${40 + Math.random() * 30}vh`);
      el.style.animation = `fx-spring var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── LUCIÉRNAGAS ──────────────────────────────────── */
  'fireflies': {
    particles: [],
    countBase: 12,
    css: `
      @keyframes fx-firefly-move {
        0%   { transform: translate(0, 0); }
        25%  { transform: translate(var(--dx1), var(--dy1)); }
        50%  { transform: translate(var(--dx2), var(--dy2)); }
        75%  { transform: translate(var(--dx3), var(--dy3)); }
        100% { transform: translate(0, 0); }
      }
      @keyframes fx-firefly-glow {
        0%, 100% { opacity: 0.1; box-shadow: 0 0 4px 2px rgba(255,255,120,0.3); }
        50%      { opacity: 0.9; box-shadow: 0 0 12px 6px rgba(255,255,80,0.7); }
      }`,
    spawn(el, cfg) {
      el.textContent = '';
      el.style.left         = `${5 + Math.random() * 88}%`;
      el.style.top          = `${10 + Math.random() * 80}%`;
      el.style.width        = '6px';
      el.style.height       = '6px';
      el.style.borderRadius = '50%';
      el.style.background   = '#ffff80';
      const r = () => `${-40 + Math.random() * 80}px`;
      el.style.setProperty('--dx1', r()); el.style.setProperty('--dy1', r());
      el.style.setProperty('--dx2', r()); el.style.setProperty('--dy2', r());
      el.style.setProperty('--dx3', r()); el.style.setProperty('--dy3', r());
      const moveDur  = `${(4 + Math.random() * 5) / cfg.speed}s`;
      const glowDur  = `${(1.2 + Math.random() * 1.5) / cfg.speed}s`;
      const delay    = `${Math.random() * 5}s`;
      el.style.animation = `fx-firefly-move ${moveDur} ${delay} ease-in-out infinite, fx-firefly-glow ${glowDur} ${delay} ease-in-out infinite`;
    }
  },

  /* ── RAYOS DE SOL ─────────────────────────────────── */
  'sun-rays': {
    particles: [],
    countBase: 8,
    css: `
      @keyframes fx-sunray {
        0%, 100% { opacity: 0; transform: scale(0.6) rotate(var(--base-rot)); }
        50%      { opacity: var(--peak-op); transform: scale(1.2) rotate(calc(var(--base-rot) + 30deg)); }
      }`,
    spawn(el, cfg) {
      el.textContent = '';
      const angle = Math.random() * 360;
      const dist  = 5 + Math.random() * 30;
      el.style.left    = `${40 + dist * Math.cos(angle * Math.PI / 180)}%`;
      el.style.top     = `${20 + dist * Math.sin(angle * Math.PI / 180) * 0.5}%`;
      el.style.width   = `${30 + Math.random() * 60}px`;
      el.style.height  = `${2 + Math.random() * 3}px`;
      el.style.background = 'linear-gradient(to right, rgba(255,240,140,0.8), transparent)';
      el.style.borderRadius = '2px';
      el.style.transformOrigin = 'left center';
      el.style.setProperty('--base-rot', `${angle}deg`);
      el.style.setProperty('--peak-op', `${0.4 + Math.random() * 0.3}`);
      el.style.setProperty('--dur',   `${(2 + Math.random() * 3) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 4}s`);
      el.style.animation = `fx-sunray var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── BURBUJAS ─────────────────────────────────────── */
  'bubbles': {
    particles: [],
    countBase: 10,
    css: `
      @keyframes fx-bubble {
        0%   { opacity: 0; transform: translateY(0) translateX(0) scale(0); }
        10%  { opacity: 0.7; transform: translateY(-5px) scale(1); }
        90%  { opacity: 0.5; }
        100% { opacity: 0; transform: translateY(var(--rise)) translateX(var(--drift)) scale(0.8); }
      }`,
    spawn(el, cfg) {
      el.textContent = '';
      const size = 8 + Math.random() * 20;
      el.style.left         = `${5 + Math.random() * 90}%`;
      el.style.bottom       = '0';
      el.style.top          = 'auto';
      el.style.width        = `${size}px`;
      el.style.height       = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.border       = '1px solid rgba(160,210,255,0.6)';
      el.style.background   = 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(160,210,255,0.1))';
      el.style.setProperty('--dur',   `${(3 + Math.random() * 4) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 5}s`);
      el.style.setProperty('--rise',  `${-150 - Math.random() * 200}px`);
      el.style.setProperty('--drift', `${-30 + Math.random() * 60}px`);
      el.style.animation = `fx-bubble var(--dur) var(--delay) ease-out infinite`;
    }
  },

  /* ── CONFETI ──────────────────────────────────────── */
  'confetti': {
    particles: [],
    countBase: 20,
    css: `
      @keyframes fx-confetti {
        0%   { opacity: 0; transform: translateY(0) rotate(0deg) translateX(0); }
        8%   { opacity: 1; }
        100% { opacity: 0; transform: translateY(110vh) rotate(var(--spin)) translateX(var(--drift)); }
      }`,
    spawn(el, cfg) {
      el.textContent = '';
      const colors = ['#ff4444','#ffaa00','#44ff44','#4488ff','#ff44ff','#44ffff','#ffff44'];
      const w = 4 + Math.random() * 8, h = 6 + Math.random() * 10;
      el.style.left         = `${Math.random() * 105}%`;
      el.style.top          = '-20px';
      el.style.width        = `${w}px`;
      el.style.height       = `${h}px`;
      el.style.background   = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
      el.style.setProperty('--dur',   `${(2 + Math.random() * 4) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 6}s`);
      el.style.setProperty('--drift', `${-60 + Math.random() * 120}px`);
      el.style.setProperty('--spin',  `${360 + Math.random() * 720}deg`);
      el.style.animation = `fx-confetti var(--dur) var(--delay) ease-in infinite`;
    }
  },

  /* ── ESTRELLAS / DESTELLOS ────────────────────────── */
  'stars': {
    particles: ['✨', '⭐', '🌟', '✨', '💫', '✨'],
    countBase: 10,
    css: `
      @keyframes fx-star {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        30%, 70% { opacity: 1; transform: scale(1) rotate(180deg); }
      }`,
    spawn(el, cfg) {
      el.style.left     = `${5 + Math.random() * 90}%`;
      el.style.top      = `${5 + Math.random() * 85}%`;
      el.style.fontSize = `${12 + Math.random() * 18}px`;
      el.style.setProperty('--dur',   `${(1.5 + Math.random() * 2) / cfg.speed}s`);
      el.style.setProperty('--delay', `${Math.random() * 6}s`);
      el.style.animation = `fx-star var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── PANADERÍA / OBJETOS VOLANDO ──────────────────── */
  'bakery': {
    particles: ['🥐', '🥖', '🧁', '🍰', '🥐', '☕', '🥐', '🧁'],
    countBase: 7,
    css: `
      @keyframes fx-bakery {
        0%   { opacity: 0; transform: translateX(-80px) translateY(20px) rotate(-20deg) scale(0.5); }
        8%   { opacity: 0.9; transform: translateX(0) translateY(0) rotate(0deg) scale(1); }
        92%  { opacity: 0.8; }
        100% { opacity: 0; transform: translateX(calc(100vw + 60px)) translateY(var(--ydrift)) rotate(var(--spin)) scale(0.8); }
      }`,
    spawn(el, cfg) {
      el.style.left     = '-5%';
      el.style.top      = `${5 + Math.random() * 85}%`;
      el.style.fontSize = `${18 + Math.random() * 16}px`;
      el.style.filter   = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))';
      el.style.setProperty('--dur',    `${(4 + Math.random() * 5) / cfg.speed}s`);
      el.style.setProperty('--delay',  `${Math.random() * 10}s`);
      el.style.setProperty('--ydrift', `${-40 + Math.random() * 80}px`);
      el.style.setProperty('--spin',   `${-30 + Math.random() * 60}deg`);
      el.style.animation = `fx-bakery var(--dur) var(--delay) ease-in-out infinite`;
    }
  },

  /* ── SIN EFECTO ───────────────────────────────────── */
  'none': {
    particles: [],
    countBase: 0,
    css: '',
    spawn() {}
  }
};

/* ── Aliases ────────────────────────────────────────── */
FX['leaves'] = FX['autumn-leaves'];

/* ── Mapeo de intensidad y velocidad ───────────────── */
const INTENSITY_MULTIPLIER = { low: 0.4, medium: 1, high: 2.2 };
const SPEED_MULTIPLIER     = { slow: 0.55, normal: 1, fast: 1.8 };

/* ═══════════════════════════════════════════════════════════════
   WEB COMPONENT
═══════════════════════════════════════════════════════════════ */
class FeriaPoster extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._modalOpen = false;
    this._modalEl   = null;
  }

  static get observedAttributes() {
    return [
      'bg-src', 'poster-desktop', 'poster-mobile', 'modal-image',
      'figure-src', 'figure-mobile-src', 'figure-src2', 'banderines-src',
      'cta-mobile', 'cta-desktop', 'board-src',
      'figure-bottom', 'figure-left',
      'figure-mobile-bottom', 'figure-mobile-left',
      'figure2-bottom', 'figure2-right',
      'figure2-mobile-bottom', 'figure2-mobile-right',
      'effect', 'effect-intensity', 'effect-speed'
    ];
  }

  connectedCallback()    { this.render(); this._createModal(); this._initListeners(); }
  disconnectedCallback() { this._cleanup(); }

  attributeChangedCallback() {
    if (this.shadowRoot.querySelector('.fp-scene')) {
      this.render(); this._createModal(); this._initListeners();
    }
  }

  /* ── Getters de contenido ───────────────────────── */
  get bgSrc()          { return this.getAttribute('bg-src') || ''; }
  get posterDesktop()  { return this.getAttribute('poster-desktop') || ''; }
  get posterMobile()   { return this.getAttribute('poster-mobile') || ''; }
  get modalImage()     { return this.getAttribute('modal-image') || this.posterMobile || this.posterDesktop; }
  get figureSrc()      { return this.getAttribute('figure-src') || ''; }
  get figureMobileSrc(){ return this.getAttribute('figure-mobile-src') || this.figureSrc; }
  get figureSrc2()     { return this.getAttribute('figure-src2') || ''; }
  get banderinesSrc()  { return this.getAttribute('banderines-src') || ''; }
  get boardSrc()       { return this.getAttribute('board-src') || ''; }
  get ctaMobile()      { return this.getAttribute('cta-mobile') || 'tocar = zoom'; }
  get ctaDesktop()     { return this.getAttribute('cta-desktop') || 'click sobre el flyer para zoom'; }

  /* ── Getters de posición de figuras ─────────────── */
  get figureBottom()       { return this.getAttribute('figure-bottom') || '0px'; }
  get figureLeft()         { return this.getAttribute('figure-left') || '-22%'; }
  get figureMobileBottom() { return this.getAttribute('figure-mobile-bottom') || '0px'; }
  get figureMobileLeft()   { return this.getAttribute('figure-mobile-left') || '-14%'; }
  get figure2Bottom()      { return this.getAttribute('figure2-bottom') || '0px'; }
  get figure2Right()       { return this.getAttribute('figure2-right') || '-18%'; }
  get figure2MobileBottom(){ return this.getAttribute('figure2-mobile-bottom') || '0px'; }
  get figure2MobileRight() { return this.getAttribute('figure2-mobile-right') || '-10%'; }

  /* ── Getters de efecto ──────────────────────────── */
  get effectName()      { return this.getAttribute('effect') || 'autumn-leaves'; }
  get effectIntensity() { return this.getAttribute('effect-intensity') || 'medium'; }
  get effectSpeed()     { return this.getAttribute('effect-speed') || 'normal'; }

  /* ── Configuración de efecto activo ─────────────── */
  _effectConfig() {
    return {
      name:      this.effectName,
      intensity: INTENSITY_MULTIPLIER[this.effectIntensity] ?? 1,
      speed:     SPEED_MULTIPLIER[this.effectSpeed] ?? 1,
    };
  }

  /* ── Render ─────────────────────────────────────── */
  render() {
    const hasFigure    = !!this.figureSrc;
    const hasFigure2   = !!this.figureSrc2;
    const hasBanderines = !!this.banderinesSrc;
    const cfg          = this._effectConfig();
    const fxDef        = FX[cfg.name] || FX['autumn-leaves'];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --fp-fig-bottom:      ${this.figureBottom};
          --fp-fig-left:        ${this.figureLeft};
          --fp-fig-mob-bottom:  ${this.figureMobileBottom};
          --fp-fig-mob-left:    ${this.figureMobileLeft};
          --fp-fig2-bottom:     ${this.figure2Bottom};
          --fp-fig2-right:      ${this.figure2Right};
          --fp-fig2-mob-bottom: ${this.figure2MobileBottom};
          --fp-fig2-mob-right:  ${this.figure2MobileRight};
        }
        ${this._styles()}
        /* ── Keyframes del efecto activo ── */
        ${fxDef.css}
      </style>

      <div class="fp-scene"${this.bgSrc ? ` style="background-image:url('${this.bgSrc}')"` : ''}>

        ${hasBanderines ? `<img class="fp-banderines" src="${this.banderinesSrc}" alt="" aria-hidden="true">` : ''}

        <div class="fp-stage">
          <div class="fp-poster-area" role="button" tabindex="0"
               aria-label="Abrir imagen de la feria"
               ${this.boardSrc ? `style="background-image:url('${this.boardSrc}')"` : ''}>
            <div class="fp-tape fp-tape--left"></div>
            <div class="fp-tape fp-tape--right"></div>
            <picture>
              ${this.posterMobile ? `<source media="(max-width: 768px)" srcset="${this.posterMobile}">` : ''}
              <img class="fp-poster-img" src="${this.posterDesktop}" alt="Feria Parroquial" draggable="false">
            </picture>
            <p class="fp-cta fp-cta--mobile">${this.ctaMobile}</p>
            <p class="fp-cta fp-cta--desktop">${this.ctaDesktop}</p>
          </div>
        </div>

        ${hasFigure ? `
        <img class="fp-figure fp-figure--desktop"
             src="${this.figureSrc}" alt="" aria-hidden="true" draggable="false">
        <img class="fp-figure fp-figure--mobile"
             src="${this.figureMobileSrc}" alt="" aria-hidden="true" draggable="false">
        ` : ''}

        ${hasFigure2 ? `
        <img class="fp-figure2 fp-figure2--desktop"
             src="${this.figureSrc2}" alt="" aria-hidden="true" draggable="false">
        <img class="fp-figure2 fp-figure2--mobile"
             src="${this.figureSrc2}" alt="" aria-hidden="true" draggable="false">
        ` : ''}

        <!-- Contenedor de partículas del efecto -->
        <div class="fp-particles" aria-hidden="true"></div>
      </div>
    `;

    this._spawnParticles(cfg, fxDef);
  }

  /* ── Spawn de partículas ─────────────────────────── */
  _spawnParticles(cfg, fxDef) {
    const container = this.shadowRoot.querySelector('.fp-particles');
    if (!container || cfg.name === 'none') return;

    const count = Math.round(fxDef.countBase * cfg.intensity);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.classList.add('fp-particle');

      /* Asignar emoji si el efecto usa partículas de texto */
      if (fxDef.particles.length > 0) {
        el.textContent = fxDef.particles[i % fxDef.particles.length];
      }

      /* Dejar que el efecto configure posición, tamaño y animación */
      fxDef.spawn(el, cfg, container, i);

      container.appendChild(el);
    }
  }

  /* ── Modal ───────────────────────────────────────── */
  _createModal() {
    if (this._modalEl) this._modalEl.remove();
    const m = document.createElement('div');
    m.className = 'feria-poster-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML = `
      <button class="fpm-close" aria-label="Cerrar">&times;</button>
      <div class="fpm-body">
        <img class="fpm-img" src="${this.modalImage}" alt="Feria Parroquial" draggable="false">
      </div>`;
    document.body.appendChild(m);
    this._modalEl = m;

    if (!document.getElementById('feria-poster-modal-css')) {
      const s = document.createElement('style');
      s.id = 'feria-poster-modal-css';
      s.textContent = `
        .feria-poster-modal {
          display: none; position: fixed; top:0; left:0;
          width:100vw; height:100vh; z-index:999999;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          align-items: center; justify-content: center;
          padding:0; margin:0; overflow:hidden;
        }
        .feria-poster-modal[open] { display:flex; animation: fpmFadeIn .25s ease; }
        @keyframes fpmFadeIn { from{opacity:0} to{opacity:1} }
        .fpm-close {
          position:fixed; top:16px; right:20px;
          background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
          color:#fff; font-size:2rem; width:48px; height:48px;
          border-radius:50%; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          backdrop-filter:blur(8px);
          transition:background .2s, transform .2s; z-index:2;
        }
        .fpm-close:hover { background:rgba(255,255,255,0.3); transform:scale(1.1); }
        .fpm-body {
          max-width:90vw; max-height:88vh;
          animation: fpmZoom .3s cubic-bezier(.22,.68,0,1.2);
        }
        @keyframes fpmZoom { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
        .fpm-img {
          display:block; max-width:100%; max-height:88vh;
          border-radius:16px; box-shadow:0 16px 48px rgba(0,0,0,0.45);
          object-fit:contain;
        }`;
      document.head.appendChild(s);
    }
  }

  /* ── Estilos Shadow DOM ──────────────────────────── */
  _styles() {
    return `
      :host {
        display: block;
        --fp-accent: #c97b2a;
        --fp-accent2: #f5d89a;
        overflow: hidden;
        max-width: 100%;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .fp-scene {
        position: relative;
        width: 90%;
        max-width: 1200px;
        margin: 2rem auto;
        min-height: 520px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #5c3a1a;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        overflow: visible;
        padding: 2.5rem 1rem 3.5rem;
        border-radius: 28px;
        box-shadow:
          0 12px 40px rgba(0,0,0,0.35),
          0 4px 12px rgba(0,0,0,0.15),
          inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .fp-scene::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: inherit;
        background-size: inherit;
        background-position: inherit;
        background-repeat: inherit;
        z-index: -1;
        overflow: hidden;
      }
      .fp-scene::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 28px;
        background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%);
        pointer-events: none;
        z-index: 1;
      }

      .fp-stage {
        position: relative;
        z-index: 2;
        width: 90%;
        max-width: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fp-banderines {
        position: absolute;
        top: -16px; right: 0;
        width: clamp(140px, 18vw, 240px);
        max-width: 30%;
        pointer-events: none;
        z-index: 12;
        filter: drop-shadow(0 6px 14px rgba(0,0,0,0.35));
        animation: fp-sway 3s ease-in-out infinite alternate;
        transform-origin: top right;
      }
      @keyframes fp-sway {
        0%   { transform: rotate(-4deg) translateY(0); }
        100% { transform: rotate(4deg) translateY(-6px); }
      }

      .fp-poster-area {
        position: relative;
        cursor: pointer;
        border-radius: 6px;
        overflow: visible;
        transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease;
        background-color: #8B6914;
        background-size: cover;
        background-position: center;
        padding: 14px;
        border: 2px solid rgba(90,55,20,0.4);
        box-shadow:
          4px 6px 18px rgba(0,0,0,0.4),
          inset 0 0 8px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.06);
      }
      .fp-poster-area:hover,
      .fp-poster-area:focus-visible {
        transform: scale(1.02) rotate(-0.3deg);
        box-shadow:
          6px 10px 28px rgba(0,0,0,0.45),
          inset 0 0 8px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.1);
        outline: none;
      }

      .fp-tape {
        position: absolute;
        width: 50px; height: 18px;
        background: rgba(245,216,154,0.7);
        z-index: 5;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        opacity: 0.85;
      }
      .fp-tape--left  { top: -8px; left: 14px;  transform: rotate(-12deg); }
      .fp-tape--right { top: -8px; right: 14px; transform: rotate(8deg); }

      .fp-poster-img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 4px;
        object-fit: contain;
      }

      .fp-cta {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.78rem;
        font-weight: 600;
        color: rgba(255,255,255,0.95);
        text-shadow: 0 1px 6px rgba(0,0,0,0.6);
        text-align: center;
        padding: 5px 16px;
        border-radius: 20px;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(6px);
        white-space: nowrap;
        pointer-events: none;
        animation: fp-blink 1.8s steps(2, start) infinite;
      }
      @keyframes fp-blink {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.15; }
      }
      .fp-cta--desktop { display: none; }
      .fp-cta--mobile  { display: block; }
      @media (min-width: 769px) {
        .fp-cta--desktop { display: block; }
        .fp-cta--mobile  { display: none; }
      }

      .fp-figure {
        position: absolute;
        pointer-events: none;
        z-index: 10;
        filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
      }
      .fp-figure--desktop {
        display: none;
        height: clamp(380px, 52vw, 560px);
        width: auto;
        bottom: var(--fp-fig-bottom, 0px);
        left: var(--fp-fig-left, -22%);
        animation: fp-float 3s ease-in-out infinite;
      }
      .fp-figure--mobile {
        display: block;
        height: clamp(405px, 108vw, 648px);
        max-width: 45%;
        width: auto;
        bottom: var(--fp-fig-mob-bottom, 0px);
        left: var(--fp-fig-mob-left, -14%);
        animation: fp-float 3s ease-in-out infinite;
      }
      @media (min-width: 769px) {
        .fp-figure--desktop { display: block; }
        .fp-figure--mobile  { display: none; }
      }
      @media (max-width: 420px) {
        .fp-figure--mobile { height: clamp(324px, 88vw, 513px); }
      }
      @keyframes fp-float {
        0%, 100% { transform: translateY(0) rotate(-1deg); }
        50%      { transform: translateY(-12px) rotate(1.5deg); }
      }

      .fp-figure2 {
        position: absolute;
        pointer-events: none;
        z-index: 10;
        filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
      }
      .fp-figure2--desktop {
        display: none;
        height: clamp(420px, 56vw, 620px);
        width: auto;
        bottom: var(--fp-fig2-bottom, 0px);
        right: var(--fp-fig2-right, -18%);
        animation: fp-float2 3.5s ease-in-out infinite;
      }
      .fp-figure2--mobile {
        display: block;
        height: clamp(450px, 120vw, 720px);
        max-width: 45%;
        width: auto;
        bottom: var(--fp-fig2-mob-bottom, 0px);
        right: var(--fp-fig2-mob-right, -10%);
        animation: fp-float2 3.5s ease-in-out infinite;
      }
      @media (min-width: 769px) {
        .fp-figure2--desktop { display: block; }
        .fp-figure2--mobile  { display: none; }
      }
      @media (max-width: 420px) {
        .fp-figure2--mobile { height: clamp(360px, 98vw, 570px); }
      }
      @keyframes fp-float2 {
        0%, 100% { transform: translateY(0) rotate(1deg); }
        50%      { transform: translateY(-14px) rotate(-1.5deg); }
      }

      /* ── Contenedor de partículas del efecto ── */
      .fp-particles {
        position: absolute;
        /* Extendemos el área más allá de la escena para que los efectos
           de viento y los que empiezan fuera del borde sean visibles.
           El clip real lo hace .fp-scene con overflow:hidden en mobile;
           en desktop usamos clip-path para mantener el borde redondeado
           sin cortar las partículas que entran/salen por los lados. */
        inset: -60px -80px;   /* margen extra izq/der para wind, bakery */
        top: -30px;           /* margen arriba para lluvia/nieve */
        bottom: -20px;        /* margen abajo para burbujas */
        pointer-events: none;
        overflow: visible;
        z-index: 3;
      }
      /* Base de cada partícula — posición y animación las pone el spawn */
      .fp-particle {
        position: absolute;
        pointer-events: none;
        user-select: none;
        will-change: transform, opacity;
        /* Asegurar que divs sin textContent sean visibles */
        display: block;
      }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        .fp-scene {
          width: 95%; min-height: 380px;
          padding: 2rem 0.5rem 2.5rem;
          border-radius: 20px; overflow: hidden;
        }
        .fp-stage { width: 94%; }
        .fp-poster-area { padding: 4px; }
        .fp-tape { width: 36px; height: 14px; }
        .fp-banderines { width: clamp(100px, 22vw, 150px); max-width: 28%; top: -10px; right: 0; }
      }
      @media (max-width: 768px) {
        .fp-scene { overflow: hidden; }
      }
      @media (min-width: 1200px) {
        .fp-scene { min-height: 620px; }
        .fp-stage { max-width: 650px; }
      }
    `;
  }

  /* ── Eventos ─────────────────────────────────────── */
  _initListeners() {
    const poster = this.shadowRoot.querySelector('.fp-poster-area');

    const openModal = () => {
      if (!this._modalEl) return;
      this._modalEl.setAttribute('open', '');
      this._modalOpen = true;
      document.body.style.overflow = 'hidden';
    };
    poster?.addEventListener('click', openModal);
    poster?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });

    const closeModal = () => {
      if (!this._modalEl) return;
      this._modalEl.removeAttribute('open');
      this._modalOpen = false;
      document.body.style.overflow = '';
    };

    if (this._modalEl) {
      const closeBtn = this._modalEl.querySelector('.fpm-close');
      const bodyEl   = this._modalEl.querySelector('.fpm-body');
      closeBtn?.addEventListener('click', closeModal);
      this._modalEl.addEventListener('click', (e) => {
        if (!bodyEl.contains(e.target)) closeModal();
      });
    }

    this._escHandler = (e) => {
      if (e.key === 'Escape' && this._modalOpen) closeModal();
    };
    document.addEventListener('keydown', this._escHandler);
  }

  _cleanup() {
    if (this._escHandler) document.removeEventListener('keydown', this._escHandler);
    if (this._modalEl) { this._modalEl.remove(); this._modalEl = null; }
    if (this._modalOpen) document.body.style.overflow = '';
  }
}

customElements.define('feria-poster', FeriaPoster);
