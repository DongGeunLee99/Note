import { useState } from 'react'
import { IconPlane, IconBook, IconShoppingCart, IconStar, IconTrash, IconPlus } from '@tabler/icons-react'
import Badge from '@/components/common/Badge'
import ConfirmModal from '@/components/common/ConfirmModal'
import ContextMenu, { useContextMenu } from '@/components/common/ContextMenu'
import PageHeader from '@/components/common/PageHeader'
import SectionLabel from '@/components/common/SectionLabel'
import Divider from '@/components/common/Divider'
import PillButton from '@/components/common/PillButton'
import EmptyState from '@/components/common/EmptyState'
import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useSomedayStore } from '@/stores/useSomedayStore'
import type { SomedayCategory } from '@/types/localItems'
import { TONES, type Tone } from '@/theme/tones'

const CATEGORY_TONES: Record<SomedayCategory, Tone> = {
  '여행': 'blue', '배움': 'violet', '구매': 'amber', '기타': 'gray',
}

const CATEGORY_ICONS: Record<SomedayCategory, React.ReactNode> = {
  '여행': <IconPlane size={14} />,
  '배움': <IconBook size={14} />,
  '구매': <IconShoppingCart size={14} />,
  '기타': <IconStar size={14} />,
}

const CATEGORIES: SomedayCategory[] = ['여행', '배움', '구매', '기타']

const FAVORITE_COLOR = TONES.amber.text

export default function SomedayPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const items = useSomedayStore(s => s.items)
  const { addItem, deleteItem, toggleFavorite } = useSomedayStore.getState()
  const [modalOpen, setModalOpen] = useState(false)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SomedayCategory>('기타')
  const [isFavorite, setIsFavorite] = useState(false)

  function handleAdd() {
    if (!title.trim()) return
    addItem(title.trim(), category, isFavorite)
    toast(t('someday.toastAdded'), 'success')
    setTitle('')
    setCategory('기타')
    setIsFavorite(false)
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    deleteItem(id)
    toast(t('someday.toastDeleted'), 'info')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('someday.pageTitle')}>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('someday.add')}
        </button>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex flex-col gap-2 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
          onContextMenu={openMenu}
        >
          {items.length === 0 ? (
            <EmptyState emoji="⭐" title={t('someday.emptyTitle')} />
          ) : (
            items.map(item => {
              const tone = TONES[CATEGORY_TONES[item.category]]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 group"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tone.bg, color: tone.fg }}>
                    {CATEGORY_ICONS[item.category]}
                  </div>
                  <span className="flex-1 text-[11px] font-medium">{item.title}</span>
                  <button onClick={() => toggleFavorite(item.id)} className="flex-shrink-0">
                    <IconStar size={13} style={{ color: FAVORITE_COLOR, fill: item.isFavorite ? FAVORITE_COLOR : 'none', flexShrink: 0 }} />
                  </button>
                  <Badge variant={CATEGORY_TONES[item.category]}>{t(`someday.categoryNames.${item.category}`)}</Badge>
                  <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0">
                    <IconTrash size={11} style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-2 h-full">
            <SectionLabel>{t('someday.fieldCategory')}</SectionLabel>
            {CATEGORIES.map(name => {
              const count = items.filter(i => i.category === name).length
              return (
                <div key={name} className="flex items-center gap-2 text-[11px]">
                  <div className="w-2 h-2 rounded-full" style={{ background: TONES[CATEGORY_TONES[name]].fg }} />
                  <span className="flex-1">{t(`someday.categoryNames.${name}`)}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{count}</span>
                </div>
              )
            })}
            <Divider className="mt-1" />
            <div className="flex items-center gap-2 text-[11px]">
              <IconStar size={11} style={{ color: FAVORITE_COLOR, fill: FAVORITE_COLOR }} />
              <span className="flex-1">{t('someday.favorite')}</span>
              <span style={{ color: 'var(--color-muted)' }}>{items.filter(i => i.isFavorite).length}</span>
            </div>
          </div>
        </ResizableRightPanel>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={closeMenu}
          items={[
            { label: t('someday.ctxNew'), icon: <IconPlus size={12} />, onClick: () => setModalOpen(true) },
          ]}
        />
      )}

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('someday.modalTitle')}
        confirmLabel={t('common.add')}
        onConfirm={handleAdd}
        confirmDisabled={!title.trim()}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>{t('someday.fieldTitle')}</span>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder={t('someday.titlePlaceholder')} autoFocus maxLength={40} className="text-right text-[11px] outline-none bg-transparent w-40" />
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>{t('someday.fieldCategory')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
                <PillButton key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                  {t(`someday.categoryNames.${cat}`)}
                </PillButton>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>{t('someday.favorite')}</span>
            <button onClick={() => setIsFavorite(f => !f)}>
              <IconStar size={16} style={{ color: FAVORITE_COLOR, fill: isFavorite ? FAVORITE_COLOR : 'none' }} />
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  )
}
