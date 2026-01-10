/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import jwt from 'jsonwebtoken'

// Use the same JWT secret as the backend
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.token) {
          return null
        }

        try {
          const verified = jwt.verify(credentials.token, JWT_SECRET) as any
          if (verified.email === credentials.email) {
            return {
              id: verified.userId || credentials.email,
              email: credentials.email,
              name: verified.name,
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error)
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  jwt: {
    secret: JWT_SECRET,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id || token.sub
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
  },
}

export default NextAuth(authOptions)

