import { MONTH_SHORT, HOURS, MINUTES, getDaysInMonth } from './calendarUtils'

interface Props {
  value: Date
  onChange: (date: Date) => void
}

export default function DateTimePicker({ value, onChange }: Props) {
  function upd(part: 'year' | 'month' | 'day' | 'hour' | 'minute', val: number) {
    const d = new Date(value)
    if (part === 'year')   { d.setFullYear(val); if (d.getMonth()  !== value.getMonth())  d.setDate(0) }
    if (part === 'month')  { d.setMonth(val);    if (d.getDate()   !== value.getDate())   d.setDate(0) }
    if (part === 'day')    d.setDate(val)
    if (part === 'hour')   d.setHours(val)
    if (part === 'minute') d.setMinutes(val)
    onChange(d)
  }

  const y = value.getFullYear(), mo = value.getMonth()
  const dy = value.getDate(), h = value.getHours(), mi = value.getMinutes()
  const maxDay = getDaysInMonth(y, mo)
  const now = new Date()
  const sel = 'text-[11px] border rounded px-1 py-0.5 outline-none'
  const bdr = { borderColor: 'var(--color-border-2)' }

  return (
    <div className="flex items-center gap-1 flex-wrap justify-end">
      <select value={mo} onChange={e => upd('month', +e.target.value)} className={sel} style={bdr}>
        {MONTH_SHORT.map((m, i) => <option key={i} value={i}>{m}</option>)}
      </select>
      <select value={dy} onChange={e => upd('day', +e.target.value)} className={sel} style={bdr}>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <select value={y} onChange={e => upd('year', +e.target.value)} className={sel} style={bdr}>
        {[0, 1, 2].map(i => { const yr = now.getFullYear() + i; return <option key={yr} value={yr}>{yr}</option> })}
      </select>
      <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>at</span>
      <select value={h} onChange={e => upd('hour', +e.target.value)} className={sel} style={bdr}>
        {HOURS.map(n => <option key={n} value={n}>{String(n).padStart(2, '0')}</option>)}
      </select>
      <span className="text-[11px]">:</span>
      <select value={mi} onChange={e => upd('minute', +e.target.value)} className={sel} style={bdr}>
        {MINUTES.map(n => <option key={n} value={n}>{String(n).padStart(2, '0')}</option>)}
      </select>
    </div>
  )
}
