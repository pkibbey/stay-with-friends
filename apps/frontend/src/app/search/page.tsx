'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapComponent } from '@/components/MapComponent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Map, List, Filter } from 'lucide-react'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchResults } from '@/components/SearchResults'
import { HostProfileData } from '@/types'

interface SearchFiltersState {
  query: string
  startDate: string | null
  endDate: string | null
  location: string
  amenities: string[]
  trustedHostsOnly: boolean
  guests: number
}

function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Search state
  const [listings, setListings] = useState<HostProfileData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [showFilters, setShowFilters] = useState(false)
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFiltersState>({
    query: searchParams.get('q') || '',
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
    location: searchParams.get('location') || '',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    trustedHostsOnly: searchParams.get('trustedOnly') === 'true',
    guests: parseInt(searchParams.get('guests') || '1')
  })

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFiltersState) => {
    const params = new URLSearchParams()
    
    if (newFilters.query) params.set('q', newFilters.query)
    if (newFilters.startDate) params.set('startDate', newFilters.startDate)
    if (newFilters.endDate) params.set('endDate', newFilters.endDate)
    if (newFilters.location) params.set('location', newFilters.location)
    if (newFilters.amenities.length > 0) params.set('amenities', newFilters.amenities.join(','))
    if (newFilters.trustedHostsOnly) params.set('trustedOnly', 'true')
    if (newFilters.guests > 1) params.set('guests', newFilters.guests.toString())

    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [router])

  // Search function
  const searchListings = useCallback(async (searchFilters: SearchFiltersState) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      // Add search parameters
      if (searchFilters.query) params.append('search', searchFilters.query)
      if (searchFilters.startDate) params.append('startDate', searchFilters.startDate)
      if (searchFilters.endDate) params.append('endDate', searchFilters.endDate)
      if (searchFilters.location) params.append('location', searchFilters.location)
      if (searchFilters.amenities.length > 0) {
        searchFilters.amenities.forEach(amenity => params.append('amenities', amenity))
      }
      if (searchFilters.trustedHostsOnly) params.append('trustedOnly', 'true')
      if (searchFilters.guests > 1) params.append('guests', searchFilters.guests.toString())

      const response = await fetch(`/api/listings?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to search listings')
      }

      const data = await response.json()
      setListings(data.listings || [])
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Failed to search listings')
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFiltersState) => {
    setFilters(newFilters)
    updateURL(newFilters)
    searchListings(newFilters)
  }, [updateURL, searchListings])

  // Initial search on mount
  useEffect(() => {
    searchListings(filters)
  }, []) // Only run on mount

  // Handle view change
  const handleViewChange = (newView: 'list' | 'map') => {
    setView(newView)
    if (newView === 'map' && listings.length > 0) {
      // Ensure we have lat/lng data for map view
      const listingsWithCoords = listings.filter(listing => 
        listing.latitude && listing.longitude
      )
      if (listingsWithCoords.length === 0) {
        // Could show a message about geocoding addresses
        console.warn('No listings have coordinates for map view')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Listings</h1>
              <p className="text-gray-600 mt-1">
                {listings.length} {listings.length === 1 ? 'property' : 'properties'} available
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              {/* View Toggle */}
              <Tabs value={view} onValueChange={(value: string) => handleViewChange(value as 'list' | 'map')}>
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Map
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-6`}>
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {error && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center text-red-600">
                    <p>{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => searchListings(filters)}
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
                listings={listings}
                isLoading={isLoading}
                filters={filters}
              />
            ) : (
              <div className="h-[600px] lg:h-[700px]">
                <MapComponent 
                  listings={listings}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
function SearchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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