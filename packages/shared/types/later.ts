import type { Timestamp } from 'firebase/firestore'

export interface Later {
  laterId: string
  title: string
  notifyAt: Timestamp
  isCompleted: boolean
  completedAt: Timestamp | null
  snoozedCount: number
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
}

export type SomedayCategory = '여행' | '배움' | '구매' | '기타'

export interface Someday {
  somedayId: string
  title: string
  category: SomedayCategory
  aiCategory: string | null
  isFavorite: boolean
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
}
