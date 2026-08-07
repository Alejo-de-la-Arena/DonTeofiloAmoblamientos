import { WHATSAPP_URL, WHATSAPP_DISPLAY, CONTACT_EMAIL, LOCATIONS, BUSINESS_HOURS } from '../../config/contact';
import './ContactInfo.css';

export default function ContactInfo() {
  return (
    <aside className="contact-info">
      <div className="contact-info-inner">
        <div className="contact-info-eyebrow">
          <span className="contact-info-eyebrow-line"></span>
          <span>Hablemos</span>
        </div>
        <h1 className="contact-info-title">Contanos tu idea</h1>
        <p className="contact-info-lead">
          Completá el formulario y tu mensaje llega directo a nuestro WhatsApp. Sin formularios
          eternos, sin spam — una conversación real.
        </p>

        <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="contact-info-wa">
          <div className="contact-info-wa-label">WhatsApp directo</div>
          <div className="contact-info-wa-number">{WHATSAPP_DISPLAY}</div>
        </a>
      </div>

      <div className="contact-info-bottom">
        <div className="contact-info-facts">
          <div className="contact-info-fact">
            <span className="contact-info-fact-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div className="contact-info-fact-text">
              {LOCATIONS.map((loc, idx) => (
                <span key={loc.city}>
                  <b>{loc.city}</b>
                  {idx < LOCATIONS.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
          <div className="contact-info-fact">
            <span className="contact-info-fact-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <div className="contact-info-fact-text">
              {BUSINESS_HOURS.weekdays} · {BUSINESS_HOURS.saturday}
            </div>
          </div>
          <div className="contact-info-fact">
            <span className="contact-info-fact-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4h16v16H4z" />
                <path d="M4 7l8 5 8-5" />
              </svg>
            </span>
            <div className="contact-info-fact-text">{CONTACT_EMAIL}</div>
          </div>
        </div>

        <div className="contact-info-badge">
          <span className="contact-info-badge-dot"></span>
          <span>Respondemos en menos de 24hs</span>
        </div>
      </div>
    </aside>
  );
}
