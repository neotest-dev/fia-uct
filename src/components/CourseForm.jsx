import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const PROGRAMS = [
  'Arquitectura',
  'Ingeniería Civil',
  'Ingeniería Informática',
  'Ingeniería Ambiental',
  'Ingeniería Mecánico-Eléctrica',
  'Ingeniería Industrial',
  'Ingeniería de Minas',
];

const MODALITIES = ['Presencial', 'Semi-presencial'];
const CYCLES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const COURSE_MODALITIES = ['Presencial', 'Virtual'];
const STUDY_TYPES = ['Estudios Generales', 'Estudios Específicos', 'Estudios de Especialidad'];

/**
 * Reusable form for creating or editing courses.
 *
 * @param {{ initialData?: Object, onSubmit: function, submitLabel?: string }} props
 */
export default function CourseForm({ initialData, onSubmit, submitLabel = 'Guardar' }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    curso: initialData?.curso || '',
    codigo: initialData?.codigo || '',
    programa: initialData?.programa || PROGRAMS[0],
    modalidad: initialData?.modalidad || MODALITIES[0],
    ciclo: initialData?.ciclo || CYCLES[0],
    docente: initialData?.docente || '',
    'mod-curso': initialData?.['mod-curso'] || COURSE_MODALITIES[0],
    horas: initialData?.horas || 0,
    creditos: initialData?.creditos || 0,
    tipoEstudio: initialData?.tipoEstudio || STUDY_TYPES[0],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const validate = () => {
    if (!formData.curso.trim()) return 'El nombre del curso es obligatorio';
    if (!formData.codigo.trim()) return 'El código es obligatorio';
    if (!formData.docente.trim()) return 'El docente es obligatorio';
    if (formData.horas < 1) return 'Las horas deben ser al menos 1';
    if (formData.creditos < 1) return 'Los créditos deben ser al menos 1';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar el curso');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="max-w-2xl mx-auto flex flex-col gap-6 bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-sm" onSubmit={handleSubmit} id="course-form">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-xs sm:text-sm flex items-center gap-2 font-semibold" role="alert">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-600 text-xs sm:text-sm flex items-center gap-2 font-semibold" role="alert">
          <CheckCircle2 className="w-4 h-4" />
          <span>Curso guardado exitosamente. Redirigiendo...</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="curso">Nombre del curso *</label>
          <input
            id="curso"
            name="curso"
            type="text"
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold"
            value={formData.curso}
            onChange={handleChange}
            placeholder="Ej: Análisis Matemático I"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="codigo">Código *</label>
          <input
            id="codigo"
            name="codigo"
            type="text"
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold"
            value={formData.codigo}
            onChange={handleChange}
            placeholder="Ej: PRARNOP240101"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="programa">Programa</label>
          <div className="relative">
            <select
              id="programa"
              name="programa"
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold cursor-pointer appearance-none"
              value={formData.programa}
              onChange={handleChange}
            >
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="modalidad">Modalidad del programa</label>
          <div className="relative">
            <select
              id="modalidad"
              name="modalidad"
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold cursor-pointer appearance-none"
              value={formData.modalidad}
              onChange={handleChange}
            >
              {MODALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="ciclo">Ciclo</label>
          <div className="relative">
            <select
              id="ciclo"
              name="ciclo"
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold cursor-pointer appearance-none"
              value={formData.ciclo}
              onChange={handleChange}
            >
              {CYCLES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="docente">Docente *</label>
          <input
            id="docente"
            name="docente"
            type="text"
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold"
            value={formData.docente}
            onChange={handleChange}
            placeholder="Nombre completo del docente"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="mod-curso">Modalidad del curso</label>
          <div className="relative">
            <select
              id="mod-curso"
              name="mod-curso"
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold cursor-pointer appearance-none"
              value={formData['mod-curso']}
              onChange={handleChange}
            >
              {COURSE_MODALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="tipoEstudio">Tipo de estudio</label>
          <div className="relative">
            <select
              id="tipoEstudio"
              name="tipoEstudio"
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold cursor-pointer appearance-none"
              value={formData.tipoEstudio}
              onChange={handleChange}
            >
              {STUDY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="horas">Horas *</label>
          <input
            id="horas"
            name="horas"
            type="number"
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold"
            value={formData.horas}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="creditos">Créditos *</label>
          <input
            id="creditos"
            name="creditos"
            type="number"
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-sm font-semibold"
            value={formData.creditos}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-4">
        <button
          type="button"
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-slate-500 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
