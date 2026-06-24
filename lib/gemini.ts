import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

// Allow overriding via env — useful when a model hits its free-tier quota
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })
}
