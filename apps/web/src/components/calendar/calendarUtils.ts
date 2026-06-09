import { dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatClockFromDate, formatHourLabel, type TimeFormat } from '../../stores/useSettingsStore'
import type { RbcEvent } from './types'

export const rbcLocalizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay, locales: { ko },
})

export const RBC_MESSAGES = {
  next: '›', previous: '‹', today: 'Today',
  month: 'Month', week: 'Week', day: 'Day', agenda: 'Agenda',
  date: 'Date', time: 'Time', event: 'Event',
  noEventsInRange: 'No events', showMore: (n: number) => `+${n} more`,
}

export function getEventProps(event: RbcEvent) {
  return { style: { backgroundColor: event.color, borderColor: event.color, fontSize: '9px' } }
}

export const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const EVENT_COLORS = ['#185FA5','#3C3489','#854F0B','#27500A','#791F1F','#444441']

export const ALARM_BEFORE = [
  { value: 0,  label: 'At event time' },
  { value: 5,  label: '5 min before' },
  { value: 10, label: '10 min before' },
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
]

export const HOURS   = Array.from({ length: 24 }, (_, i) => i)
export const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

export const PRESET_EVENTS: Record<number, { time: string; title: string; color: string }[]> = {
  5:  [{ time: '10:00', title: '병원 예약',  color: '#854F0B' }],
  10: [{ time: '07:30', title: '기상',       color: '#185FA5' }, { time: '09:00', title: '출근 준비', color: '#185FA5' }],
  15: [{ time: '14:00', title: '팀 미팅',   color: '#3C3489' }],
  22: [{ time: '07:30', title: '기상',       color: '#185FA5' }, { time: '18:30', title: '퇴근',    color: '#185FA5' }],
  28: [{ time: '11:00', title: '치과 예약', color: '#854F0B' }],
}

export function fmtTime(date: Date, fmt: TimeFormat) { return formatClockFromDate(date, fmt) }
export function fmtHour(h: number, fmt: TimeFormat)  { return formatHourLabel(h, fmt) }

export function formatSectionDate(date: Date) {
  return `${DAY_SHORT[date.getDay()]}, ${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

export function timeToDate(y: number, m: number, d: number, time: string): Date {
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m, d, h, min)
}
