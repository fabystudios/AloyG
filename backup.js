const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  serviceAccountPath: path.join(__dirname, "serviceAccountKey.json"),
  backupDir: path.join(__dirname, "backups"),
  includeTimestamp: true,
  prettyPrint: true,
};

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
// FUNCIÓN PRINCIPAL DE BACKUP
// ============================================
async function createBackup(db) {
  console.log("\n=== INICIANDO BACKUP ===\n");
  const startTime = Date.now();
  
  try {
    // Obtener todas las colecciones
    const collections = await db.listCollections();
    console.log(`→ Encontradas ${collections.length} colecciones`);
    
    const backupData = {};
    let totalDocs = 0;

    // Iterar sobre cada colección
    for (const collection of collections) {
      const collectionName = collection.id;
      console.log(`  Respaldando: ${collectionName}...`);
      
      const snapshot = await collection.get();
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      backupData[collectionName] = docs;
      totalDocs += docs.length;
      console.log(`    ✓ ${docs.length} documentos`);
    }

    // Guardar el backup
    const filename = generateFilename();
    const filepath = saveBackup(backupData, filename);
    
    // Resumen
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n=== BACKUP COMPLETADO ===");
    console.log(`✓ Colecciones: ${collections.length}`);
    console.log(`✓ Documentos totales: ${totalDocs}`);
    console.log(`✓ Archivo: ${filepath}`);
    console.log(`✓ Duración: ${duration}s\n`);
    
    return filepath;
  } catch (error) {
    console.error("\n✗ Error durante el backup:", error.message);
    throw error;
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function generateFilename() {
  const timestamp = new Date()
    .toISOString()
    .replace(/T/, "_")
    .replace(/\..+/, "")
    .replace(/:/g, "-");
  
  return CONFIG.includeTimestamp 
    ? `firestore-backup-${timestamp}.json`
    : `firestore-backup.json`;
}

function saveBackup(data, filename) {
  // Crear directorio de backups si no existe
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  const filepath = path.join(CONFIG.backupDir, filename);
  const jsonData = CONFIG.prettyPrint 
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  fs.writeFileSync(filepath, jsonData);
  return filepath;
}

// ============================================
// EJECUCIÓN
// ============================================
(async () => {
  try {
    const db = initializeFirebase();
    await createBackup(db);
    process.exit(0);
  } catch (error) {
    console.error("\n✗ El backup falló:", error);
    process.exit(1);
  }
})();