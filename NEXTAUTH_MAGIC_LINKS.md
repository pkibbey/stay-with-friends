# NextAuth Magic Links & Adapter Requirements

## ⚠️ Critical I### Current Status

✅ **FIXED** - Implemented minimal custom adapter that provides required methods for EmailProvider.

**Key Issue Discovered**: NextAuth's EmailProvider requires `getUserByEmail` and other adapter methods, even with JWT strategy. Our adapter satisfies these requirements without actually persisting user data.e: Magic Links Require Database Adapter

### The Problem

**Magic link authentication in NextAuth v4 CANNOT work without a database adapter.** This is because:

1. **Verification Token Storage**: Magic links generate temporary verification tokens that must be stored somewhere
2. **Token Validation**: When a user clicks the magic link, NextAuth needs to verify the token exists and hasn't expired
3. **One-Time Use**: Tokens must be deleted after use to prevent replay attacks

### What We Tried (And Why It Failed)

```typescript
// ❌ This DOES NOT work with EmailProvider
export const authOptions = {
  // No adapter - JWT only sessions
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({ /* config */ }) // ← This REQUIRES an adapter!
  ]
}
```

### The Architecture Dilemma

We have conflicting requirements:
- **Want**: Simple JWT-only sessions (no session persistence)  
- **Need**: Database adapter for magic link tokens
- **Have**: Two separate databases (frontend auth + backend app data)

### Solution Options

#### Option 1: Minimal Custom Adapter ✅ RECOMMENDED
Use a lightweight custom adapter that only handles verification tokens:

```typescript
// Custom adapter that ONLY stores verification tokens
// Users and sessions remain JWT-only
const MinimalAdapter = {
  // Skip user/session methods (use JWT)
  createUser: undefined,
  getUser: undefined, 
  // ... etc
  
  // ONLY implement token methods (required for magic links)
  async createVerificationToken(token) { /* store token */ },
  async useVerificationToken(params) { /* verify & delete token */ }
}
```

#### Option 2: Separate Auth Database
Keep a small SQLite database ONLY for NextAuth verification tokens:
- `auth.db` - Only verification tokens (tiny, fast)
- `backend/database.db` - All application data

#### Option 3: Switch to Different Auth Method
Replace magic links with:
- OAuth providers (Google, GitHub) - no adapter needed
- Phone/SMS verification 
- Traditional email/password

### Current Status

✅ **FIXED** - Implemented minimal custom adapter for verification tokens only.

### Implemented Solution

**Option 1** - Minimal custom adapter that:
- ✅ Handles verification tokens (required for magic links)
- ✅ Uses JWT for sessions (no session persistence) 
- ✅ Keeps user management in backend GraphQL API
- ✅ Minimal database footprint

### Implementation Files

1. **`/apps/frontend/src/lib/minimal-auth-adapter.ts`** - Custom adapter implementation
2. **`/apps/frontend/src/lib/auth.ts`** - Updated NextAuth configuration  
3. **`./verification-tokens.db`** - Tiny SQLite database (auto-created)

### How It Works

```typescript
// Custom adapter that ONLY handles verification tokens
export const authOptions = {
  adapter: createMinimalAuthAdapter('./verification-tokens.db'), // ← For magic links
  session: { strategy: "jwt" }, // ← JWT-only sessions
  providers: [EmailProvider({ /* config */ })] // ← Now works!
}
```

**Database Usage:**
- `verification-tokens.db` - Only temporary magic link tokens (~KB in size)
- `apps/backend/database.db` - All application data (users, hosts, bookings)
- **No session persistence** - JWT handles all session state

### Key Learnings

1. **NextAuth magic links are not "serverless"** - they require stateful token storage
2. **JWT-only sessions** and **magic link auth** have conflicting requirements  
3. **Read the NextAuth docs carefully** - adapter requirements vary by provider
4. **Consider the full authentication flow** when choosing strategies

---

*This document should be referenced when making future authentication architecture decisions.*