/**
 * <info-parroquia-marquee>  — Web component nativo (vanilla JS + Shadow DOM)
 * Franja de punta a punta con marquesina y datos de la parroquia en paneles lado a lado.
 *
 * Uso:
 *   <script src="info-parroquia-marquee.js"></script>
 *   <info-parroquia-marquee src="parroquia-info.json"></info-parroquia-marquee>
 *   <info-parroquia-marquee data='{"nombre":"..."}'></info-parroquia-marquee>
 *
 * Atributos:
 *   src        URL de un JSON con los datos
 *   data       JSON inline (tiene prioridad sobre src)
 *   velocidad  segundos que tarda la marquesina en dar una vuelta (default 32)
 *
 * Variables CSS opcionales (desde afuera): --ipm-navy, --ipm-gold, --ipm-cream, --ipm-wine
 *
 * JSON:
 * {
 *   "nombre": "...", "direccion": "...",
 *   "titulo_horarios": "...",
 *   "horarios": [ { "dias": "...", "hora": "..." } ],
 *   "consulta": { "texto": "...", "telefono": "...", "whatsapp": "549...", "mensaje": "...", "boton": "..." },
 *   "misas": [ { "titulo": "...", "direccion": "...", "horarios": [ { "dias": "...", "hora": "..." } ] } ],
 *   "marquesina": [ "texto 1", "texto 2" ]   // opcional; si falta se arma con los datos
 * }
 */
(function () {
  if (customElements.get('info-parroquia-marquee')) return;

  const css = `
    :host{
      display:block; width:100%; box-sizing:border-box;
      --ipm-navy:#14213d; --ipm-navy-2:#1d2f55; --ipm-gold:#e9b44c;
      --ipm-cream:#fdf6e3; --ipm-wine:#7a1f2b;
      font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
    }
    *,*::before,*::after{ box-sizing:border-box; }
    .band{ width:100%; background:var(--ipm-navy); color:var(--ipm-cream); overflow:hidden; }
    .band[hidden]{ display:none; }

    /* ---------- Marquesina ---------- */
    .ticker{
      position:relative; overflow:hidden; background:var(--ipm-gold); color:var(--ipm-navy);
      border-bottom:3px solid var(--ipm-wine);
    }
    .ticker::before,.ticker::after{
      content:""; position:absolute; top:0; bottom:0; width:48px; z-index:2; pointer-events:none;
    }
    .ticker::before{ left:0;  background:linear-gradient(90deg,var(--ipm-gold),transparent); }
    .ticker::after{  right:0; background:linear-gradient(270deg,var(--ipm-gold),transparent); }
    .track{
      display:flex; width:max-content;
      animation:ipm-scroll var(--ipm-speed,32s) linear infinite;
    }
    .ticker:hover .track,.ticker:focus-within .track{ animation-play-state:paused; }
    .group{ display:flex; flex:none; align-items:center; }
    .item{
      font-family: Georgia, "Times New Roman", serif; font-weight:700;
      font-size:clamp(15px,2.2vw,20px); padding:11px 0; white-space:nowrap; letter-spacing:.2px;
    }
    .sep{ margin:0 clamp(16px,3vw,32px); color:var(--ipm-wine); font-size:14px; }
    @keyframes ipm-scroll{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

    /* ---------- Paneles lado a lado ---------- */
    .panels{ display:grid; grid-template-columns:1fr; }
    .panel{ padding:clamp(18px,3vw,34px) clamp(18px,4vw,48px); min-width:0; }
    .panel + .panel{ border-top:1px solid rgba(233,180,76,.35); }

    .nombre{
      margin:0; font-family:Georgia,"Times New Roman",serif; font-weight:700;
      font-size:clamp(24px,3.4vw,38px); line-height:1.15; color:var(--ipm-gold);
    }
    .direccion{ margin:12px 0 0; font-size:clamp(15px,1.6vw,18px); line-height:1.4; opacity:.92; }

    .h-titulo{
      margin:0 0 14px; font-family:Georgia,"Times New Roman",serif; font-weight:700;
      font-size:clamp(17px,2vw,22px); color:var(--ipm-gold);
    }
    .rows{ list-style:none; margin:0; padding:0; display:grid; gap:10px; }
    .row{
      display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px 14px;
      padding:10px 14px; border-radius:12px;
      background:rgba(253,246,227,.07); border:1px solid rgba(233,180,76,.25);
    }
    .dias{ font-weight:600; font-size:clamp(15px,1.6vw,17px); }
    .hora{
      font-variant-numeric:tabular-nums; font-weight:700; font-size:clamp(14px,1.5vw,16px);
      background:var(--ipm-gold); color:var(--ipm-navy); padding:4px 12px; border-radius:999px; white-space:nowrap;
    }

    .consulta{ display:flex; flex-direction:column; justify-content:center; gap:14px; }
    .c-texto{ margin:0; font-size:clamp(15px,1.7vw,18px); line-height:1.4; }
    .c-tel{
      font-family:Georgia,"Times New Roman",serif; font-weight:700;
      font-size:clamp(24px,3vw,34px); color:var(--ipm-gold); letter-spacing:.5px;
    }
    .btn{
      align-self:flex-start; display:inline-flex; align-items:center; gap:10px;
      background:#25d366; color:#0b3d1f; text-decoration:none; font-weight:700;
      font-size:clamp(15px,1.6vw,17px); padding:12px 22px; border-radius:999px;
      box-shadow:0 6px 18px rgba(0,0,0,.28); transition:transform .2s, box-shadow .2s;
    }
    .btn:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,.34); }
    .btn:focus-visible{ outline:3px solid var(--ipm-cream); outline-offset:3px; }
    .btn svg{ width:20px; height:20px; flex:none; }

    /* ---------- Misas (fila propia, N paneles lado a lado) ---------- */
    .misas{
      display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));
      gap:1px; background:rgba(233,180,76,.35); border-top:1px solid rgba(233,180,76,.35);
    }
    .misas .panel{ background:var(--ipm-navy-2); border:0; }
    .misas .direccion{ margin:-6px 0 14px; font-size:clamp(14px,1.5vw,16px); }

    @media (min-width:769px){
      .panels{ grid-template-columns:1.1fr 1.3fr 1fr; }
      .panel + .panel{ border-top:0; border-left:1px solid rgba(233,180,76,.35); }
    }
    @media (prefers-reduced-motion:reduce){
      .track{ animation:none; flex-wrap:wrap; width:100%; }
      .group[aria-hidden="true"]{ display:none; }
      .group{ flex-wrap:wrap; padding:0 16px; }
      .ticker::before,.ticker::after{ display:none; }
    }
  `;

  const WA_ICON =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.08-1.17.1-1.9-.12-.44-.14-1-.33-1.72-.65-3.03-1.3-5-4.35-5.15-4.55-.15-.2-1.23-1.63-1.23-3.1 0-1.48.77-2.2 1.05-2.5.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.52.25.6.85 2.08.93 2.23.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.5-.15.15-.3.3-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.08 1.32 2.38 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.12.08.72-.17 1.42Z"/></svg>';

  function h(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null && text !== '') el.textContent = text;
    return el;
  }
  const str = (v) => (typeof v === 'string' ? v.trim() : '');

  class InfoParroquiaMarquee extends HTMLElement {
    static get observedAttributes() { return ['src', 'data', 'velocidad']; }

    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = `<style>${css}</style><div class="band" hidden></div>`;
      this._band = this._root.querySelector('.band');
      this._model = null;
      this._token = 0;
    }

    connectedCallback() { this._load(); }
    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV || !this.isConnected) return;
      if (name === 'velocidad') this._applySpeed();
      else this._load();
    }

    async _load() {
      const token = ++this._token;
      const inline = this.getAttribute('data');
      const src = this.getAttribute('src');
      let json = null;
      try {
        if (inline) json = JSON.parse(inline);
        else if (src) {
          const res = await fetch(src, { cache: 'no-cache' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          json = await res.json();
        }
      } catch (err) {
        console.warn('[info-parroquia-marquee] No se pudo leer el JSON:', err);
      }
      if (token !== this._token) return; // llegó una carga más nueva
      this._model = json && typeof json === 'object' ? json : null;
      this._render();
    }

    _applySpeed() {
      const s = parseFloat(this.getAttribute('velocidad'));
      this._band.style.setProperty('--ipm-speed', (s > 0 ? s : 32) + 's');
    }

    _tickerItems(d, horarios, consulta, misas) {
      if (Array.isArray(d.marquesina) && d.marquesina.length) {
        return d.marquesina.map(str).filter(Boolean);
      }
      const items = [];
      if (str(d.nombre)) items.push(str(d.nombre));
      if (str(d.direccion)) items.push(str(d.direccion));
      horarios.forEach((r) => {
        const t = [r.dias, r.hora].filter(Boolean).join(': ');
        if (t) items.push((str(d.titulo_horarios) ? 'Secretaría · ' : '') + t);
      });
      misas.forEach((m) => {
        m.horarios.forEach((r) => {
          const t = [r.dias, r.hora].filter(Boolean).join(': ');
          if (t) items.push([m.titulo, t].filter(Boolean).join(' · '));
        });
      });
      if (str(consulta.telefono)) items.push('WhatsApp ' + str(consulta.telefono));
      return items;
    }

    _waLink(consulta) {
      let num = str(consulta.whatsapp).replace(/\D/g, '');
      if (!num) {
        const t = str(consulta.telefono).replace(/\D/g, '');
        if (!t) return '';
        num = t.length === 10 ? '549' + t : t; // móvil argentino sin código de país
      }
      const msg = str(consulta.mensaje);
      return 'https://wa.me/' + num + (msg ? '?text=' + encodeURIComponent(msg) : '');
    }

    _render() {
      const band = this._band;
      band.textContent = '';
      const d = this._model;
      if (!d) { band.hidden = true; return; }

      const horarios = (Array.isArray(d.horarios) ? d.horarios : [])
        .map((r) => ({ dias: str(r && r.dias), hora: str(r && r.hora) }))
        .filter((r) => r.dias || r.hora);
      const consulta = d.consulta && typeof d.consulta === 'object' ? d.consulta : {};

      const misas = (Array.isArray(d.misas) ? d.misas : [])
        .map((m) => ({
          titulo: str(m && m.titulo),
          direccion: str(m && m.direccion),
          horarios: (Array.isArray(m && m.horarios) ? m.horarios : [])
            .map((r) => ({ dias: str(r && r.dias), hora: str(r && r.hora) }))
            .filter((r) => r.dias || r.hora)
        }))
        .filter((m) => m.titulo || m.horarios.length);

      // --- Marquesina (dos copias idénticas para un loop sin saltos) ---
      const items = this._tickerItems(d, horarios, consulta, misas);
      if (items.length) {
        const ticker = h('div', 'ticker');
        ticker.setAttribute('role', 'marquee');
        const track = h('div', 'track');
        for (let copy = 0; copy < 2; copy++) {
          const g = h('div', 'group');
          if (copy === 1) g.setAttribute('aria-hidden', 'true');
          items.forEach((t) => {
            g.appendChild(h('span', 'item', t));
            g.appendChild(h('span', 'sep', '✦'));
          });
          track.appendChild(g);
        }
        ticker.appendChild(track);
        band.appendChild(ticker);
      }

      // --- Paneles ---
      const panels = h('div', 'panels');

      if (str(d.nombre) || str(d.direccion)) {
        const p = h('section', 'panel');
        if (str(d.nombre)) p.appendChild(h('h2', 'nombre', str(d.nombre)));
        if (str(d.direccion)) p.appendChild(h('p', 'direccion', str(d.direccion)));
        panels.appendChild(p);
      }

      if (horarios.length || str(d.titulo_horarios)) {
        const p = h('section', 'panel');
        if (str(d.titulo_horarios)) p.appendChild(h('h3', 'h-titulo', str(d.titulo_horarios)));
        const ul = h('ul', 'rows');
        horarios.forEach((r) => {
          const li = h('li', 'row');
          if (r.dias) li.appendChild(h('span', 'dias', r.dias));
          if (r.hora) li.appendChild(h('span', 'hora', r.hora));
          ul.appendChild(li);
        });
        p.appendChild(ul);
        panels.appendChild(p);
      }

      const link = this._waLink(consulta);
      if (str(consulta.texto) || str(consulta.telefono)) {
        const p = h('section', 'panel consulta');
        if (str(consulta.texto)) p.appendChild(h('p', 'c-texto', str(consulta.texto)));
        if (str(consulta.telefono)) p.appendChild(h('div', 'c-tel', str(consulta.telefono)));
        if (link && str(consulta.boton)) {
          const a = h('a', 'btn');
          a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.insertAdjacentHTML('beforeend', WA_ICON);
          a.appendChild(h('span', '', str(consulta.boton)));
          p.appendChild(a);
        }
        panels.appendChild(p);
      }

      if (panels.children.length) band.appendChild(panels);

      if (misas.length) {
        const wrap = h('div', 'misas');
        misas.forEach((m) => {
          const p = h('section', 'panel');
          if (m.titulo) p.appendChild(h('h3', 'h-titulo', m.titulo));
          if (m.direccion) p.appendChild(h('p', 'direccion', m.direccion));
          const ul = h('ul', 'rows');
          m.horarios.forEach((r) => {
            const li = h('li', 'row');
            if (r.dias) li.appendChild(h('span', 'dias', r.dias));
            if (r.hora) li.appendChild(h('span', 'hora', r.hora));
            ul.appendChild(li);
          });
          p.appendChild(ul);
          wrap.appendChild(p);
        });
        band.appendChild(wrap);
      }
      band.hidden = !band.children.length;
      this._applySpeed();
    }
  }

  customElements.define('info-parroquia-marquee', InfoParroquiaMarquee);
})();
