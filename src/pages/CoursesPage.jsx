import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchData } from '../hooks/useCourses';
import { getCourses } from '../services/courseService';
import { normalizeText } from '../utils/normalizeText';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Inbox } from 'lucide-react';

/**
 * Page listing courses for a specific program + modality + cycle.
 * Includes local search filtering.
 */
export default function CoursesPage() {
  const { programId, modalityId, cycleId } = useParams();
  const program = decodeURIComponent(programId);
  const modality = decodeURIComponent(modalityId);
  const cycle = decodeURIComponent(cycleId);

  const { data: courses, loading, error } = useFetchData(
    () => getCourses(program, modality, cycle),
    [program, modality, cycle]
  );

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = `${program} — Ciclo ${cycle}`;
  }, [program, cycle]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery.trim()) return courses;

    const normalized = normalizeText(searchQuery);
    return courses.filter((c) => {
      const fields = [c.curso, c.codigo, c.docente].filter(Boolean);
      return fields.some((f) => normalizeText(f).includes(normalized));
    });
  }, [courses, searchQuery]);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Programas', to: '/programs' },
    { label: program, to: `/programs/${programId}/modalities` },
    { label: modality, to: `/programs/${programId}/modalities/${modalityId}/cycles` },
    { label: `Ciclo ${cycle}` },
  ];

  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm my-6">
        <p className="font-semibold text-sm sm:text-base">Error al cargar cursos: {error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-6 border-b border-slate-200/50 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight font-display mb-2">
          Cursos — Ciclo {cycle}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">
          <span className="text-primary">{program}</span> · <span className="text-slate-600">{modality}</span> · <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-xs sm:text-sm">{filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}</span>
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filtrar por nombre, docente o código..."
          resultsCount={searchQuery ? filteredCourses.length : undefined}
        />
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course, index) => (
            <Card
              key={course.codigo + index}
              to={`/courses/${course.codigo}`}
              icon={<BookOpen className="w-5 h-5" />}
              title={course.curso}
              subtitle={course.docente || 'Docente no asignado'}
              tags={[
                course['mod-curso'],
                `${course.horas} horas`,
                `${course.creditos} créditos`,
                course.tipoEstudio,
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-slate-400 font-medium">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm sm:text-base">
            {searchQuery ? 'No se encontraron cursos con esa búsqueda' : 'No hay cursos disponibles'}
          </p>
        </div>
      )}
    </div>
  );
}
