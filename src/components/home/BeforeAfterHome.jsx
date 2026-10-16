import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useTransform } from 'framer-motion';
import BeforeAfterScroll from '../primitives/BeforeAfterScroll';
import Cota from '../primitives/Cota';
import { fetchProyectoDestacadoHome } from '../../lib/proyectosApi';
import { useAfterLoad } from '../../hooks/useAfterLoad';
import { detalle, lineaDeTrabajo, splitTitulo } from '../../lib/proyectos';
import styles from './BeforeAfterHome.module.css';

// "Seguí bajando…" es una indicación de uso: se va cuando el wipe ya casi terminó (~90% del
// tramo 0.15–0.85 ≈ 0.78 del progreso). Con reduced motion no hay wipe: el control es el botón.
function Hint({ progress }) {
  const opacity = useTransform(progress, [0.7, 0.78], [1, 0]);
  return (
    <motion.span style={{ opacity }}>
      {' '}Seguí bajando para ver el cambio.
    </motion.span>
  );
}

// La cota acompaña al wipe, no al pin entero: el tramo 0.15–0.85 del progreso (el mismo que
// usa BeforeAfterScroll) se mapea a 0–1 de dibujado.
function WipeCota({ progress, medida }) {
  const draw = useTransform(progress, [0.15, 0.85], [0, 1]);
  return (
    <Cota
      draw={draw}
      tone="light"
      label={medida ?? undefined}
      informative={!!medida}
      className={styles.cota}
    />
  );
}

// Se monta recién con el proyecto: el div del ref existe desde el primer render, así que
// useInView crea su observer (su efecto corre solo al montar; con una ref que aparece después
// de un fetch async nunca observaría nada).
function Destacado({ proyecto, onFail }) {
  // Las fotos del destacado pueden pesar MB (subidas antes del optimizador del admin). Se
  // piden cuando la sección está a ~600px Y la página ya cargó: en pantallas altas la sección
  // puede quedar "cerca" desde el primer frame, y ahí no debe competir con el LCP del hero.
  // El loading="lazy" nativo no alcanza: con red lenta Chrome usa un umbral de ~2500px.
  const nearRef = useRef(null);
  const near = useInView(nearRef, { once: true, margin: '0px 0px 600px 0px' });
  const loaded = useAfterLoad();
  const load = near && loaded;

  const { nombre, ubicacion } = splitTitulo(proyecto);
  const linea = lineaDeTrabajo(proyecto);
  const medida = detalle(proyecto, /medida/i);

  const capa = (url, alt) => ({
    src: load ? url : undefined,
    alt,
    sizes: '(min-width: 1024px) 70vw, 100vw',
    onError: () => onFail(url),
  });

  return (
    <div ref={nearRef}>
      <BeforeAfterScroll
        layout="lamina"
        heightDesktop="300vh"
        heightMobile="220vh"
        className={styles.section}
        aria-label={`Antes y después: ${proyecto.titulo}`}
        antes={capa(proyecto.imagen_antes, `${proyecto.titulo}, antes de la obra`)}
        despues={capa(proyecto.imagen_despues, `${proyecto.titulo}, terminado`)}
        head={(progress, { pinned }) => (
          <>
            <h2 className={styles.title}>Antes y después</h2>
            <p className={styles.lead}>
              {ubicacion ? `${nombre} en ${ubicacion}.` : `${nombre}.`}
              {pinned && <Hint progress={progress} />}
            </p>
          </>
        )}
      >
        {(progress) => (
          <div className={styles.info}>
            {linea && <p className={styles.line}>{linea}</p>}
            <WipeCota progress={progress} medida={medida} />
            <Link to={`/proyectos/${proyecto.slug}`} className={styles.link}>
              Ver el proyecto
            </Link>
          </div>
        )}
      </BeforeAfterScroll>
    </div>
  );
}

/**
 * Antes/después pineado del Home (el momento memorable). Toma el proyecto destacado_home;
 * sin destacado, sin alguna de las dos imágenes, o si alguna falla al cargar, no renderiza
 * nada (nunca una lámina con un hueco).
 */
export default function BeforeAfterHome() {
  const [proyecto, setProyecto] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProyectoDestacadoHome()
      .then((p) => !cancelled && setProyecto(p))
      .catch(() => !cancelled && setProyecto(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFail = useCallback((url) => {
    if (import.meta.env.DEV) console.warn('[BeforeAfterHome] No cargó una imagen del destacado, se oculta la sección:', url);
    setFailed(true);
  }, []);

  if (!proyecto || failed) return null;
  return <Destacado proyecto={proyecto} onFail={handleFail} />;
}
