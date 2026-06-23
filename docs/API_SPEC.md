# API SPEC — Lead Generation Bot

## Base URL
```
/api
```

## Standard Error Format
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

---

## Endpoints

### 1. `POST /api/discover`
Triggers a discovery pipeline run. Synchronous — waits for completion. Capped at 5 companies per run.

**Request Body**
```typescript
{
  industry: string;        // e.g. "B2B SaaS", "Dental Clinics"
  keywords?: string;       // e.g. "outbound sales, pipeline growth"
  signalTypes: string[];   // ["hiring", "funding", "growth"] — at least one required
  location?: string;       // e.g. "United States" — optional
}
```

**Validation (Zod)**
```typescript
z.object({
  industry: z.string().min(2).max(100),
  keywords: z.string().max(200).optional(),
  signalTypes: z.array(z.enum(['hiring', 'funding', 'growth', 'expansion', 'keyword'])).min(1),
  location: z.string().max(100).optional(),
})
```

**Response 200**
```typescript
{
  runId: string;
  companiesFound: number;
  companies: Company[];    // Full company objects with signals
}
```

**Response 400** — Invalid request body
**Response 500** — Discovery pipeline failed

---

### 2. `GET /api/companies`
Returns paginated, filterable, sortable list of companies.

**Query Parameters**
```
industry     string   Filter by industry (partial match)
stage        string   Filter by stage (exact match)
minScore     number   Minimum intent score (0–100)
maxScore     number   Maximum intent score (0–100)
status       string   Filter by status
signalType   string   Filter by signal type present
search       string   Search by company name (partial match)
sortBy       string   "intentScore" | "createdAt" — default: "intentScore"
sortDir      string   "asc" | "desc" — default: "desc"
page         number   default: 1
pageSize     number   default: 50, max: 100
```

**Response 200**
```typescript
{
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

Where `Company` is:
```typescript
{
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  stage: string | null;
  description: string | null;
  aiSummary: string | null;
  intentScore: number;
  scoreReason: string | null;
  status: string;
  signals: Signal[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

Signal = {
  id: string;
  type: string;
  description: string;
  source: string | null;
  detectedAt: string; // ISO
}
```

---

### 3. `GET /api/companies/[id]`
Returns a single company with full signals.

**Response 200** — Full `Company` object (same shape as above)
**Response 404** — Company not found

---

### 4. `DELETE /api/companies/[id]`
Removes a company and its signals (cascade).

**Response 200**
```json
{ "success": true }
```
**Response 404** — Company not found

---

### 5. `POST /api/companies/[id]/enrich`
Re-scrapes the company website and updates enrichment fields. Updates intent score.

**Request Body** — empty `{}`

**Response 200**
```typescript
{
  company: Company;  // Updated company object
  enriched: boolean; // false if website not available
}
```

**Response 404** — Company not found
**Response 422** — Company has no website to enrich

---

## Internal Service Types

### DiscoveryInput
```typescript
interface DiscoveryInput {
  industry: string;
  keywords?: string;
  signalTypes: string[];
  location?: string;
}
```

### ExtractedCompany (from OpenAI)
```typescript
interface ExtractedCompany {
  name: string;
  website: string | null;
  industry: string | null;
  stage: 'seed' | 'series-a' | 'series-b' | 'growth' | 'enterprise' | 'unknown';
  signals: Array<{
    type: 'hiring' | 'funding' | 'growth' | 'expansion' | 'keyword';
    description: string;
    source: string | null;
  }>;
}
```

### IntentScore (from OpenAI)
```typescript
interface IntentScore {
  score: number;      // 0–100
  reasoning: string;  // 1-2 sentence explanation
  summary: string;    // 1 sentence "why this is a good lead"
}
```

---

## Firecrawl Search Query Construction

Given input `{industry: "B2B SaaS", signalTypes: ["hiring", "funding"], keywords: "outbound sales"}`:

```
Query 1: "B2B SaaS company hiring sales development representative outbound"
Query 2: "B2B SaaS startup recently funded 2024 2025 series A"
Query 3: "B2B SaaS outbound sales pipeline growth"
```

Each query goes to Firecrawl `/search`, returns top 3-5 scraped results.
All results are concatenated and sent to OpenAI for extraction.
