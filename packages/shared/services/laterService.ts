import { addDoc, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import type { Later } from '../types'
import { db } from '../firebase/config'
import { userCol, activeQuery } from './firestoreHelpers'

const COL = 'later'

/** 삭제되지 않은 '나중에' 항목 실시간 구독 */
export function subscribeLater(uid: string, cb: (items: Later[]) => void): () => void {
  return onSnapshot(activeQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ laterId: d.id, ...(d.data() as Omit<Later, 'laterId'>) })))
  })
}

export function createLater(uid: string, title: string, notifyAt: Date) {
  return addDoc(userCol(uid, COL), {
    title,
    notifyAt: Timestamp.fromDate(notifyAt),
    isCompleted: false,
    completedAt: null,
    snoozedCount: 0,
    isDeleted: false,
    deletedAt: null,
    createdAt: Timestamp.now(),
  })
}

export function setLaterCompleted(uid: string, laterId: string, isCompleted: boolean) {
  return updateDoc(doc(db, 'users', uid, COL, laterId), {
    isCompleted,
    completedAt: isCompleted ? Timestamp.now() : null,
  })
}

export function softDeleteLater(uid: string, laterId: string) {
  return updateDoc(doc(db, 'users', uid, COL, laterId), {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  })
}
