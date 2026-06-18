import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Select from '@/components/common/Select'
import { useTranslation } from 'react-i18next'
import type { Alarm, AlarmGroup } from '@smartnote/shared/types'
import type { AlarmFormInput } from '@smartnote/shared/services/alarmService'
import { displayGroupIcon } from '@/types/localAlarm'

interface AlarmModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AlarmFormInput) => void
  onDelete?: () => void
  groups: AlarmGroup[]
  initial?: Alarm | null
  defaultGroupId?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

const REPEAT_PRESETS: { key: string; days: number[] }[] = [
  { key: 'alarm.repeatWeekday',  days: [1, 2, 3, 4, 5] },
  { key: 'alarm.repeatWeekend',  days: [0, 6] },
  { key: 'alarm.repeatEveryday', days: [0, 1, 2, 3, 4, 5, 6] },
]
const sameDays = (a: number[], b: number[]) =>
  a.length === b.length &&
  [...a].sort((x, y) => x - y).join(',') === [...b].sort((x, y) => x - y).join(',')

export default function AlarmModal({ isOpen, onClose, onSave, onDelete, groups, initial, defaultGroupId }: AlarmModalProps) {
  const { t } = useTranslation()
  const [label, setLabel] = useState('')
  const [hour, setHour] = useState(7)
  const [minute, setMinute] = useState(0)
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [groupId, setGroupId] = useState(defaultGroupId ?? groups[0]?.groupId ?? '')
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setLabel(initial?.label ?? '')
      setHour(initial?.hour ?? now.getHours())
      setMinute(initial?.minute ?? now.getMinutes())
      setRepeatDays(initial?.repeatDays ?? [1, 2, 3, 4, 5])
      setGroupId(initial?.groupId ?? defaultGroupId ?? groups[0]?.groupId ?? '')
      setIsEnabled(initial?.isEnabled ?? true)
    }
  }, [isOpen, initial, defaultGroupId, groups])

  function toggleDay(day: number) {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function handleSave() {
    if (!label.trim() || !groupId) return
    onSave({ label: label.trim(), hour, minute, repeatDays, groupId, isEnabled })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? t('alarm.modalEdit') : t('alarm.modalAdd')}
      footer={
        <>
          {initial && onDelete && (
            <button
              onClick={onDelete}
              className="text-[calc(10px*var(--fs))] px-3 py-1.5 rounded-lg border mr-auto"
              style={{ borderColor: 'var(--color-danger-border)', color: 'var(--color-danger)' }}
            >
              {t('common.delete')}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[calc(10px*var(--fs))] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="text-[calc(10px*var(--fs))] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-0">
        {[
          {
            label: t('alarm.fieldName'),
            content: (
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder={t('alarm.namePlaceholder')}
                maxLength={30}
                className="text-right text-[calc(11px*var(--fs))] outline-none bg-transparent w-36"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            ),
          },
          {
            label: t('alarm.fieldTime'),
            content: (
              <div className="flex items-center gap-1">
                <Select
                  value={hour}
                  onChange={setHour}
                  className="text-[calc(11px*var(--fs))] border rounded px-1 py-0.5 outline-none"
                  options={HOURS.map(h => ({ value: h, label: String(h).padStart(2, '0') }))}
                />
                <span className="text-[calc(11px*var(--fs))]">:</span>
                <Select
                  value={minute}
                  onChange={setMinute}
                  className="text-[calc(11px*var(--fs))] border rounded px-1 py-0.5 outline-none"
                  options={MINUTES.map(m => ({ value: m, label: String(m).padStart(2, '0') }))}
                />
              </div>
            ),
          },
          {
            label: t('alarm.fieldGroup'),
            content: (
              <Select
                value={groupId}
                onChange={setGroupId}
                className="text-[calc(11px*var(--fs))] border rounded px-1 py-0.5 outline-none"
                options={groups.map(g => ({ value: g.groupId, label: `${displayGroupIcon(g.icon)} ${g.name}` }))}
              />
            ),
          },
        ].map(row => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 border-b text-[calc(11px*var(--fs))]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
            {row.content}
          </div>
        ))}

        <div className="pt-2">
          <p className="text-[calc(10px*var(--fs))] mb-2" style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldRepeat')}</p>
          <div className="flex gap-1.5 mb-2">
            {REPEAT_PRESETS.map(p => {
              const active = sameDays(repeatDays, p.days)
              return (
                <button
                  key={p.key}
                  onClick={() => setRepeatDays(p.days)}
                  className="text-[calc(9px*var(--fs))] px-2 py-1 rounded-full border transition-colors"
                  style={{
                    background: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-muted)',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border-2)',
                  }}
                >
                  {t(p.key)}
                </button>
              )
            })}
          </div>
          <div className="flex gap-1.5">
            {(t('time.dayNames', { returnObjects: true }) as string[]).map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className="text-[calc(9px*var(--fs))] px-2 py-1 rounded-full border transition-colors"
                style={{
                  background: repeatDays.includes(i) ? 'var(--color-primary)' : 'transparent',
                  color: repeatDays.includes(i) ? '#fff' : 'var(--color-muted)',
                  borderColor: repeatDays.includes(i) ? 'var(--color-primary)' : 'var(--color-border-2)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
