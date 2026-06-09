import { create } from 'zustand'
import type { RecentEntry } from '../types/localItems'
import type { ClassifiedCategory } from '../services/llamaService'
import { classifyText } from '../services/llamaService'
import { INITIAL_HOME_ENTRIES } from '../mocks/mockData'
import { newLocalId } from '../utils/id'

export type HomeCategory = 'AI' | ClassifiedCategory

interface HomeState {
  entries: RecentEntry[]
  /** category가 'AI'면 자동 분류. 실제 저장된 카테고리를 반환 */
  addEntry: (text: string, category: HomeCategory) => ClassifiedCategory
}

export const useHomeStore = create<HomeState>()((set) => ({
  entries: INITIAL_HOME_ENTRIES,

  addEntry: (text, category) => {
    const saved: ClassifiedCategory = category === 'AI' ? classifyText(text) : category
    set(s => ({
      entries: [{ id: newLocalId('e'), text, category: saved, createdAt: new Date() }, ...s.entries],
    }))
    return saved
  },
}))
