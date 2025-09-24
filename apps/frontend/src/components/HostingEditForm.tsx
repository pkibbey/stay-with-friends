"use client"

import { useState } from 'react'
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
import { Navigation, Upload, Trash2 } from 'lucide-react'
import { User } from '@/types'
import { toast } from 'sonner'
import Image from 'next/image'

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

interface HostingEditFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: {
    id: string
    name: string
    description?: string | null
    location?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    country?: string | null
    latitude?: number | null
    longitude?: number | null
    maxGuests: number
    bedrooms: number
    bathrooms: number
    checkInTime?: string | null
    checkOutTime?: string | null
    amenities?: string[] | null
    houseRules?: string | null
    photos?: string[] | null
  }
}

export function HostingEditForm({ onSuccess, onCancel, initialData }: HostingEditFormProps) {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || [])

  const isEditing = !!initialData

  // Image upload function
  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('http://localhost:4000/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setPhotos(prev => [...prev, data.url])
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    const confirmed = confirm('Are you sure you want to delete this photo? This image will be permanently deleted once the form is submitted.')
    if (confirmed) {
      setPhotos(prev => prev.filter((_, i) => i !== index))
    }
  }

  const makeFeaturedPhoto = (index: number) => {
    if (index === 0) return // Already featured
    setPhotos(prev => {
      const newPhotos = [...prev]
      const [featuredPhoto] = newPhotos.splice(index, 1)
      newPhotos.unshift(featuredPhoto)
      return newPhotos
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
    // Reset input
    event.target.value = ''
  }

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(AddHostingSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      description: initialData.description || '',
      location: initialData.location || '',
      address: initialData.address || '',
      city: initialData.city || '',
      state: initialData.state || '',
      zipCode: initialData.zipCode || '',
      country: initialData.country || '',
      latitude: initialData.latitude ? initialData.latitude.toString() : '',
      longitude: initialData.longitude ? initialData.longitude.toString() : '',
      maxGuests: initialData.maxGuests || 2,
      bedrooms: initialData.bedrooms || 1,
      bathrooms: initialData.bathrooms || 1,
      checkInTime: initialData.checkInTime || '3:00 PM',
      checkOutTime: initialData.checkOutTime || '11:00 AM',
      amenities: initialData.amenities ? initialData.amenities.join(', ') : '',
      houseRules: initialData.houseRules || ''
    } : {
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

  const handleAddHosting = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      // Get userId from session
      const userId = (session?.user as User | undefined)?.id
      if (!userId) {
        toast.error('You must be signed in to create a hosting')
        setSaving(false)
        return
      }

      // Parse numeric coordinates
      const latitude = values.latitude ? parseFloat(values.latitude as string) : undefined
      const longitude = values.longitude ? parseFloat(values.longitude as string) : undefined

      // Build amenities array
      const amenities = ((values.amenities as string) || '').split(',').map((a: string) => a.trim()).filter((a: string) => a)

      if (isEditing && initialData) {
        // Update existing host
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
              createdAt
              updatedAt
              userId
            }
          }
        `

        const variables = {
          id: initialData.id,
          input: {
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
            photos: photos.length > 0 ? photos : undefined
          }
        }

        const result = await authenticatedGraphQLRequest(mutation, variables)

        if (result.data?.updateHost) {
          onSuccess()
        } else {
          console.error('Failed to update host:', result)
          toast.error('Failed to update hosting. Please check your inputs and try again.')
        }
      } else {
        // Create new host
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
          photos: photos.length > 0 ? photos : []
        }

        const result = await authenticatedGraphQLRequest(mutation, variables)

        if (result.data?.createHost) {
          onSuccess()
        } else {
          console.error('Failed to create host:', result)
          toast.error('Failed to create hosting. Please check your inputs and try again.')
        }
      }
    } catch (error) {
      console.error('Error saving host:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} hosting. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  // Geocoding function to get coordinates from address
  const geocodeAddress = async (address: string, city: string, state: string, country: string) => {
    if (!address && !city) {
      return
    }

    setGeocoding(true)

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

        // Set values on the add-hosting form
        try {
          setValue('latitude', lat.toString())
          setValue('longitude', lng.toString())
        } catch (e) {
          // setValue might not be available in some contexts; ignore
          console.warn('Could not set form values for coordinates', e)
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
      setGeocoding(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Hosting' : 'Add New Hosting'}</CardTitle>
        <CardDescription>{isEditing ? 'Update your hosting information' : 'Create a new hosting opportunity for your friends'}</CardDescription>
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

          {/* Photos Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Photos</h4>
            
            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div 
                      className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all ${
                        index === 0 ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                      }`}
                      onClick={() => makeFeaturedPhoto(index)}
                    >
                      <Image
                        unoptimized
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                        onError={(e) => console.log('Image load error for', photo, e)}
                        onLoad={() => console.log('Image loaded successfully for', photo)}
                      />
                      {/* Featured indicator */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <Label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Add Photo'}
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-gray-500 mt-1">Upload images of your hosting space (max 5MB each)</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || saving || !watch('name') || (!watch('location') && !watch('city'))}>
              {saving || isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Hosting' : 'Add Hosting')}
            </Button>
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}