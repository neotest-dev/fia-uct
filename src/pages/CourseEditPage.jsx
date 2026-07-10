import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFirestoreCourseById, updateCourse } from '../services/courseService';
import Breadcrumb from '../components/Breadcrumb';
import CourseForm from '../components/CourseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { SearchX } from 'lucide-react';

/**
 * Protected page for editing an existing course.
 * Loads the course directly from Firestore using the document ID.
 */
export default function CourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: () => getFirestoreCourseById(courseId),
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000, // 5 min — el admin necesita datos frescos
    retry: 1,
  });

  const error = queryError ? (queryError.message || 'Error al cargar curso') : null;
  const resolvedCourseId = course?.id ?? courseId ?? null;

  useEffect(() => {
    if (course) {
      document.title = `Editar: ${course.curso}`;
    }
  }, [course]);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Admin' },
    { label: course ? `Editar: ${course.curso}` : 'Editar curso' },
  ];

  const handleSubmit = async (courseData) => {
    if (!resolvedCourseId) {
      throw new Error('No se pudo identificar el curso a editar');
    }

    await updateCourse(resolvedCourseId, courseData);
  };


  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm my-6">
        <p className="font-semibold text-sm sm:text-base">Error al cargar curso: {error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col items-center gap-4 max-w-md mx-auto my-12 px-6">
        <SearchX className="w-16 h-16 text-slate-300" />
        <p className="text-slate-400 font-semibold text-base">Curso no encontrado en Firestore</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-6 max-w-2xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      <div className="text-center mb-8 border-b border-slate-200/50 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight font-display mb-2">
          Editar Curso
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Modifica la información del curso y guarda los cambios.
        </p>
      </div>

      <CourseForm
        initialData={course}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />

    </div>
  );
}
