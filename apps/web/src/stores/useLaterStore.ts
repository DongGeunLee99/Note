import { create } from 'zustand'
import type { LaterItem } from '../types/localItems'
import { INITIAL_LATER } from '../mocks/mockData'
import { newLocalId } from '../utils/id'

interface LaterState {
  items: LaterItem[]
  addItem: (text: string, notifyAt: string) => void
  toggleComplete: (id: string) => void
  deleteItem: (id: string) => void
}

export const useLaterStore = create<LaterState>()((set) => ({
  items: INITIAL_LATER,

  addItem: (text, notifyAt) => set(s => ({
    items: [{ id: newLocalId('l'), text, notifyAt: notifyAt || '미정', isCompleted: false }, ...s.items],
  })),

  toggleComplete: (id) => set(s => ({
    items: s.items.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i),
  })),

  deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
}))
