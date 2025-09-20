'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MapPin, Users, Star, X, Search } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate, formatDateForUrl } from '@/lib/date-utils'
import { SearchFiltersState } from '@/types'

interface SearchFiltersProps {
  filters: SearchFiltersState
  onFiltersChange: (filters: SearchFiltersState) => void
  isLoading: boolean
}

const COMMON_AMENITIES = [
  'WiFi',
  'Kitchen',
  'Parking',
  'Air Conditioning',
  'Heating',
  'Washer',
  'Dryer',
  'TV',
  'Pool',
  'Hot Tub',
  'Pet Friendly',
  'Gym',
  'Workspace',
  'Fireplace',
  'Garden',
  'Beach Access'
]

export function SearchFilters({ filters, onFiltersChange, isLoading }: SearchFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null)
  const [localQuery, setLocalQuery] = useState(filters.query)

  const handleFilterChange = (key: keyof SearchFiltersState, value: string | number | boolean | string[] | null) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('query', localQuery)
  }

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (date) {
      const dateString = formatDateForUrl(date)
      if (type === 'start') {
        handleFilterChange('startDate', dateString)
        // If start date is after end date, clear end date
        if (filters.endDate && new Date(dateString) > new Date(filters.endDate)) {
          handleFilterChange('endDate', null)
        }
      } else {
        handleFilterChange('endDate', dateString)
      }
    } else {
      handleFilterChange(type === 'start' ? 'startDate' : 'endDate', null)
    }
    setShowDatePicker(null)
  }

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    handleFilterChange('amenities', newAmenities)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFiltersState = {
      query: '',
      startDate: null,
      endDate: null,
      location: '',
      amenities: [],
      trustedHostsOnly: false,
      guests: 1
    }
    setLocalQuery('')
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.query || filters.startDate || filters.endDate || 
    filters.location || filters.amenities.length > 0 || filters.trustedHostsOnly ||
    filters.guests > 1

  return (
    <div className="space-y-6">
      {/* Search Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <Input
              placeholder="Search by title, description, location..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Dates
          </CardTitle>
          <CardDescription>When do you want to stay?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Check-in</Label>
            <Button
              variant="outline"
              onClick={() => setShowDatePicker('start')}
              className="w-full justify-start text-left font-normal mt-1"
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? format(parseLocalDate(filters.startDate), 'PPP') : 'Select date'}
            </Button>
            {showDatePicker === 'start' && (
              <div className="mt-2 p-3 border rounded-lg bg-white shadow-lg">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? parseLocalDate(filters.startDate) : undefined}
                  onSelect={(date) => handleDateSelect(date, 'start')}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border-0"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Check-out</Label>
            <Button
              variant="outline"
              onClick={() => setShowDatePicker('end')}
              className="w-full justify-start text-left font-normal mt-1"
              disabled={isLoading || !filters.startDate}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate ? format(parseLocalDate(filters.endDate), 'PPP') : 'Select date'}
            </Button>
            {showDatePicker === 'end' && (
              <div className="mt-2 p-3 border rounded-lg bg-white shadow-lg">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? parseLocalDate(filters.endDate) : undefined}
                  onSelect={(date) => handleDateSelect(date, 'end')}
                  disabled={(date) => !filters.startDate || date <= parseLocalDate(filters.startDate)}
                  className="rounded-md border-0"
                />
              </div>
            )}
          </div>

          {(filters.startDate || filters.endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterChange('startDate', null)
                handleFilterChange('endDate', null)
              }}
              className="w-full"
            >
              Clear dates
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="City, state, or region"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* Guests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Guests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('guests', Math.max(1, filters.guests - 1))}
              disabled={filters.guests <= 1 || isLoading}
            >
              -
            </Button>
            <span className="w-8 text-center">{filters.guests}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('guests', filters.guests + 1)}
              disabled={filters.guests >= 16 || isLoading}
            >
              +
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Hosts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Host Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trusted-only"
              checked={filters.trustedHostsOnly}
              onCheckedChange={(checked) => handleFilterChange('trustedHostsOnly', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="trusted-only">
              Show only trusted hosts
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {filters.amenities.map(amenity => (
                <Badge 
                  key={amenity} 
                  variant="default" 
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {COMMON_AMENITIES.filter(amenity => !filters.amenities.includes(amenity)).map(amenity => (
                <Button
                  key={amenity}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAmenity(amenity)}
                  disabled={isLoading}
                  className="justify-start text-left"
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          disabled={isLoading}
          className="w-full"
        >
          Clear all filters
        </Button>
      )}
    </div>
  )
}