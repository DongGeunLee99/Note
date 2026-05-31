import { IconChevronLeft, IconChevronRight, IconBell, IconBriefcase, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import ToggleSwitch from '../components/common/ToggleSwitch'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { useToast } from '../contexts/ToastContext'

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

// 알람 연동 더미 데이터 (날짜 → 알람 목록)
const PRESET_EVENTS: Record<number, { time: string; label: string }[]> = {
  5:  [{ time: '10:00', label: '병원 예약' }],
  10: [{ time: '07:30', label: '기상' }, { time: '09:00', label: '출근 준비' }],
  15: [{ time: '14:00', label: '팀 미팅' }],
  22: [{ time: '07:30', label: '기상' }, { time: '18:30', label: '퇴근' }],
  28: [{ time: '11:00', label: '치과 예약' }],
}

interface CalendarAlarm { id: string; time: string; label: string }

let nextAlarmId = 1

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfWeek(y: number, m: number) { return new Date(y, m, 1).getDay() }

export default function CalendarPage() {
  const toast = useToast()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate())
  const [customAlarms, setCustomAlarms] = useState<Record<string, CalendarAlarm[]>>({})
  const [addModal, setAddModal] = useState(false)
  const [formHour, setFormHour] = useState(9)
  const [formMinute, setFormMinute] = useState(0)
  const [formLabel, setFormLabel] = useState('')

  const [workDays, setWorkDays] = useState<Set<string>>(() => {
    // 평일 기본값으로 초기화
    const set = new Set<string>()
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    while (d.getMonth() === now.getMonth()) {
      const dow = d.getDay()
      if (dow >= 1 && dow <= 5) set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
      d.setDate(d.getDate() + 1)
    }
    return set
  })

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function dayKey(d: number) { return `${year}-${month}-${d}` }
  function isWorkDay(d: number) { return workDays.has(dayKey(d)) }
  function isToday(d: number) { return year === now.getFullYear() && month === now.getMonth() && d === now.getDate() }

  function toggleWorkDay(d: number) {
    const key = dayKey(d)
    setWorkDays(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key); toast(`${month + 1}/${d} 비출근일로 변경`, 'info') }
      else { next.add(key); toast(`${month + 1}/${d} 출근일로 변경`, 'success') }
      return next
    })
  }

  function alarmKey(d: number) { return `${year}-${month}-${d}` }

  function handleAddAlarm() {
    if (!formLabel.trim()) return
    const time = `${String(formHour).padStart(2, '0')}:${String(formMinute).padStart(2, '0')}`
    const key = alarmKey(selectedDay)
    const newAlarm: CalendarAlarm = { id: `ca${nextAlarmId++}`, time, label: formLabel.trim() }
    setCustomAlarms(prev => ({ ...prev, [key]: [...(prev[key] ?? []), newAlarm].sort((a, b) => a.time.localeCompare(b.time)) }))
    toast(`${month + 1}/${selectedDay} ${time} 알람 추가됨`, 'success')
    setFormLabel('')
    setAddModal(false)
  }

  function handleDeleteAlarm(alarmId: string) {
    const key = alarmKey(selectedDay)
    setCustomAlarms(prev => ({ ...prev, [key]: (prev[key] ?? []).filter(a => a.id !== alarmId) }))
    toast('알람이 삭제되었습니다', 'info')
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  const selectedKey = alarmKey(selectedDay)
  const presetAlarms = PRESET_EVENTS[selectedDay] ?? []
  const userAlarms = customAlarms[selectedKey] ?? []
  const selectedAlarms = [...presetAlarms, ...userAlarms].sort((a, b) => a.time.localeCompare(b.time))

  function hasAlarms(d: number) { return !!PRESET_EVENTS[d] || (customAlarms[alarmKey(d)]?.length ?? 0) > 0 }
  const alarmDayCount = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => hasAlarms(d)).length

  const workDayCount = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => isWorkDay(d)).length

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
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium">{year}년 {month + 1}월</span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 transition-colors">
                <IconChevronLeft size={14} style={{ color: 'var(--color-muted)' }} />
              </button>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 transition-colors">
                <IconChevronRight size={14} style={{ color: 'var(--color-muted)' }} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEK_LABELS.map(d => (
              <div key={d} className="text-center text-[9px] py-1" style={{ color: 'var(--color-muted)' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const hasAlarm = hasAlarms(day)
              const workDay = isWorkDay(day)
              const today = isToday(day)
              const selected = day === selectedDay
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className="aspect-square flex flex-col items-center justify-center text-[9px] rounded relative transition-colors"
                  style={{
                    background: today
                      ? 'var(--color-primary)'
                      : selected
                      ? 'var(--color-primary-subtle)'
                      : workDay
                      ? '#f0f7ff'
                      : 'transparent',
                    color: today ? '#fff' : workDay ? 'var(--color-primary-emphasis)' : 'var(--color-muted)',
                    outline: selected && !today ? `1.5px solid var(--color-primary)` : 'none',
                    opacity: !workDay && !today ? 0.5 : 1,
                  }}
                >
                  {day}
                  {hasAlarm && (
                    <span
                      className="absolute bottom-0.5 w-1 h-1 rounded-full"
                      style={{ background: today ? '#fff' : 'var(--color-primary)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 mt-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {[
              { color: 'var(--color-primary)', label: '오늘' },
              { color: '#f0f7ff', border: 'var(--color-primary)', label: '출근일' },
              { color: 'var(--color-primary)', dot: true, label: '알람 있음' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[9px]" style={{ color: 'var(--color-muted)' }}>
                {l.dot
                  ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)', display: 'inline-block' }} />
                  : <span className="w-3 h-3 rounded border" style={{ background: l.color, borderColor: l.border ?? 'transparent', display: 'inline-block' }} />
                }
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="w-48 flex-shrink-0 p-3 flex flex-col gap-3 overflow-auto">
          <div>
            <p className="text-[11px] font-medium mb-0.5">{month + 1}월 {selectedDay}일</p>
            <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
              {['일', '월', '화', '수', '목', '금', '토'][new Date(year, month, selectedDay).getDay()]}요일
            </p>
          </div>

          <div
            className="flex items-center justify-between p-2 rounded-lg border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-1.5">
              <IconBriefcase size={13} style={{ color: isWorkDay(selectedDay) ? 'var(--color-primary)' : 'var(--color-muted)' }} />
              <span className="text-[11px]">{isWorkDay(selectedDay) ? '출근일' : '비출근일'}</span>
            </div>
            <ToggleSwitch
              enabled={isWorkDay(selectedDay)}
              onToggle={() => toggleWorkDay(selectedDay)}
              size="sm"
            />
          </div>

          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>알람</p>
            <button
              onClick={() => { setFormHour(9); setFormMinute(0); setFormLabel(''); setAddModal(true) }}
              className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md transition-colors hover:opacity-75"
              style={{ color: 'var(--color-primary)', background: 'var(--color-primary-subtle)' }}
            >
              <IconPlus size={10} /> 추가
            </button>
          </div>

          {selectedAlarms.length === 0 ? (
            <button
              onClick={() => { setFormHour(9); setFormMinute(0); setFormLabel(''); setAddModal(true) }}
              className="text-[10px] text-left hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-muted)' }}
            >
              + 이 날 알람 추가하기
            </button>
          ) : (
            selectedAlarms.map((a, i) => {
              const isCustom = 'id' in a
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg group"
                  style={{ background: 'var(--color-primary-subtle)' }}
                >
                  <IconBell size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--color-primary-emphasis)' }}>{a.time}</p>
                    <p className="text-[9px] truncate" style={{ color: 'var(--color-primary)' }}>{a.label}</p>
                  </div>
                  {isCustom && (
                    <button
                      onClick={() => handleDeleteAlarm((a as CalendarAlarm).id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                    >
                      <IconTrash size={10} style={{ color: '#791F1F' }} />
                    </button>
                  )}
                </div>
              )
            })
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
        title={`${month + 1}월 ${selectedDay}일 알람 추가`}
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
                    {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
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
