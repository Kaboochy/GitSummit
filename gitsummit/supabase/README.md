# GitSummit Database Setup

## Quick Start

1. **Install Supabase CLI** (if not already installed):
```bash
npm install -g supabase
```

2. **Link to your Supabase project**:
```bash
cd gitsummit
supabase link --project-ref YOUR_PROJECT_REF
```

3. **Apply migrations**:
```bash
supabase db push
```

Or manually run the SQL:
- Go to your Supabase dashboard → SQL Editor
- Copy and paste the contents of `migrations/001_gitsummit_schema.sql`
- Click "Run"

## Schema Overview

### Core Tables

- **users** - User accounts with lifetime & weekly scores
- **commits** - Detailed commit tracking with scoring
- **trophies** - Weekly leaderboard awards (gold/silver/bronze)
- **friendships** - Mutual GitHub followers
- **github_installations** - GitHub App installations
- **daily_commit_summaries** - Daily commit aggregates
- **weekly_leaderboard_snapshots** - Historical weekly leaderboards

### Views

- **current_week_global_leaderboard** - Real-time global rankings
- **user_profiles** - User data with trophy counts

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_GITHUB_APP_INSTALL_URL=your_github_app_url
```

## Scoring System

- **1-5 points per commit** based on size (additions + deletions)
- **Max 5 commits per day** count toward score
- **Max 25 points per day** possible (5 commits × 5 points)
- **Weekly reset** every Monday at 12:00 PM UTC
- **Lifetime points** persist across resets
