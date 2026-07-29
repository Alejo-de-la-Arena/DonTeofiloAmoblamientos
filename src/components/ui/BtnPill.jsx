import WhatsAppIcon from './icons/WhatsAppIcon';
import './buttons.css';

export default function BtnPill({ href, className = '', children, ...rest }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={`btn-pill ${className}`.trim()} {...rest}>
      <WhatsAppIcon size={15} />
      {children}
    </a>
  );
}
