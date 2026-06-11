import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app to provide authentication state globally.
 * Any component can access auth state via useAuthContext().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
