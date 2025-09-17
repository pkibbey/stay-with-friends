import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Host } from "@/types"
import { Home, Users, Clock } from "lucide-react"

interface HostAboutProps {
  host: Host
}

export function HostAbout({ host }: HostAboutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {host.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {host.description && (
          <p className="text-gray-600 dark:text-gray-300">{host.description}</p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {host.bedrooms} bedroom{host.bedrooms !== 1 ? 's' : ''}, {host.bathrooms} bathroom{host.bathrooms !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Up to {host.maxGuests} guests</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Check-in: {host.checkInTime || 'Flexible'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Check-out: {host.checkOutTime || 'Flexible'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}