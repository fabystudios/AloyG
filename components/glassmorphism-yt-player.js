/**
 * <glassmorphism-yt-player> — Web Component para reproductor YouTube con efecto glassmorphism
 *
 * Atributos:
 *   video-id        (requerido)  ID del video de YouTube (p.ej. "Vt2BAUdpQAY")
 *   title                        Título principal  (default: "Video")
 *   subtitle                     Subtítulo debajo del título (default: "")
 *   poster                       Ruta del poster/thumbnail (default: "")
 *   gradient                     Gradiente del contenedor exterior, hex separados por coma
 *                                (default: "#667eea, #764ba2")
 *   glass-color1                 Color primario de la tarjeta glass (default: rgba(255,255,255,0.25))
 *   glass-color2                 Color secundario de la tarjeta glass (default: rgba(255,255,255,0.15))
 *   glow-color                   Color del resplandor animado (default: rgba(255,255,255,0.12))
 *   border-color                 Color del borde de la tarjeta y el wrapper de video
 *                                (default: rgba(255,255,255,0.30))
 *   title-color                  Color del título (default: white)
 *   subtitle-color               Color del subtítulo (default: rgba(255,255,255,0.90))
 *   control-color                Color de los iconos de los botones de control
 *                                (default: primer color del gradiente)
 *   max-width                    Ancho máximo del contenedor (default: "900px")
 *   margin                       Margen del contenedor (default: "40px auto")
 *
 * Ejemplo de uso:
 *   <glassmorphism-yt-player
 *     video-id="Vt2BAUdpQAY"
 *     title="✝️ Reflexiones del Evangelio"
 *     subtitle="📅 Semana del 1 al 5 de marzo"
 *     poster="./img/miniatura-reflexiones.png"
 *     gradient="#667eea, #764ba2">
 *   </glassmorphism-yt-player>
 */
class GlassmorphismYTPlayer extends HTMLElement {
  connectedCallback() {
    const videoId       = this.getAttribute('video-id') || '';
    const title         = this.getAttribute('title') || 'Video';
    const subtitle      = this.getAttribute('subtitle') || '';
    const poster        = this.getAttribute('poster') || '';
    const maxWidth      = this.getAttribute('max-width') || '900px';
    const margin        = this.getAttribute('margin') || '40px auto';

    // Gradiente exterior
    const gradient      = this.getAttribute('gradient') || '#667eea, #764ba2';
    const gradParts     = gradient.split(',').map(c => c.trim());
    const col1          = gradParts[0];
    const col2          = gradParts[1] || col1;

    // Colores glassmorphism de la tarjeta interior
    const glass1        = this.getAttribute('glass-color1') || 'rgba(255,255,255,0.25)';
    const glass2        = this.getAttribute('glass-color2') || 'rgba(255,255,255,0.15)';

    // Colores varios
    const glowColor     = this.getAttribute('glow-color')     || 'rgba(255,255,255,0.12)';
    const borderColor   = this.getAttribute('border-color')   || 'rgba(255,255,255,0.30)';
    const titleColor    = this.getAttribute('title-color')    || 'white';
    const subtitleColor = this.getAttribute('subtitle-color') || 'rgba(255,255,255,0.90)';
    const controlColor  = this.getAttribute('control-color')  || col1;

    // ID único por instancia para aislar los estilos CSS en light DOM
    const uid = 'gyt-' + Math.random().toString(36).slice(2, 8);
    this.setAttribute('data-gyt', uid);
    const S = `[data-gyt="${uid}"]`; // selector de scope

    const iframeSrc = `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

    const posterHTML = poster ? `
      <img
        class="gyt-poster"
        src="${poster}"
        alt="${title}"
        style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;cursor:pointer;z-index:1;"
      />
      <div class="gyt-play-btn" style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:80px;height:80px;
        background:rgba(200,0,0,0.85);
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;z-index:2;
        transition:all 0.3s ease;
        box-shadow:0 8px 20px rgba(0,0,0,0.35);
      ">
        <i class="material-icons" style="color:white;font-size:48px;margin-left:5px;">play_arrow</i>
      </div>` : '';

    this.innerHTML = `
      <style>
        @keyframes gyt-rotate-${uid} {
          to { transform: rotate(360deg); }
        }

        /* ── Contenedor exterior ── */
        ${S} .gyt-container {
          max-width: ${maxWidth};
          margin: ${margin};
          padding: 20px;
          background: linear-gradient(135deg, ${col1} 0%, ${col2} 100%);
          border-radius: 30px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.30);
        }

        /* ── Tarjeta glassmorphism ── */
        ${S} .gyt-card {
          background: linear-gradient(135deg, ${glass1}, ${glass2});
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 35px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.20),
            0 15px 40px rgba(0,0,0,0.15),
            inset 0 1px 1px rgba(255,255,255,0.50);
          border: 1px solid ${borderColor};
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        ${S} .gyt-card:hover {
          transform: translateY(-5px);
          box-shadow:
            0 12px 40px rgba(0,0,0,0.30),
            0 20px 50px rgba(0,0,0,0.20),
            inset 0 1px 1px rgba(255,255,255,0.60);
        }

        /* ── Resplandor animado ── */
        ${S} .gyt-glow {
          position: absolute; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
          animation: gyt-rotate-${uid} 30s linear infinite;
          pointer-events: none; z-index: 0;
        }

        /* ── Tipografía ── */
        ${S} .gyt-title {
          font-family: 'Georgia', serif;
          font-size: 2.2em;
          color: ${titleColor};
          margin: 0 0 10px 0;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.30);
        }
        ${S} .gyt-subtitle {
          font-size: 1.2em;
          color: ${subtitleColor};
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.3px;
          text-shadow: 0 1px 5px rgba(0,0,0,0.20);
        }

        /* ── Wrapper del video ── */
        ${S} .gyt-video-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 10px 30px rgba(0,0,0,0.30),
            inset 0 1px 1px rgba(255,255,255,0.30);
          border: 2px solid ${borderColor};
        }
        ${S} .gyt-video-box {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
        }
        ${S} .gyt-iframe {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0; border: none;
        }

        /* ── Barra de controles ── */
        ${S} .gyt-controls {
          display: none;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          padding: 15px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.20);
        }
        ${S} .gyt-ctrl-btn {
          width: 50px; height: 50px;
          border-radius: 50%; border: none;
          background: rgba(255,255,255,0.90);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.20);
        }
        ${S} .gyt-ctrl-btn:hover {
          transform: scale(1.1);
          background: white;
        }
        ${S} .gyt-ctrl-btn .material-icons {
          color: ${controlColor};
          font-size: 28px;
        }

        /* ── Responsive: recorte cuadrado en mobile ── */
        @media (max-width: 768px) {
          ${S} .gyt-video-box  { padding-bottom: 100% !important; }
          ${S} .gyt-iframe     { width: 177.78% !important; left: 50% !important; transform: translateX(-50%) !important; }
          ${S} .gyt-poster     { width: 177.78% !important; left: 50% !important; transform: translateX(-50%) !important; }
          ${S} .gyt-card       { padding: 20px !important; }
          ${S} .gyt-title      { font-size: 1.5em !important; }
          ${S} .gyt-subtitle   { font-size: 1em !important; }
        }
      </style>

      <div class="gyt-container">
        <div class="gyt-card">
          <div class="gyt-glow"></div>
          <div style="position:relative;z-index:2;">

            <!-- Encabezado -->
            <div style="text-align:center;margin-bottom:25px;">
              <h2 class="gyt-title">${title}</h2>
              ${subtitle ? `<p class="gyt-subtitle">${subtitle}</p>` : ''}
            </div>

            <!-- Video -->
            <div class="gyt-video-wrapper">
              <div class="gyt-video-box">
                ${posterHTML}
                <iframe
                  class="gyt-iframe"
                  src="${iframeSrc}"
                  title="${title}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  referrerpolicy="strict-origin-when-cross-origin">
                </iframe>
              </div>
            </div>

            <!-- Controles -->
            <div class="gyt-controls">
              <button class="gyt-ctrl-btn gyt-btn-play" title="Play / Pausa">
                <i class="material-icons">pause</i>
              </button>
              <button class="gyt-ctrl-btn gyt-btn-mute" title="Silenciar / Activar sonido">
                <i class="material-icons">volume_up</i>
              </button>
              <button class="gyt-ctrl-btn gyt-btn-fs" title="Pantalla completa">
                <i class="material-icons">fullscreen</i>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    // ── Lógica de interacción ──
    const posterEl        = this.querySelector('.gyt-poster');
    const playBtnOverlay  = this.querySelector('.gyt-play-btn');
    const iframe          = this.querySelector('.gyt-iframe');
    const controls        = this.querySelector('.gyt-controls');
    const btnPlay         = this.querySelector('.gyt-btn-play');
    const btnMute         = this.querySelector('.gyt-btn-mute');
    const btnFs           = this.querySelector('.gyt-btn-fs');

    let isPlaying = true;
    let isMuted   = false;

    const activateVideo = () => {
      if (posterEl)       posterEl.style.display      = 'none';
      if (playBtnOverlay) playBtnOverlay.style.display = 'none';
      iframe.src = iframe.src.replace(`${videoId}?`, `${videoId}?autoplay=1&`);
      controls.style.display = 'flex';
    };

    if (posterEl)       posterEl.addEventListener('click', activateVideo);
    if (playBtnOverlay) playBtnOverlay.addEventListener('click', activateVideo);

    btnPlay.addEventListener('click', () => {
      const icon = btnPlay.querySelector('.material-icons');
      if (isPlaying) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        icon.textContent = 'play_arrow';
      } else {
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        icon.textContent = 'pause';
      }
      isPlaying = !isPlaying;
    });

    btnMute.addEventListener('click', () => {
      const icon = btnMute.querySelector('.material-icons');
      if (isMuted) {
        iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        icon.textContent = 'volume_up';
      } else {
        iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        icon.textContent = 'volume_off';
      }
      isMuted = !isMuted;
    });

    btnFs.addEventListener('click', () => {
      const wrapper = this.querySelector('.gyt-video-wrapper');
      if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
      } else {
        document.exitFullscreen();
      }
    });
  }
}

customElements.define('glassmorphism-yt-player', GlassmorphismYTPlayer);
