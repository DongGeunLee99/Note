import { create } from 'zustand'
import { Timestamp } from 'firebase/firestore'
import type { AlarmGroup, Alarm } from '@smartnote/shared/types'
import type { GroupFormInput } from '@smartnote/shared/services/alarmGroupService'
import type { AlarmFormInput } from '@smartnote/shared/services/alarmService'
import { DUMMY_GROUPS, DUMMY_ALARMS } from '../dummy/alarmDummy'

// 더미데이터 단계용 알람 스토어 (메모리 내 CRUD).
// 액션 이름·시그니처는 packages/shared/stores/useAlarmStore와 동일 →
// TODO(Firebase 연결): import를 공용 스토어로 바꾸고 subscribe(uid) 호출만 추가하면 됨

/** 비기본 그룹 먼저(order 오름차순), 기본('기타') 그룹은 항상 마지막 */
function sortGroups(groups: AlarmGroup[]): AlarmGroup[] {
  return [...groups].sort((a, b) =>
    a.isDefault !== b.isDefault ? (a.isDefault ? 1 : -1) : a.order - b.order,
  )
}

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

interface AlarmState {
  isLoading: boolean
  groups: AlarmGroup[]
  alarms: Alarm[]
  toggleGroup: (groupId: string) => void
  deleteGroup: (groupId: string) => void
  /** targetId가 있으면 수정, 없으면 새 그룹 생성 */
  saveGroup: (data: GroupFormInput, targetId?: string) => void
  toggleAlarm: (alarmId: string) => void
  deleteAlarm: (alarmId: string) => void
  /** targetId가 있으면 수정, 없으면 생성 */
  saveAlarm: (data: AlarmFormInput, targetId?: string) => void
  quickAddAlarm: (groupId: string, hour: number, minute: number, label: string) => void
  /** 메모 알람 제안 수락 → 기본('기타') 그룹에 한 번 울리는 알람 생성 */
  addMemoAlarm: (memoId: string, hour: number, minute: number, label: string) => void
}

export const useAlarmStore = create<AlarmState>()((set, get) => ({
  isLoading: false,
  groups: sortGroups(DUMMY_GROUPS),
  alarms: DUMMY_ALARMS,

  toggleGroup: (groupId) => {
    set(s => ({ groups: s.groups.map(g => g.groupId === groupId ? { ...g, isEnabled: !g.isEnabled } : g) }))
  },

  deleteGroup: (groupId) => {
    const group = get().groups.find(g => g.groupId === groupId)
    if (!group || group.isDefault) return
    // 그룹에 속한 알람도 함께 삭제
    set(s => ({
      groups: s.groups.filter(g => g.groupId !== groupId),
      alarms: s.alarms.filter(a => a.groupId !== groupId),
    }))
  },

  saveGroup: (data, targetId) => {
    if (targetId) {
      set(s => ({ groups: s.groups.map(g => g.groupId === targetId ? { ...g, ...data } : g) }))
      return
    }
    const order = get().groups.filter(g => !g.isDefault).length
    const group: AlarmGroup = {
      ...data, groupId: newId('g'), order,
      isEnabled: true, isDefault: false, isDeleted: false, deletedAt: null, createdAt: Timestamp.now(),
    }
    set(s => ({ groups: sortGroups([...s.groups, group]) }))
  },

  toggleAlarm: (alarmId) => {
    set(s => ({ alarms: s.alarms.map(a => a.alarmId === alarmId ? { ...a, isEnabled: !a.isEnabled } : a) }))
  },

  deleteAlarm: (alarmId) => {
    set(s => ({ alarms: s.alarms.filter(a => a.alarmId !== alarmId) }))
  },

  saveAlarm: (data, targetId) => {
    const now = Timestamp.now()
    if (targetId) {
      set(s => ({ alarms: s.alarms.map(a => a.alarmId === targetId ? { ...a, ...data, updatedAt: now } : a) }))
      return
    }
    const alarm: Alarm = {
      ...data, alarmId: newId('a'), sourceType: 'manual',
      sound: 'default', vibration: true, snooze: 0, sourceMemoId: null,
      isDeleted: false, deletedAt: null, createdAt: now, updatedAt: now,
    }
    set(s => ({ alarms: [...s.alarms, alarm] }))
  },

  quickAddAlarm: (groupId, hour, minute, label) => {
    const now = Timestamp.now()
    const alarm: Alarm = {
      alarmId: newId('a'), groupId, label, hour, minute, repeatDays: [], isEnabled: true,
      sourceType: 'quickAlarm', sound: 'default', vibration: true, snooze: 0, sourceMemoId: null,
      isDeleted: false, deletedAt: null, createdAt: now, updatedAt: now,
    }
    set(s => ({ alarms: [...s.alarms, alarm] }))
  },

  addMemoAlarm: (memoId, hour, minute, label) => {
    const defaultGroup = get().groups.find(g => g.isDefault)
    if (!defaultGroup) return
    const now = Timestamp.now()
    const alarm: Alarm = {
      alarmId: newId('a'), groupId: defaultGroup.groupId, label, hour, minute, repeatDays: [], isEnabled: true,
      sourceType: 'memoDetected', sound: 'default', vibration: true, snooze: 0, sourceMemoId: memoId,
      isDeleted: false, deletedAt: null, createdAt: now, updatedAt: now,
    }
    set(s => ({ alarms: [...s.alarms, alarm] }))
  },
}))
