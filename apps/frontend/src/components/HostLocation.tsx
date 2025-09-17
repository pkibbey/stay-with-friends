import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import { Host } from "@/types"

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent").then(mod => ({ default: mod.MapComponent })), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 font-medium">Loading map...</p>
      </div>
    </div>
  )
})

interface HostLocationProps {
  host: Host
}

export function HostLocation({ host }: HostLocationProps) {
  const fullAddress = [host.address, host.city, host.state, host.zipCode, host.country]
    .filter(Boolean)
    .join(', ')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="w-full">
            <p className="font-medium">{fullAddress}</p>
          </div>
        </div>

        {/* Interactive Map */}
        <MapComponent
          address={host.address}
          city={host.city}
          state={host.state}
          zipCode={host.zipCode}
          country={host.country}
          location={host.location}
          className="h-64"
        />

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Getting There
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Public Transportation</p>
                <p>{host.city || 'Local'} has good bus/train access. Check schedules for routes serving {host.location || 'the area'}.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Parking</p>
                <p>Street parking available nearby. Permit may be required during business hours.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Airport</p>
                <p>Nearest airport: {host.city || 'Local'} International (~30 min drive)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Walking</p>
                <p>15-20 minute walk from nearest transit station. Scenic route through {host.location}.</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              * Contact {host.name} directly for the most up-to-date directions and transportation options.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}