# ARCHITECTURE — Lead Generation Bot

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 15 App                        │
│                                                              │
│  ┌──────────────┐        ┌──────────────────────────────┐   │
│  │   Frontend   │        │       Route Handlers          │   │
│  │  (JS/React)  │◄──────►│       (TypeScript)           │   │
│  │  Tailwind    │        │                              │   │
│  │  shadcn/ui   │        │  POST /api/discover          │   │
│  │  TanStack    │        │  GET  /api/companies         │   │
│  │    Table     │        │  GET  /api/companies/[id]    │   │
│  └──────────────┘        │  POST /api/companies/[id]/   │   │
│                          │       enrich                  │   │
│                          │  DELETE /api/companies/[id]  │   │
│                          └──────────┬───────────────────┘   │
└─────────────────────────────────────┼───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                        │
              ▼                       ▼                        ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐
    │   Supabase /     │  │   OpenAI API     │  │  Firecrawl API     │
    │   PostgreSQL     │  │  (GPT-4o-mini)   │  │  Search + Scrape   │
    │   Prisma ORM     │  │  Structured      │  │                    │
    │                  │  │  Outputs         │  │                    │
    └──────────────────┘  └──────────────────┘  └────────────────────┘
```

---

## Component Architecture

### Frontend (app/)
```
app/
├── layout.js              # Root layout — sidebar + topbar shell
├── page.js                # Redirect to /dashboard
├── dashboard/
│   └── page.js            # Main companies dashboard
└── globals.css
```

### Components
```
components/
├── layout/
│   ├── Sidebar.jsx        # Nav links
│   └── Topbar.jsx         # Page title + actions
├── dashboard/
│   ├── CompaniesTable.jsx  # TanStack Table wrapper
│   ├── columns.jsx         # Column definitions
│   ├── FilterBar.jsx       # Industry, stage, score filters
│   ├── IntentBadge.jsx     # Color-coded score badge
│   └── SignalTags.jsx      # Signal type chips
├── discovery/
│   ├── DiscoverDialog.jsx  # Modal to trigger discovery run
│   └── DiscoveryStatus.jsx # Loading/progress state
└── company/
    └── CompanySheet.jsx    # Slide-out detail panel
```

### Route Handlers (app/api/)
```
app/api/
├── discover/
│   └── route.ts           # POST — trigger discovery pipeline
├── companies/
│   ├── route.ts           # GET — list with filters
│   └── [id]/
│       ├── route.ts       # GET + DELETE
│       └── enrich/
│           └── route.ts   # POST — enrich single company
```

### Backend Services (lib/)
```
lib/
├── prisma.ts              # Prisma client singleton
├── openai.ts              # OpenAI client
├── firecrawl.ts           # Firecrawl client
├── ai/
│   ├── extractCompanies.ts   # Signal extraction workflow
│   ├── scoreIntent.ts        # Intent scoring workflow
│   └── enrichCompany.ts      # Enrichment workflow
└── discovery/
    └── pipeline.ts        # Orchestrates full discovery flow
```

---

## Discovery Data Flow

```
User submits query {industry, keywords, signals}
        │
        ▼
POST /api/discover
        │
        ▼
Build search queries (2-3 variants)
        │
        ▼
Firecrawl /search (for each query, get top 5 results)
        │
        ▼
Concat scraped content → single context block
        │
        ▼
OpenAI: extractCompanies(content)
→ Returns: [{name, website, industry, stage, signals[]}]
        │
        ▼
For each unique company:
  OpenAI: scoreIntent(signals)
  → Returns: {score, reasoning, summary}
        │
        ▼
Upsert to DB (companies + signals)
        │
        ▼
Return {companiesFound, companies[]}
```

## Enrichment Data Flow

```
User clicks "Enrich" on a company
        │
        ▼
POST /api/companies/[id]/enrich
        │
        ▼
Firecrawl /scrape company website
        │
        ▼
OpenAI: enrichCompany(scrapedContent)
→ Returns: {description, industry, stage, additionalSignals[]}
        │
        ▼
Re-score intent with new signals
        │
        ▼
Update company in DB
        │
        ▼
Return updated company
```

---

## Key Design Decisions

### 1. Synchronous Discovery (no background jobs)
Discovery runs synchronously in a route handler, capped at 5 companies per run. This avoids the complexity of queues or cron jobs for a POC. Vercel's default 60s function timeout is sufficient.

### 2. OpenAI Structured Outputs via Zod
All AI responses use `response_format: {type: "json_schema"}` with Zod-derived schemas. This eliminates parsing errors and provides type safety throughout.

### 3. Upsert by Company Name
Companies are upserted by normalized name to prevent duplicates across multiple discovery runs. `name.toLowerCase().trim()` is the dedup key.

### 4. Prisma on Supabase (direct connection)
Using Prisma with Supabase's direct connection string (not the connection pooler) for simplicity. This is fine for a single-user POC with low concurrency.

### 5. No Auth for V1
This is an internal tool POC. No authentication layer. Ship faster, add auth in V2.

---

## External Services

| Service    | Usage                           | Free Tier Limit           |
|------------|----------------------------------|---------------------------|
| Firecrawl  | Search + scrape web content     | 500 credits/month         |
| OpenAI     | Signal extraction, scoring, enrichment | Pay per token      |
| Supabase   | PostgreSQL database             | 500MB, 2 projects free    |
| Vercel     | Hosting, route handlers         | Hobby tier sufficient     |
