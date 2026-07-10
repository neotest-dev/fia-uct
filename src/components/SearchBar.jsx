import { useState, useEffect, useRef } from 'react';
import { Search, X, Target } from 'lucide-react';

/**
 * Search input with debounce, accent normalization hint, and clear button.
 *
 * @param {{ value: string, onChange: function, placeholder?: string, resultsCount?: number }} props
 */
export default function SearchBar({ value, onChange, placeholder = 'Buscar cursos...', resultsCount }) {
  const [localValue, setLocalValue] = useState(value || '');
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Debounce search
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" id="search-bar">
      <div className="relative flex items-center group">
        <input
          id="search-input"
          type="text"
          className="w-full pl-12 pr-12 py-3.5 neu-input rounded-2xl text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-sm sm:text-base font-medium"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          aria-label="Buscar"
          autoComplete="off"
        />
        <span className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300 pointer-events-none">
          <Search className="w-5 h-5" />
        </span>
        {localValue && (
          <button
            className="absolute right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 neu-btn transition-all duration-200 cursor-pointer text-sm"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {resultsCount !== undefined && localValue && (
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-semibold pl-4 animate-fade-in-up flex items-center gap-1.5">
          <Target className="w-4 h-4 text-accent" />
          <span>{resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'} encontrado{resultsCount !== 1 ? 's' : ''}</span>
        </p>
      )}
    </div>
  );
}

