# DailyDex

Personal daily habit tracker & accountability dashboard. Built with React, Vite, and Supabase.

## Features

- Daily habit checklist with reading log
- Supplements tracker
- Weekly accountability streaks
- Trend charts & history view
- Dark theme, responsive design
- LocalStorage fallback when offline

## Tech Stack

- **React 19** + **Vite 8**
- **Supabase** (PostgreSQL backend)
- **Lucide React** (icons)
- **Oxlint** (linting)

## Setup

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
```

## Database Tables

Run this SQL in your Supabase SQL Editor after creating a project:

```sql
-- daily_habits table
create table daily_habits (
  date date primary key default current_date,
  completed_tasks jsonb default '[]'::jsonb,
  reading_subject_1 text,
  reading_subject_2 text,
  completed_supplements jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- weekly_accountability table
create table weekly_accountability (
  week_start_date date primary key,
  disciplined boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- RLS policies (personal app - full anon access)
alter table daily_habits enable row level security;
alter table weekly_accountability enable row level security;

create policy "Enable full access for anon key" on daily_habits
  for all using (true) with check (true);

create policy "Enable full access for anon key" on weekly_accountability
  for all using (true) with check (true);
```

## Deploy on Vercel

1. Push to GitHub (private repo recommended)
2. Import repo on Vercel
3. Set **Framework Preset** to **Vite**
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy
