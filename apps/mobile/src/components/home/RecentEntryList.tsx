import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useHomeStore } from '../../stores/useHomeStore'
import { formatRelTime } from '../../utils/formatDate'
import { CATEGORY_CONFIG } from './categoryConfig'

const MAX_VISIBLE = 20

/** 빠른 입력으로 저장한 최근 기록 — 실제 화면으로 안 간 항목엔 '준비 중' 표시 */
export default function RecentEntryList() {
  const entries = useHomeStore(s => s.entries)

  return (
    <View>
      {entries.slice(0, MAX_VISIBLE).map(entry => {
        const cfg = CATEGORY_CONFIG[entry.category]
        return (
          <View key={entry.id} className="flex-row items-center gap-3 border-b border-gray-100 py-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: cfg.bg }}>
              <Ionicons name={cfg.icon} size={16} color={cfg.fg} />
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-900" numberOfLines={1}>{entry.text}</Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                {formatRelTime(entry.createdAt)}{entry.linked ? '' : ' · 준비 중'}
              </Text>
            </View>
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: cfg.bg }}>
              <Text className="text-xs font-medium" style={{ color: cfg.fg }}>{cfg.label}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}
