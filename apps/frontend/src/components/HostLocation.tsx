import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import { Host, PartialHost } from "@/types"

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
  isEditing?: boolean
  editedData?: PartialHost
  onUpdate?: (field: string, value: string) => void
}

export function HostLocation({
  host,
  editedData = {},
  isEditing = false,
  onUpdate
}: HostLocationProps) {
  const displayAddress = isEditing ? (editedData.address || host.address) : host.address
  const displayCity = isEditing ? (editedData.city || host.city) : host.city
  const displayState = isEditing ? (editedData.state || host.state) : host.state
  const displayZipCode = isEditing ? (editedData.zipCode || host.zipCode) : host.zipCode
  const displayCountry = isEditing ? (editedData.country || host.country) : host.country
  const displayLocation = isEditing ? (editedData.location || host.location) : host.location

  const fullAddress = [displayAddress, displayCity, displayState, displayZipCode, displayCountry]
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
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={displayAddress || ''}
                    onChange={(e) => onUpdate?.('address', e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={displayCity || ''}
                      onChange={(e) => onUpdate?.('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={displayState || ''}
                      onChange={(e) => onUpdate?.('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={displayZipCode || ''}
                      onChange={(e) => onUpdate?.('zipCode', e.target.value)}
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={displayCountry || ''}
                      onChange={(e) => onUpdate?.('country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-medium">{fullAddress}</p>
            )}
          </div>
        </div>

        {/* Interactive Map */}
        {!isEditing && (
          <MapComponent
            address={displayAddress}
            city={displayCity}
            state={displayState}
            zipCode={displayZipCode}
            country={displayCountry}
            location={displayLocation}
            className="h-64"
          />
        )}

        {!isEditing && (
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
                  <p>{displayCity || 'Local'} has good bus/train access. Check schedules for routes serving {host.location || 'the area'}.</p>
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
                  <p>Nearest airport: {displayCity || 'Local'} International (~30 min drive)</p>
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
        )}
      </CardContent>
    </Card>
  )
}