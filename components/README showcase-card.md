version Nueva:


# showcase-card

Web Component que envuelve `<video-card-gold>` en un showcase glassmorfismo con bordes dorados, efectos de partículas animadas y control total por atributos HTML. Soporta desde **1 hasta N videos** (carousel en mobile, fila con wrap en desktop).

---

## Instalación

```html
<!-- Dependencia: video-card-gold primero -->
<script src="video-card-gold.js"></script>
<script src="showcase-card.js"></script>
```

---

## Uso básico (un solo video)

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/mi-video.mp4"
  titulo="Título del video"
  badge="Nombre del autor"
></showcase-card>
```

---

## Múltiples videos

Hay **dos formas** de mostrar más de un video. Podés usar la que prefieras; si están los dos atributos, `videos` tiene prioridad.

### Opción A — `videos` (recomendada, sin límite de cantidad)

Atributo `videos` con un **JSON array**. Cada objeto acepta `video`, `titulo`, `badge` y `poster` (solo `video` es obligatorio).

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  videos='[
    {"video":"./video/v1.mp4","titulo":"Homilía",   "badge":"Padre Juan"},
    {"video":"./video/v2.mp4","titulo":"Reflexión",  "badge":"Padre Pedro"},
    {"video":"./video/v3.mp4","titulo":"Testimonio", "badge":"Padre Luis"}
  ]'
></showcase-card>
```

- Si falta `titulo`, se completa como `"Video 1"`, `"Video 2"`, etc.
- Si falta `badge`, se completa como `"Premium"`.
- `poster` es opcional en cada video.
- Si el JSON está mal formado, el componente avisa por consola (`console.warn`) y cae automáticamente al modo legacy (Opción B) en vez de romperse.
- En **desktop** los videos se muestran en fila y hacen salto de línea (`wrap`) si no entran todos.
- En **mobile** se arma un carousel swipeable con flechas y dots automáticamente, sin importar cuántos videos haya.

### Opción B — `video` / `video2` (legacy, máximo 2 videos)

Sigue funcionando exactamente igual que antes, sin cambios:

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/v1.mp4"   titulo="Homilía del domingo"  badge="Padre Juan"
  video2="./video/v2.mp4"  titulo2="Reflexión especial"  badge2="Padre Pedro"
></showcase-card>
```

- `video2`, `titulo2`, `badge2` y `poster2` son opcionales. Si no se ponen, se muestra un solo video.
- Si no se especifica `titulo2`/`badge2`, se copian de `titulo`/`badge` del primer video.

---

## Atributos de contenido

| Atributo            | Tipo       | Descripción                                                                                                                                   |
| ------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg`              | URL        | Imagen de fondo del showcase                                                                                                                   |
| `cover`           | URL        | Poster/imagen visible en desktop (a la izquierda de los videos)                                                                                |
| `medallion`       | URL        | Foto circular flotante visible solo en mobile                                                                                                  |
| `medallion-modal` | URL        | Imagen alternativa a mostrar en el modal al tocar el medallón (default: la misma que`medallion`)                                            |
| `medallion-full`  | flag       | Si está presente (y no es`"no"`/`"false"`), el modal del medallón muestra la imagen completa rectangular en vez de recortada en círculo |
| `videos`          | JSON array | Lista de N videos — ver[Múltiples videos](#múltiples-videos). Tiene prioridad sobre `video`/`video2`                                     |
| `video`           | URL        | Archivo de video`.mp4` principal (legacy / 1er video)                                                                                        |
| `titulo`          | string     | Título del video principal                                                                                                                    |
| `badge`           | string     | Texto del badge del video principal (default:`"Premium"`)                                                                                    |
| `poster`          | URL        | Poster/thumbnail del video principal                                                                                                           |
| `video2`          | URL        | Archivo de video`.mp4` secundario, opcional (legacy)                                                                                         |
| `titulo2`         | string     | Título del segundo video (default: igual que`titulo`)                                                                                       |
| `badge2`          | string     | Badge del segundo video (default: igual que`badge`)                                                                                          |
| `poster2`         | URL        | Poster/thumbnail del segundo video                                                                                                             |

---

## Control del overlay (oscuridad sobre el fondo)

Por defecto el overlay es **0** (sin oscurecimiento, fondo 100% visible).
Se puede controlar con preset o con valor numérico exacto.

### Por preset

```html
overlay-preset="light"    <!-- 0.15 -->
overlay-preset="medium"   <!-- 0.35 -->
overlay-preset="dark"     <!-- 0.58 -->
```

### Por valor numérico (sobreescribe el preset)

```html
overlay="0"     <!-- sin oscurecimiento (default) -->
overlay="0.2"   <!-- leve -->
overlay="0.45"  <!-- moderado -->
overlay="0.7"   <!-- oscuro -->
```

> Si se usan ambos atributos, `overlay` numérico tiene prioridad sobre `overlay-preset`.

---

## Efectos de partículas

### Activar efectos

El atributo `effects` acepta una lista separada por comas:

```html
effects="dust"
effects="dust,stars"
effects="dust,bubbles,stars,rain,comets,ember"
```

### Efectos disponibles

| Nombre      | Descripción                                                                             |
| ----------- | ---------------------------------------------------------------------------------------- |
| `dust`    | Polvo dorado: partículas pequeñas que suben lentamente desde abajo                     |
| `bubbles` | Burbujas/círculos translúcidos con reflejo interno que flotan                          |
| `stars`   | Estrellas con efecto twinkle, algunas con rayos cruzados                                 |
| `rain`    | Lluvia de oro: trazos diagonales que caen desde arriba                                   |
| `comets`  | Cometas laterales con cola degradada que explotan en chispas al llegar al borde          |
| `ember`   | Brasas/chispas ascendentes con turbulencia, tonos cálidos que se enfrían con el tiempo |

### Intensidad

Controla la cantidad de partículas y su brillo. Rango `0.0` a `1.0`.

```html
intensity="0.3"   <!-- sutil, muy discreto -->
intensity="0.6"   <!-- recomendado (default) -->
intensity="1.0"   <!-- máximo -->
```

---

## Ejemplos

### Presentación limpia, sin efectos extra

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
></showcase-card>
```

### Con polvo dorado y estrellas suaves

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
  effects="dust,stars"
  intensity="0.5"
></showcase-card>
```

### Escena nocturna intensa con todos los efectos

```html
<showcase-card
  bg="./img/night.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
  overlay="0.4"
  effects="dust,bubbles,stars,rain,comets,ember"
  intensity="0.8"
></showcase-card>
```

### Fondo muy visible con cometas como toque único

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
  overlay="0"
  effects="comets"
  intensity="0.7"
></showcase-card>
```

### Varios videos con el atributo `videos`

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  videos='[
    {"video":"./video/v1.mp4","titulo":"Homilía",   "badge":"Padre Juan",  "poster":"./img/p1.jpg"},
    {"video":"./video/v2.mp4","titulo":"Reflexión",  "badge":"Padre Pedro", "poster":"./img/p2.jpg"},
    {"video":"./video/v3.mp4","titulo":"Testimonio", "badge":"Padre Luis",  "poster":"./img/p3.jpg"},
    {"video":"./video/v4.mp4","titulo":"Cierre",     "badge":"Padre Marcos"}
  ]'
  effects="ember,dust"
  intensity="0.6"
></showcase-card>
```

### Medallón con imagen distinta en el modal, a pantalla completa

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar-thumb.jpeg"
  medallion-modal="./img/avatar-full.jpeg"
  medallion-full
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
></showcase-card>
```

---

## Comportamiento responsive

- **Desktop** (`≥ 768px`): se muestra el cover a la izquierda y los videos a la derecha en fila (con salto de línea automático si hay muchos).
- **Mobile** (`< 768px`): el cover se oculta, los videos se muestran en un carousel swipeable a todo el ancho (con flechas y dots si hay más de uno), y aparece el medallón flotante en la esquina superior izquierda con anillo giratorio y efecto glow. Tocar el medallón abre un modal con la imagen ampliada.

---

## Dependencias

- [`video-card-gold.js`](./video-card-gold.js) — debe cargarse **antes** que `showcase-card.js`
- Fuentes: `Cinzel` y `Raleway` desde Google Fonts (las carga `video-card-gold` internamente)
- Sin dependencias externas adicionales

---

## Referencia rápida

```html
<showcase-card
  bg="URL"                          <!-- imagen de fondo -->
  cover="URL"                       <!-- poster desktop -->
  medallion="URL"                   <!-- foto circular mobile -->
  medallion-modal="URL"             <!-- imagen alternativa para el modal del medallón -->
  medallion-full                    <!-- flag: modal del medallón en modo imagen completa -->

  <!-- Un video (o dos, legacy) -->
  video="URL"     titulo="string"   badge="string"   poster="URL"
  video2="URL"    titulo2="string"  badge2="string"  poster2="URL"

  <!-- O bien, N videos (tiene prioridad sobre video/video2) -->
  videos='[{"video":"URL","titulo":"string","badge":"string","poster":"URL"}, ...]'

  overlay="0"                       <!-- 0.0–1.0, default 0 -->
  overlay-preset="light|medium|dark"<!-- alternativa a overlay numérico -->
  effects="dust,bubbles,stars,rain,comets,ember"  <!-- combinables -->
  intensity="0.6"                   <!-- 0.0–1.0, default 0.6 -->
></showcase-card>
```

----------------



# showcase-card

Web Component que envuelve `<video-card-gold>` en un showcase glassmorfismo con bordes dorados, efectos de partículas animadas y control total por atributos HTML.

---

## Instalación

```html
<!-- Dependencia: video-card-gold primero -->
<script src="video-card-gold.js"></script>
<script src="showcase-card.js"></script>
```

---

## Uso básico

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/mi-video.mp4"
  titulo="Título del video"
  badge="Nombre del autor"
></showcase-card>
```

---

## Atributos de contenido

| Atributo      | Tipo   | Descripción                                                |
| ------------- | ------ | ----------------------------------------------------------- |
| `bg`        | URL    | Imagen de fondo del showcase                                |
| `cover`     | URL    | Poster/imagen visible en desktop (a la izquierda del video) |
| `medallion` | URL    | Foto circular flotante visible solo en mobile               |
| `video`     | URL    | Archivo de video`.mp4`                                    |
| `titulo`    | string | Título que aparece en la card de video                     |
| `badge`     | string | Texto del badge (default:`"Premium"`)                     |

---

## Control del overlay (oscuridad sobre el fondo)

Por defecto el overlay es **0** (sin oscurecimiento, fondo 100% visible).
Se puede controlar con preset o con valor numérico exacto.

### Por preset

```html
overlay-preset="light"    <!-- 0.15 -->
overlay-preset="medium"   <!-- 0.35 -->
overlay-preset="dark"     <!-- 0.58 -->
```

### Por valor numérico (sobreescribe el preset)

```html
overlay="0"     <!-- sin oscurecimiento (default) -->
overlay="0.2"   <!-- leve -->
overlay="0.45"  <!-- moderado -->
overlay="0.7"   <!-- oscuro -->
```

> Si se usan ambos atributos, `overlay` numérico tiene prioridad sobre `overlay-preset`.

---

## Efectos de partículas

### Activar efectos

El atributo `effects` acepta una lista separada por comas:

```html
effects="dust"
effects="dust,stars"
effects="dust,bubbles,stars,rain,comets"
```

### Efectos disponibles

| Nombre      | Descripción                                                                    |
| ----------- | ------------------------------------------------------------------------------- |
| `dust`    | Polvo dorado: partículas pequeñas que suben lentamente desde abajo            |
| `bubbles` | Burbujas/círculos translúcidos con reflejo interno que flotan                 |
| `stars`   | Estrellas con efecto twinkle, algunas con rayos cruzados                        |
| `rain`    | Lluvia de oro: trazos diagonales que caen desde arriba                          |
| `comets`  | Cometas laterales con cola degradada que explotan en chispas al llegar al borde |

### Intensidad

Controla la cantidad de partículas y su brillo. Rango `0.0` a `1.0`.

```html
intensity="0.3"   <!-- sutil, muy discreto -->
intensity="0.6"   <!-- recomendado (default) -->
intensity="1.0"   <!-- máximo -->
```

---

## Ejemplos

### Presentación limpia, sin efectos extra

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
></showcase-card>
```

### Con polvo dorado y estrellas suaves

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
  effects="dust,stars"
  intensity="0.5"
></showcase-card>
```

### Escena nocturna intensa con todos los efectos

```html
<showcase-card
  bg="./img/night.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
  overlay="0.4"
  effects="dust,bubbles,stars,rain,comets"
  intensity="0.8"
></showcase-card>
```

### Fondo muy visible con cometas como toque único

```html
<showcase-card
  bg="./img/sky.jpg"
  cover="./img/poster.webp"
  medallion="./img/avatar.jpeg"
  video="./video/video.mp4"
  titulo="Mi presentación"
  badge="Autor"
  overlay="0"
  effects="comets"
  intensity="0.7"
></showcase-card>
```

---

## Comportamiento responsive

- **Desktop** (`≥ 768px`): se muestra el cover a la izquierda y la video-card a la derecha.
- **Mobile** (`< 768px`): el cover se oculta, la video-card ocupa todo el ancho, y aparece el medallón flotante en la esquina superior izquierda con anillo giratorio y efecto glow.

---

## Dependencias

- [`video-card-gold.js`](./video-card-gold.js) — debe cargarse **antes** que `showcase-card.js`
- Fuentes: `Cinzel` y `Raleway` desde Google Fonts (las carga `video-card-gold` internamente)
- Sin dependencias externas adicionales

---

## Referencia rápida

```html
<showcase-card
  bg="URL"                          <!-- imagen de fondo -->
  cover="URL"                       <!-- poster desktop -->
  medallion="URL"                   <!-- foto circular mobile -->
  video="URL"                       <!-- video mp4 -->
  titulo="string"                   <!-- título -->
  badge="string"                    <!-- badge (default: Premium) -->
  overlay="0"                       <!-- 0.0–1.0, default 0 -->
  overlay-preset="light|medium|dark"<!-- alternativa a overlay numérico -->
  effects="dust,bubbles,stars,rain,comets"  <!-- combinables -->
  intensity="0.6"                   <!-- 0.0–1.0, default 0.6 -->
></showcase-card>
```
