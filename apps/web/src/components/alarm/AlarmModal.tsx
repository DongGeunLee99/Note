import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import type { LocalAlarm, LocalAlarmGroup } from '../../types/localAlarm'

interface AlarmModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<LocalAlarm, 'alarmId' | 'sourceMemoId'>) => void
  onDelete?: () => void
  groups: LocalAlarmGroup[]
  initial?: LocalAlarm | null
  defaultGroupId?: string
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

export default function AlarmModal({ isOpen, onClose, onSave, onDelete, groups, initial, defaultGroupId }: AlarmModalProps) {
  const [label, setLabel] = useState('')
  const [hour, setHour] = useState(7)
  const [minute, setMinute] = useState(0)
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [groupId, setGroupId] = useState(defaultGroupId ?? groups[0]?.groupId ?? '')
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLabel(initial?.label ?? '')
      setHour(initial?.hour ?? 7)
      setMinute(initial?.minute ?? 0)
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
      title={initial ? '알람 편집' : '알람 추가'}
      footer={
        <>
          {initial && onDelete && (
            <button
              onClick={onDelete}
              className="text-[10px] px-3 py-1.5 rounded-lg border mr-auto"
              style={{ borderColor: '#fca5a5', color: '#791F1F' }}
            >
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            저장
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-0">
        {[
          {
            label: '이름',
            content: (
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="알람 이름"
                maxLength={30}
                className="text-right text-[11px] outline-none bg-transparent w-36"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            ),
          },
          {
            label: '시간',
            content: (
              <div className="flex items-center gap-1">
                <select
                  value={hour}
                  onChange={e => setHour(Number(e.target.value))}
                  className="text-[11px] border rounded px-1 py-0.5 outline-none"
                  style={{ borderColor: 'var(--color-border-2)' }}
                >
                  {HOURS.map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="text-[11px]">:</span>
                <select
                  value={minute}
                  onChange={e => setMinute(Number(e.target.value))}
                  className="text-[11px] border rounded px-1 py-0.5 outline-none"
                  style={{ borderColor: 'var(--color-border-2)' }}
                >
                  {MINUTES.map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            ),
          },
          {
            label: '그룹',
            content: (
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="text-[11px] border rounded px-1 py-0.5 outline-none"
                style={{ borderColor: 'var(--color-border-2)' }}
              >
                {groups.map(g => (
                  <option key={g.groupId} value={g.groupId}>{g.emoji} {g.name}</option>
                ))}
              </select>
            ),
          },
        ].map(row => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 border-b text-[11px]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
            {row.content}
          </div>
        ))}

        <div className="pt-2">
          <p className="text-[10px] mb-2" style={{ color: 'var(--color-muted)' }}>반복</p>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className="text-[9px] px-2 py-1 rounded-full border transition-colors"
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
