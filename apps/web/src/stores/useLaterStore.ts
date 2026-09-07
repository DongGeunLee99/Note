import { create } from 'zustand'
import type { Later } from '@smartnote/shared/types'
import { subscribeLater, createLater, setLaterCompleted, softDeleteLater } from '@smartnote/shared/services/laterService'
import { requestParsedDateTime } from '@/services/llamaService'

interface LaterState {
  uid: string | null
  isLoading: boolean
  items: Later[]
  subscribe: (uid: string) => void
  unsubscribe: () => void
  /** notifyAt 자연어 파싱 실패 시 false 반환(저장 안 함) */
  addItem: (title: string, notifyAtText: string) => Promise<boolean>
  toggleComplete: (laterId: string) => void
  deleteItem: (laterId: string) => void
}

let unsubLater: (() => void) | null = null

export const useLaterStore = create<LaterState>()((set, get) => ({
  uid: null,
  isLoading: true,
  items: [],

  subscribe: (uid) => {
    get().unsubscribe()
    set({ uid, isLoading: true })
    unsubLater = subscribeLater(uid, items => {
      set({
        items: [...items].sort((a, b) => a.notifyAt.toMillis() - b.notifyAt.toMillis()),
        isLoading: false,
      })
    })
  },

  unsubscribe: () => {
    unsubLater?.()
    unsubLater = null
    set({ uid: null, isLoading: true, items: [] })
  },

  addItem: async (title, notifyAtText) => {
    const uid = get().uid
    if (!uid) return false
    const date = await requestParsedDateTime(notifyAtText, new Date())
    if (!date) return false
    createLater(uid, title, date)
    return true
  },

  toggleComplete: (laterId) => {
    const { uid, items } = get()
    const item = items.find(i => i.laterId === laterId)
    if (!uid || !item) return
    setLaterCompleted(uid, laterId, !item.isCompleted)
  },

  deleteItem: (laterId) => {
    const uid = get().uid
    if (!uid) return
    softDeleteLater(uid, laterId)
  },
}))
