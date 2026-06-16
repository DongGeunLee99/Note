import { IconMapPin, IconBell, IconPin } from '@tabler/icons-react'
import Spinner from '@/components/common/Spinner'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { formatRelTime, formatSuggestionTime } from '@/utils/formatDate'
import type { LocalMemo } from '@/types/localMemo'

interface MemoCardProps {
  memo: LocalMemo
  isSelected: boolean
  onSelect: () => void
  onAlarmConfirm: () => void
  onAlarmDismiss: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

export default function MemoCard({
  memo, isSelected, onSelect, onAlarmConfirm, onAlarmDismiss, onContextMenu,
}: MemoCardProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const preview = memo.body.length > 80 ? memo.body.slice(0, 80) + '…' : memo.body

  const showFooter = memo.aiLoading || !!memo.alarmSuggestion

  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className="rounded-lg border p-2.5 cursor-pointer transition-colors"
      style={{
        background: 'var(--color-surface)',
        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[11px] font-medium flex-1 truncate flex items-center gap-1">
          {memo.pinnedAt && <IconPin size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
          {memo.title || memo.body.split('\n')[0].slice(0, 30)}
        </span>
        <span className="text-[9px] flex-shrink-0" style={{ color: 'var(--color-muted)' }}>{formatRelTime(memo.createdAt, lang)}</span>
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

      {showFooter && (
        <div className="flex items-center gap-2 flex-wrap">
          {memo.aiLoading && (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <Spinner size="sm" />
              <span className="text-[9px]" style={{ color: 'var(--color-primary)' }}>{t('memo.aiProcessing')}</span>
            </div>
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
      )}
    </div>
  )
}
