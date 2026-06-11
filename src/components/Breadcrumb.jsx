import { Link } from 'react-router-dom';

/**
 * Breadcrumb navigation component.
 * Shows the hierarchical path: Inicio > Programa > Modalidad > Ciclo
 *
 * @param {{ items: Array<{ label: string, to?: string }> }} props
 */
export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 py-4 text-[11px] sm:text-sm font-semibold tracking-wide" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span className="flex items-center gap-1.5 sm:gap-2" key={index}>
          {index > 0 && <span className="text-slate-400 select-none text-[9px] sm:text-xs font-black">›</span>}
          {item.to ? (
            <Link to={item.to} className="text-slate-400 hover:text-primary transition-colors duration-250 no-underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-bold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
