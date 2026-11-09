import { Fragment, useMemo } from 'react'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAlarmStore } from '../../stores/useAlarmStore'
import { DUMMY_EVENTS, eventsOnDay } from '../../dummy/calendarDummy'
import { formatHm } from '../../utils/calendarDate'

interface TimelineEntry {
  id: string
  /** 하루종일 일정은 -1 → 맨 위 */
  minutes: number
  timeLabel: string
  title: string
  kind: 'alarm' | 'event'
  sub: string | null
  color: string
}

const ALARM_COLOR = '#2563EB'

function NowLine({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-2.5 py-1.5">
      <Text className="w-12 text-right text-xs font-semibold text-red-500">{label}</Text>
      <View className="h-2 w-2 rounded-full bg-red-500" />
      <View className="h-px flex-1 bg-red-500" />
      <Text className="text-xs font-semibold text-red-500">지금</Text>
    </View>
  )
}

/**
 * 오늘 타임라인 — 오늘 울릴 알람(알람 탭 데이터) + 오늘 일정(캘린더 더미).
 * 알람은 켜져 있고 그룹도 켜진 것 중 한 번 울림이거나 오늘 요일 반복인 것만. 지난 항목은 흐리게
 */
export default function TodayTimeline() {
  const alarms = useAlarmStore(s => s.alarms)
  const groups = useAlarmStore(s => s.groups)
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todayDow = now.getDay()

  const items = useMemo(() => {
    const groupById = new Map(groups.map(g => [g.groupId, g]))
    const alarmEntries: TimelineEntry[] = alarms
      .filter(a => {
        const group = groupById.get(a.groupId)
        const ringsToday = a.repeatDays.length === 0 || a.repeatDays.includes(todayDow)
        return a.isEnabled && group?.isEnabled && ringsToday
      })
      .map(a => ({
        id: `alarm-${a.alarmId}`,
        minutes: a.hour * 60 + a.minute,
        timeLabel: `${String(a.hour).padStart(2, '0')}:${String(a.minute).padStart(2, '0')}`,
        title: a.label,
        kind: 'alarm',
        sub: groupById.get(a.groupId)?.name ?? null,
        color: ALARM_COLOR,
      }))

    const eventEntries: TimelineEntry[] = eventsOnDay(DUMMY_EVENTS, now).map(e => ({
      id: `event-${e.id}`,
      minutes: e.allDay ? -1 : e.start.getHours() * 60 + e.start.getMinutes(),
      timeLabel: e.allDay ? '종일' : formatHm(e.start),
      title: e.title,
      kind: 'event',
      sub: e.location,
      color: e.color,
    }))

    return [...alarmEntries, ...eventEntries].sort((a, b) => a.minutes - b.minutes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarms, groups, todayDow])

  if (items.length === 0) {
    return <Text className="py-2 text-sm text-gray-400">오늘 예정된 알람·일정이 없어요</Text>
  }

  const nowIndex = items.findIndex(i => i.minutes >= nowMin)
  const nowLabel = formatHm(now)

  return (
    <View>
      {items.map((item, i) => {
        const isPast = item.minutes >= 0 && item.minutes < nowMin
        return (
          <Fragment key={item.id}>
            {i === nowIndex && <NowLine label={nowLabel} />}
            <View className={`flex-row gap-2.5 ${isPast ? 'opacity-40' : ''}`}>
              <Text className="w-12 pt-0.5 text-right text-sm text-gray-500" style={{ fontVariant: ['tabular-nums'] }}>{item.timeLabel}</Text>
              <View className="items-center">
                <View className="mt-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {i < items.length - 1 && <View className="mt-0.5 w-px flex-1 bg-gray-200" />}
              </View>
              <View className="flex-1 flex-row items-center gap-1.5 pb-3.5">
                <Ionicons name={item.kind === 'alarm' ? 'alarm-outline' : 'calendar-outline'} size={14} color={item.color} />
                <Text className="flex-shrink text-base font-medium text-gray-900" numberOfLines={1}>{item.title}</Text>
                {item.sub && <Text className="text-xs text-gray-400" numberOfLines={1}>· {item.sub}</Text>}
              </View>
            </View>
          </Fragment>
        )
      })}
      {nowIndex === -1 && <NowLine label={nowLabel} />}
    </View>
  )
}
