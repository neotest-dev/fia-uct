import { useState, useEffect } from 'react';
import { useFetchData } from '../hooks/useCourses';
import { getPrograms, searchCourses } from '../services/courseService';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Compass, HardHat, Laptop, Leaf, Zap, Factory, Mountain, BookOpen, GraduationCap } from 'lucide-react';

const PROGRAM_ICONS = {
  'Arquitectura': <Compass className="w-6 h-6" />,
  'Ingeniería Civil': <HardHat className="w-6 h-6" />,
  'Ingeniería Informática': <Laptop className="w-6 h-6" />,
  'Ingeniería Ambiental': <Leaf className="w-6 h-6" />,
  'Ingeniería Mecánico-Eléctrica': <Zap className="w-6 h-6" />,
  'Ingeniería Industrial': <Factory className="w-6 h-6" />,
  'Ingeniería de Minas': <Mountain className="w-6 h-6" />,
};

/**
 * Home page with hero section, global search, and program grid.
 */
export default function HomePage() {
  const { data: programs, loading, error } = useFetchData(getPrograms);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [visibleResults, setVisibleResults] = useState(20);

  useEffect(() => {
    document.title = 'FIAUct';
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setVisibleResults(20);
      return;
    }
    setSearching(true);
    try {
      const results = await searchCourses(query);
      setSearchResults(results);
      setVisibleResults(20); // Resetear cantidad visible al realizar una nueva búsqueda
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const displayedResults = searchResults.slice(0, visibleResults);

  return (
    <div className="animate-fade-in-up flex flex-col gap-10 max-w-5xl mx-auto py-6">
      {/* Hero Section */}
      <section className="text-center relative py-10 px-4 flex flex-col items-center justify-center">
        {/* Glow background */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full -z-10 pointer-events-none blur-3xl" />
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-primary tracking-tight font-display mb-4 leading-tight">
          Catálogo Académico <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FIAUct</span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Explora los programas académicos, modalidades, ciclos y cursos de la Universidad Católica de Trujillo.
        </p>
      </section>
 
      {/* Search */}
      <div className="w-full max-w-2xl mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Buscar cursos, docentes o códigos..."
          resultsCount={searchQuery ? searchResults.length : undefined}
        />
      </div>
 
      {/* Search Results */}
      {searchQuery && (
        <section className="mt-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight font-display mb-6 border-l-4 border-accent pl-3">
            Resultados de búsqueda
          </h2>
          {searching ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner text="Buscando..." size="sm" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col gap-6 items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {displayedResults.map((course, index) => (
                  <Card
                    key={course.codigo + index}
                    to={`/courses/${course.codigo}`}
                    icon={<BookOpen className="w-5 h-5" />}
                    title={course.curso}
                    subtitle={`${course.docente} · ${course.programa}`}
                    tags={[course.ciclo, course['mod-curso'], `${course.creditos} créd.`]}
                  />
                ))}
              </div>
              
              {searchResults.length > visibleResults && (
                <button
                  onClick={() => setVisibleResults((prev) => prev + 20)}
                  className="mt-4 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-2 text-sm"
                >
                  Cargar más resultados (+{searchResults.length - visibleResults})
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <p className="text-slate-400 font-medium text-sm sm:text-base">
                No se encontraron resultados para <span className="text-slate-600 font-bold">"{searchQuery}"</span>
              </p>
            </div>
          )}
        </section>
      )}

      {/* Programs Grid */}
      {!searchQuery && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100/30 max-w-3xl mx-auto w-full divide-x divide-slate-100">
            <div className="text-center px-2 hover:-translate-y-0.5 transition-transform duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight font-display">
                {programs?.length || 0}
              </div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-2">
                Programas
              </div>
            </div>
            <div className="text-center px-2 hover:-translate-y-0.5 transition-transform duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight font-display">
                914
              </div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-2">
                Cursos
              </div>
            </div>
            <div className="text-center px-2 hover:-translate-y-0.5 transition-transform duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight font-display">
                10
              </div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-2">
                Ciclos
              </div>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
