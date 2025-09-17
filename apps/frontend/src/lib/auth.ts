import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { createTransport } from 'nodemailer'
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

export const authOptions = {
  adapter: DrizzleAdapter(db),
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
      from: process.env.EMAIL_FROM || 'noreply@friendsbnb.com',
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
            fs.appendFileSync('/tmp/friendsbnb-magic-link.log', entry, { encoding: 'utf8' })
          } catch (err) {
            console.error('Failed to write magic link to /tmp:', err)
          }
        } else {
          const transport = createTransport(provider.server)
          const result = await transport.sendMail({
            to: email,
            from: provider.from,
            subject: 'Sign in to Friends BNB',
            text: `Sign in to Friends BNB\n\n${url}\n\n`,
            html: `<p>Sign in to Friends BNB</p><p><a href="${url}">Click here to sign in</a></p>`,
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
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // Create user in our database if not exists
      if (account?.provider === 'email' && user.email) {
        try {
          // Call backend to create user
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                mutation CreateUser($email: String!, $name: String) {
                  createUser(email: $email, name: $name) {
                    id
                    email
                    name
                  }
                }
              `,
              variables: { email: user.email, name: user.name },
            }),
          })
          if (!response.ok) {
            console.error('Backend response not ok:', response.status)
            return true // Continue anyway
          }
          const data = await response.json()
          if (data.errors) {
            console.error('GraphQL errors:', data.errors)
            // If user already exists, that's fine
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // Don't fail the sign-in if backend is unavailable
        }
      }
      return true
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.sub) {
        if (!session.user) session.user = {}
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
}

export default NextAuth(authOptions)

// Export for server-side usage
export { getServerSession } from 'next-auth'