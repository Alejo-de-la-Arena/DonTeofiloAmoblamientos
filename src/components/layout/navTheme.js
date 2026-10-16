import { createContext, useContext, useEffect } from 'react';

/**
 * Hero oscuro que manda sobre el nav: mientras el borde inferior del elemento registrado esté
 * por debajo del header, el nav va en su variante "sobre oscuro" (transparente, texto claro).
 * Lo provee Layout; las páginas sin registro siguen con la regla por ruta (DARK_HERO_ROUTES).
 */
export const NavDarkContext = createContext(null);

export function useNavOverDark(ref, enabled = true) {
  const register = useContext(NavDarkContext);
  useEffect(() => {
    if (!enabled || !register || !ref.current) return undefined;
    return register(ref.current);
  }, [register, ref, enabled]);
}
