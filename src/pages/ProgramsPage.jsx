import { useEffect } from 'react';
import { useFetchData } from '../hooks/useCourses';
import { getPrograms } from '../services/courseService';
import Card from '../components/Card';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { Compass, HardHat, Laptop, Leaf, Zap, Factory, Mountain, BookOpen, Inbox } from 'lucide-react';

const PROGRAM_ICONS = {
  'Arquitectura': <Compass className="w-6 h-6" />,
  'Ingeniería Civil': <HardHat className="w-6 h-6" />,
  'Ingeniería Informática': <Laptop className="w-6 h-6" />,
  'Ingeniería Ambiental': <Leaf className="w-6 h-6" />,
  'Ingeniería Mecánico-Eléctrica': <Zap className="w-6 h-6" />,
  'Ingeniería Industrial': <Factory className="w-6 h-6" />,
  'Ingeniería de Minas': <Mountain className="w-6 h-6" />,
};

const PROGRAM_DESCRIPTIONS = {
  'Arquitectura': 'Diseño y construcción de espacios habitables',
  'Ingeniería Civil': 'Infraestructura y desarrollo urbano',
  'Ingeniería Informática': 'Tecnología, software y sistemas',
  'Ingeniería Ambiental': 'Sostenibilidad y medio ambiente',
  'Ingeniería Mecánico-Eléctrica': 'Sistemas mecánicos y eléctricos',
  'Ingeniería Industrial': 'Optimización de procesos productivos',
  'Ingeniería de Minas': 'Extracción y procesamiento de minerales',
};

/**
 * Page listing all academic programs.
 */
export default function ProgramsPage() {
  const { data: programs, loading, error } = useFetchData(getPrograms);

  useEffect(() => {
    document.title = 'Programas';
  }, []);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Programas' },
  ];

  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm my-6">
        <p className="font-semibold text-sm sm:text-base">Error al cargar programas: {error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8 border-b border-slate-200/50 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight font-display mb-2">
          Programas Académicos
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500">
          Selecciona un programa para explorar sus modalidades, ciclos y cursos.
        </p>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Card
              key={program}
              to={`/programs/${encodeURIComponent(program)}/modalities`}
              icon={PROGRAM_ICONS[program] || <BookOpen className="w-6 h-6" />}
              title={program}
              subtitle={PROGRAM_DESCRIPTIONS[program] || 'Explorar modalidades'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 neu rounded-3xl text-slate-400 font-medium">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm sm:text-base">No se encontraron programas académicos</p>
        </div>
      )}
    </div>
  );
}
