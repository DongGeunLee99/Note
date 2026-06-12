import { useMemo } from 'react'
import { isSameDay } from 'date-fns'
import { useShallow } from 'zustand/react/shallow'
import { IconBell } from '@tabler/icons-react'
import type { RbcEvent, CalView } from './types'
import type { TimeFormat } from '@/stores/useSettingsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useCalendarStore, useAllEvents } from '@/stores/useCalendarStore'
import { useDayDragSelect } from '@/hooks/useDayDragSelect'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { fmtTime, fmtHour, formatToolbarTitle } from './calendarUtils'

export const HOUR_H = 52

// 드래그 선택 오버레이 — 컬럼과 교차하는 구간 + 실제 시작/끝 여부
interface SelOverlay {
  top: number
  height: number
  borderTop: boolean
  borderBottom: boolean
}

// ── HalfDayColumn ──────────────────────────────────────────────
interface HalfDayColumnProps {
  label: string
  startHour: number
  events: RbcEvent[]
  nowLine: number | null
  timeFormat: TimeFormat
  sel: SelOverlay | null
  onHourContextMenu: (e: React.MouseEvent, hour: number) => void
}

export function HalfDayColumn({ label, startHour, events, nowLine, timeFormat, sel, onHourContextMenu }: HalfDayColumnProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="text-center text-[9px] font-bold uppercase tracking-widest py-1.5 border-b sticky top-0 z-10 flex-shrink-0"
        style={{ color: 'var(--color-muted)', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {label}
      </div>
      <div className="relative day-grid" style={{ height: HOUR_H * 12 }}>
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

        {sel && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: sel.top,
              height: sel.height,
              left: 44,
              right: 0,
              background: 'var(--color-primary-subtle)',
              borderLeft: '2px solid var(--color-primary)',
              borderRight: '2px solid var(--color-primary)',
              borderTop: sel.borderTop ? '2px solid var(--color-primary)' : 'none',
              borderBottom: sel.borderBottom ? '2px solid var(--color-primary)' : 'none',
            }}
          />
        )}

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
  const { t } = useTranslation()
  const lang = useLang()
  const { selectedDate, setSelectedDate, setCurrentDate, view, setView, openCtxMenu, setSelectedSlot } = useCalendarStore(useShallow(s => ({
    selectedDate: s.selectedDate, setSelectedDate: s.setSelectedDate,
    setCurrentDate: s.setCurrentDate,
    view: s.view, setView: s.setView,
    openCtxMenu: s.openCtxMenu,
    setSelectedSlot: s.setSelectedSlot,
  })))
  const allEvents = useAllEvents()

  const { containerRef, daySel, onMouseDown, onMouseMove, onMouseUp, clearDaySel } = useDayDragSelect(sel => {
    const d = selectedDate
    setSelectedSlot({
      start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, sel.startMin),
      end:   new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, sel.endMin),
    })
  })

  /** daySel을 컬럼(12시간) 구간과 교차해 오버레이 위치 계산 */
  function colSel(colStartMin: number): SelOverlay | null {
    if (!daySel) return null
    const colEndMin = colStartMin + 720
    const s = Math.max(daySel.startMin, colStartMin)
    const e = Math.min(daySel.endMin, colEndMin)
    if (s >= e) return null
    return {
      top:    ((s - colStartMin) / 60) * HOUR_H,
      height: ((e - s) / 60) * HOUR_H,
      borderTop:    s === daySel.startMin, // 정오 경계에는 테두리 생략 → 이어져 보이게
      borderBottom: e === daySel.endMin,
    }
  }

  const today = useMemo(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }, [])

  const dayEvents = allEvents.filter(e => isSameDay(e.start, selectedDate))
  const amEvents  = dayEvents.filter(e => e.start.getHours() < 12)
  const pmEvents  = dayEvents.filter(e => e.start.getHours() >= 12)

  const now = new Date()
  const isToday = isSameDay(selectedDate, today)
  const amNow = isToday && now.getHours() < 12  ? (now.getHours() + now.getMinutes() / 60) * HOUR_H : null
  const pmNow = isToday && now.getHours() >= 12 ? ((now.getHours() - 12) + now.getMinutes() / 60) * HOUR_H : null
  const label = formatToolbarTitle(selectedDate, 'day', lang)

  function navigate(d: Date) {
    setSelectedDate(d)
    setCurrentDate(d)
    clearDaySel()
    setSelectedSlot(null)
  }

  function handleHourContextMenu(e: React.MouseEvent, hour: number) {
    e.preventDefault()
    // 드래그 선택이 있으면 hour 대신 selectedSlot이 쓰이도록 hour를 생략
    openCtxMenu(e.clientX, e.clientY, daySel ? undefined : hour)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="rbc-toolbar flex-shrink-0">
        <div className="rbc-btn-group">
          <button onClick={() => navigate(new Date(selectedDate.getTime() - 86400000))}>‹</button>
          <button onClick={() => navigate(today)}>{t('calendar.today')}</button>
          <button onClick={() => navigate(new Date(selectedDate.getTime() + 86400000))}>›</button>
        </div>
        <span className="rbc-toolbar-label">{label}</span>
        <div className="rbc-btn-group">
          {(['month', 'week', 'day'] as CalView[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={view === v ? 'rbc-active' : ''}>
              {v === 'month' ? t('calendar.month') : v === 'week' ? t('calendar.week') : t('calendar.day')}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex flex-1 overflow-y-auto rounded-lg border"
        style={{ borderColor: 'var(--color-border)' }}
        onMouseDown={e => { onMouseDown(e); if (e.button === 0) setSelectedSlot(null) }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <HalfDayColumn label={t('calendar.am')} startHour={0}  events={amEvents} nowLine={amNow} timeFormat={timeFormat}
          sel={colSel(0)} onHourContextMenu={handleHourContextMenu} />
        <div className="w-px flex-shrink-0" style={{ background: 'var(--color-border)' }} />
        <HalfDayColumn label={t('calendar.pm')} startHour={12} events={pmEvents} nowLine={pmNow} timeFormat={timeFormat}
          sel={colSel(720)} onHourContextMenu={handleHourContextMenu} />
      </div>
    </div>
  )
}
