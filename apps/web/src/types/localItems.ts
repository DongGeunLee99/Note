import type { ClassifiedCategory } from '../services/llamaService'

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
