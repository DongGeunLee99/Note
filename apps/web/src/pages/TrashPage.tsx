import { useState, useMemo } from 'react'
import { IconNote, IconBell, IconClock, IconRefresh, IconTrash } from '@tabler/icons-react'
import Badge from '@/components/common/Badge'
import ConfirmModal from '@/components/common/ConfirmModal'
import PageHeader from '@/components/common/PageHeader'
import SectionLabel from '@/components/common/SectionLabel'
import Divider from '@/components/common/Divider'
import PillButton from '@/components/common/PillButton'
import EmptyState from '@/components/common/EmptyState'
import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useTrashStore } from '@/stores/useTrashStore'
import type { TrashItem, TrashType } from '@/types/localItems'
import { daysLeft } from '@/utils/formatDate'
import { TONES, type Tone } from '@/theme/tones'

const TYPE_CONFIG: Record<TrashType, { icon: React.ReactNode; tone: Tone }> = {
  memo:  { icon: <IconNote size={14} style={{ color: TONES.gray.fg }} />,    tone: 'gray' },
  alarm: { icon: <IconBell size={14} style={{ color: TONES.blue.fg }} />,    tone: 'blue' },
  later: { icon: <IconClock size={14} style={{ color: TONES.violet.fg }} />, tone: 'violet' },
}

export default function TrashPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const typeLabels: Record<TrashType, string> = { memo: t('trash.typeMemo'), alarm: t('trash.typeAlarm'), later: t('trash.typeLater') }
  const items = useTrashStore(s => s.items)
  const { restore, permanentDelete, emptyAll } = useTrashStore.getState()
  const [confirmDelete, setConfirmDelete] = useState<TrashItem | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [filter, setFilter] = useState<TrashType | 'all'>('all')

  const displayed = useMemo(() => {
    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)
    return filtered.slice().sort((a, b) => daysLeft(a.deletedAt) - daysLeft(b.deletedAt))
  }, [items, filter])

  const expiringSoon = items.filter(i => daysLeft(i.deletedAt) <= 7).length

  function handleRestore(item: TrashItem) {
    restore(item.id)
    toast(t('trash.toastRestored', { title: item.title }), 'success')
  }

  function confirmPermanentDelete() {
    if (!confirmDelete) return
    permanentDelete(confirmDelete.id)
    toast(t('trash.toastDeleted'), 'info')
    setConfirmDelete(null)
  }

  function handleEmptyAll() {
    emptyAll()
    toast(t('trash.toastEmptied'), 'info')
    setConfirmEmpty(false)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('trash.pageTitle')}>
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          {t('trash.headerInfo', { n: items.length })}
        </span>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="text-[10px] px-2.5 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-danger-subtle)', color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }}
          >
            {t('trash.emptyAll')}
          </button>
        )}
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex items-center gap-1.5 px-3 py-2 border-b flex-shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {(['all', 'memo', 'alarm', 'later'] as const).map(f => (
              <PillButton key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? t('common.all') : typeLabels[f]}
              </PillButton>
            ))}
          </div>

          <div className="flex-1 p-3 overflow-auto">
            {displayed.length === 0 ? (
              <EmptyState emoji="🗑️" title={t('trash.emptyTitle')} description={t('trash.emptyDesc')} />
            ) : (
              <div className="flex flex-col gap-2">
                {displayed.map(item => {
                  const cfg = TYPE_CONFIG[item.type]
                  const left = daysLeft(item.deletedAt)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 border rounded-lg px-3 py-2"
                      style={{ borderColor: left <= 3 ? 'var(--color-danger-subtle)' : 'var(--color-border)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: TONES[cfg.tone].bg }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">{item.title}</p>
                        <p className="text-[9px] truncate" style={{ color: 'var(--color-muted)' }}>
                          {item.preview}
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color: left <= 3 ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                          {t('trash.expireIn', { n: left })}
                        </p>
                      </div>
                      <Badge variant={left <= 3 ? 'red' : left <= 7 ? 'amber' : 'gray'}>
                        D-{left}
                      </Badge>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border transition-colors hover-tint"
                          style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
                        >
                          <IconRefresh size={10} /> {t('common.restore')}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(item)}
                          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border transition-colors"
                          style={{ borderColor: 'var(--color-danger-subtle)', color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }}
                        >
                          <IconTrash size={10} /> {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-3 h-full overflow-auto">
            <SectionLabel>{t('common.status')}</SectionLabel>
            {(['memo', 'alarm', 'later'] as TrashType[]).map(type => {
              const count = items.filter(i => i.type === type).length
              return (
                <div key={type} className="flex items-center justify-between text-[10px]">
                  <span style={{ color: 'var(--color-muted)' }}>{typeLabels[type]}</span>
                  <Badge variant="gray">{t('common.count', { n: count })}</Badge>
                </div>
              )
            })}
            <Divider />
            {expiringSoon > 0 && (
              <div
                className="p-2 rounded-lg text-[10px]"
                style={{ background: 'var(--color-danger-subtle)', color: 'var(--color-danger)' }}
              >
                {t('trash.expiringSoon', { n: expiringSoon })}
              </div>
            )}
          </div>
        </ResizableRightPanel>
      </div>

      <ConfirmModal
        isOpen={confirmEmpty}
        onClose={() => setConfirmEmpty(false)}
        title={t('trash.confirmEmptyTitle')}
        confirmLabel={t('trash.confirmEmptyLabel')}
        onConfirm={handleEmptyAll}
        danger
      >
        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          {t('trash.emptyBody', { n: items.length })}<br />
          {t('trash.irreversible')}
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={t('trash.confirmDeleteTitle')}
        confirmLabel={t('trash.confirmDeleteLabel')}
        onConfirm={confirmPermanentDelete}
        danger
      >
        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          {t('trash.deleteBody', { title: confirmDelete?.title ?? '' })}{' '}
          {t('trash.irreversible')}
        </p>
      </ConfirmModal>
    </div>
  )
}
