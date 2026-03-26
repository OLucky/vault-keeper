import type { SessionLogEntry as SessionLogEntryType } from "../../stores/sessionLogStore";
import { SessionLogEntry } from "./SessionLogEntry";
import styles from "./SessionLogGroup.module.css";

interface SessionLogGroupProps {
  categoryName: string;
  tableSetName: string;
  entries: SessionLogEntryType[];
  onDeleteEntry: (id: string) => void;
}

export function SessionLogGroup({
  categoryName,
  tableSetName,
  entries,
  onDeleteEntry,
}: SessionLogGroupProps) {
  return (
    <div className={styles.group}>
      <div className={styles.heading}>
        {categoryName} — {tableSetName}
      </div>
      <div className={styles.entries}>
        {entries.map((entry) => (
          <SessionLogEntry key={entry.id} entry={entry} onDelete={onDeleteEntry} />
        ))}
      </div>
    </div>
  );
}
