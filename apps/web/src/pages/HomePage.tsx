import { useState, useRef } from 'react'
import { IconEdit, IconMicrophone, IconCalendar, IconBriefcase, IconBell, IconNote, IconClock, IconStar } from '@tabler/icons-react'
import Badge from '../components/common/Badge'
import { useToast } from '../contexts/ToastContext'

type Category = 'AI' | '일정' | '알람' | '할일' | '메모' | '나중에' | '언젠가'
type ClassifiedCategory = Exclude<Category, 'AI'>

function classifyWithAI(text: string): ClassifiedCategory {
  const t = text
  if (/내일|모레|오전|오후|\d+시|\d+월|\d+일|예약|회의|약속|일정/.test(t)) return '일정'
  if (/알람|기상|일어나|깨워|울려/.test(t)) return '알람'
  if (/해야|할일|준비|마감|작성|처리/.test(t)) return '할일'
  if (/나중에|이따|나중에/.test(t)) return '나중에'
  if (/언젠가|꿈|버킷|여행|배우고|사고 싶/.test(t)) return '언젠가'
  return '메모'
}

const CATEGORY_CONFIG: Record<Category, { icon: React.ReactNode; bg: string; badge: 'blue' | 'amber' | 'gray' | 'violet' | 'green' | 'red' }> = {
  'AI':  { icon: <IconCalendar size={13} style={{ color: '#185FA5' }} />,  bg: '#E6F1FB', badge: 'blue' },
  '일정':  { icon: <IconCalendar size={13} style={{ color: '#185FA5' }} />,  bg: '#E6F1FB', badge: 'blue' },
  '알람':  { icon: <IconBell size={13} style={{ color: '#185FA5' }} />,      bg: '#E6F1FB', badge: 'blue' },
  '할일':  { icon: <IconBriefcase size={13} style={{ color: '#854F0B' }} />, bg: '#FAEEDA', badge: 'amber' },
  '메모':  { icon: <IconNote size={13} style={{ color: '#444441' }} />,      bg: '#F1EFE8', badge: 'gray' },
  '나중에': { icon: <IconClock size={13} style={{ color: '#3C3489' }} />,   bg: '#EEEDFE', badge: 'violet' },
  '언젠가': { icon: <IconStar size={13} style={{ color: '#27500A' }} />,    bg: '#EAF3DE', badge: 'green' },
}

interface RecentEntry {
  id: number
  text: string
  category: ClassifiedCategory
  createdAt: Date
}

let nextEntryId = 10

const INITIAL_ENTRIES: RecentEntry[] = [
  { id: 1, text: '내일 9시 병원 예약', category: '일정', createdAt: new Date(Date.now() - 1000 * 60 * 25) },
  { id: 2, text: '회사 프로젝트 회의 준비', category: '할일', createdAt: new Date(Date.now() - 1000 * 60 * 75) },
  { id: 3, text: '아이디어 — 주말에 블로그 포스팅', category: '메모', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25) },
]

function formatRelTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diff < 1) return '방금 전'
  if (diff < 60) return `${diff}분 전`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export default function HomePage() {
  const toast = useToast()
  const [text, setText] = useState('')
  const [category, setCategory] = useState<Category>('AI')
  const [entries, setEntries] = useState<RecentEntry[]>(INITIAL_ENTRIES)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputAreaRef = useRef<HTMLDivElement>(null)

  function handleSave() {
    if (!text.trim()) return
    const savedCategory: ClassifiedCategory = category === 'AI'
      ? classifyWithAI(text.trim())
      : category
    setEntries(prev => [{ id: ++nextEntryId, text: text.trim(), category: savedCategory, createdAt: new Date() }, ...prev])
    if (category === 'AI') {
      toast(`AI가 '${savedCategory}'으로 분류했습니다`, 'success')
    } else {
      toast(`${savedCategory}으로 저장되었습니다`, 'success')
    }
    setText('')
    inputRef.current?.focus()
  }

  const todayEntries = entries.filter(e => {
    const d = new Date(e.createdAt); const n = new Date()
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  })

  const countByCategory = (cat: Category) => entries.filter(e => e.category === cat).length

  return (
    <div className="flex flex-col h-full">


      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex flex-col gap-2.5 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            ref={inputAreaRef}
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
                style={{ color: '#1a1a18' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="text-[9px] px-2 py-0.5 rounded-full border transition-colors"
                    style={
                      category === cat
                        ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                        : { color: 'var(--color-muted)', borderColor: 'var(--color-border-2)' }
                    }
                  >
                    {cat}
                  </button>
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

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          <p className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>
            최근 기록 ({entries.length})
          </p>

          {entries.slice(0, 20).map(entry => {
            const cfg = CATEGORY_CONFIG[entry.category]
            return (
              <div
                key={entry.id}
                className="flex items-center gap-2 py-1.5 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">{entry.text}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                    {formatRelTime(entry.createdAt)}
                  </p>
                </div>
                <Badge variant={cfg.badge}>{entry.category}</Badge>
              </div>
            )
          })}
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-3 overflow-auto">
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
            오늘 기록
          </p>
          <div className="flex gap-1.5">
            {[
              { n: todayEntries.length, l: '전체' },
              { n: countByCategory('할일'), l: '할일' },
              { n: countByCategory('메모'), l: '메모' },
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

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
            다음 알람
          </p>
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ background: 'var(--color-primary-subtle)' }}
          >
            <IconBell size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-primary-emphasis)' }}>오전 7:30</p>
              <p className="text-[9px]" style={{ color: 'var(--color-primary)' }}>기상 · 직장</p>
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
            카테고리별
          </p>
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
            const count = countByCategory(cat)
            if (count === 0) return null
            return (
              <div key={cat} className="flex items-center justify-between text-[10px]">
                <span style={{ color: 'var(--color-muted)' }}>{cat}</span>
                <Badge variant={CATEGORY_CONFIG[cat].badge}>{count}</Badge>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
