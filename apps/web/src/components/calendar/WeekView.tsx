import { useMemo, useCallback } from 'react'
import { Calendar } from 'react-big-calendar'
import { startOfWeek, addDays } from 'date-fns'
import { useShallow } from 'zustand/react/shallow'
import { useCalendarStore, useAllEvents } from '@/stores/useCalendarStore'
import { useWeekDragSelect } from '@/hooks/useWeekDragSelect'
import CalendarToolbar from './CalendarToolbar'
import { rbcLocalizer, getRbcMessages, getEventProps } from './calendarUtils'
import { useLang } from '@/i18n'
import type { RbcEvent, CalView } from './types'

export default function WeekView() {
  const {
    currentDate, setCurrentDate,
    setSelectedDate,
    setView,
    openCtxMenu,
  } = useCalendarStore(useShallow(s => ({
    currentDate: s.currentDate, setCurrentDate: s.setCurrentDate,
    setSelectedDate: s.setSelectedDate,
    setView: s.setView,
    openCtxMenu: s.openCtxMenu,
  })))
  const allEvents = useAllEvents()
  const lang = useLang()

  const today = useMemo(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }, [])

  const weekDates = useMemo(() => {
    const s = startOfWeek(currentDate, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(s, i))
  }, [currentDate])

  const { containerRef, weekSel, onMouseDown, onMouseMove, onMouseUp, handleSelecting } = useWeekDragSelect(weekDates)

  const eventPropGetter = useCallback((event: RbcEvent) => getEventProps(event), [])

  const slotPropGetter = useCallback((slotDate: Date) => {
    if (!weekSel) return {}
    const slotDay   = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())
    const slotMin   = slotDate.getHours() * 60 + slotDate.getMinutes()
    const slotBlock = Math.floor(slotMin / 30) * 30

    if (slotDay < weekSel.startDay || slotDay > weekSel.endDay) return {}
    if (slotBlock < weekSel.startMin || slotBlock >= weekSel.endMin) return {}

    const cls = ['rbc-week-sel']
    if (slotMin === weekSel.startMin)          cls.push('rbc-week-sel-top')
    if (slotBlock === weekSel.endMin - 30)     cls.push('rbc-week-sel-btm')
    if (slotDay.getTime() === weekSel.startDay.getTime()) cls.push('rbc-week-sel-left')
    if (slotDay.getTime() === weekSel.endDay.getTime())   cls.push('rbc-week-sel-right')

    return { className: cls.join(' ') }
  }, [weekSel])

  return (
    <div
      ref={containerRef}
      className="h-full"
      onContextMenu={e => { e.preventDefault(); openCtxMenu(e.clientX, e.clientY) }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <Calendar
        localizer={rbcLocalizer} events={allEvents}
        views={['month', 'week', 'day']} view="week"
        onView={v => setView(v as CalView)}
        culture="ko" messages={getRbcMessages(lang)}
        date={currentDate}
        onNavigate={(date, _view, action) => {
          setCurrentDate(date)
          if (action === 'TODAY') setSelectedDate(today)
        }}
        onSelectEvent={(event: RbcEvent) => setSelectedDate(event.start)}
        onSelecting={handleSelecting}
        selectable
        eventPropGetter={eventPropGetter}
        slotPropGetter={slotPropGetter}
        drilldownView={null}
        components={{ toolbar: CalendarToolbar }}
        style={{ height: '100%', minHeight: 320 }}
      />
    </div>
  )
}
