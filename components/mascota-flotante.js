/**
 * <mascota-flotante>
 *
 * ATRIBUTOS ORIGINALES (sin cambios, mismos defaults)
 *   src, href, alt, duracion, ancho, target, offset-top, offset-bottom
 *
 * NUEVOS
 *   sentido      "der-izq" (default) | "izq-der" | "ida-vuelta"
 *   mirar        hacia dónde mira el PNG original: "izq" (default) | "der"
 *                (el componente lo espeja solo para que siempre mire hacia donde camina)
 *   recorrido    uno o varios, separados por espacio:
 *                  horizontal: "lineal" (default) | "pausas"
 *                  vertical:   "zigzag" | "ola" | "saltitos" | "tambaleo"
 *                  ej: recorrido="pausas saltitos"
 *   efecto       uno o varios, separados por espacio:
 *                  "brillo" | "arcoiris" | "latido" | "fantasma" | "chispas" | "sombra"
 *                  ej: efecto="brillo chispas sombra"
 *   chispa       emoji(s) de las partículas, separados por espacio (default "✨")
 *   espejar      "off" = el PNG NUNCA se voltea (útil si tiene texto, o es una escoba
 *                voladora, etc.). Camina igual en el sentido elegido, pero siempre
 *                se ve tal cual es el archivo. Default: "on" (se espeja solo).
 *                Es independiente de sentido, recorrido y efectos.
 *   rebote       "off" para quitar el rebotito del caminar (default: activo)
 *   retraso      delay inicial, ej. "3s" (default "0s")
 *   repetir      "infinite" (default) o un número de pasadas, ej. "2"
 *   inicio / fin posición de salida y de llegada en % del ancho de la card
 *                (default 105 y -22; se invierten con sentido="izq-der")
 *   pausar-hover presente = la mascota se frena mientras el mouse está encima
 */
class MascotaFlotante extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return; // evita re-render si se reconecta
    this.attachShadow({ mode: 'open' });

    const src        = this.getAttribute('src')        || './news/gio.png';
    const href       = this.getAttribute('href')        || '#';
    const alt        = this.getAttribute('alt')         || 'Más noticias';
    const duracion   = this.getAttribute('duracion')    || '16s';
    const ancho      = this.getAttribute('ancho')       || 'clamp(90px, 16vw, 150px)';
    const offsetTop    = this.hasAttribute('offset-top')    ? parseFloat(this.getAttribute('offset-top'))    : null; // px, relativo al borde SUPERIOR
    const offsetBottom = this.hasAttribute('offset-bottom') ? parseFloat(this.getAttribute('offset-bottom')) : null; // px, relativo al borde INFERIOR

    // ---------- Nuevos atributos ----------
    const sentido  = (this.getAttribute('sentido') || 'der-izq').trim();
    const mirar    = (this.getAttribute('mirar')   || 'izq').trim() === 'der' ? 'der' : 'izq';
    const tokensR  = new Set((this.getAttribute('recorrido') || 'lineal').toLowerCase().split(/\s+/).filter(Boolean));
    const tokensE  = new Set((this.getAttribute('efecto')    || '').toLowerCase().split(/\s+/).filter(Boolean));
    const chispas  = (this.getAttribute('chispa') || '✨').split(/\s+/).filter(Boolean);
    const rebote   = (this.getAttribute('rebote') || 'on').trim() !== 'off';
    const retraso  = this.getAttribute('retraso') || '0s';
    const repetir  = this.getAttribute('repetir') || 'infinite';
    const pausarHover = this.hasAttribute('pausar-hover');
    const espejar  = (this.getAttribute('espejar') || 'on').trim() !== 'off'; // "off" = nunca voltear el PNG

    // Duración en segundos (acepta "16s" o "16000ms")
    const m = String(duracion).trim().match(/^([\d.]+)(ms|s)?$/);
    const seg = m ? parseFloat(m[1]) / (m[2] === 'ms' ? 1000 : 1) : 16;

    // ---------- Sentido y posiciones ----------
    const idaVuelta = sentido === 'ida-vuelta';
    let desde = 105, hasta = -22;                       // der-izq (comportamiento original)
    if (sentido === 'izq-der') { desde = -22; hasta = 105; }
    if (this.hasAttribute('inicio')) desde = parseFloat(this.getAttribute('inicio'));
    if (this.hasAttribute('fin'))    hasta = parseFloat(this.getAttribute('fin'));
    if (isNaN(desde)) desde = 105;
    if (isNaN(hasta)) hasta = -22;

    // Cada ruta es una lista de [tiempo 0..1, avance 0..1]
    const RUTA_LINEAL = [[0, 0], [1, 1]];
    const RUTA_PAUSAS = [[0, 0], [.3, .3], [.42, .3], [.68, .68], [.8, .68], [1, 1]];
    const ruta = tokensR.has('pausas') ? RUTA_PAUSAS : RUTA_LINEAL;

    const pos = b => `${(desde + (hasta - desde) * b).toFixed(2)}%`;
    const frames = [];
    if (idaVuelta) {
      ruta.forEach(([a, b]) => frames.push([a * 50, b]));
      ruta.forEach(([a, b]) => frames.push([50 + a * 50, 1 - b]));
    } else {
      ruta.forEach(([a, b]) => frames.push([a * 100, b]));
    }
    const kfCaminar = frames
      .map(([p, b]) => `${p.toFixed(2)}%{ left:${pos(b)}; }`)
      .join('\n          ');
    const total = idaVuelta ? seg * 2 : seg;

    // ---------- Espejado según hacia dónde camina ----------
    const escala = (caminaIzq) => ((caminaIzq ? 'izq' : 'der') === mirar ? 1 : -1);
    const va1Izq = desde > hasta;
    const f1 = espejar ? escala(va1Izq) : 1;
    const f2 = espejar ? escala(!va1Izq) : 1;
    const flipCSS = (idaVuelta && espejar)
      ? `animation: flip ${total}s steps(1, end) ${retraso} ${repetir};`
      : `transform: scaleX(${f1});`;
    const kfFlip = (idaVuelta && espejar)
      ? `@keyframes flip{
          0%{ transform:scaleX(${f1}); }
          50%{ transform:scaleX(${f2}); }
        }`
      : '';

    // ---------- Recorrido vertical ----------
    let pasoCSS = '';
    if (tokensR.has('zigzag')) {
      pasoCSS = `animation: zigzag ${(seg / 3).toFixed(2)}s linear infinite;`;
    } else if (tokensR.has('ola')) {
      pasoCSS = `animation: ola ${(seg / 2).toFixed(2)}s ease-in-out infinite;`;
    } else if (tokensR.has('saltitos')) {
      pasoCSS = `animation: saltitos 1.1s infinite;`;
    } else if (tokensR.has('tambaleo')) {
      pasoCSS = `animation: tambaleo .9s ease-in-out infinite; transform-origin: bottom center;`;
    }

    // ---------- Efectos ----------
    const fx2 = [];
    if (tokensE.has('arcoiris')) fx2.push('arcoiris 6s linear infinite');
    if (tokensE.has('latido'))   fx2.push('latido .8s ease-in-out infinite');
    if (tokensE.has('fantasma')) fx2.push('fantasma 3s ease-in-out infinite');
    const fx1CSS = tokensE.has('brillo') ? 'animation: brillo 1.8s ease-in-out infinite;' : '';
    const fx2CSS = fx2.length ? `animation: ${fx2.join(', ')};` : '';
    const sombraAnim = tokensR.has('saltitos') && !tokensR.has('zigzag') && !tokensR.has('ola') && !tokensR.has('tambaleo')
      ? 'animation: sombra-salto 1.1s infinite;' : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host{ display:contents; }

        .wrap{
          position: absolute; /* NO fixed: no debe aparecer en todo el index */
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          overflow: visible;
          pointer-events: none;
          z-index: 999;
        }

        .mascota{
          position: absolute;
          top: 0;
          left: ${desde}%;
          width: ${ancho};
          display: block;
          pointer-events: auto;
          text-decoration: none;
          animation: caminar ${total}s linear ${retraso} ${repetir};
          animation-fill-mode: both;
          filter: drop-shadow(0 8px 12px rgba(0,0,0,.28));
        }

        /* capas: .paso (recorrido vertical) > .flip (espejado) > .fx1 > .fx2 > img */
        .paso{ position: relative; ${pasoCSS} }
        .flip{ ${flipCSS} }
        .fx1{ ${fx1CSS} }
        .fx2{ ${fx2CSS} }

        .mascota img{
          width: 100%;
          height: auto;
          display: block;
          ${rebote ? 'animation: rebote .55s ease-in-out infinite;' : ''}
          transform-origin: bottom center;
        }

        ${tokensE.has('sombra') ? `
        .sombra{
          position:absolute; left:15%; width:70%; height:9%; bottom:-4%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 70%);
          pointer-events:none; ${sombraAnim}
        }` : ''}

        .chispa{
          position:absolute; pointer-events:none; line-height:1;
          font-size: clamp(12px, 2.4vw, 20px);
          opacity:0;
          animation: chispa var(--dur, 2s) ease-out var(--del, 0s) infinite;
        }

        ${pausarHover ? `.mascota:hover, .mascota:hover *{ animation-play-state: paused !important; }` : ''}

        /* ---- Caminata ---- */
        @keyframes caminar{
          ${kfCaminar}
        }
        ${kfFlip}

        /* ---- Recorridos verticales ---- */
        @keyframes zigzag{
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-70%); }
        }
        @keyframes ola{
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-35%); }
        }
        @keyframes saltitos{
          0%{ transform: translateY(0); animation-timing-function: ease-out; }
          25%{ transform: translateY(-70%); animation-timing-function: ease-in; }
          50%,100%{ transform: translateY(0); }
        }
        @keyframes tambaleo{
          0%,100%{ transform: rotate(-5deg); }
          50%{ transform: rotate(5deg); }
        }
        @keyframes sombra-salto{
          0%,50%,100%{ transform: scale(1); opacity:1; }
          25%{ transform: scale(.6); opacity:.5; }
        }

        /* ---- Rebote del paso ---- */
        @keyframes rebote{
          0%, 100%{ transform: translateY(0); }
          50%{ transform: translateY(-5%); }
        }

        /* ---- Efectos ---- */
        @keyframes brillo{
          0%,100%{ filter: drop-shadow(0 0 4px rgba(255,215,0,.35)); }
          50%{ filter: drop-shadow(0 0 16px rgba(255,215,0,.95)); }
        }
        @keyframes arcoiris{
          from{ filter: hue-rotate(0deg); }
          to{ filter: hue-rotate(360deg); }
        }
        @keyframes latido{
          0%,100%{ transform: scale(1); }
          50%{ transform: scale(1.08); }
        }
        @keyframes fantasma{
          0%,100%{ opacity: 1; }
          50%{ opacity: .55; }
        }
        @keyframes chispa{
          0%{ opacity:0; transform: translate(0,0) scale(.4); }
          20%{ opacity:1; }
          100%{ opacity:0; transform: translate(var(--dx, 0px), -80px) scale(1.1); }
        }

        @media (prefers-reduced-motion: reduce){
          .mascota, .mascota *{ animation: none !important; }
          .mascota{ left: ${hasta}%; }
          .chispa{ display:none; }
        }
      </style>

      <div class="wrap">
        <a class="mascota" href="${href}" aria-label="${alt}">
          <div class="paso">
            <div class="flip">
              <div class="fx1">
                <div class="fx2">
                  <img src="${src}" alt="${alt}" loading="lazy">
                </div>
              </div>
            </div>
          </div>
          ${tokensE.has('sombra') ? '<span class="sombra"></span>' : ''}
        </a>
      </div>
    `;

    // Partículas (se crean por JS para variar posición, tiempo y emoji)
    if (tokensE.has('chispas')) {
      const paso = this.shadowRoot.querySelector('.paso');
      const N = 6;
      for (let i = 0; i < N; i++) {
        const s = document.createElement('span');
        s.className = 'chispa';
        s.textContent = chispas[i % chispas.length];
        s.style.left = `${10 + Math.random() * 75}%`;
        s.style.top = `${10 + Math.random() * 60}%`;
        s.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 40)}px`);
        s.style.setProperty('--dur', `${(1.6 + Math.random() * 1.2).toFixed(2)}s`);
        s.style.setProperty('--del', `${(Math.random() * 2).toFixed(2)}s`);
        paso.appendChild(s);
      }
    }

    this._offsetTop = offsetTop;
    this._offsetBottom = offsetBottom;
    this._wrap = this.shadowRoot.querySelector('.wrap');
    this._findTarget();
  }

  // Busca la card a la que hay que "seguir": por atributo target="id-de-la-card",
  // o si no se especifica, la primera <noticia-card> del documento.
  _findTarget() {
    const targetId = this.getAttribute('target');
    const target = targetId
      ? document.getElementById(targetId)
      : document.querySelector('noticia-card');

    if (!target) {
      // El target puede no existir todavía si este script corre antes.
      // Reintenta un par de veces (por si el navegador aún está parseando el resto del HTML).
      if (!this._retries) this._retries = 0;
      if (this._retries < 20) {
        this._retries++;
        requestAnimationFrame(() => this._findTarget());
      }
      return;
    }

    this._target = target;
    this._track();
  }

  // Posiciona el carril de la mascota exactamente sobre el ancho/posición
  // real (en coordenadas de documento, no de viewport) de la card destino.
  // Como es position:absolute (y no fixed), se mueve con el scroll de forma
  // nativa: solo hace falta recalcular cuando cambia el LAYOUT, no en cada scroll.
  _track() {
    const update = () => {
      const rect = this._target.getBoundingClientRect();
      const top = (this._offsetBottom !== null)
        ? rect.bottom + window.scrollY + this._offsetBottom   // ancla al borde INFERIOR
        : rect.top    + window.scrollY + (this._offsetTop || 0); // ancla al borde SUPERIOR (default)
      const left = rect.left + window.scrollX;
      this._wrap.style.top = `${top}px`;
      this._wrap.style.left = `${left}px`;
      this._wrap.style.width = `${rect.width}px`;
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(this._target);
    this._ro = ro;

    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    this._onResize = update;
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('load', this._onResize);
    }
  }
}

if (!customElements.get('mascota-flotante')) {
  customElements.define('mascota-flotante', MascotaFlotante);
}
