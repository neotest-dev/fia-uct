import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetchData } from '../hooks/useCourses';
import { getCourseByCode } from '../services/courseService';
import { useAuthContext } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Edit3, User, SearchX } from 'lucide-react';

/**
 * Course detail page showing all information about a single course.
 * Admin users see an "Edit" button.
 */
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuthContext();

  const { data: course, loading, error } = useFetchData(
    () => getCourseByCode(courseId),
    [courseId]
  );

  useEffect(() => {
    if (course) {
      document.title = course.curso;
    }
  }, [course]);

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Programas', to: '/programs' },
    { label: course?.programa || '...', to: course ? `/programs/${encodeURIComponent(course.programa)}/modalities` : '#' },
    { label: course?.curso || 'Detalle' },
  ];

  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm my-6">
        <p className="font-semibold text-sm sm:text-base">Error al cargar detalle del curso: {error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col items-center gap-4 max-w-md mx-auto my-12 px-6">
        <SearchX className="w-16 h-16 text-slate-300" />
        <p className="text-slate-400 font-semibold text-base">Curso no encontrado</p>
        <Link to="/programs" className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-light transition-all active:scale-95 no-underline mt-2 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a programas</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-6 max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": course.curso,
          "description": `Curso de ${course.curso} (${course.codigo}) de la carrera de ${course.programa} en la modalidad de ${course.modalidad}.`,
          "courseCode": course.codigo,
          "provider": {
            "@type": "Organization",
            "name": "Universidad Católica de Trujillo",
            "sameAs": "https://www.uct.edu.pe"
          }
        })}
      </script>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight font-display leading-tight">
            {course.curso}
          </h1>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-primary bg-primary-bg px-3 py-1 rounded-lg border border-primary-light/10 w-fit">
            Código: {course.codigo}
          </span>
        </div>

        {/* Acciones del encabezado */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-start w-full sm:w-auto">
          <Link
            to={`/programs/${encodeURIComponent(course.programa)}/modalities/${encodeURIComponent(course.modalidad)}/cycles/${encodeURIComponent(course.ciclo)}/courses`}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200 no-underline active:scale-95 flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la lista</span>
          </Link>

          {user && (
            <Link
              to={`/admin/courses/${course.id ?? course.codigo}/edit`}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-dark hover:shadow-md hover:shadow-accent/20 rounded-xl transition-all duration-200 no-underline active:scale-95 flex items-center justify-center gap-1.5 w-full sm:w-auto"
              id="edit-course-btn"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar curso</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100/50 rounded-full text-xs font-extrabold shadow-sm">
          {course['mod-curso']}
        </span>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-full text-xs font-extrabold shadow-sm">
          {course.tipoEstudio}
        </span>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100/50 rounded-full text-xs font-extrabold shadow-sm">
          {course.creditos} créditos · {course.horas} horas
        </span>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Main Details */}
        <div className="md:col-span-2 flex flex-col gap-6 order-last md:order-first">
          <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Información del Curso
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Docente</span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{course.docente}</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Horas Semanales</span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">{course.horas} horas</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Créditos del Curso</span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">{course.creditos}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Estudio</span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">{course.tipoEstudio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="md:col-span-1 order-first md:order-last">
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-3xl shadow-lg shadow-primary/15 border border-primary-light/10 flex flex-col gap-5 sticky top-24">
            <h2 className="text-[10px] font-extrabold text-primary-bg/70 uppercase tracking-widest">
              Ficha del Programa
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-primary-bg/60 uppercase tracking-wider">Programa</span>
                <span className="text-sm sm:text-base font-bold text-white leading-tight">{course.programa}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-primary-bg/60 uppercase tracking-wider">Modalidad Académica</span>
                <span className="text-sm sm:text-base font-bold text-white">{course.modalidad}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-primary-bg/60 uppercase tracking-wider">Ciclo</span>
                <span className="text-sm sm:text-base font-bold text-white">Ciclo {course.ciclo}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-primary-bg/60 uppercase tracking-wider">Modalidad del Curso</span>
                <span className="text-sm sm:text-base font-bold text-white">{course['mod-curso']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
