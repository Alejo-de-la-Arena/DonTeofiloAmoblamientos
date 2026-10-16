import { buildWhatsAppUrl } from '../../lib/whatsapp';
import WorkshopRoute from './WorkshopRoute';
import { useEffect, useRef, useState } from 'react';
import { getEstadoTaller } from '../../lib/estadoTaller';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  CONTACT_EMAIL,
  BUSINESS_HOURS,
} from '../../config/contact';
import './ContactInfo.css';

export default function ContactInfo() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimeout = useRef(null);
  useEffect(() => () => clearTimeout(copyTimeout.current), []);
  async function copyNumber() {
    let ok = false;
    try {
      await navigator.clipboard.writeText('+' + WHATSAPP_NUMBER);
      ok = true;
    } catch {
      const field = document.createElement('textarea');
      field.value = '+' + WHATSAPP_NUMBER;
      field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      field.setAttribute('readonly', '');
      const previous = document.activeElement;
      document.body.appendChild(field);
      try {
        field.select();
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      } finally {
        field.remove();
        previous?.focus();
      }
    }
    setCopyError(!ok);
    setCopied(ok);
    clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 2000);
  }
  const [estado, setEstado] = useState(() => getEstadoTaller(new Date()));
  useEffect(() => {
    const interval = setInterval(() => setEstado(getEstadoTaller(new Date())), 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <aside className="contact-info">
      <div className="contact-info-inner">
        <header className="contact-page-intro">
        <div className="contact-info-eyebrow">
          <span className="contact-info-eyebrow-line"></span>
          <span>Hablemos</span>
        </div>
        <h1 className="contact-info-title">Contanos tu idea</h1>
        <p className="contact-info-lead">Completás esto y te abre WhatsApp con el mensaje listo.</p>

        </header>
        <div className="contact-info-wa">
          <div className="contact-info-wa-label">WhatsApp directo</div>
          <div className="contact-info-wa-actions">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-wa-number"
            >
              {WHATSAPP_DISPLAY}
            </a>
            <button
              type="button"
              className={'contact-copy' + (copied ? ' is-copied' : '')}
              onClick={copyNumber}
              aria-label={copied ? 'Número copiado' : 'Copiar número de WhatsApp'}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <rect x="8" y="8" width="12" height="12" rx="1" />
                <path d="M16 8V4H4v12h4" />
              </svg>
              <span className="contact-copy-label">
                <span>Copiar</span>
                <span>Copiado</span>
              </span>
            </button>
          </div>
          <span className="contact-sr-only" aria-live="polite">
            {copied
              ? 'Número de WhatsApp copiado'
              : copyError
                ? 'No se pudo copiar. Seleccioná el número para copiarlo.'
                : ''}
          </span>
        </div>
      </div>

      <WorkshopRoute />

      <div className="contact-info-bottom">
        <div className="contact-info-facts">
          <div className="contact-info-fact">
            <span className="contact-info-fact-icon">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
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
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M4 4h16v16H4z" />
                <path d="M4 7l8 5 8-5" />
              </svg>
            </span>
            <div className="contact-info-fact-text">{CONTACT_EMAIL}</div>
          </div>
        </div>

        <div className={`contact-info-badge${estado.abierto ? ' is-open' : ''}`}>
          <span className="contact-info-badge-dot"></span>
          <span>{estado.texto}</span>
        </div>
      </div>
    </aside>
  );
}
