"use client"

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { HostHeader } from "@/components/HostHeader"
import { HostPhotos } from "@/components/HostPhotos"
import { HostAbout } from "@/components/HostAbout"
import { HostAmenities } from "@/components/HostAmenities"
import { HostHouseRules } from "@/components/HostHouseRules"
import { HostLocation } from "@/components/HostLocation"
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar"
import { AvailabilityManager } from "@/components/AvailabilityManager"
import { BookingForm } from "@/components/BookingForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X, Trash2 } from "lucide-react"
import Link from 'next/link'
import * as React from "react"
import { parseDateFromUrl, formatDateForUrl, parseLocalDate } from '@/lib/date-utils'
import type { Host, Availability } from '@/types'

export default function HostDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const hostId = params.id as string

  const [host, setHost] = useState<Host | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [editedHost, setEditedHost] = useState<Partial<Host>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Function to check if a date is available
  const isDateAvailable = (date: Date | undefined): boolean => {
    if (!date || !host?.availabilities) return false
    
    // Use the same timezone handling as parseDateFromUrl for consistency
    const dateString = formatDateForUrl(date)
    const checkDate = parseLocalDate(dateString)
    
    return host.availabilities.some(availability => {
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
    setEditedHost({ ...host })
  }

  // Function to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedHost({})
  }

  // Function to save changes
  const handleSave = async () => {
    if (!host) return

    setSaving(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
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
            id: host.id,
            input: {
              name: editedHost.name,
              location: editedHost.location,
              relationship: editedHost.relationship,
              availability: editedHost.availability,
              description: editedHost.description,
              address: editedHost.address,
              city: editedHost.city,
              state: editedHost.state,
              zipCode: editedHost.zipCode,
              country: editedHost.country,
              latitude: editedHost.latitude,
              longitude: editedHost.longitude,
              amenities: editedHost.amenities,
              houseRules: editedHost.houseRules,
              checkInTime: editedHost.checkInTime,
              checkOutTime: editedHost.checkOutTime,
              maxGuests: editedHost.maxGuests,
              bedrooms: editedHost.bedrooms,
              bathrooms: editedHost.bathrooms,
              photos: editedHost.photos,
              email: editedHost.email,
              availabilities: editedHost.availabilities?.map(avail => ({
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
        setHost(data.data.updatePerson)
        setIsEditing(false)
        setEditedHost({})
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

  // Function to delete host
  const handleDelete = async () => {
    if (!host) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${host.name}? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setDeleting(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteHost($id: ID!) {
              deleteHost(id: $id)
            }
          `,
          variables: {
            id: host.id,
          },
        }),
      })

      const data = await response.json()
      if (data.data?.deleteHost) {
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

  // Function to update edited host data
  const updateEditedHost = (field: string, value: string | number | string[] | Availability[]) => {
    setEditedHost(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to add availability
  const handleAddAvailability = (startDate: string, endDate: string, notes?: string) => {
    const newAvailability = {
      id: `temp-${Date.now()}`, // Temporary ID for new availabilities
      hostId,
      startDate,
      endDate,
      status: 'available',
      notes: notes || ''
    }

    const currentAvailabilities = editedHost.availabilities || host?.availabilities || []
    updateEditedHost('availabilities', [...currentAvailabilities, newAvailability])
  }

  // Function to remove availability
  const handleRemoveAvailability = (id: string) => {
    const currentAvailabilities = editedHost.availabilities || host?.availabilities || []
    updateEditedHost('availabilities', currentAvailabilities.filter(avail => avail.id !== id))
  }

  useEffect(() => {
    const fetchHostDetails = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
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
            variables: { id: hostId },
          }),
        })

        const data = await response.json()
        setHost(data.data?.host || null)
      } catch (error) {
        console.error('Failed to fetch host details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHostDetails()
  }, [hostId])

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

  if (!host) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Host not found</h1>
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
      <HostHeader
        host={host}
        isEditing={isEditing}
        editedData={editedHost}
        onUpdate={updateEditedHost}
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
                  {deleting ? 'Deleting...' : 'Delete Host'}
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
      </HostHeader>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            {isEditing ? (
              <AvailabilityManager
                availabilities={editedHost.availabilities || host?.availabilities || []}
                onAddAvailability={handleAddAvailability}
                onRemoveAvailability={handleRemoveAvailability}
              />
            ) : (
              <AvailabilityCalendar
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                availabilities={host.availabilities}
              />
            )}
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {selectedDate && isDateAvailable(selectedDate) && !isEditing && (
              <BookingForm
                host={host}
                maxNights={30} // Assuming a max of 30 nights for booking
                selectedDate={selectedDate}
              />
            )}            
            <HostPhotos
              host={host}
              isEditing={isEditing}
              editedData={editedHost}
              onUpdate={updateEditedHost}
            />
            <HostAbout
              host={host}
              isEditing={isEditing}
              editedData={editedHost}
              onUpdate={updateEditedHost}
            />
            <HostAmenities
              host={host}
              isEditing={isEditing}
              editedData={editedHost}
              onUpdate={updateEditedHost}
            />
            <HostHouseRules
              host={host}
              isEditing={isEditing}
              editedData={editedHost}
              onUpdate={updateEditedHost}
            />
            <HostLocation
              host={host}
              isEditing={isEditing}
              editedData={editedHost}
              onUpdate={updateEditedHost}
            />
          </div>
        </div>
      </div>
    </div>
  )
}