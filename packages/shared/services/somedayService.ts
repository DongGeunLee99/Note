import { addDoc, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import type { Someday, SomedayCategory } from '../types'
import { db } from '../firebase/config'
import { userCol, activeQuery } from './firestoreHelpers'

const COL = 'someday'

/** 삭제되지 않은 '언젠가' 항목 실시간 구독 */
export function subscribeSomeday(uid: string, cb: (items: Someday[]) => void): () => void {
  return onSnapshot(activeQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ somedayId: d.id, ...(d.data() as Omit<Someday, 'somedayId'>) })))
  })
}

export function createSomeday(uid: string, title: string, category: SomedayCategory, isFavorite: boolean) {
  return addDoc(userCol(uid, COL), {
    title,
    category,
    aiCategory: null,
    isFavorite,
    isDeleted: false,
    deletedAt: null,
    createdAt: Timestamp.now(),
  })
}

export function setSomedayFavorite(uid: string, somedayId: string, isFavorite: boolean) {
  return updateDoc(doc(db, 'users', uid, COL, somedayId), { isFavorite })
}

export function softDeleteSomeday(uid: string, somedayId: string) {
  return updateDoc(doc(db, 'users', uid, COL, somedayId), {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  })
}
