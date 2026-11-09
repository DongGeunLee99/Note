import { create } from 'zustand'
import { classifyText, type ClassifiedCategory } from '@smartnote/shared/services/llamaService'
import type { HomeCategory } from '../components/home/categoryConfig'
import { DUMMY_RECENT_ENTRIES, type RecentEntry } from '../dummy/homeDummy'
import { parseKoreanTime } from '../utils/koreanTimeParser'
import { useAlarmStore } from './useAlarmStore'
import { useMemoStore } from './useMemoStore'

// 더미데이터 단계용 홈 스토어 — 빠른 입력을 분류해서 받을 수 있는 화면(알람·메모)엔 실제로 생성하고,
// 아직 화면이 없는 분류(일정·할일·나중에·언젠가)는 최근 기록에만 남긴다

export type AddEntryResult =
  | { status: 'created'; category: ClassifiedCategory; detail: string }
  | { status: 'recorded'; category: ClassifiedCategory }
  /** 알람으로 분류됐지만 시간을 못 찾음 → 저장 안 함 */
  | { status: 'noTime'; category: ClassifiedCategory }

const NO_LOCATION = { lat: null, lng: null, label: null }

const newId = () => `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const pad = (n: number) => String(n).padStart(2, '0')

/** 받을 화면이 있는 분류면 실제 항목 생성. 생성 결과 설명(또는 실패) 반환 */
function routeToStore(text: string, category: ClassifiedCategory): AddEntryResult {
  if (category === '알람') {
    const parsed = parseKoreanTime(text)
    if (!parsed) return { status: 'noTime', category }
    const alarmStore = useAlarmStore.getState()
    const defaultGroup = alarmStore.groups.find(g => g.isDefault)
    if (!defaultGroup) return { status: 'recorded', category }
    alarmStore.quickAddAlarm(defaultGroup.groupId, parsed.hour, parsed.minute, parsed.label)
    return { status: 'created', category, detail: `알람 탭 기타 그룹 · ${pad(parsed.hour)}:${pad(parsed.minute)} ${parsed.label}` }
  }
  if (category === '메모') {
    useMemoStore.getState().saveMemo('', text, NO_LOCATION)
    return { status: 'created', category, detail: '메모 탭' }
  }
  return { status: 'recorded', category }
}

interface HomeState {
  entries: RecentEntry[]
  /** category가 'AI'면 자동 분류 후 저장 */
  addEntry: (text: string, category: HomeCategory) => AddEntryResult
}

export const useHomeStore = create<HomeState>()((set) => ({
  entries: DUMMY_RECENT_ENTRIES,

  addEntry: (text, category) => {
    const resolved: ClassifiedCategory = category === 'AI' ? classifyText(text) : category
    const result = routeToStore(text, resolved)
    if (result.status === 'noTime') return result
    const entry: RecentEntry = { id: newId(), text, category: resolved, createdAt: new Date(), linked: result.status === 'created' }
    set(s => ({ entries: [entry, ...s.entries] }))
    return result
  },
}))
