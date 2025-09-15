"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Users, Calendar as CalendarIcon, Home, Clock, Star, Send } from "lucide-react"
import Link from 'next/link'
import * as React from "react"
import { parseLocalDate, formatDateRange } from '@/lib/date-utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Person {
  id: string
  name: string
  location?: string
  relationship?: string
  availability?: string
  description?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  latitude?: number
  longitude?: number
  amenities?: string[]
  houseRules?: string
  checkInTime?: string
  checkOutTime?: string
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  photos?: string[]
  availabilities: Availability[]
}

interface Availability {
  id: string
  personId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
}

export default function PersonDetailPage() {
  const params = useParams()
  const personId = params.id as string

  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({from: undefined, to: undefined})
  const [bookingForm, setBookingForm] = useState({
    requesterName: '',
    requesterEmail: '',
    guests: 1,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  useEffect(() => {
    fetchPersonDetails()
  }, [personId])

  const fetchPersonDetails = async () => {
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetPerson($id: ID!) {
              person(id: $id) {
                id
                name
                location
                relationship
                availability
                description
                address
                city
                state
                zipCode
                country
                latitude
                longitude
                amenities
                houseRules
                checkInTime
                checkOutTime
                maxGuests
                bedrooms
                bathrooms
                photos
                availabilities {
                  id
                  startDate
                  endDate
                  status
                  notes
                }
              }
            }
          `,
          variables: { id: personId },
        }),
      })

      const data = await response.json()
      setPerson(data.data?.person || null)
    } catch (error) {
      console.error('Failed to fetch person details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDateRange.from || !selectedDateRange.to) return

    setIsSubmitting(true)
    try {
          const response = await fetch('http://localhost:8000/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                mutation CreateBookingRequest($personId: ID!, $requesterName: String!, $requesterEmail: String!, $startDate: String!, $endDate: String!, $guests: Int!, $message: String) {
                  createBookingRequest(personId: $personId, requesterName: $requesterName, requesterEmail: $requesterEmail, startDate: $startDate, endDate: $endDate, guests: $guests, message: $message) {
                    id
                    status
                  }
                }
              `,
              variables: {
                personId,
                requesterName: bookingForm.requesterName,
                requesterEmail: bookingForm.requesterEmail,
                startDate: selectedDateRange.from.toISOString().split('T')[0],
                endDate: selectedDateRange.to.toISOString().split('T')[0],
                guests: bookingForm.guests,
                message: bookingForm.message
              },
            }),
          })

          const data = await response.json()
      if (data.data?.createBookingRequest) {
        setBookingSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit booking request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailableDates = () => {
    if (!person?.availabilities) return []
    return person.availabilities
      .filter(avail => avail.status === 'available')
      .map(avail => ({
        from: parseLocalDate(avail.startDate),
        to: parseLocalDate(avail.endDate)
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading person details...</p>
        </div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Person not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{person.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">{person.relationship} • {person.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photos */}
            {person.photos && person.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {person.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${person.name}'s place`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {person.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">{person.description}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {person.bedrooms} bedroom{person.bedrooms !== 1 ? 's' : ''}, {person.bathrooms} bathroom{person.bathrooms !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Up to {person.maxGuests} guests</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Check-in: {person.checkInTime || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Check-out: {person.checkOutTime || 'Flexible'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {person.amenities && person.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {person.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">{amenity}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* House Rules */}
            {person.houseRules && (
              <Card>
                <CardHeader>
                  <CardTitle>House Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{person.houseRules}</p>
                </CardContent>
              </Card>
            )}

            {/* Location & Directions */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {[person.address, person.city, person.state, person.zipCode, person.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10 relative">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-400">Location: {person.city || person.location}</p>
                  </div>
                  {/* Simple map-like background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-green-200 dark:from-blue-800 dark:to-green-800"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Getting There
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Public Transportation</p>
                        <p>{person.city || 'Local'} has good bus/train access. Check schedules for routes serving {person.location}.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Parking</p>
                        <p>Street parking available nearby. Permit may be required during business hours.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Airport</p>
                        <p>Nearest airport: {person.city || 'Local'} International (~30 min drive)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Walking</p>
                        <p>15-20 minute walk from nearest transit station. Scenic route through {person.location}.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      * Contact {person.name} directly for the most up-to-date directions and transportation options.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Availability
                </CardTitle>
                <CardDescription>Select your dates to check availability</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="range"
                  selected={selectedDateRange.from && selectedDateRange.to ? {from: selectedDateRange.from, to: selectedDateRange.to} : undefined}
                  onSelect={(range) => setSelectedDateRange({from: range?.from, to: range?.to})}
                  numberOfMonths={1}
                  className="rounded-md border w-full"
                />
                {selectedDateRange.from && selectedDateRange.to && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium">
                      Selected: {formatDateRange(
                        selectedDateRange.from.toISOString().split('T')[0],
                        selectedDateRange.to.toISOString().split('T')[0]
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Request to Stay</CardTitle>
                <CardDescription>Send a booking request to {person.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingSubmitted ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600 mb-2">Request Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Your booking request has been sent to {person.name}. They'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={bookingForm.requesterName}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, requesterName: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingForm.requesterEmail}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, requesterEmail: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={person.maxGuests}
                        value={bookingForm.guests}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell them a bit about yourself and your trip..."
                        value={bookingForm.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedDateRange.from || !selectedDateRange.to || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Booking Request
                        </>
                      )}
                    </Button>

                    {!selectedDateRange.from || !selectedDateRange.to ? (
                      <p className="text-sm text-gray-500 text-center">
                        Please select dates to continue
                      </p>
                    ) : null}
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}