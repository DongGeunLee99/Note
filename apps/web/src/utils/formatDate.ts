// 날짜 표시 공용 유틸. 페이지마다 중복 구현하지 말고 여기서 import.

export function formatRelTime(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const h = Math.floor(diffMin / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
}

export function formatFullDate(date: Date): string {
  const y = date.getFullYear()
  const mo = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours()
  const mi = date.getMinutes()
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  const min = mi > 0 ? ` ${mi}분` : ''
  return `${y}년 ${mo}월 ${d}일 ${period} ${hour}시${min}`
}

export function formatSuggestionTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
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
