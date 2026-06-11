import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, User, LogOut, BookOpen, Plus, ExternalLink } from 'lucide-react';

/**
 * App shell layout with sticky header, main content area, and footer.
 * Shows admin controls when user is authenticated.
 */
export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60 h-16 shadow-sm shadow-slate-100/50" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center no-underline group" aria-label="Ir al inicio">
            <div className="h-10 sm:h-11 w-auto max-w-[130px] sm:max-w-[150px] group-hover:scale-[1.03] transition-all duration-300 overflow-hidden">
              <img src="/logo.png" alt="Logo FIAUct" className="h-full w-auto object-contain" />
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" id="main-nav">
            <NavLink
              to="/programs"
              className={({ isActive }) => 
                `px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 no-underline ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/15' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                }`
              }
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Programas</span>
              </span>
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/admin/courses/new"
                  className={({ isActive }) => 
                    `px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 no-underline ${
                      isActive 
                        ? 'bg-primary text-white shadow-md shadow-primary/15' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                    }`
                  }
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Nuevo Curso</span>
                    <span className="sm:hidden">Nuevo</span>
                  </span>
                </NavLink>
                <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] sm:text-xs font-bold text-amber-700 shadow-sm">
                  <User className="w-3 h-3 text-amber-600" /> Admin
                </span>
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all duration-200 flex items-center gap-1"
                  onClick={logout}
                  id="logout-btn"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/admin/login"
                className={({ isActive }) => 
                  `px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 no-underline ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/15' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                  }`
                }
              >
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Admin</span>
                </span>
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-primary-dark to-slate-950 text-slate-400 py-10 border-t border-primary-light/10" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          {/* Logo y Nombre */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-10 w-auto bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/5 shadow-inner hover:scale-105 transition-transform duration-300">
              <img src="/logo.webp" alt="Logo UCT" className="h-full w-auto object-contain" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300/80 font-bold uppercase tracking-wider leading-relaxed">
              © {new Date().getFullYear()} UCT - FACULTAD DE INGENIERÍA Y ARQUITECTURA
            </p>
          </div>
          
          {/* Enlaces */}
          <div className="flex gap-4">
            <a
              href="https://www.uct.edu.pe"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-light border border-primary-light/20 rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-primary/10 flex items-center gap-1.5 no-underline"
            >
              <span>Sitio Web UCT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
