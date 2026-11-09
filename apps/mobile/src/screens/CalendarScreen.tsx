import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CalendarHeader, { type CalendarViewMode } from '../components/calendar/CalendarHeader'
import MonthView from '../components/calendar/MonthView'
import EventItem from '../components/calendar/EventItem'
import { DUMMY_EVENTS, eventsOnDay } from '../dummy/calendarDummy'
import { addMonths, formatDayTitle, formatMonthTitle, isSameMonth, startOfDay } from '../utils/calendarDate'
import { showMessage } from '../utils/confirm'

const NEXT_STEP_LABEL: Record<Exclude<CalendarViewMode, 'month'>, string> = {
  week: '주 보기 (주 띠 + 하루 타임라인)',
  list: '목록 보기 (앞으로의 일정 날짜별 나열)',
}

/** 캘린더 — UI 단계(C-1): 상단 틀 + 월 보기 + 선택한 날 일정 목록. 데이터는 더미, 로직 없음 */
export default function CalendarScreen() {
  const [view, setView] = useState<CalendarViewMode>('month')
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selected, setSelected] = useState(() => startOfDay(new Date()))

  const dayEvents = eventsOnDay(DUMMY_EVENTS, selected)

  function moveMonth(delta: number) {
    const next = addMonths(month, delta)
    setMonth(next)
    setSelected(next)
  }

  function goToday() {
    const today = startOfDay(new Date())
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(today)
  }

  function selectDay(day: Date) {
    setSelected(day)
    // 앞뒤 달의 흐린 날짜를 누르면 그 달로 이동
    if (!isSameMonth(day, month)) setMonth(new Date(day.getFullYear(), day.getMonth(), 1))
  }

  const notYet = () => showMessage('다음 단계에서 만들어요', '일정 추가/상세 화면은 이후 단계에서 상의하면서 만들게요.')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <CalendarHeader
        title={formatMonthTitle(month)}
        view={view}
        onPrev={() => moveMonth(-1)}
        onNext={() => moveMonth(1)}
        onTitlePress={goToday}
        onViewChange={setView}
        onAdd={notYet}
      />

      {view === 'month' ? (
        <>
          <MonthView month={month} selected={selected} events={DUMMY_EVENTS} onSelect={selectDay} />
          <View className="flex-1 border-t border-gray-100 bg-gray-50">
            <Text className="px-4 pb-2 pt-3 text-sm font-semibold text-gray-700">
              {formatDayTitle(selected)}
              {dayEvents.length > 0 && <Text className="font-normal text-gray-400"> · 일정 {dayEvents.length}개</Text>}
            </Text>
            <ScrollView contentContainerClassName="gap-2 px-4 pb-6">
              {dayEvents.length === 0
                ? <Text className="py-8 text-center text-gray-400">일정이 없어요</Text>
                : dayEvents.map(e => <EventItem key={e.id} event={e} onPress={notYet} />)}
            </ScrollView>
          </View>
        </>
      ) : (
        <View className="flex-1 items-center justify-center bg-gray-50 px-8">
          <Text className="text-base font-semibold text-gray-700">{NEXT_STEP_LABEL[view]}</Text>
          <Text className="mt-1 text-center text-sm text-gray-400">다음 단계에서 상의하면서 만들어요</Text>
        </View>
      )}
    </SafeAreaView>
  )
}
