# AI WORKFLOWS — Lead Generation Bot

## Overview

Three AI workflows power the platform. All use `gpt-4o-mini` for cost efficiency. All use OpenAI Structured Outputs to guarantee typed responses.

| Workflow             | Input                     | Output                     | Trigger               |
|----------------------|---------------------------|----------------------------|-----------------------|
| Signal Extraction    | Scraped web content       | Company array + signals    | Discovery run         |
| Intent Scoring       | Signals array             | Score + reasoning          | After extraction      |
| Company Enrichment   | Scraped company website   | Description + new signals  | Manual or auto        |

---

## Workflow 1: Signal Extraction

**File:** `lib/ai/extractCompanies.ts`

### Purpose
Process raw scraped content from Firecrawl search results and identify distinct companies along with the intent signals detected for each.

### Input
- `content: string` — concatenated text from multiple scraped pages
- `context: { industry: string, signalTypes: string[], keywords?: string }` — what we were searching for

### Zod Schema
```typescript
const ExtractedSignalSchema = z.object({
  type: z.enum(['hiring', 'funding', 'growth', 'expansion', 'keyword']),
  description: z.string(),
  source: z.string().nullable(),
});

const ExtractedCompanySchema = z.object({
  name: z.string(),
  website: z.string().nullable(),
  industry: z.string().nullable(),
  stage: z.enum(['seed', 'series-a', 'series-b', 'growth', 'enterprise', 'unknown']),
  signals: z.array(ExtractedSignalSchema),
});

const ExtractionResultSchema = z.object({
  companies: z.array(ExtractedCompanySchema),
});
```

### System Prompt
```
You are a B2B sales intelligence analyst. Your job is to extract companies from web content 
and identify signals that indicate they might need sales outreach or appointment-setting services.

Signal types to look for:
- hiring: Company is actively hiring for sales roles (SDR, BDR, AE, VP Sales, Sales Manager)
- funding: Company recently raised funding (any round)
- growth: Company is growing — new markets, partnerships, revenue milestones, customer wins
- expansion: Company is expanding headcount, offices, or product lines
- keyword: Company explicitly mentions needing sales help, outbound strategy, or pipeline growth

Rules:
- Only extract companies that have at least one signal
- Be specific in signal descriptions — include the actual detail found (e.g. "Raised $8M Series A in November 2024")
- Stage: estimate based on funding, company size, or description
- If website is mentioned, include it (with https://)
- Deduplicate: if the same company appears multiple times, merge their signals
- Return an empty array if no qualifying companies are found
```

### User Prompt Template
```
I searched for companies in the {industry} industry with signals: {signalTypes}.
{keywords ? `Additional keywords: ${keywords}` : ''}

Here is the scraped web content to analyze:

---
{content}
---

Extract all companies mentioned that show intent signals relevant to needing sales outreach support.
```

---

## Workflow 2: Intent Scoring

**File:** `lib/ai/scoreIntent.ts`

### Purpose
Given a company's signals, assign an intent score from 0–100 representing likelihood to purchase outbound sales/SDR services.

### Input
- `company: { name: string, industry: string?, stage: string?, signals: Signal[] }`

### Zod Schema
```typescript
const IntentScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
  summary: z.string(),
});
```

### System Prompt
```
You are a sales intelligence scoring engine. Score companies from 0–100 on how likely they 
are to need and purchase outbound sales services or appointment-setting support.

Scoring framework:
- 80–100: Strong signals. Hiring sales roles + recent funding, or multiple strong growth signals. Very likely to buy.
- 60–79: Good signals. Hiring OR funding, combined with growth indicators. Worth pursuing.
- 40–59: Moderate signals. Some growth but unclear sales need, or early-stage with limited budget.
- 20–39: Weak signals. Established company with no clear sales expansion need.
- 0–19: Poor fit. No clear signals or signals suggest they already have strong internal sales capacity.

Positive factors (add to score):
- Hiring SDRs/BDRs/sales roles: +20–30
- Recent funding (Series A/B especially): +15–25
- Small current sales team (opportunity): +10–15
- Active growth / expansion signals: +10–20
- B2B company (higher need for outbound): +5–10
- Early stage (< 50 employees): +5

Negative factors (reduce score):
- Already has large sales team (50+ sellers): -15
- Enterprise company with established processes: -10
- No growth signals at all: -20
- Consumer-facing (B2C) company: -10

Return a score, a 1–2 sentence reasoning, and a 1-sentence summary of why this company is or isn't a good lead.
```

### User Prompt Template
```
Company: {name}
Industry: {industry || 'Unknown'}
Stage: {stage || 'Unknown'}

Detected signals:
{signals.map(s => `- [${s.type.toUpperCase()}] ${s.description}`).join('\n')}

Score this company's intent to purchase outbound sales or appointment-setting services.
```

---

## Workflow 3: Company Enrichment

**File:** `lib/ai/enrichCompany.ts`

### Purpose
Given scraped content from a company's own website, extract structured enrichment data and identify additional signals.

### Input
- `content: string` — scraped homepage/about page content
- `existingData: { name: string, signals: Signal[] }` — what we already know

### Zod Schema
```typescript
const EnrichmentResultSchema = z.object({
  description: z.string().nullable(),
  industry: z.string().nullable(),
  stage: z.enum(['seed', 'series-a', 'series-b', 'growth', 'enterprise', 'unknown']).nullable(),
  additionalSignals: z.array(z.object({
    type: z.enum(['hiring', 'funding', 'growth', 'expansion', 'keyword']),
    description: z.string(),
  })),
});
```

### System Prompt
```
You are a B2B company research analyst. Analyze a company's website content and extract 
structured information for a sales intelligence platform.

Extract:
- description: A 2–3 sentence factual description of what the company does
- industry: The specific industry vertical (be specific, e.g. "HR Tech SaaS" not just "Software")
- stage: Estimate their company stage based on language, team size mentions, product maturity
- additionalSignals: Any new signals found on the site indicating sales/growth needs
  (look for: job listings, team page size, "we're hiring", funding announcements, expansion news)

Return null for fields you cannot determine. Keep descriptions factual and concise.
```

---

## OpenAI Client Setup

```typescript
// lib/openai.ts
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { zodResponseFormat };
```

## Usage Pattern (Structured Outputs)

```typescript
import { openai, zodResponseFormat } from '@/lib/openai';
import { IntentScoreSchema } from './schemas';

const completion = await openai.beta.chat.completions.parse({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
  response_format: zodResponseFormat(IntentScoreSchema, 'intent_score'),
});

const result = completion.choices[0].message.parsed;
// result is fully typed as IntentScore
```

---

## Content Truncation

Firecrawl can return large amounts of text. Truncate before sending to OpenAI:

```typescript
const MAX_CONTENT_LENGTH = 12000; // ~3000 tokens, safe for gpt-4o-mini's context

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) return content;
  return content.slice(0, MAX_CONTENT_LENGTH) + '\n...[truncated]';
}
```

---

## Estimated Token Usage Per Discovery Run

| Step                    | ~Tokens  | ~Cost (gpt-4o-mini) |
|-------------------------|----------|----------------------|
| Signal extraction       | ~4,000   | ~$0.001              |
| Scoring (×5 companies)  | ~500 each = 2,500 | ~$0.001   |
| **Total per run**       | ~6,500   | ~$0.002              |

Very cheap. A thousand discovery runs costs ~$2.
