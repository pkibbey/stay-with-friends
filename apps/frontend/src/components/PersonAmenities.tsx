import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PersonAmenitiesProps {
  amenities?: string[]
}

export function PersonAmenities({ amenities }: PersonAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
            <Badge key={index} variant="secondary">{amenity}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}