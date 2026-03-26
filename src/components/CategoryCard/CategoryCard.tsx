import { Link } from "@tanstack/react-router";
import styles from "./CategoryCard.module.css";

interface CategoryCardProps {
  name: string;
  categoryId: string;
}

export function CategoryCard({ name, categoryId }: CategoryCardProps) {
  return (
    <Link to="/$categoryId" params={{ categoryId }} className={styles.card}>
      <span className={styles.name}>{name}</span>
    </Link>
  );
}
