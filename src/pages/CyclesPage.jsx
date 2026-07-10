import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchData } from '../hooks/useCourses';
import { getCycles } from '../services/courseService';
import Card from '../components/Card';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Inbox } from 'lucide-react';

/**
 * Page listing cycles for a selected program + modality.
 */
export default function CyclesPage() {
  const { programId, modalityId } = useParams();
  const program = decodeURIComponent(programId);
  const modality = decodeURIComponent(modalityId);

  const { data: cycles, loading, error } = useFetchData(
    () => getCycles(program, modality),
    [program, modality]
  );

  useEffect(() => {
    document.title = `${program} — Ciclos`;
  }, [program]);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Programas', to: '/programs' },
    { label: program, to: `/programs/${programId}/modalities` },
    { label: modality },
  ];

  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm my-6">
        <p className="font-semibold text-sm sm:text-base">Error al cargar ciclos: {error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8 border-b border-slate-200/50 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight font-display mb-2">
          Ciclos — {program}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500">
          Modalidad <span className="font-bold text-primary">{modality}</span>. Selecciona un ciclo para ver los cursos.
        </p>
      </div>

      {cycles && cycles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cycles.map((cycle) => (
            <Card
              key={cycle}
              to={`/programs/${programId}/modalities/${modalityId}/cycles/${encodeURIComponent(cycle)}/courses`}
              icon={<Calendar className="w-5 h-5" />}
              title={`Ciclo ${cycle}`}
              subtitle={`Ver cursos del ciclo ${cycle}`}
              compact={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 neu rounded-3xl text-slate-400 font-medium">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm sm:text-base">No hay ciclos disponibles</p>
        </div>
      )}
    </div>
  );
}
