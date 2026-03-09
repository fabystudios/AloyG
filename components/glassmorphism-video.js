class GlassmorphismVideo extends HTMLElement {
  connectedCallback() {
    const videoId = this.getAttribute('video-id');
    const title = this.getAttribute('title') || 'Video Destacado';
    const gradientColors = this.getAttribute('gradient') || '#ff9800, #ffc107';
    const icon = this.getAttribute('icon') || 'play_circle';
    const componentId = this.getAttribute('id') || '';
    const poster = this.getAttribute('poster') || '';
    
    console.log('🎥 Glassmorphism Video Component:', { videoId, title, poster });
    
    const [color1, color2] = gradientColors.split(',').map(c => c.trim());
    
    // Generar HTML del poster si existe (igual que "Reflexiones del Evangelio" que funciona)
    const posterHTML = poster ? `
      <img 
        class="video-poster-gm"
        src="${poster}" 
        alt="${title}"
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          z-index: 1;
        "
        onclick="
          this.style.display='none'; 
          this.nextElementSibling.style.display='none';
          var iframe = this.parentElement.querySelector('iframe');
          iframe.src = iframe.src.replace('${videoId}?', '${videoId}?autoplay=1&');
        "
      />
      <!-- Botón de play sobre el poster -->
      <div class="play-button-gm" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
        transition: all 0.3s ease;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      " 
      onclick="this.previousElementSibling.click();"
      onmouseover="this.style.transform='translate(-50%, -50%) scale(1.1)';"
      onmouseout="this.style.transform='translate(-50%, -50%) scale(1)';">
        <i class="material-icons" style="color: ${color1}; font-size: 48px; margin-left: 5px;">play_arrow</i>
      </div>` : '';
    
    // Soporte para video local (atributo src)
    const localSrc = this.getAttribute('src') || '';
    const loop = this.hasAttribute('loop') ? 'loop' : '';
    const autoplay = this.hasAttribute('autoplay') ? 'autoplay' : '';
    const muted = this.hasAttribute('autoplay') ? 'muted' : ''; // requerido por browsers para autoplay

    // URL del video con parámetros (igual que "Reflexiones del Evangelio" que funciona)
    const iframeSrc = `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

    // HTML del reproductor: video local o iframe de YouTube
    const playerHTML = localSrc ? `
      <video
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          object-fit: cover;
        "
        ${poster ? `poster="${poster}"` : ''}
        ${autoplay}
        ${loop}
        ${muted}
        playsinline
        controls
      >
        <source src="${localSrc}" type="video/mp4">
      </video>` : `
      ${posterHTML}
      <iframe 
        class="video-iframe-gm"
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 20px;
          z-index: 0;
        "
        src="${iframeSrc}"
        title="${title}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin">
      </iframe>`;
    
    this.innerHTML = `
      <style>
        @keyframes rotate-subtle-gm {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .gm-title {
          font-family: 'Georgia', serif;
          font-size: 1.8em;
          color: white;
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        @media (max-width: 600px) {
          .gm-title { font-size: 1.1em !important; }
          .gm-title-icon { font-size: 1.6em !important; }
          /* En mobile: video arriba, dial abajo */
          .gm-layout { flex-direction: column !important; }
          /* Dial horizontal en mobile */
          .gm-dial-wrapper { flex-direction: row !important; align-items: center !important; justify-content: center !important; width: 100% !important; }
          .gm-dial-inner { flex-direction: row !important; padding: 12px 20px !important; gap: 18px !important; width: auto !important; border-radius: 50px !important; }
        }
      </style>
      
      <div ${componentId ? `id="${componentId}"` : ''} class="video-container-gm" style="max-width: 900px; margin: 40px auto; padding: 20px; background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); border-radius: 30px; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);">
        <div class="video-card-gm" style="
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-radius: 30px;
          padding: 30px;
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.2),
            0 20px 50px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.35);
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        " 
        onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 40px 0 rgba(0, 0, 0, 0.3), 0 25px 60px rgba(0, 0, 0, 0.2)';" 
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 20px 50px rgba(0, 0, 0, 0.15)';">
          
          <!-- Efecto de brillo animado -->
          <div style="
            position: absolute; 
            top: -50%; 
            left: -50%; 
            width: 200%; 
            height: 200%; 
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%); 
            animation: rotate-subtle-gm 25s linear infinite; 
            pointer-events: none; 
            z-index: 0;
          "></div>
          
          <!-- Contenido del video -->
          <div class="gm-layout" style="position: relative; z-index: 2; display: flex; align-items: center; gap: 24px;">
            
            <!-- Columna principal: título + video -->
            <div style="flex: 1; min-width: 0;">
              <!-- Título decorativo -->
              <div style="text-align: center; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 12px;">
                <i class="material-icons gm-title-icon" style="font-size: 2.5em; color: white; filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));">${icon}</i>
                <h3 class="gm-title">${title}</h3>
              </div>
              
              <!-- Contenedor del video responsive -->
              <div style="
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                border-radius: 20px;
                box-shadow: 
                  0 10px 30px rgba(0, 0, 0, 0.3),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.2);
              ">
                ${playerHTML}
              </div>
            </div>

            ${localSrc ? `
            <!-- Dial retro de TV -->
            <div class="gm-dial-wrapper" style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
              <div class="gm-dial-inner" style="
                background: linear-gradient(160deg, #3e2a14, #5c3d20, #2a1a08);
                border-radius: 14px;
                padding: 18px 14px;
                box-shadow: 
                  0 10px 30px rgba(0,0,0,0.7),
                  inset 0 1px 2px rgba(255,255,255,0.08),
                  inset 0 -3px 6px rgba(0,0,0,0.5);
                border: 2px solid #8B6430;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
              ">
                <!-- Luz indicadora -->
                <div class="dial-light-gm" style="
                  width: 11px; height: 11px;
                  border-radius: 50%;
                  background: #ff4444;
                  box-shadow: 0 0 8px #ff4444, 0 0 14px rgba(255,68,68,0.4);
                  transition: background 0.3s, box-shadow 0.3s;
                "></div>

                <!-- Knob exterior + interior -->
                <div class="tv-dial-gm" style="
                  position: relative;
                  width: 78px; height: 78px;
                  cursor: pointer;
                  user-select: none;
                ">
                  <!-- Anillo con estrías (simuladas con conic-gradient) -->
                  <div style="
                    position: absolute; inset: 0;
                    border-radius: 50%;
                    background: conic-gradient(
                      #3a2810 0deg,  #5a3e22 9deg,
                      #3a2810 18deg, #5a3e22 27deg,
                      #3a2810 36deg, #5a3e22 45deg,
                      #3a2810 54deg, #5a3e22 63deg,
                      #3a2810 72deg, #5a3e22 81deg,
                      #3a2810 90deg, #5a3e22 99deg,
                      #3a2810 108deg,#5a3e22 117deg,
                      #3a2810 126deg,#5a3e22 135deg,
                      #3a2810 144deg,#5a3e22 153deg,
                      #3a2810 162deg,#5a3e22 171deg,
                      #3a2810 180deg,#5a3e22 189deg,
                      #3a2810 198deg,#5a3e22 207deg,
                      #3a2810 216deg,#5a3e22 225deg,
                      #3a2810 234deg,#5a3e22 243deg,
                      #3a2810 252deg,#5a3e22 261deg,
                      #3a2810 270deg,#5a3e22 279deg,
                      #3a2810 288deg,#5a3e22 297deg,
                      #3a2810 306deg,#5a3e22 315deg,
                      #3a2810 324deg,#5a3e22 333deg,
                      #3a2810 342deg,#5a3e22 351deg,
                      #3a2810 360deg
                    );
                    box-shadow: 0 4px 14px rgba(0,0,0,0.6);
                  "></div>

                  <!-- Knob interior girador -->
                  <div class="dial-knob-gm" style="
                    position: absolute; inset: 9px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 38% 35%, #8a6035, #3a2010);
                    box-shadow: 0 3px 10px rgba(0,0,0,0.7), inset 0 1px 3px rgba(255,255,255,0.12);
                    transform: rotate(-130deg);
                    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 5px;
                  ">
                    <!-- Línea indicadora -->
                    <div style="
                      width: 3px; height: 16px;
                      background: linear-gradient(to bottom, #fff9c4, #ffd54f);
                      border-radius: 2px;
                      box-shadow: 0 0 5px rgba(255,213,79,0.9);
                    "></div>
                  </div>
                </div>

                <!-- Etiqueta -->
                <div style="
                  color: #c8972e;
                  font-family: 'Courier New', monospace;
                  font-size: 0.6em;
                  font-weight: bold;
                  letter-spacing: 3px;
                  text-shadow: 0 0 8px rgba(200,151,46,0.6);
                ">AUDIO</div>
              </div>
            </div>` : ''}

          </div>
        </div>
      </div>
    `;

    // Event listener del dial (solo para video local)
    if (localSrc) {
      const dial = this.querySelector('.tv-dial-gm');
      const video = this.querySelector('video');
      const light = this.querySelector('.dial-light-gm');
      const knob = this.querySelector('.dial-knob-gm');

      if (dial && video) {
        dial.addEventListener('click', () => {
          video.muted = !video.muted;
          const angle = video.muted ? -130 : 40;
          knob.style.transform = `rotate(${angle}deg)`;
          if (video.muted) {
            light.style.background = '#ff4444';
            light.style.boxShadow = '0 0 8px #ff4444, 0 0 14px rgba(255,68,68,0.4)';
          } else {
            light.style.background = '#44ff88';
            light.style.boxShadow = '0 0 8px #44ff88, 0 0 14px rgba(68,255,136,0.4)';
          }
        });
      }
    }
  }
}

customElements.define('glassmorphism-video', GlassmorphismVideo);
