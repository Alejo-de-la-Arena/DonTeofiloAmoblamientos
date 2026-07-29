import './buttons.css';

import { Link } from 'react-router-dom';

export default function BtnPrimary({ href, className = '', children, ...rest }) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={`btn-primary ${className}`.trim()} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={`btn-primary ${className}`.trim()} {...rest}>
      {children}
    </a>
  );
}
