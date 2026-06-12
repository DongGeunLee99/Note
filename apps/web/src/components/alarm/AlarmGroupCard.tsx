import ToggleSwitch from '@/components/common/ToggleSwitch'
import { useTranslation } from 'react-i18next'
import type { LocalAlarmGroup } from '@/types/localAlarm'
import { GROUP_COLORS } from '@/types/localAlarm'

interface AlarmGroupCardProps {
  group: LocalAlarmGroup
  alarmCount: number
  onToggle: () => void
  onEdit: () => void
}

export default function AlarmGroupCard({ group, alarmCount, onToggle, onEdit }: AlarmGroupCardProps) {
  const { t } = useTranslation()
  const colorDef = GROUP_COLORS.find(c => c.fg === group.color) ?? GROUP_COLORS[0]

  return (
    <div
      onClick={onEdit}
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors hover-tint"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-sm leading-none"
        style={{ background: colorDef.bg }}
      >
        {group.emoji}
      </div>

      <span className="text-[11px] font-medium flex-1">{group.name}</span>

      <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
        {t('common.count', { n: alarmCount })}
      </span>

      <div onClick={e => e.stopPropagation()}>
        <ToggleSwitch enabled={group.isEnabled} onToggle={onToggle} size="sm" />
      </div>
    </div>
  )
}
