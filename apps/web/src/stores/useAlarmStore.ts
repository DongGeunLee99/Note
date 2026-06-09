import { create } from 'zustand'
import type { LocalAlarm, LocalAlarmGroup } from '../types/localAlarm'
import { INITIAL_GROUPS, INITIAL_ALARMS } from '../mocks/mockData'
import { newLocalId } from '../utils/id'

interface AlarmState {
  groups: LocalAlarmGroup[]
  alarms: LocalAlarm[]
  toggleGroup: (groupId: string) => void
  deleteGroup: (groupId: string) => void
  /** targetId가 있으면 수정, 없으면 기본 그룹 앞에 추가 */
  saveGroup: (data: { name: string; color: string; emoji: string }, targetId?: string) => void
  toggleAlarm: (alarmId: string) => void
  deleteAlarm: (alarmId: string) => void
  /** targetId가 있으면 수정, 없으면 추가 */
  saveAlarm: (data: Omit<LocalAlarm, 'alarmId' | 'sourceMemoId'>, targetId?: string) => void
  quickAddAlarm: (groupId: string, hour: number, minute: number, label: string) => void
}

export const useAlarmStore = create<AlarmState>()((set) => ({
  groups: INITIAL_GROUPS,
  alarms: INITIAL_ALARMS,

  toggleGroup: (groupId) => set(s => ({
    groups: s.groups.map(g => g.groupId === groupId ? { ...g, isEnabled: !g.isEnabled } : g),
  })),

  deleteGroup: (groupId) => set(s => ({
    groups: s.groups.filter(g => g.groupId !== groupId),
    alarms: s.alarms.filter(a => a.groupId !== groupId),
  })),

  saveGroup: (data, targetId) => set(s => {
    if (targetId) {
      return { groups: s.groups.map(g => g.groupId === targetId ? { ...g, ...data } : g) }
    }
    const newGroup: LocalAlarmGroup = { groupId: newLocalId('g'), ...data, isEnabled: true, isDefault: false }
    const defaultIdx = s.groups.findIndex(g => g.isDefault)
    if (defaultIdx === -1) return { groups: [...s.groups, newGroup] }
    return { groups: [...s.groups.slice(0, defaultIdx), newGroup, ...s.groups.slice(defaultIdx)] }
  }),

  toggleAlarm: (alarmId) => set(s => ({
    alarms: s.alarms.map(a => a.alarmId === alarmId ? { ...a, isEnabled: !a.isEnabled } : a),
  })),

  deleteAlarm: (alarmId) => set(s => ({
    alarms: s.alarms.filter(a => a.alarmId !== alarmId),
  })),

  saveAlarm: (data, targetId) => set(s => {
    if (targetId) {
      return { alarms: s.alarms.map(a => a.alarmId === targetId ? { ...a, ...data } : a) }
    }
    return { alarms: [...s.alarms, { alarmId: newLocalId('a'), ...data, sourceMemoId: null }] }
  }),

  quickAddAlarm: (groupId, hour, minute, label) => set(s => ({
    alarms: [...s.alarms, {
      alarmId: newLocalId('a'),
      groupId, label, hour, minute,
      repeatDays: [], isEnabled: true, sourceMemoId: null,
    }],
  })),
}))
