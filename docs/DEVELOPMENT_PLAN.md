# DEVELOPMENT PLAN — Lead Generation Bot

## Prerequisites

Before starting:
- [ ] Node.js 20+ installed
- [ ] Supabase account created (free tier)
- [ ] OpenAI account with API key
- [ ] Firecrawl account with API key (free tier: 500 credits)
- [ ] Vercel account connected to GitHub
- [ ] GitHub repo created

---

## Environment Variables

Create `.env.local` at project root:

```env
# Database (from Supabase → Settings → Database)
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# OpenAI
OPENAI_API_KEY="sk-..."

# Firecrawl
FIRECRAWL_API_KEY="fc-..."
```

---

## Full Dependency List

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "@prisma/client": "^5.x",
    "openai": "^4.x",
    "@mendable/firecrawl-js": "^1.x",
    "@tanstack/react-table": "^8.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "@types/node": "^20.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

### shadcn/ui Components Needed
```
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add tooltip
```

---

## Project Initialization Commands

```bash
# 1. Create Next.js app
npx create-next-app@latest leadgen-bot --js --tailwind --app --no-src-dir --import-alias "@/*"

cd leadgen-bot

# 2. Install dependencies
npm install @prisma/client openai @mendable/firecrawl-js @tanstack/react-table zod react-hook-form @hookform/resolvers date-fns lucide-react clsx tailwind-merge

npm install -D prisma typescript @types/node

# 3. Initialize Prisma
npx prisma init

# 4. Initialize shadcn/ui
npx shadcn@latest init
# Choose: Default style, Zinc base color, yes to CSS variables

# 5. Add shadcn components
npx shadcn@latest add button dialog sheet badge input label select card separator skeleton sonner tooltip

# 6. Push schema to Supabase
npx prisma db push

# 7. Generate Prisma client
npx prisma generate
```

---

## Day-by-Day Schedule

### Day 1 (Stages 1–4) — Foundation
**Goal:** App running with working dashboard displaying seed data.

- Stage 1: Project setup, dependencies, env vars (45 min)
- Stage 2: Prisma schema + Supabase migration (30 min)
- Stage 3: App shell — layout, sidebar, navigation (30 min)
- Stage 4: Companies dashboard with TanStack Table + seed data (60 min)

**End of Day 1:** Navigable app, working table with mock companies.

---

### Day 2 (Stages 5–7) — Core AI + API
**Goal:** Discovery pipeline working end-to-end in API.

- Stage 5: AI workflows — extraction, scoring, enrichment (60 min)
- Stage 6: Discovery pipeline + POST /api/discover (60 min)
- Stage 7: Companies API — GET with filters + DELETE (30 min)

**End of Day 2:** Can trigger discovery via API (curl/Postman), data appears in DB.

---

### Day 3 (Stages 8–10) — UI Integration + Polish
**Goal:** Fully usable UI connected to live backend.

- Stage 8: Discovery dialog + UI integration (45 min)
- Stage 9: Company detail sheet + enrichment action (45 min)
- Stage 10: Filters, sorting, badges, polish (30 min)

**End of Day 3:** Complete, usable product.

---

### Day 4 (Stage 11) — Deploy + Record
**Goal:** Live on Vercel with demo link.

- Stage 11: Deploy to Vercel + Supabase production (30 min)
- Buffer: Bug fixes, seeding demo data, Loom recording

---

## Development Order Rationale

1. **DB first** — Prisma schema defines the shape of everything. Changing it later is painful.
2. **UI shell before API** — Seeing the layout motivates development and reveals UX issues early.
3. **AI workflows before API routes** — Test prompts in isolation before wiring to HTTP.
4. **API before UI integration** — Verify data contracts before building forms.
5. **Polish last** — Filters and badges are cosmetic; core value must work first.

---

## File Structure (Final)

```
leadgen-bot/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   ├── dashboard/
│   │   └── page.js
│   └── api/
│       ├── discover/
│       │   └── route.ts
│       └── companies/
│           ├── route.ts
│           └── [id]/
│               ├── route.ts
│               └── enrich/
│                   └── route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   ├── dashboard/
│   │   ├── CompaniesTable.jsx
│   │   ├── columns.jsx
│   │   ├── FilterBar.jsx
│   │   ├── IntentBadge.jsx
│   │   └── SignalTags.jsx
│   ├── discovery/
│   │   └── DiscoverDialog.jsx
│   └── company/
│       └── CompanySheet.jsx
├── lib/
│   ├── prisma.ts
│   ├── openai.ts
│   ├── firecrawl.ts
│   ├── ai/
│   │   ├── extractCompanies.ts
│   │   ├── scoreIntent.ts
│   │   ├── enrichCompany.ts
│   │   └── schemas.ts
│   └── discovery/
│       └── pipeline.ts
├── prisma/
│   └── schema.prisma
├── .env.local
├── .env.example
└── package.json
```
