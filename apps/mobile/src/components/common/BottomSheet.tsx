import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** 하단 고정 버튼 영역 (저장/삭제 등) */
  footer?: ReactNode
}

/** 아래에서 올라오는 시트. 배경 탭 시 닫힘 */
export default function BottomSheet({ visible, onClose, title, children, footer }: BottomSheetProps) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="max-h-[85%] rounded-t-2xl bg-white" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="items-center pt-2">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </View>
          <Text className="px-5 pb-2 pt-3 text-lg font-semibold text-gray-900">{title}</Text>
          <ScrollView className="px-5" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer && <View className="flex-row gap-2 px-5 pt-3">{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
