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

export function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? '오전' : '오후'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${period} ${h}:${String(minute).padStart(2, '0')}`
}

export function formatRepeat(days: number[]): string {
  if (days.length === 0) return '한 번'
  if (days.length === 7) return '매일'
  if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return '평일'
  if (days.length === 2 && days.includes(0) && days.includes(6)) return '주말'
  const LABELS = ['일', '월', '화', '수', '목', '금', '토']
  return [...days].sort((a, b) => a - b).map(d => LABELS[d]).join('·')
}
