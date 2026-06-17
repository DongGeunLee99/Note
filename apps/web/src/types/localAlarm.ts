// 알람 UI 헬퍼·상수 모음. 데이터 타입은 @smartnote/shared/types의 Alarm/AlarmGroup 사용.

import type { Language } from '@/i18n'

export const GROUP_COLORS = [
  { bg: '#E6F1FB', fg: '#185FA5', name: '파랑' },
  { bg: '#FAEEDA', fg: '#854F0B', name: '주황' },
  { bg: '#EEEDFE', fg: '#3C3489', name: '보라' },
  { bg: '#EAF3DE', fg: '#27500A', name: '초록' },
  { bg: '#FCEBEB', fg: '#791F1F', name: '빨강' },
  { bg: '#F1EFE8', fg: '#444441', name: '회색' },
] as const

export const GROUP_EMOJIS = ['💼', '🏠', '🏃', '🎯', '📚', '🌙', '✈️', '🎮', '🍳', '💊', '🐶', '⭐']

/** 그룹 아이콘 표시용. 시드 '기타' 그룹의 icon('default')은 ⭐로 폴백 */
export function displayGroupIcon(icon: string): string {
  return icon === 'default' ? '⭐' : icon
}

/** 그룹 색 표식. 저장값이 이 값이면 현재 테마색을 따라감(동적) */
export const GROUP_THEME_COLOR = 'theme'

/** 그룹 아이콘 배경색. 'theme'면 연한 테마색, 매칭 hex면 그 bg, 아니면 기본 */
export function groupBg(color: string): string {
  if (color === GROUP_THEME_COLOR) return 'var(--color-primary-subtle)'
  return (GROUP_COLORS.find(c => c.fg === color) ?? GROUP_COLORS[0]).bg
}

export function formatTime(hour: number, minute: number, fmt: '12h' | '24h' = '24h'): string {
  if (fmt === '24h') {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${String(minute).padStart(2, '0')} ${period}`
}

interface RepeatLabels { once: string; daily: string; weekdays: string; weekends: string; names: string[] }

// 언어 추가 시 이 맵을 채우면 됨 (tsc가 누락을 알려줌)
const REPEAT_LABELS: Record<Language, RepeatLabels> = {
  ko: { once: '한 번', daily: '매일', weekdays: '평일', weekends: '주말', names: ['일', '월', '화', '수', '목', '금', '토'] },
  en: { once: 'Once', daily: 'Daily', weekdays: 'Weekdays', weekends: 'Weekends', names: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  ja: { once: '一度', daily: '毎日', weekdays: '平日', weekends: '週末', names: ['日', '月', '火', '水', '木', '金', '土'] },
}

export function formatRepeat(days: number[], lang: Language = 'ko'): string {
  const L = REPEAT_LABELS[lang]
  if (days.length === 0) return L.once
  if (days.length === 7) return L.daily
  if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return L.weekdays
  if (days.length === 2 && days.includes(0) && days.includes(6)) return L.weekends
  return [...days].sort((a, b) => a - b).map(d => L.names[d]).join('·')
}
