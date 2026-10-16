import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_URL } from '../../config/contact';
import styles from './WhatsAppButton.module.css';

/**
 * CTA de WhatsApp en paleta. El único guiño de verde es el glifo, dentro de una ficha clara;
 * el botón en sí es óxido (primary), madera (dark), papel (paper) o transparente (ghost, hereda el color).
 *
 * - primary: la acción principal de la vista. Una por pantalla.
 * - dark:    sobre fondos claros, cuando el óxido ya está usado cerca.
 * - paper:   papel con texto tinta, sobre fondos de color (cianotipo) donde el óxido no contrasta.
 * - ghost:   secundaria; toma currentColor, sirve sobre claro y sobre oscuro.
 *
 * El verde #25D366 de fondo queda reservado al botón flotante (layout/WhatsAppFloat).
 */
export default function WhatsAppButton({
  as: Tag = 'a',
  href = WHATSAPP_URL,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], styles[size], block && styles.block, className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag
      {...(Tag === 'a' ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cls}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        <WhatsAppIcon size={size === 'sm' ? 16 : 18} />
      </span>
      <span>{children}</span>
    </Tag>
  );
}
