import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconChevronDown } from '@tabler/icons-react'

export interface SelectOption<T extends string | number> {
  value: T
  label: ReactNode
}

interface SelectProps<T extends string | number> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  /** 트리거 버튼 클래스 (크기·패딩·폰트 등 기존 select와 동일하게 전달) */
  className?: string
  ariaLabel?: string
}

interface Pos { left: number; width: number; top: number; bottomOffset: number; maxHeight: number; openUp: boolean }

/** 테마 추종 커스텀 셀렉트. 목록은 포털 + fixed로 띄워 모달/스크롤 영역에 안 잘리고, 아래 공간이 좁으면 위로 펼침. */
export default function Select<T extends string | number>({
  value, options, onChange, className = '', ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useLayoutEffect(() => {
    if (!open) return
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const gap = 4
    const spaceBelow = window.innerHeight - r.bottom
    const spaceAbove = r.top
    const desired = Math.min(240, options.length * 28 + 8)
    const openUp = spaceBelow < desired && spaceAbove > spaceBelow
    const maxHeight = Math.max(80, Math.min(desired, (openUp ? spaceAbove : spaceBelow) - gap - 4))
    setPos({
      left: r.left,
      width: r.width,
      top: r.bottom + gap,
      bottomOffset: window.innerHeight - r.top + gap,
      maxHeight,
      openUp,
    })
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    function onDocDown(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    function onScroll(e: Event) {
      // 목록 내부 스크롤은 무시, 바깥(페이지/모달) 스크롤이면 닫음
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    function onResize() { setOpen(false) }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center justify-between gap-1 ${className}`}
        style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text)', background: 'var(--color-surface)' }}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <IconChevronDown size={12} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
      </button>

      {open && pos && createPortal(
        <div
          ref={listRef}
          className="fixed z-[200] rounded-md border overflow-auto py-1 shadow-lg"
          style={{
            left: pos.left,
            top: pos.openUp ? undefined : pos.top,
            bottom: pos.openUp ? pos.bottomOffset : undefined,
            minWidth: pos.width,
            maxHeight: pos.maxHeight,
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border-2)',
          }}
        >
          {options.map(o => {
            const isSel = o.value === value
            return (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="block w-full text-left px-2.5 py-1 text-[11px] hover-tint"
                style={{
                  color: isSel ? 'var(--color-primary)' : 'var(--color-text)',
                  background: isSel ? 'var(--color-primary-subtle)' : undefined,
                  fontWeight: isSel ? 600 : 400,
                }}
              >
                {o.label}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}
