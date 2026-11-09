import TabNavigator from './TabNavigator'

export default function RootNavigator() {
  // 더미데이터 단계: 로그인 없이 바로 탭으로 진입.
  // TODO(카카오 로그인): shared useAuth로 인증 스택 복원 — LoginScreen.tsx는 그때 재사용
  return <TabNavigator />
}
