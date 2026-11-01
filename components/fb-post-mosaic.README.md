# `<fb-post-mosaic>`

Tarjeta glass con mosaico de fotos de un álbum de Facebook. Vanilla JS + Shadow DOM, sin dependencias.

## Uso suelto (standalone)

```html
<script src="fb-post-mosaic.js"></script>

<fb-post-mosaic
  title="Hermoso encuentro de matrimonios en San Luis Gonzaga"
  author="Marcelo Cerniato"
  date="Sábado 31 de octubre"
  album-url="https://www.facebook.com/PadreMarceloAlejandro/posts/pfbid021SSB1MLnUf1XgbcyuExyc28VNpDRPbvyLoJuncxTKQZADS9UamdwkqBjVoVN73Pjl"
  wallpaper="./img/fb-wallpaper.png"
  photos='["img/m1.jpg","img/m2.jpg","img/m3.jpg","img/m4.jpg","img/m5.jpg"]'>
</fb-post-mosaic>
```

## Dentro de `<fb-posts-container>` (con JSON)

El contenedor ya pasa los campos al componente. Agregá un post así en `facebook-posts.json`:

```json
{
  "type": "photo-mosaic",
  "title": "Hermoso encuentro de matrimonios en San Luis Gonzaga",
  "author": "Marcelo Cerniato",
  "date": "Sábado 31 de octubre",
  "url": "https://www.facebook.com/PadreMarceloAlejandro/posts/pfbid021SSB1MLnUf1XgbcyuExyc28VNpDRPbvyLoJuncxTKQZADS9UamdwkqBjVoVN73Pjl",
  "photos": ["img/m1.jpg", "img/m2.jpg", "img/m3.jpg", "img/m4.jpg", "img/m5.jpg"],
  "position": 0
}
```

Ahí no dibuja panel propio: usa el degradé y el wallpaper del contenedor.

## Atributos

| Atributo | Descripción |
|---|---|
| `title` | Texto del post |
| `author` | Autor / página (default `Página`) |
| `date` | Texto de fecha (conviene fijo, no "el sábado") |
| `album-url` | Link del botón "Ver álbum en Facebook" |
| `photos` | JSON string con array de URLs. También: `el.photos = [...]` |
| `description` | Texto bajo el mosaico (opcional) |
| `wallpaper` | Solo standalone. Default `./img/fb-wallpaper.png`; `none` = solo degradé |
| `width` | Solo standalone, desktop: `900`, `900px`, `70%` |

## Tamaños

- Standalone desktop: 90vw, máx. 1200px (o `width`). Tarjeta de hasta 700px (`--fbm-card-max`).
- Standalone mobile (≤768px): 85vw, siempre.

## Layouts

1 → 1×1 · 2 → 2×1 · 3 → 1 ancha + 2 · 4 → 2×2 · **5 → 2 arriba + 3 abajo** · 6 → 2×3 · 7+ → 3×3 con `+N`.

Click en una foto abre el lightbox (flechas, swipe, Esc).

## Notas

- Las URLs de fotos deben ser tuyas (hosting propio): las de `fbcdn.net` caducan.
- Solo se aceptan URLs `http(s)` y `data:image`; los textos se insertan con `textContent`.
