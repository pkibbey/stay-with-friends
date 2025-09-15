"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { PersonHeader } from "@/components/PersonHeader"
import { PersonPhotos } from "@/components/PersonPhotos"
import { PersonAbout } from "@/components/PersonAbout"
import { PersonAmenities } from "@/components/PersonAmenities"
import { PersonHouseRules } from "@/components/PersonHouseRules"
import { PersonLocation } from "@/components/PersonLocation"
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar"
import { BookingForm } from "@/components/BookingForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import * as React from "react"

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



  useEffect(() => {
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

    fetchPersonDetails()
  }, [personId])

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
      <PersonHeader
        name={person.name}
        relationship={person.relationship}
        location={person.location}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PersonPhotos name={person.name} photos={person.photos} />

            <PersonAbout
              name={person.name}
              description={person.description}
              bedrooms={person.bedrooms}
              bathrooms={person.bathrooms}
              maxGuests={person.maxGuests}
              checkInTime={person.checkInTime}
              checkOutTime={person.checkOutTime}
            />

            <PersonAmenities amenities={person.amenities} />

            <PersonHouseRules houseRules={person.houseRules} />

            <PersonLocation
              name={person.name}
              address={person.address}
              city={person.city}
              state={person.state}
              zipCode={person.zipCode}
              country={person.country}
              location={person.location}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AvailabilityCalendar
              selectedDateRange={selectedDateRange}
              onSelect={(range) => setSelectedDateRange({from: range?.from, to: range?.to})}
            />

            <BookingForm
              personId={personId}
              personName={person.name}
              maxGuests={person.maxGuests || 1}
              selectedDateRange={selectedDateRange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}