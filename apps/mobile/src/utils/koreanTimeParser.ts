// 한국어 시간 파서 (로컬 규칙) — 빠른 알람 + 메모 알람 제안에서 사용.
// chrono-node는 한국어 로케일이 없어 "내일 오전 9시" 같은 입력을 인식하지 못함 → 직접 규칙으로 처리.

export interface ParsedKoreanTime {
  hour: number
  minute: number
  label: string
  /** 실제 시각. 날짜 표현(오늘/내일/모레)이 없고 이미 지난 시각이면 다음 날로 넘김 */
  datetime: Date
}

const DEFAULT_LABEL = '알람'

/** "N분 뒤", "N시간 M분 후" — 지금 기준 상대 시간 */
const RELATIVE_RE = /(?:(\d+)\s*시간\s*)?(?:(\d+)\s*분\s*)?(?:뒤|후)(?:에)?/

/** "오후 3시 30분", "아침 7시 반", "9시" — 절대 시각 */
const ABSOLUTE_RE = /(오전|오후|아침|점심|저녁|밤|새벽)?\s*(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분|(반))?(?:에)?/

/** "14:30", "7:05" */
const COLON_RE = /(오전|오후|아침|점심|저녁|밤|새벽)?\s*(\d{1,2}):(\d{2})(?:에)?/

const DAY_WORDS: Record<string, number> = { 오늘: 0, 내일: 1, 모레: 2 }
const DAY_RE = /(오늘|내일|모레)/

const PM_WORDS = ['오후', '저녁', '밤']
const AM_WORDS = ['오전', '아침', '새벽']

/** 라벨에서 떼어낼 군더더기 (날짜·명령어) */
const NOISE_RE = /(오늘|내일|모레|알려\s*줘|알려\s*주세요|깨워\s*줘|깨워\s*주세요|알람\s*(맞춰|설정)\s*(줘|해\s*줘)?)/g

function applyMeridiem(hour: number, meridiem: string | undefined): number {
  if (!meridiem) return hour
  // "밤 12시" = 자정
  if (meridiem === '밤' && hour === 12) return 0
  if (PM_WORDS.includes(meridiem) && hour < 12) return hour + 12
  if (AM_WORDS.includes(meridiem) && hour === 12) return 0
  // 점심: 11~2시 정도를 낮 시간으로 해석 (1시 → 13시)
  if (meridiem === '점심' && hour < 6) return hour + 12
  return hour
}

function cleanLabel(text: string, matched: string): string {
  const label = text
    .replace(matched, ' ')
    .replace(NOISE_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return label || DEFAULT_LABEL
}

/** 절대 시각 → 실제 Date. 날짜 표현이 없으면 지난 시각은 다음 날로 */
function resolveDate(text: string, hour: number, minute: number, now: Date): Date {
  const dayWord = text.match(DAY_RE)?.[1]
  const date = new Date(now)
  date.setHours(hour, minute, 0, 0)
  if (dayWord) {
    date.setDate(date.getDate() + DAY_WORDS[dayWord])
  } else if (date <= now) {
    date.setDate(date.getDate() + 1)
  }
  return date
}

/** 자연어 입력에서 시각과 라벨 추출. 시각을 못 찾으면 null */
export function parseKoreanTime(text: string, now: Date = new Date()): ParsedKoreanTime | null {
  const relative = text.match(RELATIVE_RE)
  if (relative && (relative[1] || relative[2])) {
    const totalMinutes = Number(relative[1] ?? 0) * 60 + Number(relative[2] ?? 0)
    const target = new Date(now.getTime() + totalMinutes * 60_000)
    return { hour: target.getHours(), minute: target.getMinutes(), label: cleanLabel(text, relative[0]), datetime: target }
  }

  const colon = text.match(COLON_RE)
  if (colon) {
    const hour = applyMeridiem(Number(colon[2]), colon[1])
    const minute = Number(colon[3])
    if (hour <= 23 && minute <= 59) {
      return { hour, minute, label: cleanLabel(text, colon[0]), datetime: resolveDate(text, hour, minute, now) }
    }
  }

  const absolute = text.match(ABSOLUTE_RE)
  if (absolute) {
    const hour = applyMeridiem(Number(absolute[2]), absolute[1])
    const minute = absolute[4] ? 30 : Number(absolute[3] ?? 0)
    if (hour <= 23 && minute <= 59) {
      return { hour, minute, label: cleanLabel(text, absolute[0]), datetime: resolveDate(text, hour, minute, now) }
    }
  }

  return null
}

export interface AlarmSuggestion {
  datetime: Date
  label: string
}

/**
 * 메모 본문에서 알람 제안 추출 (공용 llamaService.detectAlarmSuggestion의 한국어 대체).
 * 미래 시각만 제안하고, 라벨은 본문 첫 문장에서 시간·날짜 표현을 뺀 것(20자)
 */
export function detectAlarmSuggestion(body: string, now: Date = new Date()): AlarmSuggestion | null {
  const parsed = parseKoreanTime(body, now)
  if (!parsed || parsed.datetime <= now) return null
  const firstSentence = body.split(/[.!?。\n]/)[0].trim()
  const label = (parseKoreanTime(firstSentence, now)?.label ?? firstSentence).slice(0, 20) || DEFAULT_LABEL
  return { datetime: parsed.datetime, label }
}
