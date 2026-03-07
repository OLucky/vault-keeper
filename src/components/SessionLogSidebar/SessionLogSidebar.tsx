import { useMemo, useState } from 'react'
import { formatSessionLogAsText } from '../../lib/exportSessionLog'
import type { SessionLogEntry as SessionLogEntryType } from '../../stores/sessionLogStore'
import { useSessionLogStore } from '../../stores/sessionLogStore'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { SessionLogGroup } from './SessionLogGroup'
import styles from './SessionLogSidebar.module.css'

export function SessionLogSidebar() {
  const entries = useSessionLogStore((s) => s.entries)
  const removeEntry = useSessionLogStore((s) => s.removeEntry)
  const clearAll = useSessionLogStore((s) => s.clearAll)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = formatSessionLogAsText(entries)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = formatSessionLogAsText(entries)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'session-log.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const groups = useMemo(() => {
    const groupMap = new Map<
      string,
      { categoryName: string; tableSetName: string; entries: SessionLogEntryType[]; latestTimestamp: number }
    >()

    for (const entry of entries) {
      const key = `${entry.categoryId}/${entry.tableSetName}`
      const existing = groupMap.get(key)
      if (existing) {
        existing.entries.push(entry)
        if (entry.timestamp > existing.latestTimestamp) {
          existing.latestTimestamp = entry.timestamp
        }
      } else {
        groupMap.set(key, {
          categoryName: entry.categoryName,
          tableSetName: entry.tableSetName,
          entries: [entry],
          latestTimestamp: entry.timestamp,
        })
      }
    }

    const result = Array.from(groupMap.entries()).map(([key, group]) => ({
      key,
      ...group,
      entries: group.entries.sort((a, b) => b.timestamp - a.timestamp),
    }))

    return result.sort((a, b) => b.latestTimestamp - a.latestTimestamp)
  }, [entries])

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.title}>Session Log ({entries.length})</span>
            {entries.length > 0 && (
              <button className={styles.clearButton} onClick={() => setShowClearConfirm(true)} type="button">
                Clear
              </button>
            )}
          </div>
          {entries.length > 0 && (
            <div className={styles.headerActions}>
              <button className={styles.actionButton} onClick={handleCopy} type="button">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className={styles.actionButton} onClick={handleDownload} type="button">
                Download
              </button>
            </div>
          )}
        </div>
        <div className={styles.body}>
          {entries.length === 0 ? (
            <p className={styles.empty}>No entries yet. Generate some results to get started.</p>
          ) : (
            groups.map((group) => (
              <SessionLogGroup
                key={group.key}
                categoryName={group.categoryName}
                tableSetName={group.tableSetName}
                entries={group.entries}
                onDeleteEntry={removeEntry}
              />
            ))
          )}
        </div>
      </aside>
      <ConfirmDialog
        title="Clear Session Log"
        message="Clear all logged results? This cannot be undone."
        isOpen={showClearConfirm}
        onConfirm={() => { clearAll(); setShowClearConfirm(false) }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  )
}
