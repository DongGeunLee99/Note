import { create } from 'zustand'
import type { TrashItem } from '../types/localItems'
import { INITIAL_TRASH } from '../mocks/mockData'

interface TrashState {
  items: TrashItem[]
  restore: (id: string) => void
  permanentDelete: (id: string) => void
  emptyAll: () => void
}

export const useTrashStore = create<TrashState>()((set) => ({
  items: INITIAL_TRASH,

  // Phase 1은 목업이라 복원도 목록에서 제거만 한다
  restore: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

  permanentDelete: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

  emptyAll: () => set({ items: [] }),
}))
