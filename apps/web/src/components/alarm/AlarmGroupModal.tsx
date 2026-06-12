import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import { useTranslation } from 'react-i18next'
import type { LocalAlarmGroup } from '@/types/localAlarm'
import { GROUP_COLORS, GROUP_EMOJIS } from '@/types/localAlarm'

interface AlarmGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; color: string; emoji: string }) => void
  onDelete?: () => void
  initial?: LocalAlarmGroup | null
}

export default function AlarmGroupModal({ isOpen, onClose, onSave, onDelete, initial }: AlarmGroupModalProps) {
  const { t } = useTranslation()
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
      title={initial ? t('alarm.groupModalEdit') : t('alarm.groupModalAdd')}
      footer={
        <>
          {initial && !initial.isDefault && onDelete && (
            <button
              onClick={onDelete}
              className="text-[10px] px-3 py-1.5 rounded-lg border mr-auto"
              style={{ borderColor: 'var(--color-danger-border)', color: 'var(--color-danger)' }}
            >
              {t('common.delete')}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div
          className="flex items-center justify-between py-1.5 border-b text-[11px]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldGroupName')}</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('alarm.groupNamePlaceholder')}
            maxLength={20}
            className="text-right text-[11px] outline-none bg-transparent w-32"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldColor')}</p>
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
          <p className="text-[9px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldIcon')}</p>
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
