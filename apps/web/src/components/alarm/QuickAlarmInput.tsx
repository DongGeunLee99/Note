import { useState } from 'react'
import { parse } from 'chrono-node'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useTranslation } from 'react-i18next'
import { formatTime, displayGroupIcon } from '@/types/localAlarm'
import { IconBolt, IconX, IconCheck } from '@tabler/icons-react'
import Spinner from '@/components/common/Spinner'
import type { AlarmGroup } from '@smartnote/shared/types'

interface ParsedResult {
  hour: number
  minute: number
  label: string
}

interface QuickAlarmInputProps {
  groups: AlarmGroup[]
  onAdd: (groupId: string, hour: number, minute: number, label: string) => void
}

export default function QuickAlarmInput({ groups, onAdd }: QuickAlarmInputProps) {
  const { timeFormat } = useSettingsStore()
  const { t } = useTranslation()
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
          .trim() || t('alarm.defaultLabel')
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
          placeholder={t('alarm.quickPlaceholder')}
          className="flex-1 text-[11px] outline-none bg-transparent"
          style={{ color: parsed ? 'var(--color-text)' : 'var(--color-muted)' }}
        />
        {loading && <Spinner size="sm" />}
      </div>

      {error && (
        <p className="text-[10px] px-1" style={{ color: 'var(--color-danger)' }}>
          {t('alarm.quickParseError')}
        </p>
      )}

      {parsed && (
        <div
          className="flex flex-col gap-2 p-2 rounded-lg border"
          style={{ background: 'var(--color-primary-subtle)', borderColor: 'var(--color-border-2)' }}
        >
          <div>
            <p className="text-[9px] mb-0.5" style={{ color: 'var(--color-primary)' }}>{t('alarm.quickRecognized')}</p>
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
              <option key={g.groupId} value={g.groupId}>{displayGroupIcon(g.icon)} {g.name}</option>
            ))}
          </select>

          <div className="flex gap-1.5">
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <IconCheck size={12} /> {t('common.add')}
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
          {t('alarm.quickParseBtn')}
        </button>
      )}
    </div>
  )
}
