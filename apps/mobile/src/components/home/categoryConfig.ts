import type { Ionicons } from '@expo/vector-icons'
import type { ClassifiedCategory } from '@smartnote/shared/services/llamaService'

export type HomeCategory = 'AI' | ClassifiedCategory

export const HOME_CATEGORIES: HomeCategory[] = ['AI', '일정', '알람', '할일', '메모', '나중에', '언젠가']

export const CATEGORY_CONFIG: Record<HomeCategory, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }> = {
  AI: { label: 'AI 자동', icon: 'sparkles-outline', bg: '#EEF2FF', fg: '#4F46E5' },
  일정: { label: '일정', icon: 'calendar-outline', bg: '#EFF6FF', fg: '#2563EB' },
  알람: { label: '알람', icon: 'alarm-outline', bg: '#EFF6FF', fg: '#2563EB' },
  할일: { label: '할일', icon: 'checkbox-outline', bg: '#FFFBEB', fg: '#B45309' },
  메모: { label: '메모', icon: 'document-text-outline', bg: '#F3F4F6', fg: '#4B5563' },
  나중에: { label: '나중에', icon: 'time-outline', bg: '#F5F3FF', fg: '#7C3AED' },
  언젠가: { label: '언젠가', icon: 'star-outline', bg: '#ECFDF5', fg: '#059669' },
}
