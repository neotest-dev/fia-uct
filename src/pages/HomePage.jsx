import { useEffect } from 'react';
import { useFetchData } from '../hooks/useCourses';
import { getPrograms } from '../services/courseService';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Compass, HardHat, Laptop, Leaf, Zap, Factory, Mountain, BookOpen } from 'lucide-react';

const PROGRAM_ICONS = {
  'Arquitectura': <Compass className="w-6 h-6" />,
  'Ingeniería Civil': <HardHat className="w-6 h-6" />,
  'Ingeniería Informática': <Laptop className="w-6 h-6" />,
  'Ingeniería Ambiental': <Leaf className="w-6 h-6" />,
  'Ingeniería Mecánico-Eléctrica': <Zap className="w-6 h-6" />,
  'Ingeniería Industrial': <Factory className="w-6 h-6" />,
  'Ingeniería de Minas': <Mountain className="w-6 h-6" />,
};

export default function HomePage() {
  const { data: programs, loading, error } = useFetchData(getPrograms);

  useEffect(() => {
    document.title = 'FIAUct';
  }, []);

  return (
    <div className="animate-fade-in-up flex flex-col gap-10 max-w-5xl mx-auto py-6">
      {/* Hero Section */}
      <section className="text-center relative py-10 px-4 flex flex-col items-center justify-center">
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full -z-10 pointer-events-none blur-3xl" />

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-primary tracking-tight font-display mb-4 leading-tight">
          Catálogo Académico <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FIAUct</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Explora los programas académicos, modalidades, ciclos y cursos de la Universidad Católica de Trujillo.
        </p>
      </section>


      {/* Programs Grid */}
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight font-display mb-6 border-l-4 border-accent pl-3">
          Programas Académicos
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200">
            <p className="font-semibold text-sm">Error al cargar programas: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs?.map((program) => (
              <Card
                key={program}
                to={`/programs/${encodeURIComponent(program)}/modalities`}
                icon={PROGRAM_ICONS[program] || <BookOpen className="w-6 h-6" />}
                title={program}
                subtitle="Ver modalidades disponibles"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
