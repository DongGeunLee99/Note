import type { AlarmGroup, Alarm } from '@smartnote/shared/types'
import type { LocalAlarmGroup, LocalAlarm } from '@/types/localAlarm'

// 시드(kakaoLogin)로 만들어진 "기타" 그룹은 icon이 'default' → 표시용 기본 이모지로 폴백
const DEFAULT_EMOJI = '⭐'

export function toLocalGroup(g: AlarmGroup): LocalAlarmGroup {
  return {
    groupId: g.groupId,
    name: g.name,
    color: g.color,
    emoji: g.icon === 'default' ? DEFAULT_EMOJI : g.icon,
    isEnabled: g.isEnabled,
    isDefault: g.isDefault,
  }
}

export function toLocalAlarm(a: Alarm): LocalAlarm {
  return {
    alarmId: a.alarmId,
    groupId: a.groupId,
    label: a.label,
    hour: a.hour,
    minute: a.minute,
    repeatDays: a.repeatDays,
    isEnabled: a.isEnabled,
    sourceMemoId: a.sourceMemoId,
  }
}

/** 비기본 그룹 먼저(order 오름차순), 기본('기타') 그룹은 항상 마지막 */
export function sortGroups(groups: AlarmGroup[]): AlarmGroup[] {
  return [...groups].sort((a, b) =>
    a.isDefault !== b.isDefault ? (a.isDefault ? 1 : -1) : a.order - b.order,
  )
}
