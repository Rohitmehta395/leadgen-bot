# TASKS — Stage Roadmap

## Overview

| Stage | Name                          | Est. Time | Dependencies |
|-------|-------------------------------|-----------|--------------|
| 1     | Project Setup & Configuration | 45 min    | None         |
| 2     | Database Schema & Prisma      | 30 min    | Stage 1      |
| 3     | Application Shell & Layout    | 30 min    | Stage 1      |
| 4     | Companies Dashboard UI        | 60 min    | Stage 3      |
| 5     | AI Workflows                  | 60 min    | Stage 2      |
| 6     | Discovery Pipeline & API      | 60 min    | Stages 2, 5  |
| 7     | Companies API Routes          | 30 min    | Stage 2      |
| 8     | Discovery UI Integration      | 45 min    | Stages 4, 6  |
| 9     | Company Detail Sheet          | 45 min    | Stages 4, 7  |
| 10    | Filters, Sort & Polish        | 30 min    | Stages 8, 9  |
| 11    | Deployment                    | 30 min    | Stage 10     |

**Total estimated time:** ~8.5 hours of focused work

---

## Stage 1 — Project Setup & Configuration
**Time:** 45 min | **Deps:** None

### Objective
Next.js 15 app running locally with all dependencies installed and environment configured.

### Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] Tailwind CSS working (test with a colored div)
- [ ] shadcn/ui initialized with zinc color scheme
- [ ] `.env.local` created with all 4 env vars
- [ ] `prisma/schema.prisma` file exists (Prisma initialized)
- [ ] TypeScript compiles without errors

---

## Stage 2 — Database Schema & Prisma
**Time:** 30 min | **Deps:** Stage 1

### Objective
Prisma schema applied to Supabase. Client generated and connection verified.

### Acceptance Criteria
- [ ] `schema.prisma` contains `Company`, `Signal`, `DiscoveryRun` models
- [ ] `npx prisma db push` completes successfully
- [ ] `npx prisma generate` completes successfully
- [ ] Supabase Table Editor shows all 3 tables
- [ ] Prisma singleton client created at `lib/prisma.ts`
- [ ] Test query in a route handler returns `[]` without errors

---

## Stage 3 — Application Shell & Layout
**Time:** 30 min | **Deps:** Stage 1

### Objective
Root layout with sidebar navigation. `/dashboard` page accessible. Clean, professional shell.

### Acceptance Criteria
- [ ] Root layout renders sidebar + main content area
- [ ] Sidebar shows app name/logo and nav link to Dashboard
- [ ] `/dashboard` page loads without errors
- [ ] Layout is responsive (sidebar collapses appropriately on small screens)
- [ ] Page title "Lead Intelligence" visible in sidebar header
- [ ] No console errors

---

## Stage 4 — Companies Dashboard UI
**Time:** 60 min | **Deps:** Stage 3

### Objective
Companies table rendering with mock/seed data. All visual components built. No real API connection yet.

### Acceptance Criteria
- [ ] TanStack Table renders with mock data (5–10 hardcoded companies)
- [ ] Columns: Company Name (with website link), Industry, Stage badge, Intent Score badge, Signals, Actions
- [ ] IntentBadge: green (80+), yellow (50–79), red (<50)
- [ ] SignalTags render signal type chips (hiring, funding, etc.)
- [ ] Actions column: Delete button visible
- [ ] Table is sortable by clicking column headers
- [ ] Empty state message when no companies
- [ ] "Run Discovery" button visible in top-right (not wired yet)

---

## Stage 5 — AI Workflows
**Time:** 60 min | **Deps:** Stage 2

### Objective
All three AI workflow functions built and individually testable. OpenAI and Firecrawl clients configured.

### Acceptance Criteria
- [ ] `lib/openai.ts` exports configured OpenAI client
- [ ] `lib/firecrawl.ts` exports configured Firecrawl client
- [ ] `lib/ai/schemas.ts` contains all Zod schemas
- [ ] `lib/ai/extractCompanies.ts` — function accepts content string, returns typed company array
- [ ] `lib/ai/scoreIntent.ts` — function accepts signals, returns `{score, reasoning, summary}`
- [ ] `lib/ai/enrichCompany.ts` — function accepts scraped content, returns enrichment object
- [ ] Manual test: call `extractCompanies` with sample text, verify typed output
- [ ] Manual test: call `scoreIntent` with mock signals, verify score 0–100

---

## Stage 6 — Discovery Pipeline & API
**Time:** 60 min | **Deps:** Stages 2, 5

### Objective
`POST /api/discover` works end-to-end. Firecrawl → OpenAI → Prisma upsert pipeline complete.

### Acceptance Criteria
- [ ] `lib/discovery/pipeline.ts` orchestrates: search → extract → score → upsert
- [ ] Firecrawl search runs for 2–3 query variants
- [ ] Companies are upserted by `nameKey` (no duplicates on re-run)
- [ ] Signals are created for each company
- [ ] `DiscoveryRun` record is created and updated with status + count
- [ ] `POST /api/discover` with `{industry: "B2B SaaS", signalTypes: ["hiring"]}` returns 200 with companies array
- [ ] Test via curl: response contains at least 1 company with signals and score
- [ ] Error cases return proper status codes (400 for bad input, 500 for pipeline failure)

---

## Stage 7 — Companies API Routes
**Time:** 30 min | **Deps:** Stage 2

### Objective
All company CRUD routes working. Filters and sort apply correctly at the DB query level.

### Acceptance Criteria
- [ ] `GET /api/companies` returns companies with signals included
- [ ] `GET /api/companies?industry=SaaS` filters correctly
- [ ] `GET /api/companies?minScore=60` filters correctly
- [ ] `GET /api/companies?sortBy=intentScore&sortDir=desc` sorts correctly
- [ ] `GET /api/companies?search=acme` does partial name match
- [ ] `GET /api/companies/[id]` returns single company or 404
- [ ] `DELETE /api/companies/[id]` removes company and its signals (cascade)
- [ ] `POST /api/companies/[id]/enrich` — calls Firecrawl + AI, updates company, returns updated object

---

## Stage 8 — Discovery UI Integration
**Time:** 45 min | **Deps:** Stages 4, 6

### Objective
"Run Discovery" button opens a dialog. Submitting it calls the API and refreshes the table with results.

### Acceptance Criteria
- [ ] "Run Discovery" button opens `DiscoverDialog` modal
- [ ] Form fields: Industry (text input), Signal Types (checkboxes: hiring, funding, growth, expansion), Keywords (optional text)
- [ ] Form validates with react-hook-form + zod
- [ ] On submit: button shows loading state, dialog stays open
- [ ] On success: dialog closes, table refreshes with new companies, toast notification shows "Found X companies"
- [ ] On error: error message shown inside dialog, user can retry
- [ ] New companies appear at top of table (sorted by score desc)

---

## Stage 9 — Company Detail Sheet
**Time:** 45 min | **Deps:** Stages 4, 7

### Acceptance Criteria
- [ ] Clicking a company row opens a slide-out `Sheet` (right side)
- [ ] Sheet displays: company name, website (clickable link), industry, stage, intent score, AI summary, score reasoning
- [ ] All signals listed with type badge, description, source, and date
- [ ] "Enrich" button calls `POST /api/companies/[id]/enrich`
- [ ] Enrich shows loading state on button
- [ ] After enrich: sheet data updates, toast shows "Company enriched"
- [ ] Close button (X) dismisses the sheet
- [ ] Sheet doesn't break when optional fields (website, summary) are null

---

## Stage 10 — Filters, Sort & Polish
**Time:** 30 min | **Deps:** Stages 8, 9

### Objective
FilterBar functional, table connected to real API data, visual polish complete.

### Acceptance Criteria
- [ ] `FilterBar` renders above table with: Industry input, Stage select, Min Score slider or input, Signal Type select
- [ ] Changing any filter re-fetches `GET /api/companies` with updated params
- [ ] Filters debounce correctly (300ms) to avoid excessive API calls
- [ ] Table shows real data from API (not mock data)
- [ ] Delete action removes row from table immediately (optimistic) and calls DELETE API
- [ ] Loading skeleton shows while data fetches
- [ ] Column headers trigger sort (intent score, date added)
- [ ] No layout shifts or hydration errors in console

---

## Stage 11 — Deployment
**Time:** 30 min | **Deps:** Stage 10

### Acceptance Criteria
- [ ] `vercel.json` created with function timeout config (60s for discover, 30s for enrich)
- [ ] `package.json` has `"postinstall": "prisma generate"` and `"build": "prisma generate && next build"`
- [ ] `.env.example` committed (no real values)
- [ ] All 4 env vars added to Vercel project settings
- [ ] `vercel --prod` or GitHub push deploys without build errors
- [ ] Live URL loads dashboard
- [ ] Live URL can complete a discovery run end-to-end
- [ ] `GET /api/companies` returns data on production URL
- [ ] No 500 errors in Vercel function logs
