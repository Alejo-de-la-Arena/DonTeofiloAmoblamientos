import { Link } from 'react-router-dom';
import InstagramIcon from '../ui/icons/InstagramIcon';
import {
  WHATSAPP_URL,
  WHATSAPP_DISPLAY,
  CONTACT_EMAIL,
  INSTAGRAM_URL,
  LOCATIONS,
  BUSINESS_HOURS,
} from '../../config/contact';
import './Footer.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/como-trabajamos', label: 'Cómo Trabajamos' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">DON TEÓFILO</div>
          <p className="footer-tagline">Carpintería a medida desde 2011.</p>
          <div className="footer-social">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener"
              className="footer-social-btn footer-social-btn--ig"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} stroke="currentColor" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              className="footer-social-btn footer-social-btn--wa"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.05-1.35A9.94 9.94 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.28-.5-4.6-1.36l-.33-.2-2.98.79.8-2.92-.22-.34A8.13 8.13 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2zm4.5-6.4c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.85-.86 2.06s.88 2.39 1 2.55c.13.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div className="footer-heading">Navegación</div>
          <div className="footer-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-heading">Contacto</div>
          <div className="footer-contact">
            <div>
              WhatsApp
              <br />
              <span className="footer-contact-strong">{WHATSAPP_DISPLAY}</span>
            </div>
            <div>{CONTACT_EMAIL}</div>
            {LOCATIONS.map((loc) => (
              <div key={loc.city}>
                <span className="footer-contact-city">{loc.city}</span>
                <br />
                {loc.address}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-heading">Horarios</div>
          <div className="footer-hours">
            {BUSINESS_HOURS.weekdays}
            <br />
            {BUSINESS_HOURS.saturday}
          </div>
          <Link to="/contacto" className="btn-primary btn-primary--sm">
            Pedí tu presupuesto
          </Link>
        </div>
      </div>
      <div className="footer-bottom-wrap">
        <div className="footer-bottom">
          <span>© 2026 Don Teófilo Amoblamientos. Todos los derechos reservados.</span>
          <span>Diseño y desarrollo por ADLA</span>
        </div>
      </div>
    </footer>
  );
}
