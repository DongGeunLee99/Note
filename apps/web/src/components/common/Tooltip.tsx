import { useRef, useState } from 'react'

interface TooltipProps {
  label: string
  children: React.ReactNode
}

/** hover 150ms 후 아이콘 바로 오른쪽에 표시되는 경량 툴팁 (사이드바 아이콘 전용) */
export default function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  function show() {
    timerRef.current = window.setTimeout(() => setVisible(true), 150)
  }

  function hide() {
    window.clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <div className="relative flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span
          className="absolute left-full top-1/2 -translate-y-1/2 ml-1 whitespace-nowrap px-2 py-1 rounded-lg text-[calc(10px*var(--fs))] font-medium z-50 pointer-events-none shadow-lg"
          style={{ background: 'var(--color-text)', color: 'var(--color-surface)' }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
