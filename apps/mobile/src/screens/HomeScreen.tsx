import { Text, View } from 'react-native'

/** 홈 화면 (플레이스홀더) — 이후 자연어 입력/오늘 일정 연동 */
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold text-gray-900">홈</Text>
      <Text className="mt-1 text-gray-400">Step 2 셸 · 곧 실제 기능 연동</Text>
    </View>
  )
}
