import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import { useState } from "react"

interface PersonAmenitiesProps {
  amenities?: string[]
  isEditing?: boolean
  editedData?: {
    amenities?: string[]
  }
  onUpdate?: (field: string, value: string[]) => void
}

export function PersonAmenities({ 
  amenities = [], 
  isEditing = false,
  editedData = {},
  onUpdate
}: PersonAmenitiesProps) {
  const [newAmenity, setNewAmenity] = useState("")
  
  const displayAmenities = isEditing ? (editedData.amenities || amenities) : amenities

  const addAmenity = () => {
    if (newAmenity.trim()) {
      const updatedAmenities = [...displayAmenities, newAmenity.trim()]
      onUpdate?.('amenities', updatedAmenities)
      setNewAmenity("")
    }
  }

  const removeAmenity = (index: number) => {
    const updatedAmenities = displayAmenities.filter((_: string, i: number) => i !== index)
    onUpdate?.('amenities', updatedAmenities)
  }

  if (!isEditing && (!displayAmenities || displayAmenities.length === 0)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity..."
                onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
              />
              <Button onClick={addAmenity} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayAmenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <button
                    onClick={() => removeAmenity(index)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {displayAmenities.map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary">{amenity}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}