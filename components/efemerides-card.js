class EfemeridesCard extends HTMLElement {
  connectedCallback() {
    const jsonFile = this.getAttribute('json-file');
    const cardType = this.getAttribute('card-type') || 'especiales';
    this.loadEfemerides(jsonFile, cardType);
  }

  async loadEfemerides(jsonFile, cardType) {
    try {
      const response = await fetch(jsonFile);
      const items = await response.json();
      if (cardType === 'especiales') {
        this.renderEspeciales(items);
      } else if (cardType === 'santos') {
        this.renderSantos(items);
      }
    } catch (error) {
      console.error(`Error al cargar ${cardType}:`, error);
    }
  }

  renderEspeciales(especiales) {
    const container = document.createElement('div');
    container.id = 'especialesContainer';
    container.className = 'd-flex justify-content-center align-items-center';
    container.style.padding = '20px 0';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:40px;position:relative;z-index:1;';
    especiales.forEach((especial, index) => {
      wrapper.appendChild(this.createEspecialCard(especial, index));
    });
    container.appendChild(wrapper);
    this.appendChild(container);
  }

  createEspecialCard(especial, index) {
    const card = document.createElement('div');
    card.className = 'especial-card';
    card.style.animationDelay = `${index * 0.2}s`;

    const isMobileWidth = window.innerWidth <= 768;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const mobile = isMobileWidth || isMobileDevice;

    let videoHTML = '', isLocalVideo = false, isYouTubeVideo = false, wrapperClass = '', videoUrl = null;

    if (mobile) {
      if (especial.videoMobile) {
        const isYT = especial.videoMobile.includes('youtube.com') || especial.videoMobile.includes('youtu.be');
        videoUrl = especial.videoMobile;
        isYouTubeVideo = isYT; isLocalVideo = !isYT;
        wrapperClass = isYT ? 'video-horizontal' : 'video-vertical';
      } else if (especial.videoDesktop) {
        videoUrl = especial.videoDesktop; isYouTubeVideo = true; wrapperClass = 'video-horizontal';
      }
    } else {
      if (especial.videoDesktop) {
        videoUrl = especial.videoDesktop; isYouTubeVideo = true; wrapperClass = 'video-horizontal';
      } else if (especial.videoMobile) {
        const isYT = especial.videoMobile.includes('youtube.com') || especial.videoMobile.includes('youtu.be');
        videoUrl = especial.videoMobile;
        isYouTubeVideo = isYT; isLocalVideo = !isYT;
        wrapperClass = isYT ? 'video-horizontal' : 'video-vertical';
      }
    }

    if (isLocalVideo) {
      videoHTML = `<video class="especial-video-player vertical-video" controls preload="metadata" autoplay muted loop playsinline poster="${especial.poster || ''}" controlsList="nodownload"><source src="${videoUrl}" type="video/mp4">Tu navegador no soporta video.</video>`;
    } else if (isYouTubeVideo) {
      const embedUrl = this.getYouTubeEmbedUrl(videoUrl, mobile);
      if (embedUrl) {
        const sep = embedUrl.includes('?') ? '&' : '?';
        videoHTML = `<iframe class="especial-video-iframe landscape-video" src="${embedUrl}${sep}autoplay=1&mute=1&rel=0" title="${especial.titulo}" frameborder="0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      }
    }

    const tituloHTML = mobile ? especial.titulo.replace(/\s*-\s*/g, '<br>') : especial.titulo;
    card.innerHTML = `
      <div class="especial-header">
        ${especial.icono ? `<img src="${especial.icono}" alt="Icono" class="icono">` : ''}
        <h1 class="especial-titulo">${tituloHTML}</h1>
        <p class="especial-fecha">${especial.fecha}</p>
        ${especial.subtitulo ? `<p class="especial-subtitulo">${especial.subtitulo}</p>` : ''}
      </div>
      <div class="especial-video-container">
        <div class="especial-video-wrapper ${wrapperClass}">${videoHTML}</div>
      </div>`;
    return card;
  }

  renderSantos(videos) {
    const container = document.createElement('div');
    container.id = 'videosCatolicos';
    container.className = 'section-padding d-flex justify-content-center align-items-center deshabilitado';
    container.style.minHeight = '65vh';
    const wrapper = document.createElement('div');
    wrapper.id = 'santosVideosContainer';
    wrapper.className = 'd-flex flex-wrap justify-content-center gap-4';
    wrapper.style.cssText = 'width:95vw;max-width:1400px;';
    videos.forEach(video => wrapper.appendChild(this.createSantoCard(video)));
    container.appendChild(wrapper);
    this.appendChild(container);
  }

  createSantoCard(video) {
    let visibilityClass = '';
    if (!video.showOnMobile && video.showOnDesktop) visibilityClass = 'd-none d-md-block';
    else if (video.showOnMobile && !video.showOnDesktop) visibilityClass = 'd-md-none';
    const card = document.createElement('div');
    card.className = `card90 shadow-lg rounded-4 overflow-hidden ${visibilityClass}`.trim();
    card.style.cssText = 'width:90vw;max-width:400px;';
    card.innerHTML = `
      <div class="position-relative text-center p-3" style="background:linear-gradient(45deg,#1c9bb7,#2900f5);color:white;">
        <h2 class="fw-bold mb-0" style="color:white;font-size:2.1em;text-shadow:2px 2px 4px rgba(0,0,0,0.7);">${video.fecha}</h2>
        <p class="mb-0 mt-1" style="color:#e0e7ff;font-size:${video.santoFontSize};font-weight:500;line-height:1.3;">${video.santo}</p>
        <img src="${video.icono}" alt="Icono ${video.santo}" style="width:${video.iconoWidth};position:absolute;top:10px;right:10px;border-radius:50%;">
      </div>
      <div class="p-3 d-flex justify-content-center santos-video-container" style="min-height:450px;">
        <div style="width:100%;max-width:400px;background:url('./img/corpusCh.jpeg') center/cover no-repeat;border-radius:12px;padding:12px;">
          <video class="santos-video-player" controls preload="metadata" autoplay muted loop playsinline style="width:100%;height:400px;border:none;border-radius:12px;background:transparent;" poster="${video.poster}">
            <source src="${video.video}" type="${video.video.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">
            Tu navegador no soporta video.
          </video>
        </div>
      </div>`;
    return card;
  }

  getYouTubeEmbedUrl(url, isMobile = false) {
    if (!url) return null;
    const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    if (videoId) return `https://www.youtube.com/embed/${videoId}${isMobile ? '?playsinline=1&modestbranding=1&rel=0' : ''}`;
    return url.includes('embed') ? url : url;
  }
}

customElements.define('efemerides-card', EfemeridesCard);
