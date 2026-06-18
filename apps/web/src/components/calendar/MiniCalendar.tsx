import { useRef, useState } from 'react'
import { isSameDay } from 'date-fns'
import { useLang, type Language } from '@/i18n'
import { MONTH_FULL, toDateKey } from './calendarUtils'

const MINI_WEEKDAYS: Record<Language, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}

const THRESHOLD = 40 // px, 이 이상 끌면 달 넘김

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
  const monthTitle: Record<Language, string> = {
    ko: `${year}년 ${month + 1}월`,
    ja: `${year}年${month + 1}月`,
    en: `${MONTH_FULL[month]} ${year}`,
  }

  // ── 드래그 카루셀 상태 ──
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [anim, setAnim] = useState<'next' | 'prev' | 'back' | null>(null)
  const startX = useRef<number | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    setDragging(true)
    setAnim(null)
    setDragX(0)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return
    setDragX(e.clientX - startX.current)
  }
  function finish() {
    if (startX.current === null) return
    const dx = dragX
    startX.current = null
    setDragging(false)
    setAnim(dx < -THRESHOLD ? 'next' : dx > THRESHOLD ? 'prev' : 'back')
  }
  function onTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== 'transform') return // 날짜 색상 transition 무시
    if (anim === 'next') onNavigate(new Date(year, month + 1, 1))
    else if (anim === 'prev') onNavigate(new Date(year, month - 1, 1))
    // 트랙을 가운데로 재정렬(애니메이션 없이). 넘긴 경우 새 가운데 패널 = 직전 옆 패널이라 깜빡임 없음
    setAnim(null)
    setDragX(0)
  }

  // 트랙 위치: 기본 가운데(-1/3). 넘기는 중엔 px만큼 따라감, 스냅 시 목표로 transition
  const transform =
    anim === 'next' ? 'translateX(-66.6667%)'
    : anim === 'prev' ? 'translateX(0%)'
    : `translateX(calc(-33.3333% + ${dragX}px))`
  const transition = anim ? 'transform 0.2s ease-out' : 'none'
  // 달 넘기는 슬라이드 중엔 선택 하이라이트를 숨김 → 정착 시 가장자리 날짜만 또렷이 표시
  const sliding = anim === 'next' || anim === 'prev'

  function renderPanel(offset: number) {
    const base = new Date(year, month + offset, 1)
    const y = base.getFullYear(), m = base.getMonth()
    const firstDow = new Date(y, m, 1).getDay()
    const daysInMo = new Date(y, m + 1, 0).getDate()
    const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMo }, (_, i) => i + 1)]
    return (
      <div className="w-1/3 flex-shrink-0">
        <div className="grid grid-cols-7 mb-0.5">
          {MINI_WEEKDAYS[lang].map((d, i) => (
            <div key={i} className="text-center text-[8px] font-semibold py-0.5" style={{ color: 'var(--color-muted)' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const date    = new Date(y, m, day)
            const isToday = isSameDay(date, today)
            const isSel   = !sliding && isSameDay(date, selected)
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

  return (
    <div
      className="overflow-hidden select-none"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerLeave={() => dragging && finish()}
    >
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onNavigate(new Date(year, month - 1, 1))}
          className="text-[11px] px-1 rounded hover:opacity-60" style={{ color: 'var(--color-muted)' }}>‹</button>
        <p className="text-[10px] font-semibold">{monthTitle[lang]}</p>
        <button onClick={() => onNavigate(new Date(year, month + 1, 1))}
          className="text-[11px] px-1 rounded hover:opacity-60" style={{ color: 'var(--color-muted)' }}>›</button>
      </div>

      <div className="flex" style={{ width: '300%', transform, transition }} onTransitionEnd={onTransitionEnd}>
        {renderPanel(-1)}
        {renderPanel(0)}
        {renderPanel(1)}
      </div>
    </div>
  )
}
