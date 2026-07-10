import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Admin login page with email/password form.
 * Redirects to home if already authenticated.
 */
export default function LoginPage() {
  const { user, loading, error, login, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Login Admin';
  }, []);

  // Already authenticated — redirect
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error is handled by useAuth hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up px-4">
      <div className="w-full max-w-[400px] neu rounded-3xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark p-8 pb-6 text-center text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mx-auto mb-4 backdrop-blur-md border border-white/10 shadow-sm shadow-black/5">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mb-1">
            Acceso Administrativo
          </h1>
          <p className="text-xs text-primary-bg/70 font-semibold tracking-wide">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card Body */}
        <form className="p-8 flex flex-col gap-5" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-600 text-xs sm:text-sm flex items-center gap-2 font-semibold" role="alert">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              className="w-full px-4 py-3 neu-input rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-sm font-semibold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@uct.pe"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="login-password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-4 pr-11 py-3 neu-input rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-sm font-semibold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1 rounded-md"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ boxShadow: '4px 4px 10px rgba(7,38,103,0.35), -2px -2px 6px rgba(255,255,255,0.15)' }}
            disabled={submitting || loading}
            id="login-submit-btn"
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="text-center mt-2">
            <Link 
              to="/" 
              className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-primary transition-colors duration-200 no-underline"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
