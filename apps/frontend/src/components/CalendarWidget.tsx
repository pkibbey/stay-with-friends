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
  const availableDates = convertAvailabilityDates(Array.from(availabilityDates))

  return (
    <div className="flex-shrink-0">
      <Calendar
        mode="single"
        showOutsideDays={false}
        selected={selectedDate}
        onSelect={setSelectedDate}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        numberOfMonths={maxMonthsDisplayed}
        className="rounded-md w-full grid"
        classNames={{
          today: "font-semibold",
        }}
        modifiers={{
          available: availableDates,
        }}
        modifiersClassNames={{
          available: "[&>button]:text-blue-600 [&>button]:bg-blue-50",
        }}
      />
    </div>
  )
}