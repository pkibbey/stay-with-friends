'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate, formatDateForUrl } from '@/lib/date-utils'
import { SearchFiltersState } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface SearchFiltersProps {
  filters: SearchFiltersState
  onFiltersChange: (filters: SearchFiltersState) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [open, setOpen] = useState<boolean>(false)
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
    setOpen(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
      {/* Search Query */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <Input          
            id="query"
            placeholder="Search by title, description, location..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
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
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
              size="sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? format(parseLocalDate(filters.startDate), 'MMM d') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.startDate ? parseLocalDate(filters.startDate) : undefined}
              startMonth={filters.startDate ? parseLocalDate(filters.startDate) : undefined}
              onSelect={(date) => handleDateSelect(date)}
              className="rounded-md border-0"
            />
          </PopoverContent>
        </Popover>
        {filters.startDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleFilterChange('startDate', null)
            }}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}