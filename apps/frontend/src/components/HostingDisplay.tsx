"use client"

import Image from 'next/image'
import { toast } from 'sonner'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { AvailabilityManager } from '@/components/AvailabilityManager'
import { Edit, MapPin, Users, Bed, Bath, Clock, Trash2, Plus } from 'lucide-react'
import { HostWithAvailabilities } from '@/types'
import { authenticatedGraphQLRequest } from '@/lib/graphql'

interface HostingDisplayProps {
  hostings: HostWithAvailabilities[]
  onRefresh: () => void
  onAddNew: () => void
}

export function HostingDisplay({ hostings, onRefresh, onAddNew }: HostingDisplayProps) {
  const [editingHostIds, setEditingHostIds] = useState<string[]>([])
  const [editForms, setEditForms] = useState<Record<string, Partial<HostWithAvailabilities>>>({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [geocodingEdit, setGeocodingEdit] = useState(false)

  const startEdit = (hosting: HostWithAvailabilities) => {
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
      const input: Partial<Omit<HostWithAvailabilities, 'id' | 'availabilities'>> = {}

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

      const mutation = `
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
          `

      type UpdateHostResponse = { updateHost?: HostWithAvailabilities }

      const result = await authenticatedGraphQLRequest<UpdateHostResponse>(mutation, { id: editForm.id, input })
      const updated = (result.data as UpdateHostResponse | undefined)?.updateHost
      if (updated) {
        onRefresh()
        cancelEdit(hostId)
      } else {
        console.error('Failed to update host:', result)
        toast.error('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving host:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Upload a single image file to backend and append returned URL to editForm.photos
  const handleFileUpload = async (hostId: string, file: File | null) => {
    if (!file) return
    // Client-side validation: type and size
    if (!file.type || !file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }
    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (file.size > maxBytes) {
      toast.error('Image is too large. Maximum size is 5 MB.')
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
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const updateEditForm = (hostId: string, field: keyof HostWithAvailabilities, value: string | number | string[] | undefined) => {
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
  const geocodeAddress = async (address: string, city: string, state: string, country: string, hostId: string) => {
    if (!address && !city) {
      return
    }

    setGeocodingEdit(true)

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

        updateEditForm(hostId, 'latitude', lat)
        updateEditForm(hostId, 'longitude', lng)

        // Success feedback
        console.log(`Coordinates found: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      } else {
        // No results found
        console.warn('No coordinates found for this address')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setGeocodingEdit(false)
    }
  }

  const handleDeleteHost = async (hostId: string) => {
    setDeleting(true)
    try {
      const mutation = `
            mutation DeleteHost($id: ID!) {
              deleteHost(id: $id)
            }
          `

      type DeleteHostResponse = { deleteHost?: boolean }

      const result = await authenticatedGraphQLRequest<DeleteHostResponse>(mutation, { id: hostId })
      const ok = (result.data as DeleteHostResponse | undefined)?.deleteHost
      if (ok) {
        onRefresh()
        setDeleteConfirmId(null)
      } else {
        console.error('Failed to delete host:', result)
        toast.error('Failed to delete host')
      }
    } catch (error) {
      console.error('Error deleting host:', error)
      toast.error('Failed to delete host')
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

  const handleAddAvailability = (hostId: string) => async (startDate: string, endDate: string, notes?: string) => {
    try {
      const mutation = `
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
          `

      type CreateAvailabilityResponse = { createAvailability?: { id: string; hostId: string; startDate: string; endDate: string; status: string; notes?: string } }

      const result = await authenticatedGraphQLRequest<CreateAvailabilityResponse>(mutation, { hostId, startDate, endDate, notes })
      const created = (result.data as CreateAvailabilityResponse | undefined)?.createAvailability
      if (created) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error adding availability:', error)
    }
  }

  const handleRemoveAvailability = async (id: string) => {
    try {
      // You'll need to implement a deleteAvailability mutation in your backend
      console.log('Remove availability:', id)
      onRefresh()
    } catch (error) {
      console.error('Error removing availability:', error)
    }
  }

  return (
    <>
      <div className="grid gap-6">
        {hostings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No hosting properties yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first hosting opportunity for friends</p>
              <Button onClick={onAddNew}>
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
                                hosting.id
                              )}
                              disabled={geocodingEdit || (!editForms[hosting.id]?.address && !editForms[hosting.id]?.city)}
                            >
                              Get Coordinates from Address
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
                  {editingHostIds.includes(hosting.id) ? (
                    <>
                      <h4 className="font-semibold mb-3">Manage Availability</h4>
                      <AvailabilityManager
                        availabilities={hosting.availabilities || []}
                        onAddAvailability={handleAddAvailability(hosting.id)}
                        onRemoveAvailability={handleRemoveAvailability}
                      />
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold mb-3">Availability</h4>
                      {(hosting.availabilities && hosting.availabilities.length > 0) ? (
                        <div className="space-y-2">
                          {hosting.availabilities.map((availability) => (
                            <div key={availability.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {new Date(availability.startDate).toLocaleDateString()} - {new Date(availability.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-600 capitalize">
                                  Status: {availability.status}
                                </div>
                                {availability.notes && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {availability.notes}
                                  </div>
                                )}
                              </div>
                              <Badge variant={availability.status === 'available' ? 'default' : 'secondary'}>
                                {availability.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No availability periods set. Edit this property to add availability.</p>
                      )}
                    </>
                  )}
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
    </>
  )
}