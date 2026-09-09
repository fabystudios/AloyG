# `<cartel-evento>`

Web component nativo (vanilla JS, Shadow DOM) que encapsula los dos carteles
de la publicación "Festejamos a San Francisco de Asís" / "Feria de
Emprendedores" de la Parroquia San Luis Gonzaga (Villa Elisa).

Todo el CSS, las fuentes (Google Fonts) y los íconos SVG viven dentro del
Shadow DOM: el estilo del sitio anfitrión no lo afecta, y sus estilos no se
filtran hacia afuera.

## Capas (de atrás hacia adelante)

En **los dos** posters (principal y feria), en ese orden:

1. Fondo de color (degradé).
2. Guirnalda de banderines (`img-bunting`), pegada arriba, mostrando la
   imagen completa a su alto natural (nunca recorta los banderines) — la
   transparencia que le sobre por debajo queda tapada por el propio marco
   redondeado de la card. Tiene un balanceo animado suave.
3. Contenido (halo/portada, títulos, subcards, footer).

Este orden es intencional: la guirnalda nunca tapa el contenido, pero
tampoco queda invisible detrás del fondo.

## Layout

El cartel es **rectangular** y usa CSS Grid + container queries (`cqw`):
apaisado 1.7:1 en desktop (ventana ≥769px), vertical 3:4 en mobile
(≤768px). El switch para alternar entre los dos posters se muestra
**siempre, arriba**.

Los textos de las subcards tienen `line-clamp` de seguridad además de
`clamp()` para el tamaño de fuente: nunca se desbordan ni quedan tapados
por el footer, sea cual sea el ancho del contenedor.

## Subcards configurables por props

Cada subcard (3 en el poster principal, 2 en el de la feria) tiene el
mismo diseño: un círculo a la izquierda y el título al lado, centrado a la
altura del medio del círculo — y debajo, la descripción (o el precio, en el
caso de "Inscripción").

Por defecto muestran el ícono, título y texto originales. Se pueden
sobreescribir con estos atributos, usando el id de la subcard
(`card1`, `card2`, `card3` en el poster principal; `panel1`, `panel2` en el
de la feria):

| Atributo            | Qué hace                                                                          |
|-----------------------|--------------------------------------------------------------------------------------|
| `<id>-img`           | URL de imagen para el círculo. Si no se pasa, usa el ícono y color por defecto.       |
| `<id>-title`         | Texto del título.                                                                     |
| `<id>-text`          | Texto de la descripción.                                                              |
| `<id>-body-img`      | URL de imagen que **reemplaza por completo** el título+descripción de esa subcard (el círculo deja de mostrarse; queda solo la imagen). |
| `panel2-price`       | Precio de inscripción (default `"$15.000"`).                                          |

Cada uno de estos también acepta guión bajo en vez de guión medio
(`card2_body-img` funciona igual que `card2-body-img`), por si se escribe
así por error.

El texto de la descripción admite hasta 4 líneas; si es más largo se corta
con "…" — para textos más cortos ajustá `<id>-text`.

```html
<!-- círculo con imagen propia, título y texto sin cambios -->
<cartel-evento card2-img="/img/feria-emprendedores.png"></cartel-evento>

<!-- toda la subcard 3 reemplazada por una sola imagen -->
<cartel-evento card3-body-img="/img/buffet-foto.png"></cartel-evento>

<!-- solo cambiar el texto -->
<cartel-evento panel1-title="¿Tenés un emprendimiento?"></cartel-evento>
```

Qué subcard es cuál:

- Poster principal: `card1` = Misa, `card2` = Feria & Bingo, `card3` = Buffet.
- Poster feria: `panel1` = ¿Sos emprendedor?, `panel2` = Inscripción.

### Imagen distinta para mobile

`<id>-body-img-mobile` deja pasar una imagen distinta a la de desktop para
esa misma subcard — pensada para que en mobile (donde la card es vertical)
uses una imagen apaisada que aproveche mejor el ancho angosto. Si no la
pasás, se usa la misma que `<id>-body-img`.

```html
<cartel-evento
  card2-body-img="/img/feria-desktop.png"
  card2-body-img-mobile="/img/feria-mobile-landscape.png">
</cartel-evento>
```

## Título del poster principal

Por defecto muestra "Festejamos a San Francisco de Asís" con el estilo
original (dos colores, cursiva). Se puede reemplazar por una imagen:

| Atributo               | Qué hace                                                                |
|--------------------------|------------------------------------------------------------------------------|
| `main-title-img`        | URL de imagen que reemplaza el título completo                                |
| `main-title-img-width`  | Ancho máximo de esa imagen (cualquier valor CSS: `"180px"`, `"40%"`, etc.)     |

Cuando se usa `main-title-img`, **la píldora de la fecha desaparece**
(la idea es que el diseño de la imagen ya incluya esa información si hace
falta).

## Título de la feria

Por defecto dice "Feria de Emprendedores". Se puede cambiar el texto o
reemplazarlo por una imagen (un clip-art/logo, por ejemplo):

| Atributo               | Qué hace                                                                    |
|--------------------------|----------------------------------------------------------------------------------|
| `feria-eyebrow`         | Texto chico de arriba (default `"Feria de"`)                                      |
| `feria-title`           | Texto grande (default `"Emprendedores"`)                                          |
| `feria-title-img`       | URL de imagen que reemplaza **todo** el título (eyebrow + texto grande)            |
| `feria-title-img-width` | Ancho máximo de esa imagen (cualquier valor CSS: `"160px"`, `"50%"`, etc.)         |

Igual que en el poster principal, si usás `feria-title-img` la píldora de
la fecha desaparece.

```html
<cartel-evento main-title-img="/img/titulo-santo.png" main-title-img-width="220px"></cartel-evento>
<cartel-evento poster="feria" feria-title-img="/img/logo-feria.png" feria-title-img-width="200px"></cartel-evento>
```

Aunque no indiques el ancho, la imagen nunca puede crecer indefinidamente:
tiene un tope de alto de seguridad para que no empuje el resto del cartel
hacia abajo. Igualmente, si tu imagen es muy alargada, especificar el ancho
con `*-title-img-width` te da mejor control del resultado final.

## Botón de WhatsApp

En el poster de la feria, "Comunicate con Nancy" ahora es un **botón real**
(`<a>` con `target="_blank"`) que abre WhatsApp directo para mandar un
mensaje — no un texto decorativo.

| Atributo             | Default            | Descripción                                   |
|------------------------|----------------------|----------------------------------------------------|
| `whatsapp-number`     | `5491153133638`     | Solo dígitos, con código de país (54) y 9 de celular. Se usa para armar el link `https://wa.me/...`. |
| `whatsapp-display`    | `11 5313-3638`       | Texto que se muestra en el botón.                    |

## Otros atributos

| Atributo         | Valores            | Default               | Descripción                                                     |
|--------------------|---------------------|--------------------------|----------------------------------------------------------------------|
| `poster`          | `main` \| `feria`   | `main`                    | Con cuál cartel arranca (el switch permite cambiar). **Importante**: si escribís el atributo `poster` dos veces en el mismo tag, el navegador respeta la primera y descarta la segunda — es una regla de HTML, no del componente. |
| `img-santo`       | ruta de imagen      | `san-francisco.png`      | PNG con fondo transparente del santo (se usa en los dos posters)       |
| `img-iglesia`     | ruta de imagen      | `iglesia.png`             | PNG con fondo transparente de la iglesia — aparece en el footer de **los dos** posters |
| `img-bunting`     | ruta de imagen      | `banderines.png`          | PNG de la guirnalda de banderines, en **los dos** posters              |

## Variable CSS

| Variable             | Default | Descripción                                          |
|------------------------|-----------|----------------------------------------------------------|
| `--cartel-max-width`  | sin tope  | Ancho máximo del componente; por defecto ocupa el 100% del contenedor |

## Imágenes

- `san-francisco.png` — recorte del santo, se usa en los dos carteles.
- `iglesia.png` — recorte de la iglesia, aparece en el footer de **los dos**
  carteles (antes solo estaba en el principal).
- `banderines.png` — guirnalda de banderines, apaisada, con los banderines
  pegados arriba del todo y el resto transparente.

Si algún archivo no existe todavía, el componente no se rompe: cada uno cae
a su propio respaldo (ícono de silueta, ícono de iglesia, o banderines de
triangulitos CSS).

## Compatibilidad

Usa `customElements`, Shadow DOM y **container queries** (`container-type`,
unidades `cqw`) — soportado en navegadores modernos (Chrome/Edge 105+,
Safari 16+, Firefox 110+). Incluye guard
(`customElements.get('cartel-evento')`) para evitar errores si el script se
carga más de una vez en la misma página.

## Demo

Abrí `demo.html`: muestra el componente sin props, con las 3 imágenes y el
botón de WhatsApp, con subcards personalizadas (imagen en el círculo, texto
propio, y una subcard reemplazada por imagen completa), y con ancho
acotado.
