import { useState, useEffect, useMemo } from 'react'
import { IconMapPin, IconPlus, IconCalendar, IconPin, IconPinnedOff, IconTrash, IconChevronLeft, IconChevronRight, IconSearch, IconX } from '@tabler/icons-react'
import MemoList from '@/components/memo/MemoList'
import AiToggleButton from '@/components/common/AiToggleButton'
import Spinner from '@/components/common/Spinner'
import ContextMenu, { useContextMenu } from '@/components/common/ContextMenu'
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
  const { saveMemo, deleteMemo, confirmAlarm, dismissAlarm, togglePin, undoMemo, redoMemo, updateAiSummary, runAi } = useMemoStore.getState()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [menuMemoId, setMenuMemoId] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMemos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return memos
    return memos.filter(m => m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q))
  }, [memos, searchQuery])

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
  }

  // 제목/본문/위치 — 신규 작성과 기존 메모 편집이 같은 드래프트를 공유
  const [titleDraft, setTitleDraft] = useState('')
  const [bodyDraft, setBodyDraft] = useState('')
  const [locationDraft, setLocationDraft] = useState<MemoLocation>(EMPTY_LOCATION)
  const [locationLoading, setLocationLoading] = useState(false)

  const [panelAiMode, setPanelAiMode] = useState<'original' | 'ai'>('original')
  const [aiDraft, setAiDraft] = useState('')

  const selectedMemo = memos.find(m => m.memoId === selectedId)

  // 기존 메모를 선택했을 때(또는 되돌리기/다시하기로 내용이 바뀌었을 때) 드래프트 동기화
  useEffect(() => {
    if (creating || !selectedMemo) return
    setTitleDraft(selectedMemo.title)
    setBodyDraft(selectedMemo.body)
    setLocationDraft(selectedMemo.location)
  }, [creating, selectedId, selectedMemo?.title, selectedMemo?.body, selectedMemo?.location])

  // AI 보기로 들어가거나 선택이 바뀌면(또는 되돌리기/다시하기) AI 편집용 텍스트 동기화
  useEffect(() => {
    setAiDraft(selectedMemo?.aiSummary ?? '')
  }, [selectedId, panelAiMode, selectedMemo?.aiSummary])

  // 패널이 열렸는데(신규 작성 시작 또는 위치 없는 메모 선택) 위치가 없으면 자동으로 가져오기 시도
  useEffect(() => {
    if (creating) {
      attemptLocation()
      return
    }
    if (selectedMemo && !selectedMemo.location.label) {
      attemptLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating, selectedId])

  function attemptLocation() {
    if (!navigator.geolocation) {
      setLocationDraft({ lat: null, lng: null, label: null })
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const label = await fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude, t('memo.currentLocation'))
        setLocationDraft({ lat: pos.coords.latitude, lng: pos.coords.longitude, label })
        setLocationLoading(false)
      },
      () => {
        setLocationDraft({ lat: null, lng: null, label: null })
        setLocationLoading(false)
      },
    )
  }

  function selectMemo(id: string) {
    setSelectedId(id)
    setCreating(false)
    setPanelAiMode('original')
  }

  function startCreate() {
    setCreating(true)
    setSelectedId(null)
    setTitleDraft('')
    setBodyDraft('')
    setLocationDraft(EMPTY_LOCATION)
  }

  // 제목/본문/위치 입력창 blur 시 자동저장
  function persist() {
    if (creating) {
      if (!bodyDraft.trim()) return
      const newId = saveMemo(titleDraft.trim(), bodyDraft.trim(), locationDraft)
      if (newId) {
        setSelectedId(newId)
        setCreating(false)
        toast(t('memo.toastSaved'), 'success')
      }
      return
    }
    if (!selectedMemo || !bodyDraft.trim()) return
    const changed =
      titleDraft !== selectedMemo.title ||
      bodyDraft !== selectedMemo.body ||
      locationDraft.label !== selectedMemo.location.label ||
      locationDraft.lat !== selectedMemo.location.lat ||
      locationDraft.lng !== selectedMemo.location.lng
    if (!changed) return
    saveMemo(titleDraft.trim(), bodyDraft.trim(), locationDraft, selectedMemo.memoId)
  }

  // AI 정리 텍스트 blur 시 자동저장
  function persistAi() {
    if (!selectedMemo) return
    if (aiDraft === (selectedMemo.aiSummary ?? '')) return
    updateAiSummary(selectedMemo.memoId, aiDraft)
  }

  function handleAiTrigger() {
    if (!selectedMemo) return
    void runAi(selectedMemo.memoId, selectedMemo.body)
  }

  function handleDeleteMemo(memoId: string) {
    deleteMemo(memoId)
    if (selectedId === memoId) {
      setSelectedId(memos.find(m => m.memoId !== memoId)?.memoId ?? null)
      setCreating(false)
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

  function handleUndo() {
    if (!selectedMemo) return
    undoMemo(selectedMemo.memoId)
    toast(t('memo.toastUndone'), 'info')
  }

  function handleRedo() {
    if (!selectedMemo) return
    redoMemo(selectedMemo.memoId)
    toast(t('memo.toastRedone'), 'info')
  }

  const textareaCls = 'w-full h-full text-[calc(11px*var(--fs))] leading-relaxed outline-none resize-none rounded-lg border p-3 bg-transparent'
  const textareaStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }
  const showDetail = creating || !!selectedMemo

  return (
    <div className="flex h-full">
      <div
        className="w-[300px] flex-shrink-0 flex flex-col overflow-hidden border-r"
        style={{ borderColor: 'var(--color-border)' }}
        onContextMenu={e => { setMenuMemoId(null); openMenu(e) }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0">
          {searchOpen ? (
            <>
              <IconSearch size={14} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && closeSearch()}
                placeholder={t('memo.searchPlaceholder')}
                autoFocus
                className="flex-1 text-[calc(11px*var(--fs))] outline-none bg-transparent"
                style={{ color: 'var(--color-text)' }}
              />
              <button onClick={closeSearch} className="p-1 rounded hover-tint transition-colors">
                <IconX size={14} style={{ color: 'var(--color-muted)' }} />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1" />
              <button onClick={() => setSearchOpen(true)} className="p-1.5 rounded-lg hover-tint transition-colors">
                <IconSearch size={15} style={{ color: 'var(--color-muted)' }} />
              </button>
              <button
                onClick={startCreate}
                className="text-[calc(10px*var(--fs))] px-2.5 py-1.5 rounded-lg text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                {t('memo.write')}
              </button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-auto px-3 pb-3">
          <MemoList
            memos={filteredMemos}
            selectedId={selectedId}
            searchQuery={searchQuery}
            onSelect={selectMemo}
            onAlarmConfirm={handleAlarmConfirm}
            onAlarmDismiss={dismissAlarm}
            onContextMenu={(e, id) => { e.stopPropagation(); setMenuMemoId(id); openMenu(e) }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showDetail ? (
          <>
            <div
              className="flex items-center gap-1 px-4 py-2.5 border-b flex-shrink-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <input
                type="text"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={persist}
                placeholder={t('memo.titlePlaceholder')}
                className="flex-1 text-[calc(12px*var(--fs))] font-medium outline-none bg-transparent"
                style={{ color: 'var(--color-text)' }}
              />
              {!creating && selectedMemo && (
                <>
                  <button
                    onClick={handleUndo}
                    disabled={!selectedMemo.history}
                    title={t('memo.undo')}
                    className="p-1 rounded hover-tint transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <IconChevronLeft size={14} style={{ color: 'var(--color-muted)' }} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!selectedMemo.future}
                    title={t('memo.redo')}
                    className="p-1 rounded hover-tint transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <IconChevronRight size={14} style={{ color: 'var(--color-muted)' }} />
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-4">
              <div className="flex flex-col gap-3 h-full">
                {/* 위치 + 날짜 (기존 메모에서는 오른쪽 아래에 원문/AI 탭이 겹쳐 배치됨) */}
                <div className="relative flex flex-col gap-1.5 rounded-lg px-3 py-2.5 pr-2 flex-shrink-0" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex items-center gap-1.5 pr-24">
                    <IconMapPin size={11} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={locationDraft.label ?? ''}
                      onChange={e => setLocationDraft(loc => ({ ...loc, label: e.target.value }))}
                      onBlur={persist}
                      placeholder={locationLoading ? t('memo.locationLoading') : t('memo.locationUnavailable')}
                      className="flex-1 text-[calc(10px*var(--fs))] outline-none bg-transparent"
                      style={{ color: 'var(--color-text)' }}
                    />
                    {locationLoading && <Spinner size="sm" />}
                  </div>
                  {!creating && selectedMemo && (
                    <div className="flex items-center gap-1.5">
                      <IconCalendar size={11} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                      <span className="text-[calc(10px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>
                        {formatFullDate(selectedMemo.createdAt.toDate(), lang)}
                      </span>
                    </div>
                  )}

                  {!creating && selectedMemo && (
                    <div className="absolute right-2 bottom-2">
                      <AiToggleButton
                        mode={panelAiMode}
                        aiProcessed={selectedMemo.aiProcessed}
                        loading={selectedMemo.aiLoading}
                        onModeChange={setPanelAiMode}
                        onTrigger={handleAiTrigger}
                      />
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-h-0">
                  {!creating && selectedMemo && panelAiMode === 'ai' ? (
                    selectedMemo.aiProcessed ? (
                      <div className="flex flex-col gap-1 h-full">
                        <textarea
                          value={aiDraft}
                          onChange={e => setAiDraft(e.target.value)}
                          onBlur={persistAi}
                          className={textareaCls}
                          style={textareaStyle}
                        />
                        {selectedMemo.body !== selectedMemo.aiSummaryBody && (
                          <p className="text-[calc(9px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>
                            {t('memo.aiBodyChangedHint')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                      </div>
                    )
                  ) : (
                    <textarea
                      value={bodyDraft}
                      onChange={e => setBodyDraft(e.target.value)}
                      onBlur={persist}
                      placeholder={t('memo.bodyPlaceholder')}
                      autoFocus={creating}
                      className={textareaCls}
                      style={textareaStyle}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[calc(11px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>
              {t('memo.selectPrompt')}
            </p>
          </div>
        )}
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
