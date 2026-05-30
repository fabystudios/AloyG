class ParroquiaNosotros extends HTMLElement {
  connectedCallback() {
    // Defer so that child slots (lead, desc, quote) are parsed first
    setTimeout(() => this._render(), 0);
  }

  _render() {
    const gifSrc    = this.getAttribute('gif-src')    || '/img/padres.gif';
    const headerSrc = this.getAttribute('header-src') || './img/apaisado.png';
    const badge     = this.getAttribute('badge')      || 'Parroquia San Luis Gonzaga · Villa Elisa';
    const title     = this.getAttribute('title')      || 'Nuestra Parroquia';

    const leadEl  = this.querySelector('[slot="lead"]');
    const descEl  = this.querySelector('[slot="desc"]');
    const quoteEl = this.querySelector('[slot="quote"]');

    const lead  = leadEl  ? leadEl.innerHTML  : '';
    const body  = descEl  ? descEl.innerHTML  : '';
    const quote = quoteEl ? quoteEl.innerHTML : '';

    const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(124,58,237,0.05), transparent 60%),
            linear-gradient(180deg, #faf7f2 0%, #f3ede4 100%);
          padding: 48px 20px 56px;
          --violet-deep: #2b1454;
          --violet: #5b21b6;
          --violet-soft: #7c3aed;
          --violet-light: #a78bfa;
          --gold: #b8924a;
          --gold-soft: #c9a55a;
          --paper: #fdfbf7;
          --ink: #2a2435;
          --ink-soft: #4b4358;
          --rule: rgba(91,33,182,0.10);
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
          gap: 36px;
          align-items: start;
          max-width: 1360px;
          margin: 0 auto;
        }

        /* ── Aside del gif (columna paralela) ── */
        .aside {
          position: sticky;
          top: 24px;
          align-self: start;
        }
        figure { margin: 0; }
        .aside-frame {
          position: relative;
          margin: 0;
          border-radius: 26px;
          overflow: hidden;
          background: var(--paper);
          box-shadow:
            0 28px 56px -22px rgba(76,29,149,0.22),
            0 10px 24px -14px rgba(0,0,0,0.10),
            0 0 0 1px rgba(91,33,182,0.06);
        }
        .aside-frame img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform .9s ease;
        }
        .aside-frame:hover img { transform: scale(1.015); }
        .aside-caption {
          margin-top: 12px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: .85rem;
          color: var(--ink-soft);
          text-align: center;
          letter-spacing: .02em;
        }

        .article {
          position: relative;
          background: var(--paper);
          border-radius: 28px;
          padding: 26px 44px 32px;
          box-sizing: border-box;
          box-shadow:
            0 32px 64px -28px rgba(76,29,149,0.18),
            0 12px 28px -16px rgba(0,0,0,0.08),
            0 0 0 1px rgba(91,33,182,0.05);
        }

        /* ── 1. Imagen panorámica ── */
        .hero {
          width: 100%;
          aspect-ratio: 21 / 8;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 14px;
          box-shadow:
            0 14px 30px -12px rgba(76,29,149,0.20),
            0 5px 12px rgba(0,0,0,0.05);
        }
        .hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform .9s ease;
        }
        .hero:hover img { transform: scale(1.02); }

        /* ── 2. Badge institucional ── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: .72rem;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--violet);
          background: linear-gradient(135deg, rgba(167,139,250,0.10) 0%, rgba(91,33,182,0.12) 100%);
          border: 1px solid rgba(91,33,182,0.22);
          border-radius: 999px;
          padding: 7px 16px;
          margin-bottom: 16px;
          box-shadow:
            0 2px 10px rgba(76,29,149,0.06),
            inset 0 1px 0 rgba(255,255,255,0.65);
        }
        .badge .pin {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-soft), var(--gold));
          box-shadow: 0 0 0 2px rgba(201,165,90,0.18);
        }

        /* ── 3. Título con cápsula vertical ── */
        .title-row {
          display: flex;
          align-items: stretch;
          gap: 20px;
          margin-bottom: 16px;
        }
        .capsule {
          flex: 0 0 14px;
          width: 14px;
          align-self: stretch;
          min-height: 64px;
          border-radius: 999px;
          background:
            linear-gradient(180deg,
              rgba(196,181,253,0.85) 0%,
              rgba(139,92,246,0.95) 45%,
              rgba(76,29,149,1) 100%);
          backdrop-filter: blur(8px) saturate(140%);
          -webkit-backdrop-filter: blur(8px) saturate(140%);
          box-shadow:
            0 6px 18px rgba(91,33,182,0.28),
            inset 0 1px 0 rgba(255,255,255,0.55),
            inset 0 -1px 0 rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }
        .capsule::before {
          content: '';
          position: absolute;
          top: 5px; left: 3px; right: 3px;
          height: 38%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0));
        }
        .capsule::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 999px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
        }

        h2 {
          font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
          font-size: 2.3rem;
          font-weight: 600;
          color: var(--violet-deep);
          line-height: 1.08;
          letter-spacing: -0.01em;
          margin: 0;
        }

        /* ── 4. Lead editorial ── */
        .lead {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.12rem;
          font-style: italic;
          font-weight: 400;
          line-height: 1.55;
          color: #3b3247;
          margin: 0 0 16px 0;
          letter-spacing: 0.005em;
        }

        /* ── 5. Separador ornamental ── */
        .ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 14px auto 18px;
          color: var(--gold);
          opacity: .9;
        }
        .ornament .line {
          flex: 0 0 90px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-soft) 30%, var(--gold-soft) 70%, transparent);
        }
        .ornament .mark {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
          line-height: 1;
          letter-spacing: 6px;
          padding-left: 6px;
          color: var(--gold);
        }

        /* ── 6. Cuerpo con drop cap ── */
        .desc {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.02rem;
          font-weight: 400;
          line-height: 1.7;
          color: var(--ink);
          margin: 0;
          text-align: justify;
          hyphens: auto;
          -webkit-hyphens: auto;
        }
        .desc::first-letter {
          font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
          float: left;
          font-size: 3.4rem;
          line-height: 0.92;
          font-weight: 600;
          color: var(--violet);
          margin: 5px 10px -2px 0;
          padding: 0;
          text-shadow: 0 1px 0 rgba(91,33,182,0.06);
        }

        /* ── 7. Cita destacada ── */
        .quote {
          position: relative;
          margin: 20px 4px 8px;
          padding: 18px 24px 16px 32px;
          background:
            linear-gradient(135deg, rgba(167,139,250,0.07) 0%, rgba(91,33,182,0.05) 100%);
          border-radius: 20px;
          border-left: 2px solid rgba(124,58,237,0.45);
          box-shadow: 0 4px 18px -8px rgba(76,29,149,0.12);
        }
        .quote::before {
          content: '\\201C';
          position: absolute;
          top: -8px;
          left: 16px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 4.4rem;
          line-height: 1;
          color: rgba(124,58,237,0.22);
          pointer-events: none;
        }
        .quote p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          font-size: 1.12rem;
          line-height: 1.5;
          color: #3a2d5a;
          margin: 0;
          text-align: center;
        }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .layout {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .aside {
            position: relative;
            width: 95vw;
            left: 50%;
            transform: translateX(-50%);
          }
          .aside-frame { border-radius: 22px; }
        }

        @media (max-width: 768px) {
          :host { padding: 48px 14px 64px; }
          .layout { gap: 22px; }
          .article {
            padding: 32px 28px 48px;
            border-radius: 24px;
          }
          .aside-caption { font-size: .88rem; margin-top: 10px; }
          .hero {
            aspect-ratio: 21 / 9;
            border-radius: 16px;
            margin-bottom: 18px;
          }
          .badge {
            font-size: .66rem;
            letter-spacing: .14em;
            padding: 7px 14px;
            margin-bottom: 20px;
          }
          .title-row { gap: 14px; margin-bottom: 20px; }
          .capsule { flex: 0 0 9px; width: 9px; min-height: 48px; }
          h2 { font-size: 1.78rem; line-height: 1.1; }
          .lead {
            font-size: 1rem;
            line-height: 1.55;
            margin-bottom: 20px;
          }
          .ornament { margin: 20px auto 22px; gap: 12px; }
          .ornament .line { flex-basis: 60px; }
          .desc {
            font-size: .96rem;
            line-height: 1.65;
            text-align: left;
          }
          .desc::first-letter {
            font-size: 2.9rem;
            margin: 4px 9px -2px 0;
          }
          .quote {
            margin: 24px 0 20px;
            padding: 20px 20px 18px 26px;
            border-radius: 16px;
          }
          .quote::before { font-size: 3.2rem; top: -4px; left: 12px; }
          .quote p { font-size: 1rem; }
          .medallion {
            width: 88px;
            height: 88px;
            right: 22px;
            bottom: -26px;
          }
        }

        @media (max-width: 480px) {
          :host { padding: 36px 10px 52px; }
          .article {
            padding: 26px 20px 48px;
            border-radius: 22px;
          }
          .hero { border-radius: 16px; margin-bottom: 18px; }
          .badge {
            font-size: .62rem;
            padding: 6px 12px;
            letter-spacing: .12em;
            margin-bottom: 16px;
          }
          .title-row { gap: 12px; margin-bottom: 16px; }
          .capsule { flex: 0 0 7px; width: 7px; min-height: 42px; }
          h2 { font-size: 1.5rem; }
          .lead {
            font-size: .94rem;
            line-height: 1.5;
            margin-bottom: 18px;
          }
          .ornament { margin: 16px auto 18px; gap: 10px; }
          .ornament .line { flex-basis: 44px; }
          .ornament .mark { font-size: 14px; letter-spacing: 5px; }
          .desc {
            font-size: .9rem;
            line-height: 1.6;
          }
          .desc::first-letter {
            font-size: 2.5rem;
            margin: 3px 8px -2px 0;
          }
          .quote { padding: 16px 16px 14px 20px; }
          .quote::before { font-size: 2.6rem; }
          .quote p { font-size: .94rem; line-height: 1.45; }
        }
      </style>

      <div class="layout">
        ${gifSrc ? `
          <aside class="aside">
            <figure class="aside-frame">
              <img src="${gifSrc}" alt="Comunidad Parroquial San Luis Gonzaga" loading="lazy">
            </figure>
            <figcaption class="aside-caption">Comunidad parroquial · Villa Elisa</figcaption>
          </aside>
        ` : ''}

        <article class="article" aria-labelledby="parroquia-title">
          <figure class="hero">
            <img src="${headerSrc}" alt="${title}" loading="lazy">
          </figure>

          <span class="badge">
            <span class="pin" aria-hidden="true"></span>
            ${badge}
          </span>

          <header class="title-row">
            <span class="capsule" aria-hidden="true"></span>
            <h2 id="parroquia-title">${title}</h2>
          </header>

          ${lead ? `<p class="lead">${lead}</p>` : ''}

          <div class="ornament" aria-hidden="true">
            <span class="line"></span>
            <span class="mark">&#10086;</span>
            <span class="line"></span>
          </div>

          ${body ? `<p class="desc">${body}</p>` : ''}

          ${quote ? `
            <blockquote class="quote">
              <p>${quote}</p>
            </blockquote>
          ` : ''}
        </article>
      </div>
    `;
  }
}

customElements.define('parroquia-nosotros', ParroquiaNosotros);
