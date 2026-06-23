import { NextResponse } from 'next/server'
import { extractCompanies } from '@/lib/ai/extractCompanies'
import { scoreIntent } from '@/lib/ai/scoreIntent'
import { enrichCompany } from '@/lib/ai/enrichCompany'

const SAMPLE_CONTENT = `
TechScale Inc announced today they have closed a $12M Series A funding round led by
Accel Partners. The B2B SaaS company, which provides workflow automation for mid-market
companies, plans to use the funds to expand their sales team. They are currently hiring
5 Sales Development Representatives and a VP of Sales to accelerate growth.

Meanwhile, Growify, a marketing analytics startup, revealed they signed 10 new enterprise
customers this quarter and are expanding their team from 20 to 50 employees. Their CEO
mentioned in a blog post they are investing heavily in outbound sales infrastructure to
support their growth trajectory.
`

export async function GET() {
  try {
    // Test 1: Signal extraction
    const extraction = await extractCompanies(SAMPLE_CONTENT, {
      industry: 'B2B SaaS',
      signalTypes: ['hiring', 'funding', 'growth'],
    })

    if (!extraction.companies.length) {
      return NextResponse.json(
        { error: 'Extraction returned no companies — check OpenAI key and prompt' },
        { status: 500 }
      )
    }

    const firstCompany = extraction.companies[0]

    // Test 2: Intent scoring
    const score = await scoreIntent({
      name: firstCompany.name,
      industry: firstCompany.industry,
      stage: firstCompany.stage,
      signals: firstCompany.signals,
    })

    // Test 3: Enrichment
    const enrichment = await enrichCompany(
      'TechScale Inc builds workflow automation software for mid-market B2B companies. ' +
      'Founded in 2021, they have raised $12M and are growing their sales team rapidly. ' +
      'They are hiring SDRs, AEs, and a VP of Sales.',
      'TechScale Inc'
    )

    return NextResponse.json({
      success: true,
      tests: {
        extraction: {
          passed: extraction.companies.length > 0,
          companiesFound: extraction.companies.length,
          firstCompany: extraction.companies[0],
        },
        scoring: {
          passed: score.score >= 0 && score.score <= 100,
          score: score.score,
          reasoning: score.reasoning,
          summary: score.summary,
        },
        enrichment: {
          passed: enrichment.description !== null,
          description: enrichment.description,
          industry: enrichment.industry,
          stage: enrichment.stage,
          additionalSignalsFound: enrichment.additionalSignals.length,
        },
      },
    })
  } catch (error) {
    console.error('AI test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        hint: 'Check OPENAI_API_KEY in .env.local and restart the dev server',
      },
      { status: 500 }
    )
  }
}
