import { Pressable, Switch, Text, View } from 'react-native'
import type { AlarmGroup } from '@smartnote/shared/types'
import { displayGroupIcon, groupBg } from '../../utils/alarmFormat'

interface AlarmGroupCardProps {
  group: AlarmGroup
  alarmCount: number
  onToggle: () => void
  onEdit: () => void
  onLongPress: () => void
}

/** 그룹 줄 — 탭: 수정, 길게: 메뉴, 스위치: 그룹 전체 ON/OFF */
export default function AlarmGroupCard({ group, alarmCount, onToggle, onEdit, onLongPress }: AlarmGroupCardProps) {
  return (
    <View className="flex-row items-center rounded-xl bg-gray-100 pr-3">
      {/* 스위치를 Pressable 밖 형제로 둬야 스위치 탭이 수정 열기로 번지지 않음 (웹은 click 이벤트도 버블링) */}
      <Pressable
        onPress={onEdit}
        onLongPress={onLongPress}
        className="flex-1 flex-row items-center gap-3 py-2.5 pl-3 pr-2 active:opacity-70"
      >
        <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: groupBg(group.color) }}>
          <Text className="text-base">{displayGroupIcon(group.icon)}</Text>
        </View>
        <Text className="flex-1 text-base font-semibold text-gray-900">{group.name}</Text>
        <Text className="text-xs text-gray-400">{alarmCount}개</Text>
      </Pressable>
      <Switch value={group.isEnabled} onValueChange={onToggle} />
    </View>
  )
}
