import { useState } from 'react'
import type { SavedResult } from '../../stores/savedResultsStore'
import { useSavedResultsStore } from '../../stores/savedResultsStore'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { InlineNoteEditor } from '../InlineNoteEditor/InlineNoteEditor'
import styles from './SavedResultCard.module.css'

interface SavedResultCardProps {
  result: SavedResult
}

export function SavedResultCard({ result }: SavedResultCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.fields}>
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
          </div>
        ))}
        <InlineNoteEditor resultId={result.id} note={result.note} />
      </div>
      <button
        className={styles.deleteButton}
        onClick={() => setShowDeleteConfirm(true)}
        type="button"
        aria-label="Remove saved result"
      >
        &times;
      </button>
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Remove Saved Result"
          message="Remove this result from your saved collection?"
          confirmLabel="Remove"
          isOpen={showDeleteConfirm}
          onConfirm={() => { useSavedResultsStore.getState().removeResult(result.id); setShowDeleteConfirm(false) }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
