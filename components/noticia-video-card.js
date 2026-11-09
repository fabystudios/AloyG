/**
 * <noticia-video-card>
 * Variante de <noticia-card>: misma card (colores, sello de fecha, pastilla
 * "EN VIVO", marca, autor, texto con clamp dinámico y botón), pero en lugar
 * de una imagen muestra un video de YouTube (en vivo o grabado).
 *
 * Atributos nuevos respecto a <noticia-card>:
 *   video        URL de YouTube (watch, youtu.be, shorts, live, embed) o ID de 11 caracteres
 *   canal        ID de canal (UC...) para mostrar su transmisión en vivo actual
 *                (se ignora si se pasa "video")
 *   poster       imagen de portada propia (por defecto se usa la miniatura de YouTube)
 *   formato      "horizontal" | "vertical" (auto: vertical si la URL es /shorts/)
 *   autoplay     (booleano) reproduce solo, silenciado, cuando la card se ve en pantalla
 *   media-ancho  ancho de la columna del video en desktop (default 38%)
 *
 * Todos los demás atributos son los mismos que <noticia-card>
 * (fecha, categoria, titular, autor-*, texto, texto-mobile, en-vivo,
 * fecha-fondo, fecha-color, marca, marca-alt, marca-ancho, ancho,
 * boton-texto, fuente-nombre, fuente-url, fuente-logo).
 * Salvo: el botón por defecto dice "Ver en YouTube" y apunta al video/canal.
 */
class NoticiaVideoCard extends HTMLElement {

  // Mismo id que <noticia-card>: si ambas están en la página, las fuentes
  // se cargan una sola vez.
  static FONTS_ID  = 'noticia-card-fonts';
  static EMBED_HOST = 'https://www.youtube-nocookie.com';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._ready = false;
    this._playing = false;
  }

  static get observedAttributes() {
    return ['ancho', 'marca-ancho', 'media-ancho', 'video', 'canal', 'poster', 'formato'];
  }

  connectedCallback() {
    this._ensureFonts();
    this._render();
    this._buildMedia();
    this._setupClamp();
    this._setupTextoMobile();
    this._setupMarca();
    this._applyAncho();
    this._applyMarcaAncho();
    this._applyMediaAncho();
    this._ready = true;
  }

  attributeChangedCallback(name) {
    if (name === 'ancho')       this._applyAncho();
    if (name === 'marca-ancho') this._applyMarcaAncho();
    if (name === 'media-ancho') this._applyMediaAncho();
    if (this._ready && ['video', 'canal', 'poster', 'formato'].includes(name)) {
      this._buildMedia();
      // el link del botón depende del video/canal
      const cta = this.shadowRoot.querySelector('.cta');
      if (cta) cta.setAttribute('href', this._fuenteUrl());
    }
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    if (this._mqTextoMobile && this._mqTextoMobileHandler) {
      this._mqTextoMobile.removeEventListener('change', this._mqTextoMobileHandler);
    }
  }

  // ---------------------------------------------------------------------
  // Utilidades (iguales a <noticia-card>)
  // ---------------------------------------------------------------------

  // El destello recorre solo la silueta del logo: se usa el propio logo como
  // máscara. Si el logo está en otro dominio sin CORS, el logo se ve igual y
  // solo falta el destello.
  _setupMarca() {
    const marca = this.shadowRoot.querySelector('.marca');
    const img   = this.shadowRoot.querySelector('.marca__img');
    if (!marca || !img) return;
    marca.style.setProperty('--marca-url', `url("${img.getAttribute('src').replace(/"/g, '%22')}")`);
  }

  // Tamaño de la marca (ej: marca-ancho="200px", "30%", "12rem").
  _applyMarcaAncho() {
    const v = this._tamValido(this.getAttribute('marca-ancho'));
    if (v) this.style.setProperty('--nc-marca-ancho', v);
    else   this.style.removeProperty('--nc-marca-ancho');
  }

  // Ancho de la columna del video en desktop (ej: media-ancho="45%").
  // En mobile el video siempre va arriba, a todo el ancho.
  _applyMediaAncho() {
    const v = this._tamValido(this.getAttribute('media-ancho'));
    if (v) this.style.setProperty('--nc-media-ancho', v);
    else   this.style.removeProperty('--nc-media-ancho');
  }

  // Solo deja pasar valores de tamaño CSS (px, %, rem, vw, clamp(), calc()...)
  // para que no se pueda colar otro CSS por el atributo.
  _tamValido(v) {
    v = (v || '').trim();
    return /^[a-zA-Z0-9\s(),.%+*\/-]+$/.test(v) ? v : '';
  }

  // Ancho en desktop (ej: ancho="60vw" o ancho="900px"). Default: 80vw.
  // En mobile siempre es 95vw (ver CSS, no configurable).
  _applyAncho() {
    const ancho = this.getAttribute('ancho');
    this.style.setProperty('--nc-ancho', ancho || '80vw');
  }

  // Carga Playfair Display + Inter una sola vez por documento.
  _ensureFonts() {
    if (document.getElementById(NoticiaVideoCard.FONTS_ID)) return;
    const link = document.createElement('link');
    link.id = NoticiaVideoCard.FONTS_ID;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  _attr(name, fallback = '') {
    return this.getAttribute(name) || fallback;
  }

  // Escapa texto de un atributo para insertarlo como contenido HTML.
  _escHtml(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Escapa un valor para usarlo dentro de un atributo HTML entre comillas.
  _escAttr(v) {
    return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Deja pasar solo URLs http(s) o rutas relativas (nada de javascript:).
  _url(v) {
    v = (v || '').trim();
    return /^(https?:\/\/|\/|#|\.\.?\/)/i.test(v) ? v : '';
  }

  // Valida un color recibido por atributo (#hex, rgb(), hsl(), nombre, var()).
  _color(v) {
    v = (v || '').trim();
    return /^[#a-zA-Z0-9\s(),.%\/-]+$/.test(v) ? v : '';
  }

  // Convierte el texto del atributo en HTML con formato:
  //  - Cada salto de línea del atributo es un salto de línea en la card;
  //    una línea en blanco deja un renglón vacío entre párrafos (máx. 1).
  //  - **texto** => negrita.
  //  - El HTML directo (<b>, <br>, etc.) sigue funcionando.
  _formatTexto(str) {
    if (!str) return '';
    const lineas = String(str)
      .replace(/\r\n?/g, '\n')
      .trim()
      .split('\n')
      .map(l => l.trim());

    const out = [];
    let vacias = 0;
    for (const l of lineas) {
      if (!l) { vacias++; continue; }
      if (out.length) out.push(vacias > 0 ? '<br><br>' : '<br>');
      vacias = 0;
      out.push(l.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
    }
    return out.join('');
  }

  // ---------------------------------------------------------------------
  // Video de YouTube
  // ---------------------------------------------------------------------

  // Extrae el ID de 11 caracteres de cualquier forma de link de YouTube.
  // Devuelve { id, short } ('' si no es válido).
  _parseVideo(v) {
    v = (v || '').trim();
    if (!v) return { id: '', short: false };
    if (/^[\w-]{11}$/.test(v)) return { id: v, short: false };
    try {
      const u = new URL(v, location.href);
      const host = u.hostname.replace(/^(www|m)\./, '');
      let id = '', short = false;
      if (host === 'youtu.be') {
        id = u.pathname.slice(1).split('/')[0];
      } else if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([\w-]{11})/);
        if (m) { id = m[2]; short = m[1] === 'shorts'; }
        else   { id = u.searchParams.get('v') || ''; }
      }
      return /^[\w-]{11}$/.test(id) ? { id, short } : { id: '', short: false };
    } catch (e) {
      return { id: '', short: false };
    }
  }

  // Resuelve qué se va a mostrar: video por ID/URL, o transmisión en vivo
  // de un canal. "video" tiene prioridad sobre "canal".
  _videoInfo() {
    const { id, short } = this._parseVideo(this._attr('video'));
    const canalRaw = this._attr('canal').trim();
    const canal = (!id && /^[\w-]{10,40}$/.test(canalRaw)) ? canalRaw : '';
    const f = this._attr('formato').trim().toLowerCase();
    const vertical = f === 'vertical' ? true : f === 'horizontal' ? false : short;
    return { id, canal, vertical };
  }

  // Link del botón: el que se pase en fuente-url, o el del propio
  // video / canal en YouTube.
  _fuenteUrl() {
    const manual = this._url(this._attr('fuente-url'));
    if (manual) return manual;
    const { id, canal } = this._videoInfo();
    const { short } = this._parseVideo(this._attr('video'));
    if (id)    return short ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`;
    if (canal) return `https://www.youtube.com/channel/${canal}/live`;
    return '#';
  }

  // Arma el recuadro de video: portada + botón de play (no se carga el
  // iframe de YouTube hasta que el usuario toca play, así varias cards en la
  // misma página no ralentizan el sitio). Con "autoplay" se carga solo
  // cuando la card entra en pantalla.
  _buildMedia() {
    const media = this.shadowRoot.querySelector('.media');
    const stage = this.shadowRoot.querySelector('.stage');
    const bg    = this.shadowRoot.querySelector('.media__bg');
    if (!media || !stage || !bg) return;

    if (this._io) { this._io.disconnect(); this._io = null; }
    this._playing = false;
    this._info = this._videoInfo();
    const info = this._info;

    media.classList.remove('is-playing');
    media.classList.toggle('is-vertical', info.vertical);
    stage.textContent = '';

    // Portada: la propia (poster) o la miniatura de YouTube.
    const posterAttr = this._url(this._attr('poster'));
    let main = '', fallback = '', fondo = '';
    if (posterAttr) {
      main = fondo = posterAttr;
    } else if (info.id) {
      main     = `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`;
      fallback = `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`;
      fondo    = fallback;
    }
    bg.style.backgroundImage = fondo ? `url("${fondo.replace(/"/g, '%22')}")` : 'none';

    if (!info.id && !info.canal) {
      console.warn('<noticia-video-card>: falta un atributo "video" (URL o ID de YouTube) o "canal" (ID de canal) válido.');
      return;
    }

    if (main) {
      const img = document.createElement('img');
      img.className = 'thumb';
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      if (fallback) {
        // maxresdefault no existe para todos los videos: si falla (o devuelve
        // la miniatura vacía de 120px), se usa hqdefault.
        const usarFallback = () => { if (img.src !== fallback) img.src = fallback; };
        img.addEventListener('error', usarFallback, { once: true });
        img.addEventListener('load', () => { if (img.naturalWidth <= 120) usarFallback(); });
      }
      img.src = main;
      stage.appendChild(img);
    }

    const plain = this._attr('titular').replace(/<[^>]*>/g, '').trim();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'play';
    btn.setAttribute('aria-label', plain ? `Reproducir video: ${plain}` : 'Reproducir video');
    btn.innerHTML = `
      <span class="play__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8.5 5.2v13.6L19.4 12z"/></svg>
      </span>`;
    btn.addEventListener('click', () => this._play());
    stage.appendChild(btn);

    if (this.hasAttribute('autoplay')) {
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver((entries) => {
          if (entries.some(e => e.isIntersecting)) {
            this._io.disconnect();
            this._io = null;
            this._play({ mute: true });
          }
        }, { threshold: 0.35 });
        this._io.observe(this);
      } else {
        this._play({ mute: true });
      }
    }
  }

  // Reemplaza la portada por el reproductor de YouTube.
  _play(opts = {}) {
    if (this._playing) return;
    const info = this._info;
    if (!info || (!info.id && !info.canal)) return;

    const media = this.shadowRoot.querySelector('.media');
    const stage = this.shadowRoot.querySelector('.stage');
    if (!media || !stage) return;

    const p = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
    if (opts.mute) p.set('mute', '1');

    let src;
    if (info.id) {
      src = `${NoticiaVideoCard.EMBED_HOST}/embed/${info.id}?${p}`;
    } else {
      p.set('channel', info.canal);
      src = `${NoticiaVideoCard.EMBED_HOST}/embed/live_stream?${p}`;
    }

    const plain = this._attr('titular').replace(/<[^>]*>/g, '').trim();
    const f = document.createElement('iframe');
    f.className = 'player';
    f.src = src;
    f.title = plain || 'Video de YouTube';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    // YouTube exige que el embed reciba el referrer del sitio.
    f.referrerPolicy = 'strict-origin-when-cross-origin';

    stage.textContent = '';
    stage.appendChild(f);
    media.classList.add('is-playing');
    this._playing = true;
  }

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  _render() {
    const fecha        = this._attr('fecha');
    const categoria    = this._attr('categoria', 'Noticias');
    const titular      = this._attr('titular');
    const autorNombre  = this._attr('autor-nombre');
    const autorDesc    = this._attr('autor-desc');
    const autorImg     = this._attr('autor-img');
    const autorLink    = this._attr('autor-link', '');
    const texto        = this._attr('texto');
    const textoMobile  = this._attr('texto-mobile', '');
    // Pastilla "en vivo": solo aparece si se pasa el atributo con texto
    // (ej: en-vivo="EN VIVO").
    const enVivo       = this._attr('en-vivo').trim();
    // Sello de fecha: colores originales (bordó y dorado) o fecha-fondo / fecha-color.
    const fechaFondo   = this._color(this._attr('fecha-fondo'));
    const fechaColor   = this._color(this._attr('fecha-color'));
    const sealStyle    = [
      fechaColor && `--seal-fg:${fechaColor}`,
      fechaFondo && `background:${fechaFondo}`,
      fechaFondo && `background:radial-gradient(circle at 35% 30%, color-mix(in srgb, ${fechaFondo}, #fff 25%) 0%, ${fechaFondo} 78%)`
    ].filter(Boolean).join(';');
    // Marca de autoría (logo propio), abajo a la derecha del video.
    const marca        = this._attr('marca').trim().replace(/"/g, '&quot;');
    const marcaAlt     = this._attr('marca-alt', '').replace(/"/g, '&quot;');
    const esMobileAhora = window.matchMedia('(max-width: 560px)').matches;
    const textoElegido = (esMobileAhora && textoMobile) ? textoMobile : texto;
    this._texto = texto;
    this._textoMobile = textoMobile;

    // Botón: por defecto "Ver en [ícono] YouTube" → link del propio video/canal.
    const botonTexto   = this._escHtml(this._attr('boton-texto', 'Ver en'));
    const fuenteNombreAttr = this._attr('fuente-nombre');
    const fuenteNombre = this._escHtml(fuenteNombreAttr || 'YouTube');
    const fuenteLogo   = this._attr('fuente-logo', '');
    const fuenteUrl    = this._escAttr(this._fuenteUrl());

    const ytIcon = `
      <svg class="cta__icon" viewBox="0 0 24 17" aria-hidden="true">
        <path fill-rule="evenodd" d="M2.4 0h19.2A2.4 2.4 0 0 1 24 2.4v12.2a2.4 2.4 0 0 1-2.4 2.4H2.4A2.4 2.4 0 0 1 0 14.6V2.4A2.4 2.4 0 0 1 2.4 0zM9.6 4.9v7.2l6.2-3.6z"/>
      </svg>`;

    this.shadowRoot.innerHTML = `
      <style>${this._css()}</style>

      <article class="card" lang="es" part="card">
        <figure class="media" part="media">
          <div class="media__bg" aria-hidden="true"></div>
          <div class="stage" part="stage"></div>
          <span class="seal" aria-hidden="true"${sealStyle ? ` style="${sealStyle}"` : ''}>
            <span class="seal__day">${(fecha || '').split(' ')[0]}</span>
            <span class="seal__month">${(fecha || '').split(' ').slice(1).join(' ')}</span>
          </span>
          ${enVivo ? `
          <span class="live" part="live" role="status">
            <span class="live__dot" aria-hidden="true"></span>
            <span class="live__text">${enVivo}</span>
          </span>` : ''}
          ${marca ? `
          <span class="marca" part="marca">
            <img class="marca__img" src="${marca}" alt="${marcaAlt}" loading="lazy" decoding="async">
          </span>` : ''}
        </figure>

        <div class="content">
          <p class="eyebrow">${categoria}</p>

          <h2 class="headline">${titular}</h2>

          ${(autorNombre || autorImg) ? `
          <div class="author">
            ${autorImg ? (
              autorLink
                ? `<a class="author__img-link" href="${autorLink}" target="_blank" rel="noopener" aria-label="${autorNombre}"><img class="author__img" src="${autorImg}" alt="${autorNombre}"></a>`
                : `<img class="author__img" src="${autorImg}" alt="${autorNombre}">`
            ) : ''}
            ${autorNombre ? `
            <div class="author__info">
              ${autorLink
                ? `<a class="author__name author__name--link" href="${autorLink}" target="_blank" rel="noopener">${autorNombre}</a>`
                : `<span class="author__name">${autorNombre}</span>`}
              ${autorDesc ? `<span class="author__desc">${autorDesc}</span>` : ''}
            </div>` : ''}
          </div>` : ''}

          <div class="body-wrap">
            <p class="body-text">${this._formatTexto(textoElegido)}</p>
            <div class="fade" aria-hidden="true"></div>
          </div>

          <a class="cta" href="${fuenteUrl}" target="_blank" rel="noopener">
            <span>${botonTexto}</span>
            ${fuenteLogo
              ? `<img class="cta__logo" src="${this._escAttr(fuenteLogo)}" alt="${this._escAttr(fuenteNombreAttr || 'YouTube')}">`
              : `${fuenteNombreAttr ? '' : ytIcon}<strong>${fuenteNombre}</strong>`}
          </a>
        </div>
      </article>
    `;
  }

  // Calcula cuántas líneas entran REALMENTE en el espacio disponible del
  // recuadro de texto, para que nunca queden puntos suspensivos con lugar en
  // blanco debajo, ni al revés. Si el texto no entra, se corta con el
  // degradé de la última línea (sin "Ver más"; para mobile se puede pasar un
  // texto más corto con `texto-mobile`).
  _setupClamp() {
    const p    = this.shadowRoot.querySelector('.body-text');
    const wrap = this.shadowRoot.querySelector('.body-wrap');
    const fade = this.shadowRoot.querySelector('.fade');
    if (!p || !wrap) return;

    const recompute = () => {
      p.style.webkitLineClamp = 'unset';

      const cs = getComputedStyle(p);
      let lineHeight = parseFloat(cs.lineHeight);
      if (!lineHeight || Number.isNaN(lineHeight)) {
        lineHeight = parseFloat(cs.fontSize) * 1.4;
      }

      const availableHeight = wrap.clientHeight;
      const fullTextHeight  = p.scrollHeight;
      const maxLines  = Math.max(1, Math.floor(availableHeight / lineHeight));
      const fullLines = Math.ceil(fullTextHeight / lineHeight);

      if (fullLines > maxLines) {
        p.style.webkitLineClamp = String(maxLines);
        fade.style.display = '';
      } else {
        p.style.webkitLineClamp = 'unset';
        fade.style.display = 'none';
      }
    };

    this._recompute = recompute;

    // Reacciona a cualquier cambio de tamaño del componente (resize de
    // ventana, breakpoint, atributo "ancho").
    const ro = new ResizeObserver(() => requestAnimationFrame(recompute));
    ro.observe(this);
    this._ro = ro;

    requestAnimationFrame(() => requestAnimationFrame(recompute));

    // Recálculos de respaldo: el swap de Playfair Display / Inter puede
    // cambiar el alto de línea real después de la primera medición.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(recompute));
    }
    [150, 400, 900, 1800].forEach(ms => setTimeout(recompute, ms));
  }

  // Si hay texto-mobile, cambia el contenido del párrafo al cruzar el
  // breakpoint mobile/desktop y recalcula el clamp.
  _setupTextoMobile() {
    if (!this._textoMobile) return;

    const mq = window.matchMedia('(max-width: 560px)');
    const p = this.shadowRoot.querySelector('.body-text');

    const aplicar = (esMobile) => {
      p.innerHTML = this._formatTexto(esMobile ? this._textoMobile : this._texto);
      if (this._recompute) requestAnimationFrame(() => requestAnimationFrame(this._recompute));
    };

    const handler = (e) => aplicar(e.matches);
    mq.addEventListener('change', handler);
    this._mqTextoMobile = mq;
    this._mqTextoMobileHandler = handler;
  }

  _css() {
    return `
      /* ---------- Tokens ---------- */
      :host{
        --ink:        #1c2338;   /* azul tinta, tapa de misal */
        --paper:      #faf4e6;   /* pergamino */
        --gold:       #b8862f;   /* pan de oro */
        --gold-soft:  #e9d3a0;
        --wine:       #7a2e2e;   /* sello de lacre */
        --wine-dark:  #5c2020;
        --text:       #2a2417;
        --text-muted: #746650;
        --display: 'Playfair Display', Georgia, serif;
        --sans:    'Inter', system-ui, sans-serif;

        display:block;
        width: var(--nc-ancho, 80vw);
        max-width: 100%;
        margin-inline: auto;
        /* refuerzo por si el padre es flex o grid */
        align-self: center;
        justify-self: center;
      }

      *{ box-sizing:border-box; }

      .card{
        position:relative;
        display:flex;
        flex-direction:row;
        background: var(--paper);
        border-radius: 18px;
        overflow:hidden;
        box-shadow: 0 1px 2px rgba(28,35,56,.06), 0 12px 28px -12px rgba(28,35,56,.28);
        border: 1px solid #00000010;
        transition: box-shadow .35s ease, transform .35s ease;
      }
      .card:hover{
        box-shadow: 0 2px 4px rgba(28,35,56,.08), 0 20px 40px -14px rgba(28,35,56,.34);
        transform: translateY(-2px);
      }

      /* ---------- Media (video) ---------- */
      .media{
        position:relative;
        margin:0;
        flex: 0 0 var(--nc-media-ancho, 38%);
        min-height: 100%;
        overflow:hidden;
        background: var(--ink);
        /* El video (16:9) va centrado sobre un fondo desenfocado de su propia
           portada, así la columna alta y angosta se ve llena y sin recortes. */
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .media__bg{
        position:absolute;
        inset: -10%;
        background-size:cover;
        background-position:center;
        filter: blur(24px) brightness(.55) saturate(1.15);
        transform: scale(1.1);
      }

      .stage{
        position:relative;
        z-index:1;
        width:100%;
        aspect-ratio: 16 / 9;
        background:#000;
        overflow:hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,.5);
      }
      /* Video vertical (Shorts / formato="vertical"): ocupa el alto de la
         columna, con proporción 9:16, centrado. */
      .media.is-vertical{ min-height: 320px; }
      .media.is-vertical .stage{
        position:absolute;
        top:14px;
        bottom:14px;
        left:50%;
        width:auto;
        transform: translateX(-50%);
        aspect-ratio: 9 / 16;
      }
      /* Oscurecido suave abajo de la portada para que el play se lea bien. */
      .stage::after{
        content:'';
        position:absolute;
        inset:0;
        background: linear-gradient(to top, rgba(0,0,0,.35), transparent 55%);
        pointer-events:none;
      }
      .media.is-playing .stage::after{ display:none; }

      .thumb{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
        display:block;
      }
      .player{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        border:0;
        display:block;
      }

      /* Botón de play (colores de la card: bordó + dorado) */
      .play{
        position:absolute;
        inset:0;
        z-index:1;
        width:100%;
        height:100%;
        padding:0;
        border:0;
        background:transparent;
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        -webkit-tap-highlight-color: transparent;
      }
      .play__icon{
        position:relative;
        width:64px;
        height:64px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background: radial-gradient(circle at 35% 30%, var(--wine) 0%, var(--wine-dark) 78%);
        border: 2px solid var(--gold-soft);
        box-shadow: 0 6px 16px rgba(0,0,0,.45);
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .play__icon svg{
        width:28px;
        height:28px;
        fill: var(--gold-soft);
        margin-left:3px; /* compensa el peso visual del triángulo */
      }
      /* aro que se expande (misma onda que el sello de fecha) */
      .play__icon::before{
        content:'';
        position:absolute;
        inset:-2px;
        border-radius:50%;
        border: 2px solid var(--gold-soft);
        opacity:0;
        pointer-events:none;
        animation: seal-ring 3.2s ease-out infinite;
      }
      .play:hover .play__icon,
      .play:focus-visible .play__icon{
        transform: scale(1.08);
        box-shadow: 0 10px 22px rgba(0,0,0,.5);
      }
      .play:focus-visible .play__icon{ outline:2px solid #fff; outline-offset:3px; }

      /* ---------- Sello de fecha ---------- */
      .seal{
        position:absolute;
        top:14px;
        left:14px;
        z-index:2;
        width:60px;
        height:60px;
        border-radius:50%;
        background: radial-gradient(circle at 35% 30%, var(--wine) 0%, var(--wine-dark) 78%);
        border: 2px solid var(--seal-fg, var(--gold-soft));
        box-shadow: 0 4px 10px rgba(0,0,0,.35);
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        color: var(--seal-fg, var(--gold-soft));
        font-family: var(--display);
        line-height:1;
        transition: opacity .3s ease;
      }
      /* Efecto 1: aro que se expande y se desvanece (como una onda). */
      .seal::before{
        content:'';
        position:absolute;
        inset:-2px;
        border-radius:50%;
        border: 2px solid var(--seal-fg, var(--gold-soft));
        opacity:0;
        pointer-events:none;
        animation: seal-ring 3.2s ease-out infinite;
      }
      /* Efecto 2: destello diagonal que cruza el sello (brillo de medalla). */
      .seal::after{
        content:'';
        position:absolute;
        inset:0;
        border-radius:50%;
        pointer-events:none;
        background: linear-gradient(115deg, transparent 38%, rgba(255,255,255,.55) 50%, transparent 62%);
        background-size:250% 100%;
        background-position:150% 0;
        animation: seal-sheen 4.5s ease-in-out infinite;
      }
      @keyframes seal-ring{
        0%        { transform:scale(1);    opacity:.65; }
        70%, 100% { transform:scale(1.38); opacity:0; }
      }
      @keyframes seal-sheen{
        0%, 55%   { background-position:150% 0; }
        100%      { background-position:-50% 0; }
      }
      @media (prefers-reduced-motion: reduce){
        .seal::before, .seal::after, .play__icon::before{ animation:none; opacity:0; }
      }
      .seal__day{ font-size:1.65rem; font-weight:700; }
      .seal__month{ font-size:.5rem; letter-spacing:.05em; text-transform:uppercase; margin-top:3px; opacity:.85; }

      /* ---------- Marca de autoría (abajo a la derecha del video) ---------- */
      .marca{
        position:absolute;
        right:12px;
        bottom:12px;
        z-index:2;
        display:block;
        width: var(--nc-marca-ancho, clamp(92px, 40%, 150px));
        line-height:0;
        pointer-events:none;
        opacity:.94;
        transition: opacity .3s ease;
      }
      .marca__img{
        display:block;
        width:100%;
        height:auto;
        filter: drop-shadow(0 1px 3px rgba(0,0,0,.6)) drop-shadow(0 0 0 rgba(255,214,102,0));
        animation: marca-glow 4.2s ease-in-out infinite;
      }
      /* Destello dorado que cruza solo las letras y el ícono. */
      .marca::after{
        content:'';
        position:absolute;
        inset:0;
        pointer-events:none;
        -webkit-mask: var(--marca-url) center / contain no-repeat;
                mask: var(--marca-url) center / contain no-repeat;
        background: linear-gradient(105deg, transparent 40%, rgba(255,205,90,.95) 50%, transparent 60%);
        background-size:260% 100%;
        background-position:150% 0;
        animation: marca-sheen 5.5s ease-in-out infinite;
      }
      @keyframes marca-glow{
        0%, 100%{ filter: drop-shadow(0 1px 3px rgba(0,0,0,.6)) drop-shadow(0 0 0 rgba(255,214,102,0)); }
        50%     { filter: drop-shadow(0 1px 3px rgba(0,0,0,.6)) drop-shadow(0 0 7px rgba(255,214,102,.75)); }
      }
      @keyframes marca-sheen{
        0%, 60% { background-position:150% 0; }
        100%    { background-position:-50% 0; }
      }
      @media (prefers-reduced-motion: reduce){
        .marca__img{ animation:none; }
        .marca::after{ animation:none; opacity:0; }
      }

      /* Mientras el video se reproduce, el sello y la marca se desvanecen
         para no tapar la barra de controles ni el título de YouTube.
         La pastilla "EN VIVO" se queda. */
      .media.is-playing .seal,
      .media.is-playing .marca{ opacity:0; }

      /* ---------- Pastilla "EN VIVO" (opuesta al sello de fecha) ---------- */
      .live{
        position:absolute;
        top:14px;
        right:14px;
        z-index:2;
        display:inline-flex;
        align-items:center;
        gap:7px;
        max-width: calc(100% - 28px - 74px); /* no pisa el sello de fecha */
        padding: 6px 13px 6px 11px;
        border-radius:999px;
        background:#e50914;
        color:#fff;
        font-family: var(--sans);
        font-size:.72rem;
        font-weight:800;
        letter-spacing:.04em;
        text-transform:uppercase;
        line-height:1;
        box-shadow: 0 4px 10px rgba(0,0,0,.35);
        pointer-events:none;
      }
      .live__dot{
        flex:none;
        width:8px; height:8px;
        border-radius:50%;
        background:#fff;
        animation: live-blink 1.2s ease-in-out infinite;
      }
      .live__text{
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      @keyframes live-blink{
        0%, 100%{ opacity:1; }
        50%{ opacity:.15; }
      }
      @media (prefers-reduced-motion: reduce){
        .live__dot{ animation:none; }
      }

      /* ---------- Content ---------- */
      .content{
        flex:1;
        min-width:0;
        padding: 22px 26px 20px;
        display:flex;
        flex-direction:column;
      }

      .eyebrow{
        margin:0 0 8px;
        font-family: var(--sans);
        font-size:.72rem;
        font-weight:700;
        letter-spacing:.12em;
        text-transform:uppercase;
        color: var(--wine);
      }
      .eyebrow::before{
        content:'';
        display:inline-block;
        width:16px;
        height:2px;
        background: var(--gold);
        margin-right:8px;
        vertical-align:middle;
      }

      .headline{
        margin:0 0 10px;
        font-family: var(--display);
        font-weight:700;
        font-size: 1.5rem;
        line-height:1.22;
        color: var(--ink);
        letter-spacing:-.01em;
        text-align: justify;
        -webkit-hyphens: auto;
        -ms-hyphens: auto;
        hyphens: auto;
        overflow-wrap: break-word;
      }
      .headline::first-letter{
        font-size: 2.5em;
        font-weight:700;
        color: var(--gold);
        float:left;
        line-height:.82;
        padding-right:.06em;
        margin-top:.03em;
      }

      .author{
        display:flex;
        align-items:center;
        gap:9px;
        margin-bottom:10px;
        padding-bottom:9px;
        background: linear-gradient(90deg, var(--gold-soft), transparent) left bottom / 100% 1px no-repeat;
      }
      .author__img{
        width:28px; height:28px;
        border-radius:50%;
        object-fit:cover;
        border: 1px solid var(--gold-soft);
      }
      .author__img-link{
        display:block;
        width:28px; height:28px;
        border-radius:50%;
        flex-shrink:0;
      }
      .author__img-link .author__img{ display:block; }
      .author__info{ display:flex; flex-direction:column; line-height:1.25; min-width:0; }
      .author__name{
        font-family: var(--sans);
        font-weight:600;
        font-size:.82rem;
        color: var(--text);
        text-decoration:none;
      }
      .author__name--link{
        text-decoration: underline;
        text-underline-offset: 2px;
        text-decoration-color: var(--gold-soft);
      }
      .author__name--link:hover{ color: var(--wine); }
      .author__desc{
        font-family: var(--sans);
        font-size:.72rem;
        color: var(--text-muted);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .body-wrap{ position:relative; flex:1; min-height:0; overflow:hidden; }
      .body-text{
        margin:0;
        font-family: var(--sans);
        font-size:.92rem;
        line-height:1.58;
        color: var(--text);
        text-align: justify;
        -webkit-hyphens: auto;
        -ms-hyphens: auto;
        hyphens: auto;
        overflow-wrap: break-word;

        display:-webkit-box;
        -webkit-line-clamp: unset;
        -webkit-box-orient: vertical;
        overflow:hidden;
      }
      .body-text strong{ font-weight:700; color: var(--text); }
      .fade{
        position:absolute;
        left:0; right:0; bottom:0;
        height:2.4em;
        background: linear-gradient(to bottom, transparent, var(--paper) 82%);
        pointer-events:none;
      }

      /* ---------- CTA (mismo efecto hover/active que <noticia-card>) ---------- */
      .cta{
        margin-top:auto;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        text-decoration:none;
        background: linear-gradient(180deg, var(--wine) 0%, var(--wine-dark) 100%);
        color:#fbf3e6;
        font-family: var(--sans);
        font-size:.9rem;
        font-weight:600;
        padding:11px 18px;
        border-radius:999px;
        box-shadow: 0 4px 10px rgba(90,32,32,.28);
        transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
      }
      .cta:hover{
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(90,32,32,.36);
        background: linear-gradient(180deg, var(--wine-dark) 0%, #431717 100%);
      }
      .cta:active{
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(90,32,32,.3);
      }
      .cta__logo{ height:1.3em; width:auto; display:block; filter: brightness(0) invert(1); }
      .cta__icon{ height:1.05em; width:auto; display:block; fill: currentColor; flex:none; }

      /* ---------- Mobile: apilado, alto máximo 9:16 ---------- */
      @media (max-width: 560px){
        :host{ width: 95vw; max-width: 95vw; }

        /* Alto AUTOMÁTICO con tope de 9:16: si el texto es corto, la card se
           ajusta a su contenido (sin espacio vacío abajo); si es largo, crece
           hasta el formato 9:16 y ahí el texto se corta con el degradé.
           (el ancho en mobile es 95vw → alto máximo = 95vw × 16/9) */
        .card{
          flex-direction:column;
          max-height: calc(95vw * 16 / 9);
        }

        /* El video apilado arriba ocupa EXACTAMENTE su franja: el recuadro
           toma la proporción 16:9 del video (ancho completo de la card, alto
           justo), sin barras ni fondo desenfocado. El resto del alto queda
           para el texto. */
        .media{
          flex: none;
          width:100%;
          aspect-ratio: 16 / 9;
          min-height:0;
        }
        .media__bg{ display:none; }
        .stage{ box-shadow:none; }

        /* Video vertical (Shorts): no entra a todo el ancho sin comerse la
           card, así que conserva una franja fija y se centra por alto. */
        .media.is-vertical{
          flex: none;
          height: calc(95vw * 16 / 9 * .44);
          aspect-ratio: auto;
          min-height:0;
        }
        .media.is-vertical .media__bg{ display:block; }
        .media.is-vertical .stage{ top:12px; bottom:12px; box-shadow: 0 10px 30px rgba(0,0,0,.5); }

        .content{
          flex:1;
          min-height:0;
          padding: 18px 18px 16px;
        }

        .body-wrap{ margin-bottom:14px; }
        .headline{ font-size:1.22rem; }
        .body-text{ font-size:.88rem; }
        .author__desc{ display:none; }
      }
    `;
  }
}

if (!customElements.get('noticia-video-card')) {
  customElements.define('noticia-video-card', NoticiaVideoCard);
}