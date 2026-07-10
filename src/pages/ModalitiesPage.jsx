import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchData } from '../hooks/useCourses';
import { getModalities } from '../services/courseService';
import Card from '../components/Card';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { School, Monitor, BookOpen, Inbox } from 'lucide-react';

const MODALITY_ICONS = {
  'Presencial': <School className="w-6 h-6" />,
  'Semi-presencial': <Monitor className="w-6 h-6" />,
};

const MODALITY_DESCRIPTIONS = {
  'Presencial': 'Clases en campus universitario',
  'Semi-presencial': 'Combinación de clases presenciales y virtuales',
};

/**
 * Page listing modalities for a selected program.
 */
export default function ModalitiesPage() {
  const { programId } = useParams();
  const program = decodeURIComponent(programId);

  const { data: modalities, loading, error } = useFetchData(
    () => getModalities(program),
    [program]
  );

  useEffect(() => {
    document.title = `${program} — Modalidades`;
  }, [program]);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Programas', to: '/programs' },
    { label: program },
  ];

  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm my-6">
        <p className="font-semibold text-sm sm:text-base">Error al cargar modalidades: {error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8 border-b border-slate-200/50 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight font-display mb-2">
          {program}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500">Selecciona una modalidad de estudio.</p>
      </div>

      {modalities && modalities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modalities.map((modality) => (
            <Card
              key={modality}
              to={`/programs/${programId}/modalities/${encodeURIComponent(modality)}/cycles`}
              icon={MODALITY_ICONS[modality] || <BookOpen className="w-6 h-6" />}
              title={modality}
              subtitle={MODALITY_DESCRIPTIONS[modality] || 'Ver ciclos disponibles'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 neu rounded-3xl text-slate-400 font-medium">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm sm:text-base">No hay modalidades disponibles en este programa</p>
        </div>
      )}
    </div>
  );
}
