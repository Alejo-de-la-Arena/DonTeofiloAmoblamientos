import WhatsAppIcon from './icons/WhatsAppIcon';
import './buttons.css';

export default function BtnWhatsapp({ href, className = '', children, ...rest }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={`btn-whatsapp ${className}`.trim()} {...rest}>
      <WhatsAppIcon size={22} />
      {children}
    </a>
  );
}
