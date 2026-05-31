import { IconPencil, IconTrash } from '@tabler/icons-react'
import ToggleSwitch from '../common/ToggleSwitch'
import type { LocalAlarmGroup } from '../../types/localAlarm'
import { GROUP_COLORS } from '../../types/localAlarm'

interface AlarmGroupCardProps {
  group: LocalAlarmGroup
  alarmCount: number
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function AlarmGroupCard({ group, alarmCount, onToggle, onEdit, onDelete }: AlarmGroupCardProps) {
  const colorDef = GROUP_COLORS.find(c => c.fg === group.color) ?? GROUP_COLORS[0]

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
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
        {alarmCount}개
      </span>

      <button
        onClick={onEdit}
        className="p-1 rounded hover:bg-black/5 transition-colors"
        title="그룹 편집"
      >
        <IconPencil size={13} style={{ color: 'var(--color-muted)' }} />
      </button>

      {!group.isDefault && (
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-50 transition-colors"
          title="그룹 삭제"
        >
          <IconTrash size={13} style={{ color: '#791F1F' }} />
        </button>
      )}

      <ToggleSwitch enabled={group.isEnabled} onToggle={onToggle} size="sm" />
    </div>
  )
}
