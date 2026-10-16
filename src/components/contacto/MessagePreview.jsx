import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dur, ease, useMotionSafe } from '../../lib/motion';

export default function MessagePreview({ show, onToggle, previewText, typing, typingKey }) {
  const { reduce } = useMotionSafe();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const placeholder = '(Todavía no completé los datos)';
  const [before, after] = previewText.split(placeholder);
  return (
    <div className="message-preview">
      <button
        type="button"
        className="message-preview-toggle"
        onClick={onToggle}
        aria-expanded={show}
        aria-controls="contact-message-preview"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={'message-preview-chevron' + (show ? ' open' : '')}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        Así vas a enviar tu mensaje
      </button>
      <div
        id="contact-message-preview"
        className={'message-preview-wrap' + (show ? ' open' : '')}
        hidden={!show}
      >
        <div className="message-preview-panel">
          <div className="message-preview-bubble-row">
            {typing && !reduce ? (
              <div className="message-preview-typing" role="status" aria-label="Escribiendo…">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={typingKey + i}
                    aria-hidden="true"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: 1 }}
                  />
                ))}
                <span className="contact-sr-only">escribiendo…</span>
              </div>
            ) : (
              <motion.div
                key={previewText}
                className="message-preview-bubble"
                initial={reduce ? false : { scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: dur.xs, ease: ease.settle }}
              >
                {before}
                {after !== undefined && (
                  <>
                    <span className="message-preview-placeholder">{placeholder}</span>
                    {after}
                  </>
                )}
                <div className="message-preview-time">
                  {now.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23',
                  })}{' '}
                  <span aria-label="Mensaje leído">✓✓</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
