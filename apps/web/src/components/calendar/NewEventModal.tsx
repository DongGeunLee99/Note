import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import ToggleSwitch from '@/components/common/ToggleSwitch'
import DateTimePicker from './DateTimePicker'
import type { CalendarEventData } from './types'
import { EVENT_COLORS, ALARM_BEFORE } from './calendarUtils'
import { useTranslation } from 'react-i18next'

interface Props {
  isOpen: boolean
  initialStart: Date
  initialEnd: Date
  onClose: () => void
  onSave: (event: Omit<CalendarEventData, 'id'>) => void
}

export default function NewEventModal({ isOpen, initialStart, initialEnd, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [title,        setTitle]        = useState('')
  const [start,        setStart]        = useState<Date>(initialStart)
  const [end,          setEnd]          = useState<Date>(initialEnd)
  const [color,        setColor]        = useState(EVENT_COLORS[0])
  const [hasAlarm,     setHasAlarm]     = useState(false)
  const [alarmMinutes, setAlarmMinutes] = useState(15)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setStart(initialStart)
      setEnd(initialEnd)
      setColor(EVENT_COLORS[0])
      setHasAlarm(false)
      setAlarmMinutes(15)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    if (!title.trim()) return
    onSave({ title: title.trim(), start, end, color, hasAlarm, alarmMinutesBefore: alarmMinutes })
  }

  function handleStartChange(d: Date) {
    setStart(d)
    if (end <= d) setEnd(new Date(d.getTime() + 3600000))
  }

  const row = 'flex items-center justify-between py-2 border-b text-[11px]'
  const bdr = { borderColor: 'var(--color-border)' }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('calendar.modalTitle')}
      footer={
        <>
          <button onClick={onClose} className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}>{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}>{t('common.save')}</button>
        </>
      }
    >
      <div className="flex flex-col">
        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldTitle')}</span>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder={t('calendar.eventNamePlaceholder')} maxLength={40} autoFocus
            className="text-right text-[11px] outline-none bg-transparent w-44" />
        </div>

        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldColor')}</span>
          <div className="flex gap-1.5">
            {EVENT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-4 h-4 rounded-full transition-transform"
                style={{
                  background:    c,
                  outline:       color === c ? `2px solid ${c}` : undefined,
                  outlineOffset: '2px',
                  transform:     color === c ? 'scale(1.2)' : 'none',
                }} />
            ))}
          </div>
        </div>

        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldStart')}</span>
          <DateTimePicker value={start} onChange={handleStartChange} />
        </div>

        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldEnd')}</span>
          <DateTimePicker value={end} onChange={d => { if (d > start) setEnd(d) }} />
        </div>

        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldAlarm')}</span>
          <ToggleSwitch enabled={hasAlarm} onToggle={() => setHasAlarm(v => !v)} size="sm" />
        </div>

        {hasAlarm && (
          <div className="flex items-center justify-between py-2 text-[11px]">
            <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldNotify')}</span>
            <select value={alarmMinutes} onChange={e => setAlarmMinutes(+e.target.value)}
              className="text-[11px] border rounded px-2 py-0.5 outline-none"
              style={{ borderColor: 'var(--color-border-2)' }}>
              {ALARM_BEFORE.map(o => <option key={o.value} value={o.value}>{t(`calendar.alarmBefore.${o.value}`)}</option>)}
            </select>
          </div>
        )}
      </div>
    </Modal>
  )
}
