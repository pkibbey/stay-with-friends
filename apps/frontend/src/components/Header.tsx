'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
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
      <div className="container mx-auto px-4 py-4 flex items-center justify-between h-14">
        <Link href="/" className="text-xl font-bold">
          <TextLogo className="text-lg md:text-xl" />
        </Link>
        <nav className="flex items-center gap-6">
          {status === 'loading' ? undefined : session ? (
            <>
              <div className="flex items-center gap-4">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/search" className='font-medium px-4'>Search</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <NavigationMenuLink href="/settings/profile">Profile</NavigationMenuLink>
                        <NavigationMenuLink href="/settings/connections">Connections</NavigationMenuLink>
                        <NavigationMenuLink href="/settings/stays">Stays {pendingRequestsCount ? pendingRequestsCount : null}</NavigationMenuLink>
                        <NavigationMenuLink href="/settings/hosting">Hosting</NavigationMenuLink>
                        <NavigationMenuLink className="cursor-pointer" onClick={() => signOut()}>
                            Sign Out
                        </NavigationMenuLink>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

              </div>
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