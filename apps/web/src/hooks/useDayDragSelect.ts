import { useState, useRef } from 'react'

export interface DaySel {
  startMin: number // 0~1440, 30분 단위
  endMin: number
}

const HALF_DAY_MIN = 720

/**
 * Day 뷰 드래그 선택.
 * AM/PM 두 컬럼을 하나의 타임라인(0~1440분)으로 합산해,
 * 컬럼을 넘는 드래그가 정오를 지나는 연속 범위가 되게 한다.
 * - 컬럼 rect는 mousedown 시 1회만 캐싱 (useWeekDragSelect와 동일 패턴)
 * - 선택 갱신은 requestAnimationFrame으로 스로틀
 */
export function useDayDragSelect(onSelectEnd?: (sel: DaySel) => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<number | null>(null)
  const colRectsRef  = useRef<DOMRect[]>([])
  const rafRef       = useRef(0)
  const pendingRef   = useRef<{ x: number; y: number } | null>(null)
  const daySelRef    = useRef<DaySel | null>(null)
  const [daySel, setDaySelState] = useState<DaySel | null>(null)

  function setDaySel(v: DaySel | null) {
    daySelRef.current = v
    setDaySelState(v)
  }

  /** (x,y) → 절대분. AM 컬럼 = 0~720, PM 컬럼 = 720~1440 */
  function getAbsMinutes(x: number, y: number): number | null {
    const rects = colRectsRef.current
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      if (x >= r.left && x <= r.right) {
        const within = Math.min(
          HALF_DAY_MIN - 30,
          Math.max(0, Math.round(((y - r.top) / r.height) * HALF_DAY_MIN / 30) * 30),
        )
        return i * HALF_DAY_MIN + within
      }
    }
    return null
  }

  function applyDrag(x: number, y: number) {
    const start = dragStartRef.current
    if (start === null) return
    const cur = getAbsMinutes(x, y)
    if (cur === null) return

    const sMin = Math.min(start, cur)
    const eMin = Math.min(24 * 60, Math.max(start, cur) + 30)

    const prev = daySelRef.current
    if (prev && prev.startMin === sMin && prev.endMin === eMin) return
    setDaySel({ startMin: sMin, endMin: eMin })
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return // 우클릭은 선택 유지 (컨텍스트 메뉴에서 사용)
    const c = containerRef.current
    if (!c) return
    colRectsRef.current = Array.from(c.querySelectorAll<HTMLElement>('.day-grid'))
      .map(el => el.getBoundingClientRect())
    setDaySel(null)
    dragStartRef.current = getAbsMinutes(e.clientX, e.clientY)
  }

  function onMouseMove(e: React.MouseEvent) {
    if (dragStartRef.current === null || !(e.buttons & 1)) return
    pendingRef.current = { x: e.clientX, y: e.clientY }
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const p = pendingRef.current
      if (p) applyDrag(p.x, p.y)
    })
  }

  function onMouseUp() {
    if (dragStartRef.current === null) return
    dragStartRef.current = null
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    if (daySelRef.current) onSelectEnd?.(daySelRef.current)
  }

  function clearDaySel() {
    setDaySel(null)
  }

  return { containerRef, daySel, onMouseDown, onMouseMove, onMouseUp, clearDaySel }
}
