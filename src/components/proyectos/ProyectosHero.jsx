import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BeforeAfterScroll from '../primitives/BeforeAfterScroll';
import RevealLines from '../primitives/RevealLines';
import { useMotionSafe } from '../../lib/motion';
import { contarProyectos, proyectoDelHero, splitTitulo } from '../../lib/proyectos';
import { useAfterLoad } from '../../hooks/useAfterLoad';
import { useRouteEntry } from '../layout/routeEntry';
import { useNavOverDark } from '../layout/navTheme';
import styles from './ProyectosHero.module.css';

// En minúscula y por spread: React 18 no conoce la prop camelCase (igual que en Home/Hero).
const HIGH_PRIORITY = { fetchpriority: 'high' };

// Contenido fijo del sticky: título protagonista + conteo + el proyecto que se está mostrando.
function Info({ total, proyecto, draw }) {
  const { nombre, ubicacion } = proyecto ? splitTitulo(proyecto) : {};
  return (
    <div className={styles.info}>
      <RevealLines as="h1" lines={['Proyectos']} draw={draw} className={styles.title} />
      {(total > 0 || proyecto) && (
        <div className={styles.meta}>
          {total > 0 && <p className={`${styles.count} tabular`}>{contarProyectos(total)}</p>}
          {proyecto && (
            <Link to={`/proyectos/${proyecto.slug}`} className={styles.current}>
              <span className={styles.name}>{nombre}</span>
              {ubicacion && <span className={styles.place}>{ubicacion}</span>}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hero "Transformación" del listado: antes → después con el scroll, full-bleed (el del Home es
 * una lámina con márgenes) y con otro proyecto que el destacado del Home.
 * Fallbacks: sin ningún par antes/después, o si una imagen falla → estático con el "después";
 * sin proyectos → solo el título sobre madera. Con reduced motion, BeforeAfterScroll ya no
 * pinea y muestra el "después" con un botón para ver el antes.
 */
export default function ProyectosHero({ proyectos, loading }) {
  const ref = useRef(null);
  useNavOverDark(ref);
  const entry = useRouteEntry();
  const { reduce } = useMotionSafe();
  const afterLoad = useAfterLoad();
  const [failed, setFailed] = useState(false);
  const [staticFailed, setStaticFailed] = useState(false);

  const { proyecto, par } = proyectoDelHero(proyectos);
  const draw = entry === 'pop' ? 'none' : 'mount';
  const info = <Info total={proyectos.length} proyecto={proyecto} draw={draw} />;
  // El nav va transparente sobre la foto: una franja medida solo detrás del header.
  const navScrim = <div className={styles.navScrim} aria-hidden="true" />;

  let body;
  if (loading) {
    body = <div className={styles.stage} />;
  } else if (proyecto && par && !failed) {
    // Lo primero que se ve es el "antes" (o el "después" con reduced motion): esa capa es el
    // LCP y va con prioridad; la otra se pide cuando la página ya cargó.
    const capa = (url, alt, first) => ({
      src: first || afterLoad ? url : undefined,
      alt,
      sizes: '100vw',
      priority: first,
      onError: () => setFailed(true),
    });
    body = (
      <BeforeAfterScroll
        heightDesktop="200vh"
        heightMobile="170vh"
        className={styles.pin}
        head={navScrim}
        aria-label={`Antes y después: ${proyecto.titulo}`}
        antes={capa(proyecto.imagen_antes, `${proyecto.titulo}, antes de la obra`, !reduce)}
        despues={capa(proyecto.imagen_despues, `${proyecto.titulo}, terminado`, reduce)}
      >
        {info}
      </BeforeAfterScroll>
    );
  } else {
    body = (
      <div className={`${styles.stage} ${styles.static}`}>
        {proyecto && !staticFailed && (
          <img
            className={styles.img}
            src={proyecto.imagen_despues}
            alt={`${proyecto.titulo}, terminado`}
            sizes="100vw"
            decoding="async"
            {...HIGH_PRIORITY}
            onError={() => setStaticFailed(true)}
          />
        )}
        {proyecto && !staticFailed && navScrim}
        <div className={styles.staticInfo}>{info}</div>
      </div>
    );
  }

  return (
    <header ref={ref} className={styles.hero}>
      {body}
    </header>
  );
}
