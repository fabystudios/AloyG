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
 * ALIAS EN ESPAÑOL PARA LOS PANELES DE LA FERIA (panel1/panel2)
 * Además de <id>-title / <id>-text / <id>-img de arriba, panel1 y panel2
 * admiten estos nombres equivalentes (si se pasan los dos, estos tienen
 * prioridad sobre los de arriba):
 *   feria-panel1-titulo / feria-panel2-titulo   = panel1-title / panel2-title
 *   feria-panel1-text   / feria-panel2-text     = panel1-text / panel2-text
 *   feria-panel1-subtitulo / feria-panel2-subtitulo
 *     texto chico debajo del título (ej: un precio). Antes esto solo existía
 *     para panel2 (vía panel2-price); ahora los dos paneles lo admiten.
 *     Default: vacío en panel1 (no se muestra nada), "$15.000" en panel2
 *     (panel2-price/panel2_price se mantienen como alias por compatibilidad).
 *   feria-panel1-icono / feria-panel2-icono
 *     ícono de la medalla (círculo de la cabecera), elegido de una lista fija
 *     de íconos ya incluidos en el componente (no hace falta subir imagen).
 *     Valores posibles: "corazon" | "moneda" | "iglesia" | "puesto" | "comida"
 *     | "caliz" | "estrella". Si no se pasa, panel1 usa "corazon" y panel2
 *     "moneda" (los de siempre). Para un ícono que NO esté en esta lista
 *     (un logo propio, por ejemplo), seguí usando panel1-img/panel2-img
 *     (URL de imagen): reemplaza la medalla entera y tiene prioridad sobre
 *     feria-panelN-icono si se pasan los dos.
 *
 * Ejemplo de cómo está seteado el contenido actual de la feria:
 *   feria-panel1-icono="corazon" feria-panel1-titulo="¿Sos emprendedor?"
 *   feria-panel1-text="Te invitamos a sumarte con tu propuesta a esta feria que nos une y nos fortalece."
 *   feria-panel2-icono="moneda" feria-panel2-titulo="Inscripción"
 *   feria-panel2-text="Valor único + un producto de tu emprendimiento para el bingo."
 *   feria-panel2-subtitulo="$18.000"
 *
 * OTROS ATRIBUTOS
 * - poster            "main" | "feria"   (default "main") con cuál arranca
 * - img-santo         ruta de imagen, o de VIDEO .mp4 (default "san-francisco.png").
 *                     Si la ruta termina en ".mp4" se muestra como video (autoplay,
 *                     loop, muteado, sin controles) en vez de imagen, ocupando el
 *                     mismo marco. Aplica a los dos posters (salvo que se pase
 *                     img-santo-main-desk o img-santo-feria-img, ver abajo).
 * - img-santo-main-desk  ruta de imagen (o .mp4, mismo criterio que img-santo)
 *                     alternativa para el marco de img-santo,
 *                     que se usa SOLO en el poster PRINCIPAL y SOLO en desktop
 *                     (>=769px de ventana). Sirve para tener una versión distinta
 *                     (recortada distinto, por ejemplo) en esa combinación puntual.
 *                     Si no se pasa, se usa img-santo ahí también. En mobile
 *                     (cualquier poster) y en el poster de la feria (cualquier
 *                     tamaño) SIEMPRE se usa img-santo, sin importar este prop.
 * - img-santo-desk-width  ancho del marco SOLO EN DESKTOP, SOLO cuando se pasó
 *                     img-santo-main-desk (si no se pasó esa imagen, este prop
 *                     no hace nada: desktop usa la misma caja que mobile).
 * - img-santo-desk-height alto del marco SOLO EN DESKTOP, mismo alcance que
 *                     el de arriba (pasá SOLO uno de los dos para que escale
 *                     proporcional; los dos juntos se usan tal cual).
 *                     Si NO se pasa NINGUNO de los dos (y sí img-santo-main-desk):
 *                     el ancho del marco en desktop queda igual al de mobile
 *                     (img-santo-width, o el default si tampoco se pasó ese),
 *                     y el alto sale proporcional al tamaño REAL del archivo
 *                     de img-santo-main-desk (no del shape del marco ni de
 *                     img-santo-height, que son para la imagen default).
 * - img-santo-main-desk-top  ajuste fino vertical (CSS margin-top) del marco
 *                     de img-santo (.halo-wrap) SOLO EN DESKTOP (>=769px),
 *                     ej: "20px" (baja) o "-15px" (sube). Aplica siempre que
 *                     se pase, tenga o no imagen propia img-santo-main-desk.
 *                     En mobile no tiene ningún efecto (ahí el marco principal
 *                     no tiene ajuste vertical propio, sigue el grid normal).
 * - img-santo-width   ancho del marco que contiene a img-santo (agranda/achica proporcional
 *                     según la forma), ej: "160px". Aplica a LOS DOS posters.
 * - img-santo-height  alto del marco que contiene a img-santo (mismo comportamiento que arriba)
 *                     (pasá SOLO uno de los dos para que escale proporcional; si pasás
 *                     los dos juntos, se usan tal cual y puede deformar el marco)
 * - img-santo-feria-top  ajuste fino vertical (CSS margin-top) del marco de img-santo
 *                     SOLO en la card de la feria, ej: "20px" (baja) o "-15px" (sube).
 *                     Por defecto está centrado respecto al título+bajada de esa card.
 * - img-santo-feria-img  ruta de imagen (o .mp4, mismo criterio que img-santo)
 *                     alternativa para el marco de img-santo,
 *                     que se usa SOLO en el poster de la FERIA (en cualquier tamaño,
 *                     mobile y desktop). Si no se pasa, se usa img-santo ahí también.
 *                     El poster PRINCIPAL sigue usando siempre img-santo (o
 *                     img-santo-main-desk en desktop), sin importar este prop.
 * - img-santo-main    "false" oculta el marco de img-santo SOLO EN MOBILE (<=768px)
 *                     en el poster PRINCIPAL. En desktop siempre se ve. (default: visible)
 * - img-santo-feria   "false" oculta el marco de img-santo SOLO EN MOBILE (<=768px)
 *                     en el poster de la FERIA. En desktop siempre se ve. (default: visible)
 * - marco-img-santo   "circle" | "square" | "rectangle"  (default "circle")
 *                     forma del marco que contiene a img-santo, en LOS DOS posters.
 *                     "square" es 1:1 con esquinas redondeadas, "rectangle" es 4:3.
 * - img-iglesia       ruta de imagen     (default "iglesia.png") aparece en el
 *                     footer de LOS DOS posters
 * - img-bunting       ruta de imagen     (default "banderines.png") guirnalda
 *                     superpuesta arriba, en LOS DOS posters, con balanceo animado
 * - banderines-movimiento  "slow" | "medium" | "fast"  (default "medium")
 *                     qué tanto se balancean los banderines (guirnalda), en LOS DOS posters.
 *                     "slow" = sutil, "medium" = moderado, "fast" = bien marcado.
 * - main-title-img       URL de imagen que reemplaza el título del poster principal
 * - main-title-img-width  ancho de esa imagen (agranda/achica proporcionalmente), ej: "260px"
 * - main-title-img-height alto de esa imagen (agranda/achica proporcionalmente), ej: "90px"
 *                     (pasando SOLO uno de los dos escala proporcional. Si pasás los DOS
 *                     juntos, se usan como topes (máx. ancho y máx. alto): la imagen
 *                     nunca se deforma ni deja espacio vacío, sea cual sea su proporción
 *                     real; si la proporción real no da para llenar los dos topes a la
 *                     vez, va a respetar el que la achique más)
 * - feria-title-img      URL de imagen que reemplaza el título del poster de la feria
 * - feria-title-img-width  ancho de esa imagen (mismo comportamiento que arriba)
 * - feria-title-img-height alto de esa imagen (mismo comportamiento que arriba)
 * - feria-quote-top   ajuste fino vertical (CSS margin-top) de la frase/bajada
 *                     ("¡Tu emprendimiento puede inspirar...") del poster de la feria,
 *                     SOLO EN DESKTOP (>=769px de ventana). Sirve para subirla
 *                     (valor negativo, ej "-60px") cuando feria-title-img trae
 *                     espacio en blanco incorporado abajo y queda un hueco antes
 *                     de la frase. Por defecto no se aplica.
 * - feria-quote-mobile-top  igual que feria-quote-top pero SOLO EN MOBILE
 *                     (<=768px de ventana). Los dos son independientes: podés
 *                     pasar uno, el otro, los dos, o ninguno.
 * - fecha-ppal        texto de la pastilla de fecha del poster principal
 *                     (default "Domingo 4 de Octubre"). fecha-ppal="" la oculta.
 * - fecha-feria       texto de la pastilla de fecha del poster de la feria
 *                     (default "Domingo 4 de Octubre"). fecha-feria="" la oculta.
 *                     Si se usa main-title-img / feria-title-img, la pastilla de fecha
 *                     correspondiente queda oculta automáticamente.
 * - whatsapp-number   solo dígitos, con código de país (default "5491153133638")
 * - whatsapp-display  texto mostrado en el botón (default "11 5313-3638")
 * - bee-main          "true" muestra abejitas animadas (canvas) volando de forma
 *                      errática por TODA la card del poster PRINCIPAL, por encima
 *                      del resto del contenido. (default: "false", no se muestran)
 * - bee-feria         igual que bee-main, pero para la card de la FERIA.
 * - willow-main       "true" muestra hojitas verdes claras (canvas) flotando al
 *                      viento por TODA la card del poster PRINCIPAL. (default: "false")
 * - willow-feria      igual que willow-main, pero para la card de la FERIA.
 * - luciernaga-main   "true" muestra luciérnagas animadas (canvas): puntitos de
 *                      luz cálida que flotan despacio y van encendiéndose y
 *                      apagándose de a poco (destello lento + parpadeo breve),
 *                      por TODA la card del poster PRINCIPAL. (default: "false")
 * - luciernaga-feria  igual que luciernaga-main, pero para la card de la FERIA.
 *                      Las seis (bee/willow/luciernaga × main/feria) son
 *                      independientes entre sí y se pueden combinar
 *                      (ej: bee-main="true" willow-main="true" juntas en la misma card).
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
    starCream: `<svg viewBox="0 0 24 24" fill="#f1e6cd"><path d="M12 1.5c.7 6.3 2.2 7.8 8.5 8.5-6.3.7-7.8 2.2-8.5 8.5-.7-6.3-2.2-7.8-8.5-8.5C9.8 9.3 11.3 7.8 12 1.5z"/></svg>`,
    speakerOff: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 5"/><path d="M21 9l-5 5"/></svg>`,
    speakerOn: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a9 9 0 0 1 0 12"/></svg>`
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

  // ---------------------------------------------------------------------
  // FX de canvas: abejitas (bee-main / bee-feria) y hojitas de sauce
  // (willow-main / willow-feria) volando por toda la card, dibujadas en un
  // <canvas> transparente superpuesto (pointer-events:none) a cada poster.
  // ---------------------------------------------------------------------
  const BEE_COUNT = 10;
  const LEAF_COUNT = 10;
  const FIREFLY_COUNT = 9;

  function fxRand(min, max) { return min + Math.random() * (max - min); }

  function makeFxParticle(type, w, h) {
    if (type === 'bee') {
      return {
        type,
        x: fxRand(0, w || 300), y: fxRand(0, h || 200),
        angle: fxRand(0, Math.PI * 2),
        dir: 0,
        speed: fxRand(20, 40),
        wobble: fxRand(0, Math.PI * 2),
        wobbleSpeed: fxRand(3.2, 5.6),
        turnTimer: 0,
        turnEvery: fxRand(0.35, 1.1),
        buzzPhase: fxRand(0, Math.PI * 2),
        buzzSpeed: fxRand(15, 24),
        size: fxRand(9, 15),
        wingPhase: fxRand(0, Math.PI * 2)
      };
    }
    // leaf (willow)
    if (type === 'leaf') return {
      type,
      x: fxRand(0, w || 300), y: fxRand(0, h || 200),
      rot: fxRand(0, Math.PI * 2),
      rotSpeed: fxRand(-1.1, 1.1),
      tumble: fxRand(0, Math.PI * 2),
      tumbleSpeed: fxRand(1.1, 2.5),
      driftPhase: fxRand(0, Math.PI * 2),
      driftSpeed: fxRand(0.6, 1.4),
      windX: fxRand(10, 22),
      fallY: fxRand(6, 14),
      swayAmp: fxRand(6, 16),
      size: fxRand(9, 15)
    };
    // firefly (luciérnaga)
    return {
      type,
      x: fxRand(0, w || 300), y: fxRand(0, h || 200),
      angle: fxRand(0, Math.PI * 2),
      turnTimer: 0,
      turnEvery: fxRand(1.6, 3.4),
      speed: fxRand(4, 11),
      glowPhase: fxRand(0, Math.PI * 2),
      glowSpeed: fxRand(0.55, 1.15),
      flickerPhase: fxRand(0, Math.PI * 2),
      flickerSpeed: fxRand(6, 10),
      size: fxRand(2.2, 3.8)
    };
  }

  // El vuelo de la abeja combina 3 movimientos superpuestos para que se vea
  // errático (volando) y no un deslizamiento parejo (caminando):
  // 1) cambios de rumbo frecuentes y bruscos (turnTimer/turnEvery)
  // 2) un "eses" continuo mientras vuela (wobble, afecta el rumbo real)
  // 3) un zumbido/temblor rápido perpendicular al rumbo, solo visual
  //    (buzzPhase, se aplica al dibujar en drawBee, no mueve x/y "de verdad"
  //    así nunca se acumula ni hace que se desvíe del recorrido real)
  function updateBee(p, w, h, dt) {
    p.turnTimer += dt;
    if (p.turnTimer > p.turnEvery) {
      p.turnTimer = 0;
      p.turnEvery = fxRand(0.35, 1.1);
      p.angle += fxRand(-2.3, 2.3);
    }
    p.wobble += p.wobbleSpeed * dt;
    p.buzzPhase += p.buzzSpeed * dt;
    const heading = p.angle + Math.sin(p.wobble) * 0.75;
    p.dir = heading;
    p.x += Math.cos(heading) * p.speed * dt;
    p.y += Math.sin(heading) * p.speed * dt;
    p.wingPhase += dt * 46;
    const margin = p.size * 1.3;
    if (p.x < margin) { p.x = margin; p.angle = Math.PI - p.angle; }
    else if (p.x > w - margin) { p.x = w - margin; p.angle = Math.PI - p.angle; }
    if (p.y < margin) { p.y = margin; p.angle = -p.angle; }
    else if (p.y > h - margin) { p.y = h - margin; p.angle = -p.angle; }
  }

  // Dibuja un ala translúcida tipo "gota" con nervadura, pivotando desde
  // (cx,cy). scaleLen simula el aleteo (se abre/cierra sobre su propio eje).
  function drawBeeWing(ctx, cx, cy, len, wid, scaleLen, tilt) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.scale(1, Math.max(0.12, scaleLen));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wid, -len * 0.32, wid * 0.85, -len * 0.88, 0, -len);
    ctx.bezierCurveTo(-wid * 0.85, -len * 0.88, -wid, -len * 0.32, 0, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, -len);
    g.addColorStop(0, 'rgba(255,255,255,0.12)');
    g.addColorStop(0.55, 'rgba(240,247,255,0.55)');
    g.addColorStop(1, 'rgba(214,232,255,0.25)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = Math.max(0.4, len * 0.045);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.05);
    ctx.lineTo(0, -len * 0.85);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(0.3, len * 0.025);
    ctx.stroke();
    ctx.restore();
  }

  // Abejita "de verdad": cabeza + antenas, tórax peludo, abdomen con
  // franjas negro/dorado (recortadas con clip a la silueta real del
  // abdomen, no franjas rectas sueltas) y dos pares de alas que aletean.
  function drawBee(ctx, p) {
    const s = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.dir || 0);
    // temblor/zumbido rápido, perpendicular al rumbo (solo visual, no mueve
    // la posición real) + un leve "banking" al girar: esto es lo que hace
    // que se vea volando de forma errática y no deslizando/caminando derecho.
    ctx.translate(0, Math.sin(p.buzzPhase) * s * 0.16);
    ctx.rotate(Math.sin(p.buzzPhase * 0.7) * 0.16);

    const flapFront = 0.3 + Math.abs(Math.sin(p.wingPhase)) * 0.7;
    const flapHind = 0.3 + Math.abs(Math.sin(p.wingPhase * 0.92 + 0.7)) * 0.7;
    drawBeeWing(ctx, -s * 0.02, -s * 0.16, s * 0.85, s * 0.38, flapFront, -0.18);
    drawBeeWing(ctx, -s * 0.02, s * 0.16, s * 0.85, s * 0.38, flapFront, 0.18);
    drawBeeWing(ctx, -s * 0.28, -s * 0.12, s * 0.48, s * 0.22, flapHind, -0.12);
    drawBeeWing(ctx, -s * 0.28, s * 0.12, s * 0.48, s * 0.22, flapHind, 0.12);

    // abdomen: corto y rechoncho (nada de "abeja reina" alargada), rayado
    // real recortado a la silueta
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(s * 0.1, 0);
    ctx.bezierCurveTo(s * 0.05, -s * 0.46, -s * 0.55, -s * 0.42, -s * 0.72, 0);
    ctx.bezierCurveTo(-s * 0.55, s * 0.42, s * 0.05, s * 0.46, s * 0.1, 0);
    ctx.closePath();
    const abGrad = ctx.createLinearGradient(-s * 0.72, -s * 0.42, -s * 0.72, s * 0.42);
    abGrad.addColorStop(0, '#4a3a18');
    abGrad.addColorStop(0.5, '#241a0a');
    abGrad.addColorStop(1, '#4a3a18');
    ctx.fillStyle = abGrad;
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#e8b923';
    [-0.1, -0.32, -0.54].forEach(fx => { ctx.fillRect(s * fx - s * 0.09, -s * 0.5, s * 0.15, s); });
    ctx.restore();

    // tórax peludito
    const thGrad = ctx.createRadialGradient(s * 0.14, -s * 0.1, s * 0.04, s * 0.08, 0, s * 0.42);
    thGrad.addColorStop(0, '#6b4a22');
    thGrad.addColorStop(1, '#2a1e0c');
    ctx.beginPath();
    ctx.ellipse(s * 0.08, 0, s * 0.4, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = thGrad;
    ctx.fill();
    // pelusita (motitas claras esparcidas) para dar textura peluda
    ctx.fillStyle = 'rgba(255,214,140,0.35)';
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + 0.4;
      const fx2 = s * 0.08 + Math.cos(ang) * s * 0.22;
      const fy2 = Math.sin(ang) * s * 0.18;
      ctx.beginPath(); ctx.arc(fx2, fy2, s * 0.045, 0, Math.PI * 2); ctx.fill();
    }

    // cabeza + ojo + antenas
    const hx = s * 0.58;
    ctx.beginPath(); ctx.arc(hx, 0, s * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = '#1c140a'; ctx.fill();
    ctx.beginPath(); ctx.arc(hx + s * 0.06, -s * 0.07, s * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    ctx.strokeStyle = '#1c140a';
    ctx.lineWidth = Math.max(0.5, s * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx + s * 0.14, -s * 0.16);
    ctx.quadraticCurveTo(hx + s * 0.48, -s * 0.4, hx + s * 0.55, -s * 0.56);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx + s * 0.14, s * 0.16);
    ctx.quadraticCurveTo(hx + s * 0.48, s * 0.4, hx + s * 0.55, s * 0.56);
    ctx.stroke();

    ctx.restore();
  }

  function updateLeaf(p, w, h, dt) {
    p.driftPhase += p.driftSpeed * dt;
    p.tumble += p.tumbleSpeed * dt;
    const vx = p.windX + Math.sin(p.driftPhase) * p.swayAmp;
    const vy = p.fallY + Math.sin(p.driftPhase * 0.7) * (p.swayAmp * 0.3);
    p.x += vx * dt;
    p.y += vy * dt;
    p.rot += p.rotSpeed * dt;
    const pad = p.size * 2;
    if (p.x > w + pad) p.x = -pad;
    else if (p.x < -pad) p.x = w + pad;
    if (p.y > h + pad) { p.y = -pad; p.x = fxRand(0, w); }
    else if (p.y < -pad) { p.y = h + pad; p.x = fxRand(0, w); }
  }

  // Hojita de sauce: silueta lanceolada angosta (larga y afilada en las dos
  // puntas, como una hoja de sauce real), con nervadura central + secundarias
  // y un leve brillo de borde. "tumble" simula que va girando en el aire: al
  // pasar de canto se angosta (scaleX) y muestra el envés, más pálido.
  function drawLeaf(ctx, p) {
    const s = p.size;
    const flip = Math.cos(p.tumble);
    const scaleX = Math.max(0.12, Math.abs(flip));
    const isBack = flip < 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(scaleX, 1);

    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.34, -s * 0.55, s * 0.36, s * 0.35, 0, s);
    ctx.bezierCurveTo(-s * 0.36, s * 0.35, -s * 0.34, -s * 0.55, 0, -s);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -s, 0, s);
    if (isBack) {
      grad.addColorStop(0, 'rgba(216,227,199,0.92)');
      grad.addColorStop(1, 'rgba(190,205,167,0.92)');
    } else {
      grad.addColorStop(0, 'rgba(197,229,164,0.94)');
      grad.addColorStop(1, 'rgba(149,198,109,0.94)');
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // nervadura central
    ctx.strokeStyle = isBack ? 'rgba(172,186,151,0.7)' : 'rgba(96,150,72,0.75)';
    ctx.lineWidth = Math.max(0.5, s * 0.055);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 0.9);
    ctx.stroke();

    // nervaduras secundarias, parejas a lo largo de toda la hoja, en
    // ángulo hacia la punta (como en una hoja de verdad)
    ctx.lineWidth = Math.max(0.35, s * 0.03);
    [-0.55, -0.2, 0.15, 0.5].forEach(frac => {
      const y0 = frac * s;
      const y1 = y0 - s * 0.24;
      [1, -1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(side * s * 0.24 * (1 - Math.abs(frac) * 0.5), y1);
        ctx.stroke();
      });
    });

    // brillo sutil de borde
    ctx.strokeStyle = 'rgba(255,255,255,0.26)';
    ctx.lineWidth = Math.max(0.4, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.bezierCurveTo(s * 0.26, -s * 0.5, s * 0.28, s * 0.2, 0, s * 0.85);
    ctx.stroke();

    ctx.restore();
  }

  // La luciérnaga flota despacio y sin rumbo fijo (nada de vuelo errático
  // tipo abeja): cambia de dirección de forma suave y esporádica, y da la
  // vuelta al llegar a un borde en vez de rebotar, para que se sienta como
  // que deambula por toda la escena.
  function updateFirefly(p, w, h, dt) {
    p.turnTimer += dt;
    if (p.turnTimer > p.turnEvery) {
      p.turnTimer = 0;
      p.turnEvery = fxRand(1.6, 3.4);
      p.angle += fxRand(-1.3, 1.3);
    }
    p.glowPhase += p.glowSpeed * dt;
    p.flickerPhase += p.flickerSpeed * dt;
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    const pad = p.size * 8;
    if (p.x < -pad) p.x = w + pad;
    else if (p.x > w + pad) p.x = -pad;
    if (p.y < -pad) p.y = h + pad;
    else if (p.y > h + pad) p.y = -pad;
  }

  // El brillo combina dos ondas: una lenta (el "destello" real, sube y baja
  // en un par de segundos) y una rápida y sutil encima (el parpadeo). Se eleva
  // a una potencia para que pase la mayor parte del tiempo casi apagada y
  // "explote" de luz solo en el pico, que es como se ve una luciérnaga de
  // verdad (no una lucecita fija tipo LED). El halo se dibuja en dos capas
  // (glow ancho y núcleo chico) para que tenga cuerpo y no sea un punto plano.
  function drawFirefly(ctx, p) {
    const glow = (Math.sin(p.glowPhase) + 1) / 2;
    const flicker = 0.85 + Math.sin(p.flickerPhase) * 0.15;
    const b = Math.pow(glow, 1.7) * flicker;
    if (b < 0.035) return;
    const s = p.size * (0.7 + b * 0.6);
    ctx.save();
    ctx.translate(p.x, p.y);
    const r = s * 7;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, `rgba(255,248,220,${0.95 * b})`);
    g.addColorStop(0.28, `rgba(255,231,148,${0.5 * b})`);
    g.addColorStop(0.62, `rgba(212,255,150,${0.16 * b})`);
    g.addColorStop(1, 'rgba(212,255,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,240,${Math.min(1, b * 1.15)})`;
    ctx.fill();
    ctx.restore();
  }
  // resize (con devicePixelRatio), población de partículas según qué tipos
  // están activos, y el loop de animación (que se pausa solo si no hay
  // ningún tipo activo, o si la card está oculta por el switcher).
  function createFxController(canvas, frameEl) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let bees = [];
    let leaves = [];
    let fireflies = [];
    let active = { bee: false, willow: false, firefly: false };
    let running = false;
    let lastT = 0;
    let rafId = null;

    function resize() {
      const rect = frameEl.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function populate() {
      if (active.bee && bees.length === 0 && w > 0) {
        for (let i = 0; i < BEE_COUNT; i++) bees.push(makeFxParticle('bee', w, h));
      }
      if (!active.bee) bees = [];
      if (active.willow && leaves.length === 0 && w > 0) {
        for (let i = 0; i < LEAF_COUNT; i++) leaves.push(makeFxParticle('leaf', w, h));
      }
      if (!active.willow) leaves = [];
      if (active.firefly && fireflies.length === 0 && w > 0) {
        for (let i = 0; i < FIREFLY_COUNT; i++) fireflies.push(makeFxParticle('firefly', w, h));
      }
      if (!active.firefly) fireflies = [];
    }

    function step(t) {
      if (!running) return;
      if (!lastT) lastT = t;
      let dt = (t - lastT) / 1000;
      lastT = t;
      if (dt > 0.1) dt = 0.1;
      ctx.clearRect(0, 0, w, h);
      if (!frameEl.classList.contains('hidden') && w > 0 && h > 0) {
        if (active.bee) { if (!bees.length) populate(); bees.forEach(p => { updateBee(p, w, h, dt); drawBee(ctx, p); }); }
        if (active.willow) { if (!leaves.length) populate(); leaves.forEach(p => { updateLeaf(p, w, h, dt); drawLeaf(ctx, p); }); }
        if (active.firefly) { if (!fireflies.length) populate(); fireflies.forEach(p => { updateFirefly(p, w, h, dt); drawFirefly(ctx, p); }); }
      }
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (running) return;
      running = true;
      lastT = 0;
      rafId = requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (window.ResizeObserver) {
      new ResizeObserver(() => resize()).observe(frameEl);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    return {
      setTypes(types) {
        const wasActive = active.bee || active.willow || active.firefly;
        active = types;
        if (w === 0) resize();
        populate();
        const isActive = active.bee || active.willow || active.firefly;
        if (isActive && !wasActive) start();
        else if (!isActive && wasActive) stop();
      }
    };
  }

  const CARD_DEFS = [
    { id: 'card1', color: 'olive', icon: ICONS.chalice, title: 'Misa', text: 'Comenzamos juntos celebrando a nuestro querido San Francisco.', tag: '11:00 hs' },
    { id: 'card2', color: 'pink', icon: ICONS.stall, title: 'Feria & Bingo', text: 'Emprendedores y bingo familiar en el colegio, Calle 52 casi 8 · Acceso 2.', tag: '12:30 a 17:00 hs' },
    { id: 'card3', color: 'teal', icon: ICONS.food, title: 'Buffet', text: 'Habrá cosas ricas para comer durante toda la tarde.', tag: 'Todo el día' }
  ];
  // Íconos disponibles para feria-panel1-icono / feria-panel2-icono (ver doc arriba).
  const MEDAL_ICONS = {
    corazon: ICONS.hearts,
    moneda: ICONS.coin,
    iglesia: ICONS.church,
    puesto: ICONS.stall,
    comida: ICONS.food,
    caliz: ICONS.chalice,
    estrella: ICONS.starGold
  };
  const PANEL_DEFS = [
    { id: 'panel1', aliasId: 'feria-panel1', icon: ICONS.hearts, title: '¿Sos emprendedor?', text: 'Te invitamos a sumarte con tu propuesta a esta feria que nos une y nos fortalece.' },
    { id: 'panel2', aliasId: 'feria-panel2', icon: ICONS.coin, title: 'Inscripción', text: 'Valor único + un producto de tu emprendimiento para el bingo.', hasPrice: true, price: '$15.000' }
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
      /* En mobile (<=768px), la card ocupa como máximo el 95% del ANCHO DE
         PANTALLA (viewport), sea cual sea el --cartel-max-width que se haya
         puesto (pensado normalmente para desktop) y sea cual sea el ancho del
         contenedor donde esté embebida. Uso min() con var(--cartel-max-width)
         para que, si ese valor ya es menor a 95vw, se respete el menor de los
         dos — nunca hace que la card sea MÁS ancha de lo que ya sería sin esta
         regla, solo agrega un techo extra en mobile. Aplica igual a los dos
         posters porque es una regla de :host (afecta a todo el componente).
         El !important es para que gane incluso si el sitio que lo envuelve
         define su propio ancho para la etiqueta <cartel-evento> desde afuera. */
      @media (max-width:768px){
        :host{ max-width:min(95vw, var(--cartel-max-width, 95vw)) !important; margin-left:auto; margin-right:auto; }
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
        --sway-amt:2.4deg;
        animation:bunting-sway 4s ease-in-out infinite;
      }
      /* banderines-movimiento="slow|medium|fast": controla amplitud (grados de
         rotación) y velocidad del balanceo de la guirnalda. Default: medium. */
      .bunting-wrap.sway-slow{ --sway-amt:1.2deg; animation-duration:5.5s; }
      .bunting-wrap.sway-medium{ --sway-amt:2.4deg; animation-duration:4s; }
      .bunting-wrap.sway-fast{ --sway-amt:4.5deg; animation-duration:2.6s; }
      .bunting-wrap img{ display:block; width:100%; height:auto; }
      @keyframes bunting-sway{
        0%,100%{ transform:rotate(calc(var(--sway-amt) * -1)) translateY(0); }
        25%{ transform:rotate(calc(var(--sway-amt) * 0.6)) translateY(-1.5%); }
        50%{ transform:rotate(calc(var(--sway-amt) * -0.5)) translateY(0); }
        75%{ transform:rotate(var(--sway-amt)) translateY(-1.5%); }
      }
      .bunting-fallback{ position:absolute; top:0; left:0; width:100%; height:clamp(20px,4cqw,52px); display:flex; justify-content:space-between; padding:0 clamp(10px,2cqw,26px); }
      .bunting-fallback[hidden]{ display:none; }
      .bunting-fallback span{ border-left:clamp(9px,1.5cqw,20px) solid transparent; border-right:clamp(9px,1.5cqw,20px) solid transparent; border-top:clamp(16px,2.8cqw,36px) solid var(--c); opacity:.85; }

      .poster{ position:relative; z-index:2; width:100%; height:100%; display:grid; background:transparent; }
      @media (max-width:768px){ .poster{ height:auto; } }

      /* bee-main/bee-feria/willow-main/willow-feria: canvas transparente que
         cubre TODA la card (por encima del contenido), donde se dibujan las
         abejitas y/o hojitas animadas. pointer-events:none para no bloquear
         clicks/hover del contenido de abajo. Se activa/desactiva por JS
         (createFxController) según esos atributos, no por CSS. */
      .fx-canvas{ position:absolute; inset:0; width:100%; height:100%; z-index:10; pointer-events:none; }

      /* img-santo-main="false" / img-santo-feria="false": oculta el marco de
         img-santo SOLO en mobile (<=768px). En desktop nunca se oculta. */
      @media (max-width:768px){
        .halo-wrap.hide-mobile, .feria-portrait.hide-mobile{ display:none; }
      }

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

      /* Tamaño del marco (.halo-wrap): se setea vía custom properties (--santo-*)
         en vez de estilos inline directos en width/height/aspect-ratio, para
         poder pisarlas SOLO en desktop (ver media query más abajo) cuando se
         usa img-santo-main-desk + img-santo-desk-width/-height. Los valores
         de acá adentro son el fallback de siempre (default del marco, o lo
         que ponga img-santo-width/-height, seteado por JS). */
      .halo-wrap{ grid-area:halo; position:relative; justify-self:center; align-self:center;
        width:var(--santo-w, clamp(110px,22cqw,240px)); max-width:var(--santo-mw, none);
        height:var(--santo-h, auto); aspect-ratio:var(--santo-ar, 1/1); }
      .halo-wrap.shape-rectangle{ width:var(--santo-w, clamp(130px,26cqw,280px)); aspect-ratio:var(--santo-ar, 4/3); }
      /* img-santo-desk-width / img-santo-desk-height (o, si no se pasan, el
         ancho de siempre + el alto real de img-santo-main-desk): pisa el
         tamaño de arriba SOLO en desktop. Si no hay valores --santo-desk-*
         (no se pasó img-santo-main-desk), cae en los de siempre sin cambios. */
      @media (min-width:769px){
        .halo-wrap{
          width:var(--santo-desk-w, var(--santo-w, clamp(110px,22cqw,240px)));
          max-width:var(--santo-desk-mw, var(--santo-mw, none));
          height:var(--santo-desk-h, var(--santo-h, auto));
          aspect-ratio:var(--santo-desk-ar, var(--santo-ar, 1/1));
          margin-top:var(--santo-desk-mt, 0);
        }
        .halo-wrap.shape-rectangle{
          width:var(--santo-desk-w, var(--santo-w, clamp(130px,26cqw,280px)));
          aspect-ratio:var(--santo-desk-ar, var(--santo-ar, 4/3));
        }
      }
      .halo-glow{ position:absolute; inset:-14%; border-radius:50%; background:radial-gradient(circle, rgba(230,190,90,0.65) 0%, rgba(230,190,90,0.0) 70%); filter:blur(2px); animation:pulse 4.5s ease-in-out infinite; }
      .halo-wrap.shape-square .halo-glow, .halo-wrap.shape-rectangle .halo-glow{ inset:-8%; border-radius:clamp(12px,2cqw,22px); }
      @keyframes pulse{ 0%,100%{ transform:scale(1); opacity:.9; } 50%{ transform:scale(1.08); opacity:1; } }
      .portrait-frame{ position:absolute; inset:0; border-radius:50%; background:linear-gradient(145deg,#f3e6c6,#dcc697); box-shadow:8px 8px 18px var(--shadow-dark), -6px -6px 16px var(--shadow-light); display:flex; align-items:center; justify-content:center; overflow:hidden; border:4px solid rgba(255,255,255,0.6); }
      .halo-wrap.shape-square .portrait-frame, .halo-wrap.shape-rectangle .portrait-frame{ border-radius:clamp(12px,2cqw,22px); }
      .portrait-frame img, .portrait-frame video{ width:100%; height:100%; object-fit:contain; transform:scale(1.12) translateY(4%); }
      /* img-santo-main-desk: img-santo-main-desktop/-mobile son dos elementos
         (<img> o <video>) superpuestos en el mismo marco; solo se muestra uno
         según el ancho de ventana (mismo patrón que .bi-desktop/.bi-mobile en
         las subcards, ver más abajo). Cada slot (desktop/mobile) tiene ADEMÁS
         una versión <img> y una <video>: la clase "media-on" (puesta por JS
         según la extensión del archivo, ver _setSantoMedia) decide cuál de
         las dos se usa dentro del slot que corresponda por ancho de ventana. */
      .portrait-frame .santo-desktop, .portrait-frame .santo-mobile{ display:none; }
      @media (min-width:769px){ .portrait-frame .santo-desktop.media-on{ display:block; } }
      @media (max-width:768px){ .portrait-frame .santo-mobile.media-on{ display:block; } }
      .fallback-icon{ width:56%; height:56%; opacity:.35; }
      /* Botón traslucido de mute/unmute, pegado al extremo inferior derecho
         del marco (halo-wrap / feria-portrait) que tiene el video del santo.
         Solo se muestra cuando ese marco está mostrando un .mp4 (lo
         prende/apaga JS con la clase "show", ver _updateAudioToggle). */
      .audio-toggle{ position:absolute; right:4%; bottom:4%; width:26%; max-width:34px; min-width:22px; aspect-ratio:1/1; border-radius:50%; border:1px solid rgba(255,255,255,0.35); background:rgba(20,16,8,0.45); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); display:none; align-items:center; justify-content:center; cursor:pointer; padding:0; z-index:6; box-shadow:0 2px 6px rgba(0,0,0,0.25); }
      .audio-toggle.show{ display:flex; }
      .audio-toggle svg{ width:58%; height:58%; }
      .audio-toggle .icon-on{ display:none; }
      .audio-toggle.is-on .icon-off{ display:none; }
      .audio-toggle.is-on .icon-on{ display:block; }
      .sparkle{ position:absolute; aspect-ratio:1/1; border-radius:50%; pointer-events:none;
        background:radial-gradient(circle at 35% 32%, #fff8e4 0%, var(--gold-soft) 42%, rgba(230,190,90,0) 74%);
        box-shadow:0 0 8px 1px rgba(230,190,90,0.5), 0 0 2px rgba(255,255,255,0.6);
        animation:twinkle 3.4s ease-in-out infinite; }
      @keyframes twinkle{ 0%,100%{ opacity:.18; transform:scale(.55) rotate(0deg); } 50%{ opacity:1; transform:scale(1.15) rotate(12deg); } }

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
      @media (max-width:768px){ .info-row{ flex-direction:column; } .info-card{ flex:1 1 auto; } .info-card .top{ flex:1 1 auto; } }
      .info-card{ position:relative; flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:space-between; border-radius:clamp(14px,1.8cqw,24px); padding:clamp(12px,2cqw,24px); background:linear-gradient(150deg,#f7ecd6,#e7d6ac); box-shadow:8px 8px 18px var(--shadow-dark), -6px -6px 14px var(--shadow-light); overflow:hidden; transition:transform .25s ease, box-shadow .25s ease; }
      .info-card:hover{ transform:translateY(-5px); box-shadow:11px 15px 26px var(--shadow-dark), -7px -7px 18px var(--shadow-light); }
      .info-card .top{ display:flex; flex-direction:column; gap:clamp(6px,1cqw,12px); min-height:0; flex:1; }
      .info-card .head{ display:flex; align-items:center; gap:clamp(8px,1.4cqw,16px); }
      .info-card .medal{ width:clamp(36px,5.6cqw,66px); height:clamp(36px,5.6cqw,66px); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:inset 3px 3px 7px rgba(0,0,0,0.18), inset -3px -3px 7px rgba(255,255,255,0.35); }
      .info-card .medal svg{ width:52%; height:52%; }
      .info-card .medal.img-medal{ overflow:hidden; box-shadow:none; }
      .info-card .medal.img-medal img{ width:100%; height:100%; object-fit:cover; }
      .info-card .medal.c-olive{ background:var(--olive); } .info-card .medal.c-pink{ background:var(--pink); } .info-card .medal.c-teal{ background:var(--teal); }
      .info-card h3{ margin:0; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(18px,2.8cqw,27px); color:var(--ink); }
      .info-card p{ margin:0; font-size:clamp(13px,1.9cqw,18px); line-height:1.38; color:var(--ink-soft); font-weight:600; letter-spacing:.1px; overflow-wrap:break-word; }
      .info-card .body-img{ flex:1; min-height:0; display:flex; }
      .info-card .body-img img{ display:none; width:100%; height:auto; max-height:clamp(110px,34cqw,240px); object-fit:contain; border-radius:10px; margin:auto; }
      @media (min-width:769px){ .info-card .body-img .bi-desktop{ display:block; } }
      @media (max-width:768px){ .info-card .body-img .bi-mobile{ display:block; } }
      .info-card .tag{ align-self:flex-start; flex-shrink:0; margin-top:clamp(6px,1.1cqw,14px); padding:clamp(5px,.8cqw,9px) clamp(10px,1.5cqw,16px); border-radius:12px; font-size:clamp(11px,1.4cqw,15px); font-weight:700; color:#fff; }
      .info-card .tag.c-olive{ background:var(--olive); } .info-card .tag.c-pink{ background:var(--pink); } .info-card .tag.c-teal{ background:var(--teal); }

      /* brillo/reluciente: una franja de luz que recorre cada subcard cada
         tanto, para darles más vida. z-index alto para pasar por encima del
         contenido, pointer-events:none para no interferir con clicks/hover. */
      .info-card::before, .feria-panel::before{
        content:''; position:absolute; top:0; left:-60%; width:35%; height:100%;
        background:linear-gradient(75deg, transparent 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.55) 55%, transparent 100%);
        transform:skewX(-20deg); pointer-events:none; z-index:3;
        animation:card-shine 5.5s ease-in-out infinite;
      }
      @keyframes card-shine{
        0%{ left:-60%; opacity:0; }
        6%{ opacity:1; }
        20%{ left:130%; opacity:0; }
        100%{ left:130%; opacity:0; }
      }
      .info-row .info-card:nth-child(1)::before{ animation-delay:.2s; }
      .info-row .info-card:nth-child(2)::before{ animation-delay:2s; }
      .info-row .info-card:nth-child(3)::before{ animation-delay:3.8s; }

      .footer-main{
        grid-area:footer; display:flex; align-items:center; justify-content:space-between; gap:10px;
        margin:0 -4cqw -3.2cqw -4cqw; padding:clamp(6px,1cqw,12px) 4cqw;
        background:linear-gradient(90deg,var(--terracotta) 0%, var(--terracotta-deep) 100%);
      }
      .footer-main .parish{ display:flex; align-items:center; gap:clamp(8px,1.3cqw,14px); min-width:0; }
      .footer-main .parish svg{ width:clamp(16px,2.4cqw,28px); height:clamp(16px,2.4cqw,28px); flex-shrink:0; }
      .footer-main .parish img{ width:clamp(46px,7.6cqw,98px); height:clamp(38px,6.2cqw,80px); object-fit:contain; flex-shrink:0; }
      .footer-main .parish-text{ display:flex; flex-direction:column; gap:1px; }
      .footer-main .parish h4{ margin:0; color:#fbeedb; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(11px,1.7cqw,15px); letter-spacing:.2px; line-height:1.15; }
      .footer-main .parish span{ display:block; color:#f3d9c2; font-size:clamp(8px,1.1cqw,11px); font-weight:500; line-height:1.15; }
      .footer-main .welcome{ flex-shrink:0; padding:clamp(4px,.8cqw,8px) clamp(9px,1.3cqw,14px); border-radius:999px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.3); color:#fff2df; font-family:'Fraunces',serif; font-style:italic; font-weight:600; font-size:clamp(10px,1.4cqw,14px); white-space:nowrap; }

      /* ================= POSTER 2: FERIA DE EMPRENDEDORES ================= */
      #poster-feria{
        padding:3.2cqw 4cqw; gap:0.6cqw 3cqw;
        grid-template-columns:1fr;
        grid-template-rows:auto auto auto auto auto auto;
        grid-template-areas:"portrait" "top" "quote" "panels" "whatsapp" "footer";
      }
      @media (min-width:769px){
        #poster-feria{
          gap:1.4cqw 3cqw;
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
      .main-title-img img.sized, .feria-title-img img.sized{ max-width:100%; max-height:none; }
      @media (min-width:769px){ .main-title-img img, .feria-title-img img{ margin:0; } }
      .feria-date{ display:inline-flex; align-items:center; gap:8px; margin-top:clamp(5px,1cqw,12px); padding:clamp(5px,.8cqw,9px) clamp(10px,1.5cqw,17px); border-radius:12px; background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(10px); }
      .feria-date[hidden]{ display:none; }
      .feria-date span{ font-weight:700; font-size:clamp(11px,1.4cqw,15px); color:var(--mkt-cream); }

      .feria-portrait{ position:relative; grid-area:portrait; justify-self:center; align-self:center; width:clamp(64px,12cqw,120px); aspect-ratio:1/1; border-radius:50%; background:linear-gradient(150deg,#3a4d2f,#233318); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); border:3px solid rgba(255,246,224,0.18); display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .feria-portrait.shape-rectangle{ width:clamp(78px,15cqw,150px); aspect-ratio:4/3; }
      .feria-portrait.shape-square, .feria-portrait.shape-rectangle{ border-radius:clamp(8px,1.4cqw,16px); }
      .feria-portrait img, .feria-portrait video{ width:100%; height:100%; object-fit:contain; transform:scale(1.15) translateY(3%); }
      /* Igual que arriba: img-santo-feria tiene una versión <img> y una <video>
         superpuestas; "media-on" (JS) decide cuál se muestra según la extensión. */
      .feria-portrait .santo-feria{ display:none; }
      .feria-portrait .santo-feria.media-on{ display:block; }

      .feria-quote{ grid-area:quote; align-self:center; text-align:center; font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:clamp(15px,2.6cqw,22px); line-height:1.35; color:var(--mkt-cream); display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; margin-top:var(--feria-quote-mobile-top,0); }
      @media (min-width:769px){ .feria-quote{ text-align:left; font-size:clamp(13px,1.9cqw,19px); -webkit-line-clamp:3; margin-top:var(--feria-quote-top,0); } }
      .feria-quote b{ color:var(--mkt-gold-soft); font-weight:600; }

      .feria-panels{ grid-area:panels; display:flex; gap:clamp(10px,1.4cqw,20px); min-height:0; }
      @media (max-width:768px){ .feria-panels{ flex-direction:column; } .feria-panel{ flex:1 1 auto; } .feria-panel .top{ flex:1 1 auto; } }
      .feria-panel{ position:relative; flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:center; border-radius:clamp(14px,1.8cqw,22px); padding:clamp(10px,1.8cqw,22px); background:var(--mkt-glass); border:1px solid var(--mkt-glass-border); backdrop-filter:blur(8px); box-shadow:8px 8px 18px var(--mkt-shadow-dark), -6px -6px 14px var(--mkt-shadow-light); overflow:hidden; transition:transform .25s ease, box-shadow .25s ease; }
      .feria-panel:hover{ transform:translateY(-5px); box-shadow:11px 15px 26px var(--mkt-shadow-dark), -7px -7px 18px rgba(255,255,255,0.08); }
      .feria-panel .top{ display:flex; flex-direction:column; gap:clamp(4px,.8cqw,10px); flex:1; min-height:0; }
      .feria-panel .head{ display:flex; align-items:center; gap:clamp(6px,1.1cqw,12px); }
      .feria-panel .medal{ width:clamp(30px,4.6cqw,58px); height:clamp(30px,4.6cqw,58px); border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--mkt-gold); flex-shrink:0; box-shadow:inset 3px 3px 6px rgba(0,0,0,0.25), inset -3px -3px 6px rgba(255,255,255,0.2); }
      .feria-panel .medal svg{ width:50%; height:50%; }
      .feria-panel .medal.img-medal{ overflow:hidden; box-shadow:none; background:none; }
      .feria-panel .medal.img-medal img{ width:100%; height:100%; object-fit:cover; }
      .feria-panel h3{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(16px,2.4cqw,24px); }
      .feria-panel p{ margin:0; color:#e4dcc4; font-size:clamp(12px,1.8cqw,16px); line-height:1.4; font-weight:600; letter-spacing:.1px; overflow-wrap:break-word; }
      .feria-panel .body-img{ flex:1; min-height:0; display:flex; }
      .feria-panel .body-img img{ display:none; width:100%; height:auto; max-height:clamp(100px,30cqw,220px); object-fit:contain; border-radius:10px; margin:auto; }
      @media (min-width:769px){ .feria-panel .body-img .bi-desktop{ display:block; } }
      @media (max-width:768px){ .feria-panel .body-img .bi-mobile{ display:block; } }
      .feria-panel .price{ font-family:'Fraunces',serif; font-weight:700; font-size:clamp(17px,2.8cqw,27px); color:var(--mkt-gold-soft); }
      .feria-panels .feria-panel:nth-child(1)::before{ animation-delay:1.1s; }
      .feria-panels .feria-panel:nth-child(2)::before{ animation-delay:3.4s; }

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
      .footer-feria .parish img{ width:clamp(36px,6.4cqw,84px); height:clamp(28px,5cqw,68px); object-fit:contain; flex-shrink:0; }
      .footer-feria .parish-text{ display:flex; flex-direction:column; gap:1px; }
      .footer-feria .parish h4{ margin:0; color:var(--mkt-cream); font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(10px,1.5cqw,14px); line-height:1.15; }
      .footer-feria .parish span{ display:block; color:#c9c0a6; font-size:clamp(8px,1cqw,10px); line-height:1.15; }
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
            <div class="portrait-frame">
              <img id="img-santo-main-desktop" class="santo-desktop" alt="San Francisco de Asís">
              <video id="img-santo-main-desktop-vid" class="santo-desktop" muted loop autoplay playsinline></video>
              <img id="img-santo-main-mobile" class="santo-mobile" alt="San Francisco de Asís">
              <video id="img-santo-main-mobile-vid" class="santo-mobile" muted loop autoplay playsinline></video>
            </div>
            <div class="sparkle" style="width:6%; top:-4%; left:14%; animation-delay:.2s;"></div>
            <div class="sparkle" style="width:9%; top:20%; left:-8%; animation-delay:1.3s;"></div>
            <div class="sparkle" style="width:5%; bottom:-2%; right:-4%; animation-delay:2.2s;"></div>
            <div class="sparkle" style="width:4%; top:6%; right:6%; animation-delay:.8s;"></div>
            <div class="sparkle" style="width:7%; bottom:8%; left:-4%; animation-delay:2.8s;"></div>
            <div class="sparkle" style="width:5%; top:46%; left:-10%; animation-delay:1.8s;"></div>
            <div class="sparkle" style="width:4%; bottom:-4%; right:18%; animation-delay:.5s;"></div>
            <div class="sparkle" style="width:3.5%; top:32%; right:-9%; animation-delay:1.6s;"></div>
            <button type="button" id="audio-toggle-main" class="audio-toggle" aria-label="Activar o desactivar el sonido">
              <span class="icon-off">${ICONS.speakerOff}</span><span class="icon-on">${ICONS.speakerOn}</span>
            </button>
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
            <div class="parish"><img id="img-iglesia-main" alt=""><div class="parish-text"><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
            <div class="welcome">¡Te esperamos!</div>
          </div>
        </div>
        <canvas class="fx-canvas" id="fx-canvas-main" aria-hidden="true"></canvas>
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
          <div class="feria-portrait"><img id="img-santo-feria" class="santo-feria" alt="San Francisco de Asís"><video id="img-santo-feria-vid" class="santo-feria" muted loop autoplay playsinline></video><button type="button" id="audio-toggle-feria" class="audio-toggle" aria-label="Activar o desactivar el sonido"><span class="icon-off">${ICONS.speakerOff}</span><span class="icon-on">${ICONS.speakerOn}</span></button></div>
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
            <div class="parish"><img id="img-iglesia-feria" alt=""><div class="parish-text"><h4>Parroquia San Luis Gonzaga</h4><span>Villa Elisa</span></div></div>
            <div class="addr">${ICONS.pin} Calle 8 / 52 y 53</div>
          </div>
        </div>
        <canvas class="fx-canvas" id="fx-canvas-feria" aria-hidden="true"></canvas>
      </div>
    </div>
  `;

  class CartelEvento extends HTMLElement {
    static get observedAttributes() {
      return [
        'poster', 'img-santo', 'img-santo-main-desk', 'img-santo-desk-width', 'img-santo-desk-height', 'img-santo-main-desk-top', 'img-santo-width', 'img-santo-height', 'img-santo-feria-top', 'img-santo-feria-img', 'img-santo-main', 'img-santo-feria', 'marco-img-santo', 'img-iglesia', 'img-bunting', 'banderines-movimiento',
        'whatsapp-number', 'whatsapp-display', 'panel2-price', 'panel2_price',
        'feria-title', 'feria-eyebrow', 'feria-title-img', 'feria-title-img-width', 'feria-title-img-height', 'feria-quote-top', 'feria-quote-mobile-top',
        'main-title-img', 'main-title-img-width', 'main-title-img-height',
        'fecha-ppal', 'fecha-feria',
        'bee-main', 'bee-feria', 'willow-main', 'willow-feria', 'luciernaga-main', 'luciernaga-feria',
        ...ALL_DEFS.flatMap(def => SLOT_ATTR_SUFFIXES.flatMap(suf => [`${def.id}-${suf}`, `${def.id}_${suf}`])),
        ...PANEL_DEFS.flatMap(def => ['titulo', 'text', 'subtitulo', 'icono'].flatMap(suf => [`${def.aliasId}-${suf}`, `${def.aliasId}_${suf}`]))
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      // Para saber, en cualquier momento, cuál de los dos videos del poster
      // principal (desktop/mobile) es "el visible" y así el botón de audio
      // sepa a cuál controlar (ver _mainActiveVideo). El CSS ya resuelve solo
      // el cambio de tamaño de ventana; esto es lo único que necesita JS.
      this._deskMq = window.matchMedia ? window.matchMedia('(min-width:769px)') : null;
    }

    connectedCallback() {
      if (!this._rendered) {
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this._rendered = true;
        this._wire();
        if (this._deskMq) {
          const onChange = () => this._updateAudioToggles();
          if (this._deskMq.addEventListener) this._deskMq.addEventListener('change', onChange);
          else if (this._deskMq.addListener) this._deskMq.addListener(onChange);
        }
      }
      this._applyImages();
      this._applyPortraitShape();
      this._applyPortraitSize();
      this._applySantoMobileVisibility();
      this._applyBuntingSway();
      this._applyFeriaQuoteAdjust();
      this._applyPoster();
      this._applyWhatsapp();
      this._renderSlots();
      this._renderFeriaTitle();
      this._renderMainTitle();
      this._updateAudioToggles();
      this._applyFx();
    }

    attributeChangedCallback() {
      if (!this._rendered) return;
      this._applyImages();
      this._applyPortraitShape();
      this._applyPortraitSize();
      this._applySantoMobileVisibility();
      this._applyBuntingSway();
      this._applyFeriaQuoteAdjust();
      this._applyPoster();
      this._applyWhatsapp();
      this._renderSlots();
      this._renderFeriaTitle();
      this._renderMainTitle();
      this._updateAudioToggles();
      this._applyFx();
    }

    _wire() {
      const root = this.shadowRoot;
      root.getElementById('tab-main').addEventListener('click', () => this.setAttribute('poster', 'main'));
      root.getElementById('tab-feria').addEventListener('click', () => this.setAttribute('poster', 'feria'));

      // Fallback a ícono si el <img> o el <video> del santo no cargan (404,
      // formato no soportado, etc.). Se usa el className actual del elemento
      // que falló (en vez de una lista fija) porque ahora cada slot tiene dos
      // variantes (img/video) y la que está activa lleva además la clase
      // "media-on" (ver _setSantoMedia): copiándola tal cual, el ícono de
      // reemplazo queda visible en el slot/breakpoint correcto sin duplicar
      // esa lógica acá.
      const wireSaintFallback = (id, icon) => {
        const el = root.getElementById(id);
        if (!el) return;
        el.addEventListener('error', () => {
          el.replaceWith(Object.assign(document.createElement('div'), { className: `fallback-icon ${el.className}`, innerHTML: icon }));
          this._updateAudioToggles();
        });
      };
      wireSaintFallback('img-santo-main-desktop', ICONS.saint);
      wireSaintFallback('img-santo-main-desktop-vid', ICONS.saint);
      wireSaintFallback('img-santo-main-mobile', ICONS.saint);
      wireSaintFallback('img-santo-main-mobile-vid', ICONS.saint);
      wireSaintFallback('img-santo-feria', ICONS.saintLight);
      wireSaintFallback('img-santo-feria-vid', ICONS.saintLight);

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

      // Botón traslucido de audio: mutea/desmutea el video del santo que
      // esté visible en ese momento (ver _mainActiveVideo para el poster
      // principal, que depende del ancho de ventana; la feria tiene un
      // único video posible).
      const wireAudioToggle = (btnId, getVideo) => {
        const btn = root.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const vid = getVideo();
          if (!vid) return;
          vid.muted = !vid.muted;
          if (!vid.muted) {
            const p = vid.play();
            if (p && p.catch) p.catch(() => {});
          }
          this._updateAudioToggles();
        });
      };
      wireAudioToggle('audio-toggle-main', () => this._mainActiveVideo());
      wireAudioToggle('audio-toggle-feria', () => {
        const v = root.getElementById('img-santo-feria-vid');
        return (v && v.classList.contains('media-on')) ? v : null;
      });
    }

    // Devuelve el <video> del poster principal que está realmente visible
    // ahora mismo (desktop o mobile, según el ancho de ventana), solo si ese
    // slot está en modo video (media-on). null si en este momento se está
    // mostrando una imagen (no un video) o no hay ninguno.
    _mainActiveVideo() {
      const root = this.shadowRoot;
      const isDesktop = this._deskMq ? this._deskMq.matches : (window.innerWidth >= 769);
      const el = root.getElementById(isDesktop ? 'img-santo-main-desktop-vid' : 'img-santo-main-mobile-vid');
      return (el && el.classList.contains('media-on')) ? el : null;
    }

    _updateAudioToggle(btnId, videoEl) {
      const btn = this.shadowRoot.getElementById(btnId);
      if (!btn) return;
      btn.classList.toggle('show', !!videoEl);
      btn.classList.toggle('is-on', !!videoEl && !videoEl.muted);
    }

    // Refresca los dos botones de audio: se llama después de cada render
    // (attributeChangedCallback / connectedCallback) y cuando cambia el
    // breakpoint desktop/mobile, porque eso puede cambiar cuál video del
    // poster principal es "el visible" sin que haya cambiado ningún atributo.
    _updateAudioToggles() {
      this._updateAudioToggle('audio-toggle-main', this._mainActiveVideo());
      const feriaVid = this.shadowRoot.getElementById('img-santo-feria-vid');
      this._updateAudioToggle('audio-toggle-feria', (feriaVid && feriaVid.classList.contains('media-on')) ? feriaVid : null);
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

    // img-santo / img-santo-main-desk / img-santo-feria-img ahora aceptan,
    // además de imagen, un archivo .mp4: si la ruta termina en .mp4 (con o
    // sin query/hash después), se usa el <video> del slot en vez del <img>.
    _isVideoSrc(src) {
      return /\.mp4(?:[?#]|$)/i.test(src || '');
    }

    // Análogo a _setSrcSafe pero para un slot que tiene DOS elementos
    // superpuestos (<img id> / <video id>-vid, ver el HTML y el CSS de
    // .santo-desktop/.santo-mobile/.santo-feria): según la extensión de
    // "src" activa uno y apaga el otro con la clase "media-on" (mismo
    // chequeo de "¿existe el elemento?" que _setSrcSafe, por si ya fue
    // reemplazado por el ícono de fallback tras un error previo).
    _setSantoMedia(imgId, vidId, src) {
      const root = this.shadowRoot;
      const isVideo = this._isVideoSrc(src);
      const imgEl = root.getElementById(imgId);
      const vidEl = root.getElementById(vidId);
      if (imgEl) {
        imgEl.classList.toggle('media-on', !isVideo);
        if (!isVideo) imgEl.src = src;
      }
      if (vidEl) {
        vidEl.classList.toggle('media-on', isVideo);
        if (isVideo) {
          if (vidEl.getAttribute('src') !== src) vidEl.src = src;
          const playPromise = vidEl.play();
          if (playPromise && playPromise.catch) playPromise.catch(() => {});
        }
      }
    }

    _applyImages() {
      const santo = this.getAttribute('img-santo') || 'san-francisco.png';
      // img-santo-main-desk: si viene, reemplaza a img-santo SOLO en el <img>
      // que se ve en desktop dentro del poster principal (ver media queries
      // .santo-desktop/.santo-mobile en el CSS). El resto (mobile del poster
      // principal, y el poster de la feria en cualquier tamaño) sigue usando
      // siempre img-santo.
      const santoMainDesk = this.getAttribute('img-santo-main-desk') || santo;
      // img-santo-feria-img: si viene, reemplaza a img-santo SOLO en el <img>
      // del poster de la FERIA (mobile y desktop). El poster principal sigue
      // usando siempre img-santo (o img-santo-main-desk en su caso).
      const santoFeria = this.getAttribute('img-santo-feria-img') || santo;
      const iglesia = this.getAttribute('img-iglesia') || 'iglesia.png';
      const bunting = this.getAttribute('img-bunting') || 'banderines.png';
      this._setSantoMedia('img-santo-main-desktop', 'img-santo-main-desktop-vid', santoMainDesk);
      this._setSantoMedia('img-santo-main-mobile', 'img-santo-main-mobile-vid', santo);
      this._setSantoMedia('img-santo-feria', 'img-santo-feria-vid', santoFeria);
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
    // Si se pasan los DOS, ya no se usan tal cual (eso deformaba en mobile: el
    // ancho se achicaba para no desbordar pero el alto quedaba fijo). Ahora, con
    // los dos valores se arma un aspect-ratio propio (ancho:alto) y el marco
    // escala manteniendo esa proporción a cualquier tamaño de pantalla.
    //
    // .feria-portrait se sigue seteando con estilos inline directos (width/
    // height/aspect-ratio): no tiene variante desktop propia, siempre usa
    // img-santo. .halo-wrap (poster principal) en cambio se setea a través de
    // custom properties (--santo-w/-h/-ar/-mw) para que el CSS pueda pisarlas
    // SOLO en desktop con --santo-desk-* (ver _applyPortraitSizeDesktop y las
    // media queries de .halo-wrap en el <style>).
    _applyPortraitSize() {
      const root = this.shadowRoot;
      const w = this.getAttribute('img-santo-width');
      const h = this.getAttribute('img-santo-height');

      const feriaEl = root.querySelector('.feria-portrait');
      if (feriaEl) {
        if (!w && !h) {
          feriaEl.style.width = ''; feriaEl.style.height = ''; feriaEl.style.maxWidth = ''; feriaEl.style.aspectRatio = '';
        } else {
          const wNum = w ? parseFloat(w) : null;
          const hNum = h ? parseFloat(h) : null;
          if (wNum > 0 && hNum > 0) {
            feriaEl.style.aspectRatio = `${wNum} / ${hNum}`;
            feriaEl.style.width = `min(100%, ${w})`;
            feriaEl.style.height = 'auto';
            feriaEl.style.maxWidth = '';
          } else {
            feriaEl.style.width = w || 'auto';
            feriaEl.style.height = h || 'auto';
            feriaEl.style.maxWidth = '100%';
            feriaEl.style.aspectRatio = '';
          }
        }
        const feriaTop = this.getAttribute('img-santo-feria-top');
        feriaEl.style.marginTop = feriaTop || '';
      }

      const haloWrap = root.querySelector('.halo-wrap');
      if (haloWrap) {
        if (!w && !h) {
          ['--santo-w', '--santo-h', '--santo-ar', '--santo-mw'].forEach(v => haloWrap.style.removeProperty(v));
        } else {
          const wNum = w ? parseFloat(w) : null;
          const hNum = h ? parseFloat(h) : null;
          if (wNum > 0 && hNum > 0) {
            haloWrap.style.setProperty('--santo-ar', `${wNum} / ${hNum}`);
            haloWrap.style.setProperty('--santo-w', `min(100%, ${w})`);
            haloWrap.style.setProperty('--santo-h', 'auto');
            haloWrap.style.removeProperty('--santo-mw');
          } else {
            haloWrap.style.setProperty('--santo-w', w || 'auto');
            haloWrap.style.setProperty('--santo-h', h || 'auto');
            haloWrap.style.setProperty('--santo-mw', '100%');
            haloWrap.style.removeProperty('--santo-ar');
          }
        }
      }

      this._applyPortraitSizeDesktop();
    }

    // img-santo-desk-width / img-santo-desk-height: pisan el tamaño del marco
    // (.halo-wrap) SOLO EN DESKTOP, y SOLO si se pasó img-santo-main-desk (si
    // no se pasó esa imagen, no tiene sentido un tamaño propio para ella:
    // desktop usa la misma caja que mobile, comportamiento de siempre).
    // - Si se pasa alguno de los dos (o los dos juntos): mismo criterio que
    //   img-santo-width/-height (combo con aspect-ratio propio, o uno solo
    //   con el otro proporcional según la forma del marco).
    // - Si NO se pasa NINGUNO de los dos: el ancho en desktop queda igual al
    //   de mobile (--santo-w, o el default del marco si tampoco se pasó
    //   img-santo-width), y el alto sale proporcional al tamaño REAL del
    //   archivo de img-santo-main-desk (no del shape del marco, para que no
    //   quede recortada/estirada si esa imagen tiene otra proporción).
    _applyPortraitSizeDesktop() {
      const root = this.shadowRoot;
      const haloWrap = root.querySelector('.halo-wrap');
      if (!haloWrap) return;

      // img-santo-main-desk-top: ajuste fino vertical SOLO EN DESKTOP, se
      // aplica siempre que venga el atributo (no depende de si hay o no
      // img-santo-main-desk propia). Ver --santo-desk-mt en el CSS: solo
      // existe dentro de la media query de desktop, así que en mobile este
      // prop no tiene ningún efecto.
      const deskTop = this.getAttribute('img-santo-main-desk-top');
      if (deskTop) haloWrap.style.setProperty('--santo-desk-mt', deskTop);
      else haloWrap.style.removeProperty('--santo-desk-mt');

      const clearDesk = () => ['--santo-desk-w', '--santo-desk-h', '--santo-desk-ar', '--santo-desk-mw'].forEach(v => haloWrap.style.removeProperty(v));

      const deskUrl = this.getAttribute('img-santo-main-desk');
      if (!deskUrl) { clearDesk(); return; }

      const deskW = this.getAttribute('img-santo-desk-width');
      const deskH = this.getAttribute('img-santo-desk-height');

      if (deskW || deskH) {
        const wNum = deskW ? parseFloat(deskW) : null;
        const hNum = deskH ? parseFloat(deskH) : null;
        if (wNum > 0 && hNum > 0) {
          haloWrap.style.setProperty('--santo-desk-ar', `${wNum} / ${hNum}`);
          haloWrap.style.setProperty('--santo-desk-w', `min(100%, ${deskW})`);
          haloWrap.style.setProperty('--santo-desk-h', 'auto');
          haloWrap.style.removeProperty('--santo-desk-mw');
        } else {
          haloWrap.style.setProperty('--santo-desk-w', deskW || 'auto');
          haloWrap.style.setProperty('--santo-desk-h', deskH || 'auto');
          haloWrap.style.setProperty('--santo-desk-mw', '100%');
          haloWrap.style.removeProperty('--santo-desk-ar');
        }
        return;
      }

      // Ninguno de los dos: el ancho queda como está (cae solo por fallback
      // de CSS var() en --santo-w); solo hace falta calcular el aspect-ratio
      // real de img-santo-main-desk para el alto. Se mide con el elemento que
      // ya está en el DOM mostrando ese archivo (el <img>, o el <video> si
      // img-santo-main-desk es un .mp4), esperando a que cargue si todavía
      // no lo hizo.
      clearDesk();
      const isVideo = this._isVideoSrc(deskUrl);
      const mediaEl = root.getElementById(isVideo ? 'img-santo-main-desktop-vid' : 'img-santo-main-desktop');
      if (!mediaEl) return;
      const applyNaturalRatio = () => {
        const w = isVideo ? mediaEl.videoWidth : mediaEl.naturalWidth;
        const h = isVideo ? mediaEl.videoHeight : mediaEl.naturalHeight;
        if (w && h) {
          haloWrap.style.setProperty('--santo-desk-ar', `${w} / ${h}`);
          haloWrap.style.setProperty('--santo-desk-h', 'auto');
        }
      };
      if (isVideo) {
        if (mediaEl.readyState >= 1 && mediaEl.videoWidth) {
          applyNaturalRatio();
        } else {
          mediaEl.onloadedmetadata = applyNaturalRatio;
        }
      } else if (mediaEl.complete && mediaEl.naturalWidth) {
        applyNaturalRatio();
      } else {
        mediaEl.onload = applyNaturalRatio;
      }
    }

    // Helper genérico para atributos booleanos "sueltos" (no ligados a un slot):
    // ausente -> defaultValue; "false" o "0" -> false; cualquier otro valor -> true.
    _boolAttr(name, defaultValue) {
      const v = this.getAttribute(name);
      if (v === null || v === undefined) return defaultValue;
      return v !== 'false' && v !== '0';
    }

    // img-santo-main="false" / img-santo-feria="false": oculta el marco de
    // img-santo (halo del poster principal / retrato del poster de la feria)
    // SOLO en mobile (<=768px, ver media query en el CSS). En desktop el
    // marco de img-santo siempre se muestra, sin importar estos atributos.
    _applySantoMobileVisibility() {
      const root = this.shadowRoot;
      const showMain = this._boolAttr('img-santo-main', true);
      const showFeria = this._boolAttr('img-santo-feria', true);
      const haloWrap = root.querySelector('.halo-wrap');
      const feriaPortrait = root.querySelector('.feria-portrait');
      if (haloWrap) haloWrap.classList.toggle('hide-mobile', !showMain);
      if (feriaPortrait) feriaPortrait.classList.toggle('hide-mobile', !showFeria);
    }

    // feria-quote-top / feria-quote-mobile-top: permiten subir (valor negativo)
    // o bajar la frase/bajada del poster de la feria, cada uno en su breakpoint:
    // feria-quote-top SOLO aplica en desktop (>=769px de ventana), y
    // feria-quote-mobile-top SOLO aplica en mobile (<=768px de ventana).
    // Pensado para cuando feria-title-img trae espacio en blanco incorporado
    // abajo de la imagen y queda un hueco antes de la frase (el hueco puede
    // necesitar un ajuste distinto en cada tamaño).
    _applyFeriaQuoteAdjust() {
      const el = this.shadowRoot.querySelector('.feria-quote');
      if (!el) return;
      el.style.setProperty('--feria-quote-top', this.getAttribute('feria-quote-top') || '0');
      el.style.setProperty('--feria-quote-mobile-top', this.getAttribute('feria-quote-mobile-top') || '0');
    }

    // banderines-movimiento="slow"|"medium"|"fast": intensidad del balanceo
    // de la guirnalda (ver --sway-amt / .sway-* en el CSS). Cualquier valor
    // no reconocido (o ausente) cae en "medium".
    _applyBuntingSway() {
      const root = this.shadowRoot;
      const raw = (this.getAttribute('banderines-movimiento') || '').toLowerCase().trim();
      const speed = ['slow', 'medium', 'fast'].includes(raw) ? raw : 'medium';
      root.querySelectorAll('.bunting-wrap').forEach(el => {
        el.classList.remove('sway-slow', 'sway-medium', 'sway-fast');
        el.classList.add(`sway-${speed}`);
      });
    }

    _applyPoster() {
      const which = this.getAttribute('poster') === 'feria' ? 'feria' : 'main';
      const root = this.shadowRoot;
      root.getElementById('frame-main').classList.toggle('hidden', which !== 'main');
      root.getElementById('frame-feria').classList.toggle('hidden', which !== 'feria');
      root.getElementById('tab-main').classList.toggle('active', which === 'main');
      root.getElementById('tab-feria').classList.toggle('active', which === 'feria');

      // Si al cambiar de card (main <-> feria) había un audio activo, se
      // mutea solo: no tiene sentido que un video siga sonando en la card
      // que quedó oculta. Se compara con el poster anterior para no mutear
      // en cada re-render (attributeChangedCallback corre para CUALQUIER
      // atributo, no solo "poster") sino solo cuando de verdad cambió.
      if (this._lastPoster !== undefined && this._lastPoster !== which) {
        ['img-santo-main-desktop-vid', 'img-santo-main-mobile-vid', 'img-santo-feria-vid'].forEach(id => {
          const vid = root.getElementById(id);
          if (vid) vid.muted = true;
        });
        this._updateAudioToggles();
      }
      this._lastPoster = which;
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

    // Lee un atributo booleano "plano" (no de slot), ej: bee-main, willow-feria.
    _boolAttr(name, defaultValue) {
      const v = this.getAttribute(name);
      if (v === null || v === undefined) return defaultValue;
      return v !== 'false' && v !== '0';
    }

    // bee-main / bee-feria / willow-main / willow-feria / luciernaga-main /
    // luciernaga-feria: prende o apaga, por canvas, las abejitas, hojitas de
    // sauce y/o luciérnagas voladoras de cada card.
    // Por defecto (atributo ausente) están apagadas en las dos cards.
    _applyFx() {
      const root = this.shadowRoot;
      if (!this._fxMain) {
        const canvas = root.getElementById('fx-canvas-main');
        const frame = root.getElementById('frame-main');
        if (canvas && frame) this._fxMain = createFxController(canvas, frame);
      }
      if (!this._fxFeria) {
        const canvas = root.getElementById('fx-canvas-feria');
        const frame = root.getElementById('frame-feria');
        if (canvas && frame) this._fxFeria = createFxController(canvas, frame);
      }
      if (this._fxMain) {
        this._fxMain.setTypes({
          bee: this._boolAttr('bee-main', false),
          willow: this._boolAttr('willow-main', false),
          firefly: this._boolAttr('luciernaga-main', false)
        });
      }
      if (this._fxFeria) {
        this._fxFeria.setTypes({
          bee: this._boolAttr('bee-feria', false),
          willow: this._boolAttr('willow-feria', false),
          firefly: this._boolAttr('luciernaga-feria', false)
        });
      }
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

    // Arma el atributo style para <img> del título, a partir de -width / -height.
    // Si se pasa uno solo, el otro queda en "auto" y escala proporcional según
    // la proporción natural de la imagen.
    // Si se pasan los DOS, se usan como TOPES (max-width/max-height), no como
    // una caja fija: la imagen siempre escala respetando su proporción real.
    // (Antes se forzaba un aspect-ratio propio con los dos valores; si no
    // coincidía con la proporción real del archivo, quedaba un espacio
    // transparente dentro de esa caja —letterboxing—, invisible arriba porque
    // coincide con la franja de los banderines pero bien visible abajo, justo
    // antes del contenido siguiente. Con topes en vez de caja fija, ese hueco
    // ya no puede aparecer, sea cual sea la proporción real de la imagen.)
    _titleImgAttrs(prefix) {
      const w = this.getAttribute(`${prefix}-width`);
      const h = this.getAttribute(`${prefix}-height`);
      if (!w && !h) return '';
      let decls;
      if (w && h) {
        decls = [`max-width:min(100%, ${esc(w)})`, `max-height:${esc(h)}`, 'width:auto', 'height:auto'];
      } else {
        decls = ['max-width:100%', 'max-height:none', `width:${w ? esc(w) : 'auto'}`, `height:${h ? esc(h) : 'auto'}`];
      }
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

      // Título / texto: para los paneles de la feria admiten también el alias
      // en español (feria-panel1-titulo, feria-panel2-text, etc.), que
      // tiene prioridad sobre panelN-title/panelN-text si se pasan los dos.
      const title = (def.aliasId && this._slotAttr(def.aliasId, 'titulo'))
        || this._slotAttr(def.id, 'title') || def.title;
      const text = (def.aliasId && this._slotAttr(def.aliasId, 'text'))
        || this._slotAttr(def.id, 'text') || def.text;

      // Subtítulo (antes solo existía como "precio" y solo para panel2, vía
      // panel2-price). Ahora cualquier panel de la feria lo admite vía
      // feria-panel1-subtitulo / feria-panel2-subtitulo. Si no se pasa,
      // panel2 sigue cayendo en panel2-price/panel2_price (compatibilidad)
      // y de ahí en su default ("$15.000"); panel1 no tiene default, así que
      // sin este prop no muestra nada, igual que hasta ahora.
      let subtitle = def.aliasId ? this._slotAttr(def.aliasId, 'subtitulo') : null;
      if (subtitle === null || subtitle === undefined) {
        subtitle = def.hasPrice ? (this.getAttribute('panel2-price') || this.getAttribute('panel2_price') || def.price) : null;
      }
      const price = subtitle || null;

      // Ícono de la medalla: feria-panel1-icono / feria-panel2-icono, elegido
      // de MEDAL_ICONS (ver arriba). Si el valor no matchea ninguna clave
      // conocida, o no se pasa, se usa el ícono default de ese panel.
      const iconKey = def.aliasId && this._slotAttr(def.aliasId, 'icono');
      const icon = (iconKey && MEDAL_ICONS[iconKey]) || def.icon;
      const colorClass = def.color ? ` c-${def.color}` : '';

      // img-show / title-show controlan la cabecera (medallón + título) de forma
      // independiente. body-img solo reemplaza el texto/descripción (id-text).
      const showImg = this._slotBoolAttr(def.id, 'img-show', true);
      const showTitle = this._slotBoolAttr(def.id, 'title-show', true);

      let headHtml = '';
      if (showImg || showTitle) {
        const medal = !showImg ? '' : (imgUrl
          ? `<div class="medal img-medal"><img src="${esc(imgUrl)}" alt=""></div>`
          : `<div class="medal${colorClass}">${icon}</div>`);
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
