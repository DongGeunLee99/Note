import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import ToggleSwitch from '@/components/common/ToggleSwitch'
import DateTimePicker from './DateTimePicker'
import type { CalendarEventData } from './types'
import { IconSparkles } from '@tabler/icons-react'
import { EVENT_COLORS, ALARM_BEFORE, resolveEventColor } from './calendarUtils'
import { useTranslation } from 'react-i18next'

interface Props {
  isOpen: boolean
  initialStart: Date
  initialEnd: Date
  /** 주간 다중일 드래그 시 선택된 날짜 수 (>1이면 각 날짜에 생성) */
  multiDayCount?: number
  /** 편집 모드: 기존 일정 값 (날짜 외 필드 prefill). 없으면 신규 작성 */
  initial?: { title: string; description: string; color: string; hasAlarm: boolean; alarmMinutesBefore: number } | null
  onClose: () => void
  onSave: (event: Omit<CalendarEventData, 'id'>) => void
  onDelete?: () => void
}

export default function NewEventModal({ isOpen, initialStart, initialEnd, multiDayCount = 1, initial, onClose, onSave, onDelete }: Props) {
  const { t } = useTranslation()
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [start,        setStart]        = useState<Date>(initialStart)
  const [end,          setEnd]          = useState<Date>(initialEnd)
  const [color,        setColor]        = useState(EVENT_COLORS[0])
  const [hasAlarm,     setHasAlarm]     = useState(false)
  const [alarmMinutes, setAlarmMinutes] = useState(15)

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title ?? '')
      setDescription(initial?.description ?? '')
      setStart(initialStart)
      setEnd(initialEnd)
      setColor(initial?.color ?? EVENT_COLORS[0])
      setHasAlarm(initial?.hasAlarm ?? false)
      setAlarmMinutes(initial?.alarmMinutesBefore ?? 15)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    if (!title.trim()) return
    onSave({ title: title.trim(), description: description.trim(), start, end, color, hasAlarm, alarmMinutesBefore: alarmMinutes })
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
      title={initial ? t('calendar.modalEdit') : t('calendar.modalTitle')}
      widthClass="w-[360px]"
      footer={
        <>
          {initial && onDelete && (
            <button onClick={onDelete} className="text-[10px] px-3 py-1.5 rounded-lg border mr-auto"
              style={{ borderColor: 'var(--color-danger-border)', color: 'var(--color-danger)' }}>{t('common.delete')}</button>
          )}
          <button onClick={onClose} className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}>{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}>{t('common.save')}</button>
        </>
      }
    >
      <div className="flex flex-col">
        {multiDayCount > 1 && (
          <div className="mb-2 px-2 py-1.5 rounded-lg text-[10px]" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            {t('calendar.multiDayNote', { n: multiDayCount })}
          </div>
        )}
        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldTitle')}</span>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder={t('calendar.eventNamePlaceholder')} maxLength={40} autoFocus
            className="text-right text-[11px] outline-none bg-transparent w-44" />
        </div>

        <div className="flex flex-col gap-1 py-2 border-b text-[11px]" style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldDescription')}</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder={t('calendar.descPlaceholder')} rows={3} maxLength={500}
            className="text-[11px] leading-relaxed outline-none resize-none bg-transparent"
            style={{ color: 'var(--color-text)' }} />
        </div>

        <div className={row} style={bdr}>
          <span style={{ color: 'var(--color-muted)' }}>{t('calendar.fieldColor')}</span>
          <div className="flex gap-1.5">
            {EVENT_COLORS.map(c => {
              const isTheme = c === 'theme'
              const display = resolveEventColor(c)
              return (
                <button key={c} onClick={() => setColor(c)}
                  className="w-4 h-4 rounded-full transition-transform flex items-center justify-center"
                  style={{
                    background:    display,
                    outline:       color === c ? `2px solid ${display}` : undefined,
                    outlineOffset: '2px',
                    transform:     color === c ? 'scale(1.2)' : 'none',
                  }}>
                  {isTheme && <IconSparkles size={9} color="#fff" />}
                </button>
              )
            })}
          </div>
        </div>

        {color === 'theme' && (
          <div className="flex items-center gap-1.5 my-1.5 px-2 py-1.5 rounded-lg text-[9px]"
            style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <IconSparkles size={11} style={{ flexShrink: 0 }} />
            <span>{t('common.themeColorHint')}</span>
          </div>
        )}

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
