import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QuickInput from '../components/home/QuickInput'
import TodayTimeline from '../components/home/TodayTimeline'
import RecentEntryList from '../components/home/RecentEntryList'
import { useHomeStore } from '../stores/useHomeStore'
import { formatDayTitle } from '../utils/calendarDate'

/** 홈 — 빠른 입력 / 오늘 타임라인 / 최근 기록 (더미 스토어) */
export default function HomeScreen() {
  const entryCount = useHomeStore(s => s.entries.length)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-5 px-4 pb-10 pt-3" keyboardShouldPersistTaps="handled">
        <View>
          <Text className="text-sm text-gray-500">{formatDayTitle(new Date())}</Text>
          <Text className="text-2xl font-bold text-gray-900">홈</Text>
        </View>

        <QuickInput />

        <View className="gap-2">
          <Text className="text-sm font-semibold text-gray-500">오늘</Text>
          <TodayTimeline />
        </View>

        <View className="gap-1">
          <Text className="text-sm font-semibold text-gray-500">최근 기록 · {entryCount}</Text>
          <RecentEntryList />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
