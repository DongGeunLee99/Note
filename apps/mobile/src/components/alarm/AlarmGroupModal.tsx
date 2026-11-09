import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import type { AlarmGroup } from '@smartnote/shared/types'
import type { GroupFormInput } from '@smartnote/shared/services/alarmGroupService'
import BottomSheet from '../common/BottomSheet'
import { GROUP_COLORS, GROUP_EMOJIS, GROUP_THEME_COLOR, displayGroupIcon, groupBg } from '../../utils/alarmFormat'

interface AlarmGroupModalProps {
  visible: boolean
  onClose: () => void
  onSave: (data: GroupFormInput) => void
  onDelete?: () => void
  initial?: AlarmGroup | null
}

const COLOR_OPTIONS = [GROUP_THEME_COLOR, ...GROUP_COLORS.map(c => c.fg)]

/** 알람 그룹 추가/수정 시트. 기본('기타') 그룹은 삭제 불가 */
export default function AlarmGroupModal({ visible, onClose, onSave, onDelete, initial }: AlarmGroupModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(GROUP_THEME_COLOR)
  const [emoji, setEmoji] = useState(GROUP_EMOJIS[0])

  useEffect(() => {
    if (!visible) return
    setName(initial?.name ?? '')
    setColor(initial?.color ?? GROUP_THEME_COLOR)
    setEmoji(initial ? displayGroupIcon(initial.icon) : GROUP_EMOJIS[0])
  }, [visible, initial])

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), color, icon: emoji })
    onClose()
  }

  const canSave = name.trim().length > 0

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={initial ? '그룹 수정' : '그룹 추가'}
      footer={
        <>
          {initial && !initial.isDefault && onDelete && (
            <Pressable onPress={onDelete} className="rounded-xl border border-red-200 px-4 py-3 active:opacity-70">
              <Text className="font-medium text-red-600">삭제</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`flex-1 items-center rounded-xl bg-gray-900 py-3 active:opacity-80 ${canSave ? '' : 'opacity-30'}`}
          >
            <Text className="font-semibold text-white">저장</Text>
          </Pressable>
        </>
      }
    >
      <View className="mb-4 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: groupBg(color) }}>
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="그룹 이름"
          maxLength={20}
          className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-base text-gray-900"
        />
      </View>

      <Text className="mb-1.5 text-sm font-medium text-gray-500">색상</Text>
      <View className="flex-row gap-3">
        {COLOR_OPTIONS.map(c => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            className={`h-9 w-9 items-center justify-center rounded-full border-2 ${color === c ? 'border-gray-900' : 'border-transparent'}`}
          >
            <View className="h-7 w-7 rounded-full" style={{ backgroundColor: groupBg(c) }} />
          </Pressable>
        ))}
      </View>

      <Text className="mb-1.5 mt-4 text-sm font-medium text-gray-500">아이콘</Text>
      <View className="flex-row flex-wrap gap-2">
        {GROUP_EMOJIS.map(e => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            className={`h-11 w-11 items-center justify-center rounded-xl ${emoji === e ? 'bg-gray-900' : 'bg-gray-100'}`}
          >
            <Text className="text-xl">{e}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  )
}
