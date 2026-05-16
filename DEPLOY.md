# Kubryx — Deploy Guide

## Step 1: Supabase (5 minutes)
1. Go to supabase.com → New project
2. Name it: kubryx-db
3. Copy: Project URL, anon key, service key
4. Go to SQL Editor → paste contents of `database/schema.sql` → Run

## Step 2: Upstash Redis (2 minutes)
1. Go to upstash.com → New database
2. Name it: kubryx-redis
3. Copy: REDIS_URL (redis://... format)

## Step 3: API Keys (5 minutes)
1. Groq: console.groq.com → Create API key → copy
2. Gemini: aistudio.google.com → Get API key → copy
3. OpenRouter (optional, for ShadowLedger): openrouter.ai → copy

## Step 4: Render Blueprint Deploy (10 minutes)
1. Go to render.com → New → Blueprint
2. Connect GitHub repo: https://github.com/Kubryx/kubryx
3. It finds all 5 render.yaml files automatically
4. For each service, paste the env vars from `ENV_VARS.md`
5. Click Deploy All
6. Wait ~5 minutes per service for first build

## Step 5: PalmFlow on Vercel (5 minutes)
1. Go to vercel.com → New Project
2. Import: https://github.com/Kubryx/kubryx
3. Root Directory: `palmflowai/PalmFlow-AI-main`
4. Add env vars from `ENV_VARS.md` (PalmFlow section)
5. Deploy

## Step 6: Update Vercel env vars for hub (2 minutes)
1. Go to vercel.com → kubryx project → Settings → Environment Variables
2. Add all vars from `ENV_VARS.md` (Vercel hub section)
3. Replace placeholder URLs with real Render URLs
4. Redeploy: vercel.com → kubryx → Deployments → Redeploy

## Step 7: Verify
1. Run: `node scripts/health-check.js`
2. All 7 should show ✅
3. Open https://kubryx.vercel.app/dashboard
4. All 8 tool cards should show green "Live" status
