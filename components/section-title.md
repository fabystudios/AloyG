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

| Atributo    | Tipo                                | Default | Descripción                                                                 |
|-------------|-------------------------------------|---------|-----------------------------------------------------------------------------|
| `text`      | string                              | `""`    | Texto principal del título.                                                  |
| `icon`      | string                              | `""`    | Ícono que precede al texto. Emoji, nombre de Material Icon o `fa-...`.       |
| `icon-type` | `"auto"`, `"emoji"`, `"material"`, `"fa"` | `"auto"` | Cómo interpretar `icon`. En `"auto"` el componente lo detecta heurísticamente. |
| `id`        | string                              | `""`    | Se aplica al `<section>` interno para anclas (`#Anuncios`, etc.).            |

**Detección automática de `icon-type`:**
- Texto en `lowercase` con guiones bajos (`campaign`, `child_care`) → `material`
- Prefijo `fa-` → `fa` (FontAwesome)
- Cualquier otra cosa (incluye emojis) → `emoji`

### Sistema de efectos

| Atributo  | Tipo                                                                                                | Default | Descripción                                                                 |
|-----------|-----------------------------------------------------------------------------------------------------|---------|-----------------------------------------------------------------------------|
| `effect`  | `"none"` o uno o más de: `stars`, `bubbles`, `confetti`, `snow`, `rays`, `glow-pulse`, `aurora`, `floating-png`, `floating-svg` — **combinables separados por espacio** | `"none"` | Qué efecto(s) animar de fondo. |
| `png-src` | URL                                                                                                 | `""`    | Imagen para `floating-png`. Si no se setea, no se dibujan PNGs.              |
| `png-count` | número entero (1–20)                                                                              | `6`     | Cuántas instancias del PNG flotan.                                          |

#### Atributos por efecto

**`floating-svg`** (formas pre-armadas, sin necesidad de PNG):

| Atributo     | Default | Valores                                                |
|--------------|---------|--------------------------------------------------------|
| `svg-shape`  | `cross` | `cross`, `heart`, `star`, `circle`, `triangle`, `dove` |
| `svg-color`  | `#ffd700` | color CSS                                            |
| `svg-count`  | `6`     | 1–20                                                   |
| `svg-size`   | `28px`  | tamaño CSS                                             |

**`glow-pulse`** (halo pulsante dentro del header):

| Atributo     | Default     |
|--------------|-------------|
| `glow-color` | `#ffd700`   |

**`rays`** (rayos divergentes desde el centro):

| Atributo     | Default     |
|--------------|-------------|
| `rays-color` | `#ffd700`   |
| `rays-count` | `8` (2–20)  |

**`text-glow`** (resplandor multi-capa sobre el texto y el ícono — replica el look "neón" del AVISOS original):

| Atributo            | Default       | Descripción                                |
|---------------------|---------------|--------------------------------------------|
| `text-glow-color`   | `#00e5ff`     | Color principal del halo (24px spread).    |
| `text-glow-accent`  | `#ffd700`     | Color de la línea inferior 1px (sutil).    |

Los efectos `bubbles`, `confetti`, `snow`, `aurora` no requieren atributos extra (usan paleta y velocidad por defecto).

### Tamaño de PNG flotantes

Tres formas de controlar el tamaño, en orden de prioridad:

| Atributo     | Default  | Comportamiento                                                                                            |
|--------------|----------|------------------------------------------------------------------------------------------------------------|
| `png-width`  | —        | Setea CSS `width`. Si no hay `png-height`, la altura queda en `auto` (preserva aspect ratio).             |
| `png-height` | —        | Setea CSS `height`. Si no hay `png-width`, el ancho queda en `auto` (preserva aspect ratio).              |
| `png-size`   | `"48px"` | Atajo. Solo se aplica si **no** se setearon `png-width` ni `png-height`. Equivale a `png-width`.          |

**Regla práctica:** si el PNG es portrait (más alto que ancho, como `gps.png`), usá `png-height`. Si es landscape (`banderines.png`), usá `png-width`. Si es cuadrado, cualquiera de los dos.

### Apariencia

| Atributo      | Default | Descripción                                                                                  |
|---------------|---------|----------------------------------------------------------------------------------------------|
| `shadow`      | `""`    | Pasar `"lg"` agrega la clase Bootstrap `shadow-lg`.                                          |
| `extra-style` | `""`    | CSS inline extra para el `<section>` interno (p.ej. margins custom para casos especiales).   |

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

| Tema           | Efectos sugeridos                              |
|----------------|------------------------------------------------|
| Navidad        | `snow glow-pulse`                              |
| Pentecostés    | `rays glow-pulse`                              |
| Fiesta patronal| `confetti floating-png` (banderines)           |
| Pascua         | `stars rays`                                   |
| Día del Niño   | `bubbles confetti`                             |
| Avisos urgentes| `aurora floating-png` (megáfono)               |
| Solemnidad     | `glow-pulse rays`                              |

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

| Patrón viejo                                  | Atributo equivalente           |
|-----------------------------------------------|--------------------------------|
| `class="section-header shadow-lg"`            | `shadow="lg"`                  |
| `<i class="material-icons">campaign</i>`      | `icon="campaign"` (auto)       |
| `<i class="fas fa-dove"></i>`                 | `icon="fa-dove" icon-type="fa"`|
| Emoji antes del texto (`📜 Más Historia`)     | `icon="📜" text="Más Historia"`|
| `style="margin-top:0; padding:1em 0;"` custom | `extra-style="..."` (evitar)  |

---

## Referencia rápida

```text
┌─────────────────┬──────────────────────────────────────────────────────┐
│ Atributo        │ Valores / default                                    │
├─────────────────┼──────────────────────────────────────────────────────┤
│ text            │ string · ""                                          │
│ icon            │ emoji / material / fa-… · ""                         │
│ icon-type       │ auto / emoji / material / fa · "auto"                │
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
