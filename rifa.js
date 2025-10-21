// ========================================
// CONFIGURACIÓN FIREBASE
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyD-3xKx4M5GxSQ-oJdnqz33hEZqFNBHoxM",
  authDomain: "aloy-726.firebaseapp.com",
  projectId: "aloy-726",
  storageBucket: "aloy-726.appspot.com",
  messagingSenderId: "441895072453",
  appId: "1:441895072453:web:aeaabb2d4f5fbc1a85b6ac",
  measurementId: "G-GX6KWD2LR7"
};

// Inicialización con verificación
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
  Swal.fire({
    icon: 'error',
    title: 'Error de Configuración',
    text: 'Error de configuración de Firebase: ' + error.message,
    confirmButtonText: 'Recargar Página',
    allowOutsideClick: false
  }).then(() => location.reload());
}

let db;
try {
  db = firebase.firestore();
  console.log('✅ Firestore conectado');
} catch (error) {
  console.error('❌ Error al conectar Firestore:', error);
  Swal.fire({
    icon: 'error',
    title: 'Error de Conexión',
    text: 'Error de conexión con Firestore: ' + error.message,
    confirmButtonText: 'Reintentar',
    allowOutsideClick: false
  }).then(() => location.reload());
}

// ========================================
// VARIABLES GLOBALES
// ========================================
const auth = firebase.auth();
const allowedAdmins = ["willyescobar@gmail.com", "meichtryes@gmail.com"];

let currentUser = null;
let rifaData = [];
let currentEditingId = null;
let isAdmin = false;
let currentTab = 'reservados';
let searchTerm = '';

const estadoLabels = { 1: 'Disponible', 2: 'Reservado', 3: 'Pagado' };
const estadoClasses = { 1: 'disponible', 2: 'reservado', 3: 'pagado' };

// ========================================
// FUNCIONES DE NAVEGACIÓN
// ========================================
function showPublicView() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-view').style.display = 'none';
  document.getElementById('public-view').style.display = 'block';
  isAdmin = false;
}

function showAdminLogin() {
  document.getElementById('public-view').style.display = 'none';
  document.getElementById('admin-view').style.display = 'none';
  document.getElementById('admin-login').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAdminView() {
  document.getElementById('public-view').style.display = 'none';
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-view').style.display = 'block';
  isAdmin = true;
}

// ========================================
// AUTENTICACIÓN
// ========================================
document.getElementById('login-google').onclick = function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => handleAuthResult(result))
    .catch(error => {
      console.error('❌ Error en login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Login',
        text: 'Error al iniciar sesión: ' + error.message,
        confirmButtonText: 'Reintentar'
      });
    });
};

function handleAuthResult(result) {
  const email = result.user.email;
  if (allowedAdmins.includes(email)) {
    currentUser = result.user;
    document.getElementById('user-name').textContent = currentUser.displayName || currentUser.email;
    document.getElementById('user-avatar').src = currentUser.photoURL || 
      'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.displayName || 'Admin');
    showAdminView();
    loadRifaData(true);
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Acceso Denegado',
      text: 'No tienes permisos de administrador.',
      confirmButtonText: 'Entendido'
    });
    auth.signOut();
  }
}

document.getElementById('logout-btn').onclick = function() {
  auth.signOut().then(() => {
    currentUser = null;
    showPublicView();
  });
};

// ========================================
// CARGAR DATOS DE FIRESTORE
// ========================================
function loadRifaData(adminMode = false) {
  console.log('📡 Intentando cargar datos de Firestore...');
  db.collection('rifa').orderBy('numero').onSnapshot((snapshot) => {
    rifaData = [];
    snapshot.forEach((doc) => {
      rifaData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('✅ Datos cargados:', rifaData.length, 'registros');
    
    if (rifaData.length === 0) {
      console.log('🔨 Base vacía, inicializando números...');
      initializeRifaNumbers();
    } else {
      renderRifaGrid(adminMode);
      updateStats(adminMode);
      
      if (adminMode) {
        setTimeout(() => {
          document.getElementById('admin-data-display').style.display = 'block';
          renderDataTable();
        }, 500);
      }
    }
  }, (error) => {
    console.error('❌ Error al cargar datos:', error);
    document.getElementById(adminMode ? 'admin-loading' : 'public-loading').innerHTML = 
      '<p style="color: red;">❌ Error de conexión con Firebase<br><small>Verifica la consola del navegador (F12)</small></p>';
    Swal.fire({
      icon: 'error',
      title: 'Error al Cargar Datos',
      text: 'No se pudieron cargar los números. Verifica tu conexión.',
      confirmButtonText: 'Reintentar'
    });
  });
}

async function initializeRifaNumbers() {
  try {
    console.log('🔧 Creando 100 números en Firebase...');
    const batch = db.batch();
    
    for (let i = 1; i <= 100; i++) {
      const docRef = db.collection('rifa').doc(i.toString().padStart(3, '0'));
      batch.set(docRef, {
        numero: i,
        nombre: '',
        buyer: '',
        email: '',
        state: 1,
        time: null,
        historial: []
      });
    }
    
    await batch.commit();
    console.log('✅ 100 números creados exitosamente');
  } catch (error) {
    console.error('❌ Error al inicializar números:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Crear Números',
      text: 'Error al crear números: ' + error.message,
      confirmButtonText: 'Intentar de Nuevo'
    });
  }
}

// ========================================
// RENDERIZAR GRILLA DE NÚMEROS
// ========================================
function renderRifaGrid(adminMode) {
  const gridEl = adminMode ? 'admin-rifa-grid' : 'public-rifa-grid';
  const loadingEl = adminMode ? 'admin-loading' : 'public-loading';
  const grid = document.getElementById(gridEl);
  
  grid.innerHTML = '';
  grid.style.display = 'none';
  
  rifaData.forEach(item => {
    const card = document.createElement('div');
    
    // Solo deshabilitar en modo público si está pagado
    let isDisabled = !adminMode && item.state === 3;
    
    // Clase disabled solo para público con estado pagado
    card.className = `numero-card ${estadoClasses[item.state]} ${isDisabled ? 'disabled' : ''}`;
    
    let nombreDisplay = '';
    if (item.nombre) {
      const nombreCorto = item.nombre.split(' ')[0];
      nombreDisplay = `<div class="nombre-mini">${nombreCorto}</div>`;
    }
    
    let ticketButton = '';
    if (item.state === 3) {
      ticketButton = `
        <button class="btn-ticket" onclick="event.stopPropagation(); abrirTicket('${item.id}')">
          <span class="material-icons" style="font-size: 14px;">confirmation_number</span>
          <span>Ver Ticket</span>
        </button>
      `;
    }
    
    card.innerHTML = `
      <div class="numero">${item.numero}</div>
      <div class="estado">${estadoLabels[item.state]}</div>
      ${nombreDisplay}
      ${ticketButton}
    `;
    
    // Admin puede editar todo, público solo disponibles y reservados
    if (!isDisabled) {
      card.addEventListener('click', function() {
        if (adminMode) {
          openAdminModal(item);
        } else {
          openPublicModal(item);
        }
      });
    } else if (adminMode && item.state === 3) {
      // Admin puede editar incluso pagados (sin el disabled)
      card.addEventListener('click', function() {
        openAdminModal(item);
      });
    }
    
    grid.appendChild(card);
  });
  
  document.getElementById(loadingEl).style.display = 'none';
  document.getElementById(gridEl).style.display = 'grid';
}

// ========================================
// FUNCIÓN PARA ABRIR TICKET
// ========================================
function abrirTicket(numeroId) {
  const item = rifaData.find(i => i.id === numeroId);
  
  if (!item || item.state !== 3) {
    Swal.fire({
      icon: 'warning',
      title: 'Ticket No Disponible',
      text: 'Este número aún no está confirmado como pagado.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6750A4'
    });
    return;
  }
  
  window.open(`ticket.html?id=${numeroId}`, '_blank');
}

// ========================================
// ACTUALIZAR ESTADÍSTICAS
// ========================================
function updateStats(adminMode) {
  const prefix = adminMode ? 'admin' : 'public';
  const disponibles = rifaData.filter(item => item.state === 1).length;
  const reservados = rifaData.filter(item => item.state === 2).length;
  const pagados = rifaData.filter(item => item.state === 3).length;
  
  document.getElementById(`${prefix}-stat-disponibles`).textContent = disponibles;
  document.getElementById(`${prefix}-stat-reservados`).textContent = reservados;
  document.getElementById(`${prefix}-stat-pagados`).textContent = pagados;
}

// ========================================
// MODAL PÚBLICO CON VALIDACIÓN DE IDENTIDAD POR NÚMERO
// ========================================
function openPublicModal(item) {
  currentEditingId = item.id;
  
  if (item.state === 1) {
    // RESERVAR - Modal normal
    document.getElementById('public-modal-numero').textContent = item.numero;
    document.querySelector('#public-modal .modal-header h3').innerHTML = 
      'Reservar Número <span id="public-modal-numero">' + item.numero + '</span>';
    
    document.getElementById('public-modal').classList.add('active');
    
  } else if (item.state === 2) {
    // DESRESERVAR - SIEMPRE solicitar DNI (verificación por número específico)
    Swal.fire({
      title: '🔒 Verificación de Identidad',
      html: `
        <p style="margin-bottom: 20px;">Para desreservar el número <strong>${item.numero}</strong>, 
        debes ingresar el DNI con el que se registró.</p>
        <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
          ⚠️ Solo puedes desreservar números registrados con tu DNI
        </p>
        <input type="number" id="dni-verificacion" class="swal2-input" placeholder="Ingresa tu DNI" 
               style="font-size: 18px; text-align: center;" autofocus>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Verificar y Desreservar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: () => {
        const dniIngresado = document.getElementById('dni-verificacion').value.trim();
        
        if (!dniIngresado) {
          Swal.showValidationMessage('⚠️ Debes ingresar tu DNI');
          return false;
        }
        
        // Verificar que el DNI coincida CON ESTE NÚMERO ESPECÍFICO
        if (dniIngresado !== String(item.dni)) {
          Swal.showValidationMessage('❌ El DNI no coincide con el registrado para este número');
          return false;
        }
        
        return dniIngresado;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // DNI verificado PARA ESTE NÚMERO, proceder con desreserva
        Swal.fire({
          title: '¿Confirmar Desreserva?',
          html: `
            <p>Se liberará el número <strong>${item.numero}</strong></p>
            <p style="font-size: 13px; color: #666;">Esta acción es irreversible</p>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, Desreservar',
          cancelButtonText: 'Cancelar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            desreservarNumero(item, result.value);
          }
        });
      }
    });
  }
}

document.getElementById('public-form').onsubmit = async function(e) {
  e.preventDefault();
  
  const item = rifaData.find(item => item.id === currentEditingId);
  const nombre = document.getElementById('public-nombre-input').value.trim();
  const email = document.getElementById('public-email-input').value.trim();
  const dni = document.getElementById('public-dni-input').value.trim();
  
  if (!nombre) {
    Swal.fire({
      icon: 'warning',
      title: 'Nombre requerido',
      text: 'Por favor ingresa tu nombre.',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  try {
    await db.collection('rifa').doc(currentEditingId).update({
      nombre: nombre,
      email: email || '',
      state: 2,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      dni: dni 
    });
    
    console.log('✅ Reserva guardada');
    closePublicModal();
    Swal.fire({
      icon: 'success',
      title: '¡Reserva Exitosa!',
      html: `
        <img src="./rifa/rifi-guiño.png" alt="Rifi guiño" style="max-width:100px;display:block;margin:0 auto 12px;">
        Número ${item.numero} reservado exitosamente. Ya puedes realizar el pago.
      `,
      confirmButtonText: '¡Genial!'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Reservar',
      text: 'Error al reservar: ' + error.message,
      confirmButtonText: 'Intentar de Nuevo'
    });
  }
};

function closePublicModal() {
  document.getElementById('public-modal').classList.remove('active');
  document.getElementById('public-form').reset();
  currentEditingId = null;
}

async function desreservarNumero(item, dniVerificado) {
  try {
    const entradaHistorial = {
      admin: 'Usuario Público (DNI: ' + dniVerificado + ' ✓)',
      fecha: new Date().toISOString(),
      accion: '🔓 Desreservó el número (DNI verificado: ' + dniVerificado + ')',
      estado_anterior: 2,
      estado_nuevo: 1,
      nro_op_anterior: null,
      nro_op_nuevo: null,
      dni_verificado: dniVerificado
    };
    
    await db.collection('rifa').doc(item.id).update({
      nombre: '',
      buyer: '',
      email: '',
      state: 1,
      time: null,
      dni: null,
      ultima_modificacion: firebase.firestore.FieldValue.serverTimestamp(),
      historial: firebase.firestore.FieldValue.arrayUnion(entradaHistorial)
    });
    
    console.log('✅ Desreserva guardada con auditoría y DNI verificado:', dniVerificado);
    Swal.fire({
      icon: 'success',
      title: 'Número Desreservado',
      html: `
        <p>El número <strong>${item.numero}</strong> ha sido liberado correctamente.</p>
        <p style="font-size: 13px; color: #666; margin-top: 10px;">
          ✓ Identidad verificada con DNI: ${dniVerificado}
        </p>
      `,
      confirmButtonText: 'OK',
      timer: 3000
    });
  } catch (error) {
    console.error('❌ Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Desreservar',
      text: 'Error al desreservar: ' + error.message,
      confirmButtonText: 'Intentar de Nuevo'
    });
  }
}

// ========================================
// MODAL ADMIN
// ========================================
function openAdminModal(item) {
  currentEditingId = item.id;
  document.getElementById('admin-modal-numero').textContent = item.numero;
  document.getElementById('admin-nombre-input').value = item.nombre || '';
  document.getElementById('admin-email-input').value = item.email || '';
  document.getElementById('admin-nro_op-input').value = item.nro_op || '';
  document.getElementById('admin-dni-input').value = item.dni || '';
  document.getElementById('admin-estado-select').value = item.state;
  
  document.getElementById('admin-modal').classList.add('active');
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.remove('active');
  document.getElementById('admin-form').reset();
  currentEditingId = null;
}

// ========================================
// ENVÍO DE EMAILS CON DIAGNÓSTICO MEJORADO
// ========================================
async function enviarEmailCertificado(numeroData) {
  try {
    console.log('📧 Preparando email para:', numeroData.email);
    console.log('📋 Datos completos:', numeroData);
    
    // Verificar que EmailJS esté cargado
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS no está cargado');
      return false;
    }
    
    // Verificar que hay un email válido
    if (!numeroData.email || numeroData.email.trim() === '') {
      console.error('❌ Email vacío o inválido');
      return false;
    }
    
    const templateParams = {
      to_email: numeroData.email,           // Variable para el template
      reply_to: numeroData.email,           // Para reply-to
      user_email: numeroData.email,         // Alternativa
      to_name: numeroData.nombre,
      numero: numeroData.numero.toString().padStart(3, '0'),
      dni: numeroData.dni || 'N/A',
      nro_op: numeroData.nro_op || 'N/A',
      link_ticket: `https://sanluisgonzaga.ar/ticket.html?id=${numeroData.id}`,
      fecha_sorteo: '25 de Diciembre 2025'
    };

    console.log('📤 Enviando con parámetros:', templateParams);

    const response = await emailjs.send(
      'service_7lbeylp',      // Service ID
      'template_egop7d7',     // Template ID
      templateParams
    );

    console.log('✅ Email enviado exitosamente');
    console.log('📊 Respuesta completa:', response);
    return true;
    
  } catch (error) {
    console.error('❌ Error completo al enviar email:', error);
    console.error('📋 Detalles del error:');
    console.error('   - Mensaje:', error.text || error.message);
    console.error('   - Status:', error.status);
    console.error('   - Objeto completo:', JSON.stringify(error, null, 2));
    
    // Mostrar error específico en consola
    if (error.status === 422) {
      console.error('⚠️ Error 422: El template no tiene configurado el destinatario');
      console.error('💡 SOLUCIÓN: En EmailJS Dashboard → Template → Settings');
      console.error('   Configura "Send To" con la variable: {{to_email}}');
    } else if (error.status === 400) {
      console.error('⚠️ Error 400: Verifica que el Service ID y Template ID sean correctos');
    } else if (error.status === 401) {
      console.error('⚠️ Error 401: Verifica la Public Key');
    } else if (error.status === 403) {
      console.error('⚠️ Error 403: Verifica los permisos del servicio');
    } else if (error.status === 404) {
      console.error('⚠️ Error 404: El template o servicio no existe');
    }
    
    return false;
  }
}

// ========================================
// FUNCIONES DE AUDITORÍA MEJORADAS
// ========================================
function getAccionRealizada(dataAnterior, dataNueva) {
  // Prioridad 1: Cambios en número de operación
  if (dataNueva.nro_op && !dataAnterior.nro_op) {
    return '💰 Registró pago (Nro Op: ' + dataNueva.nro_op + ')';
  }
  
  if (dataNueva.nro_op && dataAnterior.nro_op && dataNueva.nro_op !== dataAnterior.nro_op) {
    return '🔧 Corrigió nro operación (' + dataAnterior.nro_op + ' → ' + dataNueva.nro_op + ')';
  }
  
  if (!dataNueva.nro_op && dataAnterior.nro_op) {
    return '🗑️ Eliminó pago (Nro Op: ' + dataAnterior.nro_op + ')';
  }
  
  // Prioridad 2: Cambios de estado sin modificar nro_op
  if (dataAnterior.state !== dataNueva.state) {
    const estados = { 1: 'Disponible', 2: 'Reservado', 3: 'Pagado' };
    return '📝 Cambió estado: ' + estados[dataAnterior.state] + ' → ' + estados[dataNueva.state];
  }
  
  // Prioridad 3: Cambios en datos personales (detallados)
  let cambios = [];
  
  if (dataNueva.nombre !== dataAnterior.nombre) {
    cambios.push('nombre');
  }
  if (dataNueva.email !== dataAnterior.email) {
    cambios.push('email');
  }
  if (dataNueva.dni !== dataAnterior.dni) {
    cambios.push('DNI');
  }
  
  if (cambios.length > 0) {
    return '✏️ Modificó ' + cambios.join(', ') + ' del participante';
  }
  
  return '📋 Editó información';
}

function getDetallesCambios(dataAnterior, dataNueva) {
  const detalles = {
    nombre_anterior: null,
    nombre_nuevo: null,
    email_anterior: null,
    email_nuevo: null,
    dni_anterior: null,
    dni_nuevo: null,
    nro_op_anterior: dataAnterior.nro_op || null,
    nro_op_nuevo: dataNueva.nro_op || null
  };
  
  // Solo agregar detalles si hubo cambios reales
  if (dataAnterior.nombre !== dataNueva.nombre) {
    detalles.nombre_anterior = dataAnterior.nombre || 'Sin nombre';
    detalles.nombre_nuevo = dataNueva.nombre || 'Sin nombre';
  }
  
  if (dataAnterior.email !== dataNueva.email) {
    detalles.email_anterior = dataAnterior.email || 'Sin email';
    detalles.email_nuevo = dataNueva.email || 'Sin email';
  }
  
  if (dataAnterior.dni !== dataNueva.dni) {
    detalles.dni_anterior = dataAnterior.dni || 'Sin DNI';
    detalles.dni_nuevo = dataNueva.dni || 'Sin DNI';
  }
  
  return detalles;
}

// ========================================
// SUBMIT FORMULARIO ADMIN CON AUDITORÍA Y EMAILS
// ========================================
document.getElementById('admin-form').onsubmit = async function(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('admin-nombre-input').value.trim();
  const email = document.getElementById('admin-email-input').value.trim();
  const state = parseInt(document.getElementById('admin-estado-select').value);
  const nro_op = document.getElementById('admin-nro_op-input').value.trim();
  const dni = document.getElementById('admin-dni-input').value.trim();

  try {
    const docSnapshot = await db.collection('rifa').doc(currentEditingId).get();
    const dataActual = docSnapshot.data();
    
    // ========================================
    // VERIFICAR SI HUBO CAMBIOS REALES
    // ========================================
    const huboContenidoCambiado = (
      nombre !== (dataActual.nombre || '') ||
      email !== (dataActual.email || '') ||
      dni !== (dataActual.dni || '') ||
      nro_op !== (dataActual.nro_op || '') ||
      state !== dataActual.state
    );
    
    if (!huboContenidoCambiado) {
      closeAdminModal();
      Swal.fire({
        icon: 'info',
        title: 'Sin Cambios',
        text: 'No se detectaron cambios en los datos.',
        confirmButtonText: 'OK',
        timer: 2000
      });
      return;
    }
    
    const adminActual = currentUser ? (currentUser.displayName || currentUser.email) : 'Desconocido';
    
    const updateData = {
      nombre: nombre,
      email: email,
      state: state,
      dni: dni,
      nro_op: nro_op || null,
      ultima_modificacion: firebase.firestore.FieldValue.serverTimestamp(),
      ultimo_admin: adminActual
    };
    
    let esPrimerRegistroPago = false;
    
    if (nro_op && !dataActual.nro_op) {
      updateData.admin_registro_pago = adminActual;
      updateData.fecha_pago = firebase.firestore.FieldValue.serverTimestamp();
      updateData.state = 3;
      esPrimerRegistroPago = true;
      console.log('✅ Primer registro de pago por:', adminActual);
    }
    else if (nro_op && dataActual.nro_op && nro_op !== dataActual.nro_op) {
      updateData.admin_correccion = adminActual;
      updateData.fecha_correccion = firebase.firestore.FieldValue.serverTimestamp();
      updateData.nro_op_anterior = dataActual.nro_op;
      updateData.state = 3;
      console.log('🔧 Corrección de nro operación por:', adminActual);
    }
    else if (!nro_op && dataActual.nro_op) {
      updateData.admin_elimino_pago = adminActual;
      updateData.fecha_eliminacion = firebase.firestore.FieldValue.serverTimestamp();
      updateData.nro_op_eliminado = dataActual.nro_op;
      updateData.nro_op = null;
      console.log('🗑️ Eliminación de pago por:', adminActual);
    }
    
    if (state === 1) {
      updateData.nombre = '';
      updateData.email = '';
      updateData.dni = null;
      updateData.nro_op = null;
      updateData.time = null;
      updateData.admin_reseteo = adminActual;
      updateData.fecha_reseteo = firebase.firestore.FieldValue.serverTimestamp();
      console.log('🔄 Reseteo del número por:', adminActual);
    }
    
    const entradaHistorial = {
      admin: adminActual,
      fecha: new Date().toISOString(),
      accion: getAccionRealizada(dataActual, updateData),
      estado_anterior: dataActual.state,
      estado_nuevo: state,
      nro_op_anterior: dataActual.nro_op || null,
      nro_op_nuevo: nro_op || null
    };
    
    updateData.historial = firebase.firestore.FieldValue.arrayUnion(entradaHistorial);
    
    await db.collection('rifa').doc(currentEditingId).update(updateData);
    
    console.log('✅ Cambios guardados con auditoría:', updateData);
    
    let emailEnviado = false;
    if (esPrimerRegistroPago && email) {
      console.log('📧 Intentando enviar email de confirmación...');
      
      const numeroData = {
        id: currentEditingId,
        numero: dataActual.numero,
        nombre: nombre,
        email: email,
        dni: dni,
        nro_op: nro_op
      };
      
      emailEnviado = await enviarEmailCertificado(numeroData);
      
      if (emailEnviado) {
        await db.collection('rifa').doc(currentEditingId).update({
          email_enviado: true,
          email_enviado_fecha: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    closeAdminModal();
    renderDataTable();
    
    let mensajeExito = `
      <p style="margin: 12px 0;"><strong>Acción:</strong> ${entradaHistorial.accion}</p>
      <p style="font-size: 13px; color: #666;">Registrado por: ${adminActual}</p>
    `;
    
    if (esPrimerRegistroPago && email) {
      if (emailEnviado) {
        mensajeExito += `
          <p style="margin-top: 12px; padding: 10px; background: #E8F5E9; border-radius: 8px; color: #2E7D32;">
            📧 Email de confirmación enviado a:<br><strong>${email}</strong>
          </p>
        `;
      } else {
        mensajeExito += `
          <p style="margin-top: 12px; padding: 10px; background: #FFF3E0; border-radius: 8px; color: #E65100;">
            ⚠️ No se pudo enviar el email.<br>Puedes reenviarlo manualmente.
          </p>
        `;
      }
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Cambios Guardados',
      html: mensajeExito,
      confirmButtonText: 'Perfecto',
      timer: emailEnviado ? 5000 : 3000
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Guardar',
      text: 'Error al guardar: ' + error.message,
      confirmButtonText: 'Reintentar'
    });
  }
};

// ========================================
// VER HISTORIAL CON DETALLES MEJORADOS
// ========================================
async function verHistorialNumero(numeroId) {
  try {
    const doc = await db.collection('rifa').doc(numeroId).get();
    const data = doc.data();
    
    if (!data.historial || data.historial.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin Historial',
        text: 'Este número no tiene historial de cambios registrados.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6750A4'
      });
      return;
    }
    
    let historialHTML = '<div style="text-align: left; max-height: 450px; overflow-y: auto; padding-right: 8px;">';
    
    const historialOrdenado = [...data.historial].sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
    historialOrdenado.forEach((entrada, index) => {
      const fecha = new Date(entrada.fecha).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      let borderColor = '#6750A4';
      if (entrada.accion.includes('Registró pago')) borderColor = '#4CAF50';
      if (entrada.accion.includes('Eliminó')) borderColor = '#F44336';
      if (entrada.accion.includes('Corrigió')) borderColor = '#FF9800';
      if (entrada.accion.includes('Modificó')) borderColor = '#2196F3';
      
      historialHTML += `
        <div style="
          padding: 14px;
          border-left: 4px solid ${borderColor};
          margin-bottom: 12px;
          background: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <div style="font-weight: 600; color: ${borderColor}; margin-bottom: 6px;">
            ${entrada.accion}
          </div>
          <div style="font-size: 12px; color: #666; display: flex; flex-direction: column; gap: 4px;">
            <span><strong>👤 Admin:</strong> ${entrada.admin}</span>
            <span><strong>📅 Fecha:</strong> ${fecha}</span>
      `;
      
      // Mostrar solo los cambios relevantes
      if (entrada.nro_op_anterior && entrada.nro_op_nuevo && entrada.nro_op_anterior !== entrada.nro_op_nuevo) {
        historialHTML += `
          <span style="background: #FFF3E0; padding: 4px 8px; border-radius: 4px; margin-top: 4px;">
            <strong>🔢 Nro Op:</strong> ${entrada.nro_op_anterior} → ${entrada.nro_op_nuevo}
          </span>
        `;
      } else if (entrada.nro_op_nuevo && !entrada.nro_op_anterior) {
        historialHTML += `
          <span style="background: #E8F5E9; padding: 4px 8px; border-radius: 4px; margin-top: 4px;">
            <strong>🔢 Nro Op registrado:</strong> ${entrada.nro_op_nuevo}
          </span>
        `;
      }
      
      if (entrada.nombre_anterior && entrada.nombre_nuevo) {
        historialHTML += `
          <span style="background: #E3F2FD; padding: 4px 8px; border-radius: 4px; margin-top: 4px;">
            <strong>👤 Nombre:</strong> ${entrada.nombre_anterior} → ${entrada.nombre_nuevo}
          </span>
        `;
      }
      
      if (entrada.email_anterior && entrada.email_nuevo) {
        historialHTML += `
          <span style="background: #E3F2FD; padding: 4px 8px; border-radius: 4px; margin-top: 4px;">
            <strong>📧 Email:</strong> ${entrada.email_anterior} → ${entrada.email_nuevo}
          </span>
        `;
      }
      
      if (entrada.dni_anterior && entrada.dni_nuevo) {
        historialHTML += `
          <span style="background: #E3F2FD; padding: 4px 8px; border-radius: 4px; margin-top: 4px;">
            <strong>🆔 DNI:</strong> ${entrada.dni_anterior} → ${entrada.dni_nuevo}
          </span>
        `;
      }
      
      historialHTML += `
          </div>
        </div>
      `;
    });
    
    historialHTML += '</div>';
    
    const totalCambios = data.historial.length;
    const adminsUnicos = [...new Set(data.historial.map(h => h.admin))];
    
    historialHTML += `
      <div style="
        margin-top: 16px;
        padding: 12px;
        background: #E8DEF8;
        border-radius: 8px;
        font-size: 13px;
        text-align: center;
      ">
        <strong>📊 Resumen:</strong> ${totalCambios} cambio${totalCambios > 1 ? 's' : ''} realizado${totalCambios > 1 ? 's' : ''} por ${adminsUnicos.length} administrador${adminsUnicos.length > 1 ? 'es' : ''}
      </div>
    `;
    
    Swal.fire({
      title: `📋 Historial del Número ${data.numero}`,
      html: historialHTML,
      width: '650px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#6750A4'
    });
    
  } catch (error) {
    console.error('Error al cargar historial:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el historial: ' + error.message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#B3261E'
    });
  }
}

// ========================================
// REENVIAR EMAIL
// ========================================
async function reenviarEmail(numeroId) {
  try {
    const doc = await db.collection('rifa').doc(numeroId).get();
    const data = doc.data();
    
    if (!data || data.state !== 3) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede enviar',
        text: 'Este número no está marcado como pagado.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (!data.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Email',
        text: 'Este participante no tiene email registrado.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    Swal.fire({
      title: '📧 Reenviar Email',
      html: `
        <p>¿Reenviar email de confirmación a:</p>
        <p style="font-weight: bold; color: #6750A4;">${data.email}</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, Reenviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6750A4'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enviando...',
          html: '<div class="spinner"></div>',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const numeroData = {
          id: numeroId,
          numero: data.numero,
          nombre: data.nombre,
          email: data.email,
          dni: data.dni,
          nro_op: data.nro_op
        };
        
        const enviado = await enviarEmailCertificado(numeroData);
        
        if (enviado) {
          await db.collection('rifa').doc(numeroId).update({
            email_reenviado: true,
            email_reenviado_fecha: firebase.firestore.FieldValue.serverTimestamp(),
            email_reenviado_por: currentUser ? (currentUser.displayName || currentUser.email) : 'Desconocido'
          });
          
          Swal.fire({
            icon: 'success',
            title: '✅ Email Reenviado',
            text: 'El email se envió correctamente.',
            confirmButtonText: 'Perfecto'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '❌ Error',
            text: 'No se pudo enviar el email. Verificá la configuración de EmailJS.',
            confirmButtonText: 'Entendido'
          });
        }
      }
    });
    
  } catch (error) {
    console.error('Error al reenviar email:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al reenviar: ' + error.message,
      confirmButtonText: 'OK'
    });
  }
}

// ========================================
// TABLA DE DATOS ADMIN
// ========================================
function switchTab(tab) {
  currentTab = tab;
  
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.tab-button').classList.add('active');
  
  renderDataTable();
}

function renderDataTable() {
  const tbody = document.getElementById('data-table-body');
  
  let filteredData = rifaData.filter(item => {
    if (currentTab === 'reservados') {
      return item.state === 2;
    } else {
      return item.state === 3;
    }
  });
  
  if (searchTerm) {
    filteredData = filteredData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.numero.toString().includes(searchLower) ||
        (item.nombre && item.nombre.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.dni && item.dni.toString().includes(searchLower)) ||
        (item.nro_op && item.nro_op.toString().includes(searchLower))
      );
    });
  }
  
  const reservadosCount = rifaData.filter(item => item.state === 2).length;
  const pagadosCount = rifaData.filter(item => item.state === 3).length;
  document.getElementById('count-reservados').textContent = reservadosCount;
  document.getElementById('count-pagados').textContent = pagadosCount;
  
  if (filteredData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p><strong>No hay ${currentTab === 'reservados' ? 'reservas' : 'pagos'} registrados</strong></p>
            <p style="font-size: 13px;">Los datos aparecerán aquí cuando se registren</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredData.map(item => {
    const fecha = item.time ? formatDate(item.time.toDate()) : 'Sin fecha';
    const estadoClass = item.state === 2 ? 'reservado' : 'pagado';
    const estadoText = item.state === 2 ? 'Reservado' : 'Pagado';
    
    return `
      <tr>
        <td>
          <span class="numero-badge ${estadoClass}">${item.numero}</span>
        </td>
        <td>
          <strong>${item.nombre || 'Sin nombre'}</strong>
        </td>
        <td>${item.email || '-'}</td>
        <td>${item.dni || '-'}</td>
        <td>
          <span class="estado-badge ${estadoClass}">${estadoText}</span>
        </td>
        <td>${item.nro_op || '-'}</td>
        <td>
          ${fecha}
          ${item.time ? `<span class="time-badge">${formatTime(item.time.toDate())}</span>` : ''}
        </td>
        <td>
          ${item.email_enviado ? 
            `<span class="email-badge enviado">
              <span class="material-icons" style="font-size: 14px;">check_circle</span>
              Enviado
            </span>` 
            : `<span class="email-badge pendiente">Pendiente</span>`
          }
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${item.state === 3 && item.email ? 
              `<button class="btn-reenviar" onclick="reenviarEmail('${item.id}')" title="Reenviar email">
                <span class="material-icons" style="font-size: 16px;">forward_to_inbox</span>
              </button>` 
              : ''
            }
            <button class="btn-historial" onclick="verHistorialNumero('${item.id}')" title="Ver historial">
              <span class="material-icons" style="font-size: 16px;">history</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

document.getElementById('search-input').addEventListener('input', function(e) {
  searchTerm = e.target.value;
  renderDataTable();
});

// ========================================
// EXPORTAR A EXCEL
// ========================================
function exportToExcel() {
  const data = rifaData.filter(item => 
    currentTab === 'reservados' ? item.state === 2 : item.state === 3
  );
  
  if (data.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin datos',
      text: 'No hay datos para exportar',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  let csv = 'Número,Nombre,Email,DNI,Estado,Nro Operación,Fecha\n';
  
  data.forEach(item => {
    const fecha = item.time ? formatDate(item.time.toDate()) : '';
    const estado = item.state === 2 ? 'Reservado' : 'Pagado';
    csv += `${item.numero},"${item.nombre || ''}","${item.email || ''}","${item.dni || ''}","${estado}","${item.nro_op || ''}","${fecha}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `rifa_${currentTab}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  Swal.fire({
    icon: 'success',
    title: 'Exportado',
    text: 'Archivo CSV descargado exitosamente',
    timer: 2000,
    showConfirmButton: false
  });
}

// ========================================
// CERRAR MODALES AL HACER CLIC FUERA
// ========================================
document.getElementById('public-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closePublicModal();
  }
});

document.getElementById('admin-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeAdminModal();
  }
});

// ========================================
// INICIALIZACIÓN
// ========================================
auth.onAuthStateChanged(user => {
  if (user && allowedAdmins.includes(user.email)) {
    currentUser = user;
    document.getElementById('user-name').textContent = currentUser.displayName || currentUser.email;
    document.getElementById('user-avatar').src = currentUser.photoURL || 
      'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.displayName || 'Admin');
    showAdminView();
    loadRifaData(true);
  } else {
    showPublicView();
    loadRifaData(false);
  }
});

console.log('🚀 Sistema de Rifa iniciado');
console.log('✅ Auditoría automática activada');
console.log('✅ Sistema de emails configurado');
console.log('✅ Historial de cambios habilitado');