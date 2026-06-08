# WODNation MVP Specification

> **Status:** Draft  
> **Goal:** Validate product-market fit for CrossFit / Functional Fitness competition management in 4–6 weeks.  
> **Philosophy:** Build the smallest thing that answers "Will organizers use this and pay for it?"

---

## 1. Product Vision

**WODNation** is the fastest way for CrossFit box owners and functional fitness organizers to create a competition, collect athlete registrations (with online payment), enter WOD scores, and display a live leaderboard — all in one place.

Instead of juggling spreadsheets, WhatsApp groups, and cash payments, organizers run their entire event from a single dashboard. Athletes get a seamless registration experience and real-time leaderboard updates.

**One-liner:** *"Stripe + Excel + TV leaderboard for fitness competitions, but actually built for CrossFit."*

---

## 2. Validation Strategy

| Question | How We Validate | Success Metric |
|----------|----------------|----------------|
| Will organizers use it? | Track competition creation + active score entry | 10+ competitions created in first 30 days |
| Will organizers pay for it? | Athletes pay registration fee via MercadoPago; platform takes commission | 3+ paid competitions with >70% athlete payment conversion |
| Which features provide the most value? | In-app feedback widget + post-event organizer survey | NPS > 30; "leaderboard" and "payments" ranked top 2 |
| What workflow do organizers actually need? | Shadow first 3 organizers via video call; watch score entry | Time-to-first-leaderboard < 15 min |

**Go-to-market:**
1. Reach out to 10 local CrossFit boxes directly (Instagram/WhatsApp).
2. Offer to run their next internal or local competition for free (platform fee waived).
3. Collect video testimonials and case studies.
4. Iterate for 2 weeks, then start charging.

---

## 3. MVP Scope

**In scope:** Everything needed to create one competition, register athletes with payment, define WODs, enter scores, and show a leaderboard.

**Out of scope:** Everything else.

**Quality bar:**
- Organizers must be able to create a competition end-to-end without talking to us.
- Leaderboard must update within 10 seconds of score entry (polling is fine).
- Payment flow must be reliable (MercadoPago checkout + webhook confirmation).
- Mobile-responsive, but no native app.

---

## 4. Features Included

| # | Feature | Justification | Complexity |
|---|---------|---------------|------------|
| 1 | **Landing page** | Converts visitors; explains value prop; builds trust | Low |
| 2 | **Organizer registration & login** | Required to create competitions; Auth.js handles OAuth + email | Low |
| 3 | **Competition creation** | Core workflow; name, date, location, description, banner image | Low |
| 4 | **Competition status lifecycle** | DRAFT → PUBLISHED → LIVE → FINISHED; prevents accidental edits mid-event | Low |
| 5 | **Categories / Divisions** | Every competition needs RX/Scaled/Masters/Male/Female splits | Low |
| 6 | **Athlete public registration page** | Athletes self-register; reduces organizer admin burden | Medium |
| 7 | **Athlete registration payment (MercadoPago)** | Validates willingness to pay; replaces cash/cash-app chaos | Medium |
| 8 | **WOD creation** | Define workouts with name, description, scoring type, time cap | Low |
| 9 | **Score entry dashboard** | Organizer/judge enters scores by WOD + Category; keyboard-friendly | Medium |
| 10 | **Live leaderboard (public)** | The "wow" moment; updates on poll/SWR; shareable URL | Medium |
| 11 | **Basic athlete profile** | Name, email, gender, birthdate, box; reduces re-entry for repeat athletes | Low |
| 12 | **Organizer dashboard** | Overview of competitions, registration count, revenue, quick actions | Low |
| 13 | **MercadoPago webhook** | Confirms payments asynchronously; updates registration status | Medium |
| 14 | **Manual registration override** | Organizer can add/edit athletes and mark "paid externally" for edge cases | Low |

---

## 5. Features Excluded (Post-MVP)

| Feature | Why Excluded | Future Phase |
|---------|--------------|--------------|
| AI / OCR score reading | Too complex; manual entry is fast enough for <200 athletes | Phase 3 |
| Social feed / followers / chat | Nice-to-have; doesn't validate core business | Phase 4 |
| White-label / custom domains | Engineering heavy; prove generic brand first | Phase 2 |
| Team management (teams of 2–4) | Most local comps are individual first | Phase 2 |
| Livestream integrations | Not needed for validation | Phase 3 |
| Push notifications | Polling leaderboard is sufficient | Phase 2 |
| Advanced analytics / ELO ranking | Overkill for MVP | Phase 3 |
| TV mode / fullscreen leaderboard | CSS fullscreen API works for MVP; no separate TV app | Phase 2 |
| Mobile app (iOS/Android) | Mobile web is enough for 95% of use cases | Phase 4 |
| Complex RBAC / multi-judge accounts | Organizer does everything in MVP | Phase 2 |
| Heat / wave scheduling | Internal comps often run "heats on the fly" | Phase 2 |
| Judge mobile score entry app | Judges use organizer's laptop/tablet in MVP | Phase 2 |
| Multi-currency / multi-region | Launch in one market (e.g., Argentina/Chile/Mexico via MercadoPago) | Phase 3 |
| Affiliate verification (CrossFit ID) | Not needed for local/independent competitions | Phase 3 |

---

## 6. User Flows

### 6.1 Organizer Flow

```
Landing Page → Sign Up → Dashboard
                  ↓
         Create Competition (DRAFT)
                  ↓
    Add Categories → Add WODs → Publish
                  ↓
    Share Public URL → Athletes Register & Pay
                  ↓
    Competition Day → Score Entry → Live Leaderboard
                  ↓
    Finish Competition → Download Results
```

### 6.2 Athlete Flow

```
Receive Link (WhatsApp/Instagram) → Competition Public Page
                  ↓
         Choose Category → Fill Form
                  ↓
         Pay Registration Fee (MercadoPago)
                  ↓
         Confirmation Email/WhatsApp → Show Up on Event Day
                  ↓
         View Live Leaderboard
```

### 6.3 Score Entry Flow (Organizer / Judge)

```
Dashboard → Competition → Manage Scores
               ↓
    Select WOD → Select Category
               ↓
    Table of Athletes → Enter Score per Row
               ↓
    Save → Leaderboard Auto-Updates (SWR revalidate)
```

---

## 7. Database Schema (ERD Overview)

```
User (Auth.js extended)
  ├── OrganizerProfile (1:1)
  │       └── Competition (1:N)
  │               ├── Category (1:N)
  │               ├── WOD (1:N)
  │               ├── Registration (1:N)
  │               │       └── Athlete (N:1)
  │               └── Score (1:N)
  │                       └── Athlete (N:1)
  └── Athlete (1:1, optional)
```

**Key design decisions:**
- `Athlete` is decoupled from `User`. Most athletes won't create accounts; they just register for an event. If they do create an account later, we can link via email.
- `Score` is tied to `(competitionId, wodId, athleteId, categoryId)` to make leaderboard queries fast and unambiguous.
- `Registration` tracks payment state independently of `Athlete` existence, allowing organizer manual overrides.

---

## 8. Prisma Models

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Auth.js tables ──
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(ORGANIZER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  organizerProfile OrganizerProfile?
  athlete       Athlete?
}

enum UserRole {
  ORGANIZER
  ADMIN
}

// ── Application tables ──
model OrganizerProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phone     String?
  boxName   String?
  bio       String?  @db.Text
  website   String?
  instagram String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  competitions Competition[]
}

model Competition {
  id                  String            @id @default(cuid())
  name                String
  slug                String            @unique
  description         String?           @db.Text
  location            String?
  bannerImage         String?
  startDate           DateTime
  endDate             DateTime?
  registrationDeadline DateTime?
  status              CompetitionStatus @default(DRAFT)
  registrationFee     Int               @default(0) // stored in cents
  currency            String            @default("ARS")
  maxAthletes         Int?
  organizerId         String
  organizer           OrganizerProfile  @relation(fields: [organizerId], references: [id], onDelete: Cascade)
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  categories   Category[]
  wods         WOD[]
  registrations Registration[]
  scores       Score[]
}

enum CompetitionStatus {
  DRAFT
  PUBLISHED
  LIVE
  FINISHED
  CANCELLED
}

model Category {
  id             String         @id @default(cuid())
  competitionId  String
  competition    Competition    @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  name           String
  gender         Gender?
  divisionType   DivisionType   @default(CUSTOM)
  minAge         Int?
  maxAge         Int?
  maxAthletes    Int?
  order          Int            @default(0)

  registrations Registration[]
  scores        Score[]

  @@unique([competitionId, name])
}

enum Gender {
  MALE
  FEMALE
  MIXED
}

enum DivisionType {
  RX
  SCALED
  ELITE
  MASTER
  CUSTOM
}

model WOD {
  id              String      @id @default(cuid())
  competitionId   String
  competition     Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  name            String
  description     String?     @db.Text
  scoringType     ScoringType
  timeCapMinutes  Int?
  standards       String?     @db.Text
  order           Int         @default(0)
  createdAt       DateTime    @default(now())

  scores Score[]
}

enum ScoringType {
  AMRAP        // higher reps = better
  FOR_TIME     // lower time = better
  EMOM         // higher rounds = better
  MAX_WEIGHT   // higher weight = better
  POINTS       // higher points = better
}

model Athlete {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  gender      Gender?
  birthDate   DateTime?
  boxName     String?
  userId      String?  @unique
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())

  registrations Registration[]
  scores        Score[]

  @@index([email])
}

model Registration {
  id            String            @id @default(cuid())
  competitionId String
  competition   Competition       @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  categoryId    String
  category      Category          @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  athleteId     String
  athlete       Athlete           @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  status        RegistrationStatus @default(CONFIRMED)
  paymentStatus PaymentStatus      @default(PENDING)
  paymentId     String?            // MercadoPago preference / payment ID
  amountPaid    Int?               // cents
  registeredAt  DateTime           @default(now())

  @@unique([competitionId, athleteId])
  @@index([competitionId, categoryId])
}

enum RegistrationStatus {
  CONFIRMED
  CANCELLED
  WITHDRAWN
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  FREE
}

model Score {
  id            String      @id @default(cuid())
  competitionId String
  competition   Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  wodId         String
  wod           WOD         @relation(fields: [wodId], references: [id], onDelete: Cascade)
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  athleteId     String
  athlete       Athlete     @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  value         Float?      // normalized numeric value for sorting
  rawScore      String      // human-readable: "10:23", "150 reps", "85 kg"
  notes         String?     @db.Text
  judgeName     String?
  submittedAt   DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([wodId, athleteId])
  @@index([competitionId, categoryId, wodId])
}
```

---

## 9. Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Railway App                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │  │
│  │  │   Routes    │  │  API Routes │  │  Server Actions│  │  │
│  │  │  (pages)    │  │  (REST)     │  │  (mutations)  │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Prisma ORM + PostgreSQL                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Auth.js (NextAuth v5)  │  MercadoPago SDK           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Patterns:**
- **Server Components by default** (Next.js 15 App Router). Fetch data via Prisma directly in server components.
- **Server Actions** for mutations (forms, score entry). No need for separate API routes for every mutation.
- **API Routes** only for: Auth.js handlers, MercadoPago webhooks, and public leaderboard JSON (if consumed by external systems).
- **SWR / React Query** for client-side data fetching where interactivity is needed (leaderboard polling).
- **No separate backend service.** All business logic lives in Next.js.

---

## 10. Folder Structure

```
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Landing page
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + auth guard
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Organizer overview
│   │   ├── competitions/
│   │   │   ├── page.tsx                # List competitions
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create competition
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Competition detail
│   │   │       ├── edit/
│   │   │       │   └── page.tsx        # Edit competition
│   │   │       ├── categories/
│   │   │       │   └── page.tsx        # Manage categories
│   │   │       ├── wods/
│   │   │       │   └── page.tsx        # Manage WODs
│   │   │       ├── athletes/
│   │   │       │   └── page.tsx        # Manage registrations
│   │   │       ├── scores/
│   │   │       │   └── page.tsx        # Enter scores
│   │   │       └── settings/
│   │   │           └── page.tsx        # Competition settings
│   │   └── profile/
│   │       └── page.tsx                # Organizer profile
│   ├── (public)/
│   │   ├── competitions/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # Public competition page
│   │   │       ├── register/
│   │   │       │   └── page.tsx        # Athlete registration form
│   │   │       ├── register/
│   │   │       │   └── success/
│   │   │       │       └── page.tsx    # Post-payment success
│   │   │       └── leaderboard/
│   │   │           └── page.tsx        # Live leaderboard
│   │   └── api/
│   │       └── mercadopago/
│   │           └── webhook/
│   │               └── route.ts        # Payment webhook
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts            # Auth.js handler
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── competitions/
│   ├── wods/
│   ├── leaderboard/
│   ├── forms/
│   └── layout/
│
├── lib/
│   ├── db.ts                           # Prisma singleton
│   ├── auth.ts                         # Auth.js config
│   ├── mercadopago.ts                  # MP SDK init + helpers
│   ├── leaderboard.ts                  # Ranking calculation
│   └── utils.ts                        # cn(), helpers
│
├── hooks/
│   └── use-leaderboard.ts              # SWR polling hook
│
├── types/
│   └── index.ts                        # Shared TypeScript types
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── images/
│
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 11. API Routes & Server Actions

### Auth.js
- `GET/POST /api/auth/[...nextauth]` — handled by NextAuth.

### Public API (no auth)
- `GET /api/competitions/[slug]/leaderboard?categoryId=` — JSON leaderboard for external use.

### MercadoPago Webhook
- `POST /api/mercadopago/webhook` — Receives payment notifications, updates `Registration.paymentStatus`.

### Server Actions (auth required)
- `createCompetition(data)`
- `updateCompetition(id, data)`
- `publishCompetition(id)`
- `createCategory(competitionId, data)`
- `updateCategory(id, data)`
- `deleteCategory(id)`
- `createWOD(competitionId, data)`
- `updateWOD(id, data)`
- `deleteWOD(id)`
- `submitScore(scoreData)`
- `bulkSubmitScores(scores[])` — for fast entry
- `updateRegistrationStatus(id, status)`
- `createManualRegistration(competitionId, data)` — for walk-ups

### Public Server Actions (no auth)
- `registerAthlete(competitionSlug, data)` — creates Athlete + Registration + MercadoPago preference.

---

## 12. Dashboard Pages

| Page | Purpose | Key UI |
|------|---------|--------|
| **Dashboard Home** | Organizer overview | Stats cards (active comps, total athletes, revenue), upcoming competitions list |
| **Competitions List** | All my competitions | Table with status badges, athlete count, quick links |
| **New Competition** | Create event | Form wizard: details → categories → WODs → publish |
| **Competition Detail** | Central hub for one comp | Tabs: Overview / Categories / WODs / Athletes / Scores / Leaderboard / Settings |
| **Manage Categories** | CRUD divisions | Drag-to-sort table, add RX/Scaled/Masters quickly |
| **Manage WODs** | CRUD workouts | Card list with scoring type badges |
| **Manage Athletes** | Registrations table | Filter by category/payment status; manual add button |
| **Score Entry** | Fast score input | Spreadsheet-like table; select WOD + Category; type score → Tab → next row |
| **Settings** | Edit/publish/delete | Danger zone for delete; status transitions |

---

## 13. Landing Page Structure

```
1. Hero
   - Headline: "Run Your CrossFit Competition Without the Spreadsheet Headache"
   - Subheadline: Create events, collect payments, track scores, and display live leaderboards — all in one place.
   - CTA: "Create Your First Competition" / "See Demo Leaderboard"
   - Background: Dark gritty fitness aesthetic (not generic SaaS blue)

2. Social Proof
   - "Trusted by X boxes in [Region]"
   - 3 short quotes from beta organizers (placeholder until real ones)

3. How It Works (3 steps)
   - ① Create & Configure — Set up your comp in minutes
   - ② Athletes Register & Pay — Share one link, collect fees online
   - ③ Score & Lead — Enter scores, leaderboard updates instantly

4. Feature Highlights (4 cards)
   - Online Payments (MercadoPago)
   - Live Leaderboard
   - WOD Score Tracking
   - Athlete Self-Registration

5. Pricing Teaser
   - "Free during beta. Pay only when you're ready."
   - Shows future tiers (Free / Pro / Full) to anchor value

6. Footer
   - Contact email / Instagram
   - Terms & Privacy
```

---

## 14. Competition Management Flow

### Step-by-Step (Organizer)

1. **Create**
   - Dashboard → "New Competition"
   - Enter: Name, Slug (auto-generated), Date, Location, Description, Banner image (optional upload to public/ or external storage), Registration fee, Registration deadline.
   - Save → status = `DRAFT`

2. **Configure Categories**
   - Add default presets: "RX Masculino", "RX Femenino", "Scaled Masculino", "Scaled Femenino", "Masters 35+"
   - Or create custom.
   - Set max athletes per category (optional).

3. **Configure WODs**
   - Add WODs in competition order.
   - Per WOD: Name, Description, Scoring Type (AMRAP / For Time / EMOM / Max Weight / Points), Time cap (optional), Movement standards (textarea).

4. **Publish**
   - Review summary.
   - Click "Publish" → status = `PUBLISHED`.
   - Public URL is live: `/competitions/[slug]`
   - Organizer copies link to share.

5. **During Event**
   - Organizer opens "Score Entry" tab.
   - Selects WOD → Category.
   - Enters scores row by row.
   - Leaderboard updates immediately.

6. **Finish**
   - Click "Finish Competition" → status = `FINISHED`.
   - Scores locked (read-only).
   - Organizer can export results (CSV) — export is post-MVP nice-to-have, can be a simple JSON dump for MVP.

---

## 15. Athlete Registration Flow

1. **Discovery**
   - Athlete receives link: `wodnation.com/competitions/summer-throwdown-2026`

2. **View Competition**
   - Public page shows: name, date, location, description, WOD list (if published by organizer), categories, registration fee.
   - "Register Now" button.

3. **Fill Form**
   - Name (required)
   - Email (required)
   - Phone (optional)
   - Gender (required for category filtering)
   - Birthdate (optional, for Masters categories)
   - Box / Affiliate (optional)
   - Select Category (dropdown filtered by gender)

4. **Payment (if fee > 0)**
   - Click "Pay & Register"
   - Redirect to MercadoPago Checkout (redirect model — simplest integration)
   - Athlete pays with card/MercadoPago balance
   - Redirect back to `/competitions/[slug]/register/success?payment_id=...`

5. **Confirmation**
   - Page shows: "You're registered! See you at [location] on [date]"
   - Payment is confirmed asynchronously via webhook (updates `PAID` status).
   - If webhook is delayed, frontend shows "Your payment is being processed."

6. **If fee = 0**
   - Skip payment. Registration is `FREE` and `CONFIRMED` immediately.

---

## 16. Score Submission Flow

### Single Score Entry
1. Organizer navigates to `/dashboard/competitions/[id]/scores`
2. Selects WOD from dropdown, then Category from dropdown.
3. Table renders: Athlete Name | Raw Score Input | Notes | Judge Name
4. Organizer types score (e.g., "10:23" or "150") and presses Tab to next row.
5. On blur/Enter, `submitScore()` Server Action is called.
6. Score is saved; `updatedAt` on competition is bumped; SWR keys revalidate.

### Bulk Entry (spreadsheet mode)
1. Same page, but all scores for a WOD are edited in-memory.
2. "Save All" button triggers `bulkSubmitScores(scores[])`.
3. One transaction, one revalidation.

### Ranking Calculation (on read)
- When leaderboard is requested, Prisma query fetches all scores for `(competitionId, categoryId)`.
- Application code in `lib/leaderboard.ts` sorts per WOD based on `WOD.scoringType`:
  - `AMRAP`, `EMOM`, `MAX_WEIGHT`, `POINTS` → descending
  - `FOR_TIME` → ascending
- Points are assigned by rank: 1st = 1, 2nd = 2, etc.
- Ties share the same rank and points.
- Overall = sum of points across all WODs.
- Leaderboard sorted by overall points ascending.

**Why calculate on read?**
- For MVP (<500 athletes, <10 WODs), calculating on read is fast enough.
- No need for complex materialized views or triggers.
- If performance becomes an issue, add a `LeaderboardSnapshot` table later.

---

## 17. Live Leaderboard Flow

### Public Leaderboard Page
- Route: `/competitions/[slug]/leaderboard?category=[categoryId]`
- Server Component renders initial HTML with data.
- Client Component takes over and polls via SWR every 10 seconds (`refreshInterval: 10000`).
- Shows:
  - Category selector (tabs or dropdown)
  - Table: Rank | Athlete | Box | WOD 1 | WOD 2 | ... | Total Points
  - Top 3 highlighted with medal icons / distinct styling
  - Auto-refresh indicator ("Updated 5s ago")

### Why polling, not Socket.IO?
- For MVP, a 10-second polling interval is indistinguishable from "live" for most local competitions.
- Eliminates custom server complexity, connection management, and Railway infrastructure concerns.
- Socket.IO is reserved for post-MVP if we run large events (>500 concurrent spectators).

### Shareability
- URL contains `category` query param; copying the link opens the same view.
- QR code on the public competition page links directly to leaderboard.
- Organizer can project this URL on a TV during the event.

---

## 18. Deployment Architecture

```
┌────────────────────────────────────────┐
│  Railway Project: "wodnation"          │
│                                        │
│  Service 1: Next.js App                │
│  - Build: npm run build                │
│  - Start: npm start                    │
│  - Domain: wodnation.up.railway.app    │
│  - Custom domain: wodnation.com        │
│                                        │
│  Service 2: PostgreSQL                 │
│  - Provisioned by Railway              │
│  - Backups: automatic                  │
│                                        │
│  Add-ons: none (keep it simple)        │
└────────────────────────────────────────┘
```

**Environment Variables:**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://wodnation.com"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
MERCADOPAGO_ACCESS_TOKEN="..."
MERCADOPAGO_WEBHOOK_SECRET="..."
```

**Why Railway?**
- One-click PostgreSQL + automatic backups.
- GitHub auto-deploy on push.
- Generous free tier / low-cost paid tier for early stage.
- No DevOps complexity — perfect for 4–6 week MVP.

**Image uploads:**
- For MVP, use local `public/` folder or a simple external service (Cloudinary free tier).
- Avoid S3/bucket complexity. If using local, note that Railway filesystem is ephemeral — images should ideally be base64 or external. Recommendation: skip banner uploads in MVP; use a URL input field instead.

---

## 19. Development Roadmap (4–6 Weeks)

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Foundation | Repo setup, Auth.js, Prisma schema, landing page, dashboard shell |
| **Week 2** | Competition Core | Create/edit competitions, categories, WODs; organizer dashboard |
| **Week 3** | Athlete Side | Public competition page, athlete registration form, athlete profiles |
| **Week 4** | Payments & Polish | MercadoPago integration, payment webhook, success/cancel pages, UX polish |
| **Week 5** | Scoring & Leaderboard | Score entry UI, ranking algorithm, public leaderboard with polling |
| **Week 6** | Launch Prep | End-to-end testing with 1 real competition, bug fixes, performance, deploy |

**Daily standup rhythm:**
- Morning: 15-min check-in (async Slack/Discord is fine).
- Ship something every day. If a feature is taking >2 days, cut scope.

---

# Implementation Plan & Execution Guide

## Development Order (Feature-by-Feature)

Build in this exact order. Do not skip ahead. Each step is a working checkpoint.

### Phase 1: Skeleton (Days 1–3)
1. **Project bootstrap** — `create-next-app` with TypeScript, Tailwind, shadcn/ui init.
2. **Prisma setup** — schema definition, migrate, seed script with sample data.
3. **Auth.js setup** — Google OAuth + email magic link (optional). Protect dashboard routes.
4. **Base layout** — marketing layout vs. dashboard layout (sidebar).

### Phase 2: Organizer Core (Days 4–8)
5. **Landing page** — static, deployable, no backend needed.
6. **Dashboard home** — stats cards, recent competitions list.
7. **Competition CRUD** — create, list, edit, delete.
8. **Categories CRUD** — nested under competition.
9. **WODs CRUD** — nested under competition, scoring type selector.

### Phase 3: Public Surface (Days 9–12)
10. **Public competition page** — read-only view of comp details.
11. **Athlete registration form** — creates Athlete + Registration records.
12. **Registration validation** — duplicate email check, category capacity check.

### Phase 4: Money (Days 13–16)
13. **MercadoPago preference creation** — on registration submit, if fee > 0.
14. **Checkout redirect** — athlete pays, returns to success page.
15. **Webhook handler** — idempotent payment confirmation.
16. **Manual registration override** — organizer can add unpaid walk-ups.

### Phase 5: Scoring (Days 17–21)
17. **Score entry UI** — table with inline inputs, WOD + category filter.
18. **Score Server Actions** — submitScore, bulkSubmitScores.
19. **Ranking engine** — `lib/leaderboard.ts` with per-WOD sorting and point assignment.

### Phase 6: Leaderboard & Launch (Days 22–28)
20. **Public leaderboard** — category tabs, responsive table, auto-poll.
21. **E2E test** — run a mock competition from creation to final leaderboard.
22. **Performance pass** — add DB indexes, review N+1 queries.
23. **Deploy to Railway** — production DB, env vars, custom domain.
24. **Beta outreach** — contact 10 boxes, onboard first organizer.

---

## Estimated Complexity per Feature

| Feature | Story Points | Risk |
|---------|--------------|------|
| Auth & user management | 3 | Low |
| Landing page | 2 | Low |
| Dashboard shell | 2 | Low |
| Competition CRUD | 3 | Low |
| Categories CRUD | 2 | Low |
| WODs CRUD | 2 | Low |
| Public competition page | 2 | Low |
| Athlete registration form | 3 | Medium |
| MercadoPago preference + redirect | 3 | Medium |
| MercadoPago webhook | 3 | Medium |
| Manual registration override | 1 | Low |
| Score entry UI | 3 | Low |
| Ranking algorithm | 2 | Low |
| Public leaderboard + polling | 3 | Low |
| **Total** | **34** | — |

> **Velocity assumption:** 1 developer @ ~5 story points per 2-day block = ~14 days of pure dev work + 30% buffer for unknowns = **~18–20 dev days**. Fits comfortably in 4–6 weeks with part-time availability.

---

## Recommended Database Tables (Summary)

| Table | Rows (MVP est.) | Purpose |
|-------|-----------------|---------|
| `User` | 50 | Organizers |
| `OrganizerProfile` | 50 | Extended profile |
| `Competition` | 20 | Events |
| `Category` | 100 | Divisions |
| `WOD` | 100 | Workouts |
| `Athlete` | 1,000 | Registrants |
| `Registration` | 1,000 | Links + payment state |
| `Score` | 10,000 | Scores |

**Indexes to add from day 1:**
- `Athlete(email)` — deduplication.
- `Registration(competitionId, categoryId)` — filtering.
- `Score(competitionId, categoryId, wodId)` — leaderboard queries.
- `Competition(slug)` — public lookups.
- `Category(competitionId, name)` — uniqueness.

---

## Recommended UI Screens

### Marketing (2 screens)
1. Landing page

### Dashboard — Organizer (9 screens)
2. Dashboard home
3. Competitions list
4. New competition (wizard)
5. Competition detail (tabbed)
6. Manage categories
7. Manage WODs
8. Manage athletes / registrations
9. Score entry
10. Settings / publish controls

### Public — Athlete & Spectators (3 screens)
11. Public competition page
12. Athlete registration + payment
13. Live leaderboard

### Auth (3 screens, mostly handled by Auth.js)
14. Sign in
15. Sign up
16. Request magic link

**Total unique screens to design & build: 14** (auth screens are minimal).

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| **No Socket.IO** | 10s polling is sufficient for MVP; eliminates infra complexity. |
| **No separate backend** | Next.js API routes + Server Actions are enough for 1k athletes. |
| **Athletes don't need accounts** | Reduces friction; 90% of athletes compete once a year. |
| **Pay-per-event via MercadoPago** | Organizers charge athletes; platform takes commission. Zero friction for organizer signup. |
| **Score ranking on read** | Simpler schema; acceptable performance for MVP scale. |
| **No image uploads** | URL-only banners avoid storage complexity on Railway ephemeral filesystem. |
| **Single market currency** | Default `ARS`; hardcode for MVP. Multi-currency is post-MVP. |
| **No heat scheduling** | Organizers run "heats on the fly" for small comps; add later. |

---

## Success Checklist (Launch Day)

- [ ] Organizer can create a competition in < 5 minutes without help.
- [ ] Athlete can register and pay in < 3 minutes on mobile.
- [ ] Organizer can enter 50 scores in < 10 minutes.
- [ ] Leaderboard updates within 10 seconds and displays correctly on a phone and a TV.
- [ ] Payment webhook correctly marks registrations as PAID.
- [ ] Platform is deployed and loads in < 2 seconds.
- [ ] At least 1 real competition is scheduled using the platform.

---

*End of MVP Specification. Ready for implementation.*
