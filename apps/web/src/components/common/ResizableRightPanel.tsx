import { useState, useRef, useCallback } from 'react'

const STORAGE_KEY = 'smartnote_right_panel_width'

interface Props {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export default function ResizableRightPanel({
  children,
  defaultWidth = 192,
  minWidth = 140,
  maxWidth = 480,
}: Props) {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Number(saved) : defaultWidth
  })
  const widthRef = useRef(width)
  const panelRef = useRef<HTMLDivElement>(null)

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rightEdge = panelRef.current!.getBoundingClientRect().right

    function onMouseMove(e: MouseEvent) {
      const next = Math.min(Math.max(rightEdge - e.clientX, minWidth), maxWidth)
      widthRef.current = next
      setWidth(next)
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem(STORAGE_KEY, String(widthRef.current))
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [minWidth, maxWidth])

  return (
    <div ref={panelRef} className="flex flex-shrink-0" style={{ width }}>
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
