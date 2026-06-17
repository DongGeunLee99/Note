import { create } from 'zustand'
import type { Memo, MemoLocation } from '@smartnote/shared/types'
import {
  subscribeMemos, createMemo, updateMemo, softDeleteMemo,
} from '@smartnote/shared/services/memoService'
import { detectAlarmSuggestion, generateAiSummary } from '@/services/llamaService'
import type { AlarmSuggestion } from '@/services/llamaService'

export type PinResult = 'pinned' | 'unpinned' | 'limit' | 'none'
export const MAX_PINNED = 3

/** 영속 Memo + 화면 전용 임시 상태(Firestore에 저장 안 함) */
export interface MemoView extends Memo {
  aiLoading: boolean
  alarmSuggestion: AlarmSuggestion | null
  alarmConfirmed: boolean
  history: { title: string; body: string; aiSummary: string | null } | null
}

/** Firestore 문서 → 뷰. 기존 뷰가 있으면 임시 상태 보존, 없으면(신규) 본문에서 알람 추출 */
function toView(doc: Memo, existing?: MemoView): MemoView {
  return {
    ...doc,
    aiLoading: existing?.aiLoading ?? false,
    alarmSuggestion: existing ? existing.alarmSuggestion : detectAlarmSuggestion(doc.body),
    alarmConfirmed: existing?.alarmConfirmed ?? false,
    history: existing?.history ?? null,
  }
}

interface MemoState {
  uid: string | null
  isLoading: boolean
  memos: MemoView[]
  subscribe: (uid: string) => void
  unsubscribe: () => void
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
}

let unsubMemos: (() => void) | null = null

export const useMemoStore = create<MemoState>()((set, get) => {
  // 특정 메모의 임시 상태만 갱신
  const patchMemo = (id: string, patch: Partial<MemoView>) =>
    set(s => ({ memos: s.memos.map(m => (m.memoId === id ? { ...m, ...patch } : m)) }))

  // AI 정리 시뮬레이션 — Phase 2에서 Cloud Function로 대체. 결과는 Firestore에 기록
  const runAiSim = (id: string, body: string) => {
    setTimeout(() => {
      patchMemo(id, { aiLoading: true })
      setTimeout(() => {
        const uid = get().uid
        const memo = get().memos.find(m => m.memoId === id)
        // 사용자가 직접 수정한 경우 자동 생성으로 덮어쓰지 않음
        if (uid && memo && !memo.aiSummaryEdited) {
          updateMemo(uid, id, { aiSummary: generateAiSummary(body), aiProcessed: true, aiSummaryEdited: false })
        }
        patchMemo(id, { aiLoading: false })
      }, 2500)
    }, 1500)
  }

  return {
    uid: null,
    isLoading: true,
    memos: [],

    subscribe: (uid) => {
      get().unsubscribe()
      set({ uid, isLoading: true })
      unsubMemos = subscribeMemos(uid, docs => {
        set(s => ({
          memos: docs.map(d => toView(d, s.memos.find(m => m.memoId === d.memoId))),
          isLoading: false,
        }))
      })
    },

    unsubscribe: () => {
      unsubMemos?.()
      unsubMemos = null
      set({ uid: null, isLoading: true, memos: [] })
    },

    saveMemo: (title, body, location, editingId) => {
      const uid = get().uid
      if (!uid) return undefined
      if (editingId) {
        const prev = get().memos.find(m => m.memoId === editingId)
        if (prev) {
          patchMemo(editingId, {
            history: { title: prev.title, body: prev.body, aiSummary: prev.aiSummary },
            alarmSuggestion: detectAlarmSuggestion(body),
            alarmConfirmed: false,
          })
        }
        updateMemo(uid, editingId, { title, body, location })
        runAiSim(editingId, body)
        return undefined
      }
      const id = createMemo(uid, { title, body, location })
      runAiSim(id, body)
      return id
    },

    deleteMemo: (memoId) => {
      const uid = get().uid
      if (!uid) return
      softDeleteMemo(uid, memoId)
    },

    confirmAlarm: (memoId) => patchMemo(memoId, { alarmConfirmed: true }),

    dismissAlarm: (memoId) => patchMemo(memoId, { alarmSuggestion: null }),

    togglePin: (memoId) => {
      const uid = get().uid
      const m = get().memos.find(x => x.memoId === memoId)
      if (!uid || !m) return 'none'
      if (m.pinnedAt) {
        updateMemo(uid, memoId, { pinnedAt: null })
        return 'unpinned'
      }
      if (get().memos.filter(x => x.pinnedAt).length >= MAX_PINNED) return 'limit'
      updateMemo(uid, memoId, { pinnedAt: Date.now() })
      return 'pinned'
    },

    updateAiSummary: (memoId, text) => {
      const uid = get().uid
      const m = get().memos.find(x => x.memoId === memoId)
      if (!uid || !m) return
      patchMemo(memoId, { history: { title: m.title, body: m.body, aiSummary: m.aiSummary } })
      updateMemo(uid, memoId, { aiSummary: text, aiSummaryEdited: true })
    },

    undoMemo: (memoId) => {
      const uid = get().uid
      const m = get().memos.find(x => x.memoId === memoId)
      if (!uid || !m || !m.history) return
      const h = m.history
      updateMemo(uid, memoId, { title: h.title, body: h.body, aiSummary: h.aiSummary, aiSummaryEdited: false })
      patchMemo(memoId, { history: null })
    },
  }
})
