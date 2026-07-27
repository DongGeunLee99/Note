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
  /** aiSummary를 생성할 당시의 본문 스냅샷. 현재 body와 다르면 AI 정리가 최신 본문을 반영하지 않은 상태 */
  aiSummaryBody: string | null
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
