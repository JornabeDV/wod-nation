# WODNation

Plataforma de gestión de competencias de CrossFit y Functional Fitness.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI Components:** shadcn/ui (custom implementations)
- **Backend:** Next.js API Routes + Server Actions
- **Database:** PostgreSQL + Prisma ORM v7
- **Auth:** NextAuth.js v4 (Google OAuth)
- **Payments:** MercadoPago
- **Realtime Leaderboard:** SWR polling (10s interval)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or cloud)
- Google OAuth credentials
- MercadoPago account (for payments)

### 1. Clone & Install

```bash
git clone <repo>
cd my-app
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wodnation"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_SECRET=""
```

### 3. Database Setup

Prisma v7 uses `prisma.config.ts` for the database connection. The schema is in `prisma/schema.prisma`.

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (requires running PostgreSQL)
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (marketing)/          # Public landing page
  (dashboard)/          # Organizer dashboard (auth required)
    dashboard/
      page.tsx          # Dashboard home
      competitions/     # Competition CRUD
      profile/          # Organizer profile
  (public)/             # Public competition pages
    competitions/
      [slug]/           # Public comp page
      [slug]/register   # Athlete registration
      [slug]/leaderboard # Live leaderboard
  api/                  # API routes
    auth/               # NextAuth handler
    competitions/       # REST endpoints
    mercadopago/        # Payment webhook
components/
  ui/                   # Button, Input, Card, etc.
  layout/               # Sidebar, Nav, Tabs
lib/
  db.ts                 # Prisma client singleton
  auth.ts               # NextAuth config
  actions.ts            # Server Actions
  leaderboard.ts        # Ranking calculation
  mercadopago.ts        # MP SDK helpers
```

## Features Implemented (MVP)

- [x] Landing page with value prop
- [x] Google OAuth authentication
- [x] Organizer dashboard with stats
- [x] Competition creation & management
- [x] Categories / Divisions CRUD
- [x] WOD creation with scoring types (AMRAP, For Time, EMOM, Max Weight, Points)
- [x] Athlete self-registration (public form)
- [x] Manual athlete registration (organizer override)
- [x] MercadoPago payment integration
- [x] Score entry dashboard (spreadsheet-like)
- [x] Live leaderboard with auto-poll (10s)
- [x] Public shareable URLs
- [x] Competition status lifecycle (DRAFT → PUBLISHED → LIVE → FINISHED)

## Payment Flow

1. Organizer sets registration fee when creating competition
2. Athlete registers via public form
3. If fee > 0, redirected to MercadoPago Checkout
4. Payment confirmed via webhook → registration marked as PAID
5. If fee = 0, registration is FREE and instant

## Leaderboard Logic

- Per WOD: athletes ranked by score (direction depends on scoring type)
- Points = rank position (1st = 1pt, 2nd = 2pt, etc.)
- Overall = sum of points across all WODs
- Lower total = better rank

## Deployment

Configured for **Vercel**:

1. Push repo to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Dashboard
4. Deploy

Database: **Neon PostgreSQL** (serverless, auto-scaling)

## Roadmap

### MVP (Now)
- Core competition management
- Payments & leaderboard

### Phase 2
- Heat / wave scheduling
- Judge accounts
- CSV export
- TV mode / fullscreen leaderboard

### Phase 3
- Team competitions
- Photo uploads
- Advanced analytics

---

Built for CrossFit box owners and competition organizers. 🏋️
