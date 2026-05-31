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
}

export type TrashItemType = 'memo'

export interface LocalTrashItem {
  id: string
  type: TrashItemType
  title: string
  preview: string
  deletedAt: Date
}
