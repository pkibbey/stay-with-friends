'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import { MapPin, Users, Calendar, Home, Eye } from 'lucide-react'
import { formatDisplayDate, parseLocalDate } from '@/lib/date-utils'
import Image from 'next/image'
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

interface SearchResultsProps {
  hosts: HostProfileData[]
  isLoading: boolean
  filters: SearchFiltersState
}

function ResultCard({ result, filters }: { result: HostProfileData; filters: SearchFiltersState }) {
  const [showCalendar, setShowCalendar] = React.useState(false)
  
  // Check if result is available for selected dates
  const isAvailableForDates = React.useMemo(() => {
    if (!filters.startDate || !filters.endDate) return true

    const startDate = parseLocalDate(filters.startDate)
    const endDate = parseLocalDate(filters.endDate)

    if (!result.availabilities || result.availabilities.length === 0) {
      return false
    }

    return result.availabilities.some(availability => {
      if (availability.status !== 'available') return false

      const availStart = parseLocalDate(availability.startDate)
      const availEnd = parseLocalDate(availability.endDate)

      return startDate >= availStart && endDate <= availEnd
    })
  }, [result.availabilities, filters.startDate, filters.endDate])

  const availableNow = result.availabilities?.some(availability => {
    if (availability.status !== 'available') return false
    const today = new Date()
    const start = parseLocalDate(availability.startDate)
    const end = parseLocalDate(availability.endDate)
    return today >= start && today <= end
  }) || false

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        {result.photos &&result.photos.length > 0 ? (
          <Image
            unoptimized
            width={400}
            height={300}
            src={result.photos[0]}
            alt={result.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          {filters.startDate && filters.endDate ? (
            <Badge variant={isAvailableForDates ? "default" : "secondary"}>
              {isAvailableForDates ? "Available for dates" : "Not available"}
            </Badge>
          ) : availableNow ? (
            <Badge variant="default">Available now</Badge>
          ) : (
            <Badge variant="secondary">Check dates</Badge>
          )}
        </div>

        {/* Photo count */}
        {result.photos && result.photos.length > 1 && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 text-gray-700">
              +{result.photos.length - 1} photos
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{result.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {result.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and basic info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {result.city}, {result.state}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {result.maxGuests} guests
          </div>
        </div>

        {/* Amenities */}
        {result.amenities && result.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {result.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{result.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Calendar toggle */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showCalendar ? 'Hide' : 'Show'} Calendar
          </Button>
          <Link href={`/host/${result.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>

        {/* Availability Calendar */}
        {showCalendar && (
          <div className="pt-4 border-t">
            <AvailabilityCalendar
              selectedDate={filters.startDate ? parseLocalDate(filters.startDate) : undefined}
              onSelect={() => {}} // Read-only for search results
              availabilities={result.availabilities}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SearchResults({ hosts, isLoading, filters }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (hosts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or filters to find more results.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Try a different location or remove location filter</p>
            <p>• Adjust your date range or remove date filters</p>
            <p>• Remove some amenity requirements</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Showing {hosts.length} {hosts.length === 1 ? 'result' : 'results'}
        {filters.startDate && filters.endDate && (
          <span> for {formatDisplayDate(filters.startDate)} - {formatDisplayDate(filters.endDate)}</span>
        )}
      </div>

      {/* Results grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {hosts.map((host) => (
          <ResultCard 
            key={host.id} 
            result={host} 
            filters={filters}
          />
        ))}
      </div>
    </div>
  )
}