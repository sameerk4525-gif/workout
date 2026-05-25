# 🏋️ Deployment Guide — IronQuest Gamified Workout Tracker

IronQuest is preconfigured for both **seamless local testing** (via SQLite and mock authentication) and **production-ready cloud deployment** (via Supabase PostgreSQL, Clerk, and Vercel). 

---

## 🚀 Part 1: Instant Local Testing (Zero Config)

To run the application locally without setting up any external databases or Clerk accounts, follow these simple steps:

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
2. **Synchronize Local SQLite Database**:
   ```bash
   npx prisma db push
   ```
3. **Seed Database with 107+ Exercises, 10 Users, 6 Routines, and 50+ Workouts**:
   ```bash
   npx prisma db seed
   ```
4. **Boot Development Server**:
   ```bash
   npm run dev
   ```
5. **Interactive Testing**:
   - Navigate to `http://localhost:3000` inside your browser.
   - Click **Enter Demo Mode** or **Fast-Track Onboarding Wizard** to instantly log in as `@thor_lifts` (clerk ID `user_clerk_1`) and access the full app with zero sign-up hurdles!

---

## ☁️ Part 2: Production Cloud Deployment

Follow these sequential steps to deploy IronQuest into a production cloud environment.

### Step 1: Database Setup (Supabase PostgreSQL)
1. Navigate to [Supabase](https://supabase.com/) and create a new project.
2. Under the **Database Settings** tab inside your Supabase dashboard:
   - Copy the **Connection String** (Transaction Pooler, Port `6543`) to use as `DATABASE_URL`.
   - Copy the **Direct Connection String** (Session Pooler, Port `5432`) to use as `DIRECT_URL`.
3. Add `?pgbouncer=true` to your `DATABASE_URL` string to enable connection pooling through Vercel.

### Step 2: Authentication Setup (Clerk Auth)
1. Go to [Clerk](https://clerk.com/) and sign up for a new application.
2. In the Clerk Dashboard:
   - Under **User Authentication**, enable **Email/Password** and **Google Social OAuth**.
   - Under **API Keys**, copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. Go to **Webhooks** in the Clerk sidebar:
   - Add an Endpoint mapping to: `https://your-app-domain.vercel.app/api/webhooks/clerk`
   - Under **Subscribe to Events**, check: `user.created`, `user.updated`, and `user.deleted`.
   - Copy the **Signing Secret** to use as `CLERK_WEBHOOK_SECRET`.

### Step 3: Prisma Schema Adaption for Postgres
Before deploying to production, modify the datasource provider inside `/prisma/schema.prisma` from SQLite back to PostgreSQL:

```prisma
// /prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Then, compile the PostgreSQL schema and apply database migrations:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 4: Vercel Deploy Configuration
Create a Vercel routing configuration `vercel.json` in your root folder:

```json
{
  "buildCommand": "npx prisma generate && next build",
  "framework": "nextjs"
}
```

### Step 5: Setup Environment Variables in Vercel Dashboard
Set the following keys inside your Vercel Project settings dashboard:

| Variable Name | Description / Format |
|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler URL (with `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase Session Pooler URL for migrations |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable key starting with `pk_` |
| `CLERK_SECRET_KEY` | Clerk Secret key starting with `sk_` |
| `CLERK_WEBHOOK_SECRET` | SVIX signing secret from Clerk webhooks panel |
| `NEXT_PUBLIC_APP_URL` | Your deployment address (e.g., `https://ironquest.vercel.app`) |

### Step 6: Deploy & Seed Production
Trigger Vercel build compilation. The custom build script will automatically generate the Prisma Client, compile Next.js 14 App pages, and complete deployment. Seed the production database:
```bash
npx prisma db seed
```

---

## 🏆 Features Ready to Audit
- **Touch-Optimized Logging Console**: Tapping reps/weights triggers our numpad overlay. Checked rows play confetti. Countdowns auto-start.
- **Dynamic Leaderboards**: Switch standing views in real-time by metrics or durations.
- **Community Feed & Profiles**: Collapsible logs, optimistic comments/likes, follow toggles, and lock achievements badges.
- **Analytics Dashboard**: Stacked volume graphs, 4-week moving trends, 1RM timelines, and SVG calendar heatmaps.
