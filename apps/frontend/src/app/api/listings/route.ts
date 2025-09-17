import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

// GET /api/listings - Get all listings or user's listings with advanced search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const location = searchParams.get('location')
    const amenities = searchParams.getAll('amenities')
    const trustedOnly = searchParams.get('trustedOnly') === 'true'
    const guests = searchParams.get('guests')

    let query: string
    let variables: any = {}

    if (search || startDate || endDate || location || amenities.length > 0 || trustedOnly || guests) {
      // Advanced search with filters
      query = `
        query SearchListingsAdvanced(
          $query: String
          $startDate: String
          $endDate: String
          $location: String
          $amenities: [String!]
          $trustedOnly: Boolean
          $guests: Int
        ) {
          searchListingsAdvanced(
            query: $query
            startDate: $startDate
            endDate: $endDate
            location: $location
            amenities: $amenities
            trustedOnly: $trustedOnly
            guests: $guests
          ) {
            id
            title
            description
            address
            city
            state
            zipCode
            country
            latitude
            longitude
            maxGuests
            bedrooms
            bathrooms
            amenities
            houseRules
            checkInTime
            checkOutTime
            photos
            isActive
            createdAt
            updatedAt
            availabilities {
              id
              startDate
              endDate
              status
              notes
            }
            user {
              id
              name
              email
            }
          }
        }
      `
      variables = {
        query: search || null,
        startDate: startDate || null,
        endDate: endDate || null,
        location: location || null,
        amenities: amenities.length > 0 ? amenities : null,
        trustedOnly: trustedOnly || null,
        guests: guests ? parseInt(guests) : null
      }
    } else if (search) {
      // Simple search (backward compatibility)
      query = `
        query SearchListings($query: String!) {
          searchListings(query: $query) {
            id
            title
            description
            city
            state
            maxGuests
            bedrooms
            bathrooms
            photos
            amenities
            isActive
            availabilities {
              id
              startDate
              endDate
              status
              notes
            }
            user {
              id
              name
              email
            }
          }
        }
      `
      variables = { query: search }
    } else if (userId) {
      query = `
        query UserListings($userId: ID!) {
          userListings(userId: $userId) {
            id
            title
            description
            address
            city
            state
            zipCode
            country
            latitude
            longitude
            maxGuests
            bedrooms
            bathrooms
            amenities
            houseRules
            checkInTime
            checkOutTime
            photos
            isActive
            createdAt
            updatedAt
          }
        }
      `
      variables = { userId }
    } else {
      query = `
        query AllListings {
          listings {
            id
            title
            description
            city
            state
            maxGuests
            bedrooms
            bathrooms
            photos
            amenities
            isActive
          }
        }
      `
    }

    const data = await graphqlRequest(query, variables)
    const listings = data.searchListingsAdvanced || data.searchListings || data.userListings || data.listings

    return NextResponse.json({ listings })
  } catch (error: any) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Get user ID from email
    const userQuery = `
      query GetUser($email: String!) {
        user(email: $email) {
          id
        }
      }
    `
    const userData = await graphqlRequest(userQuery, { email: session.user.email })
    
    if (!userData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const query = `
      mutation CreateListing($input: CreateListingInput!) {
        createListing(input: $input) {
          id
          title
          description
          address
          city
          state
          zipCode
          country
          latitude
          longitude
          maxGuests
          bedrooms
          bathrooms
          amenities
          houseRules
          checkInTime
          checkOutTime
          photos
          isActive
          createdAt
          updatedAt
        }
      }
    `

    // For now, we'll use a context workaround since the backend expects userId in context
    // In a production app, you'd modify the GraphQL server to handle authentication properly
    const modifiedBody = {
      query,
      variables: { input: body },
      context: { userId: userData.user.id }
    }

    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modifiedBody),
    })

    const data = await response.json()
    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    return NextResponse.json({ listing: data.data.createListing })
  } catch (error: any) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    )
  }
}