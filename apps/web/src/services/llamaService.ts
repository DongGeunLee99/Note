// AI 처리 서비스. classifyText/detectAlarmSuggestion은 아직 로컬 규칙(Phase 2 후속).
// AI 정리(요약)는 Gemini Cloud Function(aiSummarize)으로 연동됨.

import { parse } from 'chrono-node'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@smartnote/shared/firebase'

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

/** 로컬 폴백 요약 (Gemini 호출 실패 시 사용) */
export function generateAiSummary(body: string): string {
  const sentences = body.split(/[.!?。\n]/).map(s => s.trim()).filter(s => s.length > 4)
  if (sentences.length === 0) return body.slice(0, 100)
  const key = sentences.slice(0, 2).join('. ')
  return key + (key.endsWith('.') ? '' : '.') + (sentences.length > 2 ? ` (외 ${sentences.length - 2}개 항목)` : '')
}

/** Gemini Cloud Function(aiSummarize) 호출 — 메모 본문 요약 반환 */
export async function requestAiSummary(text: string): Promise<string> {
  const fn = httpsCallable<{ text: string }, { summary: string }>(functions, 'aiSummarize')
  const { data } = await fn({ text })
  return data.summary
}
