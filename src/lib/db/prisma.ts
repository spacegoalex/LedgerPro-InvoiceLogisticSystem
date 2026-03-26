/**
 * Database client — use this anywhere you need to read/write the DB.
 * Config comes from .env.local (DATABASE_URL). On local, data is stored
 * in the SQLite file (e.g. prisma/dev.db).
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
