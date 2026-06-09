import Modal from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  confirmDisabled?: boolean
  danger?: boolean
}

export default function ConfirmModal({
  isOpen, onClose, title, children,
  confirmLabel, onConfirm, confirmDisabled, danger,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: danger ? 'var(--color-danger)' : 'var(--color-primary)' }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
