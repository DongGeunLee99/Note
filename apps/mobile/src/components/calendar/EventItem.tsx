import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatHm } from '../../utils/calendarDate'
import { isMultiDay, type CalendarItem } from '../../dummy/calendarDummy'

interface EventItemProps {
  event: CalendarItem
  onPress: () => void
}

function formatReminder(minutes: number): string {
  if (minutes >= 1440) return `${minutes / 1440}일 전`
  if (minutes >= 60) return `${minutes / 60}시간 전`
  return `${minutes}분 전`
}

function formatTimeLabel(e: CalendarItem): string {
  if (e.allDay) return isMultiDay(e) ? '하루종일 (여러 날)' : '하루종일'
  return `${formatHm(e.start)} – ${formatHm(e.end)}`
}

/** 일정 한 줄 — 색 막대 · 시간 · 제목 · 위치 · 미리 알림 (월/주/목록 보기 공통) */
export default function EventItem({ event, onPress }: EventItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-stretch gap-3 rounded-xl bg-white px-3 py-2.5 active:bg-gray-50">
      <View className="w-1 rounded-full" style={{ backgroundColor: event.color }} />
      <View className="flex-1">
        <Text className="text-xs text-gray-500">{formatTimeLabel(event)}</Text>
        <Text className="mt-0.5 text-base font-medium text-gray-900" numberOfLines={1}>{event.title}</Text>
        {event.location && (
          <View className="mt-0.5 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-400" numberOfLines={1}>{event.location}</Text>
          </View>
        )}
      </View>
      {event.reminderMinutes !== null && (
        <View className="flex-row items-center gap-0.5 self-center">
          <Ionicons name="notifications-outline" size={13} color="#9CA3AF" />
          <Text className="text-xs text-gray-400">{formatReminder(event.reminderMinutes)}</Text>
        </View>
      )}
    </Pressable>
  )
}
