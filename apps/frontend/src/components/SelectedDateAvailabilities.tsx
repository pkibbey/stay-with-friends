import { AvailabilityCard } from "./AvailabilityCard"

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

interface SelectedDateAvailabilitiesProps {
  selectedDate: Date | undefined
  calendarResults: Availability[]
  isLoadingCalendar: boolean
}

export function SelectedDateAvailabilities({
  selectedDate,
  calendarResults,
  isLoadingCalendar
}: SelectedDateAvailabilitiesProps) {
  if (!selectedDate) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        Available on {selectedDate?.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </h3>
      {isLoadingCalendar ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading availability...</p>
        </div>
      ) : calendarResults.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {calendarResults.map((availability) => (
            <AvailabilityCard
              key={availability.id}
              availability={availability}
              linkHref={`/person/${availability.person.id}?date=${selectedDate?.toISOString().split('T')[0]}`}
              iconColor="purple"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No one is available on this date.</p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different date.</p>
        </div>
      )}
    </div>
  )
}