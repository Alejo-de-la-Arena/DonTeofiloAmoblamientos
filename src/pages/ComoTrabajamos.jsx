import WorkHero from '../components/como-trabajamos/WorkHero';
import ProcesoRelato from '../components/como-trabajamos/ProcesoRelato';
import CtaPlano from '../components/home/CtaPlano';
import { usePageMeta } from '../hooks/usePageMeta';

const META_TITLE = 'Cómo trabajamos: de la idea a la instalación | Don Teófilo Amoblamientos';
const META_DESCRIPTION =
  'De la primera charla a la instalación: así diseñamos, fabricamos en nuestro taller e instalamos tu mueble a medida.';

export default function ComoTrabajamos() {
  usePageMeta(META_TITLE, META_DESCRIPTION);

  return (
    <>
      <WorkHero />
      <ProcesoRelato />
      {/* La misma hoja de plano que cierra el Home, sin la elección de tipo: el relato ya contó el
          proceso y el paso que sigue es escribir. */}
      <CtaPlano
        title="¿Querés que tu próximo proyecto empiece así?"
        lead="Contanos tu idea y te acompañamos en cada paso. Presupuesto sin compromiso."
        chips={false}
        mensaje="Hola, quiero arrancar un proyecto a medida"
      />
    </>
  );
}
