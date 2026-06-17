import MemoCard from './MemoCard'
import { useTranslation } from 'react-i18next'
import type { MemoView } from '@/stores/useMemoStore'

interface MemoListProps {
  memos: MemoView[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAlarmConfirm: (id: string) => void
  onAlarmDismiss: (id: string) => void
  onContextMenu: (e: React.MouseEvent, id: string) => void
}

export default function MemoList({
  memos, selectedId,
  onSelect, onAlarmConfirm, onAlarmDismiss, onContextMenu,
}: MemoListProps) {
  const { t } = useTranslation()

  // 고정 메모를 핀 시각 내림차순으로 최상단, 나머지는 기존 순서 유지
  const sorted = [...memos].sort((a, b) => {
    const pa = a.pinnedAt ?? 0
    const pb = b.pinnedAt ?? 0
    if (pa && pb) return pb - pa
    if (pa) return -1
    if (pb) return 1
    return 0
  })

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
        <span className="text-3xl">📝</span>
        <p className="text-[12px] font-medium">{t('memo.emptyTitle')}</p>
        <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          {t('memo.emptyDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map(memo => (
        <MemoCard
          key={memo.memoId}
          memo={memo}
          isSelected={memo.memoId === selectedId}
          onSelect={() => onSelect(memo.memoId)}
          onAlarmConfirm={() => onAlarmConfirm(memo.memoId)}
          onAlarmDismiss={() => onAlarmDismiss(memo.memoId)}
          onContextMenu={e => onContextMenu(e, memo.memoId)}
        />
      ))}
    </div>
  )
}
