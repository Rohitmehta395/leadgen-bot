# PRD — Lead Generation Bot (V1 POC)

## Problem Statement

Sales outreach teams spend hours manually identifying companies that are likely buyers of outbound SDR services. This process is slow, inconsistent, and does not scale. We need an internal tool that automatically surfaces high-intent companies using public signals and ranks them by purchase likelihood.

---

## V1 Scope

### In Scope
- User-triggered company discovery via keyword/industry search
- Signal detection: hiring (SDRs/sales), funding mentions, growth keywords
- AI-based intent scoring (0–100)
- Company enrichment: name, website, industry, stage, AI summary
- Dashboard: table view with sort, filter, and score display
- Company detail panel with signal breakdown

### Out of Scope (V1)
- Automated/scheduled pipelines
- Contact extraction or email finding
- CRM integrations (HubSpot, Salesforce)
- Multi-user / team workspaces
- Email outreach from within the app
- Real-time signal monitoring
- Custom ICP builder

---

## User Stories

1. **As a sales rep**, I can trigger a discovery run by entering an industry and keywords so that the system finds relevant companies automatically.
2. **As a sales rep**, I can see a ranked list of companies sorted by intent score so I know where to focus first.
3. **As a sales rep**, I can see why a company was flagged (signals detected) so I can personalize outreach.
4. **As a sales rep**, I can filter companies by industry, stage, and minimum intent score so I only see relevant leads.
5. **As a sales rep**, I can click a company to see a full detail panel including AI summary and all signals.
6. **As a sales rep**, I can enrich a company on demand to pull fresh data from their website.
7. **As a sales rep**, I can remove irrelevant companies from the list.

---

## Success Criteria (POC)

- Discovery run completes and returns ≥5 companies for a given query
- Each company has: name, website, industry, stage, intent score, ≥1 signal
- Intent score is explainable (reasoning visible in UI)
- Dashboard loads in under 2 seconds
- Filters reduce list correctly
- Deployable to Vercel with live URL

---

## V1 vs V2

### V1 (This Build)
**Chosen scope:** Manual-trigger discovery using Firecrawl search + OpenAI extraction. Single-user internal tool. Focus on proving the value loop: signal → score → decision.

**Why this scope:** The core value hypothesis is "AI can surface better leads faster than manual research." V1 proves that with the minimum viable feature set.

### V2 (Next Iteration)
- Scheduled discovery pipelines (cron-based)
- Contact extraction (email/LinkedIn via Apollo or Hunter.io)
- ICP definition UI (define your ideal customer, system scores against it)
- CRM push (HubSpot/Salesforce one-click export)
- More signal sources: Reddit, G2 reviews, LinkedIn job posts, news APIs
- Smarter scoring model with historical feedback loop
- Lead status workflow (New → Contacted → Qualified → Rejected)
- Team workspaces and assignment
