class ParroquiaNosotros extends HTMLElement {
  connectedCallback() {
    // Defer so that child elements (slot="lead", slot="desc") are parsed first
    setTimeout(() => this._render(), 0);
  }

  _render() {
    const gifSrc    = this.getAttribute('gif-src')    || '/img/padres.gif';
    const headerSrc = this.getAttribute('header-src') || './img/apaisado.png';
    const badge     = this.getAttribute('badge')      || '⛪ Parroquia San Luis Gonzaga · Villa Elisa';
    const title     = this.getAttribute('title')      || 'Nuestra Parroquia';
    const leadEl = this.querySelector('[slot="lead"]');
    const descEl = this.querySelector('[slot="desc"]');
    const lead   = leadEl ? leadEl.innerHTML : '';
    const body   = descEl ? descEl.innerHTML : '';

    const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          background: #f8f9fa;
          padding: 56px 24px;
        }

        .wrap {
          display: flex;
          align-items: flex-start;
          gap: 64px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px;
          box-sizing: border-box;
        }

        /* ── Ala izquierda: gif ── */
        .ala-gif {
          flex: 0 0 44%;
          min-width: 0;
        }
        .ala-gif img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 22px;
          box-shadow: 0 28px 64px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.13);
          transition: transform .4s ease, box-shadow .4s ease;
        }
        .ala-gif img:hover {
          transform: scale(1.015);
          box-shadow: 0 36px 80px rgba(0,0,0,0.26), 0 12px 28px rgba(0,0,0,0.16);
        }

        /* ── Ala derecha: texto ── */
        .ala-texto {
          flex: 1 1 0%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        /* Header apaisado – a todo el ancho del ala */
        .header-img {
          width: 100%;
          height: 220px;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 28px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.10);
          flex-shrink: 0;
        }
        .header-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Badge */
        .badge {
          display: inline-block;
          width: fit-content;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #5c17d4;
          background: rgba(92,23,212,.08);
          border: 1px solid rgba(92,23,212,.25);
          border-radius: 50px;
          padding: 6px 18px;
          margin-bottom: 20px;
        }

        /* Título */
        h2 {
          color: #1a0a3c;
          font-size: 2.9rem;
          font-weight: 800;
          margin: 0 0 20px 26px;
          line-height: 1.12;
          position: relative;
          font-family: 'Montserrat', 'Roboto', sans-serif;
        }
        h2::before {
          content: '';
          position: absolute;
          left: -26px;
          top: 4px;
          bottom: 4px;
          width: 8px;
          background: linear-gradient(180deg,#7c3aed,#5c17d4);
          border-radius: 6px;
        }

        /* Lead */
        .lead {
          font-size: 1.28rem;
          font-weight: 600;
          line-height: 1.5;
          color: #374151;
          margin: 0 0 22px 0;
          font-family: 'Montserrat', 'Roboto', sans-serif;
        }

        /* Descripción */
        .desc {
          font-size: 1.08rem;
          line-height: 1.65;
          color: #4b5563;
          margin: 0;
          text-align: left;
          hyphens: auto;
          -webkit-hyphens: auto;
          font-family: 'Montserrat', 'Roboto', sans-serif;
        }
        .desc::first-letter {
          font-size: 3.4rem;
          font-weight: 800;
          float: left;
          line-height: .95;
          margin: 6px 12px 0 0;
          color: #5c17d4;
          font-family: 'Montserrat', 'Roboto', sans-serif;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          :host {
            width: 95vw;
            max-width: 95vw;
            margin-left: auto;
            margin-right: auto;
            border-radius: 24px;
            overflow: hidden;
          }
          .wrap {
            flex-direction: column;
            gap: 22px;
            padding: 40px 18px;
          }
          .ala-gif { flex: 0 0 auto; width: 100%; }
          .ala-texto { padding: 0 4px; }
          h2 {
            font-size: 1.95rem;
            margin: 0 0 14px 16px;
            line-height: 1.18;
          }
          h2::before {
            display: block;
            left: -16px;
            top: 3px;
            bottom: 3px;
            width: 6px;
            border-radius: 4px;
            opacity: .95;
          }
          .badge {
            align-self: center;
            font-size: .66rem;
            letter-spacing: .06em;
            white-space: nowrap;
            padding: 5px 14px;
            margin-bottom: 14px;
          }
          .header-img { height: 180px; margin-bottom: 20px; }
          .lead {
            font-size: 1.05rem;
            line-height: 1.45;
            margin: 0 0 14px 0;
          }
          .desc {
            font-size: .98rem;
            line-height: 1.55;
            text-align: left;
            hyphens: auto;
            -webkit-hyphens: auto;
          }
          .desc::first-letter {
            font-size: 2.6rem;
            font-weight: 800;
            float: left;
            line-height: 1;
            margin: 4px 8px 0 0;
            color: #5c17d4;
            font-family: 'Montserrat', 'Roboto', sans-serif;
          }
        }

        @media (max-width: 480px) {
          .wrap { padding: 28px 14px; }
          .ala-texto { padding: 0 2px; }
          h2 { font-size: 1.6rem; margin-left: 14px; }
          h2::before {
            left: -14px;
            width: 5px;
            top: 4px;
            bottom: 4px;
            border-radius: 3px;
            opacity: .9;
          }
          .header-img { height: 140px; margin-bottom: 16px; }
          .badge { margin-bottom: 12px; }
          .lead {
            font-size: .98rem;
            line-height: 1.4;
            margin-bottom: 12px;
          }
          .desc {
            font-size: .92rem;
            line-height: 1.5;
          }
          .desc::first-letter {
            font-size: 2.3rem;
            margin: 3px 7px 0 0;
          }
        }

        @media (max-width: 380px) {
          h2::before {
            background: #6b35d7;
            opacity: .68;
          }
          .lead { font-size: .94rem; }
          .desc { font-size: .9rem; line-height: 1.48; }
        }
      </style>

      <div class="wrap">
        <div class="ala-gif">
          <img src="${gifSrc}" alt="Comunidad Parroquial">
        </div>
        <div class="ala-texto">
          <div class="header-img">
            <img src="${headerSrc}" alt="${title}">
          </div>
          <span class="badge">${badge}</span>
          <h2>${title}</h2>
          <p class="lead">${lead}</p>
          <p class="desc">${body}</p>
        </div>
      </div>
    `;
  }
}

customElements.define('parroquia-nosotros', ParroquiaNosotros);
