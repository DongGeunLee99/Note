import { useState } from 'react'
import { IconBell, IconCheck, IconTrash, IconPlus } from '@tabler/icons-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import ContextMenu, { useContextMenu } from '../components/common/ContextMenu'
import { useToast } from '../contexts/ToastContext'

interface LaterItem {
  id: string
  text: string
  notifyAt: string
  isCompleted: boolean
}

let nextId = 10

const INITIAL: LaterItem[] = [
  { id: '1', text: '병원 예약 다시 확인하기', notifyAt: '오늘 오후 3:00', isCompleted: false },
  { id: '2', text: '프로젝트 제안서 이메일 보내기', notifyAt: '내일 오전 9:00', isCompleted: false },
  { id: '3', text: '도서관 책 반납', notifyAt: '이번 주 금요일', isCompleted: true },
]

export default function LaterPage() {
  const toast = useToast()
  const [items, setItems] = useState<LaterItem[]>(INITIAL)
  const [modalOpen, setModalOpen] = useState(false)
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const [text, setText] = useState('')
  const [notifyAt, setNotifyAt] = useState('')

  function handleAdd() {
    if (!text.trim()) return
    setItems(prev => [{ id: String(++nextId), text: text.trim(), notifyAt: notifyAt.trim() || '미정', isCompleted: false }, ...prev])
    toast('항목이 추가되었습니다', 'success')
    setText('')
    setNotifyAt('')
    setModalOpen(false)
  }

  function handleComplete(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i))
  }

  function handleDelete(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    toast('항목이 삭제되었습니다', 'info')
  }

  const pending = items.filter(i => !i.isCompleted).length
  const done = items.filter(i => i.isCompleted).length

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">나중에 알려줘</span>
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
          className="flex-1 flex flex-col p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
          onContextMenu={openMenu}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
              <span className="text-3xl">🔔</span>
              <p className="text-[12px] font-medium">항목이 없습니다</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-2 py-2 border-b group ${item.isCompleted ? 'opacity-40' : ''}`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => handleComplete(item.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: item.isCompleted ? '#EAF3DE' : '#EEEDFE' }}
                >
                  {item.isCompleted
                    ? <IconCheck size={13} style={{ color: '#27500A' }} />
                    : <IconBell size={13} style={{ color: '#3C3489' }} />}
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
                  <IconTrash size={11} style={{ color: '#791F1F' }} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-2 overflow-auto">
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>요약</p>
          <div className="flex gap-1.5">
            {[{ n: pending, l: '대기 중' }, { n: done, l: '완료' }].map(s => (
              <div key={s.l} className="flex-1 flex flex-col items-center py-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
                <span className="text-[16px] font-medium">{s.n}</span>
                <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{s.l}</span>
              </div>
            ))}
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
        title="나중에 알려줘 추가"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="text-[10px] px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}>취소</button>
            <button onClick={handleAdd} disabled={!text.trim()} className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40" style={{ background: 'var(--color-primary)' }}>추가</button>
          </>
        }
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
      </Modal>
    </div>
  )
}
