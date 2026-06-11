import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { onAuthStateChanged } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app to provide authentication state globally.
 * Any component can access auth state via useAuthContext().
 * 
 * Optimized: Only sets up the Firebase Auth onAuthStateChanged listener
 * if the user is on an admin route or if they have an active admin session flag in localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const hasAdminSessionFlag = localStorage.getItem('fia_admin_session') === 'true';
    const shouldCheckAuth = isAdminRoute || hasAdminSessionFlag;

    if (shouldCheckAuth) {
      if (import.meta.env.DEV) {
        console.info('%c🔐 [Firebase Auth] Verificación de sesión iniciada (condicional activa)', 'color: #3b82f6; font-weight: bold;');
      }
      const unsubscribe = onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          localStorage.setItem('fia_admin_session', 'true');
        } else {
          localStorage.removeItem('fia_admin_session');
        }
        setLoading(false);
      });

      return () => {
        if (import.meta.env.DEV) {
          console.info('%c🔓 [Firebase Auth] Suscripción limpiada / desactivada', 'color: #64748b;');
        }
        unsubscribe();
      };
    } else {
      if (import.meta.env.DEV) {
        console.info('%c🍃 [Firebase Auth] Omitiendo verificación de sesión para visitante público (0 lecturas de red)', 'color: #10b981; font-weight: bold;');
      }
      setUser(null);
      setLoading(false);
    }
  }, [location.pathname]);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context.
 * @returns {{ user: object|null, loading: boolean }}
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
