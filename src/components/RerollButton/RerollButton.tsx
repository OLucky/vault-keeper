import { Button } from "react-aria-components";
import styles from "./RerollButton.module.css";

interface RerollButtonProps {
  onReroll: () => void;
  label?: string;
}

export function RerollButton({ onReroll, label = "Re-roll" }: RerollButtonProps) {
  return (
    <Button className={styles.rerollButton} aria-label={label} onPress={onReroll}>
      ↻
    </Button>
  );
}
