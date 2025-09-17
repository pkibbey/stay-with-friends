"use client"

import { getMonthDateRange, formatDateForUrl, parseLocalDate } from '@/lib/date-utils'
import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HeroSection } from "@/components/HeroSection"
import { CalendarBrowseTab } from "@/components/CalendarBrowseTab"
import { Suspense } from "react"
import type { HostSummary, Availability } from '@/types'

// NOTE: This needs to get the last day of the month on the screen, which could
// be 1 or 2 or 3 months ahead depending on the screen size
export const MAX_MONTHS_DISPLAYED = 1;

function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarResults, setCalendarResults] = useState<Availability[]>([])
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [availabilityDates, setAvailabilityDates] = useState<Set<string>>(new Set())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [allAvailabilities, setAllAvailabilities] = useState<Availability[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [searchResults, setSearchResults] = useState<HostSummary[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isEmailInput, setIsEmailInput] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailCheckTimer, setEmailCheckTimer] = useState<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if input looks like an email
  const isEmail = (str: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str.trim())
  }

  // Check if email exists in the system
  const checkEmailExists = async (email: string) => {
    setIsCheckingEmail(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query CheckEmailExists($email: String!) {
              checkEmailExists(email: $email)
            }
          `,
          variables: { email },
        }),
      })

      const data = await response.json()
      setEmailExists(data.data?.checkEmailExists || false)
    } catch (error) {
      console.error('Email check failed:', error)
      setEmailExists(null)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const emailDetected = isEmail(value)
    setIsEmailInput(emailDetected)
    
    if (emailDetected) {
      // Clear existing timer
      if (emailCheckTimer) {
        clearTimeout(emailCheckTimer)
      }
      
      // Set new timer for debounced email checking
      const timer = setTimeout(() => {
        checkEmailExists(value.trim())
      }, 500)
      setEmailCheckTimer(timer)
    } else {
      // Clear timer if not an email
      if (emailCheckTimer) {
        clearTimeout(emailCheckTimer)
        setEmailCheckTimer(null)
      }
      setEmailExists(null)
    }
  }

  const searchHosts = useCallback(async (query: string) => {
    // Don't search if it's an email
    if (isEmail(query)) {
      setSearchResults([])
      return
    }

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchHosts($query: String!) {
              searchHosts(query: $query) {
                id
                name
                location
                relationship
                availability
                description
              }
            }
          `,
          variables: { query },
        }),
      })

      const data = await response.json()
      setSearchResults(data.data?.searchHosts || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Send invitation email
  const sendInvitationEmail = async (email: string) => {
    try {
      const invitationUrl = `${window.location.origin}/invite?email=${encodeURIComponent(email)}`
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation SendInvitationEmail($email: String!, $invitationUrl: String!) {
              sendInvitationEmail(email: $email, invitationUrl: $invitationUrl)
            }
          `,
          variables: { email, invitationUrl },
        }),
      })

      const data = await response.json()
      if (data.data?.sendInvitationEmail) {
        alert('Invitation email sent successfully!')
      } else {
        alert('Failed to send invitation email.')
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      alert('Failed to send invitation email.')
    }
  }

  const fetchCalendarData = async (date: Date) => {
    setIsLoadingCalendar(true)
    try {
      const dateString = formatDateForUrl(date)
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAvailabilitiesByDate($date: String!) {
              availabilitiesByDate(date: $date) {
                id
                startDate
                endDate
                status
                notes
                host {
                  id
                  name
                  location
                  relationship
                  description
                }
              }
            }
          `,
          variables: { date: dateString },
        }),
      })

      const data = await response.json()
      setCalendarResults(data.data?.availabilitiesByDate || [])
    } catch (error) {
      console.error('Calendar fetch failed:', error)
      setCalendarResults([])
    } finally {
      setIsLoadingCalendar(false)
    }
  }

  const fetchAvailabilityDates = async (month: Date) => {
    try {
      // Get first and last day of the month using timezone-aware utility
      const { startDate, endDate } = getMonthDateRange(month)

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAvailabilityDates($startDate: String!, $endDate: String!) {
              availabilityDates(startDate: $startDate, endDate: $endDate)
            }
          `,
          variables: { startDate, endDate },
        }),
      })

      const data = await response.json()
      const dates = data.data?.availabilityDates || []
      setAvailabilityDates(new Set(dates))
    } catch (error) {
      console.error('Availability dates fetch failed:', error)
      setAvailabilityDates(new Set())
    }
  }

  const fetchAllAvailabilities = useCallback(async (month: Date) => {
    setIsLoadingAll(true)
    try {
      const { startDate, endDate } = getMonthDateRange(month)

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAvailabilitiesByDateRange($startDate: String!, $endDate: String!) {
              availabilitiesByDateRange(startDate: $startDate, endDate: $endDate) {
                id
                startDate
                endDate
                status
                notes
                host {
                  id
                  name
                  location
                  relationship
                  description
                }
              }
            }
          `,
          variables: { startDate, endDate },
        }),
      })

      const data = await response.json()
      const allAvailabilitiesData = data.data?.availabilitiesByDateRange || []

      // Filter out availabilities that are already shown in the "Available on" section
      const filteredAvailabilities = allAvailabilitiesData.filter((availability: Availability) => {
        // If no selected date, show all availabilities
        if (!selectedDate) return true

        const selectedDateString = formatDateForUrl(selectedDate)
        const start = parseLocalDate(availability.startDate)
        const end = parseLocalDate(availability.endDate)
        const selected = parseLocalDate(selectedDateString)

        // Include availability if the selected date is NOT within this availability range
        return selected < start || selected > end
      })

      setAllAvailabilities(filteredAvailabilities)
    } catch (error) {
      console.error('All availabilities fetch failed:', error)
      setAllAvailabilities([])
    } finally {
      setIsLoadingAll(false)
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedDate) {
      fetchCalendarData(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchAvailabilityDates(currentMonth)
    fetchAllAvailabilities(currentMonth)
  }, [currentMonth, selectedDate, fetchAllAvailabilities])

  // Debounced search effect
  useEffect(() => {
    if (!isEmailInput) {
      const debounceTimer = setTimeout(() => {
        searchHosts(searchQuery)
      }, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchQuery, searchHosts, isEmailInput])

  // Helper function to format date for URL parameter
  const formatDateForParam = useCallback((date: Date): string => {
    return formatDateForUrl(date)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimer) {
        clearTimeout(emailCheckTimer)
      }
    }
  }, [emailCheckTimer])

  // Wrapper for setSelectedDate that also updates URL
  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date)
    
    // Update URL with the date
    const params = new URLSearchParams(searchParams.toString())
    if (date) {
      params.set('date', formatDateForParam(date))
    } else {
      params.delete('date')
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [searchParams, router, formatDateForParam])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection />

      {/* Full-width Calendar Section */}
      <section className="container mx-auto px-4 pb-16">
        <div>
          <CalendarBrowseTab
            selectedDate={selectedDate}
            setSelectedDate={handleDateSelect}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            availabilityDates={availabilityDates}
            calendarResults={calendarResults}
            isLoadingCalendar={isLoadingCalendar}
            allAvailabilities={allAvailabilities}
            isLoadingAll={isLoadingAll}
            maxMonthsDisplayed={MAX_MONTHS_DISPLAYED}
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            isEmailInput={isEmailInput}
            emailExists={emailExists}
            isCheckingEmail={isCheckingEmail}
            handleSearchChange={handleSearchChange}
            sendInvitationEmail={sendInvitationEmail}
          />
        </div>
      </section>
    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
function HomeWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  )
}

export default HomeWrapper
