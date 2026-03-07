import type { GeneratedResult, TableSet } from '../../lib/types'
import { RerollButton } from '../RerollButton/RerollButton'
import styles from './ResultCard.module.css'

interface ResultCardProps {
  result: GeneratedResult
  tableSet?: TableSet
  onFieldReroll?: (resultId: string, fieldIndex: number) => void
}

export function ResultCard({ result, tableSet, onFieldReroll }: ResultCardProps) {
  return (
    <div className={styles.card}>
      {result.fields.map((field, index) => (
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
          {!field.error && !field.triggered && onFieldReroll && tableSet && (
            <RerollButton
              onReroll={() => onFieldReroll(result.id, index)}
              label={`Re-roll ${field.tableName}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
