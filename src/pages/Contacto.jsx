import ContactInfo from '../components/contacto/ContactInfo';
import ContactForm from '../components/contacto/ContactForm';
import './Contacto.css';

export default function Contacto() {
  return (
    <main className="contact-page">
      <ContactInfo />
      <section className="contact-form-section">
        <ContactForm />
      </section>
    </main>
  );
}
