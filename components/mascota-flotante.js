
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
          left: 105%;
          width: ${ancho};
          display: block;
          pointer-events: auto;
          text-decoration: none;
          animation: caminar ${duracion} linear infinite;
          filter: drop-shadow(0 8px 12px rgba(0,0,0,.28));
        }
        .mascota img{
          width: 100%;
          height: auto;
          display: block;
          animation: rebote .55s ease-in-out infinite;
          transform-origin: bottom center;
        }

        @keyframes caminar{
          from{ left: 105%; }
          to{ left: -22%; }
        }
        @keyframes rebote{
          0%, 100%{ transform: translateY(0); }
          50%{ transform: translateY(-5%); }
        }

        @media (prefers-reduced-motion: reduce){
          .mascota{ animation: none; left: -22%; }
          .mascota img{ animation: none; }
        }
      </style>

      <div class="wrap">
        <a class="mascota" href="${href}" aria-label="${alt}">
          <img src="${src}" alt="${alt}" loading="lazy">
        </a>
      </div>
    `;

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

customElements.define('mascota-flotante', MascotaFlotante);