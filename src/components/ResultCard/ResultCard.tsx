import { useState } from 'react'
import type { GeneratedResult, TableSet } from '../../lib/types'
import { RerollButton } from '../RerollButton/RerollButton'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import styles from './ResultCard.module.css'

interface ResultCardProps {
  result: GeneratedResult
  tableSet?: TableSet
  onFieldReroll?: (resultId: string, fieldIndex: number) => void
  isSaved?: boolean
  onSave?: (resultId: string) => void
  onUnsave?: (resultId: string) => void
}

export function ResultCard({ result, tableSet, onFieldReroll, isSaved, onSave, onUnsave }: ResultCardProps) {
  const [showUnsaveConfirm, setShowUnsaveConfirm] = useState(false)

  return (
    <div className={styles.card}>
      {(onSave || onUnsave) && (
        <button
          className={`${styles.bookmark}${isSaved ? ` ${styles.bookmarkSaved}` : ''}`}
          onClick={() => isSaved ? setShowUnsaveConfirm(true) : onSave?.(result.id)}
          type="button"
          aria-label={isSaved ? 'Unsave result' : 'Save result'}
        >
          {isSaved ? '\u2605' : '\u2606'}
        </button>
      )}
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
      {showUnsaveConfirm && (
        <ConfirmDialog
          title="Remove Saved Result"
          message="Remove this result from your saved collection?"
          confirmLabel="Remove"
          isOpen={showUnsaveConfirm}
          onConfirm={() => { onUnsave?.(result.id); setShowUnsaveConfirm(false) }}
          onCancel={() => setShowUnsaveConfirm(false)}
        />
      )}
    </div>
  )
}
