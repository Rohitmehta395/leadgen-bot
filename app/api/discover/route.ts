import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runDiscoveryPipeline } from '@/lib/discovery/pipeline'

const DiscoverInputSchema = z.object({
  industry: z.string().min(2).max(100),
  keywords: z.string().max(200).optional(),
  signalTypes: z
    .array(z.enum(['hiring', 'funding', 'growth', 'expansion', 'keyword']))
    .min(1),
  location: z.string().max(100).optional(),
})

export async function POST(request: NextRequest) {
  // Parse body — return 400 for missing or malformed JSON
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        error: 'Request body is missing or not valid JSON',
        hint: 'Send a JSON body with Content-Type: application/json',
        example: {
          industry: 'B2B SaaS',
          signalTypes: ['hiring', 'funding'],
        },
      },
      { status: 400 }
    )
  }

  // Validate schema
  const parsed = DiscoverInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  // Run pipeline
  try {
    console.log('[POST /api/discover] Starting pipeline with:', parsed.data)
    const result = await runDiscoveryPipeline(parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[POST /api/discover] Pipeline failed:', error)
    return NextResponse.json(
      {
        error: 'Discovery pipeline failed',
        details: String(error),
      },
      { status: 500 }
    )
  }
}
