import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MemoView } from '@smartnote/shared/stores/useMemoStore'
import { formatRelTime, formatSuggestionTime } from '../../utils/formatDate'

interface MemoCardProps {
  memo: MemoView
  onPress: () => void
  onLongPress: () => void
  onAlarmConfirm: () => void
  onAlarmDismiss: () => void
}

/** 메모 목록 카드 — 알람 제안 배너는 Pressable 밖 형제로 둬서 버튼 탭이 카드 열기로 번지지 않게 함 */
export default function MemoCard({ memo, onPress, onLongPress, onAlarmConfirm, onAlarmDismiss }: MemoCardProps) {
  const title = memo.title || memo.body.split('\n')[0].slice(0, 30)

  return (
    <View className="rounded-xl border border-gray-200 bg-white">
      <Pressable onPress={onPress} onLongPress={onLongPress} className="p-3.5 active:bg-gray-50">
        <View className="flex-row items-center gap-1.5">
          {memo.pinnedAt && <Ionicons name="pin" size={14} color="#111827" />}
          <Text className="flex-1 text-base font-semibold text-gray-900" numberOfLines={1}>{title}</Text>
          <Text className="text-xs text-gray-400">{formatRelTime(memo.createdAt.toDate())}</Text>
        </View>
        <Text className="mt-1 text-sm leading-5 text-gray-500" numberOfLines={2}>{memo.body}</Text>
        {(memo.location.label || memo.aiLoading) && (
          <View className="mt-2 flex-row items-center gap-3">
            {memo.location.label && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs text-gray-400">{memo.location.label}</Text>
              </View>
            )}
            {memo.aiLoading && (
              <View className="flex-row items-center gap-1">
                <ActivityIndicator size="small" />
                <Text className="text-xs text-gray-500">AI 정리 중…</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>

      {memo.alarmSuggestion && !memo.alarmConfirmed && (
        <View className="mx-3 mb-3 flex-row items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
          <Ionicons name="notifications-outline" size={14} color="#B45309" />
          <Text className="flex-1 text-sm text-amber-800" numberOfLines={1}>
            {formatSuggestionTime(memo.alarmSuggestion.datetime)}에 알람 추가할까요?
          </Text>
          <Pressable onPress={onAlarmConfirm} className="rounded-full bg-gray-900 px-2.5 py-1 active:opacity-80">
            <Text className="text-xs font-medium text-white">추가</Text>
          </Pressable>
          <Pressable onPress={onAlarmDismiss} className="px-1 py-1">
            <Text className="text-xs text-amber-800">취소</Text>
          </Pressable>
        </View>
      )}
      {memo.alarmSuggestion && memo.alarmConfirmed && (
        <Text className="mx-3.5 mb-3 text-xs text-gray-400">알람에 추가됨 (기타 그룹)</Text>
      )}
    </View>
  )
}
