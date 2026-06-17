import { doc, setDoc, updateDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import type { Memo, MemoLocation } from '../types'
import { db } from '../firebase/config'
import { userCol, activeQuery, deletedQuery } from './firestoreHelpers'

const COL = 'memos'

/** 삭제되지 않은 메모 실시간 구독. 정렬(고정 등)은 호출부에서 처리 */
export function subscribeMemos(uid: string, cb: (memos: Memo[]) => void): () => void {
  return onSnapshot(activeQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ memoId: d.id, ...(d.data() as Omit<Memo, 'memoId'>) })))
  })
}

export interface CreateMemoInput {
  title: string
  body: string
  location: MemoLocation
}

/** 메모 생성. 문서 ID를 즉시 반환(클라 생성) — 호출부에서 선택 등에 사용 */
export function createMemo(uid: string, input: CreateMemoInput): string {
  const ref = doc(userCol(uid, COL))
  const now = Timestamp.now()
  void setDoc(ref, {
    ...input,
    aiSummary: null,
    aiProcessed: false,
    aiProcessedAt: null,
    aiSummaryEdited: false,
    detectedAlarms: [],
    pinnedAt: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

/** 메모 부분 수정. aiProcessed가 true로 들어오면 aiProcessedAt도 기록. updatedAt 자동 갱신 */
export function updateMemo(
  uid: string,
  memoId: string,
  patch: Partial<Pick<Memo, 'title' | 'body' | 'location' | 'aiSummary' | 'aiProcessed' | 'aiSummaryEdited' | 'pinnedAt'>>,
) {
  const data: Record<string, unknown> = { ...patch, updatedAt: Timestamp.now() }
  if (patch.aiProcessed === true) data.aiProcessedAt = Timestamp.now()
  return updateDoc(doc(db, 'users', uid, COL, memoId), data)
}

export function softDeleteMemo(uid: string, memoId: string) {
  return updateDoc(doc(db, 'users', uid, COL, memoId), {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  })
}

/** 휴지통(soft delete된 메모) 실시간 구독 */
export function subscribeDeletedMemos(uid: string, cb: (memos: Memo[]) => void): () => void {
  return onSnapshot(deletedQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ memoId: d.id, ...(d.data() as Omit<Memo, 'memoId'>) })))
  })
}

/** 휴지통에서 복원 */
export function restoreMemo(uid: string, memoId: string) {
  return updateDoc(doc(db, 'users', uid, COL, memoId), {
    isDeleted: false,
    deletedAt: null,
    updatedAt: Timestamp.now(),
  })
}

/** 영구 삭제 (문서 자체 제거 — 되돌릴 수 없음) */
export function hardDeleteMemo(uid: string, memoId: string) {
  return deleteDoc(doc(db, 'users', uid, COL, memoId))
}
