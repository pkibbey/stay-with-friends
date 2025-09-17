import { AvailabilityCard } from "./AvailabilityCard"
import { formatDateForUrl } from '@/lib/date-utils'
import type { Availability } from '@/types'

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
    <div className="space-y-6">
      <h3 className="font-semibold">
        {selectedDate?.toLocaleDateString('en-US', {
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
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {calendarResults.map((availability) => (
            <AvailabilityCard
              key={availability.id}
              availability={availability}
              linkHref={`/host/${availability.host?.id || availability.hostId}?date=${selectedDate ? formatDateForUrl(selectedDate) : ''}`}
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