import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { splitTitulo } from '../../lib/proyectos';
import styles from './SiguienteProyecto.module.css';

/**
 * Bloque final "Siguiente": la foto del próximo proyecto de fondo y su nombre. Al acercarse al
 * viewport se precarga esa imagen (es la misma que abre el hero del detalle siguiente, así la
 * navegación llega con la foto ya en caché).
 */
export default function SiguienteProyecto({ proyecto }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: '0px 0px 600px 0px' });
  const src = proyecto.imagen_despues;

  useEffect(() => {
    if (!near || !src) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }, [near, src]);

  const { nombre, ubicacion } = splitTitulo(proyecto);

  return (
    <Link ref={ref} to={`/proyectos/${proyecto.slug}`} className={styles.next}>
      {src && <img className={styles.img} src={near ? src : undefined} alt="" sizes="100vw" decoding="async" />}
      <span className={styles.info}>
        <span className={styles.kicker}>Siguiente proyecto</span>
        <span className={styles.name}>{nombre}</span>
        {ubicacion && <span className={styles.place}>{ubicacion}</span>}
      </span>
    </Link>
  );
}
