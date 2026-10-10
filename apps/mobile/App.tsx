import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import type { AlarmGroup } from '@smartnote/shared/types'
import './global.css'

// 모노레포 공유 타입 해석 확인용(런타임 미사용) — Step 2에서 실제 스토어/서비스 런타임 연동
const _sharedTypeCheck: AlarmGroup['name'] | undefined = undefined

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-3xl font-bold text-gray-900">SmartNote</Text>
        <Text className="mt-2 text-base text-gray-500">모바일 셸 · Step 1</Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
