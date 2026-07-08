# Tema: Original Plano — Backup

> Guardado el: 5 de abril de 2026  
> Tema azul plano, sin gradientes en header  
> Aplicar a: `index.html` + `style.css` — Header y Footer

---

## HEADER (`<section class="cabecera">` + `<nav>`)

| Elemento | Color/Valor original |
|---|---|
| `section.cabecera` background (inline) | `background-color: #0d6efd` |
| Clase del navbar | `navbar-dark` (Bootstrap → texto blanco) |
| Subtítulo "Villa Elisa..." (mobile) | `color: #b8dbf7 !important` |
| Subtítulo "Villa Elisa..." (desktop) | `color: #b8dbf7 !important` |
| Badge-dot box-shadow | `box-shadow: 0 0 0 2px #0d6efd` |
| Nav links color | blanco `#ffffff` (heredado de `navbar-dark`) |
| Nav links hover | blanco/Bootstrap default |

---

## FOOTER (`<footer id="footer">`)

| Elemento | Color/Valor original |
|---|---|
| Clases Bootstrap del footer | `bg-dark text-light` |
| Background CSS (`.footer` en style.css) | `linear-gradient(135deg, #2a7fe0, #3700b3)` |
| Bootstrap `bg-dark` override | `background-color: #212529 !important` |
| `.footer-link` color (style.css) | `#ffcc00` |
| `.footer-link:hover` color (style.css) | `#ffc107` |
| `.social-link:hover` color (style.css) | `var(--acento-color-ligth)` = `#ff6f0073` |

---

## Cómo restaurar

En `index.html`, revertir los siguientes cambios:

1. **Sección cabecera** (buscar `background-color: #F5F1E9`):
   ```html
   <section class="cabecera" style="background-color: #0d6efd; ...">
   ```

2. **Navbar** (buscar `navbar-light`):
   ```html
   <nav class="navbar navbar-expand-lg navbar-dark shadow" ...>
   ```

3. **Subtítulo mobile** (buscar `color: #502A63`):
   ```html
   style="font-size: 0.7rem; padding-top: .3em; color: #b8dbf7 !important; display: block;"
   ```

4. **Subtítulo desktop** (buscar el segundo `color: #502A63`):
   ```html
   style="font-size: 0.985rem; padding-top: .3em; color: #b8dbf7 !important;"
   ```

5. **Badge-dot** (en el `<style>` inline del navbar):
   ```css
   box-shadow: 0 0 0 2px #0d6efd;
   ```

6. **Nav links** — eliminar las líneas de color añadidas por Cuaresma:
   ```css
   /* Eliminar estas líneas del bloque <style> del navbar: */
   color: #502A63 !important;
   /* y el bloque completo: */
   .navbar-nav .nav-link:hover { color: #C4A764 !important; }
   ```

7. **Footer** (buscar `background: #502A63`):
   ```html
   <footer id="footer" class="footer bg-dark text-light py-5 text-center">
   ```
   (restaurar clases `bg-dark text-light` y quitar el `style` inline)
