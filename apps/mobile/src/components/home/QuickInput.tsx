import { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useHomeStore, type AddEntryResult } from '../../stores/useHomeStore'
import { CATEGORY_CONFIG, HOME_CATEGORIES, type HomeCategory } from './categoryConfig'

/** 저장 결과를 입력칸 아래 한 줄 안내로 */
function describeResult(result: AddEntryResult, wasAuto: boolean): { text: string; tone: 'ok' | 'info' | 'error' } {
  const label = CATEGORY_CONFIG[result.category].label
  const prefix = wasAuto ? `AI가 '${label}'(으)로 분류했어요. ` : ''
  if (result.status === 'created') return { text: `${prefix}${result.detail}에 추가했어요`, tone: 'ok' }
  if (result.status === 'noTime') return { text: `${prefix}시간을 찾지 못했어요. 예: "오후 3시 회의", "30분 뒤 약 먹기"`, tone: 'error' }
  return { text: `${prefix}최근 기록에 남겼어요 ('${label}' 화면은 준비 중)`, tone: 'info' }
}

const TONE_CLASS = { ok: 'text-emerald-600', info: 'text-gray-500', error: 'text-red-500' } as const

/** 홈 빠른 입력 — 분류 선택(기본 AI 자동) 후 저장 */
export default function QuickInput() {
  const addEntry = useHomeStore(s => s.addEntry)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<HomeCategory>('AI')
  const [notice, setNotice] = useState<ReturnType<typeof describeResult> | null>(null)

  function handleSave() {
    if (!text.trim()) return
    const result = addEntry(text.trim(), category)
    setNotice(describeResult(result, category === 'AI'))
    if (result.status !== 'noTime') setText('')
  }

  const canSave = text.trim().length > 0

  return (
    <View className="gap-2.5 rounded-2xl bg-gray-100 p-3">
      <View className="flex-row items-start gap-2">
        <Ionicons name="create-outline" size={18} color="#4B5563" style={{ marginTop: 2 }} />
        <TextInput
          value={text}
          onChangeText={t => { setText(t); setNotice(null) }}
          onSubmitEditing={handleSave}
          blurOnSubmit={false}
          returnKeyType="done"
          placeholder="생각나는 모든 것을 입력해 보세요…"
          multiline
          className="min-h-[44px] flex-1 text-base text-gray-900"
        />
      </View>

      <View className="flex-row items-center gap-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5" className="flex-1">
          {HOME_CATEGORIES.map(cat => {
            const active = cat === category
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 ${active ? 'bg-gray-900' : 'bg-white'}`}
              >
                <Text className={`text-sm ${active ? 'font-medium text-white' : 'text-gray-600'}`}>{CATEGORY_CONFIG[cat].label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          className={`rounded-lg bg-gray-900 px-3.5 py-2 active:opacity-80 ${canSave ? '' : 'opacity-30'}`}
        >
          <Text className="text-sm font-semibold text-white">저장</Text>
        </Pressable>
      </View>

      {notice && <Text className={`px-1 text-sm ${TONE_CLASS[notice.tone]}`}>{notice.text}</Text>}
    </View>
  )
}
