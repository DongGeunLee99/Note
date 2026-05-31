import AlarmGroupCard from './AlarmGroupCard'
import AlarmCard from './AlarmCard'
import type { LocalAlarmGroup, LocalAlarm } from '../../types/localAlarm'

interface AlarmGroupListProps {
  groups: LocalAlarmGroup[]
  alarms: LocalAlarm[]
  onToggleGroup: (groupId: string) => void
  onEditGroup: (groupId: string) => void
  onAddAlarm: (groupId: string) => void
  onToggleAlarm: (alarmId: string) => void
  onEditAlarm: (alarmId: string) => void
}

export default function AlarmGroupList({
  groups,
  alarms,
  onToggleGroup,
  onEditGroup,
  onAddAlarm,
  onToggleAlarm,
  onEditAlarm,
}: AlarmGroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
        <span className="text-3xl">🔔</span>
        <p className="text-[12px] font-medium">알람 그룹이 없습니다</p>
        <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          위의 그룹 추가 버튼으로 시작해보세요
        </p>
      </div>
    )
  }

  const defaultGroup = groups.find(g => g.isDefault)
  const customGroups = groups.filter(g => !g.isDefault)
  const sortedGroups = [...customGroups, ...(defaultGroup ? [defaultGroup] : [])]

  return (
    <div className="flex flex-col gap-3">
      {sortedGroups.map(group => {
        const groupAlarms = alarms.filter(a => a.groupId === group.groupId)
        return (
          <div key={group.groupId}>
            <AlarmGroupCard
              group={group}
              alarmCount={groupAlarms.length}
              onToggle={() => onToggleGroup(group.groupId)}
              onEdit={() => onEditGroup(group.groupId)}
            />

            <div className="mt-0.5">
              {groupAlarms.map(alarm => (
                <AlarmCard
                  key={alarm.alarmId}
                  alarm={alarm}
                  groupEnabled={group.isEnabled}
                  onToggle={() => onToggleAlarm(alarm.alarmId)}
                  onEdit={() => onEditAlarm(alarm.alarmId)}
                />
              ))}
              <button
                onClick={() => onAddAlarm(group.groupId)}
                className="pl-8 pr-2 py-1 text-[10px] hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                + 알람 추가
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
