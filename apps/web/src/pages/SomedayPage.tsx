import { useState } from 'react'
import { IconPlane, IconBook, IconShoppingCart, IconStar, IconTrash, IconPlus } from '@tabler/icons-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import ContextMenu, { useContextMenu } from '../components/common/ContextMenu'
import { useToast } from '../contexts/ToastContext'

type SomedayCategory = '여행' | '배움' | '구매' | '기타'

interface SomedayItem {
  id: string
  title: string
  category: SomedayCategory
  isFavorite: boolean
}

const CATEGORY_ICONS: Record<SomedayCategory, { icon: React.ReactNode; bg: string; color: string }> = {
  '여행': { icon: <IconPlane size={14} />, bg: '#E6F1FB', color: '#185FA5' },
  '배움': { icon: <IconBook size={14} />, bg: '#EEEDFE', color: '#3C3489' },
  '구매': { icon: <IconShoppingCart size={14} />, bg: '#FAEEDA', color: '#633806' },
  '기타': { icon: <IconStar size={14} />, bg: '#F1EFE8', color: '#444441' },
}

const BADGE_MAP: Record<SomedayCategory, 'blue' | 'violet' | 'amber' | 'gray'> = {
  '여행': 'blue', '배움': 'violet', '구매': 'amber', '기타': 'gray',
}

const CATEGORIES: SomedayCategory[] = ['여행', '배움', '구매', '기타']

let nextId = 10

const INITIAL: SomedayItem[] = [
  { id: '1', title: '일본 교토 여행', category: '여행', isFavorite: true },
  { id: '2', title: 'TypeScript 심화 강의 듣기', category: '배움', isFavorite: false },
  { id: '3', title: '스탠딩 데스크 구입', category: '구매', isFavorite: true },
  { id: '4', title: '주말 캠핑 계획', category: '여행', isFavorite: false },
]

export default function SomedayPage() {
  const toast = useToast()
  const [items, setItems] = useState<SomedayItem[]>(INITIAL)
  const [modalOpen, setModalOpen] = useState(false)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SomedayCategory>('기타')
  const [isFavorite, setIsFavorite] = useState(false)

  function handleAdd() {
    if (!title.trim()) return
    setItems(prev => [...prev, { id: String(++nextId), title: title.trim(), category, isFavorite }])
    toast('항목이 추가되었습니다', 'success')
    setTitle('')
    setCategory('기타')
    setIsFavorite(false)
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    toast('항목이 삭제되었습니다', 'info')
  }

  function toggleFavorite(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">언젠가 리스트</span>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + 추가
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex flex-col gap-2 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
          onContextMenu={openMenu}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
              <span className="text-3xl">⭐</span>
              <p className="text-[12px] font-medium">언젠가 리스트가 비어있습니다</p>
            </div>
          ) : (
            items.map(item => {
              const cat = CATEGORY_ICONS[item.category]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 group"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cat.bg, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <span className="flex-1 text-[11px] font-medium">{item.title}</span>
                  <button onClick={() => toggleFavorite(item.id)} className="flex-shrink-0">
                    <IconStar size={13} style={{ color: '#633806', fill: item.isFavorite ? '#633806' : 'none', flexShrink: 0 }} />
                  </button>
                  <Badge variant={BADGE_MAP[item.category]}>{item.category}</Badge>
                  <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0">
                    <IconTrash size={11} style={{ color: '#791F1F' }} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-2 overflow-auto">
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>카테고리</p>
          {CATEGORIES.map(name => {
            const { color } = CATEGORY_ICONS[name]
            const count = items.filter(i => i.category === name).length
            return (
              <div key={name} className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="flex-1">{name}</span>
                <span style={{ color: 'var(--color-muted)' }}>{count}</span>
              </div>
            )
          })}
          <div className="h-px mt-1" style={{ background: 'var(--color-border)' }} />
          <div className="flex items-center gap-2 text-[11px]">
            <IconStar size={11} style={{ color: '#633806', fill: '#633806' }} />
            <span className="flex-1">즐겨찾기</span>
            <span style={{ color: 'var(--color-muted)' }}>{items.filter(i => i.isFavorite).length}</span>
          </div>
        </div>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={closeMenu}
          items={[
            { label: '항목 추가', icon: <IconPlus size={12} />, onClick: () => setModalOpen(true) },
          ]}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="언젠가 추가"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="text-[10px] px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}>취소</button>
            <button onClick={handleAdd} disabled={!title.trim()} className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40" style={{ background: 'var(--color-primary)' }}>추가</button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>제목</span>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="언젠가 하고 싶은 것" autoFocus maxLength={40} className="text-right text-[11px] outline-none bg-transparent w-40" />
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>카테고리</p>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="text-[10px] px-2.5 py-1 rounded-full border transition-colors"
                  style={category === cat
                    ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                    : { color: 'var(--color-muted)', borderColor: 'var(--color-border-2)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>즐겨찾기</span>
            <button onClick={() => setIsFavorite(f => !f)}>
              <IconStar size={16} style={{ color: '#633806', fill: isFavorite ? '#633806' : 'none' }} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
