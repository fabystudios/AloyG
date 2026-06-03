# `<section-title>` — Documentación técnica

Web Component que encapsula el patrón repetido de **section-header** usado en `index.html` para los títulos de cada sección (Avisos, Misas, Retiros, Historia, etc.).

Reemplaza el bloque:

```html
<section id="ID" class="section-header" style="...">
  <h2 class="md3-headline" style="color: white;">
    🎓 Texto del Título
  </h2>
</section>
```

Por una sola línea:

```html
<section-title id="ID" icon="🎓" text="Texto del Título"></section-title>
```

Además ofrece efectos visuales reutilizables (estrellas mágicas, PNG flotantes) y un fix de padding mobile que estaba roto por reglas globales del "reacomodamiento general".

---

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso mínimo](#uso-mínimo)
- [Atributos](#atributos)
  - [Contenido](#contenido)
  - [Sistema de efectos](#sistema-de-efectos)
  - [Tamaño de PNG flotantes](#tamaño-de-png-flotantes)
  - [Apariencia](#apariencia)
- [Efectos disponibles](#efectos-disponibles)
  - [Canvas-based](#canvas-based-comparten-un-único-canvas)
  - [DOM-based](#dom-based-no-usan-canvas)
- [Cómo combinar efectos](#cómo-combinar-efectos)
  - [Recomendaciones de combinación](#recomendaciones-de-combinación)
- [Ejemplos completos](#ejemplos-completos)
- [Arquitectura interna](#arquitectura-interna)
- [Fix mobile incluido](#fix-mobile-incluido)
- [Migración desde el patrón viejo](#migración-desde-el-patrón-viejo)
- [Referencia rápida](#referencia-rápida)

---

## Instalación

```html
<script src="./components/section-title.js"></script>
```

Sin dependencias externas. Carga automáticamente Material Icons si no están ya presentes. Hereda las clases `.section-header` y `.md3-headline` definidas en `style.css` (light-DOM), por lo que respeta los gradientes, sombras y media-queries existentes.

---

## Uso mínimo

```html
<section-title text="Avisos"></section-title>
```

Renderiza un `<section class="section-header">` con un `<h2 class="md3-headline">` adentro y sin efectos.

---

## Atributos

### Contenido

| Atributo        | Tipo                                              | Default    | Descripción                                                                                                                          |
| --------------- | ------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `text`        | string                                            | `""`     | Texto principal del título.                                                                                                          |
| `icon`        | string                                            | `""`     | Ícono que precede al texto. Emoji, nombre de Material Icon o `fa-...`.                                                             |
| `icon-type`   | `"auto"`, `"emoji"`, `"material"`, `"fa"` | `"auto"` | Cómo interpretar `icon`. En `"auto"` el componente lo detecta heurísticamente.                                                  |
| `icon-mobile` | `"on"`, `"off"`                               | `"on"`   | Si vale `"off"`, oculta el ícono solo en mobile (`max-width: 768px`). Útil cuando el título es largo y el espacio se complica. |
| `id`          | string                                            | `""`     | Se aplica al `<section>` interno para anclas (`#Anuncios`, etc.).                                                                 |

**Detección automática de `icon-type`:**

- Texto en `lowercase` con guiones bajos (`campaign`, `child_care`) → `material`
- Prefijo `fa-` → `fa` (FontAwesome)
- Cualquier otra cosa (incluye emojis) → `emoji`

### Sistema de efectos

| Atributo      | Tipo                                                                                                                                                                                    | Default    | Descripción                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `effect`    | `"none"` o uno o más de: `stars`,, `confetti`, `snow`, `rays`, `glow-pulse`, `aurora`, `floating-png`, `floating-svg` — **combinables separados por espacio** | `"none"` | Qué efecto(s) animar de fondo.                                   |
| `png-src`   | URL                                                                                                                                                                                     | `""`     | Imagen para `floating-png`. Si no se setea, no se dibujan PNGs. |
| `png-count` | número entero (1–20)                                                                                                                                                                  | `6`      | Cuántas instancias del PNG flotan.                               |

<style>

  .video-card-gold-container {

    display: flex;

    justify-content: center;

    gap: 20px;

    flex-wrap: wrap;

  }

  @media (max-width: 600px) {

    .video-card-gold-container {

      justify-content: center;

      align-items: center;

      flex-direction: column;

      gap: 24px;

    }

    .video-card-gold-containervideo-card-gold {

      margin-left: auto;

      margin-right: auto;

      width: 100%;

      max-width: 350px;

      min-width: 220px;

      display: block;

    }

  }

  @importurl('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }


  .scene {

    width: 100%;

    background: transparent;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 1.5rem0;

    position: relative;

  }


  .layout {

    position: relative;

    z-index: 10;

    width: 95vw;

    max-width: 720px;

  }


  /* ── Flyer flotante solo desktop ── */

  .flyer-float { display: none; }


  @media (min-width: 860px) {

    .layout { max-width: 720px; }

    .flyer-float {

      display: block;

      position: absolute;

      left: -340px;

      top: 50%;

      transform: translateY(-50%);

      width: 320px;

      border-radius: 20px;

      overflow: hidden;

      border: 1.5pxsolidrgba(255,210,80,0.45);

      box-shadow:

        0001pxrgba(255,255,255,0.08),

        030px70pxrgba(0,0,0,0.7),

        0050pxrgba(255,180,50,0.2),

        inset01px0rgba(255,255,255,0.15);

      backdrop-filter: blur(16px);

      background: rgba(10,15,45,0.6);

      animation: flyer-in 1.2sease-outforwards, flyer-bob 7sease-in-out1.2sinfinitealternate;

      z-index: 20;

    }

    .flyer-floatimg { width: 100%; display: block; }

    .flyer-label {

      text-align: center; padding: 0.55rem0.5rem;

      font-family: 'Cinzel', serif; font-size: 0.62rem;

      letter-spacing: 0.16em; color: rgba(255,210,80,0.8);

      background: rgba(5,8,28,0.85);

      border-top: 1pxsolidrgba(255,210,80,0.2);

    }

  }

  @keyframesflyer-in {

    from { opacity: 0; transform: translateY(-44%) translateX(28px); }

    to   { opacity: 1; transform: translateY(-50%) translateX(0); }

  }

  @keyframesflyer-bob {

    from { transform: translateY(-50%) rotate(-1.2deg); }

    to   { transform: translateY(-52.5%) rotate(1.2deg); }

  }


  /* ── Card principal — azul marino + glasmorfismo ── */

  .glass-card {

    width: 100%;

    min-height: 96vh;

    background:

      linear-gradient(145deg,

        rgba(8,18,60,0.97) 0%,

        rgba(12,10,38,0.97) 45%,

        rgba(18,8,48,0.97) 100%);

    border: 1.5pxsolidrgba(255,210,80,0.4);

    border-radius: 26px;

    padding: 2rem1.8rem;

    box-shadow:

      024px60pxrgba(0,0,0,0.65),

      08px24pxrgba(0,0,0,0.45),

      0060pxrgba(30,20,120,0.25),

      inset01px0rgba(255,255,255,0.08);

    position: relative;

    overflow: hidden;

    display: flex;

    flex-direction: column;

    justify-content: space-between;

    animation: cardIn 0.9sease-outforwards;

    /* glasmorfismo */

    backdrop-filter: blur(24px);

    -webkit-backdrop-filter: blur(24px);

  }

  @keyframescardIn {

    from { opacity: 0; transform: translateY(28px); }

    to   { opacity: 1; transform: translateY(0); }

  }


  /* Borde dorado sutil superior */

  .glass-card::before {

    content: '';

    position: absolute;

    top: 0; left: 10%; right: 10%; height: 1px;

    background: linear-gradient(to right, transparent, rgba(255,210,80,0.7), transparent);

    border-radius: 50%;

  }


  /* Estrellas dentro de la card */

  .card-stars { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 26px; z-index: 0; }

  .star {

    position: absolute; border-radius: 50%; background: white;

    animation: twinkle var(--card-star-dur) ease-in-outinfinitealternate;

    opacity: var(--card-star-op);

  }

  @keyframestwinkle {

    from { opacity: var(--card-star-op); }

    to   { opacity: calc(var(--card-star-op)*0.1); }

  }

  .particle {

    position: absolute; border-radius: 50%; background: rgba(255,210,80,0.75);

    animation: float-up var(--card-p-fdur) ease-ininfinitevar(--card-p-fdelay);

  }

  @keyframesfloat-up {

    0%   { transform: translateY(0) translateX(0); opacity: 0; }

    15%  { opacity: 0.9; }

    100% { transform: translateY(-96vh) translateX(var(--card-p-fx)); opacity: 0; }

  }


  .orb {

    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; z-index: 0;

    animation: orb-pulse var(--card-orb-pd,5s) ease-in-outinfinitealternate;

  }

  @keyframesorb-pulse {

    from { transform: scale(1); opacity: 0.3; }

    to   { transform: scale(1.3); opacity: 0.6; }

  }


  .card-shimmer {

    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;

    background: linear-gradient(45deg, transparent30%, rgba(255,210,80,0.03) 50%, transparent70%);

    animation: shimmer 10slinearinfinite; pointer-events: none; z-index: 0;

  }

  @keyframesshimmer {

    from { transform: translateX(-100%) rotate(45deg); }

    to   { transform: translateX(100%) rotate(45deg); }

  }


  /* ── Contenido ── */

  .card-content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }


  .logo-area { display: flex; justify-content: center; margin-bottom: 0.8rem; }

  .logo-circle {

    width: 66px; height: 66px; border-radius: 50%;

    border: 1.5pxsolidrgba(255,210,80,0.5);

    background: rgba(255,255,255,0.06);

    display: flex; align-items: center; justify-content: center;

    box-shadow: 0028pxrgba(255,200,50,0.3), inset0016pxrgba(255,255,255,0.04);

    position: relative;

  }

  .logo-ring {

    position: absolute; inset: -6px; border-radius: 50%;

    border: 1pxsolidrgba(255,210,80,0.18);

    animation: ring-pulse 3sease-in-outinfinitealternate;

  }

  @keyframesring-pulse {

    from { transform: scale(1); opacity: 0.2; }

    to   { transform: scale(1.12); opacity: 0.8; }

  }


  .parish-name {

    font-family: 'Cinzel', serif; font-size: px;

    letter-spacing: 0.18em; color: rgba(255, 211, 80, 0.837);

    text-align: center; text-transform: uppercase; margin-bottom: 0.25rem;

  }

  .misa-title {

    font-family: 'Cinzel', serif; font-size: 3rem; font-weight: 600;

    color: #fff; text-align: center; line-height: 1; letter-spacing: 0.07em;

    text-shadow: 0040pxrgba(255,210,80,0.837), 02px6pxrgba(0,0,0,0.7);

    margin: 0.35rem00.25rem;

  }

  .subtitle {

    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;

    font-style: italic; color: rgba(255,255,255,0.837);

    text-align: center; margin-bottom: 0.8rem;

  }


  /* Logo en la cabecera (mobile · apilado arriba del texto) */

  .flyer-header-main {

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 0;

  }

  .flyer-title-row {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 0.6rem;

  }

  .header-logo {

    height: 48px;

    width: auto;

    display: block;

    filter: drop-shadow(04px14pxrgba(255,210,80,0.28));

  }

  .header-medal { display: none; }


  .divider { display: flex; align-items: center; gap: 0.7rem; margin: 0.6rem0; }

  .divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(255,210,80,0.38), transparent); }

  .divider-star { color: rgba(255,210,80,0.837); font-size: 0.82rem; }


  .photo-frame {

    border-radius: 14px; overflow: hidden;

    border: 1pxsolidrgba(255,210,80,0.2);

    margin: 0.7remauto; position: relative;

    box-shadow: 012px36pxrgba(0,0,0,0.55), 0018pxrgba(255,180,50,0.06), inset01px0rgba(255,255,255,0.04);

    flex-shrink: 0;

    width: 75%;

    max-width: 420px;

  }

  .photo-frameimg { width: 100%; height: 340px; object-fit: cover; display: block; filter: brightness(0.83) contrast(1.06); }

  .photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,12,40,0.7) 0%, transparent55%); }


  .verse-block {

    background: rgba(255,210,80,0.15);

    border: 1pxsolidrgba(255,210,80,0.4);

    border-radius: 12px; padding: 0.35rem0.9rem;

    margin: 0.45rem0; position: relative; flex-shrink: 0;

  }

  .verse-block::before {

    content: '"'; position: absolute;

     /* top: -0.3rem;  */

    left: 0.75rem;

    font-family: 'Cormorant Garamond', serif; font-size: 2.2rem;

    color: rgba(255, 211, 80, 0.445); line-height: 1;

  }

  .verse-text {

    font-family: 'Cormorant Garamond', serif; font-style: italic;

    font-size: 1.45rem; color: rgba(255,255,255,0.86);

    line-height: 1.05; 

    padding-top: 0;

    text-align: center;

  }

  .verse-ref {

    font-family: 'Cinzel', serif; font-size: 1rem;

    color: rgba(255,210,80,0.6); text-align: center;

    margin-top: 0.02rem; margin-bottom: 0;

    letter-spacing: 0.1em;

  }


  .date-block { display: flex; align-items: center; justify-content: center; gap: 1.2rem; margin: 1rem00.75rem; flex-shrink: 0; }

  .date-item { text-align: center; }

  .date-label { font-family: 'Cinzel', serif; font-size: 0.9rem; letter-spacing: 0.14em; color: rgba(255,210,80,0.58); text-transform: uppercase; margin-bottom: 0.12rem; }

  .date-value { font-family: 'Cinzel', serif; font-size: 1.6rem; font-weight: 600; color: #fff; text-shadow: 0020pxrgba(255,210,80,0.5); line-height: 1; }

  .date-sub { font-family: 'Cormorant Garamond', serif; font-size: 0.9rem; color: rgba(255, 255, 255, 0.903); font-style: italic; }

  .date-sep { width: 1px; height: 40px; background: linear-gradient(to bottom, transparent, rgba(255,210,80,0.3), transparent); }


  .cta-button {

    width: 100%; padding: 0.85rem;

    background: linear-gradient(135deg, rgba(255,210,80,0.18), rgba(255,170,40,0.12));

    border: 1.5pxsolidrgba(255,210,80,0.42); border-radius: 12px;

    font-family: 'Cinzel', serif; font-size: 0.78rem;

    letter-spacing: 0.15em; color: rgba(255,210,80,0.95);

    text-align: center; margin-top: 0.8rem; flex-shrink: 0;

    box-shadow: 0024pxrgba(255,170,40,0.1), inset01px0rgba(255,255,255,0.08);

    position: relative; overflow: hidden;

  }

  .cta-button::after {

    content: ''; position: absolute; inset: 0;

    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);

    animation: btn-sh 4sease-in-outinfinite;

  }

  @keyframesbtn-sh {

    0%,100% { transform: translateX(-130%); }

    50%      { transform: translateX(130%); }

  }


  .villa-elisa {

    font-family: 'Cormorant Garamond', serif; font-size: 0.9rem;

    color: rgba(255, 255, 255, 0.612); text-align: center;

    margin-top: 0.7rem; font-style: italic; flex-shrink: 0;

  }


  /* ═══════════════════════════════════════════════════════════

     DESKTOP · LANDSCAPE 16:9 · todo dentro del viewport (≥1024)

     Jerarquía: MISA → Cita → Foto → Fecha → CTA

     ═══════════════════════════════════════════════════════════ */

  @media (min-width: 1024px) {


    .scene {

      min-height: 100vh;

      padding: 1rem0;

      align-items: center;

    }

    .layout {

      width: 95vw;

      max-width: 1240px;

    }


    /* Card: alto controlado al viewport, sin scroll

       (scopeado a .layout para no afectar otras .glass-card de la página) */

    .layout > .glass-card {

      min-height: auto;

      height: min(calc(100vh - 2rem), 720px);

      padding: 1.6rem2.4rem;

      border-radius: 22px;

    }


    /* Layout vertical: header · body · footer

       (scopeado para no afectar .card-content de .actividad-card) */

    .layout > .glass-card > .card-content {

      display: grid;

      grid-template-rows: auto1frauto;

      gap: 0.9rem;

      height: 100%;

      justify-content: stretch;

    }


    /* ── HEADER (full-width centrado) ── */

    .flyer-header { text-align: center; }

    .flyer-title-row {

      gap: 1.2rem;

    }

    .header-logo {

      height: 110px;

      flex-shrink: 0;

    }

    .header-medal {

      display: block;

      height: 110px;

      width: auto;

      flex-shrink: 0;

      filter: drop-shadow(04px14pxrgba(255,210,80,0.28));

    }

    .parish-name {

      font-size: 0.82rem;

      letter-spacing: 0.22em;

      margin-bottom: 0.15rem;

    }

    .misa-title  {

      font-size: 3.6rem;

      line-height: 1;

      margin: 0.1rem0;

      letter-spacing: 0.12em;

    }

    .subtitle    {

      font-size: 1.55rem;

      margin-bottom: 0.45rem;

    }

    .flyer-header.divider {

      margin: 0.3remauto0;

      max-width: 55%;

    }


    /* ── BODY · 40% foto / 60% texto ── */

    .flyer-body {

      display: grid;

      grid-template-columns: 40%1fr;

      gap: 2.4rem;

      align-items: center;

      min-height: 0;

    }


    /* Columna izquierda · fotografía */

    .flyer-photo {

      display: flex;

      justify-content: center;

      align-items: center;

      height: 100%;

      min-height: 0;

    }

    .photo-frame {

      width: 100%;

      max-width: 100%;

      margin: 0;

      height: 100%;

      max-height: 410px;

      border-radius: 12px;

    }

    .photo-frameimg {

      width: 100%;

      height: 100%;

      max-height: 410px;

      object-fit: cover;

    }


    /* Columna derecha · cita + fecha */

    .flyer-text {

      display: flex;

      flex-direction: column;

      justify-content: center;

      gap: 1.4rem;

      height: 100%;

      min-height: 0;

    }


    /* Cita bíblica · encuadre dorado como mobile, pero más grande */

    .verse-block {

      background: rgba(255, 210, 80, 0.15);

      border: 1pxsolidrgba(255, 210, 80, 0.4);

      border-radius: 14px;

      padding: 1.4rem1.8rem1.2rem;

      margin: 0;

    }

    .verse-block::before {

      content: '"';

      font-size: 3.4rem;

      left: 1.2rem;

      top: 0.2rem;

      color: rgba(255, 211, 80, 0.4);

    }

    .verse-text {

      font-family: 'Cormorant Garamond', serif;

      font-style: italic;

      font-size: 2.1rem;

      line-height: 1.2;

      text-align: center;

      padding-top: 0.3rem;

      color: rgba(255, 255, 255, 0.92);

    }

    .verse-ref {

      font-size: 1rem;

      text-align: center;

      margin-top: 0.7rem;

      letter-spacing: 0.18em;

      color: rgba(255, 210, 80, 0.78);

    }


    /* Bloque fecha · centrado bajo la cita */

    .date-block {

      margin: 0;

      padding: 1rem00;

      border-top: 1pxsolidrgba(255, 210, 80, 0.2);

      gap: 1.8rem;

      justify-content: center;

    }

    .date-item { text-align: center; }

    .date-label { font-size: 0.74rem; letter-spacing: 0.18em; }

    .date-value { font-size: 1.6rem; }

    .date-sub   { font-size: 0.82rem; }

    .date-sep   { height: 40px; }


    /* ── FOOTER (full-width) ── */

    .flyer-footer { text-align: center; }

    .cta-button {

      margin: 0auto;

      padding: 0.85rem1.2rem;

      font-size: 0.82rem;

      max-width: 560px;

    }

    .villa-elisa {

      margin-top: 0.45rem;

      font-size: 0.85rem;

    }

  }


  /* Refinamiento para 1366×768 (alto limitado) */

  @media (min-width: 1024px) and (max-height: 820px) {

    .layout > .glass-card {

      height: min(calc(100vh - 1.5rem), 720px);

      padding: 1.2rem2.2rem;

    }

    .layout > .glass-card > .card-content { gap: 0.7rem; }

    .header-logo, .header-medal { height: 90px; }

    .parish-name  { font-size: 0.78rem; }

    .misa-title   { font-size: 3rem; }

    .subtitle     { font-size: 1.35rem; }

    .photo-frame, .photo-frameimg { max-height: 370px; }

    .verse-text   { font-size: 1.85rem; }

    .verse-ref    { font-size: 0.95rem; margin-top: 0.55rem; }

    .date-value   { font-size: 1.45rem; }

    .date-block   { padding-top: 0.85rem; gap: 1.5rem; }

    .flyer-body   { gap: 2rem; }

    .cta-button   { padding: 0.75rem1rem; }

  }


  /* Pantallas anchas (≥1440) · respiración extra */

  @media (min-width: 1440px) {

    .layout      { max-width: 1280px; }

    .misa-title  { font-size: 4rem; }

    .verse-text  { font-size: 2.3rem; }

  }


  /* ── MOBILE · cita reducida para mejor equilibrio (≤768px) ── */

  @media (max-width: 768px) {

    .verse-text { font-size: 1.18rem; line-height: 1.2; }

  }

</style>

<divid="afligidos"class="scene">

  <divclass="layout">

    `<!-- Flyer flotante solo desktop -->`

    <!--`<div class="flyer-float">`

    `<img src="/img-cards/fyer.jpeg" alt="Flyer Misa" onerror="this.style.display='none'"/>`

    `<div class="flyer-label">`MISA · SAN LUIS GONZAGA`</div>`

    `</div>` -->

    `<!-- Card principal -->`

    <divid="afligidos"class="glass-card">

    <divclass="card-stars"id="cardStars">`</div>`

    [divclass=&#34;orb&#34;style=&#34;width:260px;height:260px;background:rgba(30,60,200,0.22);top:-10%;left:-15%;--card-orb-pd:5s;&#34;](divclass=%22orb%22style=%22width:260px;height:260px;background:rgba(30,60,200,0.22);top:-10%25;left:-15%25;--card-orb-pd:5s;%22)`</div>`

    [divclass=&#34;orb&#34;style=&#34;width:200px;height:200px;background:rgba(140,50,220,0.15);bottom:5%;right:-10%;--card-orb-pd:7s;animation-delay:2s;&#34;](divclass=%22orb%22style=%22width:200px;height:200px;background:rgba(140,50,220,0.15);bottom:5%25;right:-10%25;--card-orb-pd:7s;animation-delay:2s;%22)`</div>`

    [divclass=&#34;orb&#34;style=&#34;width:150px;height:150px;background:rgba(255,160,40,0.1);top:45%;left:40%;--card-orb-pd:6s;animation-delay:1s;&#34;](divclass=%22orb%22style=%22width:150px;height:150px;background:rgba(255,160,40,0.1);top:45%25;left:40%25;--card-orb-pd:6s;animation-delay:1s;%22)`</div>`

    <divclass="card-shimmer">`</div>`

    <divclass="card-content">

    `<!-- ── HEADER (full-width centrado) ── -->`

    <divclass="flyer-header">

    <divclass="flyer-header-main">

    <pclass="parish-name">Parroquia San Luis Gonzaga · Villa Elisa`</p>`

    <divclass="flyer-title-row">

    <imgclass="header-logo"src="./img/misa2.png"alt=""onerror="this.style.display='none'"/>

    <h1class="misa-title">MISA`</h1>`

    <imgclass="header-medal"src="./img/medalla3.png"alt=""onerror="this.style.display='none'"/>

    `</div>`

    <pclass="subtitle">Para orar por enfermos y afligidos`</p>`

    `</div>`

    <divclass="divider">

    <divclass="divider-line">`</div>`

    <spanclass="divider-star">✦

    <divclass="divider-line">`</div>`

    `</div>`

    `</div>`

    `<!-- ── BODY (2 columnas en desktop · stack en mobile) ── -->`

    <divclass="flyer-body">

    <divclass="flyer-photo">

    <divclass="photo-frame">

    <imgsrc="/img-cards/misa-foto.jpg"alt="Misa de sanación"onerror="this.parentElement.style.display='none'"/>

    <divclass="photo-overlay">`</div>`

    `</div>`

    `</div>`

    <divclass="flyer-text">

    <divclass="verse-block">

    <pclass="verse-text">Vengan a mí todos los que están cansados y agobiados, y yo los aliviaré.`</p>`

    <pclass="verse-ref">— Mateo 11, 28`</p>`

    `</div>`

    <divclass="date-block">

    <divclass="date-item">

    <divclass="date-label">Día`</div>`

    <divclass="date-value">07`</div>`

    <divclass="date-sub">Domingo`</div>`

    `</div>`

    <divclass="date-sep">`</div>`

    <divclass="date-item">

    <divclass="date-label">Mes`</div>`

    <divclass="date-value">Jun`</div>`

    <divclass="date-sub">2026`</div>`

    `</div>`

    <divclass="date-sep">`</div>`

    <divclass="date-item">

    <divclass="date-label">Hora`</div>`

    <divclass="date-value">19hs`</div>`

    <divclass="date-sub">En punto`</div>`

    `</div>`

    `</div>`

    `</div>`

    `</div>`

    `<!-- ── FOOTER (full-width) ── -->`

    <divclass="flyer-footer">

    <divclass="cta-button">✦ Estás invitado · Ven a sanar ✦`</div>`

    `<style>`

    .villa-elisa.mobile { display: none; }

    .villa-elisa.desktop { display: inline; }

    @media (max-width: 768px) {

    .villa-elisa.mobile { display: inline; }

    .villa-elisa.desktop { display: none; }

    }

    `</style>`

    <pclass="villa-elisa">

    <spanclass="desktop">Parroquia San Luis Gonzaga — Villa Elisa, La Plata

    <spanclass="mobile">Parroquia San Luis Gonzaga`<br>`— Villa Elisa, La Plata —

    `</p>`

    `</div>`

    `</div>`

    `</div>`

</div>

</div>

<script>

constcs = document.getElementById('cardStars');

  for (leti = 0; i < 70; i++) {

  consts=document.createElement('div');

  s.className='star';

  constsz=Math.random() *2+0.3;

  s.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--card-star-op:${(Math.random()*0.6+0.15).toFixed(2)};--card-star-dur:${(Math.random()*3+2).toFixed(1)}s;animation-delay:${(Math.random()*6).toFixed(1)}s;`;

  cs.appendChild(s);

}

for (leti = 0; i < 18; i++) {

  constp=document.createElement('div');

  p.className='particle';

  constsz=Math.random() *2.5+0.6;

  p.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;bottom:${Math.random()*5}%;--card-p-fdur:${(Math.random()*6+5).toFixed(1)}s;--card-p-fdelay:${(Math.random()*8).toFixed(1)}s;--card-p-fx:${Math.round((Math.random()-0.5)*65)}px;`;

  cs.appendChild(p);

}

</script>


#### Atributos por efecto

**`floating-svg`** (formas pre-armadas, sin necesidad de PNG):

| Atributo      | Default     | Valores                                                            |
| ------------- | ----------- | ------------------------------------------------------------------ |
| `svg-shape` | `cross`   | `cross`, `heart`, `star`, `circle`, `triangle`, `dove` |
| `svg-color` | `#ffd700` | color CSS                                                          |
| `svg-count` | `6`       | 1–20                                                              |
| `svg-size`  | `28px`    | tamaño CSS                                                        |

**`glow-pulse`** (halo pulsante dentro del header):

| Atributo       | Default     |
| -------------- | ----------- |
| `glow-color` | `#ffd700` |

**`rays`** (rayos divergentes desde el centro):

| Atributo       | Default       |
| -------------- | ------------- |
| `rays-color` | `#ffd700`   |
| `rays-count` | `8` (2–20) |

**`text-glow`** (resplandor multi-capa sobre el texto y el ícono — replica el look "neón" del AVISOS original):

| Atributo             | Default     | Descripción                             |
| -------------------- | ----------- | ---------------------------------------- |
| `text-glow-color`  | `#00e5ff` | Color principal del halo (24px spread).  |
| `text-glow-accent` | `#ffd700` | Color de la línea inferior 1px (sutil). |

Los efectos `bubbles`, `confetti`, `snow`, `aurora` no requieren atributos extra (usan paleta y velocidad por defecto).

### Tamaño de PNG flotantes

Tres formas de controlar el tamaño, en orden de prioridad:

| Atributo       | Default    | Comportamiento                                                                                              |
| -------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `png-width`  | —         | Setea CSS `width`. Si no hay `png-height`, la altura queda en `auto` (preserva aspect ratio).         |
| `png-height` | —         | Setea CSS `height`. Si no hay `png-width`, el ancho queda en `auto` (preserva aspect ratio).          |
| `png-size`   | `"48px"` | Atajo. Solo se aplica si**no** se setearon `png-width` ni `png-height`. Equivale a `png-width`. |

**Regla práctica:** si el PNG es portrait (más alto que ancho, como `gps.png`), usá `png-height`. Si es landscape (`banderines.png`), usá `png-width`. Si es cuadrado, cualquiera de los dos.

### Apariencia

| Atributo        | Default | Descripción                                                                                 |
| --------------- | ------- | -------------------------------------------------------------------------------------------- |
| `shadow`      | `""`  | Pasar `"lg"` agrega la clase Bootstrap `shadow-lg`.                                      |
| `extra-style` | `""`  | CSS inline extra para el `<section>` interno (p.ej. margins custom para casos especiales). |

---

## Efectos disponibles

### Canvas-based (comparten un único canvas)

#### `stars` — Estrellas mágicas

Estrellas titilantes con chispas que explotan periódicamente. Réplica del efecto original que estaba inline en línea 932 del `index.html` previo.

- Cantidad: 14 mobile / 24 tablet / 36 desktop.
- Paleta multicolor (dorado, cian, rosa, violeta, blanco, naranja).
- Chispas con caída por gravedad.

```html
<section-title text="Avisos" effect="stars"></section-title>
```

#### `bubbles` — Burbujas

Burbujas que suben desde abajo con leve deriva horizontal. Estilo "alegre / lúdico".

```html
<section-title text="Día del Niño" effect="bubbles"></section-title>
```

#### `confetti` — Confeti

Rectángulos coloridos cayendo con rotación. Para festividades, fiestas patronales, celebraciones.

```html
<section-title text="Fiesta Patronal" effect="confetti"></section-title>
```

#### `snow` — Nieve

Copos blancos cayendo lento con sway lateral. Ideal para Adviento / Navidad / temática invernal.

```html
<section-title text="Navidad" effect="snow"></section-title>
```

#### `rays` — Rayos divergentes

Rayos de luz semitransparentes saliendo del centro y rotando muy lentamente. Estética "gloria", "Espíritu Santo".

```html
<section-title text="Pentecostés" effect="rays"
               rays-color="#ffd700" rays-count="10"></section-title>
```

### DOM-based (no usan canvas)

#### `glow-pulse` — Halo pulsante

Sombra interior dorada que pulsa entre opaca y brillante. Resalta el header sin agregar partículas.

```html
<section-title text="Solemnidad" effect="glow-pulse"
               glow-color="#ffd700"></section-title>
```

#### `aurora` — Gradiente animado

Capa con `linear-gradient` multicolor en `mix-blend-mode: overlay` que se mueve lentamente. Efecto "vivo" sin partículas.

```html
<section-title text="Anuncio Especial" effect="aurora"></section-title>
```

#### `floating-png` — PNG flotando

N copias del PNG en posiciones aleatorias del header, con animación `translate3d` + ligera rotación.

```html
<section-title text="Misas"
               effect="floating-png"
               png-src="./img/caliz.png"
               png-count="5"
               png-height="34px"></section-title>
```

#### `floating-svg` — SVG flotando con formas pre-armadas

Igual que `floating-png` pero usa formas SVG inline. Útil cuando no querés depender de un archivo PNG. Formas disponibles: `cross`, `heart`, `star`, `circle`, `triangle`, `dove`.

```html
<section-title text="Amor de Dios"
               effect="floating-svg"
               svg-shape="heart"
               svg-color="#ff4081"
               svg-count="6"
               svg-size="22px"></section-title>
```

### Text effect

#### `text-glow` — Resplandor en el texto

Aplica un `text-shadow` multi-capa al `<h2>` y al ícono. Recupera el look "neón azul" del AVISOS original (depth negro + glow blanco + línea dorada inferior + halo color principal).

```html
<section-title text="Avisos" icon="campaign"
               effect="stars text-glow"
               text-glow-color="#00e5ff"></section-title>
```

Las 4 capas que aplica al `<h2>`:

```text
0 2px 8px  rgba(0,0,0,0.65)      ← profundidad
0 4px 16px rgba(255,255,255,0.5) ← halo blanco
0 1px 0    {text-glow-accent}    ← línea inferior dorada
0 0 24px   {text-glow-color}     ← halo color principal
```

Y al ícono Material/FA:

```text
0 0 12px #fff                    ← halo blanco interno
0 0 24px {text-glow-color}       ← halo color externo
```

### `none` — Sin efectos

Solo título sobre el gradiente del `.section-header`. Es el default si no especificás `effect`.

```html
<section-title text="Más Historia" icon="📜"></section-title>
```

---

## Cómo combinar efectos

`effect` acepta cualquier cantidad de valores separados por espacio. Todos se montan sobre la misma capa FX:

```html
<section-title text="Avisos"
               icon="campaign"
               effect="stars floating-png"
               png-src="./img/megafono.png"
               png-count="4"
               png-size="40px"></section-title>
```

Combos más ambiciosos también funcionan — los canvas-based comparten un único `<canvas>` y un solo loop:

```html
<section-title text="Pascua"
               effect="stars confetti glow-pulse aurora floating-svg"
               svg-shape="cross" svg-color="#ffd700" svg-count="3"></section-title>
```

### Recomendaciones de combinación

| Tema            | Efectos sugeridos                      |
| --------------- | -------------------------------------- |
| Navidad         | `snow glow-pulse`                    |
| Pentecostés    | `rays glow-pulse`                    |
| Fiesta patronal | `confetti floating-png` (banderines) |
| Pascua          | `stars rays`                         |
| Día del Niño  | `bubbles confetti`                   |
| Avisos urgentes | `aurora floating-png` (megáfono)    |
| Solemnidad      | `glow-pulse rays`                    |

Evitá combinar **más de 3 efectos canvas** al mismo tiempo en un mismo header — se ve sobrecargado.

---

## Ejemplos completos

Tomados del `index.html` actual:

```html
<!-- AVISOS — estrellas + megáfonos -->
<section-title id="Anuncios"
               icon="campaign"
               text="Avisos"
               effect="stars floating-png"
               png-src="./img/megafono.png"
               png-count="4"
               png-size="40px"></section-title>

<!-- Casas de Retiro — casitas flotando -->
<section-title id="RETIROS"
               icon="🏡"
               text="Nuestras Casas de Retiro"
               effect="floating-png"
               png-src="./img/casita.png"
               png-count="5"
               png-height="36px"></section-title>

<!-- Familia en la Fe — con shadow extra y palomitas -->
<section-title id="nosotros"
               icon="⛪"
               text="Nuestra Familia en la Fe"
               shadow="lg"
               effect="floating-png"
               png-src="./img/palomita.png"
               png-count="6"
               png-size="34px"></section-title>

<!-- Misas — ícono FontAwesome dove + cálices flotantes -->
<section-title id="MISAS"
               icon="fa-dove"
               icon-type="fa"
               text="Misas"
               effect="floating-png"
               png-src="./img/caliz.png"
               png-count="5"
               png-size="34px"></section-title>

<!-- Ubicación — pins GPS chiquitos (controlados por altura) -->
<section-title id="UBICACION"
               icon="📍"
               text="Ubicación"
               effect="floating-png"
               png-src="./img/gps.png"
               png-count="6"
               png-height="28px"></section-title>

<!-- Contacto — sin id, ícono Material + teléfonos -->
<section-title icon="phone"
               text="Contacto"
               effect="floating-png"
               png-src="./img/phone.png"
               png-count="5"
               png-height="34px"></section-title>
```

---

## Arquitectura interna

### DOM renderizado

```text
<section-title id="X" ...>          ← host (display: block, hereda --pub-gap)
  └── <section class="section-header"> ← gradiente, padding, border-radius
        ├── <div class="st-fx-layer">  ← capa de efectos (z-index:1)
        │     ├── <canvas>             ← solo si effect incluye "stars"
        │     └── <img class="st-png">  ← N copias si effect incluye "floating-png"
        └── <h2 class="md3-headline">  ← título (z-index:2, va arriba)
              ├── ícono (i / texto)
              └── texto
```

### Light DOM, no Shadow DOM

El componente **no** usa Shadow DOM. Renderiza con `innerHTML` para que las clases existentes (`.section-header`, `.md3-headline`, `.shadow-lg`) que ya están en `style.css` se apliquen sin tener que duplicarlas.

### Ciclo de vida

- `connectedCallback` → render inicial.
- `attributeChangedCallback` → re-render completo en cualquier cambio de atributo (la lista está en `observedAttributes`).
- `disconnectedCallback` → cancela el `requestAnimationFrame` del canvas de estrellas para no leakear.

### Estilos inyectados

`section-title.js` inserta un único `<style data-section-title>` en `document.head` la primera vez que se evalúa. Incluye:

- `position: absolute` y z-index para la `.st-fx-layer`.
- Animación `@keyframes st-png-float` (traslación + rotación).
- Refuerzo `display: flex; align-items: center; justify-content: center` con `!important` sobre el `.section-header` interno (ver siguiente sección).
- Refuerzo mobile (`@media (max-width: 768px)`) que restaura los valores correctos de padding/height/border-radius.

---

## Fix mobile incluido

El commit `965bd758` ("reacomodamiento gral") agregó esta regla global:

```css
.section-header { display: block; margin-block: var(--pub-gap); margin-inline: auto; }
```

que sobrescribía el `display: flex; align-items: center` del CSS base y dejaba el `<h2>` pegado al top del content-area, produciendo padding visualmente **asimétrico** en mobile.

Adicionalmente, los inline styles del bloque magic-stars original (línea 932) fijaban `padding: 1.5rem 2rem` impidiendo que el media-query mobile (`padding: 1rem 1.5rem`) tuviera efecto.

`section-title.js` contrarresta ambos problemas con dos bloques `!important`:

```css
section-title > section.section-header {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

@media (max-width: 768px) {
  section-title > section.section-header {
    padding: 1rem 1.5rem !important;
    height: 70px !important;
    max-width: 95% !important;
    border-radius: 18px !important;
  }
  section-title > section.section-header .md3-headline {
    font-size: 1.2rem !important;
    letter-spacing: 0.3px !important;
  }
}
```

También se agregó `section-title` a la lista de elementos con `--pub-gap` en `index.html`, y un reset del margen del `.section-header` interno para evitar duplicar el espacio vertical.

---

## Migración desde el patrón viejo

### Antes

```html
<section id="MISAS" class="section-header">
  <h2 class="md3-headline" style="color: white;">
    <i class="fas fa-dove"></i> Misas
  </h2>
</section>
```

### Después

```html
<section-title id="MISAS" icon="fa-dove" icon-type="fa" text="Misas"></section-title>
```

### Casos especiales

| Patrón viejo                                   | Atributo equivalente               |
| ----------------------------------------------- | ---------------------------------- |
| `class="section-header shadow-lg"`            | `shadow="lg"`                    |
| `<i class="material-icons">campaign</i>`      | `icon="campaign"` (auto)         |
| `<i class="fas fa-dove"></i>`                 | `icon="fa-dove" icon-type="fa"`  |
| Emoji antes del texto (`📜 Más Historia`)    | `icon="📜" text="Más Historia"` |
| `style="margin-top:0; padding:1em 0;"` custom | `extra-style="..."` (evitar)     |

---

## Referencia rápida

```text
┌─────────────────┬──────────────────────────────────────────────────────┐
│ Atributo        │ Valores / default                                    │
├─────────────────┼──────────────────────────────────────────────────────┤
│ text            │ string · ""                                          │
│ icon            │ emoji / material / fa-… · ""                         │
│ icon-type       │ auto / emoji / material / fa · "auto"                │
│ icon-mobile     │ on / off · "on"     (off → oculta ícono <768px)      │
│ id              │ string · ""                                          │
│ shadow          │ "" / "lg" · ""                                       │
│ extra-style     │ CSS inline · ""                                      │
├─────────────────┼──────────────────────────────────────────────────────┤
│ effect          │ none / stars / bubbles / confetti / snow / rays /    │
│                 │ glow-pulse / aurora / floating-png / floating-svg    │
│                 │  → combinables separando con espacio · "none"        │
├── floating-png ─┼──────────────────────────────────────────────────────┤
│ png-src         │ url · ""                                             │
│ png-count       │ 1–20 · 6                                             │
│ png-width       │ CSS · —                                              │
│ png-height      │ CSS · —                                              │
│ png-size        │ CSS (atajo width) · "48px"                           │
├── floating-svg ─┼──────────────────────────────────────────────────────┤
│ svg-shape       │ cross / heart / star / circle / triangle / dove · cross│
│ svg-color       │ color CSS · "#ffd700"                                │
│ svg-count       │ 1–20 · 6                                             │
│ svg-size        │ CSS · "28px"                                         │
├── glow-pulse ───┼──────────────────────────────────────────────────────┤
│ glow-color      │ color CSS · "#ffd700"                                │
├── rays ─────────┼──────────────────────────────────────────────────────┤
│ rays-color      │ color CSS · "#ffd700"                                │
│ rays-count      │ 2–20 · 8                                             │
├── text-glow ────┼──────────────────────────────────────────────────────┤
│ text-glow-color │ color CSS · "#00e5ff"   (halo principal del texto)   │
│ text-glow-accent│ color CSS · "#ffd700"   (línea inferior dorada)      │
└─────────────────┴──────────────────────────────────────────────────────┘
```

Catálogo completo de `effect`: `none`, `stars`, `bubbles`, `confetti`, `snow`, `rays`, `glow-pulse`, `aurora`, `floating-png`, `floating-svg`, `text-glow` — todos combinables.
