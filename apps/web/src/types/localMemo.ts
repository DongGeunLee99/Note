// 메모 데이터 타입은 @smartnote/shared/types의 Memo + 웹 뷰 타입 MemoView(useMemoStore) 사용.

export type TrashItemType = 'memo'

export interface LocalTrashItem {
  id: string
  type: TrashItemType
  title: string
  preview: string
  deletedAt: Date
}
