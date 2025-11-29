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

let currentUser = null;
let rifaData = [];
let currentEditingId = null;
let isAdmin = false;
let currentTab = 'reservados';
let searchTerm = '';
let busquedaActiva = false;
let terminoBusqueda = '';
let numerosSeleccionadosMasivo = new Set();

const estadoLabels = { 1: 'Disponible', 2: 'Reservado', 3: 'Pagado' };
const estadoClasses = { 1: 'disponible', 2: 'reservado', 3: 'pagado' };

// ========================================
// ✅ SISTEMA DE PERSISTENCIA DE DATOS
// ========================================

// Función para guardar datos en sessionStorage
function guardarDatosUsuario(nombre, email, dni) {
  sessionStorage.setItem('rifa_nombre', nombre);
  sessionStorage.setItem('rifa_email', email);
  sessionStorage.setItem('rifa_dni', dni);
  console.log('✅ Datos guardados para próximas reservas');
}

// Función para recuperar datos guardados
function recuperarDatosUsuario() {
  return {
    nombre: sessionStorage.getItem('rifa_nombre') || '',
    email: sessionStorage.getItem('rifa_email') || '',
    dni: sessionStorage.getItem('rifa_dni') || ''
  };
}

// Función para limpiar datos guardados
function limpiarDatosGuardados() {
  sessionStorage.removeItem('rifa_nombre');
  sessionStorage.removeItem('rifa_email');
  sessionStorage.removeItem('rifa_dni');
  console.log('🗑️ Datos de usuario limpiados');
}

// ========================================
// VERIFICAR SI USUARIO ES ADMIN
// ========================================
async function esAdmin(email) {
  try {
    const doc = await db.collection('admins').doc(email).get();
    
    if (!doc.exists) {
      console.log('❌ Usuario no encontrado en admins:', email);
      return false;
    }
    
    const data = doc.data();
    
    if (!data.activo) {
      console.log('⚠️ Admin desactivado:', email);
      return false;
    }
    
    console.log('✅ Admin verificado:', email);
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar admin:', error);
    return false;
  }
}

// ========================================
// FUNCIONES DE NAVEGACIÓN
// ========================================
function showPublicView() {
  console.log('🔄 Cambiando a vista PÚBLICA');
  
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-view').style.display = 'none';
  document.getElementById('public-view').style.display = 'block';
  
  const buscador = document.getElementById('busqueda-rapida-admin');
  if (buscador) {
    buscador.style.display = 'none';
    console.log('✅ Buscador admin oculto');
  }
  
  const tablaAdmin = document.getElementById('admin-data-display');
  if (tablaAdmin) {
    tablaAdmin.style.display = 'none';
    console.log('✅ Tabla admin oculta');
  }
  
  const adminGrid = document.getElementById('admin-rifa-grid');
  if (adminGrid) {
    adminGrid.style.display = 'none';
    console.log('✅ Grilla admin oculta');
  }
  
  const publicGrid = document.getElementById('public-rifa-grid');
  const publicLoading = document.getElementById('public-loading');
  
  if (publicGrid) {
    if (rifaData && rifaData.length > 0) {
      publicLoading.style.display = 'none';
      publicGrid.style.display = 'grid';
      console.log('✅ Grilla pública visible con datos');
    } else {
      publicLoading.style.display = 'flex';
      publicGrid.style.display = 'none';
      console.log('⏳ Esperando datos...');
    }
  }
  
  document.body.classList.add('public-mode');
  document.body.classList.remove('admin-mode');
  
  isAdmin = false;
  console.log('✅ Vista pública activada');
}

function showAdminLogin() {
  console.log('🔄 Mostrando login admin');
  
  document.getElementById('public-view').style.display = 'none';
  document.getElementById('admin-view').style.display = 'none';
  document.getElementById('admin-login').style.display = 'block';
  
  const buscador = document.getElementById('busqueda-rapida-admin');
  if (buscador) buscador.style.display = 'none';
  
  const tablaAdmin = document.getElementById('admin-data-display');
  if (tablaAdmin) tablaAdmin.style.display = 'none';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAdminView() {
  console.log('🔄 Cambiando a vista ADMIN');
  
  document.getElementById('public-view').style.display = 'none';
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-view').style.display = 'block';
  
  const buscador = document.getElementById('busqueda-rapida-admin');
  if (buscador) {
    buscador.style.display = 'block';
    console.log('✅ Buscador admin visible');
  }
  
  const adminGrid = document.getElementById('admin-rifa-grid');
  if (adminGrid) {
    adminGrid.style.display = 'none';
    console.log('✅ Grilla admin lista');
  }
  
  const publicGrid = document.getElementById('public-rifa-grid');
  if (publicGrid) {
    publicGrid.style.display = 'none';
    console.log('✅ Grilla pública oculta');
  }
  
  document.body.classList.add('admin-mode');
  document.body.classList.remove('public-mode');
  
  isAdmin = true;
  console.log('✅ Vista admin activada');
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

async function handleAuthResult(result) {
  const email = result.user.email;
  
  const isAdminUser = await esAdmin(email);
  
  if (isAdminUser) {
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
  console.log('📡 Cargando datos. Modo Admin:', adminMode);
  
  if (adminMode) {
    document.getElementById('admin-loading').classList.add('active');
    document.getElementById('admin-loading').style.display = 'flex';
  } else {
    document.getElementById('public-loading').classList.add('active');
    document.getElementById('public-loading').style.display = 'flex';
  }
  
  db.collection('rifa').orderBy('numero').onSnapshot((snapshot) => {
    rifaData = [];
    snapshot.forEach((doc) => {
      rifaData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('✅ Datos cargados:', rifaData.length, 'registros');
    console.log('📋 Modo:', adminMode ? 'ADMIN' : 'PÚBLICO');

    // 🔥 HABILITAR BOTÓN DE RESERVA MASIVA
if (!adminMode && rifaData.length > 0) {
  habilitarBotonReservaMasiva();
}

    if (rifaData.length === 0) {
      console.log('🔨 Base vacía, inicializando...');
      initializeRifaNumbers();
      return;
    }
    
    if (adminMode) {
      console.log('👨‍💼 Renderizando ADMIN');
      
      document.getElementById('admin-loading').style.display = 'none';
      document.getElementById('admin-loading').classList.remove('active');
      
      renderRifaGrid(true);
      updateStats(true);
      
      setTimeout(() => {
        const tablaAdmin = document.getElementById('admin-data-display');
        if (tablaAdmin) {
          tablaAdmin.style.display = 'block';
          renderDataTable();
          console.log('✅ Tabla admin renderizada');
        }
      }, 300);
      
    } else {
      console.log('👤 Renderizando PÚBLICO');
      
      const buscador = document.getElementById('busqueda-rapida-admin');
      const tablaAdmin = document.getElementById('admin-data-display');
      const adminGrid = document.getElementById('admin-rifa-grid');
      
      if (buscador) buscador.style.display = 'none';
      if (tablaAdmin) tablaAdmin.style.display = 'none';
      if (adminGrid) adminGrid.style.display = 'none';
      
      renderRifaGrid(false);
      updateStats(false);
      
      setTimeout(() => {
        const publicLoading = document.getElementById('public-loading');
        const publicGrid = document.getElementById('public-rifa-grid');
        
        if (publicLoading) {
          publicLoading.style.display = 'none';
          publicLoading.classList.remove('active');
        }
        
        if (publicGrid) {
          publicGrid.style.display = 'grid';
          console.log('✅ Grilla pública visible:', publicGrid.children.length, 'números');
        }
      }, 300);
    }
  }, (error) => {
    console.error('❌ Error al cargar datos:', error);
    
    const loadingEl = adminMode ? 'admin-loading' : 'public-loading';
    const loading = document.getElementById(loadingEl);
    
    if (loading) {
      loading.innerHTML = `
        <div style="text-align: center; color: #B3261E;">
          <span class="material-icons" style="font-size: 48px; opacity: 0.5;">error_outline</span>
          <p style="margin-top: 16px; font-size: 16px; font-weight: 600;">Error de Conexión</p>
          <p style="font-size: 13px; color: #666;">No se pudieron cargar los datos</p>
          <button onclick="location.reload()" class="md-button btn-primary" style="margin-top: 16px;">
            <span class="material-icons">refresh</span>
            Reintentar
          </button>
        </div>
      `;
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error al Cargar Datos',
      text: 'Verifica tu conexión e intenta nuevamente.',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#6750A4'
    }).then(() => location.reload());
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
// RENDERIZAR GRILLA DE NÚMEROS CON BÚSQUEDA
// ========================================
function renderRifaGrid(adminMode) {
  const gridEl = adminMode ? 'admin-rifa-grid' : 'public-rifa-grid';
  const loadingEl = adminMode ? 'admin-loading' : 'public-loading';
  const grid = document.getElementById(gridEl);
  
  grid.innerHTML = '';
  grid.style.display = 'none';
  
  let dataToRender = rifaData;
  
  if (adminMode && busquedaActiva && terminoBusqueda) {
    const termino = terminoBusqueda.toLowerCase();
    dataToRender = rifaData.filter(item => {
      return (
        (item.nombre && item.nombre.toLowerCase().includes(termino)) ||
        (item.email && item.email.toLowerCase().includes(termino)) ||
        (item.dni && item.dni.toString().includes(termino)) ||
        (item.nro_op && item.nro_op.toString().includes(termino)) ||
        item.numero.toString().includes(termino)
      );
    });
    
    if (dataToRender.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 48px; opacity: 0.3;">🔍</div>
          <p style="font-size: 18px; color: #666; margin-top: 16px;">
            <strong>No se encontraron resultados</strong>
          </p>
          <p style="font-size: 14px; color: #999;">
            Intenta con otro nombre, DNI o número de operación
          </p>
        </div>
      `;
      grid.style.display = 'grid';
      document.getElementById(loadingEl).style.display = 'none';
      return;
    }
  }
  
  dataToRender.forEach(item => {
    const card = document.createElement('div');
    
    let isDisabled = !adminMode && item.state === 3;
    
    let highlightClass = '';
    if (adminMode && busquedaActiva && terminoBusqueda) {
      highlightClass = 'search-highlight';
    }
    
    card.className = `numero-card ${estadoClasses[item.state]} ${isDisabled ? 'disabled' : ''} ${highlightClass}`;
    
    let nombreDisplay = '';
    if (item.nombre) {
      const nombreCorto = item.nombre.split(' ')[0];
      nombreDisplay = `<div class="nombre-mini">${nombreCorto}</div>`;
    }
    
    let ticketButton = '';
    if (item.state === 3) {
      ticketButton = `
        <button class="btn-ticket" onclick="event.stopPropagation(); abrirTicket('${item.id}')">
          <span class="material-icons">confirmation_number</span>
          <span class="btn-ticket-text">Ver Ticket</span>
          <span class="btn-ticket-tooltip">🎟️ Abrir Ticket Digital</span>
        </button>
      `;
    }
    
    card.innerHTML = `
      <div class="numero">${item.numero}</div>
      <div class="estado">${estadoLabels[item.state]}</div>
      ${nombreDisplay}
      ${ticketButton}
    `;
    
    if (!isDisabled) {
      card.addEventListener('click', function() {
        if (adminMode) {
          openAdminModal(item);
        } else {
          openPublicModal(item);
        }
      });
    } else if (adminMode && item.state === 3) {
      card.addEventListener('click', function() {
        openAdminModal(item);
      });
    }
    
    grid.appendChild(card);
  });
  
  document.getElementById(loadingEl).style.display = 'none';
  document.getElementById(gridEl).style.display = 'grid';
  
  console.log(`✅ Grilla ${adminMode ? 'ADMIN' : 'PÚBLICA'} renderizada:`, grid.children.length, 'tarjetas');
  
  if (adminMode && busquedaActiva) {
    updateSearchResults(dataToRender.length);
  }
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
// ✅ MODAL PÚBLICO CON AUTO-RELLENADO
// ========================================
function openPublicModal(item) {
  currentEditingId = item.id;
  
  if (item.state === 1) {
    document.getElementById('public-modal-numero').textContent = item.numero;
    document.querySelector('#public-modal .modal-header h3').innerHTML = 
      'Reservar Número <span id="public-modal-numero">' + item.numero + '</span>';
    
    // ✅ AUTO-RELLENAR con datos guardados
    const datosGuardados = recuperarDatosUsuario();
    document.getElementById('public-nombre-input').value = datosGuardados.nombre;
    document.getElementById('public-email-input').value = datosGuardados.email;
    document.getElementById('public-dni-input').value = datosGuardados.dni;
    
    // ✅ Mostrar indicador si hay datos guardados
    if (datosGuardados.nombre || datosGuardados.email || datosGuardados.dni) {
      mostrarIndicadorDatosGuardados();
    }
    
    document.getElementById('public-modal').classList.add('active');
    
  } else if (item.state === 2) {
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
        
        if (dniIngresado !== String(item.dni)) {
          Swal.showValidationMessage('❌ El DNI no coincide con el registrado para este número');
          return false;
        }
        
        return dniIngresado;
      }
    }).then((result) => {
      if (result.isConfirmed) {
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

// ========================================
// ✅ FUNCIÓN PARA MOSTRAR INDICADOR DE DATOS GUARDADOS
// ========================================
function mostrarIndicadorDatosGuardados() {
  let indicador = document.getElementById('indicador-datos-guardados');
  
  if (!indicador) {
    indicador = document.createElement('div');
    indicador.id = 'indicador-datos-guardados';
    indicador.style.cssText = `
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-left: 4px solid #4CAF50;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideDown 0.3s ease-out;
    `;
    
    indicador.innerHTML = `
      <span class="material-icons" style="color: #2E7D32; font-size: 24px;">check_circle</span>
      <div style="flex: 1;">
        <p style="margin: 0; color: #2E7D32; font-weight: 600; font-size: 14px;">
          ✅ Datos recuperados de tu sesión
        </p>
        <p style="margin: 4px 0 0; color: #558B2F; font-size: 12px;">
          Puedes editarlos si han cambiado
        </p>
      </div>
      <button onclick="limpiarYRecargar()" style="
        background: transparent;
        border: 1px solid #4CAF50;
        color: #2E7D32;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s;
      " onmouseover="this.style.background='#E8F5E9'" onmouseout="this.style.background='transparent'">
        Limpiar Datos
      </button>
    `;
    
    const form = document.getElementById('public-form');
    form.insertBefore(indicador, form.firstChild);
  }
}

// ========================================
// ✅ FUNCIÓN PARA LIMPIAR DATOS Y RECARGAR
// ========================================
function limpiarYRecargar() {
  Swal.fire({
    title: '🗑️ Limpiar Datos Guardados',
    text: '¿Deseas borrar tus datos guardados? Tendrás que ingresarlos nuevamente.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, Limpiar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#F44336'
  }).then((result) => {
    if (result.isConfirmed) {
      limpiarDatosGuardados();
      document.getElementById('public-nombre-input').value = '';
      document.getElementById('public-email-input').value = '';
      document.getElementById('public-dni-input').value = '';
      
      const indicador = document.getElementById('indicador-datos-guardados');
      if (indicador) indicador.remove();
      
      Swal.fire({
        icon: 'success',
        title: '✅ Datos Limpiados',
        text: 'Puedes ingresar nuevos datos',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

// ========================================
// ✅ SUBMIT FORMULARIO PÚBLICO CON GUARDADO
// ========================================
document.getElementById('public-form').onsubmit = async function(e) {
  e.preventDefault();
  
  if (!currentEditingId) {
    console.error('❌ ERROR: currentEditingId es null');
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo identificar el número a reservar. Por favor, intenta nuevamente.',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  const item = rifaData.find(item => item.id === currentEditingId);
  
  if (!item) {
    console.error('❌ ERROR: No se encontró el item con id:', currentEditingId);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo encontrar el número. Por favor, intenta nuevamente.',
      confirmButtonText: 'OK'
    });
    return;
  }
  
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
  
  const numeroReservado = item.numero;
  const idReservado = currentEditingId;
  
  // ✅ GUARDAR DATOS PARA PRÓXIMAS RESERVAS
  guardarDatosUsuario(nombre, email, dni);
  
  closePublicModal();
  
  Swal.fire({
    title: 'Reservando...',
    html: '<div class="spinner"></div><p style="margin-top: 16px; font-size: 14px; color: #666;">Guardando tu reserva...</p>',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    await db.collection('rifa').doc(idReservado).update({
      nombre: nombre,
      email: email || '',
      state: 2,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      dni: dni || null
    });
    
    console.log('✅ Reserva guardada exitosamente');
    
    Swal.fire({
      icon: 'success',
      title: '¡Número Reservado!',
      html: `
        <p>Has reservado exitosamente el número <strong>${numeroReservado}</strong></p>
        <p style="font-size: 13px; color: #666; margin-top: 12px;">
          ✅ Tus datos se guardarán para tu próxima reserva
        </p>
      `,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      mostrarModalRecordatorio(numeroReservado, nombre);
    });
    
  } catch (error) {
    console.error('❌ Error al reservar:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Reservar',
      html: `
        <p>No se pudo completar la reserva.</p>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
          ${error.message}
        </p>
      `,
      confirmButtonText: 'Intentar de Nuevo'
    });
  }
};

// ========================================
// ✅ MODIFICAR closePublicModal
// ========================================
function closePublicModal() {
  document.getElementById('public-modal').classList.remove('active');
  
  // ❌ NO resetear el formulario para mantener los datos
  // document.getElementById('public-form').reset();
  
  const indicador = document.getElementById('indicador-datos-guardados');
  if (indicador) indicador.remove();
  
  currentEditingId = null;
}

// ========================================
// FUNCIÓN DESRESERVAR
// ========================================
async function desreservarNumero(item, dniVerificado) {
  try {
    console.log('🔍 DEBUG - Iniciando desreserva:');
    console.log('  Item:', item);
    console.log('  DNI verificado:', dniVerificado);
    
    const docSnapshot = await db.collection('rifa').doc(item.id).get();
    const dataActual = docSnapshot.data();
    
    console.log('📋 Datos actuales en Firestore:', dataActual);
    
    const entradaHistorial = {
      admin: 'Usuario Público (DNI: ' + dniVerificado + ' ✓)',
      fecha: new Date().toISOString(),
      accion: '🔓 Desreservó el número (DNI verificado)',
      estado_anterior: 2,
      estado_nuevo: 1,
      nro_op_anterior: null,
      nro_op_nuevo: null,
      dni_verificado: dniVerificado
    };
    
    const historialActualizado = [...(dataActual.historial || []), entradaHistorial];
    
    const updateData = {
      nombre: '',           
      buyer: '',            
      email: '',            
      state: 1,             
      time: null,           
      dni: dniVerificado,   
      ultima_modificacion: firebase.firestore.FieldValue.serverTimestamp(),
      historial: historialActualizado
    };
    
    console.log('📤 Datos que se intentarán enviar:', updateData);
    
    await db.collection('rifa').doc(item.id).update(updateData);
    
    console.log('✅ Desreserva exitosa');
    
    Swal.fire({
      icon: 'success',
      title: '✅ Número Desreservado',
      html: `
        <img src="./rifa/rifi-premio2.png" alt="Rifi" style="max-width:100px;display:block;margin:0 auto 12px;">
        <p>El número <strong>${item.numero}</strong> ha sido liberado.</p>
        <p style="font-size: 13px; color: #666; margin-top: 10px;">
          ✓ Identidad verificada (DNI: ${dniVerificado})
        </p>
      `,
      confirmButtonText: 'Perfecto',
      timer: 4000,
      timerProgressBar: true
    });
    
  } catch (error) {
    console.error('❌ ERROR COMPLETO:', error);
    
    let mensajeDetallado = error.message;
    
    if (error.code === 'permission-denied') {
      mensajeDetallado = `
        <strong>Permisos denegados por Firebase</strong><br>
        <small>Verifica que las reglas permitan la operación</small>
      `;
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error al Desreservar',
      html: `
        <p>${mensajeDetallado}</p>
        <details style="margin-top: 12px; text-align: left; font-size: 11px; color: #666;">
          <summary style="cursor: pointer;">Ver detalles técnicos</summary>
          <pre style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px; overflow: auto;">${JSON.stringify({
            code: error.code,
            message: error.message
          }, null, 2)}</pre>
        </details>
      `,
      confirmButtonText: 'Entendido'
    });
  }
}

// ========================================
// MODAL ADMIN
// ========================================
function openAdminModal(item) {
  console.log('📝 Abriendo modal admin para:', item);
  
  if (!item || !item.id) {
    console.error('❌ ERROR CRÍTICO: Item sin ID válido', item);
    Swal.fire({
      icon: 'error',
      title: 'Error Crítico',
      html: `
        <p>No se pudo identificar el número a editar.</p>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
          Detalles: ${item ? 'Item existe pero no tiene ID' : 'Item es null/undefined'}
        </p>
      `,
      confirmButtonText: 'OK'
    });
    return;
  }
  
  currentEditingId = item.id;
  document.getElementById('admin-modal').setAttribute('data-editing-id', item.id);
  
  console.log('✅ ID asignado correctamente:', currentEditingId);
  
  document.getElementById('admin-modal-numero').textContent = item.numero;
  document.getElementById('admin-nombre-input').value = item.nombre || '';
  document.getElementById('admin-email-input').value = item.email || '';
  document.getElementById('admin-nro_op-input').value = item.nro_op || '';
  document.getElementById('admin-dni-input').value = item.dni || '';
  document.getElementById('admin-estado-select').value = item.state;
  
  document.getElementById('admin-modal').classList.add('active');
  
  console.log('✅ Modal abierto. Verificación final - currentEditingId:', currentEditingId);
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.remove('active');
  document.getElementById('admin-form').reset();
  console.log('🚪 Modal cerrado. ID actual:', currentEditingId);
}

// ========================================
// SUBMIT ADMIN FORM
// ========================================
document.getElementById('admin-form').onsubmit = async function(e) {
  e.preventDefault();
  
  if (!currentEditingId) {
    console.error('❌ ERROR CRÍTICO: currentEditingId está vacío!');
    Swal.fire({
      icon: 'error',
      title: 'Error Crítico',
      html: `
        <p>No se pudo identificar el número a editar.</p>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
          Por favor, cierra el modal y vuelve a intentarlo.
        </p>
      `,
      confirmButtonText: 'Entendido'
    });
    return;
  }
  
  console.log('✓ Procesando submit para ID:', currentEditingId);
  
  const nombre = document.getElementById('admin-nombre-input').value.trim();
  const email = document.getElementById('admin-email-input').value.trim();
  let state = parseInt(document.getElementById('admin-estado-select').value);
  const nro_op = document.getElementById('admin-nro_op-input').value.trim();
  const dni = document.getElementById('admin-dni-input').value.trim();

  const editingId = currentEditingId;

  closeAdminModal();
  
  Swal.fire({
    title: 'Guardando cambios...',
    html: '<div class="spinner"></div><p style="margin-top: 16px; font-size: 14px; color: #666;">Actualizando datos...</p>',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    console.log('📡 Obteniendo documento:', editingId);
    
    const docSnapshot = await db.collection('rifa').doc(editingId).get();
    
    if (!docSnapshot.exists) {
      throw new Error('El documento no existe en Firestore');
    }
    
    const dataActual = docSnapshot.data();
    console.log('✓ Datos actuales obtenidos:', dataActual);
    
    if (dataActual.state === 1 && nombre) {
      if (nro_op) {
        state = 3;
        console.log('✅ Auto-asignación: Disponible → Pagado (tiene nro_op)');
      } else {
        state = 2;
        console.log('✅ Auto-asignación: Disponible → Reservado');
      }
    }
    else if (dataActual.state === 2 && nro_op && !dataActual.nro_op) {
      state = 3;
      console.log('✅ Auto-asignación: Reservado → Pagado (se agregó nro_op)');
    }
    
    const huboContenidoCambiado = (
      nombre !== (dataActual.nombre || '') ||
      email !== (dataActual.email || '') ||
      dni !== (dataActual.dni || '') ||
      nro_op !== (dataActual.nro_op || '') ||
      state !== dataActual.state
    );
    
    if (!huboContenidoCambiado) {
      Swal.fire({
        icon: 'info',
        title: 'Sin Cambios',
        text: 'No se detectaron cambios en los datos.',
        confirmButtonText: 'OK',
        timer: 2000
      });
      currentEditingId = null;
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
    
    const detallesCambios = getDetallesCambios(dataActual, updateData);
    
    const entradaHistorial = {
      admin: adminActual,
      fecha: new Date().toISOString(),
      accion: getAccionRealizada(dataActual, updateData),
      estado_anterior: dataActual.state,
      estado_nuevo: state,
      nro_op_anterior: detallesCambios.nro_op_anterior,
      nro_op_nuevo: detallesCambios.nro_op_nuevo,
      nombre_anterior: detallesCambios.nombre_anterior,
      nombre_nuevo: detallesCambios.nombre_nuevo,
      email_anterior: detallesCambios.email_anterior,
      email_nuevo: detallesCambios.email_nuevo,
      dni_anterior: detallesCambios.dni_anterior,
      dni_nuevo: detallesCambios.dni_nuevo
    };
    
    updateData.historial = firebase.firestore.FieldValue.arrayUnion(entradaHistorial);
    
    console.log('💾 Guardando en Firestore con ID:', editingId);
    await db.collection('rifa').doc(editingId).update(updateData);
    
    console.log('✅ Cambios guardados con auditoría');
    
    let emailPromise = null;
    
    if (esPrimerRegistroPago && email) {
      console.log('📧 Enviando email en segundo plano...');
      
      const numeroData = {
        id: editingId,
        numero: dataActual.numero,
        nombre: nombre,
        email: email,
        dni: dni,
        nro_op: nro_op
      };
      
      emailPromise = enviarEmailCertificado(numeroData).then(async (enviado) => {
        if (enviado) {
          await db.collection('rifa').doc(editingId).update({
            email_enviado: true,
            email_enviado_fecha: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        return enviado;
      });
    }
    
    renderDataTable();
    
    let mensajeExito = `
      <p style="margin: 12px 0;"><strong>Acción:</strong> ${entradaHistorial.accion}</p>
      <p style="font-size: 13px; color: #666;">Registrado por: ${adminActual}</p>
    `;
    
    if (esPrimerRegistroPago && email) {
      mensajeExito += `
        <p style="margin-top: 12px; padding: 10px; background: #E3F2FD; border-radius: 8px; color: #1976D2;">
          📧 Enviando email de confirmación a:<br><strong>${email}</strong>
          <br><small style="font-size: 11px; color: #666;">El envío se está procesando...</small>
        </p>
      `;
      
      if (emailPromise) {
        emailPromise.then((enviado) => {
          if (enviado) {
            console.log('✅ Email enviado correctamente');
          } else {
            console.warn('⚠️ No se pudo enviar el email');
          }
        });
      }
    }
    
    Swal.fire({
      icon: 'success',
      title: '✅ Cambios Guardados',
      html: mensajeExito,
      confirmButtonText: 'Perfecto',
      timer: 3500,
      timerProgressBar: true
    });
    
    currentEditingId = null;
    console.log('✓ Proceso completado. ID limpiado.');
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('Stack:', error.stack);
    
    Swal.fire({
      icon: 'error',
      title: 'Error al Guardar',
      html: `
        <p><strong>Error:</strong> ${error.message}</p>
        <details style="margin-top: 12px; text-align: left; font-size: 11px;">
          <summary>Detalles técnicos</summary>
          <pre style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px; overflow: auto;">${error.stack || error.message}</pre>
        </details>
      `,
      confirmButtonText: 'Reintentar'
    });
    
    currentEditingId = null;
  }
};

// ========================================
// ENVÍO DE EMAILS
// ========================================
async function enviarEmailCertificado(numeroData) {
  try {
    console.log('📧 Preparando email para:', numeroData.email);
    console.log('📋 Datos completos:', numeroData);
    
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS no está cargado');
      return false;
    }
    
    if (!numeroData.email || numeroData.email.trim() === '') {
      console.error('❌ Email vacío o inválido');
      return false;
    }
    
    const templateParams = {
      to_email: numeroData.email,
      reply_to: numeroData.email,
      user_email: numeroData.email,
      to_name: numeroData.nombre,
      numero: numeroData.numero.toString().padStart(3, '0'),
      dni: numeroData.dni || 'N/A',
      nro_op: numeroData.nro_op || 'N/A',
      link_ticket: `https://sanluisgonzaga.ar/ticket.html?id=${numeroData.id}`,
      fecha_sorteo: '22 de Diciembre 2025 - Loteria Nacional Vespertina'
    };

    console.log('📤 Enviando con parámetros:', templateParams);

    const response = await emailjs.send(
      'service_7lbeylp',
      'template_egop7d7',
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
    
    return false;
  }
}

// ========================================
// FUNCIONES DE AUDITORÍA
// ========================================
function getAccionRealizada(dataAnterior, dataNueva) {
  let acciones = [];
  
  if (dataNueva.nro_op && !dataAnterior.nro_op) {
    acciones.push('💰 Registró pago (Nro Op: ' + dataNueva.nro_op + ')');
  } else if (dataNueva.nro_op && dataAnterior.nro_op && dataNueva.nro_op !== dataAnterior.nro_op) {
    acciones.push('🔧 Corrigió nro operación (' + dataAnterior.nro_op + ' → ' + dataNueva.nro_op + ')');
  } else if (!dataNueva.nro_op && dataAnterior.nro_op) {
    acciones.push('🗑️ Eliminó pago (Nro Op: ' + dataAnterior.nro_op + ')');
  }
  
  if (dataAnterior.state !== dataNueva.state) {
    const estados = { 1: 'Disponible', 2: 'Reservado', 3: 'Pagado' };
    acciones.push('📝 Cambió estado: ' + estados[dataAnterior.state] + ' → ' + estados[dataNueva.state]);
  }
  
  let cambiosDatos = [];
  
  if (dataNueva.nombre !== dataAnterior.nombre) {
    cambiosDatos.push('nombre');
  }
  if (dataNueva.email !== dataAnterior.email) {
    cambiosDatos.push('email');
  }
  if (dataNueva.dni !== dataAnterior.dni) {
    cambiosDatos.push('DNI');
  }
  
  if (cambiosDatos.length > 0) {
    acciones.push('✏️ Modificó ' + cambiosDatos.join(', '));
  }
  
  if (acciones.length > 1) {
    return acciones.join(' + ');
  } else if (acciones.length === 1) {
    return acciones[0];
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
// VER HISTORIAL
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
          <div style="font-weight: 600; color: ${borderColor}; margin-bottom: 8px; line-height: 1.4;">
            ${entrada.accion}
          </div>
          <div style="font-size: 12px; color: #666; display: flex; flex-direction: column; gap: 4px;">
            <span><strong>👤 Admin:</strong> ${entrada.admin}</span>
            <span><strong>📅 Fecha:</strong> ${fecha}</span>
          </div>
      `;
      
      const hayDetalles = (entrada.nro_op_anterior && entrada.nro_op_nuevo && entrada.nro_op_anterior !== entrada.nro_op_nuevo) ||
                          entrada.nombre_anterior || entrada.email_anterior || entrada.dni_anterior;
      
      if (hayDetalles) {
        historialHTML += `<div style="border-top: 1px dashed #ddd; margin: 8px 0;"></div>`;
        historialHTML += `<div style="font-size: 11px; color: #888; margin-bottom: 6px;"><strong>Detalles de los cambios:</strong></div>`;
      }
      
      historialHTML += `<div style="display: flex; flex-direction: column; gap: 6px;">`;
      
      if (entrada.nro_op_anterior && entrada.nro_op_nuevo && entrada.nro_op_anterior !== entrada.nro_op_nuevo) {
        historialHTML += `
          <span style="background: #FFF3E0; padding: 6px 10px; border-radius: 6px; font-size: 12px; border-left: 3px solid #FF9800;">
            <strong>🔢 Nro Operación:</strong> <span style="color: #E65100;">${entrada.nro_op_anterior}</span> → <span style="color: #2E7D32;">${entrada.nro_op_nuevo}</span>
          </span>
        `;
      } else if (entrada.nro_op_nuevo && !entrada.nro_op_anterior) {
        historialHTML += `
          <span style="background: #E8F5E9; padding: 6px 10px; border-radius: 6px; font-size: 12px; border-left: 3px solid #4CAF50;">
            <strong>🔢 Nro Op registrado:</strong> <span style="color: #2E7D32;">${entrada.nro_op_nuevo}</span>
          </span>
        `;
      }
      
      if (entrada.nombre_anterior && entrada.nombre_nuevo) {
        historialHTML += `
          <span style="background: #E3F2FD; padding: 6px 10px; border-radius: 6px; font-size: 12px; border-left: 3px solid #2196F3;">
            <strong>👤 Nombre:</strong> <span style="color: #1565C0;">${entrada.nombre_anterior}</span> → <span style="color: #2E7D32;">${entrada.nombre_nuevo}</span>
          </span>
        `;
      }
      
      if (entrada.email_anterior && entrada.email_nuevo) {
        historialHTML += `
          <span style="background: #E3F2FD; padding: 6px 10px; border-radius: 6px; font-size: 12px; border-left: 3px solid #2196F3;">
            <strong>📧 Email:</strong> <span style="color: #1565C0;">${entrada.email_anterior}</span> → <span style="color: #2E7D32;">${entrada.email_nuevo}</span>
          </span>
        `;
      }
      
      if (entrada.dni_anterior && entrada.dni_nuevo) {
        historialHTML += `
          <span style="background: #E3F2FD; padding: 6px 10px; border-radius: 6px; font-size: 12px; border-left: 3px solid #2196F3;">
            <strong>🆔 DNI:</strong> <span style="color: #1565C0;">${entrada.dni_anterior}</span> → <span style="color: #2E7D32;">${entrada.dni_nuevo}</span>
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
// FUNCIONES DE BÚSQUEDA RÁPIDA
// ========================================
function buscarEnGrilla() {
  const input = document.getElementById('busqueda-grilla-input');
  terminoBusqueda = input.value.trim();
  
  if (terminoBusqueda.length > 0) {
    busquedaActiva = true;
    document.getElementById('busqueda-grilla-info').style.display = 'flex';
  } else {
    limpiarBusqueda();
    return;
  }
  
  renderRifaGrid(true);
  
  document.getElementById('admin-rifa-grid').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
}

function limpiarBusqueda() {
  busquedaActiva = false;
  terminoBusqueda = '';
  document.getElementById('busqueda-grilla-input').value = '';
  document.getElementById('busqueda-grilla-info').style.display = 'none';
  document.getElementById('btn-limpiar-busqueda').style.display = 'none';
  renderRifaGrid(true);
}

function updateSearchResults(count) {
  const info = document.getElementById('busqueda-grilla-info');
  const span = document.getElementById('resultados-count');
  span.textContent = count;
  
  if (count === 0) {
    info.style.background = 'linear-gradient(135deg, #FFEBEE, #FFCDD2)';
    info.style.borderColor = '#F44336';
  } else {
    info.style.background = 'linear-gradient(135deg, #E8F5E9, #C8E6C9)';
    info.style.borderColor = '#4CAF50';
  }
}

// ========================================
// 🎯 SISTEMA DE RESERVA MASIVA
// ========================================

// Exponer funciones globalmente
window.abrirModalReservaMasiva = abrirModalReservaMasiva;
window.cerrarModalMasivo = cerrarModalMasivo;
window.toggleNumeroMasivo = toggleNumeroMasivo;

// Función para abrir modal
function abrirModalReservaMasiva() {
  console.log('📋 Abriendo modal...');
  
  try {
    const modal = document.getElementById('modal-reserva-masiva');
    if (!modal) throw new Error('Modal no encontrado');
    
    // Verificar datos
    if (!rifaData || rifaData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Cargando...',
        html: '<div class="spinner"></div><p>Espera un momento...</p>',
        showConfirmButton: false,
        timer: 2000
      });
      setTimeout(abrirModalReservaMasiva, 2000);
      return;
    }
    
    // Auto-rellenar
    const datos = recuperarDatosUsuario();
    const nombre = document.getElementById('masivo-nombre-input');
    const email = document.getElementById('masivo-email-input');
    const dni = document.getElementById('masivo-dni-input');
    
    if (nombre) nombre.value = datos.nombre;
    if (email) email.value = datos.email;
    if (dni) dni.value = datos.dni;
    
    renderizarNumerosDisponiblesMasivo();
    modal.classList.add('active');
    setTimeout(() => modal.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    
    console.log('✅ Modal abierto');
  } catch (error) {
    console.error('❌ Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
      confirmButtonText: 'OK'
    });
  }
}

// Función para cerrar modal
function cerrarModalMasivo() {
  const modal = document.getElementById('modal-reserva-masiva');
  if (modal) modal.classList.remove('active');
  
  const form = document.getElementById('form-reserva-masiva');
  if (form) form.reset();
  
  numerosSeleccionadosMasivo.clear();
  actualizarContadorSeleccionados();
  console.log('✅ Modal cerrado');
}

// Función para renderizar números
function renderizarNumerosDisponiblesMasivo() {
  const container = document.getElementById('numeros-disponibles-masivo');
  if (!container) return;
  
  console.log('📊 rifaData:', rifaData ? rifaData.length + ' items' : 'null/undefined');
  if (rifaData && rifaData.length > 0) {
    console.log('🔍 Primeros 3 items de rifaData:', rifaData.slice(0, 3).map(i => ({ numero: i.numero, state: i.state, id: i.id })));
  }
  
  if (!rifaData || rifaData.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div class="spinner"></div>
        <p>Cargando...</p>
        <button onclick="renderizarNumerosDisponiblesMasivo()" class="md-button btn-primary" style="margin-top: 16px;">
          <span class="material-icons">refresh</span> Reintentar
        </button>
      </div>
    `;
    return;
  }
  
  const disponibles = rifaData.filter(item => item.state === 1);
  
  if (disponibles.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <span class="material-icons" style="font-size: 48px; opacity: 0.3;">inbox</span>
        <p>No hay números disponibles</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = disponibles.map(item => `
    <label class="numero-checkbox-item" id="checkbox-item-${item.numero}">
      <input type="checkbox" value="${item.numero}" data-id="${item.id}" onchange="toggleNumeroMasivo('${item.numero}')">
      <span class="numero-checkbox-label">
        <span class="numero-badge-small">${String(item.numero).padStart(3, '0')}</span>
      </span>
    </label>
  `).join('');
  
  numerosSeleccionadosMasivo.clear();
  actualizarContadorSeleccionados();
  console.log(`✅ ${disponibles.length} números renderizados`);
}

// Función toggle
function toggleNumeroMasivo(numero) {
  const checkbox = document.querySelector(`input[value="${numero}"]`);
  const item = document.getElementById(`checkbox-item-${numero}`);
  
  if (!checkbox || !item) return;
  
  if (checkbox.checked) {
    numerosSeleccionadosMasivo.add(numero);
    item.classList.add('checked');
    console.log('✅ Agregado:', numero, 'Total:', numerosSeleccionadosMasivo.size);
  } else {
    numerosSeleccionadosMasivo.delete(numero);
    item.classList.remove('checked');
    console.log('❌ Removido:', numero, 'Total:', numerosSeleccionadosMasivo.size);
  }
  
  actualizarContadorSeleccionados();
}

// Actualizar contador
function actualizarContadorSeleccionados() {
  const count = numerosSeleccionadosMasivo.size;
  const info = document.getElementById('numeros-seleccionados-info');
  const span = document.getElementById('count-seleccionados');
  
  if (span) span.textContent = count;
  if (info) info.style.display = count > 0 ? 'block' : 'none';
}

// Submit formulario masivo
document.getElementById('form-reserva-masiva').onsubmit = async function(e) {
  e.preventDefault();
  
  if (numerosSeleccionadosMasivo.size === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin Números',
      text: 'Selecciona al menos un número',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  const nombre = document.getElementById('masivo-nombre-input').value.trim();
  const email = document.getElementById('masivo-email-input').value.trim();
  const dni = document.getElementById('masivo-dni-input').value.trim();
  
  if (!nombre) {
    Swal.fire({
      icon: 'warning',
      title: 'Nombre requerido',
      text: 'Ingresa tu nombre',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  const cantidadNumeros = numerosSeleccionadosMasivo.size;
  const textoPlural = cantidadNumeros === 1 ? 'número' : 'números';
  
  // Copiar números antes de cerrar modal
  const numerosACopiar = Array.from(numerosSeleccionadosMasivo);
  
  guardarDatosUsuario(nombre, email, dni);
  
  // Cerrar modal
  const modal = document.getElementById('modal-reserva-masiva');
  if (modal) modal.classList.remove('active');
  
  Swal.fire({
    title: '🔄 Procesando Reserva Masiva',
    html: `
      <div class="spinner"></div>
      <p style="margin-top: 16px; font-size: 15px; color: #666;">
        Reservando <strong style="color: #6750A4;">${cantidadNumeros}</strong> ${textoPlural}...
      </p>
      <p style="font-size: 13px; color: #999; margin-top: 8px;">
        Por favor espera
      </p>
    `,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading()
  });
  
  try {
    console.log('🔍 Iniciando reserva masiva...');
    console.log('📊 Números seleccionados (tipo ' + typeof Array.from(numerosSeleccionadosMasivo)[0] + '):', Array.from(numerosSeleccionadosMasivo));
    console.log('👤 Datos:', { nombre, email: email || 'sin email', dni: dni || 'sin DNI' });
    console.log('📋 rifaData tiene', rifaData ? rifaData.length : 0, 'items');
    console.log('🔢 Tipos en rifaData - primeros 3 números:', rifaData.slice(0, 3).map(i => typeof i.numero + ': ' + i.numero));
    
    // Validar que db exista
    if (typeof db === 'undefined') {
      throw new Error('Firebase no está inicializado. Por favor recarga la página.');
    }
    
    // Validar que rifaData tenga datos
    if (!rifaData || rifaData.length === 0) {
      throw new Error('Los datos de la rifa no están cargados. Por favor recarga la página.');
    }
    
    console.log('📋 rifaData tiene', rifaData.length, 'números cargados');
    
    const batch = db.batch();
    const numerosReservados = [];
    let numerosNoDisponibles = [];
    
    for (const numero of numerosACopiar) {
      const numeroInt = parseInt(numero);
      console.log('🔎 Procesando:', numero, '(string) → ', numeroInt, '(int)');
      
      const item = rifaData.find(i => {
        const match = i.numero == numeroInt || i.numero == numero;
        if (match) console.log('  ✓ Match encontrado:', i.numero, 'state:', i.state);
        return match;
      });
      
      if (!item) {
        console.warn('⚠️ Número NO encontrado:', numero);
        console.log('🔍 Todos los números en rifaData:', rifaData.map(i => i.numero).slice(0, 10));
        numerosNoDisponibles.push(numero);
        continue;
      }
      
      console.log('✓ Item encontrado:', { numero: item.numero, state: item.state, id: item.id });
      
      if (item.state === 1) {
        const docRef = db.collection('rifa').doc(item.id);
        batch.update(docRef, {
          nombre: nombre,
          email: email || '',
          state: 2,
          time: firebase.firestore.FieldValue.serverTimestamp(),
          dni: dni || null
        });
        numerosReservados.push(item.numero);
        console.log('✅ Agregado al batch:', item.numero);
      } else {
        console.warn('⚠️ Número ya no disponible:', item.numero, 'Estado:', item.state);
        numerosNoDisponibles.push(item.numero);
      }
    }
    
    if (numerosReservados.length === 0) {
      throw new Error('Ninguno de los números seleccionados está disponible. Por favor, actualiza la página.');
    }
    
    console.log('📤 Enviando batch con', numerosReservados.length, 'números');
    await batch.commit();
    console.log('✅ Reserva masiva completada:', numerosReservados);
    
    if (numerosNoDisponibles.length > 0) {
      console.warn('⚠️ Números que no se pudieron reservar:', numerosNoDisponibles);
    }
    
    // Limpiar selección
    numerosSeleccionadosMasivo.clear();
    
    const textoNumeros = numerosReservados.length === 1 ? 'número' : 'números';
    
    // Mostrar confirmación de reserva masiva
    let htmlExtra = '';
    if (numerosNoDisponibles.length > 0) {
      htmlExtra = `
        <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 12px; border-radius: 8px; margin-top: 16px; text-align: left;">
          <p style="margin: 0; color: #E65100; font-size: 13px;">
            ⚠️ <strong>${numerosNoDisponibles.length}</strong> número(s) ya no estaba(n) disponible(s) y no se reservó/reservaron
          </p>
        </div>
      `;
    }
    
    await Swal.fire({
      icon: 'success',
      title: '🎉 ¡Reserva Masiva Exitosa!',
      html: `
        <div style="text-align: center; padding: 16px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Has reservado exitosamente <strong style="color: #6750A4; font-size: 20px;">${numerosReservados.length}</strong> ${textoNumeros}
          </p>
          
          <div style="background: linear-gradient(135deg, #E8DEF8, #F3E5F5); padding: 20px; border-radius: 16px; margin: 16px 0; border: 2px solid #6750A4;">
            <p style="margin: 0 0 12px; color: #6750A4; font-weight: 600; font-size: 15px;">
              📋 Tus Números Reservados:
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
              ${numerosReservados.sort((a, b) => a - b).map(num => `
                <span style="background: linear-gradient(135deg, #6750A4, #7E57C2); color: white; padding: 10px 16px; border-radius: 10px; font-weight: bold; font-size: 15px; box-shadow: 0 2px 8px rgba(103, 80, 164, 0.3);">
                  ${String(num).padStart(3, '0')}
                </span>
              `).join('')}
            </div>
          </div>
          
          <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 14px; border-radius: 8px; margin-top: 16px; text-align: left;">
            <p style="margin: 0; color: #E65100; font-size: 14px; font-weight: 600;">
              ⚠️ Importante: Completa el pago
            </p>
            <p style="margin: 8px 0 0; color: #EF6C00; font-size: 13px;">
              A continuación te mostraremos las instrucciones para realizar el pago
            </p>
          </div>
          ${htmlExtra}
        </div>
      `,
      confirmButtonText: '💳 Ver Instrucciones de Pago',
      confirmButtonColor: '#6750A4',
      width: '650px',
      showCloseButton: true
    });
    
    console.log('📧 Mostrando instrucciones de pago');
    
    // Limpiar formulario y estado
    const form = document.getElementById('form-reserva-masiva');
    if (form) form.reset();
    numerosSeleccionadosMasivo.clear();
    actualizarContadorSeleccionados();
    
    // Mostrar instrucciones de pago
    mostrarInstruccionesPagoMasivo(numerosReservados, nombre);
    
  } catch (error) {
    console.error('❌ Error en reserva masiva:', error);
    console.error('Stack:', error.stack);
    
    Swal.fire({
      icon: 'error',
      title: 'Error en Reserva Masiva',
      html: `
        <p><strong>No se pudieron reservar los números</strong></p>
        <div style="background: #ffebee; padding: 12px; border-radius: 8px; margin-top: 12px; text-align: left;">
          <p style="font-size: 13px; color: #c62828; margin: 0;">
            <strong>Error:</strong> ${error.message}
          </p>
          ${error.code ? `<p style="font-size: 12px; color: #e53935; margin: 8px 0 0;">Código: ${error.code}</p>` : ''}
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 12px;">
          Por favor, intenta nuevamente o contacta al administrador
        </p>
      `,
      confirmButtonText: 'Intentar de Nuevo',
      confirmButtonColor: '#F44336'
    });
  }
};


// ========================================
// MOSTRAR INSTRUCCIONES DE PAGO MASIVO
// ========================================
function mostrarInstruccionesPagoMasivo(numerosReservados, nombreParticipante) {
  const listaNumeros = numerosReservados.sort((a, b) => a - b).map(num => String(num).padStart(3, '0')).join(', ');
  const cantidadNumeros = numerosReservados.length;
  const textoNumeros = cantidadNumeros === 1 ? 'número' : 'números';
  const textoTu = cantidadNumeros === 1 ? 'tu' : 'tus';
  
  Swal.fire({
    icon: 'info',
    title: '💳 Instrucciones de Pago - Reserva Masiva',
    html: `
      <div style="text-align: left; padding: 16px;">
        <div style="background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-left: 4px solid #4CAF50; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="margin: 0; color: #1B5E20; font-weight: 700; font-size: 16px;">
            ✅ Reserva Masiva Confirmada
          </p>
          <p style="margin: 8px 0 4px; color: #2E7D32; font-size: 14px;">
            <strong>${cantidadNumeros}</strong> ${textoNumeros} reservados a nombre de <strong>${nombreParticipante}</strong>
          </p>
          <p style="margin: 8px 0 0; color: #558B2F; font-size: 13px; font-family: monospace; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 6px;">
            ${listaNumeros}
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-left: 4px solid #FF9800; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="margin: 0; color: #E65100; font-weight: 700; font-size: 15px;">
            ⏰ Completa ${textoTu} pago pronto
          </p>
          <p style="margin: 8px 0 0; color: #EF6C00; font-size: 13px; line-height: 1.6;">
            ${textoTu.charAt(0).toUpperCase() + textoTu.slice(1)} ${textoNumeros} quedarán confirmados una vez que realices el pago y envíes el comprobante
          </p>
        </div>

        <h4 style="color: #6750A4; margin: 20px 0 12px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
          <span style="background: #6750A4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">1</span>
          Pasos a seguir:
        </h4>
        <ol style="color: #333; font-size: 14px; line-height: 2; padding-left: 30px; margin: 0;">
          <li><strong>Realiza</strong> la transferencia o depósito bancario</li>
          <li><strong>Envía</strong> el comprobante por email o WhatsApp</li>
          <li><strong>Espera</strong> la confirmación del administrador</li>
        </ol>

        <div style="background: linear-gradient(135deg, #E8DEF8, #F3E5F5); padding: 18px; border-radius: 14px; margin-top: 24px; border: 2px solid #6750A4; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="margin: 0 0 12px; color: #6750A4; font-weight: 700; font-size: 15px;">
            📧 Contacto para enviar comprobante:
          </p>
          <p style="margin: 6px 0; font-size: 14px; color: #333;">
            <strong>Email:</strong> <a href="mailto:sanluisvillaelisa@gmail.com" style="color: #6750A4; text-decoration: none; font-weight: 600; border-bottom: 2px solid #6750A4;">sanluisvillaelisa@gmail.com</a>
          </p>
        </div>
      </div>
    `,
    confirmButtonText: '✅ Entendido',
    confirmButtonColor: '#4CAF50',
    width: '650px',
    showCloseButton: true
  });
}


// ========================================
// INICIALIZAR BOTÓN DE RESERVA MASIVA
// ========================================

// 🔥 DEFINIR LA FUNCIÓN PRIMERO (antes del DOMContentLoaded)
function habilitarBotonReservaMasiva() {
  console.log('🔍 Intentando habilitar botón...');
  
  const btn = document.querySelector('button[onclick*="abrirModalReservaMasiva"]');
  
  if (!btn) {
    console.warn('⚠️ Botón no encontrado en el DOM');
    return;
  }
  
  if (!rifaData || rifaData.length === 0) {
    console.warn('⚠️ rifaData vacío, esperando...');
    return;
  }
  
  btn.disabled = false;
  btn.innerHTML = '<span class="material-icons">playlist_add_check</span><span>Reservar Varios Números</span>';
  console.log('✅ Botón de reserva masiva HABILITADO');
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM cargado, configurando botón masivo...');
  
  const btn = document.querySelector('button[onclick*="abrirModalReservaMasiva"]');
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons">hourglass_empty</span><span>Cargando...</span>';
    
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!this.disabled) {
        abrirModalReservaMasiva();
      } else {
        console.log('⏳ Botón aún deshabilitado, esperando datos...');
      }
    });
    
    console.log('✅ Listener del botón configurado');
  } else {
    console.error('❌ Botón de reserva masiva NO encontrado en el HTML');
  }
  
  const modal = document.getElementById('modal-reserva-masiva');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) cerrarModalMasivo();
    });
    console.log('✅ Modal de reserva masiva configurado');
  }
});

// ========================================
// 🔥 INICIAR CARGA AUTOMÁTICA DE DATOS
// ========================================
window.addEventListener('load', function() {
  console.log('🌐 Página completamente cargada');
  console.log('🔄 Iniciando carga de datos en modo público...');
  loadRifaData(false); // false = modo público
});
// ========================================
// LOGS FINALES
// ========================================
console.log('🎯 Sistema inicializado correctamente');
console.log('🚀 Sistema de Rifa iniciado');
console.log('✅ Auditoría automática activada');
console.log('✅ Sistema de emails configurado');
console.log('✅ Historial de cambios habilitado');
console.log('✅ Búsqueda inteligente activada');
console.log('✅ Verificación de admins por Firestore');
console.log('✅ Persistencia de datos activada');
console.log('✅ Reserva masiva disponible');
