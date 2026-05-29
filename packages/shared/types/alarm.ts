import type { Timestamp } from 'firebase/firestore'

export interface AlarmGroup {
  groupId: string
  name: string
  color: string
  icon: string
  isEnabled: boolean
  isDefault: boolean
  order: number
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
}

export type AlarmSourceType = 'manual' | 'quickAlarm' | 'memoDetected'

export interface Alarm {
  alarmId: string
  groupId: string
  label: string
  hour: number
  minute: number
  repeatDays: number[]
  isEnabled: boolean
  sound: string
  vibration: boolean
  snooze: number
  sourceType: AlarmSourceType
  sourceMemoId: string | null
  isDeleted: boolean
  deletedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
