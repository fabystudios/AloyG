# `<noticia-video-card>`

Variante de `<noticia-card>`: misma card (sello de fecha, pastilla EN VIVO, marca, autor, texto con clamp, botón), pero en lugar de una imagen muestra un **video de YouTube** (grabado o en vivo). El botón lleva a YouTube.

Web component nativo, vanilla JS + Shadow DOM, sin dependencias.

## Uso

```html
<script src="noticia-video-card.js"></script>

<!-- Video grabado -->
<noticia-video-card
  fecha="9 NOV"
  categoria="Parroquia"
  titular="Misa de Cristo Rey"
  autor-nombre="Parroquia San Luis Gonzaga"
  texto="Texto de la nota..."
  video="https://www.youtube.com/watch?v=XXXXXXXXXXX">
</noticia-video-card>

<!-- Transmisión en vivo de un canal (ID de canal, empieza con UC...) -->
<noticia-video-card
  fecha="9 NOV"
  titular="Misa en vivo"
  en-vivo="EN VIVO"
  canal="UCxxxxxxxxxxxxxxxxxxxxxx"
  poster="portada.jpg"
  texto="Seguí la misa desde tu casa.">
</noticia-video-card>

<!-- Un live puntual: se pasa como video (el link /live/ID también sirve) -->
<noticia-video-card
  en-vivo="EN VIVO"
  video="https://www.youtube.com/live/XXXXXXXXXXX"
  titular="Procesión"
  texto="...">
</noticia-video-card>
```

## Atributos nuevos

| Atributo | Descripción |
|---|---|
| `video` | URL de YouTube (`watch`, `youtu.be`, `shorts`, `live`, `embed`) o ID de 11 caracteres |
| `canal` | ID de canal (`UC...`) → muestra su transmisión en vivo actual. Se ignora si hay `video` |
| `poster` | Portada propia. Por defecto se usa la miniatura de YouTube |
| `formato` | `horizontal` / `vertical`. Auto: vertical si la URL es `/shorts/` |
| `autoplay` | (booleano) reproduce solo, silenciado, cuando la card entra en pantalla |
| `media-ancho` | Ancho de la columna del video en desktop (default `38%`) |

## Atributos heredados de `<noticia-card>` (sin cambios)

`fecha`, `categoria`, `titular`, `autor-nombre`, `autor-desc`, `autor-img`, `autor-link`, `texto`, `texto-mobile`, `en-vivo`, `fecha-fondo`, `fecha-color`, `marca`, `marca-alt`, `marca-ancho`, `ancho`, `boton-texto`, `fuente-nombre`, `fuente-url`, `fuente-logo`.

Diferencias de defaults en el botón: `boton-texto="Ver en"` + ícono + `YouTube`, y `fuente-url` apunta por defecto al video (`watch?v=`, `shorts/`) o a `youtube.com/channel/<canal>/live`. Todo se puede pisar con los atributos de siempre.

## Comportamiento

- **No carga el iframe hasta tocar play** (o hasta que aparece en pantalla con `autoplay`), así varias cards en la misma página no traban el sitio.
- **Desktop:** el video 16:9 va centrado sobre un fondo desenfocado de su portada, para que la columna alta y angosta se vea llena y sin recortes.
- **Mobile:** el video se apila arriba y ocupa exactamente su franja (ancho completo de la card, alto 16:9 justo), sin barras ni fondo. El resto del alto queda para el texto. Los videos verticales (Shorts) conservan una franja fija y se centran por alto.
- Mientras se reproduce, el sello de fecha y la marca se desvanecen (no tapan los controles de YouTube). La pastilla EN VIVO se queda.
- **Mobile, alto de la card:** es automático con tope en formato 9:16. Si el texto es corto, la card se ajusta a su contenido (sin espacio vacío abajo); si es largo, llega al 9:16 y el texto se corta con el degradé.
- Sin lightbox: el video tiene su propio botón de pantalla completa.
- Se eliminó el código muerto de "Ver más" (estaba deshabilitado en `<noticia-card>`).
- Las fuentes (Playfair Display + Inter) se cargan una sola vez, compartidas con `<noticia-card>`.
- Si cambiás `video`, `canal`, `poster` o `formato` por JS, el componente se actualiza solo.

## Importante al probar

YouTube exige que el embed reciba el *referrer* del sitio. **Si abrís el HTML con doble click (`file://`) el reproductor puede dar error (153).** Probalo desde un servidor, aunque sea local (`npx serve`, Live Server, etc.) o ya publicado.

Para `canal` hace falta el **ID de canal** (`UC...`), no el `@usuario`. Se encuentra en YouTube Studio → Configuración → Canal → Información avanzada.
