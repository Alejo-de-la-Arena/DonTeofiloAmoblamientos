import { useRef, useState } from 'react';
import { useScroll } from 'framer-motion';
import Cota from '../../components/primitives/Cota';
import SlidingDoors from '../../components/primitives/SlidingDoors';
import RevealImage from '../../components/primitives/RevealImage';
import RevealLines from '../../components/primitives/RevealLines';
import BeforeAfterScroll from '../../components/primitives/BeforeAfterScroll';
import WhatsAppButton from '../../components/primitives/WhatsAppButton';
import { useMotionSafe } from '../../lib/motion';
import antesSrc from '../../assets/images/proyectos/cocina-antes-proyectos-hero-desktop.png?w=1440&format=webp';
import despuesSrc from '../../assets/images/proyectos/cocina-despues-proyectos-hero-desktop.png?w=1440&format=webp';
import placardSrc from '../../assets/images/inicio/servicios/dtf-placard-servicios.png?w=900&format=webp';
import vanitorySrc from '../../assets/images/inicio/servicios/dtf-vanitorys-servicios.png?w=900&format=webp';
import puertasSrc from '../../assets/images/inicio/servicios/dtf-puertas-servicios.png?w=900&format=webp';
import styles from './Primitives.module.css';

// Solo dev (montada en App.jsx bajo import.meta.env.DEV): catálogo de las primitivas del
// sistema "Al milímetro" para revisarlas antes de tocar páginas.

const TONES = ['ink', 'accent', 'light'];

function Block({ title, note, children, dark = false }) {
  return (
    <section className={`${styles.block} ${dark ? styles.dark : ''}`}>
      <h2 className={styles.blockTitle}>{title}</h2>
      {note && <p className={styles.note}>{note}</p>}
      {children}
    </section>
  );
}

function ScrollCota() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 35%'] });
  return (
    <div ref={ref} className={styles.scrollCota}>
      <Cota label="atada al scroll" draw={scrollYProgress} tone="ink" />
    </div>
  );
}

function DoorsDemo({ axis, panels, tone }) {
  const [open, setOpen] = useState(true);
  const [log, setLog] = useState('—');
  return (
    <div className={styles.doorsDemo}>
      <div className={styles.doorsStage}>
        <img src={placardSrc} alt="" className={styles.doorsImg} />
        <SlidingDoors
          open={open}
          axis={axis}
          panels={panels}
          tone={tone}
          onOpenComplete={() => setLog('onOpenComplete')}
          onCloseComplete={() => setLog('onCloseComplete')}
        />
      </div>
      <div className={styles.row}>
        <button type="button" className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-pressed={!open}>
          {open ? 'Cerrar puertas' : 'Abrir puertas'}
        </button>
        <span className={`${styles.meta} tabular`}>
          axis {axis} · {panels} paneles · {tone} · {log}
        </span>
      </div>
    </div>
  );
}

export default function Primitives() {
  const { reduce } = useMotionSafe();

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.h1}>Primitivas</h1>
        <p className={styles.note}>
          Reduced motion: <strong>{reduce ? 'activado' : 'desactivado'}</strong>. Para probar la otra
          variante, cambiá la preferencia del sistema o emulala en DevTools (Rendering → prefers-reduced-motion).
        </p>
      </header>

      <Block title="Cota horizontal" note="draw='view' · tonos ink / accent · labelPosition center / start / end">
        <div className={styles.stack}>
          {TONES.slice(0, 2).map((tone) => (
            <Cota key={tone} label="2400 mm" tone={tone} />
          ))}
          <Cota label="600 mm" labelPosition="start" ticks="slash" />
          <Cota label="900 mm" labelPosition="end" ticks="both" tone="accent" />
          <Cota tone="ink" />
        </div>
      </Block>

      <Block title="Cota sobre madera" note="tone='light'" dark>
        <div className={styles.stack}>
          <Cota label="2400 mm" tone="light" />
          <Cota label="Al milímetro" tone="light" ticks="both" labelPosition="start" />
        </div>
      </Block>

      <Block title="Cota vertical" note="Los tres tonos; el SVG se mide con ResizeObserver, los topes no se deforman.">
        <div className={styles.verticals}>
          {TONES.map((tone) => (
            <div key={tone} className={`${styles.vcell} ${tone === 'light' ? styles.vcellDark : ''}`}>
              <Cota orientation="vertical" label="720 mm" tone={tone} />
            </div>
          ))}
        </div>
      </Block>

      <Block title="Cota con MotionValue" note="draw={scrollYProgress}: se dibuja mientras scrolleás.">
        <ScrollCota />
      </Block>

      <Block title="SlidingDoors" note="Stagger 60ms, ease door. Reduced motion: crossfade de un solo overlay.">
        <div className={styles.grid2}>
          <DoorsDemo axis="x" panels={3} tone="madera" />
          <DoorsDemo axis="y" panels={4} tone="papel" />
        </div>
      </Block>

      <Block title="RevealImage" note="clip-path una sola vez al entrar; scale 1.06 → 1. Direcciones up / left / right.">
        <div className={styles.grid3}>
          <RevealImage src={placardSrc} alt="Placard a medida" aspectRatio="4 / 5" direction="up" />
          <RevealImage src={vanitorySrc} alt="Vanitory" aspectRatio="4 / 5" direction="left" delay={0.08} />
          <RevealImage src={puertasSrc} alt="Puerta" aspectRatio="4 / 5" direction="right" delay={0.16} />
        </div>
      </Block>

      <Block title="RevealLines" note="Líneas explícitas, un único h2 semántico.">
        <RevealLines as="h2" className={styles.display} lines={['Cocinas que', 'se arman acá,', 'al milímetro']} />
      </Block>

      <Block title="WhatsAppButton" note="primary · dark · ghost · sm">
        <div className={styles.row}>
          <WhatsAppButton variant="primary">Escribinos por WhatsApp</WhatsAppButton>
          <WhatsAppButton variant="dark">Escribinos por WhatsApp</WhatsAppButton>
          <WhatsAppButton variant="ghost">Escribinos</WhatsAppButton>
          <WhatsAppButton variant="primary" size="sm">Consultar</WhatsAppButton>
        </div>
      </Block>
      <Block title="WhatsAppButton sobre madera" dark>
        <div className={styles.row}>
          <WhatsAppButton variant="primary">Escribinos por WhatsApp</WhatsAppButton>
          <WhatsAppButton variant="ghost">Escribinos</WhatsAppButton>
        </div>
      </Block>

      <section className={styles.baIntro}>
        <h2 className={styles.blockTitle}>BeforeAfterScroll</h2>
        <p className={styles.note}>
          Pin con position:sticky (PinnedSection). Wipe en el tramo 0.15–0.85 del progreso. Sin drag.
        </p>
      </section>
      <BeforeAfterScroll
        antes={{ src: antesSrc, alt: 'Cocina antes de la reforma' }}
        despues={{ src: despuesSrc, alt: 'Cocina después de la reforma' }}
        medida="2400 mm"
        className="dev-ba"
      >
        <p className={styles.baInfo}>Cocina integral · Nordelta</p>
      </BeforeAfterScroll>
      <div className={styles.tail}>Fin del catálogo.</div>
    </main>
  );
}
