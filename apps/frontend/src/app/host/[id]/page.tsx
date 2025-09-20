"use client"

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { HostHeader } from "@/components/HostHeader"
import { HostPhotos } from "@/components/HostPhotos"
import { HostAbout } from "@/components/HostAbout"
import { HostAmenities } from "@/components/HostAmenities"
import { HostHouseRules } from "@/components/HostHouseRules"
import { HostLocation } from "@/components/HostLocation"
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar"
import { BookingForm } from "@/components/BookingForm"
import { ExistingBookingRequests } from "@/components/ExistingBookingRequests"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import * as React from "react"
import { parseDateFromUrl, formatDateForUrl, parseLocalDate } from '@/lib/date-utils'
import { useSession } from 'next-auth/react'
import type { HostWithAvailabilities, BookingRequest } from '@/types'

export default function HostDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const hostId = params.id as string
  const userId = (session?.user as { id?: string })?.id

  const [host, setHost] = useState<HostWithAvailabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])

  // Function to check if a date is available
  const isDateAvailable = (date: Date | undefined): boolean => {
    if (!date || !host?.availabilities) return false
    
    // Use the same timezone handling as parseDateFromUrl for consistency
    const dateString = formatDateForUrl(date)
    const checkDate = parseLocalDate(dateString)
    
    return host.availabilities.some(availability => {
      if (availability.status !== 'available') return false
      
      // Parse availability dates with consistent timezone handling
      const startDate = parseLocalDate(availability.startDate)
      const endDate = parseLocalDate(availability.endDate)
      
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  // Function to handle date selection and update URL
  const handleDateSelect = (date: Date | undefined) => {
    // Prevent deselection - only allow selecting dates, not clearing selection
    if (!date) return
    
    setSelectedDate(date)
    
    // Update URL query param
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('date', formatDateForUrl(date))
    
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`
    router.replace(newUrl, { scroll: false })
  }

  useEffect(() => {
    const fetchHostDetails = async () => {
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
                email
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
            variables: { id: hostId },
          }),
        })

        const data = await response.json()
        setHost(data.data?.host || null)
      } catch (error) {
        console.error('Failed to fetch host details:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchBookingRequests = async () => {
      if (!userId) return

      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

        const data = await response.json()
        // Filter for requests to this specific host
        const hostRequests = data.data?.bookingRequestsByRequester?.filter(
          (request: BookingRequest) => request.hostId === hostId
        ) || []
        setBookingRequests(hostRequests)
      } catch (error) {
        console.error('Failed to fetch booking requests:', error)
      }
    }

    fetchHostDetails()
    fetchBookingRequests()
  }, [hostId, userId])

  // Handle date parameter from URL
  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      const date = parseDateFromUrl(dateParam)
      if (!isNaN(date.getTime())) {
        // Set the selected date from the URL
        setSelectedDate(date)
      } else {
        // If date param exists but is invalid, set to today's date
        setSelectedDate(new Date())
      }
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading host details...</p>
        </div>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Host not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HostHeader host={host} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            <AvailabilityCalendar
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              availabilities={host.availabilities?.map(a => ({
                startDate: a.startDate,
                endDate: a.endDate,
                status: a.status || 'available'
              }))}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Show existing booking requests if user is logged in and has any */}
            {bookingRequests.length > 0 && (
              <ExistingBookingRequests
                requests={bookingRequests}
                hostName={host.name}
              />
            )}

            {selectedDate && isDateAvailable(selectedDate) && (
              <BookingForm
                host={host}
                maxNights={30} // Assuming a max of 30 nights for booking
                selectedDate={selectedDate}
              />
            )}            
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