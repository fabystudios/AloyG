# `<cartel-evento>`

Web component nativo (vanilla JS, Shadow DOM) que encapsula los dos carteles
de la publicación "Festejamos a San Francisco de Asís" / "Feria de
Emprendedores" de la Parroquia San Luis Gonzaga (Villa Elisa).

Todo el CSS, las fuentes (Google Fonts) y los íconos SVG viven dentro del
Shadow DOM: el estilo del sitio anfitrión no lo afecta, y sus estilos no se
filtran hacia afuera.

## Layout

El cartel es **rectangular** y usa CSS Grid + container queries (`cqw`) en
vez de un lienzo fijo escalado por JS, así que ocupa el máximo espacio
disponible sin scroll, con las proporciones cambiando según el ancho de la
**ventana**:

- **Desktop** (ventana ≥769px): cartel apaisado ("a lo largo").
- **Mobile** (ventana ≤768px): cartel vertical ("a lo alto").

El switch para alternar entre "Evento principal" y "Feria de emprendedores"
se muestra **siempre, arriba**, tanto en desktop como en mobile.

## Instalación

```html
<script src="cartel-evento.js"></script>
```

## Ejemplo de llamada (props / atributos)

```html
<cartel-evento
  poster="main"
  img-santo="/img/san-francisco.png"
  style="--cartel-max-width:900px;">
</cartel-evento>
```

- `poster`: con cuál de los dos carteles arranca (`main` o `feria`). El
  visitante después puede cambiar con el switch.
- `img-santo`: ruta a tu PNG con fondo transparente del santo (se usa en
  los dos carteles).
- `--cartel-max-width`: se pasa en el `style` del propio tag. Si no se
  especifica, el componente ocupa el 100% del ancho de su contenedor.

## Atributos

| Atributo      | Valores           | Default               | Descripción                                    |
|----------------|--------------------|--------------------------|----------------------------------------------------|
| `poster`      | `main` \| `feria`  | `main`                    | Con cuál cartel arranca (el switch permite cambiar) |
| `img-santo`   | ruta de imagen     | `san-francisco.png`      | PNG con fondo transparente del santo                |

## Variable CSS

| Variable             | Default | Descripción                                          |
|------------------------|-----------|----------------------------------------------------------|
| `--cartel-max-width`  | sin tope  | Ancho máximo del componente; por defecto ocupa el 100% del contenedor |

## Subcards con más presencia

Los textos de las tarjetas (Misa / Feria & Bingo / Buffet, y las de la
feria) escalan de forma fluida con `clamp()` + `cqw` y las filas de tarjetas
usan `1fr` en el grid, así que **ocupan todo el espacio vertical
disponible** en vez de dejar zonas vacías — se agrandan solas cuanto más
grande es el cartel.

## Imágenes

Colocá junto al HTML (o donde prefieras, indicando la ruta con el atributo
`img-santo`) el archivo PNG con fondo transparente del santo. Si no existe
todavía, el componente no se rompe: lo reemplaza por un ícono simple de
silueta.

## Compatibilidad

Usa `customElements`, Shadow DOM y **container queries** (`container-type`,
unidades `cqw`) — soportado en navegadores modernos (Chrome/Edge 105+,
Safari 16+, Firefox 110+). Incluye guard
(`customElements.get('cartel-evento')`) para evitar errores si el script se
carga más de una vez en la misma página.

## Demo

Abrí `demo.html`, que muestra el componente embebido en una página con
estilos deliberadamente "hostiles" (otra tipografía, otro fondo). Achicá y
agrandá la ventana del navegador para ver el cambio de apaisado a vertical.
