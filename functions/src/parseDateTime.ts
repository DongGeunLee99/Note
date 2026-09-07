import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { generateText } from './gemini'
import { DATE_PARSE_SYSTEM } from './prompts'

const geminiApiKey = defineSecret('GEMINI_API_KEY')

interface ParseDateTimeRequest {
  text: string
  referenceIso: string
}

const KST_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/

/** 자연어 문장 + 기준 시각(UTC) → Gemini로 날짜/시간 추출 → { iso } 반환(못 찾으면 null) */
export const parseDateTime = onCall<ParseDateTimeRequest>(
  { secrets: [geminiApiKey], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '로그인이 필요합니다.')
    }
    const text = (request.data?.text ?? '').trim()
    const referenceIso = (request.data?.referenceIso ?? '').trim()
    if (!text || !referenceIso) {
      throw new HttpsError('invalid-argument', '문장 또는 기준 시각이 없습니다.')
    }
    if (text.length > 200) {
      throw new HttpsError('invalid-argument', '문장이 너무 깁니다.')
    }

    try {
      const raw = await generateText(
        geminiApiKey.value(),
        DATE_PARSE_SYSTEM,
        `기준 시각(UTC): ${referenceIso}\n문장: ${text}`,
      )
      const output = raw.trim()
      if (output === 'INVALID' || !KST_ISO_RE.test(output)) {
        return { iso: null }
      }
      return { iso: output }
    } catch (error) {
      console.error('parseDateTime 실패:', error)
      throw new HttpsError('internal', '날짜 파싱에 실패했습니다.')
    }
  },
)
