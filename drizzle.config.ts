import type { Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_CONNECTION_URL;
if (!connectionString) throw Error("DATABASE CONNECTION URL NOT FOUND");

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
