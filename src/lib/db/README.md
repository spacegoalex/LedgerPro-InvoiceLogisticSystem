# Where the database lives

- **Config:** Save your connection in **`.env.local`** in the project root (copy from `.env.local.example`).  
  Example for local SQLite: `DATABASE_URL="file:./dev.db"`  
  The DB file path is relative to the `prisma` folder, so `./dev.db` → `prisma/dev.db`.

- **Data (local SQLite):** The actual database file is **`prisma/dev.db`** (or whatever path you set in `DATABASE_URL`). All invoices are stored there on your machine.

- **Code:** This folder (`src/lib/db/`) and `prisma/schema.prisma` define how the app talks to the database. Use `import { prisma } from "@/lib/db/prisma"` in API routes or server code.

- **Switching to PostgreSQL later:** Change `DATABASE_URL` in `.env.local` to a Postgres URL and run `npx prisma migrate dev` (and update `provider` in `prisma/schema.prisma` to `postgresql`).
