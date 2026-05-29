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
  location: MemoLocation
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
