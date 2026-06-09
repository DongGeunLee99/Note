import { useState, useCallback } from 'react'
import { IconMapPin, IconPlus, IconCalendar } from '@tabler/icons-react'
import MemoList from '../components/memo/MemoList'
import MemoEditor from '../components/memo/MemoEditor'
import ContextMenu, { useContextMenu } from '../components/common/ContextMenu'
import PageHeader from '../components/common/PageHeader'
import SectionLabel from '../components/common/SectionLabel'
import Divider from '../components/common/Divider'
import ResizableRightPanel from '../components/common/ResizableRightPanel'
import type { LocalMemo, LocalMemoLocation } from '../types/localMemo'
import { useToast } from '../contexts/ToastContext'
import { useMemoStore } from '../stores/useMemoStore'
import { formatFullDate } from '../utils/formatDate'

export default function MemoPage() {
  const toast = useToast()
  const memos = useMemoStore(s => s.memos)
  const { saveMemo, deleteMemo, confirmAlarm, dismissAlarm } = useMemoStore.getState()
  const [selectedId, setSelectedId] = useState<string | null>('m1')
  const [aiModes, setAiModes] = useState<Record<string, 'original' | 'ai'>>({})
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<LocalMemo | null>(null)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()

  const handleSaveMemo = useCallback((title: string, body: string, location: LocalMemoLocation) => {
    if (editingMemo) {
      saveMemo(title, body, location, editingMemo.memoId)
      toast('메모가 수정되었습니다', 'success')
    } else {
      const newId = saveMemo(title, body, location)
      if (newId) setSelectedId(newId)
      toast('메모가 저장되었습니다', 'success')
    }
    setEditingMemo(null)
  }, [editingMemo, saveMemo, toast])

  function handleDeleteMemo(memoId: string) {
    deleteMemo(memoId)
    if (selectedId === memoId) setSelectedId(memos.find(m => m.memoId !== memoId)?.memoId ?? null)
    toast('메모가 삭제되었습니다', 'info')
  }

  function handleAlarmConfirm(memoId: string) {
    confirmAlarm(memoId)
    toast('알람이 추가되었습니다', 'success')
  }

  const selectedMemo = memos.find(m => m.memoId === selectedId)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="메모">
        <button
          onClick={() => { setEditingMemo(null); setEditorOpen(true) }}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + 메모 작성
        </button>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
          onContextMenu={openMenu}
        >
          <MemoList
            memos={memos}
            selectedId={selectedId}
            aiModes={aiModes}
            onSelect={setSelectedId}
            onAiModeChange={(id, mode) => setAiModes(prev => ({ ...prev, [id]: mode }))}
            onAlarmConfirm={handleAlarmConfirm}
            onAlarmDismiss={dismissAlarm}
            onDelete={handleDeleteMemo}
          />
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-2 h-full overflow-auto">
            <SectionLabel>상세</SectionLabel>
            {selectedMemo ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium leading-snug">
                  {selectedMemo.title || selectedMemo.body.split('\n')[0].slice(0, 30)}
                </p>

                <div className="flex items-center gap-1">
                  <IconCalendar size={10} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                  <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                    {formatFullDate(selectedMemo.createdAt)}
                  </span>
                </div>

                {selectedMemo.location.label && (
                  <div className="flex items-center gap-1">
                    <IconMapPin size={10} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{selectedMemo.location.label}</span>
                  </div>
                )}

                <Divider />

                <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-muted)' }}>
                  {aiModes[selectedMemo.memoId] === 'ai' && selectedMemo.aiSummary
                    ? selectedMemo.aiSummary
                    : selectedMemo.body}
                </p>

                <button
                  onClick={() => { setEditingMemo(selectedMemo); setEditorOpen(true) }}
                  className="text-[10px] py-1 rounded-lg border mt-1"
                  style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
                >
                  편집
                </button>
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>메모를 선택하세요</p>
            )}
          </div>
        </ResizableRightPanel>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={closeMenu}
          items={[
            { label: '새 메모 작성', icon: <IconPlus size={12} />, onClick: () => { setEditingMemo(null); setEditorOpen(true) } },
          ]}
        />
      )}

      <MemoEditor
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingMemo(null) }}
        onSave={handleSaveMemo}
        initial={editingMemo}
      />
    </div>
  )
}
