import { Pressable, Switch, Text, View } from 'react-native'
import type { Alarm } from '@smartnote/shared/types'
import { formatRepeat, formatTime } from '../../utils/alarmFormat'

interface AlarmCardProps {
  alarm: Alarm
  groupEnabled: boolean
  onToggle: () => void
  onEdit: () => void
  onLongPress: () => void
}

/** 알람 줄 — 그룹이 꺼져 있으면 흐리게 + 스위치 비활성 */
export default function AlarmCard({ alarm, groupEnabled, onToggle, onEdit, onLongPress }: AlarmCardProps) {
  const isEffectivelyOff = !alarm.isEnabled || !groupEnabled

  return (
    <View className={`flex-row items-center pr-3 ${isEffectivelyOff ? 'opacity-40' : ''}`}>
      {/* 스위치를 Pressable 밖 형제로 둬야 스위치 탭이 수정 열기로 번지지 않음 (웹은 click 이벤트도 버블링) */}
      <Pressable onPress={onEdit} onLongPress={onLongPress} className="flex-1 py-2.5 pl-3 pr-2 active:bg-gray-50">
        <Text className="text-2xl font-medium text-gray-900" style={{ fontVariant: ['tabular-nums'] }}>
          {formatTime(alarm.hour, alarm.minute)}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
          {alarm.label} · {formatRepeat(alarm.repeatDays)}
        </Text>
      </Pressable>
      <Switch value={alarm.isEnabled} onValueChange={onToggle} disabled={!groupEnabled} />
    </View>
  )
}
