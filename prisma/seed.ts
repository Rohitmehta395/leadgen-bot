import { prisma } from '../lib/prisma'

const SEED_COMPANIES = [
  {
    name: 'CloudScale AI',
    nameKey: 'cloudscale ai',
    website: 'https://cloudscale.ai',
    industry: 'B2B SaaS',
    stage: 'series-a',
    intentScore: 91,
    scoreReason: 'Actively hiring 5 SDRs and a VP of Sales while simultaneously closing a Series A round — clear signal of an early-stage sales buildout.',
    aiSummary: 'CloudScale AI is a strong outbound candidate: Series A funding combined with aggressive sales hiring indicates they have budget and urgent need to scale pipeline.',
    status: 'new',
    signals: [
      { type: 'hiring',  description: 'Hiring 5 SDRs and a VP of Sales on LinkedIn',       source: 'linkedin.com/jobs' },
      { type: 'funding', description: 'Raised $9M Series A led by Sequoia in January 2025', source: 'techcrunch.com' },
    ],
  },
  {
    name: 'MedLink Health',
    nameKey: 'medlink health',
    website: 'https://medlinkhealth.io',
    industry: 'Health Tech',
    stage: 'series-b',
    intentScore: 84,
    scoreReason: 'Post Series B with active market expansion into EMEA — typical stage where outbound sales infrastructure becomes a bottleneck.',
    aiSummary: 'MedLink Health is expanding aggressively post-Series B and likely lacks the outbound infrastructure to support growth at scale.',
    status: 'enriched',
    signals: [
      { type: 'funding',   description: 'Closed $28M Series B in December 2024',                  source: 'crunchbase.com' },
      { type: 'expansion', description: 'Announced EMEA expansion, opening London and Berlin offices', source: 'medlinkhealth.io' },
      { type: 'hiring',    description: 'Hiring Regional Sales Managers in UK and Germany',         source: 'wellfound.com' },
    ],
  },
  {
    name: 'Growify',
    nameKey: 'growify',
    website: 'https://growify.com',
    industry: 'Marketing Tech',
    stage: 'seed',
    intentScore: 73,
    scoreReason: 'Early-stage with strong growth momentum and keyword signals suggesting they are aware of the need for outbound but have not yet invested in it.',
    aiSummary: 'Growify is a seed-stage marketing analytics startup with clear growth signals and explicit mentions of building an outbound sales motion.',
    status: 'new',
    signals: [
      { type: 'growth',   description: 'Signed 10 new enterprise customers in Q4 2024',         source: 'growify.com/blog' },
      { type: 'keyword',  description: 'CEO blog post mentions building outbound sales infrastructure', source: 'growify.com/blog' },
      { type: 'hiring',   description: 'Posting first BDR role on their careers page',           source: 'growify.com/careers' },
    ],
  },
  {
    name: 'DataPilot',
    nameKey: 'datapilot',
    website: 'https://datapilot.io',
    industry: 'Analytics SaaS',
    stage: 'growth',
    intentScore: 62,
    scoreReason: 'Strong growth signals and some sales hiring but appears to have an established sales team — moderate opportunity.',
    aiSummary: 'DataPilot is growing but may already have internal sales capacity. Worth exploring for outbound augmentation rather than full outsourcing.',
    status: 'new',
    signals: [
      { type: 'growth',  description: 'Grew ARR from $2M to $8M in 2024',         source: 'datapilot.io/about' },
      { type: 'hiring',  description: 'Hiring 2 Account Executives (not SDRs)',    source: 'linkedin.com/jobs' },
    ],
  },
  {
    name: 'RetailOS',
    nameKey: 'retailos',
    website: 'https://retailos.co',
    industry: 'E-commerce Tech',
    stage: 'seed',
    intentScore: 48,
    scoreReason: 'Some growth signals but no direct sales hiring and no funding — limited budget signal at this stage.',
    aiSummary: 'RetailOS shows early growth but lacks the funding or sales hiring signals that indicate readiness to invest in outbound infrastructure.',
    status: 'new',
    signals: [
      { type: 'growth',   description: 'Expanded to 3 new US cities in Q1 2025',   source: 'retailos.co/news' },
      { type: 'keyword',  description: 'Job description mentions pipeline generation', source: 'retailos.co/careers' },
    ],
  },
  {
    name: 'FinTrack Pro',
    nameKey: 'fintrack pro',
    website: 'https://fintrackpro.com',
    industry: 'FinTech SaaS',
    stage: 'series-a',
    intentScore: 88,
    scoreReason: 'Series A funded with explicit intent to build outbound team and a job post for Head of Sales Development — textbook buying signal.',
    aiSummary: 'FinTrack Pro is actively building an outbound sales function post-Series A — a highly qualified prospect for appointment-setting services.',
    status: 'new',
    signals: [
      { type: 'funding',  description: 'Raised $6.5M Series A in February 2025',                    source: 'techcrunch.com' },
      { type: 'hiring',   description: 'Hiring Head of Sales Development and 3 SDRs',               source: 'linkedin.com/jobs' },
      { type: 'growth',   description: 'Onboarded 40 new SMB clients in Q4 2024',                   source: 'fintrackpro.com/blog' },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing seed data
  await prisma.signal.deleteMany()
  await prisma.company.deleteMany()
  await prisma.discoveryRun.deleteMany()

  for (const seed of SEED_COMPANIES) {
    const { signals, ...companyData } = seed

    const company = await prisma.company.create({
      data: {
        ...companyData,
        signals: {
          create: signals.map((s) => ({
            ...s,
            source: s.source ?? 'Seed Data',
          })),
        },
      },
    })

    console.log(`  ✓ ${company.name} (score: ${company.intentScore})`)
  }

  console.log(`\n✅ Seeded ${SEED_COMPANIES.length} companies successfully.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
