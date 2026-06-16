import { create } from 'zustand'
import type { LocalMemo, LocalMemoLocation } from '@/types/localMemo'
import { INITIAL_MEMOS } from '@/mocks/mockData'
import { detectAlarmSuggestion, generateAiSummary } from '@/services/llamaService'
import { newLocalId } from '@/utils/id'

export type PinResult = 'pinned' | 'unpinned' | 'limit' | 'none'
export const MAX_PINNED = 3

interface MemoState {
  memos: LocalMemo[]
  /** editingId가 있으면 수정, 없으면 새로 생성하고 memoId 반환 */
  saveMemo: (title: string, body: string, location: LocalMemoLocation, editingId?: string) => string | undefined
  deleteMemo: (memoId: string) => void
  confirmAlarm: (memoId: string) => void
  dismissAlarm: (memoId: string) => void
  /** 고정/해제. 최대 MAX_PINNED개 초과 시 'limit' 반환 */
  togglePin: (memoId: string) => PinResult
  /** AI 정리 텍스트 직접 수정 저장 (aiSummaryEdited=true) */
  updateAiSummary: (memoId: string, text: string) => void
  /** 직전 상태로 1-스텝 되돌리기 */
  undoMemo: (memoId: string) => void
}

export const useMemoStore = create<MemoState>()((set, get) => ({
  memos: INITIAL_MEMOS,

  saveMemo: (title, body, location, editingId) => {
    if (editingId) {
      set(s => ({
        memos: s.memos.map(m =>
          m.memoId === editingId
            ? {
                ...m,
                history: { title: m.title, body: m.body, aiSummary: m.aiSummary },
                title, body, location,
                alarmSuggestion: detectAlarmSuggestion(body),
              }
            : m
        ),
      }))
      return undefined
    }

    const memoId = newLocalId('m')
    const newMemo: LocalMemo = {
      memoId,
      title,
      body,
      aiSummary: null,
      aiReady: false,
      aiLoading: false,
      location,
      alarmSuggestion: detectAlarmSuggestion(body),
      alarmConfirmed: false,
      createdAt: new Date(),
      pinnedAt: null,
      aiSummaryEdited: false,
      history: null,
    }
    set(s => ({ memos: [newMemo, ...s.memos] }))

    // AI 처리 시뮬레이션 — Phase 2에서 Cloud Function 트리거로 대체
    setTimeout(() => {
      set(s => ({ memos: s.memos.map(m => m.memoId === memoId ? { ...m, aiLoading: true } : m) }))
      setTimeout(() => {
        set(s => ({
          memos: s.memos.map(m =>
            // 사용자가 직접 수정한 경우 자동 생성으로 덮어쓰지 않음
            m.memoId === memoId && !m.aiSummaryEdited
              ? { ...m, aiLoading: false, aiReady: true, aiSummary: generateAiSummary(body) }
              : m
          ),
        }))
      }, 2500)
    }, 1500)

    return memoId
  },

  deleteMemo: (memoId) => set(s => ({ memos: s.memos.filter(m => m.memoId !== memoId) })),

  confirmAlarm: (memoId) => set(s => ({
    memos: s.memos.map(m => m.memoId === memoId ? { ...m, alarmConfirmed: true } : m),
  })),

  dismissAlarm: (memoId) => set(s => ({
    memos: s.memos.map(m => m.memoId === memoId ? { ...m, alarmSuggestion: null } : m),
  })),

  togglePin: (memoId) => {
    const m = get().memos.find(x => x.memoId === memoId)
    if (!m) return 'none'
    if (m.pinnedAt) {
      set(s => ({ memos: s.memos.map(x => x.memoId === memoId ? { ...x, pinnedAt: null } : x) }))
      return 'unpinned'
    }
    if (get().memos.filter(x => x.pinnedAt).length >= MAX_PINNED) return 'limit'
    set(s => ({ memos: s.memos.map(x => x.memoId === memoId ? { ...x, pinnedAt: Date.now() } : x) }))
    return 'pinned'
  },

  updateAiSummary: (memoId, text) => set(s => ({
    memos: s.memos.map(m =>
      m.memoId === memoId
        ? {
            ...m,
            history: { title: m.title, body: m.body, aiSummary: m.aiSummary },
            aiSummary: text,
            aiSummaryEdited: true,
          }
        : m
    ),
  })),

  undoMemo: (memoId) => set(s => ({
    memos: s.memos.map(m =>
      m.memoId === memoId && m.history
        ? { ...m, title: m.history.title, body: m.history.body, aiSummary: m.history.aiSummary, history: null }
        : m
    ),
  })),
}))
