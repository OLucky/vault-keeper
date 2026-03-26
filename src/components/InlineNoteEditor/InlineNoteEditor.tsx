import { useState, useRef } from "react";
import { useSavedResultsStore } from "../../stores/savedResultsStore";
import styles from "./InlineNoteEditor.module.css";

interface InlineNoteEditorProps {
  resultId: string;
  note: string;
}

export function InlineNoteEditor({ resultId, note }: InlineNoteEditorProps) {
  const [value, setValue] = useState(note);
  const lastSaved = useRef(note);

  const save = () => {
    const trimmed = value.trim();
    if (trimmed !== lastSaved.current) {
      useSavedResultsStore.getState().updateNote(resultId, trimmed);
      lastSaved.current = trimmed;
    }
    setValue(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      save();
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  return (
    <div className={styles.container}>
      <textarea
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder="Add a note..."
        rows={1}
        aria-label="Note"
      />
    </div>
  );
}
