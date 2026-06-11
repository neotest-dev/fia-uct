import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Firebase configuration loaded from environment variables.
 * Copy .env.example to .env and fill in your Firebase project values.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if Firebase has been properly configured via environment variables.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Habilitar persistencia local offline (IndexedDB)
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Múltiples pestañas abiertas, solo una puede activar la persistencia a la vez.
        console.warn('Firestore offline persistence failed: Multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        // El navegador no es compatible.
        console.warn('Firestore offline persistence is not supported by this browser.');
      } else {
        console.warn('Error enabling Firestore offline persistence:', err.message);
      }
    });
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
  }
} else {
  console.info(
    '%c🔥 Firebase no configurado — usando datos locales (courses.json)',
    'color: #f59e0b; font-weight: bold'
  );
}

export { db, auth };
export default app;
