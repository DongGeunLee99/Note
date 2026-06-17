import { create } from 'zustand'
import { useMemo } from 'react'
import type { CalendarEventData, RbcEvent, CalView } from '@/components/calendar/types'
import type { CalendarEvent } from '@smartnote/shared/types'
import { subscribeEvents, createEvent, updateEvent, softDeleteEvent } from '@smartnote/shared/services/eventService'

interface CalendarState {
  uid: string | null
  events: CalendarEvent[]
  subscribe: (uid: string) => void
  unsubscribe: () => void
  selectedDate: Date
  currentDate: Date
  view: CalView
  selectedSlot: { start: Date; end: Date } | null
  eventModal: boolean
  modalStart: Date
  modalEnd: Date
  ctxMenu: { x: number; y: number; hour?: number; eventId?: string } | null
  selectedEventId: string | null
  /** 편집 중인 일정 id (있으면 saveEvent가 수정으로 동작) */
  editingId: string | null
  /** 주간 다중일 드래그로 선택된 날짜 목록 (B안: 날짜별 개별 일정 생성) */
  selectedDays: Date[] | null

  setSelectedDate: (d: Date) => void
  setCurrentDate: (d: Date) => void
  setView: (v: CalView) => void
  setSelectedSlot: (slot: { start: Date; end: Date } | null) => void
  setSelectedEventId: (id: string | null) => void
  setSelectedDays: (days: Date[] | null) => void
  openEventModal: (start: Date, end: Date) => void
  /** 기존 일정 편집 모달 열기 */
  openEditModal: (eventId: string) => void
  closeEventModal: () => void
  saveEvent: (data: Omit<CalendarEventData, 'id'>) => void
  deleteEvent: (id: string) => void
  openCtxMenu: (x: number, y: number, hour?: number) => void
  /** 일정 위 우클릭 → 수정/삭제 메뉴 */
  openEventCtxMenu: (x: number, y: number, eventId: string) => void
  closeCtxMenu: () => void
  handleCtxNewEvent: () => void
}

let unsubEvents: (() => void) | null = null

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  uid: null,
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
  editingId: null,
  selectedDays: null,

  subscribe: (uid) => {
    get().unsubscribe()
    set({ uid })
    unsubEvents = subscribeEvents(uid, events => set({ events }))
  },

  unsubscribe: () => {
    unsubEvents?.()
    unsubEvents = null
    set({ uid: null, events: [] })
  },

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
    set({ modalStart: start, modalEnd: safeEnd, eventModal: true, ctxMenu: null, editingId: null })
  },

  openEditModal: (eventId) => {
    const ev = get().events.find(e => e.eventId === eventId)
    if (!ev) return
    set({ editingId: eventId, modalStart: ev.start.toDate(), modalEnd: ev.end.toDate(), eventModal: true, ctxMenu: null })
  },

  closeEventModal: () => set({ eventModal: false, editingId: null, selectedSlot: null, selectedDays: null }),

  saveEvent: (data) => {
    const { uid, editingId } = get()
    if (!uid) return
    if (editingId) updateEvent(uid, editingId, data)
    else createEvent(uid, data)
  },
  deleteEvent: (id) => {
    const uid = get().uid
    if (!uid) return
    softDeleteEvent(uid, id)
    set(s => ({ selectedEventId: s.selectedEventId === id ? null : s.selectedEventId }))
  },

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

  openEventCtxMenu: (x, y, eventId) => {
    const menuW = 160, menuH = 88
    set({
      ctxMenu: {
        x: x + menuW > window.innerWidth  ? x - menuW : x,
        y: y + menuH > window.innerHeight ? y - menuH : y,
        eventId,
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
  const events = useCalendarStore(s => s.events)
  return useMemo(() =>
    events.map(e => ({
      id: e.eventId,
      title: e.title,
      description: e.description,
      start: e.start.toDate(),
      end: e.end.toDate(),
      isPreset: false,
      color: e.color,
      hasAlarm: e.hasAlarm,
    })),
    [events],
  )
}
