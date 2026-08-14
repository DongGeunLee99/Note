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
  /** X 버튼 왼쪽에 넣을 커스텀 요소 (예: 되돌리기/다시하기 버튼) */
  headerExtra?: React.ReactNode
  /** title 텍스트 대신 헤더 자리에 넣을 커스텀 요소 (예: 편집 가능한 제목 입력창) */
  titleContent?: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children, footer, widthClass = 'w-72', headerExtra, titleContent }: ModalProps) {
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
          {titleContent ?? <span className="text-[calc(12px*var(--fs))] font-medium">{title}</span>}
          <div className="flex items-center gap-1">
            {headerExtra}
            <button onClick={onClose} className="p-0.5 rounded hover-tint transition-colors">
              <IconX size={14} style={{ color: 'var(--color-muted)' }} />
            </button>
          </div>
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
