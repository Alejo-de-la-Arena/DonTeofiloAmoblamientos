import { useEffect, useRef, useState } from 'react';
import Cota from '../primitives/Cota';
import WhatsAppButton from '../primitives/WhatsAppButton';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { materialLabels, nombreProducto, tienePrecioVisible } from '../../lib/catalogo';
import './ProductDetailPanel.css';

const mmFormat = new Intl.NumberFormat('es-AR');
const mm = (n) => `${mmFormat.format(n)} mm`;
const hasMm = (n) => Number.isFinite(n) && n > 0;

// El panel entra en .45s (ProductDetailPanel.css): las cotas se dibujan recién con el panel
// quieto, primero el ancho y después el alto.
const OPEN_MS = 0.45;
const COTA_STEP = 0.35;

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProductDetailPanel({ product, materialOptions, onClose }) {
  const isOpen = !!product;
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  // Mientras sale, el panel sigue mostrando el último producto (si no, se vaciaría al cerrar).
  const [shown, setShown] = useState(product);
  if (product && product !== shown) setShown(product);

  // Foco, Escape, focus trap y scroll del body bloqueado mientras está abierto. Al cerrar, el
  // foco vuelve a lo que lo abrió (el "Ver detalle" de la card).
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  const p = shown;
  const nombre = p ? nombreProducto(p) : '';
  const ancho = p && hasMm(p.ancho_mm) ? p.ancho_mm : null;
  const alto = p && hasMm(p.alto_mm) ? p.alto_mm : null;
  const profundidad = p && hasMm(p.profundidad_mm) ? p.profundidad_mm : null;
  const conCotas = ancho != null || alto != null;
  const materiales = p ? materialLabels(p, materialOptions) : [];

  // Ficha: solo filas con dato real. Sin medidas en mm, cae al texto libre de `medidas`.
  const ficha = p
    ? [
        ['Ancho', ancho != null && mm(ancho)],
        ['Alto', alto != null && mm(alto)],
        ['Profundidad', profundidad != null && mm(profundidad)],
        ['Medidas orientativas', ancho == null && alto == null && profundidad == null && p.medidas],
        [materiales.length > 1 ? 'Materiales' : 'Material', materiales.join(', ')],
        ['Categoría', p.categoria],
        ['Precio', tienePrecioVisible(p) ? `$${Number(p.precio).toLocaleString('es-AR')}` : 'A consultar'],
      ].filter(([, v]) => v)
    : [];

  const waHref = p
    ? buildWhatsAppUrl({
        mensaje: `¡Hola Don Teófilo! Me interesa el producto "${nombre}" (${p.categoria}). ¿Me pasan más info y presupuesto?`,
      })
    : '#';

  return (
    <>
      <div className={`catalog-backdrop${isOpen ? ' open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className={`catalog-panel${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-panel-name"
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : ''}
      >
        {p && (
          <div className="catalog-panel-scroll">
            <button ref={closeRef} type="button" className="catalog-panel-close" onClick={onClose} aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {conCotas ? (
              // Lámina de plano: imagen con la cota de ancho debajo y la de alto a la derecha.
              <figure className="catalog-panel-figure" key={isOpen ? p.id : 'cerrado'}>
                <div className="catalog-panel-hero catalog-panel-hero--drawn">
                  {p.imagen && <img src={p.imagen} alt="" />}
                </div>
                {alto != null && (
                  <Cota
                    orientation="vertical"
                    label={mm(alto)}
                    informative
                    draw="mount"
                    delay={OPEN_MS + (ancho != null ? COTA_STEP : 0)}
                    className="catalog-panel-cota-alto"
                  />
                )}
                {ancho != null && (
                  <Cota
                    label={mm(ancho)}
                    informative
                    draw="mount"
                    delay={OPEN_MS}
                    className="catalog-panel-cota-ancho"
                  />
                )}
              </figure>
            ) : (
              <div className="catalog-panel-hero">{p.imagen && <img src={p.imagen} alt="" />}</div>
            )}

            <div className="catalog-panel-body">
              <div className="catalog-panel-cat">{p.categoria}</div>
              <h2 id="catalog-panel-name" className="catalog-panel-name">
                {nombre}
              </h2>
              {p.descripcion && <p className="catalog-panel-desc">{p.descripcion}</p>}

              <h3 className="catalog-panel-spec-label">Ficha técnica</h3>
              <dl className="catalog-panel-specs">
                {ficha.map(([label, value]) => (
                  <div key={label} className="catalog-panel-spec-row">
                    <dt>{label}</dt>
                    <dd className={/mm$|^\$/.test(value) ? 'tabular' : undefined}>{value}</dd>
                  </div>
                ))}
              </dl>

              <WhatsAppButton href={waHref} variant="primary" block>
                Consultar por este producto
              </WhatsAppButton>
              <p className="catalog-panel-note">
                Te respondemos en menos de 24hs · Presupuesto sin compromiso
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
