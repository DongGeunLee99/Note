import { useMemo } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/calendar.css'
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import ContextMenu from '@/components/common/ContextMenu'
import PageHeader from '@/components/common/PageHeader'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useCalendarStore, useAllEvents } from '@/stores/useCalendarStore'
import MonthView from '@/components/calendar/MonthView'
import WeekView from '@/components/calendar/WeekView'
import { CustomDayView } from '@/components/calendar/DayView'
import CalendarRightPanel from '@/components/calendar/CalendarRightPanel'
import NewEventModal from '@/components/calendar/NewEventModal'
import type { CalendarEventData } from '@/components/calendar/types'

export default function CalendarPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const {
    view,
    ctxMenu, closeCtxMenu, handleCtxNewEvent,
    eventModal, modalStart, modalEnd, closeEventModal, saveEvent,
    currentDate,
    selectedDays, setSelectedDays,
    events, editingId, openEditModal, deleteEvent,
  } = useCalendarStore(useShallow(s => ({
    view: s.view,
    ctxMenu: s.ctxMenu, closeCtxMenu: s.closeCtxMenu, handleCtxNewEvent: s.handleCtxNewEvent,
    eventModal: s.eventModal, modalStart: s.modalStart, modalEnd: s.modalEnd,
    closeEventModal: s.closeEventModal, saveEvent: s.saveEvent,
    currentDate: s.currentDate,
    selectedDays: s.selectedDays, setSelectedDays: s.setSelectedDays,
    events: s.events, editingId: s.editingId, openEditModal: s.openEditModal, deleteEvent: s.deleteEvent,
  })))
  const allEvents = useAllEvents()

  // 편집 중인 일정의 prefill 값 (날짜 외 필드)
  const editingEvent = editingId ? events.find(e => e.eventId === editingId) : null
  const editInitial = editingEvent
    ? {
        title: editingEvent.title,
        description: editingEvent.description,
        color: editingEvent.color,
        hasAlarm: editingEvent.hasAlarm,
        alarmMinutesBefore: editingEvent.alarmMinutesBefore,
      }
    : null

  const y = currentDate.getFullYear(), m = currentDate.getMonth()
  const alarmDayCount = useMemo(() =>
    new Set(allEvents.filter(e => e.start.getFullYear() === y && e.start.getMonth() === m).map(e => e.start.getDate())).size,
    [allEvents, y, m]
  )

  function handleSaveEvent(data: Omit<CalendarEventData, 'id'>) {
    if (editingId) {
      saveEvent(data) // store가 editingId면 수정으로 처리
      toast(t('calendar.toastEventUpdated'), 'success')
      closeEventModal()
      return
    }
    // 주간 다중일 드래그(B안): 선택한 각 날짜에 동일 시간대 일정 1개씩 생성
    if (selectedDays && selectedDays.length > 1) {
      selectedDays.forEach(day => {
        const start = new Date(day); start.setHours(data.start.getHours(), data.start.getMinutes(), 0, 0)
        let end = new Date(day); end.setHours(data.end.getHours(), data.end.getMinutes(), 0, 0)
        if (end <= start) end = new Date(start.getTime() + 3600000)
        saveEvent({ ...data, start, end })
      })
      setSelectedDays(null)
      toast(t('calendar.toastEventsAdded', { n: selectedDays.length }), 'success')
    } else {
      saveEvent(data)
      toast(t('calendar.toastEventAdded'), 'success')
    }
    closeEventModal()
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('sidebar.calendar')}>
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{t('calendar.headerInfo', { n: alarmDayCount })}</span>
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
          items={ctxMenu.eventId
            ? [
                { label: t('common.edit'), icon: <IconPencil size={12} />, onClick: () => openEditModal(ctxMenu.eventId!) },
                { label: t('common.delete'), icon: <IconTrash size={12} />, danger: true, onClick: () => deleteEvent(ctxMenu.eventId!) },
              ]
            : [{ label: t('calendar.newEvent'), icon: <IconPlus size={12} />, onClick: handleCtxNewEvent }]
          }
        />
      )}

      <NewEventModal
        isOpen={eventModal}
        initialStart={modalStart}
        initialEnd={modalEnd}
        multiDayCount={selectedDays?.length ?? 1}
        initial={editInitial}
        onClose={closeEventModal}
        onSave={handleSaveEvent}
        onDelete={editingId ? () => { deleteEvent(editingId); closeEventModal() } : undefined}
      />
    </div>
  )
}
