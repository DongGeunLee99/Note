import { useState } from 'react'
import AlarmGroupList from '@/components/alarm/AlarmGroupList'
import AlarmGroupModal from '@/components/alarm/AlarmGroupModal'
import AlarmModal from '@/components/alarm/AlarmModal'
import QuickAlarmInput from '@/components/alarm/QuickAlarmInput'
import SectionLabel from '@/components/common/SectionLabel'
// import StatCards from '@/components/common/StatCards' // 활성 그룹/활성 알람 수 — 우측 패널 제거로 주석 처리
import Spinner from '@/components/common/Spinner'
import ContextMenu, { useContextMenu } from '@/components/common/ContextMenu'
import type { ContextMenuItem } from '@/components/common/ContextMenu'
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react'
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
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [menuTarget, setMenuTarget] = useState<
    { kind: 'empty' } | { kind: 'group'; groupId: string } | { kind: 'alarm'; alarmId: string }
  >({ kind: 'empty' })

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

  function openCtxGroup(e: React.MouseEvent, groupId: string) {
    e.stopPropagation()
    setMenuTarget({ kind: 'group', groupId })
    openMenu(e)
  }

  function openCtxAlarm(e: React.MouseEvent, alarmId: string) {
    e.stopPropagation()
    setMenuTarget({ kind: 'alarm', alarmId })
    openMenu(e)
  }

  function buildMenuItems(): ContextMenuItem[] {
    if (menuTarget.kind === 'group') {
      const group = groups.find(g => g.groupId === menuTarget.groupId)
      if (!group) return []
      const items: ContextMenuItem[] = [
        { label: t('alarm.addAlarm'), icon: <IconPlus size={12} />, onClick: () => setAlarmModal({ isOpen: true, target: null, defaultGroupId: group.groupId }) },
        { label: t('common.edit'), icon: <IconPencil size={12} />, onClick: () => setGroupModal({ isOpen: true, target: group }) },
      ]
      if (!group.isDefault) {
        items.push({ label: t('common.delete'), icon: <IconTrash size={12} />, danger: true, onClick: () => handleDeleteGroup(group.groupId) })
      }
      return items
    }
    if (menuTarget.kind === 'alarm') {
      const alarm = alarms.find(a => a.alarmId === menuTarget.alarmId)
      if (!alarm) return []
      return [
        { label: t('common.edit'), icon: <IconPencil size={12} />, onClick: () => setAlarmModal({ isOpen: true, target: alarm }) },
        { label: t('common.delete'), icon: <IconTrash size={12} />, danger: true, onClick: () => handleDeleteAlarm(alarm.alarmId) },
      ]
    }
    return [
      { label: t('alarm.addGroup'), icon: <IconPlus size={12} />, onClick: () => setGroupModal({ isOpen: true, target: null }) },
      { label: t('alarm.addAlarm'), icon: <IconPlus size={12} />, onClick: () => setAlarmModal({ isOpen: true, target: null }) },
    ]
  }

  // 활성 그룹/활성 알람 수 StatCards — 우측 패널 제거로 주석 처리
  // const totalActive = alarms.filter(a => {
  //   const group = groups.find(g => g.groupId === a.groupId)
  //   return a.isEnabled && group?.isEnabled
  // }).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex flex-col gap-3 px-6 py-4 overflow-auto max-w-5xl mx-auto w-full"
          onContextMenu={e => { setMenuTarget({ kind: 'empty' }); openMenu(e) }}
        >
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setGroupModal({ isOpen: true, target: null })}
              className="text-[calc(10px*var(--fs))] px-2.5 py-1.5 rounded-lg border"
              style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            >
              + {t('alarm.addGroup')}
            </button>
            <button
              onClick={() => setAlarmModal({ isOpen: true, target: null })}
              className="text-[calc(10px*var(--fs))] px-2.5 py-1.5 rounded-lg text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              + {t('alarm.addAlarm')}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <SectionLabel>{t('alarm.quickAlarm')}</SectionLabel>
            <QuickAlarmInput groups={groups} onAdd={handleQuickAdd} />
          </div>

          <AlarmGroupList
            groups={groups}
            alarms={alarms}
            onToggleGroup={toggleGroup}
            onEditGroup={id => setGroupModal({ isOpen: true, target: groups.find(g => g.groupId === id) ?? null })}
            onAddAlarm={gId => setAlarmModal({ isOpen: true, target: null, defaultGroupId: gId })}
            onToggleAlarm={toggleAlarm}
            onEditAlarm={id => setAlarmModal({ isOpen: true, target: alarms.find(a => a.alarmId === id) ?? null })}
            onContextMenuGroup={openCtxGroup}
            onContextMenuAlarm={openCtxAlarm}
          />

          {/* 활성 그룹/활성 알람 수 StatCards — 우측 패널 제거로 주석 처리
          <Divider />
          <SectionLabel>{t('common.status')}</SectionLabel>
          <StatCards
            items={[
              { value: groups.filter(g => g.isEnabled).length, label: t('alarm.activeGroups') },
              { value: totalActive, label: t('alarm.activeAlarms') },
            ]}
          />
          */}
        </div>
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

      {menu && (
        <ContextMenu x={menu.x} y={menu.y} onClose={closeMenu} items={buildMenuItems()} />
      )}
    </div>
  )
}
