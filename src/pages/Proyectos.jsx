import { useEffect, useRef, useState } from 'react';
import ProyectosHero from '../components/proyectos/ProyectosHero';
import ProyectoCaso from '../components/proyectos/ProyectoCaso';
import ProjectsCTA from '../components/proyectos/ProjectsCTA';
import { fetchProyectosPublicos } from '../lib/proyectosApi';
import { drawerIn, stagger, useMotionSafe } from '../lib/motion';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './Proyectos.module.css';

const META_TITLE = 'Proyectos terminados: antes y después | Don Teófilo Amoblamientos';
const META_DESCRIPTION =
  'Obras terminadas de Don Teófilo: cocinas, placards, vanitorys y amoblamientos a medida, con el antes y el después de cada proyecto.';

// Con hasta 8 proyectos se muestran todos; con más, 6 y "Ver más" carga de a 6.
const SHOW_ALL_MAX = 8;
const PAGE = 6;

// Entrada de los casos que llegan con "Ver más": cajón escalonado, solo para los nuevos.
const nuevoV = {
  hidden: () => drawerIn.hidden(1),
  show: (i = 0) => ({
    ...drawerIn.show,
    transition: { ...drawerIn.show.transition, delay: i * stagger.line },
  }),
};

export default function Proyectos() {
  usePageMeta(META_TITLE, META_DESCRIPTION);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [visibles, setVisibles] = useState(0);
  const [primerNuevo, setPrimerNuevo] = useState(null); // índice del primer caso cargado con "Ver más"
  const nuevoRef = useRef(null);
  const { variants: safe } = useMotionSafe();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProyectosPublicos();
        if (cancelled) return;
        setProyectos(data);
        setVisibles(data.length <= SHOW_ALL_MAX ? data.length : PAGE);
      } catch {
        if (!cancelled) setLoadError('No pudimos cargar los proyectos. Recargá la página para intentar de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Al cargar más, el foco pasa al título del primer caso nuevo (el botón pudo desaparecer).
  useEffect(() => {
    if (primerNuevo != null) nuevoRef.current?.focus();
  }, [primerNuevo]);

  const verMas = () => {
    setPrimerNuevo(visibles);
    setVisibles((v) => Math.min(v + PAGE, proyectos.length));
  };
  const hayMas = visibles < proyectos.length;

  return (
    <>
      <ProyectosHero proyectos={proyectos} loading={loading} />
      <main className={styles.main}>
        {loading && <p className={styles.status}>Cargando proyectos…</p>}
        {!loading && loadError && <p className={`${styles.status} ${styles.error}`}>{loadError}</p>}
        {!loading && !loadError && proyectos.length === 0 && (
          <p className={styles.status}>Todavía no hay proyectos publicados.</p>
        )}

        {proyectos.length > 0 && (
          <ol className={styles.lista} aria-label="Proyectos">
            {proyectos.slice(0, visibles).map((p, i) => {
              const esNuevo = primerNuevo != null && i >= primerNuevo;
              return (
                <ProyectoCaso
                  key={p.id}
                  ref={i === primerNuevo ? nuevoRef : undefined}
                  proyecto={p}
                  index={i}
                  motionProps={
                    esNuevo
                      ? { variants: safe(nuevoV), custom: i - primerNuevo, initial: 'hidden', animate: 'show' }
                      : undefined
                  }
                />
              );
            })}
          </ol>
        )}

        {hayMas && (
          <div className={styles.more}>
            <button type="button" className={styles.moreBtn} onClick={verMas}>
              Ver más proyectos
            </button>
            <p className={`${styles.moreCount} tabular`}>
              {visibles} de {proyectos.length}
            </p>
          </div>
        )}
      </main>
      <ProjectsCTA />
    </>
  );
}
