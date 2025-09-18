'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Home, MapPin, Users, Clock, Shield, Camera } from "lucide-react"
import Image from 'next/image'

export interface ListingFormData {
  id?: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  amenities: string[]
  houseRules: string
  checkInTime: string
  checkOutTime: string
  photos: string[]
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

const COMMON_AMENITIES = [
  'WiFi',
  'Kitchen',
  'Washing machine',
  'Air conditioning',
  'Heating',
  'Parking',
  'Pool',
  'Hot tub',
  'Gym',
  'TV',
  'Workspace',
  'Fireplace',
  'Garden',
  'Balcony',
  'Pet friendly',
  'Smoking allowed',
  'Events allowed',
  'Long term stays'
]

export function ListingForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Listing'
}: ListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    houseRules: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    photos: [],
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!formData.maxGuests || formData.maxGuests < 1) {
      newErrors.maxGuests = 'Must accommodate at least 1 guest'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
  }

  const updateField = (field: keyof ListingFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Essential details about your property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Cozy downtown apartment with great view"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your space, what makes it special, and what guests can expect..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="maxGuests">Maximum Guests *</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  value={formData.maxGuests || ''}
                  onChange={(e) => updateField('maxGuests', parseInt(e.target.value) || 1)}
                  className={errors.maxGuests ? 'border-red-500' : ''}
                />
                {errors.maxGuests && <p className="text-sm text-red-500 mt-1">{errors.maxGuests}</p>}
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms || ''}
                  onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.bathrooms || ''}
                  onChange={(e) => updateField('bathrooms', parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
            <CardDescription>Where is your property located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Main Street"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="San Francisco"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="CA"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateField('zipCode', e.target.value)}
                  placeholder="94102"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in/Check-out */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Check-in & Check-out
            </CardTitle>
            <CardDescription>Set your preferred check-in and check-out times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => updateField('checkInTime', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => updateField('checkOutTime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Amenities
            </CardTitle>
            <CardDescription>What amenities does your property offer?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {COMMON_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* House Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              House Rules
            </CardTitle>
            <CardDescription>Any special rules or requirements for guests</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="houseRules"
              value={formData.houseRules}
              onChange={(e) => updateField('houseRules', e.target.value)}
              placeholder="e.g., No smoking, No pets, Quiet hours after 10 PM..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photos
            </CardTitle>
            <CardDescription>Upload photos of your property (coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Photo upload functionality will be added in the next phase with Cloudinary integration.
              </p>
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <Image
                        unoptimized
                        src={photo}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}