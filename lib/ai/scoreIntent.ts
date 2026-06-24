import { generateContentWithFallback } from '@/lib/gemini'
import { IntentScoreSchema, type IntentScore, type ExtractedSignal } from './schemas'

const SYSTEM_PROMPT = `You are a sales intelligence scoring engine. Score companies from 0 to 100 on how likely they are to need and purchase outbound sales services or appointment-setting support.

Scoring framework:
- 80–100: Strong signals. Hiring sales roles + recent funding, or multiple strong growth signals. Very likely to buy.
- 60–79: Good signals. Hiring OR funding combined with growth indicators. Worth pursuing.
- 40–59: Moderate signals. Some growth but unclear sales need, or early-stage with limited budget.
- 20–39: Weak signals. Established company with no clear sales expansion need.
- 0–19: Poor fit. No clear signals or already has strong internal sales capacity.

Positive factors:
- Hiring SDRs/BDRs/sales roles: +20–30
- Recent funding (Series A/B especially): +15–25
- Small current sales team (opportunity): +10–15
- Active growth or expansion signals: +10–20
- B2B company: +5–10
- Early stage under 50 employees: +5

Negative factors:
- Already has large sales team (50+ sellers): -15
- Enterprise with established processes: -10
- No growth signals: -20
- B2C consumer company: -10

You must respond with valid JSON matching this exact structure:
{
  "score": integer between 0 and 100,
  "reasoning": "1–2 sentence explanation of the score",
  "summary": "1 sentence: why this company is or is not a good lead"
}`

export async function scoreIntent(company: {
  name: string
  industry?: string | null
  stage?: string | null
  signals: Array<Pick<ExtractedSignal, 'type' | 'description'>>
}): Promise<IntentScore> {
  const signalList = company.signals
    .map((s) => `- [${s.type.toUpperCase()}] ${s.description}`)
    .join('\n')

  const prompt = `${SYSTEM_PROMPT}

Company: ${company.name}
Industry: ${company.industry ?? 'Unknown'}
Stage: ${company.stage ?? 'Unknown'}

Detected signals:
${signalList || '- No signals detected'}

Score this company's intent to purchase outbound sales or appointment-setting services. Return JSON only.`

  const result = await generateContentWithFallback(prompt)
  const text = result.response.text()

  let cleanText = text.trim()
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }

  try {
    const parsed = JSON.parse(cleanText)
    return IntentScoreSchema.parse(parsed)
  } catch (error) {
    console.error('Gemini scoring parse error:', text)
    throw new Error(`Failed to parse Gemini scoring response: ${String(error)}`)
  }
}
