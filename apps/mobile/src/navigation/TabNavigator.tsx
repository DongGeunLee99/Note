import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import AlarmScreen from '../screens/AlarmScreen'
import MemoScreen from '../screens/MemoScreen'
import CalendarScreen from '../screens/CalendarScreen'

const Tab = createBottomTabNavigator()

/** 탭 아이콘(이모지 임시) — 이후 아이콘 세트로 교체 */
const tabIcon = (emoji: string) =>
  ({ color }: { color: string }) =>
    <Text style={{ color, fontSize: 18 }}>{emoji}</Text>

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ tabBarActiveTintColor: '#111827', tabBarInactiveTintColor: '#9CA3AF' }}
    >
      <Tab.Screen name="home" component={HomeScreen} options={{ title: '홈', tabBarIcon: tabIcon('🏠') }} />
      <Tab.Screen name="alarm" component={AlarmScreen} options={{ title: '알람', tabBarIcon: tabIcon('⏰') }} />
      <Tab.Screen name="memo" component={MemoScreen} options={{ title: '메모', tabBarIcon: tabIcon('📝') }} />
      <Tab.Screen name="calendar" component={CalendarScreen} options={{ title: '캘린더', tabBarIcon: tabIcon('📅') }} />
    </Tab.Navigator>
  )
}
