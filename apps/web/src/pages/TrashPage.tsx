import { useState, useMemo } from 'react'
import { IconNote, IconBell, IconClock, IconRefresh, IconTrash } from '@tabler/icons-react'
import Badge from '../components/common/Badge'
import ConfirmModal from '../components/common/ConfirmModal'
import PageHeader from '../components/common/PageHeader'
import SectionLabel from '../components/common/SectionLabel'
import Divider from '../components/common/Divider'
import PillButton from '../components/common/PillButton'
import EmptyState from '../components/common/EmptyState'
import ResizableRightPanel from '../components/common/ResizableRightPanel'
import { useToast } from '../contexts/ToastContext'
import { useTrashStore } from '../stores/useTrashStore'
import type { TrashItem, TrashType } from '../types/localItems'
import { daysLeft } from '../utils/formatDate'
import { TONES, type Tone } from '../theme/tones'

const TYPE_CONFIG: Record<TrashType, { icon: React.ReactNode; tone: Tone; label: string }> = {
  memo:  { icon: <IconNote size={14} style={{ color: TONES.gray.fg }} />,    tone: 'gray',   label: '메모' },
  alarm: { icon: <IconBell size={14} style={{ color: TONES.blue.fg }} />,    tone: 'blue',   label: '알람' },
  later: { icon: <IconClock size={14} style={{ color: TONES.violet.fg }} />, tone: 'violet', label: '나중에' },
}

export default function TrashPage() {
  const toast = useToast()
  const items = useTrashStore(s => s.items)
  const { restore, permanentDelete, emptyAll } = useTrashStore.getState()
  const [confirmDelete, setConfirmDelete] = useState<TrashItem | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [filter, setFilter] = useState<TrashType | 'all'>('all')

  const displayed = useMemo(() => {
    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)
    return filtered.slice().sort((a, b) => daysLeft(a.deletedAt) - daysLeft(b.deletedAt))
  }, [items, filter])

  const expiringSoon = items.filter(i => daysLeft(i.deletedAt) <= 7).length

  function handleRestore(item: TrashItem) {
    restore(item.id)
    toast(`"${item.title}" 복원되었습니다`, 'success')
  }

  function confirmPermanentDelete() {
    if (!confirmDelete) return
    permanentDelete(confirmDelete.id)
    toast('영구 삭제되었습니다', 'info')
    setConfirmDelete(null)
  }

  function handleEmptyAll() {
    emptyAll()
    toast('휴지통을 비웠습니다', 'info')
    setConfirmEmpty(false)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="휴지통">
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          {items.length}개 · 30일 후 자동 삭제
        </span>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="text-[10px] px-2.5 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-danger-subtle)', color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }}
          >
            전체 비우기
          </button>
        )}
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex items-center gap-1.5 px-3 py-2 border-b flex-shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {(['all', 'memo', 'alarm', 'later'] as const).map(f => (
              <PillButton key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? '전체' : TYPE_CONFIG[f].label}
              </PillButton>
            ))}
          </div>

          <div className="flex-1 p-3 overflow-auto">
            {displayed.length === 0 ? (
              <EmptyState emoji="🗑️" title="휴지통이 비어있습니다" description="삭제된 항목이 여기에 표시됩니다" />
            ) : (
              <div className="flex flex-col gap-2">
                {displayed.map(item => {
                  const cfg = TYPE_CONFIG[item.type]
                  const left = daysLeft(item.deletedAt)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 border rounded-lg px-3 py-2"
                      style={{ borderColor: left <= 3 ? 'var(--color-danger-subtle)' : 'var(--color-border)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: TONES[cfg.tone].bg }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">{item.title}</p>
                        <p className="text-[9px] truncate" style={{ color: 'var(--color-muted)' }}>
                          {item.preview}
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color: left <= 3 ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                          {left}일 후 영구 삭제
                        </p>
                      </div>
                      <Badge variant={left <= 3 ? 'red' : left <= 7 ? 'amber' : 'gray'}>
                        D-{left}
                      </Badge>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border transition-colors hover:bg-gray-50"
                          style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
                        >
                          <IconRefresh size={10} /> 복원
                        </button>
                        <button
                          onClick={() => setConfirmDelete(item)}
                          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border transition-colors"
                          style={{ borderColor: 'var(--color-danger-subtle)', color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }}
                        >
                          <IconTrash size={10} /> 삭제
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-3 h-full overflow-auto">
            <SectionLabel>현황</SectionLabel>
            {(['memo', 'alarm', 'later'] as TrashType[]).map(type => {
              const count = items.filter(i => i.type === type).length
              return (
                <div key={type} className="flex items-center justify-between text-[10px]">
                  <span style={{ color: 'var(--color-muted)' }}>{TYPE_CONFIG[type].label}</span>
                  <Badge variant="gray">{count}개</Badge>
                </div>
              )
            })}
            <Divider />
            {expiringSoon > 0 && (
              <div
                className="p-2 rounded-lg text-[10px]"
                style={{ background: 'var(--color-danger-subtle)', color: 'var(--color-danger)' }}
              >
                ⚠️ 7일 내 영구 삭제 예정: {expiringSoon}개
              </div>
            )}
          </div>
        </ResizableRightPanel>
      </div>

      <ConfirmModal
        isOpen={confirmEmpty}
        onClose={() => setConfirmEmpty(false)}
        title="전체 비우기 확인"
        confirmLabel="전체 삭제"
        onConfirm={handleEmptyAll}
        danger
      >
        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          휴지통의 <strong style={{ color: 'var(--color-text)' }}>모든 항목 ({items.length}개)</strong>을 영구 삭제합니다.<br />
          이 작업은 되돌릴 수 없습니다.
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="영구 삭제 확인"
        confirmLabel="영구 삭제"
        onConfirm={confirmPermanentDelete}
        danger
      >
        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          <strong style={{ color: 'var(--color-text)' }}>"{confirmDelete?.title}"</strong>을 영구 삭제합니다.
          이 작업은 되돌릴 수 없습니다.
        </p>
      </ConfirmModal>
    </div>
  )
}
