import { useState, useRef } from 'react'
import { IconEdit } from '@tabler/icons-react'
import PillButton from '@/components/common/PillButton'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useHomeStore, type HomeCategory } from '@/stores/useHomeStore'
import { HOME_CATEGORIES } from './categoryConfig'

export default function QuickInput() {
  const toast = useToast()
  const { t } = useTranslation()
  const addEntry = useHomeStore(s => s.addEntry)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<HomeCategory>('AI')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleSave() {
    if (!text.trim()) return
    const saved = addEntry(text.trim(), category)
    if (category === 'AI') {
      toast(t('home.aiClassified', { cat: t(`category.${saved}`) }), 'success')
    } else {
      toast(t('home.savedAs', { cat: t(`category.${saved}`) }), 'success')
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
          placeholder={t('home.quickPlaceholder')}
          rows={2}
          className="flex-1 text-[calc(11px*var(--fs))] outline-none bg-transparent resize-none leading-relaxed"
          style={{ color: 'var(--color-text)' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {HOME_CATEGORIES.map(cat => (
            <PillButton key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {t(`category.${cat}`)}
            </PillButton>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="text-[calc(10px*var(--fs))] px-2.5 py-1 rounded-lg text-white flex-shrink-0 disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  )
}
