import { GoogleGenAI } from '@google/genai'

// Gemini Flash — 무료 등급. 모델 ID는 필요 시 여기만 바꾸면 됨.
const MODEL = 'gemini-2.5-flash'

/** systemInstruction(지시문) + userText로 Gemini 호출, 텍스트 반환 */
export async function generateText(apiKey: string, systemInstruction: string, userText: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey })
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: userText,
    config: { systemInstruction },
  })
  return (res.text ?? '').trim()
}
