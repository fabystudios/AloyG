/**
 * <pilgrimage-event-card>
 * ---------------------------------------------------------------
 * Web component nativo (vanilla JS, Shadow DOM) — versión encapsulada
 * de PilgrimageEventCard.jsx. No depende de frameworks ni de nada
 * externo salvo la tipografía (Google Fonts), y no interfiere con
 * el resto del sitio: todo el CSS vive adentro del Shadow DOM.
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
 * <script>
 *   document.querySelector('pilgrimage-event-card')
 *     .addEventListener('cta-click', () => { ... });
 * </script>
 *
 * ATRIBUTOS SIMPLES (texto):
 *   main-image, main-image-alt, badge-text, tagline, title,
 *   description, cta-text
 *
 * ATRIBUTOS DE WHATSAPP (si se pasa whatsapp-phone, el CTA deja de
 * disparar solo un evento y se convierte en un link directo a WhatsApp):
 *   whatsapp-phone    -> número completo SIN "+" ni espacios, formato
 *                        wa.me (Argentina celular = 549 + código de área
 *                        sin 0 + número sin 15), ej: "5492215947600"
 *   whatsapp-message  -> (opcional) texto precargado del mensaje
 *
 * ATRIBUTOS JSON (array / objeto — si no se pasan o el JSON es
 * inválido, se usa el default de ejemplo "Luján 2026". IMPORTANTE:
 * debe ser JSON válido -> sin comas colgantes al final de arrays u
 * objetos, sin comentarios de ningún tipo, todas las claves entre
 * comillas dobles):
 *   info-cards  -> array de { id, icon, image, title, highlight, lines[] }
 *                  icon acepta: "bus" | "clipboard" | "calendar" | "coins"
 *   footer      -> { parishName, address, phone, email, instagramUrl, facebookUrl }
 *
 * EVENTO:
 *   'cta-click' (bubbles, composed) — se dispara SIEMPRE al tocar el CTA
 *   (haya o no whatsapp-phone), útil para tracking/analytics.
 *
 * VARIABLES CSS PÚBLICAS:
 *   --cartel-max-width       -> ancho máximo de la card (default 1080px)
 *   --pec-hero-aspect        -> fuerza una proporción fija del cover en
 *                               todos los tamaños (si no la seteás, el
 *                               default ya es responsivo: 4/3 en mobile,
 *                               16/9 desde 641px de ancho — misma imagen,
 *                               recorte distinto vía object-fit:cover).
 *   --pec-hero-object-position -> qué parte de la foto priorizar al
 *                               recortar (default "center top": nunca
 *                               corta desde arriba, todo el recorte se
 *                               come de abajo).
 *
 * TAMAÑOS DE IMAGEN RECOMENDADOS:
 *   main-image   -> foto LIMPIA, sin texto ni logos superpuestos (el
 *                   título/tagline/fecha ya los dibuja el componente
 *                   encima). Como el default ahora es responsivo (4/3
 *                   mobile / 16/9 desktop), conviene subir una imagen ya
 *                   ancha, ideal 1920x1200px (relación ~16:10), así hay
 *                   margen de sobra para que object-fit:cover recorte
 *                   bien en cualquiera de las dos proporciones sin perder
 *                   calidad. JPG/WebP optimizado, ideal < 350KB.
 *   info-cards[].image -> relación 16:10. Recomendado 800x500px
 *                   (o 1200x750px para pantallas retina), < 150KB c/u.
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
  const ICON_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const ICON_CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="pec-chevron"><path d="M6 9l6 6 6-6"/></svg>`;
  const ICON_MAPPIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/></svg>`;
  const ICON_PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1z"/></svg>`;
  const ICON_MAIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`;
  const ICON_IG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>`;
  const ICON_FB = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.9.25-1.5 1.55-1.5H16.5V4.3c-.27-.04-1.2-.11-2.28-.11-2.26 0-3.8 1.38-3.8 3.9v2.4H8v3h2.42V21h3.08z"/></svg>`;

  const ICONS = { bus: ICON_BUS, clipboard: ICON_CLIPBOARD, calendar: ICON_CALENDAR, coins: ICON_COINS };

  /* ============================================================
     DEFAULTS (ejemplo Luján 2026, igual que el .jsx original)
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
     Fuentes: se cargan una sola vez a nivel documento (no rompe
     encapsulamiento porque solo agrega @font-face globales, no
     reglas de estilo que afecten el layout de la página).
     ============================================================ */
  function ensureFontsLoaded() {
    if (document.getElementById('pec-fonts')) return;
    const link = document.createElement('link');
    link.id = 'pec-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Mulish:wght@400;600;700&family=Caveat:wght@600;700&family=Fredoka:wght@600;700&display=swap';
    document.head.appendChild(link);
  }

  /* ============================================================
     CSS encapsulado dentro del Shadow DOM (:host reemplaza a
     .pec-root; :host(...) controla el ancho máximo publicable
     vía --cartel-max-width, igual que en cartel-evento)
     ============================================================ */
  const CSS = `
    :host {
      --pec-sky-50: #eff6fc;
      --pec-sky-100: #dcebf7;
      --pec-blue-500: #4a90d2;
      --pec-blue-700: #245a8d;
      --pec-navy-900: #142c46;
      --pec-gold-400: #efa83c;
      --pec-gold-600: #c97f1e;
      --pec-ink: #3c5573;
      --pec-white: #ffffff;
      --pec-shadow-l: rgba(255,255,255,0.85);
      --pec-shadow-d: rgba(148,176,206,0.55);
      --pec-radius-lg: 28px;
      --pec-radius-md: 20px;
      --pec-font-display: 'Baloo 2', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --pec-font-body: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --pec-font-script: 'Caveat', cursive;
      --pec-font-badge: 'Fredoka', var(--pec-font-display);

      display: block;
      box-sizing: border-box;
      position: relative;
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
      transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1);
    }
    :host(.pec-loaded) { opacity: 1; transform: scale(1); }
    *, *::before, *::after { box-sizing: border-box; }

    .pec-hero {
      position: relative;
      border-radius: var(--pec-radius-lg);
      overflow: hidden;
      box-shadow: 0 18px 38px rgba(20,44,70,.28);
      transition: transform .15s ease-out;
      will-change: transform;
    }
    .pec-hero-media { position: relative; width: 100%; aspect-ratio: var(--pec-hero-aspect, 4/3); background: var(--pec-blue-700); }
    .pec-hero-media img { width: 100%; height: 100%; object-fit: cover; object-position: var(--pec-hero-object-position, center top); display: block; }
    /* Default responsivo: en mobile una foto más "cuadrada" (4/3) se ve bien
       de alto; en desktop esa misma proporción ocupa demasiada altura de
       pantalla, así que por default se vuelve más panorámica (16/9). Esto
       recorta la MISMA imagen con object-fit:cover — no hace falta otro
       archivo. Si en algún caso puntual querés forzar una proporción
       distinta, seguís pudiendo pisarla con --pec-hero-aspect en el style. */
    @media (min-width: 641px) {
      .pec-hero-media { aspect-ratio: var(--pec-hero-aspect, 16/9); }
    }
    .pec-hero-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(12,30,52,.78) 0%, rgba(12,30,52,.18) 46%, rgba(12,30,52,0) 66%);
    }
    .pec-hero-badge {
      position: absolute; left: 18px; bottom: 56px;
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--pec-font-badge); font-weight: 600; font-size: .92rem;
      letter-spacing: .015em;
      color: var(--pec-navy-900);
      background: linear-gradient(120deg, rgba(239,168,60,.82), rgba(201,127,30,.82));
      backdrop-filter: blur(6px) saturate(160%);
      -webkit-backdrop-filter: blur(6px) saturate(160%);
      border: 1px solid rgba(255,255,255,.35);
      padding: 8px 16px; border-radius: 999px;
      box-shadow: 0 10px 20px rgba(201,127,30,.4);
      transition: font-size .2s ease;
    }
    @media (min-width: 641px) {
      .pec-hero-badge {
        font-size: 1.7rem;
        font-weight: 700;
        padding: 14px 28px;
        gap: 10px;
        box-shadow: 0 14px 28px rgba(201,127,30,.5);
      }
    }
    .pec-hero-cross { position: absolute; top: 16px; right: 16px; width: 26px; height: 26px; color: #fff; opacity: .9; filter: drop-shadow(0 2px 5px rgba(0,0,0,.35)); }

    .pec-panel {
      position: relative; z-index: 2;
      margin: 14px 12px 0;
      padding: 22px 24px 24px;
      border-radius: var(--pec-radius-md);
      background: rgba(255,255,255,.9);
      border: 1px solid rgba(255,255,255,.7);
      box-shadow: 0 18px 40px rgba(20,44,70,.14), inset 0 1px 0 rgba(255,255,255,.8);
      text-align: center;
    }
    .pec-tagline { font-family: var(--pec-font-script); font-weight: 700; font-size: clamp(1.5rem, 2.6vw, 2.5rem); color: var(--pec-blue-700); margin: 2px 0 6px; }
    .pec-title { font-family: var(--pec-font-display); font-weight: 700; font-size: clamp(1.3rem, 2.4vw, 1.9rem); line-height: 1.2; margin: 0 0 10px; color: var(--pec-navy-900); }
    .pec-description { font-size: .96rem; color: var(--pec-ink); max-width: 540px; margin: 0 auto 20px; line-height: 1.6; }
    .pec-cta {
      display: inline-flex; align-items: center; gap: 8px;
      border: none; cursor: pointer; border-radius: 999px;
      padding: 13px 26px; font-family: var(--pec-font-body); font-weight: 700; font-size: .95rem; color: #fff;
      background: linear-gradient(120deg, var(--pec-blue-500), var(--pec-blue-700));
      box-shadow: 0 12px 24px rgba(36,90,141,.4), inset 0 1px 0 rgba(255,255,255,.3);
      transition: transform .25s ease, box-shadow .25s ease;
    }
    .pec-cta:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgba(36,90,141,.5); }
    .pec-cta svg { width: 17px; height: 17px; transition: transform .25s ease; }
    .pec-cta:hover svg { transform: translateX(4px); }
    .pec-cta:focus-visible, .pec-social a:focus-visible { outline: 3px solid var(--pec-gold-400); outline-offset: 2px; }

    .pec-grid { margin-top: 32px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    @media (max-width: 880px) { .pec-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px) { .pec-grid { grid-template-columns: 1fr; } }

    /* ---------- Mobile: 95% del viewport ----------
       El panel ya no se superpone al cover (ver .pec-panel más arriba),
       así que acá solo se ajusta el ancho al 95vw y se afina el espaciado
       para pantallas chicas. */
    @media (max-width: 640px) {
      :host {
        max-width: 95vw !important;
        padding: 12px;
      }
      .pec-panel {
        margin: 10px 4px 0;
        padding: 18px 16px 16px;
      }
      .pec-hero-badge {
        top: 14px;
        bottom: auto;
        left: 12px;
        font-size: .8rem;
        padding: 7px 12px;
      }
      .pec-grid { margin-top: 22px; gap: 12px; }
    }

    .pec-card {
      border-radius: var(--pec-radius-md);
      background: linear-gradient(165deg, #ffffff, var(--pec-sky-50));
      box-shadow: 9px 9px 22px var(--pec-shadow-d), -7px -7px 18px var(--pec-shadow-l);
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform .3s ease, box-shadow .3s ease;
    }
    .pec-card:hover { transform: translateY(-6px); box-shadow: 13px 13px 28px var(--pec-shadow-d), -9px -9px 22px var(--pec-shadow-l); }
    .pec-card-media { position: relative; width: 100%; aspect-ratio: 16 / 10; background: linear-gradient(135deg, var(--pec-blue-500), var(--pec-blue-700)); }
    .pec-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .pec-card-media-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .pec-card-media-fallback svg { width: 38px; height: 38px; color: #fff; opacity: .92; }
    .pec-card-icon-badge {
      position: absolute; left: 14px; bottom: -15px; width: 38px; height: 38px;
      border-radius: 13px; background: #fff; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 16px rgba(20,44,70,.25); color: var(--pec-blue-700);
      transition: transform .3s ease;
    }
    .pec-card:hover .pec-card-icon-badge { transform: translateY(-2px) scale(1.06); }
    .pec-card-icon-badge svg { width: 19px; height: 19px; }
    .pec-card-body { padding: 25px 17px 18px; flex: 1; display: flex; flex-direction: column; gap: 7px; text-align: left; }
    .pec-card-title { font-family: var(--pec-font-display); font-weight: 600; font-size: .98rem; margin: 0; color: var(--pec-navy-900); }
    .pec-card-highlight { font-family: var(--pec-font-display); font-weight: 700; font-size: 1.28rem; color: var(--pec-blue-700); margin: 0; }
    .pec-card-lines { margin: 8px 0 0; padding: 0; font-size: .85rem; color: var(--pec-ink); line-height: 1.5; }
    .pec-card-lines li { list-style: none; position: relative; padding-left: 1.1em; margin-bottom: 4px; }
    .pec-card-lines li::before { content: ''; position: absolute; left: 0; top: .55em; width: 6px; height: 6px; border-radius: 50%; background: var(--pec-gold-600); }

    .pec-card-details { margin-top: 2px; }
    .pec-card-summary {
      cursor: pointer; list-style: none; user-select: none;
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border-radius: 50%;
      background: rgba(74,144,210,.14); color: var(--pec-blue-700);
      transition: background .2s ease, transform .2s ease;
    }
    .pec-card-summary::-webkit-details-marker { display: none; }
    .pec-card-summary::marker { content: ''; }
    .pec-card-summary:hover { background: rgba(74,144,210,.24); }
    .pec-card-summary:focus-visible { outline: 3px solid var(--pec-gold-400); outline-offset: 2px; }
    .pec-chevron { width: 13px; height: 13px; transition: transform .25s ease; }
    .pec-card-details[open] .pec-card-summary { transform: rotate(0deg); }
    .pec-card-details[open] .pec-chevron { transform: rotate(180deg); }

    .pec-footer {
      margin-top: 30px; padding: 22px 20px; border-radius: var(--pec-radius-md);
      background: linear-gradient(160deg, var(--pec-navy-900), #0d2340); color: #fff;
      display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;
      box-shadow: 0 16px 36px rgba(13,35,64,.4);
    }
    .pec-footer-name { display: block; font-family: var(--pec-font-display); font-weight: 700; font-size: 1rem; margin-bottom: 7px; }
    .pec-footer-info { display: flex; flex-wrap: wrap; gap: 14px; font-size: .84rem; }
    .pec-footer-info span { display: inline-flex; align-items: center; gap: 6px; opacity: .92; }
    .pec-footer-info svg { width: 15px; height: 15px; color: var(--pec-gold-400); flex-shrink: 0; }
    .pec-social { display: flex; gap: 10px; }
    .pec-social a {
      width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.1); color: #fff; text-decoration: none;
      transition: background .2s ease, transform .2s ease;
    }
    .pec-social a:hover { background: var(--pec-gold-400); color: var(--pec-navy-900); transform: translateY(-3px); }
    .pec-social a svg { width: 16px; height: 16px; }

    @media (prefers-reduced-motion: reduce) {
      :host, .pec-hero, .pec-card, .pec-cta, .pec-social a { transition: none !important; }
      :host { opacity: 1; transform: none; }
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

  function infoCardMarkup(item, isDesktop) {
    const icon = ICONS[item.icon] || ICON_CLIPBOARD;
    const media = item.image
      ? `<img src="${esc(item.image)}" alt="${esc(item.title || '')}" loading="lazy">`
      : `<div class="pec-card-media-fallback">${icon}</div>`;
    const highlight = item.highlight ? `<p class="pec-card-highlight">${esc(item.highlight)}</p>` : '';
    const linesList = Array.isArray(item.lines) && item.lines.length
      ? `<ul class="pec-card-lines">${item.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`
      : '';
    // El detalle de texto es desplegable: en mobile arranca cerrado
    // (isDesktop = false -> sin "open"), en desktop arranca abierto.
    // El usuario igual puede abrir/cerrar tocando la flechita.
    const lines = linesList
      ? `<details class="pec-card-details"${isDesktop ? ' open' : ''}>
          <summary class="pec-card-summary" aria-label="Mostrar más detalle">${ICON_CHEVRON}</summary>
          ${linesList}
        </details>`
      : '';
    return `
      <article class="pec-card">
        <div class="pec-card-media">
          ${media}
          <span class="pec-card-icon-badge">${icon}</span>
        </div>
        <div class="pec-card-body">
          <h3 class="pec-card-title">${esc(item.title)}</h3>
          ${highlight}
          ${lines}
        </div>
      </article>
    `;
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
      this._onHeroMouseMove = this._onHeroMouseMove.bind(this);
      this._onHeroMouseLeave = this._onHeroMouseLeave.bind(this);
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
      if (this._loadedTimeout) clearTimeout(this._loadedTimeout);
    }

    attributeChangedCallback() {
      this._scheduleRender();
    }

    // Debounce a microtask para no re-renderizar varias veces si
    // se setean varios atributos seguidos (mismo patrón que el resto
    // de la suite, ej. preparativos-pena).
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
      const title = this.hasAttribute('title') ? this.getAttribute('title') : '¡Vamos a ver al Papa León XIV!';
      const description = this.getAttribute('description') || '';
      const ctaText = this.hasAttribute('cta-text') ? this.getAttribute('cta-text') : 'Quiero inscribirme';
      const whatsappPhone = this.getAttribute('whatsapp-phone') || '';
      const whatsappMessage = this.getAttribute('whatsapp-message') || '';

      const infoCards = parseJsonAttr(this.getAttribute('info-cards'), DEFAULT_INFO_CARDS, 'info-cards');
      const footer = parseJsonAttr(this.getAttribute('footer'), DEFAULT_FOOTER, 'footer');

      const heroImg = mainImage ? `<img src="${esc(mainImage)}" alt="${esc(mainImageAlt)}">` : '';
      const badgeMarkup = badgeText ? `<span class="pec-hero-badge">${esc(badgeText)}</span>` : '';
      const taglineMarkup = tagline ? `<p class="pec-tagline">${esc(tagline)}</p>` : '';
      const descriptionMarkup = description ? `<p class="pec-description">${esc(description)}</p>` : '';
      const waUrl = whatsappPhone ? waLink(whatsappPhone, whatsappMessage) : '';
      const ctaMarkup = !ctaText ? '' : waUrl
        ? `<a class="pec-cta" href="${esc(waUrl)}" target="_blank" rel="noreferrer">${esc(ctaText)} ${ICON_ARROW}</a>`
        : `<button type="button" class="pec-cta">${esc(ctaText)} ${ICON_ARROW}</button>`;

      // Umbral: coincide con el breakpoint mobile (640px) definido en el CSS.
      const isDesktop = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(min-width: 641px)').matches
        : true;

      const gridMarkup = Array.isArray(infoCards) && infoCards.length
        ? `<section class="pec-grid" aria-label="Información del viaje">${infoCards.map((item) => infoCardMarkup(item, isDesktop)).join('')}</section>`
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
        ? `<footer class="pec-footer">
            <div>
              ${footer.parishName ? `<strong class="pec-footer-name">${esc(footer.parishName)}</strong>` : ''}
              <div class="pec-footer-info">${footerInfo}</div>
            </div>
            ${footerSocial}
          </footer>`
        : '';

      this.shadowRoot.innerHTML = `
        <style>${CSS}</style>
        <header class="pec-hero">
          <div class="pec-hero-media">${heroImg}<div class="pec-hero-gradient"></div></div>
          ${ICON_CROSS}
          ${badgeMarkup}
        </header>
        <section class="pec-panel">
          ${taglineMarkup}
          <h2 class="pec-title">${esc(title)}</h2>
          ${descriptionMarkup}
          ${ctaMarkup}
        </section>
        ${gridMarkup}
        ${footerMarkup}
      `;

      this._bindEvents();
    }

    _bindEvents() {
      const hero = this.shadowRoot.querySelector('.pec-hero');
      if (hero) {
        hero.addEventListener('mousemove', this._onHeroMouseMove);
        hero.addEventListener('mouseleave', this._onHeroMouseLeave);
      }
      const cta = this.shadowRoot.querySelector('.pec-cta');
      if (cta) cta.addEventListener('click', this._onCtaClick);
    }

    _onHeroMouseMove(e) {
      const hero = e.currentTarget;
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = py * -5;
      const tiltY = px * 7;
      hero.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    _onHeroMouseLeave(e) {
      e.currentTarget.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    }

    _onCtaClick() {
      // No hace preventDefault: si el CTA es un <a> a WhatsApp, la
      // navegación sigue su curso normal; este evento es solo para
      // que el sitio pueda escuchar (analytics, etc.) si quiere.
      this.dispatchEvent(new CustomEvent('cta-click', { bubbles: true, composed: true }));
    }
  }

  customElements.define('pilgrimage-event-card', PilgrimageEventCard);
})();
