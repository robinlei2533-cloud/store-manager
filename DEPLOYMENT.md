# Store Manager — Deployment Guide

## What You Need (6 minutes total)

1. A [Supabase](https://supabase.com) account (free)
2. A [Vercel](https://vercel.com) account (free, login with GitHub)
3. A [GitHub](https://github.com) account (free)

---

## Step 1: Upload Project to GitHub (2 min)

1. Go to [github.com](https://github.com) → click **New repository**
2. Name it `store-manager` → click **Create repository**
3. Drag and drop all files from this project folder into the GitHub upload area
4. Click **Commit changes**

> Or if you have Git installed:
> ```bash
> git init
> git add .
> git commit -m "Store Manager initial release"
> git remote add origin https://github.com/YOUR_USERNAME/store-manager.git
> git push -u origin main
> ```

---

## Step 2: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → Sign Up (use GitHub login)
2. Click **New Project**
   - Name: `store-manager`
   - Database Password: set any password, **write it down**
   - Region: choose closest to you
   - Click **Create** → wait ~2 minutes

3. Once created, go to **SQL Editor** (left sidebar) → **New query**
4. Open the file `database/migration.sql` from this project
5. Copy ALL content → paste into Supabase SQL Editor → click **Run**
   > This creates all 14 tables, security rules, triggers, and demo data

6. Go to **Storage** (left sidebar) → **New bucket**
   - Name: `visit-photos`
   - Public: ✅ check the box
   - Click **Create**

7. Go to **Settings** → **API** (left sidebar)
   - Copy **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy **anon public key** (a long string)

---

## Step 3: Deploy to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com) → Sign Up / Login with GitHub
2. Click **Add New** → **Project**
3. Find your `store-manager` repository → click **Import**
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
5. Click **Environment Variables** → Add these:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_GOOGLE_MAPS_API_KEY` = (optional, skip for now)
6. Click **Deploy** → wait 30 seconds
7. Done! You'll get a URL like `store-manager.vercel.app`

---

## Step 4: Create Your Admin Account

1. Open your deployed site
2. Click **Register**
3. Fill in name, email, password, select role
4. Go to Supabase → **Table Editor** → `profiles` table
5. Find your user → change `role` from `rep` to `admin`
6. Log in with your new account

> You're now the admin. You can manage all data, users, and settings.

---

## How to Update After Deployment

### Option A: Ask me to make changes
1. Tell me what you want changed
2. I update the code
3. You upload the updated files to GitHub (or push via Git)
4. Vercel auto-redeploys in 30 seconds — site is updated

### Option B: Edit yourself on GitHub
1. Go to your GitHub repo
2. Click any file → Edit icon (pencil)
3. Make changes → Commit
4. Vercel auto-redeploys

### Option C: Local development
```bash
cd frontend
npm install
npm run dev
# Edit code, test locally
# When ready, push to GitHub
git add . && git commit -m "update" && git push
```

---

## Costs

| Service | Free Tier | When You'd Pay |
|---------|-----------|----------------|
| Supabase | 500MB database, 50K monthly active users | 100K+ users |
| Vercel | 100GB bandwidth, unlimited deployments | 1TB+ bandwidth |
| GitHub | Unlimited public repos | Private repos (still free) |

**For most small to medium businesses, everything stays free.**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page after deploy | Check Vercel environment variables are set correctly |
| Can't login | Make sure you created an account, verify email if required |
| Photos not uploading | Check `visit-photos` bucket exists and is public |
| Data not showing | Check migration.sql was executed successfully |
| Google Maps not showing | Optional — set `VITE_GOOGLE_MAPS_API_KEY` in Vercel |
