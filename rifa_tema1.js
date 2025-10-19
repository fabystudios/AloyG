// ============================================
// RIFA_TEMA1.JS - GESTIÓN DE PARTICIPANTES
// ============================================

let participantes = [];

/**
 * Valida que el nombre no esté vacío y no sea duplicado
 */
function validarNombre(nombre) {
  const nombreLimpio = nombre.trim();
  
  if (!nombreLimpio) {
    return { valido: false, mensaje: 'Por favor ingresa un nombre' };
  }
  
  if (participantes.some(p => p.nombre.toLowerCase() === nombreLimpio.toLowerCase())) {
    return { valido: false, mensaje: 'Este nombre ya está participando' };
  }
  
  return { valido: true, nombre: nombreLimpio };
}

/**
 * Agrega un nuevo participante a la rifa
 */
function agregarParticipante() {
  const input = document.getElementById('nombreParticipante');
  const validacion = validarNombre(input.value);
  
  if (!validacion.valido) {
    mostrarMensaje(validacion.mensaje, 'error');
    return;
  }
  
  const nuevoParticipante = {
    id: Date.now(),
    nombre: validacion.nombre,
    fecha: new Date().toLocaleString()
  };
  
  participantes.push(nuevoParticipante);
  input.value = '';
  actualizarListaParticipantes();
  guardarEstado(); // De tema3
  mostrarMensaje(`${validacion.nombre} agregado correctamente`, 'exito');
}

/**
 * Elimina un participante por su ID
 */
function eliminarParticipante(id) {
  const participante = participantes.find(p => p.id === id);
  if (!participante) return;
  
  participantes = participantes.filter(p => p.id !== id);
  actualizarListaParticipantes();
  guardarEstado(); // De tema3
  mostrarMensaje(`${participante.nombre} eliminado`, 'info');
}

/**
 * Actualiza la vista de la lista de participantes
 */
function actualizarListaParticipantes() {
  const lista = document.getElementById('listaParticipantes');
  const contador = document.getElementById('contadorParticipantes');
  const btnSorteo = document.getElementById('btnRealizarSorteo');
  
  if (participantes.length === 0) {
    lista.innerHTML = '<p class="texto-vacio">No hay participantes aún. ¡Agrega el primero!</p>';
    btnSorteo.disabled = true;
  } else {
    lista.innerHTML = participantes.map(p => `
      <div class="participante-item">
        <span class="participante-nombre">${p.nombre}</span>
        <button onclick="eliminarParticipante(${p.id})" class="btn-eliminar" title="Eliminar">
          ×
        </button>
      </div>
    `).join('');
    btnSorteo.disabled = false;
  }
  
  contador.textContent = `${participantes.length} participante${participantes.length !== 1 ? 's' : ''}`;
}

/**
 * Obtiene la lista actual de participantes
 */
function obtenerParticipantes() {
  return [...participantes];
}

/**
 * Establece la lista de participantes (usado para cargar estado)
 */
function establecerParticipantes(nuevosParticipantes) {
  participantes = nuevosParticipantes;
  actualizarListaParticipantes();
}

/**
 * Muestra mensajes al usuario
 */
function mostrarMensaje(texto, tipo = 'info') {
  const mensaje = document.getElementById('mensajeEstado');
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.style.display = 'block';
  
  setTimeout(() => {
    mensaje.style.display = 'none';
  }, 3000);
}