import { useState } from 'react'
import { IconBell, IconCheck, IconTrash, IconPlus } from '@tabler/icons-react'
import Badge from '../components/common/Badge'
import ConfirmModal from '../components/common/ConfirmModal'
import ContextMenu, { useContextMenu } from '../components/common/ContextMenu'
import PageHeader from '../components/common/PageHeader'
import SectionLabel from '../components/common/SectionLabel'
import StatCards from '../components/common/StatCards'
import EmptyState from '../components/common/EmptyState'
import ResizableRightPanel from '../components/common/ResizableRightPanel'
import { useToast } from '../contexts/ToastContext'
import { useLaterStore } from '../stores/useLaterStore'
import { TONES } from '../theme/tones'

export default function LaterPage() {
  const toast = useToast()
  const items = useLaterStore(s => s.items)
  const { addItem, toggleComplete, deleteItem } = useLaterStore.getState()
  const [modalOpen, setModalOpen] = useState(false)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [text, setText] = useState('')
  const [notifyAt, setNotifyAt] = useState('')

  function handleAdd() {
    if (!text.trim()) return
    addItem(text.trim(), notifyAt.trim())
    toast('항목이 추가되었습니다', 'success')
    setText('')
    setNotifyAt('')
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    deleteItem(id)
    toast('항목이 삭제되었습니다', 'info')
  }

  const pending = items.filter(i => !i.isCompleted).length
  const done = items.filter(i => i.isCompleted).length

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="나중에 알려줘">
        <button
          onClick={() => setModalOpen(true)}
          className="text-[10px] px-2.5 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + 추가
        </button>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex flex-col p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
          onContextMenu={openMenu}
        >
          {items.length === 0 ? (
            <EmptyState emoji="🔔" title="항목이 없습니다" />
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-2 py-2 border-b group ${item.isCompleted ? 'opacity-40' : ''}`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => toggleComplete(item.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: item.isCompleted ? TONES.green.bg : TONES.violet.bg }}
                >
                  {item.isCompleted
                    ? <IconCheck size={13} style={{ color: TONES.green.fg }} />
                    : <IconBell size={13} style={{ color: TONES.violet.fg }} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] ${item.isCompleted ? 'line-through' : 'font-medium'}`}>{item.text}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{item.notifyAt}</p>
                </div>
                <Badge variant={item.isCompleted ? 'green' : 'violet'}>
                  {item.isCompleted ? '완료' : '대기'}
                </Badge>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                >
                  <IconTrash size={11} style={{ color: 'var(--color-danger)' }} />
                </button>
              </div>
            ))
          )}
        </div>

        <ResizableRightPanel>
          <div className="p-3 flex flex-col gap-2 h-full">
            <SectionLabel>요약</SectionLabel>
            <StatCards items={[{ value: pending, label: '대기 중' }, { value: done, label: '완료' }]} />
          </div>
        </ResizableRightPanel>
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

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="나중에 알려줘 추가"
        confirmLabel="추가"
        onConfirm={handleAdd}
        confirmDisabled={!text.trim()}
      >
        <div className="flex flex-col gap-0">
          {[
            { label: '내용', content: <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="무엇을 알려드릴까요?" autoFocus maxLength={50} className="text-right text-[11px] outline-none bg-transparent w-40" /> },
            { label: '알림 시간', content: <input type="text" value={notifyAt} onChange={e => setNotifyAt(e.target.value)} placeholder="오늘 오후 3시" className="text-right text-[11px] outline-none bg-transparent w-40" style={{ color: 'var(--color-muted)' }} /> },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
              <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
              {row.content}
            </div>
          ))}
        </div>
      </ConfirmModal>
    </div>
  )
}
