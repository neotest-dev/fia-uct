import { useEffect } from 'react';
import { ShieldCheck, Mail } from 'lucide-react';

/**
 * Public privacy policy page for FIAUct.
 */
export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Política de Privacidad - FIAUct';
  }, []);

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto py-6">
      <section className="bg-white border border-slate-200/70 shadow-md shadow-slate-100/40 rounded-3xl p-6 sm:p-8 md:p-10">
        <div className="flex items-start gap-4 mb-8">
          <div className="shrink-0 p-3 rounded-2xl bg-primary/8 text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight font-display">
              Política de Privacidad de FIAUct
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Última actualización: Junio 2026
            </p>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed mb-8">
          FIAUct es una aplicación informativa diseñada para facilitar la consulta de programas académicos,
          modalidades, ciclos y cursos.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-3">Información recopilada</h2>
            <p className="text-slate-600 leading-relaxed">
              La aplicación puede utilizar servicios de Firebase para el funcionamiento de determinadas
              características. FIAUct no recopila ni comparte información personal sensible de los usuarios
              con terceros para fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-3">Uso de la información</h2>
            <p className="text-slate-600 leading-relaxed mb-3">La información recopilada se utiliza únicamente para:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Mejorar el funcionamiento de la aplicación.</li>
              <li>Mostrar contenido académico.</li>
              <li>Mantener la seguridad y estabilidad del servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-3">Servicios de terceros</h2>
            <p className="text-slate-600 leading-relaxed">
              La aplicación puede utilizar servicios proporcionados por Google Firebase, los cuales cuentan
              con sus propias políticas de privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-3">Seguridad</h2>
            <p className="text-slate-600 leading-relaxed">
              Se implementan medidas razonables para proteger la información procesada por la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-3">Cambios en esta política</h2>
            <p className="text-slate-600 leading-relaxed">
              Esta política puede actualizarse periódicamente. Los cambios serán publicados en esta misma
              página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-3">Contacto</h2>
            <a
              href="mailto:noeflorian242003@gmail.com"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors no-underline"
            >
              <Mail className="w-4 h-4" />
              <span>noeflorian242003@gmail.com</span>
            </a>
          </section>
        </div>
      </section>
    </div>
  );
}
