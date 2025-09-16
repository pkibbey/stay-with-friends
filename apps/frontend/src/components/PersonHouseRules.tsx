import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PersonHouseRulesProps {
  houseRules?: string
  isEditing?: boolean
  editedData?: {
    houseRules?: string
  }
  onUpdate?: (field: string, value: string) => void
}

export function PersonHouseRules({ 
  houseRules, 
  isEditing = false,
  editedData = {},
  onUpdate
}: PersonHouseRulesProps) {
  const displayRules = isEditing ? (editedData.houseRules || houseRules) : houseRules

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