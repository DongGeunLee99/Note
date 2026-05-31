import { IconNote } from '@tabler/icons-react'
import ToggleSwitch from '../common/ToggleSwitch'
import Badge from '../common/Badge'
import type { LocalAlarm } from '../../types/localAlarm'
import { formatTime, formatRepeat } from '../../types/localAlarm'

interface AlarmCardProps {
  alarm: LocalAlarm
  groupEnabled: boolean
  onToggle: () => void
  onEdit: () => void
}

export default function AlarmCard({ alarm, groupEnabled, onToggle, onEdit }: AlarmCardProps) {
  const isEffectivelyOff = !alarm.isEnabled || !groupEnabled

  return (
    <div
      onClick={onEdit}
      className={`flex items-center gap-2 pl-8 pr-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-black/[0.03] ${isEffectivelyOff ? 'opacity-35' : ''}`}
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

      <div onClick={e => e.stopPropagation()}>
        <ToggleSwitch
          enabled={alarm.isEnabled}
          onToggle={onToggle}
          disabled={!groupEnabled}
          size="sm"
        />
      </div>
    </div>
  )
}
