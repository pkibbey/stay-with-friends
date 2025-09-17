import { NextRequest, NextResponse } from 'next/server'

// This is a simple GraphQL client function
async function graphqlRequest(query: string, variables: any = {}) {
  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const data = await response.json()
  if (data.errors) {
    throw new Error(data.errors[0].message)
  }
  return data.data
}

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

    const query = `
      query GetUser($email: String!) {
        user(email: $email) {
          id
          name
          email
          emailVerified
          image
          createdAt
        }
      }
    `

    const data = await graphqlRequest(query, { email })
    
    if (!data.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: data.user })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}