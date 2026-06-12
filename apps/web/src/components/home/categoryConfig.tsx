import { IconCalendar, IconBriefcase, IconBell, IconNote, IconClock, IconStar } from '@tabler/icons-react'
import { TONES, type Tone } from '@/theme/tones'
import type { HomeCategory } from '@/stores/useHomeStore'

export const HOME_CATEGORIES: HomeCategory[] = ['AI', '일정', '알람', '할일', '메모', '나중에', '언젠가']

export const CATEGORY_CONFIG: Record<HomeCategory, { icon: React.ReactNode; tone: Tone }> = {
  'AI':   { icon: <IconCalendar size={13} style={{ color: TONES.blue.fg }} />,    tone: 'blue' },
  '일정':  { icon: <IconCalendar size={13} style={{ color: TONES.blue.fg }} />,    tone: 'blue' },
  '알람':  { icon: <IconBell size={13} style={{ color: TONES.blue.fg }} />,        tone: 'blue' },
  '할일':  { icon: <IconBriefcase size={13} style={{ color: TONES.amber.fg }} />,  tone: 'amber' },
  '메모':  { icon: <IconNote size={13} style={{ color: TONES.gray.fg }} />,        tone: 'gray' },
  '나중에': { icon: <IconClock size={13} style={{ color: TONES.violet.fg }} />,    tone: 'violet' },
  '언젠가': { icon: <IconStar size={13} style={{ color: TONES.green.fg }} />,      tone: 'green' },
}
