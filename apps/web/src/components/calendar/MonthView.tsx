import { useMemo, useCallback } from 'react'
import { Calendar } from 'react-big-calendar'
import { isSameDay } from 'date-fns'
import { useShallow } from 'zustand/react/shallow'
import { useCalendarStore, useAllEvents } from '@/stores/useCalendarStore'
import CalendarToolbar from './CalendarToolbar'
import CalendarEventChip from './CalendarEventChip'
import { rbcLocalizer, getRbcMessages, getEventProps, monthEdgeDate } from './calendarUtils'
import { useLang } from '@/i18n'
import type { RbcEvent, CalView } from './types'

export default function MonthView() {
  const {
    selectedDate, setSelectedDate,
    currentDate,  setCurrentDate,
    setView,
    selectedSlot, setSelectedSlot,
    openCtxMenu,
    setSelectedEventId,
  } = useCalendarStore(useShallow(s => ({
    selectedDate: s.selectedDate, setSelectedDate: s.setSelectedDate,
    currentDate: s.currentDate,   setCurrentDate: s.setCurrentDate,
    setView: s.setView,
    selectedSlot: s.selectedSlot, setSelectedSlot: s.setSelectedSlot,
    openCtxMenu: s.openCtxMenu,
    setSelectedEventId: s.setSelectedEventId,
  })))
  const allEvents = useAllEvents()
  const lang = useLang()

  const today = useMemo(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }, [])

  const eventPropGetter = useCallback((event: RbcEvent) => getEventProps(event), [])

  const dayPropGetter = useCallback((date: Date) => {
    if (isSameDay(date, selectedDate)) return { className: 'rbc-selected-cell' }
    if (selectedSlot) {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const s = new Date(selectedSlot.start.getFullYear(), selectedSlot.start.getMonth(), selectedSlot.start.getDate())
      const e = new Date(selectedSlot.end.getFullYear(),   selectedSlot.end.getMonth(),   selectedSlot.end.getDate())
      if (d >= s && d < e) return { className: 'rbc-selected-cell' }
    }
    return {}
  }, [selectedDate, selectedSlot])

  const handleSelecting = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    return true
  }, [setSelectedSlot])

  const handleSelectSlot = useCallback(({ start, end, action }: { start: Date; end: Date; action: string }) => {
    setSelectedDate(start)
    const inMonth = (d: Date) =>
      d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth()
    if (action === 'click') {
      if (!inMonth(start)) setCurrentDate(start)
    } else {
      if (!inMonth(start) && !inMonth(end)) setCurrentDate(start)
    }
    setSelectedSlot({ start, end })
  }, [currentDate, setSelectedDate, setCurrentDate, setSelectedSlot])

  const handleSelectEvent = useCallback((event: RbcEvent) => { setSelectedDate(event.start); setSelectedEventId(event.id) }, [setSelectedDate, setSelectedEventId])

  return (
    <div
      className="h-full"
      onContextMenu={e => { e.preventDefault(); openCtxMenu(e.clientX, e.clientY) }}
    >
      <Calendar
        localizer={rbcLocalizer} events={allEvents}
        views={['month', 'week', 'day']} view="month"
        onView={v => setView(v as CalView)}
        culture="ko" messages={getRbcMessages(lang)}
        date={currentDate}
        onNavigate={(date, _view, action) => {
          setCurrentDate(date)
          setSelectedSlot(null)
          if (action === 'TODAY') setSelectedDate(today)
          else if (action === 'PREV') setSelectedDate(monthEdgeDate(date, 'prev'))
          else if (action === 'NEXT') setSelectedDate(monthEdgeDate(date, 'next'))
        }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onSelecting={handleSelecting}
        selectable
        eventPropGetter={eventPropGetter}
        dayPropGetter={dayPropGetter}
        drilldownView={null}
        components={{ toolbar: CalendarToolbar, event: CalendarEventChip }}
        style={{ height: '100%', minHeight: 320 }}
      />
    </div>
  )
}
