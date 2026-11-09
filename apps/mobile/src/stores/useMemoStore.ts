import { create } from 'zustand'
import { Timestamp } from 'firebase/firestore'
import type { Memo, MemoLocation } from '@smartnote/shared/types'
import type { MemoView, PinResult } from '@smartnote/shared/stores/useMemoStore'
import { generateAiSummary } from '@smartnote/shared/services/llamaService'
import { detectAlarmSuggestion } from '../utils/koreanTimeParser'
import { DUMMY_MEMOS } from '../dummy/memoDummy'

// 더미데이터 단계용 메모 스토어 (메모리 내 CRUD).
// 액션 이름·시그니처는 packages/shared/stores/useMemoStore와 동일 →
// TODO(Firebase 연결): import를 공용 스토어로 바꾸고 subscribe(uid) 호출만 추가하면 됨
// 차이: 알람 제안은 한국어 파서(koreanTimeParser), AI 정리는 Gemini 대신 지연 후 로컬 요약

export const MAX_PINNED = 3
const AI_DELAY_MS = 1000

type MemoSnapshot = NonNullable<MemoView['history']>

function toView(doc: Memo): MemoView {
  return {
    ...doc,
    aiLoading: false,
    alarmSuggestion: detectAlarmSuggestion(doc.body),
    alarmConfirmed: false,
    history: null,
    future: null,
  }
}

const snapshotOf = (m: MemoView): MemoSnapshot => ({
  title: m.title,
  body: m.body,
  location: m.location,
  aiSummary: m.aiSummary,
  aiProcessed: m.aiProcessed,
  aiSummaryBody: m.aiSummaryBody,
})

const newId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

interface MemoState {
  isLoading: boolean
  memos: MemoView[]
  /** editingId가 있으면 수정, 없으면 새로 생성하고 memoId 반환 */
  saveMemo: (title: string, body: string, location: MemoLocation, editingId?: string) => string | undefined
  deleteMemo: (memoId: string) => void
  confirmAlarm: (memoId: string) => void
  dismissAlarm: (memoId: string) => void
  /** 고정/해제. 최대 MAX_PINNED개 초과 시 'limit' 반환 */
  togglePin: (memoId: string) => PinResult
  /** AI 정리 텍스트 직접 수정 저장 (aiSummaryEdited=true) */
  updateAiSummary: (memoId: string, text: string) => void
  /** 직전 상태로 1-스텝 되돌리기 */
  undoMemo: (memoId: string) => void
  /** 되돌리기를 취소하고 원래 상태로 복귀 */
  redoMemo: (memoId: string) => void
  /** AI 분석 수동 실행 (버튼 트리거) */
  runAi: (memoId: string, body: string) => Promise<void>
}

export const useMemoStore = create<MemoState>()((set, get) => {
  const patchMemo = (id: string, patch: Partial<MemoView>) =>
    set(s => ({ memos: s.memos.map(m => (m.memoId === id ? { ...m, ...patch } : m)) }))

  const find = (id: string) => get().memos.find(m => m.memoId === id)

  /** 스냅샷 필드로 메모 내용을 덮어씀 (되돌리기/다시하기 공통) */
  const applySnapshot = (id: string, snap: MemoSnapshot, patch: Partial<MemoView>) =>
    patchMemo(id, { ...snap, aiSummaryEdited: false, updatedAt: Timestamp.now(), ...patch })

  return {
    isLoading: false,
    memos: DUMMY_MEMOS.map(toView),

    saveMemo: (title, body, location, editingId) => {
      if (editingId) {
        const prev = find(editingId)
        if (!prev) return undefined
        patchMemo(editingId, {
          title, body, location, updatedAt: Timestamp.now(),
          history: snapshotOf(prev),
          future: null,
          alarmSuggestion: detectAlarmSuggestion(body),
          alarmConfirmed: false,
        })
        return undefined
      }
      const now = Timestamp.now()
      const memoId = newId()
      const created = toView({
        memoId, title, body, location,
        aiSummary: null, aiProcessed: false, aiProcessedAt: null, aiSummaryBody: null, aiSummaryEdited: false,
        detectedAlarms: [], pinnedAt: null,
        isDeleted: false, deletedAt: null, createdAt: now, updatedAt: now,
      })
      set(s => ({ memos: [created, ...s.memos] }))
      return memoId
    },

    deleteMemo: (memoId) => set(s => ({ memos: s.memos.filter(m => m.memoId !== memoId) })),

    confirmAlarm: (memoId) => patchMemo(memoId, { alarmConfirmed: true }),
    dismissAlarm: (memoId) => patchMemo(memoId, { alarmSuggestion: null }),

    togglePin: (memoId) => {
      const m = find(memoId)
      if (!m) return 'none'
      if (m.pinnedAt) {
        patchMemo(memoId, { pinnedAt: null })
        return 'unpinned'
      }
      if (get().memos.filter(x => x.pinnedAt).length >= MAX_PINNED) return 'limit'
      patchMemo(memoId, { pinnedAt: Date.now() })
      return 'pinned'
    },

    updateAiSummary: (memoId, text) => {
      const m = find(memoId)
      if (!m) return
      patchMemo(memoId, { history: snapshotOf(m), future: null, aiSummary: text, aiSummaryEdited: true })
    },

    undoMemo: (memoId) => {
      const m = find(memoId)
      if (!m?.history) return
      applySnapshot(memoId, m.history, { history: null, future: snapshotOf(m) })
    },

    redoMemo: (memoId) => {
      const m = find(memoId)
      if (!m?.future) return
      applySnapshot(memoId, m.future, { future: null, history: snapshotOf(m) })
    },

    runAi: async (memoId, body) => {
      if (!body.trim()) return
      const m = find(memoId)
      if (!m) return
      patchMemo(memoId, { history: snapshotOf(m), future: null, aiLoading: true })
      await new Promise(resolve => setTimeout(resolve, AI_DELAY_MS))
      patchMemo(memoId, {
        aiSummary: generateAiSummary(body),
        aiProcessed: true,
        aiProcessedAt: Timestamp.now(),
        aiSummaryEdited: false,
        aiSummaryBody: body,
        aiLoading: false,
      })
    },
  }
})
