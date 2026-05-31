import { IconPencil, IconTrash, IconNote } from '@tabler/icons-react'
import ToggleSwitch from '../common/ToggleSwitch'
import Badge from '../common/Badge'
import type { LocalAlarm } from '../../types/localAlarm'
import { formatTime, formatRepeat } from '../../types/localAlarm'

interface AlarmCardProps {
  alarm: LocalAlarm
  groupEnabled: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function AlarmCard({ alarm, groupEnabled, onToggle, onEdit, onDelete }: AlarmCardProps) {
  const isEffectivelyOff = !alarm.isEnabled || !groupEnabled

  return (
    <div
      className={`flex items-center gap-2 pl-8 pr-2 py-1.5 transition-opacity ${isEffectivelyOff ? 'opacity-35' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium tabular-nums">
            {String(alarm.hour).padStart(2, '0')}:{String(alarm.minute).padStart(2, '0')}
          </span>
          <span className="text-[11px] truncate">{alarm.label}</span>
          {alarm.sourceMemoId && (
            <IconNote size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} title="메모 연동" />
          )}
        </div>
        <p className="text-[9px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {formatTime(alarm.hour, alarm.minute)} · {formatRepeat(alarm.repeatDays)}
        </p>
      </div>

      <Badge variant="gray">{formatRepeat(alarm.repeatDays)}</Badge>

      <button
        onClick={onEdit}
        className="p-1 rounded hover:bg-black/5 transition-colors flex-shrink-0"
        disabled={!groupEnabled}
      >
        <IconPencil size={12} style={{ color: 'var(--color-muted)' }} />
      </button>

      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <IconTrash size={12} style={{ color: '#791F1F' }} />
      </button>

      <ToggleSwitch
        enabled={alarm.isEnabled}
        onToggle={onToggle}
        disabled={!groupEnabled}
        size="sm"
      />
    </div>
  )
}
