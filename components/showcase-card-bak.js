/**
 * <showcase-card> — Web Component v5
 *
 * ATRIBUTOS:
 *   bg             — URL imagen de fondo
 *   cover          — URL poster desktop (columna izquierda)
 *   medallion      — URL foto circular flotante mobile
 *   video          — URL video principal (mp4)
 *   video2         — URL segundo video opcional (mp4)
 *   titulo         — Título del video principal
 *   titulo2        — Título del segundo video (default: igual que titulo)
 *   badge          — Badge video principal (default: "Premium")
 *   badge2         — Badge segundo video  (default: igual que badge)
 *   overlay        — 0.0–1.0 oscurecimiento del fondo (default: 0)
 *   overlay-preset — "light" | "medium" | "dark"
 *   effects        — "dust,bubbles,stars,rain,comets,ember" (combinables)
 *   intensity      — 0.0–1.0 intensidad de partículas (default: 0.6)
 *
 * LAYOUT:
 *   Desktop: cover izq | video1 centro | video2 der  (video2 opcional)
 *   Mobile:  carousel swipeable entre video1 y video2 + dots
 *
 * EJEMPLO:
 *   <showcase-card
 *     bg="./img/sky.jpg"
 *     cover="./img/poster.webp"
 *     medallion="./img/avatar.jpeg"
 *     video="./video/v1.mp4"   titulo="Homilía del domingo"  badge="Padre Juan"
 *     video2="./video/v2.mp4"  titulo2="Reflexión especial"  badge2="Padre Pedro"
 *     effects="ember,dust,stars"
 *     intensity="0.7"
 *   ></showcase-card>
 */

/* ══════════════════════════════════════════════════════════════════
   EFECTOS DE PARTÍCULAS
══════════════════════════════════════════════════════════════════ */

class DustEffect {
  constructor(ctx, it) { this.ctx=ctx; this.it=it; this.p=[]; }
  _new(w,h,ry=false){return{x:Math.random()*w,y:ry?Math.random()*h:h+4,r:.8+Math.random()*1.8,vy:.28+Math.random()*.5,vx:(Math.random()-.5)*.25,alpha:0,t:0,tMax:200+Math.random()*250};}
  spawn(w,h){const n=Math.max(Math.round((w*h/80000)*22*this.it),6);this.p=Array.from({length:n},()=>this._new(w,h,true));}
  tick(w,h){const ctx=this.ctx,mx=.75*this.it;for(let i=0;i<this.p.length;i++){const p=this.p[i];p.t++;p.x+=p.vx;p.y-=p.vy;const r=p.t/p.tMax;if(r<.2)p.alpha=Math.min(p.alpha+.025,mx);else if(r>.75)p.alpha=Math.max(p.alpha-.015,0);if(p.t>=p.tMax||p.y<-6){this.p[i]=this._new(w,h);continue;}ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle='#f5d06b';ctx.shadowColor='rgba(245,208,107,.9)';ctx.shadowBlur=6;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
}

class BubblesEffect {
  constructor(ctx,it){this.ctx=ctx;this.it=it;this.p=[];}
  _new(w,h,ry=false){const r=6+Math.random()*22;return{x:Math.random()*w,y:ry?Math.random()*h:h+r+4,r,vy:.18+Math.random()*.32,vx:(Math.random()-.5)*.15,alpha:0,t:0,tMax:280+Math.random()*320,hue:38+Math.random()*18};}
  spawn(w,h){this.p=Array.from({length:Math.max(Math.round(8*this.it),3)},()=>this._new(w,h,true));}
  tick(w,h){const ctx=this.ctx,mx=.28*this.it;for(let i=0;i<this.p.length;i++){const p=this.p[i];p.t++;p.x+=p.vx;p.y-=p.vy;const r=p.t/p.tMax;if(r<.15)p.alpha=Math.min(p.alpha+.012,mx);else if(r>.75)p.alpha=Math.max(p.alpha-.008,0);if(p.t>=p.tMax||p.y<-p.r*2){this.p[i]=this._new(w,h);continue;}ctx.save();ctx.globalAlpha=p.alpha;ctx.strokeStyle=`hsla(${p.hue},80%,65%,1)`;ctx.lineWidth=1.2;ctx.shadowColor=`hsla(${p.hue},80%,65%,.6)`;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=p.alpha*.35;ctx.fillStyle=`hsla(${p.hue},60%,80%,1)`;ctx.beginPath();ctx.arc(p.x-p.r*.3,p.y-p.r*.3,p.r*.28,0,Math.PI*2);ctx.fill();ctx.restore();}}
}

class StarsEffect {
  constructor(ctx,it){this.ctx=ctx;this.it=it;this.p=[];}
  _new(w,h){return{x:Math.random()*w,y:Math.random()*h*.85,r:.6+Math.random()*1.4,alpha:Math.random(),speed:.008+Math.random()*.018,phase:Math.random()*Math.PI*2,arms:Math.random()<.4};}
  spawn(w,h){this.p=Array.from({length:Math.max(Math.round(20*this.it),5)},()=>this._new(w,h));}
  tick(w,h){const ctx=this.ctx,mx=.9*this.it;for(const p of this.p){p.phase+=p.speed;p.alpha=(Math.sin(p.phase)*.5+.5)*mx;ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle='#fff8e0';ctx.shadowColor='rgba(245,230,150,.95)';ctx.shadowBlur=8;if(p.arms){ctx.strokeStyle='rgba(245,220,120,.9)';ctx.lineWidth=.7;for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+p.phase*.3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(a)*p.r*3.5,p.y+Math.sin(a)*p.r*3.5);ctx.stroke();}}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
}

class RainEffect {
  constructor(ctx,it){this.ctx=ctx;this.it=it;this.p=[];}
  _new(w,h,ry=false){const len=8+Math.random()*18;return{x:Math.random()*(w+60)-30,y:ry?Math.random()*h:-len,len,vx:.8+Math.random()*1.2,vy:2.5+Math.random()*3.5,alpha:0,t:0,tMax:80+Math.random()*80};}
  spawn(w,h){this.p=Array.from({length:Math.max(Math.round(14*this.it),4)},()=>this._new(w,h,true));}
  tick(w,h){const ctx=this.ctx,mx=.55*this.it;for(let i=0;i<this.p.length;i++){const p=this.p[i];p.t++;p.x+=p.vx;p.y+=p.vy;const r=p.t/p.tMax;if(r<.2)p.alpha=Math.min(p.alpha+.04,mx);else if(r>.7)p.alpha=Math.max(p.alpha-.04,0);if(p.t>=p.tMax||p.y>h+10){this.p[i]=this._new(w,h);continue;}ctx.save();ctx.globalAlpha=p.alpha;const g=ctx.createLinearGradient(p.x,p.y,p.x-p.vx*p.len*.5,p.y-p.vy*p.len*.5);g.addColorStop(0,'rgba(245,208,107,1)');g.addColorStop(1,'rgba(245,208,107,0)');ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.shadowColor='rgba(245,208,107,.7)';ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*p.len*.5,p.y-p.vy*p.len*.5);ctx.stroke();ctx.restore();}}
}

class CometsEffect {
  constructor(ctx,it){this.ctx=ctx;this.it=it;this.comets=[];this.sparks=[];}
  _newComet(w,h){const fr=Math.random()<.5;return{x:fr?w+20:-20,y:10+Math.random()*h*.8,vx:fr?-(3+Math.random()*4):(3+Math.random()*4),vy:(Math.random()-.5)*1.2,len:22+Math.random()*30,alpha:0,t:0,tMax:60+Math.random()*50,exploded:false};}
  _explode(c){const n=Math.round(8+Math.random()*10);for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.random()*.4,sp=.8+Math.random()*2.2;this.sparks.push({x:c.x,y:c.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:.7+Math.random()*1.3,alpha:.9*this.it,t:0,tMax:30+Math.random()*40});}}
  spawn(w,h){this.comets=[];this.sparks=[];const n=Math.max(Math.round(3*this.it),1);for(let i=0;i<n;i++){const c=this._newComet(w,h);c.t=Math.random()*c.tMax;this.comets.push(c);}}
  tick(w,h){const ctx=this.ctx;for(let i=0;i<this.comets.length;i++){const c=this.comets[i];c.t++;c.x+=c.vx;c.y+=c.vy;const r=c.t/c.tMax;if(r<.15)c.alpha=Math.min(c.alpha+.08,.85*this.it);else if(r>.7)c.alpha=Math.max(c.alpha-.06,0);if(c.t>=c.tMax){if(!c.exploded){c.exploded=true;this._explode(c);}this.comets[i]=this._newComet(w,h);continue;}ctx.save();ctx.globalAlpha=c.alpha;const tx=c.x-Math.sign(c.vx)*c.len;const g=ctx.createLinearGradient(c.x,c.y,tx,c.y-c.vy*c.len*.3);g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(.3,'rgba(245,208,107,.7)');g.addColorStop(1,'rgba(197,162,39,0)');ctx.strokeStyle=g;ctx.lineWidth=2.2;ctx.shadowColor='rgba(245,208,107,.8)';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(tx,c.y-c.vy*c.len*.3);ctx.stroke();ctx.fillStyle='#fffbe8';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(c.x,c.y,2.2,0,Math.PI*2);ctx.fill();ctx.restore();}for(let i=this.sparks.length-1;i>=0;i--){const s=this.sparks[i];s.t++;s.x+=s.vx;s.y+=s.vy;s.vy+=.04;s.alpha=Math.max(s.alpha-(.9*this.it/s.tMax),0);if(s.t>=s.tMax){this.sparks.splice(i,1);continue;}ctx.save();ctx.globalAlpha=s.alpha;ctx.fillStyle='#f5d06b';ctx.shadowColor='rgba(245,208,107,.9)';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
}

class EmberEffect {
  constructor(ctx,it){this.ctx=ctx;this.it=it;this.p=[];}
  _new(){const ox=Math.random()*60,oy=Math.random()*60,speed=.6+Math.random()*1.4,spread=(Math.random()-.3)*.8,angle=Math.PI*.18+spread;return{x:ox,y:oy,vx:Math.cos(angle)*speed*(1.2+Math.random()),vy:Math.sin(angle)*speed,turbAmp:.8+Math.random()*1.8,turbFreq:.04+Math.random()*.06,turbOff:Math.random()*Math.PI*2,r:.7+Math.random()*1.6,alpha:0,t:0,tMax:90+Math.random()*130,hue:42+Math.random()*18};}
  spawn(w,h){const n=Math.max(Math.round(18*this.it),5);this.p=Array.from({length:n},()=>{const p=this._new();p.t=Math.random()*p.tMax;return p;});}
  tick(w,h){const ctx=this.ctx,mx=.85*this.it;for(let i=0;i<this.p.length;i++){const p=this.p[i];p.t++;const turb=Math.sin(p.t*p.turbFreq+p.turbOff)*p.turbAmp;p.x+=p.vx+turb*.08;p.y+=p.vy+turb*.04;const ratio=p.t/p.tMax;if(ratio<.12)p.alpha=Math.min(p.alpha+.08,mx);else if(ratio>.55)p.alpha=Math.max(p.alpha-.018,0);if(p.t>=p.tMax||p.x>w+20||p.y>h+20){this.p[i]=this._new();continue;}const af=Math.min(ratio*2,1);const hue=p.hue-af*28,sat=90+af*10,light=75-af*30;ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle=`hsl(${hue},${sat}%,${light}%)`;ctx.shadowColor=`hsla(${hue},100%,60%,.9)`;ctx.shadowBlur=8+af*4;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1-af*.4),0,Math.PI*2);ctx.fill();ctx.restore();}}
}

/* ══════════════════════════════════════════════════════════════════
   MOTOR DE PARTÍCULAS
══════════════════════════════════════════════════════════════════ */
const EFFECT_MAP = {dust:DustEffect,bubbles:BubblesEffect,stars:StarsEffect,rain:RainEffect,comets:CometsEffect,ember:EmberEffect};

class ParticleEngine {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.effects=[];this.running=false;this._raf=null;this._ro=new ResizeObserver(()=>this._resize());this._ro.observe(canvas.parentElement);this._resize();}
  _resize(){const p=this.canvas.parentElement;if(!p)return;this.canvas.width=p.offsetWidth;this.canvas.height=p.offsetHeight;this._respawn();}
  setEffects(names,it){this.effects=names.map(n=>EFFECT_MAP[n.trim()]).filter(Boolean).map(Cls=>new Cls(this.ctx,Math.max(0,Math.min(1,it))));this._respawn();}
  _respawn(){const w=this.canvas.width||600,h=this.canvas.height||300;for(const ef of this.effects)ef.spawn(w,h);}
  start(){this.running=true;this._tick();}
  stop(){this.running=false;if(this._raf)cancelAnimationFrame(this._raf);}
  _tick(){if(!this.running)return;this._raf=requestAnimationFrame(()=>this._tick());const w=this.canvas.width,h=this.canvas.height;this.ctx.clearRect(0,0,w,h);for(const ef of this.effects)ef.tick(w,h);}
  destroy(){this.stop();this._ro.disconnect();}
}

/* ══════════════════════════════════════════════════════════════════
   TEMPLATE
══════════════════════════════════════════════════════════════════ */
const _scTpl = document.createElement('template');
_scTpl.innerHTML = `
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :host{display:block;width:100%;}

  .sc-wrap{
    position:relative;max-width:1100px;margin:0 auto 2rem;padding:1.5rem;
    border-radius:24px;overflow:hidden;
    background-color:rgba(15,10,30,0.5);
    background-size:cover;background-position:center center;background-repeat:no-repeat;
    backdrop-filter:blur(20px) saturate(1.3);
    -webkit-backdrop-filter:blur(20px) saturate(1.3);
    box-shadow:
      0 0 0 1.5px rgba(197,162,39,.55),
      0 0 0 3px rgba(197,162,39,.12),
      0 12px 48px rgba(0,0,0,.5),
      inset 0 1px 0 rgba(245,208,107,.2),
      inset 0 -1px 0 rgba(197,162,39,.1);
    transition:box-shadow .4s ease;
  }
  .sc-wrap:hover{
    box-shadow:
      0 0 0 1.5px rgba(245,208,107,.85),
      0 0 0 3px rgba(197,162,39,.22),
      0 0 36px rgba(197,162,39,.18),
      0 16px 60px rgba(0,0,0,.55),
      inset 0 1px 0 rgba(245,208,107,.35),
      inset 0 -1px 0 rgba(197,162,39,.12);
  }

  .sc-overlay{position:absolute;inset:0;background:rgba(8,4,20,0);pointer-events:none;z-index:1;transition:background .4s;}
  .sc-shimmer{position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(105deg,transparent 30%,rgba(245,208,107,.06) 50%,transparent 70%);pointer-events:none;z-index:6;animation:scShimmer 6s ease-in-out infinite 1s;}
  @keyframes scShimmer{0%{left:-60%}50%{left:120%}100%{left:120%}}
  .sc-glass{position:absolute;inset:0;border-radius:24px;background:linear-gradient(135deg,rgba(245,208,107,.1) 0%,transparent 40%,transparent 60%,rgba(197,162,39,.05) 100%);pointer-events:none;z-index:3;}
  .sc-canvas{position:absolute;inset:0;pointer-events:none;z-index:20;}

  .sc-corner{position:absolute;width:44px;height:44px;z-index:7;pointer-events:none;}
  .sc-corner.tl{top:0;left:0;}.sc-corner.tr{top:0;right:0;transform:scaleX(-1);}
  .sc-corner.bl{bottom:0;left:0;transform:scaleY(-1);}.sc-corner.br{bottom:0;right:0;transform:scale(-1,-1);}

  /* ── Desktop layout: cover | video1 | video2 ── */
  .sc-layout{display:flex;align-items:center;justify-content:center;gap:1.5rem;position:relative;z-index:8;}

  .sc-cover{flex:1 1 45%;min-width:0;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.4),0 0 0 1px rgba(197,162,39,.25);}
  .sc-cover img{display:block;width:100%;height:auto;border-radius:16px;}

  /* contenedor de los video cards en desktop */
  .sc-videos-desktop{flex:0 0 auto;display:flex;gap:1rem;align-items:center;}

  /* ── Mobile carousel ── */
  .sc-carousel-wrap{display:none;flex:1 1 100%;max-width:100%;flex-direction:column;align-items:center;gap:0.5rem;}

  /* fila: solo la pista, ocupa todo el ancho */
  .sc-carousel-row{position:relative;width:100%;}

  .sc-carousel-outer{width:100%;overflow:hidden;border-radius:16px;touch-action:pan-y;}
  .sc-carousel-track{display:flex;transition:transform .38s cubic-bezier(.22,1,.36,1);will-change:transform;}
  .sc-carousel-track > *{flex:0 0 100%;max-width:100%;}

  /* flechas: absolutas, centradas verticalmente, sobre el track */
  .sc-arr{
    position:absolute;
    top:50%;transform:translateY(-50%);
    width:34px;height:34px;
    border-radius:50%;
    border:1.5px solid rgba(245,208,107,.6);
    background:rgba(15,10,30,.65);
    backdrop-filter:blur(8px);
    -webkit-backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
    transition:background .2s,border-color .2s,box-shadow .2s,opacity .25s,transform .15s;
    box-shadow:0 0 12px rgba(197,162,39,.25);
    z-index:9;
    -webkit-tap-highlight-color:transparent;
    user-select:none;
  }
  #scArrPrev{left:6px;}
  #scArrNext{right:6px;}
  .sc-arr:hover{background:rgba(197,162,39,.22);border-color:rgba(245,208,107,.95);box-shadow:0 0 20px rgba(197,162,39,.45);}
  .sc-arr:active{transform:translateY(-50%) scale(.9);}
  .sc-arr.hidden{opacity:0;pointer-events:none;}
  .sc-arr svg{width:14px;height:14px;fill:none;stroke:rgba(245,208,107,.9);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}

  .sc-carousel-dots{display:flex;gap:7px;align-items:center;justify-content:center;padding-top:2px;}
  .sc-dot{width:7px;height:7px;border-radius:50%;background:rgba(197,162,39,.3);border:1px solid rgba(245,208,107,.5);transition:background .3s,transform .3s;cursor:pointer;}
  .sc-dot.active{background:rgba(245,208,107,.95);transform:scale(1.4);}

  /* ── Medallón mobile ── */
  .sc-medallon-wrap{position:absolute;top:12px;left:12px;width:110px;height:110px;z-index:10;display:none;align-items:center;justify-content:center;animation:scFloat 4s ease-in-out infinite;pointer-events:none;}
  @keyframes scFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .sc-medallon-ring{position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(rgba(245,208,107,.95) 0deg,rgba(197,162,39,.2) 90deg,rgba(245,208,107,.95) 180deg,rgba(197,162,39,.15) 270deg,rgba(245,208,107,.95) 360deg);animation:scRingSpin 5s linear infinite;}
  @keyframes scRingSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .sc-medallon-img{position:relative;width:110px;height:110px;border-radius:50%;object-fit:cover;border:2.5px solid rgba(245,208,107,.95);animation:scGlow 4s ease-in-out infinite;z-index:2;background:#0f0a1e;}
  @keyframes scGlow{0%,100%{box-shadow:0 0 12px 3px rgba(197,162,39,.5),0 3px 16px rgba(0,0,0,.5)}50%{box-shadow:0 0 28px 10px rgba(245,208,107,.78),0 6px 24px rgba(0,0,0,.55)}}

  /* ── Responsive ── */
  @media (min-width:768px){
    .sc-layout{flex-direction:row;}
    .sc-medallon-wrap{display:none !important;}
    .sc-carousel-wrap{display:none !important;}
    .sc-videos-desktop{display:flex;}
  }
  @media (max-width:767px){
    .sc-wrap{width:95vw;max-width:95vw;}
    .sc-layout{flex-direction:row;align-items:center;gap:.7rem;}
    .sc-cover{display:none !important;}
    .sc-videos-desktop{display:none !important;}
    .sc-carousel-wrap{display:flex;}
    .sc-medallon-wrap{display:flex;}
  }
</style>

<div class="sc-wrap" id="scWrap">
  <div class="sc-overlay" id="scOverlay"></div>
  <div class="sc-shimmer"></div>
  <div class="sc-glass"></div>
  <canvas class="sc-canvas" id="scCanvas"></canvas>

  <svg class="sc-corner tl" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sc-gg" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f5d06b"/><stop offset="100%" stop-color="rgba(197,162,39,.3)"/>
    </linearGradient></defs>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="url(#sc-gg)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="rgba(245,208,107,.3)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,.7)"/>
  </svg>
  <svg class="sc-corner tr" viewBox="0 0 40 40" fill="none"><path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,.6)"/></svg>
  <svg class="sc-corner bl" viewBox="0 0 40 40" fill="none"><path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,.6)"/></svg>
  <svg class="sc-corner br" viewBox="0 0 40 40" fill="none"><path d="M2 20 L2 4 Q2 2 4 2 L20 2" stroke="#f5d06b" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="2" cy="2" r="2.5" fill="rgba(245,208,107,.6)"/></svg>

  <div class="sc-medallon-wrap">
    <div class="sc-medallon-ring"></div>
    <img class="sc-medallon-img" id="scMedallonImg" src="" alt="">
  </div>

  <div class="sc-layout">
    <!-- Cover desktop izquierda -->
    <div class="sc-cover"><img id="scCoverImg" src="" alt=""></div>

    <!-- Videos desktop: uno o dos cards side by side -->
    <div class="sc-videos-desktop" id="scVideosDesktop"></div>

    <!-- Carousel mobile -->
    <div class="sc-carousel-wrap" id="scCarouselWrap">
      <div class="sc-carousel-row">
        <button class="sc-arr" id="scArrPrev" aria-label="Anterior">
          <svg viewBox="0 0 14 14"><polyline points="9,2 4,7 9,12"/></svg>
        </button>
        <div class="sc-carousel-outer" id="scCarouselOuter">
          <div class="sc-carousel-track" id="scCarouselTrack"></div>
        </div>
        <button class="sc-arr" id="scArrNext" aria-label="Siguiente">
          <svg viewBox="0 0 14 14"><polyline points="5,2 10,7 5,12"/></svg>
        </button>
      </div>
      <div class="sc-carousel-dots" id="scCarouselDots"></div>
    </div>
  </div>
</div>
`;

/* ══════════════════════════════════════════════════════════════════
   WEB COMPONENT
══════════════════════════════════════════════════════════════════ */
const OVERLAY_PRESETS = {light:.15, medium:.35, dark:.58};

class ShowcaseCard extends HTMLElement {
  static get observedAttributes() {
    return ['bg','cover','medallion',
            'video','titulo','badge',
            'video2','titulo2','badge2',
            'overlay-preset','overlay','effects','intensity'];
  }

  connectedCallback() {
    if (this._init) return;
    this._init = true;
    this._shadow = this.attachShadow({mode:'open'});
    this._shadow.appendChild(_scTpl.content.cloneNode(true));

    this._wrap          = this._shadow.getElementById('scWrap');
    this._overlay       = this._shadow.getElementById('scOverlay');
    this._coverImg      = this._shadow.getElementById('scCoverImg');
    this._medImg        = this._shadow.getElementById('scMedallonImg');
    this._videosDesktop = this._shadow.getElementById('scVideosDesktop');
    this._carouselTrack = this._shadow.getElementById('scCarouselTrack');
    this._carouselDots  = this._shadow.getElementById('scCarouselDots');
    this._carouselOuter = this._shadow.getElementById('scCarouselOuter');
    this._arrPrev       = this._shadow.getElementById('scArrPrev');
    this._arrNext       = this._shadow.getElementById('scArrNext');
    this._canvas        = this._shadow.getElementById('scCanvas');

    this._carouselIdx = 0;
    this._arrPrev.addEventListener('click', () => this._goTo(this._carouselIdx - 1));
    this._arrNext.addEventListener('click', () => this._goTo(this._carouselIdx + 1));
    this._initSwipe();

    this._engine = new ParticleEngine(this._canvas);
    this._applyAll();
    requestAnimationFrame(() => this._engine.start());
  }

  attributeChangedCallback(name, _o, val) {
    if (!this._init) return;
    this._applyAttr(name, val);
  }

  _applyAll() {
    ['bg','cover','medallion',
     'video','titulo','badge',
     'video2','titulo2','badge2',
     'overlay-preset','overlay','effects','intensity']
      .forEach(a => this._applyAttr(a, this.getAttribute(a)));
  }

  _applyAttr(name, val) {
    if (!this._wrap) return;

    if (name === 'bg') {
      this._wrap.style.backgroundImage = val
        ? `url('${val}'), linear-gradient(rgba(15,10,30,.5),rgba(15,10,30,.5))`
        : '';

    } else if (name === 'cover') {
      if (val) { this._coverImg.src = val; this._coverImg.alt = this.getAttribute('titulo')||''; }

    } else if (name === 'medallion') {
      if (val) this._medImg.src = val;

    } else if (name === 'overlay-preset' || name === 'overlay') {
      const raw = this.getAttribute('overlay');
      let alpha = 0;
      if (raw !== null && raw !== '') alpha = Math.max(0, Math.min(1, parseFloat(raw)));
      else { const p = this.getAttribute('overlay-preset'); alpha = p ? (OVERLAY_PRESETS[p]??0) : 0; }
      this._overlay.style.background = `rgba(8,4,20,${alpha})`;

    } else if (name === 'effects' || name === 'intensity') {
      const names = (this.getAttribute('effects')||'dust').split(',');
      const it    = parseFloat(this.getAttribute('intensity')||'0.6');
      this._engine.setEffects(names, it);

    } else if (['video','titulo','badge','video2','titulo2','badge2'].includes(name)) {
      this._rebuildVideos();
    }
  }

  /* Crea un <video-card-gold> con los atributos dados */
  _makeCard(video, titulo, badge) {
    const card = document.createElement('video-card-gold');
    card.setAttribute('video',  video  || '');
    card.setAttribute('titulo', titulo || 'Sin título');
    card.setAttribute('badge',  badge  || 'Premium');
    card.style.width = 'auto';
    return card;
  }

  _rebuildVideos() {
    if (!this._videosDesktop) return;

    const v1 = this.getAttribute('video')   || '';
    const t1 = this.getAttribute('titulo')  || 'Sin título';
    const b1 = this.getAttribute('badge')   || 'Premium';
    const v2 = this.getAttribute('video2')  || '';
    const t2 = this.getAttribute('titulo2') || t1;
    const b2 = this.getAttribute('badge2')  || b1;

    const hasV2 = !!v2;

    /* ── Desktop: limpiar y reconstruir ── */
    this._videosDesktop.innerHTML = '';
    this._videosDesktop.appendChild(this._makeCard(v1, t1, b1));
    if (hasV2) this._videosDesktop.appendChild(this._makeCard(v2, t2, b2));

    /* ── Mobile carousel: limpiar y reconstruir ── */
    this._carouselTrack.innerHTML = '';
    this._carouselDots.innerHTML  = '';

    const slides = [[v1,t1,b1]];
    if (hasV2) slides.push([v2,t2,b2]);

    slides.forEach(([v,t,b], idx) => {
      /* slide */
      const slide = document.createElement('div');
      slide.style.cssText = 'flex:0 0 100%;max-width:100%;display:flex;align-items:center;justify-content:center;padding:0 2px;';
      const card = this._makeCard(v, t, b);
      card.style.width = '100%';
      slide.appendChild(card);
      this._carouselTrack.appendChild(slide);

      /* dot */
      if (slides.length > 1) {
        const dot = document.createElement('div');
        dot.className = 'sc-dot' + (idx === 0 ? ' active' : '');
        dot.addEventListener('click', () => this._goTo(idx));
        this._carouselDots.appendChild(dot);
      }
    });

    this._carouselIdx = 0;
    this._updateCarousel(false);
  }

  _goTo(idx) {
    const slides = this._carouselTrack.children.length;
    this._carouselIdx = Math.max(0, Math.min(idx, slides - 1));
    this._updateCarousel(true);
  }

  _updateCarousel(animate = true) {
    if (!animate) this._carouselTrack.style.transition = 'none';
    this._carouselTrack.style.transform = `translateX(-${this._carouselIdx * 100}%)`;
    if (!animate) requestAnimationFrame(() => { this._carouselTrack.style.transition = ''; });

    const total = this._carouselTrack.children.length;
    /* flechas: ocultar la que no tiene más slides en esa dirección */
    this._arrPrev.classList.toggle('hidden', this._carouselIdx === 0);
    this._arrNext.classList.toggle('hidden', this._carouselIdx >= total - 1);

    /* dots */
    const dots = this._carouselDots.querySelectorAll('.sc-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === this._carouselIdx));
  }

  /* Swipe touch en mobile */
  _initSwipe() {
    let startX = 0, startY = 0, dragging = false;
    const el = this._carouselOuter;

    el.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
    }, {passive: true});

    el.addEventListener('touchend', e => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        this._goTo(this._carouselIdx + (dx < 0 ? 1 : -1));
      }
    }, {passive: true});
  }

  disconnectedCallback() {
    if (this._engine) this._engine.destroy();
  }
}

customElements.define('showcase-card', ShowcaseCard);
