'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ListingForm, ListingFormData } from '@/components/ListingForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<Partial<ListingFormData> | null>(null)

  const listingId = params.id as string

  useEffect(() => {
    if (status === 'authenticated' && listingId) {
      fetchListing()
    }
  }, [status, listingId])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Listing not found')
        }
        throw new Error('Failed to fetch listing')
      }

      const data = await response.json()
      const listing = data.listing

      // Transform the data to match ListingFormData
      setInitialData({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        country: listing.country,
        latitude: listing.latitude,
        longitude: listing.longitude,
        maxGuests: listing.maxGuests,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        amenities: listing.amenities || [],
        houseRules: listing.houseRules,
        checkInTime: listing.checkInTime,
        checkOutTime: listing.checkOutTime,
        photos: listing.photos || [],
      })
    } catch (err) {
      console.error('Error fetching listing:', err)
      setError(err instanceof Error ? err.message : 'Failed to load listing')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (formData: ListingFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update listing')
      }

      const result = await response.json()
      console.log('Listing updated successfully:', result.listing)
      
      // Redirect to listings management page
      router.push('/listings/manage')
    } catch (err) {
      console.error('Error updating listing:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/listings/manage')
  }

  if (status === 'loading' || isLoadingData) {
    return (
      <PageLayout title="Edit Listing" showHeader={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listing...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <PageLayout title="Edit Listing" showHeader={false}>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to edit listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in to continue.</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Error" showHeader={false}>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Unable to load the listing for editing.</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  if (!initialData) {
    return (
      <PageLayout title="Listing Not Found" showHeader={false}>
        <Card>
          <CardHeader>
            <CardTitle>Listing Not Found</CardTitle>
            <CardDescription>The listing you're trying to edit could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please check the URL and try again.</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout 
      title="Edit Listing" 
      subtitle="Update your property details and settings"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ListingForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        submitLabel="Update Listing"
      />
    </PageLayout>
  )
}