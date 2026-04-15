/**
 * <fb-posts-container> Web Component
 *
 * Reemplaza el script inline del HTML. Carga facebook-posts.json,
 * ordena los posts y renderiza cada tipo: facebook, instagram, video, photo-mosaic.
 *
 * Atributos:
 *   src          — ruta al JSON (default: "./facebook-posts.json")
 *   cache-ttl    — duración del cache en ms (default: 3600000 = 1h)
 *   wallpaper    — ruta al wallpaper de fondo (default: "./img/fb-wallpaper.png")
 *
 * Dependencias externas (se cargan automáticamente si no están):
 *   - Facebook SDK
 *   - Instagram embed.js
 *   - fb-post-mosaic.js  (el web component del mosaico)
 */

(function () {
  'use strict';

  /* ─── Estilos del contenedor ─────────────────────────────────── */
  const CONTAINER_STYLES = `
    fb-posts-container {
      display: block;
      width: 90vw;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.3);
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      fb-posts-container {
        width: 95vw;
        padding: 16px 10px;
      }
    }

    fb-posts-container .wallpaper-layer {
      position: absolute;
      inset: 0;
      background-repeat: repeat;
      background-size: 200px;
      background-position: center;
      opacity: 0.3;
      pointer-events: none;
      z-index: 0;
    }

    fb-posts-container .posts-grid {
      position: relative;
      z-index: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      align-items: flex-start;
    }

    /* ── Wrappers: tamaño automático según cantidad de posts ── */
    fb-posts-container .fb-post-wrapper {
      flex: 0 1 340px;
      min-width: 280px;
      animation: fbFadeIn 0.5s ease both;
      box-sizing: border-box;
    }

    /* 1 solo post: ocupa todo el ancho disponible */
    fb-posts-container .posts-grid.count-1 .fb-post-wrapper {
      flex: 1 1 100%;
      max-width: 700px;
      margin: 0 auto;
    }

    /* 2 posts: mitad cada uno */
    fb-posts-container .posts-grid.count-2 .fb-post-wrapper {
      flex: 1 1 calc(50% - 8px);
      max-width: calc(50% - 8px);
    }

    /* 3 posts: tercio cada uno */
    fb-posts-container .posts-grid.count-3 .fb-post-wrapper {
      flex: 1 1 calc(33% - 11px);
    }

    /* 4+ posts: grid compacto */
    fb-posts-container .posts-grid.count-many .fb-post-wrapper {
      flex: 0 1 340px;
    }

    fb-posts-container .fb-post-wrapper.full-row {
      flex: 1 1 100% !important;
      max-width: 100% !important;
    }
    fb-posts-container .fb-post-wrapper.custom-width {
      flex: 0 1 auto;
    }

    @media (max-width: 768px) {
      fb-posts-container .posts-grid.count-2 .fb-post-wrapper,
      fb-posts-container .posts-grid.count-3 .fb-post-wrapper {
        flex: 1 1 100%;
        max-width: 100%;
      }
    }

    @keyframes fbFadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Títulos y descripciones opcionales ── */
    fb-posts-container .fb-post-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
    }
    fb-posts-container .fb-post-description {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.8);
      margin-top: 6px;
    }

    /* ── Embed containers ── */
    fb-posts-container .fb-embed-container {
      border-radius: 12px;
      overflow: hidden;
    }
    fb-posts-container .fb-embed-container.wide { max-width: 780px; }
    fb-posts-container .fb-embed-container.video-full video {
      width: 100%;
      max-height: 480px;
      object-fit: cover;
    }
    fb-posts-container .fb-embed-container video {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    /* ── Estado de carga / error ── */
    fb-posts-container .fb-loading,
    fb-posts-container .fb-error {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: rgba(255,255,255,0.8);
      text-align: center;
      padding: 40px 20px;
      font-size: 14px;
    }
    fb-posts-container .fb-error { color: rgba(255,180,180,0.9); }
  `;

  function injectContainerStyles() {
    if (document.getElementById('fb-posts-container-styles')) return;
    const style = document.createElement('style');
    style.id = 'fb-posts-container-styles';
    style.textContent = CONTAINER_STYLES;
    document.head.appendChild(style);
  }

  /* ─── Helpers de carga de SDKs externos ──────────────────────── */
  function ensureFbSdk() {
    if (document.getElementById('fb-sdk-script')) return;
    const s = document.createElement('script');
    s.id = 'fb-sdk-script';
    s.async = true;
    s.defer = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0';
    document.head.appendChild(s);
  }

  function ensureIgSdk() {
    if (document.getElementById('ig-sdk-script')) return;
    const s = document.createElement('script');
    s.id = 'ig-sdk-script';
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    document.head.appendChild(s);
  }

  /* ─── Lógica de ordenamiento ─────────────────────────────────── */
  function sortPosts(posts) {
    const active = posts.filter(p => p.position !== -1);
    if (!active.length) return [];

    const fixed  = active.filter(p => p.position > 0).sort((a, b) => a.position - b.position);
    const random = active.filter(p => p.position === 0);

    // Fisher-Yates shuffle
    for (let i = random.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [random[i], random[j]] = [random[j], random[i]];
    }

    const maxPos = Math.max(active.length, ...fixed.map(p => p.position));
    const result = [];
    let ri = 0;

    for (let i = 1; i <= maxPos; i++) {
      const fp = fixed.find(p => p.position === i);
      result.push(fp || (ri < random.length ? random[ri++] : null));
    }
    while (ri < random.length) result.push(random[ri++]);

    return result.filter(Boolean);
  }

  /* ─── Generadores de HTML por tipo ───────────────────────────── */
  const generators = {

    video(post, index) {
      const autoplay  = post.autoplay !== false;
      const loop      = post.loop     !== false;
      const muted     = post.muted    !== false;
      const controls  = post.controls !== false;
      const poster    = post.poster   ? `poster="${post.poster}"` : '';
      const isFull    = post.layout === 'full-row' || post.orientation === 'landscape';
      const wClass    = isFull ? 'fb-post-wrapper full-row' : 'fb-post-wrapper';
      const cClass    = isFull ? 'fb-embed-container video-full' : 'fb-embed-container';
      const titleHTML = post.title       ? `<div class="fb-post-title">${post.title}</div>` : '';
      const descHTML  = post.description ? `<div class="fb-post-description">${post.description}</div>` : '';

      return `
        <div class="${wClass}" style="animation-delay:${index * 0.1}s" data-autoplay="${autoplay}">
          ${titleHTML}
          <div class="${cClass}">
            <video data-src="${post.url}"
                   ${loop ? 'loop' : ''} ${muted ? 'muted' : ''} ${controls ? 'controls' : ''} ${poster}
                   playsinline preload="metadata"></video>
          </div>
          ${descHTML}
        </div>`;
    },

    instagram(post, index) {
      const titleHTML = post.title       ? `<div class="fb-post-title">${post.title}</div>` : '';
      const descHTML  = post.description ? `<div class="fb-post-description">${post.description}</div>` : '';

      return `
        <div class="fb-post-wrapper" style="animation-delay:${index * 0.1}s">
          ${titleHTML}
          <div class="fb-embed-container" style="display:flex;justify-content:center;">
            <blockquote class="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="${post.url}"
              data-instgrm-version="14"
              style="background:#FFF;border:0;border-radius:3px;
                     box-shadow:0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15);
                     margin:1px;max-width:540px;min-width:326px;padding:0;
                     width:99.375%;width:calc(100% - 2px);">
              <div style="padding:16px;">
                <a href="${post.url}" target="_blank" rel="noopener noreferrer"
                   style="background:#FFF;line-height:0;padding:0;text-align:center;text-decoration:none;width:100%;">
                  Ver publicación en Instagram
                </a>
              </div>
            </blockquote>
          </div>
          ${descHTML}
        </div>`;
    },

    'photo-mosaic'(post, index) {
      const wClass  = post.layout === 'full-row' ? 'fb-post-wrapper full-row' : 'fb-post-wrapper';
      const photos  = JSON.stringify(post.photos || []);
      const esc     = v => (v || '').replace(/"/g, '&quot;');

      return `
        <div class="${wClass}" style="animation-delay:${index * 0.1}s">
          <fb-post-mosaic
            title="${esc(post.title)}"
            author="${esc(post.author)}"
            date="${esc(post.date)}"
            album-url="${post.url}"
            description="${esc(post.description)}"
            photos='${photos}'
          ></fb-post-mosaic>
        </div>`;
    },

    facebook(post, index) {
      const isMobile      = window.innerWidth < 768;
      const fbWidth       = post.width || (isMobile ? 'auto' : '700');
      const hasCustom     = post.width && post.width > 500;
      const wClass        = `fb-post-wrapper${hasCustom ? ' custom-width' : ''}`;
      const cClass        = `fb-embed-container${hasCustom ? ' wide' : ''}`;
      const enableZoom    = post.enableZoom !== false;
      const zoom          = post.zoom    || 1;
      const offsetX       = post.offsetX || 0;
      const offsetY       = post.offsetY || 0;
      const zClass        = enableZoom ? 'fb-post-zoom' : '';
      const dataZ         = enableZoom
        ? `data-zoom="${zoom}" data-offset-x="${offsetX}" data-offset-y="${offsetY}"`
        : '';
      const titleHTML     = post.title       ? `<div class="fb-post-title">${post.title}</div>` : '';
      const descHTML      = post.description ? `<div class="fb-post-description">${post.description}</div>` : '';

      return `
        <div class="${wClass}" style="animation-delay:${index * 0.1}s">
          ${titleHTML}
          <div class="${cClass}">
            <div class="fb-post ${zClass}" ${dataZ}
                 data-href="${post.url}?t=${Date.now()}"
                 data-width="${fbWidth}"
                 data-show-text="false">
            </div>
          </div>
          ${descHTML}
        </div>`;
    },
  };

  function generatePostHTML(post, index) {
    const type = post.type
      || (post.url?.includes('instagram.com') ? 'instagram' : 'facebook');
    const gen = generators[type] || generators.facebook;
    return gen(post, index);
  }

  /* ─── Web Component principal ───────────────────────────────── */
  class FbPostsContainer extends HTMLElement {

    static get observedAttributes() {
      return ['src', 'cache-ttl', 'wallpaper', 'floatingimage'];
    }

    connectedCallback() {
      injectContainerStyles();
      ensureFbSdk();
      ensureIgSdk();
      this._render();
    }

    /* re-renderiza si cambian atributos */
    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    get _src()      { return this.getAttribute('src')       || './facebook-posts.json'; }
    get _cacheTtl() { return Number(this.getAttribute('cache-ttl')) || 3600000; }
    get _wallpaper(){ return this.getAttribute('wallpaper') || './img/fb-wallpaper.png'; }
    get _floatingImage(){ return this.getAttribute('floatingimage') || null; }
    get _cacheKey() { return `fb_posts_cache__${this._src}`; }

    _showStatus(type, msg) {
      const grid = this.querySelector('.posts-grid');
      if (grid) grid.innerHTML = `<div class="fb-${type}">${msg}</div>`;
    }

    async _render() {
      if (this._rendering) return;
      this._rendering = true;

      // Estructura base
      this.innerHTML = `
        <div class="wallpaper-layer" style="background-image:url('${this._wallpaper}')"></div>
        <canvas class="floating-canvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;"></canvas>
        <div class="posts-grid">
          <div class="fb-loading">Cargando publicaciones…</div>
        </div>`;

      // Iniciar partículas si corresponde
      if (this._floatingImage) {
        this._initFloatingParticles();
      }

      try {
        const posts = await this._loadPosts();

        if (!posts.length) {
          this.style.display = 'none';
          return;
        }

        const grid = this.querySelector('.posts-grid');
        const countClass = posts.length === 1 ? 'count-1'
          : posts.length === 2 ? 'count-2'
          : posts.length === 3 ? 'count-3'
          : 'count-many';
        grid.classList.add(countClass);
        grid.innerHTML = posts.map((p, i) => generatePostHTML(p, i)).join('');

        this._parseSdks();
        this._setupZoom();
        this._setupIntersectionObserver();

      } catch (err) {
        console.error('[fb-posts-container]', err);
        this._showStatus('error', `Error al cargar publicaciones: ${err.message}`);
      } finally {
        this._rendering = false;
      }
    }

    _initFloatingParticles() {
      // Inspirado en panel-photo-gallery.js
      const canvas = this.querySelector('.floating-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const DPR = window.devicePixelRatio || 1;
      let running = true;
      let particles = [];
      let img = new window.Image();
      img.src = this._floatingImage;

      const resizeCanvas = () => {
        const w = this.offsetWidth, h = this.offsetHeight;
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      };

      const makeParticle = () => {
        const w = this.offsetWidth;
        return {
          x: Math.random() * w,
          y: -40 - Math.random() * 200,
          size: 36 + Math.random() * 44,
          speedY: 0.18 + Math.random() * 0.42,
          speedX: -0.2 + Math.random() * 0.4,
          rot: Math.random() * Math.PI * 2,
          rotV: -0.008 + Math.random() * 0.016,
          sway: 0.5 + Math.random() * 0.7,
          swayS: 0.004 + Math.random() * 0.008,
          swayT: Math.random() * Math.PI * 2,
          alpha: 0.45 + Math.random() * 0.35
        };
      };

      const initParticles = () => {
        particles = [];
        for (let i = 0; i < 22; i++) {
          const p = makeParticle();
          p.y = Math.random() * this.offsetHeight;
          particles.push(p);
        }
      };

      const animate = () => {
        if (!running) return;
        const lw = this.offsetWidth, lh = this.offsetHeight;
        ctx.clearRect(0, 0, lw, lh);
        particles.forEach(p => {
          p.swayT += p.swayS;
          p.x += p.speedX + Math.sin(p.swayT) * p.sway;
          p.y += p.speedY;
          p.rot += p.rotV;
          if (p.y > lh + 40) Object.assign(p, makeParticle());
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          }
          ctx.restore();
        });
        requestAnimationFrame(animate);
      };

      // Iniciar cuando la imagen esté lista
      const start = () => {
        resizeCanvas();
        initParticles();
        animate();
      };
      if (img.complete) start();
      else img.onload = start;

      // Resize observer
      this._floatingResizeObs?.disconnect?.();
      this._floatingResizeObs = new window.ResizeObserver(() => {
        resizeCanvas();
        initParticles();
      });
      this._floatingResizeObs.observe(this);

      // Limpiar al desconectar
      this._floatingCleanup = () => { running = false; this._floatingResizeObs?.disconnect?.(); };
    }

    async _loadPosts() {
      /* Siempre limpiamos cache para desarrollo; quitá estas líneas en producción */
      sessionStorage.removeItem(this._cacheKey);

      const cached = sessionStorage.getItem(this._cacheKey);
      if (cached) {
        const { posts, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this._cacheTtl) {
          console.log('[fb-posts-container] ⚡ desde cache');
          return posts;
        }
      }

      console.log(`[fb-posts-container] 📥 cargando ${this._src}`);
      const res = await fetch(this._src);
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${this._src}`);
      const raw = await res.json();
      const sorted = sortPosts(raw);

      sessionStorage.setItem(this._cacheKey, JSON.stringify({
        posts: sorted,
        timestamp: Date.now(),
      }));
      return sorted;
    }

    _parseSdks() {
      if (window.FB) window.FB.XFBML.parse(this);

      const processIg = () => { if (window.instgrm) window.instgrm.Embeds.process(); };
      processIg();
      setTimeout(processIg, 2000);
    }

    _applyZoom() {
      this.querySelectorAll('.fb-post-zoom').forEach(div => {
        const zoom    = parseFloat(div.dataset.zoom)    || 1;
        const offsetX = parseFloat(div.dataset.offsetX) || 0;
        const offsetY = parseFloat(div.dataset.offsetY) || 0;
        if (zoom === 1 && offsetX === 0 && offsetY === 0) return;
        const iframe = div.querySelector('iframe');
        if (!iframe) return;
        iframe.style.transform       = `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`;
        iframe.style.transformOrigin = 'center center';
        iframe.style.transition      = 'none';
      });
    }

    _setupZoom() {
      /* Reintentamos varios veces porque los iframes de FB tardan en cargarse */
      [2000, 4000, 6000].forEach(ms => setTimeout(() => this._applyZoom(), ms));

      /* También al mutar (nuevos iframes) */
      const mo = new MutationObserver(mutations => {
        const hasIframe = mutations.some(m =>
          [...m.addedNodes].some(n =>
            n.tagName === 'IFRAME' || n.querySelector?.('iframe')
          )
        );
        if (hasIframe) setTimeout(() => this._applyZoom(), 100);
      });
      mo.observe(this, { childList: true, subtree: true });
      this._zoomObserver = mo;
    }

    _setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) return;

      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const wrapper = entry.target;

          /* Lazy-load + autoplay de vídeos */
          const vid = wrapper.querySelector('video[data-src]');
          if (vid) {
            if (entry.isIntersecting) {
              if (!vid.dataset.loaded) {
                vid.src = vid.dataset.src;
                vid.load();
                vid.dataset.loaded = '1';
              }
              if (wrapper.dataset.autoplay === 'true') {
                vid.play().catch(() => {});
              }
            } else {
              if (!vid.paused) { try { vid.pause(); } catch (e) {} }
            }
          }

          /* Zoom se re-aplica al entrar en vista */
          if (entry.isIntersecting) {
            setTimeout(() => this._applyZoom(), 500);
            setTimeout(() => this._applyZoom(), 1500);
          }
        });
      }, { threshold: 0.25 });

      this.querySelectorAll('.fb-post-wrapper').forEach(w => io.observe(w));
      this._intersectionObserver = io;
    }

    disconnectedCallback() {
      this._zoomObserver?.disconnect();
      this._intersectionObserver?.disconnect();
      this._floatingCleanup?.();
    }
  }

  if (!customElements.get('fb-posts-container')) {
    customElements.define('fb-posts-container', FbPostsContainer);
  }

  /* ── Hook para el SDK de Facebook ── */
  const prevFbInit = window.fbAsyncInit;
  window.fbAsyncInit = function () {
    if (typeof prevFbInit === 'function') prevFbInit();
    document.querySelectorAll('fb-posts-container').forEach(el => {
      if (el.querySelector('.fb-post')) window.FB.XFBML.parse(el);
    });
  };

})();
