"use client"

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { authenticatedGraphQLRequest } from '@/lib/graphql'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AvailabilityManager } from '@/components/AvailabilityManager'
import { FileUpload } from '@/components/ui/file-upload'
import { PageLayout } from '@/components/PageLayout'
import Link from 'next/link'
import { Plus, Edit, MapPin, Users, Bed, Bath, Clock, Calendar, MessageSquare, Trash2, Navigation } from 'lucide-react'
import { HostWithAvailabilities, User } from '@/types'

// Use the generated types
type HostData = HostWithAvailabilities

export default function ManageHostingPage() {
  const { data: session } = useSession()
  const [showAddForm, setShowAddForm] = useState(false)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const [hostings, setHostings] = useState<HostData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHostIds, setEditingHostIds] = useState<string[]>([])
  const [editForms, setEditForms] = useState<Record<string, Partial<HostData>>>({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodingEdit, setGeocodingEdit] = useState(false)

  const fetchHostings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetHosts {
              hosts {
                id
                name
                location
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
                userId
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
        }),
      })
      const data = await response.json()
      if (data.data?.hosts) {
        // Filter to only hosts owned by the current signed-in user
        // session?.user.id may be a string or number, so compare as strings
        const userId = (session?.user as User | undefined)?.id
        if (userId) {
          const filtered = data.data.hosts.filter((h: HostData) => h.userId === userId)
          setHostings(filtered)
        } else {
          // If no session user id available, fall back to empty list
          setHostings([])
        }
      }
    } catch (error) {
      console.error('Error fetching hostings:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (session?.user as any)?.id
      if (!userId) return

      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPendingRequestsCount($userId: ID!) {
                pendingBookingRequestsCount(userId: $userId)
              }
            `,
            variables: { userId },
          }),
        })
        const data = await response.json()
        setPendingRequestsCount(data.data?.pendingBookingRequestsCount || 0)
      } catch (error) {
        console.error('Error fetching pending requests count:', error)
      }
    }

    if (session?.user) {
      fetchPendingRequestsCount()
      fetchHostings()
    }
  }, [fetchHostings, session?.user])

  // Zod schema for the add-hosting form
  const AddHostingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable().or(z.literal('')),
    location: z.string().optional().nullable().or(z.literal('')),
    address: z.string().optional().nullable().or(z.literal('')),
    city: z.string().optional().nullable().or(z.literal('')),
    state: z.string().optional().nullable().or(z.literal('')),
    zipCode: z.string().optional().nullable().or(z.literal('')),
    country: z.string().optional().nullable().or(z.literal('')),
    latitude: z.string().optional().nullable().or(z.literal('')),
    longitude: z.string().optional().nullable().or(z.literal('')),
    maxGuests: z.number().int().min(1).default(2),
    bedrooms: z.number().int().min(0).default(1),
    bathrooms: z.number().int().min(1).default(1),
    checkInTime: z.string().optional().default('3:00 PM'),
    checkOutTime: z.string().optional().default('11:00 AM'),
    amenities: z.string().optional().nullable().or(z.literal('')),
    houseRules: z.string().optional().nullable().or(z.literal('')),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(AddHostingSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      latitude: '',
      longitude: '',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      amenities: '',
      houseRules: ''
    }
  })

  const handleAddHosting = async (values: z.infer<typeof AddHostingSchema>) => {
    setSaving(true)
    try {
      // Get userId from session
      const userId = (session?.user as User | undefined)?.id
      if (!userId) {
        alert('You must be signed in to create a hosting')
        setSaving(false)
        return
      }

      // Parse numeric coordinates
      const latitude = values.latitude ? parseFloat(values.latitude as unknown as string) : undefined
      const longitude = values.longitude ? parseFloat(values.longitude as unknown as string) : undefined

      // Build amenities array
  const amenities = (values.amenities || '').split(',').map((a: string) => a.trim()).filter(a => a)

      // Call the GraphQL createHost mutation using the authenticated helper
      const mutation = `
            mutation CreateHost(
              $userId: ID!
              $name: String!
              $location: String
              $description: String
              $address: String
              $city: String
              $state: String
              $zipCode: String
              $country: String
              $latitude: Float
              $longitude: Float
              $amenities: [String!]
              $houseRules: String
              $checkInTime: String
              $checkOutTime: String
              $maxGuests: Int
              $bedrooms: Int
              $bathrooms: Int
              $photos: [String!]
            ) {
              createHost(
                userId: $userId
                name: $name
                location: $location
                description: $description
                address: $address
                city: $city
                state: $state
                zipCode: $zipCode
                country: $country
                latitude: $latitude
                longitude: $longitude
                amenities: $amenities
                houseRules: $houseRules
                checkInTime: $checkInTime
                checkOutTime: $checkOutTime
                maxGuests: $maxGuests
                bedrooms: $bedrooms
                bathrooms: $bathrooms
                photos: $photos
              ) {
                id
                name
                location
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
                createdAt
                updatedAt
                userId
              }
            }
          `

      const variables = {
        userId: userId,
        name: values.name,
        location: values.location || undefined,
        description: values.description || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zipCode: values.zipCode || undefined,
        country: values.country || undefined,
        latitude,
        longitude,
        amenities,
        houseRules: values.houseRules || undefined,
        checkInTime: values.checkInTime || undefined,
        checkOutTime: values.checkOutTime || undefined,
        maxGuests: values.maxGuests,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        photos: []
      }

      const result = await authenticatedGraphQLRequest(mutation, variables)

      if (result.data?.createHost) {
        // Refresh the hostings data to include the new host
        await fetchHostings()

        // Reset form and close
        setShowAddForm(false)
      } else {
        console.error('Failed to create host:', result)
        alert('Failed to create hosting. Please check your inputs and try again.')
      }
    } catch (error) {
      console.error('Error creating host:', error)
      alert('Failed to create hosting. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAvailability = (hostId: string) => async (startDate: string, endDate: string, notes?: string) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateAvailability($hostId: ID!, $startDate: String!, $endDate: String!, $notes: String) {
              createAvailability(hostId: $hostId, startDate: $startDate, endDate: $endDate, notes: $notes) {
                id
                hostId
                startDate
                endDate
                status
                notes
              }
            }
          `,
          variables: { hostId, startDate, endDate, notes },
        }),
      })
      const data = await response.json()
      if (data.data?.createAvailability) {
        // Refresh the hostings data to include the new availability
        await fetchHostings()
      }
    } catch (error) {
      console.error('Error adding availability:', error)
    }
  }

  const handleRemoveAvailability = async (id: string) => {
    try {
      // You'll need to implement a deleteAvailability mutation in your backend
      console.log('Remove availability:', id)
      // For now, refresh the data
      await fetchHostings()
    } catch (error) {
      console.error('Error removing availability:', error)
    }
  }

  const getHostAvailabilities = (hostId: string) => {
    const host = hostings.find(h => h.id === hostId)
    return host?.availabilities || []
  }

  const startEdit = (hosting: HostData) => {
    setEditingHostIds(prev => [...prev, hosting.id])
    setEditForms(prev => ({
      ...prev,
      [hosting.id]: {
        ...hosting,
        amenities: hosting.amenities // Keep as array for editing
      }
    }))
  }

  const cancelEdit = (hostId: string) => {
    setEditingHostIds(prev => prev.filter(id => id !== hostId))
    setEditForms(prev => {
      const newForms = { ...prev }
      delete newForms[hostId]
      return newForms
    })
  }

  const saveEdit = async (hostId: string) => {
    const editForm = editForms[hostId]
    if (!editForm?.id) return

    setSaving(true)
    try {
      // Build the input object with only defined values
      const input: Partial<Omit<HostData, 'id' | 'availabilities'>> = {}
      
      if (editForm.name !== undefined) input.name = editForm.name
      if (editForm.location !== undefined) input.location = editForm.location
      if (editForm.description !== undefined) input.description = editForm.description
      if (editForm.address !== undefined) input.address = editForm.address
      if (editForm.city !== undefined) input.city = editForm.city
      if (editForm.state !== undefined) input.state = editForm.state
      if (editForm.zipCode !== undefined) input.zipCode = editForm.zipCode
      if (editForm.country !== undefined) input.country = editForm.country
      if (editForm.latitude !== undefined && editForm.latitude !== null) input.latitude = editForm.latitude
      if (editForm.longitude !== undefined && editForm.longitude !== null) input.longitude = editForm.longitude
      if (editForm.amenities !== undefined) input.amenities = editForm.amenities
      if (editForm.houseRules !== undefined) input.houseRules = editForm.houseRules
      if (editForm.checkInTime !== undefined) input.checkInTime = editForm.checkInTime
      if (editForm.checkOutTime !== undefined) input.checkOutTime = editForm.checkOutTime
      if (editForm.maxGuests !== undefined) input.maxGuests = editForm.maxGuests
      if (editForm.bedrooms !== undefined) input.bedrooms = editForm.bedrooms
      if (editForm.bathrooms !== undefined) input.bathrooms = editForm.bathrooms
      if (editForm.photos !== undefined) input.photos = editForm.photos

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateHost($id: ID!, $input: UpdateHostInput!) {
              updateHost(id: $id, input: $input) {
                id
                name
                location
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
              }
            }
          `,
          variables: {
            id: editForm.id,
            input
          },
        }),
      })

      const data = await response.json()
      if (data.data?.updateHost) {
        // Refresh the hostings data to get the latest updates
        await fetchHostings()
        // Remove this host from editing state
        cancelEdit(hostId)
      } else {
        console.error('Failed to update host:', data.errors)
        alert('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving host:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Upload a single image file to backend and append returned URL to editForm.photos
  const handleFileUpload = async (hostId: string, file: File | null) => {
    if (!file) return
    // Client-side validation: type and size
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file')
      return
    }
    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (file.size > maxBytes) {
      alert('Image is too large. Maximum size is 5 MB.')
      return
    }
    try {
      const formData = new FormData()
      formData.append('image', file)

      const resp = await fetch('http://localhost:4000/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await resp.json()
      if (data?.url) {
        const currentPhotos = Array.isArray(editForms[hostId]?.photos) ? editForms[hostId].photos : []
        updateEditForm(hostId, 'photos', [...currentPhotos, data.url])
      } else {
        console.error('Upload failed', data)
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    }
  }

  const updateEditForm = (hostId: string, field: keyof HostData, value: string | number | string[] | undefined) => {
    setEditForms(prev => ({
      ...prev,
      [hostId]: {
        ...prev[hostId],
        [field]: value
      }
    }))
  }

  // Mark a photo as featured by moving it to index 0 of the photos array
  const setFeaturedPhoto = (hostId: string, index: number) => {
    const photos = Array.isArray(editForms[hostId]?.photos) ? [...editForms[hostId].photos] : []
    if (index < 0 || index >= photos.length) return
    const [item] = photos.splice(index, 1)
    photos.unshift(item)
    updateEditForm(hostId, 'photos', photos)
  }

  // Geocoding function to get coordinates from address
  const geocodeAddress = async (address: string, city: string, state: string, country: string, isEditForm = false, hostId?: string) => {
    if (!address && !city) {
      return
    }

    const setLoadingState = isEditForm ? setGeocodingEdit : setGeocoding
    setLoadingState(true)

    try {
      // Construct full address for geocoding
      const fullAddress = [address, city, state, country].filter(Boolean).join(', ')
      
      // Using OpenStreetMap Nominatim API for geocoding (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=${country ? country.toLowerCase().slice(0, 2) : ''}`
      )
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }

      const data = await response.json()
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)

        if (isEditForm && hostId) {
          updateEditForm(hostId, 'latitude', lat)
          updateEditForm(hostId, 'longitude', lng)
        } else {
          // Set values on the add-hosting form
          try {
            setValue('latitude', lat.toString())
            setValue('longitude', lng.toString())
          } catch (e) {
            // setValue might not be available in some contexts; ignore
            console.warn('Could not set form values for coordinates', e)
          }
        }
        
        // Success feedback
        console.log(`Coordinates found: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      } else {
        // No results found
        console.warn('No coordinates found for this address')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setLoadingState(false)
    }
  }

  const handleDeleteHost = async (hostId: string) => {
    setDeleting(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DeleteHost($id: ID!) {
              deleteHost(id: $id)
            }
          `,
          variables: { id: hostId },
        }),
      })

      const data = await response.json()
      if (data.data?.deleteHost) {
        // Remove the host from local state
        setHostings(hostings.filter(h => h.id !== hostId))
        setDeleteConfirmId(null)
      } else {
        console.error('Failed to delete host:', data.errors)
        alert('Failed to delete host')
      }
    } catch (error) {
      console.error('Error deleting host:', error)
      alert('Failed to delete host')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (hostId: string) => {
    setDeleteConfirmId(hostId)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  if (!session) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage your hosting</h1>
          <p className="text-gray-600">You need to be signed in to access hosting management features.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout 
      title="Manage Your Hosting" 
      subtitle="Add and manage your properties for friends to stay"
    >
      {/* Booking Requests Summary */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Booking Requests</h3>
                <p className="text-sm text-gray-600">
                  {pendingRequestsCount > 0 
                    ? `You have ${pendingRequestsCount} pending request${pendingRequestsCount !== 1 ? 's' : ''}`
                    : 'No pending requests'
                  }
                </p>
              </div>
            </div>
            <Link href="/settings/bookings">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                View All Requests
                {pendingRequestsCount > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs min-w-[1.2rem] h-5">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Hosting</CardTitle>
            <CardDescription>Create a new hosting opportunity for your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(handleAddHosting)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register('name')} placeholder="e.g., Cozy Downtown Apartment" />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{String(errors.name?.message)}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Describe your space..." rows={3} />
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Address Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" {...register('address')} placeholder="e.g., 123 Main Street, Apt 4B" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city')} placeholder="San Francisco" />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" {...register('state')} placeholder="CA" />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input id="zipCode" {...register('zipCode')} placeholder="94102" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...register('country')} placeholder="United States" />
                    </div>
                    <div>
                      <Label htmlFor="latitude">Latitude (optional)</Label>
                      <Input id="latitude" type="number" step="any" {...register('latitude')} placeholder="37.7749" />
                      <p className="text-xs text-gray-500 mt-1">For precise map location</p>
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude (optional)</Label>
                      <Input id="longitude" type="number" step="any" {...register('longitude')} placeholder="-122.4194" />
                      <p className="text-xs text-gray-500 mt-1">For precise map location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => geocodeAddress(watch('address') || '', watch('city') || '', watch('state') || '', watch('country') || '')}
                      disabled={geocoding || (!watch('address') && !watch('city'))}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      {geocoding ? 'Finding Coordinates...' : 'Get Coordinates from Address'}
                    </Button>
                    <p className="text-xs text-gray-500">Automatically find latitude and longitude from your address</p>
                  </div>
                  <div>
                    <Label htmlFor="location">General Location Description</Label>
                    <Input id="location" {...register('location')} placeholder="e.g., Downtown San Francisco, Near Golden Gate Park" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input id="maxGuests" type="number" {...register('maxGuests', { valueAsNumber: true })} min="1" />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} min="0" />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" {...register('bathrooms', { valueAsNumber: true })} min="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input id="checkInTime" {...register('checkInTime')} placeholder="e.g., 3:00 PM" />
                </div>
                <div>
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input id="checkOutTime" {...register('checkOutTime')} placeholder="e.g., 11:00 AM" />
                </div>
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input id="amenities" {...register('amenities')} placeholder="e.g., WiFi, Kitchen, Parking" />
              </div>

              <div>
                <Label htmlFor="houseRules">House Rules</Label>
                <Textarea id="houseRules" {...register('houseRules')} placeholder="e.g., No smoking, quiet hours after 10pm" rows={2} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || saving || !watch('name') || (!watch('location') && !watch('city'))}>
                  {saving || isSubmitting ? 'Creating...' : 'Add Hosting'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} type="button">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p>Loading your hosting properties...</p>
            </CardContent>
          </Card>
        ) : hostings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No hosting properties yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first hosting opportunity for friends</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Hosting
              </Button>
            </CardContent>
          </Card>
        ) : (
          hostings.map((hosting) => (
            <Card key={hosting.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    {editingHostIds.includes(hosting.id) ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-name-${hosting.id}`}>Name</Label>
                          <Input
                            id={`edit-name-${hosting.id}`}
                            value={editForms[hosting.id]?.name || ''}
                            onChange={(e) => updateEditForm(hosting.id, 'name', e.target.value)}
                            placeholder="Property name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-location-${hosting.id}`}>General Location Description</Label>
                          <Input
                            id={`edit-location-${hosting.id}`}
                            value={editForms[hosting.id]?.location || ''}
                            onChange={(e) => updateEditForm(hosting.id, 'location', e.target.value)}
                            placeholder="e.g., Downtown San Francisco, Near Golden Gate Park"
                          />
                        </div>
                        
                        {/* Address Section */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Address Information</h4>
                          <div>
                            <Label htmlFor={`edit-address-${hosting.id}`}>Street Address</Label>
                            <Input
                              id={`edit-address-${hosting.id}`}
                              value={editForms[hosting.id]?.address || ''}
                              onChange={(e) => updateEditForm(hosting.id, 'address', e.target.value)}
                              placeholder="e.g., 123 Main Street, Apt 4B"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`edit-city-${hosting.id}`}>City</Label>
                              <Input
                                id={`edit-city-${hosting.id}`}
                                value={editForms[hosting.id]?.city || ''}
                                onChange={(e) => updateEditForm(hosting.id, 'city', e.target.value)}
                                placeholder="San Francisco"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-state-${hosting.id}`}>State/Province</Label>
                              <Input
                                id={`edit-state-${hosting.id}`}
                                value={editForms[hosting.id]?.state || ''}
                                onChange={(e) => updateEditForm(hosting.id, 'state', e.target.value)}
                                placeholder="CA"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-zipCode-${hosting.id}`}>ZIP/Postal Code</Label>
                              <Input
                                id={`edit-zipCode-${hosting.id}`}
                                value={editForms[hosting.id]?.zipCode || ''}
                                onChange={(e) => updateEditForm(hosting.id, 'zipCode', e.target.value)}
                                placeholder="94102"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`edit-country-${hosting.id}`}>Country</Label>
                              <Input
                                id={`edit-country-${hosting.id}`}
                                value={editForms[hosting.id]?.country || ''}
                                onChange={(e) => updateEditForm(hosting.id, 'country', e.target.value)}
                                placeholder="United States"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-latitude-${hosting.id}`}>Latitude (optional)</Label>
                              <Input
                                id={`edit-latitude-${hosting.id}`}
                                type="number"
                                step="any"
                                value={editForms[hosting.id]?.latitude || ''}
                                onChange={(e) => updateEditForm(hosting.id, 'latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="37.7749"
                              />
                              <p className="text-xs text-gray-500 mt-1">For precise map location</p>
                            </div>
                            <div>
                              <Label htmlFor={`edit-longitude-${hosting.id}`}>Longitude (optional)</Label>
                              <Input
                                id={`edit-longitude-${hosting.id}`}
                                type="number"
                                step="any"
                                value={editForms[hosting.id]?.longitude || ''}
                                onChange={(e) => updateEditForm(hosting.id, 'longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="-122.4194"
                              />
                              <p className="text-xs text-gray-500 mt-1">For precise map location</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => geocodeAddress(
                                editForms[hosting.id]?.address || '',
                                editForms[hosting.id]?.city || '',
                                editForms[hosting.id]?.state || '',
                                editForms[hosting.id]?.country || '',
                                true,
                                hosting.id
                              )}
                              disabled={geocodingEdit || (!editForms[hosting.id]?.address && !editForms[hosting.id]?.city)}
                            >
                              <Navigation className="w-4 h-4 mr-2" />
                              {geocodingEdit ? 'Finding Coordinates...' : 'Get Coordinates from Address'}
                            </Button>
                            <p className="text-xs text-gray-500">
                              Automatically find latitude and longitude from your address
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {hosting.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {hosting.address ? 
                            `${hosting.address}, ${hosting.city}, ${hosting.state}` :
                            hosting.location || `${hosting.city}, ${hosting.state}`
                          }
                        </CardDescription>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingHostIds.includes(hosting.id) ? (
                      <>
                        <Button 
                          onClick={() => saveEdit(hosting.id)} 
                          disabled={saving}
                          size="sm"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => cancelEdit(hosting.id)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEdit(hosting)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmDelete(hosting.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingHostIds.includes(hosting.id) ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`edit-description-${hosting.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${hosting.id}`}
                        value={editForms[hosting.id]?.description || ''}
                        onChange={(e) => updateEditForm(hosting.id, 'description', e.target.value)}
                        placeholder="Describe your space..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Photos</Label>
                      <div className="flex items-center gap-2 mb-2">
                        <FileUpload onChange={(files) => handleFileUpload(hosting.id, files && files.length ? files[0] : null)} />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(editForms[hosting.id]?.photos || []).map((p: string, idx: number) => (
                          <div
                            key={idx}
                            role="button"
                            tabIndex={0}
                            onClick={() => setFeaturedPhoto(hosting.id, idx)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFeaturedPhoto(hosting.id, idx) }}
                            className={`w-24 h-16 bg-gray-100 rounded overflow-hidden relative cursor-pointer ${idx === 0 ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}`}
                            aria-label={`Set photo ${idx + 1} as featured`}
                          >
                            <Image unoptimized src={p} alt={`photo-${idx}`} fill className="object-cover" sizes="96px" />

                            {/* Featured badge for the first photo */}
                            {idx === 0 && (
                              <span className="absolute left-0 bottom-0 bg-blue-600 text-white text-xs px-1 py-0.5">
                                Featured
                              </span>
                            )}

                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1"
                              onClick={(e) => {
                                // Prevent the click from bubbling to the parent which would set this photo as featured
                                e.stopPropagation()
                                const photos = editForms[hosting.id]?.photos || []
                                photos.splice(idx, 1)
                                updateEditForm(hosting.id, 'photos', photos)
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`edit-maxGuests-${hosting.id}`}>Max Guests</Label>
                        <Input
                          id={`edit-maxGuests-${hosting.id}`}
                          type="number"
                          value={editForms[hosting.id]?.maxGuests || 1}
                          onChange={(e) => updateEditForm(hosting.id, 'maxGuests', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-bedrooms-${hosting.id}`}>Bedrooms</Label>
                        <Input
                          id={`edit-bedrooms-${hosting.id}`}
                          type="number"
                          value={editForms[hosting.id]?.bedrooms || 1}
                          onChange={(e) => updateEditForm(hosting.id, 'bedrooms', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-bathrooms-${hosting.id}`}>Bathrooms</Label>
                        <Input
                          id={`edit-bathrooms-${hosting.id}`}
                          type="number"
                          value={editForms[hosting.id]?.bathrooms || 1}
                          onChange={(e) => updateEditForm(hosting.id, 'bathrooms', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-checkInTime-${hosting.id}`}>Check-in Time</Label>
                        <Input
                          id={`edit-checkInTime-${hosting.id}`}
                          value={editForms[hosting.id]?.checkInTime || ''}
                          onChange={(e) => updateEditForm(hosting.id, 'checkInTime', e.target.value)}
                          placeholder="e.g., 3:00 PM"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-checkOutTime-${hosting.id}`}>Check-out Time</Label>
                        <Input
                          id={`edit-checkOutTime-${hosting.id}`}
                          value={editForms[hosting.id]?.checkOutTime || ''}
                          onChange={(e) => updateEditForm(hosting.id, 'checkOutTime', e.target.value)}
                          placeholder="e.g., 11:00 AM"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`edit-amenities-${hosting.id}`}>Amenities (comma-separated)</Label>
                      <Input
                        id={`edit-amenities-${hosting.id}`}
                        value={Array.isArray(editForms[hosting.id]?.amenities) ? (editForms[hosting.id]?.amenities || []).join(', ') : ''}
                        onChange={(e) => updateEditForm(hosting.id, 'amenities', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
                        placeholder="e.g., WiFi, Kitchen, Parking"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-houseRules-${hosting.id}`}>House Rules</Label>
                      <Textarea
                        id={`edit-houseRules-${hosting.id}`}
                        value={editForms[hosting.id]?.houseRules || ''}
                        onChange={(e) => updateEditForm(hosting.id, 'houseRules', e.target.value)}
                        placeholder="e.g., No smoking, quiet hours after 10pm"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Featured image preview (first photo is treated as featured) */}
                    {hosting.photos && hosting.photos.length > 0 ? (
                      <div className="w-full h-48 md:h-56 rounded-lg overflow-hidden mb-4 bg-gray-100 relative">
                        <Image
                          unoptimized
                          src={hosting.photos[0]}
                          alt={`${hosting.name} featured`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ) : null}

                    <p className="text-gray-600 mb-4">{hosting.description}</p>
                    
                    {/* Address Information */}
                    {(hosting.address || hosting.city || hosting.state || hosting.zipCode || hosting.country) && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Address</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {hosting.address && <p>{hosting.address}</p>}
                          <p>
                            {[hosting.city, hosting.state, hosting.zipCode].filter(Boolean).join(', ')}
                            {hosting.country && `, ${hosting.country}`}
                          </p>
                          {(hosting.latitude && hosting.longitude) && (
                            <p className="text-xs text-gray-500">
                              Coordinates: {hosting.latitude}, {hosting.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {hosting.maxGuests} guests
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="w-4 h-4" />
                        {hosting.bedrooms} bedrooms
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bath className="w-4 h-4" />
                        {hosting.bathrooms} bathrooms
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {hosting.checkInTime} - {hosting.checkOutTime}
                      </div>
                    </div>

                    {hosting.amenities && hosting.amenities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {hosting.amenities.map((amenity: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {hosting.houseRules && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">House Rules</h4>
                        <p className="text-sm text-gray-600">{hosting.houseRules}</p>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Manage Availability</h4>
                  <AvailabilityManager 
                    availabilities={hosting.availabilities || getHostAvailabilities(hosting.id)}
                    onAddAvailability={handleAddAvailability(hosting.id)}
                    onRemoveAvailability={handleRemoveAvailability}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Hosting Property</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this hosting property? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteHost(deleteConfirmId)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}