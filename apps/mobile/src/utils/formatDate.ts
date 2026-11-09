// 메모 날짜 표시 헬퍼 (한국어 고정 — 다국어는 5단계 설정에서)

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatClock(d: Date): string {
  const h = d.getHours()
  const period = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${period} ${h12}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 목록용 상대 시간: 방금 전 / N분 전 / N시간 전 / N일 전 / M월 D일 */
export function formatRelTime(d: Date, now: Date = new Date()): string {
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** 상세용: 2026년 11월 9일 (월) 오후 3:20 */
export function formatFullDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${formatClock(d)}`
}

/** 알람 제안용: 오늘/내일/모레 오전 9:00, 그 외 M월 D일 오전 9:00 */
export function formatSuggestionTime(d: Date, now: Date = new Date()): string {
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dayDiff = Math.round((startOf(d) - startOf(now)) / 86_400_000)
  const dayLabel = ['오늘', '내일', '모레'][dayDiff] ?? `${d.getMonth() + 1}월 ${d.getDate()}일`
  return `${dayLabel} ${formatClock(d)}`
}
