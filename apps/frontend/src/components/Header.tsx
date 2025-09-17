'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          StayWithFriends
        </Link>
        <nav className="flex items-center gap-4">
          {status === 'loading' ? (
            <div>Loading...</div>
          ) : session ? (
            <>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <Link href="/connections" className="text-gray-600 hover:text-gray-900">
                Connections
              </Link>
              <Link href="/manage-hosting" className="text-gray-600 hover:text-gray-900">
                Manage Hosting
              </Link>
              <Button variant="outline" className='cursor-pointer' onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}