# DATABASE SCHEMA — Lead Generation Bot

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Company {
  id          String   @id @default(cuid())
  name        String
  nameKey     String   @unique // normalized: lowercase, trimmed (dedup key)
  website     String?
  industry    String?
  stage       String?  // seed | series-a | series-b | growth | enterprise | unknown
  description String?  @db.Text
  aiSummary   String?  @db.Text  // "Why this company is a good lead"
  intentScore Int      @default(0) // 0–100
  scoreReason String?  @db.Text   // AI reasoning for the score
  status      String   @default("new") // new | enriched | contacted | rejected
  rawData     Json?    // last scraped content blob
  signals     Signal[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([intentScore(sort: Desc)])
  @@index([industry])
  @@index([stage])
  @@index([status])
  @@map("companies")
}

model Signal {
  id          String   @id @default(cuid())
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  type        String   // hiring | funding | growth | expansion | keyword
  description String   @db.Text
  source      String?  // URL or source name
  detectedAt  DateTime @default(now())

  @@index([companyId])
  @@index([type])
  @@map("signals")
}

model DiscoveryRun {
  id             String    @id @default(cuid())
  industry       String?
  keywords       String?
  signalTypes    String[]  // ['hiring', 'funding', 'growth']
  status         String    @default("running") // running | completed | failed
  companiesFound Int       @default(0)
  error          String?   @db.Text
  startedAt      DateTime  @default(now())
  completedAt    DateTime?

  @@map("discovery_runs")
}
```

---

## Table Descriptions

### `companies`
Central table. One row per unique company discovered.

| Column       | Type    | Notes                                          |
|--------------|---------|------------------------------------------------|
| id           | cuid    | Primary key                                    |
| name         | string  | Display name                                   |
| nameKey      | string  | UNIQUE. `name.toLowerCase().trim()` — dedup key |
| website      | string? | Homepage URL                                   |
| industry     | string? | e.g. "B2B SaaS", "E-commerce", "Healthcare"   |
| stage        | string? | seed / series-a / series-b / growth / enterprise |
| description  | text?   | Plain-text company description                 |
| aiSummary    | text?   | AI-generated "why this is a good lead" blurb   |
| intentScore  | int     | 0–100. Higher = more likely to buy             |
| scoreReason  | text?   | AI reasoning (1-2 sentences)                   |
| status       | string  | new / enriched / contacted / rejected          |
| rawData      | json?   | Last raw scraped content (for debugging)       |

### `signals`
Each detected signal for a company. One company can have many signals.

| Column      | Type    | Notes                                         |
|-------------|---------|-----------------------------------------------|
| id          | cuid    | Primary key                                   |
| companyId   | string  | FK → companies.id                             |
| type        | string  | hiring / funding / growth / expansion / keyword |
| description | text    | Human-readable signal detail                  |
| source      | string? | URL or "Firecrawl Search"                     |

### `discovery_runs`
Audit log of each discovery run triggered.

| Column          | Type      | Notes                          |
|-----------------|-----------|--------------------------------|
| id              | cuid      | Primary key                    |
| industry        | string?   | Input param                    |
| keywords        | string?   | Input param                    |
| signalTypes     | string[]  | Input param                    |
| status          | string    | running / completed / failed   |
| companiesFound  | int       | Result count                   |
| error           | text?     | Error message if failed        |

---

## Signal Types Reference

| Type      | Example Description                                     |
|-----------|---------------------------------------------------------|
| hiring    | "Hiring 3 SDRs and a VP of Sales on LinkedIn"          |
| funding   | "Raised $5M Series A in October 2024"                  |
| growth    | "Expanded to APAC market, announced 3 new partnerships" |
| expansion | "Opening new offices in 2 cities, growing headcount"   |
| keyword   | "Mentioned 'outbound sales' and 'pipeline' on website" |

---

## Stage Values Reference

| Stage      | Meaning                              |
|------------|--------------------------------------|
| seed       | Pre-product or very early            |
| series-a   | ~$2M–$15M raised, finding PMF        |
| series-b   | ~$15M–$50M raised, scaling           |
| growth     | Post series B, scaling aggressively  |
| enterprise | Large established company            |
| unknown    | Could not determine                  |

---

## Setup Commands

```bash
# Initialize Prisma (already done in project setup)
npx prisma init

# After writing schema.prisma:
npx prisma db push        # Push schema to Supabase (dev)
npx prisma generate       # Generate Prisma client

# Inspect DB (optional)
npx prisma studio
```

---

## Environment Variables Required

```env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

Use `DATABASE_URL` for Prisma queries (pooled via pgBouncer).
Use `DIRECT_URL` for migrations (`prisma db push`).

Both are available in the Supabase dashboard under **Settings → Database → Connection String**.
