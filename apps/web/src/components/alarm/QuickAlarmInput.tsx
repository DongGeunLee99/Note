import { useState } from 'react'
import { parse } from 'chrono-node'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { formatTime } from '../../types/localAlarm'
import { IconBolt, IconX, IconCheck } from '@tabler/icons-react'
import Spinner from '../common/Spinner'
import type { LocalAlarmGroup } from '../../types/localAlarm'

interface ParsedResult {
  hour: number
  minute: number
  label: string
}

interface QuickAlarmInputProps {
  groups: LocalAlarmGroup[]
  onAdd: (groupId: string, hour: number, minute: number, label: string) => void
}

export default function QuickAlarmInput({ groups, onAdd }: QuickAlarmInputProps) {
  const { timeFormat } = useSettingsStore()
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<ParsedResult | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.groupId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setError(false)

    setTimeout(() => {
      const results = parse(text, new Date(), { forwardDate: true })
      if (results.length > 0) {
        const date = results[0].date()
        const label = text
          .replace(/\d+시(\s*\d+분)?/, '')
          .replace(/오전|오후|내일|모레|다음주?\s*\w+요일/, '')
          .trim() || '알람'
        setParsed({ hour: date.getHours(), minute: date.getMinutes(), label })
      } else {
        setError(true)
      }
      setLoading(false)
    }, 300)
  }

  function handleConfirm() {
    if (!parsed) return
    onAdd(selectedGroupId, parsed.hour, parsed.minute, parsed.label)
    setText('')
    setParsed(null)
    setError(false)
  }

  function handleCancel() {
    setParsed(null)
    setError(false)
    setText('')
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border"
        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)' }}
      >
        <IconBolt size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <input
          type="text"
          value={text}
          onChange={e => { setText(e.target.value); setParsed(null); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleParse()}
          placeholder="내일 오전 9시에 알려줘"
          className="flex-1 text-[11px] outline-none bg-transparent"
          style={{ color: parsed ? '#1a1a18' : 'var(--color-muted)' }}
        />
        {loading && <Spinner size="sm" />}
      </div>

      {error && (
        <p className="text-[10px] px-1" style={{ color: '#791F1F' }}>
          시간을 인식하지 못했어요. 다시 입력해보세요.
        </p>
      )}

      {parsed && (
        <div
          className="flex flex-col gap-2 p-2 rounded-lg border"
          style={{ background: 'var(--color-primary-subtle)', borderColor: 'var(--color-border-2)' }}
        >
          <div>
            <p className="text-[9px] mb-0.5" style={{ color: 'var(--color-primary)' }}>인식된 알람</p>
            <p className="text-[12px] font-medium" style={{ color: 'var(--color-primary-emphasis)' }}>
              {formatTime(parsed.hour, parsed.minute, timeFormat)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-primary)' }}>{parsed.label}</p>
          </div>

          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="text-[10px] border rounded px-1.5 py-1 outline-none w-full"
            style={{ borderColor: 'var(--color-border-2)', background: 'white' }}
          >
            {groups.map(g => (
              <option key={g.groupId} value={g.groupId}>{g.emoji} {g.name}</option>
            ))}
          </select>

          <div className="flex gap-1.5">
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <IconCheck size={12} /> 추가
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center px-2 py-1.5 rounded-lg border text-[10px]"
              style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
            >
              <IconX size={12} />
            </button>
          </div>
        </div>
      )}

      {!parsed && !error && (
        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="text-[10px] py-1.5 rounded-lg border disabled:opacity-40 transition-opacity"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          시간 인식하기
        </button>
      )}
    </div>
  )
}
