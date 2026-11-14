/**
 * <video-frame-navidad> — Web Component
 * Video enmarcado con el marco navideño (nav.png).
 * El video se ve por el hueco del marco (se adapta a su forma); el marco va siempre encima.
 * Mismo ancho que el componente de Tradiciones, pero la tarjeta es un poco más alta.
 *
 * ATRIBUTOS:
 *   video         — URL del video (mp4 recomendado)
 *   titulo        — título (si no se pasa, no se muestra)
 *   fecha         — texto del chip superior, ej "27 de Octubre" (si no se pasa, no se muestra)
 *   poster        — imagen poster del video (opcional).
 *                   Con poster, el video NO se descarga hasta que el usuario
 *                   toca play (ideal para varios videos en una misma página).
 *                   Sin poster, se carga solo metadata cuando la tarjeta entra
 *                   en pantalla, para que el navegador muestre el primer frame.
 *   frame         — URL de la imagen del marco (default: "./nav.png")
 *   frame-ratio   — ancho/alto de la tarjeta (default "1023/1640"; la imagen mide 1023x1537,
 *                   se estira apenas en alto para que la tarjeta quede más alta)
 *   inset-top / inset-right / inset-bottom / inset-left
 *                 — % del hueco del video (defaults medidos sobre nav.png)
 *   autoplay      — el video arranca solo cuando la tarjeta entra en pantalla y se
 *                   pausa al salir (ahorra CPU con varias tarjetas). Funciona con o
 *                   sin poster. Por política de los navegadores arranca SIN sonido;
 *                   aparece un botón de parlante (arriba a la derecha del video) para
 *                   activar/desactivar el sonido sin pausar. Las tarjetas autoplay no
 *                   se pausan entre sí.
 *   loop          — repite el video al terminar (útil con autoplay)
 *   muted         — fuerza silencio siempre (y oculta el botón de parlante)
 *   hide-mobile   — oculta el componente en pantallas < 768px
 *   zoom          — muestra un botón de lupa (arriba a la izquierda del video) que abre
 *                   el video ampliado sobre un fondo oscuro con polvo mágico. Continúa
 *                   desde donde estaba la tarjeta y al cerrar la tarjeta retoma desde
 *                   donde quedó el zoom. Se cierra con la ✕, tocando el fondo o con Esc.
 *                   Sin este atributo no aparece nada nuevo (todo sigue igual).
 *   zoom-paused   — el zoom se abre en pausa (por defecto arranca reproduciendo, con
 *                   sonido salvo que haya `muted`). No depende de `autoplay`, que solo
 *                   controla la tarjeta: sin `autoplay` la tarjeta ya queda en pausa
 *                   hasta que el usuario toca play.
 *   zoom-frame    — URL de un PNG de marco para el video ampliado (opcional). Sin él, el
 *                   video se ve limpio, con su proporción original y un borde dorado.
 *   zoom-frame-ratio / zoom-inset-top / -right / -bottom / -left
 *                 — proporción y hueco (%) del marco de zoom. Si no se pasan, usa los de
 *                   `frame-ratio` e `inset-*` de la tarjeta (sirve si es el mismo marco).
 *   zoom-bg       — URL de una imagen de fondo (wallpaper) para el zoom (opcional). Va
 *                   detrás de todo: del velo oscuro, del polvo y del video. Se ajusta
 *                   cubriendo la pantalla. A diferencia de `zoom-frame`, no tapa el video.
 *                   Es el wallpaper para mobile y desktop a la vez.
 *   zoom-bg-mobile / zoom-bg-desktop
 *                 — wallpaper propio para cada tipo de pantalla (mobile = menos de 768px,
 *                   el mismo corte que `hide-mobile`). Mandan sobre `zoom-bg`. Si pasás
 *                   solo uno de los dos (y no hay `zoom-bg`), se usa en las dos pantallas.
 *                   Para NO mostrar wallpaper en una de ellas, ponele el valor `none`:
 *                   zoom-bg-mobile="none" zoom-bg-desktop="./fondo.jpg"
 *   zoom-veil     — oscuridad del velo sobre el fondo, de 0 (sin velo) a 1 (el original).
 *                   Default: 1 sin `zoom-bg`; 0.6 con `zoom-bg`, para que el wallpaper se vea.
 *   zoom-float    — URL de un PNG que flota de forma caótica por todo el fondo del zoom,
 *                   junto al polvo mágico (opcional). Gira, cambia de rumbo y recorre toda
 *                   la pantalla. Sin él, solo hay polvo.
 *                   Acepta varios PNG separados por espacios (o espacios y comas):
 *                   zoom-float="./navidad/candy.png ./navidad/vela.png"
 *                   (si el nombre de un archivo tiene espacios, escribilos como %20).
 *   zoom-float-count — cuántas copias vuelan a la vez EN TOTAL (default 8, o la cantidad
 *                   de PNG si son más de 8; máximo 80). Con varios PNG se reparten en
 *                   partes iguales: 12 copias con 3 PNG = 4 de cada uno. Si pedís menos
 *                   copias que PNG, solo aparecen los primeros.
 *   zoom-float-size  — tamaño en px del lado mayor de cada copia (default 56); cada
 *                   copia varía un poco de tamaño para dar profundidad.
 *
 * Si no hay ni `titulo` ni `fecha`, no aparece nada sobre el video
 * (ni chip, ni título, ni línea dorada, ni tiempo/puntos).
 *
 * USO:
 *   <script src="video-frame-navidad.js"></script>
 *   <video-frame-navidad video="./27.mp4"></video-frame-navidad>
 *   <video-frame-navidad video="./27.mp4" fecha="27 de Octubre" titulo="El Regreso de las Mascotas"></video-frame-navidad>
 */
(() => {
const _tpl = document.createElement('template');
_tpl.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    /* El host mide como máximo lo mismo que la tarjeta (320px). Así, dentro de
       un contenedor flex, las tarjetas quedan pegadas (sin aire lateral) y si
       falta lugar se achican parejo en vez de quedar centradas en una mitad. */
    flex: 0 1 320px;
    width: 100%;
    max-width: 320px;
    --frame-ratio: 1023 / 1640;
    /* Hueco medido en nav.png (704x1106 px sobre 1023x1537): el video ocupa
       todo el hueco y sus bordes quedan por DEBAJO de la guirnalda (el marco
       va encima), así no hay rendijas ni se ve nada fuera del marco.
       Los % no cambian al estirar la tarjeta en alto. */
    --inset-top: 13.5%;
    --inset-right: 15.7%;
    --inset-bottom: 14.5%;
    --inset-left: 15.35%;
  }

  @media (max-width: 767px) {
    :host([hide-mobile]) { display: none !important; }
  }

  .card {
    width: 100%;
    position: relative;
    aspect-ratio: var(--frame-ratio);
    animation: cardEntrance 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    filter: drop-shadow(0 10px 34px rgba(0, 0, 0, 0.45));
    transition: transform 0.35s ease, filter 0.35s ease;
  }

  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(30px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card:hover {
    transform: translateY(-4px);
    filter: drop-shadow(0 16px 46px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 22px rgba(197, 162, 39, 0.25));
  }

  .video-wrap {
    position: absolute;
    top: var(--inset-top);
    right: var(--inset-right);
    bottom: var(--inset-bottom);
    left: var(--inset-left);
    overflow: hidden;
    background: #07140d;
    z-index: 1;
  }

  video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .card:hover video { transform: scale(1.04); }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      rgba(0,0,0,0) 45%, rgba(4,16,9,0.55) 78%, rgba(4,16,9,0.85) 100%);
    z-index: 2;
    pointer-events: none;
  }

  .frame-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
    z-index: 4;
    user-select: none;
    -webkit-user-drag: none;
  }

  /* ─── Play / Pause ─── */
  .play-btn {
    position: absolute;
    width: 15%; height: auto;
    aspect-ratio: 1;
    max-width: 56px;
    border-radius: 50%;
    border: 2px solid rgba(245, 208, 107, 0.85);
    background: rgba(15, 10, 30, 0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: top .4s cubic-bezier(.22,1,.36,1), left .4s cubic-bezier(.22,1,.36,1),
                bottom .4s cubic-bezier(.22,1,.36,1), right .4s cubic-bezier(.22,1,.36,1),
                transform .4s cubic-bezier(.22,1,.36,1), width .4s cubic-bezier(.22,1,.36,1),
                background .25s ease, border-color .25s, box-shadow .25s;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 18px rgba(197,162,39,.3), inset 0 1px 0 rgba(255,245,192,.3);
    animation: pulsePlay 2.5s ease-in-out infinite;
  }

  .play-btn.is-playing {
    top: auto; left: auto;
    bottom: calc(var(--inset-bottom) + 2%); right: calc(var(--inset-right) + 3%);
    transform: none;
    width: 9%;
    animation: none;
    box-shadow: 0 0 10px rgba(197,162,39,.25);
  }

  @keyframes pulsePlay {
    0%, 100% { box-shadow: 0 0 18px rgba(197,162,39,.3), inset 0 1px 0 rgba(255,245,192,.3); }
    50%      { box-shadow: 0 0 32px rgba(197,162,39,.55), 0 0 60px rgba(197,162,39,.15), inset 0 1px 0 rgba(255,245,192,.4); }
  }

  .play-btn:hover {
    background: rgba(197,162,39,.22);
    border-color: rgba(245,208,107,1);
    box-shadow: 0 0 40px rgba(197,162,39,.6), 0 0 80px rgba(197,162,39,.2);
  }
  .play-btn:not(.is-playing):hover { transform: translate(-50%, -50%) scale(1.12); animation: none; }
  .play-btn.is-playing:hover { transform: scale(1.12); }

  .play-icon {
    width: 0; height: 0;
    border-style: solid;
    border-width: 8px 0 8px 14px;
    border-color: transparent transparent transparent rgba(245,208,107,.95);
    margin-left: 3px;
    filter: drop-shadow(0 0 4px rgba(245,208,107,.7));
  }
  .pause-icon { display: flex; gap: 3px; }
  .pause-bar {
    width: 3px; height: 11px;
    background: rgba(245,208,107,.95);
    border-radius: 2px;
    filter: drop-shadow(0 0 3px rgba(245,208,107,.7));
  }

  /* ─── Botones de sonido (solo con autoplay) y de zoom (solo con el atributo zoom) ─── */
  .sound-btn, .zoom-btn {
    position: absolute;
    top: calc(var(--inset-top) + 2%);
    width: 9%; max-width: 34px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 1.5px solid rgba(245,208,107,.85);
    background: rgba(15,10,30,.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    z-index: 10;
    transition: background .25s ease, transform .25s ease, box-shadow .25s;
    box-shadow: 0 0 10px rgba(197,162,39,.25);
  }
  .sound-btn { right: calc(var(--inset-right) + 3%); }
  .zoom-btn  { left:  calc(var(--inset-left)  + 3%); }
  .sound-btn[hidden], .zoom-btn[hidden] { display: none !important; }
  .sound-btn:hover, .zoom-btn:hover { background: rgba(197,162,39,.28); transform: scale(1.1); }
  .sound-btn svg, .zoom-btn svg { width: 56%; height: 56%; fill: none; stroke: rgba(245,208,107,.95);
                   stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .sound-btn .ico-on { display: none; }
  .sound-btn.is-on .ico-on { display: block; }
  .sound-btn.is-on .ico-off { display: none; }
  .zoom-btn:focus-visible, .z-close:focus-visible {
    outline: 2px solid rgba(245,208,107,.95); outline-offset: 2px;
  }

  /* ─── Info (chip, título, meta): todo opcional ─── */
  .info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.85rem 1rem 1rem;
    z-index: 5;
  }

  /* Ocultos cuando no hay dato */
  .info[hidden], .overlay[hidden], .badge[hidden],
  .titulo[hidden], .gold-line[hidden], .meta[hidden] { display: none !important; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(197,162,39,.18);
    border: 1px solid rgba(245,208,107,.45);
    border-radius: 20px;
    padding: 2px 8px;
    font-family: 'Raleway', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: rgba(245,208,107,.9);
    margin-bottom: 0.4rem;
  }
  .badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(245,208,107,.9);
    animation: dotPulse 1.5s ease-in-out infinite;
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .4; transform: scale(.6); }
  }

  .titulo {
    font-family: 'Cinzel', serif;
    font-size: 0.92rem;
    font-weight: 600;
    color: #f5d06b;
    letter-spacing: .03em;
    line-height: 1.25;
    text-shadow: 0 0 20px rgba(197,162,39,.5), 0 1px 0 rgba(0,0,0,.8);
  }

  .gold-line {
    height: 1px;
    margin: 0.45rem 0 0.4rem;
    background: linear-gradient(to right, rgba(197,162,39,.9), rgba(245,208,107,.4), transparent);
  }

  .meta { display: flex; align-items: center; justify-content: space-between; }
  .meta-time {
    font-family: 'Raleway', sans-serif;
    font-size: 10px; font-weight: 300;
    color: rgba(197,162,39,.65);
    letter-spacing: 1px;
  }
  .meta-dots { display: flex; gap: 4px; }
  .meta-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: rgba(197,162,39,.45);
    transition: background .3s;
  }
  .meta-dot.active { background: rgba(245,208,107,.9); }

  /* ─── Zoom (modal) ─── */
  dialog.zoom {
    position: fixed; inset: 0;
    width: 100%; height: 100%;
    max-width: none; max-height: none;
    margin: 0; padding: 0; border: 0;
    overflow: hidden;
    color: inherit;
    background: transparent;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
  }
  dialog.zoom[open] { display: grid; place-items: center; }
  dialog.zoom::backdrop { background: transparent; }

  /* Polvo mágico: canvas de fondo, por debajo del video */
  .z-dust { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }

  /* Capas de fondo, de abajo hacia arriba: wallpaper (opcional) → velo oscuro → polvo */
  .z-bg, .z-veil { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .z-bg { background-size: cover; background-position: center; background-repeat: no-repeat; }
  .z-bg[hidden] { display: none !important; }
  .z-veil {
    --veil: 1;
    background: radial-gradient(ellipse at 50% 42%,
      rgba(14,38,25, calc(.88 * var(--veil))) 0%, rgba(3,10,6, calc(.96 * var(--veil))) 72%);
  }

  /* El escenario toma la proporción del marco (si hay) o la del video.
     --zr es un número (ancho/alto) que se calcula desde JS. */
  .z-stage {
    --zr: 1.7778;
    position: relative;
    z-index: 1;
    aspect-ratio: var(--zr);
    width: min(92vw, calc(86vh * var(--zr)));
  }
  @supports (height: 100dvh) {
    .z-stage { width: min(92vw, calc(86dvh * var(--zr))); }
  }
  .z-stage.has-frame {
    filter: drop-shadow(0 18px 50px rgba(0,0,0,.6)) drop-shadow(0 0 30px rgba(197,162,39,.22));
  }

  .z-wrap {
    position: absolute; inset: 0;
    overflow: hidden;
    background: #07140d;
    border-radius: 14px;
    border: 2px solid rgba(245,208,107,.85);
    box-shadow: 0 20px 70px rgba(0,0,0,.65), 0 0 60px rgba(197,162,39,.35);
  }
  .z-stage.has-frame .z-wrap {
    top: var(--inset-top); right: var(--inset-right);
    bottom: var(--inset-bottom); left: var(--inset-left);
    border-radius: 0; border: 0; box-shadow: none;
  }
  .z-wrap video { display: block; width: 100%; height: 100%; object-fit: contain; }
  .z-stage.has-frame .z-wrap video { object-fit: cover; }

  .z-frame {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: fill;
    pointer-events: none;
    z-index: 2;
    user-select: none;
    -webkit-user-drag: none;
  }
  .z-frame[hidden] { display: none !important; }

  .z-close {
    position: absolute;
    z-index: 3;
    top: max(14px, env(safe-area-inset-top));
    right: max(14px, env(safe-area-inset-right));
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 1.5px solid rgba(245,208,107,.85);
    background: rgba(15,10,30,.55);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    box-shadow: 0 0 14px rgba(197,162,39,.3);
    transition: background .25s ease, transform .25s ease;
  }
  .z-close:hover { background: rgba(197,162,39,.28); transform: scale(1.08); }
  .z-close svg { width: 46%; height: 46%; fill: none; stroke: rgba(245,208,107,.95);
                 stroke-width: 2.2; stroke-linecap: round; }
</style>

<div class="card">
  <div class="video-wrap">
    <video id="vid" playsinline></video>
    <div class="overlay" id="overlay" hidden></div>
    <div class="info" id="info" hidden>
      <div class="badge" id="badge" hidden><span class="badge-dot"></span><span id="badgeEl"></span></div>
      <div class="titulo" id="titleEl" hidden></div>
      <div class="gold-line" id="goldLine" hidden></div>
      <div class="meta" id="meta" hidden>
        <span class="meta-time" id="timeEl">0:00</span>
        <div class="meta-dots">
          <div class="meta-dot active"></div>
          <div class="meta-dot"></div>
          <div class="meta-dot"></div>
        </div>
      </div>
    </div>
  </div>

  <button class="play-btn" id="playBtn" aria-label="Reproducir / Pausar">
    <span class="play-icon" id="playIcon"></span>
  </button>

  <button class="sound-btn" id="soundBtn" aria-label="Activar o silenciar sonido" hidden>
    <svg class="ico-off" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>
    <svg class="ico-on" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>
  </button>

  <button class="zoom-btn" id="zoomBtn" aria-label="Ampliar video" aria-haspopup="dialog" hidden>
    <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 8v5M8 10.5h5"/></svg>
  </button>

  <img class="frame-img" id="frameImg" alt="" />
</div>

<dialog class="zoom" id="zoomDlg" aria-label="Video ampliado">
  <div class="z-bg" id="zBg" hidden></div>
  <div class="z-veil" id="zVeil"></div>
  <canvas class="z-dust" id="zDust" aria-hidden="true"></canvas>
  <button class="z-close" id="zClose" aria-label="Cerrar">
    <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>
  </button>
  <div class="z-stage" id="zStage">
    <div class="z-wrap">
      <video id="zVid" playsinline controls controlslist="nodownload"></video>
    </div>
    <img class="z-frame" id="zFrame" alt="" hidden />
  </div>
</dialog>
`;

class VideoFrameNavidad extends HTMLElement {
  static get observedAttributes() {
    return ['titulo', 'fecha', 'video', 'poster', 'frame',
            'frame-ratio', 'inset-top', 'inset-right', 'inset-bottom', 'inset-left',
            'autoplay', 'loop', 'muted',
            'zoom', 'zoom-paused', 'zoom-frame', 'zoom-frame-ratio',
            'zoom-inset-top', 'zoom-inset-right', 'zoom-inset-bottom', 'zoom-inset-left',
            'zoom-float', 'zoom-float-count', 'zoom-float-size',
            'zoom-bg', 'zoom-bg-mobile', 'zoom-bg-desktop', 'zoom-veil'];
  }

  connectedCallback() {
    if (this._ready) return;
    this._ready = true;

    this._shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(_tpl.content.cloneNode(true));

    const $ = id => this._shadow.getElementById(id);
    this._card     = this._shadow.querySelector('.card');
    this._vid      = $('vid');
    this._btn      = $('playBtn');
    this._icon     = $('playIcon');
    this._overlay  = $('overlay');
    this._info     = $('info');
    this._badge    = $('badge');
    this._badgeEl  = $('badgeEl');
    this._titleEl  = $('titleEl');
    this._goldLine = $('goldLine');
    this._meta     = $('meta');
    this._timeEl   = $('timeEl');
    this._frameEl  = $('frameImg');
    this._soundBtn = $('soundBtn');
    this._zoomBtn  = $('zoomBtn');
    this._zDlg     = $('zoomDlg');
    this._zDust    = $('zDust');
    this._zClose   = $('zClose');
    this._zStage   = $('zStage');
    this._zVid     = $('zVid');
    this._zFrame   = $('zFrame');
    this._zBg      = $('zBg');
    this._zVeil    = $('zVeil');
    this._dots     = this._shadow.querySelectorAll('.meta-dot');
    this._playing  = false;

    this._frameEl.src = this.getAttribute('frame') || './nav.png';
    this._posterSrc = this.getAttribute('poster') || '';
    if (this._posterSrc) this._vid.poster = this._posterSrc;

    this._applyGeometry();
    this._applyText();

    this._vid.setAttribute('data-src', this.getAttribute('video') || '');
    this._setupLoading();

    this._btn.addEventListener('click', () => this._toggle());
    this._soundBtn.addEventListener('click', () => this._toggleSound());
    this._vid.addEventListener('volumechange', () => this._updateSoundUI());
    this._applySoundBtn();
    this._initZoom();
    this._vid.addEventListener('timeupdate', () => this._updateTime());
    this._vid.addEventListener('ended', () => this._resetPlayUI());
    // El poster se mantiene hasta que el video realmente arranca (evita parpadeo mientras carga)
    this._vid.addEventListener('playing', () => { this._vid.poster = ''; });

    this._initDotAnim();
  }

  disconnectedCallback() {
    this._teardownZoom();
    clearInterval(this._dotInterval);
    if (this._io) this._io.disconnect();
    this._ready = false;
    if (this._shadow) this._shadow.innerHTML = '';
  }

  /* Muestra/oculta chip, título, línea y meta según los atributos */
  _applyText() {
    const titulo = (this.getAttribute('titulo') || '').trim();
    const fecha  = (this.getAttribute('fecha')  || '').trim();
    const any = !!(titulo || fecha);

    this._badgeEl.textContent = fecha;
    this._titleEl.textContent = titulo;

    this._badge.hidden    = !fecha;
    this._titleEl.hidden  = !titulo;
    this._goldLine.hidden = !any;
    this._meta.hidden     = !any;
    this._info.hidden     = !any;
    this._overlay.hidden  = !any;
  }

  _applyGeometry() {
    const set = (prop, v, suffix = '') => {
      if (v) this._card.style.setProperty(prop, v + suffix);
    };
    const ratio = this.getAttribute('frame-ratio');
    set('--frame-ratio', ratio && ratio.replace(':', '/'));
    set('--inset-top',    this.getAttribute('inset-top'),    '%');
    set('--inset-right',  this.getAttribute('inset-right'),  '%');
    set('--inset-bottom', this.getAttribute('inset-bottom'), '%');
    set('--inset-left',   this.getAttribute('inset-left'),   '%');
  }

  /* Con poster: no se toca la red hasta el play.
     Sin poster: se carga solo metadata al entrar en pantalla. */
  _setupLoading() {
    if (this._io) { this._io.disconnect(); this._io = null; }
    this._vid.loop = this.hasAttribute('loop');

    if (this.hasAttribute('autoplay')) { this._setupAutoplay(); return; }

    if (this._vid.getAttribute('src')) return; // ya cargado

    if (this._posterSrc) {
      this._vid.preload = 'none';
      return;
    }

    this._vid.preload = 'metadata';
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this._ensureSrc();
          this._io.disconnect();
          this._io = null;
        }
      }, { threshold: 0.2 });
      this._io.observe(this._vid);
    } else {
      this._ensureSrc();
    }
  }

  /* Autoplay: arranca al entrar en pantalla, pausa al salir.
     Los navegadores solo permiten autoplay en silencio. */
  _setupAutoplay() {
    this._vid.muted = true;
    this._vid.preload = 'auto';

    if (!('IntersectionObserver' in window)) {
      this._ensureSrc();
      this._play(false);
      return;
    }
    this._io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          this._ensureSrc();
          if (!this._userPaused && !this._playing && !this._zOpen) this._play(false);
        } else if (this._playing) {
          this._vid.pause();
          this._resetPlayUI(); // no marca _userPaused: retoma al volver a verse
        }
      }
    }, { threshold: 0.4 });
    this._io.observe(this._vid);
  }

  _ensureSrc() {
    const src = this._vid.dataset.src;
    if (src && !this._vid.getAttribute('src')) {
      this._vid.src = src;
      this._vid.load();
    }
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._ready) return;
    if (name === 'titulo' || name === 'fecha') this._applyText();
    if (name === 'video') {
      this._vid.pause();
      this._resetPlayUI();
      this._vid.removeAttribute('src');
      this._vid.load(); // libera lo descargado del video anterior
      this._vid.setAttribute('data-src', val || '');
      this._setupLoading();
    }
    if (name === 'muted') {
      if (val !== null) this._vid.muted = true;
      this._applySoundBtn();
    }
    if (name === 'autoplay' || name === 'loop') {
      if (name === 'autoplay' && val === null) {
        this._vid.pause();
        this._resetPlayUI();
        this._userPaused = false;
        this._vid.muted = false;
      }
      this._setupLoading();
      this._applySoundBtn();
    }
    if (name === 'poster') {
      this._posterSrc = val || '';
      this._vid.poster = this._posterSrc;
      this._setupLoading();
    }
    if (name === 'zoom') {
      this._applyZoomBtn();
      if (val === null && this._zOpen) this._closeZoom();
    }
    if (name === 'zoom-frame' || name === 'zoom-frame-ratio' || name.startsWith('zoom-inset-') ||
        name === 'zoom-bg' || name === 'zoom-bg-mobile' || name === 'zoom-bg-desktop' ||
        name === 'zoom-veil') {
      if (this._zOpen) this._applyZoomLayout();
    }
    if (name.startsWith('zoom-float') && this._zOpen) this._startDust();
    if (name === 'frame')  this._frameEl.src = val || './nav.png';
    if (name.startsWith('inset-') || name === 'frame-ratio') this._applyGeometry();
  }

  _toggle() {
    if (this._playing) {
      this._userPaused = true; // el usuario manda: no reanudar solo
      this._vid.pause();
      this._resetPlayUI();
    } else {
      this._userPaused = false;
      this._play(true);
    }
  }

  _play(fromUser) {
    const isAuto = this.hasAttribute('autoplay');

    // Un solo video sonando a la vez (las tarjetas autoplay quedan fuera)
    if (fromUser && !isAuto) {
      const cur = VideoFrameNavidad._current;
      if (cur && cur !== this) cur._pauseFromOutside();
      VideoFrameNavidad._current = this;
    }

    // Autoplay arranca mudo; un gesto del usuario habilita el sonido
    // Primer gesto del usuario = sonido, salvo que ya haya elegido silenciar
    if (fromUser && this._soundPref === undefined) this._soundPref = true;
    if (isAuto) this._vid.muted = this.hasAttribute('muted') || !this._soundPref;
    else this._vid.muted = this.hasAttribute('muted');

    this._ensureSrc(); // recién acá se descarga si había poster
    this._vid.play().catch(() => {});
    this._playing = true;
    this._btn.classList.add('is-playing');
    this._icon.className = 'pause-icon';
    this._icon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
    this._btn.style.animation = 'none';
  }

  _applySoundBtn() {
    const show = this.hasAttribute('autoplay') && !this.hasAttribute('muted');
    this._soundBtn.hidden = !show;
    this._updateSoundUI();
  }

  _toggleSound() {
    this._soundPref = this._vid.muted; // si estaba mudo, ahora quiere sonido
    this._vid.muted = !this._soundPref;
    if (this._soundPref && this._vid.paused && !this._userPaused) this._play(false);
  }

  _updateSoundUI() {
    this._soundBtn.classList.toggle('is-on', !this._vid.muted);
  }

  _pauseFromOutside() {
    if (!this._playing) return;
    this._vid.pause();
    this._resetPlayUI();
  }

  _resetPlayUI() {
    this._playing = false;
    this._btn.classList.remove('is-playing');
    this._icon.className = 'play-icon';
    this._icon.innerHTML = '';
    this._btn.style.animation = '';
    if (this._posterSrc) this._vid.poster = this._posterSrc;
  }

  _updateTime() {
    const t = this._vid.currentTime || 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    this._timeEl.textContent = `${m}:${s}`;
    if (this._vid.duration) {
      const pct = t / this._vid.duration;
      const idx = pct < 0.33 ? 0 : pct < 0.66 ? 1 : 2;
      this._dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  }

  /* ═════════════════ Zoom ═════════════════ */

  _initZoom() {
    this._zOpen = false;
    this._zClosing = false;
    this._zoomBtn.addEventListener('click', () => this._openZoom());
    this._zClose.addEventListener('click', () => this._closeZoom());
    // Tocar el fondo (o el canvas de polvo) cierra; tocar el video o el marco, no
    this._zDlg.addEventListener('click', e => {
      if (e.target === this._zDlg || e.target === this._zDust) this._closeZoom();
    });
    // Esc: pasa por nuestra animación de salida en vez del cierre seco del navegador
    this._zDlg.addEventListener('cancel', e => { e.preventDefault(); this._closeZoom(); });
    // Si el navegador cierra el modal por su cuenta, igual se limpia todo
    this._zDlg.addEventListener('close', () => this._finishZoom());
    // Sin marco, el escenario toma la proporción real del video
    this._zVid.addEventListener('loadedmetadata', () => {
      if (this._zOpen && !this._zStage.classList.contains('has-frame')) this._applyZoomLayout();
    });
    this._applyZoomBtn();
  }

  _applyZoomBtn() {
    this._zoomBtn.hidden = !this.hasAttribute('zoom');
  }

  _parseRatio(str) {
    const [a, b] = String(str).replace(':', '/').split('/').map(Number);
    const n = b ? a / b : a;
    return n > 0 && isFinite(n) ? n : 16 / 9;
  }

  /* Con `zoom-frame`: proporción y hueco del marco (los propios o los de la tarjeta).
     Sin `zoom-frame`: proporción real del video, sin marco. */
  _applyZoomLayout() {
    const st = this._zStage;
    const sides = ['top', 'right', 'bottom', 'left'];
    const frameUrl = (this.getAttribute('zoom-frame') || '').trim();
    const framed = !!frameUrl;

    st.classList.toggle('has-frame', framed);
    this._zFrame.hidden = !framed;

    let ratio;
    if (framed) {
      if (this._zFrame.getAttribute('src') !== frameUrl) this._zFrame.src = frameUrl;
      ratio = this._parseRatio(this.getAttribute('zoom-frame-ratio') ||
                               this.getAttribute('frame-ratio') || '1023/1640');
      sides.forEach(side => {
        const v = this.getAttribute('zoom-inset-' + side) || this.getAttribute('inset-' + side);
        if (v) st.style.setProperty('--inset-' + side, v + '%');
        else st.style.removeProperty('--inset-' + side);
      });
    } else {
      this._zFrame.removeAttribute('src');
      sides.forEach(side => st.style.removeProperty('--inset-' + side));
      const vw = this._zVid.videoWidth  || this._vid.videoWidth;
      const vh = this._zVid.videoHeight || this._vid.videoHeight;
      ratio = vw && vh ? vw / vh : 16 / 9;
    }
    st.style.setProperty('--zr', ratio.toFixed(4));
    this._applyZoomBg();
  }

  /* Qué wallpaper corresponde a esta pantalla: el propio del dispositivo; si no hay,
     `zoom-bg`; si tampoco, el del otro dispositivo (así uno solo sirve para los dos).
     El valor `none` en el propio del dispositivo apaga el wallpaper en esa pantalla. */
  _zoomBgUrl() {
    const get = n => (this.getAttribute(n) || '').trim();
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const mine  = get(mobile ? 'zoom-bg-mobile'  : 'zoom-bg-desktop');
    const other = get(mobile ? 'zoom-bg-desktop' : 'zoom-bg-mobile');
    const pick = mine || get('zoom-bg') || other;
    return pick.toLowerCase() === 'none' ? '' : pick;
  }

  /* Si la ventana cruza el corte mobile/desktop con el zoom abierto, cambia el wallpaper */
  _watchBgBreakpoint(on) {
    if (this._zMq && this._zMqFn) {
      if (this._zMq.removeEventListener) this._zMq.removeEventListener('change', this._zMqFn);
      this._zMq = this._zMqFn = null;
    }
    if (!on) return;
    const mq = window.matchMedia('(max-width: 767px)');
    if (!mq.addEventListener) return;
    this._zMq = mq;
    this._zMqFn = () => this._applyZoomBg();
    mq.addEventListener('change', this._zMqFn);
  }

  /* Wallpaper opcional bajo el velo. Con fondo, el velo se aclara por defecto (0.6)
     para que se vea; `zoom-veil` (0 a 1) lo regula. */
  _applyZoomBg() {
    const url = this._zoomBgUrl();
    this._zBg.hidden = !url;
    this._zBg.style.backgroundImage = url ? 'url("' + url.replace(/"/g, '%22') + '")' : '';
    let veil = parseFloat(this.getAttribute('zoom-veil'));
    if (!isFinite(veil)) veil = url ? 0.6 : 1;
    this._zVeil.style.setProperty('--veil', String(Math.max(0, Math.min(1, veil))));
  }

  _lockScroll(lock) {
    const el = document.documentElement;
    if (lock && !this._scrollLocked) {
      this._scrollLocked = true;
      this._prevOverflow = el.style.overflow;
      el.style.overflow = 'hidden';
    } else if (!lock && this._scrollLocked) {
      this._scrollLocked = false;
      el.style.overflow = this._prevOverflow || '';
    }
  }

  _openZoom() {
    if (this._zOpen || !this.hasAttribute('zoom') || this._zDlg.open) return;
    const src = this._vid.dataset.src || this._vid.getAttribute('src');
    if (!src) return;

    this._zOpen = true;
    this._zWasPlaying = this._playing;
    const t = this._vid.currentTime || 0;

    // Mientras dura el zoom suena solo el video ampliado
    const cur = VideoFrameNavidad._current;
    if (cur && cur !== this) cur._pauseFromOutside();
    if (this._playing) { this._vid.pause(); this._resetPlayUI(); }

    const zv = this._zVid;
    zv.preload = 'auto';
    zv.poster  = t > 0.1 ? '' : (this._posterSrc || '');
    zv.muted   = this.hasAttribute('muted');
    zv.loop    = this.hasAttribute('loop');
    zv.src     = src;
    try { zv.currentTime = t; } catch (_) {}

    this._applyZoomLayout();
    this._watchBgBreakpoint(true);
    this._lockScroll(true);
    this._zDlg.showModal();
    this._zoomAnim(true);
    this._startDust();

    // El clic del usuario habilita el sonido; si igual el navegador lo bloquea, va en mute
    if (!this.hasAttribute('zoom-paused')) {
      zv.play().catch(() => { zv.muted = true; zv.play().catch(() => {}); });
    }
  }

  _closeZoom() {
    if (!this._zOpen || this._zClosing) return;
    this._zClosing = true;
    const dlg = this._zDlg;
    const finish = () => { if (dlg.open) dlg.close(); else this._finishZoom(); };
    const done = this._zoomAnim(false);
    if (done) done.then(finish, finish); else finish();
  }

  _finishZoom() {
    if (!this._zOpen) return;
    const zv = this._zVid;
    const zt = zv.currentTime || 0;
    zv.pause();
    zv.removeAttribute('src');
    zv.load(); // libera lo descargado del zoom
    this._stopDust();
    this._watchBgBreakpoint(false);
    this._lockScroll(false);
    this._zOpen = false;
    this._zClosing = false;

    // La tarjeta retoma donde quedó el zoom y, si estaba reproduciendo, sigue
    if (zt > 0.1) {
      this._ensureSrc();
      try { this._vid.currentTime = zt; } catch (_) {}
    }
    if (this._zWasPlaying) this._play(false);
  }

  _teardownZoom() {
    this._stopDust();
    this._watchBgBreakpoint(false);
    this._lockScroll(false);
    this._zOpen = false;
    this._zClosing = false;
    if (this._zDlg && this._zDlg.open) this._zDlg.close();
  }

  /* El video "sale" de la tarjeta hacia el centro (y vuelve al cerrar).
     Devuelve una promesa que se resuelve al terminar, o null si no se anima. */
  _zoomAnim(opening) {
    const dlg = this._zDlg, st = this._zStage;
    if (!dlg.animate ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

    dlg.getAnimations().forEach(a => a.cancel());
    st.getAnimations().forEach(a => a.cancel());

    const c = this._card.getBoundingClientRect();
    const s = st.getBoundingClientRect();
    let from = 'scale(.9)';
    if (c.width && s.width) {
      const dx = (c.left + c.width / 2) - (s.left + s.width / 2);
      const dy = (c.top + c.height / 2) - (s.top + s.height / 2);
      from = `translate(${dx}px, ${dy}px) scale(${c.width / s.width})`;
    }
    const ease = 'cubic-bezier(.22, 1, .36, 1)';
    const fill = opening ? 'none' : 'forwards';

    dlg.animate(
      opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
      { duration: opening ? 380 : 300, easing: 'ease', fill });

    return st.animate(opening
      ? [{ transform: from, opacity: 0 }, { opacity: 1, offset: .35 }, { transform: 'none', opacity: 1 }]
      : [{ transform: 'none', opacity: 1 }, { opacity: 1, offset: .65 }, { transform: from, opacity: 0 }],
      { duration: opening ? 520 : 300, easing: ease, fill }).finished;
  }

  /* Polvo mágico: partículas doradas con halo que suben despacio y titilan.
     Más grandes = más cerca = más rápidas y brillantes (efecto de profundidad). */
  _startDust() {
    const cv = this._zDust;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    this._stopDust();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sprite con halo, se dibuja una sola vez
    const spr = document.createElement('canvas');
    spr.width = spr.height = 64;
    const g = spr.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,    'rgba(255,250,222,1)');
    grad.addColorStop(0.16, 'rgba(255,228,140,.95)');
    grad.addColorStop(0.42, 'rgba(245,208,107,.28)');
    grad.addColorStop(1,    'rgba(245,208,107,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);

    let w = 0, h = 0, parts = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const spawn = (p, anywhere) => {
      const z = Math.random();           // 0 = lejos, 1 = cerca
      p.s   = 6 + z * z * 16;            // diámetro del sprite (px)
      p.vy  = 6 + z * 26;                // velocidad de ascenso (px/s)
      p.amp = 4 + z * 16;                // vaivén lateral (px)
      p.fr  = rnd(0.25, 0.9);            // frecuencia del vaivén
      p.tw  = rnd(0.8, 2.6);             // velocidad del titileo
      p.ph  = rnd(0, 6.283);
      p.a   = 0.3 + z * 0.6;
      p.t   = rnd(0, 100);
      p.x   = rnd(0, w);
      p.y   = anywhere ? rnd(0, h) : h + p.s;
      return p;
    };

    // PNG flotante (opcional): n copias que deambulan sin rumbo fijo por toda la pantalla
    const floatSrcs = (this.getAttribute('zoom-float') || '')
      .split(/\s+/).map(u => u.replace(/,$/, '')).filter(Boolean);
    let nFloat = parseInt(this.getAttribute('zoom-float-count'), 10);
    nFloat = isFinite(nFloat) ? Math.max(0, Math.min(80, nFloat))
                              : Math.min(80, Math.max(8, floatSrcs.length));
    let floatSize = parseFloat(this.getAttribute('zoom-float-size'));
    floatSize = isFinite(floatSize) ? Math.max(8, Math.min(400, floatSize)) : 56;
    let imgs = [], floaters = [];
    if (floatSrcs.length && nFloat > 0) {
      imgs = floatSrcs.map(src => { const im = new Image(); im.decoding = 'async'; im.src = src; return im; });
    }
    const spawnFloater = (f, im) => {
      f.img  = im;
      const z = Math.random();
      f.x    = rnd(0, w);
      f.y    = rnd(0, h);
      f.dir  = rnd(0, 6.283);            // rumbo
      f.sp   = rnd(28, 80);              // velocidad base (px/s)
      f.turn = rnd(0.8, 2.2);            // qué tan nerviosa es al cambiar de rumbo
      f.rot  = rnd(0, 6.283);
      f.vr   = rnd(-1.2, 1.2);           // giro (rad/s)
      f.sc   = 0.7 + z * 0.7;            // tamaño relativo
      f.a    = 0.75 + z * 0.25;
      f.ph   = rnd(0, 6.283);
      f.t    = rnd(0, 100);
      return f;
    };

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, Math.max(36, (w * h) / 16000)));
      parts = Array.from({ length: n }, () => spawn({}, true));
      // Las copias se reparten en rotación entre los PNG (a, b, a, b…)
      floaters = imgs.length
        ? Array.from({ length: nFloat }, (_, i) => spawnFloater({}, imgs[i % imgs.length]))
        : [];
    };

    const draw = dt => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.t += dt;
        p.y -= p.vy * dt;
        if (p.y < -p.s) spawn(p, false);
        const x = p.x + Math.sin(p.t * p.fr + p.ph) * p.amp;
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.t * p.tw + p.ph * 2));
        ctx.drawImage(spr, x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (imgs.length) {
        for (const f of floaters) {
          const im = f.img;
          if (!(im.complete && im.naturalWidth)) continue; // cargando o con error: no se dibuja
          const k = 1 / Math.max(im.naturalWidth, im.naturalHeight);
          f.t += dt;
          // Rumbo que serpentea (dos ondas) + golpes de viento al azar
          f.dir += (Math.sin(f.t * 0.9 + f.ph) + 0.6 * Math.sin(f.t * 2.3 + f.ph * 1.7)) * f.turn * dt;
          if (Math.random() < dt * 0.35) { f.dir += rnd(-2.2, 2.2); f.vr = rnd(-2, 2); }
          const sp = f.sp * (0.6 + 0.4 * Math.sin(f.t * 0.8 + f.ph));
          f.x += Math.cos(f.dir) * sp * dt;
          f.y += Math.sin(f.dir) * sp * dt;
          f.rot += f.vr * dt;

          const side = floatSize * f.sc;
          if (f.x < -side) f.x = w + side; else if (f.x > w + side) f.x = -side;
          if (f.y < -side) f.y = h + side; else if (f.y > h + side) f.y = -side;

          const dw = im.naturalWidth * k * side, dh = im.naturalHeight * k * side;
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rot);
          ctx.globalAlpha = f.a;
          ctx.drawImage(im, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    };

    fit();
    if (reduce) {
      // Sin movimiento: una sola imagen fija de polvo
      draw(0);
      this._zResize = () => { fit(); draw(0); };
    } else {
      let last = performance.now();
      const loop = now => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        draw(dt);
        this._zRaf = requestAnimationFrame(loop);
      };
      this._zRaf = requestAnimationFrame(loop);
      this._zResize = fit;
    }
    window.addEventListener('resize', this._zResize);
  }

  _stopDust() {
    if (this._zRaf) cancelAnimationFrame(this._zRaf);
    this._zRaf = 0;
    if (this._zResize) {
      window.removeEventListener('resize', this._zResize);
      this._zResize = null;
    }
    const cv = this._zDust;
    const ctx = cv && cv.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
  }

  _initDotAnim() {
    let i = 0;
    this._dotInterval = setInterval(() => {
      if (this._playing) return;
      this._dots.forEach((d, j) => d.classList.toggle('active', j === i));
      i = (i + 1) % 3;
    }, 900);
  }
}

if (!customElements.get('video-frame-navidad')) {
  customElements.define('video-frame-navidad', VideoFrameNavidad);
}
})();