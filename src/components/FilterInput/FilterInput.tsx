import { TextField, Input, Label } from 'react-aria-components'
import styles from './FilterInput.module.css'

interface FilterInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function FilterInput({ value, onChange, placeholder }: FilterInputProps) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      className={styles.field}
    >
      <Label className={styles.label}>Filter</Label>
      <Input
        className={styles.input}
        placeholder={placeholder}
      />
    </TextField>
  )
}
