import './buttons.css';

import { Link } from 'react-router-dom';

export default function BtnOutline({ href, className = '', children, ...rest }) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={`btn-outline ${className}`.trim()} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={`btn-outline ${className}`.trim()} {...rest}>
      {children}
    </a>
  );
}
