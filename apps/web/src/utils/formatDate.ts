// 날짜 표시 공용 유틸. 페이지마다 중복 구현하지 말고 여기서 import.
// 문구는 i18n 사전(time 네임스페이스)을 사용 — lang 인자로 언어 지정.

import i18n, { type Language } from '@/i18n'

export function formatRelTime(date: Date, lang: Language = 'ko'): string {
  const t = i18n.getFixedT(lang)
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return t('time.justNow')
  if (diffMin < 60) return t('time.minutesAgo', { n: diffMin })
  const h = Math.floor(diffMin / 60)
  if (h < 24) return t('time.hoursAgo', { n: h })
  const d = Math.floor(h / 24)
  if (d < 7) return t('time.daysAgo', { n: d })
  return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'numeric', day: 'numeric' })
}

export function formatFullDate(date: Date, lang: Language = 'ko'): string {
  const y = date.getFullYear()
  const mo = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours()
  const mi = date.getMinutes()
  if (lang === 'en') {
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  const min = mi > 0 ? ` ${mi}분` : ''
  return `${y}년 ${mo}월 ${d}일 ${period} ${hour}시${min}`
}

export function formatSuggestionTime(date: Date, lang: Language = 'ko'): string {
  const h = date.getHours()
  const m = date.getMinutes()
  if (lang === 'en') {
    const period = h < 12 ? 'AM' : 'PM'
    const hour = h % 12 === 0 ? 12 : h % 12
    const min = m > 0 ? `:${String(m).padStart(2, '0')}` : ''
    return `${date.getMonth() + 1}/${date.getDate()} ${hour}${min} ${period}`
  }
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  const min = m > 0 ? ` ${m}분` : ''
  return `${date.getMonth() + 1}/${date.getDate()} ${period} ${hour}시${min}`
}

export const TRASH_KEEP_DAYS = 30

export function daysLeft(deletedAt: Date, keepDays = TRASH_KEEP_DAYS): number {
  const diff = Date.now() - deletedAt.getTime()
  return Math.max(0, keepDays - Math.floor(diff / (1000 * 60 * 60 * 24)))
}
