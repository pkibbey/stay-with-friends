import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Host, PartialHost } from "@/types"

interface HostHouseRulesProps {
  host: Host
  isEditing?: boolean
  editedData?: PartialHost
  onUpdate?: (field: string, value: string) => void
}

export function HostHouseRules({ 
  host,
  isEditing = false,
  editedData = {},
  onUpdate
}: HostHouseRulesProps) {
  const displayRules = isEditing ? (editedData.houseRules || host.houseRules || "") : host.houseRules || ""

  if (!isEditing && !displayRules) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>House Rules</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div>
            <Label htmlFor="houseRules">House Rules</Label>
            <Textarea
              id="houseRules"
              value={displayRules || ''}
              onChange={(e) => onUpdate?.('houseRules', e.target.value)}
              placeholder="Describe your house rules..."
              rows={4}
            />
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{displayRules}</p>
        )}
      </CardContent>
    </Card>
  )
}