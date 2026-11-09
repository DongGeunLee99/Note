import { Pressable, Text, View } from 'react-native'
import { WEEKDAY_LABELS, getMonthGrid, isSameDay, isSameMonth } from '../../utils/calendarDate'
import { eventsOnDay, type CalendarItem } from '../../dummy/calendarDummy'

interface MonthViewProps {
  month: Date
  selected: Date
  events: CalendarItem[]
  onSelect: (day: Date) => void
}

const MAX_DOTS = 3

function weekdayColor(dayIndex: number, dimmed: boolean): string {
  if (dimmed) return 'text-gray-300'
  if (dayIndex === 0) return 'text-red-500'
  if (dayIndex === 6) return 'text-blue-500'
  return 'text-gray-900'
}

/** 42일을 7일씩 6주로 */
function toWeeks(days: Date[]): Date[][] {
  return Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7))
}

/**
 * 월 달력 그리드 — 오늘: 테두리, 선택: 채운 원, 일정: 색 점(최대 3개)
 * 칸 폭은 % 대신 주(行)마다 flex-1 — 웹 탭 페이저 안에서 % 폭이 넘쳐 페이저가 밀리는 문제 방지
 */
export default function MonthView({ month, selected, events, onSelect }: MonthViewProps) {
  const today = new Date()
  const weeks = toWeeks(getMonthGrid(month))

  return (
    <View className="px-2">
      <View className="flex-row">
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={label} className={`flex-1 py-1 text-center text-xs ${weekdayColor(i, false)}`}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map(week => (
        <View key={week[0].toISOString()} className="flex-row">
          {week.map(day => {
            const inMonth = isSameMonth(day, month)
            const isSelected = isSameDay(day, selected)
            const isToday = isSameDay(day, today)
            const dayEvents = eventsOnDay(events, day)

            return (
              <Pressable key={day.toISOString()} onPress={() => onSelect(day)} className="flex-1 items-center pb-1.5 pt-1">
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    isSelected ? 'bg-gray-900' : isToday ? 'border border-gray-900' : ''
                  }`}
                >
                  <Text className={`text-sm ${isSelected ? 'font-semibold text-white' : weekdayColor(day.getDay(), !inMonth)}`}>
                    {day.getDate()}
                  </Text>
                </View>
                <View className="mt-0.5 h-1.5 flex-row gap-0.5">
                  {dayEvents.slice(0, MAX_DOTS).map(e => (
                    <View
                      key={e.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: e.color, opacity: inMonth ? 1 : 0.35 }}
                    />
                  ))}
                </View>
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}
