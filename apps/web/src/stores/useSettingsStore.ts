import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimeFormat = '12h' | '24h'

interface SettingsState {
  timeFormat: TimeFormat
  setTimeFormat: (fmt: TimeFormat) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      timeFormat: '24h',
      setTimeFormat: (fmt) => set({ timeFormat: fmt }),
    }),
    { name: 'smartnote_settings' }
  )
)

export function formatClock(hour: number, minute: number, fmt: TimeFormat): string {
  if (fmt === '24h') {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${String(minute).padStart(2, '0')} ${period}`
}

export function formatClockFromDate(date: Date, fmt: TimeFormat): string {
  return formatClock(date.getHours(), date.getMinutes(), fmt)
}

export function formatHourLabel(hour: number, fmt: TimeFormat): string {
  if (fmt === '24h') return `${String(hour).padStart(2, '0')}:00`
  if (hour === 0)  return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}
