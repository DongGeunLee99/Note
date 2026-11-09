import { Ionicons } from '@expo/vector-icons'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { getFocusedRouteNameFromRoute, type RouteProp, type ParamListBase } from '@react-navigation/native'
import HomeScreen from '../screens/HomeScreen'
import AlarmScreen from '../screens/AlarmScreen'
import CalendarScreen from '../screens/CalendarScreen'
import MemoNavigator from './MemoNavigator'
import MoreNavigator from './MoreNavigator'
import BottomTabBar from './BottomTabBar'

const Tab = createMaterialTopTabNavigator()

const tabIcon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color }: { color: string }) =>
    <Ionicons name={name} color={color} size={24} />

/**
 * 스택 탭은 첫 화면(목록/메뉴)에서만 좌우 스와이프로 탭 이동.
 * 안쪽 화면에선 꺼서 iOS 뒤로가기 스와이프·입력 중 가로 제스처와 겹치지 않게 함
 */
const swipeOnlyAtRoot = (rootName: string) =>
  ({ route }: { route: RouteProp<ParamListBase> }) => {
    const focused = getFocusedRouteNameFromRoute(route) ?? rootName
    return { swipeEnabled: focused === rootName }
  }

/** 하단 탭 — 좌우 스와이프로 탭 이동 (material-top-tabs를 하단 배치) */
export default function TabNavigator() {
  return (
    <Tab.Navigator tabBarPosition="bottom" tabBar={props => <BottomTabBar {...props} />}>
      <Tab.Screen name="home" component={HomeScreen} options={{ title: '홈', tabBarIcon: tabIcon('home-outline') }} />
      <Tab.Screen name="alarm" component={AlarmScreen} options={{ title: '알람', tabBarIcon: tabIcon('alarm-outline') }} />
      <Tab.Screen
        name="memo"
        component={MemoNavigator}
        options={args => ({ title: '메모', tabBarIcon: tabIcon('document-text-outline'), ...swipeOnlyAtRoot('memoList')(args) })}
      />
      <Tab.Screen name="calendar" component={CalendarScreen} options={{ title: '캘린더', tabBarIcon: tabIcon('calendar-outline') }} />
      <Tab.Screen
        name="more"
        component={MoreNavigator}
        options={args => ({ title: '더보기', tabBarIcon: tabIcon('ellipsis-horizontal'), ...swipeOnlyAtRoot('moreMenu')(args) })}
      />
    </Tab.Navigator>
  )
}
