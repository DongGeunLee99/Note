import type { Timestamp } from 'firebase/firestore'

export type Platform = 'web' | 'electron' | 'mobile'

export interface Device {
  deviceId: string
  platform: Platform
  isActive: boolean
  lastActiveAt: Timestamp
  fcmToken: string | null
  userAgent: string
  createdAt: Timestamp
}
