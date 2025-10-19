// ============================================
// RIFA_TEMA2.JS - LÓGICA DE SORTEO
// ============================================

let ganadorActual = null;
let historialGanadores = [];

/**
 * Selecciona un ganador aleatorio de los participantes
 */
function seleccionarGanadorAleatorio() {
  const participantes = obtenerParticipantes(); // De tema1
  if (participantes.length === 0) return null;
  
  const indiceAleatorio = Math.floor(Math.random() * participantes.length);
  return participantes[indiceAleatorio];
}

/**
 * Anima el proceso de sorteo
 */
function animarSorteo(duracion = 3000) {
  return new Promise((resolve) => {
    const pantallaSorteo = document.getElementById('pantallaSorteo');
    const nombreAnimado = document.getElementById('nombreAnimado');
    const participantes = obtenerParticipantes(); // De tema1
    
    pantallaSorteo.style.display = 'flex';
    let intervalo;
    let contador = 0;
    const velocidadInicial = 50;
    const velocidadFinal = 200;
    
    intervalo = setInterval(() => {
      const tiempoTranscurrido = contador * velocidadInicial;
      const participanteAleatorio = participantes[Math.floor(Math.random() * participantes.length)];
      nombreAnimado.textContent = participanteAleatorio.nombre;
      
      // Desacelerar gradualmente
      if (tiempoTranscurrido > duracion * 0.7) {
        clearInterval(intervalo);
        intervalo = setInterval(() => {
          const participanteAleatorio = participantes[Math.floor(Math.random() * participantes.length)];
          nombreAnimado.textContent = participanteAleatorio.nombre;
        }, velocidadFinal);
        
        setTimeout(() => {
          clearInterval(intervalo);
          resolve();
        }, duracion - tiempoTranscurrido);
      }
      
      contador++;
    }, velocidadInicial);
  });
}

/**
 * Muestra el ganador final con animación
 */
function mostrarGanador(ganador) {
  const nombreAnimado = document.getElementById('nombreAnimado');
  const contenedorGanador = document.getElementById('contenedorGanador');
  
  nombreAnimado.textContent = ganador.nombre;
  nombreAnimado.classList.add('ganador-final');
  
  setTimeout(() => {
    contenedorGanador.innerHTML = `
      <div class="ganador-anuncio">
        <h2>🎉 ¡Felicitaciones! 🎉</h2>
        <p class="ganador-nombre-grande">${ganador.nombre}</p>
        <p class="ganador-fecha">Sorteo realizado: ${new Date().toLocaleString()}</p>
      </div>
    `;
    contenedorGanador.style.display = 'block';
  }, 1000);
}

/**
 * Realiza el sorteo completo
 */
async function realizarSorteo() {
  const participantes = obtenerParticipantes(); // De tema1
  
  if (participantes.length === 0) {
    mostrarMensaje('No hay participantes para sortear', 'error');
    return;
  }
  
  const btnSorteo = document.getElementById('btnRealizarSorteo');
  btnSorteo.disabled = true;
  
  // Animar sorteo
  await animarSorteo(3000);
  
  // Seleccionar ganador
  ganadorActual = seleccionarGanadorAleatorio();
  
  // Mostrar ganador
  mostrarGanador(ganadorActual);
  
  // Guardar en historial
  historialGanadores.push({
    ...ganadorActual,
    fechaSorteo: new Date().toISOString()
  });
  
  guardarEstado(); // De tema3
  btnSorteo.disabled = false;
}

/**
 * Cierra la pantalla de sorteo
 */
function cerrarPantallaSorteo() {
  const pantallaSorteo = document.getElementById('pantallaSorteo');
  const nombreAnimado = document.getElementById('nombreAnimado');
  const contenedorGanador = document.getElementById('contenedorGanador');
  
  pantallaSorteo.style.display = 'none';
  nombreAnimado.classList.remove('ganador-final');
  contenedorGanador.style.display = 'none';
  contenedorGanador.innerHTML = '';
}

/**
 * Obtiene el ganador actual
 */
function obtenerGanadorActual() {
  return ganadorActual;
}

/**
 * Obtiene el historial de ganadores
 */
function obtenerHistorialGanadores() {
  return [...historialGanadores];
}

/**
 * Establece el historial de ganadores (usado para cargar estado)
 */
function establecerHistorialGanadores(nuevoHistorial) {
  historialGanadores = nuevoHistorial;
}

/**
 * Limpia el ganador actual
 */
function limpiarGanadorActual() {
  ganadorActual = null;
}