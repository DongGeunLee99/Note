import { addDoc, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import type { AlarmGroup } from '../types'
import { db } from '../firebase/config'
import { userCol, activeQuery } from './firestoreHelpers'

const COL = 'alarmGroups'

/** 그룹 추가/수정 폼이 다루는 필드 */
export type GroupFormInput = { name: string; color: string; icon: string }

/** 삭제되지 않은 알람 그룹 실시간 구독. 정렬은 호출부에서 처리 */
export function subscribeGroups(uid: string, cb: (groups: AlarmGroup[]) => void): () => void {
  return onSnapshot(activeQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ groupId: d.id, ...(d.data() as Omit<AlarmGroup, 'groupId'>) })))
  })
}

export function createGroup(
  uid: string,
  data: { name: string; color: string; icon: string; order: number },
) {
  return addDoc(userCol(uid, COL), {
    ...data,
    isEnabled: true,
    isDefault: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: Timestamp.now(),
  })
}

export function updateGroup(
  uid: string,
  groupId: string,
  patch: Partial<Pick<AlarmGroup, 'name' | 'color' | 'icon' | 'isEnabled' | 'order'>>,
) {
  return updateDoc(doc(db, 'users', uid, COL, groupId), patch)
}

export function softDeleteGroup(uid: string, groupId: string) {
  return updateDoc(doc(db, 'users', uid, COL, groupId), {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  })
}
