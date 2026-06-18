import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** 본문 폭 Tailwind 클래스. 기본 w-72(288px) */
  widthClass?: string
}

export default function Modal({ isOpen, onClose, title, children, footer, widthClass = 'w-72' }: ModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.2)' }}
      onClick={onClose}
    >
      <div
        className={`${widthClass} rounded-xl shadow-lg border`}
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-[calc(12px*var(--fs))] font-medium">{title}</span>
          <button onClick={onClose} className="p-0.5 rounded hover-tint transition-colors">
            <IconX size={14} style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>

        <div className="px-4 py-3.5">{children}</div>

        {footer && (
          <div
            className="flex justify-end gap-1.5 px-4 py-2.5 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
