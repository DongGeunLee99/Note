// 배지·아이콘·칩 등에서 공용으로 쓰는 톤 팔레트.
// 새 색 조합이 필요하면 여기에 추가하고, 컴포넌트에는 hex를 직접 쓰지 않는다.

export type Tone = 'blue' | 'amber' | 'gray' | 'violet' | 'green' | 'red'

export interface ToneColors {
  bg: string   // 연한 배경
  fg: string   // 아이콘·포인트 색
  text: string // 배경 위 텍스트 색
}

export const TONES: Record<Tone, ToneColors> = {
  blue:   { bg: '#E6F1FB', fg: '#185FA5', text: '#0C447C' },
  amber:  { bg: '#FAEEDA', fg: '#854F0B', text: '#633806' },
  gray:   { bg: '#F1EFE8', fg: '#444441', text: '#444441' },
  violet: { bg: '#EEEDFE', fg: '#3C3489', text: '#3C3489' },
  green:  { bg: '#EAF3DE', fg: '#27500A', text: '#27500A' },
  red:    { bg: '#FCEBEB', fg: '#791F1F', text: '#791F1F' },
}
