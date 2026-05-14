# `<video-gold-special-flot>` — Web Component

Variante de `video-gold-special` con soporte para **paneles laterales de partículas flotantes animadas**, **temas de color** y **fondo personalizable**.

Glassmorfismo + bordes dorados animados. Se adapta automáticamente a desktop y mobile.

---

## Instalación

```html
<script src="./components/video-gold-special-flot.js"></script>
```

> Puede convivir en la misma página con `video-gold-special.js` sin conflictos — usan nombres internos distintos y registran tags diferentes.

---

## Uso mínimo

```html
<video-gold-special-flot
  titulo="Mi Video"
  video-desktop="https://youtu.be/dQw4w9WgXcQ"
  video-mobile="./mi-video-vertical.mp4">
</video-gold-special-flot>
```

## Uso completo — sin flotantes

```html
<video-gold-special-flot
  titulo="La Divina Misericordia"
  video-desktop="https://youtu.be/Y5r7IgYTptA"
  video-mobile="./videos/misericordia.mp4"
  ancho-desktop="860px"
  badge="Especial"
  etiqueta="12 de Abril"
  logo="./img/jesus.png"
  logo-duracion="4"
  poster-mobile="./img/portada-vertical.jpg"
  poster-desktop="./img/portada-landscape.jpg">
</video-gold-special-flot>
```

## Uso completo — con flotantes y tema de color

```html
<video-gold-special-flot
  titulo="Padre Marcelo"
  video-desktop="./asantos/aporte.mp4"
  video-mobile="./asantos/aporte.mp4"
  ancho-desktop="860px"
  badge="El aporte de la iglesia a la educación"
  etiqueta="12 de Mayo"
  logo="./img/aloy-marmol-piel.png"
  logo-duracion="10"
  poster-mobile="./asantos/padre.jpg"
  poster-desktop="./asantos/padre.jpg"
  flotante1="./img/libro.png"
  flotante2="./img/crucifijo.png"
  tema="celeste"
  fondo="rgba(4, 18, 40, 0.88)">
</video-gold-special-flot>
```

---

## Atributos

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `titulo` | string | `"Sin título"` | Título principal en la parte inferior de la card |
| `video-desktop` | string | — | Video para desktop. Acepta URL de YouTube **o** ruta a `.mp4` |
| `video-mobile` | string | — | Video para mobile. Ruta a un `.mp4` vertical (9:16) |
| `ancho-desktop` | string | `"80vw"` | Ancho de la card en desktop. Ej: `860px`, `70vw`, `100%` |
| `badge` | string | `"Special"` | Texto de la píldora inferior (junto al contador de tiempo) |
| `etiqueta` | string | `"Special Edition"` | Texto del badge superior centrado (con estrellas decorativas) |
| `logo` | string (URL) | — | PNG flotante en la esquina superior derecha con halo y animación |
| `logo-duracion` | number | `4` | Segundos que el logo permanece visible en mobile tras dar play |
| `poster-mobile` | string (URL) | — | Imagen de portada del video mobile |
| `poster-desktop` | string (URL) | — | Imagen de portada para desktop con mp4 |
| `flotante1` | string (URL) | — | PNG para el panel **izquierdo** de partículas flotantes |
| `flotante2` | string (URL) | — | PNG para el panel **derecho** de partículas flotantes |
| `tema` | string | `"dorado"` | Tema de color. Ver tabla de temas abajo |
| `fondo` | string (color CSS) | — | Color del interior de la card. Sobreescribe el fondo del tema |

---

## Temas de color

El atributo `tema` controla el color del borde animado, glow exterior, textos, badge, botón play, esquinas y burbujas canvas.

| `tema` | Descripción |
|---|---|
| `dorado` | Marrón dorado (default, si no se especifica) |
| `celeste` | Azul celeste |
| `rojo` | Rojo |
| `verde` | Verde esmeralda |
| `violeta` | Violeta |

```html
<video-gold-special-flot tema="celeste" ...>
<video-gold-special-flot tema="rojo" ...>
<video-gold-special-flot tema="verde" ...>
<video-gold-special-flot tema="violeta" ...>
<!-- sin atributo = dorado -->
```

---

## Fondo personalizado

El atributo `fondo` acepta cualquier valor CSS de color y sobreescribe el fondo interior de la card y los paneles laterales:

```html
fondo="rgba(4, 18, 40, 0.88)"    <!-- azul oscuro transparente -->
fondo="rgba(30, 8, 8, 0.9)"      <!-- rojo oscuro -->
fondo="#0d0d1a"                   <!-- negro azulado sólido -->
fondo="rgba(10, 25, 10, 0.85)"   <!-- verde oscuro -->
```

### Combinaciones sugeridas

| `tema` | `fondo` recomendado |
|---|---|
| `dorado` | `rgba(10, 6, 22, 0.85)` |
| `celeste` | `rgba(4, 18, 40, 0.88)` |
| `rojo` | `rgba(30, 8, 8, 0.9)` |
| `verde` | `rgba(6, 22, 10, 0.88)` |
| `violeta` | `rgba(14, 6, 28, 0.9)` |

Si no se pasa `fondo`, el componente usa el fondo oscuro propio del tema seleccionado.

---

## Paneles flotantes (`flotante1` / `flotante2`)

Cuando se pasa uno o ambos atributos, se activa el **modo video vertical con paneles laterales animados**:

- Cada panel tiene su propio `<canvas>` con loop `requestAnimationFrame`
- Las burbujas **siempre suben** con deriva sinusoidal (oscilan mientras ascienden) y rotan sobre su eje
- **~60% de las burbujas** muestran el PNG recortado en círculo con halo del color del tema
- **~40% son orbs** con gradiente radial del color del tema (fallback si la imagen no cargó)
- Las burbujas se regeneran al salir por arriba y tienen fade in/out según posición
- El gradiente de fundido entre los paneles y el video usa el color del `fondo` activo
- El loop se cancela limpiamente al remover el componente del DOM

### Dimensiones en modo flotantes

**Desktop:** el video portrait ocupa ~38% del ancho de `ancho-desktop`; los paneles flanquean el resto.

**Mobile:** el video portrait mantiene exactamente el mismo ancho y alto que el componente original sin flotantes (`min(260px, 95vw)` de ancho × `16/9` de alto). La card se expande a `95vw` y los paneles llenan los costados.

> El alto del video se fuerza explícitamente en JS (`vidW × 16/9`) porque `aspect-ratio: 9/16` no genera el alto automáticamente en un flex item con ancho fijo.

---

## Comportamiento por dispositivo

### Desktop (> 768px) — sin flotantes

| `video-desktop` | Comportamiento |
|---|---|
| URL de YouTube | Embed iframe landscape **16:9**, controles nativos |
| Ruta `.mp4` | `<video>` landscape **16:9**, con botón play/pause propio |
| No configurado + `poster-desktop` | Imagen estática |
| No configurado | Mensaje "Sin video configurado" |

- Ancho controlado por `ancho-desktop`.
- Badge de etiqueta en la parte inferior, sobre la barra de título.

### Desktop (> 768px) — con flotantes

- La card respeta `ancho-desktop`.
- El video se muestra en **portrait 9:16** centrado.
- Badge de etiqueta en la **parte superior**.

### Mobile (≤ 768px) — sin flotantes

- Ancho: `min(260px, 95vw)`.
- Video en portrait **9:16**.
- Badge de etiqueta en la **parte superior**.

### Mobile (≤ 768px) — con flotantes

- La card se expande a `95vw`.
- El video portrait mantiene el mismo alto que sin flotantes.
- Los paneles con burbujas flanquean el video.

---

## Logo flotante

- **Halo del color del tema** — `drop-shadow` multicapa
- **Flotación animada** — hasta 12px vertical con leve rotación (±1°)
- **Animación de entrada** — desciende desde arriba al cargar
- **Intensificación al hover**
- **Fade automático en mobile** — se desvanece a los `logo-duracion` segundos de reproducción; se restaura al pausar o terminar

---

## Coexistencia con el componente original

```html
<!-- Los dos pueden estar en la misma página -->
<script src="./components/video-gold-special.js"></script>
<script src="./components/video-gold-special-flot.js"></script>

<video-gold-special ...></video-gold-special>
<video-gold-special-flot ...></video-gold-special-flot>
```

No hay conflicto de variables globales ni de nombres de clase.

---

## Notas de implementación

- Usa **Shadow DOM** (`attachShadow({ mode: 'open' })`), estilos completamente aislados.
- El fondo de la página debe ser **oscuro** para que el glassmorfismo se vea bien.
- Fuentes **Cinzel** y **Raleway** importadas desde Google Fonts.
- El embed de YouTube requiere conexión y no funciona con restricciones de iframe.
- Los canvas de burbujas esperan a tener dimensiones reales (vía `getBoundingClientRect`) antes de arrancar el loop.
- Los colores del tema se inyectan como CSS custom properties directamente en el `outer-wrap` via JS — no requieren que el navegador soporte `:host([atributo])`.

---

## Compatibilidad

| Feature | Soporte |
|---|---|
| Shadow DOM | Chrome 53+, Firefox 63+, Safari 10.1+, Edge 79+ |
| `aspect-ratio` CSS | Chrome 88+, Firefox 89+, Safari 15+ |
| `backdrop-filter` | Chrome 76+, Safari 9+, Firefox 103+ |
| Canvas 2D API | Todos los navegadores modernos |
| Custom Elements v1 | Chrome 54+, Firefox 63+, Safari 10.1+ |

> Internet Explorer no está soportado.

---

## Archivos

```
video-gold-special-flot.js          ← este componente (sin dependencias)
video-gold-special.js               ← versión original (landscape/portrait estándar)
README-video-gold-special-flot.md
```
