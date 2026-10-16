import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';

/** Altura de la línea de lectura, como fracción del viewport. */
export const LINEA = 0.85;

/** Interpolación lineal por tramos, con los extremos fijos (como useTransform con clamp). */
export function interp(v, xs, ys) {
  if (!xs.length) return ys[0] ?? 0;
  if (v <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (v <= xs[i]) {
      const t = xs[i] === xs[i - 1] ? 1 : (v - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return ys[i - 1] + t * (ys[i] - ys[i - 1]);
    }
  }
  return ys[ys.length - 1];
}

const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;
const absBottom = (el) => el.getBoundingClientRect().bottom + window.scrollY;
const absCenter = (el) => {
  const r = el.getBoundingClientRect();
  return (r.top + r.bottom) / 2 + window.scrollY;
};
const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;

/**
 * Paso activo de un relato por scroll, con una sola regla para todos los tamaños:
 *   el paso 1 está activo desde el principio; el paso i (i ≥ 2) se activa cuando el borde
 *   inferior de su texto cruza la línea de lectura (LINEA del viewport). Así un paso nunca se
 *   activa con su texto cortado, y un scroll rápido no saltea nada: el índice sale de la
 *   posición final, no de eventos de entrada.
 *
 * Las posiciones se miden en coordenadas del documento (al montar, con ResizeObserver sobre la
 * sección y en resize); en el scroll solo se compara contra esos números: cero lecturas de
 * layout por frame. React re-renderiza solo cuando cambia el paso activo, la visibilidad de la
 * sección o la de la barra; los valores continuos son MotionValues.
 *
 *   sectionRef  el contenedor de los pasos (y de la regla, que se posiciona relativa a él)
 *   textRefs    [ref] el bloque de texto de cada paso
 *   marcaRefs   [ref] opcional: elementos donde va cada marca de la regla (se mide su centro)
 *   valores     lo que vale `progreso` en la activación de cada paso (ej. mm: 0, 600, 1200, 2400)
 *   barraAlto   alto (px) de la mini barra fija bajo el header, para su visibilidad
 *
 * Devuelve { active, enVista, barra, progreso, relleno, marcas, medir }:
 *   progreso    MotionValue: `valores` interpolados entre activaciones
 *   relleno     MotionValue 0→1: fracción de la regla (de la marca 1 a la última) que llega a cada
 *               marca justo cuando se activa su paso
 *   marcas      { top, height, puntos: [y] } de la regla, relativos a la sección (para dibujarla)
 */
export function useLineaDeLectura({ sectionRef, textRefs, marcaRefs, valores, barraAlto = 0, linea = LINEA }) {
  const { scrollY } = useScroll();
  const progreso = useMotionValue(valores[0]);
  const relleno = useMotionValue(0);
  const med = useRef(null);
  const [estado, setEstado] = useState({ active: 0, enVista: false, barra: false });
  const [marcas, setMarcas] = useState(null);
  const estadoRef = useRef(estado);

  const actualizar = useCallback(
    (y) => {
      const m = med.current;
      if (!m) return;
      let active = 0;
      for (let i = 1; i < m.acts.length; i++) if (y >= m.acts[i]) active = i;
      const next = {
        active,
        enVista: y + m.vh > m.top && y < m.bottom,
        barra: y + m.header >= m.top && y + m.header + barraAlto < m.textBottoms[m.textBottoms.length - 1],
      };
      progreso.set(interp(y, m.acts, valores));
      if (m.rellenos) relleno.set(interp(y, m.acts, m.rellenos));
      const prev = estadoRef.current;
      if (prev.active !== next.active || prev.enVista !== next.enVista || prev.barra !== next.barra) {
        estadoRef.current = next;
        setEstado(next);
      }
    },
    // `valores` es una constante del que llama
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [barraAlto, progreso, relleno]
  );

  const medir = useCallback(() => {
    const section = sectionRef.current;
    const texts = textRefs.map((r) => r.current);
    if (!section || texts.some((t) => !t)) return;
    const vh = window.innerHeight;
    const textBottoms = texts.map(absBottom);
    const top = absTop(section);
    const m = {
      vh,
      header: headerH(),
      top,
      bottom: absBottom(section),
      textBottoms,
      acts: textBottoms.map((b) => b - linea * vh),
      rellenos: null,
    };
    const marcasEls = marcaRefs?.map((r) => r.current);
    if (marcasEls?.length && marcasEls.every(Boolean)) {
      const puntos = marcasEls.map((el) => absCenter(el) - top);
      const alto = puntos[puntos.length - 1] - puntos[0];
      m.rellenos = puntos.map((p) => (alto > 0 ? (p - puntos[0]) / alto : 0));
      setMarcas((prev) => {
        const next = { top: puntos[0], height: alto, puntos: puntos.map((p) => p - puntos[0]) };
        return prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }
    med.current = m;
    actualizar(window.scrollY);
  }, [sectionRef, textRefs, marcaRefs, linea, actualizar]);

  // Antes del primer paint: el marco nunca arranca sin paso.
  useLayoutEffect(() => {
    medir();
    const ro = new ResizeObserver(() => medir());
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => ro.disconnect();
  }, [medir, sectionRef]);

  useEffect(() => {
    // El alto del viewport (línea de lectura) cambia sin que cambie la sección en mobile.
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [medir]);

  useMotionValueEvent(scrollY, 'change', actualizar);

  return { ...estado, progreso, relleno, marcas, medir };
}
