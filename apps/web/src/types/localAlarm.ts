export interface LocalAlarmGroup {
  groupId: string
  name: string
  color: string
  emoji: string
  isEnabled: boolean
  isDefault: boolean
}

export interface LocalAlarm {
  alarmId: string
  groupId: string
  label: string
  hour: number
  minute: number
  repeatDays: number[]
  isEnabled: boolean
  sourceMemoId: string | null
}

export const GROUP_COLORS = [
  { bg: '#E6F1FB', fg: '#185FA5', name: '파랑' },
  { bg: '#FAEEDA', fg: '#854F0B', name: '주황' },
  { bg: '#EEEDFE', fg: '#3C3489', name: '보라' },
  { bg: '#EAF3DE', fg: '#27500A', name: '초록' },
  { bg: '#FCEBEB', fg: '#791F1F', name: '빨강' },
  { bg: '#F1EFE8', fg: '#444441', name: '회색' },
] as const

export const GROUP_EMOJIS = ['💼', '🏠', '🏃', '🎯', '📚', '🌙', '✈️', '🎮', '🍳', '💊', '🐶', '⭐']

export function formatTime(hour: number, minute: number, fmt: '12h' | '24h' = '24h'): string {
  if (fmt === '24h') {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${String(minute).padStart(2, '0')} ${period}`
}

export function formatRepeat(days: number[], lang: 'ko' | 'en' = 'ko'): string {
  const L = lang === 'ko'
    ? { once: '한 번', daily: '매일', weekdays: '평일', weekends: '주말', names: ['일', '월', '화', '수', '목', '금', '토'] }
    : { once: 'Once', daily: 'Daily', weekdays: 'Weekdays', weekends: 'Weekends', names: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  if (days.length === 0) return L.once
  if (days.length === 7) return L.daily
  if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return L.weekdays
  if (days.length === 2 && days.includes(0) && days.includes(6)) return L.weekends
  return [...days].sort((a, b) => a - b).map(d => L.names[d]).join('·')
}
