/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth from 'next-auth/next'
import EmailProvider from 'next-auth/providers/email'
import { createTransport } from 'nodemailer'
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

export const authOptions = {
  adapter: DrizzleAdapter(db),
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
    async signIn({ user, account }: { user: any; account: any; profile?: any }) {
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
      console.log('Session callback called with token:', token.sub, 'backendUserId:', token.backendUserId)
      
      if (token?.backendUserId) {
        if (!session.user) session.user = {}
        session.user.id = token.backendUserId
        console.log('Set session.user.id to:', session.user.id)
      } else if (token?.sub) {
        // Fallback to NextAuth user ID if no backend user ID
        if (!session.user) session.user = {}
        session.user.id = token.sub
        console.log('Using NextAuth user ID as fallback:', session.user.id)
      }
      
      console.log('Returning session with user:', session.user)
      return session
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      console.log('JWT callback called with:', { token: token.sub, user: user?.email, account: account?.provider })
      
      // On sign in, fetch the backend user ID
      if (account?.provider === 'email' && user?.email) {
        try {
          console.log('Fetching backend user ID for email:', user.email)
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                query GetUser($email: String!) {
                  user(email: $email) {
                    id
                    email
                    name
                  }
                }
              `,
              variables: { email: user.email },
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.data?.user?.id) {
              token.backendUserId = data.data.user.id.toString()
              console.log('Stored backend user ID in token:', token.backendUserId)
            }
          }
        } catch (error) {
          console.error('Error fetching backend user ID in JWT callback:', error)
        }
      }
      
      return token
    },
  },
}

export default NextAuth(authOptions)