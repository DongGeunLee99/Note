import { IconBell, IconTrash } from '@tabler/icons-react'
import type { RbcEvent } from './types'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { fmtTime, resolveEventColor, eventTintBg } from './calendarUtils'

interface Props {
  event: RbcEvent
  onDelete?: () => void
  onSelect?: () => void
}

export default function AgendaItem({ event, onDelete, onSelect }: Props) {
  const timeFormat = useSettingsStore(s => s.timeFormat)
  return (
    <div className="flex items-stretch gap-1.5 mb-1 group">
      <div className="w-[3px] rounded-full flex-shrink-0 my-0.5" style={{ background: resolveEventColor(event.color) }} />
      <div onClick={onSelect} className="flex-1 min-w-0 rounded-md px-2 py-1 cursor-pointer" style={{ background: eventTintBg(event.color) }}>
        <div className="flex items-center gap-1">
          <p className="text-[9px] font-medium" style={{ color: resolveEventColor(event.color) }}>{fmtTime(event.start, timeFormat)}</p>
          {event.hasAlarm && <IconBell size={8} style={{ color: resolveEventColor(event.color), flexShrink: 0 }} />}
        </div>
        <p className="text-[10px] font-medium truncate" style={{ color: 'var(--color-text)' }}>{event.title}</p>
      </div>
      {onDelete && (
        <button onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity self-center flex-shrink-0 ml-0.5">
          <IconTrash size={10} style={{ color: 'var(--color-danger)' }} />
        </button>
      )}
    </div>
  )
}
