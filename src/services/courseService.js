import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { queryClient } from '../queryClient';
import {
  getProgramsFromMetadata,
  getModalitiesFromMetadata,
  getCyclesFromMetadata,
} from './metadataService';

const COURSES_COLLECTION = 'courses';

// ─── Logging helpers (solo en desarrollo) ────────────────────────────────────

function logFirestoreWrite(type, details = '') {
  if (import.meta.env.DEV) {
    const detailStr = details ? ` - ${details}` : '';
    console.info(
      `%c🔥 [Admin] %c${type}${detailStr}`,
      'color: #ef4444; font-weight: bold;',
      'color: inherit;'
    );
  }
}

function logFirestoreRead(description, docCount) {
  if (import.meta.env.DEV) {
    const countStr = docCount !== undefined ? ` → ${docCount} documento(s)` : '';
    console.info(
      `%c📖 [Read] %c${description}${countStr}`,
      'color: #3b82f6; font-weight: bold;',
      'color: inherit;'
    );
  }
}

function logAdminEdit(action, courseData) {
  if (import.meta.env.DEV) {
    const name = courseData.curso || 'Sin nombre';
    const code = courseData.codigo || 'Sin código';
    console.info(
      `%c🔥 [Admin] %c${action}: "${name}" (${code})`,
      'color: #ef4444; font-weight: bold;',
      'color: inherit;'
    );
  }
}

function logCacheInvalidation() {
  if (import.meta.env.DEV) {
    console.info(
      '%c🔄 [Cache] %cCache invalidado - próxima lectura será fresca',
      'color: #10b981; font-weight: bold;',
      'color: inherit;'
    );
  }
}

function logRealtimeEvent(description) {
  if (import.meta.env.DEV) {
    console.info(
      `%c👁️ [Realtime] %c${description}`,
      'color: #f59e0b; font-weight: bold;',
      'color: inherit;'
    );
  }
}

// ─── Lecturas del catálogo (público) ─────────────────────────────────────────

/**
 * Obtiene la lista de programas académicos desde metadata/config.
 * @returns {Promise<string[]>}
 */
export async function getPrograms() {
  return getProgramsFromMetadata();
}

/**
 * Obtiene las modalidades disponibles para un programa desde metadata/config.
 * @param {string} programName
 * @returns {Promise<string[]>}
 */
export async function getModalities(programName) {
  return getModalitiesFromMetadata(programName);
}

/**
 * Obtiene los ciclos disponibles para una combinación de programa + modalidad desde metadata/config.
 * @param {string} programName
 * @param {string} modalityName
 * @returns {Promise<string[]>}
 */
export async function getCycles(programName, modalityName) {
  return getCyclesFromMetadata(programName, modalityName);
}

/**
 * Obtiene los cursos de una combinación específica de programa + modalidad + ciclo.
 * Usa query con where() en Firestore (igual que Android).
 * @param {string} programName
 * @param {string} modalityName
 * @param {string} cycleName
 * @returns {Promise<Array>}
 */
export async function getCourses(programName, modalityName, cycleName) {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase no configurado, retornando array vacío');
    return [];
  }

  logFirestoreRead(`getCourses(${programName}, ${modalityName}, ${cycleName})`);

  const q = query(
    collection(db, COURSES_COLLECTION),
    where('programa', '==', programName),
    where('modalidad', '==', modalityName),
    where('ciclo', '==', cycleName)
  );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  logFirestoreRead(`getCourses(${programName}, ${modalityName}, ${cycleName})`, docs.length);
  return docs;
}

/**
 * Obtiene un único curso por su código.
 * Usa query con where() en Firestore.
 * @param {string} courseCode
 * @returns {Promise<Object|null>}
 */
export async function getCourseByCode(courseCode) {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase no configurado, retornando null');
    return null;
  }

  logFirestoreRead(`getCourseByCode(${courseCode})`);

  const q = query(
    collection(db, COURSES_COLLECTION),
    where('codigo', '==', courseCode)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    logFirestoreRead(`getCourseByCode(${courseCode})`, 0);
    return null;
  }

  const docSnap = snapshot.docs[0];
  logFirestoreRead(`getCourseByCode(${courseCode})`, 1);
  return { id: docSnap.id, ...docSnap.data() };
}

// ─── Escrituras del catálogo (solo admin autenticado) ────────────────────────

/**
 * Crea un nuevo curso en Firestore (solo admin autenticado).
 * @param {Object} courseData
 * @returns {Promise<string>} ID del documento creado
 */
export async function createCourse(courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  logFirestoreWrite('createCourse');
  const docRef = await addDoc(collection(db, COURSES_COLLECTION), courseData);
  logAdminEdit('Curso creado', courseData);

  logCacheInvalidation();
  queryClient.invalidateQueries();

  return docRef.id;
}

/**
 * Obtiene un curso desde Firestore por su ID de documento (1 sola lectura).
 * Se usa exclusivamente en el panel admin para editar un curso existente.
 * @param {string} courseId
 * @returns {Promise<Object|null>}
 */
export async function getFirestoreCourseById(courseId) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  const docSnap = await getDoc(courseRef);

  if (!docSnap.exists()) return null;

  return { ...docSnap.data(), id: docSnap.id };
}

/**
 * Actualiza un curso existente en Firestore (solo admin autenticado).
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
  logAdminEdit('Curso actualizado', courseData);

  logCacheInvalidation();
  queryClient.invalidateQueries();
}

/**
 * Elimina un curso de Firestore (solo admin autenticado).
 * @param {string} courseId - ID de documento de Firestore
 */
export async function deleteCourse(courseId) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  logFirestoreWrite(`deleteCourse (${courseId})`);
  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  await deleteDoc(courseRef);
  logAdminEdit('Curso eliminado', { id: courseId });

  logCacheInvalidation();
  queryClient.invalidateQueries();
}

/**
 * Suscripción en tiempo real a un curso específico.
 * Se usa en el panel admin y en CourseDetailPage para reflejar cambios instantáneos.
 * @param {string} courseCode
 * @param {function} callback
 * @returns {function} Función de desuscripción
 */
export function subscribeToCourse(courseCode, callback) {
  if (!isFirebaseConfigured || !db) {
    callback(null, new Error('Firebase no configurado'));
    return () => {};
  }

  const q = query(collection(db, COURSES_COLLECTION), where('codigo', '==', courseCode));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        logRealtimeEvent(`onSnapshot disparado: 0 documentos para código ${courseCode}`);
        callback(null, null);
      } else {
        const docSnap = snapshot.docs[0];
        const courseData = { ...docSnap.data(), id: docSnap.id };
        logRealtimeEvent(`onSnapshot disparado: 1 documento para código ${courseCode} - "${courseData.curso || 'Sin nombre'}"`);
        callback(courseData, null);
      }
    },
    (error) => {
      console.error('Error en suscripción en tiempo real:', error);
      callback(null, error.message);
    }
  );
}
