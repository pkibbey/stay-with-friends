import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Host } from "@/types"

interface HostAmenitiesProps {
  host: Host
}

export function HostAmenities({ host }: HostAmenitiesProps) {
  const displayAmenities = host.amenities || []

  // Don't render if no amenities
  if (!displayAmenities || displayAmenities.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {displayAmenities.map((amenity: string, index: number) => (
            <Badge key={index} variant="secondary">{amenity}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}