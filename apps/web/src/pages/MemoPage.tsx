import { useState, useEffect } from 'react'
import { IconMapPin, IconPlus, IconCalendar, IconPin, IconPinnedOff, IconTrash, IconArrowBackUp, IconX } from '@tabler/icons-react'
import MemoList from '@/components/memo/MemoList'
import AiToggleButton from '@/components/common/AiToggleButton'
import Spinner from '@/components/common/Spinner'
import ContextMenu, { useContextMenu } from '@/components/common/ContextMenu'
import PageHeader from '@/components/common/PageHeader'
import SectionLabel from '@/components/common/SectionLabel'
import Divider from '@/components/common/Divider'
import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import type { MemoLocation } from '@smartnote/shared/types'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { useMemoStore } from '@/stores/useMemoStore'
import { formatFullDate } from '@/utils/formatDate'

const EMPTY_LOCATION: MemoLocation = { lat: null, lng: null, label: null }

async function fetchReverseGeocode(lat: number, lng: number, fallback: string): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`,
      { headers: { 'Accept-Language': 'ko' } },
    )
    const data = await res.json()
    const addr = data.address ?? {}
    return addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.city_district ?? addr.city ?? fallback
  } catch {
    return fallback
  }
}

export default function MemoPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const lang = useLang()
  const memos = useMemoStore(s => s.memos)
  const { saveMemo, deleteMemo, confirmAlarm, dismissAlarm, togglePin, undoMemo, updateAiSummary } = useMemoStore.getState()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [menuMemoId, setMenuMemoId] = useState<string | null>(null)

  // 패널 편집 상태
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftLocation, setDraftLocation] = useState<MemoLocation>(EMPTY_LOCATION)
  const [locationLoading, setLocationLoading] = useState(false)

  // 원문/AI 보기 + AI 정리 편집
  const [panelAiMode, setPanelAiMode] = useState<'original' | 'ai'>('original')
  const [aiDraft, setAiDraft] = useState('')

  const selectedMemo = memos.find(m => m.memoId === selectedId)
  const isEditing = creating || editing

  // AI 보기로 들어가거나 선택이 바뀌면 편집용 AI 텍스트 동기화
  useEffect(() => {
    setAiDraft(selectedMemo?.aiSummary ?? '')
  }, [selectedId, panelAiMode, selectedMemo?.aiSummary])

  function selectMemo(id: string) {
    setSelectedId(id)
    setCreating(false)
    setEditing(false)
    setPanelAiMode('original')
  }

  function startCreate() {
    setCreating(true)
    setEditing(false)
    setSelectedId(null)
    setDraftTitle('')
    setDraftBody('')
    setDraftLocation(EMPTY_LOCATION)
    setLocationLoading(false)
  }

  function startEdit() {
    if (!selectedMemo) return
    setEditing(true)
    setCreating(false)
    setDraftTitle(selectedMemo.title)
    setDraftBody(selectedMemo.body)
    setDraftLocation(selectedMemo.location)
    setLocationLoading(false)
  }

  function cancelEdit() {
    setCreating(false)
    setEditing(false)
  }

  function saveDraft() {
    if (!draftBody.trim()) return
    if (creating) {
      const newId = saveMemo(draftTitle.trim(), draftBody.trim(), draftLocation)
      if (newId) setSelectedId(newId)
      toast(t('memo.toastSaved'), 'success')
      setCreating(false)
    } else if (editing && selectedId) {
      saveMemo(draftTitle.trim(), draftBody.trim(), draftLocation, selectedId)
      toast(t('memo.toastUpdated'), 'success')
      setEditing(false)
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const label = await fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude, t('memo.currentLocation'))
        setDraftLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label })
        setLocationLoading(false)
      },
      () => {
        setDraftLocation({ lat: null, lng: null, label: t('memo.locationDenied') })
        setLocationLoading(false)
      },
    )
  }

  function saveAiSummary() {
    if (!selectedId) return
    updateAiSummary(selectedId, aiDraft)
    toast(t('memo.toastUpdated'), 'success')
  }

  function handleDeleteMemo(memoId: string) {
    deleteMemo(memoId)
    if (selectedId === memoId) {
      setSelectedId(memos.find(m => m.memoId !== memoId)?.memoId ?? null)
      cancelEdit()
    }
    toast(t('memo.toastDeleted'), 'info')
  }

  function handleAlarmConfirm(memoId: string) {
    confirmAlarm(memoId)
    toast(t('memo.toastAlarmAdded'), 'success')
  }

  function handlePin(memoId: string) {
    if (togglePin(memoId) === 'limit') toast(t('memo.pinLimit', { max: 3 }), 'info')
  }

  function handleUndo(memoId: string) {
    undoMemo(memoId)
    toast(t('memo.toastUndone'), 'info')
  }

  const inputCls = 'text-[11px] outline-none bg-transparent border-b pb-1'
  const btnBorder = { borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('memo.pageTitle')}>
        <button
          onClick={startCreate}
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
          onContextMenu={e => { setMenuMemoId(null); openMenu(e) }}
        >
          <MemoList
            memos={memos}
            selectedId={selectedId}
            onSelect={selectMemo}
            onAlarmConfirm={handleAlarmConfirm}
            onAlarmDismiss={dismissAlarm}
            onContextMenu={(e, id) => { e.stopPropagation(); setMenuMemoId(id); openMenu(e) }}
          />
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-2 h-full overflow-auto" style={{ minWidth: isEditing ? 240 : undefined }}>
            <SectionLabel>{creating ? t('memo.editorNew') : editing ? t('memo.editorEdit') : t('memo.detail')}</SectionLabel>

            {isEditing ? (
              /* ── 편집 / 신규 작성 ── */
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  placeholder={t('memo.titlePlaceholder')}
                  className={`${inputCls} font-medium`}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
                <textarea
                  value={draftBody}
                  onChange={e => setDraftBody(e.target.value)}
                  placeholder={t('memo.bodyPlaceholder')}
                  rows={8}
                  autoFocus
                  className="text-[11px] leading-relaxed outline-none resize-none bg-transparent"
                  style={{ color: 'var(--color-text)' }}
                />

                <div>
                  {draftLocation.label ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]" style={{ background: 'var(--color-surface-2)' }}>
                      <IconMapPin size={11} style={{ color: 'var(--color-primary)' }} />
                      <span>{draftLocation.label}</span>
                      <button onClick={() => setDraftLocation(EMPTY_LOCATION)} className="ml-0.5">
                        <IconX size={10} style={{ color: 'var(--color-muted)' }} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] border transition-colors disabled:opacity-50"
                      style={btnBorder}
                    >
                      {locationLoading ? <Spinner size="sm" /> : <IconMapPin size={11} />}
                      {locationLoading ? t('memo.locationLoading') : t('memo.locationTag')}
                    </button>
                  )}
                </div>

                <div className="flex gap-1 mt-1">
                  <button onClick={cancelEdit} className="flex-1 text-[10px] py-1 rounded-lg border" style={btnBorder}>
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={saveDraft}
                    disabled={!draftBody.trim()}
                    className="flex-1 text-[10px] py-1 rounded-lg text-white disabled:opacity-40"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            ) : selectedMemo ? (
              /* ── 보기 ── */
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium leading-snug flex items-center gap-1">
                  {selectedMemo.pinnedAt && <IconPin size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                  {selectedMemo.title || selectedMemo.body.split('\n')[0].slice(0, 30)}
                </p>

                <div className="flex items-center gap-1">
                  <IconCalendar size={10} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                  <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                    {formatFullDate(selectedMemo.createdAt.toDate(), lang)}
                  </span>
                </div>

                {selectedMemo.location.label && (
                  <div className="flex items-center gap-1">
                    <IconMapPin size={10} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{selectedMemo.location.label}</span>
                  </div>
                )}

                {(selectedMemo.aiProcessed || selectedMemo.aiLoading) && (
                  <AiToggleButton
                    mode={panelAiMode}
                    aiReady={selectedMemo.aiProcessed}
                    loading={selectedMemo.aiLoading}
                    onModeChange={setPanelAiMode}
                  />
                )}

                <Divider />

                {panelAiMode === 'ai' && selectedMemo.aiProcessed ? (
                  /* AI 정리 — 편집 가능 */
                  <div className="flex flex-col gap-1">
                    <textarea
                      value={aiDraft}
                      onChange={e => setAiDraft(e.target.value)}
                      rows={6}
                      className="text-[10px] leading-relaxed outline-none resize-none rounded-lg border p-2 bg-transparent"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                    <button
                      onClick={saveAiSummary}
                      disabled={aiDraft === (selectedMemo.aiSummary ?? '')}
                      className="self-end text-[10px] py-1 px-3 rounded-lg text-white disabled:opacity-40"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {t('common.save')}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-muted)' }}>
                    {selectedMemo.body}
                  </p>
                )}

                <div className="flex gap-1 mt-1">
                  <button onClick={startEdit} className="flex-1 text-[10px] py-1 rounded-lg border" style={btnBorder}>
                    {t('common.edit')}
                  </button>
                  {selectedMemo.history && (
                    <button
                      onClick={() => handleUndo(selectedMemo.memoId)}
                      className="flex items-center justify-center gap-1 text-[10px] py-1 px-2 rounded-lg border"
                      style={btnBorder}
                    >
                      <IconArrowBackUp size={12} />
                      {t('memo.undo')}
                    </button>
                  )}
                </div>
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
          items={
            menuMemoId
              ? [
                  {
                    label: memos.find(m => m.memoId === menuMemoId)?.pinnedAt ? t('memo.ctxUnpin') : t('memo.ctxPin'),
                    icon: memos.find(m => m.memoId === menuMemoId)?.pinnedAt ? <IconPinnedOff size={12} /> : <IconPin size={12} />,
                    onClick: () => handlePin(menuMemoId),
                  },
                  {
                    label: t('common.delete'),
                    icon: <IconTrash size={12} />,
                    danger: true,
                    onClick: () => handleDeleteMemo(menuMemoId),
                  },
                ]
              : [
                  { label: t('memo.ctxNew'), icon: <IconPlus size={12} />, onClick: startCreate },
                ]
          }
        />
      )}
    </div>
  )
}
