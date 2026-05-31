import { useState, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/calendar.css'
import { IconBell, IconBriefcase, IconPlus, IconTrash } from '@tabler/icons-react'
import ToggleSwitch from '../components/common/ToggleSwitch'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { useToast } from '../contexts/ToastContext'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales: { ko },
})

const RBC_MESSAGES = {
  next: '›',
  previous: '‹',
  today: '오늘',
  month: '월',
  week: '주',
  day: '일',
  agenda: '목록',
  date: '날짜',
  time: '시간',
  event: '일정',
  noEventsInRange: '일정 없음',
  showMore: (total: number) => `+${total}개`,
}

interface CalendarAlarm { id: string; time: string; label: string }

interface AlarmEvent {
  id: string
  title: string
  start: Date
  end: Date
  isPreset: boolean
}

let nextAlarmId = 1

const PRESET_ALARMS: Record<number, { time: string; label: string }[]> = {
  5:  [{ time: '10:00', label: '병원 예약' }],
  10: [{ time: '07:30', label: '기상' }, { time: '09:00', label: '출근 준비' }],
  15: [{ time: '14:00', label: '팀 미팅' }],
  22: [{ time: '07:30', label: '기상' }, { time: '18:30', label: '퇴근' }],
  28: [{ time: '11:00', label: '치과 예약' }],
}

function timeToDate(y: number, m: number, d: number, time: string): Date {
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m, d, h, min)
}

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

export default function CalendarPage() {
  const toast = useToast()
  const now = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(now)
  const [currentDate, setCurrentDate] = useState<Date>(now)
  const [customAlarms, setCustomAlarms] = useState<Record<string, CalendarAlarm[]>>({})
  const [addModal, setAddModal] = useState(false)
  const [formHour, setFormHour] = useState(9)
  const [formMinute, setFormMinute] = useState(0)
  const [formLabel, setFormLabel] = useState('')

  const [workDays, setWorkDays] = useState<Set<string>>(() => {
    const set = new Set<string>()
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    while (d.getMonth() === now.getMonth()) {
      const dow = d.getDay()
      if (dow >= 1 && dow <= 5) set.add(d.toDateString())
      d.setDate(d.getDate() + 1)
    }
    return set
  })

  function isWorkDay(date: Date) { return workDays.has(date.toDateString()) }

  function toggleWorkDay(date: Date) {
    const key = date.toDateString()
    setWorkDays(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
        toast(`${date.getMonth() + 1}/${date.getDate()} 비출근일로 변경`, 'info')
      } else {
        next.add(key)
        toast(`${date.getMonth() + 1}/${date.getDate()} 출근일로 변경`, 'success')
      }
      return next
    })
  }

  const presetEvents = useMemo<AlarmEvent[]>(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    return Object.entries(PRESET_ALARMS).flatMap(([day, alarms]) =>
      alarms.map((alarm, i) => {
        const start = timeToDate(y, m, Number(day), alarm.time)
        return {
          id: `preset-${day}-${i}`,
          title: alarm.label,
          start,
          end: new Date(start.getTime() + 30 * 60 * 1000),
          isPreset: true,
        }
      })
    )
  }, [currentDate])

  const customEvents = useMemo<AlarmEvent[]>(() => {
    return Object.entries(customAlarms).flatMap(([key, alarms]) =>
      alarms.map(alarm => {
        const [y, m, d] = key.split('-').map(Number)
        const start = timeToDate(y, m, d, alarm.time)
        return {
          id: alarm.id,
          title: alarm.label,
          start,
          end: new Date(start.getTime() + 30 * 60 * 1000),
          isPreset: false,
        }
      })
    )
  }, [customAlarms])

  const allEvents = useMemo(() => [...presetEvents, ...customEvents], [presetEvents, customEvents])

  const selectedDayEvents = useMemo(() =>
    allEvents
      .filter(e => isSameDay(e.start, selectedDate))
      .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [allEvents, selectedDate]
  )

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setSelectedDate(start)
  }, [])

  const handleSelectEvent = useCallback((event: AlarmEvent) => {
    setSelectedDate(event.start)
  }, [])

  function customAlarmKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  function handleAddAlarm() {
    if (!formLabel.trim()) return
    const time = `${String(formHour).padStart(2, '0')}:${String(formMinute).padStart(2, '0')}`
    const key = customAlarmKey(selectedDate)
    const newAlarm: CalendarAlarm = { id: `ca${nextAlarmId++}`, time, label: formLabel.trim() }
    setCustomAlarms(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []), newAlarm].sort((a, b) => a.time.localeCompare(b.time)),
    }))
    toast(`${selectedDate.getMonth() + 1}/${selectedDate.getDate()} ${time} 알람 추가됨`, 'success')
    setFormLabel('')
    setAddModal(false)
  }

  function handleDeleteAlarm(alarmId: string) {
    const key = customAlarmKey(selectedDate)
    setCustomAlarms(prev => ({
      ...prev,
      [key]: (prev[key] ?? []).filter(a => a.id !== alarmId),
    }))
    toast('알람이 삭제되었습니다', 'info')
  }

  const y = currentDate.getFullYear()
  const m = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(y, m)
  const workDayCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => workDays.has(new Date(y, m, d).toDateString())).length
  const alarmDayCount = new Set(
    allEvents
      .filter(e => e.start.getFullYear() === y && e.start.getMonth() === m)
      .map(e => e.start.getDate())
  ).size

  const eventPropGetter = useCallback(() => ({
    style: {
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-primary)',
      fontSize: '9px',
    },
  }), [])

  const dayPropGetter = useCallback((date: Date) => {
    if (isSameDay(date, selectedDate)) {
      return { className: 'rbc-selected-cell' }
    }
    if (isWorkDay(date)) {
      return { style: { backgroundColor: '#f0f7ff' } }
    }
    return {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, workDays])

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">캘린더</span>
        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
          이번 달 출근 {workDayCount}일
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Calendar
            localizer={localizer}
            events={allEvents}
            views={['month']}
            defaultView="month"
            culture="ko"
            messages={RBC_MESSAGES}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            style={{ height: '100%', minHeight: 320 }}
          />
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-3 overflow-auto">
          <div>
            <p className="text-[11px] font-medium mb-0.5">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </p>
            <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
              {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]}요일
            </p>
          </div>

          <div
            className="flex items-center justify-between p-2 rounded-lg border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-1.5">
              <IconBriefcase
                size={13}
                style={{ color: isWorkDay(selectedDate) ? 'var(--color-primary)' : 'var(--color-muted)' }}
              />
              <span className="text-[11px]">{isWorkDay(selectedDate) ? '출근일' : '비출근일'}</span>
            </div>
            <ToggleSwitch
              enabled={isWorkDay(selectedDate)}
              onToggle={() => toggleWorkDay(selectedDate)}
              size="sm"
            />
          </div>

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>알람</p>
            <button
              onClick={() => { setFormHour(9); setFormMinute(0); setFormLabel(''); setAddModal(true) }}
              className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md hover:opacity-75 transition-opacity"
              style={{ color: 'var(--color-primary)', background: 'var(--color-primary-subtle)' }}
            >
              <IconPlus size={10} /> 추가
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <button
              onClick={() => { setFormHour(9); setFormMinute(0); setFormLabel(''); setAddModal(true) }}
              className="text-[10px] text-left hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-muted)' }}
            >
              + 이 날 알람 추가하기
            </button>
          ) : (
            selectedDayEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 rounded-lg group"
                style={{ background: 'var(--color-primary-subtle)' }}
              >
                <IconBell size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium" style={{ color: 'var(--color-primary-emphasis)' }}>
                    {format(event.start, 'HH:mm')}
                  </p>
                  <p className="text-[9px] truncate" style={{ color: 'var(--color-primary)' }}>{event.title}</p>
                </div>
                {!event.isPreset && (
                  <button
                    onClick={() => handleDeleteAlarm(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                  >
                    <IconTrash size={10} style={{ color: '#791F1F' }} />
                  </button>
                )}
              </div>
            ))
          )}

          <div className="h-px" style={{ background: 'var(--color-border)' }} />
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>이번 달</p>
          {[
            { n: workDayCount, l: '출근일', v: 'blue' as const },
            { n: daysInMonth - workDayCount, l: '비출근일', v: 'gray' as const },
            { n: alarmDayCount, l: '알람 있는 날', v: 'violet' as const },
          ].map(s => (
            <div key={s.l} className="flex items-center justify-between text-[10px]">
              <span style={{ color: 'var(--color-muted)' }}>{s.l}</span>
              <Badge variant={s.v}>{s.n}일</Badge>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title={`${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 알람 추가`}
        footer={
          <>
            <button
              onClick={() => setAddModal(false)}
              className="text-[10px] px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
            >
              취소
            </button>
            <button
              onClick={handleAddAlarm}
              disabled={!formLabel.trim()}
              className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
              style={{ background: 'var(--color-primary)' }}
            >
              추가
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-0">
          {[
            {
              label: '이름',
              content: (
                <input
                  type="text"
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddAlarm()}
                  placeholder="알람 이름"
                  maxLength={30}
                  autoFocus
                  className="text-right text-[11px] outline-none bg-transparent w-36"
                />
              ),
            },
            {
              label: '시간',
              content: (
                <div className="flex items-center gap-1">
                  <select
                    value={formHour}
                    onChange={e => setFormHour(Number(e.target.value))}
                    className="text-[11px] border rounded px-1 py-0.5 outline-none"
                    style={{ borderColor: 'var(--color-border-2)' }}
                  >
                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                  </select>
                  <span className="text-[11px]">:</span>
                  <select
                    value={formMinute}
                    onChange={e => setFormMinute(Number(e.target.value))}
                    className="text-[11px] border rounded px-1 py-0.5 outline-none"
                    style={{ borderColor: 'var(--color-border-2)' }}
                  >
                    {MINUTES.map(min => <option key={min} value={min}>{String(min).padStart(2, '0')}</option>)}
                  </select>
                </div>
              ),
            },
          ].map(row => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2 border-b text-[11px]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
              {row.content}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
