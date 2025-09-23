'use client'

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapComponent } from '@/components/MapComponent'
import { SearchCalendarView } from '@/components/SearchCalendarView'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Map, List, Calendar } from 'lucide-react'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchResults } from '@/components/SearchResults'
import { HostProfileData, SearchFiltersState } from '@/types'
import { graphqlRequest } from '@/lib/graphql'


function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasInitialized = useRef(false)
  
  // Search state
  const [hosts, setHosts] = useState<HostProfileData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map' | 'calendar'>('list')
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFiltersState>({
    query: searchParams.get('q') || '',
    startDate: searchParams.get('startDate') || null
  })

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFiltersState) => {
    const params = new URLSearchParams()
    
    if (newFilters.query) params.set('q', newFilters.query)
    if (newFilters.startDate) params.set('startDate', newFilters.startDate)

    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [router])

  // Search function
  const searchHosts = useCallback(async (searchFilters: SearchFiltersState) => {
    setIsLoading(true)
    setError(null)

    try {
      let query: string
      let variables: {
        query?: string | null
        startDate?: string | null
      } = {}

      if (searchFilters.query || searchFilters.startDate) {
        // Advanced search with filters
        query = `
          query SearchHostsAdvanced(
            $query: String
            $startDate: String
          ) {
            searchHostsAdvanced(
              query: $query
              startDate: $startDate
            ) {
              id
              name
              description
              address
              city
              state
              zipCode
              country
              latitude
              longitude
              maxGuests
              bedrooms
              bathrooms
              amenities
              houseRules
              checkInTime
              checkOutTime
              photos
              createdAt
              updatedAt
              availabilities {
                id
                startDate
                endDate
                status
                notes
              }
              user {
                id
                name
                email
              }
            }
          }
        `
        variables = {
          query: searchFilters.query || null,
          startDate: searchFilters.startDate || null
        }
      } else {
        // Get all hosts when no filters are applied
        query = `
          query GetAllHosts {
            hosts {
              id
              name
              description
              address
              city
              state
              zipCode
              country
              latitude
              longitude
              maxGuests
              bedrooms
              bathrooms
              amenities
              houseRules
              checkInTime
              checkOutTime
              photos
              createdAt
              updatedAt
              availabilities {
                id
                startDate
                endDate
                status
                notes
              }
              user {
                id
                name
                email
              }
            }
          }
        `
      }

      const result = await graphqlRequest(query, variables)
      
      const hosts = (result.data as { searchHostsAdvanced?: HostProfileData[], hosts?: HostProfileData[] })?.searchHostsAdvanced || (result.data as { searchHostsAdvanced?: HostProfileData[], hosts?: HostProfileData[] })?.hosts || []
      setHosts(hosts)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Failed to search hosts')
      setHosts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFiltersState) => {
    setFilters(newFilters)
    updateURL(newFilters)
    searchHosts(newFilters)
  }, [updateURL, searchHosts])

  // Initial search on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      searchHosts(filters)
    }
  }, [filters, searchHosts])

  // Handle view change
  const handleViewChange = (newView: 'list' | 'map' | 'calendar') => {
    setView(newView)
    if (newView === 'map' && hosts.length > 0) {
      // Ensure we have lat/lng data for map view
      const hostsWithCoords = hosts.filter(host => 
        host.latitude && host.longitude
      )
      if (hostsWithCoords.length === 0) {
        // Could show a message about geocoding addresses
        console.warn('No hosts have coordinates for map view')
      }
    }
  }

  // Generate descriptive header text
  const getHeaderDescription = () => {
    if (isLoading) return 'Searching...'
    
    const hasFilters = filters.query || filters.startDate
    const hostText = hosts.length === 1 ? 'host' : 'hosts'
    
    if (hosts.length === 0) {
      if (hasFilters) {
        return 'No hosts match your search criteria'
      } else {
        return 'No hosts available'
      }
    }
    
    if (!hasFilters) {
      return `${hosts.length} ${hostText} available`
    }
    
    const filterDescriptions = []
    if (filters.query) filterDescriptions.push(`matching "${filters.query}"`)
    if (filters.startDate) filterDescriptions.push(`available ${filters.startDate}`)
    
    return `${hosts.length} ${hostText} ${filterDescriptions.join(' and ')}`
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Hosts</h1>
              <p className="text-gray-600 mt-1">
                {getHeaderDescription()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <Tabs value={view} onValueChange={(value: string) => handleViewChange(value as 'list' | 'map' | 'calendar')}>
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Filters in Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {error && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => searchHosts(filters)}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {view === 'list' ? (
            <SearchResults
              hosts={hosts}
              isLoading={isLoading}
              filters={filters}
            />
          ) : view === 'map' ? (
            <div className="h-[800px] lg:h-[900px]">
              <MapComponent 
                hosts={hosts}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <SearchCalendarView 
              hosts={hosts}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
function SearchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  )
}

export default SearchPageWrapper