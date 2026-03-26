import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSavedResultsStore } from "../stores/savedResultsStore";
import type { SavedResult } from "../stores/savedResultsStore";
import { formatSavedResultsAsText } from "../lib/exportSavedResults";
import { SavedResultCard } from "../components/SavedResultCard/SavedResultCard";
import styles from "./Saved.module.css";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const savedResults = useSavedResultsStore((s) => s.savedResults);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatSavedResultsAsText(savedResults);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatSavedResultsAsText(savedResults);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved-results.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const groups = useMemo(() => {
    const groupMap = new Map<
      string,
      {
        categoryName: string;
        tableSetName: string;
        entries: SavedResult[];
        latestTimestamp: number;
      }
    >();

    for (const result of savedResults) {
      const key = `${result.categoryId}/${result.tableSetName}`;
      const existing = groupMap.get(key);
      if (existing) {
        existing.entries.push(result);
        if (result.savedAt > existing.latestTimestamp) {
          existing.latestTimestamp = result.savedAt;
        }
      } else {
        groupMap.set(key, {
          categoryName: result.categoryName,
          tableSetName: result.tableSetName,
          entries: [result],
          latestTimestamp: result.savedAt,
        });
      }
    }

    const result = Array.from(groupMap.entries()).map(([key, group]) => ({
      key,
      ...group,
      entries: group.entries.sort((a, b) => b.savedAt - a.savedAt),
    }));

    return result.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [savedResults]);

  return (
    <div>
      <div className={styles.header}>
        <h1>Saved Results</h1>
        {savedResults.length > 0 && (
          <div className={styles.actions}>
            <button className={styles.actionButton} onClick={handleCopy} type="button">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button className={styles.actionButton} onClick={handleDownload} type="button">
              Download
            </button>
          </div>
        )}
      </div>
      {savedResults.length === 0 ? (
        <p className={styles.empty}>No saved results yet. Use the bookmark icon to save results.</p>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <div key={group.key} className={styles.group}>
              <div className={styles.groupHeading}>
                {group.categoryName} &mdash; {group.tableSetName}
              </div>
              <div className={styles.entries}>
                {group.entries.map((entry) => (
                  <SavedResultCard key={entry.id} result={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
