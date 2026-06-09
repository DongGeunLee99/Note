import Badge from '../common/Badge'
import { TONES } from '../../theme/tones'
import { formatRelTime } from '../../utils/formatDate'
import { useHomeStore } from '../../stores/useHomeStore'
import { CATEGORY_CONFIG } from './categoryConfig'

export default function RecentEntryList() {
  const entries = useHomeStore(s => s.entries)

  return (
    <>
      <p className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>
        최근 기록 ({entries.length})
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
              <p className="text-[11px] font-medium truncate">{entry.text}</p>
              <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                {formatRelTime(entry.createdAt)}
              </p>
            </div>
            <Badge variant={cfg.tone}>{entry.category}</Badge>
          </div>
        )
      })}
    </>
  )
}
