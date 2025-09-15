import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { formatDateRange, formatDateForUrl } from '@/lib/date-utils'

interface AvailabilityCalendarProps {
  selectedDateRange: {from: Date | undefined, to: Date | undefined}
  onSelect: (range: {from: Date | undefined, to: Date | undefined} | undefined) => void
}

export function AvailabilityCalendar({ selectedDateRange, onSelect }: AvailabilityCalendarProps) {
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
          mode="range"
          selected={selectedDateRange.from && selectedDateRange.to ? {from: selectedDateRange.from, to: selectedDateRange.to} : undefined}
          onSelect={(range) => onSelect({from: range?.from, to: range?.to})}
          numberOfMonths={1}
          className="rounded-md border w-full"
        />
        {selectedDateRange.from && selectedDateRange.to && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium">
              Selected: {formatDateRange(
                formatDateForUrl(selectedDateRange.from),
                formatDateForUrl(selectedDateRange.to)
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}