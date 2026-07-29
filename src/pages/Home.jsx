import HeroSlider from '../components/home/HeroSlider';
import ServicesGrid from '../components/home/ServicesGrid';
import FeaturedProject from '../components/home/FeaturedProject';
import ProcessSteps from '../components/home/ProcessSteps';
import Testimonials from '../components/home/Testimonials';
import CTABanner from '../components/home/CTABanner';
import InstagramStrip from '../components/home/InstagramStrip';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ServicesGrid />
      <FeaturedProject />
      <ProcessSteps />
      <Testimonials />
      <CTABanner />
      <InstagramStrip />
    </>
  );
}
