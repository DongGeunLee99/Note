import { IconMapPin, IconTrash, IconBell } from '@tabler/icons-react'
import AiToggleButton from '@/components/common/AiToggleButton'
import Spinner from '@/components/common/Spinner'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { formatRelTime, formatSuggestionTime } from '@/utils/formatDate'
import type { LocalMemo } from '@/types/localMemo'

interface MemoCardProps {
  memo: LocalMemo
  isSelected: boolean
  aiMode: 'original' | 'ai'
  onSelect: () => void
  onAiModeChange: (mode: 'original' | 'ai') => void
  onAlarmConfirm: () => void
  onAlarmDismiss: () => void
  onDelete: () => void
}

export default function MemoCard({
  memo, isSelected, aiMode,
  onSelect, onAiModeChange, onAlarmConfirm, onAlarmDismiss, onDelete,
}: MemoCardProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const displayText = aiMode === 'ai' && memo.aiSummary ? memo.aiSummary : memo.body
  const preview = displayText.length > 80 ? displayText.slice(0, 80) + '…' : displayText

  return (
    <div
      onClick={onSelect}
      className="rounded-lg border p-2.5 cursor-pointer transition-colors"
      style={{
        background: 'var(--color-surface)',
        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[11px] font-medium flex-1 truncate">
          {memo.title || memo.body.split('\n')[0].slice(0, 30)}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{formatRelTime(memo.createdAt, lang)}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-0.5 rounded hover-danger transition-colors"
          >
            <IconTrash size={11} style={{ color: 'var(--color-danger)' }} />
          </button>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed mb-1.5" style={{ color: 'var(--color-muted)' }}>
        {preview}
      </p>

      {memo.location.label && (
        <div className="flex items-center gap-1 mb-1.5">
          <IconMapPin size={10} style={{ color: 'var(--color-muted)' }} />
          <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{memo.location.label}</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {memo.aiLoading && (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Spinner size="sm" />
            <span className="text-[9px]" style={{ color: 'var(--color-primary)' }}>{t('memo.aiProcessing')}</span>
          </div>
        )}
        {!memo.aiLoading && (
          <span onClick={e => e.stopPropagation()}>
            <AiToggleButton
              mode={aiMode}
              aiReady={memo.aiReady}
              onModeChange={onAiModeChange}
            />
          </span>
        )}

        {memo.alarmSuggestion && !memo.alarmConfirmed && (
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 px-2 py-1 rounded-lg flex-1 min-w-0"
            style={{ background: 'var(--tone-amber-bg)' }}
          >
            <IconBell size={11} style={{ color: 'var(--tone-amber-fg)', flexShrink: 0 }} />
            <span className="text-[10px] flex-1 truncate" style={{ color: 'var(--tone-amber-text)' }}>
              {t('memo.alarmSuggest', { time: formatSuggestionTime(memo.alarmSuggestion.datetime, lang) })}
            </span>
            <button
              onClick={onAlarmConfirm}
              className="text-[9px] px-1.5 py-px rounded-full text-white flex-shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              {t('common.add')}
            </button>
            <button onClick={onAlarmDismiss} className="text-[9px] flex-shrink-0" style={{ color: 'var(--tone-amber-text)' }}>
              {t('common.cancel')}
            </button>
          </div>
        )}
        {memo.alarmSuggestion && memo.alarmConfirmed && (
          <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{t('memo.alarmAdded')}</span>
        )}
      </div>
    </div>
  )
}
