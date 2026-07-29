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
      <div className="instagram-grid">
        {TILES.map((n) => (
          <a
            key={n}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener"
            className={`ig-tile ig-tile--${n}`}
          >
            <span className="ig-icon">
              <InstagramIcon size={26} stroke="#fff" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
