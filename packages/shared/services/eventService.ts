import { addDoc, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import type { CalendarEvent } from '../types'
import { db } from '../firebase/config'
import { userCol, activeQuery } from './firestoreHelpers'

const COL = 'events'

/** 삭제되지 않은 일정 실시간 구독 */
export function subscribeEvents(uid: string, cb: (events: CalendarEvent[]) => void): () => void {
  return onSnapshot(activeQuery(uid, COL), snap => {
    cb(snap.docs.map(d => ({ eventId: d.id, ...(d.data() as Omit<CalendarEvent, 'eventId'>) })))
  })
}

/** 일정 생성 폼이 다루는 필드 (시각은 Date로 받고 service가 Timestamp로 저장) */
export interface CreateEventInput {
  title: string
  description: string
  start: Date
  end: Date
  color: string
  hasAlarm: boolean
  alarmMinutesBefore: number
}

export function createEvent(uid: string, input: CreateEventInput) {
  const now = Timestamp.now()
  return addDoc(userCol(uid, COL), {
    title: input.title,
    description: input.description,
    start: Timestamp.fromDate(input.start),
    end: Timestamp.fromDate(input.end),
    color: input.color,
    hasAlarm: input.hasAlarm,
    alarmMinutesBefore: input.alarmMinutesBefore,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

export function updateEvent(uid: string, eventId: string, input: CreateEventInput) {
  return updateDoc(doc(db, 'users', uid, COL, eventId), {
    title: input.title,
    description: input.description,
    start: Timestamp.fromDate(input.start),
    end: Timestamp.fromDate(input.end),
    color: input.color,
    hasAlarm: input.hasAlarm,
    alarmMinutesBefore: input.alarmMinutesBefore,
    updatedAt: Timestamp.now(),
  })
}

export function softDeleteEvent(uid: string, eventId: string) {
  return updateDoc(doc(db, 'users', uid, COL, eventId), {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  })
}
