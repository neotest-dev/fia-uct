import { useState, useCallback } from 'react';
import { loginWithEmail, logout as logoutService } from '../services/authService';
import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication actions.
 * Provides login/logout functions with loading and error states.
 *
 * @returns {{ user, loading, error, login, logout, clearError }}
 */
export function useAuth() {
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutService();
    } catch (err) {
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    loading: authLoading || loading,
    error,
    login,
    logout,
    clearError,
  };
}

/**
 * Maps Firebase error codes to user-friendly Spanish messages.
 */
function getErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-email': 'Email inválido',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
  };
  return messages[code] || 'Error de autenticación';
}
