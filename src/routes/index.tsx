import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button, GridList, GridListItem, useDragAndDrop } from 'react-aria-components'
import { manifestQueryOptions, categoryQueryOptions } from '../lib/loader'
import { CategoryCard } from '../components/CategoryCard/CategoryCard'
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage'
import { useRollStore } from '../stores/rollStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { ResultCard } from '../components/ResultCard/ResultCard'
import { PinnedTableCard } from '../components/PinnedTableCard/PinnedTableCard'
import styles from './Dashboard.module.css'

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const manifest = await queryClient.ensureQueryData(manifestQueryOptions())
    await Promise.all(
      manifest.categories.map((categoryId) =>
        queryClient.ensureQueryData(categoryQueryOptions(categoryId)),
      ),
    )
  },
  component: Dashboard,
})

function CategoryCardFromId({ categoryId }: { categoryId: string }) {
  const { data, isError, error } = useQuery(categoryQueryOptions(categoryId))
  if (isError) {
    return <ErrorMessage message={`Failed to load category "${categoryId}": ${error?.message}`} />
  }
  if (!data || data.tableSets.length === 0) {
    return null
  }
  return <CategoryCard categoryId={categoryId} name={data.name} />
}

function PinnedSection({ pinnedTableSets }: { pinnedTableSets: ReturnType<typeof useFavoritesStore.getState>['pinnedTableSets'] }) {
  const itemsWithIds = pinnedTableSets.map((item) => ({
    ...item,
    id: `${item.categoryId}/${item.fileName}`,
  }))

  const { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => ({
        'text/plain': String(key),
      }))
    },
    onReorder(e) {
      const reorder = useFavoritesStore.getState().reorder
      const items = [...pinnedTableSets]
      const movedKeys = [...e.keys].map(String)

      const movedItems = items.filter((item) =>
        movedKeys.includes(`${item.categoryId}/${item.fileName}`),
      )
      const remaining = items.filter(
        (item) => !movedKeys.includes(`${item.categoryId}/${item.fileName}`),
      )

      const targetKey = String(e.target.key)
      let targetIndex = remaining.findIndex(
        (item) => `${item.categoryId}/${item.fileName}` === targetKey,
      )

      if (e.target.dropPosition === 'after') {
        targetIndex++
      }

      remaining.splice(targetIndex, 0, ...movedItems)
      reorder(remaining)
    },
  })

  return (
    <section className={styles.section}>
      <h2>Pinned</h2>
      <GridList
        aria-label="Pinned table sets"
        items={itemsWithIds}
        dragAndDropHooks={dragAndDropHooks}
        className={styles.pinnedGrid}
        renderEmptyState={() => null}
      >
        {(item) => (
          <GridListItem
            id={item.id}
            textValue={item.tableSetName}
            className={styles.pinnedGridItem}
          >
            <Button slot="drag" className={styles.dragHandle} aria-label="Reorder">⠿</Button>
            <PinnedTableCard
              categoryId={item.categoryId}
              fileName={item.fileName}
              tableSetName={item.tableSetName}
              categoryName={item.categoryName}
            />
          </GridListItem>
        )}
      </GridList>
    </section>
  )
}

function Dashboard() {
  const manifestQuery = useQuery(manifestQueryOptions())
  const recentRolls = useRollStore((state) => state.recentRolls)
  const pinnedTableSets = useFavoritesStore((state) => state.pinnedTableSets)

  if (manifestQuery.isError) {
    return (
      <div>
        <h1>Dashboard</h1>
        <ErrorMessage message={`Failed to load categories: ${manifestQuery.error.message}`} />
      </div>
    )
  }

  const categories = manifestQuery.data?.categories ?? []

  return (
    <div>
      <h1>Dashboard</h1>
      <p className={styles.subtitle}>
        Welcome to Vault Keeper — your Vaults of Vaarn GM companion.
      </p>

      <section className={styles.section}>
        <h2>Tools</h2>
        <div className={styles.categoriesGrid}>
          <Link to="/weather" className={styles.toolCard}>
            <span className={styles.toolName}>Weather Simulator</span>
            <span className={styles.toolDescription}>Track Vaarn's weather hex chart</span>
          </Link>
        </div>
      </section>

      {pinnedTableSets.length > 0 && (
        <PinnedSection pinnedTableSets={pinnedTableSets} />
      )}

      <section className={styles.section}>
        <h2>Categories</h2>
        <div className={styles.categoriesGrid}>
          {categories.map((categoryId) => (
            <CategoryCardFromId key={categoryId} categoryId={categoryId} />
          ))}
        </div>
      </section>

      {recentRolls.length > 0 && (
        <section className={styles.section}>
          <h2>Recent Rolls</h2>
          <div className={styles.recentList}>
            {recentRolls.map((result) => (
              <div key={result.id} className={styles.recentItem}>
                <h3 className={styles.recentItemName}>{result.tableSetName}</h3>
                <ResultCard result={result} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
