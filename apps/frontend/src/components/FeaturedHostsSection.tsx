'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Home, Eye, Bed, Bath, User, ArrowRight } from 'lucide-react'
import { parseLocalDate } from '@/lib/date-utils'
import Image from 'next/image'
import { HostProfileData } from '@/types'
import { apiGet } from '@/lib/api'

interface FeaturedHostsSectionProps {
  limit?: number
}

function FeaturedHostCard({ host }: { host: HostProfileData }) {
  const availableNow = host.availabilities?.some(availability => {
    if (availability.status !== 'available') return false
    const today = new Date()
    const start = parseLocalDate(availability.startDate)
    const end = parseLocalDate(availability.endDate)
    return today >= start && today <= end
  }) || false

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        {host.photos && host.photos.length > 0 ? (
          <Image
            unoptimized
            width={400}
            height={300}
            src={host.photos[0]}
            alt={host.name || 'Host photo'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={availableNow ? "default" : "secondary"}>
            {availableNow ? "Available now" : "Check dates"}
          </Badge>
        </div>

        {/* Photo count */}
        {host.photos && host.photos.length > 1 && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 text-gray-700">
              +{host.photos.length - 1} photos
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{host.name}</CardTitle>
            {host.user?.name && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <User className="w-3 h-3 mr-1" />
                Hosted by {host.user.name}
              </p>
            )}
            <p className="line-clamp-2 mt-1 text-gray-700">
              {host.description}
            </p>
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
                {host.address ?
                  `${host.address}, ${host.city}, ${host.state}` :
                  `${host.city}, ${host.state}`
                }
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {host.max_guests} guests
            </div>
            {host.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {host.bedrooms} bedroom{host.bedrooms !== 1 ? 's' : ''}
              </div>
            )}
            {host.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {host.bathrooms} bathroom{host.bathrooms !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        {host.amenities && host.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {host.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {host.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{host.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* View Details */}
        <Link href={`/host/${host.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export function FeaturedHostsSection({ limit = 6 }: FeaturedHostsSectionProps) {
  const [hosts, setHosts] = useState<HostProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedHosts = async () => {
      try {
        setLoading(true)
        // REST: /api/hosts returns all hosts
        const hosts: HostProfileData[] = await apiGet('/hosts')
        setHosts(hosts.slice(0, limit))
      } catch (err) {
        console.error('Error fetching featured hosts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load hosts')
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedHosts()
  }, [limit])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hosts</h2>
            <p className="text-xl text-gray-600">Discover amazing places to stay with friends</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || hosts.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hosts</h2>
            <p className="text-xl text-gray-600">Discover amazing places to stay with friends</p>
          </div>
          <Card className="text-center py-12 max-w-2xl mx-auto">
            <CardContent>
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? 'Unable to load hosts' : 'No hosts available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {error ? 'Please try again later.' : 'Be the first to list your space!'}
              </p>
              {!error && (
                <Link href="/hosting">
                  <Button>
                    Start Hosting
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hosts</h2>
          <p className="text-xl text-gray-600">Discover amazing places to stay with friends</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mb-8">
          {hosts.map((host) => (
            <FeaturedHostCard key={host.id} host={host} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/search">
            <Button size="lg" variant="outline">
              View All Hosts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}