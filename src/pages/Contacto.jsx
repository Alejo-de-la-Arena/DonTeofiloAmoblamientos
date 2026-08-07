import ContactInfo from '../components/contacto/ContactInfo';
import ContactForm from '../components/contacto/ContactForm';
import './Contacto.css';

export default function Contacto() {
  return (
    <main className="contact-page">
      <span className="contact-page-corner contact-page-corner--tl" aria-hidden="true"></span>
      <span className="contact-page-corner contact-page-corner--tr" aria-hidden="true"></span>
      <span className="contact-page-corner contact-page-corner--br" aria-hidden="true"></span>
      <span className="contact-page-seam" aria-hidden="true">
        <span className="contact-page-seam-ticks"></span>
      </span>
      <ContactInfo />
      <section className="contact-form-section">
        <ContactForm />
      </section>
    </main>
  );
}
