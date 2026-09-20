import React, { useEffect, useRef, useState } from 'react';

/**
 * PilgrimageEventCard
 * ---------------------------------------------------------------
 * Card autocontenida (neumorfismo + glassmorfismo) para promocionar
 * un viaje / evento parroquial. Pensada para insertarse en cualquier
 * sitio React (no depende de Tailwind ni de librerías de iconos):
 * los estilos se inyectan una sola vez en <head> la primera vez que
 * se monta el componente.
 *
 * TODO EL CONTENIDO ENTRA POR PROPS. Los valores por defecto que ves
 * abajo son solo el ejemplo de "Luján 2026" para que la card se vea
 * completa si la usás sin props.
 *
 * Sugerencia: `mainImage` funciona mejor como una FOTO limpia (sin
 * texto superpuesto), porque el título y la bajada ya los dibuja el
 * componente. Lo mismo con las imágenes de las subcards: si van a
 * quedar animadas más adelante, que sean el ícono/ilustración suelto,
 * y el texto (title/highlight/lines) se lo pasás aparte.
 *
 * ---------------------------------------------------------------
 * @typedef {Object} InfoCardData
 * @property {string} id
 * @property {'bus'|'clipboard'|'calendar'|'coins'} [icon]  - ícono de respaldo si no hay imagen
 * @property {string|React.ReactNode} [image]               - imagen o nodo (ej: <video>) para el futuro anim.
 * @property {string} title
 * @property {string} [highlight]                           - dato grande (precio, fecha, etc.)
 * @property {string[]} [lines]                              - lista de textos cortos
 *
 * @typedef {Object} FooterData
 * @property {string} [parishName]
 * @property {string} [address]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [instagramUrl]
 * @property {string} [facebookUrl]
 */

/* ================================================================
   ÍCONOS EN LÍNEA (sin dependencias externas)
   ================================================================ */

const IconBus = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="5" width="18" height="12" rx="2.5" />
    <path d="M3 11h18" />
    <path d="M7 17v2M17 17v2" />
    <circle cx="7.5" cy="19.2" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="19.2" r="1.3" fill="currentColor" stroke="none" />
    <path d="M6 8h5M13 8h5" />
  </svg>
);

const IconClipboard = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <rect x="9" y="2.3" width="6" height="3" rx="1" />
    <path d="M8.3 11.2l2 2 4-4.4" />
    <path d="M8 16.2h8" />
  </svg>
);

const IconCalendarMoon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v3M16 3v3" />
    <path d="M16.4 13.6a2.7 2.7 0 1 1-3.1-3.9 2.7 2.7 0 0 0 3.1 3.9z" fill="currentColor" stroke="none" />
  </svg>
);

const IconCoins = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <ellipse cx="9" cy="7" rx="6" ry="3" />
    <path d="M3 7v4c0 1.66 2.69 3 6 3s6-1.34 6-3V7" />
    <path d="M3 11v4c0 1.66 2.69 3 6 3" />
    <ellipse cx="17" cy="13.6" rx="4.2" ry="2.2" />
    <path d="M12.8 13.6v3.2c0 1.22 1.88 2.2 4.2 2.2s4.2-.98 4.2-2.2v-3.2" />
  </svg>
);

const IconCross = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M10.5 2h3v7.5H21v3h-7.5V22h-3v-9.5H3v-3h7.5V2z" />
  </svg>
);

const IconQuote = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M7.6 6C5 6 3 8.1 3 10.7c0 2.4 1.8 4.4 4.1 4.6-.3 1.6-1.4 2.8-3 3.4l.6 1.6c3-1 5-3.5 5-7v-2.7C9.7 7.8 8.8 6 7.6 6zm9.4 0c-2.6 0-4.6 2.1-4.6 4.7 0 2.4 1.8 4.4 4.1 4.6-.3 1.6-1.4 2.8-3 3.4l.6 1.6c3-1 5-3.5 5-7v-2.7C19.1 7.8 18.2 6 17 6z" />
  </svg>
);

const IconArrowRight = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const IconMapPin = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

const IconPhone = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1z" />
  </svg>
);

const IconMail = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const IconInstagram = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.9.25-1.5 1.55-1.5H16.5V4.3c-.27-.04-1.2-.11-2.28-.11-2.26 0-3.8 1.38-3.8 3.9v2.4H8v3h2.42V21h3.08z" />
  </svg>
);

const ICONS = { bus: IconBus, clipboard: IconClipboard, calendar: IconCalendarMoon, coins: IconCoins };

/* ================================================================
   CONTENIDO POR DEFECTO (ejemplo: Luján, 11 de noviembre)
   ================================================================ */

const DEFAULT_INFO_CARDS = [
  {
    id: 'viaje',
    icon: 'bus',
    title: 'Cómo viajamos',
    lines: [
      'Viajamos durante la noche para llegar a Luján con anticipación.',
      'Nos ubicamos cerca de la Basílica antes de que empiece todo.',
      'Esperamos juntos y participamos de la celebración con el Papa.',
    ],
  },
  {
    id: 'inscripcion',
    icon: 'clipboard',
    title: 'Inscripciones',
    lines: [
      'Se hacen en la Secretaría Parroquial.',
      'Lunes y jueves de 16 a 18 hs.',
      'Martes y sábados de 10 a 12 hs.',
    ],
  },
  {
    id: 'fecha',
    icon: 'calendar',
    title: 'Fecha del viaje',
    highlight: 'Miércoles 11 de noviembre',
    lines: ['Salida: martes 10 de noviembre por la noche.'],
  },
  {
    id: 'valor',
    icon: 'coins',
    title: 'Valor del viaje',
    highlight: '$30.000',
    lines: ['Se puede pagar en 2 veces.', 'Para reservar el lugar: $10.000 al inscribirte.'],
  },
];

const DEFAULT_FOOTER = {
  parishName: 'Parroquia Nuestra Señora de Luján',
  address: 'Reemplazá por la dirección real',
  phone: '+54 9 11 0000-0000',
  email: 'contacto@parroquia.org',
  instagramUrl: '#',
  facebookUrl: '#',
};

/* ================================================================
   ESTILOS (se inyectan una sola vez en <head>)
   ================================================================ */

const CSS = `
.pec-root {
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

  position: relative;
  max-width: 1080px;
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
.pec-root.pec-loaded { opacity: 1; transform: scale(1); }
.pec-root * { box-sizing: border-box; }

/* ---------- Hero ---------- */
.pec-hero {
  position: relative;
  border-radius: var(--pec-radius-lg);
  overflow: hidden;
  box-shadow: 0 18px 38px rgba(20,44,70,.28);
  transition: transform .15s ease-out;
  will-change: transform;
}
.pec-hero-media { position: relative; width: 100%; aspect-ratio: 4 / 3; background: var(--pec-blue-700); }
.pec-hero-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pec-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(12,30,52,.78) 0%, rgba(12,30,52,.18) 46%, rgba(12,30,52,0) 66%);
}
.pec-hero-badge {
  position: absolute; left: 18px; bottom: 16px;
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--pec-font-display); font-weight: 700; font-size: .92rem;
  color: var(--pec-navy-900);
  background: linear-gradient(120deg, var(--pec-gold-400), var(--pec-gold-600));
  padding: 8px 16px; border-radius: 999px;
  box-shadow: 0 10px 20px rgba(201,127,30,.45);
}
.pec-hero-cross { position: absolute; top: 16px; right: 16px; width: 26px; height: 26px; color: #fff; opacity: .9; filter: drop-shadow(0 2px 5px rgba(0,0,0,.35)); }

/* ---------- Panel (glass) ---------- */
.pec-panel {
  position: relative; z-index: 2;
  margin: -42px 12px 0;
  padding: 28px 24px 24px;
  border-radius: var(--pec-radius-md);
  background: rgba(255,255,255,.74);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255,255,255,.6);
  box-shadow: 0 18px 40px rgba(20,44,70,.18), inset 0 1px 0 rgba(255,255,255,.8);
  text-align: center;
}
.pec-quote-icon { width: 22px; height: 22px; color: var(--pec-gold-600); opacity: .85; }
.pec-tagline { font-family: var(--pec-font-script); font-weight: 700; font-size: 1.5rem; color: var(--pec-blue-700); margin: 2px 0 6px; }
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

/* ---------- Grid de subcards ---------- */
.pec-grid { margin-top: 32px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
@media (max-width: 880px) { .pec-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .pec-grid { grid-template-columns: 1fr; } }

.pec-card {
  border-radius: var(--pec-radius-md);
  background: linear-gradient(165deg, #ffffff, var(--pec-sky-50));
  box-shadow: 9px 9px 22px var(--pec-shadow-d), -7px -7px 18px var(--pec-shadow-l);
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform .3s ease, box-shadow .3s ease;
}
.pec-card:hover {
  transform: translateY(-6px);
  box-shadow: 13px 13px 28px var(--pec-shadow-d), -9px -9px 22px var(--pec-shadow-l);
}
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
.pec-card-lines { margin: 4px 0 0; padding: 0; font-size: .85rem; color: var(--pec-ink); line-height: 1.5; }
.pec-card-lines li { list-style: none; position: relative; padding-left: 1.1em; margin-bottom: 4px; }
.pec-card-lines li::before { content: ''; position: absolute; left: 0; top: .55em; width: 6px; height: 6px; border-radius: 50%; background: var(--pec-gold-600); }

/* ---------- Footer ---------- */
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
  background: rgba(255,255,255,.1); color: #fff; transition: background .2s ease, transform .2s ease;
}
.pec-social a:hover { background: var(--pec-gold-400); color: var(--pec-navy-900); transform: translateY(-3px); }
.pec-social a svg { width: 16px; height: 16px; }

@media (prefers-reduced-motion: reduce) {
  .pec-root, .pec-hero, .pec-card, .pec-cta, .pec-social a { transition: none !important; }
  .pec-root { opacity: 1; transform: none; }
}
`;

function useInjectStyles() {
  useEffect(() => {
    if (!document.getElementById('pec-styles')) {
      const style = document.createElement('style');
      style.id = 'pec-styles';
      style.innerHTML = CSS;
      document.head.appendChild(style);
    }
    if (!document.getElementById('pec-fonts')) {
      const link = document.createElement('link');
      link.id = 'pec-fonts';
      link.rel = 'stylesheet';
      // Si tu sitio ya carga sus propias fuentes, podés borrar este bloque
      // y ajustar --pec-font-display / --pec-font-body / --pec-font-script.
      link.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Mulish:wght@400;600;700&family=Caveat:wght@600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);
}

/* ================================================================
   SUBCARD
   ================================================================ */

function InfoCard({ item }) {
  const Icon = ICONS[item.icon] || IconClipboard;
  return (
    <article className="pec-card">
      <div className="pec-card-media">
        {item.image ? (
          typeof item.image === 'string'
            ? <img src={item.image} alt={item.title} loading="lazy" />
            : item.image
        ) : (
          <div className="pec-card-media-fallback"><Icon /></div>
        )}
        <span className="pec-card-icon-badge"><Icon /></span>
      </div>
      <div className="pec-card-body">
        <h3 className="pec-card-title">{item.title}</h3>
        {item.highlight && <p className="pec-card-highlight">{item.highlight}</p>}
        {item.lines && item.lines.length > 0 && (
          <ul className="pec-card-lines">
            {item.lines.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}
      </div>
    </article>
  );
}

/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */

export default function PilgrimageEventCard({
  mainImage,
  mainImageAlt = 'Imagen principal del evento',
  badgeText = 'Luján · 11 de noviembre',
  tagline = '¡Un encuentro que nos une como Iglesia!',
  title = '¡Vamos a ver al Papa León XIV!',
  description = 'Una oportunidad única para encontrarnos con el Santo Padre y vivir juntos este momento histórico para nuestra Iglesia.',
  ctaText = 'Quiero inscribirme',
  onCtaClick = () => {},
  infoCards = DEFAULT_INFO_CARDS,
  footer = DEFAULT_FOOTER,
}) {
  useInjectStyles();
  const [loaded, setLoaded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 40);
    return () => clearTimeout(t);
  }, []);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -5, y: px * 7 });
  }
  function resetTilt() { setTilt({ x: 0, y: 0 }); }

  return (
    <div className={`pec-root${loaded ? ' pec-loaded' : ''}`}>
      <header
        ref={heroRef}
        className="pec-hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="pec-hero-media">
          {mainImage && <img src={mainImage} alt={mainImageAlt} />}
          <div className="pec-hero-gradient" />
        </div>
        <IconCross className="pec-hero-cross" />
        {badgeText && <span className="pec-hero-badge">{badgeText}</span>}
      </header>

      <section className="pec-panel">
        <IconQuote className="pec-quote-icon" />
        {tagline && <p className="pec-tagline">{tagline}</p>}
        <h2 className="pec-title">{title}</h2>
        {description && <p className="pec-description">{description}</p>}
        {ctaText && (
          <button type="button" className="pec-cta" onClick={onCtaClick}>
            {ctaText} <IconArrowRight />
          </button>
        )}
      </section>

      {infoCards && infoCards.length > 0 && (
        <section className="pec-grid" aria-label="Información del viaje">
          {infoCards.map((item) => <InfoCard key={item.id} item={item} />)}
        </section>
      )}

      {footer && (
        <footer className="pec-footer">
          <div>
            {footer.parishName && <strong className="pec-footer-name">{footer.parishName}</strong>}
            <div className="pec-footer-info">
              {footer.address && <span><IconMapPin />{footer.address}</span>}
              {footer.phone && <span><IconPhone />{footer.phone}</span>}
              {footer.email && <span><IconMail />{footer.email}</span>}
            </div>
          </div>
          {(footer.instagramUrl || footer.facebookUrl) && (
            <div className="pec-social">
              {footer.instagramUrl && (
                <a href={footer.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><IconInstagram /></a>
              )}
              {footer.facebookUrl && (
                <a href={footer.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook"><IconFacebook /></a>
              )}
            </div>
          )}
        </footer>
      )}
    </div>
  );
}

/* ================================================================
   EJEMPLO DE USO
   ================================================================

import PilgrimageEventCard from './PilgrimageEventCard';

<PilgrimageEventCard
  mainImage="/img/basilica-lujan.jpg"
  infoCards={[
    { id: 'viaje', icon: 'bus', image: '/img/bus-animado.gif', title: 'Cómo viajamos', lines: ['...'] },
    { id: 'inscripcion', icon: 'clipboard', title: 'Inscripciones', lines: ['...'] },
    { id: 'fecha', icon: 'calendar', title: 'Fecha del viaje', highlight: '11 de noviembre', lines: ['...'] },
    { id: 'valor', icon: 'coins', title: 'Valor del viaje', highlight: '$30.000', lines: ['...'] },
  ]}
  footer={{
    parishName: 'Parroquia San José',
    address: 'Calle Falsa 123, Ciudad',
    phone: '+54 9 11 1234-5678',
    email: 'info@parroquiasanjose.org',
    instagramUrl: 'https://instagram.com/...',
  }}
  onCtaClick={() => console.log('inscribirse')}
/>

================================================================= */
