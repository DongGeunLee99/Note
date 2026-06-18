import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { generateText } from './gemini'
import { AI_SUMMARY_SYSTEM } from './prompts'

const geminiApiKey = defineSecret('GEMINI_API_KEY')

interface AiSummarizeRequest {
  text: string
}

/** 메모 본문 → Gemini로 AI 정리(요약) → { summary } 반환 (온디맨드 callable) */
export const aiSummarize = onCall<AiSummarizeRequest>(
  { secrets: [geminiApiKey], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '로그인이 필요합니다.')
    }
    const text = (request.data?.text ?? '').trim()
    if (!text) {
      throw new HttpsError('invalid-argument', '정리할 텍스트가 없습니다.')
    }
    if (text.length > 5000) {
      throw new HttpsError('invalid-argument', '텍스트가 너무 깁니다.')
    }

    try {
      const summary = await generateText(geminiApiKey.value(), AI_SUMMARY_SYSTEM, text)
      return { summary }
    } catch (error) {
      console.error('aiSummarize 실패:', error)
      throw new HttpsError('internal', 'AI 정리에 실패했습니다.')
    }
  },
)
