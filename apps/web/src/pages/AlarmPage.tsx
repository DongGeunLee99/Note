import { useState } from 'react'
import AlarmGroupList from '../components/alarm/AlarmGroupList'
import AlarmGroupModal from '../components/alarm/AlarmGroupModal'
import AlarmModal from '../components/alarm/AlarmModal'
import QuickAlarmInput from '../components/alarm/QuickAlarmInput'
import PageHeader from '../components/common/PageHeader'
import SectionLabel from '../components/common/SectionLabel'
import Divider from '../components/common/Divider'
import StatCards from '../components/common/StatCards'
import ResizableRightPanel from '../components/common/ResizableRightPanel'
import type { LocalAlarmGroup, LocalAlarm } from '../types/localAlarm'
import { useToast } from '../contexts/ToastContext'
import { useAlarmStore } from '../stores/useAlarmStore'

type GroupModalState = { isOpen: false } | { isOpen: true; target: LocalAlarmGroup | null }
type AlarmModalState = { isOpen: false } | { isOpen: true; target: LocalAlarm | null; defaultGroupId?: string }

export default function AlarmPage() {
  const toast = useToast()
  const groups = useAlarmStore(s => s.groups)
  const alarms = useAlarmStore(s => s.alarms)
  const { toggleGroup, deleteGroup, saveGroup, toggleAlarm, deleteAlarm, saveAlarm, quickAddAlarm } = useAlarmStore.getState()
  const [groupModal, setGroupModal] = useState<GroupModalState>({ isOpen: false })
  const [alarmModal, setAlarmModal] = useState<AlarmModalState>({ isOpen: false })

  function handleDeleteGroup(groupId: string) {
    deleteGroup(groupId)
    toast('그룹이 삭제되었습니다', 'info')
  }

  function handleSaveGroup(data: { name: string; color: string; emoji: string }) {
    const targetId = groupModal.isOpen && groupModal.target ? groupModal.target.groupId : undefined
    saveGroup(data, targetId)
    toast(targetId ? '그룹이 수정되었습니다' : '그룹이 추가되었습니다', 'success')
  }

  function handleDeleteAlarm(alarmId: string) {
    deleteAlarm(alarmId)
    toast('알람이 삭제되었습니다', 'info')
  }

  function handleSaveAlarm(data: Omit<LocalAlarm, 'alarmId' | 'sourceMemoId'>) {
    const targetId = alarmModal.isOpen && alarmModal.target ? alarmModal.target.alarmId : undefined
    saveAlarm(data, targetId)
    toast(targetId ? '알람이 수정되었습니다' : '알람이 추가되었습니다', 'success')
  }

  function handleQuickAdd(groupId: string, hour: number, minute: number, label: string) {
    quickAddAlarm(groupId, hour, minute, label)
    toast(`${label} 알람이 추가되었습니다`, 'success')
  }

  const totalActive = alarms.filter(a => {
    const group = groups.find(g => g.groupId === a.groupId)
    return a.isEnabled && group?.isEnabled
  }).length

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="알람">
        <button
          onClick={() => setGroupModal({ isOpen: true, target: null })}
          className="text-[10px] px-2.5 py-1.5 rounded-lg border"
          style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
        >
          + 그룹 추가
        </button>
        <button
          onClick={() => setAlarmModal({ isOpen: true, target: null })}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + 알람 추가
        </button>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <AlarmGroupList
            groups={groups}
            alarms={alarms}
            onToggleGroup={toggleGroup}
            onEditGroup={id => setGroupModal({ isOpen: true, target: groups.find(g => g.groupId === id) ?? null })}
            onAddAlarm={gId => setAlarmModal({ isOpen: true, target: null, defaultGroupId: gId })}
            onToggleAlarm={toggleAlarm}
            onEditAlarm={id => setAlarmModal({ isOpen: true, target: alarms.find(a => a.alarmId === id) ?? null })}
          />
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-3 h-full">
            <SectionLabel>빠른 알람</SectionLabel>
            <QuickAlarmInput groups={groups} onAdd={handleQuickAdd} />

            <Divider />

            <SectionLabel>현황</SectionLabel>
            <StatCards
              items={[
                { value: groups.filter(g => g.isEnabled).length, label: '활성 그룹' },
                { value: totalActive, label: '활성 알람' },
              ]}
            />
          </div>
        </ResizableRightPanel>
      </div>

      <AlarmGroupModal
        isOpen={groupModal.isOpen}
        onClose={() => setGroupModal({ isOpen: false })}
        onSave={handleSaveGroup}
        onDelete={groupModal.isOpen && groupModal.target ? () => {
          handleDeleteGroup(groupModal.target!.groupId)
          setGroupModal({ isOpen: false })
        } : undefined}
        initial={groupModal.isOpen ? groupModal.target : null}
      />

      <AlarmModal
        isOpen={alarmModal.isOpen}
        onClose={() => setAlarmModal({ isOpen: false })}
        onSave={handleSaveAlarm}
        onDelete={alarmModal.isOpen && alarmModal.target ? () => {
          handleDeleteAlarm(alarmModal.target!.alarmId)
          setAlarmModal({ isOpen: false })
        } : undefined}
        groups={groups}
        initial={alarmModal.isOpen ? alarmModal.target : null}
        defaultGroupId={alarmModal.isOpen ? alarmModal.defaultGroupId : undefined}
      />
    </div>
  )
}
