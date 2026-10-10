import { Text, View } from 'react-native'

/** 캘린더 화면 (플레이스홀더) — 이후 react-native-calendars 연동 */
export default function CalendarScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold text-gray-900">캘린더</Text>
      <Text className="mt-1 text-gray-400">Step 2 셸 · 곧 실제 기능 연동</Text>
    </View>
  )
}
