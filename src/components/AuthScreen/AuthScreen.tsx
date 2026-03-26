import { useState } from "react";
import { TextField, Input, Label, Button } from "react-aria-components";
import { useAuthStore } from "../../stores/authStore";
import styles from "./AuthScreen.module.css";

export function AuthScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = useAuthStore.getState().authenticate(password);
    if (!success) {
      setError("Incorrect password. Try again.");
    }
  };

  const handleChange = (value: string) => {
    setPassword(value);
    if (error) setError("");
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Vault Keeper</h1>
        <p className={styles.tagline}>Enter the password to continue</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField value={password} onChange={handleChange} className={styles.field}>
            <Label className={styles.label}>Password</Label>
            <Input className={styles.input} type="password" placeholder="Enter password" />
          </TextField>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" className={styles.button}>
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
