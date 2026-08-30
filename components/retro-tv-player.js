/**
 * <retro-tv-player> — Reproductor MP4 estilo Televisor Retro + Glassmorphism + 3D
 *
 * Atributos:
 *   src-desktop    Ruta al video landscape para escritorio
 *   src-mobile     Ruta al video portrait/vertical para móvil
 *   title          Título en 3D sobre el televisor
 *   color          Color de acento en hex  (default: "#c8a84b")
 *   bg-color       Color de fondo del panel de vidrio exterior en hex (default: "#0a0703")
 *   device-color   Color del gabinete/chasis del televisor en hex (default: "#3c2e18")
 *   screen-effect  Efecto visual de la pantalla: "tubo-retro" (default, líneas + sombreado
 *                  tipo tubo CRT), "led" (pantalla LED plana, grilla de píxeles, colores
 *                  vívidos), "vhs" (barra de tracking, scanlines de cinta, colores lavados)
 *                  o "moderno" (panel plano tipo LCD/OLED actual, sin viñeta ni scanlines,
 *                  biseles casi rectos y brillo de vidrio sutil)
 *   chassis        Tipo de gabinete: "tv" (default, televisor retro con pedestal) o
 *                  "ipod" (reproductor tipo MP4/iPod vertical, pantalla más grande y
 *                  presente, con un 2do visor tipo display MP3 donde el título corre
 *                  en marquesina: fondo oscuro, texto blanco pixelado)
 *   link-href      URL de destino. Si se define, el player agrega un botón y/o hace
 *                  clickeable la pantalla (ver link-mode). Si no se define, no cambia nada.
 *   link-target    Target del link: "_self" (default, misma pestaña) o "_blank" (nueva)
 *   link-mode      Dónde se activa el link: "button" (default, botón debajo del chasis),
 *                  "screen" (toda la pantalla/visor es clickeable) o "both" (ambas)
 *   link-label     Texto del botón (default: "Ver más")
 *   autoplay       Si está presente (o = "true"), reproduce automáticamente muteado
 *   anchor-id      ID del elemento para anclas URL (default: auto-generado)
 *
 * Ejemplo:
 *   <retro-tv-player
 *     src-desktop="./actividades/presentacion/enc_desk.mp4"
 *     src-mobile="./actividades/presentacion/enc_mob.mp4"
 *     title="✨ Encuentro Parroquial"
 *     color="#c8a84b"
 *     bg-color="#0a0703"
 *     device-color="#3c2e18"
 *     screen-effect="led"
 *     chassis="ipod"
 *     link-href="https://miparroquia.org/encuentro"
 *     link-mode="both"
 *     link-label="Ver galería completa"
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
    const bgColor      = this.getAttribute('bg-color')     || '#0a0703';
    const deviceColor  = this.getAttribute('device-color') || '#3c2e18';
    const ALLOWED_FX   = ['tubo-retro', 'led', 'vhs', 'moderno'];
    const rawFx        = (this.getAttribute('screen-effect') || 'tubo-retro').toLowerCase().trim();
    const screenEffect = ALLOWED_FX.includes(rawFx) ? rawFx : 'tubo-retro';
    const autoplayAttr = this.getAttribute('autoplay');
    const doAutoplay   = autoplayAttr !== null && autoplayAttr !== 'false';
    const ALLOWED_CHASSIS = ['tv', 'ipod'];
    const rawChassis   = (this.getAttribute('chassis') || 'tv').toLowerCase().trim();
    const chassisType  = ALLOWED_CHASSIS.includes(rawChassis) ? rawChassis : 'tv';
    /* velocidad de la marquesina proporcional al largo del título */
    const marqueeDur   = Math.max(6, titleText.length * 0.4).toFixed(1);
    const linkHref     = this.getAttribute('link-href')   || '';
    const linkTarget   = this.getAttribute('link-target') || '_self';
    const linkLabel    = this.getAttribute('link-label')  || 'Ver más';
    const ALLOWED_LINKMODE = ['button', 'screen', 'both'];
    const rawLinkMode  = (this.getAttribute('link-mode') || 'button').toLowerCase().trim();
    const linkMode     = ALLOWED_LINKMODE.includes(rawLinkMode) ? rawLinkMode : 'button';
    const hasLink      = linkHref.length > 0;
    const showBtn      = hasLink && (linkMode === 'button' || linkMode === 'both');
    const showScreenLnk= hasLink && (linkMode === 'screen' || linkMode === 'both');
    const linkRel      = linkTarget === '_blank' ? 'rel="noopener noreferrer"' : '';
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

    /* ── Fondo del panel exterior ── */
    const [bgR, bgG, bgB] = hexToRgb(bgColor);

    /* ── Paleta del gabinete/chasis a partir de device-color ──
       Se generan variantes claras/oscuras manteniendo las mismas
       proporciones relativas del diseño original (base = #3c2e18). */
    const shade = (factor) => {
      const c = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
      return `rgb(${c(dr)},${c(dg)},${c(db)})`;
    };
    const [dr, dg, db] = hexToRgb(deviceColor);
    const chassisA = shade(1.00);  // cara superior del gabinete
    const chassisB = shade(0.56);
    const chassisC = shade(0.24);  // panel lateral (extremo) / sombra profunda
    const chassisD = shade(0.59);
    const rimA     = shade(1.87);  // filos 3D iluminados
    const rimB     = shade(1.30);
    const rimC     = shade(0.80);
    const rimD     = shade(0.47);
    const sideA    = shade(0.50);  // panel lateral (inicio)
    const pedA     = shade(0.70);  // pedestal
    const pedB     = shade(0.27);
    const bezelA   = shade(1.23);  // marco de la pantalla
    const bezelB   = shade(0.18);

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
  background: rgba(${bgR}, ${bgG}, ${bgB}, 0.62);
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
@media (max-width: 767px) {
  .${uid}-outer::before {
    inset: -60px 0;  /* evita desbordamiento horizontal en móvil */
  }
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
    ${chassisA} 0%, ${chassisB} 40%, ${chassisC} 70%, ${chassisD} 100%);
  border-radius: 22px 22px 28px 28px;
  padding: 20px 18px 14px 18px;
  /* Multi-layer 3D depth effect */
  box-shadow:
    0  3px 0 ${rimA},
    0  6px 0 ${rimB},
    0  9px 0 ${rimC},
    0 12px 0 ${rimD},
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
  background: linear-gradient(to bottom, ${pedA}, ${pedB});
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
    inset 0 0 0 2px ${bezelA},
    inset 0 0 0 5px ${bezelB},
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

/* ══════════════════════════════════════════════════════════
   EFECTOS DE PANTALLA  ·  screen-effect="tubo-retro|led|vhs|moderno"
   Default = tubo-retro (estilos base ya definidos arriba).
══════════════════════════════════════════════════════════ */

/* Overlays extra, ocultos salvo que su efecto esté activo */
.${uid}-ledgrid,
.${uid}-vhsbar {
  display: none;
  pointer-events: none;
  position: absolute;
}

/* ─── Efecto LED: pantalla plana, grilla de píxeles, colores vívidos ─── */
.${uid}-screen.effect-led {
  box-shadow:
    inset 0 0 0 1px rgba(${cr},${cg},${cb},0.30),
    inset 0  0 90px rgba(0,0,0,0.92);
}
.${uid}-screen.effect-led::after {
  background: radial-gradient(ellipse at center,
    transparent 72%, rgba(0,0,0,0.32) 100%);
}
.${uid}-screen.effect-led .${uid}-scanlines { display: none; }
.${uid}-screen.effect-led .${uid}-glare { opacity: 0.35; }
.${uid}-screen.effect-led .${uid}-ledgrid {
  display: block;
  inset: 0;
  border-radius: 8px;
  background-image:
    repeating-linear-gradient(90deg,
      rgba(0,0,0,0.30) 0px, rgba(0,0,0,0.30) 1px,
      transparent 1px, transparent 3px),
    repeating-linear-gradient(0deg,
      rgba(0,0,0,0.30) 0px, rgba(0,0,0,0.30) 1px,
      transparent 1px, transparent 3px);
  mix-blend-mode: multiply;
  z-index: 6;
}
.${uid}-screen.effect-led .${uid}-video {
  filter: brightness(1.08) contrast(1.18) saturate(1.4);
}
.${uid}-screen.effect-led .${uid}-video.playing {
  animation: none; /* un panel LED no titila como un tubo CRT */
}

/* ─── Efecto Moderno: panel plano tipo LCD/OLED actual, biseles casi
       rectos, sin textura de tubo, brillo de vidrio limpio y sutil ─── */
.${uid}-screen.effect-moderno {
  border-radius: 5px;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.07),
    inset 0 0 2px 1px rgba(0,0,0,0.6),
    inset 0 0 40px rgba(0,0,0,0.55);
}
.${uid}-screen.effect-moderno::after {
  border-radius: 5px;
  background: linear-gradient(160deg,
    rgba(255,255,255,0.05) 0%, transparent 22%,
    transparent 78%, rgba(0,0,0,0.22) 100%);
}
.${uid}-screen.effect-moderno .${uid}-scanlines { display: none; }
.${uid}-screen.effect-moderno .${uid}-glare {
  top: 0; left: 0;
  width: 65%;
  height: 50%;
  background: linear-gradient(115deg,
    rgba(255,255,255,0.10) 0%, transparent 55%);
  transform: rotate(-6deg);
}
.${uid}-screen.effect-moderno .${uid}-video {
  border-radius: 3px;
  filter: brightness(1.03) contrast(1.09) saturate(1.05);
}
.${uid}-screen.effect-moderno .${uid}-video.playing {
  animation: none; /* pantallas planas actuales no titilan */
}

/* ─── Efecto VHS: barra de tracking, cinta desgastada, colores lavados ─── */
.${uid}-screen.effect-vhs .${uid}-scanlines {
  background: repeating-linear-gradient(
    180deg,
    transparent      0px,
    transparent      1px,
    rgba(0,0,0,0.16) 1px,
    rgba(0,0,0,0.16) 3px
  );
}
.${uid}-screen.effect-vhs .${uid}-video {
  filter: contrast(0.95) saturate(0.78) brightness(0.94);
}
.${uid}-screen.effect-vhs .${uid}-vhsbar {
  display: block;
  left: 0;
  right: 0;
  height: 12px;
  top: -20%;
  background: linear-gradient(180deg,
    transparent, rgba(255,255,255,0.30), rgba(${cr},${cg},${cb},0.18), transparent);
  filter: blur(1px);
  z-index: 8;
  opacity: 0;
  animation: ${uid}-vhstrack 6.5s linear infinite;
}
@keyframes ${uid}-vhstrack {
  0%   { top: -15%; opacity: 0;   }
  3%   { opacity: 0.85; }
  9%   { opacity: 0;    }
  100% { top: 115%; opacity: 0;  }
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
  background: linear-gradient(180deg, ${sideA} 0%, ${chassisC} 100%);
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
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.05);
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

/* ─── Link: overlay clickeable sobre la pantalla (link-mode="screen"|"both") ─── */
.${uid}-screen-link {
  position: absolute;
  inset: 0;
  z-index: 9;
  display: block;
  cursor: pointer;
  border-radius: inherit;
  transition: box-shadow 0.2s;
}
.${uid}-screen-link:hover,
.${uid}-screen-link:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(${cr},${cg},${cb},0.55);
  outline: none;
}

/* ─── Link: botón CTA debajo del dispositivo (link-mode="button"|"both") ─── */
.${uid}-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  margin: 1.1rem auto 0;
  padding: 11px 26px;
  border-radius: 999px;
  background: linear-gradient(135deg, ${mid}, ${dark});
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-decoration: none;
  white-space: nowrap;
  box-shadow:
    0 8px 20px rgba(0,0,0,0.55),
    0 0 22px ${gMed},
    inset 0 1px 0 rgba(255,255,255,0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.${uid}-cta:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 26px rgba(0,0,0,0.6),
    0 0 30px ${gHigh},
    inset 0 1px 0 rgba(255,255,255,0.22);
}
.${uid}-cta:active { transform: translateY(0); }
.${uid}-cta:focus-visible { outline: 2px solid ${lite}; outline-offset: 3px; }
.${uid}-cta i { font-size: 16px; transition: transform 0.15s ease; }
.${uid}-cta:hover i { transform: translateX(3px); }

/* ─── TV vertical: cuando el video es portrait, todo el chassis
       se angosta y el panel lateral pasa a ser una franja inferior,
       sea en mobile o en desktop ─── */
.${uid}-outer.orient-portrait {
  max-width: 380px;
}
.${uid}-outer.orient-portrait .${uid}-inner {
  flex-direction: column;
  gap: 0;
}
.${uid}-outer.orient-portrait .${uid}-side {
  flex-direction: row;
  width: 100%;
  min-width: unset;
  border-radius: 0 0 14px 14px;
  padding: 10px 20px;
  justify-content: center;
  gap: 26px;
}
.${uid}-outer.orient-portrait .${uid}-knob-group {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

/* ══════════════════════════════════════════════════════════
   CHASIS "IPOD"  ·  chassis="ipod"
   Cuerpo vertical, pantalla protagonista (sin franjas muertas
   con video vertical) + 2do visor tipo display MP3 en marquesina.
══════════════════════════════════════════════════════════ */

/* Mini-visor: display oscuro con el título corriendo tipo marquesina */
.${uid}-minidisplay {
  display: none; /* solo visible con chassis="ipod" */
  position: relative;
  margin-top: 10px;
  background: #050705;
  border-radius: 7px;
  padding: 7px 4px;
  overflow: hidden;
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,0.85),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    inset 0 0 10px 1px rgba(${cr},${cg},${cb},0.10);
}
/* Trama de puntos para look "pixelado" tipo LCD */
.${uid}-minidisplay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(90deg,
    rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px,
    transparent 1px, transparent 2px);
  mix-blend-mode: multiply;
  pointer-events: none;
}
.${uid}-marquee-track {
  display: flex;
  width: max-content;
  animation: ${uid}-marquee ${marqueeDur}s linear infinite;
}
.${uid}-marquee-text {
  flex-shrink: 0;
  padding-right: 3em;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f2fff2;
  text-shadow:
    0 0 2px rgba(255,255,255,0.85),
    1px 0 0 rgba(255,255,255,0.35),
    -1px 0 0 rgba(255,255,255,0.35);
  white-space: nowrap;
}
@keyframes ${uid}-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* Activación del chasis iPod: pantalla más grande y presente,
   sin pedestal, cuerpo vertical, mini-visor visible. */
.${uid}-outer.chassis-ipod {
  max-width: 380px;
}
.${uid}-outer.chassis-ipod .${uid}-title {
  display: none !important; /* el título vive en el mini-visor marquesina */
}
.${uid}-outer.chassis-ipod .${uid}-minidisplay {
  display: block;
}
.${uid}-outer.chassis-ipod .${uid}-chassis {
  border-radius: 34px;
  padding: 14px 14px 16px;
}
.${uid}-outer.chassis-ipod .${uid}-chassis::before {
  border-radius: 34px;
}
.${uid}-outer.chassis-ipod .${uid}-chassis::after {
  display: none; /* sin pedestal: un iPod no tiene pie de TV */
}
.${uid}-outer.chassis-ipod .${uid}-inner {
  flex-direction: column;
  gap: 0;
}
.${uid}-outer.chassis-ipod .${uid}-screen-wrap {
  padding: 6px;
  border-radius: 20px;
}
.${uid}-outer.chassis-ipod .${uid}-screen-wrap::before {
  border-radius: 19px;
}
.${uid}-outer.chassis-ipod .${uid}-screen {
  border-radius: 16px;
}
.${uid}-outer.chassis-ipod .${uid}-screen::after {
  border-radius: 16px;
}
.${uid}-outer.chassis-ipod .${uid}-video {
  border-radius: 14px;
}
/* La pantalla ocupa casi todo el ancho del cuerpo: sin límites
   angostos de "TV con video vertical incrustado" */
.${uid}-outer.chassis-ipod .${uid}-screen.portrait {
  max-width: none;
  width: 100%;
  margin: 0;
}
.${uid}-outer.chassis-ipod .${uid}-screen.landscape {
  aspect-ratio: 3 / 4; /* si el video es horizontal, se acomoda al cuerpo vertical */
}
.${uid}-outer.chassis-ipod .${uid}-controls {
  border-radius: 0 0 14px 14px;
}
.${uid}-outer.chassis-ipod .${uid}-side {
  flex-direction: row;
  width: 100%;
  min-width: unset;
  border-radius: 16px;
  margin-top: 10px;
  padding: 10px 20px;
  justify-content: center;
  gap: 26px;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
}
.${uid}-outer.chassis-ipod .${uid}-knob-group {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.${uid}-outer.chassis-ipod .${uid}-knob-ring {
  width: 40px;
  height: 40px;
}

@media (max-width: 767px) {
  .${uid}-outer.chassis-ipod {
    max-width: 420px;
    margin: 1rem auto;
  }
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

<div class="${uid}-outer${initAR === 'portrait' ? ' orient-portrait' : ''}${chassisType === 'ipod' ? ' chassis-ipod' : ''}" id="${uid}-outer">

  <!-- 3D Title -->
  <span class="${uid}-title">${titleText}</span>

  <!-- TV Chassis -->
  <div class="${uid}-chassis">
    <div class="${uid}-inner">

      <!-- ── Screen column ── -->
      <div class="${uid}-bezel">

        <!-- Bezel + CRT screen -->
        <div class="${uid}-screen-wrap">
          <div class="${uid}-screen ${initAR} effect-${screenEffect}" id="${uid}-screen">
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
            <div class="${uid}-ledgrid"></div>
            <div class="${uid}-vhsbar"></div>
            ${showScreenLnk ? `<a class="${uid}-screen-link" href="${linkHref}" target="${linkTarget}" ${linkRel} aria-label="${linkLabel}"></a>` : ''}
          </div>
        </div>

        <!-- 2do visor: display tipo MP3 con el título en marquesina (solo chassis="ipod") -->
        <div class="${uid}-minidisplay">
          <div class="${uid}-marquee-track">
            <span class="${uid}-marquee-text">${titleText}</span>
            <span class="${uid}-marquee-text">${titleText}</span>
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

  ${showBtn ? `
  <!-- CTA: link-mode="button"|"both" -->
  <a class="${uid}-cta" href="${linkHref}" target="${linkTarget}" ${linkRel}>
    <span>${linkLabel}</span>
    <i class="material-icons">arrow_forward</i>
  </a>` : ''}

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
    const outer    = document.getElementById(`${uid}-outer`);
    const fsBtn    = document.getElementById(`${uid}-fsbtn`);

    if (!video) return;

    /* ── Orientación real: se decide por las dimensiones del video, no por
       el ancho de pantalla. Aplica tanto a la pantalla (aspect-ratio) como
       al chassis completo (ancho del "televisor"). ── */
    let orientationRetries = 0;
    const applyOrientation = () => {
      if (!video.videoWidth || !video.videoHeight) {
        /* metadata todavía no disponible: reintentar unos frames más
           (algunos navegadores móviles demoran en exponer videoWidth) */
        if (orientationRetries++ < 60) requestAnimationFrame(applyOrientation);
        return;
      }
      const isLandscape = video.videoWidth >= video.videoHeight;
      screen.classList.remove('landscape', 'portrait');
      screen.classList.add(isLandscape ? 'landscape' : 'portrait');
      if (outer) outer.classList.toggle('orient-portrait', !isLandscape);
    };
    video.addEventListener('loadedmetadata', applyOrientation);
    video.addEventListener('loadeddata', applyOrientation);
    /* por si el metadata ya estaba disponible (video cacheado) */
    applyOrientation();

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
        applyOrientation();
      }, { once: true });
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