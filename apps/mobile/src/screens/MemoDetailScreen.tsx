import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { MemoLocation } from '@smartnote/shared/types'
import type { MemoStackParamList } from '../navigation/MemoNavigator'
import { useMemoStore } from '../stores/useMemoStore'
import AiToggleButton, { type MemoViewMode } from '../components/memo/AiToggleButton'
import { formatFullDate } from '../utils/formatDate'
import { getCurrentMemoLocation } from '../utils/memoLocation'

type MemoDetailScreenProps = NativeStackScreenProps<MemoStackParamList, 'memoDetail'>

const EMPTY_LOCATION: MemoLocation = { lat: null, lng: null, label: null }

/**
 * 메모 작성/수정 — 입력칸 blur 또는 화면 이탈 시 자동저장.
 * 새 메모는 본문이 생기는 첫 저장 때 생성되고 이후엔 수정으로 전환
 */
export default function MemoDetailScreen({ navigation, route }: MemoDetailScreenProps) {
  const memoId = route.params.memoId
  const memo = useMemoStore(s => (memoId ? s.memos.find(m => m.memoId === memoId) : undefined))
  const { saveMemo, updateAiSummary, runAi, undoMemo, redoMemo } = useMemoStore.getState()
  const creating = !memoId

  const [titleDraft, setTitleDraft] = useState(memo?.title ?? '')
  const [bodyDraft, setBodyDraft] = useState(memo?.body ?? '')
  const [locationDraft, setLocationDraft] = useState<MemoLocation>(memo?.location ?? EMPTY_LOCATION)
  const [locationLoading, setLocationLoading] = useState(false)
  const [mode, setMode] = useState<MemoViewMode>('original')
  const [aiDraft, setAiDraft] = useState(memo?.aiSummary ?? '')

  // 되돌리기/다시하기로 내용이 바뀌면 드래프트 동기화
  useEffect(() => {
    if (!memo) return
    setTitleDraft(memo.title)
    setBodyDraft(memo.body)
    setLocationDraft(memo.location)
  }, [memo?.title, memo?.body, memo?.location])

  useEffect(() => {
    setAiDraft(memo?.aiSummary ?? '')
  }, [memo?.aiSummary, mode])

  // 새 메모이거나 위치 없는 메모면 현재 위치 자동 조회 (실패 시 직접 입력)
  useEffect(() => {
    if (!creating && memo?.location.label) return
    let cancelled = false
    setLocationLoading(true)
    getCurrentMemoLocation().then(loc => {
      if (cancelled) return
      if (loc) setLocationDraft(loc)
      setLocationLoading(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persist() {
    if (!bodyDraft.trim()) return
    if (creating) {
      const newId = saveMemo(titleDraft.trim(), bodyDraft.trim(), locationDraft)
      if (newId) navigation.setParams({ memoId: newId })
      return
    }
    if (!memo) return
    const changed =
      titleDraft !== memo.title ||
      bodyDraft !== memo.body ||
      locationDraft.label !== memo.location.label ||
      locationDraft.lat !== memo.location.lat ||
      locationDraft.lng !== memo.location.lng
    if (changed) saveMemo(titleDraft.trim(), bodyDraft.trim(), locationDraft, memo.memoId)
  }

  function persistAi() {
    if (!memo || aiDraft === (memo.aiSummary ?? '')) return
    updateAiSummary(memo.memoId, aiDraft)
  }

  // 입력 중 뒤로가기하면 blur가 안 올 수 있음 → 화면 이탈 직전 마지막 상태로 저장
  const persistOnLeave = useRef(() => {})
  persistOnLeave.current = () => { persist(); persistAi() }
  useEffect(() => navigation.addListener('beforeRemove', () => persistOnLeave.current()), [navigation])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center px-2 py-1">
          <Pressable onPress={() => navigation.goBack()} className="p-2" accessibilityLabel="뒤로">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1" />
          {memo && (
            <>
              <Pressable onPress={() => undoMemo(memo.memoId)} disabled={!memo.history} className={`p-2 ${memo.history ? '' : 'opacity-30'}`} accessibilityLabel="되돌리기">
                <Ionicons name="arrow-undo-outline" size={20} color="#374151" />
              </Pressable>
              <Pressable onPress={() => redoMemo(memo.memoId)} disabled={!memo.future} className={`p-2 ${memo.future ? '' : 'opacity-30'}`} accessibilityLabel="다시하기">
                <Ionicons name="arrow-redo-outline" size={20} color="#374151" />
              </Pressable>
            </>
          )}
        </View>

        <View className="flex-1 px-4 pb-4">
          <TextInput
            value={titleDraft}
            onChangeText={setTitleDraft}
            onBlur={persist}
            placeholder="제목"
            className="py-2 text-xl font-bold text-gray-900"
          />

          <View className="mb-3 mt-1 flex-row items-end gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <View className="flex-1 gap-1.5">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <TextInput
                  value={locationDraft.label ?? ''}
                  onChangeText={label => setLocationDraft(loc => ({ ...loc, label }))}
                  onBlur={persist}
                  placeholder={locationLoading ? '위치 확인 중…' : '위치 직접 입력'}
                  className="flex-1 py-0 text-sm text-gray-700"
                />
                {locationLoading && <ActivityIndicator size="small" />}
              </View>
              {memo && (
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                  <Text className="text-sm text-gray-500">{formatFullDate(memo.createdAt.toDate())}</Text>
                </View>
              )}
            </View>
            {memo && (
              <AiToggleButton
                mode={mode}
                aiProcessed={memo.aiProcessed}
                loading={memo.aiLoading}
                onModeChange={setMode}
                onTrigger={() => void runAi(memo.memoId, memo.body)}
              />
            )}
          </View>

          {memo && mode === 'ai' ? (
            memo.aiProcessed && !memo.aiLoading ? (
              <View className="flex-1">
                <TextInput
                  value={aiDraft}
                  onChangeText={setAiDraft}
                  onBlur={persistAi}
                  multiline
                  textAlignVertical="top"
                  className="flex-1 rounded-xl border border-gray-200 p-3 text-base leading-6 text-gray-900"
                />
                {memo.body !== memo.aiSummaryBody && (
                  <Text className="mt-1.5 text-xs text-gray-400">본문이 바뀌었어요. AI 정리는 이전 본문 기준이에요 — 다시 분석하기로 갱신</Text>
                )}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
              </View>
            )
          ) : (
            <TextInput
              value={bodyDraft}
              onChangeText={setBodyDraft}
              onBlur={persist}
              placeholder="내용을 입력하세요"
              autoFocus={creating}
              multiline
              textAlignVertical="top"
              className="flex-1 rounded-xl border border-gray-200 p-3 text-base leading-6 text-gray-900"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
