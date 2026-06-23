# DEPLOYMENT — Lead Generation Bot

## Stack
- **Frontend + API:** Vercel (Next.js)
- **Database:** Supabase (PostgreSQL)

---

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, strong password, region (pick closest to you)
3. Wait for project to provision (~2 min)

### Get Connection Strings
Settings → Database → Connection String

Copy both:
- **Transaction pooler** (for `DATABASE_URL`) — port 6543, has `?pgbouncer=true`
- **Direct connection** (for `DIRECT_URL`) — port 5432

### Push Schema to Supabase
```bash
# With .env.local configured:
npx prisma db push
```

Verify in Supabase → Table Editor — you should see `companies`, `signals`, `discovery_runs`.

---

## Step 2: Vercel Deployment

### Option A: Via Vercel CLI (fastest)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Via GitHub (recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Framework: Next.js (auto-detected)
5. **Do not deploy yet** — add env vars first

### Environment Variables in Vercel
Go to Project → Settings → Environment Variables. Add all of:

| Key                | Value                             | Environment      |
|--------------------|-----------------------------------|------------------|
| `DATABASE_URL`     | Supabase pooled connection string | Production, Preview |
| `DIRECT_URL`       | Supabase direct connection string | Production, Preview |
| `OPENAI_API_KEY`   | `sk-...`                          | Production, Preview |
| `FIRECRAWL_API_KEY`| `fc-...`                          | Production, Preview |

Then click **Deploy**.

---

## Step 3: Vercel Function Timeout

Discovery runs can take 20–40 seconds. Increase timeout to avoid 504 errors.

Create `vercel.json` at project root:

```json
{
  "functions": {
    "app/api/discover/route.ts": {
      "maxDuration": 60
    },
    "app/api/companies/[id]/enrich/route.ts": {
      "maxDuration": 30
    }
  }
}
```

Commit and push.

---

## Step 4: Post-Deploy Verification

After deployment, run these checks:

```bash
# 1. Check companies endpoint returns empty array
curl https://your-app.vercel.app/api/companies

# 2. Trigger a test discovery run
curl -X POST https://your-app.vercel.app/api/discover \
  -H "Content-Type: application/json" \
  -d '{"industry": "B2B SaaS", "signalTypes": ["hiring", "funding"]}'

# 3. Check companies were added
curl https://your-app.vercel.app/api/companies
```

---

## Environment Variables Reference

```env
# .env.example (commit this, not .env.local)

# Supabase PostgreSQL — get from: Project Settings → Database → Connection String
DATABASE_URL=""     # Use "Transaction pooler" string (port 6543)
DIRECT_URL=""       # Use "Direct connection" string (port 5432)

# OpenAI — get from: platform.openai.com/api-keys
OPENAI_API_KEY=""

# Firecrawl — get from: firecrawl.dev/app/api-keys
FIRECRAWL_API_KEY=""
```

---

## Supabase Free Tier Limits

| Resource         | Limit          | Notes                              |
|------------------|----------------|------------------------------------|
| Database size    | 500 MB         | More than enough for a POC         |
| Bandwidth        | 5 GB/month     | Fine for internal tool             |
| API requests     | Unlimited       |                                    |
| Projects         | 2 active        |                                    |

---

## Vercel Free Tier Limits

| Resource             | Limit           | Notes                                    |
|----------------------|-----------------|------------------------------------------|
| Serverless Functions | 100 GB-hours/mo | Fine for POC                             |
| Function timeout     | 60s (Hobby)     | Set in `vercel.json` as shown above      |
| Deployments          | Unlimited        |                                          |
| Bandwidth            | 100 GB/mo       | More than enough                         |

---

## Prisma + Vercel Note

Add this to `package.json` scripts to ensure Prisma client is generated during Vercel build:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

---

## Quick Redeploy After Changes

```bash
# If using Vercel CLI:
vercel --prod

# If using GitHub integration:
git add .
git commit -m "fix: ..."
git push  # auto-deploys
```
