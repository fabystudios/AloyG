/**
 * <cartel-evento>
 * Web component nativo (vanilla JS, Shadow DOM) que encapsula el/los cartel(es)
 * de "Festejamos a San Francisco de Asís" + "Feria de Emprendedores".
 * Estilo, fuentes e íconos quedan encerrados en el Shadow DOM.
 *
 * CAPAS (de atrás hacia adelante), en las dos cards:
 *  1. fondo de color (degradé)
 *  2. guirnalda de banderines (img-bunting), pegada arriba
 *  3. contenido (halo/portada, títulos, subcards, footer)
 *
 * Layout fluido (CSS Grid + container queries): cada cartel es rectangular y
 * ocupa el máximo espacio disponible sin necesitar scroll ni JS de escalado.
 * - Desktop (>=769px de ventana): cartel apaisado ("a lo largo"), 1.7:1.
 * - Mobile (<=768px de ventana): cartel vertical ("a lo alto").
 * El switch para alternar entre los dos carteles se muestra siempre, arriba.
 *
 * SUBCARDS (3 en el poster principal, 2 en el de la feria) configurables por props:
 *   <id>-img        URL de imagen para el círculo (si no se pasa, usa el ícono/color por defecto)
 *   <id>-title      texto del título (si no se pasa, usa el default)
 *   <id>-text       texto de la descripción (si no se pasa, usa el default)
 *   <id>-body-img   URL de imagen que REEMPLAZA la descripción (<id>-text) de esa subcard.
 *                   El título (<id>-title) y la imagen circular (<id>-img) NO se ven afectados
 *                   por esto: se controlan aparte con los dos props de abajo.
 *   <id>-img-show   "false" oculta la imagen/ícono circular de la cabecera (default: visible)
 *   <id>-title-show "false" oculta el título de la cabecera (default: visible)
 *   <id> es: card1, card2, card3 (poster principal) | panel1, panel2 (feria)
 * panel2 además admite: panel2-price (default "$15.000")
 *
 * OTROS ATRIBUTOS
 * - poster            "main" | "feria"   (default "main") con cuál arranca
 * - img-santo         ruta de imagen     (default "san-francisco.png")
 * - img-santo-width   ancho del marco que contiene a img-santo (agranda/achica proporcional
 *                     según la forma), ej: "160px". Aplica a LOS DOS posters.
 * - img-santo-height  alto del marco que contiene a img-santo (mismo comportamiento que arriba)
 *                     (pasá SOLO uno de los dos para que escale proporcional; si pasás
 *                     los dos juntos, se usan tal cual y puede deformar el marco)
 * - img-santo-feria-top  ajuste fino vertical (CSS margin-top) del marco de img-santo
 *                     SOLO en la card de la feria, ej: "20px" (baja) o "-15px" (sube).
 *                     Por defecto está centrado respecto al título+bajada de esa card.
 * - marco-img-santo   "circle" | "square" | "rectangle"  (default "circle")
 *                     forma del marco que contiene a img-santo, en LOS DOS posters.
 *                     "square" es 1:1 con esquinas redondeadas, "rectangle" es 4:3.
 * - img-iglesia       ruta de imagen     (default "iglesia.png") aparece en el
 *                     footer de LOS DOS posters
 * - img-bunting       ruta de imagen     (default "banderines.png") guirnalda
 *                     superpuesta arriba, en LOS DOS posters, con balanceo animado
 * - main-title-img       URL de imagen que reemplaza el título del poster principal
 * - main-title-img-width  ancho de esa imagen (agranda/achica proporcionalmente), ej: "260px"
 * - main-title-img-height alto de esa imagen (agranda/achica proporcionalmente), ej: "90px"
 *                     (pasá SOLO uno de los dos para que escale proporcional; si pasás
 *                     los dos juntos, se usan tal cual y puede deformar la imagen)
 * - feria-title-img      URL de imagen que reemplaza el título del poster de la feria
 * - feria-title-img-width  ancho de esa imagen (mismo comportamiento que arriba)
 * - feria-title-img-height alto de esa imagen (mismo comportamiento que arriba)
 * - fecha-ppal        texto de la pastilla de fecha del poster principal
 *                     (default "Domingo 4 de Octubre"). fecha-ppal="" la oculta.
 * - fecha-feria       texto de la pastilla de fecha del poster de la feria
 *                     (default "Domingo 4 de Octubre"). fecha-feria="" la oculta.
 *                     Si se usa main-title-img / feria-title-img, la pastilla de fecha
 *                     correspondiente queda oculta automáticamente.
 * - whatsapp-number   solo dígitos, con código de país (default "5491153133638")
 * - whatsapp-display  texto mostrado en el botón (default "11 5313-3638")
 *
 * VARIABLE CSS
 * - --cartel-max-width   ancho máximo del componente (default: sin tope)
 *
 * EJEMPLO
 * <cartel-evento
 *   img-santo="/img/san-francisco.png"
 *   img-iglesia="/img/iglesia.png"
 *   img-bunting="/img/banderines.png"
 *   card2-img="/img/feria-emprendedores.png"
 *   panel1-title="¿Tenés un emprendimiento?"
 *   whatsapp-number="5491153133638">
 * </cartel-evento>
 */
(function () {
  if (customElements.get('cartel-evento')) return;

  const ICONS = {
    saint: `<svg viewBox="0 0 24 24" fill="none" stroke="#5a4326" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`,
    saintLight: `<svg viewBox="0 0 24 24" fill="none" stroke="#e3c27a" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`,
    chalice: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M6 3h12"/><path d="M7 3c0 4 1 7 5 7s5-3 5-7"/><path d="M12 10v7"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>`,
    stall: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/><path d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3"/><path d="M9 9c0 1.7 1.3 3 3 3s3-1.3 3-3"/><path d="M15 9c0 1.7 1.3 3 3 3s3-1.3 3-3"/></svg>`,
    food: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M4 12a8 4 0 0 1 16 0"/><path d="M2 17h20"/><path d="M2 21h20"/></svg>`,
    church: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbeedb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3"/><path d="M10.5 3.5h3"/><path d="M6 21V11L12 6l6 5v10"/><path d="M6 21h12"/><path d="M10 21v-5h4v5"/></svg>`,
    churchLight: `<svg viewBox="0 0 24 24" fill="none" stroke="#f1e6cd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3"/><path d="M10.5 3.5h3"/><path d="M6 21V11L12 6l6 5v10"/><path d="M6 21h12"/><path d="M10 21v-5h4v5"/></svg>`,
    hearts: `<svg viewBox="0 0 24 24" fill="none" stroke="#1a2716" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-9.3-8.8C1.4 9.4 2.6 6 6 6c2 0 3.3 1.1 4 2.2C10.7 7.1 12 6 14 6c3.4 0 4.6 3.4 3.3 6.2C15 16.5 12 21 12 21z"/></svg>`,
    coin: `<svg viewBox="0 0 24 24" fill="none" stroke="#1a2716" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.3c0 3 6 1.5 6 4.5 0 1.4-1.3 2.5-3 2.5s-3-1.1-3-2.5"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="#eafbe9"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.1a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20.1zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e3c27a" stroke-width="2" style="vertical-align:-3px"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    starGold: `<svg viewBox="0 0 24 24" fill="#d6a234"><path d="M12 1.5c.7 6.3 2.2 7.8 8.5 8.5-6.3.7-7.8 2.2-8.5 8.5-.7-6.3-2.2-7.8-8.5-8.5C9.8 9.3 11.3 7.8 12 1.5z"/></svg>`,
    starCream: `<svg viewBox="0 0 24 24" fill="#f1e6cd"><path d="M12 1.5c.7 6.3 2.2 7.8 8.5 8.5-6.3.7-7.8 2.2-8.5 8.5-.7-6.3-2.2-7.8-8.5-8.5C9.8 9.3 11.3 7.8 12 1.5z"/></svg>`
  };

  // Genera un campo de estrellitas destellantes esparcidas en posiciones
  // pseudo-aleatorias (pero deterministas, mismo resultado siempre) sobre todo el cartel.
  function starsField(count, iconSvg, seed) {
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    let html = '<div class="stars-field" aria-hidden="true">';
    for (let i = 0; i < count; i++) {
      const top = (rand() * 92 + 2).toFixed(1);
      const left = (rand() * 94 + 2).toFixed(1);
      const size = (9 + rand() * 15).toFixed(0);
      const delay = (rand() * 3.2).toFixed(2);
      const dur = (2.2 + rand() * 2.4).toFixed(2);
      html += `<span class="star" style="top:${top}%;left:${left}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s;">${iconSvg}</span>`;
    }
    html += '</div>';
    return html;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  const CARD_DEFS = [
    { id: 'card1', color: 'olive', icon: ICONS.chalice, title: 'Misa', text: 'Comenzamos juntos celebrando a nuestro querido San Francisco.', tag: '11:00 hs' },
    { id: 'card2', color: 'pink', icon: ICONS.stall, title: 'Feria & Bingo', text: 'Emprendedores y bingo familiar en el colegio, Calle 52 casi 8 · Acceso 2.', tag: '12:30 a 17:00 hs' },
    { id: 'card3', color: 'teal', icon: ICONS.food, title: 'Buffet', text: 'Habrá cosas ricas para comer durante toda la tarde.', tag: 'Todo el día' }
  ];
  const PANEL_DEFS = [
    { id: 'panel1', icon: ICONS.hearts, title: '¿Sos emprendedor?', text: 'Te invitamos a sumarte con tu propuesta a esta feria que nos une y nos fortalece.' },
    { id: 'panel2', icon: ICONS.coin, title: 'Inscripción', text: 'Valor único + un producto de tu emprendimiento para el bingo.', hasPrice: true, price: '$15.000' }
  ];
  const ALL_DEFS = [...CARD_DEFS, ...PANEL_DEFS];
  const SLOT_ATTR_SUFFIXES = ['img', 'title', 'text', 'body-img', 'body-img-mobile', 'img-show', 'title-show'];

  const TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      :host{
        display:block; width:100%; max-width:var(--cartel-max-width, none);
        font-family:'Sora',sans-serif;
        --cream:#f6ecd8; --cream-deep:#ecdcba; --ink:#33210f; --ink-soft:#5a4326;
        --terracotta:#c4552e; --terracotta-deep:#9c3f20; --gold:#d6a234; --gold-soft:#e8c877;
        --pink:#e14c81; --teal:#1e7d74; --olive:#5c7a34;
        --glass-fill:rgba(255,251,242,0.42); --glass-border:rgba(255,255,255,0.55);
        --shadow-light:rgba(255,255,255,0.85); --shadow-dark:rgba(150,114,66,0.38);
        --mkt-bg:#26361f; --mkt-bg-deep:#1a2716; --mkt-cream:#f1e6cd; --mkt-gold:#c99a3f;
        --mkt-gold-soft:#e3c27a; --mkt-glass:rgba(255,246,224,0.10); --mkt-glass-border:rgba(255,246,224,0.22);
        --mkt-shadow-light:rgba(255,255,255,0.05); --mkt-shadow-dark:rgba(0,0,0,0.5);
      }
      *{ box-sizing:border-box; }
      /* En mobile, sea cual sea --cartel-max-width (pensado para desktop),
         la card nunca ocupa más del 95% del ANCHO DE PANTALLA (viewport), no del
         contenedor donde esté embebida. El !important es necesario porque, por
         spec, los estilos de la página que envuelve el componente (por ej. un
         ancho fijo puesto en el elemento <cartel-evento> desde afuera) le ganan
         a las reglas :host normales de adentro del shadow DOM. */
      @media (max-width:768px){
        :host{ max-width:95vw !important; margin-left:auto !important; margin-right:auto !important; }
      }

      .switcher{ display:flex; gap:8px; margin-bottom:14px; }
      .switcher button{
        font-family:'Sora',sans-serif; font-weight:600; font-size:14px;
        padding:9px 18px; border-radius:999px; border:none; cursor:pointer;
        background:linear-gradient(145deg,#efe2c2,#d9c69e); color:#4a3620;
        box-shadow:5px 5px 10px rgba(150,114,66,0.35), -4px -4px 9px rgba(255,255,255,0.75);
      }
      .switcher button.active{
        background:linear-gradient(145deg,#c4552e,#a5431f); color:#fbeedb;
        box-shadow:inset 3px 3px 7px rgba(0,0,0,0.35), inset -3px -3px 7px rgba(255,140,90,0.25);
      }

      .frame{
        position:relative; width:100%;
        container-type:inline-size;
        border-radius:clamp(16px,2.4cqw,34px);
        overflow:hidden;
        box-shadow:0 20px 40px rgba(30,18,6,0.30), 0 6px 14px rgba(30,18,6,0.20);
      }
      /* En mobile la altura NO es fija: se alarga sola según el contenido
         (así el contenido nunca se aplasta si img-santo/título crecen).
         En desktop (>=769px) sí usamos una proporción fija, ver media query abajo. */
      .frame.hidden{ display:none; }
      @media (min-width:769px){ .frame{ aspect-ratio:1.55/1; } }

      /* -------- capas: 1) fondo  2) estrellas  3) banderines  4) contenido -------- */
      .frame-bg{ position:absolute; inset:0; z-index:0; }
      .bg-main{ background: radial-gradient(circle at 78% 8%, rgba(214,162,52,0.25), transparent 40%), linear-gradient(160deg,var(--cream) 0%, var(--cream-deep) 100%); }
      .bg-feria{ background: radial-gradient(circle at 15% 90%, rgba(201,154,63,0.20), transparent 45%), linear-gradient(165deg,var(--mkt-bg) 0%, var(--mkt-bg-deep) 100%); }

      .stars-field{ position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden; }
      .stars-field .star{ position:absolute; display:block; animation:star-twinkle 3s ease-in-out infinite; }
      .stars-field .star svg{ display:block; width:100%; height:100%; }
      @keyframes star-twinkle{ 0%,100%{ opacity:.18; transform:scale(.5) rotate(-8deg); } 50%{ opacity:1; transform:scale(1.05) rotate(8deg); } }

      .bunting-wrap{
        position:absolute; top:0; left:0; width:100%;
        z-index:1;
        pointer-events:none; overflow:visible;
        transform-origin:top center;
        animation:bunting-sway 6s ease-in-out infinite;
      }
      .bunting-wrap img{ display:block; width:100%; height:auto; }
      @keyframes bunting-sway{ 0%,100%{ transform:rotate(-0.6deg); } 50%{ transform:rotate(0.6deg); } }
      .bunting-fallback{ position:absolute; top:0; left:0; width:100%; height:clamp(20px,4cqw,52px); display:flex; justify-content:space-between; padding:0 clamp(10px,2cqw,26px); }
      .bunting-fallback[hidden]{ display:none; }
      .bunting-fallback span{ border-left:clamp(9px,1.5cqw,20px) solid transparent; border-right:clamp(9px,1.5cqw,20px) solid transparent; border-top:clamp(16px,2.8cqw,36px) solid var(--c); opacity:.85; }

      .poster{ position:relative; z-index:2; width:100%; height:100%; display:grid; background:transparent; }
      @media (max-width:768px){ .poster{ height:auto; } }

      /* ================= POSTER 1: EVENTO PRINCIPAL ================= */
      #poster-main{
        padding:3.2cqw 4cqw; gap:1.6cqw 3cqw;
        grid-template-columns:1fr;
        grid-template-rows:auto auto auto auto;
        grid-template-areas:"halo" "header" "cards" "footer";
      }
      @media (min-width:769px){
        #poster-main{
          grid-template-columns:30% 1fr;
          grid-template-rows:auto 1fr auto;
          grid-template-areas:"halo header" "halo cards" "footer footer";
        }
      }

      .halo-wrap{ grid-area:halo; position:relative; justify-self:center; align-self:center; width:clamp(110px,22cqw,240px); aspect-ratio:1/1; }
      .halo-wrap.shape-rectangle{ width:clamp(130px,26cqw,280px); aspect-ratio:4/3; }
      .halo-glow{ position:absolute; inset:-14%; border-radius:50%; background:radial-gradient(circle, rgba(230,190,90,0.65) 0%, rgba(230,190,90,0.0) 70%); filter:blur(2px); animation:pulse 4.5s ease-in-out infinite; }
      .halo-wrap.shape-square .halo-glow, .halo-wrap.shape-rectangle .halo-glow{ inset:-8%; border-radius:clamp(12px,2cqw,22px); }
      @keyframes pulse{ 0%,100%{ transform:scale(1); opacity:.9; } 50%{ transform:scale(1.08); opacity:1; } }
      .portrait-frame{ position:absolute; inset:0; border-radius:50%; background:linear-gradient(145deg,#f3e6c6,#dcc697); box-shadow:8px 8px 18px var(--shadow-dark), -6px -6px 16px var(--shadow-light); display:flex; align-items:center; justify-content:center; overflow:hidden; border:4px solid rgba(255,255,255,0.6); }
      .halo-wrap.shape-square .portrait-frame, .halo-wrap.shape-rectangle .portrait-frame{ border-radius:clamp(12px,2cqw,22px); }
      .portrait-frame img{ width:100%; height:100%; object-fit:contain; transform:scale(1.12) translateY(4%); }
      .fallback-icon{ width:56%; height:56%; opacity:.35; }
      .sparkle{ position:absolute; border-radius:50%; background:var(--gold-soft); animation:twinkle 3s ease-in-out infinite; }
      @keyframes twinkle{ 0%,100%{ opacity:.15; transform:scale(.7); } 50%{ opacity:1; transform:scale(1.15); } }

      .headline-block{ grid-area:header; align-self:center; text-align:center; }
      @media (min-width:769px){ .headline-block{ text-align:left; } }
      .eyebrow-hand{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:clamp(12px,1.9cqw,19px); color:var(--ink-soft); }
      .headline-block h1{ margin:.1em 0 0; font-family:'Fraunces',serif; font-weight:700; font-size:clamp(28px,6.4cqw,58px); line-height:1.05; color:var(--ink); }
      .headline-block h1 .accent1{ font-style:italic; font-weight:600; color:var(--terracotta-deep); }
      .headline-block h1 .accent2{ font-style:italic; font-weight:600; color:var(--olive); }
      .date-badge{ display:inline-flex; align-items:center; gap:8px; margin-top:clamp(6px,1.1cqw,14px); padding:clamp(6px,.9cqw,11px) clamp(12px,1.9cqw,22px); border-radius:14px; background:var(--glass-fill); border:1px solid var(--glass-border); backdrop-filter:blur(10px); box-shadow:4px 4px 10px var(--shadow-dark), -3px -3px 8px var(--shadow-light); }
      .date-badge[hidden]{ display:none; }
      .date-badge span{ font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(12px,1.6cqw,17px); letter-spacing:.3px; color:var(--ink); }

      /* -------- subcards (compartido por poster principal y feria) -------- */
      .info-row{ grid-area:cards; display:flex; gap:clamp(10px,1.6cqw,22px); min-height:0; }
      @media (max-width:768px){ .info-row{ flex-direction:column; } }
      .info-card{ flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:space-between; border-radius:clamp(14px,1.8cqw,24px); padding:clamp(12px,2cqw,24px); background:linear-gradient(150deg,#f7ecd6,#e7d6ac); box-shadow:8px 8px 18px var(--shadow-dark), -6px -6px 14px var(--shadow-light); overflow:hidden; }
      .info-card .top{ display:flex; flex-direction:column; gap:clamp(6px,1cqw,12px); min-height:0; flex:1; }
      .info-card .head{ display:flex; align-items:center; gap:clamp(8px,1.4cqw,16px); }
      .info-card .medal{ width:clamp(36px,5.6cqw,66px); height:clamp(36px,5.6cqw,66px); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:inset 3px 3px 7px rgba(0,0,0,0.18), inset -3px -3px 7px rgba(255,255,255,0.35); }
      .info-card .medal svg{ width:52%; height:52%; }
      .info-card .medal.img-medal{ overflow:hidden; box-shadow:none; }
      .info-card .medal.img-medal img{ width:100%; height:100%; object-fit:cover; }
      .info-card .medal.c-olive{ background:var(--olive); } .info-card .medal.c-pink{ background:var(--pink); } .info-card .medal.c-teal{ background:var(--teal); }
      .info-card h3{ margin:0; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(18px,2.8cqw,27px); color:var(--ink); }
      .info-card p{ margin:0; font-size:clamp(13px,1.9cqw,18px); line-height:1.38; color:var(--ink-soft); font-weight:600; letter-spacing:.1px; display:-webkit-box; -webkit-line-clamp:6; -webkit-box-orient:vertical; overflow:hidden; }
      .info-card .body-img{ flex:1; min-height:0; display:flex; }
      .info-card .body-img img{ display:none; width:100%; height:auto; max-height:clamp(110px,34cqw,240px); object-fit:contain; border-radius:10px; margin:auto; }
      @media (min-width:769px){ .info-card .body-img .bi-desktop{ display:block; } }
      @media (max-width:768px){ .info-card .body-img .bi-mobile{ display:block; } }
      .info-card .tag{ align-self:flex-start; flex-shrink:0; margin-top:clamp(6px,1.1cqw,14px); padding:clamp(5px,.8cqw,9px) clamp(10px,1.5cqw,16px); border-radius:12px; font-size:clamp(11px,1.4cqw,15px); font-weight:700; color:#fff; }
      .info-card .tag.c-olive{ background:var(--olive); } .info-card .tag.c-pink{ background:var(--pink); } .info-card .tag.c-teal{ background:var(--teal); }

      .footer-main{
        grid-area:footer; display:flex; align-items:center; justify-content:space-between; gap:10px;
        margin:0 -4cqw -3.2cqw -4cqw; padding:clamp(6px,1cqw,12px) 4cqw;
        background:linear-gradient(90deg,var(--terracotta) 0%, var(--terracotta-deep) 100%);
      }
      .footer-main .parish{ display:flex; align-items:center; gap:clamp(8px,1.3cqw,14px); min-width:0; }
      .footer-main .parish svg{ width:clamp(16px,2.4cqw,28px); height:clamp(16px,2.4cqw,28px); flex-shrink:0; }
      .footer-main .parish img{ width:clamp(34px,5.6cqw,72px); height:clamp(28px,4.6cqw,58px); object-fit:contain; flex-shrink:0; }
      .footer-main .parish h4{ margin:0; color:#fbeedb; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(11px,1.7cqw,15px); letter-spacing:.2px; }
      .footer-main .parish span{ color:#f3d9c2; font-size:clamp(8px,1.1cqw,11px); font-weight:500; }
      .footer-main .welcome{ flex-shrink:0; padding:clamp(4px,.8cqw,8px) clamp(9px,1.3cqw,14px); border-radius:999px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.3); color:#fff2df; font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:clamp(10px,1.4cqw,14px); white-space:nowrap; }

      /* ================= POSTER 2: FERIA DE EMPRENDEDORES ================= */
      #poster-feria{
        padding:3.2cqw 4cqw; gap:1.4cqw 3cqw;
        grid-template-columns:1fr;
        grid-template-rows:auto auto auto auto auto auto;
        grid-template-areas:"portrait" "top" "quote" "panels" "whatsapp" "footer";
      }
      @media (min-width:769px){
        #poster-feria{
          grid-template-columns:28% 1fr;
          grid-template-rows:auto auto 1fr auto auto;
          grid-template-areas:"portrait top" "portrait quote" "panels panels" "whatsapp whatsapp" "footer footer";
        }
      }

      .feria-top{ grid-area:top; align-self:center; text-align:center; }
      @media (min-width:769px){ .feria-top{ text-align:left; } }
      .feria-top .eyebrow-hand{ color:var(--mkt-gold-soft); font-size:clamp(13px,2.1cqw,19px); }
      .feria-top h1{ margin:.1em 0 0; font-family:'Fraunces',serif; font-weight:700; font-size:clamp(24px,5.2cqw,44px); color:var(--mkt-cream); letter-spacing:.1px; line-height:1.08; }
      .feria-top h1 span{ font-style:italic; font-weight:600; color:var(--mkt-gold-soft); }
      .main-title-img, .feria-title-img{ margin-bottom:clamp(4px,.8cqw,8px); }
      .main-title-img img, .feria-title-img img{ display:block; max-width:min(80%,320px); max-height:clamp(48px,12cqw,140px); width:auto; height:auto; object-fit:contain; margin:0 auto; }
      .main-title-img img.sized, .feria-title-img img.sized{ max-width:none; max-height:none; }
      @media (min-width:769px){ .main-title-img img, .feria-title-img img{ margin:0; } }
      .feria-date{ display:inline-flex; align-items:center; gap:8px; margin-top:clamp(5px,1cqw,12px); padding:clamp(5px,.8cqw,9px) clamp(10px,1.5cqw,17px); border-radius:12px; background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(10px); }
      .feria-date[hidden]{ display:none; }
      .feria-date span{ font-weight:700; font-size:clamp(11px,1.4cqw,15px); color:var(--mkt-cream); }

      .feria-portrait{ grid-area:portrait; justify-self:center; align-self:center; width:clamp(64px,12cqw,120px); aspect-ratio:1/1; border-radius:50%; background:linear-gradient(150deg,#3a4d2f,#233318); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); border:3px solid rgba(255,246,224,0.18); display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .feria-portrait.shape-rectangle{ width:clamp(78px,15cqw,150px); aspect-ratio:4/3; }
      .feria-portrait.shape-square, .feria-portrait.shape-rectangle{ border-radius:clamp(8px,1.4cqw,16px); }
      .feria-portrait img{ width:100%; height:100%; object-fit:contain; transform:scale(1.15) translateY(3%); }

      .feria-quote{ grid-area:quote; align-self:center; text-align:center; font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:clamp(12px,1.7cqw,19px); line-height:1.3; color:var(--mkt-cream); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
      @media (min-width:769px){ .feria-quote{ text-align:left; } }
      .feria-quote b{ color:var(--mkt-gold-soft); font-weight:600; }

      .feria-panels{ grid-area:panels; display:flex; gap:clamp(10px,1.4cqw,20px); min-height:0; }
      @media (max-width:768px){ .feria-panels{ flex-direction:column; } }
      .feria-panel{ flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:center; border-radius:clamp(14px,1.8cqw,22px); padding:clamp(10px,1.8cqw,22px); background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(8px); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); overflow:hidden; }
      .feria-panel .top{ display:flex; flex-direction:column; gap:clamp(4px,.8cqw,10px); flex:1; min-height:0; }
      .feria-panel .head{ display:flex; align-items:center; gap:clamp(6px,1.1cqw,12px); }
      .feria-panel .medal{ width:clamp(30px,4.6cqw,58px); height:clamp(30px,4.6cqw,58px); border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--mkt-gold); flex-shrink:0; box-shadow:inset 3px 3px 6px rgba(0,0,0,0.25), inset -3px -3px 6px rgba(255,255,255,0.2); }
      .feria-panel .medal svg{ width:50%; height:50%; }
      .feria-panel .medal.img-medal{ overflow:hidden; box-shadow:none; background:none; }
      .feria-panel .medal.img-medal img{ width:100%; height:100%; object-fit:cover; }
      .feria-panel h3{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(16px,2.4cqw,24px); }
      .feria-panel p{ margin:0; color:#e4dcc4; font-size:clamp(12px,1.8cqw,16px); line-height:1.4; font-weight:600; letter-spacing:.1px; display:-webkit-box; -webkit-line-clamp:6; -webkit-box-orient:vertical; overflow:hidden; }
      .feria-panel .body-img{ flex:1; min-height:0; display:flex; }
      .feria-panel .body-img img{ display:none; width:100%; height:auto; max-height:clamp(100px,30cqw,220px); object-fit:contain; border-radius:10px; margin:auto; }
      @media (min-width:769px){ .feria-panel .body-img .bi-desktop{ display:block; } }
      @media (max-width:768px){ .feria-panel .body-img .bi-mobile{ display:block; } }
      .feria-panel .price{ font-family:'Fraunces',serif; font-weight:700; font-size:clamp(17px,2.8cqw,27px); color:var(--mkt-gold-soft); }

      .whatsapp-chip{ grid-area:whatsapp; display:flex; align-items:center; justify-content:center; gap:clamp(7px,1.2cqw,12px); padding:clamp(7px,1.2cqw,14px) clamp(10px,1.6cqw,18px); border-radius:clamp(12px,1.6cqw,16px); background:linear-gradient(150deg,#2e5c33,#1f4025); box-shadow:6px 6px 14px var(--mkt-shadow-dark), -4px -4px 10px rgba(255,255,255,0.06); flex-wrap:wrap; text-decoration:none; cursor:pointer; transition:transform .15s ease; }
      .whatsapp-chip:hover{ transform:translateY(-2px); }
      .whatsapp-chip:active{ transform:translateY(0); }
      .whatsapp-chip svg{ width:clamp(15px,2.2cqw,24px); height:clamp(15px,2.2cqw,24px); }
      .whatsapp-chip .wa-text{ color:#eafbe9; font-weight:600; font-size:clamp(10px,1.3cqw,13px); }
      .whatsapp-chip .wa-num{ color:#fff; font-weight:800; font-size:clamp(12px,1.8cqw,18px); letter-spacing:.2px; font-family:'Sora',sans-serif; }

      .footer-feria{
        grid-area:footer; display:flex; align-items:center; justify-content:space-between; gap:10px;
        margin:0 -4cqw -3.2cqw -4cqw; padding:clamp(6px,1cqw,10px) 4cqw;
        background:rgba(0,0,0,0.24); border-top:1px solid rgba(255,246,224,0.12);
      }
      .footer-feria .parish{ display:flex; align-items:center; gap:clamp(6px,1cqw,12px); min-width:0; }
      .footer-feria .parish svg{ width:clamp(14px,2.2cqw,26px); height:clamp(14px,2.2cqw,26px); flex-shrink:0; }
      .footer-feria .parish img{ width:clamp(26px,4.6cqw,60px); height:clamp(20px,3.6cqw,48px); object-fit:contain; flex-shrink:0; }
      .footer-feria .parish h4{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(10px,1.5cqw,14px); }
      .footer-feria .parish span{ color:#c9c0a6; font-size:clamp(8px,1cqw,10px); }
      .footer-feria .addr{ flex-shrink:0; color:var(--mkt-gold-soft); font-weight:700; font-size:clamp(9px,1.2cqw,11px); display:flex; align-items:center; gap:6px; white-space:nowrap; }
    </style>

    <div class="switcher" id="switcher">
      <button type="button" id="tab-main" data-target="main">Evento principal</button>
      <button type="button" id="tab-feria" data-target="feria">Feria de emprendedores</button>
    </div>

    <div class="frames" id="frames">
      <div class="frame" id="frame-main">
        <div class="frame-bg bg-main"></div>
        ${starsField(16, ICONS.starGold, 7)}
        <div class="bunting-wrap" id="bunting-wrap-main">
          <img id="img-bunting-main" alt="">
          <div class="bunting-fallback" id="bunting-fallback-main" hidden>
            <span style="--c:#e14c81"></span><span style="--c:#d6a234"></span><span style="--c:#1e7d74"></span>
            <span style="--c:#c4552e"></span><span style="--c:#5c7a34"></span><span style="--c:#d6a234"></span>
            <span style="--c:#e14c81"></span><span style="--c:#1e7d74"></span><span style="--c:#c4552e"></span>
            <span style="--c:#5c7a34"></span><span style="--c:#d6a234"></span><span style="--c:#e14c81"></span>
          </div>
        </div>
        <div id="poster-main" class="poster">
          <div class="halo-wrap">
            <div class="halo-glow"></div>
            <div class="portrait-frame"><img id="img-santo-main" alt="San Francisco de Asís"></div>
            <div class="sparkle" style="width:6%;height:6%; top:-4%; left:14%; animation-delay:.2s;"></div>
            <div class="sparkle" style="width:9%;height:9%; top:20%; left:-8%; animation-delay:1.1s;"></div>
            <div class="sparkle" style="width:5%;height:5%; bottom:-2%; right:-4%; animation-delay:1.9s;"></div>
            <div class="sparkle" style="width:4%;height:4%; top:6%; right:6%; animation-delay:.7s;"></div>
            <div class="sparkle" style="width:7%;height:7%; bottom:8%; left:-4%; animation-delay:2.4s;"></div>
            <div class="sparkle" style="width:5%;height:5%; top:46%; left:-10%; animation-delay:1.6s;"></div>
            <div class="sparkle" style="width:4%;height:4%; bottom:-4%; right:18%; animation-delay:.4s;"></div>
          </div>
          <div class="headline-block">
            <div id="main-title-zone"></div>
            <div class="date-badge" id="main-date-badge"><span>Domingo 4 de Octubre</span></div>
          </div>
          <div class="info-row">
            <div class="info-card" id="slot-card1"></div>
            <div class="info-card" id="slot-card2"></div>
            <div class="info-card" id="slot-card3"></div>
          </div>
          <div class="footer-main">
            <div class="parish"><img id="img-iglesia-main" alt=""><div><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
            <div class="welcome">¡Te esperamos!</div>
          </div>
        </div>
      </div>

      <div class="frame hidden" id="frame-feria">
        <div class="frame-bg bg-feria"></div>
        ${starsField(16, ICONS.starCream, 42)}
        <div class="bunting-wrap" id="bunting-wrap-feria">
          <img id="img-bunting-feria" alt="">
          <div class="bunting-fallback" id="bunting-fallback-feria" hidden>
            <span style="--c:#e14c81"></span><span style="--c:#d6a234"></span><span style="--c:#1e7d74"></span>
            <span style="--c:#c4552e"></span><span style="--c:#5c7a34"></span><span style="--c:#d6a234"></span>
            <span style="--c:#e14c81"></span><span style="--c:#1e7d74"></span><span style="--c:#c4552e"></span>
            <span style="--c:#5c7a34"></span><span style="--c:#d6a234"></span><span style="--c:#e14c81"></span>
          </div>
        </div>
        <div id="poster-feria" class="poster">
          <div class="feria-portrait"><img id="img-santo-feria" alt="San Francisco de Asís"></div>
          <div class="feria-top">
            <div id="feria-title-zone"></div>
            <div class="feria-date" id="feria-date-badge"><span>Domingo 4 de Octubre</span></div>
          </div>
          <div class="feria-quote"><b>¡Tu emprendimiento puede inspirar y transformar!</b> Un espacio para compartir tus productos, mostrar tu talento y hacer crecer tus sueños. Todos somos comunidad.</div>
          <div class="feria-panels">
            <div class="feria-panel" id="slot-panel1"></div>
            <div class="feria-panel" id="slot-panel2"></div>
          </div>
          <a class="whatsapp-chip" id="whatsapp-btn" target="_blank" rel="noopener noreferrer">${ICONS.whatsapp}<span class="wa-text">Comunicate con Nancy</span><span class="wa-num" id="wa-num"></span></a>
          <div class="footer-feria">
            <div class="parish"><img id="img-iglesia-feria" alt=""><div><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
            <div class="addr">${ICONS.pin} Calle 8 / 52 y 53</div>
          </div>
        </div>
      </div>
    </div>
  `;

  class CartelEvento extends HTMLElement {
    static get observedAttributes() {
      return [
        'poster', 'img-santo', 'img-santo-width', 'img-santo-height', 'img-santo-feria-top', 'marco-img-santo', 'img-iglesia', 'img-bunting',
        'whatsapp-number', 'whatsapp-display', 'panel2-price', 'panel2_price',
        'feria-title', 'feria-eyebrow', 'feria-title-img', 'feria-title-img-width', 'feria-title-img-height',
        'main-title-img', 'main-title-img-width', 'main-title-img-height',
        'fecha-ppal', 'fecha-feria',
        ...ALL_DEFS.flatMap(def => SLOT_ATTR_SUFFIXES.flatMap(suf => [`${def.id}-${suf}`, `${def.id}_${suf}`]))
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      if (!this._rendered) {
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this._rendered = true;
        this._wire();
      }
      this._applyImages();
      this._applyPortraitShape();
      this._applyPortraitSize();
      this._applyPoster();
      this._applyWhatsapp();
      this._renderSlots();
      this._renderFeriaTitle();
      this._renderMainTitle();
    }

    attributeChangedCallback() {
      if (!this._rendered) return;
      this._applyImages();
      this._applyPortraitShape();
      this._applyPortraitSize();
      this._applyPoster();
      this._applyWhatsapp();
      this._renderSlots();
      this._renderFeriaTitle();
      this._renderMainTitle();
    }

    _wire() {
      const root = this.shadowRoot;
      root.getElementById('tab-main').addEventListener('click', () => this.setAttribute('poster', 'main'));
      root.getElementById('tab-feria').addEventListener('click', () => this.setAttribute('poster', 'feria'));

      const iconSaintImg = root.getElementById('img-santo-main');
      const iconSaintFeria = root.getElementById('img-santo-feria');
      iconSaintImg.addEventListener('error', () => {
        iconSaintImg.replaceWith(Object.assign(document.createElement('div'), { className: 'fallback-icon', innerHTML: ICONS.saint }));
      });
      iconSaintFeria.addEventListener('error', () => {
        iconSaintFeria.replaceWith(Object.assign(document.createElement('div'), { className: 'fallback-icon', innerHTML: ICONS.saintLight }));
      });

      root.getElementById('img-iglesia-main').addEventListener('error', function () {
        this.replaceWith(Object.assign(document.createElement('span'), { innerHTML: ICONS.church }).firstChild);
      });
      root.getElementById('img-iglesia-feria').addEventListener('error', function () {
        this.replaceWith(Object.assign(document.createElement('span'), { innerHTML: ICONS.churchLight }).firstChild);
      });

      root.getElementById('img-bunting-main').addEventListener('error', () => {
        root.getElementById('img-bunting-main').hidden = true;
        root.getElementById('bunting-fallback-main').hidden = false;
      });
      root.getElementById('img-bunting-feria').addEventListener('error', () => {
        root.getElementById('img-bunting-feria').hidden = true;
        root.getElementById('bunting-fallback-feria').hidden = false;
      });
    }

    // Usa esto (en vez de root.getElementById(id).src = ...) porque si esa imagen
    // ya falló una vez, el handler de 'error' en _wire() la reemplaza (replaceWith)
    // por un ícono de fallback y el <img> con ese id deja de existir en el DOM.
    // Sin este chequeo, getElementById(id) da null y "null.src = ..." tira una
    // excepción que corta en seco el resto de attributeChangedCallback (¡incluido
    // _applyPoster()!), rompiendo el switcher main/feria de ahí en adelante.
    _setSrcSafe(id, src) {
      const el = this.shadowRoot.getElementById(id);
      if (el) el.src = src;
    }

    _applyImages() {
      const santo = this.getAttribute('img-santo') || 'san-francisco.png';
      const iglesia = this.getAttribute('img-iglesia') || 'iglesia.png';
      const bunting = this.getAttribute('img-bunting') || 'banderines.png';
      this._setSrcSafe('img-santo-main', santo);
      this._setSrcSafe('img-santo-feria', santo);
      this._setSrcSafe('img-iglesia-main', iglesia);
      this._setSrcSafe('img-iglesia-feria', iglesia);
      this._setSrcSafe('img-bunting-main', bunting);
      this._setSrcSafe('img-bunting-feria', bunting);
    }

    _applyPortraitShape() {
      const root = this.shadowRoot;
      const raw = this.getAttribute('marco-img-santo');
      const shape = raw === 'rectangle' ? 'shape-rectangle' : raw === 'square' ? 'shape-square' : 'shape-circle';
      const targets = [root.querySelector('.halo-wrap'), root.querySelector('.feria-portrait')];
      targets.forEach(el => {
        if (!el) return;
        el.classList.remove('shape-circle', 'shape-square', 'shape-rectangle');
        el.classList.add(shape);
      });
    }

    // img-santo-width / img-santo-height: si se pasa uno solo, el otro queda "auto"
    // y el aspect-ratio del marco (según su forma) escala el otro lado proporcional.
    // Si se pasan los dos, se usan tal cual (puede deformar el marco).
    _applyPortraitSize() {
      const root = this.shadowRoot;
      const w = this.getAttribute('img-santo-width');
      const h = this.getAttribute('img-santo-height');
      const targets = [root.querySelector('.halo-wrap'), root.querySelector('.feria-portrait')];
      targets.forEach(el => {
        if (!el) return;
        if (!w && !h) { el.style.width = ''; el.style.height = ''; return; }
        el.style.width = w || 'auto';
        el.style.height = h || 'auto';
      });
      const feriaTop = this.getAttribute('img-santo-feria-top');
      const feriaEl = root.querySelector('.feria-portrait');
      if (feriaEl) feriaEl.style.marginTop = feriaTop || '';
    }

    _applyPoster() {
      const which = this.getAttribute('poster') === 'feria' ? 'feria' : 'main';
      const root = this.shadowRoot;
      root.getElementById('frame-main').classList.toggle('hidden', which !== 'main');
      root.getElementById('frame-feria').classList.toggle('hidden', which !== 'feria');
      root.getElementById('tab-main').classList.toggle('active', which === 'main');
      root.getElementById('tab-feria').classList.toggle('active', which === 'feria');
    }

    _applyWhatsapp() {
      const root = this.shadowRoot;
      const number = (this.getAttribute('whatsapp-number') || '5491153133638').replace(/[^\d]/g, '');
      const display = this.getAttribute('whatsapp-display') || '11 5313-3638';
      const btn = root.getElementById('whatsapp-btn');
      btn.href = `https://wa.me/${number}`;
      root.getElementById('wa-num').textContent = display;
    }

    _slotAttr(id, suffix) {
      return this.getAttribute(`${id}-${suffix}`) ?? this.getAttribute(`${id}_${suffix}`);
    }

    _slotBoolAttr(id, suffix, defaultValue) {
      const v = this._slotAttr(id, suffix);
      if (v === null || v === undefined) return defaultValue;
      return v !== 'false' && v !== '0';
    }

    _renderSlots() {
      const root = this.shadowRoot;
      ALL_DEFS.forEach(def => {
        const el = root.getElementById(`slot-${def.id}`);
        if (el) el.innerHTML = this._renderSlotHtml(def);
      });
    }

    _applyDateBadge(badge, attrName, defaultText, forceHide) {
      if (!badge) return;
      if (forceHide) { badge.hidden = true; return; }
      const val = this.getAttribute(attrName);
      const text = val === null ? defaultText : val;
      if (text === '') { badge.hidden = true; return; }
      badge.hidden = false;
      const span = badge.querySelector('span');
      if (span) span.textContent = text;
    }

    // Arma el atributo class + style para <img> del título, a partir de -width / -height.
    // Si se pasa uno solo, el otro queda en "auto" y escala proporcional.
    // Si se pasan los dos, se usan tal cual (puede deformar la imagen).
    _titleImgAttrs(prefix) {
      const w = this.getAttribute(`${prefix}-width`);
      const h = this.getAttribute(`${prefix}-height`);
      if (!w && !h) return '';
      const decls = ['max-width:none', 'max-height:none'];
      decls.push(`width:${w ? esc(w) : 'auto'}`);
      decls.push(`height:${h ? esc(h) : 'auto'}`);
      return ` class="sized" style="${decls.join(';')}"`;
    }

    _renderMainTitle() {
      const zone = this.shadowRoot.getElementById('main-title-zone');
      const dateBadge = this.shadowRoot.getElementById('main-date-badge');
      if (!zone) return;
      const imgUrl = this.getAttribute('main-title-img');
      if (imgUrl) {
        const sizeAttrs = this._titleImgAttrs('main-title-img');
        zone.innerHTML = `<div class="main-title-img"><img src="${esc(imgUrl)}" alt="Festejamos a San Francisco de Asís"${sizeAttrs}></div>`;
      } else {
        zone.innerHTML = `<div class="eyebrow-hand">Festejamos a</div><h1><span class="accent1">San Francisco</span> <span class="accent2">de Asís</span></h1>`;
      }
      this._applyDateBadge(dateBadge, 'fecha-ppal', 'Domingo 4 de Octubre', !!imgUrl);
    }

    _renderFeriaTitle() {
      const zone = this.shadowRoot.getElementById('feria-title-zone');
      const dateBadge = this.shadowRoot.getElementById('feria-date-badge');
      if (!zone) return;
      const imgUrl = this.getAttribute('feria-title-img');
      if (imgUrl) {
        const sizeAttrs = this._titleImgAttrs('feria-title-img');
        zone.innerHTML = `<div class="feria-title-img"><img src="${esc(imgUrl)}" alt="Feria de Emprendedores"${sizeAttrs}></div>`;
      } else {
        const eyebrow = this.getAttribute('feria-eyebrow') || 'Feria de';
        const title = this.getAttribute('feria-title') || 'Emprendedores';
        zone.innerHTML = `<div class="eyebrow-hand">${esc(eyebrow)}</div><h1>${esc(title)}</h1>`;
      }
      this._applyDateBadge(dateBadge, 'fecha-feria', 'Domingo 4 de Octubre', !!imgUrl);
    }

    _renderSlotHtml(def) {
      const imgUrl = this._slotAttr(def.id, 'img');
      const bodyImgUrl = this._slotAttr(def.id, 'body-img');
      const bodyImgMobileUrl = this._slotAttr(def.id, 'body-img-mobile') || bodyImgUrl;
      const title = this._slotAttr(def.id, 'title') || def.title;
      const text = this._slotAttr(def.id, 'text') || def.text;
      const price = def.hasPrice ? (this.getAttribute('panel2-price') || this.getAttribute('panel2_price') || def.price) : null;
      const colorClass = def.color ? ` c-${def.color}` : '';

      // img-show / title-show controlan la cabecera (medallón + título) de forma
      // independiente. body-img solo reemplaza el texto/descripción (id-text).
      const showImg = this._slotBoolAttr(def.id, 'img-show', true);
      const showTitle = this._slotBoolAttr(def.id, 'title-show', true);

      let headHtml = '';
      if (showImg || showTitle) {
        const medal = !showImg ? '' : (imgUrl
          ? `<div class="medal img-medal"><img src="${esc(imgUrl)}" alt=""></div>`
          : `<div class="medal${colorClass}">${def.icon}</div>`);
        const titleHtml = showTitle ? `<h3>${esc(title)}</h3>` : '';
        headHtml = `<div class="head">${medal}${titleHtml}</div>`;
      }

      const bodyHtml = bodyImgUrl
        ? `<div class="body-img"><img class="bi-desktop" src="${esc(bodyImgUrl)}" alt=""><img class="bi-mobile" src="${esc(bodyImgMobileUrl)}" alt=""></div>`
        : `<p>${esc(text)}</p>`;

      const topHtml = headHtml
        + (price ? `<div class="price">${esc(price)}</div>` : '')
        + bodyHtml;
      const tagHtml = def.tag ? `<span class="tag${colorClass}">${esc(def.tag)}</span>` : '';
      return `<div class="top">${topHtml}</div>${tagHtml}`;
    }
  }

  customElements.define('cartel-evento', CartelEvento);
})();
