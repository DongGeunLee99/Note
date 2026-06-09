# LOG_CODE

> 수정 작업 시 변경된 실제 코드 기록. 최신 내역이 위에 위치.
> 형식: 날짜 · 파일 경로 · 변경 내용 (before → after 또는 추가 코드)

---

## 2026-06-09

### · 캘린더 Week 뷰 — 30분 구분선 제거

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 */
/* 홀수 번째 그룹(각 시간대의 앞 30분)의 경계선 제거 → 1시간이 하나의 칸으로 보임 */
.rbc-timeslot-group:nth-child(odd) {
  border-bottom: none;
}
```

---

### · 캘린더 Week 뷰 — 30분 구분선 제거

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 */
.rbc-timeslot-group:nth-child(odd) {
  border-bottom: none;
}
```

---

### · 캘린더 Week 뷰 — 드래그 선택 UX 보완

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 — 시간 레이블 영역(gutter)은 선택 하이라이트 제외 */
.rbc-time-gutter .rbc-selected-cell {
  background: transparent !important;
  outline: none !important;
}
```

---

### · 캘린더 Week 뷰 — month 뷰 동일 스타일 드래그 선택 구현

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 */
.rbc-time-view .rbc-slot-selection {
  display: none;   /* rbc 기본 회색 오버레이 숨김 — slotPropGetter 방식으로 대체 */
}
```

---

#### `apps/web/src/pages/CalendarPage.tsx`

**① import 변경**
```ts
// before
import { useState, useMemo, useCallback } from 'react'
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns'

// after
import { useState, useMemo, useCallback, useRef } from 'react'
import { format, parse, startOfWeek, getDay, isSameDay, addDays } from 'date-fns'
```

**② WeekSel 인터페이스 + state/refs 추가**
```ts
interface WeekSel {
  startDay: Date    // midnight
  endDay:   Date    // midnight
  startMin: number  // minutes from midnight, inclusive
  endMin:   number  // minutes from midnight, exclusive
}

const weekContainerRef = useRef<HTMLDivElement>(null)
const isMultiDayRef    = useRef(false)
const dragStartRef     = useRef<{ colIdx: number; minutes: number } | null>(null)
const weekSelRef       = useRef<WeekSel | null>(null)
const [weekSel, setWeekSelState] = useState<WeekSel | null>(null)

// ref와 state 동기 래퍼 (stale closure 방지)
function setWeekSel(v: WeekSel | null) {
  weekSelRef.current = v
  setWeekSelState(v)
}

const weekDates = useMemo(() => {
  const s = startOfWeek(currentDate, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}, [currentDate])
```

**③ getColAndTime — 마우스 위치 → (열 인덱스, 30분 단위 시간)**
```ts
const getColAndTime = useCallback((e: React.MouseEvent): { colIdx: number; minutes: number } | null => {
  const c = weekContainerRef.current
  if (!c) return null
  const slots = Array.from(c.querySelectorAll<HTMLElement>('.rbc-day-slot'))
  for (let i = 0; i < slots.length; i++) {
    const r = slots[i].getBoundingClientRect()
    if (e.clientX >= r.left && e.clientX <= r.right) {
      const relY   = e.clientY - r.top
      const totalH = slots[i].offsetHeight || r.height
      const mins   = Math.min(23 * 60, Math.max(0, Math.round((relY / totalH) * 1440 / 30) * 30))
      return { colIdx: i, minutes: mins }
    }
  }
  return null
}, [])
```

**④ 마우스 핸들러**
```ts
function handleWeekMouseDown(e: React.MouseEvent) {
  if (view !== 'week') return
  const pos = getColAndTime(e)
  if (!pos) return
  isMultiDayRef.current = false
  setWeekSel(null)
  dragStartRef.current = pos
}

function handleWeekMouseMove(e: React.MouseEvent) {
  if (view !== 'week' || !dragStartRef.current || !(e.buttons & 1)) return
  const cur = getColAndTime(e)
  if (!cur) return
  // 같은 슬롯이면 불필요한 재렌더 방지
  if (cur.colIdx === dragStartRef.current.colIdx && cur.minutes === dragStartRef.current.minutes) return

  if (cur.colIdx !== dragStartRef.current.colIdx) isMultiDayRef.current = true

  const sCol = Math.min(dragStartRef.current.colIdx, cur.colIdx)
  const eCol = Math.max(dragStartRef.current.colIdx, cur.colIdx)
  const sMin = Math.min(dragStartRef.current.minutes, cur.minutes)
  const eMin = Math.min(24 * 60, Math.max(dragStartRef.current.minutes, cur.minutes) + 30)
  setWeekSel({
    startDay: new Date(weekDates[sCol].getFullYear(), weekDates[sCol].getMonth(), weekDates[sCol].getDate()),
    endDay:   new Date(weekDates[eCol].getFullYear(), weekDates[eCol].getMonth(), weekDates[eCol].getDate()),
    startMin: sMin,
    endMin:   eMin,
  })
}

function handleWeekMouseUp() {
  if (view !== 'week') return
  dragStartRef.current  = null
  isMultiDayRef.current = false
  // weekSel은 handleWeekMouseMove에서 이미 최신 값 — 그대로 유지
}
```

**⑤ handleSelecting — 다중 날 모드 중 rbc 단일 선택 취소**
```ts
// before
const handleSelecting = useCallback(({ start, end }) => {
  if (view === 'month') setSelectedSlot({ start, end })
  return true
}, [view])

// after
const handleSelecting = useCallback(({ start, end }) => {
  if (view === 'month') setSelectedSlot({ start, end })
  if (isMultiDayRef.current) return false   // ← 추가
  return true
}, [view])
```

**⑥ slotPropGetter 추가 — 선택 범위 슬롯에 rbc-selected-cell 적용**
```ts
// 추가
const slotPropGetter = useCallback((slotDate: Date) => {
  if (view !== 'week' || !weekSel) return {}
  const slotDay   = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())
  // 15분 슬롯도 처리: 해당 슬롯이 속한 30분 블록 기준으로 비교
  const slotBlock = Math.floor((slotDate.getHours() * 60 + slotDate.getMinutes()) / 30) * 30
  if (
    slotDay >= weekSel.startDay && slotDay <= weekSel.endDay &&
    slotBlock >= weekSel.startMin && slotBlock < weekSel.endMin
  ) {
    return { className: 'rbc-selected-cell' }
  }
  return {}
}, [view, weekSel])
```

**⑦ Calendar 컴포넌트에 slotPropGetter 추가 + 컨테이너에 ref/핸들러 연결**
```tsx
// Calendar props에 추가
slotPropGetter={slotPropGetter}

// 컨테이너 div
<div
  ref={weekContainerRef}
  className="flex-1 p-3 overflow-hidden border-r"
  style={{ borderColor: 'var(--color-border)' }}
  onContextMenu={e => openCtxMenu(e)}
  onMouseDown={handleWeekMouseDown}
  onMouseMove={handleWeekMouseMove}
  onMouseUp={handleWeekMouseUp}
>
```

---
