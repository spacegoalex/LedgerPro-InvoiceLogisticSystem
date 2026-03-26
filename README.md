# SWL Invoice & Revenue Manager

Logistics Operating System — React-based Invoice & Revenue Manager for heads-down data entry and real-time profit visibility.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI:** Shadcn-style components (Card, Form, Table, Input, Select, Badge)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Database:** Prisma + SQLite (local file); optional PostgreSQL for production

## Where the database is saved (local)

- **Config:** Create `.env.local` in the project root (copy from `.env.local.example`). Put your `DATABASE_URL` there. For local SQLite use: `DATABASE_URL="file:./dev.db"`.
- **Data file:** With that URL, the database file is stored at **`prisma/dev.db`** on your machine. All invoices are persisted there.
- **Code:** Database client and schema live in **`src/lib/db/`** and **`prisma/schema.prisma`**.

## Run

```bash
npm install
cp .env.local.example .env.local   # then edit .env.local if needed
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **New Invoice** → fill form → **Save to database**; then **History** to see and export saved invoices.

## Features

- **Shell:** Fixed dark-slate sidebar (Dashboard, New Invoice, History, Settings) and minimal header with system status.
- **New Invoice:** 3-panel cockpit — Logistics context, Financial calculator (Revenue + Cost), Real-time profit analysis with margin meter and mini bar chart. Enter key moves focus to next field.
- **History:** Dense zebra-striped table, date range filter, search, Export to Excel (CSV).
- **Keyboard-first:** `useEnterNavigation` hook on the New Invoice form for rapid entry without mouse.

## Design

- Cockpit layout: main workspace fits within 100vh, no page scroll.
- Compact spacing (`gap-2`, `h-8` inputs), `text-sm`.
- Operational data: gray/blue; Revenue: green; Cost: amber; Profit: emerald/rose.
- Fonts: Inter (UI), JetBrains Mono / tabular-nums for figures.
