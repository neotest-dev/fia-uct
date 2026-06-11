import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { normalizeText } from '../utils/normalizeText';

const COURSES_COLLECTION = 'courses';

// ─── Logging helpers (solo en desarrollo) ────────────────────────────────────

/**
 * Log de operación de escritura en Firestore (solo en DEV).
 */
function logFirestoreWrite(type) {
  if (import.meta.env.DEV) {
    console.info(
      `%c🔥 [Firestore Write] %cTipo: ${type}`,
      'color: #ef4444; font-weight: bold;',
      'color: inherit;'
    );
  }
}

/**
 * Log de lectura desde JSON estático (solo en DEV).
 */
function logJsonRead() {
  if (import.meta.env.DEV) {
    console.info(
      '%c📄 [JSON] %cCatálogo cargado desde public/courses.json (0 lecturas Firestore)',
      'color: #10b981; font-weight: bold;',
      'color: inherit;'
    );
  }
}

// ─── Catálogo público: siempre desde courses.json ────────────────────────────

/**
 * Caché en memoria para la sesión actual.
 * Evita múltiples fetches al mismo archivo JSON en una sola visita.
 * No persiste entre recargas de página (no usa localStorage).
 */
let catalogCache = null;
let catalogCachePromise = null;

/**
 * Lee el catálogo público desde public/courses.json.
 *
 * El archivo es generado por `npm run export:catalog` y servido
 * como asset estático por Vercel — sin consumir lecturas de Firestore.
 *
 * El formato esperado del JSON es:
 *   { generatedAt, catalogVersion, totalCourses, courses: [...] }
 * pero también acepta un array plano (compatibilidad con versiones anteriores).
 *
 * @returns {Promise<Array>}
 */
async function getAllCourses() {
  // 1. Caché en memoria (válida durante la sesión)
  if (catalogCache) return catalogCache;

  // 2. Deduplicar requests concurrentes
  if (catalogCachePromise) return catalogCachePromise;

  catalogCachePromise = (async () => {
    try {
      const response = await fetch('/courses.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al cargar courses.json`);
      }
      const data = await response.json();

      // Aceptar tanto { courses: [...] } como array plano
      const courses = Array.isArray(data) ? data : (data.courses ?? []);

      logJsonRead();
      catalogCache = courses;
      return courses;
    } catch (error) {
      console.error('❌ Error al cargar public/courses.json:', error.message);
      return [];
    } finally {
      catalogCachePromise = null;
    }
  })();

  return catalogCachePromise;
}

// ─── Lecturas del catálogo (público) ─────────────────────────────────────────

/**
 * Obtiene la lista de programas académicos únicos.
 * @returns {Promise<string[]>}
 */
export async function getPrograms() {
  const courses = await getAllCourses();
  const programs = [...new Set(courses.map((c) => c.programa).filter(Boolean))];
  return programs.sort();
}

/**
 * Obtiene las modalidades disponibles para un programa dado.
 * @param {string} programName
 * @returns {Promise<string[]>}
 */
export async function getModalities(programName) {
  const courses = await getAllCourses();
  const filtered = courses.filter((c) => c.programa === programName);
  const modalities = [...new Set(filtered.map((c) => c.modalidad).filter(Boolean))];
  return modalities.sort();
}

/**
 * Obtiene los ciclos disponibles para una combinación de programa + modalidad.
 * @param {string} programName
 * @param {string} modalityName
 * @returns {Promise<string[]>}
 */
export async function getCycles(programName, modalityName) {
  const courses = await getAllCourses();
  const filtered = courses.filter(
    (c) => c.programa === programName && c.modalidad === modalityName
  );
  const cycles = [...new Set(filtered.map((c) => c.ciclo).filter(Boolean))];

  const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return cycles.sort((a, b) => romanOrder.indexOf(a) - romanOrder.indexOf(b));
}

/**
 * Obtiene los cursos de una combinación específica de programa + modalidad + ciclo.
 * Lee exclusivamente desde el catálogo JSON estático.
 * @param {string} programName
 * @param {string} modalityName
 * @param {string} cycleName
 * @returns {Promise<Array>}
 */
export async function getCourses(programName, modalityName, cycleName) {
  const courses = await getAllCourses();
  return courses.filter(
    (c) =>
      c.programa === programName &&
      c.modalidad === modalityName &&
      c.ciclo === cycleName
  );
}

/**
 * Obtiene un único curso por su código.
 * Lee exclusivamente desde el catálogo JSON estático.
 * @param {string} courseCode
 * @returns {Promise<Object|null>}
 */
export async function getCourseByCode(courseCode) {
  const courses = await getAllCourses();
  return courses.find((c) => c.codigo === courseCode) ?? null;
}

/**
 * Busca cursos por término de consulta, normalizando texto.
 * Opera sobre el catálogo JSON estático ya cargado en memoria.
 * @param {string} queryStr
 * @returns {Promise<Array>}
 */
export async function searchCourses(queryStr) {
  if (!queryStr || !queryStr.trim()) return [];

  const courses = await getAllCourses();
  const normalizedQuery = normalizeText(queryStr);

  return courses.filter((c) => {
    const fields = [c.curso, c.codigo, c.docente, c.programa].filter(Boolean);
    return fields.some((field) => normalizeText(field).includes(normalizedQuery));
  });
}

// ─── Escrituras del catálogo (solo admin autenticado) ────────────────────────

/**
 * Actualiza la versión del catálogo en Firestore.
 * Se llama tras crear o editar un curso para indicar que el JSON está desactualizado.
 */
async function updateRemoteCatalogVersion() {
  if (!isFirebaseConfigured || !db) return;
  try {
    const configRef = doc(db, 'app_metadata', 'config');
    const newVersion = Date.now().toString();
    await setDoc(
      configRef,
      { catalogVersion: newVersion, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    if (import.meta.env.DEV) {
      console.info('🔖 Versión de catálogo en Firestore actualizada a:', newVersion);
    }
  } catch (error) {
    console.error('Error al actualizar versión del catálogo en Firestore:', error.message);
  }
}

/**
 * Crea un nuevo curso en Firestore (solo admin autenticado).
 * Después de crear, ejecutar `npm run export:catalog` y hacer git push
 * para que los visitantes públicos vean el cambio.
 * @param {Object} courseData
 * @returns {Promise<string>} ID del documento creado
 */
export async function createCourse(courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  logFirestoreWrite('createCourse');
  const docRef = await addDoc(collection(db, COURSES_COLLECTION), courseData);

  // Invalidar caché en memoria del admin (no afecta a visitantes)
  catalogCache = null;
  await updateRemoteCatalogVersion();

  return docRef.id;
}

/**
 * Actualiza un curso existente en Firestore (solo admin autenticado).
 * Después de editar, ejecutar `npm run export:catalog` y hacer git push
 * para que los visitantes públicos vean el cambio.
 * @param {string} courseId - ID de documento de Firestore
 * @param {Object} courseData
 */
export async function updateCourse(courseId, courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  logFirestoreWrite(`updateCourse (${courseId})`);
  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  await updateDoc(courseRef, courseData);

  // Invalidar caché en memoria del admin (no afecta a visitantes)
  catalogCache = null;
  await updateRemoteCatalogVersion();
}

/**
 * Suscripción en tiempo real a un curso específico.
 * Solo se usa en el panel admin para reflejar cambios instantáneos.
 * No se utiliza en páginas públicas.
 * @param {string} courseCode
 * @param {function} callback
 * @returns {function} Función de desuscripción
 */
export function subscribeToCourse(courseCode, callback) {
  if (!isFirebaseConfigured || !db) {
    // Sin Firebase: buscar en el JSON estático y notificar una vez
    getAllCourses()
      .then((courses) => {
        const course = courses.find((c) => c.codigo === courseCode) ?? null;
        callback(course, null);
      })
      .catch((err) => callback(null, err.message));
    return () => {};
  }

  const q = query(collection(db, COURSES_COLLECTION), where('codigo', '==', courseCode));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null, null);
      } else {
        const docSnap = snapshot.docs[0];
        callback({ id: docSnap.id, ...docSnap.data() }, null);
      }
    },
    (error) => {
      console.error('Error en suscripción en tiempo real:', error);
      callback(null, error.message);
    }
  );
}
