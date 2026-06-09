import { create } from 'zustand'
import type { LocalMemo, LocalMemoLocation } from '../types/localMemo'
import { INITIAL_MEMOS } from '../mocks/mockData'
import { detectAlarmSuggestion, generateAiSummary } from '../services/llamaService'
import { newLocalId } from '../utils/id'

interface MemoState {
  memos: LocalMemo[]
  /** editingId가 있으면 수정, 없으면 새로 생성하고 memoId 반환 */
  saveMemo: (title: string, body: string, location: LocalMemoLocation, editingId?: string) => string | undefined
  deleteMemo: (memoId: string) => void
  confirmAlarm: (memoId: string) => void
  dismissAlarm: (memoId: string) => void
}

export const useMemoStore = create<MemoState>()((set) => ({
  memos: INITIAL_MEMOS,

  saveMemo: (title, body, location, editingId) => {
    if (editingId) {
      set(s => ({
        memos: s.memos.map(m =>
          m.memoId === editingId
            ? { ...m, title, body, location, alarmSuggestion: detectAlarmSuggestion(body) }
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
    }
    set(s => ({ memos: [newMemo, ...s.memos] }))

    // AI 처리 시뮬레이션 — Phase 2에서 Cloud Function 트리거로 대체
    setTimeout(() => {
      set(s => ({ memos: s.memos.map(m => m.memoId === memoId ? { ...m, aiLoading: true } : m) }))
      setTimeout(() => {
        set(s => ({
          memos: s.memos.map(m =>
            m.memoId === memoId
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
}))
