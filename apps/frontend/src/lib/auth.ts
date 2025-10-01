/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth from 'next-auth/next'
import EmailProvider from 'next-auth/providers/email'
import { createTransport } from 'nodemailer'
import jwt from 'jsonwebtoken'
import { createMinimalAuthAdapter } from './minimal-auth-adapter'

// Use the same JWT secret as the backend
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export const authOptions = {
  // Minimal adapter: ONLY handles verification tokens for magic links
  // Users and sessions still use JWT (no persistence)
  // This is required because magic links need temporary token storage
  adapter: createMinimalAuthAdapter('./verification-tokens.db'),
  session: {
    strategy: "jwt" as const, // Force JWT strategy to make session callback work properly
  },
  // Enable debug logging in development to help diagnose configuration issues
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    error: (...params: any[]) => console.error('[next-auth][error]', ...params),
    warn: (...params: any[]) => console.warn('[next-auth][warn]', ...params),
    debug: (...params: any[]) => console.debug('[next-auth][debug]', ...params),
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@staywithfriends.com',
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        // For development, log the URL and write it to a temp file so it can be
        // captured programmatically during tests or debugging.
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 Magic link for development:', url)
          console.log('📧 Send this link to:', email)
          try {
            // Lazily require fs to avoid bundling issues
            const fs = await import('fs')
            const entry = `${new Date().toISOString()}\t${email}\t${url}\n`
            fs.appendFileSync('/tmp/staywithfriends-magic-link.log', entry, { encoding: 'utf8' })
          } catch (err) {
            console.error('Failed to write magic link to /tmp:', err)
          }
        } else {
          const transport = createTransport(provider.server)
          const result = await transport.sendMail({
            to: email,
            from: provider.from,
            subject: 'Sign in to Stay With Friends',
            text: `Sign in to Stay With Friends\n\n${url}\n\n`,
            html: `<p>Sign in to Stay With Friends</p><p><a href="${url}">Click here to sign in</a></p>`,
          })
          console.log('Email sent:', result)
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
  async signIn() {
      // Create user in our database if not exists
      // We no longer create the backend user here because the JWT callback
      // will ensure an authenticated call to the backend to fetch/create the
      // corresponding backend user. Keep signIn fast and non-blocking.
      // Leaving signIn to always succeed.
      return true
    },
    async session({ session, token }: { session: any; token: any }) {      
      if (token?.backendUserId) {
        if (!session.user) session.user = {}
        session.user.id = token.backendUserId
      } else if (token?.sub) {
        // Fallback to NextAuth user ID if no backend user ID
        if (!session.user) session.user = {}
        session.user.id = token.sub
      }
      // Ensure email, name and image are available on the client session
      if (!session.user) session.user = {}
      if (token?.email) session.user.email = token.email
      if (token?.name) session.user.name = token.name
      if (token?.picture) session.user.image = token.picture
      
      // Add the JWT token for API calls
      if (token?.apiToken) {
        session.apiToken = token.apiToken
      }
      
      return session
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // We'll create a temporary API token (may not include backendUserId yet)
      // to perform authenticated backend calls. After we fetch/create the
      // backend user we re-sign the API token so it includes backendUserId.
      if (token.sub) {
        const tempApiToken = jwt.sign(
          {
            sub: token.sub,
            email: token.email,
            name: token.name,
            backendUserId: token.backendUserId,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        )
        token.apiToken = tempApiToken

        if (account?.provider === 'email' && user?.email) {
          try {
            console.log('Fetching backend user ID for email (authenticated):', user.email)
            // Try to fetch user from REST API
            const response = await fetch(`http://localhost:4000/api/users/email/${encodeURIComponent(user.email)}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.id) {
                token.backendUserId = data.id;
                if (data.name) token.name = data.name;
                if (data.email) token.email = data.email;
                console.log('Stored backend user ID in token:', token.backendUserId);
              } else {
                // No user found, attempt to create one via REST
                console.log('No backend user found; creating user for email:', user.email);
                const createResp = await fetch('http://localhost:4000/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: user.email, name: user.name }),
                });
                if (createResp.ok) {
                  const createData = await createResp.json();
                  if (createData && createData.id) {
                    token.backendUserId = createData.id;
                    if (createData.name) token.name = createData.name;
                    if (createData.email) token.email = createData.email;
                    console.log('Created backend user and stored id in token:', token.backendUserId);
                  }
                }
              }
            } else if (response.status === 404) {
              console.log('Backend user not found (404); creating user for email:', user.email);
              const createResp = await fetch('http://localhost:4000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, name: user.name }),
              });
              if (createResp.ok) {
                const createData = await createResp.json();
                if (createData && createData.id) {
                  token.backendUserId = createData.id;
                  if (createData.name) token.name = createData.name;
                  if (createData.email) token.email = createData.email;
                  console.log('Created backend user and stored id in token:', token.backendUserId);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching/creating backend user in JWT callback:', error);
          }
        }

        // Re-sign the API token so it includes backendUserId (if found/created).
        const finalApiToken = jwt.sign(
          {
            sub: token.sub,
            email: token.email,
            name: token.name,
            backendUserId: token.backendUserId,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        )
        token.apiToken = finalApiToken
      }

      // Propagate basic profile fields from the provider/user into the token
      // so they are available in the client session when using JWT strategy
      if (user) {
        if (user.email) token.email = user.email
        if (user.name) token.name = user.name
        if (user.image) token.picture = user.image
      }
      
      return token
    },
  },
}

export default NextAuth(authOptions)