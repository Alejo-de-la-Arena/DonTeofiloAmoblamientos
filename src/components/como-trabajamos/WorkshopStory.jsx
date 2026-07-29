import './WorkshopStory.css';

export default function WorkshopStory() {
  return (
    <section className="work-story">
      <div className="work-story-inner">
        <div
          className="work-story-img"
          style={{ backgroundImage: 'url(https://picsum.photos/seed/dtf-taller-historia/700/860)' }}
        />
        <div>
          <div className="section-eyebrow">
            <span className="section-eyebrow-line"></span>
            <span>Desde 2011</span>
          </div>
          <h2 className="work-story-title">Un taller, no una fábrica</h2>
          <p className="work-story-text">
            Empezamos en 2011 con una fresadora prestada y muchas ganas. Hoy somos un equipo chico
            que sigue tratando cada mueble como si fuera para nuestra propia casa.
          </p>
          <p className="work-story-text">
            Nos vas a encontrar en el taller entre el aserrín, tomando medidas o probando una
            bisagra nueva. Ese contacto directo con el oficio es lo que nos diferencia.
          </p>
        </div>
      </div>
    </section>
  );
}
