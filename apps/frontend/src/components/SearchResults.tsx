'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Home, Eye, Bed, Bath, User } from 'lucide-react'
import { formatDisplayDate, parseLocalDate } from '@/lib/date-utils'
import Image from 'next/image'
import { HostProfileData, SearchFiltersState } from '@/types'

interface SearchResultsProps {
  hosts: HostProfileData[]
  isLoading: boolean
  filters: SearchFiltersState
}

function ResultCard({ result, filters }: { result: HostProfileData; filters: SearchFiltersState }) {
  // Check if result is available for selected dates
  const isAvailableForDates = React.useMemo(() => {
    if (!filters.startDate) return true

    const startDate = parseLocalDate(filters.startDate)
    
    if (!result.availabilities || result.availabilities.length === 0) {
      return false
    }

    return result.availabilities.some(availability => {
      if (availability.status !== 'available') return false

      const availStart = parseLocalDate(availability.startDate)
      const availEnd = parseLocalDate(availability.endDate)

      return startDate >= availStart && startDate <= availEnd
    })
  }, [result.availabilities, filters.startDate])

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
            alt={result.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          {filters.startDate ? (
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
            <CardTitle className="text-lg line-clamp-2">{result.name}</CardTitle>
            {result.user?.name && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <User className="w-3 h-3 mr-1" />
                Hosted by {result.user.name}
              </p>
            )}
            <CardDescription className="line-clamp-2 mt-1">
              {result.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and basic info */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {result.address ? 
                  `${result.address}, ${result.city}, ${result.state}` : 
                  `${result.city}, ${result.state}`
                }
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {result.maxGuests} guests
            </div>
            {result.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {result.bedrooms} bedroom{result.bedrooms !== 1 ? 's' : ''}
              </div>
            )}
            {result.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {result.bathrooms} bathroom{result.bathrooms !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {/* Check-in/out times if available */}
          {(result.checkInTime || result.checkOutTime) && (
            <div className="text-xs text-gray-500">
              {result.checkInTime && `Check-in: ${result.checkInTime}`}
              {result.checkInTime && result.checkOutTime && ' • '}
              {result.checkOutTime && `Check-out: ${result.checkOutTime}`}
            </div>
          )}
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

        {/* View Details */}
        <Link href={`/host/${result.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </Link>
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
        {filters.startDate && (
          <span> for {formatDisplayDate(filters.startDate)}</span>
        )}
      </div>

      {/* Results grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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