import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'

export const auth = betterAuth({
  database: new Database("./sqlite.db"),
  baseURL: process.env.NEXTAUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    },
  }
})
