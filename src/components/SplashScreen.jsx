import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * Full-screen splash/loading screen with UCT branding.
 * Fades out after a minimum display time once loading completes.
 *
 * @param {{ loading: boolean }} props
 */
export default function SplashScreen({ loading }) {
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Minimum 1.2s display time for smooth UX
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (!visible) {
      // Wait for CSS fade-out to finish before removing from DOM
      const timer = setTimeout(() => setHidden(true), 600);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (hidden) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light transition-all duration-500 ease-out ${
        !visible ? 'opacity-0 pointer-events-none invisible' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Logo Glass */}
        <div className="w-28 h-28 bg-white/10 flex items-center justify-center rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md shadow-black/15">
          <GraduationCap className="w-14 h-14 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
            FIAUct
          </h1>
          <p className="text-xs text-white/70 font-bold tracking-widest uppercase mt-1">
            Catálogo Académico UCT
          </p>
        </div>
        
        {/* Animated Dots */}
        <div className="flex gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0.15s', animationDuration: '1s' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1s' }} />
        </div>
      </div>
      
      <p className="absolute bottom-8 text-[10px] font-bold text-white/40 tracking-widest uppercase">
        Universidad Católica de Trujillo
      </p>
    </div>
  );
}
