'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TextLogo } from './TextLogo'

export function Header() {
  const { data: session, status } = useSession()
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

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
        <Link href="/" className="text-xl font-semibold">
          <TextLogo className="text-lg md:text-xl" />
        </Link>
        <nav className="flex items-center gap-6">
          {status === 'loading' ? undefined : session ? (
            <>
              <div className="flex items-center gap-4">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/search" className={`px-4 ${isActive('/search') && "font-semibold"}`}>Search</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/stays" className={`px-4 ${isActive('/stays') && "font-semibold"}`}>Stays {pendingRequestsCount ? pendingRequestsCount : null}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/hosting" className={`px-4 ${isActive('/hosting') && "font-semibold"}`}>Hosting</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <NavigationMenuLink asChild>
                          <Link className={`px-3 py-2 ${isActive('/settings/profile') && "font-semibold"}`} href="/settings/profile">Profile</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link className={
                            `px-3 py-2 ${isActive('/settings/connections') && "font-semibold"}`
                            } href="/settings/connections">Connections</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-sm transition-colors mb-1" onClick={() => signOut()}>
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