import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PersonHouseRulesProps {
  houseRules?: string
}

export function PersonHouseRules({ houseRules }: PersonHouseRulesProps) {
  if (!houseRules) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>House Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">{houseRules}</p>
      </CardContent>
    </Card>
  )
}