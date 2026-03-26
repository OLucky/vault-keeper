import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoryQueryOptions, tableSetQueryOptions } from "../lib/loader";
import { TableSetEntry } from "../components/TableSetEntry/TableSetEntry";
import { FilterInput } from "../components/FilterInput/FilterInput";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { useRollStore } from "../stores/rollStore";
import styles from "./CategoryPage.module.css";

export const Route = createFileRoute("/$categoryId")({
  loader: async ({ context: { queryClient }, params: { categoryId } }) => {
    const categoryIndex = await queryClient.ensureQueryData(categoryQueryOptions(categoryId));
    await Promise.allSettled(
      categoryIndex.tableSets.map((fileName) =>
        queryClient.ensureQueryData(tableSetQueryOptions(categoryId, fileName)),
      ),
    );
  },
  component: CategoryPage,
});

function TableSetItem({
  categoryId,
  fileName,
  categoryName,
}: {
  categoryId: string;
  fileName: string;
  categoryName: string;
}) {
  const { data, isError, error } = useQuery(tableSetQueryOptions(categoryId, fileName));
  if (isError) {
    return <ErrorMessage message={`Failed to load table set "${fileName}": ${error?.message}`} />;
  }
  if (!data) {
    return null;
  }
  return (
    <TableSetEntry
      tableSet={data}
      categoryId={categoryId}
      fileName={fileName}
      categoryName={categoryName}
    />
  );
}

function CategoryPage() {
  const { categoryId } = Route.useParams();
  const [filter, setFilter] = useState("");
  const clearStacked = useRollStore((s) => s.clearStacked);

  useEffect(() => {
    return () => {
      clearStacked(categoryId);
    };
  }, [categoryId, clearStacked]);

  const categoryQuery = useQuery(categoryQueryOptions(categoryId));

  if (categoryQuery.isError) {
    return (
      <div>
        <Link to="/" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
        <h1>Error</h1>
        <ErrorMessage message={`Failed to load category: ${categoryQuery.error.message}`} />
      </div>
    );
  }

  const categoryIndex = categoryQuery.data;
  const categoryName = categoryIndex?.name ?? categoryId;
  const allTableSets = categoryIndex?.tableSets ?? [];

  return (
    <div>
      <Link to="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>
      <h1 className={styles.heading}>{categoryName}</h1>

      <div className={styles.filterWrapper}>
        <FilterInput value={filter} onChange={setFilter} placeholder="Search table sets..." />
      </div>

      <div className={styles.tableSetList}>
        {allTableSets.map((fileName) => (
          <FilteredTableSetItem
            key={fileName}
            categoryId={categoryId}
            fileName={fileName}
            filter={filter}
            categoryName={categoryName}
          />
        ))}
      </div>
    </div>
  );
}

function FilteredTableSetItem({
  categoryId,
  fileName,
  filter,
  categoryName,
}: {
  categoryId: string;
  fileName: string;
  filter: string;
  categoryName: string;
}) {
  const { data } = useQuery(tableSetQueryOptions(categoryId, fileName));
  if (filter && data) {
    const matches = data.name.toLowerCase().includes(filter.toLowerCase());
    if (!matches) {
      return null;
    }
  }
  if (filter && !data) {
    return null;
  }
  return <TableSetItem categoryId={categoryId} fileName={fileName} categoryName={categoryName} />;
}
