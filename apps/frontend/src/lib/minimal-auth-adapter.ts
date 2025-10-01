import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters"
import Database from "better-sqlite3"

/**
 * Minimal NextAuth adapter that ONLY handles verification tokens.
 * 
 * IMPORTANT: This adapter provides the required methods for EmailProvider
 * but doesn't actually persist users or sessions. All user methods return
 * temporary data - real user management happens in the JWT callback via
 * the backend API.
 * 
 * This allows magic link authentication to work while keeping:
 * - JWT-only sessions (no session persistence)
 * - User management in backend API  
 * - Minimal database footprint (only verification tokens)
 */
export function createMinimalAuthAdapter(dbPath: string = './verification-tokens.db'): Adapter {
  const db = new Database(dbPath)
  
  // Create only the verification tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );
    
    CREATE INDEX IF NOT EXISTS idx_verification_expires ON verification_tokens(expires);
  `)

  // Prepared statements
  const insertToken = db.prepare(`
    INSERT INTO verification_tokens (identifier, token, expires) 
    VALUES (?, ?, ?)
  `)
  
  const findAndDeleteToken = db.prepare(`
    DELETE FROM verification_tokens 
    WHERE identifier = ? AND token = ? 
    RETURNING *
  `)
  
  // Clean up expired tokens periodically
  const cleanupExpired = db.prepare(`
    DELETE FROM verification_tokens 
    WHERE expires < ?
  `)

  return {
    // Required methods for EmailProvider (but we don't actually store users)
    async createUser(user: Omit<AdapterUser, "id">) {
      // Return a temporary user - real user management happens in JWT callback
      return {
        id: crypto.randomUUID(),
        email: user.email,
        name: user.name ?? null,
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
      }
    },

    async getUser(id: string) {
      // We don't store users in this database
      console.log('getUser called with id:', id, '(not implemented - using JWT)')
      return null
    },

    async getUserByEmail(email: string) {
      // Required by EmailProvider - return temporary user
      // Real user lookup happens in JWT callback via backend API
      return {
        id: crypto.randomUUID(),
        email,
        name: null,
        emailVerified: null,
        image: null,
      }
    },

    async getUserByAccount() {
      return null // Not using OAuth accounts
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      return user as AdapterUser // Not actually updating
    },

    async deleteUser() {
      // Not actually deleting
    },

    async linkAccount(account: AdapterAccount) {
      // Not using OAuth accounts - just return the account
      return account
    },

    async unlinkAccount() {
      // Not using accounts
    },

    // Session methods (not used with JWT strategy but required by interface)
    async createSession() {
      throw new Error("Sessions not supported - using JWT")
    },

    async getSessionAndUser() {
      return null
    },

    async updateSession() {
      throw new Error("Sessions not supported - using JWT")  
    },

    async deleteSession() {
      // Not using database sessions
    },

    // ONLY implement verification token methods (required for magic links)
    async createVerificationToken({ identifier, expires, token }) {
      // Clean up expired tokens before inserting new one
      const now = Math.floor(Date.now() / 1000)
      cleanupExpired.run(now)
      
      // Insert new verification token
      insertToken.run(identifier, token, Math.floor(expires.getTime() / 1000))
      
      return { identifier, expires, token }
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const result = findAndDeleteToken.get(identifier, token) as {
          identifier: string
          token: string
          expires: number
        } | undefined
        
        if (!result) {
          return null // Token not found or already used
        }

        // Check if token has expired
        const now = Math.floor(Date.now() / 1000)
        if (result.expires < now) {
          return null // Token expired
        }

        return {
          identifier: result.identifier,
          token: result.token,
          expires: new Date(result.expires * 1000),
        }
      } catch (error) {
        console.error('Error using verification token:', error)
        return null
      }
    },
  } as Adapter
}