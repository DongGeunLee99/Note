import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type MemoViewMode = 'original' | 'ai'

interface AiToggleButtonProps {
  mode: MemoViewMode
  aiProcessed: boolean
  loading: boolean
  onModeChange: (mode: MemoViewMode) => void
  /** AI 분석 실행 (최초 분석 / 재분석) */
  onTrigger: () => void
}

/**
 * 원문/AI 탭 + 분석 트리거 통합 (웹 AiToggleButton과 동일 동작)
 * - AI 탭이 아닐 때 탭 → AI로 전환 + 미분석이면 즉시 분석
 * - 이미 AI 탭일 때 탭 → 재분석
 */
export default function AiToggleButton({ mode, aiProcessed, loading, onModeChange, onTrigger }: AiToggleButtonProps) {
  function handleAiPress() {
    if (loading) return
    if (mode !== 'ai') {
      onModeChange('ai')
      if (!aiProcessed) onTrigger()
      return
    }
    onTrigger()
  }

  const aiLabel = mode === 'ai' && aiProcessed ? '다시 분석하기' : 'AI 정리'

  return (
    <View className="flex-row rounded-lg bg-gray-100 p-0.5">
      <Pressable
        onPress={() => onModeChange('original')}
        className={`rounded-md px-3 py-1.5 ${mode === 'original' ? 'bg-white' : ''}`}
      >
        <Text className={`text-sm ${mode === 'original' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>원문</Text>
      </Pressable>
      <Pressable
        onPress={handleAiPress}
        className={`flex-row items-center gap-1 rounded-md px-3 py-1.5 ${mode === 'ai' ? 'bg-white' : ''}`}
      >
        {loading
          ? <ActivityIndicator size="small" />
          : <Ionicons name="sparkles-outline" size={13} color={mode === 'ai' ? '#111827' : '#6B7280'} />}
        <Text className={`text-sm ${mode === 'ai' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{aiLabel}</Text>
      </Pressable>
    </View>
  )
}
