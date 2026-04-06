/**
 * <panel-photo-gallery>  — v7
 * Shadow DOM · totalmente aislado del CSS de la plataforma.
 *
 * ══════════════════════════════════════════════════════════
 *  ATRIBUTOS
 * ══════════════════════════════════════════════════════════
 *  base-path             ruta carpeta de fotos        (default: './actividades/ramos/')
 *  mascot-src            imagen mascota               (default: './actividades/photo.png')
 *  particle-src          PNG(s) que caen en la card   (default: '' → estrellitas)
 *                        Acepta varios separados por coma:
 *                        particle-src="./gota.png, ./hostia.png, ./pan.png"
 *  lightbox-particle-src PNG(s) que suben en lightbox (default: '' → estrellas animadas)
 *  width                 ancho desktop                (default: '80%')
 *  total                 total de fotos               (default: 9)
 *  page-size             fotos por página desktop     (default: 9)
 *
 *  ── TEXTOS ──────────────────────────────────────────────
 *  eyebrow               texto pequeño sobre el título
 *  title                 título principal
 *  title-em              parte shimmer del título
 *  captions              JSON array con pie de foto por imagen
 *                        captions='["Procesión","Bendición","Comunidad"]'
 *                        Si hay menos items que fotos, el resto queda vacío.
 *
 *  ── TEMAS ───────────────────────────────────────────────
 *  theme                 violeta-dorado (default) | azul-dorado | verde-dorado
 *                        rojo-dorado | azul-plateado | blanco-dorado
 *  color1 / color2       colores hex custom (prioridad sobre theme)
 *
 * ══════════════════════════════════════════════════════════
 *  EJEMPLOS
 * ══════════════════════════════════════════════════════════
 *
 *  <!-- Misa de Ramos -->
 *  <panel-photo-gallery
 *    base-path="./actividades/ramos/"
 *    particle-src="./img/ramo.png"
 *    lightbox-particle-src="./img/ramo.png"
 *    theme="violeta-dorado"
 *    eyebrow="✦ Parroquia · Semana Santa ✦"
 *    title="Misa de" title-em="Ramos"
 *    captions='["Procesión","Bendición","Comunidad","Palmas","Celebración","Fe","Oración","Ramos","Alegría"]'
 *    total="9" width="80%">
 *  </panel-photo-gallery>
 *
 *  <!-- Jueves Santo -->
 *  <panel-photo-gallery
 *    base-path="./actividades/jueves-santo/"
 *    particle-src="./img/gota.png, ./img/hostia.png, ./img/pan.png"
 *    lightbox-particle-src="./img/paloma.png"
 *    theme="azul-dorado"
 *    eyebrow="Conmemorando la última cena de Jesús"
 *    title="Celebrando" title-em="Jueves Santo"
 *    total="20" width="80%">
 *  </panel-photo-gallery>
 */

// ── Temas ────────────────────────────────────────────────
const THEMES = {
  'violeta-dorado': { bg1:[38,10,60],  bg2:[18,5,35],   bg3:[28,8,48],   c1:[180,100,255], c2:[201,168,76],  titleLight:'#fdf6e3', shimmer:['#f0d080','#e8b8ff','#f0d080'] },
  'azul-dorado':    { bg1:[6,18,48],   bg2:[3,10,28],   bg3:[5,14,38],   c1:[56,139,215],  c2:[201,168,76],  titleLight:'#f0f6ff', shimmer:['#f0d080','#90c8ff','#f0d080'] },
  'verde-dorado':   { bg1:[8,40,20],   bg2:[4,22,10],   bg3:[6,32,16],   c1:[72,199,120],  c2:[201,168,76],  titleLight:'#f0fdf4', shimmer:['#f0d080','#86efac','#f0d080'] },
  'rojo-dorado':    { bg1:[55,10,8],   bg2:[30,4,4],    bg3:[44,8,6],    c1:[239,68,68],   c2:[201,168,76],  titleLight:'#fff5f5', shimmer:['#f0d080','#fca5a5','#f0d080'] },
  'azul-plateado':  { bg1:[8,20,55],   bg2:[4,10,30],   bg3:[6,16,44],   c1:[99,179,237],  c2:[203,213,225], titleLight:'#f0f8ff', shimmer:['#e2e8f0','#93c5fd','#e2e8f0'] },
  'blanco-dorado':  { bg1:[30,26,18],  bg2:[18,15,10],  bg3:[24,20,14],  c1:[245,237,210], c2:[201,168,76],  titleLight:'#fffdf5', shimmer:['#f0d080','#fdf8e8','#f0d080'] },
};

const rgb  = (c,a=1)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
const hex2rgb = h=>{ const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h.trim()); return r?[parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)]:null; };
const darken  = (c,f=.15)=>[Math.round(c[0]*f),Math.round(c[1]*f),Math.round(c[2]*f)];
const loadImgs = s=>{ if(!s||!s.trim())return[]; return s.split(',').map(v=>v.trim()).filter(Boolean).map(src=>{ const i=new Image();i.src=src;return i;}); };

class PanelPhotoGallery extends HTMLElement {
  connectedCallback(){
    // ── Atributos ────────────────────────────────────
    const basePath      = this.getAttribute('base-path')             || './actividades/ramos/';
    const mascotSrc     = this.getAttribute('mascot-src')            || './actividades/photo.png';
    const particleRaw   = this.getAttribute('particle-src')          || '';
    const lbParticleRaw = this.getAttribute('lightbox-particle-src') || '';
    const widthVal      = this.getAttribute('width')                 || '80%';
    const total         = parseInt(this.getAttribute('total')     ||'9', 10);
    const pageSize      = parseInt(this.getAttribute('page-size') ||'9', 10);
    const themeName     = this.getAttribute('theme')                 || 'violeta-dorado';
    const customC1      = this.getAttribute('color1')                || null;
    const customC2      = this.getAttribute('color2')                || null;
    const eyebrow       = this.getAttribute('eyebrow')   || '✦ Parroquia · Semana Santa ✦';
    const titleMain     = this.getAttribute('title')     || 'Misa de';
    const titleEm       = this.getAttribute('title-em')  || 'Ramos';

    // Captions: JSON array o vacío
    let captions = [];
    try { captions = JSON.parse(this.getAttribute('captions') || '[]'); } catch(e){}
    const cap = i => (captions[i] || '');

    // ── Paleta ───────────────────────────────────────
    let pal = THEMES[themeName] || THEMES['violeta-dorado'];
    if(customC1||customC2){
      const c1=customC1?(hex2rgb(customC1)||pal.c1):pal.c1;
      const c2=customC2?(hex2rgb(customC2)||pal.c2):pal.c2;
      pal={bg1:darken(c1,.18),bg2:darken(c1,.09),bg3:darken(c1,.14),c1,c2,titleLight:'#fdf6e3',shimmer:[`rgb(${c2})`,`rgb(${c1})`,`rgb(${c2})`]};
    }
    const{bg1,bg2,bg3,c1,c2,titleLight,shimmer}=pal;

    // ── Paginación ───────────────────────────────────
    const totalPages = Math.ceil(total/pageSize);

    const makeGridPage = page=>{
      const start=page*pageSize, end=Math.min(start+pageSize,total);
      return Array.from({length:end-start},(_,i)=>{
        const idx=start+i, caption=cap(idx);
        return `<div class="photo-item pi${i+1}" data-idx="${idx}">
          <div class="photo-frame">
            <div class="photo-img-wrap"><img src="${basePath}${idx+1}.jpg" alt="Foto ${idx+1}" loading="lazy"/></div>
            ${caption?`<div class="photo-caption">${caption}</div>`:'<div class="photo-caption-empty"></div>'}
          </div></div>`;
      }).join('');
    };

    const carouselItems = Array.from({length:total},(_,i)=>{
      const caption=cap(i);
      return `<div class="cr-slide" data-idx="${i}">
        <div class="cr-frame">
          <div class="cr-img-wrap"><img src="${basePath}${i+1}.jpg" alt="Foto ${i+1}" loading="lazy"/></div>
          ${caption?`<div class="cr-caption">${caption}</div>`:''}
        </div></div>`;
    }).join('');

    // ── Shadow DOM ───────────────────────────────────
    const shadow = this.attachShadow({mode:'open'});

    shadow.innerHTML=`
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

  :host{display:block;width:${widthVal};max-width:1280px;margin:36px auto;font-family:'Playfair Display',Georgia,serif;position:relative;}
  @media(max-width:768px){:host{width:95%!important;}}

  /* ══ CARD ══ */
  .ramos-card{
    position:relative;border-radius:32px;overflow:hidden;
    background:linear-gradient(145deg,${rgb(bg1,.94)} 0%,${rgb(bg2,.97)} 40%,${rgb(bg3,.95)} 70%,${rgb(bg2,.98)} 100%);
    backdrop-filter:blur(32px) saturate(1.6) brightness(1.05);
    -webkit-backdrop-filter:blur(32px) saturate(1.6) brightness(1.05);
    border:1.5px solid transparent;background-clip:padding-box;
    box-shadow:0 40px 100px rgba(0,0,0,.65),0 12px 32px rgba(0,0,0,.45),0 0 60px ${rgb(c1,.18)},0 0 120px ${rgb(c2,.10)},inset 0 1px 0 ${rgb(c2,.35)},inset 0 -1px 0 ${rgb(c1,.20)},inset 1px 0 0 ${rgb(c1,.12)},inset -1px 0 0 ${rgb(c2,.08)};
  }
  .ramos-card::before{
    content:'';position:absolute;inset:0;border-radius:32px;padding:1.5px;
    background:linear-gradient(135deg,${rgb(c1,.70)} 0%,${rgb(c2,.90)} 35%,${rgb(c2,1)} 50%,${rgb(c2,.90)} 65%,${rgb(c1,.60)} 100%);
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:5;
  }
  .ramos-card::after{
    content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse at 15% 0%,${rgb(c1,.20)} 0%,transparent 55%),radial-gradient(ellipse at 85% 100%,${rgb(c2,.18)} 0%,transparent 55%),radial-gradient(ellipse at 50% 50%,${rgb(bg1,.08)} 0%,transparent 70%);
    pointer-events:none;z-index:1;
  }
  #particleCanvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;border-radius:32px;opacity:.60;}

  /* ══ HEADER ══ */
  .card-header{position:relative;z-index:10;text-align:center;padding:36px 28px 24px;border-bottom:1px solid ${rgb(c2,.18)};}
  .card-header::before{content:'';display:block;width:120px;height:2px;margin:0 auto 22px;background:linear-gradient(90deg,${rgb(c1,0)} 0%,${rgb(c1,1)} 30%,${rgb(c2,1)} 50%,${rgb(c2,1)} 70%,${rgb(c2,0)} 100%);border-radius:2px;}
  .mascot-wrap{display:flex;justify-content:center;margin-bottom:14px;}
  .mascot-wrap img{width:84px;height:84px;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 0 18px ${rgb(c1,.70)}) drop-shadow(0 0 8px ${rgb(c2,.60)}) drop-shadow(0 6px 14px rgba(0,0,0,.55));animation:mascotIn .9s cubic-bezier(.34,1.56,.64,1) both,mascotBob 3.8s .9s ease-in-out infinite;transform-origin:bottom center;}
  @keyframes mascotIn{from{opacity:0;transform:translateY(32px) scale(.6) rotate(-8deg);}to{opacity:1;transform:translateY(0) scale(1) rotate(0);}}
  @keyframes mascotBob{0%,100%{transform:translateY(0) rotate(0);}25%{transform:translateY(-6px) rotate(-2deg);}75%{transform:translateY(-3px) rotate(2deg);}}
  .card-eyebrow{font-size:.70rem;letter-spacing:.40em;text-transform:uppercase;font-style:italic;color:${rgb(c2,.80)};margin-bottom:10px;animation:fadeUp .7s .3s ease both;}
  .card-title{font-size:clamp(1.7rem,3.8vw,3rem);font-weight:700;line-height:1.1;color:${titleLight};text-shadow:0 0 40px ${rgb(c1,.50)},0 2px 20px ${rgb(c2,.40)};animation:fadeUp .7s .45s ease both;}
  .card-title em{font-style:italic;background:linear-gradient(90deg,${shimmer[0]},${shimmer[1]},${shimmer[2]});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200%;animation:shimmer 4s 1.4s linear infinite;}
  @keyframes shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  .card-rule{width:80px;height:1px;background:linear-gradient(90deg,transparent,${rgb(c1,.8)},${rgb(c2,1)},${rgb(c1,.8)},transparent);margin:16px auto 0;animation:fadeUp .7s .6s ease both;}

  /* ══ BODY ══ */
  .card-body{position:relative;z-index:10;padding:38px 30px;}

  /* ══ GRID desktop ══ */
  .photo-grid{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:72px;gap:14px;}
  .pi1{grid-column:1/5;grid-row:1/5;--rot:-2.5deg;} .pi2{grid-column:5/9;grid-row:1/4;--rot:1.8deg;}
  .pi3{grid-column:9/13;grid-row:1/5;--rot:-1.2deg;} .pi4{grid-column:1/4;grid-row:5/9;--rot:2.3deg;}
  .pi5{grid-column:4/9;grid-row:4/9;--rot:-1.5deg;} .pi6{grid-column:9/13;grid-row:5/9;--rot:2.8deg;}
  .pi7{grid-column:1/5;grid-row:9/13;--rot:-1.9deg;} .pi8{grid-column:5/9;grid-row:9/13;--rot:1.3deg;}
  .pi9{grid-column:9/13;grid-row:9/13;--rot:-2.2deg;}
  .photo-item{position:relative;cursor:zoom-in;transform:rotate(var(--rot,0deg));transition:transform .38s cubic-bezier(.23,1,.32,1);z-index:1;opacity:0;animation:cardIn .65s cubic-bezier(.23,1,.32,1) forwards;}
  .pi1{animation-delay:.10s}.pi2{animation-delay:.18s}.pi3{animation-delay:.26s}
  .pi4{animation-delay:.34s}.pi5{animation-delay:.42s}.pi6{animation-delay:.50s}
  .pi7{animation-delay:.58s}.pi8{animation-delay:.66s}.pi9{animation-delay:.74s}
  @keyframes cardIn{from{opacity:0;transform:translateY(28px) rotate(var(--rot,0deg));}to{opacity:1;transform:translateY(0) rotate(var(--rot,0deg));}}
  .photo-item:hover{transform:rotate(0deg) scale(1.08)!important;z-index:30;}

  /* Marco polaroid */
  .photo-frame{width:100%;height:100%;background:linear-gradient(165deg,#fefaf3 0%,#f8edd8 100%);border-radius:3px;padding:8px 8px 32px;box-shadow:0 20px 55px rgba(0,0,0,.80),0 5px 18px rgba(0,0,0,.55),0 1px 4px rgba(0,0,0,.40),inset 0 0 0 1px rgba(255,255,255,.95),0 0 0 1px ${rgb(c1,.10)};display:flex;flex-direction:column;position:relative;overflow:visible;}
  .photo-frame::before{content:'';position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:15px;height:15px;background:radial-gradient(circle at 32% 32%,#fff8c0,#d4a017,#7a5800);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.45);z-index:50;}
  .photo-img-wrap{flex:1;overflow:hidden;border-radius:2px;}
  .photo-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease;}
  .photo-item:hover .photo-img-wrap img{transform:scale(1.06);}
  .photo-caption{text-align:center;padding-top:6px;font-size:.62rem;color:rgba(80,50,15,.65);letter-spacing:.16em;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .photo-caption-empty{height:22px;}

  /* ══ PAGINACIÓN ══ */
  .pagination{display:flex;align-items:center;justify-content:center;gap:10px;padding:28px 0 10px;}
  .pg-btn{background:rgba(255,255,255,.06);border:1px solid ${rgb(c2,.35)};color:${rgb(c2,1)};font-size:1.2rem;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s;font-family:inherit;}
  .pg-btn:hover{background:${rgb(c2,.18)};transform:scale(1.1);}
  .pg-btn:disabled{opacity:.3;cursor:default;transform:none;}
  .pg-dots{display:flex;gap:8px;align-items:center;}
  .pg-dot{width:9px;height:9px;border-radius:50%;background:${rgb(c1,.25)};border:1px solid ${rgb(c1,.50)};cursor:pointer;transition:background .25s,transform .25s;}
  .pg-dot.active{background:linear-gradient(135deg,${rgb(c1,1)},${rgb(c2,1)});transform:scale(1.45);border-color:transparent;}

  /* ══ CARRUSEL mobile ══ */
  .carousel-wrap{display:none;}
  @media(max-width:640px){
    .photo-grid,.pagination{display:none;}
    .carousel-wrap{display:block;}
    .card-body{padding:22px 0 26px;}
    .card-header{padding:22px 16px 18px;}
  }
  .carousel-track-outer{overflow:hidden;position:relative;touch-action:pan-y;cursor:grab;user-select:none;padding:22px 0 12px;}
  .carousel-track-outer:active{cursor:grabbing;}
  .carousel-track{display:flex;transition:transform .42s cubic-bezier(.23,1,.32,1);will-change:transform;}
  .cr-slide{flex:0 0 82%;margin:0 4%;opacity:.5;transition:opacity .3s ease;}
  .cr-slide.active{opacity:1;}
  .cr-frame{background:linear-gradient(165deg,#fefaf3 0%,#f8edd8 100%);border-radius:4px;padding:10px 10px 36px;box-shadow:0 12px 36px rgba(0,0,0,.65),0 4px 14px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.95);position:relative;transform:rotate(var(--cr-rot,0deg)) scale(.96);transition:transform .38s ease,box-shadow .38s ease;}
  .cr-slide:nth-child(odd) .cr-frame{--cr-rot:-1.8deg;}
  .cr-slide:nth-child(even) .cr-frame{--cr-rot:1.6deg;}
  .cr-slide.active .cr-frame{--cr-rot:0deg;transform:rotate(0deg) scale(1);box-shadow:0 24px 64px rgba(0,0,0,.75),0 6px 20px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.97);}
  .cr-frame::before{content:'';position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:15px;height:15px;background:radial-gradient(circle at 32% 32%,#fff8c0,#d4a017,#7a5800);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.45);z-index:40;}
  .cr-img-wrap{width:100%;padding-top:72%;position:relative;overflow:hidden;border-radius:2px;}
  .cr-img-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
  .cr-caption{text-align:center;padding-top:8px;font-size:.75rem;color:rgba(80,50,15,.65);letter-spacing:.15em;font-style:italic;}
  .cr-dots{display:flex;justify-content:center;gap:7px;margin-top:20px;padding:0 16px;flex-wrap:wrap;}
  .cr-dot{width:7px;height:7px;border-radius:50%;background:${rgb(c1,.20)};border:1px solid ${rgb(c1,.45)};cursor:pointer;transition:background .25s,transform .25s;flex-shrink:0;}
  .cr-dot.active{background:${rgb(c1,1)};transform:scale(1.45);}
  .cr-nav{display:flex;justify-content:center;gap:16px;margin-top:14px;}
  .cr-btn{background:rgba(255,255,255,.06);border:1px solid ${rgb(c1,.35)};color:${rgb(c1,1)};font-size:1.4rem;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s;padding-bottom:2px;-webkit-tap-highlight-color:transparent;}
  .cr-btn:active{background:${rgb(c1,.18)};transform:scale(.92);}

  /* ══ FOOTER ══ */
  .card-footer{position:relative;z-index:10;text-align:center;padding:14px 0 24px;border-top:1px solid ${rgb(c1,.15)};font-size:1.1rem;letter-spacing:.7em;background:linear-gradient(90deg,${rgb(c1,0)} 0%,${rgb(c1,.8)} 30%,${rgb(c2,1)} 50%,${rgb(c1,.8)} 70%,${rgb(c1,0)} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

  /* ══ LIGHTBOX ══ */
  .lb-overlay{
    position:fixed;inset:0;z-index:99999;
    display:flex;align-items:center;justify-content:center;
    opacity:0;pointer-events:none;transition:opacity .35s ease;
    overflow:hidden;
  }
  .lb-overlay.active{opacity:1;pointer-events:all;}
  .lb-backdrop{position:absolute;inset:0;background:rgba(8,2,18,.88);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);}

  /* Canvas pirotecnia — DENTRO del overlay, cubre toda la pantalla fija */
  #lbCanvas{
    position:absolute;inset:0;
    width:100%;height:100%;
    pointer-events:none;z-index:1;
  }

  .lb-content{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:14px;transform:scale(.86);transition:transform .38s cubic-bezier(.23,1,.32,1);}
  .lb-overlay.active .lb-content{transform:scale(1);}

  /* Marco polaroid lightbox */
  .lb-frame{
    position:relative;
    background:linear-gradient(165deg,#fefaf3 0%,#f8edd8 100%);
    border-radius:4px;padding:16px 16px 56px;
    box-shadow:0 40px 100px rgba(0,0,0,.85),0 12px 36px rgba(0,0,0,.65),0 3px 8px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.97),0 0 60px ${rgb(c1,.20)},0 0 30px ${rgb(c2,.12)};
    overflow:visible;
  }
  .lb-frame::before{content:'';position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:18px;height:18px;background:radial-gradient(circle at 32% 32%,#fff8c0,#d4a017,#7a5800);border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.5);z-index:60;}
  .lb-img-wrap{position:relative;border-radius:2px;overflow:hidden;line-height:0;}
  .lb-frame img{display:block;max-width:82vw;max-height:66vh;object-fit:contain;border-radius:2px;}
  .lb-frame-footer{position:absolute;bottom:0;left:0;right:0;height:56px;display:flex;align-items:center;justify-content:center;border-top:1px solid rgba(180,150,100,.15);}
  .lb-frame-caption{font-size:.78rem;color:rgba(80,50,15,.60);letter-spacing:.18em;font-style:italic;}

  .lb-close{position:absolute;top:-16px;right:-16px;background:${rgb(c1,.70)};border:1px solid ${rgb(c1,.50)};color:#fff;font-size:1rem;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .25s;z-index:70;}
  .lb-close:hover{background:${rgb(c1,.95)};transform:scale(1.15) rotate(90deg);}
  .lb-counter{font-size:.78rem;color:${rgb(c2,.55)};letter-spacing:.22em;font-style:italic;}
  .lb-nav{display:flex;align-items:center;gap:18px;}
  .lb-btn{background:rgba(255,255,255,.06);border:1px solid ${rgb(c1,.35)};color:${rgb(c1,1)};font-size:1.5rem;width:46px;height:46px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .2s;padding-bottom:2px;}
  .lb-btn:hover{background:${rgb(c1,.20)};transform:scale(1.1);}
  .lb-label{font-size:.92rem;color:${rgb(c2,.80)};letter-spacing:.14em;font-style:italic;min-width:90px;text-align:center;}

  /* ══ LIGHTBOX MOBILE FIX ══ */
  @media(max-width:640px){
    .lb-overlay{
      top:0;left:0;width:100vw;height:100vh;height:100dvh;
      overflow-y:auto;-webkit-overflow-scrolling:touch;
      align-items:flex-start;justify-content:center;
    }
    .lb-content{
      margin:auto 0;
      padding:16px 0;
      max-width:96vw;
    }
    .lb-frame{padding:10px 10px 42px;}
    .lb-frame img{max-width:90vw;max-height:52vh;}
    .lb-close{top:-12px;right:-12px;width:32px;height:32px;font-size:.85rem;}
    .lb-btn{width:40px;height:40px;font-size:1.2rem;}
    .lb-counter{font-size:.7rem;}
  }
</style>

<div class="ramos-card" id="ramosCard">
  <canvas id="particleCanvas"></canvas>
  <div class="card-header">
    <div class="mascot-wrap"><img src="${mascotSrc}" alt="Mascota"/></div>
    <p class="card-eyebrow">${eyebrow}</p>
    <h2 class="card-title">${titleMain} <em>${titleEm}</em></h2>
    <div class="card-rule"></div>
  </div>
  <div class="card-body">
    <div class="photo-grid" id="photoGrid"></div>
    <div class="pagination" id="pagination">
      <button class="pg-btn" id="pgPrev">‹</button>
      <div class="pg-dots" id="pgDots"></div>
      <button class="pg-btn" id="pgNext">›</button>
    </div>
    <div class="carousel-wrap">
      <div class="carousel-track-outer" id="crOuter">
        <div class="carousel-track" id="crTrack">${carouselItems}</div>
      </div>
      <div class="cr-dots" id="crDots"></div>
      <div class="cr-nav">
        <button class="cr-btn" id="crPrev">‹</button>
        <button class="cr-btn" id="crNext">›</button>
      </div>
    </div>
  </div>
  <div class="card-footer">✦ ✦ ✦</div>
</div>

<!-- LIGHTBOX — canvas DENTRO del overlay para que funcione en Shadow DOM -->
<div class="lb-overlay" id="lightbox">
  <div class="lb-backdrop" id="lbBackdrop"></div>
  <canvas id="lbCanvas"></canvas>
  <div class="lb-content">
    <div class="lb-frame">
      <button class="lb-close" id="lbClose">✕</button>
      <div class="lb-img-wrap"><img id="lbImg" src="" alt=""/></div>
      <div class="lb-frame-footer"><span class="lb-frame-caption" id="lbCaption"></span></div>
    </div>
    <div class="lb-counter" id="lbCtr">1 / ${total}</div>
    <div class="lb-nav">
      <button class="lb-btn" id="lbPrev">‹</button>
      <span class="lb-label" id="lbLabel"></span>
      <button class="lb-btn" id="lbNext">›</button>
    </div>
  </div>
</div>
`;

    /* ═══════════════════════════════════════
       PARTÍCULAS CARD (caen desde arriba)
    ═══════════════════════════════════════ */
    const canvas  = shadow.getElementById('particleCanvas');
    const ctx     = canvas.getContext('2d');
    const card    = shadow.getElementById('ramosCard');
    const pImgs   = loadImgs(particleRaw);
    let particles=[], rafId=null;
    const DPR = window.devicePixelRatio||1;

    function resizeCanvas(){
      const w=card.offsetWidth,h=card.offsetHeight;
      canvas.width=Math.round(w*DPR); canvas.height=Math.round(h*DPR);
      canvas.style.width=w+'px'; canvas.style.height=h+'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    }
    function makeP(){
      const w=card.offsetWidth;
      const imgIdx=pImgs.length?Math.floor(Math.random()*pImgs.length):-1;
      return{x:Math.random()*w,y:-70-Math.random()*280,size:50+Math.random()*54,speedY:.38+Math.random()*.70,speedX:-.5+Math.random()*1.0,rot:Math.random()*Math.PI*2,rotV:-.009+Math.random()*.018,sway:.5+Math.random()*.9,swayS:.006+Math.random()*.010,swayT:Math.random()*Math.PI*2,alpha:.60+Math.random()*.38,imgIdx};
    }
    function drawStar6(cx,cy,size,alpha,color){
      ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();
      const pts=6,outer=size/2,inner=size/5;
      for(let i=0;i<pts*2;i++){const r=i%2===0?outer:inner;const a=(i*Math.PI)/pts-Math.PI/2;i===0?ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}
      ctx.closePath();ctx.fill();ctx.restore();
    }
    function initP(){particles=[];for(let i=0;i<40;i++){const p=makeP();p.y=Math.random()*card.offsetHeight;particles.push(p);}}
    function animateP(){
      const lw=card.offsetWidth,lh=card.offsetHeight;
      ctx.clearRect(0,0,lw,lh);
      particles.forEach(p=>{
        p.swayT+=p.swayS;p.x+=p.speedX+Math.sin(p.swayT)*p.sway;p.y+=p.speedY;p.rot+=p.rotV;
        if(p.y>lh+60)Object.assign(p,makeP());
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
        const img=p.imgIdx>=0?pImgs[p.imgIdx]:null;
        if(img&&img.complete&&img.naturalWidth>0){ctx.globalAlpha=p.alpha;ctx.drawImage(img,-p.size/2,-p.size/2,p.size,p.size);}
        else drawStar6(0,0,p.size,p.alpha,rgb(c2,1));
        ctx.restore();
      });
      rafId=requestAnimationFrame(animateP);
    }
    function startP(){resizeCanvas();initP();if(rafId)cancelAnimationFrame(rafId);animateP();}

    if(pImgs.length){let n=0;pImgs.forEach(img=>{const d=()=>{if(++n===1)startP();};img.onload=d;img.onerror=d;if(img.complete)d();});}
    else startP();
    new ResizeObserver(()=>{resizeCanvas();initP();}).observe(card);

    /* ═══════════════════════════════════════
       LIGHTBOX
    ═══════════════════════════════════════ */
    const lb       = shadow.getElementById('lightbox');
    const lbImg    = shadow.getElementById('lbImg');
    const lbLabel  = shadow.getElementById('lbLabel');
    const lbCtrEl  = shadow.getElementById('lbCtr');
    const lbCapEl  = shadow.getElementById('lbCaption');
    let cur=0;

    const setLB=()=>{
      lbImg.src=`${basePath}${cur+1}.jpg`;
      lbImg.alt=cap(cur)||`Foto ${cur+1}`;
      const txt=cap(cur)||`Foto ${cur+1}`;
      lbLabel.textContent=txt;
      lbCapEl.textContent=txt;
      lbCtrEl.textContent=`${cur+1} / ${total}`;
    };
    const openLB=idx=>{cur=idx;setLB();lb.classList.add('active');startLB();};
    const closeLB=()=>{lb.classList.remove('active');stopLB();};
    const navLB=dir=>{cur=(cur+dir+total)%total;setLB();};

    shadow.getElementById('lbClose').addEventListener('click',closeLB);
    shadow.getElementById('lbBackdrop').addEventListener('click',closeLB);
    shadow.getElementById('lbPrev').addEventListener('click',()=>navLB(-1));
    shadow.getElementById('lbNext').addEventListener('click',()=>navLB(1));
    document.addEventListener('keydown',e=>{
      if(!lb.classList.contains('active'))return;
      if(e.key==='Escape')closeLB();
      if(e.key==='ArrowRight')navLB(1);
      if(e.key==='ArrowLeft')navLB(-1);
    });

    /* ═══════════════════════════════════════
       PIROTECNIA LIGHTBOX (sube desde abajo)
       Canvas está DENTRO del .lb-overlay
       → hereda el tamaño del overlay (100vw×100vh)
    ═══════════════════════════════════════ */
    const lbCanvas = shadow.getElementById('lbCanvas');
    const lbCtx    = lbCanvas.getContext('2d');
    const lbPImgs  = loadImgs(lbParticleRaw);
    let lbPs=[], lbRaf=null;
    const LB_COUNT=35;

    function resizeLB(){
      // El canvas está inside el overlay (position:fixed inset:0)
      // usamos el overlay como referencia de tamaño
      const W=lb.clientWidth||window.innerWidth;
      const H=lb.clientHeight||window.innerHeight;
      lbCanvas.width=Math.round(W*DPR); lbCanvas.height=Math.round(H*DPR);
      lbCanvas.style.width=W+'px'; lbCanvas.style.height=H+'px';
      lbCtx.setTransform(DPR,0,0,DPR,0,0);
      lbCtx.imageSmoothingEnabled=true;lbCtx.imageSmoothingQuality='high';
    }

    // Colores para pirotecnia CSS — brillantes y variados
    const STAR_COLORS=[
      rgb(c1,1), rgb(c2,1),
      '#ffffff','#ffe066','#ff6fff','#66ffee','#ff8844','#88ffaa',
    ];

    function makeLBP(){
      const W=lb.clientWidth||window.innerWidth;
      const H=lb.clientHeight||window.innerHeight;
      const imgIdx=lbPImgs.length?Math.floor(Math.random()*lbPImgs.length):-1;
      return{
        x:Math.random()*W, y:H+50+Math.random()*100,
        size:22+Math.random()*32,
        speedY:-(1.1+Math.random()*1.8),
        speedX:-0.8+Math.random()*1.6,
        rot:Math.random()*Math.PI*2,
        rotV:(.020+Math.random()*.040)*(Math.random()<.5?1:-1),
        sway:.5+Math.random()*1.0, swayS:.009+Math.random()*.014,
        swayT:Math.random()*Math.PI*2,
        alpha:0, life:0, maxLife:120+Math.random()*80,
        color:STAR_COLORS[Math.floor(Math.random()*STAR_COLORS.length)],
        imgIdx,
        // Para estrellas sin PNG: varía entre 4, 5, 6 puntas
        pts: [4,5,6,6][Math.floor(Math.random()*4)],
      };
    }

    function drawLBStar(p){
      lbCtx.save();
      lbCtx.globalAlpha=p.alpha;
      lbCtx.fillStyle=p.color;
      // Resplandor
      const glow=lbCtx.createRadialGradient(0,0,0,0,0,p.size*.7);
      glow.addColorStop(0,p.color);
      glow.addColorStop(1,'transparent');
      lbCtx.shadowColor=p.color;
      lbCtx.shadowBlur=p.size*.8;
      lbCtx.beginPath();
      const pts=p.pts, outer=p.size/2, inner=p.size/(pts===4?3.5:4.5);
      for(let i=0;i<pts*2;i++){
        const r=i%2===0?outer:inner;
        const a=(i*Math.PI)/pts-Math.PI/2;
        i===0?lbCtx.moveTo(Math.cos(a)*r,Math.sin(a)*r):lbCtx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
      }
      lbCtx.closePath();lbCtx.fill();
      lbCtx.shadowBlur=0;
      lbCtx.restore();
    }

    function animateLB(){
      const W=lb.clientWidth||window.innerWidth;
      const H=lb.clientHeight||window.innerHeight;
      lbCtx.clearRect(0,0,W,H);

      // Emitir nuevas partículas escalonadas
      if(lbPs.length<LB_COUNT) lbPs.push(makeLBP());

      lbPs=lbPs.filter(p=>{
        p.life++;
        p.swayT+=p.swayS;
        p.x+=p.speedX+Math.sin(p.swayT)*p.sway;
        p.y+=p.speedY;
        p.rot+=p.rotV;
        // Fade in rápido, plateau, fade out
        const t=p.life/p.maxLife;
        p.alpha=t<.12?t/.12:t>.70?(1-t)/.30:1.0;
        p.alpha*=0.92;

        lbCtx.save();
        lbCtx.translate(p.x,p.y);
        lbCtx.rotate(p.rot);
        const img=p.imgIdx>=0?lbPImgs[p.imgIdx]:null;
        if(img&&img.complete&&img.naturalWidth>0){
          lbCtx.globalAlpha=p.alpha;
          lbCtx.drawImage(img,-p.size/2,-p.size/2,p.size,p.size);
        } else {
          drawLBStar(p);
        }
        lbCtx.restore();
        return p.y>-p.size*2&&p.life<p.maxLife;
      });
      lbRaf=requestAnimationFrame(animateLB);
    }

    function startLB(){
      lbPs=[];
      resizeLB();
      if(lbRaf)cancelAnimationFrame(lbRaf);
      lbRaf=requestAnimationFrame(animateLB);
    }
    function stopLB(){
      if(lbRaf){cancelAnimationFrame(lbRaf);lbRaf=null;}
      lbCtx.clearRect(0,0,lbCanvas.width,lbCanvas.height);
    }

    // Pre-cargar imágenes lb si las hay
    if(lbPImgs.length) lbPImgs.forEach(img=>{if(!img.complete)img.src=img.src;});

    /* ═══════════════════════════════════════
       PAGINACIÓN DESKTOP
    ═══════════════════════════════════════ */
    const grid   = shadow.getElementById('photoGrid');
    const pgDots = shadow.getElementById('pgDots');
    const pgPrev = shadow.getElementById('pgPrev');
    const pgNext = shadow.getElementById('pgNext');
    let curPage=0;

    for(let i=0;i<totalPages;i++){
      const d=document.createElement('div');
      d.className='pg-dot'+(i===0?' active':'');
      d.addEventListener('click',()=>goPage(i));
      pgDots.appendChild(d);
    }
    if(totalPages<=1)shadow.getElementById('pagination').style.display='none';

    function goPage(p){
      curPage=Math.max(0,Math.min(totalPages-1,p));
      grid.innerHTML=makeGridPage(curPage);
      grid.querySelectorAll('.photo-item').forEach(el=>{
        el.style.animation='none';el.offsetHeight;el.style.animation='';
        el.addEventListener('click',()=>openLB(+el.dataset.idx));
      });
      pgDots.querySelectorAll('.pg-dot').forEach((d,i)=>d.classList.toggle('active',i===curPage));
      pgPrev.disabled=curPage===0;
      pgNext.disabled=curPage===totalPages-1;
    }
    goPage(0);
    pgPrev.addEventListener('click',()=>goPage(curPage-1));
    pgNext.addEventListener('click',()=>goPage(curPage+1));

    /* ═══════════════════════════════════════
       CARRUSEL MOBILE
    ═══════════════════════════════════════ */
    const track  = shadow.getElementById('crTrack');
    const outer  = shadow.getElementById('crOuter');
    const dotsEl = shadow.getElementById('crDots');
    const slides = shadow.querySelectorAll('.cr-slide');
    let crCur=0;

    slides.forEach((_,i)=>{
      const d=document.createElement('div');
      d.className='cr-dot'+(i===0?' active':'');
      d.addEventListener('click',()=>goTo(i));
      dotsEl.appendChild(d);
    });
    const goTo=idx=>{
      crCur=Math.max(0,Math.min(total-1,idx));
      track.style.transform=`translateX(calc(${crCur*-90}%))`;
      slides.forEach((s,i)=>s.classList.toggle('active',i===crCur));
      dotsEl.querySelectorAll('.cr-dot').forEach((d,i)=>d.classList.toggle('active',i===crCur));
    };
    goTo(0);
    shadow.getElementById('crPrev').addEventListener('click',()=>goTo(crCur-1));
    shadow.getElementById('crNext').addEventListener('click',()=>goTo(crCur+1));
    slides.forEach(sl=>sl.addEventListener('click',()=>openLB(+sl.dataset.idx)));
    let tS=0;
    outer.addEventListener('touchstart',e=>{tS=e.touches[0].clientX;},{passive:true});
    outer.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tS;if(Math.abs(dx)>40)goTo(crCur+(dx<0?1:-1));},{passive:true});
    let mS=0,drag=false;
    outer.addEventListener('mousedown',e=>{mS=e.clientX;drag=true;});
    outer.addEventListener('mouseup',e=>{if(!drag)return;drag=false;const dx=e.clientX-mS;if(Math.abs(dx)>40)goTo(crCur+(dx<0?1:-1));});
    outer.addEventListener('mouseleave',()=>{drag=false;});
  }
}

customElements.define('panel-photo-gallery', PanelPhotoGallery);
