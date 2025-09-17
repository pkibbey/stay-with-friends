import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Host } from "@/types"

interface HostHouseRulesProps {
  host: Host
}

export function HostHouseRules({ host }: HostHouseRulesProps) {
  const displayRules = host.houseRules || ""

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