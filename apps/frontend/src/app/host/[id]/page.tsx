import { notFound } from 'next/navigation'
import { HostHeader } from "@/components/HostHeader"
import { HostPhotos } from "@/components/HostPhotos"
import { HostAbout } from "@/components/HostAbout"
import { HostAmenities } from "@/components/HostAmenities"
import { HostHouseRules } from "@/components/HostHouseRules"
import { HostLocation } from "@/components/HostLocation"
import { HostDetailClient } from "@/components/HostDetailClient"
import { parseDateFromUrl } from '@/lib/date-utils'
import { apiGet } from '@/lib/api'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { HostWithAvailabilities } from '@/types'
import { BookingRequest } from '@stay-with-friends/shared-types'

interface HostDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function HostDetailPage(props: HostDetailPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const hostId = params.id
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id

  // Parse selected date from URL params
  const selectedDate = searchParams.date ? parseDateFromUrl(searchParams.date) : undefined

  // Fetch host details via REST
  const host = await apiGet<HostWithAvailabilities>(`/hosts/${hostId}`)
  if (!host) {
    notFound()
  }

  // Fetch booking requests if user is logged in
  let bookingRequests: BookingRequest[] = []
  if (userId && session?.apiToken) {
    try {
      // REST: /api/booking-requests/requester/:requesterId
      const allBookingRequests = await apiGet<BookingRequest[]>(`/booking-requests/requester/${userId}`)
      bookingRequests = allBookingRequests.filter((request: BookingRequest) => request.host_id === hostId)
    } catch (error) {
      console.error('Failed to fetch booking requests:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <HostHeader host={host} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            <HostDetailClient
              host={host}
              selectedDate={selectedDate}
              bookingRequests={bookingRequests}
            />
            <HostLocation host={host} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <HostAbout host={host} />
            <HostPhotos host={host} />
            <HostAmenities host={host} />
            <HostHouseRules host={host} />
          </div>
        </div>
      </div>
    </div>
  )
}