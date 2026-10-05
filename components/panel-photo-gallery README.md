# `<panel-photo-gallery>`

Web Component de galería de fotos estilo polaroid, con lightbox, carrusel en celular, partículas y efecto de polvo de estrellas con explosiones.

- Un solo archivo JS, sin dependencias.
- Usa **Shadow DOM**: el CSS de tu plataforma no lo afecta (ni él afecta a la plataforma).
- Soporta **JPG, PNG, GIF animado** y **video (mp4 / webm / mov)**.
- Escritorio: grilla tipo corcho con paginación. Celular (≤ 640px): carrusel con swipe.
- Fuente: *Playfair Display* (se carga desde Google Fonts; si no está disponible usa Georgia).

---

## Instalación

```html
<script src="./panel-photo-gallery.js"></script>

<panel-photo-gallery
  base-path="./actividades/fiesta/"
  mascot-src="./img/san-francisco.png"
  mascot-size="140"
  theme="rosa-pastel"
  eyebrow="4 de octubre"
  title="Linda"
  title-em="Fiesta en su honor"
  total="9">
</panel-photo-gallery>
```

Por defecto las fotos se buscan como `base-path` + `1.jpg`, `2.jpg`, `3.jpg`… hasta `total`.

---

## Atributos

### Contenido y fotos

| Atributo | Default | Descripción |
|---|---|---|
| `base-path` | `./actividades/ramos/` | Carpeta donde están las fotos. Debe terminar en `/`. |
| `total` | `9` | Cantidad total de fotos/videos. |
| `page-size` | `9` | Fotos por página en escritorio. **Máximo útil: 9** (la grilla tiene 9 posiciones definidas). |
| `sources` | — | Lista de nombres de archivo en orden. Ver [Sources](#sources-nombres-de-archivo). |
| `captions` | — | Pie de foto de cada imagen (JSON). Ver [Captions](#captions-pies-de-foto). |
| `sources-mobile` | — | Fotos alternativas solo para celular. |
| `orientacion-mobile` | — | Forma del marco en el carrusel celular, por foto. |
| `orientacion-desktop` | — | Forma del marco por foto en la grilla de escritorio. Ver [Orientación](#orientación-de-cada-foto). |

### Textos del encabezado

> Ninguno tiene valor por defecto: si no lo pasás (o lo pasás vacío) **no aparece**.

| Atributo | Descripción |
|---|---|
| `eyebrow` | Texto pequeño sobre el título. |
| `title` | Parte normal del título. |
| `title-em` | Parte en cursiva del título (con efecto shimmer). |
| `title-color` | Color de `title`. |
| `title-em-color` | Color **fijo** de `title-em` (anula el shimmer). |
| `eyebrow-color` | Color del texto `eyebrow`. |

Los colores aceptan cualquier valor CSS: `#fff`, `rgb(255,200,0)`, `white`…

Si no hay `title` ni `title-em`, también desaparece la rayita decorativa de abajo.

### Tamaño

| Atributo | Default | Descripción |
|---|---|---|
| `width` | `80%` | Ancho en escritorio. En celular (≤ 768px) se fuerza a 95%. |
| `max-width` | `1280px` | Tope de ancho. **Subilo si `width` no pasa de 1280px.** |
| `row-height` | `72` | Alto en px de cada fila de la grilla. Controla el alto de las miniaturas: `72` ≈ 290px, `100` ≈ 400px, `120` ≈ 480px. Solo escritorio. |
| `mascot-size` | `84` | Tamaño en px del logo/mascota del encabezado. Nunca supera el 70% del ancho de pantalla. |
| `mascot-src` | `./actividades/photo.png` | Imagen del logo/mascota. |

Ejemplo para miniaturas grandes:

```html
<panel-photo-gallery width="95%" max-width="1600px" row-height="110" mascot-size="160" ...>
```

### Colores y temas

| Atributo | Default | Descripción |
|---|---|---|
| `theme` | `violeta-dorado` | Tema predefinido (ver tabla abajo). |
| `color1` / `color2` | — | Colores hex personalizados. Tienen prioridad sobre `theme`. |
| `light` | — | Junto con `color1`/`color2`, genera un fondo **claro pastel**: `light="true"`. |

**Temas oscuros:** `violeta-dorado` (default), `azul-dorado`, `verde-dorado`, `rojo-dorado`, `azul-plateado`, `blanco-dorado`.

**Temas claros:** `rosa-pastel`, `celeste-pastel`, `lila-pastel`.

En los temas claros el título pasa a color oscuro, las sombras son más suaves y el lightbox también tiene fondo claro. Si el título se pierde con tu fondo, usá `title-color`.

Ejemplo con colores propios en versión clara:

```html
<panel-photo-gallery color1="#e85c96" color2="#b87828" light="true" ...>
```

### Partículas y efectos

| Atributo | Default | Descripción |
|---|---|---|
| `particle-src` | — (estrellitas) | PNG(s) que caen sobre la card. Varios separados por coma. |
| `lightbox-particle-src` | — (estrellas animadas) | PNG(s) que suben cuando se abre una foto. |
| `particle-motion` | `spin` | Movimiento de los PNG flotantes (ver abajo). |
| `sparkle` | `on` | Polvo de estrellas + explosiones. `sparkle="off"` lo desactiva. |

```html
particle-src="./img/gota.png, ./img/hostia.png, ./img/pan.png"
```

**`particle-motion`**

| Valor | Comportamiento | Ideal para |
|---|---|---|
| `spin` | Giro libre de 360° (puede quedar de cabeza). | Pétalos, hojas, estrellas. |
| `sway` | Se balancea suavemente, nunca se invierte. | Imágenes con arriba/abajo definido (Virgen, cruz, paloma). |
| `drift` | Sin rotación, solo flota. | Logos, textos, íconos simétricos. |

**Polvo de estrellas (`sparkle`)**

- Brillitos que aparecen y se desvanecen sobre toda la card.
- Explosión de chispas en un punto al azar cada 2 a 5 segundos.
- Explosión donde hagas click dentro de la card.
- En el lightbox, explosiones al abrir una foto y al pasar a la siguiente.
- Se desactiva solo si el dispositivo tiene activada la opción *reducir movimiento*.
- Se pausa cuando la galería no está visible en pantalla.

---

## Sources (nombres de archivo)

Sin `sources`, se usan `1.jpg`, `2.jpg`, `3.jpg`… Con `sources` podés mezclar formatos y nombres:

```html
sources='["1.jpg","portada.png","baile.gif","clip.mp4","5.jpg"]'
```

- También acepta lista separada por comas: `sources="1.jpg, baile.gif, clip.mp4"`.
- Si faltan nombres, esos lugares usan `N.jpg`.
- En la grilla y el carrusel los videos se reproducen solos, **sin sonido** y en bucle.
- Al abrir un video en el lightbox arranca **con audio** y con controles. Si el navegador bloquea el sonido (pasa en algunos celulares), el video arranca en mudo y se activa con el botón de volumen.
- Los GIF animados funcionan normalmente.

## Captions (pies de foto)

```html
captions='["Procesión","Bendición","Comunidad"]'
```

Si hay menos pies que fotos, el resto queda vacío. Los pies también se usan como texto alternativo (`alt`) y como etiqueta en el lightbox.

## Fotos alternativas para celular

`sources-mobile` reemplaza fotos solo en el carrusel de celular. Una celda vacía (`""`) usa la foto normal de `sources`:

```html
sources-mobile='["1-vertical.jpg","","3-vertical.jpg"]'
```

`orientacion-mobile` define la forma del marco de cada foto en el carrusel:

```html
orientacion-mobile='["portrait","","landscape"]'
```

| Valor | Resultado |
|---|---|
| `portrait` | Marco vertical (≈ 3:4). |
| `landscape` | Marco horizontal (≈ 16:9). |
| `""` | Forma por defecto (≈ 72% de alto). |

---

## Orientación de cada foto

Hay un atributo para escritorio y otro para celular. Los dos usan un array con un valor por foto, en el mismo orden que `sources`:

```html
orientacion-desktop='["portrait","","landscape"]'
orientacion-mobile='["portrait","","landscape"]'
```

| Valor | Escritorio (`orientacion-desktop`) | Celular (`orientacion-mobile`) |
|---|---|---|
| `portrait` | Marco vertical (≈ 3:4). Sobresale un poco por arriba y abajo de su lugar. | Marco vertical (≈ 3:4). |
| `landscape` | Marco horizontal (≈ 16:11), ocupando todo el ancho de su lugar. | Marco horizontal (≈ 16:9). |
| `""` | Forma del lugar de la grilla (recorta la foto para llenarlo). | Forma por defecto (≈ 72% de alto). |

Notas para escritorio:

- La grilla tiene 9 lugares fijos y cada foto cae en el lugar que le toca según su número. El marco cambia de forma **dentro de su lugar**, sin mover a las demás fotos.
- Un marco vertical queda más angosto que su lugar. Como es más alto, se ve más foto y se recorta menos.
- Un marco horizontal queda más bajo que su lugar.
- Los lugares ya son casi cuadrados, así que `landscape` se nota menos que `portrait`.
- En `row-height` más altos el marco vertical sobresale más.

---

## Lightbox

Al hacer click en una foto se abre en grande, con partículas, contador y botones anterior/siguiente.

- Teclado: `←` y `→` para navegar, `Esc` para cerrar.
- También se cierra con la ✕ o haciendo click en el fondo.

---

## Ejemplo completo

```html
<script src="./panel-photo-gallery.js"></script>

<panel-photo-gallery
  base-path="./actividades/san-francisco/"
  sources='["1.jpg","2.jpg","baile.gif","4.jpg","clip.mp4","6.jpg","7.jpg","8.jpg","9.jpg"]'
  captions='["Misa","Comida","Baile","Familias","Bingo","Juegos","Amigos","Música","Cierre"]'
  mascot-src="./img/san-francisco.png"
  mascot-size="150"
  particle-src="./img/paloma.png"
  lightbox-particle-src="./img/paloma.png"
  particle-motion="sway"
  theme="rosa-pastel"
  eyebrow="4 de octubre"
  title="Linda"
  title-em="Fiesta en su honor"
  title-color="#5a1a3a"
  width="95%"
  max-width="1500px"
  row-height="100"
  total="9">
</panel-photo-gallery>
```

---

## Notas y solución de problemas

- **Los atributos se leen una sola vez**, cuando el elemento se agrega a la página. Si los cambiás después con JavaScript (`setAttribute`), la galería no se actualiza. Hay que recrear el elemento.
- **Atributos con JSON** (`sources`, `captions`, etc.): usá comillas simples por fuera y dobles por dentro: `captions='["A","B"]'`.
- **No veo los cambios después de subir el archivo nuevo:** suele ser la caché del navegador. Probá con `Ctrl+F5`, o en celular con una pestaña privada.
- **El ancho no pasa de cierto límite:** subí `max-width` (por defecto 1280px).
- **Las fotos no cargan:** revisá que `base-path` termine en `/` y que los nombres coincidan con los archivos (distingue mayúsculas y minúsculas).
- **Más de 9 fotos:** se reparten en páginas de `page-size` (máximo 9) con botones de paginación en escritorio. En celular se ven todas en el carrusel.
- **El título se pierde sobre el fondo:** usá `title-color` y `title-em-color`, o cambiá a un tema claro/oscuro que contraste mejor.
