import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type CalendarViewMode = 'month' | 'week' | 'list'

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'month', label: '월' },
  { value: 'week', label: '주' },
  { value: 'list', label: '목록' },
]

interface CalendarHeaderProps {
  title: string
  view: CalendarViewMode
  onPrev: () => void
  onNext: () => void
  /** 제목 탭 → 오늘로 */
  onTitlePress: () => void
  onViewChange: (view: CalendarViewMode) => void
  onAdd: () => void
}

/** ‹ 2026년 11월 › + 월/주/목록 전환 + 일정 추가 */
export default function CalendarHeader({ title, view, onPrev, onNext, onTitlePress, onViewChange, onAdd }: CalendarHeaderProps) {
  return (
    <View className="flex-row items-center px-2 pb-2 pt-3">
      <Pressable onPress={onPrev} className="p-2" accessibilityLabel="이전">
        <Ionicons name="chevron-back" size={20} color="#374151" />
      </Pressable>
      <Pressable onPress={onTitlePress} accessibilityLabel="오늘로 이동">
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
      </Pressable>
      <Pressable onPress={onNext} className="p-2" accessibilityLabel="다음">
        <Ionicons name="chevron-forward" size={20} color="#374151" />
      </Pressable>

      <View className="flex-1" />

      <View className="flex-row rounded-lg bg-gray-100 p-0.5">
        {VIEW_OPTIONS.map(opt => {
          const active = opt.value === view
          return (
            <Pressable
              key={opt.value}
              onPress={() => onViewChange(opt.value)}
              className={`rounded-md px-2.5 py-1 ${active ? 'bg-white' : ''}`}
            >
              <Text className={`text-sm ${active ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{opt.label}</Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable onPress={onAdd} className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-gray-900 active:opacity-80" accessibilityLabel="일정 추가">
        <Ionicons name="add" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  )
}
