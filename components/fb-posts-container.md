# `<fb-posts-container>` — Web Component

Web component para mostrar publicaciones de Facebook, Instagram, videos propios y mosaicos de fotos dentro de un contenedor visual estilizado, con partículas flotantes, wallpaper de fondo y layout responsivo automático.

---

## Instalación

Incluir el script en el HTML antes de usar el componente:

```html
<script src="./fb-posts-container.js"></script>
```

El componente carga automáticamente los SDKs de Facebook e Instagram si no están presentes. No requiere ninguna configuración adicional.

---

## Uso básico

```html
<fb-posts-container
  src="mis-posts.json"
></fb-posts-container>
```

---

## Atributos del componente HTML

| Atributo         | Tipo     | Default                    | Descripción |
|------------------|----------|----------------------------|-------------|
| `src`            | string   | `./facebook-posts.json`    | Ruta al archivo JSON con los posts |
| `json`           | string   | —                          | Alias de `src`. Tiene prioridad sobre `src` si ambos están presentes |
| `wallpaper`      | string   | `./img/fb-wallpaper.png`   | Imagen de fondo que se repite en mosaico con opacidad reducida |
| `floatingImage`  | string   | —                          | Ruta a una imagen que flota animada sobre el contenedor (partículas) |
| `floatingImage2` | string   | —                          | Segunda imagen flotante. Se mezcla aleatoriamente con `floatingImage` |
| `width`          | string   | —                          | Ancho del contenedor en desktop. Acepta `px`, `%` o número solo (se trata como `px`). En mobile siempre aplica `95vw` |
| `cache-ttl`      | number   | `3600000` (1 hora)         | Tiempo de vida del cache en milisegundos. Los posts se guardan en `sessionStorage` |

### Ejemplos de uso de atributos

```html
<!-- Mínimo -->
<fb-posts-container src="posts.json"></fb-posts-container>

<!-- Con fondo y partículas -->
<fb-posts-container
  src="posts.json"
  wallpaper="./img/fondo.jpg"
  floatingImage="./img/flor.png"
  floatingImage2="./img/hoja.png"
></fb-posts-container>

<!-- Con ancho fijo en desktop (en mobile sigue siendo 95vw) -->
<fb-posts-container
  src="posts.json"
  width="600px"
></fb-posts-container>

<!-- Con ancho en porcentaje -->
<fb-posts-container
  src="posts.json"
  width="70%"
></fb-posts-container>

<!-- Sin atributo width: comportamiento automático (90vw, máx 1200px) -->
<fb-posts-container src="posts.json"></fb-posts-container>

<!-- Cache extendido a 6 horas -->
<fb-posts-container
  src="posts.json"
  cache-ttl="21600000"
></fb-posts-container>
```

---

## Comportamiento responsivo del contenedor

| Viewport       | Ancho                                    |
|----------------|------------------------------------------|
| Desktop (>768px) | `width` si está definido, si no: `90vw` con máximo de `1200px` |
| Mobile (≤768px)  | Siempre `95vw`, ignorando el atributo `width` |

El componente escucha cambios de viewport en tiempo real (p.ej. rotación del dispositivo) y ajusta el ancho sin necesidad de recargar.

---

## Estructura del JSON de posts

El archivo JSON es un array de objetos. Cada objeto representa un post.

```json
[
  { ... },
  { ... }
]
```

### Campos comunes a todos los tipos

| Campo         | Tipo             | Requerido | Descripción |
|---------------|------------------|-----------|-------------|
| `id`          | string           | No        | Identificador único del post (uso interno) |
| `position`    | number           | Sí        | Orden de aparición. Ver sección [Ordenamiento](#ordenamiento) |
| `type`        | string           | Sí        | Tipo de post: `"facebook"`, `"instagram"`, `"video"`, `"photo-mosaic"` |
| `source`      | string           | No        | Metadato informativo (`"facebook"`, `"instagram"`, etc.) |
| `url`         | string           | Sí        | URL de la publicación o del recurso de video |
| `title`       | string           | No        | Título que se muestra encima del embed |
| `description` | string           | No        | Descripción que se muestra debajo del embed |
| `layout`      | string           | No        | `"full-row"` para que el post ocupe todo el ancho del contenedor |

---

## Ordenamiento de posts (`position`)

El campo `position` controla cómo se ordena y muestra cada post:

| Valor       | Comportamiento |
|-------------|----------------|
| `1`, `2`, `3`... | Posición fija. El post siempre aparece en ese lugar |
| `0`         | Posición aleatoria. Se mezcla con otros posts de posición `0` (shuffle Fisher-Yates) |
| `-1`        | Post desactivado. No se muestra |

Se pueden combinar posts fijos y aleatorios en el mismo JSON. Los aleatorios se insertan en los huecos que dejan los fijos.

---

## Tipos de post

### `"facebook"`

Embed oficial de una publicación de Facebook usando el SDK de Facebook (XFBML).

```json
{
  "id": "post-1",
  "position": 1,
  "type": "facebook",
  "url": "https://www.facebook.com/photo/?fbid=XXXXXXX",
  "title": "Título opcional",
  "description": "Descripción opcional",
  "layout": "full-row",
  "width": 500,
  "enableZoom": false
}
```

#### Campos específicos de `facebook`

| Campo        | Tipo    | Default | Descripción |
|--------------|---------|---------|-------------|
| `width`      | number  | `700` (desktop) / `auto` (mobile) | Ancho del embed de Facebook en píxeles |
| `enableZoom` | boolean | `true`  | Activa el sistema de zoom/offset sobre el iframe de Facebook |
| `zoom`       | number  | `1`     | Factor de escala del iframe (requiere `enableZoom: true`) |
| `offsetX`    | number  | `0`     | Desplazamiento horizontal del iframe en px (requiere `enableZoom: true`) |
| `offsetY`    | number  | `0`     | Desplazamiento vertical del iframe en px (requiere `enableZoom: true`) |

> **Nota sobre el zoom:** El SDK de Facebook a veces renderiza el iframe con márgenes indeseados. Los campos `zoom`, `offsetX` y `offsetY` permiten ajustar visualmente el iframe una vez que carga. El componente reintenta aplicar el zoom a los 2, 4 y 6 segundos, y también al detectar nuevos iframes por MutationObserver.

> **Nota sobre `width` en posts vs. en el contenedor:** El `width` dentro del JSON afecta solo el embed de Facebook (cuántos píxeles le pide al SDK). El `width` del atributo HTML controla el ancho del contenedor general.

---

### `"instagram"`

Embed oficial de una publicación de Instagram.

```json
{
  "id": "post-2",
  "position": 2,
  "type": "instagram",
  "url": "https://www.instagram.com/p/XXXXXXX/",
  "title": "Título opcional",
  "description": "Descripción opcional"
}
```

No tiene campos adicionales específicos. El SDK de Instagram maneja el responsive automáticamente (ancho entre 326px y 540px).

---

### `"video"`

Video HTML5 nativo con lazy loading y autoplay basado en visibilidad (IntersectionObserver).

```json
{
  "id": "post-3",
  "position": 3,
  "type": "video",
  "url": "./videos/mi-video.mp4",
  "title": "Título opcional",
  "description": "Descripción opcional",
  "layout": "full-row",
  "orientation": "landscape",
  "autoplay": true,
  "loop": false,
  "muted": true,
  "controls": true,
  "playsinline": true,
  "poster": "./img/thumbnail.jpg"
}
```

#### Campos específicos de `video`

| Campo         | Tipo    | Default | Descripción |
|---------------|---------|---------|-------------|
| `autoplay`    | boolean | `true`  | El video arranca automáticamente cuando entra en el viewport |
| `loop`        | boolean | `true`  | El video se repite al terminar |
| `muted`       | boolean | `true`  | El video empieza sin sonido (requerido por la mayoría de browsers para autoplay) |
| `controls`    | boolean | `true`  | Muestra los controles nativos del reproductor |
| `playsinline` | boolean | `true`  | Reproduce inline en iOS en vez de pantalla completa |
| `poster`      | string  | —       | URL de la imagen de portada mientras el video no carga |
| `orientation` | string  | —       | `"landscape"` fuerza el layout `full-row` y altura máxima de 480px con `object-fit: cover` |

#### Comportamiento de lazy loading

El video **no se descarga** hasta que el usuario hace scroll y el post llega al viewport. Esto evita descargas innecesarias de archivos pesados. Cuando el post sale del viewport, el video se pausa automáticamente.

---

### `"photo-mosaic"`

Mosaico de fotos usando el web component `<fb-post-mosaic>` (requiere `fb-post-mosaic.js`).

```json
{
  "id": "post-4",
  "position": 4,
  "type": "photo-mosaic",
  "url": "https://www.facebook.com/media/set/?set=XXXXXXX",
  "title": "Nombre del álbum",
  "author": "Nombre del autor",
  "date": "12 de mayo de 2025",
  "description": "Descripción del álbum",
  "layout": "full-row",
  "photos": [
    { "src": "./fotos/foto1.jpg", "alt": "Descripción foto 1" },
    { "src": "./fotos/foto2.jpg", "alt": "Descripción foto 2" },
    { "src": "./fotos/foto3.jpg" }
  ]
}
```

#### Campos específicos de `photo-mosaic`

| Campo       | Tipo   | Descripción |
|-------------|--------|-------------|
| `author`    | string | Nombre del autor o página del álbum |
| `date`      | string | Fecha de publicación (texto libre) |
| `photos`    | array  | Array de objetos `{ src, alt }` con las fotos del mosaico |

---

## Layout de posts dentro del contenedor

El componente ajusta automáticamente el layout según la cantidad de posts activos:

| Cantidad de posts | Comportamiento |
|-------------------|----------------|
| 1 post            | Ocupa el 100% del ancho del contenedor, centrado, máximo 700px |
| 2 posts           | Dos columnas iguales (50% cada una) |
| 3 posts           | Tres columnas iguales (33% cada una) |
| 4 o más           | Grid flexible de columnas de ~340px de ancho mínimo |
| Cualquiera con `layout: "full-row"` | Ese post ocupa siempre el 100% del ancho, independientemente de la cantidad total |

En mobile (≤768px), los layouts de 2 y 3 columnas colapsan automáticamente a una columna.

---

## Partículas flotantes

Cuando se especifican `floatingImage` y/o `floatingImage2`, el componente renderiza una animación canvas con imágenes que caen lentamente de arriba hacia abajo, con movimiento ondulante y rotación suave.

```html
<fb-posts-container
  src="posts.json"
  floatingImage="./img/mariposa.png"
  floatingImage2="./img/flor.png"
></fb-posts-container>
```

Características de la animación:
- 22 partículas simultáneas
- Tamaño aleatorio entre 36px y 80px (lado mayor, respetando el aspect ratio de la imagen)
- Velocidad de caída aleatoria (lenta)
- Movimiento horizontal ondulante (sway)
- Rotación aleatoria y continua
- Opacidad semitransparente (0.45–0.80)
- Se reciclan al salir por abajo del contenedor
- Se adaptan al tamaño del contenedor vía ResizeObserver

> Las imágenes se dibujan respetando su aspect ratio original. `size` representa el lado mayor y el otro lado se escala proporcionalmente, evitando distorsión en imágenes rectangulares.

---

## Wallpaper de fondo

El atributo `wallpaper` define una imagen que se repite en mosaico (`background-repeat: repeat`) cubriendo todo el contenedor con una opacidad del 30%, creando una textura de fondo sutil.

```html
<fb-posts-container
  src="posts.json"
  wallpaper="./img/textura.png"
></fb-posts-container>
```

El tamaño de cada tile es fijo en 200px. Para texturas más grandes o más pequeñas, se puede sobreescribir el estilo vía CSS:

```css
fb-posts-container .wallpaper-layer {
  background-size: 300px; /* ajustar según la imagen */
}
```

---

## Cache

Los posts se cachean en `sessionStorage` para evitar requests repetidos al JSON durante la misma sesión del navegador.

| Campo        | Default      | Descripción |
|--------------|--------------|-------------|
| `cache-ttl`  | `3600000` ms | Tiempo de vida del cache (1 hora por defecto) |

El cache se identifica por la ruta del JSON (`src`), por lo que múltiples instancias con distintos JSON tienen caches independientes.

> **Nota para desarrollo:** Por defecto el componente **limpia el cache en cada render** (línea `sessionStorage.removeItem(this._cacheKey)`). Para activar el cache en producción, eliminar esa línea del código fuente.

---

## Animación de entrada

Cada post aparece con una animación `fbFadeIn` (fade + slide desde abajo), con un delay escalonado de 0.1s por post, creando un efecto en cascada.

---

## Ejemplo completo de JSON con todos los tipos

```json
[
  {
    "id": "video-principal",
    "position": 1,
    "type": "video",
    "url": "./videos/presentacion.mp4",
    "title": "Bienvenidos",
    "description": "Video de presentación de nuestra comunidad.",
    "layout": "full-row",
    "orientation": "landscape",
    "autoplay": true,
    "loop": false,
    "muted": true,
    "controls": true,
    "poster": "./img/poster-video.jpg"
  },
  {
    "id": "fb-post-oracion",
    "position": 2,
    "type": "facebook",
    "url": "https://www.facebook.com/photo/?fbid=10233793553280909",
    "title": "Oración del día",
    "description": "Compartimos esta reflexión con la comunidad.",
    "layout": "full-row",
    "width": 500,
    "enableZoom": false
  },
  {
    "id": "ig-post-evento",
    "position": 3,
    "type": "instagram",
    "url": "https://www.instagram.com/p/XXXXXXX/",
    "title": "Evento especial",
    "description": "Mirá el resumen del evento en Instagram."
  },
  {
    "id": "album-retiro",
    "position": 4,
    "type": "photo-mosaic",
    "url": "https://www.facebook.com/media/set/?set=XXXXXXX",
    "title": "Fotos del retiro",
    "author": "Comunidad San José",
    "date": "Mayo 2025",
    "description": "Momentos del retiro anual.",
    "layout": "full-row",
    "photos": [
      { "src": "./fotos/retiro1.jpg", "alt": "Apertura del retiro" },
      { "src": "./fotos/retiro2.jpg", "alt": "Momento de oración" },
      { "src": "./fotos/retiro3.jpg" }
    ]
  },
  {
    "id": "post-aleatorio",
    "position": 0,
    "type": "facebook",
    "url": "https://www.facebook.com/permalink.php?story_fbid=XXXXXXX",
    "description": "Este post aparece en posición aleatoria."
  },
  {
    "id": "post-desactivado",
    "position": -1,
    "type": "facebook",
    "url": "https://www.facebook.com/permalink.php?story_fbid=YYYYYYY",
    "title": "Post oculto temporalmente"
  }
]
```

---

## Ejemplo completo en HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publicaciones</title>
</head>
<body>

  <fb-posts-container
    src="./data/posts.json"
    wallpaper="./img/textura.png"
    floatingImage="./img/flor.png"
    floatingImage2="./img/hoja.png"
    width="800px"
    cache-ttl="1800000"
  ></fb-posts-container>

  <script src="./fb-posts-container.js"></script>

</body>
</html>
```

---

## Dependencias externas

El componente carga automáticamente los siguientes scripts si no están presentes en la página:

| Script           | URL                                                                 | Cuándo se carga |
|------------------|---------------------------------------------------------------------|-----------------|
| Facebook SDK     | `https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0` | Siempre         |
| Instagram embed  | `https://www.instagram.com/embed.js`                               | Siempre         |
| fb-post-mosaic   | Debe incluirse manualmente                                          | Solo si hay posts de tipo `photo-mosaic` |

---

## Notas técnicas

- El componente es un **Custom Element** (`customElements.define`) nativo, sin dependencias de frameworks.
- Los estilos se inyectan una sola vez en el `<head>` como un `<style>` con id `fb-posts-container-styles`. Se pueden sobreescribir con CSS más específico.
- Se pueden tener **múltiples instancias** en la misma página con distintos JSON, cada una con su propio cache independiente.
- El componente se re-renderiza automáticamente si se cambia cualquier atributo observado en tiempo real (útil para frameworks que actualizan el DOM).
- Al desconectarse del DOM (`disconnectedCallback`), limpia todos los observers (MutationObserver, IntersectionObserver, ResizeObserver) y cancela la animación canvas para evitar memory leaks.
