import { useMemo } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/calendar.css'
import { IconPlus } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import ContextMenu from '../components/common/ContextMenu'
import PageHeader from '../components/common/PageHeader'
import { useToast } from '../contexts/ToastContext'
import { useCalendarStore, useAllEvents } from '../stores/useCalendarStore'
import MonthView from '../components/calendar/MonthView'
import WeekView from '../components/calendar/WeekView'
import { CustomDayView } from '../components/calendar/DayView'
import CalendarRightPanel from '../components/calendar/CalendarRightPanel'
import NewEventModal from '../components/calendar/NewEventModal'
import type { CalendarEventData } from '../components/calendar/types'

export default function CalendarPage() {
  const toast = useToast()
  const {
    view,
    ctxMenu, closeCtxMenu, handleCtxNewEvent,
    eventModal, modalStart, modalEnd, closeEventModal, saveEvent,
    currentDate,
  } = useCalendarStore(useShallow(s => ({
    view: s.view,
    ctxMenu: s.ctxMenu, closeCtxMenu: s.closeCtxMenu, handleCtxNewEvent: s.handleCtxNewEvent,
    eventModal: s.eventModal, modalStart: s.modalStart, modalEnd: s.modalEnd,
    closeEventModal: s.closeEventModal, saveEvent: s.saveEvent,
    currentDate: s.currentDate,
  })))
  const allEvents = useAllEvents()

  const y = currentDate.getFullYear(), m = currentDate.getMonth()
  const alarmDayCount = useMemo(() =>
    new Set(allEvents.filter(e => e.start.getFullYear() === y && e.start.getMonth() === m).map(e => e.start.getDate())).size,
    [allEvents, y, m]
  )

  function handleSaveEvent(data: Omit<CalendarEventData, 'id'>) {
    saveEvent(data)
    toast('Event added', 'success')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Calendar">
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{alarmDayCount} days with events this month</span>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-3 overflow-hidden border-r" style={{ borderColor: 'var(--color-border)' }}>
          {view === 'day'  && <CustomDayView />}
          {view === 'week' && <WeekView />}
          {view === 'month' && <MonthView />}
        </div>
        <CalendarRightPanel />
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          onClose={closeCtxMenu}
          items={[{ label: 'New Event', icon: <IconPlus size={12} />, onClick: handleCtxNewEvent }]}
        />
      )}

      <NewEventModal
        isOpen={eventModal}
        initialStart={modalStart}
        initialEnd={modalEnd}
        onClose={closeEventModal}
        onSave={handleSaveEvent}
      />
    </div>
  )
}
