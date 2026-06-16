import { create } from 'zustand'
import { useMemo } from 'react'
import { PRESET_EVENTS, timeToDate } from '@/components/calendar/calendarUtils'
import type { CalendarEventData, RbcEvent, CalView } from '@/components/calendar/types'

let _nextId = 1

interface CalendarState {
  events: CalendarEventData[]
  selectedDate: Date
  currentDate: Date
  view: CalView
  selectedSlot: { start: Date; end: Date } | null
  eventModal: boolean
  modalStart: Date
  modalEnd: Date
  ctxMenu: { x: number; y: number; hour?: number } | null
  selectedEventId: string | null
  /** 주간 다중일 드래그로 선택된 날짜 목록 (B안: 날짜별 개별 일정 생성) */
  selectedDays: Date[] | null

  setSelectedDate: (d: Date) => void
  setCurrentDate: (d: Date) => void
  setView: (v: CalView) => void
  setSelectedSlot: (slot: { start: Date; end: Date } | null) => void
  setSelectedEventId: (id: string | null) => void
  setSelectedDays: (days: Date[] | null) => void
  openEventModal: (start: Date, end: Date) => void
  closeEventModal: () => void
  saveEvent: (data: Omit<CalendarEventData, 'id'>) => void
  deleteEvent: (id: string) => void
  openCtxMenu: (x: number, y: number, hour?: number) => void
  closeCtxMenu: () => void
  handleCtxNewEvent: () => void
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  events: [],
  selectedDate: new Date(),
  currentDate: new Date(),
  view: 'month' as CalView,
  selectedSlot: null,
  eventModal: false,
  modalStart: new Date(),
  modalEnd: new Date(),
  ctxMenu: null,
  selectedEventId: null,
  selectedDays: null,

  setSelectedDate: (d) => set({ selectedDate: d }),
  setCurrentDate:  (d) => set({ currentDate: d }),
  setView:         (v) => set({ view: v }),
  // 슬롯을 새로 잡으면 다중일 선택은 초기화 (Week뷰는 직후 setSelectedDays로 다시 채움)
  setSelectedSlot: (slot) => set({ selectedSlot: slot, selectedDays: null }),
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  setSelectedDays: (days) => set({ selectedDays: days }),

  openEventModal: (start, end) => {
    let normalEnd = end
    if (end > start && end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
      normalEnd = new Date(end.getTime() - 1)
    }
    const safeEnd = normalEnd <= start ? new Date(start.getTime() + 3600000) : normalEnd
    set({ modalStart: start, modalEnd: safeEnd, eventModal: true, ctxMenu: null })
  },

  closeEventModal: () => set({ eventModal: false, selectedSlot: null, selectedDays: null }),

  saveEvent: (data) => set(s => ({ events: [...s.events, { ...data, id: `ce${_nextId++}` }] })),
  deleteEvent: (id) => set(s => ({
    events: s.events.filter(e => e.id !== id),
    selectedEventId: s.selectedEventId === id ? null : s.selectedEventId,
  })),

  openCtxMenu: (x, y, hour) => {
    const menuW = 160, menuH = 60
    set({
      ctxMenu: {
        x: x + menuW > window.innerWidth  ? x - menuW : x,
        y: y + menuH > window.innerHeight ? y - menuH : y,
        hour,
      },
    })
  },

  closeCtxMenu: () => set({ ctxMenu: null }),

  handleCtxNewEvent: () => {
    const { ctxMenu, selectedDate, selectedSlot, openEventModal } = get()
    if (!ctxMenu) return
    if (ctxMenu.hour !== undefined) {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), ctxMenu.hour, 0)
      openEventModal(start, new Date(start.getTime() + 3600000))
    } else if (selectedSlot) {
      openEventModal(selectedSlot.start, selectedSlot.end)
    } else {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0)
      openEventModal(start, new Date(start.getTime() + 3600000))
    }
  },
}))

export function useAllEvents(): RbcEvent[] {
  const events      = useCalendarStore(s => s.events)
  const currentDate = useCalendarStore(s => s.currentDate)
  return useMemo(() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth()
    const presets: RbcEvent[] = Object.entries(PRESET_EVENTS).flatMap(([day, evts]) =>
      evts.map((ev, i) => {
        const start = timeToDate(y, m, Number(day), ev.time)
        return { id: `preset-${day}-${i}`, title: ev.title, description: '', start, end: new Date(start.getTime() + 30 * 60000), isPreset: true, color: ev.color, hasAlarm: true }
      })
    )
    return [
      ...presets,
      ...events.map(e => ({ id: e.id, title: e.title, description: e.description, start: e.start, end: e.end, isPreset: false, color: e.color, hasAlarm: e.hasAlarm })),
    ]
  }, [events, currentDate])
}
