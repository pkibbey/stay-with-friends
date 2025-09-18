import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// This is a simple GraphQL client function
async function graphqlRequest(query: string, variables: object = {}) {
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

// GET /api/listings/[id] - Get a specific listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const query = `
      query GetListing($id: ID!) {
        listing(id: $id) {
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

    const data = await graphqlRequest(query, { id })
    
    if (!data.listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ listing: data.listing })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// PUT /api/listings/[id] - Update a listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
        updateListing(id: $id, input: $input) {
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
    const modifiedBody = {
      query,
      variables: { id: id, input: body },
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

    return NextResponse.json({ listing: data.data.updateListing })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: error || 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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
      mutation DeleteListing($id: ID!) {
        deleteListing(id: $id)
      }
    `

    // For now, we'll use a context workaround since the backend expects userId in context
    const modifiedBody = {
      query,
      variables: { id: id },
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

    return NextResponse.json({ success: data.data.deleteListing })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: error || 'Failed to delete listing' },
      { status: 500 }
    )
  }
}