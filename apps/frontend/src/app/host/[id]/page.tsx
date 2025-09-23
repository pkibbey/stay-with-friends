import { notFound } from 'next/navigation'
import { HostHeader } from "@/components/HostHeader"
import { HostPhotos } from "@/components/HostPhotos"
import { HostAbout } from "@/components/HostAbout"
import { HostAmenities } from "@/components/HostAmenities"
import { HostHouseRules } from "@/components/HostHouseRules"
import { HostLocation } from "@/components/HostLocation"
import { HostDetailClient } from "@/components/HostDetailClient"
import { parseDateFromUrl } from '@/lib/date-utils'
import { graphqlRequest } from '@/lib/graphql'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { HostWithAvailabilities, BookingRequest } from '@/types'

interface HostDetailPageProps {
  params: { id: string }
  searchParams: { date?: string }
}

export default async function HostDetailPage({ params, searchParams }: HostDetailPageProps) {
  const hostId = params.id
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id

  // Parse selected date from URL params
  const selectedDate = searchParams.date ? parseDateFromUrl(searchParams.date) : undefined

  // Fetch host details
  const hostResult = await graphqlRequest(`
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
        availabilities {
          id
          startDate
          endDate
          status
          notes
        }
      }
    }
  `, { id: hostId })

  type HostResponse = { host?: HostWithAvailabilities }
  const host = ((hostResult.data || {}) as HostResponse).host

  if (!host) {
    notFound()
  }

  // Fetch booking requests if user is logged in
  let bookingRequests: BookingRequest[] = []
  if (userId && session?.apiToken) {
    try {
      const bookingResult = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.apiToken}`,
        },
        body: JSON.stringify({
          query: `
            query GetBookingRequestsByRequester($requesterId: ID!) {
              bookingRequestsByRequester(requesterId: $requesterId) {
                id
                hostId
                requesterId
                startDate
                endDate
                guests
                message
                status
                responseMessage
                respondedAt
                createdAt
                host {
                  id
                  name
                }
              }
            }
          `,
          variables: { requesterId: userId },
        }),
      })

      if (bookingResult.ok) {
        const bookingData = await bookingResult.json()
        type BookingRequestsResponse = { bookingRequestsByRequester?: BookingRequest[] }
        const allBookingRequests = ((bookingData.data || {}) as BookingRequestsResponse).bookingRequestsByRequester || []
        bookingRequests = allBookingRequests.filter((request: BookingRequest) => request.hostId === hostId)
      } else {
        console.error('Failed to fetch booking requests:', bookingResult.status, bookingResult.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch booking requests:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <HostHeader host={host} dateParam={searchParams.date} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            <HostDetailClient
              host={host}
              selectedDate={selectedDate}
              bookingRequests={bookingRequests}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <HostPhotos host={host} />
            <HostAbout host={host} />
            <HostAmenities host={host} />
            <HostHouseRules host={host} />
            <HostLocation host={host} />
          </div>
        </div>
      </div>
    </div>
  )
}