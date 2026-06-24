import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

// Ordered list of models to try. We prioritize fast models with highest quotas.
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3-flash',
]

export async function generateContentWithFallback(prompt: string) {
  let lastError: any

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      })

      const result = await model.generateContent(prompt)
      return result
    } catch (error: any) {
      lastError = error
      const errorMessage = error?.message || String(error)

      // If it's a rate limit, quota, or 503 high demand error, log it and try the next model
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('503') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('high demand')
      ) {
        console.warn(`[Gemini] Model ${modelName} hit rate limit, quota, or high demand, falling back to next model...`)
        continue
      }

      // If it's a different error (e.g. invalid prompt), throw immediately
      throw error
    }
  }

  // If we exhausted all models, throw the last error
  throw lastError
}
