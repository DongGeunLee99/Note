import type { Timestamp } from 'firebase/firestore'

export interface DetectedAlarm {
  datetime: string
  label: string
  confirmed: boolean
}

export interface MemoLocation {
  lat: number | null
  lng: number | null
  label: string | null
}

export interface Memo {
  memoId: string
  title: string
  body: string
  aiSummary: string | null
  aiProcessed: boolean
  aiProcessedAt: Timestamp | null
  detectedAlarms: DetectedAlarm[]
  /** AI 정리를 사용자가 직접 수정했는지 — 재분석 덮어쓰기 방지 */
  aiSummaryEdited: boolean
  location: MemoLocation
  /** 고정 시각(ms epoch). null이면 미고정. 목록 최상단 정렬용 */
  pinnedAt: number | null
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
