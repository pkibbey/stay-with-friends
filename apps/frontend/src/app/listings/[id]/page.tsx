'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import { MapComponent } from '@/components/MapComponent'
import { 
  MapPin, 
  Users, 
  Calendar,
  Home,
  Star,
  Bed,
  Bath,
  Car,
  Wifi,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { formatDisplayDate, parseLocalDate } from '@/lib/date-utils'

interface Listing {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  houseRules: string
  checkInTime: string
  checkOutTime: string
  photos: string[]
  isActive: boolean
  availabilities: Array<{
    id: string
    startDate: string
    endDate: string
    status: string
    notes?: string
  }>
  user: {
    id: string
    name: string
    email: string
  }
}

export default function ListingDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const listingId = params.id as string

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Listing not found')
          }
          throw new Error('Failed to fetch listing')
        }

        const data = await response.json()
        setListing(data.listing)
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError(err instanceof Error ? err.message : 'Failed to load listing')
      } finally {
        setIsLoading(false)
      }
    }

    if (listingId) {
      fetchListing()
    }
  }, [listingId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error || 'Listing not found'}</p>
            <Link href="/search">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/search">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Search
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {listing.city}, {listing.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Photos and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card>
              <CardContent className="p-0">
                {listing.photos.length > 0 ? (
                  <div className="aspect-video">
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {listing.photos.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {listing.photos.slice(1, 5).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${listing.title} ${index + 2}`}
                          className="aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this place</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span>{listing.maxGuests} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-500" />
                    <span>{listing.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-500" />
                    <span>{listing.bathrooms} bathrooms</span>
                  </div>
                </div>

                {/* Amenities */}
                {listing.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* House Rules */}
                {listing.houseRules && (
                  <div>
                    <h4 className="font-medium mb-2">House Rules</h4>
                    <p className="text-gray-700">{listing.houseRules}</p>
                  </div>
                )}

                {/* Check-in/out */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Check-in</h4>
                    <p className="text-gray-700">{listing.checkInTime}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Check-out</h4>
                    <p className="text-gray-700">{listing.checkOutTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Host Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {listing.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{listing.user.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-500">Trusted host</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                </p>
                <div className="h-64">
                  <MapComponent
                    address={listing.address}
                    city={listing.city}
                    state={listing.state}
                    zipCode={listing.zipCode}
                    country={listing.country}
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking and Calendar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Badge variant="default">Available</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session ? (
                  <Button 
                    onClick={() => setShowBookingForm(true)}
                    className="w-full"
                    size="lg"
                  >
                    Request to Book
                  </Button>
                ) : (
                  <div className="text-center text-gray-600">
                    <p className="mb-3">Sign in to book this listing</p>
                    <Link href="/auth/signin">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </div>
                )}
                
                {showBookingForm && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Contact Host</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Send a message to {listing.user.name} to request booking this property.
                    </p>
                    <Button 
                      onClick={() => setShowBookingForm(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <AvailabilityCalendar
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              availabilities={listing.availabilities}
            />
          </div>
        </div>
      </div>
    </div>
  )
}