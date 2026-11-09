import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { Alarm, AlarmGroup } from '@smartnote/shared/types'
import type { AlarmFormInput } from '@smartnote/shared/services/alarmService'
import BottomSheet from '../common/BottomSheet'
import TimePickerField from './TimePickerField'
import { DAY_NAMES, displayGroupIcon } from '../../utils/alarmFormat'

interface AlarmModalProps {
  visible: boolean
  onClose: () => void
  onSave: (data: AlarmFormInput) => void
  onDelete?: () => void
  groups: AlarmGroup[]
  initial?: Alarm | null
  defaultGroupId?: string
}

const REPEAT_PRESETS: { label: string; days: number[] }[] = [
  { label: '평일', days: [1, 2, 3, 4, 5] },
  { label: '주말', days: [0, 6] },
  { label: '매일', days: [0, 1, 2, 3, 4, 5, 6] },
]

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',')

/** 알람 추가/수정 시트 */
export default function AlarmModal({ visible, onClose, onSave, onDelete, groups, initial, defaultGroupId }: AlarmModalProps) {
  const [label, setLabel] = useState('')
  const [hour, setHour] = useState(7)
  const [minute, setMinute] = useState(0)
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [groupId, setGroupId] = useState('')

  useEffect(() => {
    if (!visible) return
    const now = new Date()
    setLabel(initial?.label ?? '')
    setHour(initial?.hour ?? now.getHours())
    setMinute(initial?.minute ?? now.getMinutes())
    setRepeatDays(initial?.repeatDays ?? [1, 2, 3, 4, 5])
    setGroupId(initial?.groupId ?? defaultGroupId ?? groups[0]?.groupId ?? '')
  }, [visible, initial, defaultGroupId, groups])

  function toggleDay(day: number) {
    setRepeatDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  function handleSave() {
    if (!label.trim() || !groupId) return
    onSave({ label: label.trim(), hour, minute, repeatDays, groupId, isEnabled: initial?.isEnabled ?? true })
    onClose()
  }

  const canSave = label.trim().length > 0

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={initial ? '알람 수정' : '알람 추가'}
      footer={
        <>
          {initial && onDelete && (
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
      <TimePickerField hour={hour} minute={minute} onChange={(h, m) => { setHour(h); setMinute(m) }} />

      <Text className="mb-1.5 mt-4 text-sm font-medium text-gray-500">이름</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="알람 이름"
        maxLength={30}
        className="rounded-xl bg-gray-100 px-4 py-3 text-base text-gray-900"
      />

      <Text className="mb-1.5 mt-4 text-sm font-medium text-gray-500">반복</Text>
      <View className="flex-row gap-2">
        {REPEAT_PRESETS.map(p => {
          const active = sameDays(repeatDays, p.days)
          return (
            <Pressable
              key={p.label}
              onPress={() => setRepeatDays(active ? [] : p.days)}
              className={`rounded-full px-3.5 py-1.5 ${active ? 'bg-gray-900' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm ${active ? 'text-white' : 'text-gray-700'}`}>{p.label}</Text>
            </Pressable>
          )
        })}
      </View>
      <View className="mt-2 flex-row justify-between">
        {DAY_NAMES.map((name, day) => {
          const active = repeatDays.includes(day)
          return (
            <Pressable
              key={name}
              onPress={() => toggleDay(day)}
              className={`h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-gray-900' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm ${active ? 'text-white' : day === 0 ? 'text-red-500' : 'text-gray-700'}`}>{name}</Text>
            </Pressable>
          )
        })}
      </View>
      <Text className="mt-1.5 text-xs text-gray-400">요일을 선택하지 않으면 한 번만 울려요</Text>

      <Text className="mb-1.5 mt-4 text-sm font-medium text-gray-500">그룹</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-2">
        {groups.map(g => {
          const active = g.groupId === groupId
          return (
            <Pressable
              key={g.groupId}
              onPress={() => setGroupId(g.groupId)}
              className={`rounded-full px-3.5 py-1.5 ${active ? 'bg-gray-900' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm ${active ? 'text-white' : 'text-gray-700'}`}>
                {displayGroupIcon(g.icon)} {g.name}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </BottomSheet>
  )
}
