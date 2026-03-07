import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { manifestQueryOptions, categoryQueryOptions } from '../lib/loader'
import { CategoryCard } from '../components/CategoryCard/CategoryCard'
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage'
import { useRollStore } from '../stores/rollStore'
import { ResultCard } from '../components/ResultCard/ResultCard'
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

function Dashboard() {
  const manifestQuery = useQuery(manifestQueryOptions())
  const recentRolls = useRollStore((state) => state.recentRolls)

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
