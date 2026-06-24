import { z } from 'zod'

// --- Signal & Company Extraction ---

export const SignalTypeSchema = z.enum([
  'industry',
  'hiring',
  'funding',
  'growth',
  'expansion',
  'keyword',
])

export const StageSchema = z.string().nullable().default('unknown')

export const ExtractedSignalSchema = z.object({
  type: SignalTypeSchema,
  description: z.string(),
  source: z.string().nullable(),
})

export const ExtractedCompanySchema = z.object({
  name: z.string(),
  website: z.string().nullable(),
  industry: z.string().nullable(),
  stage: StageSchema,
  signals: z.array(ExtractedSignalSchema),
})

export const ExtractionResultSchema = z.object({
  companies: z.array(ExtractedCompanySchema),
})

// --- Intent Scoring ---

export const IntentScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
  summary: z.string(),
})

// --- Company Enrichment ---

export const EnrichmentResultSchema = z.object({
  description: z.string().nullable(),
  industry: z.string().nullable(),
  stage: StageSchema.nullable(),
  additionalSignals: z.array(
    z.object({
      type: SignalTypeSchema,
      description: z.string(),
    })
  ),
})

// --- TypeScript types derived from schemas ---

export type ExtractedSignal = z.infer<typeof ExtractedSignalSchema>
export type ExtractedCompany = z.infer<typeof ExtractedCompanySchema>
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>
export type IntentScore = z.infer<typeof IntentScoreSchema>
export type EnrichmentResult = z.infer<typeof EnrichmentResultSchema>
