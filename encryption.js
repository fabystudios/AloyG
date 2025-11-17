// ========================================
// ENCRYPTION.JS - Sistema de Cifrado de Datos
// Colocar en: /rifa/encryption.js
// ========================================

const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  tagLength: 128
};

// ⚠️ CAMBIAR ESTA CONTRASEÑA EN PRODUCCIÓN
// Sugerencia: Usar una frase larga única de la parroquia
const MASTER_PASSWORD = 'WillyGenioJesus726!SanLuisGonzagaVillaElisa2025@Rifa!Segura#Parroquia';

// ========================================
// FUNCIONES DE CIFRADO
// ========================================

async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const salt = encoder.encode('slg-ve-2025-salt-rifa');
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ENCRYPTION_CONFIG.algorithm, length: ENCRYPTION_CONFIG.keyLength },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(plaintext, password) {
  try {
    const key = await deriveKey(password);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const iv = window.crypto.getRandomValues(
      new Uint8Array(ENCRYPTION_CONFIG.ivLength)
    );
    
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
        tagLength: ENCRYPTION_CONFIG.tagLength
      },
      key,
      data
    );
    
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return btoa(String.fromCharCode(...combined));
    
  } catch (error) {
    console.error('❌ Error al cifrar:', error);
    throw new Error('No se pudo cifrar la información');
  }
}

async function decryptData(encryptedBase64, password) {
  try {
    const key = await deriveKey(password);
    
    const combined = Uint8Array.from(
      atob(encryptedBase64), 
      c => c.charCodeAt(0)
    );
    
    const iv = combined.slice(0, ENCRYPTION_CONFIG.ivLength);
    const ciphertext = combined.slice(ENCRYPTION_CONFIG.ivLength);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
        tagLength: ENCRYPTION_CONFIG.tagLength
      },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
    
  } catch (error) {
    console.error('❌ Error al descifrar:', error);
    throw new Error('No se pudo descifrar la información');
  }
}

// ========================================
// GESTIÓN DE DATOS DE PAGO
// ========================================

async function guardarDatosPagoCifrados() {
  try {
    console.log('🔐 Iniciando cifrado de datos de pago...');
    
    const datosPago = {
      alias: 'luis.villaelisa.mp',
      cvu: '0000003100045333653297',
      titular: 'Marcelo Alejandro Cerniato',
      fecha_actualizacion: new Date().toISOString()
    };
    
    console.log('📝 Datos a cifrar:', { ...datosPago, cvu: datosPago.cvu.slice(0, 4) + '...' });
    
    const datosCifrados = {
      alias_encrypted: await encryptData(datosPago.alias, MASTER_PASSWORD),
      cvu_encrypted: await encryptData(datosPago.cvu, MASTER_PASSWORD),
      titular_encrypted: await encryptData(datosPago.titular, MASTER_PASSWORD),
      fecha_actualizacion: datosPago.fecha_actualizacion,
      version: '1.0',
      algoritmo: ENCRYPTION_CONFIG.algorithm
    };
    
    await db.collection('config').doc('datos_pago').set(datosCifrados);
    
    console.log('✅ Datos guardados cifrados en Firestore');
    
    Swal.fire({
      icon: 'success',
      title: '✅ Datos Cifrados y Guardados',
      html: `
        <p>Los datos de pago han sido cifrados y almacenados en Firestore.</p>
        <p style="font-size: 12px; color: #666; margin-top: 12px;">
          Ahora puedes eliminar los datos del HTML.
        </p>
      `,
      confirmButtonText: 'Perfecto'
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al guardar datos cifrados:', error);
    
    Swal.fire({
      icon: 'error',
      title: 'Error al Cifrar',
      text: 'Error: ' + error.message,
      confirmButtonText: 'OK'
    });
    
    return false;
  }
}

async function cargarDatosPago() {
  try {
    console.log('🔓 Cargando datos de pago cifrados...');
    
    const doc = await db.collection('config').doc('datos_pago').get();
    
    if (!doc.exists) {
      throw new Error('Datos de pago no encontrados en Firestore');
    }
    
    const datosCifrados = doc.data();
    
    console.log('📥 Datos cifrados obtenidos, descifrando...');
    
    const alias = await decryptData(datosCifrados.alias_encrypted, MASTER_PASSWORD);
    const cvu = await decryptData(datosCifrados.cvu_encrypted, MASTER_PASSWORD);
    const titular = await decryptData(datosCifrados.titular_encrypted, MASTER_PASSWORD);
    
    console.log('✅ Datos descifrados correctamente');
    
    return { alias, cvu, titular };
    
  } catch (error) {
    console.error('❌ Error al cargar datos de pago:', error);
    
    return {
      alias: '⚠️ ERROR - Contactar Administración',
      cvu: '⚠️ ERROR - Contactar Administración',
      titular: '⚠️ ERROR - Contactar Administración'
    };
  }
}

// ========================================
// RENDERIZADO DINÁMICO
// ========================================

async function renderizarHeaderRifa() {
  const container = document.querySelector('.rifa-header-redesign');
  
  if (!container) {
    console.error('❌ Contenedor .rifa-header-redesign no encontrado');
    return;
  }
  
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner" style="margin: 0 auto 16px;"></div>
      <p style="color: white;">Cargando información de pago segura...</p>
    </div>
  `;
  
  try {
    const datosPago = await cargarDatosPago();
    
    container.innerHTML = `
      <div class="prizes-grid">
      <div class="prize-card">
      <span class="prize-icon">🎁</span>
      <h3>Sorteo</h3>
      <ul class="prize-list">
      <li><strong>Premio:</strong> Bicicleta</li>
      <li><strong>Fecha:</strong> 22 Diciembre - Lotería Nacional Vespertina</li>
      </ul>
      <div class="prize-value">$2.500</div>
      </div>

      <div class="prize-card">
      <span class="prize-icon">💳</span>
      <h3>Datos de Pago</h3>
      <div style="text-align: left;">
      <div class="payment-row-modern">
        <i class="fas fa-at"></i>
        <span class="label">Alias:</span>
        <span class="value">${datosPago.alias}</span>
      </div>
      <div class="payment-row-modern">
        <i class="fas fa-credit-card"></i>
        <span class="label">CVU:</span>
        <span class="value cvu-number" style="font-size: 12px;">
        <span class="part">${datosPago.cvu.slice(0, 11)}</span>
        <span class="part">${datosPago.cvu.slice(11)}</span>
        </span>
      </div>
      <div class="payment-row-modern">
        <i class="fas fa-user"></i>
        <span class="label">Titular:</span>
        <span class="value">${datosPago.titular}</span>
      </div>
      </div>
      </div>
      </div>

      <div class="visual-section">
      <div class="mascot-card">
      <img src="./rifa/rifi-premio2.png" alt="Mascota Rifi">
      <p class="mascot-caption">🎟️ ¡Elegí tu número!</p>
      </div>

      <div class="prizes-images">
      <!-- Imagen agrandada solo aquí -->
      <img src="./rifa/premio.png" alt="Bicicleta" style="box-shadow: none !important; display: block; margin: 0 auto; width: min(80vw, 640px); max-width: 100%; height: auto; max-height: 80vh; object-fit: contain;">
       <p>La imagen es ilustrativa. La bicicleta del premio es de rodado 29, modelo y color sujeta a disponibilidad</p>
      </div>
      </div>
    `;
    
    console.log('✅ Header renderizado con datos descifrados');
    
    setTimeout(verificarIntegridadDatosPago, 2000);
    
  } catch (error) {
    console.error('❌ Error al renderizar header:', error);
    
    container.innerHTML = `
      <div style="background: #FFEBEE; padding: 20px; border-radius: 12px; text-align: center;">
        <i class="material-icons" style="font-size: 48px; color: #F44336;">error_outline</i>
        <p style="color: #C62828; font-weight: 600; margin: 12px 0;">
          Error al cargar información de pago
        </p>
        <p style="color: #666; font-size: 14px;">
          Por favor, contacta con la administración:<br>
          <strong>sanluisvillaelisa@gmail.com</strong>
        </p>
      </div>
    `;
  }
}

// ========================================
// PANEL ADMIN PARA ACTUALIZAR DATOS
// ========================================

async function mostrarPanelActualizarDatosPago() {
  if (!currentUser) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'Debes estar logueado como administrador',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  const datosActuales = await cargarDatosPago();
  
  const result = await Swal.fire({
    title: '🔐 Actualizar Datos de Pago',
    html: `
      <div style="text-align: left; padding: 16px;">
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block;">Alias:</label>
          <input type="text" id="nuevo-alias" class="swal2-input" 
                 style="margin: 0;" value="${datosActuales.alias}">
        </div>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block;">CVU (22 dígitos):</label>
          <input type="text" id="nuevo-cvu" class="swal2-input" 
                 style="margin: 0;" value="${datosActuales.cvu}" maxlength="22">
        </div>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block;">Titular:</label>
          <input type="text" id="nuevo-titular" class="swal2-input" 
                 style="margin: 0;" value="${datosActuales.titular}">
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 16px; padding: 12px; background: #FFF3E0; border-radius: 8px;">
          ⚠️ <strong>Importante:</strong> Estos datos se guardarán cifrados en Firestore.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar Cifrado',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#6750A4',
    width: '500px',
    preConfirm: () => {
      const alias = document.getElementById('nuevo-alias').value.trim();
      const cvu = document.getElementById('nuevo-cvu').value.trim();
      const titular = document.getElementById('nuevo-titular').value.trim();
      
      if (!alias || !cvu || !titular) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
        return false;
      }
      
      if (cvu.length !== 22 || !/^\d+$/.test(cvu)) {
        Swal.showValidationMessage('El CVU debe tener exactamente 22 dígitos numéricos');
        return false;
      }
      
      return { alias, cvu, titular };
    }
  });
  
  if (result.isConfirmed) {
    const { alias, cvu, titular } = result.value;
    
    Swal.fire({
      title: 'Guardando...',
      html: '<div class="spinner"></div>',
      allowOutsideClick: false,
      showConfirmButton: false
    });
    
    try {
      const datosCifrados = {
        alias_encrypted: await encryptData(alias, MASTER_PASSWORD),
        cvu_encrypted: await encryptData(cvu, MASTER_PASSWORD),
        titular_encrypted: await encryptData(titular, MASTER_PASSWORD),
        fecha_actualizacion: new Date().toISOString(),
        actualizado_por: currentUser.email,
        version: '1.0'
      };
      
      await db.collection('config').doc('datos_pago').set(datosCifrados);
      
      Swal.fire({
        icon: 'success',
        title: '✅ Datos Actualizados',
        html: `
          <p>Los datos de pago han sido guardados cifrados.</p>
          <p style="font-size: 12px; color: #666; margin-top: 12px;">
            La página se recargará para aplicar los cambios.
          </p>
        `,
        confirmButtonText: 'Entendido',
        timer: 3000
      }).then(() => location.reload());
      
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron actualizar los datos: ' + error.message
      });
    }
  }
}

// ========================================
// VERIFICACIÓN DE INTEGRIDAD
// ========================================

async function verificarIntegridadDatosPago() {
  const elementos = document.querySelectorAll('.payment-row-modern .value');
  
  if (elementos.length < 3) return true;
  
  try {
    const datosFirestore = await cargarDatosPago();
    
    const datosDOM = {
      alias: elementos[0]?.textContent.trim(),
      cvu: elementos[1]?.textContent.trim().replace(/\s/g, ''),
      titular: elementos[2]?.textContent.trim()
    };
    
    const integridadOK = (
      datosDOM.alias === datosFirestore.alias &&
      datosDOM.cvu === datosFirestore.cvu &&
      datosDOM.titular === datosFirestore.titular
    );
    
    if (!integridadOK) {
      console.error('🚨 ALERTA: Datos de pago modificados en el DOM');
      console.error('DOM:', datosDOM);
      console.error('Firestore:', datosFirestore);
      
      Swal.fire({
        icon: 'error',
        title: '🚨 Alerta de Seguridad',
        html: `
          <p><strong>Se detectó una modificación no autorizada</strong></p>
          <p style="font-size: 13px; color: #666; margin-top: 12px;">
            Los datos de pago en pantalla no coinciden con los registros oficiales.
            La página se recargará por seguridad.
          </p>
        `,
        confirmButtonText: 'Recargar',
        allowOutsideClick: false
      }).then(() => location.reload());
      
      return false;
    }
    
    console.log('✅ Integridad verificada');
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar integridad:', error);
    return false;
  }
}

// Verificar cada 30 segundos
setInterval(verificarIntegridadDatosPago, 30000);

// ========================================
// EXPORTAR FUNCIONES
// ========================================

window.SistemaCifrado = {
  guardarDatosPagoCifrados,
  cargarDatosPago,
  renderizarHeaderRifa,
  mostrarPanelActualizarDatosPago,
  verificarIntegridadDatosPago
};

console.log('✅ Sistema de cifrado cargado');
console.log('📋 Uso: window.SistemaCifrado.guardarDatosPagoCifrados() para primera vez');