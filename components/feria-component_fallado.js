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
      <div id="feria">
        <div style="padding-top: 30px;">
          <div id="feria-americana" class="feria-section text-center" style="width: 90%; max-width: 1200px; margin: 0 auto;">
            <div class="feria-card card-body" style="z-index: 10; position: relative;">
              <div class="pizarra-board" role="button" tabindex="0" 
                   aria-label="Abrir imagen de la feria" 
                   data-bs-toggle="modal" 
                   data-bs-target="#feriaModal" 
                   title="Haz clic para ver la imagen completa">
                
                <!-- CTA Mejorado -->
                <p class="pizarra-cta d-block d-md-none">
                  <i class="material-icons" style="font-size: 1.2em; vertical-align: middle;">touch_app</i>
                  Toca para ampliar
                </p>
                <p class="pizarra-cta d-none d-md-block blinking-llamador">
                  <i class="material-icons" style="font-size: 1.2em; vertical-align: middle;">zoom_in</i>
                  Click para ampliar
                </p>
              </div>
            </div>
            
            <!-- Mujer superpuesta -->
            <img src="./feria/piloto.png" class="mujer-2 d-none d-md-block" alt="Mujer 2">
            <img src="./feria/piloto_mobile.png" class="mujer-2 d-block d-md-none" alt="Mujer 2">
            
            <!-- Banderines -->
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
