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

| Atributo | Tipo | Descripción |
|---|---|---|
| `bg` | URL | Imagen de fondo del showcase |
| `cover` | URL | Poster/imagen visible en desktop (a la izquierda del video) |
| `medallion` | URL | Foto circular flotante visible solo en mobile |
| `video` | URL | Archivo de video `.mp4` |
| `titulo` | string | Título que aparece en la card de video |
| `badge` | string | Texto del badge (default: `"Premium"`) |

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

| Nombre | Descripción |
|---|---|
| `dust` | Polvo dorado: partículas pequeñas que suben lentamente desde abajo |
| `bubbles` | Burbujas/círculos translúcidos con reflejo interno que flotan |
| `stars` | Estrellas con efecto twinkle, algunas con rayos cruzados |
| `rain` | Lluvia de oro: trazos diagonales que caen desde arriba |
| `comets` | Cometas laterales con cola degradada que explotan en chispas al llegar al borde |

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
