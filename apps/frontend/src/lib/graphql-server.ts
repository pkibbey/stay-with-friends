import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql'

interface ExtendedSession {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  apiToken?: string
}

export interface GraphQLError {
  message: string
  locations?: Array<{ line: number; column: number }>
  path?: string[]
}

export interface GraphQLResponse<T = Record<string, unknown>> {
  data?: T
  errors?: GraphQLError[]
}

export async function serverGraphqlRequest<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  // Get the session server-side
  const session = await getServerSession(authOptions) as ExtendedSession

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add authorization header if user is authenticated and has an API token
  if (session?.apiToken) {
    headers['Authorization'] = `Bearer ${session.apiToken}`
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message)
  }

  return result
}

// Helper function for authenticated requests (throws if not authenticated)
export async function serverAuthenticatedGraphQLRequest<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const session = await getServerSession(authOptions) as ExtendedSession

  if (!session?.user || !session?.apiToken) {
    throw new Error('Authentication required')
  }

  return serverGraphqlRequest<T>(query, variables)
}

// Server-side function to fetch user data
export async function fetchUserData(email: string): Promise<{ id: string; email?: string; name?: string; image?: string; createdAt?: string } | null> {
  try {
    const result = await serverAuthenticatedGraphQLRequest(`
      query GetUser($email: String!) {
        user(email: $email) {
          id
          email
          name
          image
          createdAt
        }
      }
    `, { email })
    
    type UserResponse = { user?: { id: string; email?: string; name?: string; image?: string; createdAt?: string } }
    const userData = (result.data || {}) as UserResponse
    let userObj = userData.user

    // If backend doesn't have a user row yet, create one (authenticated)
    if (!userObj) {
      try {
        const createMutation = `
          mutation CreateUser($email: String!, $name: String) {
            createUser(email: $email, name: $name) {
              id
              email
              name
              image
              createdAt
            }
          }
        `
        const createResult = await serverAuthenticatedGraphQLRequest<{ createUser?: { id: string; email: string; name: string; image: string; createdAt: string } }>(createMutation, { email, name: undefined })
        const created = (createResult.data as { createUser?: { id: string; email: string; name: string; image: string; createdAt: string } } | undefined)?.createUser
        if (created) {
          userObj = created
          console.log('Created backend user:', created)
        }
      } catch (err) {
        console.error('Failed to create backend user:', err)
      }
    }

    return userObj || null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}