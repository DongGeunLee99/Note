import { Fragment, useMemo } from 'react'
import { IconBell, IconCalendarEvent } from '@tabler/icons-react'
import SectionLabel from '@/components/common/SectionLabel'
import { TONES } from '@/theme/tones'
import { useTranslation } from 'react-i18next'
import { INITIAL_TODAY_SCHEDULE } from '@/mocks/mockData'

function formatClock(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function NowLine({ label, nowText }: { label: string; nowText: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="w-10 text-right text-[calc(9px*var(--fs))] font-semibold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
        {label}
      </span>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-primary)' }} />
      <span className="h-px flex-1" style={{ background: 'var(--color-primary)' }} />
      <span className="text-[calc(8px*var(--fs))] font-semibold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{nowText}</span>
    </div>
  )
}

export default function TodayTimeline() {
  const { t } = useTranslation()
  const now = useMemo(() => new Date(), [])
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nowLabel = formatClock(now.getHours(), now.getMinutes())

  const items = useMemo(
    () => [...INITIAL_TODAY_SCHEDULE].sort(
      (a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute),
    ),
    [],
  )

  const remaining = items.filter(i => i.hour * 60 + i.minute >= nowMin).length
  const nowIndex = items.findIndex(i => i.hour * 60 + i.minute >= nowMin)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SectionLabel>{t('home.todaySchedule')}</SectionLabel>
        <span className="text-[calc(9px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>{t('home.remaining', { n: remaining })}</span>
      </div>

      <div className="flex flex-col">
        {items.map((item, i) => {
          const itemMin = item.hour * 60 + item.minute
          const isPast = itemMin < nowMin
          const tone = TONES[item.tone]
          return (
            <Fragment key={item.id}>
              {i === nowIndex && <NowLine label={nowLabel} nowText={t('home.now')} />}
              <div className="flex gap-2.5" style={{ opacity: isPast ? 0.4 : 1 }}>
                <span
                  className="w-10 text-right text-[calc(10px*var(--fs))] pt-1 flex-shrink-0"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {formatClock(item.hour, item.minute)}
                </span>
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full mt-1.5" style={{ background: tone.fg }} />
                  {i < items.length - 1 && (
                    <span className="w-px flex-1 mt-0.5" style={{ background: 'var(--color-border)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-1.5 pt-0.5 pb-3">
                  {item.kind === '알람'
                    ? <IconBell size={12} style={{ color: tone.fg, flexShrink: 0 }} />
                    : <IconCalendarEvent size={12} style={{ color: tone.fg, flexShrink: 0 }} />}
                  <span className="text-[calc(11px*var(--fs))] font-medium truncate">{item.title}</span>
                  {item.group && (
                    <span className="text-[calc(9px*var(--fs))] flex-shrink-0" style={{ color: 'var(--color-muted)' }}>· {item.group}</span>
                  )}
                </div>
              </div>
            </Fragment>
          )
        })}
        {nowIndex === -1 && <NowLine label={nowLabel} nowText={t('home.now')} />}
      </div>
    </div>
  )
}
