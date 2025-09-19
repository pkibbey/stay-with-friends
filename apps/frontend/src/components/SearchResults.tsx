'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import { MapPin, Users, Calendar, Home, Star, Eye } from 'lucide-react'
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
  listings: HostProfileData[]
  isLoading: boolean
  filters: SearchFiltersState
}

function ListingCard({ listing, filters }: { listing: HostProfileData; filters: SearchFiltersState }) {
  const [showCalendar, setShowCalendar] = React.useState(false)
  
  // Check if listing is available for selected dates
  const isAvailableForDates = React.useMemo(() => {
    if (!filters.startDate || !filters.endDate) return true

    const startDate = parseLocalDate(filters.startDate)
    const endDate = parseLocalDate(filters.endDate)

    if (!listing.availabilities || listing.availabilities.length === 0) {
      return false
    }

    return listing.availabilities.some(availability => {
      if (availability.status !== 'available') return false

      const availStart = parseLocalDate(availability.startDate)
      const availEnd = parseLocalDate(availability.endDate)

      return startDate >= availStart && endDate <= availEnd
    })
  }, [listing.availabilities, filters.startDate, filters.endDate])

  const availableNow = listing.availabilities?.some(availability => {
    if (availability.status !== 'available') return false
    const today = new Date()
    const start = parseLocalDate(availability.startDate)
    const end = parseLocalDate(availability.endDate)
    return today >= start && today <= end
  }) || false

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        {listing.photos.length > 0 ? (
          <Image
            unoptimized
            width={400}
            height={300}
            src={listing.photos[0]}
            alt={listing.title}
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
        {listing.photos.length > 1 && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 text-gray-700">
              +{listing.photos.length - 1} photos
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {listing.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and basic info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {listing.city}, {listing.state}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {listing.maxGuests} guests
          </div>
        </div>

        {/* Amenities */}
        {listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {listing.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{listing.amenities.length - 4} more
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
          <Link href={`/host/${listing.id}`} className="flex-1">
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
              availabilities={listing.availabilities}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SearchResults({ listings, isLoading, filters }: SearchResultsProps) {
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

  if (listings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
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
        Showing {listings.length} {listings.length === 1 ? 'result' : 'results'}
        {filters.startDate && filters.endDate && (
          <span> for {formatDisplayDate(filters.startDate)} - {formatDisplayDate(filters.endDate)}</span>
        )}
      </div>

      {/* Listings grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard 
            key={listing.id} 
            listing={listing} 
            filters={filters}
          />
        ))}
      </div>
    </div>
  )
}