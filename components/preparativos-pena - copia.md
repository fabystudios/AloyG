# `<preparativos-pena>` — Documentación técnica

Web Component (Shadow DOM) que presenta **dos videos landscape (16:9)** dentro de
una tarjeta glassmorfista con **gran rutilancia dorada**, una **imagen de fondo** y
una capa de **efectos festivos** por encima (fuegos artificiales, confeti, nieve,
pétalos, brasas, destellos, bokeh, corazones).

Nació para la **Verbena / Peña Patronal** de San Luis Gonzaga, pero es reutilizable
para cualquier ocasión gracias a su sistema de **temas** (paletas) y **efectos
combinables**. Todo el estilo vive dentro del Shadow DOM: no interfiere con el resto
de la página.

```html
<script src="./components/preparativos-pena.js"></script>
<preparativos-pena
  video1="./video/prep1.mp4"
  video2="./video/prep2.mp4"
  bg="./video/preparativos.png"
  bg-mobile="./video/preparativos_mob.png"
  eyebrow="Preparativos"
  titulo="Gran Verbena Patronal"
  subtitulo="Festejo de Nuestro Patrono · San Luis Gonzaga"
  theme="patronal"
  effect="fireworks sparkles"
  intensity="medium">
</preparativos-pena>
```

---

## Tabla de contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Atributos](#atributos)
- [Temas (paletas)](#temas-paletas)
- [Efectos](#efectos)
  - [Canvas](#efectos-de-canvas)
  - [DOM](#efectos-dom)
  - [Cómo combinar](#cómo-combinar-efectos)
  - [Recomendaciones por ocasión](#recomendaciones-por-ocasión)
- [Audio (botón de sonido)](#audio-botón-de-sonido)
- [Responsive](#responsive)
- [Ejemplos completos](#ejemplos-completos)
- [Arquitectura interna](#arquitectura-interna)
- [Rendimiento y accesibilidad](#rendimiento-y-accesibilidad)
- [Referencia rápida](#referencia-rápida)

---

## Características

- **Dos videos landscape** lado a lado en desktop, apilados en mobile.
- **Desktop**: la card usa `min(1720px, 96vw)` y los videos se limitan a `max-height: 62vh`, de modo que **toda la card entra en el viewport sin scrollear**.
- **Mobile**: la card ocupa `95vw` y admite una **imagen de fondo distinta en 9:16** (`bg-mobile`).
- **Glassmorfismo + rutilancia**: marcos glass, barrido de brillo, resplandor dorado pulsante y guirnalda de luces.
- **6 temas** (paletas) y **8 efectos** combinables.
- **Audio bajo demanda**: botón de sonido por video; al activar uno se silencian los demás.
- Encapsulado en **Shadow DOM**, sin dependencias externas.

---

## Instalación

```html
<script src="./components/preparativos-pena.js"></script>
```

No requiere librerías. Registra el custom element `preparativos-pena`.

---

## Atributos

Todos opcionales; el componente re-renderiza ante cualquier cambio de atributo.

### Contenido

| Atributo     | Default                                          | Descripción |
|--------------|--------------------------------------------------|-------------|
| `video1`     | `./video/prep1.mp4`                              | URL del primer video (mp4 recomendado). |
| `video2`     | `./video/prep2.mp4`                              | URL del segundo video. |
| `poster1`    | —                                                | Poster del video 1 (se muestra antes de cargar). |
| `poster2`    | —                                                | Poster del video 2. |
| `caption1`   | —                                                | Rótulo sobre el video 1 (esquina inferior). Si está vacío, no se dibuja. |
| `caption2`   | —                                                | Rótulo sobre el video 2. |
| `eyebrow`    | `Preparativos`                                   | Línea superior (itálica serif). |
| `titulo`     | `Peña Patronal`                                  | Título principal (degradé dorado). |
| `subtitulo`  | `Festejo de Nuestro Patrono · San Luis Gonzaga`  | Bajada. |

### Fondo

| Atributo    | Default               | Descripción |
|-------------|-----------------------|-------------|
| `bg`        | `./img/magicsky.jpg`  | Imagen de fondo en **desktop** (apaisada). |
| `bg-mobile` | usa `bg`              | Imagen de fondo en **mobile** (≤760px). Pensada para formato **9:16** vertical. Si no se indica, cae a `bg`. |

### Apariencia / efectos

| Atributo    | Valores                                                                                          | Default              |
|-------------|--------------------------------------------------------------------------------------------------|----------------------|
| `theme`     | `patronal` · `navidad` · `pascua` · `mariano` · `adviento` · `noche` · `show`                    | `patronal`           |
| `effect`    | combinables (espacio): `fireworks` `confetti` `snow` `petals` `embers` `sparkles` `bokeh` `hearts` `spotlights` `discoball` · o `none` | `fireworks sparkles` |
| `intensity` | `low` · `medium` · `high`                                                                        | `medium`             |

`intensity` escala la cantidad de partículas (×0.55 / ×1 / ×1.8) y la cadencia de
los fuegos artificiales.

---

## Temas (paletas)

El `theme` cambia **la base profunda del degradé** y **los colores de las
partículas**. El **oro/rutilancia** (título, marcos, luces, glow) se mantiene en
todos los temas como hilo conductor del diseño.

| Tema       | Base                 | Ideal para |
|------------|----------------------|-----------|
| `patronal` | Bordó profundo       | Fiesta patronal, verbena, peña (default). |
| `navidad`  | Verde pino           | Navidad, Adviento tardío, Nochebuena (con `snow`). |
| `pascua`   | Ámbar cálido         | Pascua, Resurrección, solemnidades de gloria. |
| `mariano`  | Azul mariano         | Fiestas de la Virgen (con `petals`). |
| `adviento` | Violeta              | Adviento, Cuaresma, tiempos morados. |
| `noche`    | Azul noche / negro   | Gala, vigilias, eventos nocturnos genéricos. |
| `show`     | Púrpura / negro escenario | Espectáculo, kermés-show, gala festiva (pensado para `spotlights` + `discoball`). |

---

## Efectos

Se activan listándolos en `effect`, separados por espacio. Se dividen en dos
familias según cómo se dibujan.

### Efectos de canvas

Comparten **un único `<canvas>`** y **un solo loop** (`requestAnimationFrame`), así
que combinarlos no multiplica el costo.

| Efecto      | Descripción | Sugerido para |
|-------------|-------------|---------------|
| `fireworks` | Cohetes que suben y estallan en partículas con estela. | Patronales, fiestas, gala. |
| `confetti`  | Rectángulos de colores cayendo y girando. | Celebraciones, kermés. |
| `snow`      | Copos blancos cayendo con leve vaivén. | Navidad, invierno. |
| `petals`    | Pétalos (elipses) descendiendo con balanceo. | Mariano, bodas, primavera. |
| `embers`    | Brasas cálidas que ascienden y se apagan. | Vigilias, fuego, Pentecostés. |

Los colores de `fireworks`, `confetti` y `petals` salen de la paleta del `theme`.
`snow` es siempre blanco; `embers` siempre cálido (ámbar/naranja).

### Efectos DOM

Se montan como `<span>` animados por CSS (no usan canvas).

| Efecto     | Descripción | Sugerido para |
|------------|-------------|---------------|
| `sparkles`   | Destellos ✦ dorados que titilan. | Brillo general, rutilancia extra. |
| `bokeh`      | Orbes de luz dorada suaves que flotan y pulsan. | Elegancia, gala, ambiente cálido. |
| `hearts`     | Corazones ❤ que ascienden. | Sagrado Corazón, amor, bodas. |
| `spotlights` | Reflectores tipo Hollywood (blanco/oro/cian/magenta) que **barren** cruzándose desde la base. | Show, espectáculo, gala, apertura. |
| `discoball`  | **Bola de espejos giratoria** colgando arriba, con destellos reflejados que orbitan por toda la card. | Show, baile, kermés-fiesta. |

> `spotlights` y `discoball` están pensados para el `theme="show"`, pero funcionan
> sobre cualquier tema.

### Cómo combinar efectos

`effect` acepta cualquier cantidad de valores. Ejemplos:

```html
effect="fireworks sparkles"          <!-- default patronal -->
effect="snow bokeh"                  <!-- navidad sobria -->
effect="petals sparkles"             <!-- mariano -->
effect="confetti fireworks sparkles" <!-- máxima fiesta -->
effect="embers sparkles"             <!-- vigilia / fuego -->
effect="none"                        <!-- sin efectos -->
```

> Evitá apilar demasiados efectos de canvas “densos” (`confetti` + `snow` +
> `petals`) en `intensity="high"` a la vez: se ve recargado y suma trabajo de
> dibujo. Dos efectos de canvas + uno o dos DOM es un buen techo.

### Recomendaciones por ocasión

| Ocasión              | `theme`    | `effect`                      |
|----------------------|------------|-------------------------------|
| Verbena / Peña patronal | `patronal` | `fireworks sparkles`        |
| Kermés / Feria       | `patronal` | `confetti fireworks sparkles` |
| Navidad              | `navidad`  | `snow bokeh`                  |
| Nochebuena (festiva) | `navidad`  | `snow fireworks`              |
| Pascua / Resurrección | `pascua`  | `fireworks sparkles bokeh`    |
| Fiesta mariana       | `mariano`  | `petals sparkles`             |
| Adviento / Cuaresma  | `adviento` | `sparkles`                    |
| Pentecostés / Vigilia | `noche`   | `embers sparkles`             |
| Sagrado Corazón      | `patronal` | `hearts sparkles`             |
| Gala nocturna        | `noche`    | `fireworks bokeh`             |
| Show / Espectáculo   | `show`     | `spotlights discoball sparkles` |
| Gran apertura festiva | `show`    | `spotlights discoball fireworks` |

---

## Audio (botón de sonido)

Los videos arrancan **muteados** porque los navegadores solo permiten autoplay sin
sonido. Cada video trae un **botón de parlante** (esquina superior derecha):

- Al tocarlo, **activa el audio de ese video** (el gesto del usuario desbloquea el sonido).
- Para que no se superpongan, **se silencian automáticamente los demás videos**.
- El botón activo cambia a estado “encendido” (color del tema) y los otros vuelven a “Activar sonido”.

Es decir: **un botón por video, vos elegís cuál escuchar**, y suena de a uno.

---

## Responsive

| Breakpoint        | Comportamiento |
|-------------------|----------------|
| **Desktop**       | Card `min(1720px, 96vw)`; videos en 2 columnas; `max-height: 62vh` por video para que entre todo sin scroll. |
| **≤ 760px (mobile)** | Card `95vw`; videos en 1 columna (apilados); se usa `bg-mobile` (9:16); sin tope de altura por video. |

---

## Ejemplos completos

```html
<!-- Patronal (default) -->
<preparativos-pena
  video1="./video/prep1.mp4" video2="./video/prep2.mp4"
  bg="./video/preparativos.png" bg-mobile="./video/preparativos_mob.png"
  eyebrow="Preparativos" titulo="Gran Verbena Patronal"
  subtitulo="Festejo de Nuestro Patrono · San Luis Gonzaga"
  theme="patronal" effect="fireworks sparkles" intensity="medium">
</preparativos-pena>

<!-- Navidad con nieve y bokeh -->
<preparativos-pena
  video1="./video/nochebuena1.mp4" video2="./video/nochebuena2.mp4"
  bg="./img/navidad_desk.jpg" bg-mobile="./img/navidad_mob.jpg"
  eyebrow="Preparándonos" titulo="Misa de Nochebuena"
  subtitulo="24 de Diciembre · 22:00 hs"
  theme="navidad" effect="snow bokeh" intensity="medium"
  caption1="Armado del pesebre" caption2="Ensayo del coro">
</preparativos-pena>

<!-- Fiesta mariana con pétalos -->
<preparativos-pena
  video1="./video/maria1.mp4" video2="./video/maria2.mp4"
  bg="./img/mariano_desk.jpg" bg-mobile="./img/mariano_mob.jpg"
  eyebrow="Honremos a la Madre" titulo="Nuestra Señora"
  theme="mariano" effect="petals sparkles" intensity="high">
</preparativos-pena>
```

---

## Arquitectura interna

### DOM renderizado (dentro del Shadow Root)

```text
<article class="pp-card pp-theme-X">       ← define las CSS vars del tema
  ├── .pp-bg          ← imagen de fondo (bg / bg-mobile)
  ├── .pp-vignette    ← oscurecido para legibilidad
  ├── .pp-glow        ← resplandor dorado pulsante
  ├── .pp-sheen       ← barrido de rutilancia
  ├── .pp-lights      ← guirnalda de bombitas (×28)
  ├── .pp-stage
  │     ├── .pp-head  ← eyebrow / título / subtítulo / regla
  │     └── .pp-videos
  │           └── .pp-vidwrap ×2
  │                 ├── <video>      ← muted loop autoplay playsinline
  │                 ├── .pp-frame    ← marco dorado interior
  │                 ├── .pp-sound    ← botón de audio
  │                 └── .pp-cap      ← rótulo (opcional)
  ├── .pp-overlay     ← efectos DOM: .pp-spark / .pp-bokeh / .pp-heart
  └── .pp-canvas      ← efectos canvas: fireworks/confetti/snow/petals/embers
```

### Sistema de efectos canvas

- **Un solo loop** (`_tick`) actualiza y dibuja todo en cada frame, con `dt`
  normalizado a 60 fps para que la velocidad sea estable.
- **Falling** (`confetti`/`snow`/`petals`) se **siembran una vez** (`_seedFall`,
  cantidad según el ancho de la card e `intensity`) y se **reciclan** al salir por
  abajo — no se crean/destruyen objetos por frame.
- **`embers`** y **`fireworks`** se dibujan en modo aditivo (`globalCompositeOperation = 'lighter'`) con `shadowBlur` para el glow; las falling van en `source-over` sin blur (más barato).
- El canvas se dimensiona con `devicePixelRatio` (capado a 2) vía `ResizeObserver`.

### Colores por tema

El mapa `PP_THEMES` (scope de módulo) define los arrays de colores de
`fireworks` / `confetti` / `petal` para cada tema. Las CSS vars del tema
(`--c1`, `--c2`) se aplican por la clase `pp-theme-X` en la card.

### Ciclo de vida

- `connectedCallback` → render.
- `attributeChangedCallback` → re-render completo.
- `disconnectedCallback` → `_stopFx()` cancela el rAF y desconecta observers.

---

## Rendimiento y accesibilidad

- **Pausa fuera de pantalla**: un `IntersectionObserver` detiene el loop cuando la
  card no es visible y lo reanuda al volver — no consume CPU scrolleado lejos.
- **`prefers-reduced-motion`**: si el usuario lo pide, se ocultan los efectos de
  canvas y se congelan las animaciones DOM (glow, sheen, luces, partículas).
- El botón de sonido tiene `aria-label` / `aria-pressed` dinámicos y `:focus-visible`.
- Capas puramente decorativas marcadas con `aria-hidden="true"`.

---

## Referencia rápida

```text
┌─────────────┬───────────────────────────────────────────────────────────┐
│ Atributo    │ Valores / default                                         │
├─────────────┼───────────────────────────────────────────────────────────┤
│ video1      │ url · ./video/prep1.mp4                                    │
│ video2      │ url · ./video/prep2.mp4                                    │
│ poster1/2   │ url · —                                                    │
│ caption1/2  │ string · —                                                 │
│ bg          │ url · ./img/magicsky.jpg                                   │
│ bg-mobile   │ url (9:16) · usa bg                                        │
│ eyebrow     │ string · "Preparativos"                                    │
│ titulo      │ string · "Peña Patronal"                                   │
│ subtitulo   │ string · "Festejo de Nuestro Patrono · San Luis Gonzaga"   │
│ theme       │ patronal|navidad|pascua|mariano|adviento|noche|show        │
│ effect      │ fireworks confetti snow petals embers · sparkles bokeh     │
│             │ hearts spotlights discoball → combinables · "none"         │
│             │   def "fireworks sparkles"                                 │
│ intensity   │ low | medium | high · "medium"                             │
└─────────────┴───────────────────────────────────────────────────────────┘
```

**Catálogo de efectos (10):** `fireworks`, `confetti`, `snow`, `petals`, `embers`
(canvas) · `sparkles`, `bokeh`, `hearts`, `spotlights`, `discoball` (DOM).
**Temas (7):** `patronal`, `navidad`, `pascua`, `mariano`, `adviento`, `noche`, `show`.
