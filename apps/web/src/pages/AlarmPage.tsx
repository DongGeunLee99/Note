import { useState } from 'react'
import AlarmGroupList from '@/components/alarm/AlarmGroupList'
import AlarmGroupModal from '@/components/alarm/AlarmGroupModal'
import AlarmModal from '@/components/alarm/AlarmModal'
import QuickAlarmInput from '@/components/alarm/QuickAlarmInput'
import PageHeader from '@/components/common/PageHeader'
import SectionLabel from '@/components/common/SectionLabel'
import Divider from '@/components/common/Divider'
import StatCards from '@/components/common/StatCards'
import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import Spinner from '@/components/common/Spinner'
import type { AlarmGroup, Alarm } from '@smartnote/shared/types'
import type { GroupFormInput } from '@smartnote/shared/services/alarmGroupService'
import type { AlarmFormInput } from '@smartnote/shared/services/alarmService'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useAlarmStore } from '@/stores/useAlarmStore'

type GroupModalState = { isOpen: false } | { isOpen: true; target: AlarmGroup | null }
type AlarmModalState = { isOpen: false } | { isOpen: true; target: Alarm | null; defaultGroupId?: string }

export default function AlarmPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const groups = useAlarmStore(s => s.groups)
  const alarms = useAlarmStore(s => s.alarms)
  const isLoading = useAlarmStore(s => s.isLoading)
  const { toggleGroup, deleteGroup, saveGroup, toggleAlarm, deleteAlarm, saveAlarm, quickAddAlarm } = useAlarmStore.getState()
  const [groupModal, setGroupModal] = useState<GroupModalState>({ isOpen: false })
  const [alarmModal, setAlarmModal] = useState<AlarmModalState>({ isOpen: false })

  function handleDeleteGroup(groupId: string) {
    deleteGroup(groupId)
    toast(t('alarm.toastGroupDeleted'), 'info')
  }

  function handleSaveGroup(data: GroupFormInput) {
    const targetId = groupModal.isOpen && groupModal.target ? groupModal.target.groupId : undefined
    saveGroup(data, targetId)
    toast(targetId ? t('alarm.toastGroupUpdated') : t('alarm.toastGroupAdded'), 'success')
  }

  function handleDeleteAlarm(alarmId: string) {
    deleteAlarm(alarmId)
    toast(t('alarm.toastAlarmDeleted'), 'info')
  }

  function handleSaveAlarm(data: AlarmFormInput) {
    const targetId = alarmModal.isOpen && alarmModal.target ? alarmModal.target.alarmId : undefined
    saveAlarm(data, targetId)
    toast(targetId ? t('alarm.toastAlarmUpdated') : t('alarm.toastAlarmAdded'), 'success')
  }

  function handleQuickAdd(groupId: string, hour: number, minute: number, label: string) {
    quickAddAlarm(groupId, hour, minute, label)
    toast(t('alarm.toastQuickAdded', { label }), 'success')
  }

  const totalActive = alarms.filter(a => {
    const group = groups.find(g => g.groupId === a.groupId)
    return a.isEnabled && group?.isEnabled
  }).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('alarm.pageTitle')}>
        <button
          onClick={() => setGroupModal({ isOpen: true, target: null })}
          className="text-[10px] px-2.5 py-1.5 rounded-lg border"
          style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
        >
          {t('alarm.addGroup')}
        </button>
        <button
          onClick={() => setAlarmModal({ isOpen: true, target: null })}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('alarm.addAlarm')}
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
            <SectionLabel>{t('alarm.quickAlarm')}</SectionLabel>
            <QuickAlarmInput groups={groups} onAdd={handleQuickAdd} />

            <Divider />

            <SectionLabel>{t('common.status')}</SectionLabel>
            <StatCards
              items={[
                { value: groups.filter(g => g.isEnabled).length, label: t('alarm.activeGroups') },
                { value: totalActive, label: t('alarm.activeAlarms') },
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
