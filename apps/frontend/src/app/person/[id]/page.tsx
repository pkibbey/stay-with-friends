"use client"

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { PersonHeader } from "@/components/PersonHeader"
import { PersonPhotos } from "@/components/PersonPhotos"
import { PersonAbout } from "@/components/PersonAbout"
import { PersonAmenities } from "@/components/PersonAmenities"
import { PersonHouseRules } from "@/components/PersonHouseRules"
import { PersonLocation } from "@/components/PersonLocation"
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar"
import { AvailabilityManager } from "@/components/AvailabilityManager"
import { BookingForm } from "@/components/BookingForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X, Trash2 } from "lucide-react"
import Link from 'next/link'
import * as React from "react"
import { parseDateFromUrl, formatDateForUrl, parseLocalDate } from '@/lib/date-utils'

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
  email?: string
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const personId = params.id as string

  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPerson, setEditedPerson] = useState<Partial<Person>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Function to check if a date is available
  const isDateAvailable = (date: Date | undefined): boolean => {
    if (!date || !person?.availabilities) return false
    
    // Use the same timezone handling as parseDateFromUrl for consistency
    const dateString = formatDateForUrl(date)
    const checkDate = parseLocalDate(dateString)
    
    return person.availabilities.some(availability => {
      if (availability.status !== 'available') return false
      
      // Parse availability dates with consistent timezone handling
      const startDate = parseLocalDate(availability.startDate)
      const endDate = parseLocalDate(availability.endDate)
      
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  // Function to handle date selection and update URL
  const handleDateSelect = (date: Date | undefined) => {
    // Prevent deselection - only allow selecting dates, not clearing selection
    if (!date) return
    
    setSelectedDate(date)
    
    // Update URL query param
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('date', formatDateForUrl(date))
    
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`
    router.replace(newUrl, { scroll: false })
  }

  // Function to start editing
  const handleEdit = () => {
    setIsEditing(true)
    setEditedPerson({ ...person })
  }

  // Function to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedPerson({})
  }

  // Function to save changes
  const handleSave = async () => {
    if (!person) return

    setSaving(true)
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
              updatePerson(id: $id, input: $input) {
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
                email
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
          variables: {
            id: person.id,
            input: {
              name: editedPerson.name,
              location: editedPerson.location,
              relationship: editedPerson.relationship,
              availability: editedPerson.availability,
              description: editedPerson.description,
              address: editedPerson.address,
              city: editedPerson.city,
              state: editedPerson.state,
              zipCode: editedPerson.zipCode,
              country: editedPerson.country,
              latitude: editedPerson.latitude,
              longitude: editedPerson.longitude,
              amenities: editedPerson.amenities,
              houseRules: editedPerson.houseRules,
              checkInTime: editedPerson.checkInTime,
              checkOutTime: editedPerson.checkOutTime,
              maxGuests: editedPerson.maxGuests,
              bedrooms: editedPerson.bedrooms,
              bathrooms: editedPerson.bathrooms,
              photos: editedPerson.photos,
              email: editedPerson.email,
              availabilities: editedPerson.availabilities?.map(avail => ({
                startDate: avail.startDate,
                endDate: avail.endDate,
                status: avail.status,
                notes: avail.notes
              }))
            }
          },
        }),
      })

      const data = await response.json()
      if (data.data?.updatePerson) {
        setPerson(data.data.updatePerson)
        setIsEditing(false)
        setEditedPerson({})
      } else {
        console.error('Failed to update person:', data.errors)
        const errorMessage = data.errors?.[0]?.message || 'Failed to save changes. Please try again.'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Failed to save changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Function to delete person
  const handleDelete = async () => {
    if (!person) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${person.name}? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setDeleting(true)
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeletePerson($id: ID!) {
              deletePerson(id: $id)
            }
          `,
          variables: {
            id: person.id,
          },
        }),
      })

      const data = await response.json()
      if (data.data?.deletePerson) {
        // Redirect to home page after successful deletion
        router.push('/')
      } else {
        console.error('Failed to delete person:', data.errors)
        alert('Failed to delete person. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete person:', error)
      alert('Failed to delete person. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Function to update edited person data
  const updateEditedPerson = (field: string, value: string | number | string[] | Availability[]) => {
    setEditedPerson(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to add availability
  const handleAddAvailability = (startDate: string, endDate: string, notes?: string) => {
    const newAvailability = {
      id: `temp-${Date.now()}`, // Temporary ID for new availabilities
      personId,
      startDate,
      endDate,
      status: 'available',
      notes: notes || ''
    }

    const currentAvailabilities = editedPerson.availabilities || person?.availabilities || []
    updateEditedPerson('availabilities', [...currentAvailabilities, newAvailability])
  }

  // Function to remove availability
  const handleRemoveAvailability = (id: string) => {
    const currentAvailabilities = editedPerson.availabilities || person?.availabilities || []
    updateEditedPerson('availabilities', currentAvailabilities.filter(avail => avail.id !== id))
  }

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
                email
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

  // Handle date parameter from URL
  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      const date = parseDateFromUrl(dateParam)
      if (!isNaN(date.getTime())) {
        // Set the selected date from the URL
        setSelectedDate(date)
      } else {
        // If date param exists but is invalid, set to today's date
        setSelectedDate(new Date())
      }
    }
  }, [searchParams])

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
        email={person.email}
        isEditing={isEditing}
        editedData={editedPerson}
        onUpdate={updateEditedPerson}
      >
        {/* Edit Controls */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-end gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Page
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleDelete} 
                  variant="destructive" 
                  size="sm" 
                  disabled={deleting || saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Person'}
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
      </PersonHeader>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            {isEditing ? (
              <AvailabilityManager
                availabilities={editedPerson.availabilities || person?.availabilities || []}
                onAddAvailability={handleAddAvailability}
                onRemoveAvailability={handleRemoveAvailability}
              />
            ) : (
              <AvailabilityCalendar
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                availabilities={person.availabilities}
              />
            )}
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {selectedDate && isDateAvailable(selectedDate) && !isEditing && (
              <BookingForm
                personId={personId}
                personName={person.name}
                maxGuests={person.maxGuests || 1}
                maxNights={30} // Assuming a max of 30 nights for booking
                selectedDate={selectedDate}
              />
            )}
            
            <PersonPhotos
              name={person.name}
              photos={person.photos}
              isEditing={isEditing}
              editedData={editedPerson}
              onUpdate={updateEditedPerson}
            />

            <PersonAbout
              name={person.name}
              description={person.description}
              bedrooms={person.bedrooms}
              bathrooms={person.bathrooms}
              maxGuests={person.maxGuests}
              checkInTime={person.checkInTime}
              checkOutTime={person.checkOutTime}
              isEditing={isEditing}
              editedData={editedPerson}
              onUpdate={updateEditedPerson}
            />

            <PersonAmenities 
              amenities={person.amenities} 
              isEditing={isEditing}
              editedData={editedPerson}
              onUpdate={updateEditedPerson}
            />

            <PersonHouseRules 
              houseRules={person.houseRules} 
              isEditing={isEditing}
              editedData={editedPerson}
              onUpdate={updateEditedPerson}
            />

            <PersonLocation
              name={person.name}
              address={person.address}
              city={person.city}
              state={person.state}
              zipCode={person.zipCode}
              country={person.country}
              location={person.location}
              isEditing={isEditing}
              editedData={editedPerson}
              onUpdate={updateEditedPerson}
            />
          </div>

        </div>
      </div>
    </div>
  )
}