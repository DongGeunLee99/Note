export type CalView = 'month' | 'week' | 'day'

export interface RbcEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  isPreset: boolean
  color: string
  hasAlarm: boolean
}

export interface CalendarEventData {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  color: string
  hasAlarm: boolean
  alarmMinutesBefore: number
}
