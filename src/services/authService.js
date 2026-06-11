import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

/**
 * Signs in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase Auth no está configurado. Revisa el archivo .env');
  }
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export async function logout() {
  if (!auth) return;
  return signOut(auth);
}

/**
 * Subscribes to auth state changes.
 * If Firebase is not configured, immediately calls back with null user.
 * @param {function} callback - Called with user object or null
 * @returns {function} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
  if (!auth || !isFirebaseConfigured) {
    // No Firebase — immediately resolve with no user
    setTimeout(() => callback(null), 0);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
}
