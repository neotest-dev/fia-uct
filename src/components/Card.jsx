import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable card component for displaying items in the catalog.
 * Supports icon, title, subtitle, meta tags, and navigation link.
 *
 * @param {{ to: string, icon?: React.ReactNode, title: string, subtitle?: string, tags?: string[], children?: React.ReactNode, compact?: boolean }} props
 */
export default function Card({ to, icon, title, subtitle, tags, children, compact }) {
  return (
    <Link 
      to={to} 
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col group no-underline text-inherit ${
        compact ? 'p-4 gap-2' : 'p-6 gap-3'
      }`}
      id={`card-${title?.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Top Border Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

      {icon && (
        <div className={`rounded-xl bg-primary-bg flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm shadow-primary/5 ${
          compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'
        }`}>
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      )}
      <div className="flex flex-col gap-1 flex-1 pr-6">
        <h3 className={`font-bold text-slate-800 tracking-tight font-display group-hover:text-primary transition-colors duration-200 ${
          compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
        }`}>
          {title}
        </h3>
        {subtitle && <p className={`text-slate-500 font-normal leading-relaxed ${
          compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
        }`}>{subtitle}</p>}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, i) => (
              <span 
                className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-primary bg-primary-bg px-2.5 py-1 rounded-full border border-primary-light/5" 
                key={i}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {children}
      </div>
      <span className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300">
        <ArrowRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
      </span>
    </Link>
  );
}
