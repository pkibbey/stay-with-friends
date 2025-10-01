'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Home, MapPin, Users, Bed, Bath } from 'lucide-react'
import { convertAvailabilityDates } from '@/lib/date-utils'
import Link from 'next/link'
import type { HostWithAvailabilities } from '@/types'

interface SearchCalendarViewProps {
  hosts: HostWithAvailabilities[]
}

export function SearchCalendarView({ hosts }: SearchCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Create a map of date strings to hosts available on those dates
  const hostsByDate = useMemo(() => {
    const dateMap = new Map<string, HostWithAvailabilities[]>()
    
    hosts.forEach(host => {
      if (host.availabilities) {
        host.availabilities.forEach(availability => {
          if (availability.status === 'available') {
            const startDate = new Date(availability.start_date || '')
            const endDate = new Date(availability.end_date || '')

            // Add each date in the range
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const dateKey = d.toISOString().split('T')[0]
              if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, [])
              }
              const hostsForDate = dateMap.get(dateKey)!
              if (!hostsForDate.find(h => h.id === host.id)) {
                hostsForDate.push(host)
              }
            }
          }
        })
      }
    })
    
    return dateMap
  }, [hosts])

  // Get all dates that have availability
  const availabilityDates = useMemo(() => {
    return new Set(Array.from(hostsByDate.keys()))
  }, [hostsByDate])

  // Get hosts available on the selected date
  const hostsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = selectedDate.toISOString().split('T')[0]
    return hostsByDate.get(dateKey) || []
  }, [selectedDate, hostsByDate])

  const availableDates = convertAvailabilityDates(Array.from(availabilityDates))

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date)
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px] lg:h-[700px]">
      {/* Calendar Section */}
      <div className="md:w-96 flex-shrink-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Availability Calendar
            </CardTitle>
            <p className="text-sm text-gray-600">
              Click on highlighted dates to see available hosts
            </p>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              showOutsideDays={false}
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              numberOfMonths={1}
              className="rounded-md w-full"
              classNames={{
                today: "font-semibold",
              }}
              modifiers={{
                available: availableDates,
              }}
              modifiersClassNames={{
                available: "[&>button]:text-blue-600 [&>button]:bg-blue-50 [&>button]:ring-1 [&>button]:ring-blue-200",
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-gray-600">Available dates</span>
              </div>
              <div className="text-xs text-gray-500">
                {availabilityDates.size} dates with availability
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Host List Section */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                <>Hosts Available on {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</>
              ) : (
                'Select a Date'
              )}
            </CardTitle>
            {selectedDate && (
              <p className="text-sm text-gray-600">
                {hostsForSelectedDate.length} {hostsForSelectedDate.length === 1 ? 'host' : 'hosts'} available
              </p>
            )}
          </CardHeader>
          <CardContent className="h-full overflow-y-auto">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a date from the calendar to see available hosts</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Blue highlighted dates have host availability
                  </p>
                </div>
              </div>
            ) : hostsForSelectedDate.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hosts available on this date</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try selecting a highlighted date
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hostsForSelectedDate.map((host) => (
                  <Link key={host.id} href={`/host/${host.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Host Image Placeholder */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-400" />
                          </div>
                          
                          {/* Host Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{host.name}</h3>
                            
                            {/* Location */}
                            {(host.city || host.state) && (
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">
                                  {[host.city, host.state].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            
                            {/* Property Details */}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              {host.max_guests && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{host.max_guests} guests</span>
                                </div>
                              )}
                              {host.bedrooms && (
                                <div className="flex items-center gap-1">
                                  <Bed className="w-4 h-4" />
                                  <span>{host.bedrooms} bed{host.bedrooms !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {host.bathrooms && (
                                <div className="flex items-center gap-1">
                                  <Bath className="w-4 h-4" />
                                  <span>{host.bathrooms} bath{host.bathrooms !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Description */}
                            {host.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {host.description}
                              </p>
                            )}
                            
                            {/* Amenities */}
                            {host.amenities && host.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {host.amenities.slice(0, 3).map((amenity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {host.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{host.amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}