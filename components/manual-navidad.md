# Manual del tema Navidad

Guía de referencia de todas las opciones del tema navideño: header, footer, títulos (`<section-title>`), luces, nieve, bastones e imágenes.

> **La idea en una línea:** todo se maneja con **clases en la etiqueta `<html>`** (interruptores globales) y con **atributos en cada `<section-title>`** (interruptores por título). Si algo no aparece, andá directo a la sección [Si algo no aparece](#9-si-algo-no-aparece).

---

## 1. Qué archivos intervienen y dónde van

| Archivo | Carpeta | Para qué sirve |
|---|---|---|
| `navbar-3d.css` | `css/` | Look 3D del header y footer. Guarda la **paleta de colores en variables** (`--n3d-*`). |
| `tema-navidad.css` | `css/` | Pinta todo de **rojo** (redefine esas variables) y da estilo a la imagen del título. |
| `tema-navidad.js` | `js/` | Adornos del **header y footer** (canvas), cambio de **logo**, **título como imagen** y **luces del header**. |
| `section-title.js` | `components/` | El componente `<section-title>`: temas, **luces, nieve, bastones** e imagen de los separadores. |
| `logo-navidad.png` | `logos/` | Logo navideño (reemplaza al del navbar). |
| `titulo-cristal.webp` y `.png` | `logos/` | Imagen que reemplaza el texto "San Luis Gonzaga" (opcional). |

**Orden de los `<link>` de CSS** (importa):

```html
<link rel="stylesheet" href="css/navbar-3d.css">
<link rel="stylesheet" href="css/tema-papa.css">      <!-- si lo tenés -->
<link rel="stylesheet" href="css/tema-navidad.css">
```

**Scripts:**

```html
<script src="js/tema-navidad.js" defer></script>
<script src="./components/section-title.js" defer></script>
```

> ⚠️ En tu `index` el `section-title.js` se carga **dos veces** (en el `<head>` y más abajo). Dejá solo una.

---

## 2. El interruptor maestro

```html
<html lang="es-AR" class="tema-navidad">
```

- **Sin esa clase no se ve nada navideño**: todas las demás opciones quedan inactivas.
- **Quitarla** devuelve el sitio al estándar (se borran canvas, animaciones, logo e imagen del título).
- **No combinar** con `tema-papa`.
- `footer-paneles` (footer con paneles de vidrio) no es navideño, pero convive sin problemas: `class="footer-paneles tema-navidad"`.

### Activación automática por fechas (opcional)

| Atributo en `<html>` | Efecto |
|---|---|
| `data-navidad-auto` | Se enciende del **8 de diciembre al 6 de enero**, todos los años. |
| `data-navidad-auto="12-08/01-06"` | Rango anual propio (`MM-DD/MM-DD`). |
| `data-navidad-auto="2026-12-08/2027-01-06"` | Fechas exactas. |

---

## 3. Qué trae `tema-navidad` por sí solo

Con solo `class="tema-navidad"`:

| Zona | Qué aparece |
|---|---|
| **Header** | Tira roja 3D, logo navideño, polvo de estrellas, y colgando de la tira: bolas, campanas, estrellas y, en las dos esquinas, hojas con frutos rojos. |
| **Footer** | Rojo, polvo de estrellas y adornos colgando del borde superior (sin luces). |
| **Títulos** (`<section-title>`) | Pasan solos al tema `navidad`: cartel rojo 3D, **estrellas chispeando**, **bastones de caramelo** flotando y **nieve** amontonada arriba. |

Todo lo demás (luces, imagen del título, etc.) se **suma** con los interruptores de abajo.

---

## 4. Header

Todos estos interruptores son clases del `<html>` y **requieren `tema-navidad`**.

### 4.1 Imagen en lugar del texto del título

| Clase | Efecto |
|---|---|
| `titulo-imagen` | El texto "San Luis Gonzaga" se reemplaza por la imagen. Al quitar la clase vuelve el texto. |

- Imagen por defecto: `./logos/titulo-cristal.webp` (si falla, prueba el mismo nombre en `.png`; si tampoco está, vuelve el texto).
- El texto original **no se borra**: queda oculto a la vista pero disponible para lectores de pantalla y buscadores.
- Otra ruta (antes del script):

```html
<script>
  window.TEMA_NAVIDAD = {
    logo:   './navidad/logo-navidad.png',
    titulo: './navidad/titulo-cristal.webp'
  };
</script>
<script src="js/tema-navidad.js" defer></script>
```

### 4.2 Luces del header

Hay **tres estilos**. Primero se enciende con `luces-header`; después se elige el estilo:

| Estilo | Cómo | Cómo se ve |
|---|---|---|
| **Festones** (el de siempre) | `luces-header` | Cable en curvas colgando del borde inferior; bombillas que titilan al azar. Los adornos cuelgan del cable. |
| **Americano** | `luces-header luces-americanas` | Cable **recto** y bombillas parejas con un brillo que **corre** por la fila (persecución). |
| **LED sin cable** | `luces-header luces-header-led` (o `luces-led`) | **Solo puntos de luz** alineados, sin cable ni portalámparas. El ojo completa la línea. |

**Prioridad entre estilos:** `led` > `americano` > `festones`.

> `luces-led` o `luces-americanas` **solos no encienden las luces**: solo eligen el estilo. Para encenderlas hace falta `luces-header`.

---

## 5. Títulos (`<section-title>`)

Cada título puede configurarse **individualmente** con atributos, o **todos a la vez** con clases del `<html>`. **El atributo del título siempre gana sobre la clase global.**

### 5.1 Tema del título

| Dónde | Cómo | Resultado |
|---|---|---|
| Automático | `<html class="tema-navidad">` | Todos los títulos pasan a `navidad`. |
| Un título | `theme="navidad"` | Ese título en tema navideño. |
| Un título | `theme="classic"` | Ese título conserva el look original aunque el tema esté activo. |
| Un título | `theme="3d"` | Look 3D (toma los colores del tema activo, así que en Navidad sale rojo) **sin** estrellas, bastones ni nieve. |
| Todos | `<html data-st-theme="3d">` | Fuerza `3d` en todos. |

> ⚠️ **Cuidado:** si el `<html>` tiene `data-st-theme="3d"` (o `"classic"`), eso **gana** sobre la clase `tema-navidad` y los títulos **no** pasan a navideño. Para el tema navideño automático, no pongas `data-st-theme`.

**Prioridad:** atributo `theme` del título › `data-st-theme` del `<html>` › clase `tema-navidad` › clásico.

### 5.2 Luces del título

**Encender:**

| Dónde | Cómo |
|---|---|
| Todos los títulos | `<html class="tema-navidad luces-titulos">` |
| Un título | `lights="on"` |
| Apagar uno (con `luces-titulos` global) | `lights="off"` |

`lights` también acepta `si`, `true`, `1` (encienden) y `no`, `false`, `0` (apagan). Un valor de estilo (`lights="festones"`) enciende **y** fija el estilo de una vez.

**Estilos:**

| Estilo | Cómo | Cómo se ve |
|---|---|---|
| **Americano** (por defecto en títulos) | sin nada, o `lights-style="americano"` | Cable recto que **rodea el cartel** con bombillas equidistantes y brillo que corre alrededor. |
| **Festones** | `lights-style="festones"` o `<html class="luces-festones">` | Curvas que cuelgan del borde superior, bajo la nieve. |
| **LED sin cable** | `lights-style="led"` o `<html class="luces-titulos-led">` (o `luces-led`) | Solo puntos de luz, sin cable. |

Sinónimos que también se aceptan (mayúsculas o minúsculas): festones = `swag`, `curvas`, `guirnalda` · americano = `american`, `recto` · led = `sin-cable`, `puntos`, `dots`.

**Prioridad del estilo en títulos:** `lights-style` › estilo dado en `lights` › clase `luces-titulos-led`/`luces-led` › clase `luces-festones` › americano.

**Posición de las luces americanas y LED:** márgenes parejos de ~9 px por los cuatro lados. **Con nieve**, la fila de arriba queda bajo los goterones y la nieve la cubre un poco (como el alero de una casa), y la nieve se ilumina donde tapa una bombilla. **Sin nieve**, queda a 9 px del borde, igual que la fila de abajo.

### 5.3 Nieve

| Dónde | Cómo |
|---|---|
| Por defecto | Encendida |
| Un título | `snow="off"` (o `snow="on"`) |
| Todos | `<html class="sin-nieve-titulos">` |

Al apagarla se elimina su canvas. Se puede cambiar en vivo.

### 5.4 Bastones de caramelo

| Situación | Resultado |
|---|---|
| Por defecto | El canvas dibuja bastones chicos que **flotan** a cada lado del título (hasta 2 por lado). No se dibujan si no hay sitio libre (títulos largos en celulares). |
| `effect="floating-png"` + `png-src="..."` | Flotan **tus PNG** y el canvas **no** dibuja bastones. |
| Solo `png-src`, sin el efecto | No aparece ningún PNG, así que el canvas **conserva** sus bastones. |
| `canes="on"` | Se ven **los dos** (canvas + tus PNG). |
| `canes="off"` | Ningún bastón. |

```html
<section-title text="Avisos" icon="campaign"
               effect="floating-png"
               png-src="./navidad/candy.png"
               png-count="4" png-width="40px">
</section-title>
```

- `png-count` (1–20) y `png-width` / `png-height` / `png-size` controlan cuántos y qué tamaño.
- Los PNG se reparten al azar por todo el cartel (pueden pasar detrás del título).
- Con el tema Navidad las **estrellas ya vienen incluidas**: no hace falta `effect="stars"` (duplica la capa y gasta más).

### 5.5 Imagen después del título

```html
<section-title text="Avisos"
               img="./cartelera/gio-dedo.png"
               img-alt="Gio señalando"
               img-idle="float"
               img-effect="zigzag">
</section-title>
```

| Atributo | Valores | Por defecto |
|---|---|---|
| `img` | URL de la imagen (si falta, no se dibuja nada) | — |
| `img-alt` | Texto alternativo | vacío |
| `img-max-height` | Alto máximo (CSS) | `80px` |
| `img-max-width` | Ancho máximo (CSS) | `180px` |
| `img-max-height-mobile` | Alto máximo en pantallas ≤ 768 px | `56px` |
| `img-mobile` | `on` / `off` (oculta la imagen en celulares) | `on` |
| `img-idle` | `none` / `float` (flota todo el tiempo) | `none` |
| `img-effect` | `none`, `zigzag`, `point`, `wiggle`, `float`, `bounce`, `pulse` | `none` |
| `img-trigger` | `click`, `hover`, `auto` | `click` si hay efecto |
| `img-class` | Clases extra para el `<img>` (ej. `zig-target`) | — |
| `img-play-class` | Clase propia que se aplica al tocar (ej. `zigzag`) | — |

- `click` = **una pasada** por toque; si se toca de nuevo en pleno efecto, **se reinicia**. `hover` y `auto` van en bucle.
- Para usar **tu propio CSS** (tus `@keyframes`): `img-class="zig-target" img-play-class="zigzag"`.
- Con `prefers-reduced-motion` no se anima nada.

### 5.6 Ícono del título

| Atributo | Valores | Notas |
|---|---|---|
| `icon` | Nombre **Material** (`article`, `newspaper`, `campaign`…), clase **Font Awesome** (`fa-newspaper`) o **emoji** (`📰`) | Material: minúsculas con guion bajo. |
| `icon-type` | `auto`, `material`, `fa`, `emoji` | Forzar el tipo (sirve para marcas: `icon="fab fa-facebook" icon-type="fa"`). |
| `icon-mobile` | `on` / `off` | `off` oculta el ícono en pantallas ≤ 768 px. |

---

## 6. Resumen de todos los interruptores

### Clases del `<html>`

| Clase | Afecta a | Hace |
|---|---|---|
| `tema-navidad` | Todo | **Maestro.** Sin esto no se ve nada navideño. |
| `titulo-imagen` | Header | Texto del título → imagen. |
| `luces-header` | Header | Enciende luces (festones). |
| `luces-americanas` | Header | Estilo americano (necesita `luces-header`). |
| `luces-header-led` | Header | Estilo LED (necesita `luces-header`). |
| `luces-titulos` | Títulos | Enciende luces en todos. |
| `luces-festones` | Títulos | Estilo festones por defecto. |
| `luces-titulos-led` | Títulos | Estilo LED por defecto. |
| `luces-led` | Header **y** títulos | Estilo LED (solo elige el estilo, no enciende). |
| `sin-nieve-titulos` | Títulos | Apaga la nieve en todos. |
| `footer-paneles` | Footer | Paneles de vidrio (no es navideño). |

### Atributos de `<section-title>` específicos del tema

| Atributo | Valores |
|---|---|
| `theme` | `classic` · `3d` · `navidad` |
| `lights` | `on` · `off` (o un estilo) |
| `lights-style` | `americano` · `festones` · `led` |
| `snow` | `on` · `off` |
| `canes` | `on` · `off` |

---

## 7. Recetas listas para copiar

**A. Navidad básica** (rojo + adornos + estrellas, bastones y nieve en títulos):

```html
<html lang="es-AR" class="tema-navidad">
```

**B. Navidad completa** (todo encendido, estilo LED):

```html
<html lang="es-AR" class="footer-paneles tema-navidad titulo-imagen
                          luces-header luces-header-led
                          luces-titulos luces-titulos-led">
```

**C. Liviana** (sin luces globales; luces solo en dos títulos):

```html
<html lang="es-AR" class="tema-navidad">
...
<section-title text="Últimas Novedades" icon="campaign" lights="on"></section-title>
<section-title text="Avisos" icon="campaign" lights="on" lights-style="led"></section-title>
```

**D. Header con festones y títulos americanos:**

```html
<html lang="es-AR" class="tema-navidad luces-header luces-titulos">
```

**E. Todos con luces, pero un título sin nieve y otro en festones:**

```html
<html lang="es-AR" class="tema-navidad luces-titulos">
...
<section-title text="Misas" snow="off"></section-title>
<section-title text="Retiros" lights-style="festones"></section-title>
```

**F. Que se encienda sola del 8 de diciembre al 6 de enero:**

```html
<html lang="es-AR" class="titulo-imagen luces-header luces-titulos" data-navidad-auto>
```

**G. Volver al estándar:** quitá `tema-navidad` del `<html>`. Las demás clases quedan inactivas.

---

## 8. Imágenes: tamaños y características

| Imagen | Se muestra a | Tamaño recomendado | Peso objetivo |
|---|---|---|---|
| **Logo navideño** | ~96 px de alto (desktop), ~62 px (mobile) | Unos **260 px de alto** (3× lo que se muestra) | < 150 KB |
| **Título como imagen** | ~232 × 56 px (desktop), ~157 × 38 px (mobile) | **720 px de ancho** (≈ 720 × 174) | < 100 KB (WebP ≈ 50 KB) |
| **Bastón PNG** (`png-src`) | 40–80 px | 2–3× lo que muestres (ej. 120 px) | pocos KB |
| **Imagen tras el título** (`img`) | hasta 80 px de alto (56 en mobile) | ~240 px de alto | < 100 KB |

**Características que conviene cuidar:**

- **Canal alfa limpio:** bordes semitransparentes **sin halo** ni fondo blanco incrustado.
- **Recortada al dibujo:** sin márgenes transparentes alrededor.
- **WebP** pesa unas 3–4 veces menos que PNG con degradados; todos los navegadores actuales lo soportan.
- **Colores claros** para el título: tiene que contrastar con la tira roja.
- Un PNG enorme que se muestra chico **desperdicia memoria** y tiempo de descarga.

**Ajustar el tamaño en pantalla** (en `css/tema-navidad.css` y `css/navbar-3d.css`):

| Variable | Qué controla | Valor actual |
|---|---|---|
| `--tn-titulo-h` | Alto de la imagen del título en desktop | `56px` |
| `--tn-titulo-h-m` | Alto de la imagen del título en mobile | `38px` |
| `--n3d-logo-desktop` | Alto del logo en desktop | `96px` |
| `--n3d-logo-escala` | Escala del logo en mobile | `1.25` |
| `--n3d-filete` | Grosor del filete dorado | `3px` |
| `--n3d-z` | Altura de la tira sobre los slides | `1040` |

---

## 9. Si algo no aparece

Repasá en este orden:

1. **¿Está la clase maestra?** El `<html>` debe tener `tema-navidad`. En la consola: `document.documentElement.className`.
2. **¿Están los archivos en su carpeta?** Sobre todo `components/section-title.js` (no `js/`) y las imágenes en la ruta que usa el script.
3. **¿Es caché?** Recargá sin caché (Ctrl+F5, o Cmd+Shift+R en Mac). En el celular, borrá los datos del sitio. También podés agregar `?v=2` al final del `<script>`.
4. **¿Es la versión nueva?** Pegá en la consola:

```js
// header (luces, título imagen): imprime true si es la versión nueva
fetch('js/tema-navidad.js',{cache:'reload'}).then(r=>r.text()).then(t=>console.log(t.includes('luces-header-led')))

// títulos (luces, nieve, LED): imprime true si es la versión nueva
fetch('components/section-title.js',{cache:'reload'}).then(r=>r.text()).then(t=>console.log(t.includes('_lightsWanted')))
```

5. **¿Se crearon los lienzos?** `document.querySelectorAll('.tn-canvas').length` debería dar **2** (header y footer).
6. **¿Qué tema y qué estilo toma un título?**

```js
const t = document.querySelector('section-title');
console.log(t._resolveTheme(), t._lightsStyle());   // ej.: navidad americano
```

7. **¿Falla una imagen?** Abrí la pestaña *Network* del navegador y buscá un 404 en el logo o el título. Si el archivo no existe, el sitio vuelve **en silencio** al logo o al texto original.

**Errores frecuentes:**

| Síntoma | Causa |
|---|---|
| `luces-header` puesto como atributo de `<section-title>` no hace nada | Es una clase del `<html>`. En un título usá `lights="on"`. |
| Los títulos no pasan a navideño | El `<html>` tiene `data-st-theme="3d"` o `"classic"`; ese atributo gana. |
| Puse `luces-led` y no hay luces | `luces-led` solo elige el estilo; faltan `luces-header` y/o `luces-titulos`. |
| La imagen del título o el logo no aparecen | Ruta incorrecta (por defecto busca en `./logos/`). Definila con `window.TEMA_NAVIDAD`. |
| Los cambios de `section-title.js` no se ven | El `index` lo carga desde `./components/`; se actualizó otro archivo. |

---

## 10. Rendimiento

Mediciones relativas hechas en un entorno **más lento que un navegador real** (sirven para comparar, no como números absolutos):

| Elemento | Costo aproximado por cuadro |
|---|---|
| Header con adornos y polvo de estrellas | ~7 ms (de los 16,7 ms que hay a 60 fps) |
| Luces en un título | ~0,4 a 0,6 ms por título |
| LED sin cable vs. americano | Entre 10 % y 25 % menos que las luces americanas |
| Bastones dibujados en canvas | ~0,05 ms por título (despreciable) |

**Qué ayuda de verdad:**

- Encender las luces solo en el **header** y en **algunos títulos** (`lights="on"` puntual), en vez de en los 13.
- No usar `effect="stars"` junto con el tema Navidad (ya trae estrellas propias).
- El estilo **LED sin cable** es algo más liviano.
- Los títulos **fuera de pantalla no se animan**, y con `prefers-reduced-motion` se dibuja un cuadro estático.

> Estas cifras no reemplazan una prueba en un celular de gama baja con las herramientas de desarrollo de Chrome (pestaña *Rendimiento*).

---

## 11. Glosario de nombres

| Nombre | Significa |
|---|---|
| **Festones** | Luces en cable con curvas, como una guirnalda. |
| **Americano** | Cable recto con bombillas parejas, como las luces de techos y paredes de las casas americanas. |
| **LED sin cable** | Solo los puntos de luz, sin cable; el ojo completa la línea. |
| **Persecución** | El brillo que corre de una bombilla a la siguiente. |
| **Goterones** | Los picos de nieve que cuelgan del borde del cartel. |
| **Canvas** | El lienzo de dibujo del navegador donde se pintan los adornos. |
