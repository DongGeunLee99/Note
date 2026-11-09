import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { MoreStackParamList } from '../navigation/MoreNavigator'

type MoreScreenProps = NativeStackScreenProps<MoreStackParamList, 'moreMenu'>

const MENU_ITEMS: { route: Exclude<keyof MoreStackParamList, 'moreMenu'>; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { route: 'later', label: '나중에', icon: 'time-outline' },
  { route: 'someday', label: '언젠가', icon: 'star-outline' },
  { route: 'dashboard', label: '대시보드', icon: 'stats-chart-outline' },
  { route: 'trash', label: '휴지통', icon: 'trash-outline' },
  { route: 'settings', label: '설정', icon: 'settings-outline' },
]

/** 더보기 메뉴 목록 */
export default function MoreScreen({ navigation }: MoreScreenProps) {
  return (
    // 헤더가 없으므로 상단 노치/상태바 영역만큼 띄움
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 pt-4">
      <View className="mx-4 overflow-hidden rounded-xl bg-white">
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            className={`flex-row items-center px-4 py-4 active:bg-gray-100 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <Ionicons name={item.icon} size={20} color="#374151" />
            <Text className="ml-3 flex-1 text-base text-gray-900">{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  )
}
