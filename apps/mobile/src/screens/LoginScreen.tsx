import { Text, View, Pressable } from 'react-native'

interface LoginScreenProps {
  onLogin: () => void
}

/** 로그인 화면. 현재는 셸 확인용 스텁 — Step 2b에서 카카오 OAuth(expo-auth-session)로 연결 */
export default function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <View className="flex-1 items-center justify-center gap-8 bg-white">
      <View className="items-center">
        <Text className="text-3xl font-bold text-gray-900">SmartNote</Text>
        <Text className="mt-2 text-gray-500">알람·메모·캘린더를 하나로</Text>
      </View>
      <Pressable
        onPress={onLogin}
        className="rounded-xl bg-[#FEE500] px-6 py-3 active:opacity-80"
      >
        <Text className="font-medium text-gray-900">카카오로 시작하기</Text>
      </Pressable>
    </View>
  )
}
