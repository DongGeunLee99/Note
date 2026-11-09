// 알람 UI 상수·포맷 헬퍼. apps/web/src/types/localAlarm.ts의 한국어 부분 복사본.
// TODO(Firebase 연결): 공용 스토어 전환 시 packages/shared로 합쳐 웹과 중복 제거

export const GROUP_COLORS = [
  { bg: '#E6F1FB', fg: '#185FA5', name: '파랑' },
  { bg: '#FAEEDA', fg: '#854F0B', name: '주황' },
  { bg: '#EEEDFE', fg: '#3C3489', name: '보라' },
  { bg: '#EAF3DE', fg: '#27500A', name: '초록' },
  { bg: '#FCEBEB', fg: '#791F1F', name: '빨강' },
  { bg: '#F1EFE8', fg: '#444441', name: '회색' },
] as const

export const GROUP_EMOJIS = ['💼', '🏠', '🏃', '🎯', '📚', '🌙', '✈️', '🎮', '🍳', '💊', '🐶', '⭐']

/** 그룹 색 표식. 저장값이 이 값이면 앱 테마색을 따라감 */
export const GROUP_THEME_COLOR = 'theme'

/** 모바일엔 아직 테마가 없어 테마색 그룹은 중립 회색 배경 */
const THEME_SUBTLE_BG = '#F3F4F6'

/** 그룹 아이콘 표시용. 시드 '기타' 그룹의 icon('default')은 ⭐로 폴백 */
export function displayGroupIcon(icon: string): string {
  return icon === 'default' ? '⭐' : icon
}

/** 그룹 아이콘 배경색 */
export function groupBg(color: string): string {
  if (color === GROUP_THEME_COLOR) return THEME_SUBTLE_BG
  return (GROUP_COLORS.find(c => c.fg === color) ?? GROUP_COLORS[0]).bg
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function formatRepeat(days: number[]): string {
  if (days.length === 0) return '한 번'
  if (days.length === 7) return '매일'
  if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return '평일'
  if (days.length === 2 && days.includes(0) && days.includes(6)) return '주말'
  return [...days].sort((a, b) => a - b).map(d => DAY_NAMES[d]).join('·')
}
