import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MemoScreen from '../screens/MemoScreen'
import MemoDetailScreen from '../screens/MemoDetailScreen'

export type MemoStackParamList = {
  memoList: undefined
  /** memoId 없으면 새 메모 작성 */
  memoDetail: { memoId?: string }
}

const Stack = createNativeStackNavigator<MemoStackParamList>()

/** 메모 탭 — 목록에서 상세로 push. 헤더는 각 화면이 직접 그림 */
export default function MemoNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="memoList" component={MemoScreen} options={{ title: '메모' }} />
      <Stack.Screen name="memoDetail" component={MemoDetailScreen} options={{ title: '메모' }} />
    </Stack.Navigator>
  )
}
