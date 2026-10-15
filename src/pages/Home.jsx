import Hero from '../components/home/Hero';
import ServiceIndex from '../components/home/ServiceIndex';
import BeforeAfterHome from '../components/home/BeforeAfterHome';
import ProcessTape from '../components/home/ProcessTape';
import Testimonial from '../components/home/Testimonial';
import CtaPlano from '../components/home/CtaPlano';
import DelTaller from '../components/home/DelTaller';

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceIndex />
      <BeforeAfterHome />
      <ProcessTape />
      <Testimonial />
      <DelTaller />
      <CtaPlano />
    </>
  );
}
