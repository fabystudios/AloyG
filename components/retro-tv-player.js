/**
 * <retro-tv-player> — Reproductor MP4 estilo Televisor Retro + Glassmorphism + 3D
 *
 * Atributos:
 *   src-desktop   Ruta al video landscape para escritorio
 *   src-mobile    Ruta al video portrait/vertical para móvil
 *   title         Título en 3D sobre el televisor
 *   color         Color de acento en hex  (default: "#c8a84b")
 *   autoplay      Si está presente (o = "true"), reproduce automáticamente muteado
 *   anchor-id     ID del elemento para anclas URL (default: auto-generado)
 *
 * Ejemplo:
 *   <retro-tv-player
 *     src-desktop="./actividades/presentacion/enc_desk.mp4"
 *     src-mobile="./actividades/presentacion/enc_mob.mp4"
 *     title="✨ Encuentro Parroquial"
 *     color="#c8a84b"
 *     autoplay
 *     anchor-id="encuentro-video">
 *   </retro-tv-player>
 */
class RetroTvPlayer extends HTMLElement {

  connectedCallback() {
    const srcDesktop   = this.getAttribute('src-desktop')  || '';
    const srcMobile    = this.getAttribute('src-mobile')   || '';
    const titleText    = this.getAttribute('title')        || 'Video';
    const accentColor  = this.getAttribute('color')        || '#c8a84b';
    const autoplayAttr = this.getAttribute('autoplay');
    const doAutoplay   = autoplayAttr !== null && autoplayAttr !== 'false';
    const anchorId     = this.getAttribute('anchor-id')
                         || ('retro-tv-' + Math.random().toString(36).slice(2, 8));

    this.id = anchorId;
    const uid = 'rtv' + Math.random().toString(36).slice(2, 8);

    /* ── Color math ── */
    const hexToRgb = (hex) => {
      const c = hex.replace('#', '').padEnd(6, '0');
      return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16)
      ];
    };
    const [cr, cg, cb] = hexToRgb(accentColor);
    const dark  = `rgb(${Math.max(0, cr-80)},${Math.max(0, cg-80)},${Math.max(0, cb-80)})`;
    const mid   = `rgb(${cr},${cg},${cb})`;
    const lite  = `rgb(${Math.min(255,cr+90)},${Math.min(255,cg+90)},${Math.min(255,cb+90)})`;
    const gHigh = `rgba(${cr},${cg},${cb},0.70)`;
    const gMed  = `rgba(${cr},${cg},${cb},0.30)`;
    const gLow  = `rgba(${cr},${cg},${cb},0.12)`;

    /* ── Detect mobile for first render ── */
    const mql      = window.matchMedia('(max-width: 767px)');
    const isMob0   = mql.matches;
    const initSrc  = isMob0 ? srcMobile : srcDesktop;
    const initAR   = isMob0 ? 'portrait' : 'landscape';

    /* ════════════════════════════════════════════════════════════════
       TEMPLATE
    ════════════════════════════════════════════════════════════════ */
    this.innerHTML = `
<style>
/* ══════════════════════════════════════════════════════════
   RETRO TV PLAYER  ·  ${uid}
══════════════════════════════════════════════════════════ */

/* ─── Outer glassmorphism wrapper ─── */
.${uid}-outer {
  position: relative;
  max-width: 880px;
  margin: 2.5rem auto;
  padding: 2rem 2rem 2.8rem;
  background: rgba(10, 7, 3, 0.62);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid rgba(${cr},${cg},${cb}, 0.22);
  border-radius: 32px;
  box-shadow:
    0 40px 100px rgba(0,0,0,0.82),
    0  0   60px rgba(${cr},${cg},${cb}, 0.07),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
/* Ambient backlight */
.${uid}-outer::before {
  content: '';
  position: absolute;
  inset: -60px;
  background: radial-gradient(ellipse 70% 50% at center,
    rgba(${cr},${cg},${cb},0.16) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

/* ─── 3D Title ─── */
.${uid}-title {
  display: block;
  text-align: center;
  margin-bottom: 1.4rem;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.25rem, 4vw, 2.1rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  color: ${lite};
  /* Layered shadows create 3D extrusion */
  text-shadow:
     0  1px 0 ${mid},
     0  2px 0 ${mid},
     0  3px 0 ${dark},
     0  4px 0 ${dark},
     0  5px 0 rgba(0,0,0,0.45),
     0  7px 1px rgba(0,0,0,0.20),
     0 10px 15px rgba(0,0,0,0.55),
     0  0  30px ${gMed};
  transform: perspective(500px) rotateX(-5deg) scale(1.02);
  transform-origin: center bottom;
}

/* ─── TV Chassis ─── */
.${uid}-chassis {
  position: relative;
  background: linear-gradient(155deg,
    #3c2e18 0%, #201a0e 40%, #0e0c07 70%, #231c0e 100%);
  border-radius: 22px 22px 28px 28px;
  padding: 20px 18px 14px 18px;
  /* Multi-layer 3D depth effect */
  box-shadow:
    0  3px 0 #705e36,
    0  6px 0 #4e4022,
    0  9px 0 #302814,
    0 12px 0 #1c1409,
    0 16px 30px rgba(0,0,0,0.88),
    inset 0  2px  7px rgba(255,255,255,0.07),
    inset 0 -4px 12px rgba(0,0,0,0.55);
  transform: perspective(1000px) rotateX(2deg);
  transform-origin: center top;
}
/* Surface texture */
.${uid}-chassis::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 22px 22px 28px 28px;
  background-image: radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px);
  background-size: 5px 5px;
  pointer-events: none;
}
/* Bottom pedestal */
.${uid}-chassis::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 52%;
  height: 14px;
  background: linear-gradient(to bottom, #2a2010, #100c06);
  border-radius: 0 0 14px 14px;
  box-shadow: 0 8px 22px rgba(0,0,0,0.70);
}

/* ─── Inner flex: screen column + side knob panel ─── */
.${uid}-inner {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

/* ─── Bezel column ─── */
.${uid}-bezel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Screen bezel frame */
.${uid}-screen-wrap {
  position: relative;
  background: #07050300;
  border-radius: 14px;
  padding: 9px;
  box-shadow:
    inset 0 0 0 2px #4a3e26,
    inset 0 0 0 5px #0b0906,
    inset 0 8px 22px rgba(0,0,0,0.98);
}
/* Phosphor glow ring around bezel */
.${uid}-screen-wrap::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 13px;
  box-shadow:
    0 0 20px 4px rgba(${cr},${cg},${cb},0.18),
    0 0 55px 8px rgba(${cr},${cg},${cb},0.07);
  pointer-events: none;
  z-index: 0;
}

/* CRT screen */
.${uid}-screen {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
  box-shadow:
    inset 0  0  80px rgba(0,0,0,0.99),
    inset  5px  5px 28px rgba(255,255,255,0.025),
    inset -5px -5px 28px rgba(0,0,0,0.85);
}
.${uid}-screen.landscape { aspect-ratio: 16 / 9; }
.${uid}-screen.portrait  { aspect-ratio: 9 / 16; max-width: 220px; margin: 0 auto; }

/* Vignette (CRT tube curve) */
.${uid}-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: radial-gradient(ellipse at center,
    transparent 40%, rgba(0,0,0,0.78) 100%);
  pointer-events: none;
  z-index: 5;
}

/* Video element */
.${uid}-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  filter: brightness(0.90) contrast(1.10) saturate(1.06);
}

/* Scanlines overlay */
.${uid}-scanlines {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: repeating-linear-gradient(
    180deg,
    transparent      0px,
    transparent      2px,
    rgba(0,0,0,0.09) 2px,
    rgba(0,0,0,0.09) 4px
  );
  pointer-events: none;
  z-index: 6;
}

/* Screen glare / reflection */
.${uid}-glare {
  position: absolute;
  top: 3%;
  left: 5%;
  width: 44%;
  height: 36%;
  background: radial-gradient(ellipse at 28% 18%,
    rgba(255,255,255,0.07) 0%, transparent 68%);
  transform: rotate(-12deg);
  pointer-events: none;
  z-index: 7;
}

/* ─── Power-on animation ─── */
@keyframes ${uid}-poweron {
  0%   { opacity: 0; transform: scaleY(0.004); filter: brightness(6) blur(8px); }
  12%  { opacity: 1; transform: scaleY(1);     filter: brightness(3) blur(2px); }
  35%  { filter: brightness(1.5); }
  100% { filter: brightness(0.90) contrast(1.10) saturate(1.06); }
}
.${uid}-video.poweron {
  animation: ${uid}-poweron 1s ease-out forwards;
}

/* Subtle flicker while playing */
@keyframes ${uid}-flicker {
  0%,50%,52%,57%,58%,100% { opacity: 1; }
  51%  { opacity: 0.86; }
  56%  { opacity: 0.93; }
}
.${uid}-video.playing {
  animation: ${uid}-flicker 14s 2s infinite;
}

/* ─── Controls bar ─── */
.${uid}-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: rgba(0,0,0,0.52);
  border-radius: 0 0 10px 10px;
  border-top: 1px solid rgba(${cr},${cg},${cb},0.14);
}

.${uid}-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  color: ${mid};
  transition: color 0.2s, background 0.2s, transform 0.12s;
  outline: none;
}
.${uid}-btn:hover  { color: ${lite}; background: rgba(${cr},${cg},${cb},0.15); }
.${uid}-btn:active { transform: scale(0.88); }
.${uid}-btn:focus-visible { outline: 2px solid ${mid}; }

/* Progress bar */
.${uid}-prog-wrap {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.${uid}-prog-bar {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, ${dark} 0%, ${mid} 55%, ${lite} 100%);
  border-radius: 4px;
  box-shadow: 0 0 8px ${gMed};
  transition: width 0.1s linear;
}
.${uid}-time {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: rgba(${cr},${cg},${cb},0.72);
  white-space: nowrap;
  min-width: 72px;
  text-align: right;
  flex-shrink: 0;
}

/* ─── Side panel (knob area) ─── */
.${uid}-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 70px;
  min-width: 70px;
  background: linear-gradient(180deg, #1e1a0e 0%, #0e0c07 100%);
  border-radius: 0 12px 12px 0;
  padding: 18px 8px;
  box-shadow: inset 2px 0 8px rgba(0,0,0,0.5);
}

/* ─── Volume Knob ─── */
.${uid}-knob-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

/* Outer ring with groove marks */
.${uid}-knob-ring {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background:
    /* Notches as conic gradient */
    conic-gradient(
      from 220deg,
      #2e2618  0deg,
      #5a4c2e 35deg,
      #e0d0a0 55deg,
      #786840 75deg,
      #2e2618 110deg,
      #5a4c2e 175deg,
      #e0d0a0 210deg,
      #786840 235deg,
      #2e2618 360deg
    );
  box-shadow:
    0 5px 12px rgba(0,0,0,0.88),
    0 1px 2px rgba(255,255,255,0.09),
    0 0 0 2px #503e20,
    0 0 0 4px #1a1508;
  transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  /* Default: turned all the way left = muted */
  transform: rotate(-140deg);
}
/* Center cap */
.${uid}-knob-ring::before {
  content: '';
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%,
    #4a4030 0%, #1e1a0e 60%, #0e0c07 100%);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.05));
}
/* Pointer / indicator mark */
.${uid}-knob-ring::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 11px;
  background: ${lite};
  border-radius: 2px;
  box-shadow: 0 0 6px ${gMed};
}

/* Active state: sound on */
.${uid}-knob-ring.active {
  transform: rotate(10deg);
  box-shadow:
    0 5px 12px rgba(0,0,0,0.88),
    0 1px 2px rgba(255,255,255,0.09),
    0 0 0 2px ${mid},
    0 0 0 4px #1a1508,
    0 0 18px 5px ${gMed};
}

/* Hover pulse */
.${uid}-knob-group:hover .${uid}-knob-ring {
  box-shadow:
    0 5px 12px rgba(0,0,0,0.88),
    0 0 0 2px ${mid},
    0 0 0 4px #1a1508,
    0 0 12px 3px ${gLow};
}

.${uid}-knob-label {
  font-family: monospace;
  font-size: 8px;
  letter-spacing: 0.09em;
  color: rgba(${cr},${cg},${cb},0.50);
  text-transform: uppercase;
  text-align: center;
}

/* LED indicator */
.${uid}-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #111;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
  transition: background 0.3s, box-shadow 0.3s;
}
.${uid}-led.on {
  background: ${mid};
  box-shadow: 0 0 7px 2px ${gMed}, 0 0 16px 4px ${gLow};
}

/* Brand badge */
.${uid}-brand {
  font-family: monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: rgba(${cr},${cg},${cb},0.30);
  text-transform: uppercase;
  text-align: center;
  margin-top: 10px;
}

/* ─── Mobile: side panel becomes bottom strip ─── */
@media (max-width: 767px) {
  .${uid}-outer {
    margin: 1.5rem 0.5rem;
    padding: 1.2rem 1rem 1.6rem;
    border-radius: 24px;
  }
  .${uid}-inner {
    flex-direction: column;
    gap: 0;
  }
  .${uid}-side {
    flex-direction: row;
    width: 100%;
    min-width: unset;
    border-radius: 0 0 14px 14px;
    padding: 10px 20px;
    justify-content: center;
    gap: 26px;
  }
  .${uid}-knob-group { flex-direction: row; align-items: center; gap: 12px; }
  .${uid}-screen.portrait { max-width: 180px; }
}
</style>

<div class="${uid}-outer">

  <!-- 3D Title -->
  <span class="${uid}-title">${titleText}</span>

  <!-- TV Chassis -->
  <div class="${uid}-chassis">
    <div class="${uid}-inner">

      <!-- ── Screen column ── -->
      <div class="${uid}-bezel">

        <!-- Bezel + CRT screen -->
        <div class="${uid}-screen-wrap">
          <div class="${uid}-screen ${initAR}" id="${uid}-screen">
            <video
              class="${uid}-video"
              id="${uid}-video"
              src="${initSrc}"
              ${doAutoplay ? 'autoplay' : ''}
              muted
              playsinline
              loop
              preload="metadata"
            ></video>
            <div class="${uid}-scanlines"></div>
            <div class="${uid}-glare"></div>
          </div>
        </div>

        <!-- Controls bar -->
        <div class="${uid}-controls">

          <!-- Play / Pause -->
          <button class="${uid}-btn" id="${uid}-playbtn"
                  aria-label="${doAutoplay ? 'Pausar' : 'Reproducir'}">
            <i class="material-icons" style="font-size:22px">
              ${doAutoplay ? 'pause' : 'play_arrow'}
            </i>
          </button>

          <!-- Rewind 10 s -->
          <button class="${uid}-btn" id="${uid}-rewbtn" aria-label="Retroceder 10 segundos">
            <i class="material-icons" style="font-size:18px">replay_10</i>
          </button>

          <!-- Seek bar -->
          <div class="${uid}-prog-wrap" id="${uid}-prog-wrap" role="slider"
               aria-label="Progreso del video">
            <div class="${uid}-prog-bar" id="${uid}-prog-bar"></div>
          </div>

          <!-- Time -->
          <span class="${uid}-time" id="${uid}-time" aria-live="off">0:00 / 0:00</span>

          <!-- Fullscreen -->
          <button class="${uid}-btn" id="${uid}-fsbtn" aria-label="Pantalla completa">
            <i class="material-icons" style="font-size:18px">fullscreen</i>
          </button>

        </div><!-- /controls -->
      </div><!-- /bezel -->

      <!-- ── Side panel with knob ── -->
      <div class="${uid}-side">
        <div class="${uid}-knob-group" id="${uid}-knob-grp"
             role="button" tabindex="0"
             aria-label="Audio: click para activar o silenciar">
          <div class="${uid}-knob-ring" id="${uid}-knob"></div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <span class="${uid}-knob-label">Audio</span>
            <div class="${uid}-led" id="${uid}-led"></div>
          </div>
        </div>
      </div>

    </div><!-- /.inner -->

    <div class="${uid}-brand">◈ RetroVision ◈</div>
  </div><!-- /.chassis -->

</div><!-- /.outer -->
`;

    this._init(uid, srcDesktop, srcMobile, doAutoplay, mql);
  }

  /* ════════════════════════════════════════════════════════════════
     INTERACTIVITY
  ════════════════════════════════════════════════════════════════ */
  _init(uid, srcDesktop, srcMobile, doAutoplay, mql) {
    const video    = document.getElementById(`${uid}-video`);
    const playBtn  = document.getElementById(`${uid}-playbtn`);
    const rewBtn   = document.getElementById(`${uid}-rewbtn`);
    const progWrap = document.getElementById(`${uid}-prog-wrap`);
    const progBar  = document.getElementById(`${uid}-prog-bar`);
    const timeEl   = document.getElementById(`${uid}-time`);
    const knob     = document.getElementById(`${uid}-knob`);
    const knobGrp  = document.getElementById(`${uid}-knob-grp`);
    const led      = document.getElementById(`${uid}-led`);
    const screen   = document.getElementById(`${uid}-screen`);
    const fsBtn    = document.getElementById(`${uid}-fsbtn`);

    if (!video) return;

    /* ── Helpers ── */
    const fmt = s =>
      `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    const setPlayIcon = (playing) => {
      playBtn.querySelector('i').textContent = playing ? 'pause' : 'play_arrow';
      playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
      playing ? video.classList.add('playing') : video.classList.remove('playing');
    };

    /* ── Time update → progress ── */
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      progBar.style.width = `${(video.currentTime / video.duration) * 100}%`;
      timeEl.textContent  = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
    });

    /* ── Sync play/pause icon with actual video state ── */
    video.addEventListener('play',  () => setPlayIcon(true));
    video.addEventListener('pause', () => setPlayIcon(false));

    /* ── Play / Pause button ── */
    playBtn.addEventListener('click', () => {
      if (video.paused) video.play().catch(() => {});
      else              video.pause();
    });

    /* ── Rewind 10 s ── */
    rewBtn.addEventListener('click', () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    });

    /* ── Seek bar (click + drag) ── */
    let seeking = false;
    const seekTo = (clientX) => {
      const rect = progWrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (video.duration) video.currentTime = pct * video.duration;
    };
    progWrap.addEventListener('mousedown', (e) => { seeking = true; seekTo(e.clientX); });
    document.addEventListener('mousemove', (e) => { if (seeking) seekTo(e.clientX); });
    document.addEventListener('mouseup',   ()  => { seeking = false; });
    progWrap.addEventListener('touchstart', (e) => { seeking = true; seekTo(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('touchmove',  (e) => { if (seeking) seekTo(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('touchend',   ()  => { seeking = false; });

    /* ── Fullscreen ── */
    fsBtn.addEventListener('click', () => {
      const el = screen;
      if      (el.requestFullscreen)            el.requestFullscreen();
      else if (el.webkitRequestFullscreen)      el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen)         el.mozRequestFullScreen();
    });

    /* ── Knob → toggle audio (mute / unmute) ── */
    let isMuted = true;
    const toggleAudio = () => {
      isMuted = !isMuted;
      video.muted = isMuted;
      if (isMuted) {
        knob.classList.remove('active');
        led.classList.remove('on');
      } else {
        knob.classList.add('active');
        led.classList.add('on');
      }
    };
    knobGrp.addEventListener('click', toggleAudio);
    knobGrp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAudio(); }
    });

    /* ── Responsive: swap video source on breakpoint change ── */
    const swapSrc = (isMob) => {
      const newSrc = isMob ? srcMobile : srcDesktop;
      if (!newSrc) return;
      const wasPlaying = !video.paused;
      const ct = video.currentTime;
      video.pause();
      video.src = newSrc;
      video.load();
      video.addEventListener('loadedmetadata', () => {
        if (video.duration) video.currentTime = Math.min(ct, video.duration);
        if (wasPlaying) video.play().catch(() => {});
      }, { once: true });
      screen.classList.remove('landscape', 'portrait');
      screen.classList.add(isMob ? 'portrait' : 'landscape');
    };
    mql.addEventListener('change', (e) => swapSrc(e.matches));

    /* ── Autoplay ── */
    if (doAutoplay) {
      video.classList.add('poweron');
      video.play().catch(() => {});
    }
  }

  disconnectedCallback() {
    /* Clean up any lingering touch/mouse listeners (delegated to document) */
  }
}

customElements.define('retro-tv-player', RetroTvPlayer);
