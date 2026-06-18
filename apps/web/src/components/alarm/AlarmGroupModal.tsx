import { useState, useEffect } from 'react'
import { IconSparkles } from '@tabler/icons-react'
import Modal from '@/components/common/Modal'
import { useTranslation } from 'react-i18next'
import type { AlarmGroup } from '@smartnote/shared/types'
import type { GroupFormInput } from '@smartnote/shared/services/alarmGroupService'
import { GROUP_COLORS, GROUP_EMOJIS, GROUP_THEME_COLOR, displayGroupIcon } from '@/types/localAlarm'

interface AlarmGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: GroupFormInput) => void
  onDelete?: () => void
  initial?: AlarmGroup | null
}

export default function AlarmGroupModal({ isOpen, onClose, onSave, onDelete, initial }: AlarmGroupModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(GROUP_THEME_COLOR)
  const [emoji, setEmoji] = useState(GROUP_EMOJIS[0])

  useEffect(() => {
    if (isOpen) {
      setName(initial?.name ?? '')
      setColor(initial?.color ?? GROUP_THEME_COLOR)
      setEmoji(initial ? displayGroupIcon(initial.icon) : GROUP_EMOJIS[0])
    }
  }, [isOpen, initial])

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), color, icon: emoji })
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
            disabled={!name.trim()}
            className="text-[calc(10px*var(--fs))] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div
          className="flex items-center justify-between py-1.5 border-b text-[calc(11px*var(--fs))]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldGroupName')}</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('alarm.groupNamePlaceholder')}
            maxLength={20}
            className="text-right text-[calc(11px*var(--fs))] outline-none bg-transparent w-32"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div>
          <p className="text-[calc(9px*var(--fs))] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldColor')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setColor(GROUP_THEME_COLOR)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
              style={{
                background: 'var(--color-primary)',
                borderColor: color === GROUP_THEME_COLOR ? 'var(--color-primary)' : 'transparent',
              }}
            >
              <IconSparkles size={12} color="#fff" />
            </button>
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
          {color === GROUP_THEME_COLOR && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg text-[calc(9px*var(--fs))]"
              style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
              <IconSparkles size={11} style={{ flexShrink: 0 }} />
              <span>{t('common.themeColorHint')}</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[calc(9px*var(--fs))] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>{t('alarm.fieldIcon')}</p>
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
