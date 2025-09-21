'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { TextLogo } from './TextLogo'

export function Header() {
  const { data: session, status } = useSession()
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (session?.user as any)?.id
      if (!userId) return

      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPendingRequestsCount($userId: ID!) {
                pendingBookingRequestsCount(userId: $userId)
              }
            `,
            variables: { userId },
          }),
        })
        const data = await response.json()
        setPendingRequestsCount(data.data?.pendingBookingRequestsCount || 0)
      } catch (error) {
        console.error('Error fetching pending requests count:', error)
      }
    }

    if (session?.user) {
      fetchPendingRequestsCount()
    }
  }, [session?.user])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          <TextLogo className="text-xs md:text-xl" />
        </Link>
        <nav className="flex items-center gap-6">
          {status === 'loading' ? undefined : session ? (
            <>
              {/* Common/Public Navigation */}
              <div className="flex items-center gap-4">
                <Link href="/search" className="text-gray-600 hover:text-gray-900 font-medium">
                  Search
                </Link>
              </div>
              
              {/* Visual separator */}
              <div className="h-6 w-px bg-gray-300"></div>
              
              {/* Personal/Account Navigation */}
              <div className="flex items-center gap-4">
                <Link href="/settings/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
                <Link href="/settings/connections" className="text-gray-600 hover:text-gray-900">
                  Connections
                </Link>
                <Link href="/settings/bookings" className="text-gray-600 hover:text-gray-900 relative">
                  <div className="flex items-center gap-1">
                    Bookings
                    {pendingRequestsCount > 0 && (
                      <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs min-w-[1.2rem] h-5">
                        {pendingRequestsCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Link href="/settings/hosting" className="text-gray-600 hover:text-gray-900">
                  Hosting
                </Link>
              </div>
              
              {/* Another separator before account actions */}
              <div className="h-6 w-px bg-gray-300"></div>
              
              <Button variant="outline" className='cursor-pointer' onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/search" className="text-gray-600 hover:text-gray-900 font-medium">
                Search
              </Link>
              <Button onClick={() => signIn()}>
                Sign In
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}