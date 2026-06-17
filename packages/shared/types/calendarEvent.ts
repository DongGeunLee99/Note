import type { Timestamp } from 'firebase/firestore'

export interface CalendarEvent {
  eventId: string
  title: string
  description: string
  start: Timestamp
  end: Timestamp
  color: string
  hasAlarm: boolean
  alarmMinutesBefore: number
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
