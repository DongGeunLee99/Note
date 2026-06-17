import ToggleSwitch from '@/components/common/ToggleSwitch'
import { useTranslation } from 'react-i18next'
import type { AlarmGroup } from '@smartnote/shared/types'
import { groupBg, displayGroupIcon } from '@/types/localAlarm'

interface AlarmGroupCardProps {
  group: AlarmGroup
  alarmCount: number
  onToggle: () => void
  onEdit: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function AlarmGroupCard({ group, alarmCount, onToggle, onEdit, onContextMenu }: AlarmGroupCardProps) {
  const { t } = useTranslation()

  return (
    <div
      onClick={onEdit}
      onContextMenu={onContextMenu}
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors hover-tint"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-sm leading-none"
        style={{ background: groupBg(group.color) }}
      >
        {displayGroupIcon(group.icon)}
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
