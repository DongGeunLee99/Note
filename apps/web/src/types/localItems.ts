import type { ClassifiedCategory } from '@/services/llamaService'
import type { Tone } from '@/theme/tones'

// 나중에
export interface LaterItem {
  id: string
  text: string
  notifyAt: string
  isCompleted: boolean
}

// 언젠가
export type SomedayCategory = '여행' | '배움' | '구매' | '기타'

export interface SomedayItem {
  id: string
  title: string
  category: SomedayCategory
  isFavorite: boolean
}

// 휴지통
export type TrashType = 'memo' | 'alarm' | 'later'

export interface TrashItem {
  id: string
  type: TrashType
  title: string
  preview: string
  deletedAt: Date
}

// 홈 최근 기록
export interface RecentEntry {
  id: string
  text: string
  category: ClassifiedCategory
  createdAt: Date
}

// 홈 오늘 일정 타임라인
export type TodayItemKind = '일정' | '알람'

export interface TodayScheduleItem {
  id: string
  hour: number
  minute: number
  title: string
  kind: TodayItemKind
  group: string | null
  tone: Tone
}
