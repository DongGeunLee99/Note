import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { type Language } from '@/i18n'

export type TimeFormat = '12h' | '24h'

export type ThemeMode = 'system' | 'light' | 'dark' | 'purple' | 'blue'

/** 앱 언어 = i18n의 Language 단일 출처 (언어 추가 시 i18n에서만 정의) */
export type AppLanguage = Language

interface SettingsState {
  timeFormat: TimeFormat
  setTimeFormat: (fmt: TimeFormat) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      timeFormat: '24h',
      setTimeFormat: (fmt) => set({ timeFormat: fmt }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      language: 'ko',
      setLanguage: (language) => {
        i18n.changeLanguage(language)
        set({ language })
      },
    }),
    {
      name: 'smartnote_settings',
      onRehydrateStorage: () => (state) => {
        if (state?.language) i18n.changeLanguage(state.language)
      },
    }
  )
)

/** theme 설정을 실제 data-theme 값으로 변환 ('system'은 OS 설정 추종) */
export function resolveTheme(theme: ThemeMode, prefersDark: boolean): Exclude<ThemeMode, 'system'> {
  if (theme === 'system') return prefersDark ? 'dark' : 'light'
  return theme
}

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
