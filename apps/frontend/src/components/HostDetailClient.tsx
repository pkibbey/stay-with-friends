"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar"
import { BookingForm } from "@/components/BookingForm"
import { ExistingBookingRequests } from "@/components/ExistingBookingRequests"
import { formatDateForUrl, parseLocalDate } from '@/lib/date-utils'
import type { HostWithAvailabilities } from '@/types'
import { BookingRequest } from '@stay-with-friends/shared-types'

interface HostDetailClientProps {
  host: HostWithAvailabilities
  selectedDate?: Date
  bookingRequests: BookingRequest[]
}

export function HostDetailClient({ host, selectedDate: initialSelectedDate, bookingRequests }: HostDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate)

  // Function to check if a date is available
  const isDateAvailable = (date: Date | undefined): boolean => {
    if (!date || !host?.availabilities) return false

    // Use the same timezone handling as parseDateFromUrl for consistency
    const dateString = formatDateForUrl(date)
    const checkDate = parseLocalDate(dateString)

    return host.availabilities.some(availability => {
      if (availability.status !== 'available') return false

      // Parse availability dates with consistent timezone handling
      const startDate = parseLocalDate(availability.start_date || '')
      const endDate = parseLocalDate(availability.end_date || '')

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

  return (
    <>
      <AvailabilityCalendar
        selectedDate={selectedDate}
        onSelect={handleDateSelect}
        availabilities={host.availabilities?.map(a => ({
          startDate: a.start_date || '',
          endDate: a.end_date || '',
          status: a.status || 'available'
        }))}
      />

      {/* Show existing booking requests if user is logged in and has any */}
      {bookingRequests.length > 0 && (
        <ExistingBookingRequests
          requests={bookingRequests}
          hostName={host.name || ''}
        />
      )}

      {selectedDate && isDateAvailable(selectedDate) && (
        <BookingForm
          host={host}
          maxNights={30} // Assuming a max of 30 nights for booking
          selectedDate={selectedDate}
        />
      )}
    </>
  )
}