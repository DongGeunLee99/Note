import { addDoc, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import type { Alarm, AlarmSourceType } from '../types'
import { db } from '../firebase/config'
import { userCol, activeQuery } from './firestoreHelpers'

const COL = 'alarms'

/** 삭제되지 않은 알람 실시간 구독 */
export function subscribeAlarms(uid: string, cb: (alarms: Alarm[]) => void): () => void {
  return onSnapshot(activeQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ alarmId: d.id, ...(d.data() as Omit<Alarm, 'alarmId'>) })))
  })
}

export interface CreateAlarmInput {
  groupId: string
  label: string
  hour: number
  minute: number
  repeatDays: number[]
  isEnabled: boolean
  sourceType: AlarmSourceType
}

/** 알람 추가/수정 폼이 다루는 필드 (서버 필드는 service가 채움) */
export type AlarmFormInput = Omit<CreateAlarmInput, 'sourceType'>

export function createAlarm(uid: string, input: CreateAlarmInput) {
  const now = Timestamp.now()
  return addDoc(userCol(uid, COL), {
    ...input,
    sound: 'default',
    vibration: true,
    snooze: 0,
    sourceMemoId: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

export function updateAlarm(
  uid: string,
  alarmId: string,
  patch: Partial<Pick<Alarm, 'groupId' | 'label' | 'hour' | 'minute' | 'repeatDays' | 'isEnabled'>>,
) {
  return updateDoc(doc(db, 'users', uid, COL, alarmId), {
    ...patch,
    updatedAt: Timestamp.now(),
  })
}

export function softDeleteAlarm(uid: string, alarmId: string) {
  return updateDoc(doc(db, 'users', uid, COL, alarmId), {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  })
}
