import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { normalizeText } from '../utils/normalizeText';

const COURSES_COLLECTION = 'courses';
const CACHE_KEY = 'fia_catalog_cache';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 horas en milisegundos

/**
 * Devuelve un log de lectura en consola únicamente en modo desarrollo.
 */
function logFirestoreRead(type, count = 1) {
  if (import.meta.env.DEV) {
    console.info(
      `%c🔥 [Firestore Read] %cTipo: ${type} | Documentos leídos: ~${count}`,
      'color: #ef4444; font-weight: bold;',
      'color: inherit;'
    );
  }
}

/**
 * Devuelve un log de caché hit en consola únicamente en modo desarrollo.
 */
function logCacheHit(type) {
  if (import.meta.env.DEV) {
    console.info(
      `%c⚡ [Cache Hit] %cTipo: ${type} | Cargado de localStorage (0 lecturas Firestore)`,
      'color: #10b981; font-weight: bold;',
      'color: inherit;'
    );
  }
}

/**
 * Fallback: carga cursos desde el archivo JSON local cuando Firebase no está disponible.
 */
let localCoursesCache = null;
async function getLocalCourses() {
  if (localCoursesCache) return localCoursesCache;
  const response = await fetch('/courses.json');
  localCoursesCache = await response.json();
  return localCoursesCache;
}

/**
 * Obtiene la versión actual del catálogo guardada en Firestore.
 */
async function getRemoteCatalogVersion() {
  if (!isFirebaseConfigured || !db) return null;
  try {
    logFirestoreRead('Version Config (app_metadata/config)', 1);
    const configRef = doc(db, 'app_metadata', 'config');
    const configDoc = await getDoc(configRef);
    if (configDoc.exists()) {
      return configDoc.data().catalogVersion || null;
    }
  } catch (error) {
    console.warn('Error al obtener la versión del catálogo en Firestore:', error.message);
  }
  return null;
}

/**
 * Actualiza la versión del catálogo en Firestore. Se llama cuando se crea o edita un curso.
 */
async function updateRemoteCatalogVersion() {
  if (!isFirebaseConfigured || !db) return;
  try {
    const configRef = doc(db, 'app_metadata', 'config');
    const newVersion = Date.now().toString();
    await setDoc(configRef, {
      catalogVersion: newVersion,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.info('Versión de catálogo incrementada en Firestore a:', newVersion);
  } catch (error) {
    console.error('Error al actualizar la versión del catálogo en Firestore:', error.message);
  }
}

/**
 * Helper para leer la caché de localStorage si sigue siendo válida (dentro del TTL).
 */
function getValidCachedCatalog() {
  try {
    const cachedDataRaw = localStorage.getItem(CACHE_KEY);
    if (!cachedDataRaw) return null;

    const cached = JSON.parse(cachedDataRaw);
    const now = Date.now();

    if (cached && Array.isArray(cached.courses) && cached.courses.length > 0) {
      if (now - cached.lastUpdated < CACHE_TTL) {
        return cached;
      }
    }
  } catch (e) {
    console.warn('Error al leer/parsear caché de localStorage:', e);
  }
  return null;
}

let firestoreCoursesCachePromise = null;

/**
 * Obtiene todos los cursos de Firestore, o cae a caché local / JSON local.
 * Implementa versionamiento global con app_metadata y TTL de 12 horas.
 * @returns {Promise<Array>}
 */
async function getAllCourses() {
  if (!isFirebaseConfigured || !db) {
    return getLocalCourses();
  }

  if (firestoreCoursesCachePromise) {
    return firestoreCoursesCachePromise;
  }

  firestoreCoursesCachePromise = (async () => {
    try {
      const now = Date.now();

      // 1. Intentar cargar desde caché con TTL válido
      const cached = getValidCachedCatalog();
      if (cached) {
        logCacheHit('Catálogo completo (TTL activo)');
        firestoreCoursesCachePromise = null;
        return cached.courses;
      }

      // 2. Si el TTL expiró o no hay caché, verificar versión remota
      const remoteVersion = await getRemoteCatalogVersion();
      const rawCache = localStorage.getItem(CACHE_KEY);
      
      if (rawCache) {
        try {
          const parsedCache = JSON.parse(rawCache);
          // Si las versiones coinciden, extendemos el TTL sin descargar el catálogo
          if (parsedCache && parsedCache.catalogVersion === remoteVersion && Array.isArray(parsedCache.courses) && parsedCache.courses.length > 0) {
            logCacheHit('Catálogo completo (Versión coincidente, TTL renovado)');
            parsedCache.lastUpdated = now;
            localStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache));
            
            firestoreCoursesCachePromise = null;
            return parsedCache.courses;
          }
        } catch (e) {
          console.warn('Error al revalidar caché vieja:', e);
        }
      }

      // 3. Descargar catálogo completo si la versión cambió o no hay caché
      logFirestoreRead(`Catálogo completo (${COURSES_COLLECTION})`, 914);
      const snapshot = await getDocs(collection(db, COURSES_COLLECTION));
      if (snapshot.empty) {
        console.info('Colección de Firestore vacía, usando fallback local');
        return getLocalCourses();
      }

      const courses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Guardar en la caché local
      const newCache = {
        courses,
        catalogVersion: remoteVersion || 'v1.0.0',
        lastUpdated: now
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));

      firestoreCoursesCachePromise = null;
      return courses;
    } catch (error) {
      console.warn('Firestore no disponible, cayendo a caché local expirada o JSON:', error.message);
      firestoreCoursesCachePromise = null;

      // Fallback a caché local existente aunque esté expirada
      try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        if (rawCache) {
          const parsedCache = JSON.parse(rawCache);
          if (parsedCache && Array.isArray(parsedCache.courses) && parsedCache.courses.length > 0) {
            logCacheHit('Catálogo completo (Respaldo por error de red)');
            return parsedCache.courses;
          }
        }
      } catch (e) {}

      return getLocalCourses();
    }
  })();

  return firestoreCoursesCachePromise;
}

/**
 * Obtiene la lista de programas académicos únicos.
 * @returns {Promise<string[]>}
 */
export async function getPrograms() {
  const courses = await getAllCourses();
  const programs = [...new Set(courses.map((c) => c.programa))];
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
  const modalities = [...new Set(filtered.map((c) => c.modalidad))];
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
  const cycles = [...new Set(filtered.map((c) => c.ciclo))];

  // Ordenar números romanos
  const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return cycles.sort((a, b) => romanOrder.indexOf(a) - romanOrder.indexOf(b));
}

/**
 * Obtiene los cursos de una combinación específica de programa + modalidad + ciclo.
 * Optimización: Si no hay caché válida localmente, realiza una consulta filtrada directamente a Firestore
 * en lugar de descargar todo el catálogo.
 * @param {string} programName
 * @param {string} modalityName
 * @param {string} cycleName
 * @returns {Promise<Array>}
 */
export async function getCourses(programName, modalityName, cycleName) {
  const cached = getValidCachedCatalog();
  if (cached) {
    logCacheHit(`Cursos filtrados (${programName} - ${modalityName} - Ciclo ${cycleName})`);
    return cached.courses.filter(
      (c) =>
        c.programa === programName &&
        c.modalidad === modalityName &&
        c.ciclo === cycleName
    );
  }

  // Si no hay caché válida, hacemos consulta filtrada a Firestore (Regla 7)
  if (isFirebaseConfigured && db) {
    try {
      logFirestoreRead(`Consulta filtrada (${programName} - ${modalityName} - Ciclo ${cycleName})`, 15);
      const q = query(
        collection(db, COURSES_COLLECTION),
        where('programa', '==', programName),
        where('modalidad', '==', modalityName),
        where('ciclo', '==', cycleName)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.warn('Error al hacer consulta filtrada en Firestore, cayendo a catálogo general:', error.message);
    }
  }

  // Fallback al catálogo general
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
 * Optimización: Si no hay caché válida, busca directamente en Firestore por código.
 * @param {string} courseCode
 * @returns {Promise<Object|null>}
 */
export async function getCourseByCode(courseCode) {
  const cached = getValidCachedCatalog();
  if (cached) {
    logCacheHit(`Curso por código (${courseCode})`);
    return cached.courses.find((c) => c.codigo === courseCode) || null;
  }

  // Si no hay caché válida, buscar por código directo en Firestore para ahorrar lecturas (Regla 7)
  if (isFirebaseConfigured && db) {
    try {
      logFirestoreRead(`Curso por código directo (${courseCode})`, 1);
      const q = query(collection(db, COURSES_COLLECTION), where('codigo', '==', courseCode));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        return { id: d.id, ...d.data() };
      }
      return null;
    } catch (error) {
      console.warn('Error al buscar curso por código en Firestore, cayendo a catálogo general:', error.message);
    }
  }

  const courses = await getAllCourses();
  return courses.find((c) => c.codigo === courseCode) || null;
}

/**
 * Busca cursos por término de consulta, normalizando texto.
 * Utiliza la caché local si ya está cargada.
 * @param {string} queryStr
 * @returns {Promise<Array>}
 */
export async function searchCourses(queryStr) {
  if (!queryStr || !queryStr.trim()) return [];

  const cached = getValidCachedCatalog();
  let courses;
  if (cached) {
    logCacheHit(`Búsqueda local ("${queryStr}")`);
    courses = cached.courses;
  } else {
    // Si no hay caché, descarga y almacena el catálogo completo para búsquedas posteriores
    courses = await getAllCourses();
  }

  const normalizedQuery = normalizeText(queryStr);
  return courses.filter((c) => {
    const fields = [c.curso, c.codigo, c.docente, c.programa].filter(Boolean);
    return fields.some((field) => normalizeText(field).includes(normalizedQuery));
  });
}

/**
 * Crea un nuevo curso en Firestore.
 * Incrementa la versión del catálogo en Firestore e invalida la caché local.
 * @param {Object} courseData
 * @returns {Promise<string>}
 */
export async function createCourse(courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  const docRef = await addDoc(collection(db, COURSES_COLLECTION), courseData);
  
  // Invalidar caché local y actualizar versión en Firestore
  localStorage.removeItem(CACHE_KEY);
  firestoreCoursesCachePromise = null;
  await updateRemoteCatalogVersion();

  return docRef.id;
}

/**
 * Actualiza un curso existente en Firestore.
 * Incrementa la versión del catálogo en Firestore e invalida la caché local.
 * @param {string} courseId - ID de documento de Firestore
 * @param {Object} courseData
 */
export async function updateCourse(courseId, courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  await updateDoc(courseRef, courseData);
  
  // Invalidar caché local y actualizar versión en Firestore
  localStorage.removeItem(CACHE_KEY);
  firestoreCoursesCachePromise = null;
  await updateRemoteCatalogVersion();
}

/**
 * Suscripción en tiempo real (mantenida solo por compatibilidad, no utilizada en páginas públicas).
 */
export function subscribeToCourse(courseCode, callback) {
  if (!isFirebaseConfigured || !db) {
    getLocalCourses().then((courses) => {
      const course = courses.find((c) => c.codigo === courseCode) || null;
      callback(course, null);
    }).catch((err) => {
      callback(null, err.message);
    });
    return () => {};
  }

  const q = query(collection(db, COURSES_COLLECTION), where('codigo', '==', courseCode));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null, null);
      } else {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() }, null);
      }
    },
    (error) => {
      console.error('Error en suscripción en tiempo real:', error);
      callback(null, error.message);
    }
  );
}
