import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchX, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found page with UCT styling.
 */
export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - No encontrado';
  }, []);

  return (
    <div className="animate-fade-in-up min-h-[60vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
      <SearchX className="w-20 h-20 text-slate-300 mb-4" />
      <h1 className="text-5xl font-black text-primary font-display tracking-tight mb-2">
        404
      </h1>
      <p className="text-slate-600 font-bold text-lg mb-2">
        Página no encontrada
      </p>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        La página que estás buscando no existe, ha sido eliminada o su dirección URL ha cambiado.
      </p>
      <Link to="/" className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 no-underline flex items-center justify-center gap-1.5">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </Link>
    </div>
  );
}
