# `<mascota-flotante>`

Web component nativo (vanilla JS, Shadow DOM) que hace caminar una mascota (o cualquier PNG) por encima de una card, siguiendo su posición y su ancho reales. Es `position: absolute`, no `fixed`: se mueve con el scroll y no aparece en toda la página.

## Instalación

```html
<script src="./mascota-flotante.js"></script>

<noticia-card id="noticia-1"></noticia-card>

<mascota-flotante src="./news/gio.png" target="noticia-1"></mascota-flotante>
```

Sin ningún atributo nuevo camina de derecha a izquierda, en línea recta, con el rebotito de siempre.

## Cómo elige por dónde caminar

La mascota se posiciona sobre una card destino:

- Con `target="id-de-la-card"` sigue a esa card.
- Sin `target`, sigue a la primera `<noticia-card>` del documento.
- Si la card todavía no existe cuando corre el script, reintenta hasta 20 veces.

## Atributos básicos

| Atributo | Default | Descripción |
|---|---|---|
| `src` | `./news/gio.png` | Imagen de la mascota. |
| `href` | `#` | Enlace al hacer clic. |
| `alt` | `Más noticias` | Texto alternativo y `aria-label`. |
| `duracion` | `16s` | Tiempo de **una pasada** (acepta `s` o `ms`). |
| `ancho` | `clamp(90px, 16vw, 150px)` | Ancho de la mascota. |
| `target` | primera `<noticia-card>` | `id` de la card a seguir. |
| `offset-top` | `0` | Píxeles de separación desde el borde **superior** de la card. |
| `offset-bottom` | — | Píxeles desde el borde **inferior** de la card. Si se define, tiene prioridad sobre `offset-top`. |

## Sentido

| Atributo | Valores | Descripción |
|---|---|---|
| `sentido` | `der-izq` (default), `izq-der`, `ida-vuelta` | Dirección de la caminata. En `ida-vuelta` va y vuelve, y el ciclo completo dura el doble de `duracion`. |
| `inicio` | número (% del ancho de la card) | Dónde aparece. Default `105` (o `-22` con `izq-der`). |
| `fin` | número (% del ancho de la card) | Dónde llega. Default `-22` (o `105` con `izq-der`). |

## Espejado de la imagen

| Atributo | Valores | Descripción |
|---|---|---|
| `mirar` | `izq` (default), `der` | Hacia dónde mira el PNG original. El componente lo espeja solo para que siempre mire hacia donde camina. |
| `espejar` | `on` (default), `off` | Con `off` el PNG **nunca se voltea**. Útil si la imagen tiene texto o es algo como una escoba voladora. Con `off`, `mirar` no tiene efecto. |

`espejar` es independiente del sentido, los recorridos y los efectos.

## Recorrido

Atributo `recorrido`. Acepta uno o varios valores separados por espacio, por ejemplo `recorrido="pausas saltitos"`.

**Horizontal** (se aplica uno):

| Valor | Descripción |
|---|---|
| `lineal` | Paso parejo (default). |
| `pausas` | Camina, se frena dos veces y sigue. |

**Vertical** (se aplica uno):

| Valor | Descripción |
|---|---|
| `zigzag` | Sube y baja en picos marcados. |
| `ola` | Sube y baja suave. |
| `saltitos` | Camina dando saltos. |
| `tambaleo` | Se balancea de lado a lado. |

Si combinás varios verticales, prevalece el primero de este orden: `zigzag`, `ola`, `saltitos`, `tambaleo`.

## Efectos

Atributo `efecto`. Acepta uno o varios valores separados por espacio, por ejemplo `efecto="brillo chispas sombra"`.

| Valor | Descripción |
|---|---|
| `brillo` | Aura dorada que pulsa. |
| `arcoiris` | Cambia de color en bucle. |
| `latido` | Se agranda y achica. |
| `fantasma` | Se vuelve semitransparente por momentos. |
| `chispas` | Partículas que suben desde la mascota. |
| `sombra` | Sombra en el piso. Se achica cuando salta si usás `saltitos`. |

Atributos relacionados:

| Atributo | Default | Descripción |
|---|---|---|
| `chispa` | `✨` | Emoji(s) de las partículas, separados por espacio. Ej.: `chispa="🌸 ✨ ⛪"`. |

## Otros atributos

| Atributo | Default | Descripción |
|---|---|---|
| `rebote` | activo | `rebote="off"` quita el rebotito del paso. |
| `retraso` | `0s` | Demora inicial antes de salir. |
| `repetir` | `infinite` | Cantidad de pasadas (por ejemplo `2`) o `infinite`. |
| `pausar-hover` | — | Si está presente, la mascota se frena mientras el mouse está encima. |

## Ejemplos

**Clásico (comportamiento original):**

```html
<mascota-flotante src="./news/gio.png" target="noticia-1"></mascota-flotante>
```

**De izquierda a derecha, con texto en la imagen (sin voltear):**

```html
<mascota-flotante
  src="./news/cartel.png"
  target="noticia-1"
  sentido="izq-der"
  espejar="off">
</mascota-flotante>
```

**Va y vuelve, con pausas y saltitos:**

```html
<mascota-flotante
  src="./news/gio.png"
  target="noticia-1"
  sentido="ida-vuelta"
  recorrido="pausas saltitos"
  efecto="brillo chispas sombra"
  chispa="✨ 🌟"
  duracion="14s"
  pausar-hover>
</mascota-flotante>
```

**Escoba voladora (sin espejar, con ola):**

```html
<mascota-flotante
  src="./news/escoba.png"
  target="noticia-2"
  sentido="der-izq"
  espejar="off"
  recorrido="ola"
  efecto="chispas"
  chispa="✨"
  rebote="off">
</mascota-flotante>
```

## Notas

- **Atributos leídos una sola vez:** los atributos se leen al conectar el componente. Si cambiás uno por JavaScript después, hay que quitar y volver a insertar el elemento.
- **Accesibilidad:** con `prefers-reduced-motion: reduce` se desactivan todas las animaciones y la mascota queda quieta en la posición de llegada. Las chispas se ocultan.
- **Layout:** la mascota se reposiciona sola cuando cambia el tamaño de la card o de la ventana.
- **Doble carga:** si el script se carga dos veces no falla, porque se chequea `customElements.get()` antes de registrarlo.
