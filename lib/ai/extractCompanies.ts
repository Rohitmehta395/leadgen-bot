import { generateContentWithFallback } from '@/lib/gemini'
import { ExtractionResultSchema, type ExtractionResult } from './schemas'

const MAX_CONTENT_LENGTH = 12000

const SYSTEM_PROMPT = `You are a B2B sales intelligence analyst. Your job is to extract companies from web content and identify signals that indicate they might need sales outreach or appointment-setting services.

Signal types to look for:
- industry: Company operates in the specified target industry
- hiring: Company is actively hiring for sales roles (SDR, BDR, AE, VP Sales, Sales Manager)
- funding: Company recently raised funding (any round)
- growth: Company is growing — new markets, partnerships, revenue milestones, customer wins
- expansion: Company is expanding headcount, offices, or product lines
- keyword: Company explicitly mentions needing sales help, outbound strategy, or pipeline growth

Rules:
- Only extract companies that have at least one signal
- Be specific in signal descriptions — include actual details found (e.g. "Raised $8M Series A in November 2024")
- Estimate stage based on funding, company size, or description
- Include website URL if mentioned (with https://)
- Deduplicate: if the same company appears multiple times, merge their signals into one entry
- Return companies as an empty array if no qualifying companies are found

You must respond with valid JSON matching this exact structure:
{
  "companies": [
    {
      "name": "string",
      "website": "string or null",
      "industry": "string or null",
      "stage": "seed | series-a | series-b | growth | enterprise | unknown",
      "signals": [
        {
          "type": "industry | hiring | funding | growth | expansion | keyword",
          "description": "string",
          "source": "string or null"
        }
      ]
    }
  ]
}`

export async function extractCompanies(
  content: string,
  context: {
    industry: string
    signalTypes: string[]
    keywords?: string
  }
): Promise<ExtractionResult> {
  const truncated =
    content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + '\n...[truncated]'
      : content

  const prompt = `${SYSTEM_PROMPT}

I searched for companies in the "${context.industry}" industry with signals: ${context.signalTypes.join(', ')}.
${context.keywords ? `Additional keywords: ${context.keywords}` : ''}

Here is the scraped web content to analyze:

---
${truncated}
---

Extract all companies mentioned that show intent signals relevant to needing sales outreach or appointment-setting support. Return JSON only.`

  const result = await generateContentWithFallback(prompt)
  const text = result.response.text()

  let cleanText = text.trim()
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }

  try {
    const parsed = JSON.parse(cleanText)
    return ExtractionResultSchema.parse(parsed)
  } catch (error) {
    console.error('Gemini extraction parse error:', text)
    throw new Error(`Failed to parse Gemini extraction response: ${String(error)}`)
  }
}
