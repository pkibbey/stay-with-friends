import { getSession } from 'next-auth/react'

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

export async function graphqlRequest<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  // Get the session to include auth token
  const session = await getSession() as ExtendedSession

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
export async function authenticatedGraphQLRequest<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const session = await getSession() as ExtendedSession

  if (!session?.user || !session?.apiToken) {
    throw new Error('Authentication required')
  }

  return graphqlRequest<T>(query, variables)
}