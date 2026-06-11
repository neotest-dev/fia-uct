import {
  collection,
  getDocs,
  getDoc,
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

/**
 * Fallback: loads courses from local JSON file when Firebase is not configured.
 */
let localCoursesCache = null;
async function getLocalCourses() {
  if (localCoursesCache) return localCoursesCache;
  const response = await fetch('/courses.json');
  localCoursesCache = await response.json();
  return localCoursesCache;
}

let firestoreCoursesCachePromise = null;

/**
 * Fetches all courses from Firestore, or falls back to local JSON.
 * Caches the promise to prevent multiple concurrent or subsequent database reads.
 * @returns {Promise<Array>} Array of course objects
 */
async function getAllCourses() {
  if (!isFirebaseConfigured || !db) {
    return getLocalCourses();
  }

  if (!firestoreCoursesCachePromise) {
    firestoreCoursesCachePromise = (async () => {
      try {
        const snapshot = await getDocs(collection(db, COURSES_COLLECTION));
        if (snapshot.empty) {
          // Firestore collection is empty — fall back to local
          console.info('Firestore collection is empty, using local data');
          return getLocalCourses();
        }
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (error) {
        console.warn('Firestore unavailable, falling back to local data:', error.message);
        // Reset cache promise on failure to allow retry later
        firestoreCoursesCachePromise = null;
        return getLocalCourses();
      }
    })();
  }

  return firestoreCoursesCachePromise;
}

/**
 * Gets list of unique programs.
 * @returns {Promise<string[]>}
 */
export async function getPrograms() {
  const courses = await getAllCourses();
  const programs = [...new Set(courses.map((c) => c.programa))];
  return programs.sort();
}

/**
 * Gets modalities available for a given program.
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
 * Gets cycles available for a given program + modality combination.
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

  // Sort Roman numerals correctly
  const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return cycles.sort((a, b) => romanOrder.indexOf(a) - romanOrder.indexOf(b));
}

/**
 * Gets courses for a specific program + modality + cycle combination.
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
 * Gets a single course by its code (codigo).
 * @param {string} courseCode
 * @returns {Promise<Object|null>}
 */
export async function getCourseByCode(courseCode) {
  const courses = await getAllCourses();
  return courses.find((c) => c.codigo === courseCode) || null;
}

/**
 * Searches courses by query string, normalizing accents and case.
 * Searches across course name, code, and instructor.
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

/**
 * Creates a new course in Firestore.
 * @param {Object} courseData
 * @returns {Promise<string>} The new document ID
 */
export async function createCourse(courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  const docRef = await addDoc(collection(db, COURSES_COLLECTION), courseData);
  // Invalidate cache so next fetch gets the updated list
  firestoreCoursesCachePromise = null;
  return docRef.id;
}

/**
 * Updates an existing course in Firestore.
 * @param {string} courseId - Firestore document ID
 * @param {Object} courseData
 */
export async function updateCourse(courseId, courseData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado. Configura el archivo .env');
  }

  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  await updateDoc(courseRef, courseData);
  // Invalidate cache so next fetch gets the updated list
  firestoreCoursesCachePromise = null;
}

/**
 * Subscribes to a single course by its code in real-time.
 * Falls back to static local data if Firebase is not configured.
 * @param {string} courseCode
 * @param {function} callback - Called with (course, error)
 * @returns {function} Unsubscribe function
 */
export function subscribeToCourse(courseCode, callback) {
  if (!isFirebaseConfigured || !db) {
    // Fallback local estático (no hay tiempo real pero llama una vez con los datos locales)
    getLocalCourses().then((courses) => {
      const course = courses.find((c) => c.codigo === courseCode) || null;
      callback(course, null);
    }).catch((err) => {
      callback(null, err.message);
    });
    return () => {}; // No-op unsubscribe
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
      console.error('Error in real-time subscription:', error);
      callback(null, error.message);
    }
  );
}
