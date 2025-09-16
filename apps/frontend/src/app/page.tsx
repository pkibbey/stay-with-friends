"use client"

import { Users, Search } from "lucide-react"
import { getMonthDateRange, formatDateForUrl, parseLocalDate } from '@/lib/date-utils'
import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HeroSection } from "@/components/HeroSection"
import { CalendarBrowseTab } from "@/components/CalendarBrowseTab"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'

interface Person {
  id: string
  name: string
  location?: string
  relationship?: string
  availability?: string
  description?: string
}

interface Availability {
  id: string
  personId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
  person: Person
}

// NOTE: This needs to get the last day of the month on the screen, which could
// be 2 or 3 months ahead depending on the screen size
export const MAX_MONTHS_DISPLAYED = 2;

function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarResults, setCalendarResults] = useState<Availability[]>([])
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [availabilityDates, setAvailabilityDates] = useState<Set<string>>(new Set())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [allAvailabilities, setAllAvailabilities] = useState<Availability[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [searchResults, setSearchResults] = useState<Person[]>([])
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
      const response = await fetch('http://localhost:8000/graphql', {
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

  const searchPeople = useCallback(async (query: string) => {
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
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchPeople($query: String!) {
              searchPeople(query: $query) {
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
      setSearchResults(data.data?.searchPeople || [])
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
      
      const response = await fetch('http://localhost:8000/graphql', {
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
      const response = await fetch('http://localhost:8000/graphql', {
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
                person {
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

      const response = await fetch('http://localhost:8000/graphql', {
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

      const response = await fetch('http://localhost:8000/graphql', {
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
                person {
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
        searchPeople(searchQuery)
      }, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchQuery, searchPeople, isEmailInput])

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

      {/* Compact Person Search at Top */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Find Available Friends</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Search for people in your network by name, location, or relationship to see their availability.
            </p>
          </div>
          <Card className="mb-8">
            <CardContent className="px-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, location, or relationship..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-blue-100/50 dark:bg-gray-800"
                  />
                </div>
                <Button disabled={isSearching} className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {/* Email Invitation Section */}
              {isEmailInput && searchQuery && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        {isCheckingEmail ? 'Checking email...' : `Invite ${searchQuery}`}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {emailExists === null ? 'Checking if this person is already a member...' :
                         emailExists ? 'This person is already a member. Send them a connection request.' :
                         'This person has not yet confirmed friend status. Send them an invitation to connect.'}
                      </p>
                    </div>
                  </div>
                  
                  {!isCheckingEmail && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => sendInvitationEmail(searchQuery.trim())}
                        className="flex-1"
                        variant={emailExists ? "outline" : "default"}
                        disabled={emailExists === true}
                      >
                        {emailExists ? 'Connection Request (Coming Soon)' : 'Send Invitation Email'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setIsEmailInput(false)
                          setEmailExists(null)
                          setSearchQuery('')
                          if (emailCheckTimer) {
                            clearTimeout(emailCheckTimer)
                            setEmailCheckTimer(null)
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Compact Search Results */}
              {searchQuery && (
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 6).map((person) => (
                      <Link key={person.id} href={`/person/${person.id}`}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{person.name}</h4>
                                <p className="text-xs text-gray-600 truncate">
                                  {person.relationship} • {person.location}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">View Details</Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : searchQuery && !isSearching ? (
                    <div className="col-span-full text-center py-4">
                      <p className="text-gray-500 text-sm">No people found matching your search.</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Full-width Calendar Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
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
