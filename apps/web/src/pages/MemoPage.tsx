import { useState, useCallback } from 'react'
import { IconMapPin, IconPlus, IconCalendar } from '@tabler/icons-react'
import MemoList from '@/components/memo/MemoList'
import MemoEditor from '@/components/memo/MemoEditor'
import ContextMenu, { useContextMenu } from '@/components/common/ContextMenu'
import PageHeader from '@/components/common/PageHeader'
import SectionLabel from '@/components/common/SectionLabel'
import Divider from '@/components/common/Divider'
import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import type { LocalMemo, LocalMemoLocation } from '@/types/localMemo'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { useMemoStore } from '@/stores/useMemoStore'
import { formatFullDate } from '@/utils/formatDate'

export default function MemoPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const lang = useLang()
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
      toast(t('memo.toastUpdated'), 'success')
    } else {
      const newId = saveMemo(title, body, location)
      if (newId) setSelectedId(newId)
      toast(t('memo.toastSaved'), 'success')
    }
    setEditingMemo(null)
  }, [editingMemo, saveMemo, toast, t])

  function handleDeleteMemo(memoId: string) {
    deleteMemo(memoId)
    if (selectedId === memoId) setSelectedId(memos.find(m => m.memoId !== memoId)?.memoId ?? null)
    toast(t('memo.toastDeleted'), 'info')
  }

  function handleAlarmConfirm(memoId: string) {
    confirmAlarm(memoId)
    toast(t('memo.toastAlarmAdded'), 'success')
  }

  const selectedMemo = memos.find(m => m.memoId === selectedId)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('memo.pageTitle')}>
        <button
          onClick={() => { setEditingMemo(null); setEditorOpen(true) }}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('memo.write')}
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
            <SectionLabel>{t('memo.detail')}</SectionLabel>
            {selectedMemo ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium leading-snug">
                  {selectedMemo.title || selectedMemo.body.split('\n')[0].slice(0, 30)}
                </p>

                <div className="flex items-center gap-1">
                  <IconCalendar size={10} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                  <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                    {formatFullDate(selectedMemo.createdAt, lang)}
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
                  {t('common.edit')}
                </button>
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{t('memo.selectPrompt')}</p>
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
            { label: t('memo.ctxNew'), icon: <IconPlus size={12} />, onClick: () => { setEditingMemo(null); setEditorOpen(true) } },
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
