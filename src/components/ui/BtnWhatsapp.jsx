import WhatsAppIcon from './icons/WhatsAppIcon';
import './buttons.css';

export default function BtnWhatsapp({ href, className = '', iconSize = 22, children, ...rest }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={`btn-whatsapp ${className}`.trim()} {...rest}>
      <WhatsAppIcon size={iconSize} />
      {children}
    </a>
  );
}
