# 🏔️ GitSummit

**Climb with every commit!** Turn your GitHub commits into an epic climbing adventure. Compete with friends and developers worldwide on an interactive mountain leaderboard.

![GitSummit](https://img.shields.io/badge/built%20with-Next.js-black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## ✨ Features

- 🗻 **Interactive Mountain Visualization** - Watch your climber move up El Capoochy based on your rank
- 🏆 **Weekly Competitions** - Compete for gold, silver, and bronze trophies
- 👥 **Friends Leaderboard** - Challenge your GitHub mutual followers
- 🌍 **Global Rankings** - See how you stack up against developers worldwide
- 📊 **Smart Scoring** - Commits scored 1-5 points based on size
- 🎯 **Quality Over Quantity** - Max 5 commits/day count (25 points max)
- ⭐ **Lifetime Stats** - Track your all-time achievements
- 🎨 **National Park Theme** - Beautiful pixel art with rustic wooden signs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up free](https://supabase.com))
- A GitHub account

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GitSummit.git
cd GitSummit/gitsummit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Go to SQL Editor and run the migration:
   ```bash
   # Copy the contents of supabase/migrations/001_gitsummit_schema.sql
   # and run it in the Supabase SQL Editor
   ```

### 4. Set Up GitHub OAuth

1. Go to your Supabase project → Authentication → Providers
2. Enable GitHub OAuth
3. Copy the callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Go to GitHub → Settings → Developer settings → OAuth Apps
5. Create a new OAuth App:
   - Homepage URL: `http://localhost:3000` (for dev)
   - Callback URL: Your Supabase callback URL
6. Copy the Client ID and Secret to Supabase GitHub provider settings

### 5. Create GitHub App (for webhooks)

1. Go to GitHub → Settings → Developer settings → GitHub Apps
2. Create a new GitHub App:
   - **Name**: GitSummit (or your choice)
   - **Homepage URL**: Your deployment URL
   - **Webhook URL**: `https://your-domain.com/api/github/webhook`
   - **Webhook Secret**: Generate a random secret
   - **Permissions**:
     - Repository Contents: Read-only
     - Repository Metadata: Read-only
   - **Subscribe to events**: Push
3. Install the app to your account/repos
4. Save the webhook secret

### 6. Configure Environment Variables

Create a `.env.local` file in the `gitsummit` directory:

```env
# Copy from .env.example and fill in your values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_GITHUB_APP_INSTALL_URL=https://github.com/apps/your-app/installations/new
GITHUB_ACCESS_TOKEN=your-github-token
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add all environment variables from `.env.local`
4. Deploy!

The `vercel.json` file is already configured for weekly cron jobs.

### Deploy to Other Platforms

GitSummit works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

**Important**: You'll need to set up a cron job to call `/api/cron/weekly-reset` every Monday at 12:00 PM UTC.

## 🎮 How It Works

### Scoring System

- **1 point**: 1-10 changes (tiny tweak)
- **2 points**: 11-50 changes (small change)
- **3 points**: 51-150 changes (medium change)
- **4 points**: 151-300 changes (large change)
- **5 points**: 301+ changes (major change)

Changes = additions + deletions

### Daily Cap

Only your first **5 commits per day** count toward your score. This encourages quality commits over spamming.

**Maximum daily points**: 25 (5 commits × 5 points)

### Weekly Reset

Every **Monday at 12:00 PM UTC**:
- Weekly scores reset to 0
- Top 3 on global leaderboard get trophies 🥇🥈🥉
- Top 3 on each friend group get trophies
- Lifetime scores are preserved

### Friends System

Friends are determined by **mutual GitHub followers** - people you follow who also follow you back.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel
- **Webhooks**: GitHub App integration

## 📂 Project Structure

```
gitsummit/
├── app/
│   ├── api/              # API routes
│   │   ├── cron/         # Cron jobs
│   │   ├── github/       # GitHub webhooks
│   │   ├── leaderboard/  # Leaderboard endpoints
│   │   └── user/         # User profiles
│   ├── dashboard/        # User dashboard
│   ├── leaderboard/      # Leaderboard pages
│   ├── profile/          # User profiles
│   └── settings/         # App settings
├── components/           # React components
│   ├── LandingPage.tsx
│   ├── MountainVisualization.tsx
│   ├── NationalParkLayout.tsx
│   ├── WoodenSign.tsx
│   └── TrophyDisplay.tsx
├── lib/                  # Utilities
│   ├── github.ts         # GitHub API helpers
│   ├── scoring.ts        # Scoring logic
│   └── supabase/         # Supabase clients
├── public/               # Static assets
│   └── assets/           # Mountain & climber sprites
└── supabase/             # Database migrations
```

## 🎨 Assets

The pixel art assets are in `/public/assets/`:
- **ElCapoochy.png** - The mountain background
- **climberSpriteSheet.png** - Animated climber sprite (4 frames)

## 🐛 Troubleshooting

### Webhooks not working

1. Check your GitHub App webhook settings
2. Verify `GITHUB_WEBHOOK_SECRET` matches
3. Check Vercel/deployment logs for errors
4. Test webhook delivery in GitHub App settings

### Leaderboards empty

1. Make sure you've made commits after setting up webhooks
2. Check that the GitHub App is installed on your repos
3. Verify webhooks are being received at `/api/github/webhook`

### Friends not showing

1. Click "Sync GitHub Friends" in the dashboard
2. Make sure you have mutual followers who also use GitSummit
3. Check that `GITHUB_ACCESS_TOKEN` has correct permissions

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- Mountain sprite inspired by El Capitan in Yosemite National Park
- Built with ❤️ for developers who love to code
- Pixel art and design by the GitSummit team

---

**Ready to climb?** [Deploy GitSummit](https://vercel.com/new) 🏔️
