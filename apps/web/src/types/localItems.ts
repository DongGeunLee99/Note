import type { ClassifiedCategory } from '@smartnote/shared/services/llamaService'

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
