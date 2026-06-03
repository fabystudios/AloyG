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

Además ofrece **13 efectos visuales combinables** (estrellas, burbujas, confeti, nieve, fairy-dust, halos, etc.) y un fix de padding mobile que estaba roto por reglas globales del *"reacomodamiento general"*.

---

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso mínimo](#uso-mínimo)
- [Atributos](#atributos)
  - [Contenido](#contenido)
  - [Sistema de efectos](#sistema-de-efectos)
  - [Atributos por efecto](#atributos-por-efecto)
  - [Tamaño de PNG flotantes](#tamaño-de-png-flotantes)
  - [Apariencia](#apariencia)
- [Efectos disponibles](#efectos-disponibles)
  - [Canvas-based](#canvas-based-comparten-un-único-canvas)
  - [DOM-based](#dom-based-no-usan-canvas)
  - [Text effect](#text-effect)
  - [none](#none--sin-efectos)
- [Cómo combinar efectos](#cómo-combinar-efectos)
  - [Recomendaciones de combinación](#recomendaciones-de-combinación)
- [Ejemplos completos](#ejemplos-completos)
- [Arquitectura interna](#arquitectura-interna)
- [Fix mobile incluido](#fix-mobile-incluido)
- [Protección contra colisión de ID](#protección-contra-colisión-de-id)
- [Migración desde el patrón viejo](#migración-desde-el-patrón-viejo)
- [Demo](#demo)
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

| Atributo      | Tipo                                      | Default  | Descripción |
|---------------|-------------------------------------------|----------|-------------|
| `text`        | string                                    | `""`     | Texto principal del título. |
| `icon`        | string                                    | `""`     | Ícono que precede al texto. Emoji, nombre de Material Icon o `fa-...`. |
| `icon-type`   | `"auto"`, `"emoji"`, `"material"`, `"fa"` | `"auto"` | Cómo interpretar `icon`. En `"auto"` el componente lo detecta heurísticamente. |
| `icon-mobile` | `"on"`, `"off"`                           | `"on"`   | Si vale `"off"`, oculta el ícono solo en mobile (`max-width: 768px`). Útil cuando el título es largo y el espacio se complica. |
| `id`          | string                                    | `""`     | Se aplica al `<section>` interno para anclas (`#Anuncios`, etc.). |

**Detección automática de `icon-type`:**

- Texto en `lowercase` con guiones bajos (`campaign`, `child_care`) → `material`
- Prefijo `fa-` → `fa` (FontAwesome)
- Cualquier otra cosa (incluye emojis) → `emoji`

### Sistema de efectos

| Atributo  | Tipo                                                                                                                                                                              | Default  |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `effect`  | `"none"` o uno o más de: `stars`, `bubbles`, `popping-bubbles`, `confetti`, `snow`, `rays`, `fairy-dust`, `glow-pulse`, `aurora`, `floating-png`, `floating-svg`, `text-glow` — **combinables separados por espacio** | `"none"` |

### Atributos por efecto

**`floating-png`** (PNG repetido flotando):

| Atributo     | Default  | Descripción |
|--------------|----------|-------------|
| `png-src`    | `""`     | URL del PNG. Sin esto, el efecto no dibuja nada. |
| `png-count`  | `6`      | 1–20 instancias. |
| `png-width`  | —        | CSS width (height: auto si no se setea). |
| `png-height` | —        | CSS height (width: auto si no se setea). |
| `png-size`   | `"48px"` | Atajo: solo se aplica si no hay `png-width` ni `png-height`. |

**`floating-svg`** (formas SVG pre-armadas — sin necesidad de archivo):

| Atributo     | Default     | Valores |
|--------------|-------------|---------|
| `svg-shape`  | `"cross"`   | `cross`, `heart`, `star`, `circle`, `triangle`, `dove` |
| `svg-color`  | `"#ffd700"` | color CSS |
| `svg-count`  | `6`         | 1–20 |
| `svg-size`   | `"28px"`    | tamaño CSS |

**`glow-pulse`** (radial-gradient pulsante en blend-mode screen):

| Atributo      | Default     |
|---------------|-------------|
| `glow-color`  | `"#ffd700"` |

**`rays`** (rayos divergentes desde el centro):

| Atributo     | Default     |
|--------------|-------------|
| `rays-color` | `"#ffd700"` |
| `rays-count` | `8` (2–20)  |

**`text-glow`** (resplandor multi-capa sobre el texto y el ícono — replica el look "neón" del AVISOS original):

| Atributo            | Default      | Descripción |
|---------------------|--------------|-------------|
| `text-glow-color`   | `"#00e5ff"`  | Color principal del halo (24px spread). |
| `text-glow-accent`  | `"#ffd700"`  | Color de la línea inferior 1px (sutil). |

Los efectos `bubbles`, `popping-bubbles`, `confetti`, `snow`, `aurora` no requieren atributos extra (usan paleta y velocidad por defecto, escalan por viewport).

### Tamaño de PNG flotantes

Tres formas de controlar el tamaño, en orden de prioridad:

| Atributo     | Default  | Comportamiento |
|--------------|----------|-----------------|
| `png-width`  | —        | Setea CSS `width`. Si no hay `png-height`, la altura queda en `auto` (preserva aspect ratio). |
| `png-height` | —        | Setea CSS `height`. Si no hay `png-width`, el ancho queda en `auto` (preserva aspect ratio). |
| `png-size`   | `"48px"` | Atajo. Solo se aplica si **no** se setearon `png-width` ni `png-height`. Equivale a `png-width`. |

**Regla práctica:** si el PNG es portrait (más alto que ancho, como `gps.png`), usá `png-height`. Si es landscape (`banderines.png`), usá `png-width`. Si es cuadrado, cualquiera de los dos.

### Apariencia

| Atributo      | Default | Descripción |
|---------------|---------|-------------|
| `shadow`      | `""`    | Pasar `"lg"` agrega la clase Bootstrap `shadow-lg`. |
| `extra-style` | `""`    | CSS inline extra para el `<section>` interno (p.ej. margins custom). |

---

## Efectos disponibles

### Canvas-based (comparten un único canvas)

Los efectos canvas comparten **un solo `<canvas>`** y **un solo loop de animación** dentro del header, así que combinar varios (`effect="stars confetti"`) no agrega overhead.

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

#### `popping-bubbles` — Burbujas que explotan

Variante de `bubbles`: cada burbuja sube con un reflejo blanco interior (mirá real), y al alcanzar una altura aleatoria **estalla** con un anillo expansivo + 6 gotitas radiales (chispas). Luego una nueva burbuja arranca desde abajo.

```html
<section-title text="Niñ@s" effect="popping-bubbles"></section-title>
```

Sin atributos extra. La cantidad y velocidad escalan según viewport (6 mobile / 12 desktop).

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

#### `fairy-dust` — Polvo de hadas (estilo Tinkerbell)

Estrellitas con forma de cruz de 4 puntas + 2 diagonales más finitas, en colores pastel suaves (rosita, lavanda, cian pálido, dorado). Cada una **nace, pulsa creciendo**, llega a su pico de brillo y ahí **estalla emitiendo polvo** que se dispersa como estela flotando (gravedad muy suave, como magia). Después se desvanece y nace otra en otro lugar.

Estética: descanso, magia, ternura, recogimiento espiritual. Encaja con secciones tipo "Oración", "Adoración", "Día del Niño", "Hora Santa", o cualquier momento contemplativo.

```html
<section-title text="Adoración Eucarística" icon="🌙" effect="fairy-dust"></section-title>
```

Sin atributos extra. Paleta interna: `#ffd1ec`, `#c9b9ff`, `#a0e9ff`, `#fff6c2`, `#d4a3ff`, `#9ffff6`, `#ffb1e1`, `#ffe5a0`. Cantidad: 5 mobile / 10 desktop.

### DOM-based (no usan canvas)

#### `glow-pulse` — Halo pulsante

Capa con **radial-gradient** del color elegido, aplicado con `mix-blend-mode: screen` y animación de scale + opacity. Ilumina toda la superficie del header como un aura pulsante (no solo los bordes).

```html
<section-title text="Solemnidad" effect="glow-pulse"
               glow-color="#ffd700"></section-title>
```

> **Nota:** la versión inicial usaba `box-shadow: inset` que solo pintaba los bordes y era casi invisible. La implementación actual (radial-gradient + screen blend) hace el pulso bien notable sobre cualquier fondo.

#### `aurora` — Gradiente animado

Capa con `linear-gradient` multicolor en `mix-blend-mode: overlay` que se mueve lentamente (animación de `background-position` con `background-size: 400% 400%`). Efecto "vivo" sin partículas.

```html
<section-title text="Anuncio Especial" effect="aurora"></section-title>
```

> **Nota técnica:** internamente seteamos `backgroundImage` (no la shorthand `background`) para no resetear el `background-size: 400% 400%` definido en el CSS.

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
               effect="stars floating-png text-glow"
               text-glow-color="#00e5ff"
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

| Tema             | Efectos sugeridos                          |
|------------------|--------------------------------------------|
| Navidad          | `snow glow-pulse`                          |
| Pentecostés      | `rays glow-pulse`                          |
| Fiesta patronal  | `confetti floating-png` (banderines)       |
| Pascua           | `stars rays`                               |
| Día del Niño     | `popping-bubbles confetti`                 |
| Bautismos        | `bubbles floating-svg` (svg-shape=heart)   |
| Adoración / Descanso | `fairy-dust glow-pulse` con `glow-color="#c9b9ff"` |
| Hora Santa       | `fairy-dust rays` con `rays-color="#fff6c2"` |
| Avisos urgentes  | `aurora floating-png text-glow` (megáfono) |
| Solemnidad       | `glow-pulse rays`                          |
| AVISOS original  | `stars floating-png text-glow` con `text-glow-color="#00e5ff"` |

Evitá combinar **más de 3 efectos canvas** al mismo tiempo en un mismo header — se ve sobrecargado.

---

## Ejemplos completos

Tomados del `index.html` actual:

```html
<!-- AVISOS — estrellas + megáfonos + resplandor cyan -->
<section-title id="Anuncios"
               icon="campaign"
               text="Avisos"
               effect="stars floating-png text-glow"
               text-glow-color="#00e5ff"
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

<!-- Ubicación — pins GPS chicos (controlados por altura) -->
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
<section-title id="X" ...>              ← host (display:block, hereda --pub-gap)
  └── <section class="section-header">  ← gradiente, padding, border-radius
        ├── <div class="st-fx-layer">    ← capa de efectos (z-index:1)
        │     ├── <canvas>               ← stars/bubbles/popping-bubbles/confetti/snow/rays/fairy-dust
        │     ├── <div class="st-aurora">  ← aurora
        │     ├── <div class="st-glow-pulse"> ← glow-pulse
        │     ├── <img class="st-png">      ← floating-png (×N)
        │     └── <svg class="st-svg">      ← floating-svg (×N)
        └── <h2 class="md3-headline">    ← título (z-index:2, va arriba)
              ├── ícono (i / span)
              └── texto
```

### Light DOM, no Shadow DOM

El componente **no** usa Shadow DOM. Renderiza con `innerHTML` para que las clases existentes (`.section-header`, `.md3-headline`, `.shadow-lg`) que ya están en `style.css` se apliquen sin tener que duplicarlas.

### Ciclo de vida

- `connectedCallback` → render inicial (resetea `_rafs` y `_ros`).
- `attributeChangedCallback` → re-render completo en cualquier cambio de atributo.
- `disconnectedCallback` → `_stopAll()` cancela todos los rAFs activos y desconecta los ResizeObservers.

### Estilos inyectados

`section-title.js` inserta un único `<style data-section-title>` en `document.head` la primera vez que se evalúa. Incluye:

- `position: absolute` y z-index para la `.st-fx-layer`.
- Animación `@keyframes st-png-float` (traslación + rotación).
- Animación `@keyframes st-glow-pulse` (scale 0.94→1.02 + opacity 0.25→0.85).
- Animación `@keyframes st-aurora-shift` (background-position 0%→100%→0%).
- Refuerzo `display: flex; align-items: center; justify-content: center; width: 100%` con `!important` sobre el `.section-header` interno.
- Reset blindado del host: `display: block !important; padding: 0 !important; background: transparent !important;` (ver [protección contra colisión de ID](#protección-contra-colisión-de-id)).
- Refuerzo mobile (`@media (max-width: 768px)`) que restaura los valores correctos de padding/height/border-radius.
- Regla `.st-icon-hide-mobile { display: none !important; }` dentro del media-query mobile, usada por `icon-mobile="off"`.

### Por qué los efectos canvas se inicializan síncronos

Originalmente el componente esperaba un `requestAnimationFrame` antes de crear el canvas (para asegurar layout). El problema: **rAF no dispara en tabs en background ni en contextos headless**, así que el canvas nunca se creaba en esos casos.

Solución actual:

1. Después de `this.appendChild(section)`, llamamos `_startCanvasFx(...)` directo. `container.offsetWidth` fuerza un layout flush sincrónico.
2. El loop de animación hace una primera llamada a `drawFrame()` síncrona antes del primer `requestAnimationFrame(loop)`, para que el canvas tenga un primer paint visible aunque el rAF tarde.

---

## Fix mobile incluido

El commit `965bd758` ("reacomodamiento gral") agregó esta regla global:

```css
.section-header { display: block; margin-block: var(--pub-gap); margin-inline: auto; }
```

que sobrescribía el `display: flex; align-items: center` del CSS base y dejaba el `<h2>` pegado al top del content-area, produciendo padding visualmente **asimétrico** en mobile.

Adicionalmente, los inline styles del bloque magic-stars original (línea 932) fijaban `padding: 1.5rem 2rem` impidiendo que el media-query mobile (`padding: 1rem 1.5rem`) tuviera efecto.

`section-title.js` contrarresta ambos problemas con bloques `!important`:

```css
section-title > section.section-header {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
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

## Protección contra colisión de ID

Había reglas viejas en `style.css` apuntando a IDs específicos (ejemplo: `#nosotros { padding: 40px 20px; display: flex; }`). Esas reglas matcheaban tanto el `<section id="nosotros">` interno (que es esperable) como el HOST `<section-title id="nosotros">`, porque el atributo `id` se aplica a ambos. Por especificidad de ID (100) esas reglas ganaban contra los selectores de clase del componente.

Resultado: el titular `nosotros` aparecía visiblemente más angosto (577px vs 1075px del resto) porque el padding 40px del host recortaba el contenedor donde se calcula `max-width: 85%`.

Solución en `section-title.js`:

```css
section-title {
  display: block !important;
  padding: 0 !important;
  background: transparent !important;
}
```

Combinado con `width: 100% !important` sobre el `.section-header` interno, el componente queda **id-collision-proof**: cualquier `<section-title id="X">` ignora reglas externas `#X { ... }` que intenten pisar layout.

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

| Patrón viejo                                  | Atributo equivalente              |
|-----------------------------------------------|-----------------------------------|
| `class="section-header shadow-lg"`            | `shadow="lg"`                     |
| `<i class="material-icons">campaign</i>`      | `icon="campaign"` (auto)          |
| `<i class="fas fa-dove"></i>`                 | `icon="fa-dove" icon-type="fa"`   |
| Emoji antes del texto (`📜 Más Historia`)     | `icon="📜" text="Más Historia"`   |
| `style="margin-top:0; padding:1em 0;"` custom | `extra-style="..."` (evitar)      |
| Inline `<canvas>` + script de estrellas       | `effect="stars"`                  |

---

## Demo

`section-title-demo.html` en la raíz del proyecto contiene una página con **una instancia por efecto** (más combos) para previsualizar todo el catálogo. Carga el script con cache-bust para que siempre uses la última versión.

---

## Referencia rápida

```text
┌─────────────────┬──────────────────────────────────────────────────────┐
│ Atributo        │ Valores / default                                    │
├─────────────────┼──────────────────────────────────────────────────────┤
│ text            │ string · ""                                          │
│ icon            │ emoji / material / fa-… · ""                         │
│ icon-type       │ auto / emoji / material / fa · "auto"                │
│ icon-mobile     │ on / off · "on"      (off → oculta ícono <768px)     │
│ id              │ string · ""                                          │
│ shadow          │ "" / "lg" · ""                                       │
│ extra-style     │ CSS inline · ""                                      │
├─────────────────┼──────────────────────────────────────────────────────┤
│ effect          │ none / stars / bubbles / popping-bubbles / confetti  │
│                 │ snow / rays / fairy-dust / glow-pulse / aurora /     │
│                 │ floating-png / floating-svg / text-glow              │
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

**Catálogo de efectos (13):** `none`, `stars`, `bubbles`, `popping-bubbles`, `confetti`, `snow`, `rays`, `fairy-dust`, `glow-pulse`, `aurora`, `floating-png`, `floating-svg`, `text-glow` — todos combinables.
