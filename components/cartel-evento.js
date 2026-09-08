/**
 * <cartel-evento>
 * Web component nativo (vanilla JS, Shadow DOM) que encapsula el/los cartel(es)
 * de "Festejamos a San Francisco de Asís" + "Feria de Emprendedores".
 * Estilo, fuentes e íconos quedan encerrados en el Shadow DOM: no interfiere
 * con el CSS del sitio ni es afectado por él.
 *
 * USO BÁSICO
 * <script src="cartel-evento.js"></script>
 * <cartel-evento></cartel-evento>                          -> muestra el poster "main"
 * <cartel-evento poster="feria"></cartel-evento>            -> muestra el poster "feria"
 * <cartel-evento show-switcher></cartel-evento>             -> con pestañas para alternar
 *
 * ATRIBUTOS
 * - poster           "main" | "feria"   (default "main") cuál se muestra
 * - show-switcher    presente/ausente   muestra pestañas para alternar entre ambos
 * - img-santo        ruta de la imagen del santo (PNG transparente)  default "san-francisco.png"
 * - img-iglesia      ruta de la imagen de la iglesia (PNG transparente) default "iglesia.png"
 * - full-bleed       presente/ausente   si está, el host no limita max-width (ocupa 100% del contenedor)
 *
 * VARIABLES CSS (se setean desde afuera, en el elemento host)
 * --cartel-max-width   ancho máximo del cartel embebido (default 640px, ignorado si full-bleed)
 *
 * El cartel es cuadrado (1:1) y escala de forma fluida con el ancho de su contenedor
 * (usa ResizeObserver, no depende del viewport de la ventana).
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
        --cartel-max-width-default:640px;
        max-width:var(--cartel-max-width, var(--cartel-max-width-default));
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
      :host([full-bleed]){ max-width:none; }
      :host([layout="duo"]){ --cartel-max-width-default:1040px; }
      *{ box-sizing:border-box; }

      .switcher{ display:flex; gap:8px; margin-bottom:12px; }
      .switcher button{
        font-family:'Sora',sans-serif; font-weight:600; font-size:13px;
        padding:8px 16px; border-radius:999px; border:none; cursor:pointer;
        background:linear-gradient(145deg,#efe2c2,#d9c69e); color:#4a3620;
        box-shadow:5px 5px 10px rgba(150,114,66,0.35), -4px -4px 9px rgba(255,255,255,0.75);
      }
      .switcher button.active{
        background:linear-gradient(145deg,#c4552e,#a5431f); color:#fbeedb;
        box-shadow:inset 3px 3px 7px rgba(0,0,0,0.35), inset -3px -3px 7px rgba(255,140,90,0.25);
      }

      .duo-wrapper{ display:flex; gap:24px; width:100%; }

      .frame{
        position:relative; flex:1 1 0; min-width:0; aspect-ratio:1/1;
        border-radius:34px; overflow:hidden;
        box-shadow:0 20px 40px rgba(30,18,6,0.30), 0 6px 14px rgba(30,18,6,0.20);
      }
      .frame.hidden{ display:none; }

      .poster{
        position:absolute; top:0; left:0;
        width:1080px; height:1080px;
        transform-origin:top left;
      }

      /* -------- poster principal -------- */
      #poster-main{
        background:
          radial-gradient(circle at 78% 8%, rgba(214,162,52,0.25), transparent 40%),
          linear-gradient(160deg,var(--cream) 0%, var(--cream-deep) 100%);
      }
      .bunting{ position:absolute; top:0; left:0; width:100%; height:64px; display:flex; justify-content:space-between; padding:0 26px; }
      .bunting span{ width:0; height:0; border-left:23px solid transparent; border-right:23px solid transparent; border-top:40px solid var(--c); opacity:.85; transform:translateY(-6px); }
      .halo-wrap{ position:absolute; top:118px; left:70px; width:340px; height:340px; }
      .halo-glow{ position:absolute; inset:-30px; border-radius:50%; background:radial-gradient(circle, rgba(230,190,90,0.65) 0%, rgba(230,190,90,0.0) 70%); filter:blur(2px); animation:pulse 4.5s ease-in-out infinite; }
      @keyframes pulse{ 0%,100%{ transform:scale(1); opacity:.9; } 50%{ transform:scale(1.08); opacity:1; } }
      .portrait-frame{ position:absolute; inset:0; border-radius:50%; background:linear-gradient(145deg,#f3e6c6,#dcc697); box-shadow:14px 14px 26px var(--shadow-dark), -12px -12px 24px var(--shadow-light); display:flex; align-items:center; justify-content:center; overflow:hidden; border:6px solid rgba(255,255,255,0.6); }
      .portrait-frame img{ width:100%; height:100%; object-fit:contain; transform:scale(1.12) translateY(6px); }
      .fallback-icon{ width:56%; height:56%; opacity:.35; }
      .sparkle{ position:absolute; border-radius:50%; background:var(--gold-soft); animation:twinkle 3s ease-in-out infinite; }
      @keyframes twinkle{ 0%,100%{ opacity:.15; transform:scale(.7); } 50%{ opacity:1; transform:scale(1.15); } }
      .headline-block{ position:absolute; top:150px; left:430px; right:60px; }
      .eyebrow-hand{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:27px; color:var(--ink-soft); }
      .headline-block h1{ margin:2px 0 0; font-family:'Fraunces',serif; font-weight:700; font-size:70px; line-height:.98; color:var(--ink); }
      .headline-block h1 .accent1{ font-style:italic; font-weight:600; color:var(--terracotta-deep); }
      .headline-block h1 .accent2{ font-style:italic; font-weight:600; color:var(--olive); }
      .date-badge{ display:inline-flex; align-items:center; gap:10px; margin-top:20px; padding:12px 26px; border-radius:16px; background:var(--glass-fill); border:1px solid var(--glass-border); backdrop-filter:blur(10px); box-shadow:6px 6px 14px var(--shadow-dark), -4px -4px 10px var(--shadow-light); }
      .date-badge span{ font-family:'Sora',sans-serif; font-weight:700; font-size:22px; letter-spacing:.4px; color:var(--ink); }
      .info-row{ position:absolute; top:480px; bottom:190px; left:70px; right:70px; display:flex; gap:26px; }
      .info-card{ flex:1; position:relative; display:flex; flex-direction:column; justify-content:space-between; border-radius:32px; padding:38px 32px 32px; background:linear-gradient(150deg,#f7ecd6,#e7d6ac); box-shadow:12px 12px 24px var(--shadow-dark), -10px -10px 20px var(--shadow-light); }
      .info-card .top{ display:flex; flex-direction:column; }
      .info-card .medal{ width:104px; height:104px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:22px; box-shadow:inset 4px 4px 8px rgba(0,0,0,0.18), inset -4px -4px 8px rgba(255,255,255,0.35); }
      .info-card svg{ width:50px; height:50px; }
      .info-card h3{ margin:0 0 10px; font-family:'Sora',sans-serif; font-weight:800; font-size:34px; color:var(--ink); }
      .info-card p{ margin:0; font-size:21px; line-height:1.4; color:var(--ink-soft); font-weight:500; }
      .info-card .tag{ align-self:flex-start; margin-top:18px; padding:11px 22px; border-radius:14px; font-size:19px; font-weight:700; color:#fff; }
      #card-misa .medal{ background:var(--olive); } #card-feria .medal{ background:var(--pink); } #card-buffet .medal{ background:var(--teal); }
      #card-misa .tag{ background:var(--olive); } #card-feria .tag{ background:var(--pink); } #card-buffet .tag{ background:var(--teal); }
      .footer-main{ position:absolute; bottom:0; left:0; right:0; height:160px; background:linear-gradient(90deg,var(--terracotta) 0%, var(--terracotta-deep) 100%); display:flex; align-items:center; justify-content:space-between; padding:0 60px; }
      .footer-main .parish{ display:flex; align-items:center; gap:20px; }
      .footer-main .parish svg{ width:54px; height:54px; flex-shrink:0; }
      .footer-main .parish h4{ margin:0; color:#fbeedb; font-family:'Sora',sans-serif; font-weight:800; font-size:26px; letter-spacing:.3px; }
      .footer-main .parish span{ color:#f3d9c2; font-size:17px; font-weight:500; }
      .footer-main .welcome{ padding:14px 28px; border-radius:16px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.3); color:#fff2df; font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:26px; }
      .bg-church{ position:absolute; top:26px; right:36px; width:230px; opacity:.5; filter:drop-shadow(0 8px 10px rgba(0,0,0,0.12)); }

      /* -------- poster feria -------- */
      #poster-feria{ background: radial-gradient(circle at 15% 90%, rgba(201,154,63,0.20), transparent 45%), linear-gradient(165deg,var(--mkt-bg) 0%, var(--mkt-bg-deep) 100%); }
      .feria-top{ position:absolute; top:56px; left:0; right:0; text-align:center; }
      .feria-top .eyebrow-hand{ color:var(--mkt-gold-soft); font-size:25px; }
      .feria-top h1{ margin:4px 0 0; font-family:'Fraunces',serif; font-weight:700; font-size:66px; color:var(--mkt-cream); letter-spacing:.2px; }
      .feria-top h1 span{ font-style:italic; font-weight:600; color:var(--mkt-gold-soft); }
      .feria-date{ display:inline-flex; align-items:center; gap:10px; margin-top:16px; padding:10px 24px; border-radius:14px; background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(10px); }
      .feria-date span{ font-weight:700; font-size:19px; color:var(--mkt-cream); }
      .feria-portrait{ position:absolute; top:270px; left:90px; width:230px; height:230px; border-radius:50%; background:linear-gradient(150deg,#3a4d2f,#233318); box-shadow:12px 12px 22px var(--mkt-shadow-dark), -8px -8px 18px var(--mkt-shadow-light); border:5px solid rgba(255,246,224,0.18); display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .feria-portrait img{ width:100%; height:100%; object-fit:contain; transform:scale(1.15) translateY(4px); }
      .feria-quote{ position:absolute; top:300px; left:360px; right:80px; font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:29px; line-height:1.3; color:var(--mkt-cream); }
      .feria-quote b{ color:var(--mkt-gold-soft); font-weight:600; }
      .feria-panels{ position:absolute; top:512px; left:80px; right:80px; display:flex; gap:22px; }
      .feria-panel{ flex:1; border-radius:24px; padding:24px 24px 22px; background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(8px); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); }
      .feria-panel .medal{ width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--mkt-gold); margin-bottom:14px; box-shadow:inset 2px 2px 5px rgba(0,0,0,0.25), inset -2px -2px 5px rgba(255,255,255,0.2); }
      .feria-panel svg{ width:24px; height:24px; }
      .feria-panel h3{ margin:0 0 6px; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:19px; }
      .feria-panel p{ margin:0; color:#d8ceb4; font-size:14.5px; line-height:1.4; font-weight:500; }
      .feria-panel .price{ font-family:'Fraunces',serif; font-weight:700; font-size:30px; color:var(--mkt-gold-soft); margin-top:6px; }
      .whatsapp-chip{ position:absolute; top:754px; left:80px; right:80px; display:flex; align-items:center; justify-content:center; gap:14px; padding:16px 20px; border-radius:18px; background:linear-gradient(150deg,#2e5c33,#1f4025); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -4px -4px 10px rgba(255,255,255,0.06); }
      .whatsapp-chip svg{ width:30px; height:30px; }
      .whatsapp-chip .wa-text{ color:#eafbe9; font-weight:600; font-size:16px; }
      .whatsapp-chip .wa-num{ color:#fff; font-weight:800; font-size:22px; letter-spacing:.3px; font-family:'Sora',sans-serif; }
      .footer-feria{ position:absolute; bottom:0; left:0; right:0; height:130px; background:rgba(0,0,0,0.18); border-top:1px solid rgba(255,246,224,0.12); display:flex; align-items:center; justify-content:space-between; padding:0 60px; }
      .footer-feria .parish{ display:flex; align-items:center; gap:16px; }
      .footer-feria .parish svg{ width:36px; height:36px; }
      .footer-feria .parish h4{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:18px; }
      .footer-feria .parish span{ color:#c9c0a6; font-size:13px; }
      .footer-feria .addr{ color:var(--mkt-gold-soft); font-weight:700; font-size:14.5px; display:flex; align-items:center; gap:8px; }
    </style>

    <div class="switcher" id="switcher" hidden>
      <button type="button" id="tab-main" data-target="main">Evento principal</button>
      <button type="button" id="tab-feria" data-target="feria">Feria de emprendedores</button>
    </div>

    <div class="duo-wrapper" id="duo-wrapper">
     <div class="frame" id="frame-main">
      <div id="poster-main" class="poster">
        <div class="bunting">
          <span style="--c:#e14c81"></span><span style="--c:#d6a234"></span><span style="--c:#1e7d74"></span>
          <span style="--c:#c4552e"></span><span style="--c:#5c7a34"></span><span style="--c:#d6a234"></span>
          <span style="--c:#e14c81"></span><span style="--c:#1e7d74"></span><span style="--c:#c4552e"></span>
          <span style="--c:#5c7a34"></span><span style="--c:#d6a234"></span><span style="--c:#e14c81"></span>
        </div>
        <img class="bg-church" id="img-iglesia" alt="">
        <div class="halo-wrap">
          <div class="halo-glow"></div>
          <div class="portrait-frame"><img id="img-santo-main" alt="San Francisco de Asís"></div>
          <div class="sparkle" style="width:8px;height:8px; top:-6px; left:40px; animation-delay:.2s;"></div>
          <div class="sparkle" style="width:12px;height:12px; top:60px; left:-14px; animation-delay:1.1s;"></div>
          <div class="sparkle" style="width:6px;height:6px; top:280px; right:-8px; left:auto; animation-delay:1.9s;"></div>
        </div>
        <div class="headline-block">
          <div class="eyebrow-hand">Festejamos a</div>
          <h1><span class="accent1">San Francisco</span><br><span class="accent2">de Asís</span></h1>
          <div class="date-badge"><span>Domingo 4 de Octubre</span></div>
        </div>
        <div class="info-row">
          <div class="info-card" id="card-misa"><div class="top"><div class="medal">${ICONS.chalice}</div><h3>Misa</h3><p>Comenzamos juntos celebrando a nuestro querido San Francisco.</p></div><span class="tag">11:00 hs</span></div>
          <div class="info-card" id="card-feria"><div class="top"><div class="medal">${ICONS.stall}</div><h3>Feria &amp; Bingo</h3><p>Emprendedores y bingo familiar en el colegio, Calle 52 casi 8 · Acceso 2.</p></div><span class="tag">12:30 a 17:00 hs</span></div>
          <div class="info-card" id="card-buffet"><div class="top"><div class="medal">${ICONS.food}</div><h3>Buffet</h3><p>Habrá cosas ricas para comer durante toda la tarde.</p></div><span class="tag">Todo el día</span></div>
        </div>
        <div class="footer-main">
          <div class="parish">${ICONS.church}<div><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
          <div class="welcome">¡Te esperamos!</div>
        </div>
      </div>
     </div>

     <div class="frame" id="frame-feria">
      <div id="poster-feria" class="poster">
        <div class="feria-top">
          <div class="eyebrow-hand">Feria de</div>
          <h1>Emprendedores <span>&amp; Comunidad</span></h1>
          <div class="feria-date"><span>Domingo 4 de Octubre</span></div>
        </div>
        <div class="feria-portrait"><img id="img-santo-feria" alt="San Francisco de Asís"></div>
        <div class="feria-quote"><b>¡Tu emprendimiento puede inspirar y transformar!</b><br>Un espacio para compartir tus productos, mostrar tu talento y hacer crecer tus sueños. Todos somos comunidad.</div>
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
      return ['poster', 'layout', 'show-switcher', 'img-santo', 'img-iglesia'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._ro = null;
    }

    connectedCallback() {
      if (!this._rendered) {
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this._rendered = true;
        this._wire();
      }
      this._applyImages();
      this._applyPoster();
      this._applySwitcher();
      this._observeResize();
      this._fit();
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
    }

    attributeChangedCallback() {
      if (!this._rendered) return;
      this._applyImages();
      this._applyPoster();
      this._applySwitcher();
      this._fit();
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
      root.getElementById('img-iglesia').addEventListener('error', (e) => { e.target.style.display = 'none'; });
    }

    _applyImages() {
      const root = this.shadowRoot;
      const santo = this.getAttribute('img-santo') || 'san-francisco.png';
      const iglesia = this.getAttribute('img-iglesia') || 'iglesia.png';
      const santoMain = root.getElementById('img-santo-main');
      const santoFeria = root.getElementById('img-santo-feria');
      const iglesiaImg = root.getElementById('img-iglesia');
      if (santoMain) santoMain.src = santo;
      if (santoFeria) santoFeria.src = santo;
      if (iglesiaImg) iglesiaImg.src = iglesia;
    }

    _isDuo() {
      return this.getAttribute('layout') === 'duo';
    }

    _applyPoster() {
      const root = this.shadowRoot;
      const which = this.getAttribute('poster') === 'feria' ? 'feria' : 'main';
      const frameMain = root.getElementById('frame-main');
      const frameFeria = root.getElementById('frame-feria');
      if (this._isDuo()) {
        frameMain.classList.remove('hidden');
        frameFeria.classList.remove('hidden');
      } else {
        frameMain.classList.toggle('hidden', which !== 'main');
        frameFeria.classList.toggle('hidden', which !== 'feria');
      }
      root.getElementById('tab-main').classList.toggle('active', which === 'main');
      root.getElementById('tab-feria').classList.toggle('active', which === 'feria');
    }

    _applySwitcher() {
      const show = this.hasAttribute('show-switcher') && !this._isDuo();
      this.shadowRoot.getElementById('switcher').hidden = !show;
    }

    _observeResize() {
      if (this._ro) return;
      this._ro = new ResizeObserver(() => this._fit());
      this._ro.observe(this.shadowRoot.getElementById('frame-main'));
      this._ro.observe(this.shadowRoot.getElementById('frame-feria'));
    }

    _fit() {
      const root = this.shadowRoot;
      [['frame-main', 'poster-main'], ['frame-feria', 'poster-feria']].forEach(([frameId, posterId]) => {
        const frame = root.getElementById(frameId);
        const poster = root.getElementById(posterId);
        if (!frame || !poster || frame.clientWidth === 0) return;
        poster.style.transform = `scale(${frame.clientWidth / 1080})`;
      });
    }
  }

  customElements.define('cartel-evento', CartelEvento);
})();