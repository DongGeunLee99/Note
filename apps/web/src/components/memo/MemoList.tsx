import MemoCard from './MemoCard'
import type { LocalMemo } from '../../types/localMemo'

interface MemoListProps {
  memos: LocalMemo[]
  selectedId: string | null
  aiModes: Record<string, 'original' | 'ai'>
  onSelect: (id: string) => void
  onAiModeChange: (id: string, mode: 'original' | 'ai') => void
  onAlarmConfirm: (id: string) => void
  onAlarmDismiss: (id: string) => void
  onDelete: (id: string) => void
}

export default function MemoList({
  memos, selectedId, aiModes,
  onSelect, onAiModeChange, onAlarmConfirm, onAlarmDismiss, onDelete,
}: MemoListProps) {
  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
        <span className="text-3xl">📝</span>
        <p className="text-[12px] font-medium">메모가 없습니다</p>
        <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          위의 메모 작성 버튼으로 시작해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {memos.map(memo => (
        <MemoCard
          key={memo.memoId}
          memo={memo}
          isSelected={memo.memoId === selectedId}
          aiMode={aiModes[memo.memoId] ?? 'original'}
          onSelect={() => onSelect(memo.memoId)}
          onAiModeChange={mode => onAiModeChange(memo.memoId, mode)}
          onAlarmConfirm={() => onAlarmConfirm(memo.memoId)}
          onAlarmDismiss={() => onAlarmDismiss(memo.memoId)}
          onDelete={() => onDelete(memo.memoId)}
        />
      ))}
    </div>
  )
}
