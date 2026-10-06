import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });

type PrismaGlobal = typeof globalThis & {
  __awsQuestPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma = globalForPrisma.__awsQuestPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__awsQuestPrisma = prisma;
}
