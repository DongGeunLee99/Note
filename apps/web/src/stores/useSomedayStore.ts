import { create } from 'zustand'
import type { SomedayCategory, SomedayItem } from '@/types/localItems'
import { INITIAL_SOMEDAY } from '@/mocks/mockData'
import { newLocalId } from '@/utils/id'

interface SomedayState {
  items: SomedayItem[]
  addItem: (title: string, category: SomedayCategory, isFavorite: boolean) => void
  deleteItem: (id: string) => void
  toggleFavorite: (id: string) => void
}

export const useSomedayStore = create<SomedayState>()((set) => ({
  items: INITIAL_SOMEDAY,

  addItem: (title, category, isFavorite) => set(s => ({
    items: [...s.items, { id: newLocalId('s'), title, category, isFavorite }],
  })),

  deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

  toggleFavorite: (id) => set(s => ({
    items: s.items.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i),
  })),
}))
