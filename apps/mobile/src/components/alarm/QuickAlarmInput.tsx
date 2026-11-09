import { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AlarmGroup } from '@smartnote/shared/types'
import { parseKoreanTime, type ParsedKoreanTime } from '../../utils/koreanTimeParser'
import { displayGroupIcon, formatTime } from '../../utils/alarmFormat'

interface QuickAlarmInputProps {
  groups: AlarmGroup[]
  onAdd: (groupId: string, hour: number, minute: number, label: string) => void
}

/** 자연어 빠른 알람 — 입력 → 시각 미리보기 → 그룹 선택 후 추가 */
export default function QuickAlarmInput({ groups, onAdd }: QuickAlarmInputProps) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<ParsedKoreanTime | null>(null)
  const [error, setError] = useState(false)
  const [groupId, setGroupId] = useState(groups[0]?.groupId ?? '')

  function handleParse() {
    if (!text.trim()) return
    const result = parseKoreanTime(text)
    setParsed(result)
    setError(!result)
  }

  function reset() {
    setText('')
    setParsed(null)
    setError(false)
  }

  function handleConfirm() {
    if (!parsed) return
    onAdd(groupId || groups[0]?.groupId, parsed.hour, parsed.minute, parsed.label)
    reset()
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2 rounded-xl bg-gray-100 px-3 py-1">
        <Ionicons name="flash-outline" size={18} color="#6B7280" />
        <TextInput
          value={text}
          onChangeText={t => { setText(t); setParsed(null); setError(false) }}
          onSubmitEditing={handleParse}
          returnKeyType="done"
          placeholder="내일 오전 9시에 알려줘"
          className="flex-1 py-2.5 text-base text-gray-900"
        />
        {text.length > 0 && (
          <Pressable onPress={handleParse} className="rounded-lg bg-gray-900 px-3 py-1.5 active:opacity-80">
            <Text className="text-sm font-medium text-white">확인</Text>
          </Pressable>
        )}
      </View>

      {error && <Text className="px-1 text-sm text-red-500">시간을 찾지 못했어요. 예: "오후 3시 회의", "30분 뒤 약 먹기"</Text>}

      {parsed && (
        <View className="gap-3 rounded-xl border border-gray-200 bg-white p-3">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-2xl font-medium text-gray-900">{formatTime(parsed.hour, parsed.minute)}</Text>
            <Text className="flex-1 text-base text-gray-600" numberOfLines={1}>{parsed.label}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {groups.map(g => {
              const active = g.groupId === groupId
              return (
                <Pressable
                  key={g.groupId}
                  onPress={() => setGroupId(g.groupId)}
                  className={`rounded-full px-3 py-1 ${active ? 'bg-gray-900' : 'bg-gray-100'}`}
                >
                  <Text className={`text-sm ${active ? 'text-white' : 'text-gray-700'}`}>
                    {displayGroupIcon(g.icon)} {g.name}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <View className="flex-row gap-2">
            <Pressable onPress={reset} className="flex-1 items-center rounded-lg bg-gray-100 py-2.5 active:opacity-70">
              <Text className="font-medium text-gray-700">취소</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} className="flex-1 items-center rounded-lg bg-gray-900 py-2.5 active:opacity-80">
              <Text className="font-semibold text-white">알람 추가</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}
