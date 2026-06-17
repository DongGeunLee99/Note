import { IconNote } from '@tabler/icons-react'
import ToggleSwitch from '@/components/common/ToggleSwitch'
import Badge from '@/components/common/Badge'
import type { Alarm } from '@smartnote/shared/types'
import { formatTime, formatRepeat } from '@/types/localAlarm'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'

interface AlarmCardProps {
  alarm: Alarm
  groupEnabled: boolean
  onToggle: () => void
  onEdit: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function AlarmCard({ alarm, groupEnabled, onToggle, onEdit, onContextMenu }: AlarmCardProps) {
  const { timeFormat } = useSettingsStore()
  const { t } = useTranslation()
  const lang = useLang()
  const isEffectivelyOff = !alarm.isEnabled || !groupEnabled

  return (
    <div
      onClick={onEdit}
      onContextMenu={onContextMenu}
      className={`flex items-center gap-2 pl-8 pr-2 py-1.5 rounded-lg cursor-pointer transition-colors hover-tint ${isEffectivelyOff ? 'opacity-35' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium tabular-nums">
            {formatTime(alarm.hour, alarm.minute, timeFormat)}
          </span>
          <span className="text-[11px] truncate">{alarm.label}</span>
          {alarm.sourceMemoId && (
            <IconNote size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} title={t('alarm.memoLinked')} />
          )}
        </div>
        <p className="text-[9px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {formatRepeat(alarm.repeatDays, lang)}
        </p>
      </div>

      <Badge variant="gray">{formatRepeat(alarm.repeatDays, lang)}</Badge>

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
