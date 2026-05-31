import { IconMapPin, IconTrash, IconBell } from '@tabler/icons-react'
import AiToggleButton from '../common/AiToggleButton'
import Spinner from '../common/Spinner'
import type { LocalMemo } from '../../types/localMemo'

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

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
}

function formatSuggestionTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  const min = m > 0 ? ` ${m}분` : ''
  return `${date.getMonth() + 1}/${date.getDate()} ${period} ${hour}시${min}`
}

export default function MemoCard({
  memo, isSelected, aiMode,
  onSelect, onAiModeChange, onAlarmConfirm, onAlarmDismiss, onDelete,
}: MemoCardProps) {
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
          <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{formatDate(memo.createdAt)}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-0.5 rounded hover:bg-red-50 transition-colors"
          >
            <IconTrash size={11} style={{ color: '#791F1F' }} />
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

      <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
        {memo.aiLoading && (
          <div className="flex items-center gap-1">
            <Spinner size="sm" />
            <span className="text-[9px]" style={{ color: 'var(--color-primary)' }}>AI 처리 중…</span>
          </div>
        )}
        {!memo.aiLoading && (
          <AiToggleButton
            mode={aiMode}
            aiReady={memo.aiReady}
            onModeChange={onAiModeChange}
          />
        )}

        {memo.alarmSuggestion && !memo.alarmConfirmed && (
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-lg flex-1 min-w-0"
            style={{ background: '#FAEEDA' }}
          >
            <IconBell size={11} style={{ color: '#854F0B', flexShrink: 0 }} />
            <span className="text-[10px] flex-1 truncate" style={{ color: '#633806' }}>
              {formatSuggestionTime(memo.alarmSuggestion.datetime)} 알람?
            </span>
            <button
              onClick={onAlarmConfirm}
              className="text-[9px] px-1.5 py-px rounded-full bg-[#185FA5] text-white flex-shrink-0"
            >
              추가
            </button>
            <button onClick={onAlarmDismiss} className="text-[9px] flex-shrink-0" style={{ color: '#633806' }}>
              취소
            </button>
          </div>
        )}
        {memo.alarmSuggestion && memo.alarmConfirmed && (
          <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>✓ 알람 추가됨</span>
        )}
      </div>
    </div>
  )
}
