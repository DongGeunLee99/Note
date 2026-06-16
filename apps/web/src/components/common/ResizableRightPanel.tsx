import { useState, useRef, useCallback } from 'react'

// 비율(px → ratio) 전환에 맞춰 새 키 사용. 옛 px 값(smartnote_right_panel_width)은 무시.
const STORAGE_KEY = 'smartnote_right_panel_ratio'

interface Props {
  children: React.ReactNode
  /** 뷰포트 너비 대비 비율 (0~1) */
  defaultRatio?: number
  minRatio?: number
  /** 테스트하며 조정할 최대 비율 — 이 값만 바꾸면 됨 */
  maxRatio?: number
}

export default function ResizableRightPanel({
  children,
  defaultRatio = 0.15,
  minRatio = 0.12,
  maxRatio = 0.45,
}: Props) {
  const [ratio, setRatio] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    if (!saved || Number.isNaN(saved)) return defaultRatio
    return Math.min(Math.max(saved, minRatio), maxRatio)
  })
  const ratioRef = useRef(ratio)
  const panelRef = useRef<HTMLDivElement>(null)

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rightEdge = panelRef.current!.getBoundingClientRect().right

    function onMouseMove(e: MouseEvent) {
      const next = Math.min(Math.max((rightEdge - e.clientX) / window.innerWidth, minRatio), maxRatio)
      ratioRef.current = next
      setRatio(next)
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem(STORAGE_KEY, String(ratioRef.current))
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [minRatio, maxRatio])

  return (
    <div ref={panelRef} className="flex flex-shrink-0" style={{ width: `${ratio * 100}vw` }}>
      <div
        className="w-1 flex-shrink-0 cursor-col-resize transition-colors"
        style={{ background: 'var(--color-border)' }}
        onMouseDown={startResize}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-border)')}
      />
      <div className="flex-1 overflow-auto min-w-0">
        {children}
      </div>
    </div>
  )
}
