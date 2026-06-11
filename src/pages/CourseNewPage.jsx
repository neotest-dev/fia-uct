import { useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import CourseForm from '../components/CourseForm';
import { createCourse } from '../services/courseService';

/**
 * Protected page for creating a new course.
 */
export default function CourseNewPage() {
  useEffect(() => {
    document.title = 'Nuevo Curso';
  }, []);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Admin' },
    { label: 'Nuevo curso' },
  ];

  const handleSubmit = async (courseData) => {
    await createCourse(courseData);
  };

  return (
    <div className="animate-fade-in-up flex flex-col gap-6 max-w-2xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      <div className="text-center mb-8 border-b border-slate-200/50 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight font-display mb-2">
          Crear Nuevo Curso
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Completa el formulario para agregar un nuevo curso al catálogo.
        </p>
      </div>

      <CourseForm onSubmit={handleSubmit} submitLabel="Crear curso" />
    </div>
  );
}
