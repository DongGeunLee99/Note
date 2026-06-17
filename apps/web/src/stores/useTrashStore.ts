import { create } from 'zustand'
import type { TrashItem } from '@/types/localItems'
import type { Memo } from '@smartnote/shared/types'
import { subscribeDeletedMemos, restoreMemo, hardDeleteMemo } from '@smartnote/shared/services/memoService'

// soft delete된 메모 → 휴지통 표시용 항목. (later/someday는 Firestore migrate 시 합류, 알람은 설계상 제외)
function memoToTrashItem(m: Memo): TrashItem {
  return {
    id: m.memoId,
    type: 'memo',
    title: m.title || m.body.split('\n')[0].slice(0, 30) || '(제목 없음)',
    preview: m.body.slice(0, 80),
    deletedAt: m.deletedAt ? m.deletedAt.toDate() : new Date(),
  }
}

interface TrashState {
  uid: string | null
  isLoading: boolean
  items: TrashItem[]
  subscribe: (uid: string) => void
  unsubscribe: () => void
  restore: (id: string) => void
  permanentDelete: (id: string) => void
  emptyAll: () => void
}

let unsubTrash: (() => void) | null = null

export const useTrashStore = create<TrashState>()((set, get) => ({
  uid: null,
  isLoading: true,
  items: [],

  subscribe: (uid) => {
    get().unsubscribe()
    set({ uid, isLoading: true })
    unsubTrash = subscribeDeletedMemos(uid, memos => {
      set({ items: memos.map(memoToTrashItem), isLoading: false })
    })
  },

  unsubscribe: () => {
    unsubTrash?.()
    unsubTrash = null
    set({ uid: null, isLoading: true, items: [] })
  },

  restore: (id) => {
    const { uid, items } = get()
    if (!uid) return
    const item = items.find(i => i.id === id)
    if (item?.type === 'memo') restoreMemo(uid, id)
  },

  permanentDelete: (id) => {
    const { uid, items } = get()
    if (!uid) return
    const item = items.find(i => i.id === id)
    if (item?.type === 'memo') hardDeleteMemo(uid, id)
  },

  emptyAll: () => {
    const { uid, items } = get()
    if (!uid) return
    items.forEach(i => {
      if (i.type === 'memo') hardDeleteMemo(uid, i.id)
    })
  },
}))
