import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] rounded-lg border shadow-lg py-1 overflow-hidden"
      style={{
        top: y,
        left: x,
        minWidth: 144,
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border-2)',
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose() }}
          className="w-full flex items-center gap-2 px-3 py-2 text-[calc(11px*var(--fs))] text-left hover-tint transition-colors"
          style={{ color: item.danger ? 'var(--color-danger)' : 'var(--color-text)' }}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  )
}

export function useContextMenu() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  function open(e: React.MouseEvent) {
    e.preventDefault()
    const menuW = 160
    const menuH = 44 * 3
    setMenu({
      x: e.clientX + menuW > window.innerWidth ? e.clientX - menuW : e.clientX,
      y: e.clientY + menuH > window.innerHeight ? e.clientY - menuH : e.clientY,
    })
  }

  function close() { setMenu(null) }

  return { menu, open, close }
}
