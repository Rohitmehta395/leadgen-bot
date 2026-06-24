import { firecrawl } from '@/lib/firecrawl'
import { prisma } from '@/lib/prisma'
import { extractCompanies } from '@/lib/ai/extractCompanies'
import { scoreIntent } from '@/lib/ai/scoreIntent'
import { buildSearchQueries } from './buildQueries'

const MAX_COMPANIES_PER_RUN = 5
const FIRECRAWL_RESULTS_PER_QUERY = 3

function toNameKey(name: string): string {
  return name.toLowerCase().trim()
}

interface PipelineInput {
  industry: string
  signalTypes: string[]
  keywords?: string
  location?: string
}

export async function runDiscoveryPipeline(input: PipelineInput) {
  // 1. Create discovery run record
  const run = await prisma.discoveryRun.create({
    data: {
      industry: input.industry,
      keywords: input.keywords,
      signalTypes: input.signalTypes,
      status: 'running',
    },
  })

  try {
    // 2. Build search queries
    const queries = buildSearchQueries(input)
    console.log(`[Discovery] Running ${queries.length} queries:`, queries)

    // 3. Firecrawl search for each query
    const allContent: string[] = []

    for (const query of queries) {
      try {
        const result = await firecrawl.search(query, {
          limit: FIRECRAWL_RESULTS_PER_QUERY,
        })

        // Firecrawl SDK v4: search() returns SearchData { web?, news?, images? }
        const pages = result.web ?? []

        if (pages.length > 0) {
          const content = pages
            .map((page: { markdown?: string; url?: string; metadata?: { url?: string } }) => {
              const url = page.url ?? page.metadata?.url ?? ''
              return [
                url ? `Source: ${url}` : '',
                page.markdown ?? '',
              ]
                .filter(Boolean)
                .join('\n')
            })
            .join('\n\n---\n\n')

          allContent.push(content)
          console.log(
            `[Discovery] Query "${query.slice(0, 60)}..." → ${pages.length} results`
          )
        } else {
          console.log(`[Discovery] Query returned no results: ${query.slice(0, 60)}...`)
        }
      } catch (err) {
        console.error(`[Discovery] Firecrawl query failed: ${query}`, err)
        // Continue — don't let one failed query abort the whole run
      }
    }

    if (allContent.length === 0) {
      await prisma.discoveryRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          companiesFound: 0,
          completedAt: new Date(),
        },
      })
      return { runId: run.id, companiesFound: 0, companies: [] }
    }

    // 4. Combine all scraped content
    const combinedContent = allContent.join('\n\n===\n\n')

    // 5. Extract companies via Gemini
    console.log('[Discovery] Extracting companies via Gemini...')
    const extraction = await extractCompanies(combinedContent, {
      industry: input.industry,
      signalTypes: input.signalTypes,
      keywords: input.keywords,
    })

    console.log(`[Discovery] Extracted ${extraction.companies.length} companies`)

    // 6. Cap at MAX_COMPANIES_PER_RUN
    const toProcess = extraction.companies.slice(0, MAX_COMPANIES_PER_RUN)

    // 7. Score each company and upsert to DB
    const savedCompanies = []

    for (const extracted of toProcess) {
      try {
        // Score via Gemini
        const scored = await scoreIntent({
          name: extracted.name,
          industry: extracted.industry,
          stage: extracted.stage,
          signals: extracted.signals,
        })

        const nameKey = toNameKey(extracted.name)

        // Upsert company
        const company = await prisma.company.upsert({
          where: { nameKey },
          update: {
            website: extracted.website ?? undefined,
            industry: extracted.industry ?? undefined,
            stage: extracted.stage !== 'unknown' ? extracted.stage : undefined,
            intentScore: scored.score,
            scoreReason: scored.reasoning,
            aiSummary: scored.summary,
            updatedAt: new Date(),
          },
          create: {
            name: extracted.name,
            nameKey,
            website: extracted.website,
            industry: extracted.industry,
            stage: extracted.stage !== 'unknown' ? extracted.stage : null,
            intentScore: scored.score,
            scoreReason: scored.reasoning,
            aiSummary: scored.summary,
          },
        })

        // Replace signals — delete old, insert new
        await prisma.signal.deleteMany({ where: { companyId: company.id } })

        if (extracted.signals.length > 0) {
          await prisma.signal.createMany({
            data: extracted.signals.map((s) => ({
              companyId: company.id,
              type: s.type,
              description: s.description,
              source: s.source ?? 'Firecrawl Search',
            })),
          })
        }

        // Fetch with signals for response
        const full = await prisma.company.findUnique({
          where: { id: company.id },
          include: { signals: true },
        })

        if (full) savedCompanies.push(full)

        console.log(
          `[Discovery] Saved: ${extracted.name} (score: ${scored.score})`
        )
      } catch (err) {
        console.error(`[Discovery] Failed to process company: ${extracted.name}`, err)
        // Continue — don't let one company failure abort the run
      }
    }

    // 8. Update discovery run as completed
    await prisma.discoveryRun.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        companiesFound: savedCompanies.length,
        completedAt: new Date(),
      },
    })

    return {
      runId: run.id,
      companiesFound: savedCompanies.length,
      companies: savedCompanies,
    }
  } catch (err) {
    // Mark run as failed
    await prisma.discoveryRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        error: String(err),
        completedAt: new Date(),
      },
    })
    throw err
  }
}
