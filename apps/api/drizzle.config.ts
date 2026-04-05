import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://phena:phena@localhost:5432/phena",
  },
} satisfies Config;
