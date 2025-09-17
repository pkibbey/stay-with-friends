'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, MapPin, Users, Home } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  amenities: string[]
  photos: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ManageListingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserListings()
    }
  }, [status, session])

  const fetchUserListings = async () => {
    try {
      // Get user ID first
      const userResponse = await fetch(`/api/user?email=${encodeURIComponent(session?.user?.email || '')}`)
      if (!userResponse.ok) {
        throw new Error('Failed to get user information')
      }
      const userData = await userResponse.json()
      
      // Fetch user's listings
      const response = await fetch(`/api/listings?userId=${userData.user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }
      
      const data = await response.json()
      setListings(data.listings || [])
    } catch (err) {
      console.error('Error fetching listings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete listing')
      }

      // Remove the listing from the local state
      setListings(prev => prev.filter(listing => listing.id !== listingId))
    } catch (err) {
      console.error('Error deleting listing:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete listing')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to manage your listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in to continue.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Your Listings</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage your property listings
          </p>
        </div>
        <Link href="/listings/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Listing
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first property listing to share with friends and travelers.
            </p>
            <Link href="/listings/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {listing.photos.length > 0 ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {!listing.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {listing.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.city}, {listing.state}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {listing.maxGuests} guests
                  </div>
                </div>
                
                {listing.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {listing.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {listing.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{listing.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Link href={`/listings/${listing.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteListing(listing.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}