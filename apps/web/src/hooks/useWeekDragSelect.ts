import { useState, useRef, useCallback } from 'react'

export interface WeekSel {
  startDay: Date
  endDay:   Date
  startMin: number
  endMin:   number
}

/**
 * Week 뷰 다중일 드래그 선택.
 * - 컬럼 rect는 mousedown 시 1회만 캐싱 (mousemove마다 DOM 조회 방지)
 * - 선택 갱신은 requestAnimationFrame으로 스로틀
 */
export function useWeekDragSelect(weekDates: Date[]) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const isMultiDayRef = useRef(false)
  const dragStartRef  = useRef<{ colIdx: number; minutes: number } | null>(null)
  const colRectsRef   = useRef<DOMRect[]>([])
  const rafRef        = useRef(0)
  const pendingRef    = useRef<{ x: number; y: number } | null>(null)
  const weekSelRef    = useRef<WeekSel | null>(null)
  const [weekSel, setWeekSelState] = useState<WeekSel | null>(null)

  function setWeekSel(v: WeekSel | null) {
    weekSelRef.current = v
    setWeekSelState(v)
  }

  function getColAndTime(x: number, y: number): { colIdx: number; minutes: number } | null {
    const rects = colRectsRef.current
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      if (x >= r.left && x <= r.right) {
        const mins = Math.min(23 * 60, Math.max(0, Math.round(((y - r.top) / r.height) * 1440 / 30) * 30))
        return { colIdx: i, minutes: mins }
      }
    }
    return null
  }

  function applyDrag(x: number, y: number) {
    const start = dragStartRef.current
    if (!start) return
    const cur = getColAndTime(x, y)
    if (!cur) return
    if (cur.colIdx === start.colIdx && cur.minutes === start.minutes) return
    if (cur.colIdx !== start.colIdx) isMultiDayRef.current = true

    const sCol = Math.min(start.colIdx, cur.colIdx)
    const eCol = Math.max(start.colIdx, cur.colIdx)
    const sMin = Math.min(start.minutes, cur.minutes)
    const eMin = Math.min(24 * 60, Math.max(start.minutes, cur.minutes) + 30)

    const prev = weekSelRef.current
    const sDay = weekDates[sCol], eDay = weekDates[eCol]
    if (
      prev &&
      prev.startDay.getTime() === sDay.getTime() && prev.endDay.getTime() === eDay.getTime() &&
      prev.startMin === sMin && prev.endMin === eMin
    ) return

    setWeekSel({
      startDay: new Date(sDay.getFullYear(), sDay.getMonth(), sDay.getDate()),
      endDay:   new Date(eDay.getFullYear(), eDay.getMonth(), eDay.getDate()),
      startMin: sMin,
      endMin:   eMin,
    })
  }

  function onMouseDown(e: React.MouseEvent) {
    const c = containerRef.current
    if (!c) return
    colRectsRef.current = Array.from(c.querySelectorAll<HTMLElement>('.rbc-day-slot'))
      .map(el => el.getBoundingClientRect())
    isMultiDayRef.current = false
    setWeekSel(null)
    dragStartRef.current = getColAndTime(e.clientX, e.clientY)
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragStartRef.current || !(e.buttons & 1)) return
    pendingRef.current = { x: e.clientX, y: e.clientY }
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const p = pendingRef.current
      if (p) applyDrag(p.x, p.y)
    })
  }

  function onMouseUp() {
    dragStartRef.current  = null
    isMultiDayRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }

  /** 다중일 드래그 중에는 rbc 기본 단일 선택을 취소 */
  const handleSelecting = useCallback(() => !isMultiDayRef.current, [])

  return { containerRef, weekSel, onMouseDown, onMouseMove, onMouseUp, handleSelecting }
}
