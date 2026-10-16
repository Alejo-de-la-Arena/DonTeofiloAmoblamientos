import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BeforeAfterSlider from '../components/home/BeforeAfterSlider';
import RevealLines from '../components/primitives/RevealLines';
import Cota from '../components/primitives/Cota';
import ProyectoGaleria from '../components/proyectos/ProyectoGaleria';
import SiguienteProyecto from '../components/proyectos/SiguienteProyecto';
import ProjectsCTA from '../components/proyectos/ProjectsCTA';
import { useRouteEntry } from '../components/layout/routeEntry';
import { useNavOverDark } from '../components/layout/navTheme';
import { fetchProyectoPorSlug, fetchSiguienteProyecto } from '../lib/proyectosApi';
import { detallesConValor, lineaDeTrabajo, splitTitulo } from '../lib/proyectos';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './ProyectoDetalle.module.css';

const SITE = 'Don Teófilo Amoblamientos';
const HIGH_PRIORITY = { fetchpriority: 'high' }; // minúscula y por spread: React 18
const clean = (v) => (v == null ? '' : String(v).trim());

function useMeta(proyecto, estado) {
  let title = `Proyecto | ${SITE}`;
  let description;
  if (estado === 'notfound') title = `Proyecto no encontrado | ${SITE}`;
  if (proyecto) {
    const { nombre, ubicacion } = splitTitulo(proyecto);
    title = `${nombre}${ubicacion ? ` en ${ubicacion}` : ''} | ${SITE}`;
    const partes = [proyecto.categoria && `${proyecto.categoria} a medida${ubicacion ? ` en ${ubicacion}` : ''}.`, lineaDeTrabajo(proyecto)];
    description = partes.filter(Boolean).join(' ').slice(0, 160) || undefined;
  }
  usePageMeta(title, description);
}

// Hero: la foto "después" a 85svh, el título sobre la foto con el mismo gradiente medido que el
// listado. Sin puertas propias (la transición de ruta ya abrió); en POP, sin intro.
function Hero({ proyecto }) {
  const ref = useRef(null);
  useNavOverDark(ref);
  const entry = useRouteEntry();
  const [imgFailed, setImgFailed] = useState(false);
  const { nombre, ubicacion } = splitTitulo(proyecto);
  const src = proyecto.imagen_despues;

  return (
    <header ref={ref} className={styles.hero}>
      {src && !imgFailed && (
        <>
          <img
            className={styles.heroImg}
            src={src}
            alt={`${proyecto.titulo}, terminado`}
            sizes="100vw"
            decoding="async"
            onError={() => setImgFailed(true)}
            {...HIGH_PRIORITY}
          />
          <div className={styles.navScrim} aria-hidden="true" />
        </>
      )}
      <div className={styles.heroInfo}>
        <RevealLines as="h1" lines={[nombre]} draw={entry === 'pop' ? 'none' : 'mount'} className={styles.heroTitle} />
        {(proyecto.categoria || ubicacion) && (
          <p className={styles.heroMeta}>
            {proyecto.categoria && <span className={styles.heroCat}>{proyecto.categoria}</span>}
            {ubicacion && <span className={styles.heroPlace}>{ubicacion}</span>}
          </p>
        )}
      </div>
    </header>
  );
}

// Mientras carga: el mismo escenario de madera, con el nav ya en su variante sobre oscuro.
function HeroPlaceholder() {
  const ref = useRef(null);
  useNavOverDark(ref);
  return <div ref={ref} className={styles.heroPlaceholder} />;
}

// Ficha técnica: cada dato con una cota corta encima, como un plano acotado.
function Ficha({ detalles }) {
  if (!detalles.length) return null;
  return (
    <section className={styles.ficha} aria-labelledby="ficha-titulo">
      <h2 id="ficha-titulo" className="sr-only">
        Ficha técnica
      </h2>
      <dl className={styles.fichaList}>
        {detalles.map((d, i) => (
          <div key={d.id ?? d.label} className={styles.fichaItem}>
            <Cota className={styles.fichaCota} draw="view" delay={i * 0.08} />
            <dt className={styles.fichaLabel}>{d.label}</dt>
            <dd className={styles.fichaValor}>{d.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// Relato: con desafío y solución, dos bloques titulados; si no, la descripción en un bloque.
function Relato({ proyecto }) {
  const desafio = clean(proyecto.desafio);
  const solucion = clean(proyecto.solucion);
  const descripcion = clean(proyecto.descripcion);
  if (desafio && solucion) {
    return (
      <section className={styles.relato} aria-label="El proyecto">
        <div className={styles.relatoBloque}>
          <h2 className={styles.relatoTitulo}>El desafío</h2>
          <p className={styles.relatoTexto}>{desafio}</p>
        </div>
        <div className={styles.relatoBloque}>
          <h2 className={styles.relatoTitulo}>La solución</h2>
          <p className={styles.relatoTexto}>{solucion}</p>
        </div>
      </section>
    );
  }
  if (!descripcion) return null;
  return (
    <section className={styles.relato} aria-labelledby="relato-titulo">
      <h2 id="relato-titulo" className="sr-only">
        El proyecto
      </h2>
      <p className={`${styles.relatoTexto} ${styles.relatoUnico}`}>{descripcion}</p>
    </section>
  );
}

function Detalle({ slug }) {
  const [proyecto, setProyecto] = useState(null);
  const [siguiente, setSiguiente] = useState(null);
  const [estado, setEstado] = useState('loading'); // loading | ok | notfound | error

  useEffect(() => {
    let cancelled = false;
    fetchProyectoPorSlug(slug)
      .then((p) => {
        if (cancelled) return;
        setProyecto(p);
        setEstado(p ? 'ok' : 'notfound');
      })
      .catch(() => !cancelled && setEstado('error'));
    // El "siguiente" no bloquea la página: si falla, el bloque no se muestra.
    fetchSiguienteProyecto(slug)
      .then((s) => !cancelled && setSiguiente(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useMeta(proyecto, estado);

  if (estado === 'loading') {
    return (
      <main className={styles.page} aria-busy="true">
        <HeroPlaceholder />
      </main>
    );
  }

  if (estado === 'error' || estado === 'notfound') {
    return (
      <main className={`${styles.page} ${styles.statusPage}`}>
        <div className={styles.status}>
          <h1 className={styles.statusTitle}>
            {estado === 'error' ? 'No pudimos cargar este proyecto' : 'No encontramos este proyecto'}
          </h1>
          <p className={styles.statusText}>
            {estado === 'error'
              ? 'Revisá tu conexión y recargá la página.'
              : 'Puede que el link esté vencido o que el proyecto ya no esté publicado.'}
          </p>
          <Link to="/proyectos" className={styles.statusLink}>
            Ver todos los proyectos
          </Link>
        </div>
      </main>
    );
  }

  const detalles = detallesConValor(proyecto);
  const tienePar = Boolean(proyecto.imagen_antes && proyecto.imagen_despues);
  const waHref = buildWhatsAppUrl({ mensaje: `Hola, vi el proyecto ${proyecto.titulo} y quiero algo parecido` });

  return (
    <>
      <main className={styles.page}>
        <Hero proyecto={proyecto} />
        <div className={styles.body}>
          <Ficha detalles={detalles} />
          <Relato proyecto={proyecto} />
          {tienePar && (
            <section className={styles.antesDespues} aria-labelledby="ad-titulo">
              <h2 id="ad-titulo" className={styles.sectionTitle}>
                Antes y después
              </h2>
              <div className={styles.slider}>
                <BeforeAfterSlider beforeSrc={proyecto.imagen_antes} afterSrc={proyecto.imagen_despues} alt={proyecto.titulo} />
              </div>
            </section>
          )}
          <ProyectoGaleria imagenes={proyecto.galeria} titulo={proyecto.titulo} />
        </div>
        {siguiente && <SiguienteProyecto proyecto={siguiente} />}
      </main>
      <ProjectsCTA
        titulo="¿Querés algo parecido?"
        texto="Contanos qué tenés en mente y lo medimos juntos."
        href={waHref}
        accion="Consultar por WhatsApp"
      />
    </>
  );
}

// Una instancia por slug: al ir al "siguiente" se remonta todo (estado, reveal del título).
export default function ProyectoDetalle() {
  const { slug } = useParams();
  return <Detalle key={slug} slug={slug} />;
}
