import { formatDateForUrl, parseLocalDate } from "@/lib/date-utils"
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

interface AllAvailabilitiesProps {
  allAvailabilities: Availability[]
  isLoadingAll: boolean
}

export function AllAvailabilities({ allAvailabilities, isLoadingAll }: AllAvailabilitiesProps) {
  if (allAvailabilities.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Available later</h3>
      {isLoadingAll ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading all availabilities...</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {allAvailabilities.map((availability) => (
            <AvailabilityCard
              key={availability.id}
              availability={availability}
              linkHref={`/person/${availability.person.id}?date=${availability.startDate ? formatDateForUrl(parseLocalDate(availability.startDate)) : ''}`}
              iconColor="green"
            />
          ))}
        </div>
      )}
    </div>
  )
}