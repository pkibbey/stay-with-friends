import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HostWithAvailabilities } from "@/types"

interface HostHouseRulesProps {
  host: HostWithAvailabilities
}

export function HostHouseRules({ host }: HostHouseRulesProps) {
  const displayRules = host.house_rules || ""

  if (!displayRules) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>House Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">{displayRules}</p>
      </CardContent>
    </Card>
  )
}