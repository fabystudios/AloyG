/**
 * <section-title> Web Component
 *
 * Encapsula el patrón <section class="section-header"><h2 class="md3-headline">…
 * que se repetía en index.html (Anuncios, RETIROS, MISAS, etc).
 *
 * Hereda los estilos base de .section-header / .md3-headline definidos en
 * style.css (renderiza light-DOM con esas clases), así que el look queda
 * coherente y respeta los media-queries mobile (height/padding/max-width).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  ATRIBUTOS DE CONTENIDO                                                  │
 * ├──────────────────┬──────────────────────────────────┬──────────────────-┤
 * │ text             │ string                           │ ""                 │
 * │ icon             │ emoji, material-icon, fa-…       │ ""                 │
 * │ icon-type        │ auto|emoji|material|fa           │ "auto"             │
 * │ icon-mobile      │ on|off  (off = oculta el ícono ≤768px) │ on           │
 * │ theme            │ classic|3d|navidad               │ classic            │
 * │ shadow           │ ""|"lg"                          │ ""                 │
 * │ extra-style      │ CSS inline extra para el section │ ""                 │
 * │ id               │ string                           │ ""                 │
 * │                                                                         │
 * │  theme="3d" → franja con relieve (neumorfismo/glass) a juego con el     │
 * │  header: bisel, filete dorado, glow, ícono en medallón. Toma sus colores│
 * │  de las variables --n3d-* de css/navbar-3d.css, así que cambia solo     │
 * │  con los temas (Navidad, etc.). Sin el atributo se mantiene el look      │
 * │  clásico. theme="navidad" = 3D en rojo + estrellas chispeando + bastones │
 * │  de caramelo + nieve amontonada arriba (canvas). Se activa solo si el   │
 * │  <html> tiene class="tema-navidad".                                     │
 * │  Para activarlo en TODOS los títulos de una vez:                        │
 * │      <html data-st-theme="3d">   (el atributo theme del elemento manda) │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  IMAGEN DESPUÉS DEL TÍTULO  (img="…")                                    │
 * │   img                 url de la imagen (si falta, no se dibuja nada)    │
 * │   img-alt             texto alternativo                                 │
 * │   img-max-height      CSS (default 80px)                                │
 * │   img-max-width       CSS (default 180px)                               │
 * │   img-max-height-mobile  CSS, solo ≤768px (default 56px)                │
 * │   img-mobile          on|off  (off = oculta la imagen ≤768px)  (on)     │
 * │   img-idle            none|float  → animación continua en reposo        │
 * │   img-effect          none|zigzag|point|wiggle|float|bounce|pulse       │
 * │   img-trigger         click|hover|auto  (default: click si hay efecto)  │
 * │                       click = UNA pasada por toque, se reinicia si se   │
 * │                       vuelve a tocar; hover/auto = en bucle             │
 * │   img-class           clases extra para el <img> (ej. "zig-target")     │
 * │   img-play-class      clase propia que se aplica al tocar (ej. "zigzag")│
 * │                       en lugar del efecto interno; se quita sola        │
 * │                       en animationend                                   │
 * │   ej: <section-title text="Avisos" img="./cartelera/gio-dedo.png"       │
 * │        img-alt="Gio señalando" img-idle="float" img-effect="zigzag">    │
 * │       </section-title>                                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  EFFECT — acepta varios valores separados por espacio                    │
 * │     ej: effect="stars floating-png glow-pulse"                           │
 * │  Valores:                                                               │
 * │    none, stars, bubbles, confetti, snow, rays,                          │
 * │    glow-pulse, aurora, floating-png, floating-svg                       │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  ATRIBUTOS POR EFECTO                                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ floating-png:                                                            │
 * │   png-src       url                                                     │
 * │   png-count     1–20 (default 6)                                        │
 * │   png-width     CSS width                                               │
 * │   png-height    CSS height                                              │
 * │   png-size      atajo: width si no hay png-width/height (default 48px)  │
 * │                                                                         │
 * │ floating-svg:                                                            │
 * │   svg-shape     cross|heart|star|circle|triangle|dove (default cross)   │
 * │   svg-color     color CSS (default #ffd700)                             │
 * │   svg-count     1–20 (default 6)                                        │
 * │   svg-size      tamaño CSS (default 28px)                               │
 * │                                                                         │
 * │ glow-pulse:                                                              │
 * │   glow-color    color CSS (default #ffd700)                             │
 * │                                                                         │
 * │ rays:                                                                    │
 * │   rays-color    color CSS (default #ffd700)                             │
 * │   rays-count    nº de rayos (default 8)                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

(function () {
  if (customElements.get('section-title')) return;

  /* ───── estilos (sólo lo que no aporta .section-header) ───── */
  if (!document.querySelector('style[data-section-title]')) {
    const st = document.createElement('style');
    st.setAttribute('data-section-title', '1');
    st.textContent = `
      /* el host: !important para defender contra reglas externas tipo #nosotros
         que pisan display/padding por especificidad de ID. */
      section-title {
        display: block !important;
        padding: 0 !important;
        background: transparent !important;
      }

      section-title .st-fx-layer {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
        border-radius: inherit;
      }
      section-title .st-fx-layer canvas { width: 100%; height: 100%; display: block; }

      section-title .st-fx-layer .st-png,
      section-title .st-fx-layer .st-svg {
        position: absolute;
        opacity: 0.85;
        will-change: transform;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
      }

      section-title .st-fx-layer .st-glow-pulse {
        position: absolute; inset: 0;
        border-radius: inherit;
        animation: st-glow-pulse 2.4s ease-in-out infinite;
        mix-blend-mode: screen;
        transform-origin: center;
      }

      section-title .st-fx-layer .st-aurora {
        position: absolute; inset: 0;
        border-radius: inherit;
        background-size: 400% 400%;
        animation: st-aurora-shift 14s ease-in-out infinite;
        mix-blend-mode: overlay;
        opacity: 0.85;
      }

      section-title .md3-headline {
        position: relative;
        z-index: 2;
      }

      /* Restaurar centrado del .section-header — el "reacomodamiento gral" lo
         dejó en display:block produciendo padding asimétrico.
         width:100% defiende contra reglas legacy como #nosotros { display:flex; }
         que hacían que el flex container colapsara a content-width. */
      section-title > section.section-header {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
      }

      /* Refuerzo mobile: contrarresta inline styles que pisan el padding base */
      @media (max-width: 768px) {
        section-title > section.section-header {
          padding: 1rem 1.5rem !important;
          height: 70px !important;
          max-width: 95% !important;
          border-radius: 18px !important;
        }
        section-title > section.section-header .md3-headline {
          font-size: 1.2rem !important;
          letter-spacing: 0.3px !important;
        }
        /* icon-mobile="off" → oculta el ícono cuando viewport ≤ 768px */
        section-title .st-icon-hide-mobile { display: none !important; }
      }


      /* ═══════════════════════════════════════════════════════════════
         ÍCONO EN "CHIP": en el tema clásico es transparente (display:contents),
         así que el layout es idéntico al de antes.
         ═══════════════════════════════════════════════════════════════ */
      section-title .st-icon-chip { display: contents; }

      /* ═══════════════════════════════════════════════════════════════
         TEMA 3D  (theme="3d")  — a juego con el header (css/navbar-3d.css)
         Los colores salen de las variables --n3d-*; si no existen se usan los
         valores azules por defecto. Con el tema Navidad se vuelve rojo solo.
         ═══════════════════════════════════════════════════════════════ */
      section-title .section-header.st-3d {
        --_s1: var(--n3d-s1, #4096ee);
        --_s2: var(--n3d-s2, #1e7ad8);
        --_s3: var(--n3d-s3, #1565c0);
        --_s4: var(--n3d-s4, #0d47a1);
        --_sh: var(--n3d-sombra, 0, 20, 70);
        --_luz: var(--n3d-luz, 120, 185, 255);
        --_g1: var(--n3d-glow-1, 66, 165, 245);
        --_g2: var(--n3d-glow-2, 100, 181, 246);
        --_gold: var(--n3d-dorado, 212, 175, 55);

        /* losa: luz arriba, profundidad abajo */
        background:
          linear-gradient(180deg, rgba(255,255,255,.20) 0%, rgba(255,255,255,0) 46%, rgba(0,0,0,.12) 100%),
          linear-gradient(180deg, var(--_s1) 0%, var(--_s2) 14%, var(--_s3) 55%, var(--_s4) 100%);
        border: 1px solid rgba(255,255,255,.22);
        border-radius: 22px;
        /* !important: .shadow-lg de Bootstrap también lo trae */
        box-shadow:
          0 14px 24px -10px rgba(var(--_sh), .55),
          0 28px 44px -22px rgba(var(--_sh), .45),
          0 0 18px 2px rgba(var(--_g1), .38),
          inset 0 1px 0 rgba(255,255,255,.5),
          inset 0 -3px 6px rgba(var(--_sh), .45),
          inset 0 14px 22px rgba(255,255,255,.07) !important;
        transition: transform .3s ease, box-shadow .3s ease;
      }
      section-title .section-header.st-3d:hover {
        box-shadow:
          0 18px 28px -10px rgba(var(--_sh), .6),
          0 32px 48px -22px rgba(var(--_sh), .5),
          0 0 30px 6px rgba(var(--_g2), .65),
          inset 0 1px 0 rgba(255,255,255,.65),
          inset 0 -3px 6px rgba(var(--_sh), .45),
          inset 0 14px 22px rgba(255,255,255,.10) !important;
      }

      /* destello que cruza al pasar el mouse: blanco y dorado */
      section-title .section-header.st-3d::before {
        background: linear-gradient(120deg, transparent 0%,
          rgba(var(--_gold), .22) 45%, rgba(255,255,255,.55) 50%,
          rgba(var(--_gold), .22) 55%, transparent 100%);
        pointer-events: none;
        z-index: 1;
      }

      /* filete dorado ahusado en el borde inferior (el mismo del header) */
      section-title .section-header.st-3d::after {
        content: "";
        position: absolute;
        left: 8%; right: 8%; bottom: 0;
        height: var(--n3d-filete, 3px);
        border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        background:
          linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 60%),
          linear-gradient(90deg, transparent, #b8902a 20%, #f3dc8f 50%, #b8902a 80%, transparent);
        box-shadow: 0 0 6px rgba(255,214,102,.4);
        pointer-events: none;
        z-index: 3;
      }

      /* título grabado en la losa */
      section-title .section-header.st-3d .md3-headline {
        letter-spacing: 1.2px;
        text-shadow:
          0 1px 0 rgba(var(--_sh), .65),
          0 2px 3px rgba(var(--_sh), .6),
          0 0 18px rgba(var(--_g1), .35);
      }

      /* ícono: medallón con relieve y aro dorado */
      section-title .section-header.st-3d .st-icon-chip {
        display: inline-flex; align-items: center; justify-content: center;
        flex: 0 0 auto;
        width: 2.1em; height: 2.1em;
        font-size: .82em;
        margin-right: .7em;
        vertical-align: middle;
        line-height: 1;
        text-transform: none;
        border-radius: 50%;
        background: linear-gradient(145deg, rgba(255,255,255,.28), rgba(255,255,255,.06) 45%, rgba(var(--_sh), .28));
        border: 1px solid rgba(var(--_gold), .75);
        box-shadow:
          3px 4px 8px rgba(var(--_sh), .5),
          -2px -2px 6px rgba(var(--_luz), .32),
          inset 0 1px 0 rgba(255,255,255,.45),
          inset 0 -2px 4px rgba(var(--_sh), .28);
        text-shadow: 0 1px 2px rgba(var(--_sh), .6);
        transition: transform .3s ease;
      }
      section-title .section-header.st-3d .st-icon-chip > i {
        margin: 0 !important;
        font-size: 1.05em !important;
        vertical-align: middle !important;
      }
      section-title .section-header.st-3d:hover .st-icon-chip { transform: translateY(-1px) scale(1.06); }

      @media (max-width: 768px) {
        section-title .section-header.st-3d { border-radius: 18px !important; }
        section-title .section-header.st-3d .st-icon-chip { font-size: .72em; margin-right: .55em; }
      }


      /* ═══════════════════════════════════════════════════════════════
         TEMA NAVIDAD  (theme="navidad"  ·  o <html class="tema-navidad">)
         = tema 3D en ROJO + estrellas chispeando + bastones + nieve arriba
         ═══════════════════════════════════════════════════════════════ */
      section-title.st-xmas-host { position: relative; }

      section-title .section-header.st-3d.st-xmas {
        --_s1: #ee5a4f; --_s2: #d32f2f; --_s3: #b71c1c; --_s4: #8e1414;
        --_sh: 70, 5, 8;
        --_luz: 255, 140, 135;
        --_g1: 255, 82, 82;
        --_g2: 255, 138, 128;
      }

      /* interior del cartel: estrellas y bastones (detrás del título) */
      section-title .st-xmas-inner {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
        border-radius: inherit;
      }
      section-title .st-xmas-inner canvas { display: block; width: 100%; height: 100%; }

      /* nieve: fuera del cartel (que recorta con overflow:hidden), apoyada sobre su borde superior */
      section-title .st-snow-cap {
        position: absolute;
        z-index: 6;
        pointer-events: none;
        display: block;
        transition: transform .3s ease;
      }
      /* acompaña al cartel cuando se eleva 2px en hover */
      section-title:has(.section-header:hover) .st-snow-cap { transform: translateY(-2px); }


      /* ═══════════════════════════════════════════════════════════════
         IMAGEN DESPUÉS DEL TÍTULO  (atributo img="…")
         · reposo (img-idle): animación continua, ej. flotar
         · efecto (img-effect): una sola pasada al tocar/clic (se reinicia si se vuelve a
           tocar), o en bucle con img-trigger="auto" / mientras hay hover
         ═══════════════════════════════════════════════════════════════ */
      section-title .st-img-wrap {
        position: relative;
        z-index: 3;
        overflow: visible;                 /* la imagen puede salirse de su caja al animarse */
        display: inline-block;
        vertical-align: middle;
        margin-left: .6em;
        line-height: 0;                    /* sin hueco bajo la imagen */
        text-transform: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      section-title .st-img-wrap[data-trigger="click"] { cursor: pointer; }
      section-title .st-img-wrap:focus-visible {
        outline: 2px solid rgba(255,255,255,.85);
        outline-offset: 3px;
        border-radius: 8px;
      }
      section-title .st-img-wrap .st-img {
        display: block;
        width: auto; height: auto;
        max-width: var(--st-img-mw, 180px);
        max-height: var(--st-img-mh, 80px);
        object-fit: contain;
        will-change: transform;
        transform-origin: 50% 90%;         /* pivote en la "panza": parece colgar y flotar */
        user-select: none;
        -webkit-user-drag: none;
      }
      /* con tema 3D / Navidad la imagen gana profundidad */
      section-title .section-header.st-3d .st-img { filter: drop-shadow(0 4px 6px rgba(var(--_sh), .5)); }

      /* cada efecto define su versión en bucle (--st-anim) y de una pasada (--st-anim-once) */
      section-title .st-img-wrap[data-fx="zigzag"] { --st-anim: st-img-zigzag .9s ease-in-out infinite; --st-anim-once: st-img-zigzag .9s ease-in-out 1; }
      section-title .st-img-wrap[data-fx="point"]  { --st-anim: st-img-point 1.2s ease-in-out infinite;  --st-anim-once: st-img-point 1.2s ease-in-out 1; }
      section-title .st-img-wrap[data-fx="wiggle"] { --st-anim: st-img-wiggle .9s ease-in-out infinite;  --st-anim-once: st-img-wiggle .9s ease-in-out 1; }
      section-title .st-img-wrap[data-fx="float"]  { --st-anim: st-img-float 2.6s ease-in-out infinite;  --st-anim-once: st-img-float 1.6s ease-in-out 1; }
      section-title .st-img-wrap[data-fx="bounce"] { --st-anim: st-img-bounce 1.4s ease-in-out infinite; --st-anim-once: st-img-bounce 1.4s ease-in-out 1; }
      section-title .st-img-wrap[data-fx="pulse"]  { --st-anim: st-img-pulse 1.4s ease-in-out infinite;  --st-anim-once: st-img-pulse .8s ease-in-out 1; }

      /* orden importa (misma especificidad): reposo → bucle por disparador → una pasada (gana) */
      section-title .st-img-wrap[data-idle="float"] .st-img { animation: st-img-idle-float 3.4s ease-in-out infinite; }
      section-title .st-img-wrap[data-trigger="auto"] .st-img,
      section-title .st-img-wrap[data-trigger="hover"]:hover .st-img { animation: var(--st-anim, none); }
      section-title .st-img-wrap .st-img.st-play { animation: var(--st-anim-once, none); }

      @keyframes st-img-idle-float { 0%,100% { transform: translateY(0) rotate(-1.5deg); }
                                     50% { transform: translateY(-5px) rotate(1.5deg); } }
      @keyframes st-img-zigzag { 0% { transform: translate(0,0) rotate(0); }
                                 12% { transform: translate(-8px,-4px) rotate(-9deg); }
                                 28% { transform: translate(8px,0) rotate(9deg); }
                                 44% { transform: translate(-6px,-3px) rotate(-6deg); }
                                 60% { transform: translate(6px,0) rotate(6deg); }
                                 76% { transform: translate(-3px,-1px) rotate(-3deg); }
                                 100% { transform: translate(0,0) rotate(0); } }
      @keyframes st-img-point  { 0%,100% { transform: translateX(0); }
                                 20% { transform: translateX(-9px); } 40% { transform: translateX(0); }
                                 60% { transform: translateX(-9px); } 80% { transform: translateX(0); } }
      @keyframes st-img-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
      @keyframes st-img-float  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes st-img-bounce { 0%,100% { transform: translateY(0) scale(1,1); }
                                 30% { transform: translateY(-11px) scale(.96,1.05); }
                                 50% { transform: translateY(0) scale(1.06,.94); }
                                 65% { transform: translateY(-4px) scale(1,1); } }
      @keyframes st-img-pulse  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.09); } }

      @media (prefers-reduced-motion: reduce) {
        section-title .st-img-wrap .st-img { animation: none !important; }
      }
      @media (max-width: 768px) {
        section-title .st-img-wrap { margin-left: .4em; }
        section-title .st-img-wrap .st-img {
          max-width: min(var(--st-img-mw, 180px), 38vw);
          max-height: var(--st-img-mhm, 56px);
        }
        /* img-mobile="off" → oculta la imagen cuando viewport ≤ 768px */
        section-title .st-img-wrap.st-img-hide-mobile { display: none !important; }
      }

      @keyframes st-png-float {
        0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
        50%  { transform: translate3d(8px, -10px, 0) rotate(6deg); }
        100% { transform: translate3d(0, 0, 0) rotate(0deg); }
      }

      @keyframes st-glow-pulse {
        0%, 100% { opacity: 0.25; transform: scale(0.94); }
        50%      { opacity: 0.85; transform: scale(1.02); }
      }

      @keyframes st-aurora-shift {
        0%   { background-position:   0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position:   0% 50%; }
      }
    `;
    document.head.appendChild(st);
  }

  /* ───── SVG shapes ───── */
  const SVG_SHAPES = {
    cross:    'M11 2h2v8h8v2h-8v10h-2V12H3v-2h8z',
    heart:    'M12 21s-7-4.5-7-10a4 4 0 017-2.8A4 4 0 0119 11c0 5.5-7 10-7 10z',
    star:     'M12 2l2.5 7.5H22l-6 4.5 2.3 7.5L12 17l-6.3 4.5L8 14l-6-4.5h7.5z',
    circle:   'M12 2a10 10 0 110 20 10 10 0 010-20z',
    triangle: 'M12 2 L22 22 L2 22 Z',
    dove:     'M2 13 C2 8 7 6 11 7 C13 7.5 14 8.5 15 10 L20 7 L18.5 11 L21 14 L17 13.5 C15 17 9 18 5 15 C3.5 14 2.5 13.5 2 13 Z',
  };

  /* ───── paleta común ───── */
  const PARTICLE_COLORS = ['#fffbe9','#ffd700','#00e5ff','#ff80ab','#b388ff','#fff','#ffe082','#80d8ff','#ffb300','#ff4081'];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ───────── lista canónica de efectos ───────── */
  const CANVAS_EFFECTS = ['stars', 'bubbles', 'popping-bubbles', 'confetti', 'snow', 'rays', 'fairy-dust'];

  /* paleta pastel suave específica para fairy-dust (rosita, lavanda, dorado pálido, celeste) */
  const FAIRY_COLORS = ['#ffd1ec','#c9b9ff','#a0e9ff','#fff6c2','#d4a3ff','#9ffff6','#ffb1e1','#ffe5a0'];
  const DOM_EFFECTS    = ['floating-png', 'floating-svg', 'glow-pulse', 'aurora'];
  const TEXT_EFFECTS   = ['text-glow'];
  const ALL_EFFECTS    = [...CANVAS_EFFECTS, ...DOM_EFFECTS, ...TEXT_EFFECTS];


  /* ═══════════════════════════════════════════════════════════════
     MOTOR NAVIDAD (compartido por todos los títulos)
     · un solo requestAnimationFrame para todos
     · solo se dibuja lo que está en pantalla (IntersectionObserver)
     · "reducir movimiento": un cuadro estático, sin animar
     ═══════════════════════════════════════════════════════════════ */
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const XMAS = new Set();
  const XMAS_STAR_COLORS = ['255,250,235', '255,226,140', '255,205,210', '255,240,200', '255,255,255'];
  let xmasRaf = 0, xmasLast = 0, xmasT = 0;

  const xmasReduce = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const xmasIO = ('IntersectionObserver' in window)
    ? new IntersectionObserver(entries => {
        entries.forEach(e => XMAS.forEach(st => { if (st.host === e.target) st.visible = e.isIntersecting; }));
      })
    : null;

  function xmasLoop(ts) {
    xmasRaf = requestAnimationFrame(xmasLoop);
    const dt = Math.min((ts - xmasLast) / 1000, 0.1);
    xmasLast = ts;
    xmasT += dt;
    XMAS.forEach(st => { if (st.visible) xmasDraw(st, dt); });
  }
  function xmasEnsureLoop() {
    if (xmasRaf || !XMAS.size || xmasReduce()) return;
    xmasLast = performance.now();
    xmasRaf = requestAnimationFrame(xmasLoop);
  }
  function xmasMaybeStopLoop() {
    if (!XMAS.size && xmasRaf) { cancelAnimationFrame(xmasRaf); xmasRaf = 0; }
  }

  /* ───── destellos ───── */
  function xmasSpark(c, x, y, r, a, col) {            // estrella de 4 puntas con halo
    const g = c.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, 'rgba(' + col + ',' + (a * 0.55).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r * 2.4, 0, TAU); c.fill();
    const k = r * 1.8, q = r * 0.18;
    c.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
    c.beginPath();
    c.moveTo(x, y - k);
    c.quadraticCurveTo(x + q, y - q, x + k, y);
    c.quadraticCurveTo(x + q, y + q, x, y + k);
    c.quadraticCurveTo(x - q, y + q, x - k, y);
    c.quadraticCurveTo(x - q, y - q, x, y - k);
    c.fill();
  }

  function xmasStar5(c, x, y, r, rot, a, col) {        // estrellita de 5 puntas con halo
    const g = c.createRadialGradient(x, y, 0, x, y, r * 2.6);
    g.addColorStop(0, 'rgba(' + col + ',' + (a * 0.45).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r * 2.6, 0, TAU); c.fill();
    c.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = rot - Math.PI / 2 + i * Math.PI / 5;
      const rad = (i % 2 === 0) ? r : r * 0.42;
      const px = x + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
  }

  function xmasNewStar(st, anywhere) {
    const k = Math.random();
    return {
      x: rand(8, Math.max(9, st.W - 8)),
      y: rand(6, Math.max(7, st.H - 6)),
      kind: k < 0.52 ? 'spark' : k < 0.82 ? 'star' : 'dot',
      r: k < 0.52 ? rand(2.4, 4.6) : k < 0.82 ? rand(2.4, 4.2) : rand(0.7, 1.6),
      rot: rand(-0.4, 0.4),
      life: anywhere ? Math.random() : 0,          // 0 → nace, 0.5 → brilla al máximo, 1 → se apaga
      speed: rand(0.2, 0.55),                      // ciclos por segundo (2–5 s por destello)
      col: pick(XMAS_STAR_COLORS)
    };
  }

  /* ───── bastón de caramelo (se dibuja UNA vez en un sprite) ───── */
  function xmasCaneSprite(h, dpr) {
    const w = h * 0.16;                 // grosor del bastón
    const r = h * 0.22;                 // radio del gancho
    const pad = 7;                      // margen para sombra
    const cw = Math.ceil(w + r * 2 + pad * 2), ch = Math.ceil(h + pad * 2);
    const mk = () => {
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(cw * dpr); cv.height = Math.ceil(ch * dpr);
      const x = cv.getContext('2d'); x.scale(dpr, dpr);
      x.lineCap = 'round'; x.lineJoin = 'round';
      return [cv, x];
    };
    const path = (x) => {               // forma de "J": tallo recto + gancho
      const sx = pad + w / 2, top = pad + w / 2 + r;
      x.beginPath();
      x.moveTo(sx, pad + h - w / 2);
      x.lineTo(sx, top);
      x.arc(sx + r, top, r, Math.PI, TAU, false);
      x.lineTo(sx + 2 * r, top + r * 0.55);
    };

    // B: tubo blanco con rayas rojas diagonales (source-atop = solo dentro del tubo) + brillo y sombreado
    const [B, bx] = mk();
    path(bx); bx.lineWidth = w; bx.strokeStyle = '#ffffff'; bx.stroke();
    bx.globalCompositeOperation = 'source-atop';
    bx.fillStyle = '#d32f2f';
    const sp = w * 1.25, sw = w * 0.62, span = Math.hypot(cw, ch);
    bx.save(); bx.translate(cw / 2, ch / 2); bx.rotate(-Math.PI / 4);
    for (let k = -span; k < span; k += sp) bx.fillRect(k, -span, sw, span * 2);
    bx.restore();
    bx.save(); bx.translate(-w * 0.2, -w * 0.2);
    path(bx); bx.lineWidth = w * 0.32; bx.strokeStyle = 'rgba(255,255,255,.5)'; bx.stroke();
    bx.restore();
    bx.save(); bx.translate(w * 0.22, w * 0.22);
    path(bx); bx.lineWidth = w * 0.3; bx.strokeStyle = 'rgba(90,0,0,.28)'; bx.stroke();
    bx.restore();
    bx.globalCompositeOperation = 'source-over';

    // A: contorno oscuro + sombra proyectada + el tubo
    const [A, ax] = mk();
    ax.save();
    ax.shadowColor = 'rgba(50,0,0,.5)'; ax.shadowBlur = 5; ax.shadowOffsetY = 3;
    path(ax); ax.lineWidth = w + 2.4; ax.strokeStyle = 'rgba(120,12,12,.85)'; ax.stroke();
    ax.restore();
    ax.drawImage(B, 0, 0, cw, ch);
    return { c: A, w: cw, h: ch, ax: pad + w / 2, ay: pad + h, hook: w + r * 2 };
  }

  /* ───── nieve amontonada sobre el borde superior del cartel (sprite estático) ─────
     Nada es periódico (para que no parezca un toldo):
       · montones = campanas de Gauss con posición, ancho y alto al azar
         (uno o dos grandes y varias lomas bajas)
       · borde inferior = lóbulos de ancho y profundidad irregulares; algunos
         tramos casi no rebasan y otros cuelgan como goterones
     Dos capas para dar profundidad: atrás una montaña más alta y azulada,
     delante el manto blanco con grumos esponjosos. */
  function xmasSnowSprite(W, up, down, dpr) {
    const H = up + down;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
    const x = cv.getContext('2d'); x.scale(dpr, dpr);

    const x0 = 5, x1 = W - 5, span = x1 - x0, y0 = up;     // y0 = borde superior del cartel
    const sc = Math.max(0.65, up / 26);                    // escala (en mobile todo más chico)

    const makePile = (bigMax) => {
      const bumps = [];
      const nBig = 1 + (Math.random() < 0.7 ? 1 : 0) + (span > 700 && Math.random() < 0.6 ? 1 : 0);
      for (let i = 0; i < nBig; i++) bumps.push({ c: rand(0.1, 0.9), w: rand(34, 110) / span, h: rand(0.75, 1) * bigMax });
      const nSmall = Math.max(3, Math.round(span / 55));
      for (let i = 0; i < nSmall; i++) bumps.push({ c: rand(0.02, 0.98), w: rand(12, 46) / span, h: rand(0.12, 0.42) * bigMax });
      return t => {
        let m = 0;
        for (let i = 0; i < bumps.length; i++) { const b = bumps[i], d = (t - b.c) / b.w; m += b.h * Math.exp(-d * d); }
        const win = Math.pow(Math.sin(Math.PI * t), 0.45);
        return (1.5 + (up - 3) * (1 - Math.exp(-m * 1.3))) * win;
      };
    };
    const topAt = makePile(0.85);                          // manto de adelante
    const backAt = makePile(1.25);                         // montaña de atrás (más alta)

    // lóbulos del borde inferior, irregulares
    const lobes = [];
    for (let px = x0; px < x1;) {
      const b = Math.min(x1, px + rand(7, 30));
      const t = ((px + b) / 2 - x0) / span;
      const win = Math.pow(Math.sin(Math.PI * t), 0.6);
      const deep = Math.random() < 0.42;
      lobes.push({ a: px, b, d: (deep ? rand(down * 0.5, down) : rand(0.8, down * 0.28)) * win });
      px = b;
    }

    // capa de atrás (azulada)
    x.beginPath();
    x.moveTo(x0, y0 + 1);
    for (let px = x0; px <= x1; px += 2) x.lineTo(px, y0 - backAt((px - x0) / span));
    x.lineTo(x1, y0 + 1);
    x.closePath();
    const gb = x.createLinearGradient(0, 0, 0, y0);
    gb.addColorStop(0, '#f4f8ff'); gb.addColorStop(1, '#b6cae8');
    x.save();                                              // sombra azulada hacia afuera: da contorno sobre fondos claros
    x.shadowColor = 'rgba(60,90,150,.45)'; x.shadowBlur = 5; x.shadowOffsetY = 1;
    x.fillStyle = gb; x.fill();
    x.restore();
    x.beginPath();                                         // filete azulado en la cresta de la montaña
    for (let px = x0; px <= x1; px += 2) { const yy = y0 - backAt((px - x0) / span); if (px === x0) x.moveTo(px, yy); else x.lineTo(px, yy); }
    x.strokeStyle = 'rgba(140,165,210,.55)'; x.lineWidth = 1; x.stroke();

    // manto de adelante
    x.beginPath();
    x.moveTo(x0, y0);
    for (let px = x0; px <= x1; px += 2) x.lineTo(px, y0 - topAt((px - x0) / span));
    x.lineTo(x1, y0 + 1.2);
    for (let i = lobes.length - 1; i >= 0; i--) {
      const L = lobes[i];
      x.lineTo(L.b, y0 + 1.2);
      x.quadraticCurveTo((L.a + L.b) / 2, y0 + 1.2 + L.d * 1.9, L.a, y0 + 1.2);
    }
    x.closePath();
    x.save();                                              // sombra suave sobre la cara roja + relleno
    x.shadowColor = 'rgba(30,50,110,.5)'; x.shadowBlur = 6; x.shadowOffsetY = 3;
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#f1f6ff'); g.addColorStop(1, '#bcd0ee');
    x.fillStyle = g; x.fill();
    x.restore();
    x.beginPath();                                         // filete azulado en la cresta del manto
    for (let px = x0; px <= x1; px += 2) { const yy = y0 - topAt((px - x0) / span); if (px === x0) x.moveTo(px, yy); else x.lineTo(px, yy); }
    x.strokeStyle = 'rgba(150,175,215,.5)'; x.lineWidth = 1; x.stroke();

    // grumos esponjosos sobre ambas capas
    const lumps = Math.round(span / 30);
    for (let i = 0; i < lumps; i++) {
      const t = rand(0.04, 0.96), px = x0 + t * span;
      const useBack = Math.random() < 0.4;
      const r = rand(3.5, 8) * sc;
      const py = y0 - (useBack ? backAt(t) : topAt(t)) + r * 0.35;
      const lg = x.createRadialGradient(px - r * 0.3, py - r * 0.35, r * 0.1, px, py, r);
      lg.addColorStop(0, '#ffffff'); lg.addColorStop(1, useBack ? 'rgba(206,222,247,.95)' : 'rgba(224,235,252,.92)');
      x.fillStyle = lg;
      x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    }
    return { c: cv, topAt: backAt, x0, span, y0 };
  }

  /* ───── medidas / sprites (al montar y cada vez que cambia el tamaño) ───── */
  function xmasResize(st) {
    const sec = st.section, host = st.host;
    const W = sec.offsetWidth, H = sec.offsetHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const h2w = st.h2 ? st.h2.offsetWidth : 0;
    const key = W + 'x' + H + 'x' + h2w + 'x' + dpr;

    // nieve: canvas a nivel del host, apoyado sobre el borde superior del cartel
    // (la posición se actualiza siempre; es barato)
    const small = W < 520 || H < 80;
    const up = small ? 18 : 26, down = small ? 8 : 12;
    const hr = host.getBoundingClientRect(), sr = sec.getBoundingClientRect();
    st.cap.style.left = (sr.left - hr.left) + 'px';
    st.cap.style.top = (sr.top - hr.top - up) + 'px';

    if (st.key === key) return;          // mismo tamaño: no se vuelve a sortear nada (la nieve no "salta")
    st.key = key;
    st.W = W; st.H = H; st.dpr = dpr;

    // interior: estrellas + bastones flotantes
    st.canvas.width = Math.round(W * dpr);
    st.canvas.height = Math.round(H * dpr);
    st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = clamp(Math.round(W * H / 2600), 8, 34);
    st.stars = [];
    for (let i = 0; i < n; i++) st.stars.push(xmasNewStar(st, true));

    // bastones chicos que flotan en el sitio libre a cada lado del título
    const caneH = clamp(H * 0.5, 24, 40);
    st.cane = xmasCaneSprite(caneH, dpr);
    const free = (W - h2w) / 2;
    const hook = st.cane.hook;
    const per = free - 16 >= hook * 2.6 ? 2 : free - 16 >= hook + 4 ? 1 : 0;   // por lado
    st.canes = [];
    [-1, 1].forEach(side => {
      const zl = side < 0 ? 8 : W - free + 8;
      const zr = side < 0 ? free - 8 : W - 8;
      for (let k = 0; k < per; k++) {
        const slot = (zr - zl) / per;
        st.canes.push({
          x: zl + slot * (k + 0.5) + rand(-0.12, 0.12) * slot,
          y: H / 2 + rand(-0.1, 0.1) * H,
          ax: rand(3, 6), ay: rand(3.5, 6.5),          // amplitud del vaivén (px)
          sx: rand(0.35, 0.7), sy: rand(0.5, 0.9),     // velocidades
          rot0: rand(-0.5, 0.5), ra: rand(0.12, 0.3), sr: rand(0.4, 0.8),
          ph: rand(0, TAU), flip: Math.random() < 0.5 ? 1 : -1
        });
      }
    });

    st.capH = up + down;
    st.cap.style.width = W + 'px';
    st.cap.style.height = st.capH + 'px';
    st.cap.width = Math.round(W * dpr);
    st.cap.height = Math.round(st.capH * dpr);
    st.capCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    st.snow = xmasSnowSprite(W, up, down, dpr);
    st.glints = [];
    const ng = clamp(Math.round(W / 150), 3, 9);
    for (let i = 0; i < ng; i++) {
      const t = rand(0.06, 0.94);
      st.glints.push({
        x: st.snow.x0 + t * st.snow.span,
        y: st.snow.y0 - st.snow.topAt(t) * rand(0.25, 0.9),
        r: rand(1.5, 2.8), s: rand(0.8, 2.0), p: rand(0, TAU)
      });
    }
    xmasDraw(st, 0);
  }

  /* ───── un cuadro ───── */
  function xmasDraw(st, dt) {
    if (!st.W) return;
    const c = st.ctx, W = st.W, H = st.H;
    c.clearRect(0, 0, W, H);

    // estrellas chispeando: nacen, brillan y se apagan; después reaparecen en otro lugar
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < st.stars.length; i++) {
      let s = st.stars[i];
      s.life += s.speed * dt;
      if (s.life >= 1) s = st.stars[i] = xmasNewStar(st, false);
      const a = Math.pow(Math.sin(Math.PI * s.life), 2);
      if (a < 0.03) continue;
      if (s.kind === 'spark') xmasSpark(c, s.x, s.y, s.r * (0.6 + 0.4 * a), a * 0.95, s.col);
      else if (s.kind === 'star') xmasStar5(c, s.x, s.y, s.r * (0.7 + 0.3 * a), s.rot, a * 0.95, s.col);
      else { c.fillStyle = 'rgba(' + s.col + ',' + (a * 0.8).toFixed(3) + ')'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); }
    }
    c.globalCompositeOperation = 'source-over';

    // bastones de caramelo: flotan con vaivén y giro suave (detrás del título)
    for (let i = 0; i < st.canes.length; i++) {
      const b = st.canes[i], sp = st.cane;
      const px = b.x + Math.sin(xmasT * b.sx + b.ph) * b.ax;
      const py = b.y + Math.cos(xmasT * b.sy + b.ph * 1.3) * b.ay;
      const rot = b.rot0 + Math.sin(xmasT * b.sr + b.ph) * b.ra;
      c.save(); c.translate(px, py); c.rotate(rot); c.scale(b.flip, 1);
      c.drawImage(sp.c, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
      c.restore();
    }

    // nieve + destellos dorados sobre ella
    const k = st.capCtx;
    k.clearRect(0, 0, W, st.capH);
    k.drawImage(st.snow.c, 0, 0, W, st.capH);
    for (let i = 0; i < st.glints.length; i++) {
      const g = st.glints[i];
      const a = Math.pow(Math.max(0, Math.sin(xmasT * g.s + g.p)), 6);
      if (a > 0.05) xmasSpark(k, g.x, g.y, g.r, a * 0.9, '255,200,80');
    }
  }

  class SectionTitle extends HTMLElement {
    static get observedAttributes() {
      return ['text', 'icon', 'icon-type', 'icon-mobile', 'effect',
              'img', 'img-alt', 'img-max-height', 'img-max-width', 'img-max-height-mobile',
              'img-mobile', 'img-effect', 'img-trigger', 'img-idle', 'img-class', 'img-play-class',
              'png-src', 'png-count', 'png-size', 'png-width', 'png-height',
              'svg-shape', 'svg-color', 'svg-count', 'svg-size',
              'glow-color', 'rays-color', 'rays-count',
              'text-glow-color', 'text-glow-accent',
              'shadow', 'extra-style', 'id', 'theme'];
    }

    connectedCallback()    { this._rafs = []; this._ros = []; this._render(); }
    disconnectedCallback() { this._stopAll(); }
    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _stopAll() {
      this._stopXmas();
      if (this._rafs) for (const id of this._rafs) cancelAnimationFrame(id);
      if (this._ros)  for (const ro of this._ros)  ro.disconnect();
      this._rafs = []; this._ros = [];
    }

    _get(k, fb) { return this.hasAttribute(k) ? this.getAttribute(k) : fb; }

    /* ───── TEMAS ─────
       Prioridad: atributo theme del elemento  >  <html data-st-theme>  >
       (<html class="tema-navidad"> → "navidad")  >  "classic" (look original). */
    _resolveTheme() {
      const own = this.getAttribute('theme');
      if (own) return own;
      const de = document.documentElement;
      return de.getAttribute('data-st-theme')
          || (de.classList.contains('tema-navidad') ? 'navidad' : 'classic');
    }

    _applyTheme() {
      const sec = this._section;
      if (!sec || !this.isConnected) return;
      const t = this._resolveTheme();
      sec.classList.toggle('st-3d', t === '3d' || t === 'navidad');
      sec.classList.toggle('st-xmas', t === 'navidad');
      if (t === 'navidad') this._startXmas(sec); else this._stopXmas();
    }

    /* ───── NAVIDAD: estrellas chispeando + bastones (canvas dentro del cartel)
       y nieve amontonada sobre el borde superior (canvas fuera, a nivel del host) ───── */
    _startXmas(section) {
      if (this._xmas && this._xmas.section === section) return;
      this._stopXmas();

      const inner = document.createElement('div');
      inner.className = 'st-xmas-inner';
      const canvas = document.createElement('canvas');
      inner.appendChild(canvas);
      section.insertBefore(inner, section.firstChild);

      const cap = document.createElement('canvas');
      cap.className = 'st-snow-cap';
      cap.setAttribute('aria-hidden', 'true');
      this.classList.add('st-xmas-host');
      this.appendChild(cap);

      const st = {
        host: this, section, h2: section.querySelector('.md3-headline'),
        inner, canvas, ctx: canvas.getContext('2d'),
        cap, capCtx: cap.getContext('2d'),
        visible: true, W: 0, H: 0, stars: [], glints: []
      };
      this._xmas = st;
      xmasResize(st);

      if ('ResizeObserver' in window) {
        st.ro = new ResizeObserver(() => xmasResize(st));
        st.ro.observe(section);
        if (st.h2) st.ro.observe(st.h2);
      }
      XMAS.add(st);
      if (xmasIO) xmasIO.observe(this);
      if (xmasReduce()) xmasDraw(st, 0); else xmasEnsureLoop();
    }

    /* ───── IMAGEN DESPUÉS DEL TÍTULO ─────
       Equivale a  <div class="zig-wrap" onclick="toggleZig(event)"><img class="zig-target">  :
         · img-idle="float"   → la imagen flota siempre (como .zig-target con gioFloat)
         · img-effect="zigzag"→ al tocar/clic corre UNA pasada y vuelve al reposo; si se toca de
           nuevo en pleno efecto se reinicia (igual que toggleZig: quitar clase, reflow, agregar clase,
           quitarla en animationend)
       Un solo "click" cubre mouse, toque y teclado (sin ontouchstart: no se dispara dos veces).
       Para reutilizar tu CSS propio: img-class="zig-target" img-play-class="zigzag". */
    _buildImage(h2) {
      const src = this._get('img', '');
      if (!src) return;

      const KNOWN = ['none', 'zigzag', 'point', 'wiggle', 'float', 'bounce', 'pulse'];
      let fx = (this._get('img-effect', 'none') || 'none').trim();
      if (fx === 'zig') fx = 'zigzag';                        // alias
      if (!KNOWN.includes(fx)) fx = 'none';

      const customPlay = (this._get('img-play-class', '') || '').trim();   // clase propia para el efecto
      const hasEffect = fx !== 'none' || !!customPlay;
      const trigRaw = (this._get('img-trigger', hasEffect ? 'click' : 'none') || 'click').trim();
      const trigger = !hasEffect ? 'none' : (['click', 'hover', 'auto'].includes(trigRaw) ? trigRaw : 'click');
      const idle = (this._get('img-idle', 'none') || 'none').trim() === 'float' ? 'float' : 'none';

      const wrap = document.createElement('span');
      wrap.className = 'st-img-wrap' + (this._get('img-mobile', 'on') === 'off' ? ' st-img-hide-mobile' : '');
      wrap.dataset.fx = fx;
      wrap.dataset.trigger = trigger;
      wrap.dataset.idle = idle;
      wrap.style.setProperty('--st-img-mw', this._get('img-max-width', '180px'));
      wrap.style.setProperty('--st-img-mh', this._get('img-max-height', '80px'));
      wrap.style.setProperty('--st-img-mhm', this._get('img-max-height-mobile', '56px'));

      const img = document.createElement('img');
      img.className = 'st-img' + ((this._get('img-class', '') || '').trim() ? ' ' + this._get('img-class', '').trim() : '');
      img.src = src;
      img.alt = this._get('img-alt', '');
      img.draggable = false;
      img.decoding = 'async';
      img.loading = 'lazy';
      wrap.appendChild(img);

      if (trigger === 'click') {
        const playClass = customPlay || 'st-play';
        const play = () => {
          img.classList.remove(playClass);      // reinicia la animación si ya estaba corriendo
          void img.offsetWidth;                 // fuerza reflow
          img.classList.add(playClass);
        };
        img.addEventListener('animationend', e => {
          if (e.target === img && img.classList.contains(playClass)) img.classList.remove(playClass);
        });
        wrap.setAttribute('role', 'button');
        wrap.setAttribute('tabindex', '0');
        wrap.addEventListener('click', play);
        wrap.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
        });
      }
      h2.appendChild(wrap);
    }

    _stopXmas() {
      const st = this._xmas;
      if (!st) return;
      XMAS.delete(st);
      if (xmasIO) xmasIO.unobserve(this);
      if (st.ro) st.ro.disconnect();
      if (st.inner.parentNode) st.inner.parentNode.removeChild(st.inner);
      if (st.cap.parentNode) st.cap.parentNode.removeChild(st.cap);
      this.classList.remove('st-xmas-host');
      this._xmas = null;
      xmasMaybeStopLoop();
    }

    _detectIconType(icon) {
      if (!icon) return 'none';
      const t = this._get('icon-type', 'auto');
      if (t !== 'auto') return t;
      if (/^[a-z][a-z0-9_]*$/.test(icon)) return 'material';
      if (/^fa-/.test(icon) || /^fas?\s/.test(icon)) return 'fa';
      return 'emoji';
    }

    _render() {
      this._stopAll();

      const text       = this._get('text', '');
      const icon       = this._get('icon', '');
      const iconType   = this._detectIconType(icon);
      const effectRaw  = this._get('effect', 'none');
      const shadow     = this._get('shadow', '');
      const extraStyle = this._get('extra-style', '');
      const idAttr     = this._get('id', '');

      const effects = effectRaw.split(/\s+/).map(s => s.trim()).filter(Boolean)
                               .filter(e => ALL_EFFECTS.includes(e));
      const hasEffect = (e) => effects.includes(e);
      const anyEffect = effects.length > 0;

      this.innerHTML = '';

      const section = document.createElement('section');
      section.className = 'section-header' + (shadow === 'lg' ? ' shadow-lg' : '');
      if (idAttr) section.id = idAttr;
      section.style.cssText = `position: relative; ${extraStyle}`;


      let fxLayer = null;
      if (anyEffect) {
        fxLayer = document.createElement('div');
        fxLayer.className = 'st-fx-layer';
        section.appendChild(fxLayer);
      }

      // título
      const h2 = document.createElement('h2');
      h2.className = 'md3-headline';
      h2.style.color = 'white';

      // text-glow: resplandor color sobre el texto + ícono (recupera el look
      // azulado original de AVISOS). Parametrizable via text-glow-color
      // (color principal del halo) y text-glow-accent (línea inferior dorada).
      if (hasEffect('text-glow')) {
        const glowColor  = this._get('text-glow-color',  '#00e5ff');
        const accentColor= this._get('text-glow-accent', '#ffd700');
        const textShadow = `0 2px 8px rgba(0,0,0,0.65),`
                         + ` 0 4px 16px rgba(255,255,255,0.5),`
                         + ` 0 1px 0 ${accentColor},`
                         + ` 0 0 24px ${glowColor}`;
        h2.style.textShadow    = textShadow;
        h2.style.fontWeight    = '700';
        h2.style.letterSpacing = '1.5px';
        h2.dataset.textGlowColor  = glowColor;
        h2.dataset.textGlowAccent = accentColor;
      }

      const iconMobile  = this._get('icon-mobile', 'on');
      const hideOnMobile = iconMobile === 'off';

      // Contenedor del ícono ("chip"): invisible en el tema clásico y medallón en el 3D.
      // Un ícono vacío (" ") no genera chip y se comporta como siempre.
      let iconHost = h2;
      if (icon && icon.trim()) {
        iconHost = document.createElement('span');
        iconHost.className = 'st-icon-chip' + (hideOnMobile ? ' st-icon-hide-mobile' : '');
        h2.appendChild(iconHost);
      }

      if (icon) {
        if (iconType === 'material') {
          const i = document.createElement('i');
          i.className = 'material-icons align-middle';
          if (hideOnMobile) i.classList.add('st-icon-hide-mobile');
          i.style.cssText = 'font-size: 1.4em; vertical-align: middle; margin-right: 0.3em;';
          i.textContent = icon;
          if (hasEffect('text-glow')) {
            i.style.color = '#fff';
            i.style.textShadow = `0 0 12px #fff, 0 0 24px ${h2.dataset.textGlowColor}`;
          }
          iconHost.appendChild(i);
        } else if (iconType === 'fa') {
          const i = document.createElement('i');
          i.className = icon.startsWith('fa-') ? `fas ${icon}` : icon;
          if (hideOnMobile) i.classList.add('st-icon-hide-mobile');
          i.style.cssText = 'margin-right: 0.4em;';
          if (hasEffect('text-glow')) {
            i.style.color = '#fff';
            i.style.textShadow = `0 0 12px #fff, 0 0 24px ${h2.dataset.textGlowColor}`;
          }
          iconHost.appendChild(i);
        } else {
          // emoji o texto: envolvemos en span para poder ocultarlo en mobile
          if (hideOnMobile) {
            const sp = document.createElement('span');
            sp.className = 'st-icon-hide-mobile';
            sp.textContent = icon + ' ';
            iconHost.appendChild(sp);
          } else {
            iconHost.appendChild(document.createTextNode(icon + ' '));
          }
        }
      }
      h2.appendChild(document.createTextNode(text));
      this._buildImage(h2);
      section.appendChild(h2);

      this.appendChild(section);
      this._section = section;
      this._applyTheme();

      // ── efectos DOM ── (no necesitan medidas)
      if (hasEffect('aurora'))       this._startAurora(fxLayer);
      if (hasEffect('glow-pulse'))   this._startGlowPulse(fxLayer);
      if (hasEffect('floating-png')) this._startFloatingPng(fxLayer);
      if (hasEffect('floating-svg')) this._startFloatingSvg(fxLayer);

      // ── efectos canvas ──
      // Antes usábamos requestAnimationFrame para esperar el primer layout, pero
      // rAF no se dispara en tabs en background ni en algunos contextos
      // headless, lo que dejaba el canvas sin crear. La sección ya está en el
      // DOM por appendChild, así que offsetWidth fuerza el layout sync y
      // podemos arrancar el canvas directo.
      const canvasFx = effects.filter(e => CANVAS_EFFECTS.includes(e));
      if (canvasFx.length) {
        this._startCanvasFx(fxLayer, section, canvasFx);
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       EFECTOS CANVAS (stars, bubbles, confetti, snow, rays)
       Comparten un solo canvas + un solo loop.
       ═══════════════════════════════════════════════════════════════ */
    _startCanvasFx(fxLayer, container, canvasFx) {
      if (!fxLayer) return;
      const canvas = document.createElement('canvas');
      fxLayer.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      let W = 0, H = 0;

      const resize = () => {
        W = container.offsetWidth;
        H = container.offsetHeight;
        canvas.width  = Math.max(1, W * dpr);
        canvas.height = Math.max(1, H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();

      const FACTORIES = {
        stars: () => ({
          type: 'stars',
          x: rand(0, W), y: rand(0, H * 0.7) + 10,
          r: rand(W < 600 ? 0.5 : 0.8, W < 600 ? 1.0 : 1.5),
          twinkle: rand(0, Math.PI * 2),
          color: pick(PARTICLE_COLORS),
          z: rand(0.7, W < 600 ? 1.9 : 2.4),
        }),
        bubbles: () => ({
          type: 'bubbles',
          x: rand(0, W), y: H + rand(5, 30),
          r: rand(3, 9),
          vy: -rand(0.3, 0.9), vx: rand(-0.4, 0.4),
          color: pick(PARTICLE_COLORS),
        }),
        'popping-bubbles': () => ({
          type: 'popping-bubbles',
          x: rand(0, W), y: H + rand(5, 30),
          r: rand(4, 11),
          vy: -rand(0.4, 1.0), vx: rand(-0.4, 0.4),
          color: pick(PARTICLE_COLORS),
          // estado: 0 = subiendo, 1 = explotando, 2 = muerta
          phase: 0,
          popAt: rand(H * 0.15, H * 0.55),   // altura donde explota
          popProgress: 0,
        }),
        'fairy-dust': () => ({
          type: 'fairy-dust',
          x: rand(W * 0.05, W * 0.95),
          y: rand(H * 0.1, H * 0.85),
          r: rand(2.5, 5.5),
          life: 0,
          lifeSpeed: rand(0.006, 0.014),  // qué tan rápido completa el ciclo nacer-brillar-explotar
          rot: rand(0, Math.PI),
          color: pick(FAIRY_COLORS),
          dustEmitted: false,
        }),
        confetti: () => ({
          type: 'confetti',
          x: rand(0, W), y: -rand(5, 30),
          r: rand(3, 6),
          vy: rand(0.6, 2), vx: rand(-1.2, 1.2),
          rot: rand(0, Math.PI * 2), rotV: rand(-0.12, 0.12),
          color: pick(PARTICLE_COLORS),
        }),
        snow: () => ({
          type: 'snow',
          x: rand(0, W), y: -rand(5, 30),
          r: rand(1.2, 3.2),
          vy: rand(0.3, 0.9), vx: rand(-0.3, 0.3),
          sway: rand(0, Math.PI * 2),
          color: '#fff',
        }),
      };

      const COUNTS = {
        stars:             () => W < 600 ? 14 : W < 900 ? 24 : 36,
        bubbles:           () => W < 600 ? 8  : 14,
        'popping-bubbles': () => W < 600 ? 6  : 12,
        confetti:          () => W < 600 ? 16 : 28,
        snow:              () => W < 600 ? 12 : 22,
        'fairy-dust':      () => W < 600 ? 5  : 10,
      };

      const sparks = [];
      const fairyDust = []; // estela del efecto fairy-dust

      const DRAWERS = {
        stars: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.7 + 0.3 * Math.sin(p.twinkle);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12 * p.z;
          ctx.fill();
          ctx.restore();
          p.twinkle += 0.04 + Math.random() * 0.01;
          if (Math.random() < 0.01) {
            sparks.push({
              x: p.x, y: p.y,
              vx: (Math.random() - 0.5) * 2.2,
              vy: -Math.random() * 2.2 - 0.5,
              alpha: 1, r: Math.random() * 1.5 + 0.7,
              color: pick(PARTICLE_COLORS),
            });
          }
        },
        bubbles: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
          p.y += p.vy; p.x += p.vx;
          if (p.y + p.r < 0) Object.assign(p, FACTORIES.bubbles());
        },
        'popping-bubbles': (p) => {
          if (p.phase === 0) {
            // Fase 1: subiendo como burbuja normal
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.8;
            ctx.stroke();
            // brillo interior leve
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = p.color;
            ctx.fill();
            // reflejo blanco arriba-izquierda
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.restore();
            p.y += p.vy; p.x += p.vx;
            if (p.y <= p.popAt) p.phase = 1;
            if (p.y + p.r < 0) Object.assign(p, FACTORIES['popping-bubbles']());
          } else if (p.phase === 1) {
            // Fase 2: EXPLOSIÓN — anillo que se expande y pierde alpha + chispas
            p.popProgress += 0.07;
            const expand = 1 + p.popProgress * 2.5;
            const alpha = Math.max(0, 1 - p.popProgress);
            ctx.save();
            ctx.globalAlpha = alpha * 0.9;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * expand, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            // gotitas/sparks radiales en el primer frame del pop
            if (p.popProgress < 0.2) {
              for (let k = 0; k < 6; k++) {
                const a = (k / 6) * Math.PI * 2;
                const d = p.r * (1 + p.popProgress * 4);
                ctx.beginPath();
                ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.fill();
              }
            }
            ctx.restore();
            if (p.popProgress >= 1) {
              // Reset: nueva burbuja desde abajo
              Object.assign(p, FACTORIES['popping-bubbles']());
            }
          }
        },
        confetti: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
          ctx.restore();
          p.y += p.vy; p.x += p.vx; p.rot += p.rotV;
          if (p.y > H + 20) Object.assign(p, FACTORIES.confetti());
        },
        snow: (p) => {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
          p.sway += 0.02;
          p.y += p.vy; p.x += p.vx + Math.sin(p.sway) * 0.5;
          if (p.y > H + 10) Object.assign(p, FACTORIES.snow());
        },
        'fairy-dust': (p) => {
          p.life += p.lifeSpeed;
          if (p.life >= 1) {
            Object.assign(p, FACTORIES['fairy-dust']());
            return;
          }
          // bell curve: 0 → 1 → 0 sobre el ciclo de vida (sin(life·π))
          const bell  = Math.sin(p.life * Math.PI);
          const scale = 0.35 + 1.15 * bell;       // pulsa de chiquito a grande
          const alpha = Math.pow(bell, 0.7);       // visible la mayor parte del ciclo
          const r     = p.r * scale;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 18 * scale;
          ctx.lineCap = 'round';
          // cruz de 4 puntas (largo > grueso = aspecto de destello)
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, -r * 2.5); ctx.lineTo(0, r * 2.5);
          ctx.moveTo(-r * 2.5, 0); ctx.lineTo(r * 2.5, 0);
          ctx.stroke();
          // diagonales más cortitas y finas (efecto destello extra)
          ctx.globalAlpha = alpha * 0.55;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-r * 1.2, -r * 1.2); ctx.lineTo(r * 1.2, r * 1.2);
          ctx.moveTo(-r * 1.2,  r * 1.2); ctx.lineTo(r * 1.2,-r * 1.2);
          ctx.stroke();
          // centro blanco súper brillante
          ctx.globalAlpha = alpha * 0.95;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();

          // En el pico de brillo: ESTALLA y emite polvo de hadas (estela)
          if (!p.dustEmitted && p.life >= 0.45 && p.life <= 0.55) {
            p.dustEmitted = true;
            const burst = 8;
            for (let k = 0; k < burst; k++) {
              const a = rand(0, Math.PI * 2);
              const v = rand(0.3, 1.1);
              fairyDust.push({
                x: p.x, y: p.y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v - 0.25, // leve impulso hacia arriba (flota)
                alpha: 0.95,
                r: rand(0.7, 1.8),
                color: p.color,
                fade: rand(0.008, 0.018),
              });
            }
          }
        },
      };

      const particleFx = canvasFx.filter(e => FACTORIES[e]);
      let particles = [];
      const initParticles = () => {
        particles = [];
        for (const fx of particleFx) {
          const n = COUNTS[fx]();
          for (let i = 0; i < n; i++) particles.push(FACTORIES[fx]());
        }
      };
      initParticles();

      const ro = new ResizeObserver(() => { resize(); initParticles(); });
      ro.observe(container);
      this._ros.push(ro);

      /* ── rays state ── */
      const hasRays = canvasFx.includes('rays');
      const raysColor  = this._get('rays-color', '#ffd700');
      const raysCount  = Math.min(20, Math.max(2, parseInt(this._get('rays-count', '8'))));
      const raysState  = { angle: 0 };

      const drawRays = () => {
        if (!hasRays) return;
        const cx = W * 0.5, cy = H * 0.5;
        const len = Math.hypot(W, H);
        const spread = 0.04;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < raysCount; i++) {
          const a = raysState.angle + (i / raysCount) * Math.PI * 2;
          const x2 = cx + Math.cos(a) * len;
          const y2 = cy + Math.sin(a) * len;
          const grad = ctx.createLinearGradient(cx, cy, x2, y2);
          grad.addColorStop(0, raysColor);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.30;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a - spread) * len, cy + Math.sin(a - spread) * len);
          ctx.lineTo(cx + Math.cos(a + spread) * len, cy + Math.sin(a + spread) * len);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        raysState.angle += 0.0025;
      };

      const drawFrame = () => {
        ctx.clearRect(0, 0, W, H);
        drawRays();
        for (const p of particles) {
          const fn = DRAWERS[p.type];
          if (fn) fn(p);
        }
        // sparks de stars
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
          s.x += s.vx; s.y += s.vy; s.vy += 0.045;
          s.alpha -= (s.r > 2 || s.alpha > 1) ? 0.012 : 0.018;
          if (s.alpha <= 0) sparks.splice(i, 1);
        }
        // polvo de hadas (estela de fairy-dust) — flota lento, gravedad muy leve
        for (let i = fairyDust.length - 1; i >= 0; i--) {
          const d = fairyDust[i];
          ctx.save();
          ctx.globalAlpha = d.alpha;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = d.color;
          ctx.shadowColor = d.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
          d.x += d.vx;
          d.y += d.vy;
          d.vy += 0.005;   // gravedad mucho más suave que sparks (mágico, no físico)
          d.alpha -= d.fade;
          if (d.alpha <= 0) fairyDust.splice(i, 1);
        }
      };
      const loop = () => {
        if (!this.isConnected) { ro.disconnect(); return; }
        drawFrame();
        this._rafs.push(requestAnimationFrame(loop));
      };
      // Paint inicial síncrono para que el canvas no quede en blanco si rAF
      // no dispara enseguida (tabs en background, contexto headless).
      drawFrame();
      this._rafs.push(requestAnimationFrame(loop));
    }

    /* ═══════════════════════════════════════════════════════════════
       EFECTOS DOM
       ═══════════════════════════════════════════════════════════════ */

    /* PNGs flotando */
    _startFloatingPng(fxLayer) {
      const src    = this._get('png-src', '');
      if (!src) return;
      const count  = Math.min(20, Math.max(1, parseInt(this._get('png-count', '6'))));
      const pW     = this._get('png-width',  '');
      const pH     = this._get('png-height', '');
      const pSize  = this._get('png-size',   '');
      const widthCss  = pW || (!pH ? (pSize || '48px') : 'auto');
      const heightCss = pH || 'auto';

      for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.className = 'st-png';
        img.src = src;
        img.alt = '';
        img.style.width  = widthCss;
        img.style.height = heightCss;
        img.style.left   = (Math.random() * 90) + '%';
        img.style.top    = (Math.random() * 70 + 5) + '%';
        const dur   = (3 + Math.random() * 4).toFixed(2);
        const delay = (-Math.random() * 4).toFixed(2);
        img.style.animation = `st-png-float ${dur}s ease-in-out ${delay}s infinite`;
        img.style.opacity   = (0.5 + Math.random() * 0.5).toFixed(2);
        fxLayer.appendChild(img);
      }
    }

    /* SVGs flotando (formas pre-armadas) */
    _startFloatingSvg(fxLayer) {
      const shape = this._get('svg-shape', 'cross');
      const path  = SVG_SHAPES[shape] || SVG_SHAPES.cross;
      const color = this._get('svg-color', '#ffd700');
      const count = Math.min(20, Math.max(1, parseInt(this._get('svg-count', '6'))));
      const size  = this._get('svg-size', '28px');
      const NS    = 'http://www.w3.org/2000/svg';

      for (let i = 0; i < count; i++) {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.classList.add('st-svg');
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', path);
        p.setAttribute('fill', color);
        svg.appendChild(p);
        svg.style.left = (Math.random() * 90) + '%';
        svg.style.top  = (Math.random() * 70 + 5) + '%';
        const dur   = (3 + Math.random() * 4).toFixed(2);
        const delay = (-Math.random() * 4).toFixed(2);
        svg.style.animation = `st-png-float ${dur}s ease-in-out ${delay}s infinite`;
        svg.style.opacity   = (0.5 + Math.random() * 0.5).toFixed(2);
        fxLayer.appendChild(svg);
      }
    }

    /* Halo pulsante — usamos un radial-gradient ancho con mix-blend-mode: screen
       en lugar de inset box-shadow. Mucho más visible porque ilumina toda la
       superficie del header en vez de solo los bordes. */
    _startGlowPulse(fxLayer) {
      const div = document.createElement('div');
      div.className = 'st-glow-pulse';
      const c = this._get('glow-color', '#ffd700');
      div.style.backgroundImage = `radial-gradient(ellipse at center, ${c} 0%, ${c} 25%, transparent 75%)`;
      fxLayer.appendChild(div);
    }

    /* Aurora: gradiente animado.
       OJO: usar backgroundImage (no background) para no resetear background-size:
       el shorthand "background:" pisa el "background-size: 400% 400%" del CSS
       y deja la capa estática. */
    _startAurora(fxLayer) {
      const div = document.createElement('div');
      div.className = 'st-aurora';
      div.style.backgroundImage = `linear-gradient(120deg,
        rgba(0,229,255,0.45),
        rgba(179,136,255,0.55),
        rgba(255,128,171,0.45),
        rgba(255,215,0,0.45),
        rgba(0,229,255,0.45))`;
      fxLayer.appendChild(div);
    }
  }

  customElements.define('section-title', SectionTitle);

  // Cambios en <html> (data-st-theme o la clase tema-navidad): se re-evalúa el tema de cada título
  // SIN reconstruirlos.
  new MutationObserver(() => {
    document.querySelectorAll('section-title').forEach(el => { if (el._applyTheme) el._applyTheme(); });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-st-theme', 'class'] });
})();