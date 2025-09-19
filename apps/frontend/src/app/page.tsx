"use client"

import { getMonthDateRange, formatDateForUrl, parseLocalDate } from '@/lib/date-utils'
import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { HeroSection } from "@/components/HeroSection"
import { Suspense } from "react"
import type { HostSummary, Availability } from '@/types'

// NOTE: This needs to get the last day of the month on the screen, which could
// be 1 or 2 or 3 months ahead depending on the screen size
export const MAX_MONTHS_DISPLAYED = 1;

function Home() {
  const [searchQuery] = useState("")
  const [selectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth] = useState<Date>(new Date())
  const [, setAllAvailabilities] = useState<Availability[]>([])
  const [, setIsLoadingAll] = useState(false)
  const [, setSearchResults] = useState<HostSummary[]>([])
  const [, setIsSearching] = useState(false)
  const [isEmailInput] = useState(false)

  // Check if input looks like an email
  const isEmail = (str: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str.trim())
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection />
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
