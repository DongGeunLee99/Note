import { create } from 'zustand'
import type { AlarmGroup, Alarm } from '@smartnote/shared/types'
import {
  subscribeGroups, createGroup, updateGroup, softDeleteGroup,
} from '@smartnote/shared/services/alarmGroupService'
import type { GroupFormInput } from '@smartnote/shared/services/alarmGroupService'
import {
  subscribeAlarms, createAlarm, updateAlarm, softDeleteAlarm,
} from '@smartnote/shared/services/alarmService'
import type { AlarmFormInput } from '@smartnote/shared/services/alarmService'

/** 비기본 그룹 먼저(order 오름차순), 기본('기타') 그룹은 항상 마지막 */
function sortGroups(groups: AlarmGroup[]): AlarmGroup[] {
  return [...groups].sort((a, b) =>
    a.isDefault !== b.isDefault ? (a.isDefault ? 1 : -1) : a.order - b.order,
  )
}

interface AlarmState {
  uid: string | null
  isLoading: boolean
  groups: AlarmGroup[]
  alarms: Alarm[]
  /** 로그인 uid로 Firestore 실시간 구독 시작 (중복 호출 시 기존 구독 해제 후 재구독) */
  subscribe: (uid: string) => void
  /** 구독 해제 + 상태 초기화 (로그아웃/언마운트) */
  unsubscribe: () => void
  toggleGroup: (groupId: string) => void
  deleteGroup: (groupId: string) => void
  /** targetId가 있으면 수정, 없으면 새 그룹 생성 */
  saveGroup: (data: GroupFormInput, targetId?: string) => void
  toggleAlarm: (alarmId: string) => void
  deleteAlarm: (alarmId: string) => void
  /** targetId가 있으면 수정, 없으면 생성 */
  saveAlarm: (data: AlarmFormInput, targetId?: string) => void
  quickAddAlarm: (groupId: string, hour: number, minute: number, label: string) => void
}

// 구독 해제 함수는 상태 밖(모듈 스코프)에 보관
let unsubGroups: (() => void) | null = null
let unsubAlarms: (() => void) | null = null

export const useAlarmStore = create<AlarmState>()((set, get) => ({
  uid: null,
  isLoading: true,
  groups: [],
  alarms: [],

  subscribe: (uid) => {
    get().unsubscribe()
    set({ uid, isLoading: true })
    unsubGroups = subscribeGroups(uid, gs => {
      set({ groups: sortGroups(gs), isLoading: false })
    })
    unsubAlarms = subscribeAlarms(uid, as => {
      set({ alarms: as })
    })
  },

  unsubscribe: () => {
    unsubGroups?.()
    unsubAlarms?.()
    unsubGroups = null
    unsubAlarms = null
    set({ uid: null, isLoading: true, groups: [], alarms: [] })
  },

  toggleGroup: (groupId) => {
    const { uid, groups } = get()
    const group = groups.find(g => g.groupId === groupId)
    if (!uid || !group) return
    updateGroup(uid, groupId, { isEnabled: !group.isEnabled })
  },

  deleteGroup: (groupId) => {
    const { uid, alarms } = get()
    if (!uid) return
    softDeleteGroup(uid, groupId)
    // 그룹에 속한 알람도 함께 soft delete
    alarms.filter(a => a.groupId === groupId).forEach(a => softDeleteAlarm(uid, a.alarmId))
  },

  saveGroup: (data, targetId) => {
    const { uid, groups } = get()
    if (!uid) return
    if (targetId) {
      updateGroup(uid, targetId, data)
    } else {
      const order = groups.filter(g => !g.isDefault).length
      createGroup(uid, { ...data, order })
    }
  },

  toggleAlarm: (alarmId) => {
    const { uid, alarms } = get()
    const alarm = alarms.find(a => a.alarmId === alarmId)
    if (!uid || !alarm) return
    updateAlarm(uid, alarmId, { isEnabled: !alarm.isEnabled })
  },

  deleteAlarm: (alarmId) => {
    const { uid } = get()
    if (!uid) return
    softDeleteAlarm(uid, alarmId)
  },

  saveAlarm: (data, targetId) => {
    const { uid } = get()
    if (!uid) return
    if (targetId) {
      updateAlarm(uid, targetId, data)
    } else {
      createAlarm(uid, { ...data, sourceType: 'manual' })
    }
  },

  quickAddAlarm: (groupId, hour, minute, label) => {
    const { uid } = get()
    if (!uid) return
    createAlarm(uid, { groupId, label, hour, minute, repeatDays: [], isEnabled: true, sourceType: 'quickAlarm' })
  },
}))
