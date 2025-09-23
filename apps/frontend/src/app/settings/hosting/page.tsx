import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PageLayout } from '@/components/PageLayout'
import { HostWithAvailabilities } from '@/types'
import { HostingManager } from '@/components/HostingManager'

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

export default async function ManageHostingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage your hosting</h1>
          <p className="text-gray-600">You need to be signed in to access hosting management features.</p>
        </div>
      </PageLayout>
    )
  }

  const hostings = await getHostings(session.user.id)

  return (
    <PageLayout
      title="Manage Your Hosting"
      subtitle="Add and manage your properties for friends to stay"
    >
      <HostingManager initialHostings={hostings} />
    </PageLayout>
  )
}
