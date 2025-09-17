import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Host, PartialHost } from "@/types"
import { Home, Users, Clock } from "lucide-react"

interface HostAboutProps {
  host: Host
  isEditing?: boolean
  editedData?: PartialHost
  onUpdate?: (field: string, value: string | number) => void
}

export function HostAbout({
  host,
  isEditing = false,
  editedData = {},
  onUpdate
}: HostAboutProps) {
  const displayData = isEditing ? { ...editedData, ...host } : host

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {isEditing ? editedData.name : host.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={displayData.description || ''}
                onChange={(e) => onUpdate?.('description', e.target.value)}
                placeholder="Describe your place..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={displayData.bedrooms || ''}
                    onChange={(e) => onUpdate?.('bedrooms', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={displayData.bathrooms || ''}
                    onChange={(e) => onUpdate?.('bathrooms', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    value={displayData.maxGuests || ''}
                    onChange={(e) => onUpdate?.('maxGuests', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={displayData.checkInTime || ''}
                    onChange={(e) => onUpdate?.('checkInTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={displayData.checkOutTime || ''}
                    onChange={(e) => onUpdate?.('checkOutTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {displayData.description && (
              <p className="text-gray-600 dark:text-gray-300">{displayData.description}</p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {displayData.bedrooms} bedroom{displayData.bedrooms !== 1 ? 's' : ''}, {displayData.bathrooms} bathroom{displayData.bathrooms !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Up to {displayData.maxGuests} guests</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Check-in: {displayData.checkInTime || 'Flexible'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Check-out: {displayData.checkOutTime || 'Flexible'}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}