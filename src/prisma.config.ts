// Prisma v6 config — resilient: `generate` không cần DB thật,
// chỉ `migrate`/`seed` mới yêu cầu DATABASE_URL hợp lệ (.env hoặc .env.local)
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { defineConfig } from "prisma/config";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: DATABASE_URL,
  },
});
