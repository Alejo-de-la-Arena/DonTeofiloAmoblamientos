import InstagramIcon from '../ui/icons/InstagramIcon';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../../config/contact';
import './InstagramStrip.css';

const TILES = [1, 2, 3, 4, 5, 6];

export default function InstagramStrip() {
  return (
    <section className="instagram">
      <div className="instagram-head">
        <span>
          Seguinos en Instagram ·{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
            {INSTAGRAM_HANDLE}
          </a>
        </span>
      </div>
    </section>
  );
}
