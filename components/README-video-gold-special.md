# `<video-gold-special>` — Web Component

Componente de video premium con estética **glassmorfismo** y **bordes dorados animados**. Se adapta automáticamente a desktop y mobile sin necesidad de configurar el modo manualmente.

---

## Instalación

Incluí el script en tu HTML, antes de usar el componente:

```html
<script src="video-gold-special.js"></script>
```

No requiere dependencias externas ni frameworks.

---

## Uso mínimo

```html
<video-gold-special
  titulo="Mi Video"
  video-desktop="https://youtu.be/dQw4w9WgXcQ"
  video-mobile="./mi-video-vertical.mp4">
</video-gold-special>
```

## Uso completo

```html
<video-gold-special
  titulo="La Divina Misericordia: La Promesa de Jesús"
  video-desktop="https://youtu.be/Y5r7IgYTptA"
  video-mobile="./videos/misericordia.mp4"
  ancho-desktop="860px"
  badge="Especial"
  etiqueta="12 de Abril"
  logo="./img/jesus.png"
  logo-duracion="4"
  poster-mobile="./img/portada-vertical.jpg"
  poster-desktop="./img/portada-landscape.jpg">
</video-gold-special>
```

---

## Atributos

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `titulo` | string | `"Sin título"` | Título principal que aparece en la parte inferior de la card |
| `video-desktop` | string | — | Video para desktop. Acepta URL de YouTube **o** ruta a un archivo `.mp4` |
| `video-mobile` | string | — | Video para mobile. Ruta a un archivo `.mp4` vertical (ratio 9:16) |
| `ancho-desktop` | string | `"80vw"` | Ancho de la card en desktop. Acepta cualquier valor CSS: `860px`, `70vw`, `100%`, etc. |
| `badge` | string | `"Special"` | Texto de la píldora inferior (junto al contador de tiempo) |
| `etiqueta` | string | `"Special Edition"` | Texto del badge superior centrado (con estrellas decorativas) |
| `logo` | string (URL) | — | Ruta a un PNG que flota en la esquina superior derecha con efectos de halo y animación |
| `logo-duracion` | number | `4` | Segundos que el logo permanece visible en mobile tras dar play, antes de desvanecerse |
| `poster-mobile` | string (URL) | — | Imagen de portada del video mobile. Si se omite, usa el thumbnail de YouTube automáticamente |
| `poster-desktop` | string (URL) | — | Imagen de portada para desktop con mp4. No aplica cuando se usa YouTube (que tiene su propia miniatura) |

---

## Comportamiento por dispositivo

El componente detecta el dispositivo automáticamente con `window.matchMedia('(max-width: 768px)')` y también reacciona a cambios de orientación (rotate).

### Desktop (> 768px)

| `video-desktop` | Comportamiento |
|---|---|
| URL de YouTube | Embed iframe en formato landscape **16:9**, controles nativos de YouTube |
| Ruta `.mp4` | `<video>` en landscape **16:9**, con botón play/pause propio |
| No configurado + `poster-desktop` | Muestra la imagen estática como fondo |
| No configurado | Mensaje "Sin video configurado" |

- El ancho es controlado por `ancho-desktop` (default `80vw`).
- La card queda centrada automáticamente.
- El badge de etiqueta se posiciona en la parte inferior, sobre la barra de título.

### Mobile (≤ 768px)

| `video-mobile` | Comportamiento |
|---|---|
| Ruta `.mp4` | `<video>` en portrait **9:16**, con botón play/pause propio |
| No configurado | Mensaje "Sin video mobile configurado" |

- El ancho máximo es `95vw`, nunca más de `260px`.
- La card queda centrada automáticamente.
- El badge de etiqueta aparece en la parte superior.

---

## Logo flotante

Cuando se pasa el atributo `logo`, aparece un PNG en la esquina superior derecha con los siguientes efectos:

- **Halo dorado multicapa** — `drop-shadow` en blanco y dorado para simular irradiación
- **Flotación animada** — movimiento suave de hasta 12px vertical con leve rotación (±1°)
- **Animación de entrada** — aparece descendiendo desde arriba al cargar
- **Intensificación al hover** — el halo se amplía al pasar el mouse sobre la card
- **Fade automático en mobile** — a los `logo-duracion` segundos de reproducción, el logo se desvanece suavemente (transición de 1.2s) para no tapar el video. Se restaura al pausar o al terminar el video.

> **Tip:** Para imágenes con fondo transparente (PNG sin fondo) el efecto de halo queda mucho mejor, ya que el `drop-shadow` sigue el contorno real de la figura.

---

## Poster (imagen de portada)

El atributo `poster` es la imagen que muestra el `<video>` antes de que el usuario presione play.

**Prioridad para mobile:**
1. `poster-mobile` si se especifica
2. Thumbnail automático de YouTube (`maxresdefault.jpg`) si hay `video-desktop` configurado con URL de YouTube
3. Sin poster (el video arranca en negro)

**Para desktop con mp4:**
1. `poster-desktop` si se especifica
2. Sin poster

---

## Efectos visuales

| Efecto | Descripción |
|---|---|
| Borde dorado animado | Gradiente que fluye continuamente alrededor de la card (`background-position` animado) |
| Halo exterior | Triple `box-shadow` hacia afuera que se intensifica en hover |
| Glassmorfismo | `backdrop-filter: blur(28px) saturate(1.6)` con fondo semitransparente |
| Reflejo interno | Gradiente sutil en diagonal que simula el reflejo del cristal |
| Esquinas decorativas | SVG con doble trazo (glow + línea) y diamante en la punta |
| Badge superior | Texto con estrellas animadas y blur de fondo |
| Shimmer sweep | Destello dorado que cruza la card cada 5 segundos |
| Partículas | 18 partículas de polvo dorado que flotan hacia arriba en loop |
| Play/Pause | En play: botón centrado con pulso luminoso. En pause: se desplaza a la esquina inferior derecha, se achica y deja de pulsar |

---

## Notas de implementación

- El componente usa **Shadow DOM** (`attachShadow({ mode: 'open' })`), por lo que sus estilos están completamente aislados del resto de la página.
- Para que el glassmorfismo se vea correctamente, el **fondo de la página debe ser oscuro** o tener una imagen/gradiente detrás. Sobre fondo blanco el efecto no es visible.
- Las fuentes **Cinzel** y **Raleway** se importan desde Google Fonts. Si tu sitio no tiene acceso a Internet, podés alojarlas localmente y reemplazar el `@import` en el template.
- El embed de YouTube requiere conexión a Internet y no funciona en entornos con restricciones de iframe (`X-Frame-Options`).

---

## Compatibilidad

| Feature | Soporte |
|---|---|
| Shadow DOM | Chrome 53+, Firefox 63+, Safari 10.1+, Edge 79+ |
| `aspect-ratio` CSS | Chrome 88+, Firefox 89+, Safari 15+ |
| `backdrop-filter` | Chrome 76+, Safari 9+, Firefox 103+ |
| `matchMedia` | Todos los navegadores modernos |
| Custom Elements v1 | Chrome 54+, Firefox 63+, Safari 10.1+ |

> Internet Explorer no está soportado.

---

## Archivos

```
video-gold-special.js   ← el componente (todo en un archivo, sin dependencias)
README-video-gold-special.md
```
