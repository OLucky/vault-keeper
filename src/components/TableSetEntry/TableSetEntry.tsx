import { useCallback, useState } from 'react'
import { Button } from 'react-aria-components'
import { useQueryClient } from '@tanstack/react-query'
import type { GeneratedResult, TableSet } from '../../lib/types'
import { rollTableSet, rerollFieldWithTriggers } from '../../lib/rolling'
import { tableSetQueryOptions } from '../../lib/loader'
import { useRollStore } from '../../stores/rollStore'
import { ResultCard } from '../ResultCard/ResultCard'
import styles from './TableSetEntry.module.css'

const EMPTY_RESULTS: GeneratedResult[] = []

interface TableSetEntryProps {
  tableSet: TableSet
  categoryId: string
  fileName?: string
}

export function TableSetEntry({ tableSet, categoryId, fileName = '' }: TableSetEntryProps) {
  const storeKey = `${categoryId}/${fileName}`
  const addRoll = useRollStore((s) => s.addRoll)
  const rerollField = useRollStore((s) => s.rerollField)
  const stackedResults = useRollStore(
    useCallback(
      (s: { stackedResults: Record<string, GeneratedResult[]> }) =>
        s.stackedResults[storeKey] ?? EMPTY_RESULTS,
      [storeKey],
    ),
  )

  const queryClient = useQueryClient()
  const [isRolling, setIsRolling] = useState(false)

  const fetchTableSetFn = async (catId: string, file: string): Promise<TableSet> => {
    return queryClient.fetchQuery(tableSetQueryOptions(catId, file))
  }

  const handleRoll = async () => {
    setIsRolling(true)
    try {
      const result = await rollTableSet(tableSet, categoryId, undefined, fetchTableSetFn, storeKey)
      addRoll(storeKey, result)
    } finally {
      setIsRolling(false)
    }
  }

  const handleFieldReroll = async (resultId: string, fieldIndex: number) => {
    // Find the result to get the field's tableIndex
    const result = stackedResults.find((r) => r.id === resultId)
    if (!result) return
    const field = result.fields[fieldIndex]
    if (!field) return

    const table = tableSet.tables[field.tableIndex]
    if (!table) return

    const newFields = await rerollFieldWithTriggers(
      table,
      field.tableIndex,
      tableSet,
      undefined,
      fetchTableSetFn,
      storeKey,
    )
    rerollField(storeKey, resultId, fieldIndex, newFields)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.entry}>
        <span className={styles.name}>{tableSet.name}</span>
        <Button className={styles.rollButton} onPress={handleRoll} isDisabled={isRolling}>Roll</Button>
      </div>
      {stackedResults.length > 0 && (
        <div className={styles.results}>
          {stackedResults.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              tableSet={tableSet}
              onFieldReroll={handleFieldReroll}
            />
          ))}
        </div>
      )}
    </div>
  )
}
