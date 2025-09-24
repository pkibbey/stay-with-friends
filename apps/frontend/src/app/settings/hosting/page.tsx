'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { HostWithAvailabilities, User } from '@/types'
import { HostingDisplay } from '@/components/HostingDisplay'

async function getHostings(userId: string): Promise<HostWithAvailabilities[]> {
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real app, you'd need to handle authentication here
        // For now, we'll assume the backend accepts requests from the frontend
      },
      body: JSON.stringify({
        query: `
          query GetHosts {
            hosts {
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
        `
      }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message)
    }

    const hosts = (result.data?.hosts || []) as HostWithAvailabilities[]
    // Filter by userId on the server side
    return hosts.filter((host: HostWithAvailabilities) => host.userId === userId)
  } catch (error) {
    console.error('Error fetching hostings:', error)
    return []
  }
}

export default function ManageHostingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [hostings, setHostings] = useState<HostWithAvailabilities[]>([])
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as User | undefined)?.id

  useEffect(() => {
    if (userId) {
      getHostings(userId).then((data) => {
        setHostings(data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [userId])

  if (loading) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </PageLayout>
    )
  }

  const handleRefresh = () => {
    // Refetch hostings
    if (userId) {
      getHostings(userId).then(setHostings)
    }
  }

  return (
    <PageLayout
      title="Manage Your Hosting"
      subtitle="Add and manage your properties for friends to stay"
    >
      <HostingDisplay
        hostings={hostings}
        onRefresh={handleRefresh}
        onAddNew={() => router.push('/settings/hosting/add')}
      />
    </PageLayout>
  )
}
