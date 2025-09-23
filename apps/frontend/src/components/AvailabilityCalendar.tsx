import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { parseLocalDate } from '@/lib/date-utils'

interface AvailabilityCalendarProps {
  selectedDate: Date | undefined
  onSelect: (date: Date | undefined) => void
  availabilities?: Array<{ startDate: string; endDate: string; status: string }>
}

export function AvailabilityCalendar({ selectedDate, onSelect, availabilities = [] }: AvailabilityCalendarProps) {
  // Convert availability data to date objects for the calendar modifiers
  const availableDates = availabilities
    .filter(availability => availability.status === 'available')
    .flatMap(availability => {
      // Use parseLocalDate for consistent timezone handling
      const startDate = parseLocalDate(availability.startDate)
      const endDate = parseLocalDate(availability.endDate)
      const dates = []
      
      // Generate all dates between start and end (inclusive)
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date))
      }
      
      return dates
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Availability
        </CardTitle>
        <CardDescription>Select your dates to check availability</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          showOutsideDays={false}
          selected={selectedDate}
          onSelect={onSelect}
          defaultMonth={selectedDate}
          className="rounded-md border w-full"
          modifiers={{
            available: availableDates,
          }}
          modifiersClassNames={{
            available: "[&>button]:text-blue-600 [&>button]:bg-blue-50",
          }}
        />
      </CardContent>
    </Card>
  )
}