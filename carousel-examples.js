/* 
 * EJEMPLOS DE CONFIGURACIÓN DEL CARRUSEL
 * ====================================== 
 */

// ============================================
// EJEMPLO 1: Primer slide fijo, resto aleatorio
// ============================================
[
  { "id": "rifa", "position": 1 },        // ← SIEMPRE primero
  { "id": "misas", "position": 0 },       // ← Aleatorio
  { "id": "adoracion", "position": 0 },   // ← Aleatorio
  { "id": "actividades", "position": 0 }  // ← Aleatorio
]

// Resultado posible 1: Rifa → Actividades → Misas → Adoración
// Resultado posible 2: Rifa → Adoración → Actividades → Misas
// Resultado posible 3: Rifa → Misas → Adoración → Actividades


// ============================================
// EJEMPLO 2: Primera y última fijas, resto aleatorio
// ============================================
[
  { "id": "rifa", "position": 1 },        // ← SIEMPRE primero
  { "id": "misas", "position": 0 },       // ← Aleatorio
  { "id": "adoracion", "position": 0 },   // ← Aleatorio
  { "id": "banner3", "position": 4 }      // ← SIEMPRE último (posición 4)
]

// Resultado posible: Rifa → Adoración → Misas → Banner3
// La rifa siempre es primera, banner3 siempre última


// ============================================
// EJEMPLO 3: Orden completamente fijo
// ============================================
[
  { "id": "rifa", "position": 1 },
  { "id": "misas", "position": 2 },
  { "id": "adoracion", "position": 3 },
  { "id": "actividades", "position": 4 }
]

// Resultado SIEMPRE: Rifa → Misas → Adoración → Actividades
// NO hay aleatoriedad


// ============================================
// EJEMPLO 4: Orden completamente aleatorio
// ============================================
[
  { "id": "rifa", "position": 0 },
  { "id": "misas", "position": 0 },
  { "id": "adoracion", "position": 0 },
  { "id": "actividades", "position": 0 }
]

// Resultado totalmente aleatorio cada vez que se carga la página
// Cualquier combinación es posible


// ============================================
// EJEMPLO 5: Posiciones salteadas
// ============================================
[
  { "id": "rifa", "position": 1 },        // ← Posición 1
  { "id": "misas", "position": 0 },       // ← Rellenará huecos
  { "id": "adoracion", "position": 0 },   // ← Rellenará huecos
  { "id": "banner1", "position": 3 },     // ← Posición 3
  { "id": "banner2", "position": 0 },     // ← Rellenará huecos
  { "id": "banner3", "position": 5 }      // ← Posición 5
]

// Resultado posible: Rifa → Adoración → Banner1 → Banner2 → Banner3
//                     (1)  ← aleatorio →   (3)   ← aleatorio → (5)


// ============================================
// CASO ACTUAL EN TU SITIO
// ============================================
[
  { "id": "rifa2", "position": 1 },       // ← FIJO en primera posición
  { "id": "misas", "position": 0 },       // ← Aleatorio
  { "id": "adoracion", "position": 0 },   // ← Aleatorio
  { "id": "actividades", "position": 0 }, // ← Aleatorio
  { "id": "asistencia", "position": 0 },  // ← Aleatorio
  { "id": "banner1", "position": 0 },     // ← Aleatorio
  { "id": "banner2", "position": 0 },     // ← Aleatorio
  { "id": "luz", "position": 0 },         // ← Aleatorio
  { "id": "banner3", "position": 0 }      // ← Aleatorio
]

// La rifa SIEMPRE aparece primero
// Los otros 8 slides aparecen en orden aleatorio
// Cada visita/recarga verá un orden diferente
