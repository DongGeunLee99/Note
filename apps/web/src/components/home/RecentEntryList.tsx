import Badge from '@/components/common/Badge'
import { TONES } from '@/theme/tones'
import { formatRelTime } from '@/utils/formatDate'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { useHomeStore } from '@/stores/useHomeStore'
import { CATEGORY_CONFIG } from './categoryConfig'

export default function RecentEntryList() {
  const entries = useHomeStore(s => s.entries)
  const { t } = useTranslation()
  const lang = useLang()

  return (
    <>
      <p className="text-[calc(10px*var(--fs))] font-medium" style={{ color: 'var(--color-muted)' }}>
        {t('home.recent', { n: entries.length })}
      </p>

      {entries.slice(0, 20).map(entry => {
        const cfg = CATEGORY_CONFIG[entry.category]
        return (
          <div
            key={entry.id}
            className="flex items-center gap-2 py-1.5 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: TONES[cfg.tone].bg }}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[calc(11px*var(--fs))] font-medium truncate">{entry.text}</p>
              <p className="text-[calc(9px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>
                {formatRelTime(entry.createdAt, lang)}
              </p>
            </div>
            <Badge variant={cfg.tone}>{t(`category.${entry.category}`)}</Badge>
          </div>
        )
      })}
    </>
  )
}
