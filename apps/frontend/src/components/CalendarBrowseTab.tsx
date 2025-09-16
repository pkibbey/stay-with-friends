import { CalendarWidget } from "./CalendarWidget"
import { SelectedDateAvailabilities } from "./SelectedDateAvailabilities"
import { AllAvailabilities } from "./AllAvailabilities"

interface Person {
  id: string
  name: string
  location?: string
  relationship?: string
  description?: string
}

interface Availability {
  id: string
  personId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
  person: Person
}

interface CalendarBrowseTabProps {
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  currentMonth: Date
  setCurrentMonth: (month: Date) => void
  availabilityDates: Set<string>
  calendarResults: Availability[]
  isLoadingCalendar: boolean
  allAvailabilities: Availability[]
  isLoadingAll: boolean
  maxMonthsDisplayed: number
}

export function CalendarBrowseTab({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  availabilityDates,
  calendarResults,
  isLoadingCalendar,
  allAvailabilities,
  isLoadingAll,
  maxMonthsDisplayed
}: CalendarBrowseTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Browse Available Dates</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select dates to see who&apos;s available in your network during that time.
        </p>
      </div>
      
      <div className="flex gap-6">
        <CalendarWidget
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          availabilityDates={availabilityDates}
          maxMonthsDisplayed={maxMonthsDisplayed}
        />
        <div className="space-y-6 flex-1 p-4">
          <SelectedDateAvailabilities
            selectedDate={selectedDate}
            calendarResults={calendarResults}
            isLoadingCalendar={isLoadingCalendar}
          />

          <AllAvailabilities
            allAvailabilities={allAvailabilities}
            isLoadingAll={isLoadingAll}
          />
        </div>
      </div>
    </div>
  )
}