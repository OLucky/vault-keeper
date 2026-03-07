import type { SessionLogEntry as SessionLogEntryType } from '../../stores/sessionLogStore'
import styles from './SessionLogEntry.module.css'

interface SessionLogEntryProps {
  entry: SessionLogEntryType
  onDelete: (id: string) => void
}

export function SessionLogEntry({ entry, onDelete }: SessionLogEntryProps) {
  return (
    <div className={styles.entry}>
      <div className={styles.fields}>
        {entry.fields.map((field, index) => (
          <div key={index} className={`${styles.field}${field.triggered ? ` ${styles.triggered}` : ''}`}>
            <span className={styles.label}>{field.tableName}:</span>{' '}
            {field.error ? (
              <span className={styles.error}>{field.error}</span>
            ) : (
              <span className={styles.value}>
                {field.entry.title}
                {field.entry.description && (
                  <span className={styles.description}>
                    {' '}
                    &mdash; {field.entry.description}
                  </span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      <button
        className={styles.deleteButton}
        onClick={() => onDelete(entry.id)}
        type="button"
        aria-label="Remove entry"
      >
        &times;
      </button>
    </div>
  )
}
