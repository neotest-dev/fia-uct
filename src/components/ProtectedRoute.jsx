import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Route protection wrapper that redirects unauthenticated users to login.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner text="Verificando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
