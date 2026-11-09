import { addDays, isSameDay, startOfDay } from '../utils/calendarDate'

// 캘린더 UI 단계용 화면 전용 일정 타입 + 더미 데이터.
// 공용 CalendarEvent엔 allDay/location이 없음 → 데이터 구조는 로직 단계에서 확정

export interface CalendarItem {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  color: string
  location: string | null
  /** 시작 N분 전 팝업 알림. null이면 없음 */
  reminderMinutes: number | null
}

export const EVENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

/** 오늘 기준 dayOffset일 뒤 h:m */
function at(dayOffset: number, h: number, m = 0): Date {
  const d = addDays(startOfDay(new Date()), dayOffset)
  d.setHours(h, m, 0, 0)
  return d
}

function item(
  id: string, title: string, start: Date, end: Date, color: string,
  extra: Partial<Pick<CalendarItem, 'allDay' | 'location' | 'reminderMinutes'>> = {},
): CalendarItem {
  return { id, title, start, end, color, allDay: false, location: null, reminderMinutes: null, ...extra }
}

const allDay = (offsetStart: number, offsetEnd: number) => ({ start: at(offsetStart, 0), end: at(offsetEnd, 23, 59) })

// 오늘을 기준으로 배치해서 언제 열어도 이번 달에 일정이 보이도록 함
export const DUMMY_EVENTS: CalendarItem[] = [
  item('e-1', '치과 예약', at(0, 10), at(0, 11), EVENT_COLORS[0], { location: '역삼동 치과', reminderMinutes: 30 }),
  item('e-2', '팀 점심', at(0, 12), at(0, 13), EVENT_COLORS[1]),
  item('e-3', '동창 모임', at(0, 19, 30), at(0, 21, 30), EVENT_COLORS[4], { location: '강남역', reminderMinutes: 60 }),
  item('e-4', '주간 회의', at(1, 10, 30), at(1, 11, 30), EVENT_COLORS[0], { reminderMinutes: 10 }),
  item('e-5', '가족 여행', allDay(4, 6).start, allDay(4, 6).end, EVENT_COLORS[2], { allDay: true, location: '강릉' }),
  item('e-6', '헬스 PT', at(2, 20), at(2, 21), EVENT_COLORS[1]),
  item('e-7', '프로젝트 마감', allDay(9, 9).start, allDay(9, 9).end, EVENT_COLORS[3], { allDay: true, reminderMinutes: 1440 }),
  item('e-8', '병원 정기검진', at(-3, 9), at(-3, 10), EVENT_COLORS[5]),
  item('e-9', '스터디', at(-6, 14), at(-6, 16), EVENT_COLORS[4], { location: '판교 카페' }),
  item('e-10', '부모님 생신', allDay(13, 13).start, allDay(13, 13).end, EVENT_COLORS[3], { allDay: true, reminderMinutes: 1440 }),
  item('e-11', '영화', at(7, 19), at(7, 21), EVENT_COLORS[2]),
]

/** 그날에 걸친 일정 (여러 날 일정 포함). 하루종일 먼저, 그다음 시작 시각 순 */
export function eventsOnDay(events: CalendarItem[], day: Date): CalendarItem[] {
  const dayStart = startOfDay(day)
  const dayEnd = addDays(dayStart, 1)
  return events
    .filter(e => e.start < dayEnd && e.end >= dayStart)
    .sort((a, b) => (a.allDay !== b.allDay ? (a.allDay ? -1 : 1) : a.start.getTime() - b.start.getTime()))
}

/** 여러 날에 걸친 일정인지 */
export function isMultiDay(e: CalendarItem): boolean {
  return !isSameDay(e.start, e.end)
}
