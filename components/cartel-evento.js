/**
 * <cartel-evento>
 * Web component nativo (vanilla JS, Shadow DOM) que encapsula el/los cartel(es)
 * de "Festejamos a San Francisco de Asís" + "Feria de Emprendedores".
 * Estilo, fuentes e íconos quedan encerrados en el Shadow DOM.
 *
 * Layout fluido (CSS Grid + container queries): cada cartel es rectangular y
 * ocupa el máximo espacio disponible sin necesitar scroll ni JS de escalado.
 * - Desktop (>=769px de ventana): cartel apaisado ("a lo largo"), 1.7:1.
 * - Mobile (<=768px de ventana): cartel vertical ("a lo alto").
 * El switch para alternar entre los dos carteles se muestra siempre, arriba,
 * tanto en desktop como en mobile.
 *
 * USO
 * <script src="cartel-evento.js"></script>
 * <cartel-evento></cartel-evento>                    -> arranca en el poster "main"
 * <cartel-evento poster="feria"></cartel-evento>      -> arranca en el poster "feria"
 * <cartel-evento
 *   img-santo="/img/san-francisco.png"
 *   img-iglesia="/img/iglesia.png"
 *   img-bunting="/img/banderines.png"
 *   style="--cartel-max-width:900px;">
 * </cartel-evento>
 *
 * ATRIBUTOS
 * - poster        "main" | "feria"   (default "main") con cuál arranca
 * - img-santo     ruta de imagen     (default "san-francisco.png")
 * - img-iglesia   ruta de imagen     (default "iglesia.png") reemplaza el ícono
 *                 de iglesia en la banda terracota del footer del poster principal
 * - img-bunting   ruta de imagen     (default "banderines.png") guirnalda de
 *                 banderines superpuesta arriba de la card, con balanceo animado.
 *                 Se espera una imagen apaisada (banderines pegados arriba,
 *                 resto transparente) con fondo transparente.
 *
 * VARIABLE CSS
 * - --cartel-max-width   ancho máximo del componente (default: sin tope, ocupa
 *                        el 100% del contenedor donde se inserte)
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
    pin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e3c27a" stroke-width="2" style="vertical-align:-3px"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`
  };

  const TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      :host{
        display:block;
        width:100%;
        max-width:var(--cartel-max-width, none);
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

      /* -------- switch (siempre visible, mobile y desktop) -------- */
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

      /* -------- frame: rectangular, apaisado en desktop / vertical en mobile -------- */
      .frame{
        position:relative; width:100%;
        container-type:inline-size;
        border-radius:clamp(16px,2.4cqw,34px);
        overflow:hidden;
        box-shadow:0 20px 40px rgba(30,18,6,0.30), 0 6px 14px rgba(30,18,6,0.20);
        aspect-ratio:3/4; /* mobile: a lo alto */
      }
      .frame.hidden{ display:none; }
      @media (min-width:769px){
        .frame{ aspect-ratio:1.7/1; } /* desktop: a lo largo */
      }

      .poster{ width:100%; height:100%; position:relative; display:grid; }

      /* ================= POSTER 1: EVENTO PRINCIPAL ================= */
      #poster-main{
        padding:3.2cqw 4cqw; gap:1.6cqw 3cqw;
        grid-template-columns:1fr;
        grid-template-rows:auto auto 1fr auto;
        grid-template-areas:"halo" "header" "cards" "footer";
        background:
          radial-gradient(circle at 78% 8%, rgba(214,162,52,0.25), transparent 40%),
          linear-gradient(160deg,var(--cream) 0%, var(--cream-deep) 100%);
      }
      @media (min-width:769px){
        #poster-main{
          grid-template-columns:30% 1fr;
          grid-template-rows:auto 1fr auto;
          grid-template-areas:"halo header" "halo cards" "footer footer";
        }
      }

      /* guirnalda de banderines: imagen superpuesta arriba de la card, con balanceo suave.
         z-index mínimo (queda DETRÁS del contenido del poster, así nunca lo tapa/pisa).
         Se recorta a una franja fija pegada arriba, sin importar cuánta transparencia
         tenga el PNG por debajo del dibujo. */
      .bunting-wrap{
        position:absolute; top:0; left:0; width:100%;
        height:clamp(30px,7cqw,120px);
        z-index:0;
        pointer-events:none; overflow:hidden;
        transform-origin:top center;
        animation:bunting-sway 6s ease-in-out infinite;
      }
      .bunting-wrap img{ position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; object-position:top center; }
      @keyframes bunting-sway{
        0%,100%{ transform:rotate(-0.6deg); }
        50%{ transform:rotate(0.6deg); }
      }
      /* fallback CSS (triangulitos) si la imagen de banderines no carga */
      .bunting-fallback{ position:absolute; inset:0; width:100%; display:flex; justify-content:space-between; padding:0 clamp(10px,2cqw,26px); }
      .bunting-fallback span{ border-left:clamp(9px,1.5cqw,20px) solid transparent; border-right:clamp(9px,1.5cqw,20px) solid transparent; border-top:clamp(16px,2.8cqw,36px) solid var(--c); opacity:.85; }

      .halo-wrap{ grid-area:halo; position:relative; justify-self:center; align-self:center; width:clamp(110px,22cqw,240px); aspect-ratio:1/1; }
      .halo-glow{ position:absolute; inset:-14%; border-radius:50%; background:radial-gradient(circle, rgba(230,190,90,0.65) 0%, rgba(230,190,90,0.0) 70%); filter:blur(2px); animation:pulse 4.5s ease-in-out infinite; }
      @keyframes pulse{ 0%,100%{ transform:scale(1); opacity:.9; } 50%{ transform:scale(1.08); opacity:1; } }
      .portrait-frame{ position:absolute; inset:0; border-radius:50%; background:linear-gradient(145deg,#f3e6c6,#dcc697); box-shadow:8px 8px 18px var(--shadow-dark), -6px -6px 16px var(--shadow-light); display:flex; align-items:center; justify-content:center; overflow:hidden; border:4px solid rgba(255,255,255,0.6); }
      .portrait-frame img{ width:100%; height:100%; object-fit:contain; transform:scale(1.12) translateY(4%); }
      .fallback-icon{ width:56%; height:56%; opacity:.35; }
      .sparkle{ position:absolute; border-radius:50%; background:var(--gold-soft); animation:twinkle 3s ease-in-out infinite; }
      @keyframes twinkle{ 0%,100%{ opacity:.15; transform:scale(.7); } 50%{ opacity:1; transform:scale(1.15); } }

      .headline-block{ grid-area:header; align-self:center; text-align:center; }
      @media (min-width:769px){ .headline-block{ text-align:left; } }
      .eyebrow-hand{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:clamp(12px,1.9cqw,19px); color:var(--ink-soft); }
      .headline-block h1{ margin:.1em 0 0; font-family:'Fraunces',serif; font-weight:700; font-size:clamp(22px,4.8cqw,44px); line-height:1.04; color:var(--ink); }
      .headline-block h1 .accent1{ font-style:italic; font-weight:600; color:var(--terracotta-deep); }
      .headline-block h1 .accent2{ font-style:italic; font-weight:600; color:var(--olive); }
      .date-badge{ display:inline-flex; align-items:center; gap:8px; margin-top:clamp(6px,1.1cqw,14px); padding:clamp(6px,.9cqw,11px) clamp(12px,1.9cqw,22px); border-radius:14px; background:var(--glass-fill); border:1px solid var(--glass-border); backdrop-filter:blur(10px); box-shadow:4px 4px 10px var(--shadow-dark), -3px -3px 8px var(--shadow-light); }
      .date-badge span{ font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(12px,1.6cqw,17px); letter-spacing:.3px; color:var(--ink); }

      .info-row{ grid-area:cards; display:flex; gap:clamp(10px,1.6cqw,22px); min-height:0; }
      @media (max-width:768px){ .info-row{ flex-direction:column; } }
      .info-card{ flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:space-between; border-radius:clamp(14px,1.8cqw,24px); padding:clamp(12px,2cqw,24px); background:linear-gradient(150deg,#f7ecd6,#e7d6ac); box-shadow:8px 8px 18px var(--shadow-dark), -6px -6px 14px var(--shadow-light); overflow:hidden; }
      .info-card .top{ display:flex; flex-direction:column; min-height:0; }
      .info-card .medal{ width:clamp(36px,5.6cqw,66px); height:clamp(36px,5.6cqw,66px); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:clamp(6px,1.1cqw,14px); box-shadow:inset 3px 3px 7px rgba(0,0,0,0.18), inset -3px -3px 7px rgba(255,255,255,0.35); flex-shrink:0; }
      .info-card svg{ width:52%; height:52%; }
      .info-card h3{ margin:0 0 .2em; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(16px,2.4cqw,24px); color:var(--ink); }
      .info-card p{ margin:0; font-size:clamp(12px,1.5cqw,16px); line-height:1.36; color:var(--ink-soft); font-weight:500; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .info-card .tag{ align-self:flex-start; flex-shrink:0; margin-top:clamp(6px,1.1cqw,14px); padding:clamp(5px,.8cqw,9px) clamp(10px,1.5cqw,16px); border-radius:12px; font-size:clamp(11px,1.4cqw,15px); font-weight:700; color:#fff; }
      #card-misa .medal{ background:var(--olive); } #card-feria .medal{ background:var(--pink); } #card-buffet .medal{ background:var(--teal); }
      #card-misa .tag{ background:var(--olive); } #card-feria .tag{ background:var(--pink); } #card-buffet .tag{ background:var(--teal); }

      .footer-main{ grid-area:footer; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:clamp(8px,1.3cqw,16px) clamp(14px,2cqw,26px); border-radius:clamp(12px,1.6cqw,18px); background:linear-gradient(90deg,var(--terracotta) 0%, var(--terracotta-deep) 100%); }
      .footer-main .parish{ display:flex; align-items:center; gap:clamp(10px,1.6cqw,18px); min-width:0; }
      .footer-main .parish svg{ width:clamp(20px,3cqw,36px); height:clamp(20px,3cqw,36px); flex-shrink:0; }
      .footer-main .parish img{ width:clamp(52px,8.5cqw,120px); height:clamp(42px,6.8cqw,96px); object-fit:contain; flex-shrink:0; }
      .footer-main .parish h4{ margin:0; color:#fbeedb; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(12px,2cqw,18px); letter-spacing:.2px; }
      .footer-main .parish span{ color:#f3d9c2; font-size:clamp(9px,1.3cqw,13px); font-weight:500; }
      .footer-main .welcome{ flex-shrink:0; padding:clamp(6px,1.1cqw,11px) clamp(11px,1.7cqw,18px); border-radius:14px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.3); color:#fff2df; font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:clamp(11px,1.7cqw,17px); white-space:nowrap; }

      /* ================= POSTER 2: FERIA DE EMPRENDEDORES ================= */
      #poster-feria{
        padding:3.2cqw 4cqw; gap:1.4cqw 3cqw;
        grid-template-columns:1fr;
        grid-template-rows:auto auto auto 1fr auto auto;
        grid-template-areas:"portrait" "top" "quote" "panels" "whatsapp" "footer";
        background:
          radial-gradient(circle at 15% 90%, rgba(201,154,63,0.20), transparent 45%),
          linear-gradient(165deg,var(--mkt-bg) 0%, var(--mkt-bg-deep) 100%);
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
      .feria-top .eyebrow-hand{ color:var(--mkt-gold-soft); font-size:clamp(11px,1.7cqw,16px); }
      .feria-top h1{ margin:.1em 0 0; font-family:'Fraunces',serif; font-weight:700; font-size:clamp(19px,4cqw,34px); color:var(--mkt-cream); letter-spacing:.1px; line-height:1.08; }
      .feria-top h1 span{ font-style:italic; font-weight:600; color:var(--mkt-gold-soft); }
      .feria-date{ display:inline-flex; align-items:center; gap:8px; margin-top:clamp(5px,1cqw,12px); padding:clamp(5px,.8cqw,9px) clamp(10px,1.5cqw,17px); border-radius:12px; background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(10px); }
      .feria-date span{ font-weight:700; font-size:clamp(11px,1.4cqw,15px); color:var(--mkt-cream); }

      .feria-portrait{ grid-area:portrait; justify-self:center; align-self:start; width:clamp(64px,12cqw,120px); aspect-ratio:1/1; border-radius:50%; background:linear-gradient(150deg,#3a4d2f,#233318); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); border:3px solid rgba(255,246,224,0.18); display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .feria-portrait img{ width:100%; height:100%; object-fit:contain; transform:scale(1.15) translateY(3%); }

      .feria-quote{ grid-area:quote; align-self:center; text-align:center; font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:clamp(12px,1.7cqw,19px); line-height:1.3; color:var(--mkt-cream); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
      @media (min-width:769px){ .feria-quote{ text-align:left; } }
      .feria-quote b{ color:var(--mkt-gold-soft); font-weight:600; }

      .feria-panels{ grid-area:panels; display:flex; gap:clamp(10px,1.4cqw,20px); min-height:0; }
      @media (max-width:768px){ .feria-panels{ flex-direction:column; } }
      .feria-panel{ flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:center; gap:clamp(5px,1cqw,11px); border-radius:clamp(14px,1.8cqw,22px); padding:clamp(10px,1.8cqw,22px); background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(8px); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); overflow:hidden; }
      .feria-panel .medal{ width:clamp(30px,4.6cqw,58px); height:clamp(30px,4.6cqw,58px); border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--mkt-gold); box-shadow:inset 3px 3px 6px rgba(0,0,0,0.25), inset -3px -3px 6px rgba(255,255,255,0.2); flex-shrink:0; }
      .feria-panel svg{ width:50%; height:50%; }
      .feria-panel h3{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(14px,2.1cqw,21px); }
      .feria-panel p{ margin:0; color:#d8ceb4; font-size:clamp(11px,1.4cqw,14px); line-height:1.38; font-weight:500; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .feria-panel .price{ font-family:'Fraunces',serif; font-weight:700; font-size:clamp(17px,2.8cqw,27px); color:var(--mkt-gold-soft); }

      .whatsapp-chip{ grid-area:whatsapp; display:flex; align-items:center; justify-content:center; gap:clamp(7px,1.2cqw,12px); padding:clamp(7px,1.2cqw,14px) clamp(10px,1.6cqw,18px); border-radius:clamp(12px,1.6cqw,16px); background:linear-gradient(150deg,#2e5c33,#1f4025); box-shadow:6px 6px 14px var(--mkt-shadow-dark), -4px -4px 10px rgba(255,255,255,0.06); flex-wrap:wrap; }
      .whatsapp-chip svg{ width:clamp(15px,2.2cqw,24px); height:clamp(15px,2.2cqw,24px); }
      .whatsapp-chip .wa-text{ color:#eafbe9; font-weight:600; font-size:clamp(10px,1.3cqw,13px); }
      .whatsapp-chip .wa-num{ color:#fff; font-weight:800; font-size:clamp(12px,1.8cqw,18px); letter-spacing:.2px; font-family:'Sora',sans-serif; }

      .footer-feria{ grid-area:footer; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:clamp(7px,1.2cqw,14px) clamp(12px,1.8cqw,24px); border-radius:clamp(10px,1.4cqw,14px); background:rgba(0,0,0,0.18); border:1px solid rgba(255,246,224,0.12); }
      .footer-feria .parish{ display:flex; align-items:center; gap:clamp(7px,1.2cqw,14px); min-width:0; }
      .footer-feria .parish svg{ width:clamp(17px,2.6cqw,32px); height:clamp(17px,2.6cqw,32px); flex-shrink:0; }
      .footer-feria .parish h4{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(11px,1.7cqw,16px); }
      .footer-feria .parish span{ color:#c9c0a6; font-size:clamp(9px,1.1cqw,11px); }
      .footer-feria .addr{ flex-shrink:0; color:var(--mkt-gold-soft); font-weight:700; font-size:clamp(9px,1.3cqw,12px); display:flex; align-items:center; gap:6px; white-space:nowrap; }
    </style>

    <div class="switcher" id="switcher">
      <button type="button" id="tab-main" data-target="main">Evento principal</button>
      <button type="button" id="tab-feria" data-target="feria">Feria de emprendedores</button>
    </div>

    <div class="frames" id="frames">
      <div class="frame" id="frame-main">
        <div class="bunting-wrap" id="bunting-wrap">
          <img id="img-bunting" alt="">
          <div class="bunting-fallback" id="bunting-fallback" hidden>
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
          </div>
          <div class="headline-block">
            <div class="eyebrow-hand">Festejamos a</div>
            <h1><span class="accent1">San Francisco</span> <span class="accent2">de Asís</span></h1>
            <div class="date-badge"><span>Domingo 4 de Octubre</span></div>
          </div>
          <div class="info-row">
            <div class="info-card" id="card-misa"><div class="top"><div class="medal">${ICONS.chalice}</div><h3>Misa</h3><p>Comenzamos juntos celebrando a nuestro querido San Francisco.</p></div><span class="tag">11:00 hs</span></div>
            <div class="info-card" id="card-feria"><div class="top"><div class="medal">${ICONS.stall}</div><h3>Feria &amp; Bingo</h3><p>Emprendedores y bingo familiar en el colegio, Calle 52 casi 8 · Acceso 2.</p></div><span class="tag">12:30 a 17:00 hs</span></div>
            <div class="info-card" id="card-buffet"><div class="top"><div class="medal">${ICONS.food}</div><h3>Buffet</h3><p>Habrá cosas ricas para comer durante toda la tarde.</p></div><span class="tag">Todo el día</span></div>
          </div>
          <div class="footer-main">
            <div class="parish"><img id="img-iglesia" alt=""><div><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
            <div class="welcome">¡Te esperamos!</div>
          </div>
        </div>
      </div>

      <div class="frame hidden" id="frame-feria">
        <div id="poster-feria" class="poster">
          <div class="feria-portrait"><img id="img-santo-feria" alt="San Francisco de Asís"></div>
          <div class="feria-top">
            <div class="eyebrow-hand">Feria de</div>
            <h1>Emprendedores <span>&amp; Comunidad</span></h1>
            <div class="feria-date"><span>Domingo 4 de Octubre</span></div>
          </div>
          <div class="feria-quote"><b>¡Tu emprendimiento puede inspirar y transformar!</b> Un espacio para compartir tus productos, mostrar tu talento y hacer crecer tus sueños. Todos somos comunidad.</div>
          <div class="feria-panels">
            <div class="feria-panel"><div class="medal">${ICONS.hearts}</div><h3>¿Sos emprendedor?</h3><p>Te invitamos a sumarte con tu propuesta a esta feria que nos une y nos fortalece.</p></div>
            <div class="feria-panel"><div class="medal">${ICONS.coin}</div><h3>Inscripción</h3><div class="price">$15.000</div><p>Valor único + un producto de tu emprendimiento para el bingo.</p></div>
          </div>
          <div class="whatsapp-chip">${ICONS.whatsapp}<span class="wa-text">Comunicate con Nancy</span><span class="wa-num">11 5313-3638</span></div>
          <div class="footer-feria">
            <div class="parish">${ICONS.churchLight}<div><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
            <div class="addr">${ICONS.pin} Calle 8 / 52 y 53</div>
          </div>
        </div>
      </div>
    </div>
  `;

  class CartelEvento extends HTMLElement {
    static get observedAttributes() {
      return ['poster', 'img-santo', 'img-iglesia', 'img-bunting'];
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
      this._applyPoster();
    }

    attributeChangedCallback() {
      if (!this._rendered) return;
      this._applyImages();
      this._applyPoster();
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

      const iglesiaImg = root.getElementById('img-iglesia');
      iglesiaImg.addEventListener('error', () => {
        iglesiaImg.replaceWith(Object.assign(document.createElement('span'), { innerHTML: ICONS.church }).firstChild);
      });

      const buntingImg = root.getElementById('img-bunting');
      buntingImg.addEventListener('error', () => {
        buntingImg.hidden = true;
        root.getElementById('bunting-fallback').hidden = false;
      });
    }

    _applyImages() {
      const root = this.shadowRoot;
      const santo = this.getAttribute('img-santo') || 'san-francisco.png';
      const iglesia = this.getAttribute('img-iglesia') || 'iglesia.png';
      const bunting = this.getAttribute('img-bunting') || 'banderines.png';
      const santoMain = root.getElementById('img-santo-main');
      const santoFeria = root.getElementById('img-santo-feria');
      const iglesiaImg = root.getElementById('img-iglesia');
      const buntingImg = root.getElementById('img-bunting');
      if (santoMain) santoMain.src = santo;
      if (santoFeria) santoFeria.src = santo;
      if (iglesiaImg) iglesiaImg.src = iglesia;
      if (buntingImg) buntingImg.src = bunting;
    }

    _applyPoster() {
      const which = this.getAttribute('poster') === 'feria' ? 'feria' : 'main';
      const root = this.shadowRoot;
      root.getElementById('frame-main').classList.toggle('hidden', which !== 'main');
      root.getElementById('frame-feria').classList.toggle('hidden', which !== 'feria');
      root.getElementById('tab-main').classList.toggle('active', which === 'main');
      root.getElementById('tab-feria').classList.toggle('active', which === 'feria');
    }
  }

  customElements.define('cartel-evento', CartelEvento);
})();
