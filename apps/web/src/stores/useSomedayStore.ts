import { create } from 'zustand'
import type { Someday, SomedayCategory } from '@smartnote/shared/types'
import { subscribeSomeday, createSomeday, setSomedayFavorite, softDeleteSomeday } from '@smartnote/shared/services/somedayService'

interface SomedayState {
  uid: string | null
  isLoading: boolean
  items: Someday[]
  subscribe: (uid: string) => void
  unsubscribe: () => void
  addItem: (title: string, category: SomedayCategory, isFavorite: boolean) => void
  deleteItem: (somedayId: string) => void
  toggleFavorite: (somedayId: string) => void
}

let unsubSomeday: (() => void) | null = null

export const useSomedayStore = create<SomedayState>()((set, get) => ({
  uid: null,
  isLoading: true,
  items: [],

  subscribe: (uid) => {
    get().unsubscribe()
    set({ uid, isLoading: true })
    unsubSomeday = subscribeSomeday(uid, items => {
      set({ items, isLoading: false })
    })
  },

  unsubscribe: () => {
    unsubSomeday?.()
    unsubSomeday = null
    set({ uid: null, isLoading: true, items: [] })
  },

  addItem: (title, category, isFavorite) => {
    const uid = get().uid
    if (!uid) return
    createSomeday(uid, title, category, isFavorite)
  },

  deleteItem: (somedayId) => {
    const uid = get().uid
    if (!uid) return
    softDeleteSomeday(uid, somedayId)
  },

  toggleFavorite: (somedayId) => {
    const { uid, items } = get()
    const item = items.find(i => i.somedayId === somedayId)
    if (!uid || !item) return
    setSomedayFavorite(uid, somedayId, !item.isFavorite)
  },
}))
