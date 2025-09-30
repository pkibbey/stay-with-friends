import { NextRequest, NextResponse } from 'next/server'
import { User } from '@stay-with-friends/shared-types'

import { apiGet } from '@/lib/api'

// GET /api/user - Get user by email
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // REST endpoint: /users?email=xxx
  const users = await apiGet<User[]>(`/users?email=${encodeURIComponent(email)}`)
    const user = Array.isArray(users) ? users[0] : users

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}