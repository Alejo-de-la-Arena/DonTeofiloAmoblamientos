import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_URL } from '../../config/contact';
import styles from './WhatsAppButton.module.css';

/**
 * CTA de WhatsApp en paleta. El único guiño de verde es el glifo, dentro de una ficha clara;
 * el botón en sí es óxido (primary), madera (dark) o transparente (ghost, hereda el color).
 *
 * - primary: la acción principal de la vista. Una por pantalla.
 * - dark:    sobre fondos claros, cuando el óxido ya está usado cerca.
 * - ghost:   secundaria; toma currentColor, sirve sobre claro y sobre oscuro.
 *
 * El verde #25D366 de fondo queda reservado al botón flotante (layout/WhatsAppFloat).
 */
export default function WhatsAppButton({
  href = WHATSAPP_URL,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], styles[size], block && styles.block, className].filter(Boolean).join(' ');
  return (
    <a href={href} target="_blank" rel="noopener" className={cls} {...rest}>
      <span className={styles.icon} aria-hidden="true">
        <WhatsAppIcon size={size === 'sm' ? 16 : 18} />
      </span>
      <span>{children}</span>
    </a>
  );
}
