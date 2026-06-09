import { useState, useRef } from 'react'
import { IconEdit } from '@tabler/icons-react'
import PillButton from '../common/PillButton'
import { useToast } from '../../contexts/ToastContext'
import { useHomeStore, type HomeCategory } from '../../stores/useHomeStore'
import { HOME_CATEGORIES } from './categoryConfig'

export default function QuickInput() {
  const toast = useToast()
  const addEntry = useHomeStore(s => s.addEntry)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<HomeCategory>('AI')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleSave() {
    if (!text.trim()) return
    const saved = addEntry(text.trim(), category)
    if (category === 'AI') {
      toast(`AI가 '${saved}'으로 분류했습니다`, 'success')
    } else {
      toast(`${saved}으로 저장되었습니다`, 'success')
    }
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div
      className="rounded-xl border p-3 transition-colors"
      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)' }}
    >
      <div className="flex items-start gap-2 mb-2">
        <IconEdit size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() } }}
          placeholder="생각나는 모든 것을 입력해 보세요…"
          rows={2}
          className="flex-1 text-[11px] outline-none bg-transparent resize-none leading-relaxed"
          style={{ color: 'var(--color-text)' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {HOME_CATEGORIES.map(cat => (
            <PillButton key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {cat}
            </PillButton>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="text-[10px] px-2.5 py-1 rounded-lg text-white flex-shrink-0 disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}
        >
          저장
        </button>
      </div>
    </div>
  )
}
