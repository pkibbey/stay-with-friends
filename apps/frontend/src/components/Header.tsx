'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          StayWithFriends
        </Link>
        <nav className="flex items-center gap-4">
          {status === 'loading' ? (
            <div>Loading...</div>
          ) : session ? (
            <>
              <Link href="/search" className="text-gray-600 hover:text-gray-900">
                Search
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <Link href="/connections" className="text-gray-600 hover:text-gray-900">
                Connections
              </Link>
              <Link href="/hosting" className="text-gray-600 hover:text-gray-900">
                Hosting
              </Link>
              <Button variant="outline" className='cursor-pointer' onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/search" className="text-gray-600 hover:text-gray-900">
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