/**
 * Reusable loading spinner with optional text and size variants.
 *
 * @param {{ text?: string, size?: 'sm'|'md'|'lg' }} props
 */
export default function LoadingSpinner({ text = 'Cargando...', size = 'md' }) {
  const sizeClass = size === 'sm' 
    ? 'w-6 h-6 border-2' 
    : size === 'lg' 
      ? 'w-14 h-14 border-4' 
      : 'w-10 h-10 border-3';

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-label="Cargando">
      <div className={`${sizeClass} border-slate-200 border-t-primary rounded-full animate-spin`} />
      {text && <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wider">{text}</p>}
    </div>
  );
}
