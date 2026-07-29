import WorkHero from '../components/como-trabajamos/WorkHero';
import ProcessTimeline from '../components/como-trabajamos/ProcessTimeline';
import MaterialsScroller from '../components/como-trabajamos/MaterialsScroller';
import QuoteStats from '../components/como-trabajamos/QuoteStats';
import WorkshopStory from '../components/como-trabajamos/WorkshopStory';
import WorkCTA from '../components/como-trabajamos/WorkCTA';

export default function ComoTrabajamos() {
  return (
    <>
      <WorkHero />
      <ProcessTimeline />
      <MaterialsScroller />
      <QuoteStats />
      <WorkshopStory />
      <WorkCTA />
    </>
  );
}
