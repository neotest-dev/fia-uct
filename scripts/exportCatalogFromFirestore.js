/**
 * scripts/exportCatalogFromFirestore.js
 *
 * Script privado (Node.js / Firebase Admin SDK).
 * Exporta todos los cursos de Firestore a public/courses.json.
 *
 * USO:
 *   npm run export:catalog
 *
 * REQUISITOS en .env:
 *   FIREBASE_SERVICE_ACCOUNT_PATH  → ruta al archivo JSON del Service Account
 *   ó
 *   FIREBASE_SERVICE_ACCOUNT_JSON  → contenido JSON del Service Account en una línea
 *   VITE_FIREBASE_PROJECT_ID       → ID del proyecto Firebase (ya existe en .env)
 *
 * Este script NUNCA se incluye en el bundle del navegador.
 * Las credenciales de Admin SDK NUNCA se exponen al frontend.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Cargar variables de entorno desde .env
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT_DIR, 'public', 'courses.json');

// ─── Configuración de Firebase Admin ─────────────────────────────────────────

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Opción A: JSON inline (útil para CI/CD, GitHub Actions Secrets)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch {
    console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido.');
    process.exit(1);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Opción B: ruta a un archivo JSON local
  const saPath = resolve(ROOT_DIR, process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  try {
    serviceAccount = JSON.parse(readFileSync(saPath, 'utf-8'));
  } catch {
    console.error(`❌ Error: No se pudo leer el Service Account en: ${saPath}`);
    console.error('   Verifica que la ruta FIREBASE_SERVICE_ACCOUNT_PATH en .env sea correcta.');
    process.exit(1);
  }
} else {
  console.error('❌ Error: Debes definir FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_SERVICE_ACCOUNT_JSON en .env');
  console.error('   Obtén el Service Account en: Firebase Console → Configuración → Cuentas de servicio → Generar nueva clave');
  process.exit(1);
}

// ─── Inicializar Firebase Admin ───────────────────────────────────────────────

// Importación dinámica para compatibilidad ESM con firebase-admin
const { initializeApp, cert, getApps } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// ─── Ordenamiento consistente ─────────────────────────────────────────────────

const ROMAN_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * Ordena los cursos de forma consistente:
 * programa → modalidad → ciclo (número romano) → codigo
 */
function sortCourses(courses) {
  return [...courses].sort((a, b) => {
    // 1. Por programa
    const progCmp = (a.programa ?? '').localeCompare(b.programa ?? '', 'es');
    if (progCmp !== 0) return progCmp;

    // 2. Por modalidad
    const modalCmp = (a.modalidad ?? '').localeCompare(b.modalidad ?? '', 'es');
    if (modalCmp !== 0) return modalCmp;

    // 3. Por ciclo (orden de números romanos)
    const cycleA = ROMAN_ORDER.indexOf(a.ciclo ?? '');
    const cycleB = ROMAN_ORDER.indexOf(b.ciclo ?? '');
    const cycleCmp = (cycleA === -1 ? 99 : cycleA) - (cycleB === -1 ? 99 : cycleB);
    if (cycleCmp !== 0) return cycleCmp;

    // 4. Por código de curso
    return (a.codigo ?? '').localeCompare(b.codigo ?? '', 'es');
  });
}

// ─── Exportación principal ────────────────────────────────────────────────────

async function exportCatalog() {
  console.log('');
  console.log('🔥 Conectando a Firestore con Firebase Admin SDK...');
  console.log(`   Proyecto: ${serviceAccount.project_id}`);
  console.log('');

  let snapshot;
  try {
    snapshot = await db.collection('courses').get();
  } catch (error) {
    console.error('❌ Error al leer la colección "courses" de Firestore:');
    console.error('  ', error.message);
    process.exit(1);
  }

  if (snapshot.empty) {
    console.warn('⚠️  La colección "courses" está vacía en Firestore.');
    console.warn('   No se sobreescribirá courses.json para evitar pérdida de datos.');
    process.exit(0);
  }

  // Mapear documentos a objetos planos (sin campos internos de Firestore)
  const courses = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    };
  });

  const sortedCourses = sortCourses(courses);
  const catalogVersion = Date.now().toString();
  const generatedAt = new Date().toISOString();

  const output = {
    generatedAt,
    catalogVersion,
    totalCourses: sortedCourses.length,
    courses: sortedCourses,
  };

  // Escribir el JSON con indentación legible
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log('✅ Catálogo exportado exitosamente');
  console.log(`   📁 Archivo: public/courses.json`);
  console.log(`   📊 Total cursos: ${sortedCourses.length}`);
  console.log(`   🕐 Generado en: ${generatedAt}`);
  console.log(`   🔖 Versión: ${catalogVersion}`);
  console.log('');
  console.log('👉 Próximos pasos:');
  console.log('   git add public/courses.json');
  console.log('   git commit -m "chore: actualizar catálogo de cursos"');
  console.log('   git push');
  console.log('   → Vercel redeploya automáticamente con el catálogo actualizado.');
  console.log('');
}

exportCatalog();
