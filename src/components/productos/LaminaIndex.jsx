import styles from './LaminaIndex.module.css';

/** Índice de láminas del hero (desktop): no filtra. Click = saltar a esa lámina. */
export default function LaminaIndex({ laminas, active, onSelect }) {
  return (
    <ol className={styles.list} aria-label="Láminas">
      {laminas.map((l, i) => {
        const on = i === active;
        return (
          <li key={l.categoria}>
            <button
              type="button"
              className={`${styles.item} ${on ? styles.on : ''}`.trim()}
              aria-current={on ? 'true' : undefined}
              onClick={() => onSelect(i)}
            >
              <span className={`${styles.num} tabular`} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.name}>{l.categoria}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
