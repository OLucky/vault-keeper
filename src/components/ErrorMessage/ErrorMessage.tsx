import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div role="alert" className={styles.error}>
      {message}
    </div>
  );
}
