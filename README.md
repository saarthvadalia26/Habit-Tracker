<div align="center">

# 🎯 Habit Tracker
### High-Performance Discipline Matrix & Challenge Engine

An elite, full-stack habit tracking web application engineered for daily discipline, consistency analysis, and deep focus. Built with **Next.js 16 (Turbopack & App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Supabase (PostgreSQL 15+)**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

[Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Security & RLS](#security)

</div>

---

<a id="overview"></a>
## 🌟 Overview

**Habit Tracker** moves beyond basic to-do checklists by combining a high-density **31-Day Consistency Matrix**, a rigorous **75-Day & 90-Day Challenge Engine**, and **mathematically accurate analytics** (distinguishing between Today's performance and entire Month completion). 

Whether executing **75 Hard**, entering **90-Day Monk Mode**, or building atomic daily rituals, the platform guarantees data integrity with rolling 72-hour edit windows, cross-month streak calculation, and strict database-level Row Level Security.

---

<a id="features"></a>
## ⚡ Key Features

### 🏆 1. 75-Day & 90-Day Challenge Engine
- **Structured Challenge Presets:**
  - **75 Hard / 75-Day Discipline** (75 Days of uncompromising mental grit)
  - **90-Day Monk Mode / Deep Work** (90 Days of zero distraction & intense focus)
  - **30-Day Consistency Sprint** (30 Days of rapid habit lock-in)
  - **21-Day Habit Builder** (21 Days for fundamental neurological rewiring)
  - **Custom Challenge Studio:** Define custom titles and duration from 7 to 365 days.
- **Dynamic Countdown & Status:** Real-time day counter (`Day 1 of 90 • 89 Days Left`), with automated upcoming date detection (`Starts in X days • Day 0 of 90`).
- **Milestone Badges & Rewards:** Unlockable tiered badges:
  - 🥉 **Bronze** (25%)
  - 🥈 **Silver** (50%)
  - 🥇 **Gold** (75%)
  - 👑 **Finisher Champion** (100% with full celebratory particle confetti)
- **Habit Adherence Tracking:** Real-time adherence score measuring execution quality on elapsed days with explicit checkmark fractions (e.g., `🔥 43% Habit Adherence (3/7)`).

### 📊 2. High-Density Habit Matrix & Dual Analytics
- **31-Day Interactive Grid:** Spreadsheet-inspired matrix categorized into 5 color-coded weekly bands (Week 1 to 5).
- **Dual Accuracy Analytics:**
  - **Monthly Total:** True mathematical progress across all possible checkmarks for the month (e.g., `3 / 217 Checkmarks (7 habits × 31d) = 1% Monthly`).
  - **Today's Score:** Instant daily execution gauge (e.g., `Today: 3/7 (43%)`).
- **Continuous Cross-Month Streaks:** Streak algorithms traverse backwards across historical logs, seamlessly preserving 30+, 60+, and 100+ day unbroken streaks across month and year transitions.
- **72-Hour Integrity Lock:** Protects authentic discipline by locking checkboxes older than 72 hours (3 calendar days) and blocking future checkmarks in advance.
- **Daily Progress Wave Chart:** Smooth cubic Bézier spline visualizing day-by-day habit execution rates.
- **Top 7 Daily Leaderboard:** Real-time ranking of your most consistent routines with active flame streak indicators.

### 🧠 3. Hybrid Motivational Quote Ticker
- **33 Curated Wisdom Quotes:** Timeless mental models and quotes from Marcus Aurelius, David Goggins, Jocko Willink, James Clear, Bruce Lee, Epictetus, Kobe Bryant, Seneca, and Aristotle.
- **Calm 18-Second Auto-Shuffle:** Gentle automated quote cycle that never feels frantic.
- **Pause-on-Hover / Touch:** Instantly pauses rotation whenever the cursor hovers or fingers touch the card, preventing quotes from disappearing mid-read.
- **Smooth Cross-Fade Transitions:** Powered by Framer Motion `AnimatePresence` with custom easing.
- **Compact Quick-Shuffle:** Minimalist square-rounded `🔀` icon button with a smooth 180° spin on tap.

### 📱 4. Responsive & Touch-First Experience
- **iPad, Tablet & Mobile Perfect:**
  - Sticky habit title column (`w-[185px]` mobile / `w-[220px]` desktop) with flexbox truncation (`min-w-0 flex-1 overflow-hidden`) prevents content clipping.
  - Dedicated, permanently visible soft rose delete button (`bg-rose-500/10 text-rose-600 dark:text-rose-400`) avoids broken hover-only interactions on touchscreens.
  - 10-second touch-friendly toast confirmation window prevents accidental deletions.
- **Smooth Auth Notifications:** Non-intrusive `top-center` notifications with Apple-style cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) guide guest visitors to sign in without aggressive modal interruptions.

### 🎨 5. Color Studio & Theme Engine
- **Custom Color Studio:** 7 modern preset tones or any custom hex color via native color picker, hex input, eyedropper, and quick-select chips.
- **Smart Luminance Math (YIQ):** Dynamic high-contrast text color selection so light, pastel, or white habit chips remain clearly legible.
- **Ultra-Smooth Dark/Light Mode:** Zero-flicker CSS variable theme engine with ambient floating background orbs and subtle micro-dot matrix texture.

---

<a id="tech-stack"></a>
## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.3.6](https://nextjs.org/) | App Router, React Server Components, Server Actions & Turbopack |
| **Core UI** | [React 19](https://react.dev/) | Concurrent rendering, `useActionState`, and `useTransition` |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety across database schemas, server actions, and UI |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation CSS-first configuration with custom design tokens |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth layout transitions, modal animations, and cross-fades |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) | Relational database with strict Row Level Security (RLS) & RPC functions |
| **Auth & SSR** | [@supabase/ssr](https://github.com/supabase/ssr) | Secure HTTP-only cookie-based session management |
| **Feedback & FX** | [Sonner](https://sonner.emilkowal.ski/) & [Canvas Confetti](https://github.com/catdad/canvas-confetti) | Polished toast alerts & celebratory particle bursts |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |

---

<a id="architecture"></a>
## 🗄️ Architecture & Database

Data is isolated using **PostgreSQL Row Level Security (RLS)** in Supabase. Every row is bound to `auth.uid() = user_id`, guaranteeing zero cross-user data leakage.

```mermaid
erDiagram
    auth_users ||--o{ habits : "owns (ON DELETE CASCADE)"
    habits ||--o{ habit_logs : "contains (ON DELETE CASCADE)"
    auth_users ||--o{ challenges : "owns (ON DELETE CASCADE)"

    habits {
        uuid id PK
        uuid user_id FK
        text title
        text color_theme
        timestamptz created_at
    }

    habit_logs {
        uuid id PK
        uuid habit_id FK
        date date
        boolean is_completed
        timestamptz created_at
    }

    challenges {
        uuid id PK
        uuid user_id FK
        text title
        int duration_days
        date start_date
        uuid_array habit_ids
        text status
        timestamptz created_at
    }
```

### PostgreSQL Security Policies
- **`public.habits`**: Users can only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` records where `user_id = auth.uid()`.
- **`public.habit_logs`**: Validates ownership via parent habit join: `EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())`.
- **`public.challenges`**: Isolated strictly to the creator (`auth.uid() = user_id`), constrained by duration ($7 \le \text{days} \le 365$) and status (`active`, `completed`, `abandoned`).
- **Atomic Account Deletion RPC (`delete_user_account`)**: Allows users to permanently purge their account, habits, challenges, logs, sessions, and auth identities in a single atomic database transaction.

---

<a id="getting-started"></a>
## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20.x or higher
- **npm** or **pnpm**
- A free **[Supabase](https://supabase.com/)** project

### 2. Clone Repository
```bash
git clone https://github.com/saarthvadalia26/Habit-Tracker.git
cd Habit-Tracker
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Initialize Database Schema
1. Navigate to your **Supabase Dashboard** -> **SQL Editor**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) in this repository.
3. Paste the contents into the SQL Editor and click **Run**.
*(Tables, indexes, constraints, RLS policies, and RPC functions will be created idempotently).*

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for Production
```bash
npm run build
npm run start
```

---

<a id="project-structure"></a>
## 📂 Project Structure

```plaintext
habit-tracker/
├── src/
│   ├── app/
│   │   ├── actions/               # Server Actions (Auth, Habits, Challenges)
│   │   │   ├── auth.ts            # Sign in, Sign up, Delete account, Metadata sync
│   │   │   ├── challenges.ts      # Cloud persistence for 75/90-Day challenges
│   │   │   └── habits.ts          # CRUD for habits & daily completion logs
│   │   ├── globals.css            # Tailwind v4 tokens, cubic-bezier toast curves
│   │   ├── layout.tsx             # Root layout with Geist font & ThemeProvider
│   │   └── page.tsx               # Server component page with SSR data hydration
│   ├── components/                # Modular UI Components
│   │   ├── AmbientBackground.tsx  # Dynamic floating ambient orbs and dot matrix
│   │   ├── AuthModal.tsx          # Login & registration modal dialog
│   │   ├── ChallengeBanner.tsx    # Active challenge countdown, progress bar & quotes
│   │   ├── CircularGauge.tsx      # SVG progress donut gauge with responsive viewBox
│   │   ├── CreateChallengeModal.tsx # 75 Hard, 90 Monk & custom challenge creator
│   │   ├── CreateHabitModal.tsx   # Habit creation modal with custom color picker
│   │   ├── DailyProgressWaveChart.tsx # Bézier curve daily completion graph
│   │   ├── DeleteAccountModal.tsx # Account wipe confirmation dialog with typing safety
│   │   ├── HeaderNav.tsx          # Navigation header with account dropdown & theme toggle
│   │   ├── NotesSection.tsx       # User-scoped markdown notes & reflection scratchpad
│   │   ├── SmartTrackerDashboard.tsx # Comprehensive monthly matrix & analytics engine
│   │   └── ThemeToggle.tsx        # Animated Light/Dark switch
│   ├── context/
│   │   └── ThemeContext.tsx       # Fast, lag-free Light/Dark theme provider
│   ├── lib/
│   │   ├── analytics.ts           # True monthly denominator & today score algorithms
│   │   ├── challengeUtils.ts      # Presets (75 Hard, 90 Monk, 30 Sprint) & milestone math
│   │   ├── constants.ts           # Predefined themes & dynamic color resolution
│   │   ├── dateUtils.ts           # Date math, ISO formatters, rolling day windows
│   │   ├── mockData.ts            # Sample habits for guest / preview mode
│   │   ├── monthUtils.ts          # Monthly days generator, 72h rule calculations
│   │   ├── quotes.ts              # 33 curated quotes on discipline, focus & grit
│   │   └── supabase/              # Supabase SSR clients (server, browser, and middleware)
│   ├── types/
│   │   ├── challenge.types.ts     # TypeScript interfaces for challenges & milestones
│   │   └── database.types.ts      # TypeScript definitions for database entities
│   └── middleware.ts              # Next.js root middleware for active session refreshing
├── supabase/
│   └── schema.sql                 # Complete idempotent PostgreSQL schema & RLS policies
├── public/                        # Static assets, multi-res favicons, and manifest
├── LICENSE                        # MIT License
├── README.md                      # Project documentation
└── package.json
```

---

<a id="security"></a>
## 🔒 Security & Integrity Rules

| Rule | Enforcement | Behavior |
| :--- | :--- | :--- |
| **Row Level Security (RLS)** | PostgreSQL Engine | Users can strictly access, mutate, and delete only their own records. |
| **72-Hour Edit Window** | Client & Server Action | Habit cells older than 3 calendar days (72h) are locked to maintain authentic discipline. |
| **Future Date Restriction** | Client & Server Action | Blocks ticking tomorrow or any future date ahead of time. |
| **Continuous Streaks** | Analytics Engine | Preserves unbroken streaks across month and year transitions. |
| **Accurate Monthly Denominator** | Analytics Engine | Evaluates monthly percentage against total monthly capacity ($H \times D_{\text{month}}$), separating today's score. |
| **Account-Scoped Cache** | Client State & Storage | Custom titles and scratchpad notes are isolated per email to prevent leakage on shared computers. |
| **Guest Sandbox Mode** | Client State | Visitors can explore all matrix views, challenge countdowns, and analytics with instant local persistence. |

---

<a id="license"></a>
## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <sub>Designed and built with discipline, focus, and precision.</sub>
</div>