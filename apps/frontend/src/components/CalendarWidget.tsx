import { Calendar } from "@/components/ui/calendar"
import { convertAvailabilityDates } from '@/lib/date-utils'

interface CalendarWidgetProps {
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  currentMonth: Date
  setCurrentMonth: (month: Date) => void
  availabilityDates: Set<string>
  maxMonthsDisplayed: number
}

export function CalendarWidget({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  availabilityDates,
  maxMonthsDisplayed
}: CalendarWidgetProps) {
  // Create availabilityDates as an array of date strings
  const bookedDates = convertAvailabilityDates(Array.from(availabilityDates))

  return (
    <div className="flex-shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Available dates</span>
      </div>
      <Calendar
        mode="single"
        showOutsideDays={false}
        selected={selectedDate}
        onSelect={setSelectedDate}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        numberOfMonths={maxMonthsDisplayed}
        className="rounded-md border w-full grid"
        classNames={{
          today: "font-semibold",
        }}
        modifiers={{
          booked: bookedDates,
        }}
        modifiersClassNames={{
          booked: "[&>button]:text-blue-600 [&>button]:bg-blue-50",
        }}
      />
    </div>
  )
}