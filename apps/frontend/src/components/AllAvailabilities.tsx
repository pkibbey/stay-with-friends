import { formatDateForUrl, parseLocalDate } from "@/lib/date-utils"
import { AvailabilityCard } from "./AvailabilityCard"
import type { AvailabilityWithHost } from '@/types'

interface AllAvailabilitiesProps {
  allAvailabilities: AvailabilityWithHost[]
  isLoadingAll: boolean
}

export function AllAvailabilities({ allAvailabilities, isLoadingAll }: AllAvailabilitiesProps) {
  if (allAvailabilities.length === 0) return null

  return (
    <div className="space-y-6">
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
              linkHref={`/host/${availability.hostId}?date=${availability.startDate ? formatDateForUrl(parseLocalDate(availability.startDate)) : ''}`}
              iconColor="green"
            />
          ))}
        </div>
      )}
    </div>
  )
}