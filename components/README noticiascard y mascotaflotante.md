# Web Components: `noticia-card` + `mascota-flotante`

Dos Web Components nativos (Custom Elements + Shadow DOM), sin dependencias ni frameworks.
Cada uno vive encapsulado en su propio Shadow DOM: podés pegarlos entre otras publicaciones
de tu `index` sin que su CSS choque con nada del resto de la página.

Archivos:
- `noticia-card.html` — card de noticia + demo.
- `mascota-flotante.html` — mascota animada que camina sobre una card + demo.

Cada archivo trae, además de la demo visual, el `<script>` completo del componente:
copiá ese bloque `<script>...</script>` a tu sitio (o guardalo como `.js` aparte) y
listo, ya podés usar el tag en cualquier página.

---

## 1. `<noticia-card>`

Card de noticia con imagen, sello de fecha, autor, texto con "Ver más" automático,
y botón hacia la fuente.

### Uso básico

```html
<noticia-card
  id="noticia-principal"
  fecha="23 de Julio"
  categoria="Iglesia y Santos"
  titular="Avanza en Roma la causa del Padre Mario, recordado en Argentina por su entrega a pobres y enfermos"
  autor-nombre="Julieta Villar"
  autor-desc="Periodista, licenciada en comunicación por la Universidad Nacional de La Matanza en Argentina"
  autor-img="https://.../autor.png"
  imagen="https://.../foto.png"
  imagen-alt="Padre Mario Pantaleo"
  texto="El Dicasterio para las Causas de los Santos del Vaticano confirmó..."
  fuente-nombre="ACI Prensa"
  fuente-url="https://www.aciprensa.com/noticias/..."
  fuente-logo="https://.../logo-white-small.png"
  ancho="80vw"
></noticia-card>
```

### Atributos

| Atributo         | Obligatorio | Default        | Qué hace |
|------------------|:-----------:|----------------|----------|
| `id`             | no          | —              | Necesario si vas a usar `<mascota-flotante target="...">` apuntando a esta card. |
| `fecha`          | sí          | —              | Texto libre; se parte en la primera palabra (día) y el resto (mes) para el sello circular. Ej: `"23 de Julio"` → `23` / `de Julio`. |
| `categoria`      | no          | `"Noticias"`   | Eyebrow/etiqueta arriba del titular. |
| `titular`        | sí          | —              | Titular grande, con capitular iluminada (primera letra en dorado). |
| `autor-nombre`   | sí          | —              | Nombre del autor. |
| `autor-desc`     | no          | —              | Bajada del autor. Se oculta automáticamente en mobile (no entra). |
| `autor-img`      | no          | —              | Foto redonda del autor. Si no se pasa, no se muestra. |
| `imagen`         | sí          | —              | Foto principal de la noticia. |
| `imagen-alt`     | no          | usa `titular`  | Alt de la imagen. |
| `texto`          | sí          | —              | Cuerpo de la noticia. Se recorta con "Ver más" solo si no entra en el espacio disponible (ver abajo). |
| `fuente-nombre`  | no          | `"Leer más"`   | Nombre de la fuente (se usa como alt si no hay `fuente-logo`). |
| `fuente-url`     | no          | `#`            | Link del botón CTA. |
| `fuente-logo`    | no          | —              | Logo de la fuente dentro del botón CTA. Si no se pasa, muestra `fuente-nombre` en texto. |
| `ancho`          | no          | `80vw`         | Ancho de la card **en desktop** (>560px). Acepta cualquier valor CSS: `"60vw"`, `"900px"`, etc. |
| `imagen-ajuste`  | no          | auto           | Fuerza el recorte de la imagen: `"cover"` o `"contain"`. Si no se pasa, se detecta solo (ver abajo). |

En **mobile** (≤560px) el ancho siempre es `95vw` fijo (no se puede pisar con `ancho`).

### Comportamientos automáticos (no configurables, pero buenos para saber que existen)

- **"Ver más" real, no forzado**: mide el alto real disponible del bloque de texto y compara
  contra el alto que ocuparía el texto completo. Solo si el texto realmente no entra, aparece
  el botón "Ver más" y el degradé. Si entra completo, no aparece nada. Se recalcula solo ante
  cualquier cambio de tamaño (resize, cambio de `ancho`, cambio de breakpoint).
- **Formato 9:16 en mobile**: por debajo de 560px la card fuerza `aspect-ratio: 9/16` mientras
  está colapsada. Al tocar "Ver más" pasa a alto automático (deja de forzar el 9:16, porque ya
  no tiene sentido recortar la altura si el usuario pidió ver todo el texto).
- **Fotos verticales/alargadas**: se detecta sola la orientación real de la imagen
  (`naturalWidth`/`naturalHeight`). En mobile, si es vertical, se muestra completa
  (`object-fit: contain`) sobre un fondo desenfocado de sí misma, en vez de recortarla con
  `cover` (que cortaría cabezas o texto quemado en la imagen). En **desktop siempre es
  `cover`**, sin importar la orientación — ahí el recuadro es angosto y alto, así que el
  recorte no lastima el encuadre. Se puede forzar el comportamiento con `imagen-ajuste`.
- **Tipografías**: carga Playfair Display + Inter desde Google Fonts una sola vez por
  documento (aunque haya varias `<noticia-card>` en la página).

### Varias cards en la misma página

Repetís el tag con distintos atributos; el `<script>` se carga una sola vez y sirve para todas.
Si vas a usar `<mascota-flotante>`, dale un `id` único a cada card.

---

## 2. `<mascota-flotante>`

Personaje que camina en loop de derecha a izquierda **sobre el ancho de una card puntual**
(no sobre toda la página). Es clickeable: al tocarlo, navega a la URL de `href`.

### Uso básico

```html
<noticia-card id="noticia-principal" ...></noticia-card>

<mascota-flotante
  target="noticia-principal"
  src="./news/gio.png"
  href="./noticias.html"
  alt="Ver más noticias"
  offset-bottom="-120"
></mascota-flotante>
```

### Atributos

| Atributo         | Obligatorio | Default                        | Qué hace |
|------------------|:-----------:|---------------------------------|----------|
| `target`         | recomendado | primera `<noticia-card>` del documento | `id` de la card sobre la que tiene que caminar. Si hay una sola card en la página podés omitirlo, pero si hay varias, ponelo siempre — si no, puede engancharse a la que no es. |
| `src`            | no          | `./news/gio.png`               | Imagen del personaje. |
| `href`           | no          | `#`                             | URL a la que navega al hacer click (es un `<a>` real). |
| `alt`            | no          | `"Más noticias"`               | Alt de la imagen / aria-label del link. |
| `duracion`       | no          | `16s`                           | Duración de un ciclo completo (de un extremo al otro). Menor = más rápido. |
| `ancho`          | no          | `clamp(90px, 16vw, 150px)`     | Ancho del personaje (CSS válido). |
| `offset-top`     | no          | `0`                             | Corrimiento en px desde el borde **superior** de la card. Negativo = queda un poco más arriba, asomando por encima del borde. |
| `offset-bottom`  | no          | —                               | Corrimiento en px desde el borde **inferior** de la card (ancla alternativa a `offset-top`, para que camine cerca del botón en vez de arriba de la imagen). Si se pasa, tiene prioridad sobre `offset-top`. |

### Cómo funciona (para saber qué esperar)

- **No es `position: fixed` a toda la pantalla.** Mide con JS el ancho y la posición reales
  de la card (`target`) y solo camina en ese carril — arriba de esa card puntual, en ningún
  otro lado del `index`.
- Usa coordenadas de documento (`position: absolute`), así que se mueve con el scroll de forma
  nativa: no hace falta lógica extra para eso.
- Se re-mide solo cuando cambia el layout: resize de ventana, o si la card cambia de alto (por
  ejemplo al abrir "Ver más") — tiene un `ResizeObserver` puesto sobre la card para eso.
- Respeta `prefers-reduced-motion`: si el sistema del usuario pide menos animaciones, el
  personaje queda quieto fuera de pantalla en vez de forzar el movimiento.

### Ajustar la posición vertical

- `offset-top="-14"` → camina apenas por encima del borde superior de la card (sobre la foto).
- `offset-bottom="-120"` → camina sobre la zona del botón "Leer más en...", cerca del borde
  inferior. Es el ancla recomendada si el texto de la card puede variar de largo (con
  `offset-top` la posición sería siempre relativa al techo de la card, así que si el texto es
  más corto o más largo, el botón se mueve pero la mascota no lo seguiría).
- Para afinar el número: con `offset-bottom`, más negativo = sube; menos negativo = baja
  (se acerca al borde de abajo).

### Varias mascotas / varias noticias

Una `<mascota-flotante target="...">` por cada `<noticia-card id="...">` que quieras que tenga
su propio personaje caminando.

---

## Troubleshooting

- **No veo cambios después de actualizar el archivo**: hacé hard-refresh
  (Ctrl/Cmd + Shift + R). Si copiaste el `<script>` a tu sitio, asegurate de haber pegado la
  versión más nueva — los componentes no se auto-actualizan solos.
- **La mascota no aparece**: revisá que el `id` en `target` exista en el HTML y esté escrito
  igual (sensible a mayúsculas), y que `<mascota-flotante>` esté en el DOM *después* de que la
  card ya exista (si la inyectás dinámicamente antes que la card, reintenta unos frames pero
  tiene un límite).
- **La imagen del personaje no carga**: confirmá que el archivo esté efectivamente en la ruta
  de `src` (por ejemplo `./news/gio.png` relativo a la página, no al componente).
