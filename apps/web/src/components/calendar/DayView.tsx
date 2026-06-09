import { useMemo } from 'react'
import { isSameDay } from 'date-fns'
import { useShallow } from 'zustand/react/shallow'
import { IconBell } from '@tabler/icons-react'
import type { RbcEvent, CalView } from './types'
import type { TimeFormat } from '../../stores/useSettingsStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useCalendarStore, useAllEvents } from '../../stores/useCalendarStore'
import { fmtTime, fmtHour, DAY_SHORT, MONTH_FULL } from './calendarUtils'

export const HOUR_H = 52

// ── HalfDayColumn ──────────────────────────────────────────────
interface HalfDayColumnProps {
  label: string
  startHour: number
  events: RbcEvent[]
  nowLine: number | null
  timeFormat: TimeFormat
  onHourContextMenu: (e: React.MouseEvent, hour: number) => void
}

export function HalfDayColumn({ label, startHour, events, nowLine, timeFormat, onHourContextMenu }: HalfDayColumnProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="text-center text-[9px] font-bold uppercase tracking-widest py-1.5 border-b sticky top-0 z-10 flex-shrink-0"
        style={{ color: 'var(--color-muted)', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {label}
      </div>
      <div className="relative" style={{ height: HOUR_H * 12 }}>
        {Array.from({ length: 12 }, (_, i) => startHour + i).map(hour => (
          <div key={hour}
            className="absolute w-full flex border-b cursor-context-menu"
            style={{ top: (hour - startHour) * HOUR_H, height: HOUR_H, borderColor: 'var(--color-border)' }}
            onContextMenu={e => onHourContextMenu(e, hour)}
          >
            <span className="text-[8px] px-1.5 pt-1 flex-shrink-0 w-11 text-right" style={{ color: 'var(--color-muted)' }}>
              {fmtHour(hour, timeFormat)}
            </span>
          </div>
        ))}

        {events.map(event => {
          const top    = (event.start.getHours() - startHour + event.start.getMinutes() / 60) * HOUR_H
          const bottom = (event.end.getHours()   - startHour + event.end.getMinutes()   / 60) * HOUR_H
          const height = Math.max(bottom - top, 22)
          return (
            <div key={event.id} className="absolute rounded-md px-2 py-1 overflow-hidden"
              style={{ top: top + 1, left: 46, right: 4, height: height - 2, background: event.color }}>
              <div className="flex items-center gap-1">
                <p className="text-[9px] font-semibold text-white truncate leading-tight flex-1">{event.title}</p>
                {event.hasAlarm && <IconBell size={8} style={{ color: '#fff', opacity: .8, flexShrink: 0 }} />}
              </div>
              <p className="text-[8px] text-white" style={{ opacity: .85 }}>{fmtTime(event.start, timeFormat)}</p>
            </div>
          )
        })}

        {nowLine !== null && (
          <div className="absolute left-0 right-0 flex items-center pointer-events-none z-10" style={{ top: nowLine }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0 ml-9" style={{ background: 'var(--color-primary)' }} />
            <div className="flex-1 h-px" style={{ background: 'var(--color-primary)' }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── CustomDayView ──────────────────────────────────────────────
export function CustomDayView() {
  const timeFormat = useSettingsStore(s => s.timeFormat)
  const { selectedDate, setSelectedDate, setCurrentDate, view, setView, openCtxMenu } = useCalendarStore(useShallow(s => ({
    selectedDate: s.selectedDate, setSelectedDate: s.setSelectedDate,
    setCurrentDate: s.setCurrentDate,
    view: s.view, setView: s.setView,
    openCtxMenu: s.openCtxMenu,
  })))
  const allEvents = useAllEvents()

  const today = useMemo(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }, [])

  const dayEvents = allEvents.filter(e => isSameDay(e.start, selectedDate))
  const amEvents  = dayEvents.filter(e => e.start.getHours() < 12)
  const pmEvents  = dayEvents.filter(e => e.start.getHours() >= 12)

  const now = new Date()
  const isToday = isSameDay(selectedDate, today)
  const amNow = isToday && now.getHours() < 12  ? (now.getHours() + now.getMinutes() / 60) * HOUR_H : null
  const pmNow = isToday && now.getHours() >= 12 ? ((now.getHours() - 12) + now.getMinutes() / 60) * HOUR_H : null
  const label = `${DAY_SHORT[selectedDate.getDay()]}, ${MONTH_FULL[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`

  function navigate(d: Date) { setSelectedDate(d); setCurrentDate(d) }

  return (
    <div className="flex flex-col h-full">
      <div className="rbc-toolbar flex-shrink-0">
        <div className="rbc-btn-group">
          <button onClick={() => navigate(new Date(selectedDate.getTime() - 86400000))}>‹</button>
          <button onClick={() => navigate(today)}>Today</button>
          <button onClick={() => navigate(new Date(selectedDate.getTime() + 86400000))}>›</button>
        </div>
        <span className="rbc-toolbar-label">{label}</span>
        <div className="rbc-btn-group">
          {(['month', 'week', 'day'] as CalView[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={view === v ? 'rbc-active' : ''}>
              {v === 'month' ? 'Month' : v === 'week' ? 'Week' : 'Day'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-y-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
        <HalfDayColumn label="AM" startHour={0}  events={amEvents} nowLine={amNow} timeFormat={timeFormat}
          onHourContextMenu={(e, hour) => { e.preventDefault(); openCtxMenu(e.clientX, e.clientY, hour) }} />
        <div className="w-px flex-shrink-0" style={{ background: 'var(--color-border)' }} />
        <HalfDayColumn label="PM" startHour={12} events={pmEvents} nowLine={pmNow} timeFormat={timeFormat}
          onHourContextMenu={(e, hour) => { e.preventDefault(); openCtxMenu(e.clientX, e.clientY, hour) }} />
      </div>
    </div>
  )
}
