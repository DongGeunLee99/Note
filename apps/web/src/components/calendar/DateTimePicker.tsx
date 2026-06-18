import { useTranslation } from 'react-i18next'
import { useLang, type Language } from '@/i18n'
import Select from '@/components/common/Select'
import { MONTH_SHORT, HOURS, MINUTES, getDaysInMonth } from './calendarUtils'

const MONTH_LABEL: Record<Language, (i: number) => string> = {
  ko: i => `${i + 1}월`,
  ja: i => `${i + 1}月`,
  en: i => MONTH_SHORT[i],
}
const DAY_LABEL: Record<Language, (n: number) => string> = {
  ko: n => `${n}일`,
  ja: n => `${n}日`,
  en: n => String(n),
}

interface Props {
  value: Date
  onChange: (date: Date) => void
}

export default function DateTimePicker({ value, onChange }: Props) {
  const { t } = useTranslation()
  const lang = useLang()

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

  return (
    <div className="flex items-center gap-1 flex-wrap justify-end">
      <Select value={y} onChange={v => upd('year', v)} className={sel}
        options={[0, 1, 2].map(i => { const yr = now.getFullYear() + i; return { value: yr, label: yr } })} />
      <Select value={mo} onChange={v => upd('month', v)} className={sel}
        options={MONTH_SHORT.map((_, i) => ({ value: i, label: MONTH_LABEL[lang](i) }))} />
      <Select value={dy} onChange={v => upd('day', v)} className={sel}
        options={Array.from({ length: maxDay }, (_, i) => i + 1).map(n => ({ value: n, label: DAY_LABEL[lang](n) }))} />
      <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{t('calendar.at')}</span>
      <Select value={h} onChange={v => upd('hour', v)} className={sel}
        options={HOURS.map(n => ({ value: n, label: String(n).padStart(2, '0') }))} />
      <span className="text-[11px]">:</span>
      <Select value={mi} onChange={v => upd('minute', v)} className={sel}
        options={MINUTES.map(n => ({ value: n, label: String(n).padStart(2, '0') }))} />
    </div>
  )
}
