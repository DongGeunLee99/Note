import { useMemo } from 'react'
import { isSameDay } from 'date-fns'
import { useShallow } from 'zustand/react/shallow'
import { IconPlus } from '@tabler/icons-react'
import Badge from '@/components/common/Badge'
import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import MiniCalendar from './MiniCalendar'
import AgendaItem from './AgendaItem'
import { useCalendarStore, useAllEvents } from '@/stores/useCalendarStore'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { DAY_SHORT, MONTH_SHORT, DAY_SHORT_KO, formatSectionDate, toDateKey } from './calendarUtils'

export default function CalendarRightPanel() {
  const {
    currentDate, selectedDate, setSelectedDate, setCurrentDate,
    deleteEvent, openEventModal,
  } = useCalendarStore(useShallow(s => ({
    currentDate: s.currentDate, selectedDate: s.selectedDate,
    setSelectedDate: s.setSelectedDate, setCurrentDate: s.setCurrentDate,
    deleteEvent: s.deleteEvent, openEventModal: s.openEventModal,
  })))
  const allEvents = useAllEvents()
  const { t } = useTranslation()
  const lang = useLang()

  const today    = useMemo(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }, [])
  const tomorrow = useMemo(() => new Date(today.getTime() + 86400000), [today])
  const weekEnd  = useMemo(() => new Date(today.getTime() + 7 * 86400000), [today])

  const y = currentDate.getFullYear(), m = currentDate.getMonth()
  const alarmDayCount = useMemo(() =>
    new Set(allEvents.filter(e => e.start.getFullYear() === y && e.start.getMonth() === m).map(e => e.start.getDate())).size,
    [allEvents, y, m]
  )

  const eventDateSet = useMemo(() => {
    const s = new Set<string>()
    allEvents.forEach(e => s.add(toDateKey(e.start)))
    return s
  }, [allEvents])

  const agendaToday = useMemo(() =>
    allEvents.filter(e => isSameDay(e.start, today)).sort((a, b) => a.start.getTime() - b.start.getTime()),
    [allEvents, today]
  )

  const agendaTomorrow = useMemo(() =>
    allEvents.filter(e => isSameDay(e.start, tomorrow)).sort((a, b) => a.start.getTime() - b.start.getTime()),
    [allEvents, tomorrow]
  )

  const agendaWeekGrouped = useMemo(() => {
    const after  = new Date(tomorrow.getTime() + 86400000)
    const sorted = allEvents
      .filter(e => e.start >= after && e.start < weekEnd)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
    const groups: { date: Date; events: typeof allEvents }[] = []
    for (const e of sorted) {
      const last = groups[groups.length - 1]
      if (last && isSameDay(last.date, e.start)) last.events.push(e)
      else groups.push({ date: e.start, events: [e] })
    }
    return groups
  }, [allEvents, tomorrow, weekEnd])

  function handleNewEvent() {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0)
    openEventModal(start, new Date(start.getTime() + 3600000))
  }

  function handleSelectDate(d: Date) { setSelectedDate(d); setCurrentDate(d) }

  return (
    <ResizableRightPanel>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Mini Calendar */}
        <div className="p-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <MiniCalendar
            year={currentDate.getFullYear()} month={currentDate.getMonth()}
            selected={selectedDate} today={today} eventDates={eventDateSet}
            onSelect={handleSelectDate} onNavigate={setCurrentDate}
          />
        </div>

        <div className="flex-1 overflow-auto p-3 flex flex-col gap-3">

          {/* Selected date */}
          <div>
            <p className="text-[12px] font-semibold leading-tight">
              {lang === 'ko'
                ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${DAY_SHORT_KO[selectedDate.getDay()]})`
                : `${DAY_SHORT[selectedDate.getDay()]}, ${MONTH_SHORT[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{selectedDate.getFullYear()}</p>
          </div>

          {/* New Event button */}
          <button onClick={handleNewEvent}
            className="flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            <IconPlus size={11} /> {t('calendar.newEvent')}
          </button>

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          {/* TODAY */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-primary)' }}>
              {t('calendar.panelToday')} — {formatSectionDate(today, lang)}
            </p>
            {agendaToday.length === 0
              ? <p className="text-[9px] italic" style={{ color: 'var(--color-muted)' }}>{t('calendar.noEvents')}</p>
              : agendaToday.map(e => <AgendaItem key={e.id} event={e} onDelete={!e.isPreset ? () => deleteEvent(e.id) : undefined} />)
            }
          </div>

          {/* TOMORROW */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              {t('calendar.panelTomorrow')} — {formatSectionDate(tomorrow, lang)}
            </p>
            {agendaTomorrow.length === 0
              ? <p className="text-[9px] italic" style={{ color: 'var(--color-muted)' }}>{t('calendar.noEvents')}</p>
              : agendaTomorrow.map(e => <AgendaItem key={e.id} event={e} onDelete={!e.isPreset ? () => deleteEvent(e.id) : undefined} />)
            }
          </div>

          {/* THIS WEEK */}
          {agendaWeekGrouped.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>{t('calendar.panelThisWeek')}</p>
              {agendaWeekGrouped.map(({ date, events }) => (
                <div key={date.toDateString()} className="mb-2">
                  <p className="text-[9px] font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>{formatSectionDate(date, lang)}</p>
                  {events.map(e => <AgendaItem key={e.id} event={e} onDelete={!e.isPreset ? () => deleteEvent(e.id) : undefined} />)}
                </div>
              ))}
            </div>
          )}

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          {/* THIS MONTH */}
          <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{t('calendar.panelThisMonth')}</p>
          <div className="flex items-center justify-between text-[10px]">
            <span style={{ color: 'var(--color-muted)' }}>{t('calendar.daysWithEvents')}</span>
            <Badge variant="violet">{alarmDayCount}</Badge>
          </div>
        </div>
      </div>
    </ResizableRightPanel>
  )
}
