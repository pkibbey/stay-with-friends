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
import { Navigation } from 'lucide-react'
import { User } from '@/types'
import { toast } from 'sonner'

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
}

export function HostingEditForm({ onSuccess, onCancel }: HostingEditFormProps) {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

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
        onSuccess()
      } else {
        console.error('Failed to create host:', result)
        toast.error('Failed to create hosting. Please check your inputs and try again.')
      }
    } catch (error) {
      console.error('Error creating host:', error)
      toast.error('Failed to create hosting. Please try again.')
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
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}