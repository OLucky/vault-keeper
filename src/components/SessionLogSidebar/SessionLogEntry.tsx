import { useState } from "react";
import type { SessionLogEntry as SessionLogEntryType } from "../../stores/sessionLogStore";
import { useSavedResultsStore } from "../../stores/savedResultsStore";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
import styles from "./SessionLogEntry.module.css";

interface SessionLogEntryProps {
  entry: SessionLogEntryType;
  onDelete: (id: string) => void;
}

export function SessionLogEntry({ entry, onDelete }: SessionLogEntryProps) {
  const savedResults = useSavedResultsStore((s) => s.savedResults);
  const isSaved = savedResults.some((r) => r.id === entry.id);
  const [showUnsaveConfirm, setShowUnsaveConfirm] = useState(false);

  const entryAsResult = {
    id: entry.id,
    tableSetName: entry.tableSetName,
    categoryName: entry.categoryName,
    fields: entry.fields,
  };

  return (
    <div className={styles.entry}>
      <div className={styles.fields}>
        {entry.fields.map((field, index) => (
          <div
            key={index}
            className={`${styles.field}${field.triggered ? ` ${styles.triggered}` : ""}`}
          >
            <span className={styles.label}>{field.tableName}:</span>{" "}
            {field.error ? (
              <span className={styles.error}>{field.error}</span>
            ) : (
              <span className={styles.value}>
                {field.entry.title}
                {field.entry.description && (
                  <span className={styles.description}> &mdash; {field.entry.description}</span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          className={`${styles.bookmarkButton}${isSaved ? ` ${styles.bookmarkSaved}` : ""}`}
          onClick={() =>
            isSaved
              ? setShowUnsaveConfirm(true)
              : useSavedResultsStore.getState().saveResult(entryAsResult, entry.categoryId)
          }
          type="button"
          aria-label={isSaved ? "Unsave result" : "Save result"}
        >
          {isSaved ? "\u2605" : "\u2606"}
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(entry.id)}
          type="button"
          aria-label="Remove entry"
        >
          &times;
        </button>
      </div>
      {showUnsaveConfirm && (
        <ConfirmDialog
          title="Remove Saved Result"
          message="Remove this result from your saved collection?"
          confirmLabel="Remove"
          isOpen={showUnsaveConfirm}
          onConfirm={() => {
            useSavedResultsStore.getState().removeResult(entry.id);
            setShowUnsaveConfirm(false);
          }}
          onCancel={() => setShowUnsaveConfirm(false)}
        />
      )}
    </div>
  );
}
