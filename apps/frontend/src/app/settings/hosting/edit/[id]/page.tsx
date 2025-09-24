'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { HostingEditForm } from '@/components/HostingEditForm'
import { HostWithAvailabilities, User } from '@/types'

async function getHosting(id: string): Promise<HostWithAvailabilities | null> {
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetHost($id: ID!) {
            host(id: $id) {
              id
              name
              location
              description
              address
              city
              state
              zipCode
              country
              latitude
              longitude
              amenities
              houseRules
              checkInTime
              checkOutTime
              maxGuests
              bedrooms
              bathrooms
              photos
              userId
              user {
                id
                name
                email
                image
              }
              availabilities {
                id
                startDate
                endDate
                status
                notes
              }
            }
          }
        `,
        variables: { id }
      }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message)
    }

    return result.data?.host as HostWithAvailabilities | null
  } catch (error) {
    console.error('Error fetching hosting:', error)
    return null
  }
}

export default function EditHostingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [hosting, setHosting] = useState<HostWithAvailabilities | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as User | undefined)?.id
  const hostingId = params.id as string

  useEffect(() => {
    if (hostingId) {
      getHosting(hostingId).then((data) => {
        console.log('Fetched hosting data:', data)
        console.log('Hosting photos:', data?.photos)
        setHosting(data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [hostingId])

  if (loading) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </PageLayout>
    )
  }

  if (!hosting) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hosting not found</h1>
          <p className="text-gray-600">The hosting property you&apos;re trying to edit doesn&apos;t exist.</p>
        </div>
      </PageLayout>
    )
  }

  // Check if user owns this hosting
  if (hosting.userId !== userId) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access denied</h1>
          <p className="text-gray-600">You can only edit your own hosting properties.</p>
        </div>
      </PageLayout>
    )
  }

  const handleEditSuccess = () => {
    // Redirect back to the main hosting page
    router.push('/settings/hosting')
  }

  return (
    <PageLayout
      title="Edit Hosting"
      subtitle={`Edit ${hosting.name}`}
    >
      <HostingEditForm
        initialData={{
          id: hosting.id,
          name: hosting.name,
          description: hosting.description,
          location: hosting.location,
          address: hosting.address,
          city: hosting.city,
          state: hosting.state,
          zipCode: hosting.zipCode,
          country: hosting.country,
          latitude: hosting.latitude,
          longitude: hosting.longitude,
          maxGuests: hosting.maxGuests || 2,
          bedrooms: hosting.bedrooms || 1,
          bathrooms: hosting.bathrooms || 1,
          checkInTime: hosting.checkInTime,
          checkOutTime: hosting.checkOutTime,
          amenities: hosting.amenities,
          houseRules: hosting.houseRules,
          photos: hosting.photos
        }}
        onSuccess={handleEditSuccess}
        onCancel={() => router.push('/settings/hosting')}
      />
    </PageLayout>
  )
}