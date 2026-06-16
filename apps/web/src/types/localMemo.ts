export interface LocalMemoLocation {
  lat: number | null
  lng: number | null
  label: string | null
}

export interface LocalAlarmSuggestion {
  datetime: Date
  label: string
}

export interface LocalMemo {
  memoId: string
  title: string
  body: string
  aiSummary: string | null
  aiReady: boolean
  aiLoading: boolean
  location: LocalMemoLocation
  alarmSuggestion: LocalAlarmSuggestion | null
  alarmConfirmed: boolean
  createdAt: Date
  /** 고정 시각(ms). 없으면 미고정. 목록 최상단 정렬용 */
  pinnedAt?: number | null
  /** AI 정리를 사용자가 직접 수정했는지 — 재분석 덮어쓰기 방지 */
  aiSummaryEdited?: boolean
  /** 직전 상태 1개 보관 — 1-스텝 되돌리기용 */
  history?: { title: string; body: string; aiSummary: string | null } | null
}

export type TrashItemType = 'memo'

export interface LocalTrashItem {
  id: string
  type: TrashItemType
  title: string
  preview: string
  deletedAt: Date
}
