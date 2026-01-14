class FeriaComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.initModal();
  }

  render() {
    this.innerHTML = `
      <style>
        /* Contenedor principal con glasmorfismo MD3 */
        #feria {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 32px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: visible;
        }

        @media (max-width: 768px) {
          #feria {
            width: 95%;
            padding: 1.5rem;
            border-radius: 24px;
          }
        }

        @media (max-width: 480px) {
          #feria {
            padding: 1rem;
            border-radius: 20px;
          }
        }

        .feria-section {
          position: relative;
        }

        .pizarra-board {
          width: 100%;
          max-width: 680px;
          height: 420px;
          margin: 0 auto 0.25rem;
          background-image: url('./feria/poster_desktop.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .pizarra-board:hover {
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .pizarra-board {
            background-image: url('./feria/poster_mobile.png');
            height: 450px;
          }
        }
        
        .pizarra-cta {
          color: #fff;
          margin: 0;
          font-weight: 600;
          text-align: center;
        }
        
        @media (min-width: 992px) {
          .pizarra-cta {
            color: #ff0000;
          }
        }

        @media (max-width: 600px) {
          .feria-title {
            font-size: 2.5em !important;
          }

          .feria-info.texto3d {
            font-size: 1.6em !important;
          }

          .pizarra-board {
            background-size: contain !important;
          }
        }

        .blinking-llamador {
          animation: blinking-llamador 1s steps(2, start) infinite;
        }

        @keyframes blinking-llamador {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.15;
          }
        }

        @media (max-width: 600px) {
          .blinking-llamador {
            font-size: 1.7em !important;
          }
        }

        .mujer-1 {
          top: 10%;
          left: 0%;
          animation-delay: 0.5s;
        }

        .mujer4-animada {
          max-width: 35vw;
          z-index: 10;
          animation: mujer4-move 2.5s ease-in-out infinite alternate;
        }

        .mujer-2 {
          position: absolute;
          max-width: 250px;
          z-index: 20;
          animation: floatIn 2s ease forwards, floating 3s ease-in-out infinite;
          opacity: 0;
          top: 43%;
          left: 12%;
          animation-delay: 1s;
          scale: 1.5;
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floating {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        @keyframes mujer4-move {
          0% {
            transform: translateY(0) scale(1) rotate(-2deg);
          }

          50% {
            transform: translateY(-18px) scale(1.04) rotate(2deg);
          }

          100% {
            transform: translateY(0) scale(1) rotate(-2deg);
          }
        }

        @media (max-width: 323px) {
          .mujer4-animada {
            max-width: 60vw !important;
            position: absolute;
            left: 48% !important;
            top: 79% !important;
            transform: translateX(-50%);
            z-index: 20;
            pointer-events: none;
          }

          .mujer-3 {
            display: none;
          }

          .mujer-2 {
            top: 75%;
            left: 5%;
            animation-delay: 1s;
            scale: 0.5;
          }
        }

        @media (min-width: 324px) and (max-width: 800px) {
          .feria-section {
            width: 95% !important;
          }

          .mujer4-animada {
            max-width: 55vw !important;
            position: absolute;
            left: 48% !important;
            top: 65% !important;
            transform: translateX(-50%);
            z-index: 20;
            pointer-events: none;
          }

          .mujer-3 {
            display: none;
          }

          .mujer-2 {
            top: 58%;
            left: 0%;
            animation-delay: 1s;
            scale: 1;
          }

          .mujer-1 {
            z-index: 2;
            opacity: 0.5;
            top: 1%;
            transform: scale(0.7) !important;
            transform-origin: top left;
          }

          .card-body p,
          .card-body h2 {
            margin-bottom: 0.4em;
          }
        }

        /* Backdrop del modal más sutil */
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(4px);
        }

        .modal-backdrop.show {
          opacity: 1 !important;
        }
      </style>

      <div id="feria">
        <div style="padding-top: 0;">
          <div id="feria-americana" class="feria-section text-center">
            <div class="feria-card card-body" style="background: transparent; border: none; box-shadow: none;">
              <div class="pizarra-board" role="button" tabindex="0" aria-label="Abrir imagen de la feria" 
                   data-bs-toggle="modal" data-bs-target="#feriaModal" title="Haz clic para ver la imagen completa">
                <p class="pizarra-cta d-block d-md-none">- tocar sobre el flyer para zoom <br> - tocar fuera del flyer para salir del zoom</p>
                <p class="pizarra-cta d-none d-md-block blinking-llamador">- tocar sobre el flyer para zoom</p>
              </div>
            </div>
            <img src="./feria/piloto.png" class="mujer-2 d-none d-md-block" alt="Mujer 2">
            <img src="./feria/piloto_mobile.png" class="mujer-2 d-block d-md-none" alt="Mujer 2">
            <img src="./img/banderines.png" class="banderin esquina" alt="banderines" style="z-index: 11;">
          </div>
        </div>
        
        <!-- Modal -->
        <div class="modal fade" id="feriaModal" tabindex="-1" aria-labelledby="feriaModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content" style="background: transparent; border: none;">
              <div class="modal-header" style="border: none; padding: 0;">
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"
                  style="position: absolute; top: 10px; right: 10px; z-index: 10;"></button>
              </div>
              <div class="modal-body text-center" style="padding: 0;">
                <img src="./img/feria-parroquia.jpg" alt="Feria Parroquia" class="img-fluid"
                  style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 18px rgba(0,0,0,0.3);">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initModal() {
    const feriaModal = document.getElementById('feriaModal');
    if (!feriaModal) return;

    const modalBody = feriaModal.querySelector('.modal-body');
    const modalImg = modalBody?.querySelector('img');
    const closeBtn = feriaModal.querySelector('.btn-close');

    if (modalImg) {
      modalImg.addEventListener('click', (e) => e.stopPropagation());
    }

    if (modalBody) {
      modalBody.addEventListener('click', (e) => {
        if (e.target === modalImg) return;
        closeBtn?.click();
      });
    }
  }
}

customElements.define('feria-component', FeriaComponent);
