# Tema Cuaresma — Backup de colores

> Guardado el: 5 de abril de 2026 (Domingo de Resurrección)  
> Aplica a: `index.html` + `style.css` — Header y Footer

---

## HEADER (`<section class="cabecera">` + `<nav>`)

| Elemento | Color/Valor Cuaresma |
|---|---|
| `section.cabecera` background (inline) | `background-color: #502A63` |
| Clase del navbar | `navbar-dark` |
| Logo imagen | `medalla_cuaresma.png` |
| Botón flotante imagen | `cua-flot.png` |
| Subtítulo "Villa Elisa..." (mobile) | `color: #e8d5f5 !important` |
| Subtítulo "Villa Elisa..." (desktop) | `color: #e8d5f5 !important` |
| Badge-dot box-shadow | `box-shadow: 0 0 0 2px #502A63` |
| Nav links color | `color: #ffffff !important` |
| Nav links hover | `color: #C4A764 !important` |

---

## FOOTER (`<footer id="footer">`)

| Elemento | Color/Valor Cuaresma |
|---|---|
| Clases Bootstrap del footer | `text-light` (sin `bg-dark`) |
| Background inline | `style="background: #502A63;"` |

---

## style.css

| Selector | Valor Cuaresma |
|---|---|
| `.navbar` | `background-color: #502A63 !important` |

---

## Cómo aplicar tema Cuaresma

En `index.html`:

1. **Sección cabecera** → `background-color: #502A63`
2. **Logo** → `medalla_cuaresma.png`
3. **Botón flotante** → `cua-flot.png`
4. **Subtítulo mobile** → `color: #e8d5f5 !important`
5. **Subtítulo desktop** → `color: #e8d5f5 !important`
6. **Badge-dot** → `box-shadow: 0 0 0 2px #502A63`
7. **Nav link hover** → agregar `.navbar-nav .nav-link:hover { color: #C4A764 !important; }`
8. **Footer** → `class="footer text-light py-5 text-center" style="background: #502A63;"`

En `style.css`:

9. `.navbar` → `background-color: #502A63 !important`
