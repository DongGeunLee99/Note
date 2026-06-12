import { IconClock } from '@tabler/icons-react'
import SectionLabel from '@/components/common/SectionLabel'
import Badge from '@/components/common/Badge'
import { TONES } from '@/theme/tones'
import { useTranslation } from 'react-i18next'
import { useLaterStore } from '@/stores/useLaterStore'

export default function UpcomingDeadlines() {
  const items = useLaterStore(s => s.items)
  const { t } = useTranslation()
  const pending = items.filter(i => !i.isCompleted).slice(0, 4)

  if (pending.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{t('home.upcoming')}</SectionLabel>
      {pending.map(item => {
        const isToday = item.notifyAt.includes('오늘')
        const tone = isToday ? TONES.red : TONES.violet
        return (
          <div
            key={item.id}
            className="flex items-center gap-2 py-1.5 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: tone.bg }}
            >
              <IconClock size={13} style={{ color: tone.fg }} />
            </div>
            <span className="text-[11px] font-medium flex-1 min-w-0 truncate">{item.text}</span>
            <Badge variant={isToday ? 'red' : 'violet'}>{item.notifyAt}</Badge>
          </div>
        )
      })}
    </div>
  )
}
