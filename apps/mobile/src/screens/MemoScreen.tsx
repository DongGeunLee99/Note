import { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { MemoView } from '@smartnote/shared/stores/useMemoStore'
import type { MemoStackParamList } from '../navigation/MemoNavigator'
import { useMemoStore, MAX_PINNED } from '../stores/useMemoStore'
import { useAlarmStore } from '../stores/useAlarmStore'
import MemoCard from '../components/memo/MemoCard'
import { confirmAction, showActions, showMessage } from '../utils/confirm'

type MemoScreenProps = NativeStackScreenProps<MemoStackParamList, 'memoList'>

/** 고정 메모 먼저(최근 고정 순), 나머지는 최신 작성 순 */
function sortMemos(memos: MemoView[]): MemoView[] {
  return [...memos].sort((a, b) => {
    if (!!a.pinnedAt !== !!b.pinnedAt) return a.pinnedAt ? -1 : 1
    if (a.pinnedAt && b.pinnedAt) return b.pinnedAt - a.pinnedAt
    return b.createdAt.toMillis() - a.createdAt.toMillis()
  })
}

/** 메모 목록 — 검색, 작성, 길게 눌러 고정/삭제, 알람 제안 수락 */
export default function MemoScreen({ navigation }: MemoScreenProps) {
  const memos = useMemoStore(s => s.memos)
  const { deleteMemo, togglePin, confirmAlarm, dismissAlarm } = useMemoStore.getState()
  const addMemoAlarm = useAlarmStore(s => s.addMemoAlarm)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const visibleMemos = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? memos.filter(m => m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q))
      : memos
    return sortMemos(filtered)
  }, [memos, query])

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  function handlePin(memo: MemoView) {
    if (togglePin(memo.memoId) === 'limit') {
      showMessage('고정 개수 초과', `메모는 최대 ${MAX_PINNED}개까지 고정할 수 있어요.`)
    }
  }

  function handleDelete(memo: MemoView) {
    confirmAction('메모 삭제', '이 메모를 삭제할까요?', '삭제', () => deleteMemo(memo.memoId))
  }

  function openActions(memo: MemoView) {
    showActions(memo.title || '메모', [
      { label: memo.pinnedAt ? '고정 해제' : '고정', onPress: () => handlePin(memo) },
      { label: '삭제', destructive: true, onPress: () => handleDelete(memo) },
    ])
  }

  function handleAlarmConfirm(memo: MemoView) {
    const suggestion = memo.alarmSuggestion
    if (!suggestion) return
    addMemoAlarm(memo.memoId, suggestion.datetime.getHours(), suggestion.datetime.getMinutes(), suggestion.label)
    confirmAlarm(memo.memoId)
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-3">
        {searchOpen ? (
          <>
            <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-white px-3">
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="제목·본문 검색"
                autoFocus
                className="flex-1 py-2 text-base text-gray-900"
              />
            </View>
            <Pressable onPress={closeSearch} className="px-1 py-2">
              <Text className="text-sm text-gray-600">취소</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="flex-1 text-2xl font-bold text-gray-900">메모</Text>
            <Pressable onPress={() => setSearchOpen(true)} className="p-2" accessibilityLabel="검색">
              <Ionicons name="search" size={20} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('memoDetail', {})}
              className="rounded-lg bg-gray-900 px-3 py-1.5 active:opacity-80"
            >
              <Text className="text-sm font-medium text-white">+ 작성</Text>
            </Pressable>
          </>
        )}
      </View>

      <FlatList
        data={visibleMemos}
        keyExtractor={m => m.memoId}
        contentContainerClassName="gap-2.5 px-4 pb-8"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <MemoCard
            memo={item}
            onPress={() => navigation.navigate('memoDetail', { memoId: item.memoId })}
            onLongPress={() => openActions(item)}
            onAlarmConfirm={() => handleAlarmConfirm(item)}
            onAlarmDismiss={() => dismissAlarm(item.memoId)}
          />
        )}
        ListEmptyComponent={
          <Text className="py-16 text-center text-gray-400">
            {query ? '검색 결과가 없어요' : '메모가 없어요. + 작성으로 시작해보세요'}
          </Text>
        }
      />
    </SafeAreaView>
  )
}
