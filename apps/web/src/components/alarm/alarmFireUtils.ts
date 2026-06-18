import type { Alarm } from '@smartnote/shared/types'

/** 일회성 알람 여부 (반복 요일이 비어있으면 한 번만) */
export function isOneTime(alarm: Alarm): boolean {
  return alarm.repeatDays.length === 0
}

/** 지금(now) 이 알람이 울려야 하는가 — 시·분 일치 + (반복 요일 포함 | 일회성) */
export function matchesNow(alarm: Alarm, now: Date): boolean {
  if (alarm.hour !== now.getHours() || alarm.minute !== now.getMinutes()) return false
  if (isOneTime(alarm)) return true
  return alarm.repeatDays.includes(now.getDay())
}

/** 같은 분(分) 내 중복 발생 방지용 분 단위 키 */
export function minuteKey(now: Date): string {
  return `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
}
