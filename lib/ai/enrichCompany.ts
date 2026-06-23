import { getGeminiModel } from '@/lib/gemini'
import { EnrichmentResultSchema, type EnrichmentResult } from './schemas'

const MAX_CONTENT_LENGTH = 10000

const SYSTEM_PROMPT = `You are a B2B company research analyst. Analyze a company's website content and extract structured information for a sales intelligence platform.

Extract:
- description: A 2–3 sentence factual description of what the company does
- industry: The specific industry vertical (be specific, e.g. "HR Tech SaaS" not just "Software")
- stage: Estimate company stage based on language, team size mentions, and product maturity
- additionalSignals: Any signals found indicating sales or growth needs
  Look for: job listings, team page size, "we're hiring", funding announcements, expansion news

Return null for fields you cannot determine. Keep descriptions factual and concise.

You must respond with valid JSON matching this exact structure:
{
  "description": "string or null",
  "industry": "string or null",
  "stage": "seed | series-a | series-b | growth | enterprise | unknown | null",
  "additionalSignals": [
    {
      "type": "hiring | funding | growth | expansion | keyword",
      "description": "string"
    }
  ]
}`

export async function enrichCompany(
  content: string,
  companyName: string
): Promise<EnrichmentResult> {
  const truncated =
    content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + '\n...[truncated]'
      : content

  const prompt = `${SYSTEM_PROMPT}

Company name: ${companyName}

Website content:
---
${truncated}
---

Extract structured enrichment data for this company. Return JSON only.`

  const model = getGeminiModel()
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const parsed = JSON.parse(text)
    return EnrichmentResultSchema.parse(parsed)
  } catch (error) {
    console.error('Gemini enrichment parse error:', text)
    throw new Error(`Failed to parse Gemini enrichment response: ${String(error)}`)
  }
}
