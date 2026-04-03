# 📷 `<misa-ramos-gallery>`

Web Component con **Shadow DOM** para galerías fotográficas de eventos parroquiales. Totalmente aislado del CSS de la plataforma donde se inserte — no interfiere ni es interferido por estilos externos.

---

## Instalación

Copiar `misa-ramos-gallery.js` en el proyecto y agregar el `<script>` en la página:

```html
<script src="./misa-ramos-gallery.js"></script>
```

---

## Uso mínimo

```html
<misa-ramos-gallery></misa-ramos-gallery>
```

Usa todos los valores por defecto: fotos en `./actividades/ramos/`, tema violeta/dorado, ancho 80%.

---

## Uso completo

```html
<misa-ramos-gallery
  base-path="./actividades/ramos/"
  mascot-src="./actividades/photo.png"
  particle-src="./img/cam.png"
  theme="rojo-dorado"
  width="80%"
  total="9">
</misa-ramos-gallery>
```

---

## Parámetros

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `base-path` | string | `./actividades/ramos/` | Ruta a la carpeta de fotos. Las imágenes deben llamarse `1.jpg`, `2.jpg` … `N.jpg` |
| `mascot-src` | string | `./actividades/photo.png` | Imagen de la mascota que aparece sobre el título con animación de bounce |
| `particle-src` | string | _(vacío)_ | PNG que flota de fondo como hojas al viento. Si se omite, usa estrellitas doradas como fallback |
| `width` | string | `80%` | Ancho del componente **solo en desktop**. En mobile siempre es `95%` fijo |
| `total` | número | `9` | Cantidad total de fotos |
| `page-size` | número | `9` | Fotos por página en desktop (se pagina automáticamente) |
| `eyebrow` | string | `✦ Parroquia · Semana Santa ✦` | Texto pequeño sobre el título |
| `title` | string | `Misa de` | Título principal |
| `title-em` | string | `Ramos` | Parte del título con efecto shimmer |
| `theme` | string | `violeta-dorado` | Tema de color predefinido (ver tabla abajo) |
| `color1` | hex | _(del tema)_ | Color primario custom. Tiene prioridad sobre `theme` |
| `color2` | hex | _(del tema)_ | Color secundario custom. Tiene prioridad sobre `theme` |

> **Prioridad de color:** `color1` / `color2` > `theme` > default `violeta-dorado`

---

## Temas predefinidos

Pasarlos con el atributo `theme="nombre"`:

| Nombre | Colores | Ocasión sugerida |
|---|---|---|
| `violeta-dorado` | 🟣 violeta + 🟡 dorado | **Default** — Semana Santa, Ramos |
| `azul-dorado` | 🔵 azul marino + 🟡 dorado | Jueves Santo, Eucaristía, Lavado de Pies |
| `verde-dorado` | 🟢 esmeralda + 🟡 dorado | Navidad, naturaleza, corpus |
| `rojo-dorado` | 🔴 rojo + 🟡 dorado | Pascua, Pentecostés, confirmación |
| `azul-plateado` | 🔵 celeste + ⚪ plateado | Adviento, fiestas de la Virgen |
| `blanco-dorado` | ⚪ crema + 🟡 dorado | Primera Comunión, bodas, bautismos |

```html
<!-- Ejemplos -->
<misa-ramos-gallery theme="verde-dorado"></misa-ramos-gallery>
<misa-ramos-gallery theme="azul-plateado"></misa-ramos-gallery>
<misa-ramos-gallery theme="blanco-dorado"></misa-ramos-gallery>
```

---

## Colores custom

Se puede pasar uno o ambos colores en formato hexadecimal:

```html
<!-- Solo color primario (secundario hereda dorado del tema) -->
<misa-ramos-gallery color1="#0d6e4f"></misa-ramos-gallery>

<!-- Ambos colores custom -->
<misa-ramos-gallery color1="#0d4f8c" color2="#a8d8ea"></misa-ramos-gallery>

<!-- Custom + tema como base (color1/color2 ganan) -->
<misa-ramos-gallery theme="azul-plateado" color1="#1e3a5f"></misa-ramos-gallery>
```

> El componente genera automáticamente el fondo oscuro derivando `color1` al 15% de luminosidad, para que el glasmorfismo siempre quede bien sin importar el color elegido.

---

## Estructura de carpeta de fotos

Las fotos deben ser archivos **JPEG** nombrados con números consecutivos desde `1`:

```
actividades/
└── ramos/
    ├── 1.jpg
    ├── 2.jpg
    ├── 3.jpg
    ├── ...
    └── 9.jpg
```

Si la carpeta tiene otro nombre o ruta, pasarla con `base-path`:

```html
<misa-ramos-gallery base-path="./fotos/navidad-2025/"></misa-ramos-gallery>
```

---

## Comportamiento responsive

| Pantalla | Comportamiento |
|---|---|
| **Desktop** (> 640px) | Grid de exposición asimétrico — fotos inclinadas con efecto polaroid y tachuelas |
| **Mobile** (≤ 640px) | Carrusel horizontal con swipe táctil, dots indicadores y botones ‹ › |

- El ancho en mobile es siempre `95%`, independientemente del atributo `width`
- Hacer click en cualquier foto (en ambos modos) abre el **lightbox** con navegación

---

## Lightbox

Se activa haciendo click en cualquier foto. Controles disponibles:

| Acción | Desktop | Mobile |
|---|---|---|
| Siguiente foto | Click `›` o tecla `→` | Click `›` |
| Foto anterior | Click `‹` o tecla `←` | Click `‹` |
| Cerrar | Click `✕`, tecla `Esc`, o click en el fondo | Click `✕` o click en el fondo |

---

## Partículas de fondo

El PNG pasado en `particle-src` flota dentro de la card con efecto de **hojas al viento**:
- Caen desde arriba con vaivén sinusoidal
- Cada partícula tiene rotación, velocidad y opacidad propias
- Se reciclan automáticamente al llegar al borde inferior
- Usan `devicePixelRatio` para máxima nitidez en pantallas Retina/HiDPI
- Si no se pasa `particle-src`, el fallback son estrellitas del color del tema

```html
<misa-ramos-gallery particle-src="./img/ramo.png"></misa-ramos-gallery>
```

> Usar PNGs con fondo transparente para mejor resultado.

```html
<!-- PNG diferente para el lightbox -->
<misa-ramos-gallery
  particle-src="./img/cam.png"
  lightbox-particle-src="./img/estrella.png">
</misa-ramos-gallery>
```

---

## Ejemplos por evento

```html
<!-- Jueves Santo — Lavado de Pies -->
<misa-ramos-gallery
  base-path="./actividades/jueves-santo/"
  mascot-src="./actividades/photo.png"
  particle-src="./img/gota.png, ./img/hostia.png, ./img/pan.png"
  lightbox-particle-src="./img/paloma.png"
  theme="azul-dorado"
  eyebrow="Conmemorando la última cena de Jesús"
  title="Celebrando"
  title-em="Jueves Santo"
  total="20"
  width="80%">
</misa-ramos-gallery>

<!-- Misa de Ramos -->
<misa-ramos-gallery
  base-path="./fotos/ramos/"
  theme="violeta-dorado"
  particle-src="./img/ramo.png"
  mascot-src="./img/camarita.png"
  width="80%">
</misa-ramos-gallery>

<!-- Navidad -->
<misa-ramos-gallery
  base-path="./fotos/navidad/"
  theme="verde-dorado"
  particle-src="./img/estrella.png"
  width="75%">
</misa-ramos-gallery>

<!-- Primera Comunión -->
<misa-ramos-gallery
  base-path="./fotos/comunion/"
  theme="blanco-dorado"
  particle-src="./img/paloma.png"
  total="12"
  width="85%">
</misa-ramos-gallery>

<!-- Color institucional custom -->
<misa-ramos-gallery
  base-path="./fotos/evento/"
  color1="#1a3a6b"
  color2="#d4af37"
  width="80%">
</misa-ramos-gallery>
```

---

## Aislamiento CSS

El componente usa **Shadow DOM** (`mode: 'open'`), por lo que:

- ✅ Los estilos de la plataforma **no entran** al componente
- ✅ Los estilos del componente **no salen** a la plataforma
- ✅ Se puede insertar en cualquier CMS, blog o plataforma sin conflictos
- ✅ El lightbox usa `position: fixed` con `z-index: 99999` — siempre queda encima de todo

---

*misa-ramos-gallery.js — v5*
