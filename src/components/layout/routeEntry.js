import { createContext, useContext } from 'react';

/**
 * Cómo se llegó a la página que se está mostrando:
 *   'initial' → primera carga del documento (no hubo transición de ruta)
 *   'push'    → navegación hacia adelante: las puertas de ruta ya hicieron el reveal
 *   'pop'     → atrás/adelante del navegador: se vuelve a algo ya visto, sin intro
 * Lo provee RouteTransition. Sirve para que un hero con intro propia (ej. puertas del Home)
 * no repita el gesto que acaba de hacer la transición de ruta.
 */
export const RouteEntryContext = createContext('initial');

export const useRouteEntry = () => useContext(RouteEntryContext);
