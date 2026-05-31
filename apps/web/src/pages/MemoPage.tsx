import { useState, useCallback } from 'react'
import { parse } from 'chrono-node'
import { IconMapPin, IconPlus, IconCalendar } from '@tabler/icons-react'

function formatFullDate(date: Date): string {
  const y = date.getFullYear()
  const mo = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours()
  const mi = date.getMinutes()
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  const min = mi > 0 ? ` ${mi}분` : ''
  return `${y}년 ${mo}월 ${d}일 ${period} ${hour}시${min}`
}
import MemoList from '../components/memo/MemoList'
import MemoEditor from '../components/memo/MemoEditor'
import ContextMenu, { useContextMenu } from '../components/common/ContextMenu'
import type { LocalMemo } from '../types/localMemo'
import { useToast } from '../contexts/ToastContext'

let nextId = 200

function detectAlarmSuggestion(body: string) {
  const results = parse(body, new Date(), { forwardDate: true })
  if (results.length === 0) return null
  const date = results[0].date()
  if (date <= new Date()) return null
  const label = body.split(/[.!?。\n]/)[0].trim().slice(0, 20) || '알람'
  return { datetime: date, label }
}

function generateAiSummary(body: string): string {
  const sentences = body.split(/[.!?。\n]/).map(s => s.trim()).filter(s => s.length > 4)
  if (sentences.length === 0) return body.slice(0, 100)
  const key = sentences.slice(0, 2).join('. ')
  return key + (key.endsWith('.') ? '' : '.') + (sentences.length > 2 ? ` (외 ${sentences.length - 2}개 항목)` : '')
}

const INITIAL_MEMOS: LocalMemo[] = [
  {
    memoId: 'm1',
    title: '프로젝트 회의 메모',
    body: 'UI 리뷰 결과 — 모바일 대응 필요. 다음 스프린트에 반영하기로. 담당자 미정.',
    aiSummary: 'UI 리뷰 결론: 모바일 UI 개선을 다음 스프린트에 포함. (외 1개 항목)',
    aiReady: true,
    aiLoading: false,
    location: { lat: 37.5, lng: 127.03, label: '강남구 역삼동' },
    alarmSuggestion: null,
    alarmConfirmed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    memoId: 'm2',
    title: '',
    body: '주말 장보기 목록\n우유, 계란, 두부, 양파, 감자, 소고기 (불고기용)',
    aiSummary: null,
    aiReady: false,
    aiLoading: false,
    location: { lat: null, lng: null, label: null },
    alarmSuggestion: null,
    alarmConfirmed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    memoId: 'm3',
    title: '블로그 아이디어',
    body: 'React 성능 최적화 시리즈. useMemo / useCallback 실전 사례 위주로 작성하기. 내일 오전 10시에 초안 작성 시작.',
    aiSummary: 'React 성능 최적화 블로그 시리즈 계획. useMemo/useCallback 중심으로 구성.',
    aiReady: true,
    aiLoading: false,
    location: { lat: null, lng: null, label: null },
    alarmSuggestion: (() => {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return { datetime: d, label: '초안 작성 시작' }
    })(),
    alarmConfirmed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
]

export default function MemoPage() {
  const toast = useToast()
  const [memos, setMemos] = useState<LocalMemo[]>(INITIAL_MEMOS)
  const [selectedId, setSelectedId] = useState<string | null>('m1')
  const [aiModes, setAiModes] = useState<Record<string, 'original' | 'ai'>>({})
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<LocalMemo | null>(null)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()

  const handleSaveMemo = useCallback((
    title: string,
    body: string,
    location: { lat: number | null; lng: number | null; label: string | null },
  ) => {
    if (editingMemo) {
      setMemos(prev => prev.map(m =>
        m.memoId === editingMemo.memoId
          ? { ...m, title, body, location, alarmSuggestion: detectAlarmSuggestion(body) }
          : m
      ))
      toast('메모가 수정되었습니다', 'success')
    } else {
      const memoId = `m${++nextId}`
      const suggestion = detectAlarmSuggestion(body)
      const newMemo: LocalMemo = {
        memoId,
        title,
        body,
        aiSummary: null,
        aiReady: false,
        aiLoading: false,
        location,
        alarmSuggestion: suggestion,
        alarmConfirmed: false,
        createdAt: new Date(),
      }
      setMemos(prev => [newMemo, ...prev])
      setSelectedId(memoId)
      toast('메모가 저장되었습니다', 'success')

      // AI 처리 시뮬레이션
      setTimeout(() => {
        setMemos(prev => prev.map(m => m.memoId === memoId ? { ...m, aiLoading: true } : m))
        setTimeout(() => {
          setMemos(prev => prev.map(m =>
            m.memoId === memoId
              ? { ...m, aiLoading: false, aiReady: true, aiSummary: generateAiSummary(body) }
              : m
          ))
        }, 2500)
      }, 1500)
    }
    setEditingMemo(null)
  }, [editingMemo, toast])

  function handleDeleteMemo(memoId: string) {
    setMemos(prev => prev.filter(m => m.memoId !== memoId))
    if (selectedId === memoId) setSelectedId(memos.find(m => m.memoId !== memoId)?.memoId ?? null)
    toast('메모가 삭제되었습니다', 'info')
  }

  function handleAlarmConfirm(memoId: string) {
    setMemos(prev => prev.map(m => m.memoId === memoId ? { ...m, alarmConfirmed: true } : m))
    toast('알람이 추가되었습니다', 'success')
  }

  function handleAlarmDismiss(memoId: string) {
    setMemos(prev => prev.map(m => m.memoId === memoId ? { ...m, alarmSuggestion: null } : m))
  }

  const selectedMemo = memos.find(m => m.memoId === selectedId)

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">메모</span>
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{memos.length}개</span>
        <button
          onClick={() => { setEditingMemo(null); setEditorOpen(true) }}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + 메모 작성
        </button>
      </div>

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
            onAlarmDismiss={handleAlarmDismiss}
            onDelete={handleDeleteMemo}
          />
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-2 overflow-auto">
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>상세</p>
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

              <div className="h-px" style={{ background: 'var(--color-border)' }} />

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
