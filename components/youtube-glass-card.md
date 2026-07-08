# `<youtube-glass-card>`

Web Component standalone con estética **glassmorphism** para mostrar un video de YouTube acompañado de un título y un texto.

- **Desktop:** columna izquierda con título arriba + video debajo; columna derecha con el texto, que cubre la altura completa de (título + video). El texto scrollea internamente si excede.
- **Mobile:** card vertical 95vw con aspect-ratio 9:16 — título arriba, video con *crop central* (se ve grande), texto debajo con botón **"más…"** que aparece sólo cuando el texto no entra.
- **Aislado** del CSS del sitio gracias a Shadow DOM — ningún estilo global puede deformarlo.

---

## Instalación

Copiá el archivo `youtube-glass-card.js` a tu carpeta de componentes e incluilo donde lo vayas a usar:

```html
<!-- Material Icons (lo usa el badge y el botón "más…") -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- Tipografías opcionales (mejoran la estética serif del título y la cita) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@600;700&family=Dancing+Script&display=swap" rel="stylesheet">

<script src="./components/youtube-glass-card.js"></script>
```

No requiere build, framework ni dependencias.

---

## Uso básico

```html
<youtube-glass-card
  url="https://youtu.be/VeSftoLw-Ks"
  title="Homilía · Solemnidad de Corpus Christi"
  text="Texto de la descripción...">
</youtube-glass-card>
```

---

## Atributos

| Atributo    | Tipo     | Default       | Descripción |
|-------------|----------|---------------|-------------|
| `url`       | string   | —             | URL de YouTube. Acepta cualquier formato (ver abajo). |
| `title`     | string   | `''`          | Título visible en el header de la card. |
| `subtitle`  | string   | `''`          | Subtítulo opcional debajo del título (ej. autor, fecha). En tipografía sans, MAYÚSCULAS y color de acento. |
| `text`      | string   | `''`          | Descripción / cuerpo del texto. Soporta saltos de línea. |
| `accent`    | string   | `"#c8a84b"`   | Color de acento en hex (badges, bordes, glow, scrollbar). |
| `bg-image`  | string   | —             | URL o path a una imagen (PNG con transparencia ideal) que flota de fondo. **No se deforma** — mantiene su aspect ratio, queda centrada y con opacidad reducida (`0.14`). Suma una sutil animación de levitación. |
| `anchor-id` | string   | auto-generado | ID HTML para anclas URL (`#mi-id`). |

### Formatos de URL aceptados

El componente extrae el ID del video automáticamente desde:

- `https://www.youtube.com/watch?v=XXXX`
- `https://youtu.be/XXXX`
- `https://youtu.be/XXXX?si=YYYY`
- `https://www.youtube.com/embed/XXXX`
- `https://www.youtube.com/shorts/XXXX`
- `https://www.youtube.com/live/XXXX`
- O directamente el ID (11 caracteres).

Si no logra extraer un ID válido, muestra un placeholder con un mensaje de error.

---

## Procesamiento del texto

El atributo `text` se transforma automáticamente:

- **Doble salto de línea (`\n\n`)** → párrafo nuevo (`<p>`).
- **Salto de línea simple (`\n`)** → salto dentro del párrafo (`<br>`).
- **Párrafo rodeado por comillas tipográficas** (`"…"` o `"…"`) → se renderiza como cita destacada (`<blockquote class="quote">`) con borde dorado, fondo degradado y tipografía serif itálica.

### Ejemplo completo

```html
<youtube-glass-card
  url="https://youtu.be/VeSftoLw-Ks"
  title="Homilía · Solemnidad de Corpus Christi 2026"
  text="En la solemnidad de Corpus Christi, Mons. Gustavo Carrara nos invita a contemplar el misterio de la Eucaristía como presencia real de Jesús, pan entregado para la vida del mundo.

Desde la adoración y la procesión por las calles de La Plata, esta homilía une la fe eucarística con la caridad concreta: la Eucaristía nos lleva a reconocer a Cristo también en los hermanos que más sufren, en quienes tienen hambre, sed, necesidad de educación, trabajo digno y esperanza.

En el marco del Año Jubilar Franciscano y de la Colecta Anual de Cáritas, resuena una oración para llevar a la semana:

“Jesús Eucaristía, hacé de nosotros instrumentos de tu paz.”

Homilía de Mons. Gustavo Carrara, Arzobispo de La Plata.
Solemnidad de Corpus Christi – 6 de junio de 2026.">
</youtube-glass-card>
```

En este caso la línea `"Jesús Eucaristía, hacé de nosotros instrumentos de tu paz."` se transforma automáticamente en cita destacada.

---

## Imagen flotante de fondo

```html
<youtube-glass-card
  url="https://youtu.be/XXXX"
  title="..."
  text="..."
  bg-image="./img/cc.png">
</youtube-glass-card>
```

- Se renderiza como `<img>` real con `object-fit: contain` → **nunca se deforma**.
- Queda centrada, con `max-width: 75%` y `max-height: 80%` del wrap.
- Opacidad `0.14` (decorativa, no compite con el contenido).
- `z-index: 0` (detrás del header, video y texto).
- `pointer-events: none` — no bloquea clicks.
- Animación de levitación de 7s. Se desactiva con `prefers-reduced-motion`.

Ideal: PNG con fondo transparente (logos, iconos, ilustraciones).

---

## Cambiar el color de acento

```html
<youtube-glass-card
  url="https://youtu.be/XXXX"
  title="..."
  text="..."
  accent="#3aa8ff">
</youtube-glass-card>
```

El color de acento afecta:
- Borde y halo de la card.
- Badge del header (play_circle).
- Borde y glow del marco del video.
- Color y glow del título.
- Borde y fondo de la cita destacada.
- Scrollbar del texto (desktop).
- Botón "más…" (mobile).

---

## Layout responsive

### Desktop (≥768px)

```
+---------------------------+----------------------+
| ▶ Título                  |                      |
+---------------------------+      Texto           |
|                           |  (paralelo a título  |
|        VIDEO 16:9         |   + video, con       |
|        (58% width)        |   scroll si excede)  |
|                           |                      |
+---------------------------+----------------------+
```

- Max-width 1080px, centrada con `margin: 2rem auto`.
- Columna izquierda: título arriba, video 16:9 debajo.
- Columna derecha: el texto cubre la altura completa (header + video) y scrollea internamente si el contenido la supera.

### Mobile (≤767px)

```
+--------------------------+
| ▶ Título                 |
+--------------------------+
|     VIDEO (crop          |
|      central)            |
+--------------------------+
| Texto …            más… ⌵|
+--------------------------+
```

- Ancho 95vw, `aspect-ratio: 9/16`.
- El video se hace `height: 100%` con `aspect-ratio: 16/9` y `transform: scale(1.1)` — los bordes se cortan con `overflow: hidden` y la parte central queda grande.
- El texto tiene un `mask-image` que crea un fade-out hacia abajo.
- Si el contenido no entra, aparece el botón **"más…"** dorado.
- Al expandirse, la card abandona el 9:16, el video vuelve a 16:9 sin crop y el texto se muestra completo. El botón pasa a **"menos"**.

---

## Accesibilidad

- `role="region"` con `aria-label` usando el título.
- Título renderizado con `role="heading" aria-level="2"`.
- Iframe con `title` descriptivo.
- Botón "más…" con `aria-expanded` que refleja el estado.
- Respeta `prefers-reduced-motion`.

---

## Notas técnicas

- **Shadow DOM (`mode: 'open'`)** aísla todo el CSS interno. Ningún estilo global del sitio puede deformar la card.
- Usa `youtube-nocookie.com` con `rel=0&modestbranding=1` para reducir el branding y los videos relacionados.
- El iframe se carga con `loading="lazy"` — no impacta el LCP si la card está fuera de viewport.
- La detección de overflow del texto en mobile usa `ResizeObserver` + listeners de `resize` y `load`, con varios `setTimeout` de respaldo para cubrir el caso de que el iframe o las fonts cambien el layout después del primer paint.

---

## Limpieza

`disconnectedCallback` desconecta el `ResizeObserver` y remueve los listeners de `window`, así que el componente es seguro de remover dinámicamente del DOM.

---

## Licencia

Uso libre dentro del proyecto. Ajustá colores y tipografías al estilo del sitio donde lo embebas.
