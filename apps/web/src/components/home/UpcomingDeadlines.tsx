import { IconClock } from '@tabler/icons-react'
import SectionLabel from '@/components/common/SectionLabel'
import Badge from '@/components/common/Badge'
import { TONES } from '@/theme/tones'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { useLaterStore } from '@/stores/useLaterStore'
import { formatSuggestionTime } from '@/utils/formatDate'

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function UpcomingDeadlines() {
  const items = useLaterStore(s => s.items)
  const { t } = useTranslation()
  const lang = useLang()
  const pending = items.filter(i => !i.isCompleted).slice(0, 4)

  if (pending.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{t('home.upcoming')}</SectionLabel>
      {pending.map(item => {
        const notifyDate = item.notifyAt.toDate()
        const isToday = isSameDay(notifyDate, new Date())
        const tone = isToday ? TONES.red : TONES.violet
        return (
          <div
            key={item.laterId}
            className="flex items-center gap-2 py-1.5 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: tone.bg }}
            >
              <IconClock size={13} style={{ color: tone.fg }} />
            </div>
            <span className="text-[calc(11px*var(--fs))] font-medium flex-1 min-w-0 truncate">{item.title}</span>
            <Badge variant={isToday ? 'red' : 'violet'}>{formatSuggestionTime(notifyDate, lang)}</Badge>
          </div>
        )
      })}
    </div>
  )
}
