import { Link } from "@tanstack/react-router";
import { useFavoritesStore } from "../../stores/favoritesStore";
import styles from "./PinnedTableCard.module.css";

interface PinnedTableCardProps {
  categoryId: string;
  fileName: string;
  tableSetName: string;
  categoryName: string;
}

export function PinnedTableCard({
  categoryId,
  fileName,
  tableSetName,
  categoryName,
}: PinnedTableCardProps) {
  const removePinned = useFavoritesStore((state) => state.removePinned);

  return (
    <Link to="/$categoryId" params={{ categoryId }} className={styles.card}>
      <button
        type="button"
        className={styles.unpinButton}
        aria-label={`Unpin ${tableSetName}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removePinned(categoryId, fileName);
        }}
      >
        &times;
      </button>
      <div className={styles.name}>{tableSetName}</div>
      <div className={styles.category}>{categoryName}</div>
    </Link>
  );
}
