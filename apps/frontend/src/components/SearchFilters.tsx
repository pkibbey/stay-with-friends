'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Search } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate, formatDateForUrl } from '@/lib/date-utils'
import { SearchFiltersState } from '@/types'

interface SearchFiltersProps {
  filters: SearchFiltersState
  onFiltersChange: (filters: SearchFiltersState) => void
  isLoading: boolean
}

export function SearchFilters({ filters, onFiltersChange, isLoading }: SearchFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [localQuery, setLocalQuery] = useState(filters.query)

  const handleFilterChange = (key: keyof SearchFiltersState, value: string | number | boolean | string[] | null) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('query', localQuery)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = formatDateForUrl(date)
      handleFilterChange('startDate', dateString)
    } else {
      handleFilterChange('startDate', null)
    }
    setShowDatePicker(false)
  }

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
            {filters.query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalQuery('')
                  handleFilterChange('query', '')
                }}
                className="w-full"
              >
                Clear search
              </Button>
            )}
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
            <Label>Start date</Label>
            <Button
              variant="outline"
              onClick={() => setShowDatePicker(true)}
              className="w-full justify-start text-left font-normal mt-1"
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? format(parseLocalDate(filters.startDate), 'PPP') : 'Select start date'}
            </Button>
            {showDatePicker && (
              <div className="mt-2 p-3 border rounded-lg bg-white shadow-lg">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? parseLocalDate(filters.startDate) : undefined}
                  startMonth={filters.startDate ? parseLocalDate(filters.startDate) : undefined}
                  onSelect={(date) => handleDateSelect(date)}
                  // disabled={(date) => date < new Date()}
                  className="rounded-md border-0"
                />
              </div>
            )}
          </div>

          {filters.startDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterChange('startDate', null)
              }}
              className="w-full"
            >
              Clear date
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}