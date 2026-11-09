import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Alarm, AlarmGroup } from '@smartnote/shared/types'
import type { GroupFormInput } from '@smartnote/shared/services/alarmGroupService'
import type { AlarmFormInput } from '@smartnote/shared/services/alarmService'
import { useAlarmStore } from '../stores/useAlarmStore'
import AlarmGroupCard from '../components/alarm/AlarmGroupCard'
import AlarmCard from '../components/alarm/AlarmCard'
import AlarmModal from '../components/alarm/AlarmModal'
import AlarmGroupModal from '../components/alarm/AlarmGroupModal'
import QuickAlarmInput from '../components/alarm/QuickAlarmInput'
import { confirmAction, showActions } from '../utils/confirm'

type GroupModalState = { visible: false } | { visible: true; target: AlarmGroup | null }
type AlarmModalState = { visible: false } | { visible: true; target: Alarm | null; defaultGroupId?: string }

/** 알람 화면 — 빠른 알람 + 그룹별 알람 목록 (더미 스토어) */
export default function AlarmScreen() {
  const groups = useAlarmStore(s => s.groups)
  const alarms = useAlarmStore(s => s.alarms)
  const { toggleGroup, deleteGroup, saveGroup, toggleAlarm, deleteAlarm, saveAlarm, quickAddAlarm } = useAlarmStore.getState()

  const [groupModal, setGroupModal] = useState<GroupModalState>({ visible: false })
  const [alarmModal, setAlarmModal] = useState<AlarmModalState>({ visible: false })

  function handleDeleteGroup(group: AlarmGroup) {
    const count = alarms.filter(a => a.groupId === group.groupId).length
    confirmAction('그룹 삭제', `"${group.name}" 그룹과 알람 ${count}개가 삭제돼요.`, '삭제', () => {
      deleteGroup(group.groupId)
      setGroupModal({ visible: false })
    })
  }

  function handleDeleteAlarm(alarm: Alarm) {
    confirmAction('알람 삭제', `"${alarm.label}" 알람을 삭제할까요?`, '삭제', () => {
      deleteAlarm(alarm.alarmId)
      setAlarmModal({ visible: false })
    })
  }

  function handleSaveGroup(data: GroupFormInput) {
    saveGroup(data, groupModal.visible && groupModal.target ? groupModal.target.groupId : undefined)
  }

  function handleSaveAlarm(data: AlarmFormInput) {
    saveAlarm(data, alarmModal.visible && alarmModal.target ? alarmModal.target.alarmId : undefined)
  }

  function openGroupActions(group: AlarmGroup) {
    showActions(group.name, [
      { label: '수정', onPress: () => setGroupModal({ visible: true, target: group }) },
      { label: '알람 추가', onPress: () => setAlarmModal({ visible: true, target: null, defaultGroupId: group.groupId }) },
      ...(group.isDefault ? [] : [{ label: '삭제', destructive: true, onPress: () => handleDeleteGroup(group) }]),
    ])
  }

  function openAlarmActions(alarm: Alarm) {
    showActions(alarm.label, [
      { label: '수정', onPress: () => setAlarmModal({ visible: true, target: alarm }) },
      { label: '삭제', destructive: true, onPress: () => handleDeleteAlarm(alarm) },
    ])
  }

  const editingGroup = groupModal.visible ? groupModal.target : null
  const editingAlarm = alarmModal.visible ? alarmModal.target : null

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <Text className="text-2xl font-bold text-gray-900">알람</Text>
        <View className="flex-row gap-2">
          <Pressable onPress={() => setGroupModal({ visible: true, target: null })} className="rounded-lg border border-gray-300 px-3 py-1.5 active:opacity-70">
            <Text className="text-sm text-gray-700">+ 그룹</Text>
          </Pressable>
          <Pressable onPress={() => setAlarmModal({ visible: true, target: null })} className="rounded-lg bg-gray-900 px-3 py-1.5 active:opacity-80">
            <Text className="text-sm font-medium text-white">+ 알람</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerClassName="gap-4 px-4 pb-8" keyboardShouldPersistTaps="handled">
        <QuickAlarmInput groups={groups} onAdd={quickAddAlarm} />

        {groups.map(group => {
          const groupAlarms = alarms.filter(a => a.groupId === group.groupId)
          return (
            <View key={group.groupId}>
              <AlarmGroupCard
                group={group}
                alarmCount={groupAlarms.length}
                onToggle={() => toggleGroup(group.groupId)}
                onEdit={() => setGroupModal({ visible: true, target: group })}
                onLongPress={() => openGroupActions(group)}
              />
              {groupAlarms.map(alarm => (
                <AlarmCard
                  key={alarm.alarmId}
                  alarm={alarm}
                  groupEnabled={group.isEnabled}
                  onToggle={() => toggleAlarm(alarm.alarmId)}
                  onEdit={() => setAlarmModal({ visible: true, target: alarm })}
                  onLongPress={() => openAlarmActions(alarm)}
                />
              ))}
              <Pressable
                onPress={() => setAlarmModal({ visible: true, target: null, defaultGroupId: group.groupId })}
                className="px-3 py-2"
              >
                <Text className="text-sm text-gray-500">+ 알람 추가</Text>
              </Pressable>
            </View>
          )
        })}
      </ScrollView>

      <AlarmGroupModal
        visible={groupModal.visible}
        onClose={() => setGroupModal({ visible: false })}
        onSave={handleSaveGroup}
        onDelete={editingGroup ? () => handleDeleteGroup(editingGroup) : undefined}
        initial={editingGroup}
      />
      <AlarmModal
        visible={alarmModal.visible}
        onClose={() => setAlarmModal({ visible: false })}
        onSave={handleSaveAlarm}
        onDelete={editingAlarm ? () => handleDeleteAlarm(editingAlarm) : undefined}
        groups={groups}
        initial={editingAlarm}
        defaultGroupId={alarmModal.visible ? alarmModal.defaultGroupId : undefined}
      />
    </SafeAreaView>
  )
}
