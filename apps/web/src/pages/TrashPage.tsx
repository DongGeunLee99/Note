import { useState } from 'react'
import { IconNote, IconBell, IconClock, IconRefresh, IconTrash } from '@tabler/icons-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { useToast } from '../contexts/ToastContext'

type TrashType = 'memo' | 'alarm' | 'later'

interface TrashItem {
  id: string
  type: TrashType
  title: string
  preview: string
  deletedAt: Date
}

const TYPE_CONFIG: Record<TrashType, { icon: React.ReactNode; bg: string; label: string }> = {
  memo:  { icon: <IconNote size={14} style={{ color: '#444441' }} />,  bg: '#F1EFE8', label: '메모' },
  alarm: { icon: <IconBell size={14} style={{ color: '#185FA5' }} />,  bg: '#E6F1FB', label: '알람' },
  later: { icon: <IconClock size={14} style={{ color: '#3C3489' }} />, bg: '#EEEDFE', label: '나중에' },
}

const INITIAL_TRASH: TrashItem[] = [
  { id: 't1', type: 'memo',  title: '마케팅 아이디어 메모',   preview: 'SNS 캠페인 아이디어, 인플루언서 협업 방안 정리',  deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  { id: 't2', type: 'memo',  title: '회의 노트 초안',         preview: '3/14 스프린트 회고 — 이슈 목록 및 액션 아이템', deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16) },
  { id: 't3', type: 'alarm', title: '헬스장 알람',            preview: '오전 6:30 · 평일',                               deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27) },
  { id: 't4', type: 'later', title: '도서관 책 반납 확인',    preview: '이번 주 금요일까지',                             deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { id: 't5', type: 'memo',  title: '임시 메모',              preview: '...',                                            deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29) },
]

const KEEP_DAYS = 30

function daysLeft(deletedAt: Date): number {
  const diff = Date.now() - deletedAt.getTime()
  return Math.max(0, KEEP_DAYS - Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export default function TrashPage() {
  const toast = useToast()
  const [items, setItems] = useState<TrashItem[]>(INITIAL_TRASH)
  const [confirmDelete, setConfirmDelete] = useState<TrashItem | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [filter, setFilter] = useState<TrashType | 'all'>('all')

  const displayed = filter === 'all' ? items : items.filter(i => i.type === filter)

  function handleRestore(item: TrashItem) {
    setItems(prev => prev.filter(i => i.id !== item.id))
    toast(`"${item.title}" 복원되었습니다`, 'success')
  }

  function handlePermanentDelete(item: TrashItem) {
    setConfirmDelete(item)
  }

  function confirmPermanentDelete() {
    if (!confirmDelete) return
    setItems(prev => prev.filter(i => i.id !== confirmDelete.id))
    toast(`영구 삭제되었습니다`, 'info')
    setConfirmDelete(null)
  }

  function handleEmptyAll() {
    setItems([])
    toast('휴지통을 비웠습니다', 'info')
    setConfirmEmpty(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">휴지통</span>
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          {items.length}개 · 30일 후 자동 삭제
        </span>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="text-[10px] px-2.5 py-1.5 rounded-lg border"
            style={{ borderColor: '#FCEBEB', color: '#791F1F', background: '#FCEBEB' }}
          >
            전체 비우기
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex items-center gap-1.5 px-3 py-2 border-b flex-shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {(['all', 'memo', 'alarm', 'later'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-[9px] px-2.5 py-1 rounded-full border transition-colors"
                style={
                  filter === f
                    ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                    : { color: 'var(--color-muted)', borderColor: 'var(--color-border-2)' }
                }
              >
                {f === 'all' ? '전체' : TYPE_CONFIG[f].label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-3 overflow-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span className="text-3xl">🗑️</span>
                <p className="text-[12px] font-medium">휴지통이 비어있습니다</p>
                <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                  삭제된 항목이 여기에 표시됩니다
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {displayed
                  .slice()
                  .sort((a, b) => daysLeft(a.deletedAt) - daysLeft(b.deletedAt))
                  .map(item => {
                    const cfg = TYPE_CONFIG[item.type]
                    const left = daysLeft(item.deletedAt)
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 border rounded-lg px-3 py-2"
                        style={{ borderColor: left <= 3 ? '#FCEBEB' : 'var(--color-border)' }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg }}
                        >
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{item.title}</p>
                          <p className="text-[9px] truncate" style={{ color: 'var(--color-muted)' }}>
                            {item.preview}
                          </p>
                          <p className="text-[9px] mt-0.5" style={{ color: left <= 3 ? '#791F1F' : 'var(--color-muted)' }}>
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
                            onClick={() => handlePermanentDelete(item)}
                            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border transition-colors"
                            style={{ borderColor: '#FCEBEB', color: '#791F1F', background: '#FCEBEB' }}
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

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-3 overflow-auto border-l" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>현황</p>
          {(['memo', 'alarm', 'later'] as TrashType[]).map(type => {
            const count = items.filter(i => i.type === type).length
            return (
              <div key={type} className="flex items-center justify-between text-[10px]">
                <span style={{ color: 'var(--color-muted)' }}>{TYPE_CONFIG[type].label}</span>
                <Badge variant="gray">{count}개</Badge>
              </div>
            )
          })}
          <div className="h-px" style={{ background: 'var(--color-border)' }} />
          {items.filter(i => daysLeft(i.deletedAt) <= 7).length > 0 && (
            <div
              className="p-2 rounded-lg text-[10px]"
              style={{ background: '#FCEBEB', color: '#791F1F' }}
            >
              ⚠️ 7일 내 영구 삭제 예정: {items.filter(i => daysLeft(i.deletedAt) <= 7).length}개
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={confirmEmpty}
        onClose={() => setConfirmEmpty(false)}
        title="전체 비우기 확인"
        footer={
          <>
            <button onClick={() => setConfirmEmpty(false)} className="text-[10px] px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}>취소</button>
            <button onClick={handleEmptyAll} className="text-[10px] px-3 py-1.5 rounded-lg text-white" style={{ background: '#791F1F' }}>전체 삭제</button>
          </>
        }
      >
        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          휴지통의 <strong style={{ color: '#1a1a18' }}>모든 항목 ({items.length}개)</strong>을 영구 삭제합니다.<br />
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="영구 삭제 확인"
        footer={
          <>
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-[10px] px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
            >
              취소
            </button>
            <button
              onClick={confirmPermanentDelete}
              className="text-[10px] px-3 py-1.5 rounded-lg text-white"
              style={{ background: '#791F1F' }}
            >
              영구 삭제
            </button>
          </>
        }
      >
        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          <strong style={{ color: '#1a1a18' }}>"{confirmDelete?.title}"</strong>을 영구 삭제합니다.
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
