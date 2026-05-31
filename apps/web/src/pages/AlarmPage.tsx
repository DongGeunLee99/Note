import { useState } from 'react'
import AlarmGroupList from '../components/alarm/AlarmGroupList'
import AlarmGroupModal from '../components/alarm/AlarmGroupModal'
import AlarmModal from '../components/alarm/AlarmModal'
import QuickAlarmInput from '../components/alarm/QuickAlarmInput'
import type { LocalAlarmGroup, LocalAlarm } from '../types/localAlarm'
import { useToast } from '../contexts/ToastContext'

let nextId = 100

const INITIAL_GROUPS: LocalAlarmGroup[] = [
  { groupId: 'g1', name: '직장', color: '#185FA5', emoji: '💼', isEnabled: true, isDefault: false },
  { groupId: 'g2', name: '집', color: '#854F0B', emoji: '🏠', isEnabled: true, isDefault: false },
  { groupId: 'g-default', name: '기타', color: '#444441', emoji: '⭐', isEnabled: true, isDefault: true },
]

const INITIAL_ALARMS: LocalAlarm[] = [
  { alarmId: 'a1', groupId: 'g1', label: '기상', hour: 7, minute: 30, repeatDays: [1, 2, 3, 4, 5], isEnabled: true, sourceMemoId: null },
  { alarmId: 'a2', groupId: 'g1', label: '출근 준비', hour: 9, minute: 0, repeatDays: [1, 2, 3, 4, 5], isEnabled: true, sourceMemoId: null },
  { alarmId: 'a3', groupId: 'g1', label: '퇴근', hour: 18, minute: 30, repeatDays: [1, 2, 3, 4, 5], isEnabled: false, sourceMemoId: null },
  { alarmId: 'a4', groupId: 'g2', label: '취침 준비', hour: 22, minute: 30, repeatDays: [0, 1, 2, 3, 4, 5, 6], isEnabled: true, sourceMemoId: null },
]

type GroupModalState = { isOpen: false } | { isOpen: true; target: LocalAlarmGroup | null }
type AlarmModalState = { isOpen: false } | { isOpen: true; target: LocalAlarm | null; defaultGroupId?: string }

export default function AlarmPage() {
  const toast = useToast()
  const [groups, setGroups] = useState<LocalAlarmGroup[]>(INITIAL_GROUPS)
  const [alarms, setAlarms] = useState<LocalAlarm[]>(INITIAL_ALARMS)
  const [groupModal, setGroupModal] = useState<GroupModalState>({ isOpen: false })
  const [alarmModal, setAlarmModal] = useState<AlarmModalState>({ isOpen: false })

  function handleToggleGroup(groupId: string) {
    setGroups(prev => prev.map(g => g.groupId === groupId ? { ...g, isEnabled: !g.isEnabled } : g))
  }

  function handleDeleteGroup(groupId: string) {
    setGroups(prev => prev.filter(g => g.groupId !== groupId))
    setAlarms(prev => prev.filter(a => a.groupId !== groupId))
    toast('그룹이 삭제되었습니다', 'info')
  }

  function handleSaveGroup(data: { name: string; color: string; emoji: string }) {
    if (groupModal.isOpen && groupModal.target) {
      setGroups(prev => prev.map(g =>
        g.groupId === groupModal.target!.groupId ? { ...g, ...data } : g
      ))
      toast('그룹이 수정되었습니다', 'success')
    } else {
      const newGroup: LocalAlarmGroup = {
        groupId: `g${++nextId}`,
        ...data,
        isEnabled: true,
        isDefault: false,
      }
      setGroups(prev => {
        const defaultIdx = prev.findIndex(g => g.isDefault)
        if (defaultIdx === -1) return [...prev, newGroup]
        return [...prev.slice(0, defaultIdx), newGroup, ...prev.slice(defaultIdx)]
      })
      toast('그룹이 추가되었습니다', 'success')
    }
  }

  function handleToggleAlarm(alarmId: string) {
    setAlarms(prev => prev.map(a => a.alarmId === alarmId ? { ...a, isEnabled: !a.isEnabled } : a))
  }

  function handleDeleteAlarm(alarmId: string) {
    setAlarms(prev => prev.filter(a => a.alarmId !== alarmId))
    toast('알람이 삭제되었습니다', 'info')
  }

  function handleSaveAlarm(data: Omit<LocalAlarm, 'alarmId' | 'sourceMemoId'>) {
    if (alarmModal.isOpen && alarmModal.target) {
      setAlarms(prev => prev.map(a =>
        a.alarmId === alarmModal.target!.alarmId ? { ...a, ...data } : a
      ))
      toast('알람이 수정되었습니다', 'success')
    } else {
      setAlarms(prev => [...prev, { alarmId: `a${++nextId}`, ...data, sourceMemoId: null }])
      toast('알람이 추가되었습니다', 'success')
    }
  }

  function handleQuickAdd(groupId: string, hour: number, minute: number, label: string) {
    setAlarms(prev => [...prev, {
      alarmId: `a${++nextId}`,
      groupId,
      label,
      hour,
      minute,
      repeatDays: [],
      isEnabled: true,
      sourceMemoId: null,
    }])
    toast(`${label} 알람이 추가되었습니다`, 'success')
  }

  const totalActive = alarms.filter(a => {
    const group = groups.find(g => g.groupId === a.groupId)
    return a.isEnabled && group?.isEnabled
  }).length

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">알람</span>
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <AlarmGroupList
            groups={groups}
            alarms={alarms}
            onToggleGroup={handleToggleGroup}
            onEditGroup={id => setGroupModal({ isOpen: true, target: groups.find(g => g.groupId === id) ?? null })}
            onDeleteGroup={handleDeleteGroup}
            onAddAlarm={gId => setAlarmModal({ isOpen: true, target: null, defaultGroupId: gId })}
            onToggleAlarm={handleToggleAlarm}
            onEditAlarm={id => setAlarmModal({ isOpen: true, target: alarms.find(a => a.alarmId === id) ?? null })}
            onDeleteAlarm={handleDeleteAlarm}
          />
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-3 overflow-auto">
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
            빠른 알람
          </p>
          <QuickAlarmInput groups={groups} onAdd={handleQuickAdd} />

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
            현황
          </p>
          <div className="flex gap-1.5">
            {[
              { n: groups.filter(g => g.isEnabled).length, l: '활성 그룹' },
              { n: totalActive, l: '활성 알람' },
            ].map(s => (
              <div
                key={s.l}
                className="flex-1 flex flex-col items-center py-2 rounded-lg"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <span className="text-[16px] font-medium">{s.n}</span>
                <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlarmGroupModal
        isOpen={groupModal.isOpen}
        onClose={() => setGroupModal({ isOpen: false })}
        onSave={handleSaveGroup}
        initial={groupModal.isOpen ? groupModal.target : null}
      />

      <AlarmModal
        isOpen={alarmModal.isOpen}
        onClose={() => setAlarmModal({ isOpen: false })}
        onSave={handleSaveAlarm}
        groups={groups}
        initial={alarmModal.isOpen ? alarmModal.target : null}
        defaultGroupId={alarmModal.isOpen ? alarmModal.defaultGroupId : undefined}
      />
    </div>
  )
}
