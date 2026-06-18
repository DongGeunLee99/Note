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

/** 색 표식. 저장값이 이 값이면 현재 테마색을 따라감(동적) */
export const EVENT_THEME_COLOR = 'theme'

/** 'theme'이면 현재 테마색 CSS 변수로, hex면 그대로 */
export function resolveEventColor(color: string): string {
  return color === EVENT_THEME_COLOR ? 'var(--color-primary)' : color
}

/** 일정 색의 연한 배경(틴트). hex면 알파 추가, theme면 연한 테마색 */
export function eventTintBg(color: string): string {
  return color === EVENT_THEME_COLOR ? 'var(--color-primary-subtle)' : `${color}18`
}

export function getEventProps(event: RbcEvent) {
  const c = resolveEventColor(event.color)
  return { style: { backgroundColor: c, borderColor: c, fontSize: '9px' } }
}

export const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const EVENT_COLORS = [EVENT_THEME_COLOR, '#185FA5','#3C3489','#854F0B','#27500A','#791F1F','#444441']

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

/** 월 이동 시 활성 날짜 보정용 가장자리 날짜: 과거(prev)→그 달 마지막 날, 미래(next)→첫째 날 */
export function monthEdgeDate(target: Date, direction: 'prev' | 'next'): Date {
  return direction === 'prev'
    ? new Date(target.getFullYear(), target.getMonth() + 1, 0)
    : new Date(target.getFullYear(), target.getMonth(), 1)
}
