/**
 * <misa-card>
 * ─────────────────────────────────────────────────────────────
 * Web Component (Custom Element, Shadow DOM) para el flyer de
 * misa. Todo el contenido (título, textos, imágenes, fecha) se
 * pasa por atributos/propiedades. Los efectos visuales
 * (estrellas, partículas, orbes, glasmorfismo, shimmer) se
 * mantienen intactos. Los colores se controlan con el atributo
 * `theme`, sin tocar el resto del CSS.
 *
 * USO BÁSICO
 * ─────────────────────────────────────────────────────────────
 * <misa-card
 *   theme="dorado"
 *   parish-name="Parroquia San Luis Gonzaga · Villa Elisa"
 *   title="MISA"
 *   subtitle="Para orar por enfermos y afligidos"
 *   logo-src="./img/misa2.png"
 *   medal-src="./img/medalla3.png"
 *   photo-src="/img-cards/misa-foto.jpg"
 *   verse-text="El Señor sostiene a los que caen y levanta a los que están agobiados"
 *   verse-ref="Salmo 145,14"
 *   day="02" month="Ago" year="2026"
 *   day-name="Domingo" hour="19hs" hour-sub="En punto"
 *   cta-text="✦ Estás invitado · Ven a sanar ✦"
 *   footer-text="Parroquia San Luis Gonzaga — Villa Elisa, La Plata"
 * ></misa-card>
 *
 * También se puede asignar por propiedad JS (útil desde React/Vue):
 *   const el = document.querySelector('misa-card');
 *   el.verseText = 'Otro versículo...';
 *   el.theme = 'esperanza';
 *
 * OCULTAMIENTO / LANZAMIENTO AUTOMÁTICO POR FECHA-HORA
 * ─────────────────────────────────────────────────────────────
 * <misa-card
 *   show-after="2026-07-28T00:00:00"
 *   hide-after="2026-08-03T19:00:00"
 *   ...
 * ></misa-card>
 *
 * `show-after` → la card permanece oculta hasta esa fecha/hora
 *                (útil como "fecha de lanzamiento"), y aparece
 *                sola en el momento justo, sin recargar la página.
 * `hide-after` → la card deja de mostrarse apenas se cumple esa
 *                fecha/hora.
 * Se pueden usar juntos (ventana de vigencia), por separado, o
 * ninguno (siempre visible). Formato: "YYYY-MM-DDTHH:mm" (hora local).
 *
 * TEMAS DISPONIBLES
 * ─────────────────────────────────────────────────────────────
 *   dorado      → azul marino + dorado (original / Virgen-Santísimo), fondo oscuro
 *   esperanza   → verde + dorado (Tiempo Ordinario), fondo oscuro
 *   pasion      → granate + carmesí (Cuaresma / Semana Santa), fondo oscuro
 *   adviento    → violeta + lila (Adviento), fondo oscuro
 *   pureza      → azul mariano + plata (fiestas marianas), fondo oscuro
 *   luz-calida  → crema/marfil + azul marino + bronce, fondo CLARO
 */

const THEMES = new Set(['dorado', 'esperanza', 'pasion', 'adviento', 'pureza', 'luz-calida']);

const ATTR_MAP = {
  'theme': 'theme',
  'parish-name': 'parishName',
  'title': 'title',
  'subtitle': 'subtitle',
  'logo-src': 'logoSrc',
  'medal-src': 'medalSrc',
  'photo-src': 'photoSrc',
  'photo-alt': 'photoAlt',
  'verse-text': 'verseText',
  'verse-ref': 'verseRef',
  'day': 'day',
  'day-name': 'dayName',
  'month': 'month',
  'year': 'year',
  'hour': 'hour',
  'hour-sub': 'hourSub',
  'cta-text': 'ctaText',
  'footer-text': 'footerText',
};

const DEFAULTS = {
  theme: 'dorado',
  parishName: 'Parroquia San Luis Gonzaga · Villa Elisa',
  title: 'MISA',
  subtitle: 'Para orar por enfermos y afligidos',
  logoSrc: '',
  medalSrc: '',
  photoSrc: '',
  photoAlt: 'Fotografía de la misa',
  verseText: 'El Señor sostiene a los que caen y levanta a los que están agobiados',
  verseRef: 'Salmo 145,14',
  day: '02',
  dayName: 'Domingo',
  month: 'Ago',
  year: '2026',
  hour: '19hs',
  hourSub: 'En punto',
  ctaText: '✦ Estás invitado · Ven a sanar ✦',
  footerText: 'Parroquia San Luis Gonzaga — Villa Elisa, La Plata',
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class MisaCard extends HTMLElement {
  static get observedAttributes() {
    return [...Object.keys(ATTR_MAP), 'hide-after', 'show-after'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
  }

  // ---- Propiedades JS reflejadas a atributos (para uso tipo "prop") ----
  _defineAccessors() {
    Object.entries(ATTR_MAP).forEach(([attr, prop]) => {
      if (Object.prototype.hasOwnProperty.call(this, prop)) return;
      Object.defineProperty(this, prop, {
        get() {
          return this.getAttribute(attr) ?? DEFAULTS[prop] ?? '';
        },
        set(value) {
          if (value === null || value === undefined) {
            this.removeAttribute(attr);
          } else {
            this.setAttribute(attr, value);
          }
        },
      });
    });
  }

  connectedCallback() {
    this._defineAccessors();
    if (!this.hasAttribute('theme') || !THEMES.has(this.getAttribute('theme'))) {
      this.setAttribute('theme', DEFAULTS.theme);
    }
    if (this._checkVisibility()) {
      this._render();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'hide-after' || name === 'show-after') {
      const visible = this._checkVisibility();
      if (visible && !this._rendered) this._render();
      return;
    }
    if (name === 'theme' && !THEMES.has(newVal)) {
      this.setAttribute('theme', DEFAULTS.theme);
      return;
    }
    if (this._rendered) this._render();
  }

  /**
   * Revisa show-after / hide-after. Oculta el host si todavía no
   * llegó la fecha de lanzamiento o si ya pasó la de vencimiento,
   * y programa un único timeout para volver a chequear justo en
   * el próximo momento relevante (sin necesidad de recargar).
   */
  _checkVisibility() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }

    const now = Date.now();
    const showAttr = this.getAttribute('show-after');
    const hideAttr = this.getAttribute('hide-after');
    const showDate = showAttr ? new Date(showAttr) : null;
    const hideDate = hideAttr ? new Date(hideAttr) : null;
    const showValid = showDate && !isNaN(showDate.getTime());
    const hideValid = hideDate && !isNaN(hideDate.getTime());

    let visible = true;
    let nextCheckMs = null;

    if (showValid && now < showDate.getTime()) {
      visible = false;
      nextCheckMs = showDate.getTime() - now;
    } else if (hideValid && now >= hideDate.getTime()) {
      visible = false;
    } else if (hideValid) {
      nextCheckMs = hideDate.getTime() - now;
    }

    this.style.display = visible ? '' : 'none';

    if (nextCheckMs !== null) {
      const MAX_DELAY = 2147483647; // límite de setTimeout (~24.8 días)
      this._hideTimeout = setTimeout(() => this._checkVisibility(), Math.min(nextCheckMs, MAX_DELAY));
    }

    return visible;
  }

  _val(prop) {
    const attr = Object.keys(ATTR_MAP).find((a) => ATTR_MAP[a] === prop);
    return this.getAttribute(attr) || DEFAULTS[prop] || '';
  }

  _render() {
    const parishName = escapeHtml(this._val('parishName'));
    const title = escapeHtml(this._val('title'));
    const subtitle = escapeHtml(this._val('subtitle'));
    const logoSrc = this._val('logoSrc');
    const medalSrc = this._val('medalSrc');
    const photoSrc = this._val('photoSrc');
    const photoAlt = escapeHtml(this._val('photoAlt'));
    const verseText = escapeHtml(this._val('verseText'));
    const verseRef = escapeHtml(this._val('verseRef'));
    const day = escapeHtml(this._val('day'));
    const dayName = escapeHtml(this._val('dayName'));
    const month = escapeHtml(this._val('month'));
    const year = escapeHtml(this._val('year'));
    const hour = escapeHtml(this._val('hour'));
    const hourSub = escapeHtml(this._val('hourSub'));
    const ctaText = escapeHtml(this._val('ctaText'));
    const footerText = escapeHtml(this._val('footerText'));

    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <div class="scene">
        <div class="layout">
          <div class="glass-card">
            <div class="card-stars" id="cardStars"></div>
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="orb orb-3"></div>
            <div class="card-shimmer"></div>

            <div class="card-content">
              <div class="flyer-header">
                <div class="flyer-header-main">
                  ${parishName ? `<p class="parish-name">${parishName}</p>` : ''}
                  <div class="flyer-title-row">
                    ${logoSrc ? `<img class="header-logo" src="${logoSrc}" alt="" onerror="this.style.display='none'"/>` : ''}
                    <h1 class="misa-title">${title}</h1>
                    ${medalSrc ? `<img class="header-medal" src="${medalSrc}" alt="" onerror="this.style.display='none'"/>` : ''}
                  </div>
                  ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
                </div>
                <div class="divider">
                  <div class="divider-line"></div>
                  <span class="divider-star">✦</span>
                  <div class="divider-line"></div>
                </div>
              </div>

              <div class="flyer-body">
                ${photoSrc ? `
                <div class="flyer-photo">
                  <div class="photo-frame">
                    <img src="${photoSrc}" alt="${photoAlt}" onerror="this.parentElement.style.display='none'"/>
                    <div class="photo-overlay"></div>
                  </div>
                </div>` : ''}

                <div class="flyer-text">
                  <div class="verse-block">
                    <p class="verse-text">${verseText}</p>
                    ${verseRef ? `<p class="verse-ref">— ${verseRef}</p>` : ''}
                  </div>

                  <div class="date-block">
                    <div class="date-item">
                      <div class="date-label">Día</div>
                      <div class="date-value">${day}</div>
                      <div class="date-sub">${dayName}</div>
                    </div>
                    <div class="date-sep"></div>
                    <div class="date-item">
                      <div class="date-label">Mes</div>
                      <div class="date-value">${month}</div>
                      <div class="date-sub">${year}</div>
                    </div>
                    <div class="date-sep"></div>
                    <div class="date-item">
                      <div class="date-label">Hora</div>
                      <div class="date-value">${hour}</div>
                      <div class="date-sub">${hourSub}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flyer-footer">
                <div class="cta-button">${ctaText}</div>
                <p class="villa-elisa">${footerText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._rendered = true;
    this._spawnStarsAndParticles();
    this._attachTilt();
  }

  _attachTilt() {
    if (this._tiltCleanup) this._tiltCleanup();
    const card = this.shadowRoot.querySelector('.glass-card');
    if (!card) return;
    // Solo en dispositivos con mouse real; en touch no aplica.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const maxTilt = 7; // grados máximos de inclinación
    const springBack = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
    const following = 'transform 0.12s ease-out';
    card.style.transition = springBack;

    const onEnter = () => {
      card.style.transition = following;
    };
    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;
      card.style.transform = `perspective(1400px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012,1.012,1.012)`;
    };
    const onLeave = () => {
      card.style.transition = springBack;
      card.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);

    this._tiltCleanup = () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      this._tiltCleanup = null;
    };
  }

  disconnectedCallback() {
    if (this._tiltCleanup) this._tiltCleanup();
    if (this._hideTimeout) clearTimeout(this._hideTimeout);
  }

  _spawnStarsAndParticles() {
    const cs = this.shadowRoot.getElementById('cardStars');
    if (!cs) return;
    cs.innerHTML = '';
    for (let i = 0; i < 70; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sz = Math.random() * 2 + 0.3;
      s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random() * 100}%;left:${Math.random() * 100}%;--card-star-op:${(Math.random() * 0.6 + 0.15).toFixed(2)};--card-star-dur:${(Math.random() * 3 + 2).toFixed(1)}s;animation-delay:${(Math.random() * 6).toFixed(1)}s;`;
      cs.appendChild(s);
    }
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const sz = Math.random() * 2.5 + 0.6;
      p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;bottom:${Math.random() * 5}%;--card-p-fdur:${(Math.random() * 6 + 5).toFixed(1)}s;--card-p-fdelay:${(Math.random() * 8).toFixed(1)}s;--card-p-fx:${Math.round((Math.random() - 0.5) * 65)}px;`;
      cs.appendChild(p);
    }
  }
}

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  /* ═══════════ TEMAS DE COLOR (solo variables, cambian por :host([theme]) ) ═══════════ */
  :host, :host([theme="dorado"]) {
    --accent-rgb: 255,210,80;
    --bg1-rgb: 8,18,60;
    --bg2-rgb: 12,10,38;
    --bg3-rgb: 18,8,48;
    --orb1-rgb: 30,60,200;
    --orb2-rgb: 140,50,220;
    --orb3-rgb: 255,160,40;
    --text-rgb: 255,255,255;
    --star-rgb: 255,255,255;
    --title-glow-alpha: 0.837;
    --panel-bg-rgb: 255,210,80;
    --panel-bg-alpha-1: 0.15;
    --panel-bg-alpha-2: 0.18;
    --panel-bg-alpha-3: 0.12;
    --orb-alpha-1: 0.22;
    --orb-alpha-2: 0.15;
    --orb-alpha-3: 0.1;
    --ambient-glow-rgb: 30,20,120;
    --ambient-glow-alpha: 0.25;
  }
  :host([theme="luz-calida"]) {
    --accent-rgb: 148,98,42;
    --bg1-rgb: 251,246,234;
    --bg2-rgb: 240,223,190;
    --bg3-rgb: 212,182,134;
    --orb1-rgb: 200,142,80;
    --orb2-rgb: 172,120,64;
    --orb3-rgb: 214,160,66;
    --text-rgb: 20,34,66;
    --star-rgb: 148,98,42;
    --title-glow-alpha: 0.18;
    --panel-bg-rgb: 255,255,255;
    --panel-bg-alpha-1: 0.6;
    --panel-bg-alpha-2: 0.85;
    --panel-bg-alpha-3: 0.6;
    --orb-alpha-1: 0.32;
    --orb-alpha-2: 0.24;
    --orb-alpha-3: 0.2;
    --ambient-glow-rgb: 190,140,80;
    --ambient-glow-alpha: 0.22;
  }
  :host([theme="esperanza"]) {
    --accent-rgb: 210,196,90;
    --bg1-rgb: 6,34,28;
    --bg2-rgb: 8,26,22;
    --bg3-rgb: 10,40,32;
    --orb1-rgb: 30,140,90;
    --orb2-rgb: 90,180,120;
    --orb3-rgb: 210,196,90;
  }
  :host([theme="pasion"]) {
    --accent-rgb: 224,150,110;
    --bg1-rgb: 40,8,14;
    --bg2-rgb: 26,6,10;
    --bg3-rgb: 46,10,20;
    --orb1-rgb: 160,20,30;
    --orb2-rgb: 200,60,40;
    --orb3-rgb: 224,150,110;
  }
  :host([theme="adviento"]) {
    --accent-rgb: 205,175,230;
    --bg1-rgb: 26,10,50;
    --bg2-rgb: 18,8,38;
    --bg3-rgb: 34,10,56;
    --orb1-rgb: 90,40,160;
    --orb2-rgb: 150,80,210;
    --orb3-rgb: 205,175,230;
  }
  :host([theme="pureza"]) {
    --accent-rgb: 210,225,240;
    --bg1-rgb: 8,26,60;
    --bg2-rgb: 10,18,42;
    --bg3-rgb: 14,30,66;
    --orb1-rgb: 40,90,190;
    --orb2-rgb: 80,140,220;
    --orb3-rgb: 210,225,240;
  }

  .scene {
    width: 100%;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 0;
    position: relative;
  }

  .layout {
    position: relative;
    z-index: 10;
    width: 95vw;
    max-width: 720px;
  }

  .glass-card {
    width: 100%;
    min-height: 96vh;
    background:
      linear-gradient(145deg,
        rgba(var(--bg1-rgb),0.97) 0%,
        rgba(var(--bg2-rgb),0.97) 45%,
        rgba(var(--bg3-rgb),0.97) 100%);
    border: 1.5px solid rgba(var(--accent-rgb),0.4);
    border-radius: 26px;
    padding: 2rem 1.8rem;
    box-shadow:
      0 24px 60px rgba(0,0,0,0.65),
      0 8px 24px rgba(0,0,0,0.45),
      0 0 60px rgba(var(--ambient-glow-rgb),var(--ambient-glow-alpha)),
      inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    animation: cardIn 0.9s ease-out forwards;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transform-style: preserve-3d;
    will-change: transform;
    transition: box-shadow 0.45s ease;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .glass-card::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(to right, transparent, rgba(var(--accent-rgb),0.7), transparent);
    border-radius: 50%;
  }

  .card-stars { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 26px; z-index: 0; }
  .star {
    position: absolute; border-radius: 50%; background: rgb(var(--star-rgb));
    animation: twinkle var(--card-star-dur) ease-in-out infinite alternate;
    opacity: var(--card-star-op);
  }
  @keyframes twinkle {
    from { opacity: var(--card-star-op); }
    to   { opacity: calc(var(--card-star-op)*0.1); }
  }
  .particle {
    position: absolute; border-radius: 50%; background: rgba(var(--accent-rgb),0.75);
    animation: float-up var(--card-p-fdur) ease-in infinite var(--card-p-fdelay);
  }
  @keyframes float-up {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    15%  { opacity: 0.9; }
    100% { transform: translateY(-96vh) translateX(var(--card-p-fx)); opacity: 0; }
  }

  .orb {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; z-index: 0;
    animation: orb-pulse var(--card-orb-pd,5s) ease-in-out infinite alternate;
  }
  .orb-1 { width:260px;height:260px;background:rgba(var(--orb1-rgb),var(--orb-alpha-1));top:-10%;left:-15%; --card-orb-pd:5s; }
  .orb-2 { width:200px;height:200px;background:rgba(var(--orb2-rgb),var(--orb-alpha-2));bottom:5%;right:-10%; --card-orb-pd:7s; animation-delay:2s; }
  .orb-3 { width:150px;height:150px;background:rgba(var(--orb3-rgb),var(--orb-alpha-3));top:45%;left:40%; --card-orb-pd:6s; animation-delay:1s; }
  @keyframes orb-pulse {
    from { transform: scale(1); opacity: 0.3; }
    to   { transform: scale(1.3); opacity: 0.6; }
  }

  .card-shimmer {
    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: linear-gradient(45deg, transparent 30%, rgba(var(--accent-rgb),0.03) 50%, transparent 70%);
    animation: shimmer 10s linear infinite; pointer-events: none; z-index: 0;
  }
  @keyframes shimmer {
    from { transform: translateX(-100%) rotate(45deg); }
    to   { transform: translateX(100%) rotate(45deg); }
  }

  .card-content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }

  .parish-name {
    font-family: 'Cinzel', serif; font-size: 0.78rem;
    letter-spacing: 0.18em; color: rgba(var(--accent-rgb),0.837);
    text-align: center; text-transform: uppercase; margin-bottom: 0.25rem;
  }
  .misa-title {
    font-family: 'Cinzel', serif; font-size: 3rem; font-weight: 600;
    color: rgb(var(--text-rgb)); text-align: center; line-height: 1; letter-spacing: 0.07em;
    text-shadow: 0 0 40px rgba(var(--accent-rgb),var(--title-glow-alpha)), 0 2px 6px rgba(0,0,0,0.35);
    margin: 0.35rem 0 0.25rem;
  }
  .subtitle {
    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
    font-style: italic; color: rgba(var(--text-rgb),0.837);
    text-align: center; margin-bottom: 0.8rem;
  }

  .flyer-header-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
  .flyer-title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }
  .header-logo {
    height: 48px;
    width: auto;
    display: block;
    filter: drop-shadow(0 4px 14px rgba(var(--accent-rgb),0.28));
  }
  .header-medal { display: none; }

  .divider { display: flex; align-items: center; gap: 0.7rem; margin: 0.6rem 0; }
  .divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(var(--accent-rgb),0.38), transparent); }
  .divider-star { color: rgba(var(--accent-rgb),0.837); font-size: 0.82rem; }

  .photo-frame {
    border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(var(--accent-rgb),0.2);
    margin: 0.7rem auto; position: relative;
    box-shadow: 0 12px 36px rgba(0,0,0,0.55), 0 0 18px rgba(var(--orb3-rgb),0.06), inset 0 1px 0 rgba(255,255,255,0.04);
    flex-shrink: 0;
    width: 75%;
    max-width: 420px;
  }
  .photo-frame img { width: 100%; height: 340px; object-fit: cover; display: block; filter: brightness(0.83) contrast(1.06); }
  .photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(var(--bg1-rgb),0.7) 0%, transparent 55%); }

  .verse-block {
    background: rgba(var(--panel-bg-rgb),var(--panel-bg-alpha-1));
    border: 1px solid rgba(var(--accent-rgb),0.4);
    border-radius: 12px; padding: 0.35rem 0.9rem;
    margin: 0.45rem 0; position: relative; flex-shrink: 0;
  }
  .verse-block::before {
    content: '"'; position: absolute;
    left: 0.75rem;
    font-family: 'Cormorant Garamond', serif; font-size: 2.2rem;
    color: rgba(var(--accent-rgb),0.445); line-height: 1;
  }
  .verse-text {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 1.45rem; color: rgba(var(--text-rgb),0.86);
    line-height: 1.05;
    padding-top: 0;
    text-align: center;
  }
  .verse-ref {
    font-family: 'Cinzel', serif; font-size: 1rem;
    color: rgba(var(--accent-rgb),0.6); text-align: center;
    margin-top: 0.02rem; margin-bottom: 0;
    letter-spacing: 0.1em;
  }

  .date-block { display: flex; align-items: center; justify-content: center; gap: 1.2rem; margin: 1rem 0 0.75rem; flex-shrink: 0; }
  .date-item { text-align: center; }
  .date-label { font-family: 'Cinzel', serif; font-size: 0.9rem; letter-spacing: 0.14em; color: rgba(var(--accent-rgb),0.58); text-transform: uppercase; margin-bottom: 0.12rem; }
  .date-value { font-family: 'Cinzel', serif; font-size: 1.6rem; font-weight: 600; color: rgb(var(--text-rgb)); text-shadow: 0 0 20px rgba(var(--accent-rgb),0.5); line-height: 1; }
  .date-sub { font-family: 'Cormorant Garamond', serif; font-size: 0.9rem; color: rgba(var(--text-rgb),0.75); font-style: italic; }
  .date-sep { width: 1px; height: 40px; background: linear-gradient(to bottom, transparent, rgba(var(--accent-rgb),0.3), transparent); }

  .cta-button {
    width: 100%; padding: 0.85rem;
    background: linear-gradient(135deg, rgba(var(--panel-bg-rgb),var(--panel-bg-alpha-2)), rgba(var(--panel-bg-rgb),var(--panel-bg-alpha-3)));
    border: 1.5px solid rgba(var(--accent-rgb),0.42); border-radius: 12px;
    font-family: 'Cinzel', serif; font-size: 0.78rem;
    letter-spacing: 0.15em; color: rgba(var(--accent-rgb),0.95);
    text-align: center; margin-top: 0.8rem; flex-shrink: 0;
    box-shadow: 0 0 24px rgba(var(--accent-rgb),0.1), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative; overflow: hidden;
  }
  .cta-button::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: btn-sh 4s ease-in-out infinite;
  }
  @keyframes btn-sh {
    0%,100% { transform: translateX(-130%); }
    50%      { transform: translateX(130%); }
  }

  .villa-elisa {
    font-family: 'Cormorant Garamond', serif; font-size: 0.9rem;
    color: rgba(var(--text-rgb),0.55); text-align: center;
    margin-top: 0.7rem; font-style: italic; flex-shrink: 0;
  }

  @media (min-width: 1024px) {
    .scene { min-height: 100vh; padding: 1rem 0; align-items: center; }
    .layout { width: 95vw; max-width: 1240px; }
    .layout > .glass-card { min-height: auto; height: min(calc(100vh - 2rem), 720px); padding: 1.6rem 2.4rem; border-radius: 22px; }
    .layout > .glass-card > .card-content { display: grid; grid-template-rows: auto 1fr auto; gap: 0.9rem; height: 100%; justify-content: stretch; }
    .flyer-header { text-align: center; }
    .flyer-title-row { gap: 1.2rem; }
    .header-logo { height: 110px; flex-shrink: 0; }
    .header-medal { display: block; height: 110px; width: auto; flex-shrink: 0; filter: drop-shadow(0 4px 14px rgba(var(--accent-rgb),0.28)); }
    .parish-name { font-size: 0.82rem; letter-spacing: 0.22em; margin-bottom: 0.15rem; }
    .misa-title { font-size: 3.6rem; line-height: 1; margin: 0.1rem 0; letter-spacing: 0.12em; }
    .subtitle { font-size: 1.55rem; margin-bottom: 0.45rem; }
    .flyer-header .divider { margin: 0.3rem auto 0; max-width: 55%; }
    .flyer-body { display: grid; grid-template-columns: 40% 1fr; gap: 2.4rem; align-items: center; min-height: 0; }
    .flyer-photo { display: flex; justify-content: center; align-items: center; height: 100%; min-height: 0; }
    .photo-frame { width: 100%; max-width: 100%; margin: 0; height: 100%; max-height: 410px; border-radius: 12px; }
    .photo-frame img { width: 100%; height: 100%; max-height: 410px; object-fit: cover; }
    .flyer-text { display: flex; flex-direction: column; justify-content: center; gap: 1.4rem; height: 100%; min-height: 0; }
    .verse-block { border-radius: 14px; padding: 1.4rem 1.8rem 1.2rem; margin: 0; }
    .verse-block::before { font-size: 3.4rem; left: 1.2rem; top: 0.2rem; }
    .verse-text { font-size: 2.1rem; line-height: 1.2; text-align: center; padding-top: 0.3rem; color: rgba(var(--text-rgb),0.92); }
    .verse-ref { font-size: 1rem; text-align: center; margin-top: 0.7rem; letter-spacing: 0.18em; color: rgba(var(--accent-rgb),0.78); }
    .date-block { margin: 0; padding: 1.3rem 0 0; border-top: 1px solid rgba(var(--accent-rgb),0.2); gap: 2.6rem; justify-content: center; }
    .date-label { font-size: 1rem; letter-spacing: 0.22em; margin-bottom: 0.3rem; }
    .date-value { font-size: 2.7rem; }
    .date-sub { font-size: 1.1rem; }
    .date-sep { height: 60px; }
    .flyer-footer { text-align: center; }
    .cta-button { margin: 0 auto; padding: 0.85rem 1.2rem; font-size: 0.82rem; max-width: 560px; }
    .villa-elisa { margin-top: 0.45rem; font-size: 0.85rem; }
  }

  @media (min-width: 1024px) and (max-height: 820px) {
    .layout > .glass-card { height: min(calc(100vh - 1.5rem), 720px); padding: 1.2rem 2.2rem; }
    .layout > .glass-card > .card-content { gap: 0.7rem; }
    .header-logo, .header-medal { height: 90px; }
    .parish-name { font-size: 0.78rem; }
    .misa-title { font-size: 3rem; }
    .subtitle { font-size: 1.35rem; }
    .photo-frame, .photo-frame img { max-height: 370px; }
    .verse-text { font-size: 1.85rem; }
    .verse-ref { font-size: 0.95rem; margin-top: 0.55rem; }
    .date-value { font-size: 2.15rem; }
    .date-block { padding-top: 1rem; gap: 2.1rem; }
    .date-label { font-size: 0.88rem; }
    .date-sub { font-size: 0.98rem; }
    .date-sep { height: 50px; }
    .flyer-body { gap: 2rem; }
    .cta-button { padding: 0.75rem 1rem; }
  }

  @media (min-width: 1440px) {
    .layout { max-width: 1280px; }
    .misa-title { font-size: 4rem; }
    .verse-text { font-size: 2.3rem; }
    .date-value { font-size: 3.1rem; }
    .date-label { font-size: 1.05rem; }
    .date-sub { font-size: 1.15rem; }
    .date-sep { height: 66px; }
  }

  @media (max-width: 768px) {
    .verse-text { font-size: 1.18rem; line-height: 1.2; }
  }

  /* Ajustes de contraste específicos del tema claro:
     el acento bronce necesita más peso frente al fondo crema
     que el que necesitaba el dorado frente al azul marino. */
  :host([theme="luz-calida"]) .parish-name { color: rgba(var(--accent-rgb),1); }
  :host([theme="luz-calida"]) .date-label { color: rgba(var(--accent-rgb),0.85); }
  :host([theme="luz-calida"]) .verse-ref { color: rgba(var(--accent-rgb),0.95); }
  :host([theme="luz-calida"]) .divider-star { color: rgba(var(--accent-rgb),1); }
  :host([theme="luz-calida"]) .divider-line { background: linear-gradient(to right, transparent, rgba(var(--accent-rgb),0.55), transparent); }
  :host([theme="luz-calida"]) .cta-button { color: rgba(var(--accent-rgb),1); }
  :host([theme="luz-calida"]) .photo-frame {
    border: 1px solid rgba(var(--accent-rgb),0.35);
    box-shadow: 0 12px 30px rgba(90,60,20,0.25), inset 0 1px 0 rgba(255,255,255,0.5);
  }
  :host([theme="luz-calida"]) .glass-card {
    border-width: 2px;
  }
  :host([theme="luz-calida"]) .date-sep {
    background: linear-gradient(to bottom, transparent, rgba(var(--accent-rgb),0.45), transparent);
  }
`;

customElements.define('misa-card', MisaCard);