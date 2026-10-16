import { useScroll } from 'framer-motion';

/** Progreso 0→1 del scroll a través de una sección alta (de "start start" a "end end"). */
export function usePinProgress(ref) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return scrollYProgress;
}
