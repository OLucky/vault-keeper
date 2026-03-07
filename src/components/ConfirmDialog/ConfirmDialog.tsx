import { Dialog, Modal, ModalOverlay, Heading } from 'react-aria-components'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, isOpen }: ConfirmDialogProps) {
  return (
    <ModalOverlay className={styles.overlay} isOpen={isOpen} onOpenChange={(open) => { if (!open) onCancel() }} isDismissable>
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog}>
          <Heading slot="title" className={styles.title}>{title}</Heading>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onCancel} type="button">Cancel</button>
            <button className={styles.confirmButton} onClick={onConfirm} type="button">Clear</button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
