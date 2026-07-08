/**
 * <youtube-glass-card> — Tarjeta Glassmorphism con video de YouTube + título + texto
 *
 * Atributos:
 *   url        URL de YouTube (admite watch?v=, youtu.be/, shorts/, embed/, live/)
 *   title      Título de la tarjeta
 *   subtitle   Subtítulo opcional (ej. autor, fecha) debajo del título
 *   text       Texto/descripción (\n\n → párrafos; cita entre comillas → blockquote)
 *   accent     Color de acento hex (default: "#c8a84b")
 *   bg-image   URL/path a una imagen PNG decorativa que flota de fondo
 *              (no se deforma — mantiene su aspect, opacidad reducida)
 *   anchor-id  ID HTML para anclas URL (default: auto)
 *
 * Layout:
 *   - Desktop:  columna izquierda con título arriba + video debajo;
 *               columna derecha con el texto, paralelo a (título + video).
 *               El texto scrollea si excede esa altura.
 *   - Mobile:   card 95vw, aspect 9:16, vertical:
 *               header → video (crop central) → texto + botón "más…".
 *
 * Usa Shadow DOM para aislar estilos de CSS global del sitio.
 */
class YoutubeGlassCard extends HTMLElement {

  connectedCallback() {
    const rawUrl      = this.getAttribute('url')       || '';
    const titleText   = this.getAttribute('title')     || '';
    const subtitleTxt = this.getAttribute('subtitle')  || '';
    const bodyText    = this.getAttribute('text')      || '';
    const accentColor = this.getAttribute('accent')    || '#c8a84b';
    const bgImage     = this.getAttribute('bg-image')  || '';
    const anchorId    = this.getAttribute('anchor-id')
                       || ('yt-glass-' + Math.random().toString(36).slice(2, 8));

    this.id = anchorId;

    const videoId = this._extractYoutubeId(rawUrl);
    const embedUrl = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
      : '';

    const hexToRgb = (hex) => {
      const c = hex.replace('#', '').padEnd(6, '0');
      return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16)
      ];
    };
    const [cr, cg, cb] = hexToRgb(accentColor);
    const dark = `rgb(${Math.max(0, cr-70)},${Math.max(0, cg-70)},${Math.max(0, cb-70)})`;
    const mid  = `rgb(${cr},${cg},${cb})`;
    const lite = `rgb(${Math.min(255,cr+80)},${Math.min(255,cg+80)},${Math.min(255,cb+80)})`;

    const escapeHtml = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const paragraphsHtml = bodyText
      .split(/\n\s*\n|\\n\\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        const safe = escapeHtml(p).replace(/\\n|\n/g, '<br>');
        if (/^[“"].+[”"]\.?$/.test(p.trim())) {
          return `<blockquote class="quote">${safe}</blockquote>`;
        }
        return `<p>${safe}</p>`;
      })
      .join('');

    const root = this.attachShadow({ mode: 'open' });

    root.innerHTML = `
<style>
:host { display: block; box-sizing: border-box; }
:host * { box-sizing: border-box; }
:host *::before, :host *::after { box-sizing: border-box; }
.wrap, .wrap *, .header, .title, .body, p, blockquote, button { margin: 0; }

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ══════════════════════════════════════════════════════════
   WRAP — DESKTOP: izquierda (título + video) | derecha (texto)
══════════════════════════════════════════════════════════ */
.wrap {
  position: relative;
  max-width: 1080px;
  margin: 2rem auto;
  padding: 1.2rem;
  border-radius: 24px;
  background:
    linear-gradient(135deg,
      rgba(255,255,255,0.10) 0%,
      rgba(255,255,255,0.04) 100%),
    rgba(15, 12, 8, 0.55);
  backdrop-filter: blur(24px) saturate(170%);
  -webkit-backdrop-filter: blur(24px) saturate(170%);
  border: 1px solid rgba(${cr},${cg},${cb},0.28);
  box-shadow:
    0 30px 80px rgba(0,0,0,0.55),
    0 0 60px rgba(${cr},${cg},${cb},0.10),
    inset 0 1px 0 rgba(255,255,255,0.10);
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.1rem;
}

/* ─── Columna izquierda: header + video apilados ─── */
.left-col {
  flex: 0 0 58%;
  width: 58%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.wrap::before {
  content: '';
  position: absolute;
  inset: -80px;
  background:
    radial-gradient(ellipse 50% 40% at 20% 10%,
      rgba(${cr},${cg},${cb},0.22) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 100%,
      rgba(${cr},${cg},${cb},0.14) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

.wrap::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.07) 0%,
    transparent 100%);
  pointer-events: none;
  border-radius: 24px 24px 0 0;
  z-index: 0;
}

/* ─── Imagen flotante decorativa (prop bg-image) ─── */
/* Múltiples copias chicas que "pululan" por la card por detrás del
   contenido. object-fit: contain → no se deforman. */
.bg-floater {
  position: absolute;
  width: 22%;
  max-width: 160px;
  min-width: 70px;
  height: auto;
  object-fit: contain;
  opacity: 0.20;
  mix-blend-mode: screen;
  pointer-events: none;
  user-select: none;
  z-index: 4;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.5));
  will-change: transform;
}
.bg-floater.f1 {
  top: 8%;
  left: 4%;
  width: 18%;
  animation: ygc-pull-1 16s ease-in-out infinite;
}
.bg-floater.f2 {
  top: 55%;
  right: 6%;
  width: 25%;
  opacity: 0.16;
  animation: ygc-pull-2 22s ease-in-out infinite;
  animation-delay: -3s;
}
.bg-floater.f3 {
  bottom: 6%;
  left: 38%;
  width: 15%;
  opacity: 0.24;
  animation: ygc-pull-3 19s ease-in-out infinite;
  animation-delay: -7s;
}

@keyframes ygc-pull-1 {
  0%   { transform: translate(0, 0)        rotate(0deg) scale(1); }
  25%  { transform: translate(40px, -20px) rotate(8deg) scale(1.08); }
  50%  { transform: translate(70px, 30px)  rotate(-4deg) scale(0.95); }
  75%  { transform: translate(20px, 50px)  rotate(5deg) scale(1.05); }
  100% { transform: translate(0, 0)        rotate(0deg) scale(1); }
}
@keyframes ygc-pull-2 {
  0%   { transform: translate(0, 0)         rotate(0deg) scale(1); }
  33%  { transform: translate(-50px, -30px) rotate(-10deg) scale(0.9); }
  66%  { transform: translate(-30px, 40px)  rotate(6deg) scale(1.1); }
  100% { transform: translate(0, 0)         rotate(0deg) scale(1); }
}
@keyframes ygc-pull-3 {
  0%   { transform: translate(0, 0)        rotate(0deg) scale(1); }
  20%  { transform: translate(-40px, -50px) rotate(7deg) scale(1.1); }
  45%  { transform: translate(30px, -25px)  rotate(-6deg) scale(0.95); }
  70%  { transform: translate(50px, 20px)   rotate(4deg) scale(1.05); }
  100% { transform: translate(0, 0)         rotate(0deg) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .bg-floater { animation: none; }
}

/* ─── Header (título sobre el video, en la columna izquierda) ─── */
.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0 0.2rem 0.9rem 0.2rem;
  border-bottom: 1px solid rgba(${cr},${cg},${cb},0.22);
  flex-shrink: 0;
}
.badge {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${mid} 0%, ${dark} 100%);
  color: #fff;
  box-shadow:
    0 6px 18px rgba(${cr},${cg},${cb},0.45),
    inset 0 1px 0 rgba(255,255,255,0.30);
}
.badge i { font-size: 24px; }

.heading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: clamp(1.25rem, 2vw, 1.85rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.2;
  color: ${lite};
  text-shadow:
    0 2px 6px rgba(0,0,0,0.55),
    0 0 24px rgba(${cr},${cg},${cb},0.25);
}
.subtitle {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.3;
  color: rgba(255, 245, 220, 0.95);
  text-transform: uppercase;
  text-shadow:
    0 1px 3px rgba(0,0,0,0.7),
    0 0 18px rgba(${cr},${cg},${cb},0.45);
}

/* ─── Video (dentro de la columna izquierda) ─── */
.video-frame {
  position: relative;
  z-index: 1;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 9;
  box-shadow:
    0 18px 40px rgba(0,0,0,0.65),
    0 0 0 1px rgba(${cr},${cg},${cb},0.30),
    0 0 35px rgba(${cr},${cg},${cb},0.18);
}
.video-frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
.video-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255,255,255,0.65);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.95rem;
  text-align: center;
  padding: 1rem;
}

/* ─── Body (texto, derecha — paralelo a título+video) ─── */
/* Position absolute para que su altura sea la del wrap (= título +
   video + paddings) sin importar cuánto texto contenga. */
.body {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  bottom: 1.2rem;
  width: calc(42% - 1.7rem);
  overflow-y: auto;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background:
    linear-gradient(180deg,
      rgba(255,255,255,0.06) 0%,
      rgba(255,255,255,0.02) 100%),
    rgba(0,0,0,0.28);
  border: 1px solid rgba(${cr},${cg},${cb},0.16);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(245, 240, 230, 0.92);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  scrollbar-width: thin;
  scrollbar-color: ${mid} transparent;
}
.body::-webkit-scrollbar { width: 8px; }
.body::-webkit-scrollbar-track { background: transparent; }
.body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, ${mid}, ${dark});
  border-radius: 4px;
}
.body p { margin: 0 0 0.8rem 0; }
.body p:last-child { margin-bottom: 0; }

/* Cita destacada */
.quote {
  margin: 0.9rem 0;
  padding: 0.8rem 1rem 0.8rem 1.2rem;
  border-left: 4px solid ${mid};
  border-radius: 0 12px 12px 0;
  background: linear-gradient(90deg,
    rgba(${cr},${cg},${cb},0.16) 0%,
    rgba(${cr},${cg},${cb},0.04) 100%);
  font-family: 'Playfair Display', 'Dancing Script', 'Georgia', serif;
  font-style: italic;
  font-size: 1.1em;
  color: ${lite};
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}

/* Botón "más…" — oculto en desktop */
.more { display: none; }

/* ══════════════════════════════════════════════════════════
   MOBILE: card 95vw, vertical 9:16
══════════════════════════════════════════════════════════ */
@media (max-width: 767px) {
  .wrap {
    width: 95vw;
    max-width: 95vw;
    margin: 0.8rem auto;
    padding: 0.8rem 0.9rem 0.9rem;
    border-radius: 20px;
    aspect-ratio: 9 / 16;
    gap: 0;
  }

  /* La columna izquierda "se disuelve" — header y video pasan a ser
     hijos directos del wrap para el layout vertical */
  .left-col {
    display: contents;
  }
  .wrap {
    flex-direction: column;
  }

  /* Orden vertical: header → video → body → botón */
  .header      { order: 1; }
  .video-frame { order: 2; }
  .body        { order: 3; }
  .more        { order: 4; }

  .header {
    gap: 0.5rem;
    padding: 0 0 0.55rem 0;
    margin: 0 0 0.6rem 0;
  }
  .badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
  .badge i { font-size: 16px; }
  .title {
    font-size: 0.95rem;
    line-height: 1.18;
  }
  .subtitle {
    font-size: 0.8rem;
    letter-spacing: 0.06em;
  }

  /* Video con CROP central */
  .video-frame {
    flex: 1 1 50%;
    width: auto;
    min-height: 0;
    aspect-ratio: auto;
    border-radius: 12px;
    align-self: stretch;
  }
  .video-frame iframe {
    position: absolute;
    top: 50%;
    left: 50%;
    width: auto;
    height: 100%;
    aspect-ratio: 16 / 9;
    transform: translate(-50%, -50%) scale(1.1);
    transform-origin: center center;
  }

  /* Texto con fade + botón más */
  .body {
    position: static;
    width: auto;
    flex: 1 1 50%;
    min-height: 0;
    margin: 0.7rem 0 0 0;
    padding: 0.8rem 0.9rem;
    border-radius: 12px;
    overflow: hidden;
    font-size: 0.88rem;
    line-height: 1.5;
    -webkit-mask-image: linear-gradient(
      180deg, #000 0, #000 calc(100% - 38px), transparent 100%);
            mask-image: linear-gradient(
      180deg, #000 0, #000 calc(100% - 38px), transparent 100%);
  }
  .body p { margin: 0 0 0.5rem 0; }
  .quote {
    margin: 0.6rem 0;
    padding: 0.6rem 0.8rem 0.6rem 1rem;
    font-size: 1.02em;
  }

  .more {
    display: none;
    position: absolute;
    bottom: 7px;
    right: 11px;
    z-index: 4;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border: 1px solid rgba(${cr},${cg},${cb},0.45);
    border-radius: 999px;
    background: linear-gradient(135deg, ${mid} 0%, ${dark} 100%);
    color: #fff;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    box-shadow:
      0 6px 16px rgba(0,0,0,0.55),
      0 0 18px rgba(${cr},${cg},${cb},0.35);
    transition: transform 0.15s ease, box-shadow 0.2s ease;
  }
  .more:hover  { transform: translateY(-1px); }
  .more:active { transform: scale(0.96); }
  .more.is-visible { display: inline-flex; }
  .more i { font-size: 14px; }

  /* Estado expandido: rompe el 9:16 y muestra todo el texto */
  .wrap.is-expanded { aspect-ratio: auto; }
  .wrap.is-expanded .body {
    overflow: visible;
    flex: 0 0 auto;
    -webkit-mask-image: none;
            mask-image: none;
  }
  .wrap.is-expanded .video-frame {
    flex: 0 0 auto;
    aspect-ratio: 16 / 9;
    height: auto;
  }
  .wrap.is-expanded .video-frame iframe {
    position: static;
    width: 100%;
    height: 100%;
    transform: none;
    aspect-ratio: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wrap, .more { transition: none; }
}
</style>

<div class="wrap" role="region" aria-label="${escapeHtml(titleText) || 'Video'}">

  ${bgImage ? `
    <img class="bg-floater f1" src="${escapeHtml(bgImage)}" alt="" aria-hidden="true">
    <img class="bg-floater f2" src="${escapeHtml(bgImage)}" alt="" aria-hidden="true">
    <img class="bg-floater f3" src="${escapeHtml(bgImage)}" alt="" aria-hidden="true">
  ` : ''}

  <div class="left-col">
    <div class="header">
      <span class="badge" aria-hidden="true">
        <i class="material-icons">play_circle</i>
      </span>
      <div class="heading">
        <div class="title" role="heading" aria-level="2">${escapeHtml(titleText)}</div>
        ${subtitleTxt ? `<div class="subtitle">${escapeHtml(subtitleTxt)}</div>` : ''}
      </div>
    </div>

    <div class="video-frame">
      ${embedUrl ? `
        <iframe
          src="${embedUrl}"
          title="${escapeHtml(titleText) || 'Video de YouTube'}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen></iframe>
      ` : `
        <div class="video-fallback">
          <span>No se pudo cargar el video. Verificá la URL de YouTube.</span>
        </div>
      `}
    </div>
  </div>

  <div class="body">
    ${paragraphsHtml || `<p>${escapeHtml(bodyText)}</p>`}
  </div>

  <button class="more" type="button" aria-expanded="false">
    <span class="more-label">más…</span>
    <i class="material-icons">expand_more</i>
  </button>

</div>
`;

    this._initMobileOverflow();
  }

  _initMobileOverflow() {
    const root    = this.shadowRoot;
    const wrap    = root.querySelector('.wrap');
    const body    = root.querySelector('.body');
    const moreBtn = root.querySelector('.more');
    if (!wrap || !body || !moreBtn) return;

    const moreLabel = moreBtn.querySelector('.more-label');
    const moreIcon  = moreBtn.querySelector('i');
    const mql       = window.matchMedia('(max-width: 767px)');

    const updateButton = () => {
      const expanded = wrap.classList.contains('is-expanded');
      if (!mql.matches) {
        moreBtn.classList.remove('is-visible');
        return;
      }
      if (expanded) {
        moreBtn.classList.add('is-visible');
        moreLabel.textContent = 'menos';
        moreIcon.textContent = 'expand_less';
        moreBtn.setAttribute('aria-expanded', 'true');
        return;
      }
      const overflowing = body.scrollHeight > body.clientHeight + 2;
      moreBtn.classList.toggle('is-visible', overflowing);
      moreLabel.textContent = 'más…';
      moreIcon.textContent = 'expand_more';
      moreBtn.setAttribute('aria-expanded', 'false');
    };

    moreBtn.addEventListener('click', () => {
      wrap.classList.toggle('is-expanded');
      requestAnimationFrame(updateButton);
    });

    const ro = new ResizeObserver(updateButton);
    ro.observe(body);
    ro.observe(wrap);
    this._ro = ro;

    const onMqlChange = () => {
      if (!mql.matches) wrap.classList.remove('is-expanded');
      updateButton();
    };
    if (mql.addEventListener) mql.addEventListener('change', onMqlChange);
    else if (mql.addListener) mql.addListener(onMqlChange);

    window.addEventListener('resize', updateButton);
    window.addEventListener('load', updateButton);
    this._onResize = updateButton;

    requestAnimationFrame(() => requestAnimationFrame(updateButton));
    setTimeout(updateButton, 250);
    setTimeout(updateButton, 1000);
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('load', this._onResize);
    }
  }

  _extractYoutubeId(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /\/embed\/([a-zA-Z0-9_-]{11})/,
      /\/shorts\/([a-zA-Z0-9_-]{11})/,
      /\/live\/([a-zA-Z0-9_-]{11})/
    ];
    for (const re of patterns) {
      const m = trimmed.match(re);
      if (m) return m[1];
    }
    return '';
  }
}

customElements.define('youtube-glass-card', YoutubeGlassCard);
