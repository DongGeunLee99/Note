import { isSameDay } from 'date-fns'
import { useLang, type Language } from '@/i18n'
import { MONTH_FULL, toDateKey } from './calendarUtils'

const MINI_WEEKDAYS: Record<Language, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}

interface Props {
  year: number
  month: number
  selected: Date
  today: Date
  eventDates: Set<string>
  onSelect: (date: Date) => void
  onNavigate: (date: Date) => void
}

export default function MiniCalendar({ year, month, selected, today, eventDates, onSelect, onNavigate }: Props) {
  const lang = useLang()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMo = new Date(year, month + 1, 0).getDate()
  const cells    = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMo }, (_, i) => i + 1)]
  const monthTitle: Record<Language, string> = {
    ko: `${year}년 ${month + 1}월`,
    ja: `${year}年${month + 1}月`,
    en: `${MONTH_FULL[month]} ${year}`,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onNavigate(new Date(year, month - 1, 1))}
          className="text-[11px] px-1 rounded hover:opacity-60" style={{ color: 'var(--color-muted)' }}>‹</button>
        <p className="text-[10px] font-semibold">{monthTitle[lang]}</p>
        <button onClick={() => onNavigate(new Date(year, month + 1, 1))}
          className="text-[11px] px-1 rounded hover:opacity-60" style={{ color: 'var(--color-muted)' }}>›</button>
      </div>

      <div className="grid grid-cols-7 mb-0.5">
        {MINI_WEEKDAYS[lang].map((d, i) => (
          <div key={i} className="text-center text-[8px] font-semibold py-0.5" style={{ color: 'var(--color-muted)' }}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const date   = new Date(year, month, day)
          const isToday = isSameDay(date, today)
          const isSel   = isSameDay(date, selected)
          const hasEvt  = eventDates.has(toDateKey(date))
          return (
            <button key={i} onClick={() => onSelect(date)} className="flex flex-col items-center py-0.5">
              <span className="text-[9px] w-5 h-5 flex items-center justify-center rounded-full transition-colors"
                style={{
                  background: isSel ? 'var(--color-primary)' : undefined,
                  color:      isSel ? '#fff' : isToday ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isToday || isSel ? 700 : 400,
                  boxShadow:  isToday && !isSel ? 'inset 0 0 0 1.5px var(--color-primary)' : undefined,
                }}>
                {day}
              </span>
              {hasEvt && (
                <span className="w-1 h-1 rounded-full"
                  style={{ background: isSel ? '#fff' : 'var(--color-primary)', opacity: isSel ? 0.7 : 1 }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
