class EfemeridesEspeciales extends HTMLElement {
  connectedCallback() {
    const jsonFile = this.getAttribute('json-file');
    this.loadEspeciales(jsonFile);
  }

  async loadEspeciales(jsonFile) {
    try {
      const response = await fetch(jsonFile);
      const especiales = await response.json();
      this.renderEspeciales(especiales);
    } catch (error) {
      this.innerHTML = '<div class="alert alert-danger">No se pudieron cargar las efemérides especiales.</div>';
    }
  }

  renderEspeciales(especiales) {
    const container = document.createElement('div');
    container.id = 'especialesContainer';
    container.className = 'd-flex justify-content-center align-items-center';
    container.style.padding = '20px 0';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 40px; position: relative; z-index: 1;';

    especiales.forEach((especial, index) => {
      const card = this.createEspecialCard(especial, index);
      wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
    this.appendChild(container);
  }

  createEspecialCard(especial, index) {
    const card = document.createElement('div');
    card.className = 'especial-card';
    card.style.animationDelay = `${index * 0.2}s`;

    const mobile = window.innerWidth <= 768;
    let videoHTML = '';
    let videoUrl = null;
    let isLocalPortrait = false;
    let isYouTube = false;

    if (mobile) {
      if (especial.videoMobile) {
        isYouTube = especial.videoMobile.includes('youtube.com') || especial.videoMobile.includes('youtu.be');
        isLocalPortrait = !isYouTube && (especial.videoMobile.endsWith('.mp4') || especial.videoMobile.startsWith('./'));
        videoUrl = especial.videoMobile;
      } else if (especial.videoDesktop) {
        isYouTube = true;
        videoUrl = especial.videoDesktop;
      }
    } else {
      if (especial.videoDesktop) {
        isYouTube = true;
        videoUrl = especial.videoDesktop;
      } else if (especial.videoMobile) {
        isYouTube = especial.videoMobile.includes('youtube.com') || especial.videoMobile.includes('youtu.be');
        isLocalPortrait = !isYouTube && (especial.videoMobile.endsWith('.mp4') || especial.videoMobile.startsWith('./'));
        videoUrl = especial.videoMobile;
      }
    }

    if (isLocalPortrait) {
      videoHTML = `
        <video class="video-player vertical-video" controls preload="metadata" playsinline
          poster="${especial.poster || ''}"
          controlsList="nodownload">
          <source src="${videoUrl}" type="video/mp4">
          Tu navegador no soporta la reproducción de video.
        </video>
      `;
    } else if (isYouTube && videoUrl) {
      const embedUrl = this.getYouTubeEmbedUrl(videoUrl, mobile);
      if (embedUrl) {
        const autoplayParams = 'autoplay=1&mute=1&rel=0';
        const sep = embedUrl.includes('?') ? '&' : '?';
        videoHTML = `
          <iframe class="video-iframe landscape-video" 
            src="${embedUrl}${sep}${autoplayParams}" 
            title="${especial.titulo}"
            frameborder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin">
          </iframe>
        `;
      }
    }

    const tituloHTML = mobile ? especial.titulo.replace(/\s*-\s*/g, '<br>') : especial.titulo;

    card.innerHTML = `
      <div class="especial-header">
        ${especial.icono ? `<img src="${especial.icono}" alt="Icono" class="icono">` : ''}
        <h1 class="especial-titulo">${tituloHTML}</h1>
        <p class="especial-fecha">${especial.fecha}</p>
      </div>
      <div class="video-container">
        <div class="video-wrapper">
          ${videoHTML}
        </div>
      </div>
    `;
    return card;
  }

  getYouTubeEmbedUrl(url, isMobile = false) {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    if (videoId) {
      const params = isMobile ? '?playsinline=1&modestbranding=1&rel=0' : '';
      return `https://www.youtube.com/embed/${videoId}${params}`;
    }
    if (url.includes('embed')) {
      return url;
    }
    return url;
  }
}

customElements.define('efemerides-especiales', EfemeridesEspeciales);
