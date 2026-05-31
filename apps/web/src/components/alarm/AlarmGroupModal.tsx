import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import type { LocalAlarmGroup } from '../../types/localAlarm'
import { GROUP_COLORS, GROUP_EMOJIS } from '../../types/localAlarm'

interface AlarmGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; color: string; emoji: string }) => void
  initial?: LocalAlarmGroup | null
}

export default function AlarmGroupModal({ isOpen, onClose, onSave, initial }: AlarmGroupModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(GROUP_COLORS[0].fg)
  const [emoji, setEmoji] = useState(GROUP_EMOJIS[0])

  useEffect(() => {
    if (isOpen) {
      setName(initial?.name ?? '')
      setColor(initial?.color ?? GROUP_COLORS[0].fg)
      setEmoji(initial?.emoji ?? GROUP_EMOJIS[0])
    }
  }, [isOpen, initial])

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), color, emoji })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? '그룹 편집' : '그룹 추가'}
      footer={
        <>
          <button
            onClick={onClose}
            className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            저장
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div
          className="flex items-center justify-between py-1.5 border-b text-[11px]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-muted)' }}>그룹 이름</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름 입력"
            maxLength={20}
            className="text-right text-[11px] outline-none bg-transparent w-32"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>색상</p>
          <div className="flex gap-2">
            {GROUP_COLORS.map(c => (
              <button
                key={c.fg}
                onClick={() => setColor(c.fg)}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c.bg,
                  borderColor: color === c.fg ? c.fg : 'transparent',
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>아이콘</p>
          <div className="flex flex-wrap gap-1.5">
            {GROUP_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-colors"
                style={{
                  background: emoji === e ? 'var(--color-primary-subtle)' : 'var(--color-surface-2)',
                  outline: emoji === e ? `1.5px solid var(--color-primary)` : 'none',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
