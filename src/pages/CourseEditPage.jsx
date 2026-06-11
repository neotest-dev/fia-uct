import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchData } from '../hooks/useCourses';
import { getFirestoreCourseByCode, updateCourse, deleteCourse } from '../services/courseService';
import Breadcrumb from '../components/Breadcrumb';
import CourseForm from '../components/CourseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { SearchX, Trash2 } from 'lucide-react';

/**
 * Protected page for editing an existing course.
 * Loads the course directly from Firestore (1 read) to obtain the document ID.
 */
export default function CourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { data: course, loading, error } = useFetchData(
    () => getFirestoreCourseByCode(courseId),
    [courseId]
  );

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
    await updateCourse(course.id, courseData);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCourse(course.id);
      navigate('/programs', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Error al eliminar el curso');
      setDeleting(false);
    }
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

      {/* Zona de eliminación */}
      <div className="bg-white border border-red-200/60 p-6 rounded-2xl shadow-sm mt-4">
        <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
          Zona peligrosa
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Eliminar este curso es irreversible. Se eliminará permanentemente de Firestore.
          Recuerda ejecutar <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">npm run export:catalog</code> después para actualizar el catálogo público.
        </p>

        {deleteError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs font-semibold mb-3" role="alert">
            {deleteError}
          </div>
        )}

        {!showDeleteConfirm ? (
          <button
            type="button"
            className="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-red-600 border-2 border-red-200 hover:bg-red-50 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar curso</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3 bg-red-50/50 border border-red-200/50 rounded-xl p-4">
            <p className="text-xs sm:text-sm font-bold text-red-700">
              ¿Estás seguro de eliminar <span className="text-red-900">"{course.curso}"</span>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-slate-500 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
