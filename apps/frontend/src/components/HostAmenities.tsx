import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HostWithAvailabilities } from "@/types"

interface HostAmenitiesProps {
  host: HostWithAvailabilities
}

// Helper to ensure amenities is always an array
function parseAmenities(amenities: unknown): string[] {
  if (Array.isArray(amenities)) return amenities
  if (typeof amenities === 'string') {
    try {
      const parsed = JSON.parse(amenities)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function HostAmenities({ host }: HostAmenitiesProps) {
  const displayAmenities = parseAmenities(host.amenities)

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