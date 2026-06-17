import { dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatClockFromDate, formatHourLabel, type TimeFormat } from '@/stores/useSettingsStore'
import i18n, { type Language } from '@/i18n'
import type { RbcEvent, CalView } from './types'

export const rbcLocalizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay, locales: { ko },
})

export function getRbcMessages(lang: Language) {
  const t = i18n.getFixedT(lang)
  return {
    next: '›', previous: '‹', today: t('calendar.today'),
    month: t('calendar.month'), week: t('calendar.week'), day: t('calendar.day'), agenda: 'Agenda',
    date: 'Date', time: 'Time', event: 'Event',
    noEventsInRange: t('calendar.noEventsInRange'),
    showMore: (total: number) => t('calendar.showMore', { n: total }),
  }
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
  10: [{ time: '07:30', title: '기상',       color: '#185FA5' }, { time: '09:00', title: '모닝 루틴', color: '#185FA5' }],
  15: [{ time: '14:00', title: '팀 미팅',   color: '#3C3489' }],
  22: [{ time: '07:30', title: '기상',       color: '#185FA5' }, { time: '18:30', title: '퇴근',    color: '#185FA5' }],
  28: [{ time: '11:00', title: '치과 예약', color: '#854F0B' }],
}

export function fmtTime(date: Date, fmt: TimeFormat) { return formatClockFromDate(date, fmt) }
export function fmtHour(h: number, fmt: TimeFormat)  { return formatHourLabel(h, fmt) }

export const DAY_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토']
export const DAY_SHORT_JA = ['日', '月', '火', '水', '木', '金', '土']

// 언어별 날짜 포맷 빌더. 언어 추가 시 이 맵들을 채우면 됨(tsc가 누락을 알려줌)
const SECTION_DATE: Record<Language, (d: Date) => string> = {
  ko: d => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_SHORT_KO[d.getDay()]})`,
  ja: d => `${d.getMonth() + 1}月${d.getDate()}日 (${DAY_SHORT_JA[d.getDay()]})`,
  en: d => `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`,
}

export function formatSectionDate(date: Date, lang: Language = 'en') {
  return SECTION_DATE[lang](date)
}

const TOOLBAR_MONTH: Record<Language, (d: Date) => string> = {
  ko: d => `${d.getFullYear()}년 ${d.getMonth() + 1}월`,
  ja: d => `${d.getFullYear()}年${d.getMonth() + 1}月`,
  en: d => `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`,
}

const TOOLBAR_DAY: Record<Language, (d: Date) => string> = {
  ko: d => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_SHORT_KO[d.getDay()]})`,
  ja: d => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${DAY_SHORT_JA[d.getDay()]})`,
  en: d => `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
}

/** 툴바 타이틀 공용 포맷 — Month/Week/Day 탭 통일 */
export function formatToolbarTitle(date: Date, view: CalView, lang: Language = 'en'): string {
  // Week는 헤더에 날짜·요일이 이미 보이므로 Month와 동일한 "월 + 연도"만 표시
  if (view === 'month' || view === 'week') return TOOLBAR_MONTH[lang](date)
  return TOOLBAR_DAY[lang](date)
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
