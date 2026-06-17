import { collection, query, where } from 'firebase/firestore'
import type { CollectionReference, Query } from 'firebase/firestore'
import { db } from '../firebase/config'

/** users/{uid}/{name} 컬렉션 참조 */
export function userCol(uid: string, name: string): CollectionReference {
  return collection(db, 'users', uid, name)
}

/** 삭제되지 않은 문서만(where isDeleted == false). 정렬은 호출부에서 클라이언트 측 처리(복합 인덱스 회피) */
export function activeQuery(uid: string, name: string): Query {
  return query(userCol(uid, name), where('isDeleted', '==', false))
}
