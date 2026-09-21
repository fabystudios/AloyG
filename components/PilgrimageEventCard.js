/**
 * <pilgrimage-event-card>  ·  v2 "Luz del cielo"
 * ---------------------------------------------------------------
 * Web component nativo (vanilla JS, Shadow DOM). No depende de
 * frameworks; solo carga tipografía de Google Fonts. Todo el CSS vive
 * adentro del Shadow DOM y no interfiere con el resto del sitio.
 *
 * MISMA API QUE LA VERSIÓN ANTERIOR: no hay que cambiar la llamada.
 *
 * USO:
 * <script src="./components/PilgrimageEventCard.js"></script>
 * <pilgrimage-event-card
 *   main-image="/img/basilica-lujan.jpg"
 *   badge-text="Luján · 11 de noviembre"
 *   tagline="¡Un encuentro que nos une como Iglesia!"
 *   title="¡Vamos a ver al Papa León XIV!"
 *   description="Una oportunidad única..."
 *   cta-text="Quiero inscribirme"
 *   whatsapp-phone="5492215947600"
 *   whatsapp-message="Hola, quiero inscribirme al viaje a Luján"
 *   info-cards='[{"id":"viaje","icon":"bus","title":"Cómo viajamos","lines":["..."]}]'
 *   footer='{"parishName":"Parroquia San José","address":"Calle Falsa 123","phone":"+54 9 11 1234-5678","email":"info@parroquia.org","instagramUrl":"https://instagram.com/..."}'
 *   style="--cartel-max-width:1300px;">
 * </pilgrimage-event-card>
 *
 * ATRIBUTOS SIMPLES: main-image, main-image-alt, badge-text, tagline,
 *   title, description, cta-text
 * WHATSAPP: whatsapp-phone (549 + área sin 0 + número sin 15, sin "+"),
 *   whatsapp-message (opcional). Con teléfono, el CTA es un link directo.
 * JSON: info-cards -> [{ id, icon, image, title, highlight, lines[] }]
 *       icon: "bus" | "clipboard" | "calendar" | "coins"
 *       footer     -> { parishName, address, phone, email, instagramUrl, facebookUrl }
 * EVENTO: 'cta-click' (bubbles, composed) — siempre al tocar el CTA.
 *
 * VARIABLES CSS PÚBLICAS:
 *   --cartel-max-width         ancho máximo (default 1080px)
 *   --pec-hero-aspect          proporción fija del cover (default 4/3 mobile, 16/9 desktop)
 *   --pec-hero-object-position parte de la foto a priorizar (default "center top")
 *
 * EFECTOS (todos se apagan con prefers-reduced-motion):
 *   aurora animada + grano · rayos de luz sobre el cover · chispas doradas
 *   · Ken Burns + parallax + tilt 3D + brillo que sigue al mouse
 *   · título que se revela palabra por palabra · subrayado manuscrito
 *   · borde de luz dorada que recorre el panel · CTA magnético con pulso
 *   · tarjetas con foco de luz, tilt 3D y borde dorado al hover
 *   · precio que cuenta hasta el valor · reveal escalonado al hacer scroll
 *
 * TAMAÑOS DE IMAGEN RECOMENDADOS:
 *   main-image -> foto LIMPIA, sin texto ni logos; ideal 1920x1200px, < 350KB.
 *   info-cards[].image -> 16:10, 800x500px (o 1200x750 retina), < 150KB c/u.
 * ---------------------------------------------------------------
 */
(function () {
  if (customElements.get('pilgrimage-event-card')) return;

  /* ============================================================
     ÍCONOS INLINE
     ============================================================ */
  const ICON_BUS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M3 11h18"/><path d="M7 17v2M17 17v2"/><circle cx="7.5" cy="19.2" r="1.3" fill="currentColor" stroke="none"/><circle cx="16.5" cy="19.2" r="1.3" fill="currentColor" stroke="none"/><path d="M6 8h5M13 8h5"/></svg>`;
  const ICON_CLIPBOARD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2.3" width="6" height="3" rx="1"/><path d="M8.3 11.2l2 2 4-4.4"/><path d="M8 16.2h8"/></svg>`;
  const ICON_CALENDAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M8 3v3M16 3v3"/><path d="M16.4 13.6a2.7 2.7 0 1 1-3.1-3.9 2.7 2.7 0 0 0 3.1 3.9z" fill="currentColor" stroke="none"/></svg>`;
  const ICON_COINS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.66 2.69 3 6 3s6-1.34 6-3V7"/><path d="M3 11v4c0 1.66 2.69 3 6 3"/><ellipse cx="17" cy="13.6" rx="4.2" ry="2.2"/><path d="M12.8 13.6v3.2c0 1.22 1.88 2.2 4.2 2.2s4.2-.98 4.2-2.2v-3.2"/></svg>`;
  const ICON_CROSS = `<svg viewBox="0 0 24 24" fill="currentColor" class="pec-hero-cross"><path d="M10.5 2h3v7.5H21v3h-7.5V22h-3v-9.5H3v-3h7.5V2z"/></svg>`;
  const ICON_CROSS_SM = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 2h3v7.5H21v3h-7.5V22h-3v-9.5H3v-3h7.5V2z"/></svg>`;
  const ICON_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const ICON_CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="pec-chevron"><path d="M6 9l6 6 6-6"/></svg>`;
  const ICON_MAPPIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/></svg>`;
  const ICON_PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1z"/></svg>`;
  const ICON_MAIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`;
  const ICON_IG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>`;
  const ICON_FB = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.9.25-1.5 1.55-1.5H16.5V4.3c-.27-.04-1.2-.11-2.28-.11-2.26 0-3.8 1.38-3.8 3.9v2.4H8v3h2.42V21h3.08z"/></svg>`;
  const ICON_WA = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.6-4.7A8.6 8.6 0 1 1 8 19.6L3 21z"/><path d="M9.2 8.8c.2 2.4 2.6 4.8 5 5l1.3-1.3-1.9-1-.9.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.9-1-1.900-1.100 1.500z" fill="currentColor" stroke="none"/></svg>`;

  const ICONS = { bus: ICON_BUS, clipboard: ICON_CLIPBOARD, calendar: ICON_CALENDAR, coins: ICON_COINS };

  /* ============================================================
     DEFAULTS
     ============================================================ */
  const DEFAULT_INFO_CARDS = [
    {
      id: 'viaje', icon: 'bus', title: 'Cómo viajamos',
      lines: [
        'Viajamos durante la noche para llegar a Luján con anticipación.',
        'Nos ubicamos cerca de la Basílica antes de que empiece todo.',
        'Esperamos juntos y participamos de la celebración con el Papa.',
      ],
    },
    {
      id: 'inscripcion', icon: 'clipboard', title: 'Inscripciones',
      lines: ['Se hacen en la Secretaría Parroquial.', 'Lunes y jueves de 16 a 18 hs.', 'Martes y sábados de 10 a 12 hs.'],
    },
    {
      id: 'fecha', icon: 'calendar', title: 'Fecha del viaje',
      highlight: 'Miércoles 11 de noviembre',
      lines: ['Salida: martes 10 de noviembre por la noche.'],
    },
    {
      id: 'valor', icon: 'coins', title: 'Valor del viaje',
      highlight: '$30.000',
      lines: ['Se puede pagar en 2 veces.', 'Para reservar el lugar: $10.000 al inscribirte.'],
    },
  ];

  const DEFAULT_FOOTER = {
    parishName: 'Parroquia Nuestra Señora de Luján',
    address: 'Reemplazá por la dirección real',
    phone: '+54 9 11 0000-0000',
    email: 'contacto@parroquia.org',
    instagramUrl: '',
    facebookUrl: '',
  };

  /* ============================================================
     Fuentes (se cargan una sola vez a nivel documento)
     Fraunces = títulos y cifras · Caveat = manuscrita · Fredoka = badge
     Mulish = texto corrido
     ============================================================ */
  function ensureFontsLoaded() {
    if (document.getElementById('pec-fonts-v2')) return;
    const link = document.createElement('link');
    link.id = 'pec-fonts-v2';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..800&family=Mulish:wght@400;600;700;800&family=Caveat:wght@600;700&family=Fredoka:wght@500;600;700&display=swap';
    document.head.appendChild(link);
  }

  /* ============================================================
     CSS encapsulado
     ============================================================ */
  const CSS = `
    :host {
      --pec-sky-50: #eff6fc;
      --pec-sky-100: #dcebf7;
      --pec-blue-300: #7db8ee;
      --pec-blue-500: #4a90d2;
      --pec-blue-700: #245a8d;
      --pec-navy-900: #142c46;
      --pec-gold-300: #f6c66b;
      --pec-gold-400: #efa83c;
      --pec-gold-600: #c97f1e;
      --pec-gold-700: #a85a12;
      --pec-ink: #3c5573;
      --pec-white: #ffffff;
      --pec-shadow-l: rgba(255,255,255,0.85);
      --pec-shadow-d: rgba(148,176,206,0.55);
      --pec-radius-lg: 28px;
      --pec-radius-md: 20px;
      --pec-ease: cubic-bezier(.2,.7,.2,1);
      --pec-font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
      --pec-font-body: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --pec-font-script: 'Caveat', cursive;
      --pec-font-badge: 'Fredoka', system-ui, -apple-system, 'Segoe UI', sans-serif;

      display: block;
      box-sizing: border-box;
      position: relative;
      isolation: isolate;
      width: 100%;
      max-width: min(100%, var(--cartel-max-width, 1080px)) !important;
      margin: 0 auto;
      padding: 22px;
      border-radius: calc(var(--pec-radius-lg) + 8px);
      background: linear-gradient(165deg, var(--pec-sky-50), var(--pec-sky-100) 70%);
      box-shadow: 20px 20px 54px var(--pec-shadow-d), -16px -16px 44px var(--pec-shadow-l);
      font-family: var(--pec-font-body);
      color: var(--pec-navy-900);
      opacity: 0;
      transform: scale(.97);
      transition: opacity .8s ease, transform .8s var(--pec-ease);
    }
    :host(.pec-loaded) { opacity: 1; transform: none; }
    *, *::before, *::after { box-sizing: border-box; }

    /* ---------- Fondo: aurora + grano ---------- */
    .pec-aurora { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; pointer-events: none; z-index: 0; }
    .pec-blob { position: absolute; border-radius: 50%; will-change: transform; }
    .pec-blob.b1 { width: 58%; aspect-ratio: 1; left: -14%; top: -10%; background: radial-gradient(circle, rgba(125,184,238,.85), transparent 68%); animation: pec-drift1 24s ease-in-out infinite alternate; }
    .pec-blob.b2 { width: 48%; aspect-ratio: 1; right: -12%; top: 34%; background: radial-gradient(circle, rgba(246,198,107,.55), transparent 66%); animation: pec-drift2 28s ease-in-out infinite alternate; }
    .pec-blob.b3 { width: 60%; aspect-ratio: 1; left: 18%; bottom: -24%; background: radial-gradient(circle, rgba(255,255,255,.95), transparent 70%); animation: pec-drift3 32s ease-in-out infinite alternate; }
    .pec-aurora::after {
      content: ''; position: absolute; inset: 0; opacity: .09; mix-blend-mode: multiply;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    }
    .pec-content { position: relative; z-index: 1; }

    /* ---------- Hero ---------- */
    .pec-hero {
      position: relative;
      isolation: isolate;
      border-radius: var(--pec-radius-lg);
      overflow: hidden;
      box-shadow: 0 24px 50px rgba(20,44,70,.34), 0 0 0 1px rgba(255,255,255,.55);
      transform: perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
      transition: transform .22s ease-out;
      will-change: transform;
    }
    .pec-hero-media { position: relative; width: 100%; aspect-ratio: var(--pec-hero-aspect, 4/3); background: linear-gradient(160deg, var(--pec-blue-500), var(--pec-navy-900)); overflow: hidden; }
    @media (min-width: 641px) { .pec-hero-media { aspect-ratio: var(--pec-hero-aspect, 16/9); } }
    .pec-hero-parallax { position: absolute; inset: -4%; transform: translate3d(var(--px, 0px), var(--py, 0px), 0); transition: transform .3s ease-out; }
    .pec-hero-media img {
      width: 100%; height: 100%; object-fit: cover; object-position: var(--pec-hero-object-position, center top); display: block;
      animation: pec-imgin 1.8s var(--pec-ease) both, pec-kenburns 28s ease-in-out 1.8s infinite alternate;
    }
    .pec-hero-gradient {
      position: absolute; inset: 0;
      background:
        linear-gradient(to top, rgba(12,30,52,.8) 0%, rgba(12,30,52,.2) 44%, rgba(12,30,52,0) 66%),
        radial-gradient(120% 80% at 50% 0%, rgba(255,236,190,.16), transparent 60%);
    }
    .pec-rays {
      position: absolute; left: 50%; top: -30%; width: 190%; height: 170%;
      transform: translateX(-50%); transform-origin: 50% 0;
      background: repeating-conic-gradient(from 180deg at 50% 0%, rgba(255,240,205,.5) 0deg 2.2deg, transparent 2.2deg 7.4deg);
      -webkit-mask-image: radial-gradient(ellipse 60% 70% at 50% 0%, #000 0%, transparent 75%);
      mask-image: radial-gradient(ellipse 60% 70% at 50% 0%, #000 0%, transparent 75%);
      mix-blend-mode: screen; opacity: .55; pointer-events: none;
      animation: pec-rays 14s ease-in-out infinite alternate;
    }
    .pec-sparks { position: absolute; inset: 0; container-type: size; overflow: hidden; pointer-events: none; }
    .pec-spark {
      position: absolute; bottom: -12px; left: var(--x); width: var(--s); height: var(--s); border-radius: 50%;
      background: radial-gradient(circle, #fff6d8, rgba(246,198,107,.9) 45%, transparent 70%);
      box-shadow: 0 0 8px 2px rgba(246,198,107,.55);
      opacity: 0; animation: pec-rise var(--dur) linear var(--dl) infinite;
    }
    .pec-hero-glare {
      position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .35s ease; mix-blend-mode: screen;
      background: radial-gradient(440px circle at var(--mx, 50%) var(--my, 30%), rgba(255,244,214,.42), transparent 62%);
    }
    .pec-hero:hover .pec-hero-glare { opacity: 1; }
    .pec-hero::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.4) 50%, transparent 65%);
      transform: translateX(-130%);
    }
    :host(.pec-loaded) .pec-hero::after { animation: pec-sweep 1.8s ease-out 1s 1 forwards; }

    .pec-hero-badge {
      position: absolute; left: 18px; bottom: 56px; overflow: hidden;
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--pec-font-badge); font-weight: 600; font-size: .92rem;
      letter-spacing: .015em;
      color: var(--pec-navy-900);
      background: linear-gradient(120deg, rgba(246,198,107,.9), rgba(201,127,30,.86));
      backdrop-filter: blur(8px) saturate(160%);
      -webkit-backdrop-filter: blur(8px) saturate(160%);
      border: 1px solid rgba(255,255,255,.5);
      padding: 8px 16px; border-radius: 999px;
      box-shadow: 0 10px 22px rgba(201,127,30,.45), inset 0 1px 0 rgba(255,255,255,.55);
    }
    .pec-hero-badge svg { width: 1.05em; height: 1.05em; flex-shrink: 0; }
    .pec-hero-badge::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.65) 50%, transparent 65%);
      transform: translateX(-130%); animation: pec-sheen 5.5s ease-in-out 2.4s infinite;
    }
    @media (min-width: 641px) {
      .pec-hero-badge { font-size: 1.7rem; font-weight: 700; padding: 14px 28px; gap: 12px; box-shadow: 0 16px 32px rgba(201,127,30,.5), inset 0 1px 0 rgba(255,255,255,.55); }
    }
    .pec-hero-cross {
      position: absolute; top: 16px; right: 16px; width: 38px; height: 38px; padding: 9px; color: #fff; border-radius: 50%;
      background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.4);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      animation: pec-glow 4s ease-in-out infinite;
    }

    /* ---------- Panel principal ---------- */
    .pec-panel {
      position: relative; isolation: isolate; overflow: hidden; z-index: 2;
      margin: 16px 12px 0;
      padding: 30px 28px 32px;
      border-radius: var(--pec-radius-md);
      text-align: center;
      box-shadow: 0 22px 46px rgba(20,44,70,.16);
    }
    .pec-panel::before {
      content: ''; position: absolute; inset: -80%; z-index: -2;
      background: conic-gradient(from 0deg, rgba(255,255,255,.6) 0 62%, var(--pec-gold-300) 78%, var(--pec-gold-600) 84%, rgba(255,255,255,.6) 100%);
      animation: pec-spin 9s linear infinite;
    }
    .pec-panel::after {
      content: ''; position: absolute; inset: 1.5px; z-index: -1;
      border-radius: calc(var(--pec-radius-md) - 1.5px);
      background:
        radial-gradient(90% 60% at 50% 0%, rgba(220,235,247,.7), transparent 70%),
        linear-gradient(180deg, rgba(255,255,255,.97), rgba(247,251,255,.95));
    }
    .pec-orn { display: flex; align-items: center; justify-content: center; gap: 14px; max-width: 250px; margin: 0 auto 12px; color: var(--pec-gold-600); }
    .pec-orn i { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, currentColor); }
    .pec-orn i:last-child { transform: scaleX(-1); }
    .pec-orn svg { width: 16px; height: 16px; flex-shrink: 0; }

    .pec-tagline { font-family: var(--pec-font-script); font-weight: 700; font-size: clamp(1.7rem, 3vw, 2.8rem); line-height: 1.1; color: var(--pec-blue-700); margin: 0 0 12px; }
    .pec-tagline > span { position: relative; display: inline-block; padding-bottom: 4px; text-wrap: balance; }
    .pec-underline { position: absolute; left: -2%; bottom: -6px; width: 104%; height: 12px; overflow: visible; }
    .pec-underline path { fill: none; stroke: var(--pec-gold-400); stroke-width: 2.6; stroke-linecap: round; vector-effect: non-scaling-stroke; stroke-dasharray: 1; stroke-dashoffset: 1; }
    .pec-panel.pec-in .pec-underline path { animation: pec-draw 1.3s var(--pec-ease) .9s forwards; }

    .pec-title {
      font-family: var(--pec-font-display); font-weight: 700;
      font-size: clamp(1.55rem, 3.5vw, 2.75rem); line-height: 1.12; letter-spacing: -.012em;
      max-width: 21em; margin: 0 auto 14px; color: var(--pec-navy-900);
      text-wrap: balance; text-shadow: 0 1px 0 rgba(255,255,255,.9);
    }
    .pec-word { display: inline-block; overflow: hidden; vertical-align: top; padding: .08em .03em .18em; margin: -.08em -.03em -.18em; }
    .pec-word > span { display: inline-block; transform: translateY(118%); }
    .pec-panel.pec-in .pec-word > span { animation: pec-word .95s cubic-bezier(.2,.75,.2,1) both; animation-delay: calc(.15s + var(--w) * 75ms); }

    .pec-description { font-size: 1rem; color: var(--pec-ink); max-width: 540px; margin: 0 auto 22px; line-height: 1.65; }

    .pec-cta-wrap { position: relative; isolation: isolate; display: inline-block; margin-top: 8px; transition: transform .25s ease-out; }
    .pec-cta-wrap::before { content: ''; position: absolute; inset: 0; z-index: -1; border-radius: 999px; background: rgba(239,168,60,.6); animation: pec-pulse 2.8s ease-out infinite; }
    .pec-cta {
      position: relative; overflow: hidden;
      display: inline-flex; align-items: center; gap: 16px;
      border: none; cursor: pointer; border-radius: 999px; text-decoration: none;
      padding: 8px 8px 8px 28px; font-family: var(--pec-font-body); font-weight: 800; font-size: 1rem; letter-spacing: .01em; color: #fff;
      background: linear-gradient(120deg, var(--pec-blue-500), var(--pec-blue-700) 60%, var(--pec-navy-900));
      box-shadow: 0 14px 28px rgba(36,90,141,.45), inset 0 1px 0 rgba(255,255,255,.35);
      transition: box-shadow .3s ease, filter .3s ease;
    }
    .pec-cta::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.38) 50%, transparent 70%);
      transform: translateX(-130%); animation: pec-sheen 4.5s ease-in-out 1.8s infinite;
    }
    .pec-cta-label { position: relative; display: inline-flex; align-items: center; gap: 9px; }
    .pec-cta-label svg { width: 21px; height: 21px; }
    .pec-cta-arrow {
      position: relative; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(140deg, var(--pec-gold-300), var(--pec-gold-600)); color: var(--pec-navy-900);
      box-shadow: 0 4px 10px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.6);
      transition: transform .35s var(--pec-ease);
    }
    .pec-cta-arrow svg { width: 19px; height: 19px; }
    .pec-cta:hover { box-shadow: 0 20px 38px rgba(36,90,141,.55), inset 0 1px 0 rgba(255,255,255,.4); filter: saturate(1.1); }
    .pec-cta:hover .pec-cta-arrow { transform: translateX(3px) rotate(-45deg); }
    .pec-cta:focus-visible, .pec-social a:focus-visible, .pec-card-summary:focus-visible { outline: 3px solid var(--pec-gold-400); outline-offset: 3px; }

    /* ---------- Grilla de tarjetas ---------- */
    .pec-grid { margin-top: 34px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media (max-width: 880px) { .pec-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px) { .pec-grid { grid-template-columns: 1fr; } }
    /* Ritmo en onda: las tarjetas pares bajan un poco (solo en 4 columnas) */
    // @media (min-width: 881px) {
    //   .pec-slot:nth-child(odd) { margin-bottom: 26px; }
    //   .pec-slot:nth-child(even) { margin-top: 26px; }
    // }

    @media (max-width: 640px) {
      :host { max-width: 95vw !important; padding: 10px; }
      .pec-panel { margin: 12px 0 0; padding: 20px 8px 22px; }
      .pec-hero-badge { top: 14px; bottom: auto; left: 12px; font-size: .8rem; padding: 7px 12px; }
      .pec-hero-cross { width: 30px; height: 30px; padding: 7px; top: 12px; right: 12px; }
      .pec-grid { margin-top: 24px; gap: 14px; }
      .pec-cta { font-size: .95rem; padding-left: 22px; }
    }

    .pec-slot { display: flex; }
    .pec-slot > .pec-card { flex: 1; }

    .pec-card {
      --rx: 0deg; --ry: 0deg; --ty: 0px;
      position: relative; isolation: isolate;
      border-radius: var(--pec-radius-md);
      background: linear-gradient(165deg, #ffffff, var(--pec-sky-50));
      box-shadow: 9px 9px 22px var(--pec-shadow-d), -7px -7px 18px var(--pec-shadow-l);
      overflow: hidden;
      display: flex; flex-direction: column;
      transform: perspective(900px) translateY(var(--ty)) rotateX(var(--rx)) rotateY(var(--ry));
      transition: transform .25s ease-out, box-shadow .35s ease;
      will-change: transform;
    }
    .pec-card:hover { --ty: -6px; box-shadow: 16px 22px 34px rgba(120,150,184,.5), -8px -8px 22px var(--pec-shadow-l); }
    .pec-card::before {
      content: ''; position: absolute; inset: 0; z-index: 3; border-radius: inherit; padding: 1.5px; pointer-events: none;
      background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), var(--pec-gold-400), rgba(239,168,60,0) 65%);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      opacity: 0; transition: opacity .35s ease;
    }
    .pec-card::after {
      content: ''; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none;
      background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(255,236,190,.35), transparent 65%);
      opacity: 0; transition: opacity .35s ease;
    }
    .pec-card:hover::before, .pec-card:hover::after { opacity: 1; }

    .pec-card-media { position: relative; width: 100%; aspect-ratio: 16 / 10; background: linear-gradient(135deg, var(--pec-blue-500), var(--pec-navy-900)); }
    .pec-card-media-inner { position: absolute; inset: 0; overflow: hidden; }
    .pec-card-media-inner img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.1s var(--pec-ease); }
    .pec-card:hover .pec-card-media-inner img { transform: scale(1.1); }
    .pec-card-media-inner::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to top, rgba(12,30,52,.4), transparent 55%); }
    .pec-card-media-inner::after {
      content: ''; position: absolute; inset: 0; z-index: 2;
      background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.4) 50%, transparent 62%);
      transform: translateX(-130%);
    }
    .pec-card:hover .pec-card-media-inner::after { transform: translateX(130%); transition: transform 1s ease; }
    .pec-card-media-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .pec-card-media-fallback svg { width: 42px; height: 42px; color: #fff; opacity: .92; }
    .pec-card-icon-badge {
      position: absolute; z-index: 4; left: 14px; bottom: -17px; width: 42px; height: 42px;
      border-radius: 14px; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(140deg, var(--pec-gold-300), var(--pec-gold-600)); color: var(--pec-navy-900);
      box-shadow: 0 8px 18px rgba(201,127,30,.45), 0 0 0 3px #fff, inset 0 1px 0 rgba(255,255,255,.6);
      transition: transform .4s var(--pec-ease);
    }
    .pec-card:hover .pec-card-icon-badge { transform: translateY(-3px) rotate(-6deg) scale(1.08); }
    .pec-card-icon-badge svg { width: 21px; height: 21px; }

    .pec-card-body { position: relative; z-index: 1; padding: 28px 18px 20px; flex: 1; display: flex; flex-direction: column; gap: 7px; text-align: left; }
    .pec-card-title { font-family: var(--pec-font-display); font-weight: 700; font-size: 1.12rem; line-height: 1.2; margin: 0; color: var(--pec-navy-900); }
    .pec-card-title::after { content: ''; display: block; width: 28px; height: 2px; margin-top: 7px; border-radius: 2px; background: linear-gradient(90deg, var(--pec-gold-400), transparent); transition: width .5s var(--pec-ease); }
    .pec-card:hover .pec-card-title::after { width: 64px; }
    .pec-card-highlight {
      font-family: var(--pec-font-display); font-weight: 800; font-size: clamp(1.3rem, 2vw, 1.65rem); line-height: 1.15; letter-spacing: -.01em; margin: 4px 0 0;
      color: var(--pec-gold-700);
      background: linear-gradient(100deg, var(--pec-gold-700) 20%, #dc8f24 45%, #f2b04a 50%, #dc8f24 55%, var(--pec-gold-700) 80%);
      background-size: 250% 100%; -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; animation: pec-shimmer 6s linear infinite;
    }
    .pec-card-lines { margin: 8px 0 0; padding: 0; font-size: .88rem; color: var(--pec-ink); line-height: 1.55; }
    .pec-card-lines li { list-style: none; position: relative; padding-left: 1.15em; margin-bottom: 5px; }
    .pec-card-lines li::before { content: ''; position: absolute; left: 0; top: .55em; width: 6px; height: 6px; border-radius: 50%; background: var(--pec-gold-600); box-shadow: 0 0 0 3px rgba(239,168,60,.2); }

    .pec-card-details { margin-top: 2px; }
    .pec-card-details[open] .pec-card-lines { animation: pec-drop .4s var(--pec-ease); }
    .pec-card-summary {
      cursor: pointer; list-style: none; user-select: none;
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(74,144,210,.14); color: var(--pec-blue-700);
      transition: background .2s ease, transform .2s ease;
    }
    .pec-card-summary::-webkit-details-marker { display: none; }
    .pec-card-summary::marker { content: ''; }
    .pec-card-summary:hover { background: rgba(74,144,210,.26); transform: scale(1.08); }
    .pec-chevron { width: 13px; height: 13px; transition: transform .3s var(--pec-ease); }
    .pec-card-details[open] .pec-chevron { transform: rotate(180deg); }

    /* ---------- Footer ---------- */
    .pec-footer {
      position: relative; overflow: hidden;
      margin-top: 36px; padding: 26px 24px; border-radius: var(--pec-radius-md); color: #fff;
      background:
        radial-gradient(1.2px 1.2px at 12% 32%, rgba(255,255,255,.7), transparent),
        radial-gradient(1px 1px at 27% 74%, rgba(255,255,255,.5), transparent),
        radial-gradient(1.4px 1.4px at 46% 22%, rgba(255,255,255,.6), transparent),
        radial-gradient(1px 1px at 63% 68%, rgba(255,255,255,.45), transparent),
        radial-gradient(1.3px 1.3px at 78% 30%, rgba(246,198,107,.8), transparent),
        radial-gradient(1px 1px at 91% 78%, rgba(255,255,255,.5), transparent),
        radial-gradient(520px 200px at 88% -30%, rgba(239,168,60,.26), transparent 65%),
        linear-gradient(160deg, var(--pec-navy-900), #0d2340);
      display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;
      box-shadow: 0 18px 38px rgba(13,35,64,.42);
    }
    .pec-footer::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--pec-gold-400), transparent); }
    .pec-footer-name { display: block; font-family: var(--pec-font-display); font-weight: 700; font-size: 1.15rem; letter-spacing: .005em; margin-bottom: 8px; }
    .pec-footer-info { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: .86rem; }
    .pec-footer-info span { display: inline-flex; align-items: center; gap: 7px; opacity: .93; }
    .pec-footer-info svg { width: 15px; height: 15px; color: var(--pec-gold-400); flex-shrink: 0; }
    .pec-social { display: flex; gap: 10px; }
    .pec-social a {
      width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); color: #fff; text-decoration: none;
      transition: background .25s ease, transform .25s ease, box-shadow .25s ease, color .25s ease;
    }
    .pec-social a:hover { background: var(--pec-gold-400); color: var(--pec-navy-900); transform: translateY(-3px); box-shadow: 0 0 22px rgba(239,168,60,.6); }
    .pec-social a svg { width: 17px; height: 17px; }

    /* ---------- Reveal al hacer scroll ---------- */
    .pec-reveal {
      opacity: 0; transform: translateY(32px) scale(.985);
      transition: opacity .9s var(--pec-ease) calc(var(--i, 0) * 110ms), transform .9s var(--pec-ease) calc(var(--i, 0) * 110ms);
    }
    .pec-reveal.pec-in { opacity: 1; transform: none; }

    /* ---------- Keyframes ---------- */
    @keyframes pec-drift1 { to { transform: translate3d(14%, 10%, 0) scale(1.15); } }
    @keyframes pec-drift2 { to { transform: translate3d(-16%, -12%, 0) scale(1.1); } }
    @keyframes pec-drift3 { to { transform: translate3d(10%, -8%, 0) scale(1.2); } }
    @keyframes pec-imgin { from { filter: blur(14px) saturate(.8); transform: scale(1.2); } to { filter: none; transform: scale(1.06); } }
    @keyframes pec-kenburns { from { transform: scale(1.06); } to { transform: scale(1.14) translate(-1.5%, -1%); } }
    @keyframes pec-rays { 0% { transform: translateX(-50%) rotate(-4deg); opacity: .4; } 100% { transform: translateX(-50%) rotate(4deg); opacity: .7; } }
    @keyframes pec-rise { 0% { transform: translate3d(0,0,0); opacity: 0; } 12% { opacity: .95; } 100% { transform: translate3d(var(--dx), -420px, 0); opacity: 0; } }
    @supports (height: 1cqh) {
      @keyframes pec-rise { 0% { transform: translate3d(0,0,0); opacity: 0; } 12% { opacity: .95; } 100% { transform: translate3d(var(--dx), -108cqh, 0); opacity: 0; } }
    }
    @keyframes pec-sweep { to { transform: translateX(130%); } }
    @keyframes pec-sheen { 0%, 55% { transform: translateX(-130%); } 100% { transform: translateX(130%); } }
    @keyframes pec-pulse { 0% { transform: scale(1); opacity: .55; } 70%, 100% { transform: scale(1.32, 1.6); opacity: 0; } }
    @keyframes pec-spin { to { transform: rotate(360deg); } }
    @keyframes pec-word { from { transform: translateY(118%); } to { transform: none; } }
    @keyframes pec-draw { to { stroke-dashoffset: 0; } }
    @keyframes pec-glow { 0%, 100% { box-shadow: 0 0 10px rgba(255,236,190,.25); } 50% { box-shadow: 0 0 26px rgba(255,236,190,.7); } }
    @keyframes pec-shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
    @keyframes pec-drop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

    /* ---------- Accesibilidad: movimiento reducido ---------- */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
      :host { opacity: 1; transform: none; }
      .pec-reveal { opacity: 1 !important; transform: none !important; }
      .pec-word > span { transform: none !important; }
      .pec-underline path { stroke-dashoffset: 0 !important; }
      .pec-hero, .pec-card { transform: none !important; }
      .pec-sparks, .pec-rays { display: none; }
    }
  `;

  /* ============================================================
     Helpers
     ============================================================ */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function waLink(phone, message) {
    const digits = String(phone).replace(/[^0-9]/g, '');
    if (!digits) return '';
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${digits}${text}`;
  }

  function parseJsonAttr(raw, fallback, label) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[pilgrimage-event-card] atributo "${label}" tiene JSON inválido, uso el default.`, e);
      return fallback;
    }
  }

  // Chispas doradas con valores "pseudo-aleatorios" fijos (siempre igual)
  function sparksMarkup(count) {
    let s = 11;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = (4 + rnd() * 92).toFixed(1);
      const size = (2 + rnd() * 4).toFixed(1);
      const dur = (9 + rnd() * 9).toFixed(1);
      const delay = -(rnd() * 16).toFixed(1);
      const dx = Math.round((rnd() - 0.5) * 70);
      out += `<i class="pec-spark" style="--x:${x}%;--s:${size}px;--dur:${dur}s;--dl:${delay}s;--dx:${dx}px"></i>`;
    }
    return out;
  }

  function titleWords(text) {
    return String(text).trim().split(/\s+/).map((w, i) =>
      `<span class="pec-word" aria-hidden="true" style="--w:${i}"><span>${esc(w)}</span></span>`
    ).join(' ');
  }

  function infoCardMarkup(item, isDesktop, index) {
    const icon = ICONS[item.icon] || ICON_CLIPBOARD;
    const media = item.image
      ? `<img src="${esc(item.image)}" alt="${esc(item.title || '')}" loading="lazy">`
      : `<div class="pec-card-media-fallback">${icon}</div>`;

    // Si el highlight es un precio ("$30.000") se anima contando hasta el valor
    const m = item.highlight ? String(item.highlight).match(/^([$€£]\s?)(\d{1,3}(?:\.\d{3})+|\d+)$/) : null;
    const countAttrs = m
      ? ` data-count="${m[2].replace(/\./g, '')}" data-prefix="${esc(m[1])}" data-final="${esc(item.highlight)}"`
      : '';
    const highlight = item.highlight ? `<p class="pec-card-highlight"${countAttrs}>${esc(item.highlight)}</p>` : '';

    const linesList = Array.isArray(item.lines) && item.lines.length
      ? `<ul class="pec-card-lines">${item.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`
      : '';
    // El detalle es desplegable: en mobile arranca cerrado, en desktop abierto.
    const lines = linesList
      ? `<details class="pec-card-details"${isDesktop ? ' open' : ''}>
          <summary class="pec-card-summary" aria-label="Mostrar más detalle">${ICON_CHEVRON}</summary>
          ${linesList}
        </details>`
      : '';
    return `
      <div class="pec-slot pec-reveal" style="--i:${index}">
        <article class="pec-card">
          <div class="pec-card-media">
            <div class="pec-card-media-inner">${media}</div>
            <span class="pec-card-icon-badge">${icon}</span>
          </div>
          <div class="pec-card-body">
            <h3 class="pec-card-title">${esc(item.title)}</h3>
            ${highlight}
            ${lines}
          </div>
        </article>
      </div>
    `;
  }

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (!isFinite(target)) return;
    const prefix = el.dataset.prefix || '';
    const final = el.dataset.final || el.textContent;
    const t0 = performance.now();
    const dur = 1500;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      if (p < 1) {
        el.textContent = prefix + Math.round(target * e).toLocaleString('es-AR');
        requestAnimationFrame(tick);
      } else {
        el.textContent = final;
      }
    };
    el.textContent = prefix + '0';
    requestAnimationFrame(tick);
  }

  /* ============================================================
     COMPONENTE
     ============================================================ */
  class PilgrimageEventCard extends HTMLElement {
    static get observedAttributes() {
      return ['main-image', 'main-image-alt', 'badge-text', 'tagline', 'title', 'description', 'cta-text', 'whatsapp-phone', 'whatsapp-message', 'info-cards', 'footer'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._renderScheduled = false;
      this._io = null;
      this._titleText = undefined;
      this._onHeroMove = this._onHeroMove.bind(this);
      this._onHeroLeave = this._onHeroLeave.bind(this);
      this._onCtaClick = this._onCtaClick.bind(this);
    }

    connectedCallback() {
      ensureFontsLoaded();
      this._scheduleRender();
      if (!this._loadedTimeout) {
        this._loadedTimeout = setTimeout(() => this.classList.add('pec-loaded'), 40);
      }
    }

    disconnectedCallback() {
      if (this._loadedTimeout) { clearTimeout(this._loadedTimeout); this._loadedTimeout = null; }
      if (this._io) { this._io.disconnect(); this._io = null; }
    }

    attributeChangedCallback() {
      this._scheduleRender();
    }

    _scheduleRender() {
      if (this._renderScheduled) return;
      this._renderScheduled = true;
      Promise.resolve().then(() => {
        this._renderScheduled = false;
        this._render();
      });
    }

    _render() {
      const mainImage = this.getAttribute('main-image') || '';
      const mainImageAlt = this.getAttribute('main-image-alt') || 'Imagen principal del evento';
      const badgeText = this.hasAttribute('badge-text') ? this.getAttribute('badge-text') : 'Luján · 11 de noviembre';
      const tagline = this.hasAttribute('tagline') ? this.getAttribute('tagline') : '¡Un encuentro que nos une como Iglesia!';

      // El atributo "title" hace que el navegador muestre un tooltip nativo sobre
      // toda la card. Lo leemos una vez y lo quitamos para evitar ese tooltip.
      const rawTitle = this.getAttribute('title');
      if (rawTitle !== null) {
        this._titleText = rawTitle;
        this.removeAttribute('title');
      }
      const title = this._titleText !== undefined ? this._titleText : '¡Vamos a ver al Papa León XIV!';

      const description = this.getAttribute('description') || '';
      const ctaText = this.hasAttribute('cta-text') ? this.getAttribute('cta-text') : 'Quiero inscribirme';
      const whatsappPhone = this.getAttribute('whatsapp-phone') || '';
      const whatsappMessage = this.getAttribute('whatsapp-message') || '';

      const infoCards = parseJsonAttr(this.getAttribute('info-cards'), DEFAULT_INFO_CARDS, 'info-cards');
      const footer = parseJsonAttr(this.getAttribute('footer'), DEFAULT_FOOTER, 'footer');

      const heroImg = mainImage ? `<img src="${esc(mainImage)}" alt="${esc(mainImageAlt)}">` : '';
      const badgeMarkup = badgeText ? `<span class="pec-hero-badge">${ICON_MAPPIN}${esc(badgeText)}</span>` : '';
      const taglineMarkup = tagline
        ? `<p class="pec-tagline"><span>${esc(tagline)}<svg class="pec-underline" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C 50 2, 100 12, 150 6 S 250 4, 298 8" pathLength="1"/></svg></span></p>`
        : '';
      const descriptionMarkup = description ? `<p class="pec-description">${esc(description)}</p>` : '';
      const waUrl = whatsappPhone ? waLink(whatsappPhone, whatsappMessage) : '';
      const ctaInner = `<span class="pec-cta-label">${waUrl ? ICON_WA : ''}${esc(ctaText)}</span><span class="pec-cta-arrow">${ICON_ARROW}</span>`;
      const ctaMarkup = !ctaText ? '' : `<span class="pec-cta-wrap">${waUrl
        ? `<a class="pec-cta" href="${esc(waUrl)}" target="_blank" rel="noreferrer">${ctaInner}</a>`
        : `<button type="button" class="pec-cta">${ctaInner}</button>`}</span>`;

      // Umbral: coincide con el breakpoint mobile (640px) definido en el CSS.
      const isDesktop = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(min-width: 641px)').matches
        : true;

      const gridMarkup = Array.isArray(infoCards) && infoCards.length
        ? `<section class="pec-grid" aria-label="Información del viaje">${infoCards.map((item, i) => infoCardMarkup(item, isDesktop, i)).join('')}</section>`
        : '';

      const footerInfo = [
        footer.address ? `<span>${ICON_MAPPIN}${esc(footer.address)}</span>` : '',
        footer.phone ? `<span>${ICON_PHONE}${esc(footer.phone)}</span>` : '',
        footer.email ? `<span>${ICON_MAIL}${esc(footer.email)}</span>` : '',
      ].join('');

      const footerSocial = (footer.instagramUrl || footer.facebookUrl)
        ? `<div class="pec-social">
            ${footer.instagramUrl ? `<a href="${esc(footer.instagramUrl)}" target="_blank" rel="noreferrer" aria-label="Instagram">${ICON_IG}</a>` : ''}
            ${footer.facebookUrl ? `<a href="${esc(footer.facebookUrl)}" target="_blank" rel="noreferrer" aria-label="Facebook">${ICON_FB}</a>` : ''}
          </div>`
        : '';

      const footerMarkup = footer
        ? `<footer class="pec-footer pec-reveal">
            <div>
              ${footer.parishName ? `<strong class="pec-footer-name">${esc(footer.parishName)}</strong>` : ''}
              <div class="pec-footer-info">${footerInfo}</div>
            </div>
            ${footerSocial}
          </footer>`
        : '';

      this.shadowRoot.innerHTML = `
        <style>${CSS}</style>
        <div class="pec-aurora" aria-hidden="true"><div class="pec-blob b1"></div><div class="pec-blob b2"></div><div class="pec-blob b3"></div></div>
        <div class="pec-content">
          <header class="pec-hero">
            <div class="pec-hero-media">
              <div class="pec-hero-parallax">${heroImg}</div>
              <div class="pec-hero-gradient"></div>
              <div class="pec-rays" aria-hidden="true"></div>
              <div class="pec-sparks" aria-hidden="true">${sparksMarkup(14)}</div>
              <div class="pec-hero-glare" aria-hidden="true"></div>
            </div>
            ${ICON_CROSS}
            ${badgeMarkup}
          </header>
          <section class="pec-panel" data-observe>
            <div class="pec-orn" aria-hidden="true"><i></i>${ICON_CROSS_SM}<i></i></div>
            ${taglineMarkup}
            <h2 class="pec-title" aria-label="${esc(title)}">${titleWords(title)}</h2>
            ${descriptionMarkup}
            ${ctaMarkup}
          </section>
          ${gridMarkup}
          ${footerMarkup}
        </div>
      `;

      this._bindEvents();
    }

    _bindEvents() {
      const root = this.shadowRoot;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Hero: tilt 3D + parallax + brillo que sigue al mouse
      const hero = root.querySelector('.pec-hero');
      if (hero && !reduce) {
        hero.addEventListener('pointermove', this._onHeroMove);
        hero.addEventListener('pointerleave', this._onHeroLeave);
      }

      // CTA: evento + efecto magnético
      const cta = root.querySelector('.pec-cta');
      if (cta) cta.addEventListener('click', this._onCtaClick);
      const wrap = root.querySelector('.pec-cta-wrap');
      if (wrap && !reduce) {
        wrap.addEventListener('pointermove', (e) => {
          if (e.pointerType === 'touch') return;
          const r = wrap.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
          wrap.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        wrap.addEventListener('pointerleave', () => { wrap.style.transform = ''; });
      }

      // Tarjetas: foco de luz + tilt 3D
      if (!reduce) {
        root.querySelectorAll('.pec-card').forEach((card) => {
          card.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);
            card.style.setProperty('--rx', `${(py - 0.5) * -7}deg`);
            card.style.setProperty('--ry', `${(px - 0.5) * 9}deg`);
          });
          card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
          });
        });
      }

      // Reveal al entrar en pantalla (+ contador de precio)
      if (this._io) { this._io.disconnect(); this._io = null; }
      const targets = root.querySelectorAll('.pec-reveal, [data-observe]');
      const reveal = (el, index) => {
        el.classList.add('pec-in');
        const counter = el.querySelector('[data-count]');
        if (counter && !reduce) setTimeout(() => countUp(counter), 250 + index * 110);
      };
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idx = Number((entry.target.style.getPropertyValue('--i') || '0').trim()) || 0;
            reveal(entry.target, idx);
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
        targets.forEach((el) => this._io.observe(el));
      } else {
        targets.forEach((el, i) => reveal(el, i));
      }
    }

    _onHeroMove(e) {
      if (e.pointerType === 'touch') return;
      const hero = e.currentTarget;
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty('--rx', `${py * -5}deg`);
      hero.style.setProperty('--ry', `${px * 7}deg`);
      hero.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      hero.style.setProperty('--my', `${(py + 0.5) * 100}%`);
      hero.style.setProperty('--px', `${px * -16}px`);
      hero.style.setProperty('--py', `${py * -11}px`);
    }

    _onHeroLeave(e) {
      const hero = e.currentTarget;
      hero.style.setProperty('--rx', '0deg');
      hero.style.setProperty('--ry', '0deg');
      hero.style.setProperty('--px', '0px');
      hero.style.setProperty('--py', '0px');
    }

    _onCtaClick() {
      // No hace preventDefault: si el CTA es un <a> a WhatsApp, la
      // navegación sigue normal; este evento es para analytics, etc.
      this.dispatchEvent(new CustomEvent('cta-click', { bubbles: true, composed: true }));
    }
  }

  customElements.define('pilgrimage-event-card', PilgrimageEventCard);
})();
