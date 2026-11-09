import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MoreScreen from '../screens/MoreScreen'
import LaterScreen from '../screens/LaterScreen'
import SomedayScreen from '../screens/SomedayScreen'
import DashboardScreen from '../screens/DashboardScreen'
import TrashScreen from '../screens/TrashScreen'
import SettingsScreen from '../screens/SettingsScreen'

export type MoreStackParamList = {
  moreMenu: undefined
  later: undefined
  someday: undefined
  dashboard: undefined
  trash: undefined
  settings: undefined
}

const Stack = createNativeStackNavigator<MoreStackParamList>()

/** 더보기 탭 — 메뉴 목록에서 각 화면으로 push (뒤로가기 지원) */
export default function MoreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: '더보기' }}>
      <Stack.Screen name="moreMenu" component={MoreScreen} options={{ title: '더보기', headerShown: false }} />
      <Stack.Screen name="later" component={LaterScreen} options={{ title: '나중에' }} />
      <Stack.Screen name="someday" component={SomedayScreen} options={{ title: '언젠가' }} />
      <Stack.Screen name="dashboard" component={DashboardScreen} options={{ title: '대시보드' }} />
      <Stack.Screen name="trash" component={TrashScreen} options={{ title: '휴지통' }} />
      <Stack.Screen name="settings" component={SettingsScreen} options={{ title: '설정' }} />
    </Stack.Navigator>
  )
}
