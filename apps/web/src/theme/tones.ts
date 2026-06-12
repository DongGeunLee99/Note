// 배지·아이콘·칩 등에서 공용으로 쓰는 톤 팔레트.
// 실제 색 값은 index.css의 --tone-* 변수에 정의 (테마별 오버라이드).
// 새 색 조합이 필요하면 index.css에 변수를 추가하고 여기서 참조한다.

export type Tone = 'blue' | 'amber' | 'gray' | 'violet' | 'green' | 'red'

export interface ToneColors {
  bg: string   // 연한 배경
  fg: string   // 아이콘·포인트 색
  text: string // 배경 위 텍스트 색
}

export const TONES: Record<Tone, ToneColors> = {
  blue:   { bg: 'var(--tone-blue-bg)',   fg: 'var(--tone-blue-fg)',   text: 'var(--tone-blue-text)' },
  amber:  { bg: 'var(--tone-amber-bg)',  fg: 'var(--tone-amber-fg)',  text: 'var(--tone-amber-text)' },
  gray:   { bg: 'var(--tone-gray-bg)',   fg: 'var(--tone-gray-fg)',   text: 'var(--tone-gray-text)' },
  violet: { bg: 'var(--tone-violet-bg)', fg: 'var(--tone-violet-fg)', text: 'var(--tone-violet-text)' },
  green:  { bg: 'var(--tone-green-bg)',  fg: 'var(--tone-green-fg)',  text: 'var(--tone-green-text)' },
  red:    { bg: 'var(--tone-red-bg)',    fg: 'var(--tone-red-fg)',    text: 'var(--tone-red-text)' },
}
