import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { firecrawl } from '@/lib/firecrawl'
import { enrichCompany } from '@/lib/ai/enrichCompany'
import { scoreIntent } from '@/lib/ai/scoreIntent'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const company = await prisma.company.findUnique({
      where: { id },
      include: { signals: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (!company.website) {
      return NextResponse.json(
        { error: 'Company has no website to enrich', enriched: false },
        { status: 422 }
      )
    }

    console.log(`[Enrich] Scraping ${company.website}...`)

    // Scrape company website
    // Firecrawl SDK v4: scrape() returns Document directly; throws on error
    let scrapedContent = ''
    try {
      const scraped = await firecrawl.scrape(company.website, {
        formats: ['markdown'],
      })
      scrapedContent = scraped.markdown ?? ''
      if (!scrapedContent) {
        console.warn('[Enrich] Firecrawl returned no markdown for:', company.website)
      }
    } catch (err) {
      console.error('[Enrich] Firecrawl scrape failed:', err)
      return NextResponse.json(
        { error: 'Failed to scrape company website', enriched: false },
        { status: 502 }
      )
    }

    if (!scrapedContent) {
      return NextResponse.json(
        { error: 'No content returned from website', enriched: false },
        { status: 422 }
      )
    }

    // Enrich via Gemini
    console.log(`[Enrich] Running Gemini enrichment for ${company.name}...`)
    const enrichment = await enrichCompany(scrapedContent, company.name)

    // Add new signals to DB
    if (enrichment.additionalSignals.length > 0) {
      await prisma.signal.createMany({
        data: enrichment.additionalSignals.map((s) => ({
          companyId: company.id,
          type: s.type,
          description: s.description,
          source: company.website ?? 'Company Website',
        })),
        skipDuplicates: true,
      })
    }

    // Fetch all signals (existing + new) for re-scoring
    const allSignals = await prisma.signal.findMany({
      where: { companyId: company.id },
    })

    // Re-score with enriched data — map signal type to the expected union
    const scored = await scoreIntent({
      name: company.name,
      industry: enrichment.industry ?? company.industry,
      stage: enrichment.stage ?? company.stage,
      signals: allSignals.map((s) => ({
        type: s.type as 'hiring' | 'funding' | 'growth' | 'expansion' | 'keyword',
        description: s.description,
      })),
    })

    // Update company with enriched data
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        description: enrichment.description ?? company.description,
        industry: enrichment.industry ?? company.industry,
        stage: enrichment.stage ?? company.stage,
        intentScore: scored.score,
        scoreReason: scored.reasoning,
        aiSummary: scored.summary,
        status: 'enriched',
      },
      include: { signals: { orderBy: { detectedAt: 'desc' } } },
    })

    console.log(
      `[Enrich] Done: ${company.name} — new score: ${scored.score}, ` +
      `signals added: ${enrichment.additionalSignals.length}`
    )

    return NextResponse.json({ company: updated, enriched: true })
  } catch (error) {
    console.error('[POST /api/companies/[id]/enrich] Error:', error)
    return NextResponse.json(
      { error: 'Enrichment failed', details: String(error) },
      { status: 500 }
    )
  }
}
