import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Debug session API called')
    console.log('Session:', JSON.stringify(session, null, 2))
    
    if (session?.user?.email) {
      // Test the same GraphQL query that the session callback should be making
      console.log('Testing GraphQL query for email:', session.user.email)
      
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
          variables: { email: session.user.email },
        }),
      })
      
      console.log('GraphQL response status:', response.status)
      const data = await response.json()
      console.log('GraphQL response data:', JSON.stringify(data, null, 2))
      
      return NextResponse.json({
        session,
        graphqlQuery: {
          status: response.status,
          data
        }
      })
    }
    
    return NextResponse.json({ session, message: 'No email in session' })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}