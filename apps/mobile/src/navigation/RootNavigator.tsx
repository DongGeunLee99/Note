import { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/LoginScreen'
import TabNavigator from './TabNavigator'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  // TODO(Step 2b): shared useAuth(firebase onAuthStateChanged)로 교체.
  // 지금은 셸 흐름 확인용 로컬 상태 스텁 — "카카오로 시작하기" 탭하면 탭 화면 진입
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {loggedIn ? (
        <Stack.Screen name="tabs" component={TabNavigator} />
      ) : (
        <Stack.Screen name="login">
          {() => <LoginScreen onLogin={() => setLoggedIn(true)} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  )
}
