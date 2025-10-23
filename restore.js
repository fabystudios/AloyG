const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  serviceAccountPath: "./serviceAccountKey.json",
  backupDir: "./backups",
  batchSize: 500, // Firestore permite max 500 operaciones por batch
  confirmBeforeRestore: true,
};

// ============================================
// INTERFAZ READLINE
// ============================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// ============================================
// INICIALIZACIÓN DE FIREBASE
// ============================================
function initializeFirebase() {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(CONFIG.serviceAccountPath),
    });
    console.log("✓ Firebase inicializado correctamente");
    return admin.firestore();
  } catch (error) {
    console.error("✗ Error al inicializar Firebase:", error.message);
    process.exit(1);
  }
}

// ============================================
// LISTAR BACKUPS DISPONIBLES
// ============================================
function listBackups() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    console.log("✗ No existe el directorio de backups");
    return [];
  }

  const files = fs.readdirSync(CONFIG.backupDir)
    .filter(f => f.endsWith(".json"))
    .sort()
    .reverse();

  return files;
}

// ============================================
// SELECCIONAR BACKUP
// ============================================
async function selectBackup() {
  const backups = listBackups();

  if (backups.length === 0) {
    console.log("✗ No hay backups disponibles");
    process.exit(1);
  }

  console.log("\n=== BACKUPS DISPONIBLES ===\n");
  backups.forEach((file, index) => {
    const filepath = path.join(CONFIG.backupDir, file);
    const stats = fs.statSync(filepath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`${index + 1}. ${file} (${size} KB)`);
  });

  const answer = await question("\n→ Selecciona el número del backup a restaurar: ");
  const index = parseInt(answer) - 1;

  if (index < 0 || index >= backups.length) {
    console.log("✗ Selección inválida");
    process.exit(1);
  }

  return path.join(CONFIG.backupDir, backups[index]);
}

// ============================================
// CARGAR DATOS DEL BACKUP
// ============================================
function loadBackup(filepath) {
  try {
    const data = fs.readFileSync(filepath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("✗ Error al leer el backup:", error.message);
    process.exit(1);
  }
}

// ============================================
// RESTAURAR COLECCIÓN
// ============================================
async function restoreCollection(db, collectionName, documents) {
  console.log(`\n  Restaurando: ${collectionName} (${documents.length} docs)...`);
  
  let restored = 0;
  const batches = [];
  let currentBatch = db.batch();
  let operationsInBatch = 0;

  for (const doc of documents) {
    const { id, ...data } = doc;
    const docRef = db.collection(collectionName).doc(id);
    currentBatch.set(docRef, data);
    operationsInBatch++;

    // Si alcanzamos el límite del batch, guardamos y creamos uno nuevo
    if (operationsInBatch >= CONFIG.batchSize) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      operationsInBatch = 0;
    }
  }

  // Agregar el último batch si tiene operaciones
  if (operationsInBatch > 0) {
    batches.push(currentBatch);
  }

  // Ejecutar todos los batches
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    restored += Math.min(CONFIG.batchSize, documents.length - i * CONFIG.batchSize);
    process.stdout.write(`\r    Progreso: ${restored}/${documents.length}`);
  }

  console.log(`\n    ✓ ${restored} documentos restaurados`);
  return restored;
}

// ============================================
// FUNCIÓN PRINCIPAL DE RESTORE
// ============================================
async function performRestore(db, backupData, selectedCollections = null) {
  console.log("\n=== INICIANDO RESTORE ===\n");
  const startTime = Date.now();
  
  try {
    const collections = selectedCollections || Object.keys(backupData);
    let totalDocs = 0;

    console.log(`→ Colecciones a restaurar: ${collections.length}`);

    for (const collectionName of collections) {
      if (!backupData[collectionName]) {
        console.log(`  ⚠ Colección "${collectionName}" no encontrada en el backup`);
        continue;
      }

      const docs = await restoreCollection(db, collectionName, backupData[collectionName]);
      totalDocs += docs;
    }

    // Resumen
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n=== RESTORE COMPLETADO ===");
    console.log(`✓ Colecciones: ${collections.length}`);
    console.log(`✓ Documentos totales: ${totalDocs}`);
    console.log(`✓ Duración: ${duration}s\n`);
  } catch (error) {
    console.error("\n✗ Error durante el restore:", error.message);
    throw error;
  }
}

// ============================================
// SELECCIONAR COLECCIONES
// ============================================
async function selectCollections(backupData) {
  const collections = Object.keys(backupData);
  
  console.log("\n=== COLECCIONES EN EL BACKUP ===\n");
  collections.forEach((col, index) => {
    const count = backupData[col].length;
    console.log(`${index + 1}. ${col} (${count} documentos)`);
  });

  console.log("\nOpciones:");
  console.log("  • Presiona ENTER para restaurar TODAS");
  console.log("  • O ingresa números separados por comas (ej: 1,3,5)");
  
  const answer = await question("\n→ Tu selección: ");

  if (!answer.trim()) {
    return null; // Restaurar todas
  }

  const indices = answer.split(",").map(s => parseInt(s.trim()) - 1);
  const selected = indices
    .filter(i => i >= 0 && i < collections.length)
    .map(i => collections[i]);

  if (selected.length === 0) {
    console.log("✗ Selección inválida");
    process.exit(1);
  }

  return selected;
}

// ============================================
// CONFIRMAR ACCIÓN
// ============================================
async function confirmRestore(backupPath, collections) {
  console.log("\n⚠️  ADVERTENCIA ⚠️");
  console.log("Esta operación SOBRESCRIBIRÁ los documentos existentes.");
  console.log(`\nBackup: ${path.basename(backupPath)}`);
  
  if (collections) {
    console.log(`Colecciones: ${collections.join(", ")}`);
  } else {
    console.log("Colecciones: TODAS");
  }

  const answer = await question("\n→ ¿Continuar? (escribe 'SI' para confirmar): ");
  return answer.toUpperCase() === "SI";
}

// ============================================
// EJECUCIÓN
// ============================================
(async () => {
  try {
    const db = initializeFirebase();
    
    // Seleccionar backup
    const backupPath = await selectBackup();
    const backupData = loadBackup(backupPath);
    
    // Seleccionar colecciones
    const selectedCollections = await selectCollections(backupData);
    
    // Confirmar
    if (CONFIG.confirmBeforeRestore) {
      const confirmed = await confirmRestore(backupPath, selectedCollections);
      if (!confirmed) {
        console.log("\n✗ Restore cancelado");
        rl.close();
        process.exit(0);
      }
    }

    // Ejecutar restore
    await performRestore(db, backupData, selectedCollections);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n✗ El restore falló:", error);
    rl.close();
    process.exit(1);
  }
})();