import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/db.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "./auth.db",
  },
})