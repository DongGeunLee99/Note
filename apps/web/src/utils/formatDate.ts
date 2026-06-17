// 날짜 표시 공용 유틸. 페이지마다 중복 구현하지 말고 여기서 import.
// 문구는 i18n 사전(time 네임스페이스)을 사용 — lang 인자로 언어 지정.

import i18n, { type Language, LOCALE_TAG } from '@/i18n'

export function formatRelTime(date: Date, lang: Language = 'ko'): string {
  const t = i18n.getFixedT(lang)
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return t('time.justNow')
  if (diffMin < 60) return t('time.minutesAgo', { n: diffMin })
  const h = Math.floor(diffMin / 60)
  if (h < 24) return t('time.hoursAgo', { n: h })
  const d = Math.floor(h / 24)
  if (d < 7) return t('time.daysAgo', { n: d })
  return date.toLocaleDateString(LOCALE_TAG[lang], { month: 'numeric', day: 'numeric' })
}

/** 언어별 전체 날짜 포맷 빌더. 언어 추가 시 이 맵을 채우면 됨(tsc가 누락을 알려줌) */
const FULL_DATE: Record<Language, (date: Date) => string> = {
  ko: date => {
    const h = date.getHours()
    const period = h < 12 ? '오전' : '오후'
    const hour = h % 12 === 0 ? 12 : h % 12
    const mi = date.getMinutes()
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${hour}시${mi > 0 ? ` ${mi}분` : ''}`
  },
  ja: date => {
    const h = date.getHours()
    const period = h < 12 ? '午前' : '午後'
    const hour = h % 12 === 0 ? 12 : h % 12
    const mi = date.getMinutes()
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${period}${hour}時${mi > 0 ? `${mi}分` : ''}`
  },
  en: date => date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }),
}

export function formatFullDate(date: Date, lang: Language = 'ko'): string {
  return FULL_DATE[lang](date)
}

/** 언어별 알람 제안 시각 포맷 빌더 */
const SUGGESTION_TIME: Record<Language, (date: Date) => string> = {
  ko: date => {
    const h = date.getHours()
    const period = h < 12 ? '오전' : '오후'
    const hour = h % 12 === 0 ? 12 : h % 12
    const m = date.getMinutes()
    return `${date.getMonth() + 1}/${date.getDate()} ${period} ${hour}시${m > 0 ? ` ${m}분` : ''}`
  },
  ja: date => {
    const h = date.getHours()
    const period = h < 12 ? '午前' : '午後'
    const hour = h % 12 === 0 ? 12 : h % 12
    const m = date.getMinutes()
    return `${date.getMonth() + 1}/${date.getDate()} ${period}${hour}時${m > 0 ? `${m}分` : ''}`
  },
  en: date => {
    const h = date.getHours()
    const period = h < 12 ? 'AM' : 'PM'
    const hour = h % 12 === 0 ? 12 : h % 12
    const m = date.getMinutes()
    return `${date.getMonth() + 1}/${date.getDate()} ${hour}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
  },
}

export function formatSuggestionTime(date: Date, lang: Language = 'ko'): string {
  return SUGGESTION_TIME[lang](date)
}

export const TRASH_KEEP_DAYS = 30

export function daysLeft(deletedAt: Date, keepDays = TRASH_KEEP_DAYS): number {
  const diff = Date.now() - deletedAt.getTime()
  return Math.max(0, keepDays - Math.floor(diff / (1000 * 60 * 60 * 24)))
}
