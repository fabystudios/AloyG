# Sistema de Carrusel Automatizado

## 📋 Descripción

Sistema automatizado para gestionar el carrusel principal del sitio. Lee las slides desde un archivo JSON y las ordena según configuración, permitiendo posiciones fijas o aleatorias.

## 🚀 Características

- ✅ **Gestión desde JSON**: Todas las slides se definen en `carousel-slides.json`
- 🎯 **Posiciones fijas**: Define el orden exacto con `position: 1, 2, 3...`
- 🎲 **Posiciones aleatorias**: Usa `position: 0` para ubicación aleatoria
- 🎬 **Soporte de videos**: Videos responsive con posters
- 📱 **Responsive**: Diferentes archivos para desktop y mobile
- ⚡ **Alta performance**: Ordena en memoria antes de renderizar

## 📁 Archivos

- **`carousel-slides.json`**: Configuración de todas las slides
- **`carousel-loader.js`**: Script que carga y renderiza el carrusel
- **`index.html`**: Incluye el script y contenedor del carrusel

## 🎯 Uso

### Estructura del JSON

```json
{
  "id": "identificador-unico",
  "position": 1,           // 0 = aleatorio, 1+ = posición fija
  "hasVideo": true,        // true si es video, false si es imagen
  "link": "#seccion",      // Link al hacer clic
  "desktop": {
    "type": "video",
    "src": "./video/archivo-desktop.mp4",
    "poster": "./slides/poster-desktop.jpg"
  },
  "mobile": {
    "type": "video",
    "src": "./video/archivo-mobile.mp4",
    "poster": "./slides/poster-mobile.jpg"
  }
}
```

### Ejemplos de configuración

#### Slide en primera posición (fija)
```json
{
  "id": "rifa2",
  "position": 1,  // ← Siempre aparecerá primero
  "hasVideo": true,
  "link": "#rifa",
  ...
}
```

#### Slide en posición aleatoria
```json
{
  "id": "misas",
  "position": 0,  // ← Aparecerá en posición aleatoria
  "hasVideo": true,
  "link": "#MISAS",
  ...
}
```

#### Combinación de fijas y aleatorias
```json
[
  { "id": "rifa2", "position": 1 },      // Posición 1 (fija)
  { "id": "misas", "position": 0 },      // Aleatoria
  { "id": "adoracion", "position": 0 },  // Aleatoria
  { "id": "banner1", "position": 3 },    // Posición 3 (fija)
  ...
]
```

**Resultado posible**: Rifa (1) → Adoración (aleatorio) → Banner1 (3) → Misas (aleatorio) → ...

## ⚙️ Cómo funciona

1. **Carga**: Al cargar la página, `carousel-loader.js` lee `carousel-slides.json`
2. **Ordenamiento**: 
   - Separa slides con `position > 0` (fijas) y `position === 0` (aleatorias)
   - Mezcla las aleatorias usando algoritmo Fisher-Yates
   - Inserta las fijas en sus posiciones específicas
   - Rellena huecos con slides aleatorias
3. **Renderizado**: Genera el HTML dinámicamente e inserta en el carrusel
4. **Inicialización**: Activa Bootstrap Carousel y manejo de videos

## 🎬 Manejo de Videos

El sistema incluye:
- Auto-play y loop de videos
- Pausa automática al cambiar de slide
- Reproducción automática del slide activo
- Preload del siguiente slide para transiciones suaves
- Soporte para posters como placeholder

## 📊 Performance

**¿Es performante?** 

✅ **SÍ**, porque:
- El ordenamiento ocurre **una sola vez** al cargar la página (operación O(n))
- Fisher-Yates shuffle es eficiente: O(n)
- No hay reordenamiento durante la navegación
- Los videos usan `preload="auto"` solo cuando es necesario
- El DOM se construye una vez, no se regenera

**Impacto**: < 10ms para 10-20 slides en dispositivos modernos.

## 🔧 Modificar el carrusel

### Agregar una nueva slide

Edita `carousel-slides.json` y agrega:

```json
{
  "id": "nueva-slide",
  "position": 0,  // o la posición que quieras
  "hasVideo": true,
  "link": "#nueva-seccion",
  "desktop": {
    "type": "video",
    "src": "./video/nueva-desktop.mp4",
    "poster": "./slides/nueva-desktop.jpg"
  },
  "mobile": {
    "type": "video",
    "src": "./video/nueva-mobile.mp4",
    "poster": "./slides/nueva-mobile.jpg"
  }
}
```

### Cambiar orden

Modifica el valor `position`:
- `0`: Posición aleatoria
- `1, 2, 3...`: Posición fija

### Fijar una slide en segunda posición

```json
{
  "id": "mi-slide",
  "position": 2,  // ← Cambia de 0 a 2
  ...
}
```

## 🐛 Debug

El script muestra en consola:
```
✅ Carrusel cargado: 9 slides (1 fijos, 8 aleatorios)
```

Si hay errores:
```
❌ Error al cargar el carrusel: [detalles del error]
```

## 💡 Ventajas del sistema

1. **Mantenibilidad**: Cambios en JSON, no en HTML
2. **Flexibilidad**: Mezcla de orden fijo y aleatorio
3. **Escalabilidad**: Fácil agregar/quitar slides
4. **Performance**: Ordenamiento eficiente
5. **Centralizado**: Una fuente de verdad (JSON)

## 📝 Notas

- Las posiciones fijas no necesitan ser consecutivas (puedes usar 1, 3, 5...)
- Si usas `position: 2` sin tener `position: 1`, el 2 será el primero
- Todos los slides pueden tener `position: 0` (100% aleatorio)
- Todos los slides pueden tener posiciones fijas (sin aleatoriedad)
