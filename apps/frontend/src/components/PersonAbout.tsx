import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, Clock } from "lucide-react"

interface PersonAboutProps {
  name: string
  description?: string
  bedrooms?: number
  bathrooms?: number
  maxGuests?: number
  checkInTime?: string
  checkOutTime?: string
}

export function PersonAbout({
  name,
  description,
  bedrooms,
  bathrooms,
  maxGuests,
  checkInTime,
  checkOutTime
}: PersonAboutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {bedrooms} bedroom{bedrooms !== 1 ? 's' : ''}, {bathrooms} bathroom{bathrooms !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Up to {maxGuests} guests</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Check-in: {checkInTime || 'Flexible'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Check-out: {checkOutTime || 'Flexible'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}