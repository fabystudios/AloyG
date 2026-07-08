# `<feria-poster>` — Documentación técnica

Web Component nativo (Shadow DOM) para montar una escena de afiche de feria parroquial con figuras decorativas, efectos climáticos/estacionales animados y modal de zoom.

---

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso básico](#uso-básico)
- [Atributos de contenido](#atributos-de-contenido)
- [Atributos de posición de figuras](#atributos-de-posición-de-figuras)
- [Sistema de efectos](#sistema-de-efectos)
  - [Catálogo de efectos](#catálogo-de-efectos)
  - [Intensidad y velocidad](#intensidad-y-velocidad)
- [Modal de zoom](#modal-de-zoom)
- [Arquitectura interna](#arquitectura-interna)
  - [Registro FX](#registro-fx)
  - [Agregar un efecto nuevo](#agregar-un-efecto-nuevo)
- [Ejemplos por estación / clima](#ejemplos-por-estación--clima)
- [Referencia rápida de atributos](#referencia-rápida-de-atributos)

---

## Instalación

```html
<!-- Incluir antes del cierre de </body> -->
<script src="./js/feria-poster.js" defer></script>
```

No tiene dependencias externas. Requiere un navegador con soporte de Custom Elements v1 (todos los navegadores modernos).

---

## Uso básico

```html
<feria-poster
  bg-src="./img/feria-autumn.png"
  poster-desktop="./feria/poster_desk.png"
  poster-mobile="./feria/poster_mob.jpg"
  modal-image="./feria/poster_modal.png"
  figure-src="./feria/piloto50s.png"
  figure-src2="./feria/rubia.png"
  banderines-src="./img/banderines.png"
  cta-mobile="tocar sobre el flyer para zoom"
  cta-desktop="click sobre el flyer para zoom"
  effect="autumn-leaves"
  effect-intensity="medium"
  effect-speed="normal"
  figure-bottom="10px"
  figure-left="10%"
  figure-mobile-bottom="0px"
  figure-mobile-left="5%"
  figure2-bottom="5px"
  figure2-right="15%"
  figure2-mobile-bottom="0px"
  figure2-mobile-right="10%">
</feria-poster>
```

> Si necesitás una imagen distinta para el modal de zoom en desktop y en mobile, reemplazá `modal-image` por el par `modal-image-desktop` + `modal-image-mobile` (ver [Modal de zoom](#modal-de-zoom)).

---

## Atributos de contenido

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| `bg-src` | `string` (URL) | No | Imagen de fondo de la escena completa. |
| `poster-desktop` | `string` (URL) | Sí | Afiche visible en pantallas ≥ 769 px. |
| `poster-mobile` | `string` (URL) | No | Afiche para pantallas ≤ 768 px. Si se omite, usa `poster-desktop`. |
| `modal-image` | `string` (URL) | No | Imagen que se muestra en el modal de zoom. Fallback: `poster-mobile` → `poster-desktop`. Se ignora si se pasan `modal-image-desktop` **y** `modal-image-mobile`. |
| `modal-image-desktop` | `string` (URL) | No | Imagen del modal solo para pantallas ≥ 769 px. Requiere pasar también `modal-image-mobile` para activarse (ver [Modal de zoom](#modal-de-zoom)). |
| `modal-image-mobile` | `string` (URL) | No | Imagen del modal solo para pantallas ≤ 768 px. Requiere pasar también `modal-image-desktop` para activarse. |
| `figure-src` | `string` (URL) | No | Figura decorativa izquierda (PNG con transparencia recomendado). |
| `figure-mobile-src` | `string` (URL) | No | Variante mobile de `figure-src`. Si se omite, usa `figure-src`. |
| `figure-src2` | `string` (URL) | No | Segunda figura decorativa (derecha). |
| `banderines-src` | `string` (URL) | No | Imagen de banderines decorativos en la esquina superior derecha. |
| `board-src` | `string` (URL) | No | Textura del marco/pizarra del afiche. Si se omite, fondo madera sólida. |
| `cta-mobile` | `string` | No | Texto del indicador de acción en mobile. Default: `"tocar = zoom"`. |
| `cta-desktop` | `string` | No | Texto del indicador de acción en desktop. Default: `"click sobre el flyer para zoom"`. |

---

## Atributos de posición de figuras

Controlan la posición de cada figura con valores CSS válidos (px, %, vw, etc.).

### Figura 1 (izquierda, `figure-src`)

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `figure-bottom` | `0px` | Distancia desde el borde inferior en desktop. |
| `figure-left` | `-22%` | Distancia desde el borde izquierdo en desktop. |
| `figure-mobile-bottom` | `0px` | Distancia inferior en mobile. |
| `figure-mobile-left` | `-14%` | Distancia izquierda en mobile. |

### Figura 2 (derecha, `figure-src2`)

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `figure2-bottom` | `0px` | Distancia inferior en desktop. |
| `figure2-right` | `-18%` | Distancia desde el borde derecho en desktop. |
| `figure2-mobile-bottom` | `0px` | Distancia inferior en mobile. |
| `figure2-mobile-right` | `-10%` | Distancia derecha en mobile. |

> **Tip:** Valores negativos permiten que las figuras "desborden" la escena, creando profundidad.

---

## Sistema de efectos

El componente incluye un motor de partículas paramétrico. Todos los efectos viven en el objeto `FX` al comienzo del archivo y son completamente independientes del resto del componente.

```html
<feria-poster
  effect="rain-wind"
  effect-intensity="high"
  effect-speed="fast"
  ...>
</feria-poster>
```

### Catálogo de efectos

#### 🍂 Otoño

| `effect` | Descripción |
|----------|-------------|
| `autumn-leaves` | Hojas de otoño (🍂🍁🍃) cayendo con deriva lateral aleatoria. Efecto por defecto. |

#### ❄️ Invierno

| `effect` | Descripción |
|----------|-------------|
| `snow` | Copos de nieve (❄❅❆) cayendo suavemente con leve oscilación. |
| `blizzard` | Ventisca: copos pequeños y rápidos con fuerte desvío lateral. |

#### 🌧 Lluvia

| `effect` | Descripción |
|----------|-------------|
| `rain` | Lluvia vertical moderada. Las gotas son divs finos semitransparentes. |
| `rain-wind` | Lluvia inclinada con viento de izquierda a derecha. |
| `thunderstorm` | Tormenta intensa: lluvia densa + overlay de relámpago parpadeante. |

#### 💨 Viento

| `effect` | Descripción |
|----------|-------------|
| `wind-ltr` | Hojas volando de izquierda a derecha a través de la escena. |
| `wind-rtl` | Hojas volando de derecha a izquierda. |
| `whirlwind` | Torbellino: partículas orbitando en espiral ascendente. |

#### 🌸 Primavera

| `effect` | Descripción |
|----------|-------------|
| `butterflies` | Mariposas (🦋) con trayectoria sinuosa no lineal. |
| `petals` | Pétalos de flor (🌸🌺🌼🌷) cayendo con rotación. |
| `spring` | Mix: mariposas + pétalos + flores, trayectorias variadas. |

#### ☀️ Verano

| `effect` | Descripción |
|----------|-------------|
| `fireflies` | Luciérnagas: puntos que se mueven erráticamente con glow pulsante amarillo. |
| `sun-rays` | Destellos de rayos de sol irradiando desde el centro. |
| `bubbles` | Burbujas que ascienden desde la base de la escena. |

#### 🎉 Festivo

| `effect` | Descripción |
|----------|-------------|
| `confetti` | Piezas de confeti de colores cayendo con giro. |
| `stars` | Estrellas y destellos (✨⭐🌟💫) que aparecen y desaparecen. |
| `bakery` | Objetos de panadería (🥐🥖🧁🍰☕) cruzando la escena. |

#### Sin efecto

| `effect` | Descripción |
|----------|-------------|
| `none` | Desactiva cualquier efecto de partículas. |

---

### Intensidad y velocidad

#### `effect-intensity`

Multiplica la cantidad de partículas generadas.

| Valor | Multiplicador | Uso recomendado |
|-------|--------------|-----------------|
| `low` | × 0.4 | Efecto sutil, segundo plano |
| `medium` | × 1.0 | Estándar (default) |
| `high` | × 2.2 | Efecto dramático o festivo |

#### `effect-speed`

Divide la duración de las animaciones (más bajo = más lento).

| Valor | Multiplicador | Resultado |
|-------|--------------|-----------|
| `slow` | × 0.55 | Movimiento pausado, onírico |
| `normal` | × 1.0 | Velocidad estándar (default) |
| `fast` | × 1.8 | Movimiento ágil, energético |

> **Nota de rendimiento:** Intensidad `high` con efecto `thunderstorm` o `blizzard` genera ~65–88 elementos DOM animados. Probado sin problemas en móviles modernos; en dispositivos de gama baja se recomienda `medium` o `low`.

---

## Modal de zoom

Al hacer clic (o tocar) sobre el afiche se abre un modal fullscreen con la imagen del afiche ampliada.

**Modo simple (una sola imagen):**

```html
<feria-poster modal-image="./feria/poster_modal.png" ...></feria-poster>
```

Si no se pasa `modal-image`, se usa como fallback `poster-mobile` → `poster-desktop`.

**Modo dual (imagen distinta según pantalla):**

Si se pasan **ambos** atributos `modal-image-desktop` y `modal-image-mobile`, tienen prioridad sobre `modal-image` y el componente arma internamente un `<picture>` que elige una u otra según el ancho de pantalla (mismo breakpoint de 769 px que usan `poster-desktop`/`poster-mobile`):

```html
<feria-poster
  modal-image-desktop="./feria/poster_modal_desk.png"
  modal-image-mobile="./feria/poster_modal_mob.png"
  ...>
</feria-poster>
```

> Si solo se pasa uno de los dos (`modal-image-desktop` o `modal-image-mobile` sin su par), se ignoran ambos y el modal vuelve al modo simple con `modal-image`.

Comportamiento común a ambos modos:

- Se monta en `document.body` (fuera del Shadow DOM) para evitar problemas con `position: fixed` + `contain`.
- Se cierra con el botón ×, tocando fuera de la imagen, o presionando `Escape`.
- Bloquea el scroll del documento mientras está abierto.
- Los estilos del modal se inyectan una sola vez bajo el id `feria-poster-modal-css`.

---

## Arquitectura interna

### Ciclo de vida

```
connectedCallback()
  └─ render()            ← genera Shadow DOM completo con estilos + keyframes del efecto
  └─ _createModal()      ← monta el modal en document.body
  └─ _initListeners()    ← vincula eventos de apertura/cierre

attributeChangedCallback()
  └─ [re-ejecuta los tres pasos anteriores si la escena ya existe]

disconnectedCallback()
  └─ _cleanup()          ← elimina el modal y listeners globales
```

### Registro FX

Cada entrada en el objeto `FX` define un efecto de forma autocontenida:

```js
FX['nombre-efecto'] = {
  particles: ['🍂', '🍁'],  // emojis/chars para partículas de texto (vacío = divs)
  countBase: 12,             // cantidad de partículas a intensidad "medium"
  css: `@keyframes fx-xxx { ... }`,  // keyframes específicos de este efecto
  spawn(el, cfg, container, i) {
    // Configurar posición, tamaño, colores y animación de cada partícula.
    // el        → elemento DOM ya creado con clase "fp-particle"
    // cfg       → { name, intensity (número), speed (número) }
    // container → el div .fp-particles (útil para agregar overlays extra)
    // i         → índice de la partícula actual
  }
};
```

### Agregar un efecto nuevo

1. Abrir `feria-poster.js`.
2. Agregar una entrada al objeto `FX` **antes** de la definición de la clase.
3. Usar en el HTML con `effect="mi-efecto"`.

**Ejemplo — efecto de burbujas de jabón personalizadas:**

```js
FX['soap-bubbles'] = {
  particles: [],
  countBase: 8,
  css: `
    @keyframes fx-soap {
      0%   { opacity: 0; transform: translateY(0) scale(0); }
      15%  { opacity: 0.8; transform: scale(1); }
      90%  { opacity: 0.5; }
      100% { opacity: 0; transform: translateY(-200px) translateX(var(--drift)) scale(1.3); }
    }`,
  spawn(el, cfg) {
    const size = 10 + Math.random() * 30;
    el.style.left         = `${10 + Math.random() * 80}%`;
    el.style.bottom       = '10%';
    el.style.top          = 'auto';
    el.style.width        = `${size}px`;
    el.style.height       = `${size}px`;
    el.style.borderRadius = '50%';
    el.style.border       = '1.5px solid rgba(255,200,255,0.5)';
    el.style.background   = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(200,200,255,0.05))';
    el.style.setProperty('--dur',   `${(3 + Math.random() * 4) / cfg.speed}s`);
    el.style.setProperty('--delay', `${Math.random() * 6}s`);
    el.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
    el.style.animation = `fx-soap var(--dur) var(--delay) ease-out infinite`;
  }
};
```

```html
<feria-poster effect="soap-bubbles" effect-intensity="high" ...></feria-poster>
```

---

## Ejemplos por estación / clima

### Otoño — escena clásica

```html
<feria-poster
  bg-src="./img/bg-autumn.jpg"
  poster-desktop="./feria/poster_desk.png"
  poster-mobile="./feria/poster_mob.jpg"
  figure-src="./feria/piloto50s.png"
  figure-src2="./feria/rubia.png"
  banderines-src="./img/banderines.png"
  effect="autumn-leaves"
  effect-intensity="medium"
  effect-speed="normal">
</feria-poster>
```

### Invierno — noche nevada

```html
<feria-poster
  bg-src="./img/bg-winter-night.jpg"
  poster-desktop="./feria/poster_invierno_desk.png"
  poster-mobile="./feria/poster_invierno_mob.jpg"
  figure-src="./feria/figura-invierno.png"
  effect="snow"
  effect-intensity="high"
  effect-speed="slow">
</feria-poster>
```

### Tormenta intensa

```html
<feria-poster
  bg-src="./img/bg-storm.jpg"
  poster-desktop="./feria/poster_desk.png"
  effect="thunderstorm"
  effect-intensity="high"
  effect-speed="fast">
</feria-poster>
```

### Primavera — mariposas y pétalos

```html
<feria-poster
  bg-src="./img/bg-spring.jpg"
  poster-desktop="./feria/poster_primavera_desk.png"
  figure-src="./feria/figura-primavera.png"
  effect="spring"
  effect-intensity="medium"
  effect-speed="slow">
</feria-poster>
```

### Verano nocturno — luciérnagas

```html
<feria-poster
  bg-src="./img/bg-summer-night.jpg"
  poster-desktop="./feria/poster_verano_desk.png"
  figure-src="./feria/figura-verano.png"
  effect="fireflies"
  effect-intensity="high"
  effect-speed="slow">
</feria-poster>
```

### Festejo / evento especial

```html
<feria-poster
  bg-src="./img/bg-festivo.jpg"
  poster-desktop="./feria/poster_festivo_desk.png"
  figure-src="./feria/piloto50s.png"
  figure-src2="./feria/rubia.png"
  banderines-src="./img/banderines.png"
  effect="confetti"
  effect-intensity="high"
  effect-speed="normal">
</feria-poster>
```

### Panadería volando 🥐

```html
<feria-poster
  bg-src="./img/bg-panaderia.jpg"
  poster-desktop="./feria/poster_panaderia_desk.png"
  figure-src="./feria/figura-panadero.png"
  effect="bakery"
  effect-intensity="medium"
  effect-speed="normal">
</feria-poster>
```

### Viento de izquierda a derecha

```html
<feria-poster
  bg-src="./img/bg-windy.jpg"
  poster-desktop="./feria/poster_desk.png"
  effect="wind-ltr"
  effect-intensity="high"
  effect-speed="fast">
</feria-poster>
```

---

## Referencia rápida de atributos

| Atributo | Valores posibles | Default |
|----------|-----------------|---------|
| `bg-src` | URL | — |
| `poster-desktop` | URL | — |
| `poster-mobile` | URL | ← `poster-desktop` |
| `modal-image` | URL | ← `poster-mobile` |
| `modal-image-desktop` | URL | — (requiere `modal-image-mobile`) |
| `modal-image-mobile` | URL | — (requiere `modal-image-desktop`) |
| `figure-src` | URL | — |
| `figure-mobile-src` | URL | ← `figure-src` |
| `figure-src2` | URL | — |
| `banderines-src` | URL | — |
| `board-src` | URL | — |
| `cta-mobile` | string | `"tocar = zoom"` |
| `cta-desktop` | string | `"click sobre el flyer para zoom"` |
| `figure-bottom` | CSS length | `0px` |
| `figure-left` | CSS length | `-22%` |
| `figure-mobile-bottom` | CSS length | `0px` |
| `figure-mobile-left` | CSS length | `-14%` |
| `figure2-bottom` | CSS length | `0px` |
| `figure2-right` | CSS length | `-18%` |
| `figure2-mobile-bottom` | CSS length | `0px` |
| `figure2-mobile-right` | CSS length | `-10%` |
| `effect` | ver catálogo | `autumn-leaves` |
| `effect-intensity` | `low` \| `medium` \| `high` | `medium` |
| `effect-speed` | `slow` \| `normal` \| `fast` | `normal` |

---

## Catálogo de efectos — referencia rápida

| `effect` | Partículas | Notas |
|----------|-----------|-------|
| `autumn-leaves` | 🍂🍁🍃 | Caída con deriva lateral |
| `snow` | ❄❅❆ | Caída suave, oscilación |
| `blizzard` | ❄❅· | Viento fuerte, inclinado |
| `rain` | divs | Gotas verticales |
| `rain-wind` | divs | Inclinado 25° |
| `thunderstorm` | divs + overlay | Relámpago parpadeante |
| `wind-ltr` | 🍃🍂🍁 | Travesía horizontal → |
| `wind-rtl` | 🍃🍂🍁 | Travesía horizontal ← |
| `whirlwind` | 🍂🍁🍃 | Espiral orbital |
| `butterflies` | 🦋🌸 | Vuelo sinuoso libre |
| `petals` | 🌸🌺🌼🌷 | Caída con rotación |
| `spring` | 🦋🌸🌺🌼🌷 | Mix mariposas + pétalos |
| `fireflies` | divs (dots) | Glow pulsante amarillo |
| `sun-rays` | divs (líneas) | Destellos desde el centro |
| `bubbles` | divs (círculos) | Ascienden desde abajo |
| `confetti` | divs (rectángulos) | Colores múltiples, giro |
| `stars` | ✨⭐🌟💫 | Aparecen y desaparecen |
| `bakery` | 🥐🥖🧁🍰☕ | Cruzan escena de izq a der |
| `none` | — | Sin efecto |
