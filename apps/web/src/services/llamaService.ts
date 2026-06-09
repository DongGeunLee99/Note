// AI 처리 목업 서비스 — Phase 2에서 실제 Llama 호출로 교체하는 지점.
// 호출부는 이 모듈의 시그니처만 의존하므로 내부 구현만 바꾸면 된다.

import { parse } from 'chrono-node'

export type ClassifiedCategory = '일정' | '알람' | '할일' | '메모' | '나중에' | '언젠가'

export function classifyText(text: string): ClassifiedCategory {
  if (/내일|모레|오전|오후|\d+시|\d+월|\d+일|예약|회의|약속|일정/.test(text)) return '일정'
  if (/알람|기상|일어나|깨워|울려/.test(text)) return '알람'
  if (/해야|할일|준비|마감|작성|처리/.test(text)) return '할일'
  if (/나중에|이따/.test(text)) return '나중에'
  if (/언젠가|꿈|버킷|여행|배우고|사고 싶/.test(text)) return '언젠가'
  return '메모'
}

export interface AlarmSuggestion {
  datetime: Date
  label: string
}

export function detectAlarmSuggestion(body: string): AlarmSuggestion | null {
  const results = parse(body, new Date(), { forwardDate: true })
  if (results.length === 0) return null
  const date = results[0].date()
  if (date <= new Date()) return null
  const label = body.split(/[.!?。\n]/)[0].trim().slice(0, 20) || '알람'
  return { datetime: date, label }
}

export function generateAiSummary(body: string): string {
  const sentences = body.split(/[.!?。\n]/).map(s => s.trim()).filter(s => s.length > 4)
  if (sentences.length === 0) return body.slice(0, 100)
  const key = sentences.slice(0, 2).join('. ')
  return key + (key.endsWith('.') ? '' : '.') + (sentences.length > 2 ? ` (외 ${sentences.length - 2}개 항목)` : '')
}
