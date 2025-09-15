"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon, Users } from "lucide-react"
import { getMonthDateRange } from '@/lib/date-utils'
import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { HeroSection } from "@/components/HeroSection"
import { PersonSearchTab } from "@/components/PersonSearchTab"
import { CalendarBrowseTab } from "@/components/CalendarBrowseTab"

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarResults, setCalendarResults] = useState<Availability[]>([])
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [availabilityDates, setAvailabilityDates] = useState<Set<string>>(new Set())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [allAvailabilities, setAllAvailabilities] = useState<Availability[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)

  const fetchCalendarData = async (date: Date) => {
    setIsLoadingCalendar(true)
    try {
      const dateString = date.toISOString().split('T')[0] // Format as YYYY-MM-DD
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

        const selectedDateString = selectedDate.toISOString().split('T')[0]
        const start = new Date(availability.startDate)
        const end = new Date(availability.endDate)
        const selected = new Date(selectedDateString)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection />

      {/* Search Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="person" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="person" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Find by Person
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Browse Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="person" className="space-y-6">
              <PersonSearchTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <CalendarBrowseTab
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                availabilityDates={availabilityDates}
                calendarResults={calendarResults}
                isLoadingCalendar={isLoadingCalendar}
                allAvailabilities={allAvailabilities}
                isLoadingAll={isLoadingAll}
                maxMonthsDisplayed={MAX_MONTHS_DISPLAYED}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
